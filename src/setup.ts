import fs from "fs";
import path from "path";
import {checkSize, download} from "./download";

export interface SetupOptions {
    url: string;
    version: string;
    gradle: string;
}

export async function setup(options: SetupOptions) {
    const dest = path.join(options.gradle, "caches", "fml-loom", options.version, `${options.version}.jar`);
    const temp = `${dest}.temp`;

    fs.mkdirSync(path.dirname(dest), { recursive: true });

    if (fs.existsSync(dest) && await checkSize(options.url, dest)) {
        return dest;
    }

    await download(options.url, temp);
    fs.rmSync(dest, { force: true });
    fs.renameSync(temp, dest);
    return dest;
}