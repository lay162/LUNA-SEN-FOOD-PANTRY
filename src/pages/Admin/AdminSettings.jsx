import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBranding, resolveBrandLogoUrl } from '../../context/BrandingContext';
import {
  deleteAllowlistEntry,
  getAllowlistEntries,
  upsertAllowlistEntry,
} from './utils/adminAuth';

const AdminSettings = () => {
  const { logoUrl, logoUrlOverride, setLogoUrl, resetLogo } = useBranding();
  const [logoDraft, setLogoDraft] = useState('');

  useEffect(() => {
    setLogoDraft(logoUrlOverride || '');
  }, [logoUrlOverride]);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [newUser, setNewUser] = useState({ displayName: '', role: 'staff', email: '', active: true });
  const [saveError, setSaveError] = useState('');
  const [brandUploadLabel, setBrandUploadLabel] = useState('No file chosen');

  const [users, setUsers] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getAllowlistEntries();
        if (alive) setUsers(rows);
      } catch {
        if (alive) setUsers([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const exportAuditJson = () => {
    const raw = localStorage.getItem('luna-admin-audit-v1') || '[]';
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-panel__fade-in admin-panel__page mx-auto w-full max-w-3xl">
      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="min-w-0 text-center">
            <h2 className="admin-panel__referrals-title">Admin settings</h2>
            <p className="admin-panel__referrals-lede mt-2">
              Preferences for this browser session. Referral actions and finance entries are logged for audit (
              <Link
                to="/admin/audit"
                className="font-bold text-[color:var(--luna-pink)] transition hover:opacity-80"
              >
                view funds &amp; audit
              </Link>
              ). Cloud backup can be added with Firebase later.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title mb-2">Branding &amp; logo</h2>
          <div className="admin-panel__settings-branding">
            <p className="admin-panel__settings-branding-lede">
              Founder-only: the logo updates the staff panel, public navbar, footer, and hero. Use a file in your{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">public</code> folder (e.g.{' '}
              <strong>PANTRY-LOGO.png</strong>), a full <strong>https://</strong> image URL, or a small upload (stored
              in this browser only).
            </p>

            <div className="admin-panel__settings-logo-preview" aria-label="Logo preview">
              <img
                src={resolveBrandLogoUrl(logoDraft.trim() || null)}
                alt="Branding logo preview"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div
              className="admin-panel__settings-branding-file-block"
              role="group"
              aria-labelledby="brand-logo-upload-heading"
            >
              <div className="admin-panel__funds-form-label" id="brand-logo-upload-heading">
                Or upload (small images only)
              </div>
              <div className="admin-panel__settings-branding-file-wrap">
                <label className="admin-panel__settings-branding-file-trigger">
                  <span className="admin-panel__settings-branding-file-trigger__text">Choose file</span>
                  <input
                    id="brand-logo-file"
                    type="file"
                    accept="image/*"
                    className="admin-panel__settings-branding-file-native"
                    aria-describedby="brand-logo-file-status"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 450 * 1024) {
                        window.alert(
                          'That file is too large for browser storage. Add it to the public folder and type the filename above instead.'
                        );
                        e.target.value = '';
                        return;
                      }
                      setBrandUploadLabel(f.name);
                      const reader = new FileReader();
                      reader.onload = () => setLogoDraft(String(reader.result || ''));
                      reader.readAsDataURL(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              <p id="brand-logo-file-status" className="admin-panel__settings-branding-file-status">
                {brandUploadLabel}
              </p>
            </div>

            <div className="admin-panel__settings-branding-fields space-y-4">
              <div className="admin-panel__settings-branding-url">
                <label className="admin-panel__funds-form-label" htmlFor="brand-logo-url">
                  Logo path or URL
                </label>
                <input
                  id="brand-logo-url"
                  className="admin-panel__input"
                  value={logoDraft}
                  onChange={(e) => {
                    setLogoDraft(e.target.value);
                    setBrandUploadLabel('No file chosen');
                  }}
                  placeholder="e.g. PANTRY-LOGO.png or https://…"
                />
                <p className="mt-1 text-xs font-medium text-gray-500">
                  Leave empty and use &quot;Reset to default&quot; to restore the site logo.
                </p>
              </div>
            </div>

            <div className="admin-panel__settings-actions">
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--accent-pink"
                onClick={() => setLogoUrl(logoDraft.trim() || null)}
              >
                Save branding
              </button>
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--accent-blue"
                onClick={() => {
                  resetLogo();
                  setLogoDraft('');
                  setBrandUploadLabel('No file chosen');
                }}
              >
                Reset to default
              </button>
            </div>

            <p className="admin-panel__settings-meta text-xs text-gray-500">
              Current resolved URL:{' '}
              <span className="font-mono text-[11px] text-gray-700">{logoUrl}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title mb-2">Notifications</h2>
          <p className="text-sm text-gray-600">Choose what you want highlighted on the dashboard.</p>
          <div className="admin-panel__settings-toggles">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
              <span className="text-sm font-semibold text-gray-800">Referral &amp; urgent alerts</span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
              <span className="text-sm font-semibold text-gray-800">Low stock warnings</span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title mb-2">Staff access</h2>
          <p className="text-sm text-gray-600">
            Add staff/volunteer logins with restricted access (no funds/audit). This creates an allowlist entry so
            the team member can set their password and sign in.
          </p>

          <form
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSaveError('');
              (async () => {
                try {
                  await upsertAllowlistEntry(newUser);
                  const rows = await getAllowlistEntries();
                  setUsers(rows);
                  setNewUser({ displayName: '', role: 'staff', email: '', active: true });
                } catch (err) {
                  setSaveError(err.message || 'Could not save user');
                }
              })();
            }}
          >
            <div className="sm:col-span-1">
              <label className="admin-panel__label" htmlFor="staff-name">
                Display name
              </label>
              <input
                id="staff-name"
                className="admin-panel__input"
                value={newUser.displayName}
                onChange={(e) => setNewUser((p) => ({ ...p, displayName: e.target.value }))}
                placeholder="e.g. Emma Thompson"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="admin-panel__label" htmlFor="staff-role">
                Role
              </label>
              <select
                id="staff-role"
                className="admin-panel__input"
                value={newUser.role}
                onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="staff">Staff (restricted)</option>
                <option value="volunteer">Volunteer (restricted)</option>
                <option value="driver">Driver (restricted)</option>
                <option value="founder">Founder (full access)</option>
              </select>
            </div>
            <div className="sm:col-span-1">
              <label className="admin-panel__label" htmlFor="staff-email">
                Email (sign-in)
              </label>
              <input
                id="staff-email"
                className="admin-panel__input"
                value={newUser.email}
                onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                placeholder="e.g. emma@yourdomain.org"
              />
            </div>
            <label className="sm:col-span-1 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
              <span className="text-sm font-semibold text-gray-800">Active access</span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                checked={newUser.active}
                onChange={(e) => setNewUser((p) => ({ ...p, active: e.target.checked }))}
              />
            </label>
            <div className="admin-panel__staff-access-submit-row">
              <button type="submit" className="admin-panel__btn admin-panel__btn--primary min-w-[14rem]">
                Save &amp; allow access
              </button>
            </div>
          </form>

          {saveError ? <p className="mt-3 text-sm font-semibold text-red-600">{saveError}</p> : null}

          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-3">
              <p className="text-xs font-extrabold uppercase tracking-wide text-gray-500">Accounts</p>
              <p className="text-xs font-semibold text-gray-500">
                Invite method: copy/paste link (no fees)
              </p>
            </div>
            <ul className="divide-y divide-gray-100">
              {users.map((u) => (
                <li key={u.email || u.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">
                      {u.displayName || u.email}{' '}
                      <span className="text-sm font-semibold text-gray-500">({u.email})</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Role: <span className="font-semibold">{u.role}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Status:{' '}
                      <span className={`font-semibold ${u.active === false ? 'text-red-600' : 'text-green-700'}`}>
                        {u.active === false ? 'disabled' : 'active'}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="admin-panel__btn admin-panel__btn--secondary rounded-lg px-4 py-2 text-xs font-bold uppercase"
                      onClick={async () => {
                        const origin = window.location.origin;
                        const url = `${origin}/admin?tab=staff&email=${encodeURIComponent(u.email)}`;
                        const msg = [
                          'LUNA SEN Pantry — Staff Portal Access',
                          '',
                          `Hi ${u.displayName || ''}${u.displayName ? ',' : ''}`,
                          '',
                          'You have been granted access to the LUNA staff portal.',
                          '',
                          `1) Open: ${url}`,
                          '2) Select: Staff / volunteer',
                          '3) Enter your email and choose a password using “Create account”.',
                          '',
                          'If you already created your password, use “Sign in”.',
                          '',
                          '— LUNA SEN Pantry',
                        ].join('\n');
                        try {
                          await navigator.clipboard.writeText(msg);
                          window.alert('Invite message copied. You can paste into WhatsApp/SMS/email.');
                        } catch {
                          window.prompt('Copy this invite message:', msg);
                        }
                      }}
                    >
                      Copy invite
                    </button>
                    <button
                      type="button"
                      className="admin-panel__btn admin-panel__btn--outline rounded-lg px-4 py-2 text-xs font-bold uppercase"
                      onClick={() =>
                        setNewUser({
                          displayName: u.displayName || '',
                          role: u.role || 'staff',
                          email: u.email || '',
                          active: u.active !== false,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-panel__btn admin-panel__btn--outline rounded-lg px-4 py-2 text-xs font-bold uppercase"
                      onClick={() => {
                        if (!window.confirm(`Remove ${u.email}?`)) return;
                        (async () => {
                          await deleteAllowlistEntry(u.email || u.id);
                          const rows = await getAllowlistEntries();
                          setUsers(rows);
                        })();
                      }}
                      title="Remove user"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title mb-2">Audit export</h2>
          <p className="text-sm text-gray-600">
            Download the local audit log (JSON) for your records. Keep exports secure and in line with your data policy.
          </p>
          <div className="admin-panel__settings-audit-actions">
            <button type="button" className="admin-panel__btn admin-panel__btn--primary" onClick={exportAuditJson}>
              Download audit JSON
            </button>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title mb-2">About this panel</h2>
          <p className="text-sm leading-relaxed text-gray-600 text-center max-w-xl mx-auto">
            LUNA SEN Food Pantry admin tools help you track stock, referrals, and volunteers in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
