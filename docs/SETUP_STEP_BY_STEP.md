# Simple setup guide (you can do this slowly)

You do **not** have to do everything here. The website already works on your computer for testing. Firebase and Google Sheets are **optional extras** for when you want cloud storage and a spreadsheet.

For a short overview of **free** options (Firebase Spark, EmailJS, and how they fit together), see **[FREE_SETUP.md](./FREE_SETUP.md)**.

Take breaks between steps. It’s normal if this feels new.

---

## Part A — Do nothing (totally fine)

- Open the project folder, run `npm install` once, then `npm run dev`, open the link it shows (often `http://localhost:3000`).
- Forms can save **on the device** when Firebase isn’t set up yet.
- **You are not doing anything wrong** by skipping the rest until you’re ready.

---

## Part B — Firebase (when you want online storage)

**Time:** about 20–30 minutes the first time.  
**You need:** a Google account (Gmail), and a web browser.

### B1. Create a Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with your Google account.
3. Click **Add project** (or **Create a project**).
4. Type a name (e.g. `Luna Sen Pantry`).
5. You can turn **Google Analytics** off if it asks — not required.
6. Click through until the project is **created**.

### B2. Register a “web app” and get the config

1. In the Firebase console, open your project.
2. Click the **gear** icon → **Project settings**.
3. Scroll to **Your apps** → click the **`</>`** (Web) icon to add a web app.
4. Give it a nickname (e.g. `Website`) → **Register app**.
5. You’ll see a **firebaseConfig** block with `apiKey`, `authDomain`, `projectId`, etc.

### B3. Paste the config into this project (`.env.local`)

1. In your project folder, copy **`.env.example`** to a new file named **`.env.local`** (same folder as `package.json`).
2. Open **`.env.local`** in a text editor.
3. From the Firebase `firebaseConfig` block, copy each value into the matching line:

   | Firebase key | Put it in `.env.local` as |
   |--------------|---------------------------|
   | `apiKey` | `VITE_FIREBASE_API_KEY=` |
   | `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN=` |
   | `projectId` | `VITE_FIREBASE_PROJECT_ID=` |
   | `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET=` |
   | `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID=` |
   | `appId` | `VITE_FIREBASE_APP_ID=` |

4. Save the file. **Restart** the dev server (`npm run dev`) so Vite picks up the new variables.

**Do not commit `.env.local`** — it stays on your machine only (git ignores `*.local`).

### B4. Turn on Firestore and Anonymous login

1. In Firebase console: **Build** → **Firestore Database** → **Create database**.
2. Choose **Start in test mode** for first tests (you can tighten rules later).
3. Pick a **region** close to the UK (e.g. `eur3` / Europe) if asked.
4. Then: **Build** → **Authentication** → **Get started** → **Sign-in method** → enable **Anonymous** → Save.

### B5. Deploy security rules (when you install Firebase tools)

This step uses a **terminal** (Command Prompt on Windows, or PowerShell).

1. Install Node.js if you don’t have it: [https://nodejs.org](https://nodejs.org) (LTS version is fine).
2. Open a terminal in your **project folder** (the one that contains `package.json`).
3. Run:

   ```bash
   npm install -g firebase-tools
   ```

4. Run:

   ```bash
   firebase login
   ```

   (A browser window will ask you to sign in with Google — that’s normal.)

5. Run:

   ```bash
   firebase use --add
   ```

   Pick your Firebase project when it lists them.

6. Run:

   ```bash
   npm run deploy:firestore-rules
   ```

If any command errors, copy the **exact message** and ask someone technical, or search the error text — often it’s a wrong folder or not logged in.

---

## Part C — Google Sheet mirror (optional, more advanced)

This makes new referrals **copy a row** into a spreadsheet. It needs:

- The same Google Cloud project as Firebase (linked automatically),
- A **service account** and **secrets** — this is fiddly.

**Honest advice:**  
- Either follow **[FIREBASE_SHEETS.md](FIREBASE_SHEETS.md)** slowly,  
- Or ask a friend / volunteer who has done “Google Cloud” or “Firebase functions” before,  
- Or skip Part C until Part B works and you’re happy.

**You can run LUNA without Part C.** Firestore alone already stores submissions.

---

## If you feel stuck

1. **Stop** — you don’t have to finish in one day.  
2. **Do only Part B1–B3** first (project + paste config). That’s a big win.  
3. **Ask for one hour of help** from someone who sets up websites or IT for charities — show them this file and `README.md`.

You’re not expected to know this already. The project is set up so you can grow into it.
