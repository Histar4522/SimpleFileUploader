const logger = require("./logger")

module.exports = function(schema) {
    return async function(ctx, next) {
        const body = ctx.request.body;
        if (body === null || body === undefined) {
            ctx.status = 400;
            ctx.body = {
                status: 400,
                message: "Body is null or undefined"
            };
            logger.log("BODY_VALIDATOR", `A invalid request from ${ctx.ip} has been blocked, with reason 'Value is null or undefined'.`)
            return;
        }
        const result = schema.validate(body);
        if (result.error !== undefined) {
            ctx.status = 400;
            ctx.body = {
                status: 400,
                message: result.error.message,
            };
            logger.log("BODY_VALIDATOR", `A invalid request from ${ctx.ip} has been blocked, with reason '${result.error.message}'.`)
            return;
        }
        await next();
    }
}