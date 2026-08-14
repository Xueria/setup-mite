import fs from "node:fs";
import https from "node:https";
import * as core from "@actions/core";
import * as http from "node:http";

export class DownloadError extends Error {
    constructor(message: string, readonly url: string, readonly status?: number) {
        super(`${message} (url: ${url}, status: ${status ?? "n/a"})`);
        this.name = "DownloadError";
    }
}

function client(url: string) {
    const protocol = new URL(url).protocol;
    switch (protocol) {
        case "http:":
            return http;
        case "https:":
            return https;
        default:
            throw new DownloadError(`Unsupported protocol '${protocol}'`, url);
    }
}

const MAX_REDIRECT_DEPTH = 5;
const TIMEOUT_MS = 10 * 60 * 1000;

export function download(url: string, dest: string) {
    return new Promise<void>((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        let settled = false;

        core.info(`Downloading ${url} -> ${dest}`);

        const fail = (err: Error) => {
            if (settled) return;
            settled = true;
            file.destroy();

            try {
                fs.rmSync(dest, {force: true});
            } catch {
                // ignore
            }

            reject(err);
        };

        file.on("error", fail);
        file.on("finish", () => {
            settled = true;
            file.close(() => resolve());
        });

        const request = (url: string, redirects: number) => {
            const req = client(url).get(url, {
                headers: {"User-Agent": "github-action"},
                timeout: TIMEOUT_MS,
            }, (response) => {
                response.on("error", fail);

                if (response.statusCode! >= 300 && response.statusCode! < 400 && response.headers.location) {
                    response.resume();
                    if (redirects === 0) return fail(new DownloadError("Too many redirects", url, response.statusCode));

                    // prevent invalid location
                    try {
                        return request(new URL(response.headers.location, url).toString(), redirects - 1);
                    } catch (err) {
                        return fail(err instanceof Error ? err : new Error(String(err)));
                    }
                }

                if (response.statusCode !== 200) {
                    response.resume();
                    return fail(new DownloadError("Server returned non-200", url, response.statusCode));
                }

                response.pipe(file);
            });
            req.on("timeout", () => req.destroy(new DownloadError("request timed out", url)));
            req.on("error", fail);
        };

        request(url, MAX_REDIRECT_DEPTH);
    });
}

export function sizeof(url: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        const request = (url: string, redirects: number) => {
            const req = client(url).request(url, {
                method: "HEAD",
                headers: {"User-Agent": "github-action"},
                timeout: TIMEOUT_MS,
            }, (response) => {
                response.on("error", () => resolve(-1))

                if (response.statusCode! >= 300 && response.statusCode! < 400 && response.headers.location) {
                    response.resume();
                    if (redirects === 0) return resolve(-1);

                    // prevent invalid location
                    try {
                        return request(new URL(response.headers.location, url).toString(), redirects - 1);
                    } catch {
                        return resolve(-1);
                    }
                }

                response.resume();

                if (response.statusCode !== 200) {
                    core.warning(`HEAD ${url} returned ${response.statusCode}, will download`);
                    return resolve(-1);
                }

                const remoteSize = Number(response.headers["content-length"]);

                if (!Number.isFinite(remoteSize)) {
                    core.warning(`No content-length from ${url}, will download`);
                    return resolve(-1);
                }

                core.info(`Remote file size: ${remoteSize}`)

                return resolve(remoteSize);
            });

            req.on("timeout", () => req.destroy());
            req.on("error", () => {
                core.warning(`Failed to query size of ${url}, will download`);
                resolve(-1);
            });
            req.end();
        };

        request(url, MAX_REDIRECT_DEPTH);
    });
}