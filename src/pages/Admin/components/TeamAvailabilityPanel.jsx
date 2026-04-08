import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDb, isFirebaseConfigured } from '../../../firebase';
import { createVolunteersTeamSeed } from '../data/volunteersTeamSeed';
import { buildNext14Days, computeTeamCoverage } from '../utils/teamAvailabilityUtils';

const LS_TEAM_AVAIL = 'luna-team-availability-v1';

/** Shown only to founders on the dashboard — full-team coverage for hiring and gaps. */
export default function TeamAvailabilityPanel() {
  const [volunteers, setVolunteers] = useState(() => createVolunteersTeamSeed());
  const next14Days = useMemo(() => buildNext14Days(), []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      try {
        const raw = localStorage.getItem(LS_TEAM_AVAIL);
        const parsed = raw ? JSON.parse(raw) : {};
        if (!parsed || typeof parsed !== 'object') return;
        setVolunteers((prev) =>
          prev.map((v) => {
            const key = String(v.email || '').toLowerCase();
            const row = parsed[key];
            if (!row?.schedule) return v;
            return { ...v, availabilitySchedule: row.schedule, availabilityUpdatedAt: row.updatedAt || '' };
          })
        );
      } catch {
        // ignore
      }
      return;
    }

    (async () => {
      try {
        const db = getDb();
        if (!db) return;
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db, 'availabilitySchedules'));
        const byEmail = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          const e = String(data.email || '').toLowerCase();
          if (e) byEmail[e] = data;
        });
        setVolunteers((prev) =>
          prev.map((v) => {
            const hit = byEmail[String(v.email || '').toLowerCase()];
            if (!hit?.schedule) return v;
            return { ...v, availabilitySchedule: hit.schedule, availabilityUpdatedAt: hit.updatedAt || '' };
          })
        );
      } catch {
        // ignore
      }
    })();
  }, []);

  const coverage = useMemo(() => computeTeamCoverage(volunteers, next14Days), [volunteers, next14Days]);

  return (
    <div className="admin-panel__card admin-panel__card--shadow">
      <div className="admin-panel__card-pad">
        <div className="mb-4 w-full text-center">
          <div className="mx-auto w-full max-w-3xl px-1">
            <h2 className="admin-panel__section-title mb-1">Team availability — next 2 weeks</h2>
            <p className="text-center text-sm leading-relaxed text-gray-600">
              At-a-glance on the main dashboard for ops leads. <strong>Active volunteers only</strong> — not pending applications. Daily totals
              for AM, PM, and on-call come from the volunteer list / <strong>My team rota</strong> data. Use this for shift and delivery cover; new applications and onboarding are under{' '}
              <Link to="/admin/recruitment" className="font-semibold text-pink-600 hover:text-pink-700">
                Recruitment
              </Link>
              .
            </p>
            <div className="admin-panel__team-avail-cta">
              <Link
                to="/admin/availability"
                className="admin-panel__btn admin-panel__btn--secondary rounded-xl px-8 py-2.5 text-sm"
              >
                My team rota
              </Link>
            </div>
          </div>
        </div>

        <div className="admin-panel__coverage-panel">
          <div className="admin-panel__coverage-panel__header">
            <div>
              <h3 className="admin-panel__coverage-panel__title">Daily slot totals</h3>
              <p className="admin-panel__coverage-panel__lede">
                How many people are available each day. On-call expects <strong>both AM and PM</strong> on that day (12h daytime minimum);
                longer evening or weekend cover is noted in the Hours field on each person&apos;s My rota page.
              </p>
            </div>
            <div className="admin-panel__coverage-legend" aria-label="Colour key for AM, PM and on-call cells">
              <span className="admin-panel__coverage-legend__label">Key</span>
              <ul className="admin-panel__coverage-legend__list">
                <li>
                  <span className="admin-panel__coverage-pill admin-panel__coverage-pill--ok">Covered</span>
                </li>
                <li>
                  <span className="admin-panel__coverage-pill admin-panel__coverage-pill--gap">Gap</span>
                </li>
                <li>
                  <span className="admin-panel__coverage-pill admin-panel__coverage-pill--call">On-call</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="admin-panel__coverage-calendar-card">
            <div className="admin-panel__coverage-calendar-card__pad">
              <p className="admin-panel__coverage-calendar-range">
                <span className="font-extrabold text-gray-800">Next 14 days</span>
                <span className="text-gray-500">
                  {' '}
                  · {next14Days[0]?.label} → {next14Days[13]?.label}
                </span>
              </p>
              {[
                { title: 'Week 1', from: 0, to: 7 },
                { title: 'Week 2', from: 7, to: 14 },
              ].map((week) => (
                <div key={week.title} className="admin-panel__coverage-cal-week">
                  <p className="admin-panel__coverage-cal-week__label">{week.title}</p>
                  <div className="admin-panel__coverage-cal-wrap">
                    <div className="admin-panel__coverage-cal-grid">
                      {next14Days.slice(week.from, week.to).map((d) => {
                        const c = coverage[d.key] || { am: 0, pm: 0, onCall: 0 };
                        const countBadge = (n, kind) => {
                          const num = Number(n || 0);
                          const ok = num > 0;
                          if (kind === 'onCall') {
                            return (
                              <span
                                className={`admin-panel__coverage-count admin-panel__coverage-count--compact ${
                                  ok ? 'admin-panel__coverage-count--oncall' : 'admin-panel__coverage-count--oncall-empty'
                                }`}
                              >
                                {num}
                              </span>
                            );
                          }
                          return (
                            <span
                              className={`admin-panel__coverage-count admin-panel__coverage-count--compact ${
                                ok ? 'admin-panel__coverage-count--slot' : 'admin-panel__coverage-count--gap'
                              }`}
                            >
                              {num}
                            </span>
                          );
                        };
                        let needLabel = 'Covered';
                        let needCls = 'admin-panel__coverage-need--ok';
                        if (c.am === 0 && c.pm === 0) {
                          needLabel = 'High need';
                          needCls = 'admin-panel__coverage-need--high';
                        } else if (c.am === 0 || c.pm === 0) {
                          needLabel = 'Medium need';
                          needCls = 'admin-panel__coverage-need--medium';
                        }
                        return (
                          <div key={d.key} className="admin-panel__coverage-cal-cell">
                            <div className="admin-panel__coverage-cal-cell__head">
                              <span className="admin-panel__coverage-cal-cell__dow">{d.label}</span>
                              <span className="admin-panel__coverage-cal-cell__key">{d.key}</span>
                            </div>
                            <div className="admin-panel__coverage-cal-cell__slots">
                              <div className="admin-panel__coverage-cal-cell__slot-row">
                                <span>AM</span>
                                {countBadge(c.am, 'am')}
                              </div>
                              <div className="admin-panel__coverage-cal-cell__slot-row">
                                <span>PM</span>
                                {countBadge(c.pm, 'pm')}
                              </div>
                              <div className="admin-panel__coverage-cal-cell__slot-row">
                                <span>OC</span>
                                {countBadge(c.onCall, 'onCall')}
                              </div>
                            </div>
                            <div className="admin-panel__coverage-cal-cell__foot">
                              <span className={`admin-panel__coverage-need admin-panel__coverage-need--compact ${needCls}`}>
                                {needLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
