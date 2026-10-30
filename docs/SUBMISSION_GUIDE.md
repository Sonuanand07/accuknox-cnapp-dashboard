# Submission guide (AccuKnox Front-End Trainee)

The Google Form asks for: email, name, contact number, resume link, and **GitHub link + deployed website**.

## 1. Verify locally (5 minutes)
```bash
npm install
npm test          # expect: 31 passed
npm run build     # expect: built with no errors
npm run dev       # open http://localhost:5173 and try it
```

## 2. Put the code on GitHub
1. Create a **public** repository on github.com (for example `accuknox-cnapp-dashboard`). Do not add a README or .gitignore.
2. In the project folder run:
   ```bash
   git init
   git add .
   git commit -m "feat: CNAPP dashboard with JSON-driven widgets"
   git branch -M main
   git remote add origin https://github.com/<your-username>/accuknox-cnapp-dashboard.git
   git push -u origin main
   ```
3. If Git asks for a password, use a Personal Access Token (GitHub → Settings → Developer settings), or sign in with GitHub CLI (`gh auth login`).

## 3. Deploy (pick one)
- **GitHub Pages:** repo **Settings → Pages → Source: GitHub Actions**. Open the **Actions** tab, wait for the workflow to go green, and your URL is `https://<your-username>.github.io/accuknox-cnapp-dashboard/`.
- **Vercel:** vercel.com/new → import the repo → Deploy. You get a `*.vercel.app` URL.
- **Netlify:** app.netlify.com → Add new site → Import from GitHub (or drop the `dist` folder).

Open the live URL in a private window and test: remove a widget, add one, search, refresh the page (it should remember your changes).

## 4. Fill in the form
- **Resume:** upload to Google Drive → Share → set **"Anyone with the link can view"** (the form requires this) → paste the link.
- **GitHub link:** the repository URL.
- **Deployed website:** the live URL from step 3.
- Put the live URL and a one-line description at the top of your repo README (replace the `<paste your deployed URL here>` placeholder).

## 5. Be ready to explain (the next round is technical)
- Why Redux Toolkit, and why the JSON drives everything (single source of truth).
- Why removal sets `visible: false` instead of deleting (undo, re-adding from the library).
- Why the drawer keeps a local draft and commits once on Confirm.
- How you validated untrusted input (JSON import, localStorage).
- What you would add next: real API data, drag-and-drop, per-widget resize.
