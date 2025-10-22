# create-stacks-dapp

🚀 **A modern CLI tool to scaffold Stacks blockchain applications with ease**

[![npm version](https://badge.fury.io/js/create-stacks-dapp.svg)](https://badge.fury.io/js/create-stacks-dapp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)

Create Stacks decentralized applications with no build configuration. Get started with modern templates featuring the latest tools and best practices.

## Quick Start

Get up and running in seconds:

```bash
# Using bun (recommended)
bunx create-stacks-dapp my-stacks-app

# Using npx
npx create-stacks-dapp my-stacks-app

# Using pnpm
pnpm create-stacks-dapp my-stacks-app

# Using yarn
yarn create-stacks-dapp my-stacks-app
```

Then follow the prompts to select your preferred template and start building!

## Features

✨ **Modern Stack**: Built with the latest versions of React, TypeScript, and Vite  
🎨 **Styled**: Pre-configured with Tailwind CSS for rapid UI development  
⚡ **Fast**: Lightning-fast development experience with Vite  
🔧 **Zero Config**: No complex setup required - just run and start coding  
📦 **Package Manager Agnostic**: Works with npm, yarn, pnpm, and bun  
🎯 **Template Selection**: Choose from multiple carefully crafted templates  
🔄 **Git Ready**: Automatically initializes git repository with initial commit  
🛡️ **Type Safe**: Full TypeScript support out of the box  

## Available Templates

| Template | Description | Stack |
|----------|-------------|-------|
| **Vite + React + Tailwind CSS** | Modern starter with React 19, TypeScript, and Tailwind CSS | `Vite` `React` `TypeScript` `Tailwind` |

*More templates coming soon! Want to contribute a template? See [Contributing](#contributing)*

## System Requirements

Before using create-stacks-dapp, ensure you have:

- **Node.js** 22.0.0 or later
- **Git** for repository cloning
- A package manager: **npm** (comes with Node.js), **yarn**, **pnpm**, or **bun**

## Usage

### Basic Usage

```bash
bunx create-stacks-dapp <project-name>
```

### Command Line Options

```bash
create-stacks-dapp <project-name> [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--help` | `-h` | Show help information |
| `--list` | `-l` | List all available templates |
| `--force` | `-f` | Overwrite existing directory without prompting |

#### Examples

```bash
# Create a new project
bunx create-stacks-dapp my-awesome-dapp

# List available templates
bunx create-stacks-dapp --list

# Force overwrite existing directory
bunx create-stacks-dapp my-app --force

# Show help
bunx create-stacks-dapp --help
```

### Interactive Mode

When you run the command, you'll be guided through an interactive setup:

1. **Template Selection**: Choose from available templates
2. **Project Creation**: The tool clones the template and sets up your project
3. **Dependency Installation**: Automatically installs dependencies using your preferred package manager
4. **Git Initialization**: Sets up a git repository with an initial commit

## Project Structure

After creation, your project will have a structure similar to:

```
my-stacks-app/
├── public/
│   ├── vite.svg
│   └── stacks.svg
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .gitignore
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started After Creation

Once your project is created:

```bash
# Navigate to your project
cd my-stacks-app

# Start the development server
bun dev        # or npm run dev, yarn dev, pnpm dev

# Build for production
bun run build  # or npm run build, yarn build, pnpm build

# Preview production build
bun preview    # or npm run preview, yarn preview, pnpm preview
```

## Development Features

### Hot Module Replacement (HMR)
Enjoy instant feedback during development with Vite's lightning-fast HMR.

### TypeScript Support
Full TypeScript support with proper type checking and IntelliSense.

### Tailwind CSS Integration
Pre-configured Tailwind CSS with optimal purging and JIT compilation.

### Stacks.js Integration
Ready-to-use Stacks.js setup for blockchain interactions.

## Environment Variables

Your project comes with environment variable support. Create a `.env` file in your project root:

```env
VITE_NETWORK=testnet
VITE_API_URL=https://api.testnet.hiro.so
```

## Stacks Integration

The generated projects include:

- **@stacks/***: For blockchain interactions
- **Connect Wallet**: Ready-to-use wallet connection
- **Smart Contract Integration**: Examples for contract calls
- **Network Configuration**: Testnet/Mainnet switching

## Troubleshooting

### Common Issues

**Error: Command not found**
```bash
# Make sure you have Node.js 22+ installed
node --version

# Update npm to latest version
npm install -g npm@latest
```

**Git not found**
```bash
# Install Git from https://git-scm.com/
git --version
```

**Permission errors on macOS/Linux**
```bash
# Don't use sudo with npm/bunx
# If you have permission issues, fix npm permissions:
# https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

**Template clone fails**
- Check your internet connection
- Verify the repository URL is accessible
- Try again with `--force` flag

### Getting Help

- 📚 [Stacks Documentation](https://docs.stacks.co/)
- 💬 [Stacks Discord](https://discord.gg/stacks)
- 🐛 [Report Issues](https://github.com/leeroyanesu/create-stacks-dapp/issues)

## Contributing

We welcome contributions! Here's how you can help:

### Adding New Templates

1. Create a new repository with your template
2. Ensure it follows the template structure guidelines  
3. Submit a GitHub issue or pull request with your template details
4. Include the template configuration in this format:
   ```json
   {
     "name": "Your Template Name",
     "description": "Description of your template",
     "repoUrl": "https://github.com/username/your-template-repo.git",
     "tags": ["tag1", "tag2", "tag3"],
     "requirements": {
       "node": ">=22.0.0",
       "git": true
     }
   }
   ```

### Template Guidelines

Templates should:
- Include a comprehensive README
- Have proper TypeScript configuration
- Include example Stacks.js integration
- Follow modern React best practices
- Include testing setup
- Have proper ESLint/Prettier configuration

### Development Setup

```bash
# Clone the repository
git clone https://github.com/leeroyanesu/create-stacks-dapp.git
cd create-stacks-dapp

# Install dependencies
bun install

# Build the project
bun run build

# Test locally
node dist/index.js my-test-app
```

## Changelog

### v1.0.2
- Embedded templates directly in CLI code for better reliability
- Removed external `templates.json` dependency
- Fixed package.json bin path issues
- Improved spinner animation and error handling

### v1.0.1
- Improved error handling and validation
- Added interactive spinner animations
- Enhanced template validation
- Better package manager detection
- Added force overwrite option

### v1.0.0
- Initial release
- Vite + React + Tailwind CSS template
- Interactive template selection
- Automatic dependency installation
- Git repository initialization

## License

MIT © [Leeroy Chako](https://github.com/leeroyanesu)

## Acknowledgments

- [Stacks](https://stacks.co/) - The blockchain platform
- [Hiro](https://hiro.so/) - Development tools and infrastructure
- [Vite](https://vitejs.dev/) - Build tool and development server
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Happy building on Stacks! 🏗️**

For questions, feedback, or contributions, feel free to reach out on [GitHub](https://github.com/leeroyanesu/create-stacks-dapp) or [Discord](https://discord.gg/stacks).
