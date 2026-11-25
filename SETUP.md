# Saeed Ali — GitHub Profile Setup & Automation

This repository is cloned and customized from [ZazaGdev/ZazaGdev](https://github.com/ZazaGdev/ZazaGdev) to work directly for **Saeed Ali** (`saeedali780`).

---

## 🚀 How to Use on GitHub

On GitHub, a repository named exactly `<username>/<username>` is your **Special Profile Repository**. Whatever is in `README.md` and `assets/` automatically appears on your GitHub profile page (`https://github.com/saeedali780`).

### Option A: Push Directly to `saeedali780/saeedali780` (Recommended)

1. **Create the repository on GitHub:**
   Go to GitHub and create a public repository named `saeedali780` (or open it if you already created it).

2. **Initialize git and push from this directory:**
   ```bash
   git init
   git add .
   git commit -m "feat: setup dynamic automated github profile for saeedali780"
   git branch -M main
   git remote add origin https://github.com/saeedali780/saeedali780.git
   git push -u origin main --force
   ```

3. **Enable GitHub Actions:**
   - Go to your repository's **Settings** > **Actions** > **General**.
   - Under **Workflow permissions**, select **"Read and write permissions"** and click **Save**.
   - The `.github/workflows/nightly.yml` action will run every night at 02:17 UTC, recalculate your real contribution heatmaps, streaks, and repo stats, redrawing all SVGs automatically!
   - You can also trigger it manually anytime under **Actions** > **nightly profile refresh** > **Run workflow**.

---

### Option B: Push to your existing `saeedali780/ZazaGdev` repository

If you want to use the fork you already created:
```bash
git init
git add .
git commit -m "feat: customize profile generator for saeedali780"
git branch -M main
git remote add origin https://github.com/saeedali780/ZazaGdev.git
git push -u origin main --force
```

---

## 🛠 Local Build

Whenever you want to test or refresh your cards locally:
```bash
# Install dependencies
py -m pip install -r scripts/requirements.txt

# Run the build (fetches live public GitHub data and redraws SVGs)
py scripts/build.py
```

## 📁 Repository Structure

- `profile.json` — Profile metadata (name, bio, links, featured apps, focus list).
- `assets/` — 64 high-resolution, responsive SVGs (Dark & Light themes, Desktop & Mobile views).
- `scripts/` — The Python SVG rendering engine with subsetted typography and dynamic data collectors.
- `.github/workflows/nightly.yml` — Nightly GitHub Actions automation that keeps your profile fresh.
- `README.md` — The generated responsive GitHub Profile README.
