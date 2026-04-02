# Player Create Helper

这是一个供团队内部使用的 Figma 插件，用于批量生成 push 制图素材。

## 如何安装

1. 在 GitHub 仓库中下载 `Player Create Helper.zip`
2. 解压压缩包
3. 打开 Figma
4. 点击 `Plugins > Development > Import plugin from manifest...`
5. 选择解压后的 `manifest.json`
6. 导入后即可使用 `Player Create Helper`

## 使用前模板要求

- 左侧 frame 名为 `cf-img`
- 右侧 frame 名为 `cf-bg`
- 两个模板里都要有一层名为 `封面` 的图片层

运行时可以直接选中：

- `cf-img` 和 `cf-bg`
- 或者同时包含它们的父级容器

## 插件功能

- 同时替换左右模板中的专辑封面
- 自动生成右侧长图背景颜色
- 一次批量生成多组模板
- 自动选中生成结果，方便导出 PNG

## 可调参数

- `每组之间的纵向间距`
- `右侧背景柔化程度`

如果右侧背景偏浅，可以把 `右侧背景柔化程度` 调低。

## 仓库结构

- `Player Create Helper.zip`
  给同事直接下载、解压、导入
- `source/`
  插件源码，供后续维护和迭代
