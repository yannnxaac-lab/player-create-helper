# Player Create Helper

`Player Create Helper` is an internal Figma plugin for batch push image creation.

It helps the team:

- replace album covers in `cf-img`
- replace album covers in `cf-bg`
- auto-generate the long background color
- batch-generate multiple template sets at once
- prepare frames for PNG export

## Internal Distribution

This plugin is intended for internal team use through GitHub.

Recommended teammate workflow:

1. Download `Player Create Helper.zip` from GitHub
2. Unzip it locally
3. In Figma, use `Plugins > Development > Import plugin from manifest...`
4. Select the `manifest.json` file

## Template Rules

The selected template must contain:

- one frame named `cf-img`
- one frame named `cf-bg`
- one image layer named `封面` inside each frame

You can select:

- `cf-img` and `cf-bg` directly
- or their shared parent container

## Documents

- `INSTALL_CN.md`: 安装说明
- `SOP_CN.md`: 使用 SOP
- `QUICKSTART.md`: quick start

## Main Controls

- `每组之间的纵向间距`
- `右侧背景柔化程度`

If the right-side background looks too light, lower `右侧背景柔化程度`.
