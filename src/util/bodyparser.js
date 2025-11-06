const logger = require("./logger");
const {koaBody} = require("koa-body");

module.exports = {
    default: async function(ctx, next) {
        try {
            await koaBody()(ctx, next);
        } catch (e) {
            logger.err("BODYPARSER", e)
            ctx.status = 400;
            ctx.body = {
                status: 400,
                message: "Failed to parse form uploaded"
            };
            logger.log("BODYPARSER", `Invalid request body from ${ctx.ip}`);
        }
    },
}