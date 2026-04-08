import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { deleteDoc, doc, getDoc, getDocs, setDoc, collection } from 'firebase/firestore';
import { getAuthInstance, getDb, isFirebaseConfigured } from '../../../firebase';

const ADMIN_USER_KEY = 'luna-admin-user';
const ADMIN_SESSION_KEY = 'luna-admin';
const ADMIN_USERS_KEY = 'luna-admin-users-v1';
const FS_ADMIN_USERS = 'adminUsers';
const ALLOWLIST_KEY = 'luna-admin-allowlist-v1';
const FS_ALLOWLIST = 'accessAllowlist';

function emailKey(email) {
  return String(email || '').trim().toLowerCase();
}

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function bootstrapAdminUsers() {
  if (typeof window === 'undefined') return;
  if (isFirebaseConfigured()) return;
  const existing = safeJsonParse(localStorage.getItem(ADMIN_USERS_KEY) || 'null', null);
  if (existing && Array.isArray(existing.users)) return;
  const seed = {
    users: [
      { username: 'lunaadmin', displayName: 'Luna Admin', role: 'founder', createdAt: new Date().toISOString() },
    ],
  };
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(seed));
}

function bootstrapAllowlist() {
  if (typeof window === 'undefined') return;
  const existing = safeJsonParse(localStorage.getItem(ALLOWLIST_KEY) || 'null', null);
  if (existing && Array.isArray(existing.entries)) return;
  localStorage.setItem(ALLOWLIST_KEY, JSON.stringify({ entries: [] }));
}

export async function getAllowlistEntries() {
  if (typeof window === 'undefined') return [];
  if (!isFirebaseConfigured()) {
    bootstrapAllowlist();
    const raw = localStorage.getItem(ALLOWLIST_KEY) || '{"entries":[]}';
    const parsed = safeJsonParse(raw, { entries: [] });
    return Array.isArray(parsed.entries) ? parsed.entries : [];
  }
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, FS_ALLOWLIST));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => String(b.invitedAt || '').localeCompare(String(a.invitedAt || '')));
}

export async function upsertAllowlistEntry(entry) {
  if (typeof window === 'undefined') return;
  const email = emailKey(entry.email);
  if (!email || !email.includes('@')) throw new Error('Valid email is required');
  const next = {
    email,
    displayName: String(entry.displayName || '').trim(),
    role:
      entry.role === 'driver'
        ? 'driver'
        : entry.role === 'volunteer'
          ? 'volunteer'
          : entry.role === 'founder'
            ? 'founder'
            : 'staff',
    active: entry.active === false ? false : true,
    invitedAt: entry.invitedAt || new Date().toISOString(),
    invitedBy: entry.invitedBy || (getAuthInstance()?.currentUser?.email || 'founder'),
  };

  if (!isFirebaseConfigured()) {
    bootstrapAllowlist();
    const entries = await getAllowlistEntries();
    const idx = entries.findIndex((e) => e.email === email);
    const merged = idx >= 0 ? entries.map((e, i) => (i === idx ? { ...e, ...next } : e)) : [next, ...entries];
    localStorage.setItem(ALLOWLIST_KEY, JSON.stringify({ entries: merged }));
    return;
  }
  const db = getDb();
  if (!db) throw new Error('Firebase not available');
  await setDoc(doc(db, FS_ALLOWLIST, email), next, { merge: true });
}

export async function deleteAllowlistEntry(email) {
  if (typeof window === 'undefined') return;
  const key = emailKey(email);
  if (!isFirebaseConfigured()) {
    bootstrapAllowlist();
    const entries = (await getAllowlistEntries()).filter((e) => e.email !== key);
    localStorage.setItem(ALLOWLIST_KEY, JSON.stringify({ entries }));
    return;
  }
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, FS_ALLOWLIST, key));
}

export async function isEmailAllowlisted(email) {
  const key = emailKey(email);
  if (!key || !key.includes('@')) return { ok: false, error: 'Enter a valid email.' };
  if (!isFirebaseConfigured()) {
    const entries = await getAllowlistEntries();
    const row = entries.find((e) => e.email === key);
    if (!row) return { ok: false, error: 'You have not been invited yet.' };
    if (row.active === false) return { ok: false, error: 'Your access has been disabled.' };
    return { ok: true, entry: row };
  }
  const db = getDb();
  if (!db) return { ok: false, error: 'Firebase not available' };
  const snap = await getDoc(doc(db, FS_ALLOWLIST, key));
  if (!snap.exists()) return { ok: false, error: 'You have not been invited yet.' };
  const row = snap.data();
  if (row.active === false) return { ok: false, error: 'Your access has been disabled.' };
  return { ok: true, entry: row };
}

