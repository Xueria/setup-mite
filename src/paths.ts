import path from "path";
import os from "node:os";

export function gradle_user_home(): string {
    return process.env.GRADLE_USER_HOME ?? path.join(os.homedir(), ".gradle")
}

export function get_target_location(gradle: string, version: string) {
    return path.join(gradle, "caches", "fml-loom", version, `${version}.jar`)
}