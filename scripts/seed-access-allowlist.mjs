/**
 * One-time bootstrap: creates/updates Firestore accessAllowlist/{email} for founder/admin signup.
 *
 * Usage:
 *   npm run seed:allowlist -- your@email.com
 *   npm run seed:allowlist -- your@email.com path\to\serviceAccount.json
 *
 * Get the JSON key: Firebase Console → Project settings → Service accounts → Generate new private key
 * Keep the file out of git (serviceAccount*.json is gitignored).
 */
import { readFileSync, existsSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const emailRaw = process.argv[2];
const keyPathArg = process.argv[3];

if (!emailRaw || !String(emailRaw).includes('@')) {
  console.error('Usage: npm run seed:allowlist -- your@email.com [path-to-service-account.json]');
  process.exit(1);
}

const email = String(emailRaw).trim().toLowerCase();
const keyPath =
  keyPathArg ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!keyPath || !existsSync(keyPath)) {
  console.error(
    'Missing service account JSON. Either:\n' +
      '  npm run seed:allowlist -- your@email.com .\\path\\to\\key.json\n' +
      'or set GOOGLE_APPLICATION_CREDENTIALS to that file path.\n' +
      'Create the key: Firebase → Project settings → Service accounts → Generate new private key.'
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
await db.collection('accessAllowlist').doc(email).set(
  {
    email,
    displayName: email.split('@')[0] || 'Admin',
    role: 'founder',
    active: true,
    invitedAt: new Date().toISOString(),
    seededBy: 'scripts/seed-access-allowlist.mjs',
  },
  { merge: true }
);

console.log('Done. accessAllowlist document:', email);
console.log('Next: open /admin on your site and complete account creation / sign-in from allowlist.');
process.exit(0);
