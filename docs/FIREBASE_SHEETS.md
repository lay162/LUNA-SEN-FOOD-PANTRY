# Firebase (Firestore) + Google Sheets

**Firestore** is the source of truth: every referral and volunteer application is stored as a document.  
**Google Sheets** is a live mirror for staff: sort, filter, colour-code, and share with trustees — without giving everyone the Firebase console.

Cloud Functions listen for **new** documents and **append one row** per submission.

---

## What was added in this repo

| Piece | Purpose |
|--------|--------|
| `firestore.rules` | Only authenticated users (including **Anonymous**) can **create** `referrals` / `volunteers`; public cannot read. |
| `firebase.json` | Wires Firestore + Functions for deploy. |
| `functions/index.js` | `appendReferralToSheet` + `appendVolunteerToSheet` — append rows to tabs **Referrals** and **Volunteers**. |

---

## Google Sheet setup

1. Create a new Google Sheet (e.g. **LUNA — intake log**).
2. Add two worksheets named exactly:
   - **Referrals**
   - **Volunteers**
3. On **row 1** of each tab, add headers (must match column order the function writes — see below).

### Referrals — suggested headers (row 1)

`Doc ID` | `Created (ISO)` | `First name` | `Last name` | `Phone` | `Email` | `Postcode` | `Contact pref` | `Adults` | `Children` | `Children ages` | `Urgency` | `Support types` | `Household items` | `SEN (y/n)` | `SEN details` | `Comments` | `Consent` | `Language` | `Best time to contact`

### Volunteers — suggested headers (row 1)

`Doc ID` | `Created (ISO)` | `Name` | `Email` | `Phone` | `Role` | `Availability` | `Experience` | `Vehicle` | `Driving licence` | `Can lift heavy` | `Consent` | `Additional` | `Start date`

---

## Service account (Sheets API)

1. [Google Cloud Console](https://console.cloud.google.com/) → select **the same GCP project** linked to Firebase (Firebase console → Project settings → **Google Cloud** link).
2. **APIs & Services** → **Enable** **Google Sheets API**.
3. **IAM & Admin** → **Service accounts** → **Create** (any name, e.g. `luna-sheets-writer`).
4. **Keys** → **Add key** → **JSON** — download the file. **Keep it private** (never commit to Git).
5. Open the Sheet → **Share** → paste the service account **email** (looks like `something@project-id.iam.gserviceaccount.com`) → role **Editor**.

---

## Firebase secrets (production)

Install Firebase CLI: `npm i -g firebase-tools`, then `firebase login`.

From the **project root** (not `functions/`):

```bash
# Paste the entire JSON key when prompted (or pipe from file — see Firebase docs)
firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON

# The Sheet ID is in the URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
firebase functions:secrets:set GOOGLE_SHEET_ID
```

Deploy rules + functions:

```bash
firebase deploy --only firestore:rules,functions
```

**Billing:** Cloud Functions need the **Blaze** (pay-as-you-go) plan. There is a generous free tier; tiny traffic stays near zero cost — still review [Firebase pricing](https://firebase.google.com/pricing).

---

## Region

Functions are set to **`europe-west2` (London)** in `functions/index.js`. Change `REGION` if you prefer another region (must match Firestore location expectations where relevant).

---

## If you stay on Spark (no Functions)

- Keep using **Firestore** as the database.
- Export data periodically from the [Firebase console](https://console.firebase.google.com/) (or build a small **Admin** tool later).
- Or use a no-code tool (e.g. Make/Zapier) **Firestore → Google Sheets** — same idea, different plumbing.

---

## Privacy

SEN and crisis data is sensitive. Restrict who can open the Sheet, avoid “anyone with the link”, and align sharing with your privacy policy and consent wording.
