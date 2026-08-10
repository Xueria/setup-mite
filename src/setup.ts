import {get_target_location} from "./paths";
import fs from "fs";
import path from "path";
import {download} from "./download";

export interface SetupOptions {
    url: string;
    version: string;
    gradle: string;
}

export async function setup(options: SetupOptions) {
    const dest = get_target_location(options.gradle, options.version);
    const temp = `${dest}.temp`;

    fs.mkdirSync(path.dirname(dest), { recursive: true });

    await download(options.url, temp);
    fs.rmSync(dest, { force: true });
    fs.renameSync(temp, dest);
    return dest;
}