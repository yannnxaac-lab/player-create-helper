# Player Create Helper

这是一个给 Figma 本地加载的批量制图插件，正式名称是 `Player Create Helper`。目标是把你现在每首歌重复执行的 4 个动作压缩成一次批处理：

- 同时替换 `cf-img` 和 `cf-bg > Mask group` 里的 `封面`
- 自动给右侧 `cf-bg` 的渐变背景换成专辑主色
- 按原模板位置批量复制整组版式
- 自动选中全部生成结果，并给每个 frame 预设 PNG 导出

## 当前版本适合的模板结构

插件会在你当前选中的节点里查找下面两个 frame：

- `cf-img`
- `cf-bg`

并且依赖这些命名规则：

- 左侧图里要有一个名为 `封面` 的图片层
- 右侧图里也要有一个名为 `封面` 的图片层
- `cf-bg` 自身，或者它的某个子层，需要带有一个线性渐变填充

如果你的模板命名和现在截图一致，这个版本就能直接用。

## 在 Figma 里怎么用

1. 打开 Figma，选择 `Plugins > Development > Import plugin from manifest...`
2. 选择这个目录下的 [manifest.json](/Users/hausing/Documents/image create/manifest.json)
3. 在画布里选中模板中的 `cf-img` 和 `cf-bg`
   也可以直接选中同时包住它们的那一个父级容器
4. 运行插件 `Player Create Helper`
5. 一次选择多张专辑封面
6. 点击“生成模板”
7. 插件会把新生成的所有 `img/bg` frame 自动选中
8. 右侧导出面板里直接批量导出 PNG

## 给别人使用

如果只是给同事内部使用，直接把下面这些文件发给对方就行：

- [manifest.json](/Users/hausing/Documents/image create/manifest.json)
- [code.js](/Users/hausing/Documents/image create/code.js)
- [ui.html](/Users/hausing/Documents/image create/ui.html)
- [icon.svg](/Users/hausing/Documents/image create/icon.svg)
- [README.md]

对方在 Figma 里执行：

1. `Plugins > Development > Import plugin from manifest...`
2. 选择 [manifest.json](/Users/hausing/Documents/image create/manifest.json)
3. 导入后就能在本地使用 `Player Create Helper`

内部安装和操作文档：

- [INSTALL_CN.md]
- [SOP_CN.md]

## 放到 GitHub

这个插件很适合放到 GitHub 做版本管理和分发，但要注意：

- GitHub 适合托管源码、发布 ZIP、给同事下载
- GitHub 本身不会让同事在 Figma 里“一键安装”
- 同事通常还是需要下载后，用 `Import plugin from manifest...` 导入 [manifest.json]

更完整的 GitHub 分发说明见：
[GITHUB_SETUP.md]

## 生成结果的行为

- 每张封面会生成两个 frame：
  - `文件名-img`
  - `文件名-bg`
- 新生成的内容会从模板下方开始，按固定纵向间距往下排
- 模板本身不会被改动
- 如果上传的图片文件没有名字，会回退成 `cover-01` 这种编号

## 插件如何识别你要替换的 frame

这版不是“自动猜”画布里的任意内容，而是按你当前选区去找模板：

- 你可以直接选中 `cf-img` 和 `cf-bg`
- 或者选中同时包含这两个 frame 的父级容器
- 插件会递归扫描当前选区里的子层
- 只要找到且仅找到一组 `cf-img` 和 `cf-bg`，就把它们当成模板

如果你一次选中了两套以上模板，插件会提示你缩小选区，避免误替换。

## 你可能会想调的两个参数

- `每组之间的纵向间距`
  - 控制 28 组内容之间留多少空白
- `右侧背景柔化程度`
  - 数值越高，自动取出来的主色会越柔和
  - 如果你觉得背景颜色太浅，可以把这个值调低
  - 这一版默认会做成轻微渐变，不再是整块同色

## 这一版的边界

- 目前不会自动导出到你电脑的文件夹里，还是用 Figma 自带导出最稳
- 目前默认一套模板对应一批图片
- `cf-img` 和 `cf-bg` 需要在同一个父级里
- 如果右侧背景不是渐变填充，而是更复杂的多层调色逻辑，可能需要再针对你的源文件细调一次

## 我建议你第一次这样试

先拿 3 张封面试跑，看下面三件事是不是都符合预期：

- 左右两个位置的 `封面` 都换对了
- 右侧背景颜色大方向是对的
- 批量生成后的排版间距适合你继续导出

