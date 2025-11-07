const pad = (n) => String(n).padStart(2, '0');

function getTime() {
    const d = new Date();
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    return `${date} ${time}`;
}

function createLogger(level, method) {
    return (arg0, arg1) => {
        if (arg1 === undefined) {
            if (arg0 instanceof Error) {
                method(`[${getTime()}][${level}][GENERAL] ${arg0.stack}`);
            } else {
                method(`[${getTime()}][${level}][GENERAL] ${arg0}`);
            }
        } else {
            if (arg1 instanceof Error) {
                method(`[${getTime()}][${level}][${arg0}] ${arg1.stack}`);
            } else {
                method(`[${getTime()}][${level}][${arg0}] ${arg1}`);
            }
        }
    };
}

const info = createLogger('INFO', console.log);
const warn = createLogger('WARN', console.warn);
const error = createLogger('ERROR', console.error);
const debug = createLogger('DEBUG', console.debug);

module.exports = { log: info, info, warn, error, err: error, debug };