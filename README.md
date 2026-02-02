# Area Planning Map App (Web Version)

This is a premium, Vercel-ready web application built with **Next.js** and **React-Leaflet**. It replaces the previous Streamlit prototype with a modern, responsive layout.

## Live Deployment

**URL**: [https://web-app-lake-five.vercel.app](https://web-app-lake-five.vercel.app)

## Features

- **Full-Screen Map**: Dark mode map with high-performance rendering.
- **Floating Command Center**: Toggle layers (Sales, Blue Zones, Dominion, Income, **Race Demographics**).
- **Vercel Data Architecture**: Data is pre-processed into static JSONs for instant loading (no backend required).
- **Mobile Responsive**: Works on phone, tablet, and desktop.

## Project Structure

- `web-app/src/app/page.tsx`: Main entry point.
- `web-app/src/components/map/`: Map logic (`MapComponent.tsx`).
- `web-app/public/data/`: Static JSON data files (Sales, Blue Zones, Census).

## How to Push to GitHub

I have already initialized the Git repository and committed the code locally.

### Magic "Bypass" Command

If you are logged into GitHub Desktop but the terminal still asks for a login, run this command once to sync them:

```bash
git config --global credential.helper osxkeychain
```

### Option A: Using GitHub Desktop (Recommended)

Since you are signed in to GitHub Desktop:

1. Open GitHub Desktop.
2. Go to **File** > **Add Local Repository**.
3. Navigate to and select the `web-app` folder inside `emg-field-ops`.
    - Path: `/Users/hannahboyer/.gemini/antigravity/scratch/emg-field-ops/web-app`
4. Click **Add Repository**.
5. Click **Publish repository** in the top bar.

6. **Create a new Repository** on GitHub (do not initialize with README/license).
7. Run the following commands in your terminal:

    ```bash
    cd web-app
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git branch -M main
    git push -u origin main
    ```

## Local Development

To run locally:

```bash
cd web-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data Updates

If you get new sales data or extracted streets:

1. Place updated files in the root folder (`emg-field-ops`).
2. Run the processor script:

    ```bash
    python data_processor.py
    ```

3. Commit and push the updated `public/data` files to GitHub. Vercel will auto-redeploy.