export async function createAccountFromAllowlist({ email, password }) {
  const e = emailKey(email);
  const p = String(password || '').trim();
  if (!e || !e.includes('@')) return { ok: false, error: 'Enter your email address.' };
  if (!p || p.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

  const check = await isEmailAllowlisted(e);
  if (!check.ok) return check;

  if (!isFirebaseConfigured()) {
    // Local demo: treat as a normal sign-in for now
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    localStorage.setItem(ADMIN_USER_KEY, e.split('@')[0]);
    return { ok: true };
  }

  const auth = getAuthInstance();
  const db = getDb();
  if (!auth || !db) return { ok: false, error: 'Firebase not available' };

  try {
    const cred = await createUserWithEmailAndPassword(auth, e, p);
    await setDoc(doc(db, FS_ADMIN_USERS, cred.user.uid), {
      uid: cred.user.uid,
      email: e,
      displayName: check.entry?.displayName || e,
      role: check.entry?.role || 'staff',
      active: true,
      createdAt: new Date().toISOString(),
      provisionedFrom: 'allowlist',
    });
    // Mark allowlist as claimed (kept for history)
    await setDoc(doc(db, FS_ALLOWLIST, e), { claimedAt: new Date().toISOString(), claimedUid: cred.user.uid }, { merge: true });

    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    localStorage.setItem(ADMIN_USER_KEY, e.split('@')[0]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'Could not create account' };
  }
}

export async function getAdminUsers() {
  if (typeof window === 'undefined') return [];
  if (!isFirebaseConfigured()) {
    bootstrapAdminUsers();
    const raw = localStorage.getItem(ADMIN_USERS_KEY) || '{"users":[]}';
    const parsed = safeJsonParse(raw, { users: [] });
    return Array.isArray(parsed.users) ? parsed.users : [];
  }
  const db = getDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, FS_ADMIN_USERS));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

export async function upsertAdminUser(user) {
  if (typeof window === 'undefined') return;
  if (!isFirebaseConfigured()) {
    bootstrapAdminUsers();
    const users = await getAdminUsers();
    const username = String(user.username || '').trim().toLowerCase();
    if (!username) throw new Error('Username is required');

    const next = {
      username,
      displayName: String(user.displayName || username).trim() || username,
      role: user.role === 'staff' ? 'staff' : 'founder',
      createdAt: user.createdAt || new Date().toISOString(),
    };

    const idx = users.findIndex((u) => u.username === username);
    const merged = idx >= 0 ? users.map((u, i) => (i === idx ? { ...u, ...next } : u)) : [next, ...users];
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify({ users: merged }));
    return;
  }

  // Deployed: create Firebase Auth user + role doc
  const email = String(user.email || '').trim().toLowerCase();
  const tempPassword = String(user.tempPassword || '').trim();
  if (!email) throw new Error('Email is required');
  if (!tempPassword) throw new Error('Temporary password is required');

  // NOTE: This signs the browser into the new user briefly, then returns to the founder session.
  // Without a backend/Admin SDK this is the simplest deployed approach.
  const auth = getAuthInstance();
  const db = getDb();
  if (!auth || !db) throw new Error('Firebase not available');

  // Cache current user to re-login afterwards (requires founder to re-enter password if session can't be restored).
  const currentEmail = auth.currentUser?.email || null;

  const cred = await createUserWithEmailAndPassword(auth, email, tempPassword);
  await setDoc(doc(db, FS_ADMIN_USERS, cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName: String(user.displayName || email).trim() || email,
      role:
        user.role === 'founder'
          ? 'founder'
          : user.role === 'driver'
            ? 'driver'
            : user.role === 'volunteer'
              ? 'volunteer'
              : 'staff',
    createdAt: new Date().toISOString(),
    createdBy: currentEmail,
  });

  // Sign out new user; founder will need to sign back in
  await signOut(auth);
  if (currentEmail) {
    // founder must sign back in manually (we surface this in UI)
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  }
}

