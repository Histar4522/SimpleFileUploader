const database = require("../server/database");
const logger = require("../util/logger")
const Joi = require("joi");
const validator = require("../util/validator");
const bodyParser = require("../util/bodyparser");

const schema = Joi.object({
    username: Joi.string()
        .pattern(/^[a-zA-Z0-9_]*$/)
        .min(4)
        .max(64)
        .required(),
    password: Joi.string()
        .base64()
        .length(88)
        .required(),
})

module.exports = function(router) {
    router.post("/api/auth/login", bodyParser.default, validator(schema), async (ctx, next) => {
        try {
            const {username, password} = ctx.request.body;
            const result = await database.login(username, password);
            ctx.status = result.status;
            ctx.body = result;
        } catch (e) {
            logger.err(e)
            ctx.status = 500;
            ctx.body = {status: 500};
        }
        await next();
    });
    router.post("/api/auth/register", bodyParser.default, validator(schema), async (ctx, next) => {
        try {
            const {username, password} = ctx.request.body;
            const result = await database.register(username, password);
            ctx.status = result.status;
            ctx.body = result;
        } catch (e) {
            logger.err(e)
            ctx.status = 500;
            ctx.body = {status: 500};
        }
        await next();
    });
};