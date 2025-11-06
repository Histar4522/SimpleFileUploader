const sequelize = require("sequelize");
const path = require("node:path");
const argon2 = require("argon2");
const logger = require("../util/logger");

const { Sequelize, Op, Model, DataTypes } = sequelize;

const db = new Sequelize({
    dialect: "sqlite",
    storage: path.join(".", "fs", "database.sqlite"),
    logging: sql => {
        logger.debug("DATABASE", sql);
    }
});

const account = db.define("account", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
    },
    username: {
        type: DataTypes.STRING(64),
        unique: true,
    },
    password: {
        type: DataTypes.STRING(100),
    },
    privilege: {
        type: DataTypes.TINYINT,
    },
})

const token = db.define("token", {
    token: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    account: {
        type: DataTypes.BIGINT,
    },
    expire: {
        type: DataTypes.BIGINT,
    },
})

async function init() {
    logger.log("DBINIT", "Connecting to database...")
    await db.authenticate();
    logger.log("DBINIT", "Preparing database")
    await account.sync({alter: true});
    await token.sync({alter: true})
    logger.log("DBINIT", "Database prepared.")
}

async function login(username, password) {
    const dbRecord = await account.findOne({
        attributes: ["id", "username", "password"],
        where: {
            username: username,
        }
    })
    if (dbRecord === null) {
        logger.log("LOGIN", `New login for unknown user '${username}'`)
        return {
            status: 401,
        }
    }
    if (await argon2.verify(dbRecord.password, password)) {
        const generatedToken = await generateToken(dbRecord.id)
        logger.log("LOGIN", `New successful login for user '${username}', with token '${generatedToken}'`)
        return {
            status: 200,
            token: generatedToken,
        }
    } else {
        logger.log("LOGIN", `New failed login for user '${username}', with wrong password`)
        return {
            status: 401,
        }
    }
}

async function generateToken(id) {
    await removeToken(id)
    const record = await token.create({
        account: id,
        expire: Date.now() + 1800000 /* 30min */,
    })
    return record.token;
}

async function register(username, password, privilege = 1) {
    if (await account.findOne({attributes: ["username"], where: {username}}) === null) {
        await account.create({username, password: await argon2.hash(password), privilege});
        logger.log("REGISTER", `New user '${username}' has registered.`)
        return {
            status: 201,
        }
    } else {
        logger.log("REGISTER", `New user '${username}' register failed, as username is occupied.`)
        return {
            status: 409,
            message: "Username already exists",
        };
    }
}

async function removeToken(arg) {
    if (arg === undefined || arg === null) {
        await account.destroy({
            where: {
                expire: {
                    [Op.lt]: Date.now(),
                },
            },
        });
    } else if (typeof arg === "number") {
        await token.destroy({
            where: {
                account: arg,
            },
        });
    } else if (typeof arg === "string") {
        await token.destroy({
            where: {
                token: arg,
            },
        });
    }
}

module.exports.db = db;
module.exports.account = account;
module.exports.token = token;

module.exports.init = init;
module.exports.login = login;
module.exports.register = register;