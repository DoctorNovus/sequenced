export class Logger {
    static _log(...args: string[]) {
        console.log(...args);
    }

    static log(...args: string[]) {
        console.log("[SYSTEM]  | ", ...args);
    }

    static logError(...args: string[]) {
        Logger._log("[ERROR] | ", ...args);
    }

    static logWarning(...args: string[]) {
        Logger._log("[WARNING] | ", ...args);
    }
}