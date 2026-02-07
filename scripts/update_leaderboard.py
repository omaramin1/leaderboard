#!/usr/bin/env python3
"""
Leaderboard Auto-Update Script

Fetches deal data from Viper portal and updates the leaderboard data.json.
Uses Playwright for browser automation.

Usage:
    python update_leaderboard.py                  # Normal run
    python update_leaderboard.py --dry-run        # Preview without saving
    python update_leaderboard.py --headless       # Run without visible browser

Environment Variables:
    VIPER_USERNAME - Viper portal username (optional, will open login if not set)
    VIPER_PASSWORD - Viper portal password (optional)
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("Playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)


VIPER_URL = "https://portal.viprweb.com/"
DATA_JSON_PATH = Path(__file__).parent.parent / "app" / "leaderboard" / "data.json"


def login_to_viper(page, username=None, password=None):
    """Log in to Viper portal. If credentials not provided, waits for manual login."""
    page.goto(VIPER_URL)
    page.wait_for_load_state("networkidle")
    
    # Check if already logged in
    if "Sales" in page.content() or "Dashboard" in page.content():
        print("✓ Already logged in")
        return True
    
    # Try auto-login if credentials provided
    if username and password:
        print("→ Attempting auto-login...")
        try:
            page.fill('input[name="username"]', username)
            page.fill('input[name="password"]', password)
            page.click('button[type="submit"]')
            page.wait_for_load_state("networkidle")
            return True
        except Exception as e:
            print(f"⚠ Auto-login failed: {e}")
    
    # Wait for manual login
    print("⏳ Waiting for manual login (2 minutes timeout)...")
    try:
        page.wait_for_selector('text=Sales', timeout=120000)
        print("✓ Login detected")
        return True
    except PlaywrightTimeout:
        print("✗ Login timeout")
        return False


def navigate_to_sales(page):
    """Navigate to Sales section and wait for table to load."""
    page.click('text=Sales')
    page.wait_for_load_state("networkidle")
    # Wait for table to appear
    page.wait_for_selector('.htCore', timeout=30000)
    print("✓ Sales table loaded")


def extract_deal_counts(page):
    """Extract deal counts filtered by TPV=Complete and Order=Sent."""
    
    # Execute JavaScript to extract and aggregate data
    result = page.evaluate("""
        () => {
            const headerCells = Array.from(document.querySelectorAll('.htCore thead th'))
                .map(th => th.innerText.trim());
            
            const tpvIndex = headerCells.indexOf('TPV Status');
            const orderIndex = headerCells.indexOf('Order Status');
            const repIdIndex = headerCells.indexOf('Rep ID');
            const repNameIndex = headerCells.indexOf('Rep Name');
            
            if (tpvIndex === -1 || orderIndex === -1 || repIdIndex === -1 || repNameIndex === -1) {
                return { error: 'Required columns not found', headers: headerCells };
            }
            
            const rows = Array.from(document.querySelectorAll('.htCore tbody tr'));
            const counts = {};
            
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length < 12) return;
                
                const tpv = cells[tpvIndex]?.innerText.trim();
                const order = cells[orderIndex]?.innerText.trim();
                const repId = cells[repIdIndex]?.innerText.trim();
                const repName = cells[repNameIndex]?.innerText.trim();
                
                if (tpv === 'Complete' && order === 'Sent' && repId) {
                    const key = `${repId}|${repName}`;
                    counts[key] = (counts[key] || 0) + 1;
                }
            });
            
            return { counts, rowsProcessed: rows.length };
        }
    """)
    
    if "error" in result:
        print(f"✗ Error: {result['error']}")
        print(f"  Available headers: {result.get('headers', [])}")
        return None
    
    print(f"✓ Processed {result['rowsProcessed']} rows")
    return result['counts']


def update_data_json(counts, dry_run=False):
    """Update data.json with new counts."""
    
    # Load existing data
    if DATA_JSON_PATH.exists():
        with open(DATA_JSON_PATH) as f:
            data = json.load(f)
    else:
        data = []
    
    # Create lookup of existing reps
    existing = {rep['id']: rep for rep in data}
    
    # Update counts
    for key, count in counts.items():
        rep_id, rep_name = key.split('|', 1)
        if rep_id in existing:
            existing[rep_id]['monthly'] = count
            existing[rep_id]['name'] = rep_name  # Update name if changed
        else:
            # New rep
            existing[rep_id] = {
                'id': rep_id,
                'name': rep_name,
                'daily': 0,
                'weekly': 0,
                'monthly': count
            }
    
    # Convert back to list and sort by monthly count (desc)
    updated_data = sorted(existing.values(), key=lambda x: -x['monthly'])
    
    if dry_run:
        print("\n--- DRY RUN: Would write ---")
        print(json.dumps(updated_data, indent=2))
        return updated_data
    
    # Write updated data
    with open(DATA_JSON_PATH, 'w') as f:
        json.dump(updated_data, f, indent=4)
    
    print(f"✓ Updated {DATA_JSON_PATH}")
    print(f"  Total reps: {len(updated_data)}")
    print(f"  Total deals: {sum(r['monthly'] for r in updated_data)}")
    
    return updated_data


def main():
    parser = argparse.ArgumentParser(description='Update leaderboard from Viper portal')
    parser.add_argument('--dry-run', action='store_true', help='Preview without saving')
    parser.add_argument('--headless', action='store_true', help='Run browser in headless mode')
    args = parser.parse_args()
    
    print(f"\n🏆 Leaderboard Updater - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)
    
    username = os.environ.get('VIPER_USERNAME')
    password = os.environ.get('VIPER_PASSWORD')
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=args.headless)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Login
            if not login_to_viper(page, username, password):
                print("✗ Could not log in to Viper portal")
                return 1
            
            # Navigate to Sales
            navigate_to_sales(page)
            
            # Extract data
            counts = extract_deal_counts(page)
            if not counts:
                print("✗ Could not extract deal counts")
                return 1
            
            # Update JSON
            update_data_json(counts, dry_run=args.dry_run)
            
            print("\n✓ Complete!")
            return 0
            
        except Exception as e:
            print(f"✗ Error: {e}")
            return 1
            
        finally:
            browser.close()


if __name__ == '__main__':
    sys.exit(main())
