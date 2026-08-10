import * as core from "@actions/core";
import {gradle_user_home} from "./paths";
import {setup, SetupOptions} from "./setup";

export const INPUT_DOWNLOAD_URL = core.getInput("download-url", {required: true});
export const INPUT_MITE_VERSION = core.getInput("mite-version", {required: true});

async function run() {
    const options: SetupOptions = {
        url: INPUT_DOWNLOAD_URL,
        version: INPUT_MITE_VERSION,
        gradle: gradle_user_home()
    };

    const dest = await setup(options);
    core.info(`File is ready at ${dest}`);
}

run().catch((err) => {
    core.setFailed(err instanceof Error ? err.message : String(err));
});
