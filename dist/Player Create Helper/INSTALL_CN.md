# Player Create Helper 安装说明

## 适用场景

本插件用于组织内部在 Figma 中批量生成 push 制图素材。

当前安装方式为：

- 从 GitHub 私有仓库拉取或下载插件文件
- 在 Figma 中通过本地 `manifest.json` 导入

## 安装文件

请确保以下文件在同一个文件夹内：

- `manifest.json`
- `code.js`
- `ui.html`
- `icon.svg`
- `README.md`
- `QUICKSTART.md`

## 安装步骤

1. 从 GitHub 下载最新版本插件文件
2. 解压到本地任意文件夹
3. 打开 Figma Desktop 或 Web
4. 点击 `Plugins > Development > Import plugin from manifest...`
5. 选择该文件夹中的 `manifest.json`
6. 导入完成后，在插件列表中找到 `Player Create Helper`

## 更新插件

如果插件有新版本：

1. 从 GitHub 获取最新版本
2. 用新文件替换本地旧插件目录
3. 在 Figma 中重新导入最新的 `manifest.json`

## 常见问题

## 插件导入后打不开

- 确认插件目录中 `manifest.json`、`code.js`、`ui.html` 文件都在
- 确认不是只下载了单个文件

## 运行后识别不到模板

请确认当前选中的模板满足以下条件：

- 有一个 frame 名为 `cf-img`
- 有一个 frame 名为 `cf-bg`
- 两者位于同一个父级容器中，或者直接被同时选中
- 两个模板内部都存在名为 `封面` 的图片层

## 颜色效果不理想

可在插件中调整：

- `右侧背景柔化程度`

数值越低，整体颜色越深；数值越高，整体颜色越柔和。
