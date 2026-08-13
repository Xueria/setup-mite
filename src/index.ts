import * as core from "@actions/core";
import {setup, SetupOptions} from "./setup";
import path from "path";
import os from "node:os";

export const INPUT_DOWNLOAD_URL = core.getInput("download-url", {required: true});
export const INPUT_MITE_VERSION = core.getInput("mite-version", {required: true});

async function run() {
    const gradleUserHome = process.env.GRADLE_USER_HOME ?? path.join(os.homedir(), ".gradle");

    const options: SetupOptions = {
        url: INPUT_DOWNLOAD_URL,
        version: INPUT_MITE_VERSION,
        gradle: gradleUserHome
    };

    const dest = await setup(options);
    core.info(`File is ready at ${dest}`);
}

run().catch((err) => {
    core.setFailed(err instanceof Error ? err.message : String(err));
});
