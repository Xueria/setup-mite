import fs from "fs";
import path from "path";
import * as core from "@actions/core";
import {download, sizeof} from "./download";

export interface SetupOptions {
    url: string;
    version: string;
    gradle: string;
}

export async function setup(options: SetupOptions) {
    const dest = path.join(options.gradle, "caches", "fml-loom", options.version, `${options.version}.jar`);
    const temp = `${dest}.temp`;

    fs.mkdirSync(path.dirname(dest), {recursive: true});

    if (fs.existsSync(dest)
        && fs.statSync(dest).size === await sizeof(options.url)) {
        core.info(`Cache hit: ${dest} (size matches remote)`);
        return dest;
    }

    await download(options.url, temp);

    core.info("Download success!");

    fs.rmSync(dest, {force: true});
    fs.renameSync(temp, dest);
    return dest;
}