export async function deleteAdminUser(usernameOrId) {
  if (typeof window === 'undefined') return;
  if (!isFirebaseConfigured()) {
    bootstrapAdminUsers();
    const u = String(usernameOrId || '').trim().toLowerCase();
    const users = (await getAdminUsers()).filter((x) => x.username !== u);
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify({ users }));
    return;
  }
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, FS_ADMIN_USERS, String(usernameOrId)));
}

export function getCurrentAdminUsername() {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem(ADMIN_USER_KEY) || '').toLowerCase();
}

export async function getCurrentAdminUser() {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) {
    const username = getCurrentAdminUsername();
    if (!username) return null;
    const users = await getAdminUsers();
    return users.find((u) => u.username === username) || { username, displayName: username, role: 'staff' };
  }
  const auth = getAuthInstance();
  const db = getDb();
  if (!auth?.currentUser || !db) return null;
  const snap = await getDoc(doc(db, FS_ADMIN_USERS, auth.currentUser.uid));
  if (snap.exists()) return snap.data();
  return { uid: auth.currentUser.uid, email: auth.currentUser.email || '', role: 'staff', displayName: 'Staff' };
}

export async function getCurrentAdminRole() {
  const u = await getCurrentAdminUser();
  return u?.role === 'founder'
    ? 'founder'
    : u?.role === 'driver'
      ? 'driver'
      : u?.role === 'volunteer'
        ? 'volunteer'
        : 'staff';
}

export function isAdminAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(ADMIN_SESSION_KEY);
}

export async function signInAdmin({ username, password }) {
  if (typeof window === 'undefined') return { ok: false, error: 'Not available' };

  const u = String(username || '').trim().toLowerCase();
  const p = String(password || '').trim();

  if (isFirebaseConfigured()) {
    const auth = getAuthInstance();
    if (!auth) return { ok: false, error: 'Auth not available' };
    try {
      if (!u.includes('@')) return { ok: false, error: 'Enter your email address to sign in.' };
      await signInWithEmailAndPassword(auth, u, p);

      // Must have an active adminUsers role doc to proceed
      const db = getDb();
      if (db && auth.currentUser) {
        const snap = await getDoc(doc(db, FS_ADMIN_USERS, auth.currentUser.uid));
        if (!snap.exists()) {
          await signOut(auth);
          return { ok: false, error: 'Your account is not yet enabled by an admin.' };
        }
        const data = snap.data();
        if (data.active === false) {
          await signOut(auth);
          return { ok: false, error: 'Your access has been disabled.' };
        }
      }

      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      localStorage.setItem(ADMIN_USER_KEY, u.split('@')[0]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.message || 'Invalid credentials' };
    }
  }

  // Local demo fallback
  const localFounderAlias = u === 'lunaadmin' || u === 'lunaadmin@luna.local';
  if (localFounderAlias && p === 'luna@2026') {
    bootstrapAdminUsers();
    await upsertAdminUser({ username: 'lunaadmin', displayName: 'Luna Admin', role: 'founder' });
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    localStorage.setItem(ADMIN_USER_KEY, 'lunaadmin');
    return { ok: true };
  }

  const staff = (await getAdminUsers()).find((x) => x.username === u);
  if (staff && p === 'luna@2026') {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    localStorage.setItem(ADMIN_USER_KEY, staff.username);
    return { ok: true };
  }

  return { ok: false, error: 'Invalid credentials' };
}

export async function requestPasswordReset(email) {
  if (typeof window === 'undefined') return { ok: false, error: 'Not available' };
  const e = String(email || '').trim().toLowerCase();
  if (!e || !e.includes('@')) return { ok: false, error: 'Enter your email address.' };
  if (!isFirebaseConfigured()) {
    return { ok: false, error: 'Password reset requires Firebase to be configured.' };
  }
  const auth = getAuthInstance();
  if (!auth) return { ok: false, error: 'Auth not available' };
  try {
    await sendPasswordResetEmail(auth, e);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'Could not send reset email' };
  }
}

export function signOutAdmin() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  if (isFirebaseConfigured()) {
    const auth = getAuthInstance();
    if (auth) signOut(auth).catch(() => {});
  }
}

