import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Paperclip, Send } from 'lucide-react';
import { useAdminOps } from '../../context/AdminOpsContext';
import { getAuthInstance, getDb, isFirebaseConfigured, omitUndefinedDeep } from '../../firebase';
import { useBrandLogoUrl } from '../../context/BrandingContext';
import { getAllowlistEntries } from './utils/adminAuth';

const LS_MSG = 'luna-admin-messages-v1';
const LS_READ = 'luna-admin-messages-read-v1';

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

function readActor() {
  const auth = getAuthInstance?.();
  const u = auth?.currentUser;
  const email = u?.email || null;
  const label = email || u?.uid || localStorage.getItem('luna-admin-user') || 'staff';
  return { label, uid: u?.uid || null, email };
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

// Direct messages only. Broadcasting is handled via Announcements.

function initials(nameOrEmail) {
  const s = String(nameOrEmail || '').trim();
  if (!s) return 'U';
  const parts = s.includes('@') ? s.split('@')[0].split(/[.\s_-]+/) : s.split(/\s+/);
  const a = (parts[0] || '').slice(0, 1).toUpperCase();
  const b = (parts[1] || '').slice(0, 1).toUpperCase();
  return (a + b) || a || 'U';
}

export default function Messages() {
  const brandLogoUrl = useBrandLogoUrl();
  const { addAudit } = useAdminOps();
  const actor = useMemo(() => readActor(), []);
  const [searchParams] = useSearchParams();
  const [channelId, setChannelId] = useState(null);
  const [selectedDm, setSelectedDm] = useState(null); // email
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState(() => loadJSON(LS_MSG, []));
  const [readState, setReadState] = useState(() => loadJSON(LS_READ, {}));
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null); // { name, mime, size, dataUrl }
  const [loadingRemote, setLoadingRemote] = useState(false);
  const listRef = useRef(null);
  const fileRef = useRef(null);

  const meKey = useMemo(() => String(actor.email || actor.label || '').toLowerCase(), [actor.email, actor.label]);

  const MAX_ATTACHMENT_BYTES = 2.5 * 1024 * 1024; // keep localStorage safe-ish
  const ACCEPTED_MIME_PREFIXES = ['image/'];
  const ACCEPTED_MIME_EXACT = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const pickFile = () => fileRef.current?.click?.();

  const onPickFile = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    if (f.size > MAX_ATTACHMENT_BYTES) {
      window.alert('File is too large. Please use a file under 2.5MB for now.');
      e.target.value = '';
      return;
    }
    const mime = String(f.type || '');
    const allowed =
      ACCEPTED_MIME_PREFIXES.some((p) => mime.startsWith(p)) || ACCEPTED_MIME_EXACT.includes(mime) || String(f.name).toLowerCase().endsWith('.pdf');
    if (!allowed) {
      window.alert('Please upload an image, PDF, or Word document.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: f.name,
        mime: mime || 'application/octet-stream',
        size: f.size,
        dataUrl: String(reader.result || ''),
      });
      e.target.value = '';
    };
    reader.onerror = () => {
      window.alert('Could not read that file. Try again.');
      e.target.value = '';
    };
    reader.readAsDataURL(f);
  };

  const effectiveChannelId = useMemo(() => {
    const me = String(actor.email || actor.label || '').toLowerCase();
    const other = String(selectedDm || '').toLowerCase();
    if (!me || !other) return null;
    const pair = [me, other].sort().join('|');
    return `dm:${pair}`;
  }, [actor.email, actor.label, selectedDm]);

  const myRead = readState?.[actor.label]?.[effectiveChannelId || ''] || '';

  useEffect(() => {
    localStorage.setItem(LS_MSG, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(LS_READ, JSON.stringify(readState));
  }, [readState]);

  // Load contacts (allowlist)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getAllowlistEntries();
        const active = (rows || []).filter((r) => r?.active !== false && r?.email);
        if (!alive) return;
        setContacts(active);
      } catch {
        if (!alive) return;
        setContacts([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Deep link selection from header popup: /admin/messages?dm=email@domain
  useEffect(() => {
    const dm = searchParams.get('dm');
    if (!dm) return;
    setSelectedDm(dm);
  }, [searchParams]);

  // Firebase hydrate (current channel)
  useEffect(() => {
    if (!effectiveChannelId) return undefined;
    if (!isFirebaseConfigured()) return undefined;
    const db = getDb();
    if (!db) return undefined;
    let unsub = null;
    setLoadingRemote(true);
    (async () => {
      try {
        const { collection, limit, onSnapshot, orderBy, query, where } = await import('firebase/firestore');
        const q = query(
          collection(db, 'adminMessages'),
          where('channelId', '==', effectiveChannelId),
          orderBy('createdAt', 'asc'),
          limit(200)
        );
        unsub = onSnapshot(
          q,
          (snap) => {
            const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setMessages(rows);
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
  }, [effectiveChannelId]);

  // mark read when messages change
  useEffect(() => {
    const last = messages.length ? messages[messages.length - 1]?.createdAt : '';
    if (!last) return;
    setReadState((prev) => ({
      ...(prev || {}),
      [actor.label]: { ...(prev?.[actor.label] || {}), [effectiveChannelId]: last },
    }));
  }, [messages, actor.label, effectiveChannelId]);

  useEffect(() => {
    // keep scrolled to bottom
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const prettyFile = (m) => {
    const name = String(m?.fileName || 'file');
    const mime = String(m?.fileMime || '');
    const isImg = mime.startsWith('image/');
    return { name, mime, isImg };
  };

  const send = async () => {
    const clean = String(text || '').trim();
    if (!clean && !attachment) return;
    if (!effectiveChannelId) {
      window.alert('Select a contact first.');
      return;
    }
    const row = {
      id: uid(),
      channelId: effectiveChannelId,
      text: clean,
      createdAt: new Date().toISOString(),
      actor: actor.label,
      actorUid: actor.uid || '',
      actorEmail: actor.email || '',
      type: attachment ? 'file' : 'text',
      fileName: attachment?.name || '',
      fileMime: attachment?.mime || '',
      fileSize: attachment?.size || 0,
      fileDataUrl: attachment?.dataUrl || '',
    };
    setText('');
    setAttachment(null);

    // optimistic insert for local mode; Firestore will rehydrate for Firebase
    if (!isFirebaseConfigured()) setMessages((prev) => [...prev, row]);

    addAudit({
      action: attachment ? 'message_file_sent' : 'message_sent',
      entityType: 'message',
      entityId: row.id,
      details: `Sent message in ${effectiveChannelId}`,
    });

    if (isFirebaseConfigured()) {
      try {
        const db = getDb();
        if (db) {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'adminMessages', row.id), omitUndefinedDeep(row), { merge: true });
        }
      } catch {
        // ignore
      }
    }
  };

  const unreadCount = useMemo(() => {
    if (!myRead) return messages.length;
    return messages.filter((m) => String(m.createdAt || '') > String(myRead)).length;
  }, [messages, myRead]);

  const filteredMessages = useMemo(
    () => messages.filter((m) => m.channelId === effectiveChannelId),
    [messages, effectiveChannelId]
  );

  const dmContacts = useMemo(() => {
    const me = String(actor.email || '').toLowerCase();
    return contacts
      .filter((c) => String(c.email || '').toLowerCase() !== me)
      .sort((a, b) => String(a.displayName || a.email).localeCompare(String(b.displayName || b.email)));
  }, [contacts, actor.email]);

  const recentChats = useMemo(() => {
    try {
      const byEmail = {};
      (contacts || []).forEach((c) => {
        const k = String(c.email || '').toLowerCase();
        if (!k) return;
        byEmail[k] = c.displayName || c.email;
      });
      const lastRead = readState?.[actor.label] || {};
      const byChannel = {};
      (Array.isArray(messages) ? messages : []).forEach((m) => {
        const ch = String(m?.channelId || '');
        if (!ch.startsWith('dm:')) return;
        if (!meKey || !ch.includes(meKey)) return;
        const createdAt = String(m?.createdAt || '');
        const prev = byChannel[ch];
        if (!prev || String(prev.createdAt || '') < createdAt) byChannel[ch] = m;
      });

      const rows = Object.values(byChannel).map((last) => {
        const ch = String(last.channelId || '');
        const parts = ch.slice(3).split('|').map((s) => s.trim());
        const other = parts.find((p) => p && p !== meKey) || parts[0] || '';
        const unread = (Array.isArray(messages) ? messages : []).filter((m) => {
          if (m?.channelId !== ch) return false;
          return String(m?.createdAt || '') > String(lastRead?.[ch] || '');
        }).length;
        return {
          channelId: ch,
          other,
          name: byEmail[other] || other,
          lastAt: last.createdAt || '',
          lastText: last.type === 'file' ? `📎 ${last.fileName || 'Attachment'}` : (last.text || ''),
          unread,
        };
      });
      return rows.sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt))).slice(0, 10);
    } catch {
      return [];
    }
  }, [actor.label, contacts, messages, meKey, readState]);

  const formatChatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const selectedDisplayName = useMemo(() => {
    if (!selectedDm) return '';
    const key = String(selectedDm).toLowerCase();
    const fromContact = dmContacts.find((c) => String(c.email || '').toLowerCase() === key);
    if (fromContact?.displayName) return fromContact.displayName;
    const fromRecent = recentChats.find((c) => String(c.other || '').toLowerCase() === key);
    if (fromRecent?.name) return fromRecent.name;
    return selectedDm;
  }, [selectedDm, dmContacts, recentChats]);

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                    style={{ width: 40, height: 40 }}
                  >
                    <img src={brandLogoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">LUNA chat</p>
                    <p className="text-xs font-semibold text-gray-500">Signed in as {actor.label}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-gray-700">
                  {unreadCount ? `Unread ${unreadCount}` : 'Up to date'}
                </div>
              </div>

              <>
                <p className="mt-4 text-[10px] font-extrabold uppercase tracking-wide text-gray-500">Chats</p>
                <div className="mt-3 space-y-2">
                  {recentChats.map((c) => {
                    const active = String(selectedDm || '').toLowerCase() === String(c.other || '').toLowerCase();
                    return (
                      <button
                        key={c.channelId}
                        type="button"
                        className={`w-full rounded-xl border px-3 py-3 text-left ${
                          active ? 'border-pink-200 bg-white' : 'border-gray-100 bg-white'
                        }`}
                        onClick={() => setSelectedDm(c.other)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-gray-900">{c.name || c.other}</p>
                            <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">{c.lastText || '—'}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <div className="text-[11px] font-extrabold text-gray-500">{formatChatTime(c.lastAt)}</div>
                            {c.unread ? (
                              <div className="h-5 min-w-5 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-2 text-[11px] font-extrabold text-white flex items-center justify-center">
                                {Math.min(99, c.unread)}
                              </div>
                            ) : (
                              <div className="h-9 w-9 rounded-xl border border-gray-100 bg-gray-50 text-sm font-extrabold text-gray-700 flex items-center justify-center">
                                {initials(c.name || c.other)}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {recentChats.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
                      No conversations yet.
                    </div>
                  ) : null}
                </div>

                <p className="mt-4 text-[10px] font-extrabold uppercase tracking-wide text-gray-500">Contacts</p>
                <div className="mt-3 space-y-2">
                  {dmContacts.map((c) => {
                    const active = String(selectedDm || '').toLowerCase() === String(c.email || '').toLowerCase();
                    return (
                      <button
                        key={c.email}
                        type="button"
                        className={`w-full rounded-xl border px-3 py-3 text-left ${
                          active ? 'border-pink-200 bg-white' : 'border-gray-100 bg-white'
                        }`}
                        onClick={() => setSelectedDm(c.email)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-gray-900">{c.displayName || c.email}</p>
                            <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">
                              {c.role || 'member'} · {c.email}
                            </p>
                          </div>
                          <div className="h-9 w-9 shrink-0 rounded-xl border border-gray-100 bg-gray-50 text-sm font-extrabold text-gray-700 flex items-center justify-center">
                            {initials(c.displayName || c.email)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {dmContacts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-500">
                      No team members available yet.
                    </div>
                  ) : null}
                </div>
              </>
            </div>

            <div className="flex min-h-[min(70vh,560px)] flex-col rounded-2xl border border-gray-100 bg-white">
              {!selectedDm ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="max-w-sm rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-8 py-10">
                    <p className="text-sm font-extrabold text-gray-900">Select a chat or contact</p>
                    <p className="mt-2 text-xs font-semibold text-gray-500">Open a name on the left to start messaging.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">{selectedDisplayName}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-gray-500" title={String(selectedDm)}>
                        {String(selectedDm)}
                      </p>
                    </div>
                    {loadingRemote ? <span className="text-xs font-semibold text-gray-500">Loading…</span> : null}
                  </div>

                  <div ref={listRef} className="min-h-0 max-h-[520px] flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
                    <div className="space-y-3">
                      {filteredMessages.map((m) => {
                        const mine = m.actor === actor.label;
                        const fileMeta = m.type === 'file' ? prettyFile(m) : null;
                        return (
                          <div key={m.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                            {!mine ? (
                              <div className="h-9 w-9 shrink-0 rounded-xl border border-gray-100 bg-white text-sm font-extrabold text-gray-700 flex items-center justify-center">
                                {initials(m.actor)}
                              </div>
                            ) : null}
                            <div
                              className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                mine ? 'bg-white border border-pink-100' : 'bg-white border border-gray-100'
                              }`}
                              style={mine ? { borderTopRightRadius: 8 } : { borderTopLeftRadius: 8 }}
                            >
                              <div className="flex items-baseline justify-between gap-3">
                                <span className="text-[11px] font-extrabold uppercase tracking-wide text-gray-500">
                                  {mine ? 'You' : m.actor || 'User'}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-400">{formatAt(m.createdAt)}</span>
                              </div>
                              {m.type === 'file' ? (
                                <div className="mt-2">
                                  {fileMeta?.isImg && m.fileDataUrl ? (
                                    <a href={m.fileDataUrl} target="_blank" rel="noreferrer" className="block">
                                      <img
                                        src={m.fileDataUrl}
                                        alt={m.fileName || 'Attachment'}
                                        className="max-h-[260px] w-full rounded-xl border border-gray-100 object-contain bg-white"
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      href={m.fileDataUrl}
                                      download={m.fileName || 'attachment'}
                                      className="mt-2 block rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-extrabold text-gray-900 hover:border-pink-200"
                                    >
                                      {m.fileName || 'Attachment'}
                                      <span className="ml-2 text-xs font-semibold text-gray-500">{m.fileMime || ''}</span>
                                    </a>
                                  )}
                                  {m.text ? <div className="mt-2 whitespace-pre-wrap text-gray-800">{m.text}</div> : null}
                                </div>
                              ) : (
                                <div className="mt-1 whitespace-pre-wrap text-gray-800">{m.text}</div>
                              )}
                            </div>
                            {mine ? (
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white flex items-center justify-center">
                                <img src={brandLogoUrl} alt="" className="h-7 w-7 object-contain" />
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                      {filteredMessages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-gray-500">
                          No messages yet. Say hello below.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 px-4 py-4">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={onPickFile}
                    />
                    <div className="admin-chatbar">
                      <div className="admin-chatbar__composer" aria-label="Message composer">
                        <button type="button" className="admin-chatbar__icon" onClick={pickFile} aria-label="Attach file">
                          <Paperclip size={18} aria-hidden />
                        </button>
                        <input
                          className="admin-chatbar__input"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Type a message…"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              send();
                            }
                          }}
                        />
                      </div>
                      <button type="button" className="admin-chatbar__send" onClick={send} aria-label="Send message">
                        <Send size={18} aria-hidden />
                      </button>
                    </div>
                    {attachment ? (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <div className="truncate font-extrabold text-gray-900">Attached: {attachment.name}</div>
                          <div className="text-xs font-semibold text-gray-500">{Math.round((attachment.size || 0) / 1024)} KB</div>
                        </div>
                        <button type="button" className="admin-panel__btn admin-panel__btn--outline rounded-xl px-4 py-2" onClick={() => setAttachment(null)}>
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

