const Koa = require("koa");
const database = require("./src/server/database")
const logger = require("./src/util/logger")
const daemon = require("./src/daemons/daemon")

const middlewareLoader = require("./src/server/middleware-loader.js")

const server = new Koa();

(async () => {
    logger.log("SERVER", "Server Starting...");
    await database.init();
    server.use(async (ctx, next) => {
        ctx.set("Access-Control-Allow-Origin", "*");
        ctx.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        ctx.set("Access-Control-Allow-Headers", "Content-Type, X-Filename");
        if (ctx.method === "OPTIONS") {
            ctx.status = 204;
            return;
        }
        await next();
    });
    server.use((await middlewareLoader()).routes());
    server.listen(8080, () => {
        logger.log("SERVER","Server successfully launched on port 8080.");
    })
    daemon();
})();

module.exports = server;