# Player Create Helper Quick Start

## Files

Keep these files in the same folder:

- `manifest.json`
- `code.js`
- `ui.html`
- `icon.svg`
- `README.md`

## Import Into Figma

1. Open Figma.
2. Go to `Plugins > Development > Import plugin from manifest...`
3. Choose `manifest.json` from this folder.
4. Run `Player Create Helper`.

## Template Rules

The selected template must include:

- one frame named `cf-img`
- one frame named `cf-bg`
- one image layer named `封面` inside each template

You can select:

- `cf-img` and `cf-bg` directly
- or their shared parent container

## What The Plugin Does

- batch replaces album covers in both frames
- auto tints the long background with a darker soft gradient
- duplicates the template for every uploaded cover
- preselects generated frames for PNG export
