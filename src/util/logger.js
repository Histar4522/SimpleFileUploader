function info(from, content){
    console.log(`[${getTime()}][INFO][${from}] ${content}`)
}

function warn(from, content){
    console.warn(`[${getTime()}][WARN][${from}] ${content}`)
}

function error(from, content){
    console.error(`[${getTime()}][ERROR][${from}] ${content}`)
}

function debug(from, content){
    console.debug(`[${getTime()}][DEBUG][${from}] ${content}`)
}

function getTime() {
    const time = new Date();

    const month = String(time.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(time.getDate()).padStart(2, '0');
    const year = time.getFullYear();

    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');

    return `${month}/${day}/${year};${hours}.${minutes}.${seconds}`;
}

module.exports.log = info;
module.exports.info = info;
module.exports.warn = warn;
module.exports.error = error;
module.exports.err = error;
module.exports.debug = debug;
