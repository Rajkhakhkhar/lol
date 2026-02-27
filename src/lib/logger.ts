type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS: Record<LogLevel, string> = {
    debug: '\x1b[36m',
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
};
const RESET = '\x1b[0m';

class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    private log(level: LogLevel, message: string, data?: unknown) {
        const timestamp = new Date().toISOString();
        const color = LOG_COLORS[level];
        const prefix = `${color}[${level.toUpperCase()}]${RESET} [${timestamp}] [${this.context}]`;

        if (data) {
            console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
        } else {
            console.log(`${prefix} ${message}`);
        }
    }

    debug(message: string, data?: unknown) { this.log('debug', message, data); }
    info(message: string, data?: unknown) { this.log('info', message, data); }
    warn(message: string, data?: unknown) { this.log('warn', message, data); }
    error(message: string, data?: unknown) { this.log('error', message, data); }
}

export function createLogger(context: string): Logger {
    return new Logger(context);
}

export default Logger;
