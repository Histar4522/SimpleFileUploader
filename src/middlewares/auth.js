const {koaBody} = require("koa-body");
const database = require("../server/database");
const logger = require("../util/logger")


module.exports = function(router) {
    router.post("/api/auth/login", koaBody(), async (ctx, next) => {
        try {
            const {username, password} = ctx.request.body;
            const result = await database.login(username, password);
            ctx.status = result.status;
            ctx.body = result;
        } catch (e) {
            logger.err(e)
            if (e instanceof SyntaxError) {
                ctx.status = 400;
                ctx.body = { status: 400 };
                return;
            }
            ctx.status = 500;
            ctx.body = {status: 500};
        }
        await next();
    });
    router.post("/api/auth/register", koaBody(), async (ctx, next) => {
        // TODO:
    });
};