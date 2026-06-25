# Setup MITE

A GitHub Action that downloads MITE jar for fml loom.

## How it works

The action downloads the MITE JAR from a given URL and saves it to:

```
~/.gradle/caches/fml-loom/{mite-version}/{mite-version}.jar
```

If the file already exists at that path the action skips the download.

## Usage

```yaml
- name: setup mite
  uses: yuchenxue123/setup-mite@v1
  with:
    download-url: The URL of the MITE JAR to download
    mite-version: 1.6.4-MITE
```


## Development

```bash
# Install dependencies
npm install

# Build (compiles TypeScript and bundles into dist/index.js)
npm run release
```
