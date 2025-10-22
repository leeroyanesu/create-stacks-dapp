// Configuration constants
export const CONFIG = {
    // CLI settings
    CLI_NAME: 'create-stx-dapp',
    CLI_VERSION: '1.0.0',
    // Git settings
    DEFAULT_COMMIT_MESSAGE: 'Initial commit from create-stx-dapp',
    GIT_CLONE_DEPTH: 1,
    // Project validation
    MAX_PROJECT_NAME_LENGTH: 214,
    RESERVED_NAMES: ['node_modules', 'favicon.ico', 'package.json', 'index.js', 'index.ts'],
    // Spinner animation
    SPINNER_FRAMES: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    SPINNER_INTERVAL: 80,
    // URLs
    NODEJS_URL: 'https://nodejs.org/',
    GIT_URL: 'https://git-scm.com/',
    // Default template fallback
    DEFAULT_TEMPLATE: {
        name: 'Vite + React + Tailwind CSS',
        description: 'Modern stack with Vite, React 18, TypeScript, and Tailwind CSS',
        repoUrl: 'https://github.com/hirosystems/stacks-react-template.git',
        tags: ['vite', 'react', 'tailwind', 'typescript', 'recommended'],
    },
};
// Environment detection utilities
export function isCI() {
    return !!(process.env.CI ||
        process.env.CONTINUOUS_INTEGRATION ||
        process.env.BUILD_NUMBER ||
        process.env.RUN_ID);
}
export function isInteractive() {
    return process.stdout.isTTY && !isCI();
}
//# sourceMappingURL=config.js.map