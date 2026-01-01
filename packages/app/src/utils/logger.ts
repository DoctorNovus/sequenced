export class Logger {
    static _log(...args: any[]) {
        console.log(...args);
    }

    static log(...args: any[]) {
        console.log("[SYSTEM]  | ", ...args);
    }

    static logError(...args: any[]) {
        Logger._log("[ERROR] | ", ...args);
    }

    static logWarning(...args: any[]) {
        Logger._log("[WARNING] | ", ...args);
    }
}