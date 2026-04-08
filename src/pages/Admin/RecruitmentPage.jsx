import React from 'react';
import { useTeamRecruitment } from './volunteerRecruitmentContext';
import {
  applicantCanAdvanceStage,
  applicantDocReviewLabel,
  applicantMeetsOnboardingDocRequirements,
  applicantNeedsFounderDocReviewToAdvance,
} from './utils/applicantDocReview';

function applicantRoleLabel(role) {
  switch (role) {
    case 'delivery':
      return 'Driver';
    case 'driver':
      return 'Driver';
    case 'packer':
      return 'Packer';
    case 'admin':
      return 'Admin support';
    default:
      return String(role || '—');
  }
}

function applicantAccent(stage) {
  switch (stage) {
    case 'application-received':
      return 'pending';
    case 'informal-chat-booked':
      return 'medium';
    case 'interview-complete':
      return 'high';
    case 'offered':
      return 'high';
    case 'onboarded':
      return 'active';
    case 'rejected':
      return 'urgent';
    case 'on-file':
      return 'default';
    default:
      return 'default';
  }
}

function applicantStagePriClass(stage) {
  switch (stage) {
    case 'informal-chat-booked':
      return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--medium';
    case 'interview-complete':
    case 'offered':
      return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--high';
    case 'application-received':
      return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--standard';
    case 'onboarded':
    case 'on-file':
      return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--standard';
    case 'rejected':
      return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--urgent';
    default:
      return 'admin-panel__referral-strip__pri admin-panel__referral-strip__pri--standard';
  }
}

function formatAppliedDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(/ /g, ' ')
    .toUpperCase();
}

