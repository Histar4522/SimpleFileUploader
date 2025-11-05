const Koa = require("koa");

const middlewareLoader = require("./src/server/middleware-loader.js")

const server = new Koa();

(async () => {
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
        console.log("Server successfully launched on port 8080.")
    })
})();

module.exports = server;