import React from 'react';
import { useTeamRecruitment } from './volunteerRecruitmentContext';
import { scheduleHasAnyBookedSlots } from './utils/teamAvailabilityUtils';

function volunteerRoleLabel(role) {
  switch (role) {
    case 'delivery':
      return 'Driver';
    case 'packer':
      return 'Packer';
    case 'admin':
      return 'Admin support';
    case 'fundraiser':
      return 'Fundraiser';
    case 'specialist':
      return 'SEN specialist';
    default:
      return String(role || '—');
  }
}

function volunteerAccent(status) {
  if (status === 'active') return 'active';
  if (status === 'on-leave') return 'pending';
  if (status === 'inactive') return 'default';
  return 'default';
}

function volunteerRolePriClass(role) {
  if (role === 'delivery') return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--medium';
  if (role === 'packer') return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--high';
  if (role === 'specialist') return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--urgent';
  return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--standard';
}

function formatShortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(/ /g, ' ')
    .toUpperCase();
}

export default function VolunteerRosterPage() {
  const {
    recruitmentSnapshot,
    roleOptions,
    selectedRole,
    setSelectedRole,
    searchTerm,
    setSearchTerm,
    filteredVolunteers,
    expandedVolunteerId,
    setExpandedVolunteerId,
    setPersonModal,
    setAddVolunteerOpen,
    next14Days,
    ensureSchedule,
    summariseSchedule,
    formatDateTime,
    getBackgroundCheckColor,
    downloadVolunteerTrainingCalendar,
    downloadVolunteerListCsv,
    downloadVolunteerReport,
  } = useTeamRecruitment();

  const { drivers, packers, admins, other } = recruitmentSnapshot;

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="admin-panel__stock-card-head">
            <div className="admin-panel__stock-card-head__spacer" aria-hidden />
            <h1 className="admin-panel__stock-card-head__title">Volunteers</h1>
            <div className="admin-panel__stock-card-head__actions">
              <button
                type="button"
                onClick={() => setAddVolunteerOpen(true)}
                className="admin-panel__btn admin-panel__btn--primary shrink-0 rounded-lg px-5 py-2.5 text-[0.65rem] font-extrabold uppercase tracking-wide"
              >
                Add new volunteer
              </button>
            </div>
          </div>
          <div className="admin-panel__stat-grid admin-panel__stat-grid--compact">
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-blue-600">{drivers}</p>
              <p className="admin-panel__stat-label">Drivers</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-emerald-600">{packers}</p>
              <p className="admin-panel__stat-label">Packers</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-violet-600">{admins}</p>
              <p className="admin-panel__stat-label">Admin</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value" style={{ color: 'var(--luna-pink)' }}>
                {other}
              </p>
              <p className="admin-panel__stat-label">Other roles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__grid-2 admin-panel__grid-2--volunteers-sidebar">
        <div className="admin-panel__card admin-panel__card--shadow">
          <div className="admin-panel__card-pad admin-panel__card-pad--sm">
            <h2 className="admin-panel__section-title admin-panel__section-title--sm">Roles</h2>
            <div className="admin-panel__category-list admin-panel__category-list--compact">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  data-priority={role.priority || 'none'}
                  onClick={() => setSelectedRole(role.id)}
                  className={`admin-panel__category-btn ${selectedRole === role.id ? 'admin-panel__category-btn--active' : ''}`}
                >
                  <span className="admin-panel__category-btn-row">
                    <span className="admin-panel__category-btn-name">{role.name}</span>
                    <span className="admin-panel__category-btn-count">{`${role.count} people`}</span>
                  </span>
                  {role.priority ? (
                    <span className={`admin-panel__category-btn-meta admin-panel__category-btn-meta--${role.priority}`}>
                      {role.priority} priority
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-panel__vol-sidebar-stack">
          <div className="admin-panel__card admin-panel__card--shadow">
            <div className="admin-panel__card-pad admin-panel__card-pad--sm">
              <h2 className="admin-panel__section-title admin-panel__section-title--sm">Search volunteers</h2>
              <div className="mt-4">
                <label className="admin-panel__label" htmlFor="vol-list-search">
                  Filter by name, email, or skill
                </label>
                <input
                  id="vol-list-search"
                  type="text"
                  className="admin-panel__input"
                  placeholder="Name, email, or skill…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="admin-panel__card admin-panel__card--shadow admin-panel__vol-exports-card">
            <div className="admin-panel__card-pad admin-panel__card-pad--sm admin-panel__vol-exports-card__inner">
              <h2 className="admin-panel__section-title admin-panel__section-title--sm">Exports &amp; training</h2>
              <div className="admin-panel__vol-export-actions">
                <button
                  type="button"
                  className="admin-panel__btn admin-panel__btn--accent-pink rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm"
                  onClick={downloadVolunteerListCsv}
                >
                  Volunteer list (.csv)
                </button>
                <button
                  type="button"
                  className="admin-panel__btn admin-panel__btn--primary rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm"
                  onClick={downloadVolunteerReport}
                >
                  Volunteer report (.csv)
                </button>
                <button
                  type="button"
                  className="admin-panel__btn admin-panel__btn--accent-blue rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm"
                  onClick={downloadVolunteerTrainingCalendar}
                >
                  Training calendar (.ics)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title mb-3">Volunteer list</h2>
          {filteredVolunteers.length === 0 ? (
            <p className="text-center text-sm text-gray-600">No volunteers match the current filters.</p>
          ) : (
            <div className="admin-panel__referrals-list">
              {filteredVolunteers.map((v) => {
                const open = expandedVolunteerId === v.id;
                const schedSum = summariseSchedule(v);
                const sched = ensureSchedule(v);
                const rotaLive = scheduleHasAnyBookedSlots(sched);
                const licUrl = String(v.drivingLicenceProofDataUrl || '').trim();
                const licName = v.drivingLicenceProofFileName || '';
                const insUrl = String(v.insuranceProofDataUrl || '').trim();
                const insName = v.insuranceProofFileName || '';
                const dbsUrl = String(v.dbsProofDataUrl || '').trim();
                const dbsName = v.dbsProofFileName || '';
                const hasLicenceFile = Boolean(licUrl && licName);
                const hasInsuranceFile = Boolean(insUrl && insName);
                const hasDbsFile = Boolean(dbsUrl && dbsName);
                const roleUpper = volunteerRoleLabel(v.role).toUpperCase();
                const statusUpper = String(v.status || '—')
                  .replace(/-/g, ' ')
                  .toUpperCase();
                return (
                  <div key={v.id} className="admin-panel__referrals-list-item">
                    <div className="admin-panel__referral-strip" data-accent={volunteerAccent(v.status)}>
                      <div className="admin-panel__referral-strip__main">
                        <div className="admin-panel__referral-strip__row">
                          <span className="admin-panel__referral-strip__title">
                            {v.id} — {v.name}
                          </span>
                          <span className="admin-panel__referral-strip__side" title={v.email}>
                            {v.email}
                          </span>
                        </div>
                        <div className="admin-panel__referral-strip__meta">
                          <span className={volunteerRolePriClass(v.role)}>{roleUpper}</span>
                          <span className="admin-panel__referral-strip__sep">•</span>
                          <span className="admin-panel__referral-strip__status">{statusUpper}</span>
                          <span className="admin-panel__referral-strip__sep">•</span>
                          <span>JOINED {formatShortDate(v.joinDate)}</span>
                        </div>
                      </div>
                      <div className="admin-panel__referral-strip__actions">
                        <button
                          type="button"
                          className="admin-panel__btn admin-panel__btn--accent-pink admin-panel__referral-strip__cta"
                          onClick={() =>
                            setPersonModal({ open: true, kind: 'volunteer', mode: 'view', person: v })
                          }
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="admin-panel__btn admin-panel__btn--accent-blue admin-panel__referral-strip__btn"
                          onClick={() => setExpandedVolunteerId(open ? null : v.id)}
                        >
                          {open ? 'Hide availability' : 'Show availability'}
                        </button>
                      </div>
                    </div>
                    {open ? (
                      <div className="admin-panel__referral-strip-expand">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Contact</p>
                            <p className="mt-1 text-sm font-semibold text-gray-800">{v.phone || '—'}</p>
                            <p className={`mt-2 text-sm font-semibold ${getBackgroundCheckColor(v.backgroundCheck)}`}>
                              DBS / check status: {String(v.backgroundCheck || '—').replace(/-/g, ' ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Activity</p>
                            <p className="mt-1 text-sm text-gray-700">Last active: {formatDateTime(v.lastActiveAt)}</p>
                            <p className="mt-1 text-sm text-gray-700">
                              Hours (month / total): {v.hoursThisMonth ?? 0} / {v.totalHours ?? 0}
                            </p>
                            <p className="mt-1 text-sm text-gray-700">
                              Next 14 days — AM {schedSum.am} · PM {schedSum.pm} · On-call {schedSum.onCall}
                            </p>
                          </div>
                        </div>

                        <div className="admin-panel__vol-onfile-docs mt-4 rounded-xl border border-gray-100 bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            Onboarding documents (audit)
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Files stored in this app for this device — open in a new tab or use <strong>Open</strong> to
                            add or replace. Export the volunteer list (.csv) for filenames without opening each file.
                          </p>
                          <ul className="mt-3 space-y-3">
                            {v.role === 'delivery' ? (
                              <>
                                <li className="text-sm text-gray-800">
                                  <span className="font-bold text-gray-900">Driving licence</span>
                                  {hasLicenceFile ? (
                                    <span className="mt-1 flex flex-wrap items-center gap-2">
                                      <span className="text-xs text-gray-600">{licName}</span>
                                      {licUrl.startsWith('data:image') ? (
                                        <a
                                          href={licUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="admin-panel__btn admin-panel__btn--soft admin-panel__referral-strip__btn text-xs"
                                        >
                                          View image
                                        </a>
                                      ) : null}
                                      {licUrl.startsWith('data:application/pdf') ? (
                                        <a
                                          href={licUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="admin-panel__btn admin-panel__btn--primary admin-panel__referral-strip__btn text-xs"
                                        >
                                          Open PDF
                                        </a>
                                      ) : null}
                                    </span>
                                  ) : (
                                    <span className="mt-1 block text-xs font-medium text-amber-800">
                                      No licence file on record — add under Open → Compliance documents.
                                    </span>
                                  )}
                                </li>
                                <li className="text-sm text-gray-800">
                                  <span className="font-bold text-gray-900">Motor insurance</span>
                                  {hasInsuranceFile ? (
                                    <span className="mt-1 flex flex-wrap items-center gap-2">
                                      <span className="text-xs text-gray-600">{insName}</span>
                                      {insUrl.startsWith('data:image') ? (
                                        <a
                                          href={insUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="admin-panel__btn admin-panel__btn--soft admin-panel__referral-strip__btn text-xs"
                                        >
                                          View image
                                        </a>
                                      ) : null}
                                      {insUrl.startsWith('data:application/pdf') ? (
                                        <a
                                          href={insUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="admin-panel__btn admin-panel__btn--primary admin-panel__referral-strip__btn text-xs"
                                        >
                                          Open PDF
                                        </a>
                                      ) : null}
                                    </span>
                                  ) : (
                                    <span className="mt-1 block text-xs font-medium text-amber-800">
                                      No insurance file on record — add under Open → Compliance documents.
                                    </span>
                                  )}
                                </li>
                              </>
                            ) : (
                              <li className="text-sm text-gray-600">
                                <span className="font-bold text-gray-800">Driver documents</span> — N/A for this role.
                              </li>
                            )}
                            <li className="text-sm text-gray-800">
                              <span className="font-bold text-gray-900">DBS / safeguarding</span>
                              {hasDbsFile ? (
                                <span className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-gray-600">{dbsName}</span>
                                  {dbsUrl.startsWith('data:image') ? (
                                    <a
                                      href={dbsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="admin-panel__btn admin-panel__btn--soft admin-panel__referral-strip__btn text-xs"
                                    >
                                      View image
                                    </a>
                                  ) : null}
                                  {dbsUrl.startsWith('data:application/pdf') ? (
                                    <a
                                      href={dbsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="admin-panel__btn admin-panel__btn--primary admin-panel__referral-strip__btn text-xs"
                                    >
                                      Open PDF
                                    </a>
                                  ) : null}
                                </span>
                              ) : (
                                <span className="mt-1 block text-xs text-gray-500">
                                  No DBS file on record — add under Open → Compliance documents.
                                </span>
                              )}
                            </li>
                          </ul>
                          <div className="mt-3 flex justify-center">
                            <button
                              type="button"
                              className="admin-panel__btn admin-panel__btn--primary w-full max-w-[22rem] rounded-xl px-4 py-2 text-sm"
                              onClick={() =>
                                setPersonModal({ open: true, kind: 'volunteer', mode: 'view', person: v })
                              }
                            >
                              Open profile → manage documents
                            </button>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-gray-500">
                          Rota grid is read-only here; volunteers tick slots in <strong>My rota</strong> (by email). Totals
                          below include any saved rota data for this person.
                        </p>
                        {!rotaLive &&
                        Array.isArray(v.availability) &&
                        v.availability.length &&
                        String(v.availability[0] || '').trim() !== 'Temporarily unavailable' &&
                        String(v.availability[0] || '').trim() !== 'Currently unavailable' ? (
                          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
                            <strong>Profile note (not the live rota):</strong> {v.availability.join(' · ')}
                          </p>
                        ) : null}
                        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-3">
                          <table className="admin-panel__vol-rota-table w-full min-w-[680px] border-collapse text-center text-[0.65rem]">
                            <thead>
                              <tr>
                                <th className="admin-panel__vol-rota-corner text-left font-extrabold text-gray-500">
                                  Slot
                                </th>
                                {next14Days.map((d) => (
                                  <th key={d.key} className="admin-panel__vol-rota-head px-0.5 py-1 font-extrabold text-gray-500">
                                    <span className="block leading-tight">{d.dayNum}</span>
                                    <span className="block text-[0.55rem] font-semibold normal-case text-gray-400">
                                      {d.label.split(' ')[0]}
                                    </span>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { key: 'am', label: 'AM' },
                                { key: 'pm', label: 'PM' },
                                { key: 'onCall', label: 'On-call' },
                              ].map((slot) => (
                                <tr key={slot.key}>
                                  <th
                                    scope="row"
                                    className="admin-panel__vol-rota-row-label text-left font-extrabold text-gray-600"
                                  >
                                    {slot.label}
                                  </th>
                                  {next14Days.map((d) => {
                                    const row = sched[d.key] || {};
                                    const on =
                                      slot.key === 'onCall' ? Boolean(row.onCall) : Boolean(row[slot.key]);
                                    return (
                                      <td key={d.key} className="admin-panel__vol-rota-cell">
                                        <span
                                          className={`admin-panel__vol-rota-dot ${on ? 'admin-panel__vol-rota-dot--on' : ''}`}
                                          title={on ? `${slot.label} · booked` : '—'}
                                          aria-label={on ? `${slot.label} booked` : 'Not booked'}
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="admin-panel__vol-rota-actions mt-4">
                          <button
                            type="button"
                            className="admin-panel__btn admin-panel__btn--accent-blue rounded-xl px-4 py-2 text-sm"
                            onClick={() =>
                              setPersonModal({ open: true, kind: 'volunteer', mode: 'schedule', person: v })
                            }
                          >
                            Next shift
                          </button>
                          <a
                            className="admin-panel__btn admin-panel__btn--accent-pink rounded-xl px-4 py-2 text-sm"
                            href={`mailto:${encodeURIComponent(v.email)}`}
                          >
                            Email
                          </a>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
