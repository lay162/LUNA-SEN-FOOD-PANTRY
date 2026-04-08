import React, { useMemo, useState } from 'react';
import { useAdminOps } from '../../context/AdminOpsContext';
import { getAuthInstance, getDb, isFirebaseConfigured, omitUndefinedDeep } from '../../firebase';
import { getOnCallPolicyIssues, isWeekendDayKey } from './utils/availabilityPolicy';

const LS_TEAM_AVAIL = 'luna-team-availability-v1';

function actorLabel() {
  const auth = getAuthInstance?.();
  const u = auth?.currentUser;
  return u?.email || u?.uid || localStorage.getItem('luna-admin-user') || 'staff';
}

function actorEmail() {
  const auth = getAuthInstance?.();
  return auth?.currentUser?.email || '';
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function localDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(monthDate) {
  const base = new Date(monthDate);
  base.setDate(1);
  base.setHours(0, 0, 0, 0);

  const jsDay = base.getDay(); // Sun=0..Sat=6
  const monIndex = (jsDay + 6) % 7;
  const start = new Date(base);
  start.setDate(base.getDate() - monIndex);

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const key = localDateKey(d);
    days.push({
      key,
      date: d,
      inMonth: d.getMonth() === base.getMonth(),
      label: String(d.getDate()),
    });
  }
  return { monthStart: base, days };
}

function ensureSchedule(schedule, monthGrid) {
  if (schedule && typeof schedule === 'object') return schedule;
  return Object.fromEntries(monthGrid.days.map((d) => [d.key, { am: false, pm: false, onCall: false, hoursNote: '' }]));
}

