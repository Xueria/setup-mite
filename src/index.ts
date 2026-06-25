import * as core from "@actions/core";
import * as process from "node:process";
import path from "path";
import os from "node:os";
import fs from "fs";
import https from "https";

const MITE_DOWNLOAD_URL = core.getInput("download-url");
const MITE_VERSION = core.getInput("mite-version");

function gradle_user_home() {
    if (process.env.GRADLE_USER_HOME) {
        return process.env.GRADLE_USER_HOME;
    }

    return path.join(os.homedir(), ".gradle");
}

function download(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);

        https.get(url, function (response) {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(dest);
                reject(new Error(`Download failed with status code: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', function () {
                file.close();
                resolve();
            })
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(dest)) {
                fs.unlinkSync(dest);
            }
            reject(err);
        })
    })
}

function run() {
    const gradle = gradle_user_home();
    const target = path.join(gradle, "caches", "fml-loom", MITE_VERSION);
    const filename = MITE_VERSION + ".jar";
    const dest = path.join(target, filename);

    if (fs.existsSync(dest)) {
        core.info(`File already exists: ${dest}`);
        return;
    }

    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    core.info(`Downloading ${MITE_VERSION}.jar`);
    core.info(`Download URL: ${MITE_DOWNLOAD_URL}`);

    download(MITE_DOWNLOAD_URL, dest)
        .then(() => {
            core.info("Download complete!");
        })
        .catch(error => {
            core.error("Download failed:", error.message);
            core.setFailed(error.message);
        });
}

run();