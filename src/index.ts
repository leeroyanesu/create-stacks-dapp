#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { CONFIG, isInteractive } from './config.js';
import { Logger, CLIError, handleError, sanitizeProjectName, formatDuration } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template definitions
interface Template {
  name: string;
  description: string;
  repoUrl: string;
  tags?: string[];
  requirements?: {
    node?: string;
    git?: boolean;
  };
}

interface PackageManager {
  name: string;
  installCommand: string;
  runCommand: string;
  available: boolean;
}

interface ProjectStats {
  startTime: number;
  template: Template;
  projectName: string;
  packageManager: PackageManager;
}

// Validation utilities
function isValidProjectName(name: string): { valid: boolean; reason?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, reason: 'Project name cannot be empty' };
  }

  if (name.length > CONFIG.MAX_PROJECT_NAME_LENGTH) {
    return { valid: false, reason: `Project name must be less than ${CONFIG.MAX_PROJECT_NAME_LENGTH} characters` };
  }

  if (name.startsWith('.') || name.startsWith('_')) {
    return { valid: false, reason: 'Project name cannot start with . or _' };
  }

  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return { valid: false, reason: 'Project name can only contain letters, numbers, hyphens, and underscores' };
  }

  if (CONFIG.RESERVED_NAMES.includes(name.toLowerCase() as any)) {
    return { valid: false, reason: 'Project name cannot be a reserved name' };
  }

  return { valid: true };
}

function validateTemplate(template: Template): { valid: boolean; reason?: string } {
  if (!template.name || !template.description || !template.repoUrl) {
    return { valid: false, reason: 'Template must have name, description, and repoUrl' };
  }

  try {
    new URL(template.repoUrl);
  } catch {
    return { valid: false, reason: 'Template repoUrl must be a valid URL' };
  }

  return { valid: true };
}

// Spinner utility for better UX
class Spinner {
  private interval: NodeJS.Timeout | null = null;
  private frames = CONFIG.SPINNER_FRAMES;
  private currentFrame = 0;

  start(text: string) {
    if (!isInteractive()) {
      Logger.info(text);
      return;
    }
    
    process.stdout.write(`\x1b[36m${this.frames[0]} ${text}\x1b[0m`);
    this.interval = setInterval(() => {
      process.stdout.write('\r');
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      process.stdout.write(`\x1b[36m${this.frames[this.currentFrame]} ${text}\x1b[0m`);
    }, CONFIG.SPINNER_INTERVAL);
  }

  stop(successText?: string, error?: boolean) {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    if (!isInteractive()) {
      if (successText) {
        error ? Logger.error(successText) : Logger.success(successText);
      }
      return;
    }
    
    process.stdout.write('\r');
    if (successText) {
      const icon = error ? '❌' : '✅';
      const color = error ? '\x1b[31m' : '\x1b[32m';
      console.log(`${color}${icon} ${successText}\x1b[0m`);
    }
  }
}

function execCommand(command: string, cwd?: string, silent = false): { success: boolean; output?: string; error?: string } {
  try {
    const output = execSync(command, {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });
    return { success: true, output: typeof output === 'string' ? output : undefined };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout ? error.stdout.toString() : undefined
    };
  }
}

async function checkRequirements(): Promise<{ node: boolean; git: boolean; packageManager: PackageManager | null }> {
  const spinner = new Spinner();
  spinner.start('Checking system requirements...');

  const nodeCheck = execCommand('node --version', undefined, true);
  const gitCheck = execCommand('git --version', undefined, true);
  
  // Detect available package managers
  const packageManagers: PackageManager[] = [
    { name: 'bun', installCommand: 'install', runCommand: '', available: false },
    { name: 'pnpm', installCommand: 'install', runCommand: '', available: false },
    { name: 'yarn', installCommand: 'install', runCommand: '', available: false },
    { name: 'npm', installCommand: 'install', runCommand: 'run ', available: false },
  ];

  for (const pm of packageManagers) {
    const check = execCommand(`${pm.name} --version`, undefined, true);
    pm.available = check.success;
  }

  const availablePackageManager = packageManagers.find(pm => pm.available) || null;

  spinner.stop('System requirements checked');

  return {
    node: nodeCheck.success,
    git: gitCheck.success,
    packageManager: availablePackageManager
  };
}

// Built-in templates - no external file needed
const BUILT_IN_TEMPLATES: Template[] = [
  {
    name: 'Vite + React + Tailwind CSS',
    description: 'Modern stacks starter dapp with Vite, React 19, TypeScript, and Tailwind CSS',
    repoUrl: 'https://github.com/leeroyanesu/vite-stacks-dapp-template.git',
    tags: ['vite', 'react', 'tailwind', 'typescript', 'recommended'],
    requirements: {
      node: '>=22.0.0',
      git: true
    }
  }
];

