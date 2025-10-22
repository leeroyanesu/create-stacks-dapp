export declare class Logger {
    private static shouldUseColors;
    static info(message: string, color?: string): void;
    static success(message: string): void;
    static error(message: string): void;
    static warning(message: string): void;
    static dim(message: string): void;
}
export declare class CLIError extends Error {
    code: string;
    exitCode: number;
    constructor(message: string, code?: string, exitCode?: number);
}
export declare function handleError(error: unknown): never;
export declare function isUrlAccessible(url: string): Promise<boolean>;
export declare function ensureDirectory(dirPath: string): void;
export declare function sanitizeProjectName(name: string): string;
export declare function formatDuration(ms: number): string;
//# sourceMappingURL=utils.d.ts.map