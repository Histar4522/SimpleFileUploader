const path = require("node:path");
const fs = require("node:fs");
const uuid = require("@lukeed/uuid");
const getRawBody = require("raw-body")

module.exports = function(router) {
    router.post("/files", async (ctx, next) => {
        const body = await getRawBody(ctx.req);
        const url = new URL(`${ctx.protocol}://${ctx.host}${ctx.url}`);
        const storageName = uuid.v4();
        const filename = url.searchParams.has("filename") ? url.searchParams.get("filename") : storageName;


        const dir = path.join(".", "fs", storageName)
        const metadata = {
            contentType: ctx.request.headers["content-type"],
            filename: filename,
        }
        try {
            await fs.promises.mkdir(dir);
            await fs.promises.writeFile(path.join(dir, "contents"), body);
            await fs.promises.writeFile(path.join(dir, "metadata.json"), JSON.stringify(metadata))
            ctx.body = {filename: storageName};
            ctx.status = 200;
        } catch (e) {
            console.log(e);
            ctx.body = "Internal Server Error"
            ctx.status = 500;
        }
        await next();
    })

    router.post("/files/:filename", async (ctx, next) => {
        const filename = ctx.params.filename;
        const aliasName = uuid.v4();
        let fileFolderPath = path.join(".", "fs", filename);
        let aliasFolderPath = path.join(".", "fs", aliasName);
        try {
            if (!fs.existsSync(fileFolderPath)) {
                ctx.body = "Bad Request";
                ctx.status = "400"
                return;
            }
            await fs.promises.mkdir(aliasFolderPath);
            await fs.promises.writeFile(path.join(aliasFolderPath, "metadata.json"), JSON.stringify({alias: filename}));
            ctx.body = {filename: aliasName};
            ctx.status = 200;
        } catch (e) {
            console.log(e);
            ctx.body = "Internal Server Error"
            ctx.status = 500;
        }
        await next();
    })

    router.get("/files/:filename", async (ctx, next) => {
        const filename = ctx.params.filename;
        let fileFolderPath = path.join(".", "fs", filename);
        const url = new URL(`${ctx.protocol}://${ctx.host}${ctx.url}`);
        const disposition = (url.searchParams.get("attachment") === "true") ? "attachment" : "inline";
        try {
            const visited = new Set();
            const MAX_DEPTH = 32;
            let depth = 0;
            while (depth++ < MAX_DEPTH) {
                const metaPath = path.join(fileFolderPath, 'metadata.json');
                let metadata;

                try {
                    const raw = await fs.promises.readFile(metaPath, 'utf8');
                    metadata = JSON.parse(raw);
                } catch {
                    break;
                }
                if (metadata.alias === undefined) break;
                const key = fileFolderPath;
                if (visited.has(key)) throw new Error('Alias cycle detected');
                visited.add(key);

                fileFolderPath = path.join(".", "fs", metadata.alias);
            }
        } catch (e) {
            console.log(e)
            ctx.status = 404;
            ctx.body = "Not Found";
        }
        try {
            console.log(path.join(fileFolderPath, "contents"))
            if (!fs.existsSync(path.join(fileFolderPath, "contents"))) throw new Error("not found");
            const readStream = fs.createReadStream(path.join(fileFolderPath, "contents"));
            const metadata = JSON.parse(await fs.promises.readFile(path.join(fileFolderPath, "metadata.json")));
            ctx.type = metadata.contentType;
            ctx.body = readStream;
            ctx.set("Content-Disposition", `${disposition}; filename="${encodeURI(metadata.filename)}"`);
            await next();
        } catch (err) {
            console.log(err)
            ctx.status = 404;
            ctx.body = "Not Found";
        }
    });

    router.get("/files", async (ctx, next) => {
        const response = {}
        const storagePath = path.join(".", "fs");
        const files = await fs.promises.readdir(storagePath);
        for (const crateName of files) {
            try {
                const metadataPath = path.join(storagePath, crateName, "metadata.json");
                response[crateName] = JSON.parse(await fs.promises.readFile(metadataPath));
            } catch (e) {
                console.log(e);
            }
        }
        ctx.body = response;
        await next();
    })

    router.delete("/files/:filename", async (ctx, next) => {
        const filename = ctx.params.filename;
        const fileFolderPath = path.join(".", "fs", filename);
        if (fs.existsSync(fileFolderPath)) {
            try {
                try {
                    await fs.promises.rm(path.join(fileFolderPath, "contents"));
                } catch (_e) {}
                await fs.promises.rm(path.join(fileFolderPath, "metadata.json"));
                await fs.promises.rmdir(fileFolderPath);
                ctx.status = 200;
                ctx.body = "Deleted";
            } catch (e) {
                console.log(e)
                ctx.status = 500;
                ctx.body = "Internal Server Error"
            }
        } else {
            ctx.status = 404;
            ctx.body = "Not Found";
        }
        await next();
    });
};