# n8n Leaderboard Auto-Update Setup

## Overview

This workflow automatically updates the sales leaderboard by:

1. Fetching data from Viper portal every hour
2. Processing and counting deals per rep
3. Updating `data.json` on GitHub
4. Triggering a Vercel deployment

## Quick Setup in n8n

### 1. Import the Workflow

```bash
# In n8n, go to Workflows > Import from File
# Select: n8n_leaderboard_workflow.json
```

### 2. Configure Credentials

#### Viper Portal (HTTP Basic Auth)

- Create credential: HTTP Basic Auth
- Username: Your Viper username
- Password: Your Viper password

#### GitHub API

- Create credential: GitHub API
- Token: Your personal access token with `repo` scope

### 3. Update Node Settings

**Fetch Viper Data node:**

- Update URL to match Viper's actual API endpoint
- Or replace with a browser-based scraper if API isn't available

**Update GitHub node:**

- Replace `sha` with logic to fetch current file SHA first
- Update repository path if different

**Trigger Vercel Deploy node:**

- Replace `prj_XXXXX` with your actual Vercel project deploy hook URL
- Get this from: Vercel Dashboard > Project > Settings > Git > Deploy Hooks

## Manual Trigger

To run immediately instead of waiting for the schedule:

1. Open the workflow in n8n
2. Click "Execute Workflow"

## Alternative: Playwright Scraper

If Viper doesn't have a REST API, replace the "Fetch Viper Data" node with a Playwright script:

```javascript
// Use n8n's Execute Command node with Playwright
const { chromium } = require('playwright');
// ... login and scrape logic
```
