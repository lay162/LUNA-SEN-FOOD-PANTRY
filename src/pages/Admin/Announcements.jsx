import React, { useEffect, useMemo, useState } from 'react';
import { useAdminOps } from '../../context/AdminOpsContext';
import { getAuthInstance, getDb, isFirebaseConfigured, omitUndefinedDeep } from '../../firebase';
import { getCurrentAdminRole } from './utils/adminAuth';

const LS_ANN = 'luna-admin-announcements-v1';
const LS_ACK = 'luna-admin-announcement-acks-v1';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function actorKey() {
  const auth = getAuthInstance?.();
  const email = auth?.currentUser?.email;
  const u = auth?.currentUser;
  return email || u?.uid || localStorage.getItem('luna-admin-user') || 'staff';
}

function formatAt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Announcements() {
  const { addAudit } = useAdminOps();
  const [announcements, setAnnouncements] = useState(() => loadJSON(LS_ANN, []));
  const [acks, setAcks] = useState(() => loadJSON(LS_ACK, {}));
  const [form, setForm] = useState({ title: '', body: '', requireAck: true, target: 'all' });
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [role, setRole] = useState('staff');

  useEffect(() => {
    localStorage.setItem(LS_ANN, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(LS_ACK, JSON.stringify(acks));
  }, [acks]);

  // If Firebase is configured, hydrate announcements from server.
  useEffect(() => {
    if (!isFirebaseConfigured()) return undefined;
    const db = getDb();
    if (!db) return undefined;
    let unsub = null;
    setLoadingRemote(true);
    (async () => {
      try {
        const { collection, limit, onSnapshot, orderBy, query } = await import('firebase/firestore');
        const q = query(collection(db, 'adminAnnouncements'), orderBy('createdAt', 'desc'), limit(50));
        unsub = onSnapshot(
          q,
          (snap) => {
            const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setAnnouncements(rows);
            setLoadingRemote(false);
          },
          () => setLoadingRemote(false)
        );
      } catch {
        setLoadingRemote(false);
      }
    })();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const actor = useMemo(() => actorKey(), []);
  const canPost = role === 'founder';

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await getCurrentAdminRole();
        if (alive) setRole(r || 'staff');
      } catch {
        if (alive) setRole('staff');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const myAcks = acks?.[actor] || {};

  const postAnnouncement = async () => {
    if (!canPost) {
      window.alert('Only admin can post announcements.');
      return;
    }
    const title = String(form.title || '').trim();
    const body = String(form.body || '').trim();
    if (!title || !body) {
      window.alert('Please add a title and message.');
      return;
    }

    const row = {
      id: uid(),
      title,
      body,
      requireAck: form.requireAck !== false,
      target: form.target || 'all',
      createdAt: new Date().toISOString(),
      createdBy: actor,
    };

    setAnnouncements((prev) => [row, ...prev]);
    setForm({ title: '', body: '', requireAck: true, target: 'all' });

    addAudit({
      action: 'announcement_posted',
      entityType: 'announcement',
      entityId: row.id,
      details: `Posted announcement: ${row.title} (target: ${row.target}, ack: ${row.requireAck ? 'required' : 'optional'})`,
    });

    if (isFirebaseConfigured()) {
      try {
        const db = getDb();
        if (db) {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'adminAnnouncements', row.id), omitUndefinedDeep(row), { merge: true });
        }
      } catch {
        // ignore; local cache still works
      }
    }
  };

  const ackAnnouncement = async (id) => {
    setAcks((prev) => ({
      ...(prev || {}),
      [actor]: { ...(prev?.[actor] || {}), [id]: new Date().toISOString() },
    }));

    addAudit({
      action: 'announcement_acknowledged',
      entityType: 'announcement',
      entityId: id,
      details: `Acknowledged announcement ${id}`,
    });

    if (isFirebaseConfigured()) {
      try {
        const db = getDb();
        const auth = getAuthInstance?.();
        const u = auth?.currentUser;
        if (db && u) {
          const { addDoc, collection } = await import('firebase/firestore');
          await addDoc(
            collection(db, 'adminAnnouncementAcks'),
            omitUndefinedDeep({
              at: new Date().toISOString(),
              announcementId: id,
              uid: u.uid,
              email: u.email || '',
              actor,
            })
          );
        }
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--accent-blue admin-panel__card--shadow">
        <div className="admin-panel__card-pad">
          <div className="admin-panel__ann-hero">
            <div className="admin-panel__ann-hero-body">
              <h1 className="admin-panel__page-title w-full text-2xl md:text-3xl">Announcements</h1>
              <p className="mt-2 text-sm text-gray-600">
                Post updates for staff/volunteers/drivers. Optionally require users to acknowledge (“read &amp; agree”).
              </p>
            </div>
            <div className="admin-panel__ann-signed-strip rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-700">
              Signed in as <span className="font-extrabold">{actor}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__grid-2">
        <div className="admin-panel__card admin-panel__card--shadow">
          <div className="admin-panel__card-pad">
            <h2 className="admin-panel__section-title">Post an announcement</h2>
            {canPost ? (
              <div className="space-y-4">
                <div>
                  <label className="admin-panel__label" htmlFor="ann-title">
                    Title
                  </label>
                  <input
                    id="ann-title"
                    className="admin-panel__input"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. New delivery process"
                  />
                </div>
                <div>
                  <label className="admin-panel__label" htmlFor="ann-body">
                    Message
                  </label>
                  <textarea
                    id="ann-body"
                    className="admin-panel__input"
                    rows={6}
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                    style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                    placeholder="Write the full announcement…"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="admin-panel__ann-ack-choice">
                    <span className="text-sm font-semibold text-gray-800">Require acknowledgement</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                      checked={form.requireAck}
                      onChange={(e) => setForm((p) => ({ ...p, requireAck: e.target.checked }))}
                    />
                  </label>
                  <div>
                    <label className="admin-panel__label" htmlFor="ann-target">
                      Target
                    </label>
                    <select
                      id="ann-target"
                      className="admin-panel__input"
                      value={form.target}
                      onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
                    >
                      <option value="all">All users</option>
                      <option value="staff">Staff</option>
                      <option value="volunteer">Volunteers</option>
                      <option value="driver">Drivers</option>
                    </select>
                  </div>
                </div>

                <div className="admin-panel__ann-post-submit">
                  <button
                    type="button"
                    className="admin-panel__btn admin-panel__btn--primary rounded-xl py-3"
                    onClick={postAnnouncement}
                  >
                    Post announcement
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-500">
                Only admin can post announcements. You can still view and acknowledge updates here.
              </div>
            )}
          </div>
        </div>

        <div className="admin-panel__card admin-panel__card--shadow">
          <div className="admin-panel__card-pad">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="admin-panel__section-title mb-0">Latest</h2>
              {loadingRemote ? (
                <span className="text-xs font-semibold text-gray-500">Loading…</span>
              ) : null}
            </div>
            <div className="mt-4 space-y-4">
              {announcements.map((a) => {
                const ackAt = myAcks?.[a.id] || '';
                const needsAck = a.requireAck && !ackAt;
                return (
                  <div key={a.id} className="rounded-2xl border border-gray-100 bg-white p-5" style={{ boxShadow: '0 2px 12px -4px rgba(0,0,0,0.06)' }}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold text-gray-900">{a.title}</h3>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                          {formatAt(a.createdAt)} · Target: {a.target || 'all'} · {a.requireAck ? 'Ack required' : 'Ack optional'}
                        </p>
                      </div>
                      {needsAck ? (
                        <span className="inline-flex rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-rose-800">
                          Action needed
                        </span>
                      ) : (
                        <span className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                          {ackAt ? 'Acknowledged' : 'Seen'}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{a.body}</p>

                    {a.requireAck ? (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold text-gray-500">
                          {ackAt ? `Acknowledged at ${formatAt(ackAt)}` : 'Please acknowledge once read.'}
                        </p>
                        <button
                          type="button"
                          className="admin-panel__btn admin-panel__btn--primary rounded-lg px-4 py-2 text-xs font-extrabold uppercase tracking-wide"
                          disabled={Boolean(ackAt)}
                          onClick={() => ackAnnouncement(a.id)}
                        >
                          {ackAt ? 'Acknowledged' : 'I have read & agree'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {announcements.length === 0 ? (
                <div className="admin-panel__ann-latest-empty rounded-2xl border border-dashed border-gray-200 py-14 text-gray-500">
                  No announcements yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

