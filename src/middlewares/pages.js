const fs = require("node:fs");
const path = require("node:path");

module.exports = function route(router) {
    router.get("/", async (ctx, next) => {
        ctx.body = fs.createReadStream(path.join(".", "public", "api.html"))
        ctx.response.type = "text/html";
        await next();
    })
    router.get("/upload", async (ctx, next) => {
        ctx.body = fs.createReadStream(path.join(".", "public", "upload.html"))
        ctx.response.type = "text/html";
        await next();
    })
}