import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, NavLink, useLocation, Link, Navigate } from 'react-router-dom';
import {
  ClipboardList,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  CalendarDays,
  MessageSquareText,
  Package,
  Settings,
  Truck,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import Button from '../../components/Button';
import { AdminOpsProvider } from '../../context/AdminOpsContext';
import AdminDashboard from './AdminDashboard';
import StockManagement from './StockManagement';
import ReferralManagement from './ReferralManagement';
import { VolunteerRecruitmentLayout } from './VolunteerManagement';
import VolunteerRosterPage from './VolunteerRosterPage';
import RecruitmentPage from './RecruitmentPage';
import AdminSettings from './AdminSettings';
import FundsAudit from './FundsAudit';
import Deliveries from './Deliveries';
import Announcements from './Announcements';
import Messages from './Messages';
import MyAvailability from './MyAvailability';
import { getAdminProfile } from './utils/adminProfile';
import { getAllowlistEntries, getCurrentAdminRole, signInAdmin, signOutAdmin, bootstrapAdminUsers, requestPasswordReset } from './utils/adminAuth';
import { useBrandLogoUrl } from '../../context/BrandingContext';
import { getAuthInstance, getDb, isFirebaseConfigured, omitUndefinedDeep } from '../../firebase';

const ADMIN_USER_KEY = 'luna-admin-user';
const ADMIN_SESSION_KEY = 'luna-admin';

function crumbLabel(pathname) {
  if (pathname === '/admin') return 'dashboard';
  if (pathname.startsWith('/admin/referrals')) return 'referrals';
  if (pathname.startsWith('/admin/stock')) return 'stock';
  if (pathname.startsWith('/admin/audit')) return 'funds & audit';
  if (pathname.startsWith('/admin/volunteers')) return 'volunteers';
  if (pathname.startsWith('/admin/recruitment')) return 'recruitment';
  if (pathname.startsWith('/admin/announcements')) return 'announcements';
  if (pathname.startsWith('/admin/availability')) return 'availability';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  return 'admin';
}

const AdminShell = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState('staff');
  const [roleReady, setRoleReady] = useState(false);
  const brandLogoUrl = useBrandLogoUrl();

  const { displayName } = getAdminProfile();
  const [headerBadges, setHeaderBadges] = useState({ msgs: 0, ann: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [chatOpen, setChatOpen] = useState(false);
  const chatRef = useRef(null);
  const [chatContacts, setChatContacts] = useState([]);
  const [chatTo, setChatTo] = useState('');
  const [chatText, setChatText] = useState('');
  const [chatSending, setChatSending] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        const rawMsgs = localStorage.getItem('luna-admin-messages-v1');
        const rawRead = localStorage.getItem('luna-admin-messages-read-v1');
        const msgs = rawMsgs ? JSON.parse(rawMsgs) : [];
        const readState = rawRead ? JSON.parse(rawRead) : {};
        const actorLabel = localStorage.getItem('luna-admin-user') || 'staff';

        const lastRead = readState?.[actorLabel] || {};
        const unreadMsgs = Array.isArray(msgs)
          ? msgs.filter((m) => {
              const ch = m.channelId || '';
              const at = m.createdAt || '';
              const r = lastRead?.[ch] || '';
              return at && (!r || String(at) > String(r));
            }).length
          : 0;

        const rawAnn = localStorage.getItem('luna-admin-announcements-v1');
        const rawAck = localStorage.getItem('luna-admin-announcement-acks-v1');
        const anns = rawAnn ? JSON.parse(rawAnn) : [];
        const acks = rawAck ? JSON.parse(rawAck) : {};
        const myAcks = acks?.[actorLabel] || {};
        const pendingAck = Array.isArray(anns)
          ? anns.filter((a) => a?.requireAck && !myAcks?.[a.id]).length
          : 0;

        setHeaderBadges({ msgs: unreadMsgs, ann: pendingAck });
      } catch {
        setHeaderBadges({ msgs: 0, ann: 0 });
      }
    };

    read();
    const t = window.setInterval(read, 1500);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (!notifOpen) return;
      const el = notifRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setNotifOpen(false);
    };
    const onKey = (e) => {
      if (!notifOpen) return;
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [notifOpen]);

  useEffect(() => {
    const onDown = (e) => {
      if (!chatOpen) return;
      const el = chatRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setChatOpen(false);
    };
    const onKey = (e) => {
      if (!chatOpen) return;
      if (e.key === 'Escape') setChatOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [chatOpen]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getAllowlistEntries();
        if (!alive) return;
        const active = (rows || []).filter((r) => r?.active !== false && r?.email);
        setChatContacts(active);
      } catch {
        if (!alive) return;
        setChatContacts([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const actorLabel = useMemo(() => localStorage.getItem('luna-admin-user') || displayName || 'staff', [displayName]);
  const actorEmailLower = useMemo(() => {
    try {
      const auth = getAuthInstance?.();
      const email = auth?.currentUser?.email || '';
      return String(email || actorLabel || '').toLowerCase();
    } catch {
      return String(actorLabel || '').toLowerCase();
    }
  }, [actorLabel]);

  const chatInbox = useMemo(() => {
    try {
      const rawMsgs = localStorage.getItem('luna-admin-messages-v1');
      const rawRead = localStorage.getItem('luna-admin-messages-read-v1');
      const msgs = rawMsgs ? JSON.parse(rawMsgs) : [];
      const readState = rawRead ? JSON.parse(rawRead) : {};
      const lastRead = readState?.[actorLabel] || {};
      const me = String(actorEmailLower || '').toLowerCase();

      const displayNameByEmail = {};
      chatContacts.forEach((c) => {
        const k = String(c.email || '').toLowerCase();
        displayNameByEmail[k] = c.displayName || c.email;
      });

      const byChannel = {};
      (Array.isArray(msgs) ? msgs : []).forEach((m) => {
        if (!m?.channelId) return;
        if (!String(m.channelId).startsWith('dm:')) return;
        if (!String(m.channelId).includes(me)) return;
        byChannel[m.channelId] = m;
      });

      const items = Object.values(byChannel)
        .map((last) => {
          const ch = last.channelId;
          const parts = String(ch).slice(3).split('|').map((s) => s.trim());
          const other = parts.find((p) => p && p !== me) || parts[0] || '';
          const unread = (Array.isArray(msgs) ? msgs : []).filter((m) => m.channelId === ch && String(m.createdAt || '') > String(lastRead?.[ch] || '')).length;
          return {
            channelId: ch,
            other,
            name: displayNameByEmail[other] || other,
            lastAt: last.createdAt || '',
            lastText: last.text || '',
            unread,
          };
        })
        .sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)));

      return items.slice(0, 8);
    } catch {
      return [];
    }
  }, [actorEmailLower, actorLabel, chatContacts]);

  const initials = (s) => {
    const v = String(s || '').trim();
    if (!v) return 'U';
    const p = v.includes('@') ? v.split('@')[0].split(/[.\s_-]+/) : v.split(/\s+/);
    const a = (p[0] || '').slice(0, 1).toUpperCase();
    const b = (p[1] || '').slice(0, 1).toUpperCase();
    return (a + b) || a || 'U';
  };

  const fmtTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const profanityMatches = (text) => {
    const s = String(text || '').toLowerCase();
    if (!s) return [];
    const banned = [
      'nude',
      'nudes',
      'porn',
      'sex',
      'fuck',
      'fucking',
      'shit',
      'bitch',
      'cunt',
      'dick',
      'pussy',
      'rape',
      'slut',
      'whore',
      'harass',
      'kill yourself',
    ];
    return banned.filter((w) => s.includes(w));
  };

  const quickAudit = (row) => {
    try {
      const key = 'luna-admin-audit-v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const auth = getAuthInstance?.();
      const u = auth?.currentUser;
      const actorEmail = u?.email || '';
      const actorUid = u?.uid || '';
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        at: new Date().toISOString(),
        actor: actorLabel,
        actorUid,
        actorEmail,
        action: row.action,
        entityType: row.entityType || 'message',
        entityId: row.entityId || '',
        details: row.details || '',
      };
      localStorage.setItem(key, JSON.stringify([entry, ...(Array.isArray(existing) ? existing : [])].slice(0, 500)));
    } catch {
      // ignore
    }
  };

  const sendQuickMessage = async () => {
    const clean = String(chatText || '').trim();
    const other = String(chatTo || '').trim().toLowerCase();
    const me = String(actorEmailLower || '').trim().toLowerCase();
    if (!other) {
      window.alert('Choose who you want to message first.');
      return;
    }
    if (!clean) return;
    if (!me) {
      window.alert('Sign in first.');
      return;
    }
    const pair = [me, other].sort().join('|');
    const channelId = `dm:${pair}`;
    const matched = profanityMatches(clean);
    const row = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      channelId,
      text: clean,
      createdAt: new Date().toISOString(),
      actor: actorLabel,
      actorUid: '',
      actorEmail: '',
      type: 'text',
      moderation: matched.length ? { flagged: true, reason: 'profanity', matched } : { flagged: false },
    };

    setChatSending(true);
    setChatText('');

    try {
      const raw = localStorage.getItem('luna-admin-messages-v1');
      const msgs = raw ? JSON.parse(raw) : [];
      const next = [...(Array.isArray(msgs) ? msgs : []), row];
      localStorage.setItem('luna-admin-messages-v1', JSON.stringify(next));

      quickAudit({
        action: 'message_sent',
        entityType: 'message',
        entityId: row.id,
        details: `Sent message in ${channelId}`,
      });
      if (matched.length) {
        quickAudit({
          action: 'message_flagged',
          entityType: 'message',
          entityId: row.id,
          details: `Flagged words: ${matched.join(', ')}`,
        });
        window.alert('This message contains a blocked/unsafe word and was flagged for review.');
      }

      if (isFirebaseConfigured()) {
        const db = getDb();
        if (db) {
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'adminMessages', row.id), omitUndefinedDeep(row), { merge: true });
        }
      }
    } catch {
      // ignore
    } finally {
      setChatSending(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await getCurrentAdminRole();
        if (alive) {
          setRole(r || 'staff');
          setRoleReady(true);
        }
      } catch {
        if (alive) {
          setRole('staff');
          setRoleReady(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const pageCrumb = useMemo(() => crumbLabel(location.pathname), [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (!window.confirm('Sign out of the admin panel?')) return;
    signOutAdmin();
    window.location.assign('/admin');
  };

  const rotaNavLabel = role === 'founder' ? 'My team rota' : 'My rota';

  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/admin/referrals', label: 'Referrals', Icon: ClipboardList },
    { to: '/admin/stock', label: 'Inventory', Icon: Package },
    { to: '/admin/availability', label: rotaNavLabel, Icon: CalendarDays },
    { to: '/admin/announcements', label: 'Announcements', Icon: MessageSquareText },
    { to: '/admin/messages', label: 'Messages', Icon: MessageSquareText },
    ...(role === 'driver' || role === 'staff' || role === 'founder'
      ? [{ to: '/admin/deliveries', label: 'Deliveries', Icon: Truck }]
      : []),
    ...(role === 'founder' ? [{ to: '/admin/audit', label: 'Funds & audit', Icon: Wallet }] : []),
    { to: '/admin/volunteers', label: 'Volunteers', Icon: Users },
    ...(role === 'founder' ? [{ to: '/admin/recruitment', label: 'Recruitment', Icon: UserPlus }] : []),
    ...(role === 'founder' ? [{ to: '/admin/settings', label: 'Admin settings', Icon: Settings }] : []),
  ];

  const renderNav = (onNavigate) => (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => onNavigate?.()}
          className={({ isActive }) =>
            `admin-panel__nav-link ${isActive ? 'admin-panel__nav-link--active' : ''}`
          }
        >
          {React.createElement(item.Icon, { size: 20, 'aria-hidden': true })}
          {item.label}
        </NavLink>
      ))}
      <button type="button" className="admin-panel__nav-link admin-panel__sidebar-logout" onClick={handleLogout}>
        <LogOut size={20} aria-hidden />
        Sign out
      </button>
    </>
  );

  return (
    <AdminOpsProvider>
      <div className="admin-panel-outer">
        <div className="admin-panel">
          <aside className="admin-panel__sidebar" aria-label="Admin navigation">
            <div className="admin-panel__sidebar-brand">
              <div className="admin-panel__sidebar-logo" aria-hidden>
                <img src={brandLogoUrl} alt="" width="48" height="48" decoding="async" />
              </div>
              <span className="admin-panel__brand-lockup">
                <span className="admin-panel__brand-wordmark">LUNA</span>
                <span className="admin-panel__brand-lockup__suffix"> SEN PANTRY ADMIN</span>
              </span>
            </div>
            <nav className="admin-panel__nav">{renderNav(undefined)}</nav>
          </aside>

          {mobileOpen && (
            <button
              type="button"
              className="admin-panel__drawer-overlay"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
          )}
          {mobileOpen && (
            <div className="admin-panel__drawer">
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <span className="font-bold text-gray-900">Menu</span>
                <button
                  type="button"
                  className="admin-panel__mobile-menu-btn"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="admin-panel__nav flex-1">{renderNav(() => setMobileOpen(false))}</nav>
            </div>
          )}

          <div className="admin-panel__main">
            <div className="admin-panel__mobile-bar lg:hidden">
              <button
                type="button"
                className="admin-panel__mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-expanded={mobileOpen}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <div className="admin-panel__mobile-bar-brand" aria-hidden>
                <img src={brandLogoUrl} alt="" width="28" height="28" decoding="async" />
              </div>
              <span className="admin-panel__brand-lockup admin-panel__brand-lockup--compact">
                <span className="admin-panel__brand-wordmark">LUNA</span>
                <span className="admin-panel__brand-lockup__suffix"> SEN PANTRY ADMIN</span>
              </span>
            </div>

            <header className="admin-panel__header">
              <p className="admin-panel__header-crumb">
                Control / <span>{pageCrumb}</span>
              </p>
              <div className="admin-panel__header-user">
                <div className="admin-panel__header-actions" aria-label="Quick actions">
                  <div ref={chatRef} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="admin-panel__icon-btn"
                      aria-label="Open messages"
                      aria-expanded={chatOpen}
                      onClick={() => setChatOpen((v) => !v)}
                    >
                    <MessageSquareText size={18} aria-hidden />
                    {headerBadges.msgs ? <span className="admin-panel__badge-dot">{Math.min(99, headerBadges.msgs)}</span> : null}
                    </button>
                    {chatOpen ? (
                      <div className="admin-panel__popover admin-panel__chat-popover" role="dialog" aria-label="Messages">
                        <div className="admin-panel__popover-head">
                          <div className="admin-panel__popover-title">Messages</div>
                          <NavLink to="/admin/messages" className="admin-panel__notif-link" onClick={() => setChatOpen(false)}>
                            Open inbox
                          </NavLink>
                        </div>
                        <div className="admin-panel__popover-body">
                          <div className="admin-panel__chat-list">
                            {chatInbox.map((c) => (
                              <button
                                key={c.channelId}
                                type="button"
                                className="admin-panel__chat-item"
                                onClick={() => {
                                  // Deep link into Messages with contact selected (fallback to inbox).
                                  const url = `/admin/messages?dm=${encodeURIComponent(c.other)}`;
                                  window.location.assign(url);
                                  setChatOpen(false);
                                }}
                              >
                                <div className="admin-panel__chat-left">
                                  <div className="admin-panel__chat-avatar" aria-hidden>
                                    {initials(c.name)}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div className="admin-panel__chat-name">{c.name}</div>
                                    <div className="admin-panel__chat-preview">{c.lastText || '—'}</div>
                                  </div>
                                </div>
                                <div className="admin-panel__chat-meta">
                                  <div className="admin-panel__chat-time">{fmtTime(c.lastAt)}</div>
                                  {c.unread ? <div className="admin-panel__chat-unread">{Math.min(99, c.unread)}</div> : null}
                                </div>
                              </button>
                            ))}
                            {chatInbox.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-500">
                                No messages yet. Start a new chat below.
                              </div>
                            ) : null}
                          </div>

                          <div className="admin-panel__hr" />
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="admin-panel__notif-label">New message</div>
                              <div className="admin-panel__notif-sub">Choose a member and send</div>
                            </div>
                          </div>

                          {chatContacts.filter((c) => String(c.email || '').toLowerCase() !== actorEmailLower).length ? (
                            <div className="mt-2 grid gap-2">
                              <select
                                className="admin-panel__input"
                                value={chatTo}
                                onChange={(e) => setChatTo(e.target.value)}
                                aria-label="Choose member"
                              >
                                <option value="">Choose a member…</option>
                                {chatContacts
                                  .filter((c) => String(c.email || '').toLowerCase() !== actorEmailLower)
                                  .sort((a, b) => String(a.displayName || a.email).localeCompare(String(b.displayName || b.email)))
                                  .map((c) => (
                                    <option key={c.email} value={String(c.email || '').toLowerCase()}>
                                      {c.displayName || c.email} ({c.role || 'member'})
                                    </option>
                                  ))}
                              </select>
                              <input
                                className="admin-panel__input"
                                value={chatText}
                                onChange={(e) => setChatText(e.target.value)}
                                placeholder="Type a message…"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendQuickMessage();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="admin-panel__btn admin-panel__btn--primary"
                                onClick={sendQuickMessage}
                                disabled={chatSending}
                              >
                                {chatSending ? 'Sending…' : 'Send'}
                              </button>
                              <div className="text-xs font-semibold text-gray-500">
                                Safety: messages are logged and unsafe words are flagged.
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
                              No team members found yet. Add them in <span className="font-extrabold">Admin settings</span>.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div ref={notifRef} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="admin-panel__icon-btn"
                      aria-label="Open notifications"
                      aria-expanded={notifOpen}
                      onClick={() => setNotifOpen((v) => !v)}
                    >
                    <Bell size={18} aria-hidden />
                      {(headerBadges.ann || headerBadges.msgs) ? (
                        <span className="admin-panel__badge-dot">{Math.min(99, headerBadges.ann + headerBadges.msgs)}</span>
                      ) : null}
                    </button>
                    {notifOpen ? (
                      <div className="admin-panel__popover" role="dialog" aria-label="Notifications">
                        <div className="admin-panel__popover-head">
                          <div className="admin-panel__popover-title">Notifications</div>
                          <button type="button" className="admin-panel__notif-link" onClick={() => setNotifOpen(false)}>
                            Close
                          </button>
                        </div>
                        <div className="admin-panel__popover-body">
                          <div className="admin-panel__notif-card">
                            <div className="admin-panel__notif-row">
                              <div>
                                <div className="admin-panel__notif-label">Messages</div>
                                <div className="admin-panel__notif-value">{headerBadges.msgs || 0}</div>
                                <div className="admin-panel__notif-sub">Unread chats</div>
                              </div>
                              <NavLink to="/admin/messages" className="admin-panel__notif-link" onClick={() => setNotifOpen(false)}>
                                View
                              </NavLink>
                            </div>
                          </div>

                          <div className="admin-panel__notif-card">
                            <div className="admin-panel__notif-row">
                              <div>
                                <div className="admin-panel__notif-label">Announcements</div>
                                <div className="admin-panel__notif-value">{headerBadges.ann || 0}</div>
                                <div className="admin-panel__notif-sub">Ack required</div>
                              </div>
                              <NavLink to="/admin/announcements" className="admin-panel__notif-link" onClick={() => setNotifOpen(false)}>
                                View
                              </NavLink>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <NavLink
                  to="/admin/settings"
                  className="admin-panel__avatar-ring"
                  aria-label={displayName ? `Open settings (${displayName})` : 'Open settings'}
                >
                  <div
                    className="admin-panel__avatar-inner admin-panel__avatar-inner--logo"
                    aria-hidden
                    title={displayName}
                  >
                    <img src={brandLogoUrl} alt="" width="40" height="40" decoding="async" />
                  </div>
                </NavLink>
              </div>
            </header>

            <div className="admin-panel__scroll">
              {!roleReady ? (
                <div className="admin-panel__fade-in flex min-h-[40vh] items-center justify-center p-8">
                  <p className="text-sm font-semibold text-gray-500">Loading admin…</p>
                </div>
              ) : (
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="referrals" element={<ReferralManagement />} />
                  <Route path="stock" element={<StockManagement />} />
                  <Route path="availability" element={<MyAvailability />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="messages" element={<Messages />} />
                  <Route
                    path="deliveries"
                    element={role === 'driver' || role === 'staff' || role === 'founder' ? <Deliveries /> : <AdminDashboard />}
                  />
                  <Route path="audit" element={role === 'founder' ? <FundsAudit /> : <AdminDashboard />} />
                  <Route element={<VolunteerRecruitmentLayout />}>
                    <Route path="volunteers" element={<VolunteerRosterPage />} />
                    <Route
                      path="recruitment"
                      element={role === 'founder' ? <RecruitmentPage /> : <Navigate to="/admin/volunteers" replace />}
                    />
                  </Route>
                  <Route path="settings" element={role === 'founder' ? <AdminSettings /> : <AdminDashboard />} />
                </Routes>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminOpsProvider>
  );
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('staff'); // staff | admin
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    bootstrapAdminUsers();
    const ok = !!localStorage.getItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(ok);
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const email = params.get('email');
    if (tab === 'admin' || tab === 'staff') setActiveTab(tab);
    if (email) setCredentials((p) => ({ ...p, username: email }));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await signInAdmin(credentials);
    if (!res.ok) {
      window.alert(res.error || 'Invalid credentials');
      return;
    }
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="luna-page">
        <div className="luna-container">
          <div className="flex min-h-64 items-center justify-center">
            <div className="luna-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="luna-container max-w-md">
          <p className="mb-6 text-center">
            <Link to="/" className="text-sm font-semibold text-white/95 drop-shadow transition hover:opacity-90">
              ← Back to site
            </Link>
          </p>
          <div className="admin-login">
            <div className="admin-login__card">
              <h1 className="admin-login__title">LUNA SEN PANTRY</h1>
              <h2 className="admin-login__subtitle">Staff portal sign-in</h2>

              <div className="admin-login__tabs" role="tablist" aria-label="Sign in type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'staff'}
                  className={`admin-login__tab ${activeTab === 'staff' ? 'admin-login__tab--active' : ''}`}
                  onClick={() => setActiveTab('staff')}
                >
                  Staff / volunteer
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'admin'}
                  className={`admin-login__tab ${activeTab === 'admin' ? 'admin-login__tab--active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  Admin sign in
                </button>
              </div>

              <form onSubmit={handleLogin} className="admin-login__form">
                <div className="admin-login__field">
                  <label htmlFor="admin-username">Email</label>
                  <input
                    type="email"
                    id="admin-username"
                    value={credentials.username}
                    onChange={(e) => setCredentials((p) => ({ ...p, username: e.target.value }))}
                    required
                    autoComplete="email"
                    placeholder={activeTab === 'admin' ? 'lauren@...' : 'your.name@...'}
                  />
                </div>
                <div className="admin-login__field">
                  <label htmlFor="admin-password">Password</label>
                  <div className="admin-login__password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="admin-password"
                      value={credentials.password}
                      onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="admin-login__password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="admin-login__aux">
                  <label className="admin-login__remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="admin-login__link"
                    onClick={async () => {
                      const email = credentials.username;
                      const res = await requestPasswordReset(email);
                      if (!res.ok) {
                        window.alert(res.error || 'Could not send reset email');
                        return;
                      }
                      window.alert('Password reset email sent (check your inbox).');
                    }}
                  >
                    Reset password
                  </button>
                </div>

                <Button type="submit" variant="gradient" size="lg" fullWidth>
                  Sign in
                </Button>
              </form>
            </div>
          </div>
        </div>
        <style jsx>{`
          .admin-login-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--luna-space-8) var(--luna-space-4);
            background: var(--luna-gradient-primary);
            box-sizing: border-box;
          }
          .admin-login {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .admin-login__card {
            background: #ffffff;
            padding: var(--luna-space-12);
            border-radius: var(--luna-radius-lg);
            box-shadow: var(--luna-shadow-xl);
            max-width: 400px;
            width: 100%;
            text-align: center;
          }
          .admin-login__title {
            font-size: var(--luna-font-size-2xl);
            font-weight: var(--luna-font-weight-bold);
            background: var(--luna-gradient-primary);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--luna-space-2);
          }
          .admin-login__subtitle {
            color: var(--luna-text-secondary);
            margin-bottom: var(--luna-space-8);
          }
          .admin-login__tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            background: #f7f7fb;
            border: 1px solid var(--luna-grey-200);
            border-radius: 999px;
            padding: 0.35rem;
            margin-bottom: var(--luna-space-8);
          }
          .admin-login__tab {
            border: none;
            background: transparent;
            cursor: pointer;
            padding: 0.65rem 0.75rem;
            border-radius: 999px;
            font-weight: 800;
            font-size: 0.75rem;
            letter-spacing: 0.02em;
            color: var(--luna-grey-600);
          }
          .admin-login__tab--active {
            background: #ffffff;
            color: var(--luna-grey-900);
            box-shadow: 0 6px 20px -12px rgba(0, 0, 0, 0.25);
          }
          .admin-login__form {
            display: flex;
            flex-direction: column;
            gap: var(--luna-space-6);
          }
          .admin-login__aux {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-top: -0.25rem;
          }
          .admin-login__remember {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--luna-grey-700);
            cursor: pointer;
            user-select: none;
          }
          .admin-login__remember input {
            width: 1rem;
            height: 1rem;
            accent-color: var(--luna-pink);
          }
          .admin-login__link {
            border: none;
            background: transparent;
            text-align: right;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--luna-pink-dark);
            cursor: pointer;
            padding: 0;
            margin-top: 0;
          }
          .admin-login__link--left {
            text-align: left;
          }
          .admin-login__link:hover {
            opacity: 0.88;
          }
          .admin-login__field {
            text-align: left;
          }
          .admin-login__field label {
            display: block;
            font-weight: var(--luna-font-weight-medium);
            margin-bottom: var(--luna-space-2);
            color: var(--luna-text-primary);
          }
          .admin-login__field input {
            width: 100%;
            padding: var(--luna-space-3);
            border: 1px solid var(--luna-grey-300);
            border-radius: var(--luna-radius-md);
            font-size: var(--luna-font-size-base);
            transition: border-color var(--luna-transition-fast);
          }
          .admin-login__password-wrap {
            position: relative;
            width: 100%;
          }
          .admin-login__password-wrap input {
            padding-right: 5.25rem;
          }
          .admin-login__password-toggle {
            position: absolute;
            right: 0.6rem;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
            cursor: pointer;
            font-weight: 800;
            font-size: 0.75rem;
            color: var(--luna-grey-700);
            padding: 0.35rem 0.5rem;
            border-radius: 0.6rem;
          }
          .admin-login__password-toggle:hover {
            background: rgba(0, 0, 0, 0.04);
          }
          .admin-login__field input:focus {
            outline: none;
            border-color: var(--luna-primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
        `}</style>
      </div>
    );
  }

  return <AdminShell />;
};

export default Admin;
