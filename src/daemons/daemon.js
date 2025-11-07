const logger = require("../util/logger")
const database = require("../server/database")

async function refresh() {
    logger.log("DAEMON", "Daemon thread is now cleaning up expired tokens")
    await database.cleanupToken();
}

module.exports = async function() {
    while (true) {
        logger.log("DAEMON", "Daemon thread started");
        await refresh();
        logger.log("DAEMON", "Daemon thread ended, start sleeping.");
        await new Promise(resolve => setTimeout(resolve, 300000));
    }
}