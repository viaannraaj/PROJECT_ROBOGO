# RoblogNext

Static landing site: game guide search (demo), About, and Join waitlist with email OTP flow (demo storage in-browser; configure API URLs for production).

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

## Publish to GitHub

This folder is a Git repository on the `main` branch. There is **no GitHub MCP in this environment**; use Git or [GitHub CLI](https://cli.github.com/) from your machine.

1. **Log in** (one-time): `gh auth login` and follow the prompts (browser or token).
2. **Create the remote and push** (from this directory):

```bash
gh repo create roblognext --public --source=. --remote=origin --push
```

Use another repo name if you prefer. If the repo already exists on GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Enable **GitHub Pages** (Settings → Pages) with source **Deploy from a branch** → `main` → `/ (root)` to host the static site.

## License

Add your license here.
