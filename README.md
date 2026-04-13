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

## Vercel email OTP setup

The waitlist now expects Vercel serverless endpoints:

- `POST /api/waitlist/request-otp`
- `POST /api/waitlist/verify-otp`

Set these Environment Variables in Vercel Project Settings:

- `RESEND_API_KEY` = your Resend API key
- `OTP_FROM_EMAIL` = verified sender email/domain in Resend (example: `RoblogNext <noreply@roblognext.com>`)
- `OTP_SIGNING_SECRET` = long random string (32+ chars)

Without these variables, OTP email delivery will fail by design.

## License

Add your license here.
