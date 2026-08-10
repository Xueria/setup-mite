[English](README.en.md) | 简体中文

---

# Setup MITE

一个 GitHub Action，用于下载 MITE JAR 并放置到 fml-loom 期望的位置，这样你的 MITE 模组构建就能在 Gradle 缓存中找到它。

## 工作原理

该 Action 从指定 URL 下载 MITE JAR，并保存到 fml-loom 缓存目录：

```
$GRADLE_USER_HOME/caches/fml-loom/{mite-version}/{mite-version}.jar
```

当环境变量未设置时，`GRADLE_USER_HOME` 默认为 `~/.gradle`。

下载会先写入临时文件，再原子移动到目标位置：已有 JAR 会被安全替换，下载失败也不会留下不完整的文件。

## 输入参数

| 输入参数       | 必填 | 说明                                                 |
|----------------|:----:|------------------------------------------------------|
| `download-url` |  是  | 要下载的 MITE JAR 的 URL                             |
| `mite-version` |  是  | MITE 版本，用于缓存路径和文件名（例如 `1.6.4-MITE`） |

> `mite-version` 取决于所用的 fml-loom 版本。fml-loom 0.1 版本建议设置为 `1.6.4-MITE`。

## 使用方法

```yaml
- name: Setup MITE
  uses: Xueria/setup-mite@v1
  with:
    download-url: https://example.com/mite-1.6.4-MITE.jar
    mite-version: 1.6.4-MITE
```

## 开发

```bash
# 安装依赖
npm install

# 构建（编译 TypeScript 并打包到 dist/index.js）
npm run release
```

## 许可证

[MIT](LICENSE)
