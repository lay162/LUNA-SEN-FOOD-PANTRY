# Free setup for forms and data

This site works without any accounts: submissions can be **saved in the visitor’s browser** until you add a delivery path.

For **zero cost** day-to-day use, pick **one or both** of these (they stack nicely):

| Option | What you get | Cost |
|--------|----------------|------|
| **Firebase (Spark)** | Firestore database + anonymous sign-in for secure writes | Free tier ([Spark](https://firebase.google.com/pricing)) |
| **EmailJS** | Sends form contents to your inbox as email | Free tier limits apply |

**Google Sheets via Cloud Functions** is documented in [FIREBASE_SHEETS.md](./FIREBASE_SHEETS.md). It needs Firebase **Blaze** (pay-as-you-go with a free monthly allowance), so it is **not** the same as “fully free forever” Spark-only hosting.

## Recommended free path

1. **Firebase Spark** — store referrals/volunteers in Firestore, deploy `firestore.rules` from this repo so only your app can write.
2. **EmailJS** — optional backup: if Firestore fails or times out, the same form can email your team.

## What you paste where

1. Copy `.env.example` to `.env.local` in the project root.
2. Fill Firebase keys from **Firebase Console → Project settings → Your apps → Web app**.
3. Fill EmailJS keys from your EmailJS dashboard (public key, service ID, template ID).
4. Restart `npm run dev` after changing env vars.

On **Vercel / Netlify / similar**, add the same variable names in the host’s “Environment variables” UI (still prefixed with `VITE_`).

## Deploy checklist

- [ ] Firestore enabled; **Authentication → Anonymous** enabled (the app signs in anonymously before writing).
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules` (from a machine with Firebase CLI logged in).
- [ ] Production build: `npm run build` — confirm no missing `VITE_*` in the hosting dashboard if forms should hit the cloud.

For a full click-by-click walkthrough, see [SETUP_STEP_BY_STEP.md](./SETUP_STEP_BY_STEP.md).
