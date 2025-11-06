const fs = require("fs")
const path = require("path")
const Router = require("@koa/router");
const logger = require("../util/logger")


function getLoader() {
    return (async () => {
        logger.log("MIDDLEWARE_LOADER", "Syncing Middlewares...");
        const allFiles = await fs.promises.readdir(path.join(".", "src", "middlewares"));
        const router = new Router();
        if (allFiles.length > 0) {
            logger.log("MIDDLEWARE_LOADER", `${allFiles.length} middleware(s) found.`);
            for (let i = 0; i < allFiles.length; i++) {
                const filename = allFiles[i];
                try {
                    const contents = require(path.join("..", "middlewares", filename));
                    contents(router);
                    logger.log("MIDDLEWARE_LOADER", `Middleware ${i}: ${filename} loaded successfully.`);
                } catch (e) {
                    logger.error("MIDDLEWARE_LOADER", `Failed to load middleware ${i}: ${filename}. An exception has been thrown`);
                    logger.error("MIDDLEWARE_LOADER", e);
                }
            }
            logger.log("MIDDLEWARE_LOADER", "All middlewares has been loaded.");
        } else {
            logger.log("MIDDLEWARE_LOADER", "No middleware has been found.");
        }
        logger.log("MIDDLEWARE_LOADER", "Middleware processing finished");
        return router;
    })();
}

module.exports = getLoader;