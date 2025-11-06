const sequelize = require("sequelize");
const path = require("node:path");
const argon2 = require("argon2");
const logger = require("../util/logger");

const { Sequelize, Op, Model, DataTypes } = sequelize;

const db = new Sequelize({
    dialect: "sqlite",
    storage: path.join(".", "fs", "database.sqlite"),
    logging: sql => {
        logger.log("DATABASE", sql);
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
    const record = await token.create({
        account: id,
        expire: Date.now() + 1800000 /* 30min */,
    })
    return record.token;
}

module.exports.db = db;
module.exports.account = account;
module.exports.token = token;

module.exports.init = init;
module.exports.login = login;