function loadTemplates(): Template[] {
  // Validate each built-in template
  const validTemplates = BUILT_IN_TEMPLATES.filter(template => {
    const validation = validateTemplate(template);
    if (!validation.valid) {
      Logger.warning(`Skipping invalid template "${template.name}": ${validation.reason}`);
      return false;
    }
    return true;
  });

  if (validTemplates.length === 0) {
    throw new CLIError('No valid templates found', 'NO_TEMPLATES');
  }

  return validTemplates;
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function cloneTemplate(repoUrl: string, projectName: string): Promise<{ success: boolean; error?: string }> {
  const spinner = new Spinner();
  spinner.start('Cloning template repository...');
  
  const result = execCommand(`git clone --depth 1 "${repoUrl}" "${projectName}"`, undefined, true);
  
  if (!result.success) {
    spinner.stop('Failed to clone repository', true);
    return { success: false, error: `Failed to clone repository: ${result.error}` };
  }

  // Remove .git folder to start fresh
  const gitPath = path.join(process.cwd(), projectName, '.git');
  if (fs.existsSync(gitPath)) {
    try {
      fs.rmSync(gitPath, { recursive: true, force: true });
    } catch (error: any) {
      spinner.stop('Template cloned but failed to clean git history', true);
      return { success: false, error: `Failed to remove .git folder: ${error.message}` };
    }
  }

  spinner.stop('Template cloned successfully');
  return { success: true };
}

async function updatePackageJson(projectPath: string, projectName: string): Promise<boolean> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    Logger.warning('No package.json found in template');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.name = projectName;
    packageJson.version = '0.1.0';
    
    // Remove any scripts that might reference the template
    if (packageJson.scripts && packageJson.scripts.postinstall) {
      delete packageJson.scripts.postinstall;
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    Logger.success('Updated package.json');
    return true;
  } catch (error: any) {
    Logger.error(`Failed to update package.json: ${error.message}`);
    return false;
  }
}

async function installDependencies(projectPath: string, packageManager: PackageManager): Promise<boolean> {
  Logger.info('\n📥 Installing dependencies...');
  Logger.dim(`   Using ${packageManager.name}...`);
  
  const spinner = new Spinner();
  spinner.start(`Installing dependencies with ${packageManager.name}...`);
  
  const result = execCommand(`${packageManager.name} ${packageManager.installCommand}`, projectPath, true);
  
  if (!result.success) {
    spinner.stop('Failed to install dependencies', true);
    Logger.warning('   You can install them manually later');
    return false;
  }

  spinner.stop('Dependencies installed successfully');
  return true;
}

async function initializeGitRepository(projectPath: string, projectName: string): Promise<boolean> {
  const spinner = new Spinner();
  spinner.start('Initializing git repository...');
  
  const commands = [
    'git init',
    'git add .',
    `git commit -m "${CONFIG.DEFAULT_COMMIT_MESSAGE}"`
  ];

  for (const command of commands) {
    const result = execCommand(command, projectPath, true);
    if (!result.success) {
      spinner.stop('Failed to initialize git repository', true);
      Logger.warning(`   Failed at: ${command}`);
      return false;
    }
  }

  spinner.stop('Git repository initialized');
  return true;
}

async function selectTemplate(templates: Template[]): Promise<Template> {
  Logger.info('\n📋 Select a template:\n', '\x1b[36m\x1b[1m');

  templates.forEach((template, index) => {
    Logger.info(`  \x1b[1m${index + 1}.\x1b[0m \x1b[32m${template.name}\x1b[0m`);
    Logger.info(`     \x1b[34m${template.description}\x1b[0m`);
    
    if (template.tags && template.tags.length > 0) {
      const tagStr = template.tags.map(tag => `#${tag}`).join(' ');
      Logger.info(`     \x1b[90m${tagStr}\x1b[0m`);
    }
    Logger.info('');
  });

  const rl = createInterface();

  while (true) {
    const answer = await askQuestion(
      rl,
      `\x1b[33mEnter your choice (1-${templates.length}): \x1b[0m`
    );

    const choice = parseInt(answer.trim(), 10);

    if (choice >= 1 && choice <= templates.length) {
      rl.close();
      return templates[choice - 1];
    }

    Logger.error(`Invalid choice. Please enter a number between 1 and ${templates.length}`);
  }
}

