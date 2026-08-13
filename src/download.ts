import fs from "fs";
import https from "https";
import * as core from "@actions/core";

export class DownloadError extends Error {
    constructor(message: string, readonly url: string, readonly status?: number) {
        super(`${message} (url: ${url}, status: ${status ?? "n/a"})`);
        this.name = "DownloadError";
    }
}

const MAX_REDIRECT_DEPTH = 5;
const TIMEOUT_MS = 10 * 60 * 1000;

export function download(url: string, dest: string) {
    return new Promise<void>((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        let settled = false;

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
            const req = https.get(url, {
                headers: {"User-Agent": "github-action"},
                timeout: TIMEOUT_MS,
            }, (response) => {
                if (response.statusCode! >= 300 && response.statusCode! < 400 && response.headers.location) {
                    response.resume();
                    if (redirects === 0) return fail(new DownloadError("Too many redirects", url, response.statusCode));
                    return request(new URL(response.headers.location, url).toString(), redirects - 1);
                }

                if (response.statusCode !== 200) {
                    response.resume();
                    return fail(new DownloadError("Server returned non-200", url, response.statusCode));
                }

                response.on("error", fail);
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
            const req = https.request(url, {
                method: "HEAD",
                headers: {"User-Agent": "github-action"},
                timeout: TIMEOUT_MS,
            }, (response) => {
                if (response.statusCode! >= 300 && response.statusCode! < 400 && response.headers.location) {
                    response.resume();
                    if (redirects === 0) return resolve(0);
                    return request(new URL(response.headers.location, url).toString(), redirects - 1);
                }

                response.resume();
                const remoteSize = Number(response.headers["content-length"]);

                if (Number.isFinite(remoteSize)) {
                    return resolve(0);
                }

                core.info(`Remote file size: ${remoteSize}`)
                return resolve(remoteSize);
            });

            req.on("timeout", () => req.destroy());
            req.on("error", () => resolve(0));
            req.end();
        };

        request(url, MAX_REDIRECT_DEPTH);
    });
}