export default function RecruitmentPage() {
  const {
    recruitmentSnapshot,
    applicantStages,
    applicantRoleFilterDefs,
    selectedApplicantStage,
    setSelectedApplicantStage,
    selectedApplicantRole,
    setSelectedApplicantRole,
    applicantSearchQuery,
    setApplicantSearchQuery,
    filteredApplicants,
    advanceApplicant,
    rejectApplicant,
    keepApplicantOnFile,
    setPersonModal,
    setInviteOpen,
    setInviteApplicant,
    STANDALONE_MEETING,
    navigate,
  } = useTeamRecruitment();

  const { newApplications, inProgress, offered, onboardedCount } = recruitmentSnapshot;

  return (
    <div className="admin-panel__fade-in admin-panel__page">
      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <div className="admin-panel__stock-card-head">
            <div className="admin-panel__stock-card-head__spacer" aria-hidden />
            <h1 className="admin-panel__stock-card-head__title">Recruitment</h1>
            <div className="admin-panel__stock-card-head__actions">
              <button
                type="button"
                onClick={() => {
                  setInviteApplicant(STANDALONE_MEETING);
                  setInviteOpen(true);
                }}
                className="admin-panel__dash-quicklink admin-panel__dash-quicklink--gradient"
              >
                Schedule meeting
              </button>
            </div>
          </div>
          <div className="admin-panel__stat-grid admin-panel__stat-grid--compact">
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-gray-800">{newApplications}</p>
              <p className="admin-panel__stat-label">New applications</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-blue-600">{inProgress}</p>
              <p className="admin-panel__stat-label">In progress</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-orange-600">{offered}</p>
              <p className="admin-panel__stat-label">Offered</p>
            </div>
            <div className="admin-panel__stat-cell">
              <p className="admin-panel__stat-value text-green-600">{onboardedCount}</p>
              <p className="admin-panel__stat-label">Onboarded</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__grid-2">
        <div className="admin-panel__card admin-panel__card--shadow">
          <div className="admin-panel__card-pad admin-panel__card-pad--sm">
            <h2 className="admin-panel__section-title admin-panel__section-title--sm">Stage</h2>
            <div className="admin-panel__category-list admin-panel__category-list--compact">
              {applicantStages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedApplicantStage(s.id)}
                  className={`admin-panel__category-btn ${selectedApplicantStage === s.id ? 'admin-panel__category-btn--active' : ''}`}
                >
                  <span className="admin-panel__category-btn-row">
                    <span className="admin-panel__category-btn-name">{s.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-panel__card admin-panel__card--shadow">
          <div className="admin-panel__card-pad flex flex-col">
            <h2 className="admin-panel__section-title">Role &amp; search</h2>
            <div className="mb-4">
              <label className="admin-panel__label" htmlFor="app-role-filter">
                Role applied
              </label>
              <select
                id="app-role-filter"
                className="admin-panel__input"
                value={selectedApplicantRole}
                onChange={(e) => setSelectedApplicantRole(e.target.value)}
              >
                {applicantRoleFilterDefs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="admin-panel__label" htmlFor="app-search">
                Search applicants
              </label>
              <input
                id="app-search"
                type="text"
                className="admin-panel__input"
                placeholder="Name, email, role…"
                value={applicantSearchQuery}
                onChange={(e) => setApplicantSearchQuery(e.target.value)}
              />
            </div>
            <p className="admin-panel__recruit-volunteers-hint">
              When someone is ready to join as a volunteer, add them under Volunteers.
            </p>
            <div className="admin-panel__recruit-volunteers-cta">
              <button
                type="button"
                className="admin-panel__dash-quicklink admin-panel__dash-quicklink--gradient"
                onClick={() => navigate('/admin/volunteers')}
              >
                Volunteers
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel__card admin-panel__card--shadow">
        <div className="admin-panel__card-pad admin-panel__card-pad--sm">
          <h2 className="admin-panel__section-title mb-3">Pending applications</h2>
          {filteredApplicants.length === 0 ? (
            <p className="text-center text-sm text-gray-600">No applications match the current filters.</p>
          ) : (
            <div className="admin-panel__referrals-list">
              {filteredApplicants.map((a) => {
                const stageOrder = [
                  'application-received',
                  'informal-chat-booked',
                  'interview-complete',
                  'offered',
                  'onboarded',
                ];
                const idx = stageOrder.indexOf(a.stage);
                const pipelineCanAdvance = idx >= 0 && idx < stageOrder.length - 1;
                const founderGateOk =
                  !applicantNeedsFounderDocReviewToAdvance(a) || applicantCanAdvanceStage(a);
                const nextStageId = pipelineCanAdvance ? stageOrder[idx + 1] : null;
                const onboardingGateOk =
                  nextStageId !== 'onboarded' || applicantMeetsOnboardingDocRequirements(a);
                const docBadge = applicantDocReviewLabel(a);
                const nextStageName = nextStageId
                  ? applicantStages.find((s) => s.id === nextStageId)?.name ||
                    String(nextStageId).replace(/-/g, ' ')
                  : '';
                const stageName =
                  applicantStages.find((s) => s.id === a.stage)?.name || a.stage;
                const stageUpper = stageName.toUpperCase();
                const roleUpper = applicantRoleLabel(a.roleApplied).toUpperCase();
                const dispositionStages = [
                  'application-received',
                  'informal-chat-booked',
                  'interview-complete',
                  'offered',
                ];
                const canDisposition = dispositionStages.includes(a.stage);
                const showInvite = !['rejected', 'on-file'].includes(a.stage);
                return (
                  <div key={a.id} className="admin-panel__referrals-list-item">
                    <div className="admin-panel__referral-strip" data-accent={applicantAccent(a.stage)}>
                      <div className="admin-panel__referral-strip__main">
                        <div className="admin-panel__referral-strip__row">
                          <span className="admin-panel__referral-strip__title">
                            {a.id} — {a.name}
                          </span>
                        </div>
                        <div className="admin-panel__referral-strip__meta">
                          <span className={applicantStagePriClass(a.stage)}>{stageUpper}</span>
                          <span className="admin-panel__referral-strip__sep">•</span>
                          <span>{roleUpper}</span>
                          <span className="admin-panel__referral-strip__sep">•</span>
                          <span>APPLIED {formatAppliedDate(a.submittedOn)}</span>
                          {docBadge ? (
                            <>
                              <span className="admin-panel__referral-strip__sep">•</span>
                              <span
                                className={`admin-panel__referral-strip__doc-badge admin-panel__referral-strip__doc-badge--${docBadge.tone}`}
                              >
                                {docBadge.text}
                              </span>
                            </>
                          ) : null}
                        </div>
                        {a.notes ? <p className="admin-panel__referral-strip__note">{a.notes}</p> : null}
                      </div>
                      <div className="admin-panel__referral-strip__footer">
                        <a className="admin-panel__referral-strip__footer-email" href={`mailto:${a.email}`}>
                          {a.email}
                        </a>
                        <div className="admin-panel__referral-strip__footer-actions">
                          <button
                            type="button"
                            className="admin-panel__btn admin-panel__btn--accent-pink admin-panel__referral-strip__btn"
                            onClick={() =>
                              setPersonModal({ open: true, kind: 'applicant', mode: 'view', person: a })
                            }
                          >
                            Open
                          </button>
                          {showInvite ? (
                            <button
                              type="button"
                              className="admin-panel__btn admin-panel__btn--primary admin-panel__referral-strip__btn"
                              onClick={() => {
                                setInviteApplicant(a);
                                setInviteOpen(true);
                              }}
                            >
                              Invite
                            </button>
                          ) : null}
                          {pipelineCanAdvance ? (
                            <button
                              type="button"
                              className="admin-panel__btn admin-panel__btn--accent-blue admin-panel__referral-strip__btn"
                              disabled={!founderGateOk || !onboardingGateOk}
                              title={
                                !founderGateOk
                                  ? `Open this application and tick “Documents reviewed” after checking driver documents (licence + insurance) and any DBS proof — upload or in person. Then you can move to “${nextStageName}”.`
                                  : !onboardingGateOk
                                    ? `Before moving to “${nextStageName}”, make sure DBS is provided (upload or in person). Drivers also need licence + insurance (upload or in person).`
                                    : `Move ${a.name} to the next stage: “${nextStageName}”. Current stage: “${stageName}”.`
                              }
                              aria-label={`Advance ${a.name} to ${nextStageName}`}
                              onClick={() => advanceApplicant(a.id)}
                            >
                              Next stage
                            </button>
                          ) : null}
                          {canDisposition ? (
                            <>
                              <button
                                type="button"
                                className="admin-panel__btn admin-panel__btn--outline admin-panel__referral-strip__btn"
                                title={`Keep ${a.name} on file for future opportunities`}
                                aria-label={`Keep ${a.name} on file`}
                                onClick={() => keepApplicantOnFile(a.id)}
                              >
                                On file
                              </button>
                              <button
                                type="button"
                                className="admin-panel__btn admin-panel__btn--outline admin-panel__referral-strip__btn admin-panel__referral-strip__btn--danger"
                                title={`Reject application for ${a.name}`}
                                aria-label={`Reject ${a.name}`}
                                onClick={() => rejectApplicant(a.id)}
                              >
                                Reject
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
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
