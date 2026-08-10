English | [简体中文](README.md)

---

# Setup MITE

A GitHub Action that downloads the MITE JAR and places it where fml-loom expects it, so your MITE mod build can find it
in the Gradle cache.

## How it works

The action downloads the MITE JAR from the given URL and saves it to the fml-loom cache directory:

```
$GRADLE_USER_HOME/caches/fml-loom/{mite-version}/{mite-version}.jar
```

`GRADLE_USER_HOME` defaults to `~/.gradle` when the environment variable is not set.

The download is written to a temporary file first and then atomically moved into place, so an existing JAR is replaced
safely and a failed download never leaves a partial file behind.

## Inputs

| Input          | Required | Description                                                            |
|----------------|:--------:|------------------------------------------------------------------------|
| `download-url` |   yes    | URL of the MITE JAR to download                                        |
| `mite-version` |   yes    | MITE version, used for the cache path and filename (e.g. `1.6.4-MITE`) |

> `mite-version` depends on the fml-loom version you use. For fml-loom 0.1, set it to `1.6.4-MITE`.

## Usage

```yaml
- name: Setup MITE
  uses: Xueria/setup-mite@v1
  with:
    download-url: https://example.com/mite-1.6.4-MITE.jar
    mite-version: 1.6.4-MITE
```

## Development

```bash
# Install dependencies
npm install

# Build (compiles TypeScript and bundles into dist/index.js)
npm run release
```

## License

[MIT](LICENSE)
