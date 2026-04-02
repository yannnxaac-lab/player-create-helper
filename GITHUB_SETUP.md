# Publish To GitHub

## What GitHub Is Good For

GitHub is a good home for this plugin if you want:

- version history
- one stable download link for teammates
- release zip files
- a single place to report issues or request changes

## Important Limitation

Publishing this repo to GitHub does **not** create one-click install inside Figma.

Your teammates will still usually do one of these:

1. download the repo or a release zip
2. unzip it locally
3. open Figma
4. use `Plugins > Development > Import plugin from manifest...`
5. choose `manifest.json`

If you want something closer to direct installation inside Figma, the next step is formal Figma publishing, or an organization/private plugin setup if your workspace plan supports it.

## Recommended Repo Structure

Keep the root as the plugin source:

- `manifest.json`
- `code.js`
- `ui.html`
- `icon.svg`
- `README.md`
- `QUICKSTART.md`

Optional distribution output:

- `dist/Player Create Helper/`

## Suggested GitHub Workflow

1. Create a new GitHub repo named `player-create-helper`
2. Push this folder to that repo
3. Ask teammates to either:
   - download the repo as ZIP
   - or download a GitHub Release ZIP
4. They import `manifest.json` into Figma locally

## First Push Commands

Run these commands after you create the remote repo on GitHub:

```bash
git add .
git commit -m "Initial release: Player Create Helper"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Nice-To-Have Later

- add a LICENSE if you want public reuse terms
- create GitHub Releases for versioned downloads
- add screenshots to `README.md`
- publish to Figma when the workflow is stable