function downloadIcs({ title, items }) {
  const toIcsDate = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
    );
  };
  const safe = (v) => String(v || '').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LUNA SEN Pantry//Availability//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const it of items) {
    const uidLine = `UID:luna-avail-${uid()}@luna-sen-pantry`;
    lines.push(
      'BEGIN:VEVENT',
      uidLine,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(it.start)}`,
      `DTEND:${toIcsDate(it.end)}`,
      `SUMMARY:${safe(it.summary || title)}`,
      it.description ? `DESCRIPTION:${safe(it.description)}` : '',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.filter(Boolean).join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `luna-availability-${new Date().toISOString().slice(0, 10)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MyAvailability() {
  const { addAudit } = useAdminOps();
  const actor = useMemo(() => actorLabel(), []);
  const email = useMemo(() => actorEmail(), []);

  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const monthGrid = useMemo(() => buildMonthGrid(month), [month]);

  const lsKey = `luna-my-availability-v1:${actor}`;
  const [savedSchedule, setSavedSchedule] = useState(() => {
    try {
      const raw = localStorage.getItem(lsKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [draftSchedule, setDraftSchedule] = useState(() => {
    try {
      const raw = localStorage.getItem(lsKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const effectiveSchedule = useMemo(() => ensureSchedule(draftSchedule, monthGrid), [draftSchedule, monthGrid]);

  const isDirty = useMemo(() => {
    const a = JSON.stringify(draftSchedule || {});
    const b = JSON.stringify(savedSchedule || {});
    return a !== b;
  }, [draftSchedule, savedSchedule]);

  const monthLabel = monthGrid.monthStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayKey = useMemo(() => localDateKey(new Date()), []);

  const toggle = (dayKey, slotKey) => {
    setDraftSchedule((prev) => {
      const base = ensureSchedule(prev, monthGrid);
      const next = { ...base };
      const day = { ...(next[dayKey] || { am: false, pm: false, onCall: false, hoursNote: '' }) };
      if (slotKey === 'onCall') {
        const turningOn = !day.onCall;
        day.onCall = turningOn;
        if (turningOn) {
          day.am = true;
          day.pm = true;
        }
      } else {
        day[slotKey] = !day[slotKey];
      }
      next[dayKey] = day;
      return next;
    });
  };

  const setNote = (dayKey, value) => {
    setDraftSchedule((prev) => {
      const base = ensureSchedule(prev, monthGrid);
      const next = { ...base };
      const day = { ...(next[dayKey] || { am: false, pm: false, onCall: false, hoursNote: '' }) };
      day.hoursNote = String(value || '').slice(0, 80);
      next[dayKey] = day;
      return next;
    });
  };

  const save = () => {
    const next = ensureSchedule(draftSchedule, monthGrid);
    const { violations, weekendWithoutNote } = getOnCallPolicyIssues(next, monthGrid.days);
    if (violations.length) {
      const lines = violations.map((v) => `• ${v.label}: tick both AM and PM for on-call (12h minimum daytime).`);
      window.alert(
        [`On-call needs both AM and PM for each day it is switched on (${violations.length} day(s) to fix):`, '', ...lines].join('\n')
      );
      return;
    }
    if (
      weekendWithoutNote.length &&
      !window.confirm(
        `Weekend on-call: you have ${weekendWithoutNote.length} weekend day(s) without a short note in Hours.\n` +
          `Overnight / emergency cover usually deserves longer windows — add times in Hours when you can.\n\n` +
          `Save anyway?`
      )
    ) {
      return;
    }
    localStorage.setItem(lsKey, JSON.stringify(next));
    setSavedSchedule(next);
    addAudit({
      action: 'availability_saved',
      entityType: 'availability',
      entityId: actor,
      details: `Saved monthly availability (${monthLabel})`,
    });

    // Local team aggregate (dev mode / fallback) so admin can view all members on one device.
    try {
      const raw = localStorage.getItem(LS_TEAM_AVAIL);
      const parsed = raw ? JSON.parse(raw) : {};
      const key = String(email || actor).toLowerCase();
      const merged = {
        ...(parsed || {}),
        [key]: { email: email || '', actor, updatedAt: new Date().toISOString(), schedule: next },
      };
      localStorage.setItem(LS_TEAM_AVAIL, JSON.stringify(merged));
    } catch {
      // ignore
    }

    // Firebase (real multi-user): write to availabilitySchedules/{uid}
    if (isFirebaseConfigured()) {
      (async () => {
        try {
          const auth = getAuthInstance?.();
          const u = auth?.currentUser;
          const db = getDb();
          if (!u || !db) return;
          const { doc, setDoc } = await import('firebase/firestore');
          await setDoc(
            doc(db, 'availabilitySchedules', u.uid),
            omitUndefinedDeep({
              uid: u.uid,
              email: u.email || '',
              actor,
              updatedAt: new Date().toISOString(),
              schedule: next,
            }),
            { merge: true }
          );
        } catch {
          // ignore
        }
      })();
    }

    window.alert('Availability saved.');
  };

  const discard = () => {
    if (!window.confirm('Discard unsaved changes?')) return;
    setDraftSchedule(savedSchedule);
  };

  const exportToCalendar = () => {
    const items = [];
    for (const d of monthGrid.days) {
      if (!d.inMonth) continue;
      const row = effectiveSchedule[d.key] || { am: false, pm: false, onCall: false, hoursNote: '' };
      const note = row.hoursNote ? `Note: ${row.hoursNote}` : '';
      if (row.am) {
        const start = new Date(`${d.key}T09:00:00`);
        const end = new Date(`${d.key}T12:00:00`);
        items.push({ start, end, summary: 'LUNA SEN Pantry — Available (AM)', description: note });
      }
      if (row.pm) {
        const start = new Date(`${d.key}T13:00:00`);
        const end = new Date(`${d.key}T17:00:00`);
        items.push({ start, end, summary: 'LUNA SEN Pantry — Available (PM)', description: note });
      }
      if (row.onCall) {
        const start = new Date(`${d.key}T00:00:00`);
        const end = new Date(`${d.key}T23:59:00`);
        const we = isWeekendDayKey(d.key);
        const policyBits = [
          note,
          'Daytime minimum: AM + PM (12h band). Full on-call still means you can be reached for emergencies overnight.',
          we ? 'Weekend / Sat–Sun: note any evening or overnight cover in Hours (coordinators often need longer windows).' : '',
        ].filter(Boolean);
        items.push({
          start,
          end,
          summary: 'LUNA SEN Pantry — On-call',
          description: policyBits.join(' '),
        });
      }
    }
    if (!items.length) {
      window.alert('No availability set for this month yet.');
      return;
    }
    downloadIcs({ title: 'LUNA availability', items });
    addAudit({
      action: 'availability_calendar_exported',
      entityType: 'availability',
      entityId: actor,
      details: `Exported availability to .ics for ${monthLabel} (${items.length} events)`,
    });
  };

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--accent-pink admin-panel__card--shadow">
        <div className="admin-panel__card-pad">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="admin-panel__rota-hero-body">
              <h1 className="admin-panel__page-title w-full text-2xl md:text-3xl">My rota</h1>
              <p className="mt-2 text-sm text-gray-600">
                Mark your monthly availability (AM / PM / On‑call) then press <span className="font-bold">Save &amp; update</span>.
              </p>
              <p className="admin-panel__rota-hero-callout mt-3 rounded-xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-xs font-semibold leading-relaxed text-gray-700">
                <span className="font-extrabold text-violet-900">On-call</span> means you remain reachable for urgent calls, referrals, and coordination (including nights and weekends when needed).{' '}
                <span className="font-extrabold">Minimum daytime commitment</span> here is{' '}
                <span className="font-extrabold">both AM and PM</span> ticked for that day (12 hours across the day band). Turning on OC automatically selects AM+PM.{' '}
                <span className="font-extrabold">Evenings and weekends</span> usually need a bit more — use the Hours field for late cover or overnight windows (coordinators may prioritise longer weekend / night cover).
              </p>
              {isDirty ? (
                <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-rose-700">Unsaved changes</p>
              ) : (
                <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-emerald-700">Saved</p>
              )}
            </div>
            <div className="admin-panel__rota-card-actions">
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--accent-pink rounded-xl px-6 py-3"
                onClick={discard}
                disabled={!isDirty}
              >
                Discard
              </button>
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--primary rounded-xl px-6 py-3"
                onClick={save}
                disabled={!isDirty}
              >
                Save &amp; update
              </button>
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--accent-blue rounded-xl px-6 py-3"
                onClick={exportToCalendar}
              >
                Add to device calendar (.ics)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad">
          <div className="admin-cal">
            <div className="admin-cal__head">
              <div className="admin-cal__head-spacer" aria-hidden />
              <div className="admin-cal__month-block">
                <div className="admin-cal__month">Monthly calendar</div>
                <div className="admin-cal__month-sub">{monthLabel}</div>
              </div>
              <div className="admin-cal__head-actions flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="admin-panel__btn admin-panel__btn--outline rounded-lg px-3 py-2 text-xs font-extrabold uppercase tracking-wide"
                  onClick={() => {
                    const prev = new Date(month);
                    prev.setMonth(prev.getMonth() - 1);
                    prev.setDate(1);
                    setMonth(prev);
                  }}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="admin-panel__btn admin-panel__btn--outline rounded-lg px-3 py-2 text-xs font-extrabold uppercase tracking-wide"
                  onClick={() => {
                    const now = new Date();
                    now.setDate(1);
                    now.setHours(0, 0, 0, 0);
                    setMonth(now);
                  }}
                >
                  This month
                </button>
                <button
                  type="button"
                  className="admin-panel__btn admin-panel__btn--outline rounded-lg px-3 py-2 text-xs font-extrabold uppercase tracking-wide"
                  onClick={() => {
                    const nxt = new Date(month);
                    nxt.setMonth(nxt.getMonth() + 1);
                    nxt.setDate(1);
                    setMonth(nxt);
                  }}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="admin-cal__legend">
              <span className="admin-cal__legend-pill">
                <span className="admin-cal__dot" style={{ background: '#22c55e' }} aria-hidden />
                Available (AM/PM)
              </span>
              <span className="admin-cal__legend-pill">
                <span className="admin-cal__dot" style={{ background: '#ef4444' }} aria-hidden />
                Not available (AM/PM)
              </span>
              <span
                className="admin-cal__legend-pill"
                title="Reachable for emergencies; AM+PM required for 12h daytime minimum; note longer weekend/night cover in Hours"
              >
                <span className="admin-cal__dot" style={{ background: '#a855f7' }} aria-hidden />
                On-call (12h+ / extended)
              </span>
              <span className="admin-cal__legend-pill">
                <span className="admin-cal__dot" style={{ background: '#94a3b8' }} aria-hidden />
                Off month
              </span>
            </div>

            <div className="admin-cal__grid" style={{ marginTop: '0.75rem' }}>
              {weekDays.map((w) => (
                <div key={w} className="admin-cal__dow">
                  {w}
                </div>
              ))}
            </div>

            <div className="admin-cal__grid">
              {monthGrid.days.map((d) => {
                const row = effectiveSchedule[d.key] || { am: false, pm: false, onCall: false, hoursNote: '' };
                return (
                  <div
                    key={d.key}
                    className={`admin-cal__cell ${d.inMonth ? '' : 'admin-cal__cell--out'} ${
                      d.key === todayKey ? 'admin-cal__cell--today' : ''
                    }`}
                  >
                    <div className="admin-cal__cell-top">
                      <div className="admin-cal__day">{d.label}</div>
                      <div className="admin-cal__date">{d.key.slice(5)}</div>
                    </div>
                    <div className="admin-cal__slots">
                      <div
                        role="button"
                        tabIndex={0}
                        className={`admin-cal__slot ${row.am ? 'admin-cal__slot--am-on' : 'admin-cal__slot--am-off'}`}
                        onClick={() => toggle(d.key, 'am')}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggle(d.key, 'am') : null)}
                        aria-label={`Toggle AM ${d.key}`}
                      >
                        AM
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        className={`admin-cal__slot ${row.pm ? 'admin-cal__slot--pm-on' : 'admin-cal__slot--pm-off'}`}
                        onClick={() => toggle(d.key, 'pm')}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggle(d.key, 'pm') : null)}
                        aria-label={`Toggle PM ${d.key}`}
                      >
                        PM
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        className={`admin-cal__slot ${row.onCall ? 'admin-cal__slot--oc-on' : 'admin-cal__slot--oc-off'}`}
                        onClick={() => toggle(d.key, 'onCall')}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggle(d.key, 'onCall') : null)}
                        aria-label={`Toggle on-call ${d.key}`}
                      >
                        OC
                      </div>
                    </div>
                    <input
                      className="admin-cal__note"
                      placeholder="Hours (e.g. until 22:00 / overnight)"
                      maxLength={80}
                      value={row.hoursNote || ''}
                      onChange={(e) => setNote(d.key, e.target.value)}
                      aria-label={`Hours note ${d.key}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="admin-cal__footer-tip">
              <p className="admin-cal__footer-tip-text">
                Tip: click <span className="font-bold text-gray-600">AM</span> / <span className="font-bold text-gray-600">PM</span> /{' '}
                <span className="font-bold text-gray-600">OC</span> on each day to toggle. Use{' '}
                <span className="font-bold text-gray-800">Add to device calendar (.ics)</span> in the pink card above to export this month for
                Google or Apple Calendar (opens a file you can import in your calendar app).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

