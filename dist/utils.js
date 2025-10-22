// Logger utility with different levels
export class Logger {
    static shouldUseColors() {
        return process.stdout.isTTY && !process.env.NO_COLOR;
    }
    static info(message, color) {
        const useColors = this.shouldUseColors();
        if (useColors && color) {
            console.log(`${color}${message}\x1b[0m`);
        }
        else {
            console.log(message);
        }
    }
    static success(message) {
        this.info(`✅ ${message}`, '\x1b[32m');
    }
    static error(message) {
        this.info(`❌ ${message}`, '\x1b[31m');
    }
    static warning(message) {
        this.info(`⚠️  ${message}`, '\x1b[33m');
    }
    static dim(message) {
        this.info(message, '\x1b[90m');
    }
}
// Enhanced error handling
export class CLIError extends Error {
    constructor(message, code = 'GENERAL_ERROR', exitCode = 1) {
        super(message);
        this.code = code;
        this.exitCode = exitCode;
        this.name = 'CLIError';
    }
}
export function handleError(error) {
    if (error instanceof CLIError) {
        Logger.error(error.message);
        if (error.code !== 'GENERAL_ERROR') {
            Logger.dim(`Error code: ${error.code}`);
        }
        process.exit(error.exitCode);
    }
    else if (error instanceof Error) {
        Logger.error(`An unexpected error occurred: ${error.message}`);
        Logger.dim('If this error persists, please report it at: https://github.com/hirosystems/create-stx-dapp/issues');
        process.exit(1);
    }
    else {
        Logger.error('An unknown error occurred');
        process.exit(1);
    }
}
// Utility to check if a URL is accessible
export async function isUrlAccessible(url) {
    try {
        // Simple check - just validate URL format for now
        // In a real implementation, you might want to make an actual HTTP request
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
// File system utilities
export function ensureDirectory(dirPath) {
    try {
        const fs = require('fs');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    catch (error) {
        throw new CLIError(`Failed to create directory: ${error.message}`, 'DIRECTORY_CREATION_FAILED');
    }
}
// String utilities
export function sanitizeProjectName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/^[-_]+|[-_]+$/g, '')
        .replace(/[-_]+/g, '-');
}
export function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60)
        return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}
//# sourceMappingURL=utils.js.map