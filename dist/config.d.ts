export declare const CONFIG: {
    readonly CLI_NAME: "create-stx-dapp";
    readonly CLI_VERSION: "1.0.0";
    readonly DEFAULT_COMMIT_MESSAGE: "Initial commit from create-stx-dapp";
    readonly GIT_CLONE_DEPTH: 1;
    readonly MAX_PROJECT_NAME_LENGTH: 214;
    readonly RESERVED_NAMES: readonly ["node_modules", "favicon.ico", "package.json", "index.js", "index.ts"];
    readonly SPINNER_FRAMES: readonly ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    readonly SPINNER_INTERVAL: 80;
    readonly NODEJS_URL: "https://nodejs.org/";
    readonly GIT_URL: "https://git-scm.com/";
    readonly DEFAULT_TEMPLATE: {
        readonly name: "Vite + React + Tailwind CSS";
        readonly description: "Modern stack with Vite, React 18, TypeScript, and Tailwind CSS";
        readonly repoUrl: "https://github.com/hirosystems/stacks-react-template.git";
        readonly tags: readonly ["vite", "react", "tailwind", "typescript", "recommended"];
    };
};
export declare function isCI(): boolean;
export declare function isInteractive(): boolean;
//# sourceMappingURL=config.d.ts.map