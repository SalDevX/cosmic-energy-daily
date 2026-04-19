# Google Apps Script — Cosmic Energy Daily Subscriber System

Personal operating notes. Written so future-me doesn't have to reverse-engineer this.

---

## 1. Overview

When someone fills out the newsletter form on the site:
1. The form POSTs JSON (email, sign, agreed) to the Apps Script web app endpoint
2. Apps Script appends a row to the Google Sheet (Timestamp, Email, Sign, Agreed to Policy)
3. Apps Script sends a welcome email to the subscriber from your Gmail

**Two URLs to never lose:**

| Thing | URL |
|---|---|
| Web app endpoint | `https://script.google.com/macros/s/AKfycbzCDo8bOVUUBsGJlWlAMIUDegu1hA_HbkbwQQBqVNS1LhcDRa7dN0QcavmgCMRHCQ4K/exec` |
| Google Sheet | `https://docs.google.com/spreadsheets/d/19RMB_k5uA2RpwL0xXZf4gfnqRuZAd1Q-j5nnoGZNIxg` |

**Where the endpoint is stored:**
- `assets/js/newsletter.js` — line 1, `const SCRIPT_URL = ...`
- `.env` (local only, not committed to git)

---

## 2. Google Sheet

**Open it:** https://docs.google.com/spreadsheets/d/19RMB_k5uA2RpwL0xXZf4gfnqRuZAd1Q-j5nnoGZNIxg

**Column structure:**

| A | B | C | D |
|---|---|---|---|
| Timestamp | Email | Sign | Agreed to Policy |

**Viewing subscribers:** Just open the sheet — newest rows at the bottom.

**Export to CSV (backup):**
File → Download → Comma Separated Values (.csv)

**Filter by sign (e.g. all Scorpios):**
1. Click the Sign column header (C)
2. Data → Create a filter
3. Click the filter dropdown on column C → filter by "Scorpio"
4. Remove filter when done: Data → Remove filter

---

## 3. Google Apps Script

**Open it:** https://script.google.com → look for project named `CosmicEnergyDaily-Subscribers`

**Editing the script:**
- Click the file to open the editor
- Make your changes
- Save with Ctrl+S

> **CRITICAL: Changes do NOT go live until you deploy a new version.**

**Deploying after any change:**
1. Click **Deploy** (top right) → **Manage deployments**
2. Click the **pencil icon** (edit) on the current deployment
3. Under Version, select **New version**
4. Click **Deploy**
5. Copy the new URL if it changed — update `assets/js/newsletter.js` if so

**Testing with testEmail():**
1. In the script editor, select `testEmail` from the function dropdown
2. Click **Run**
3. Check your inbox and the sheet for a test row

**Checking execution logs:**
- Left sidebar → **clock icon** (Executions)
- Shows every run, its status (Completed / Failed), and any console.log output
- If a run says Completed but nothing happened → authorization scope issue

---

## 4. Current Web App URL

```
https://script.google.com/macros/s/AKfycbzCDo8bOVUUBsGJlWlAMIUDegu1hA_HbkbwQQBqVNS1LhcDRa7dN0QcavmgCMRHCQ4K/exec
```

If you create a new deployment and get a new URL:

1. Open `assets/js/newsletter.js`
2. Replace the URL on line 1
3. Push:
```bash
git add assets/js/newsletter.js
git commit -m "fix: update Apps Script URL"
git push
```

---

## 5. Troubleshooting

**Emails not arriving (most common issue):**
- Go to https://myaccount.google.com/permissions
- Find the Apps Script app and **remove its access**
- Back in the script editor, run `testEmail()` again
- A permission dialog will appear — click through **all** screens and allow **ALL** scopes including Gmail
- Missing any scope causes silent failures with no error in the logs

**Form submits but no row appears in the sheet:**
- The endpoint URL in `newsletter.js` doesn't match the current deployment
- Open Manage deployments and copy the current URL, compare with `newsletter.js`

**Got a new deployment URL:**
- Update `newsletter.js` and push (see Section 4)

**Execution log shows "Completed" but no email sent:**
- Authorization scope issue — see "Emails not arriving" above

**Duplicate rows in the sheet:**
- Normal — each form submission adds one row, there's no dedup logic
- Can manually delete duplicates in the sheet if needed

---

## 6. Future improvements

- Add an unsubscribe link in emails that marks the row as unsubscribed in the sheet
- Set up a weekly send using an Apps Script time-based trigger (Triggers → clock icon → add trigger on `sendWeeklyEmail`)
- Filter sheet by Timestamp column to see new signups this week
- Add a birth date field for personalized birth chart readings — could be a paid tier