async function confirmAction(question: string): Promise<boolean> {
  const rl = createInterface();
  const answer = await askQuestion(rl, `\x1b[33m${question} (y/n): \x1b[0m`);
  rl.close();
  return answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes';
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse flags
  const flags = {
    help: args.includes('--help') || args.includes('-h'),
    list: args.includes('--list') || args.includes('-l'),
    force: args.includes('--force') || args.includes('-f'),
  };

  // Show help
  if (flags.help) {
    Logger.info('\n🚀 create-stx-dapp - Scaffold a Stacks dapp\n', '\x1b[36m\x1b[1m');
    Logger.info('Usage:', '\x1b[36m');
    Logger.info('  bunx create-stx-dapp <project-name> [options]', '\x1b[33m');
    Logger.info('\nOptions:', '\x1b[36m');
    Logger.info('  -h, --help     Show this help message', '\x1b[33m');
    Logger.info('  -l, --list     List all available templates', '\x1b[33m');
    Logger.info('  -f, --force    Overwrite existing directory without prompting', '\x1b[33m');
    Logger.info('\nExamples:', '\x1b[36m');
    Logger.info('  bunx create-stx-dapp my-dapp', '\x1b[33m');
    Logger.info('  bunx create-stx-dapp my-app --list', '\x1b[33m');
    Logger.info('  bunx create-stx-dapp my-app --force\n', '\x1b[33m');
    process.exit(0);
  }

  // Check system requirements
  const requirements = await checkRequirements();
  
  if (!requirements.node) {
    Logger.error('Node.js is required but not found');
    Logger.warning(`   Please install Node.js from ${CONFIG.NODEJS_URL}`);
    process.exit(1);
  }

  if (!requirements.git) {
    Logger.error('Git is required but not found');
    Logger.warning(`   Please install Git from ${CONFIG.GIT_URL}`);
    process.exit(1);
  }

  if (!requirements.packageManager) {
    Logger.error('No package manager found');
    Logger.warning('   Please install npm, yarn, pnpm, or bun');
    process.exit(1);
  }

  const templates = loadTemplates();

  // List templates
  if (flags.list) {
    Logger.info('\n📋 Available templates:\n', '\x1b[36m\x1b[1m');
    templates.forEach((template, index) => {
      Logger.info(`${index + 1}. \x1b[32m${template.name}\x1b[0m`);
      Logger.info(`   ${template.description}`);
      if (template.tags) {
        Logger.info(`   Tags: ${template.tags.join(', ')}`);
      }
      Logger.info('');
    });
    process.exit(0);
  }

  const projectName = args.filter(arg => !arg.startsWith('-'))[0];

  if (!projectName) {
    Logger.error('Please provide a project name');
    Logger.info('Usage: bunx create-stx-dapp <project-name>', '\x1b[33m');
    Logger.dim('Run "bunx create-stx-dapp --help" for more information');
    process.exit(1);
  }

  // Validate project name
  const nameValidation = isValidProjectName(projectName);
  if (!nameValidation.valid) {
    Logger.error(nameValidation.reason!);
    process.exit(1);
  }

  Logger.info('\n🚀 Welcome to create-stx-dapp!\n', '\x1b[36m\x1b[1m');

  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    if (flags.force) {
      fs.rmSync(projectPath, { recursive: true, force: true });
      Logger.success('Removed existing directory');
    } else {
      Logger.error(`Directory "${projectName}" already exists`);
      const shouldContinue = await confirmAction('Do you want to remove it and continue?');
      
      if (shouldContinue) {
        fs.rmSync(projectPath, { recursive: true, force: true });
        Logger.success('Removed existing directory');
      } else {
        Logger.error('Aborted');
        process.exit(1);
      }
    }
  }

  // Let user select a template
  const selectedTemplate = await selectTemplate(templates);

  Logger.info(`\n✨ Creating project with: \x1b[32m${selectedTemplate.name}\x1b[0m\n`);

  // Clone template
  const cloneResult = await cloneTemplate(selectedTemplate.repoUrl, projectName);
  if (!cloneResult.success) {
    Logger.error(cloneResult.error!);
    Logger.warning(`   Check if the repository exists: ${selectedTemplate.repoUrl}`);
    process.exit(1);
  }

  // Update package.json
  await updatePackageJson(projectPath, projectName);

  // Install dependencies
  const installSuccess = await installDependencies(projectPath, requirements.packageManager);

  // Initialize git
  await initializeGitRepository(projectPath, projectName);

  // Success message
  Logger.info('\n🎉 Success! Your Stacks dapp is ready!\n', '\x1b[32m\x1b[1m');
  Logger.info('Next steps:', '\x1b[36m');
  Logger.info(`  \x1b[33mcd ${projectName}\x1b[0m`);
  Logger.info(`  \x1b[33m${requirements.packageManager.name} ${requirements.packageManager.runCommand}dev\x1b[0m`);
  
  if (!installSuccess) {
    Logger.warning(`\n⚠️  Note: Dependencies failed to install. Run the following to install them manually:`);
    Logger.info(`  \x1b[33mcd ${projectName}\x1b[0m`);
    Logger.info(`  \x1b[33m${requirements.packageManager.name} ${requirements.packageManager.installCommand}\x1b[0m`);
  }
  
  Logger.info('\n📚 Template: \x1b[35m' + selectedTemplate.name, '\x1b[36m');
  Logger.info('Happy building! 🏗️\n', '\x1b[36m');
}

main().catch((error) => {
  handleError(error);
});