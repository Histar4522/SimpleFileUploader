const fs = require("fs")
const path = require("path")
const Router = require("@koa/router");


function getLoader() {
    return (async () => {
        console.log("Syncing Middlewares...");
        const allFiles = await fs.promises.readdir(path.join(".", "src", "middlewares"));
        const router = new Router();
        if (allFiles.length > 0) {
            console.log(`${allFiles.length} middleware(s) found.`);
            for (let i = 0; i < allFiles.length; i++) {
                const filename = allFiles[i];
                try {
                    const contents = require(path.join("..", "middlewares", filename));
                    contents(router);
                    console.log(`Middleware ${i}: ${filename} loaded successfully.`);
                } catch (e) {
                    console.error(`Failed to load middleware ${i}: ${filename}. An exception has been thrown`);
                    console.error(e);
                }
            }
            console.log("All middlewares has been loaded.");
        } else {
            console.log("No middleware has been found.");
        }
        console.log("Middleware processing finished");
        return router;
    })();
}

module.exports = getLoader;