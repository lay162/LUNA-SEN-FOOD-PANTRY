import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ClipboardList, FileText, Wallet } from 'lucide-react';
import { useAdminOps } from '../../context/AdminOpsContext';
import TeamAvailabilityPanel from './components/TeamAvailabilityPanel';
import { getAdminProfile } from './utils/adminProfile';
import { getCurrentAdminRole } from './utils/adminAuth';
import { applicantDrivingLicencePathMet, applicantInsurancePathMet } from './utils/applicantDocReview';

const LS_APPLICANTS = 'luna-admin-applicants-v1';

function normalizeApplicantSnapshot(a) {
  if (!a || typeof a !== 'object') return a;
  const stage = a.stage || 'application-received';
  const verified =
    typeof a.founderDocsVerified === 'boolean'
      ? a.founderDocsVerified
      : stage !== 'application-received';
  return {
    ...a,
    bringInsuranceInPerson: Boolean(a.bringInsuranceInPerson),
    bringDbsInPerson: Boolean(a.bringDbsInPerson),
    founderDocsVerified: verified,
  };
}

const EXPIRY_SAFETY_COUNT = 3;

function toLspId(id) {
  if (!id) return '—';
  return id.replace(/^REF/i, 'LSP');
}

export default function AdminDashboard() {
  const { stats, auditLog, totalLiquidity, referrals } = useAdminOps();
  const { displayName } = getAdminProfile();
  const [actorRole, setActorRole] = useState('staff');
  const [volunteerAppSnap, setVolunteerAppSnap] = useState({
    awaitingReview: 0,
    driverDocsMissing: 0,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await getCurrentAdminRole();
        if (alive) setActorRole(r || 'staff');
      } catch {
        if (alive) setActorRole('staff');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function readVolunteerApplicants() {
      try {
        const raw = localStorage.getItem(LS_APPLICANTS);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr)) {
          setVolunteerAppSnap({ awaitingReview: 0, driverDocsMissing: 0 });
          return;
        }
        const rows = arr.map(normalizeApplicantSnapshot).filter(Boolean);
        let awaitingReview = 0;
        let driverDocsMissing = 0;
        for (const a of rows) {
          if (a.stage !== 'application-received') continue;
          if (!applicantInsurancePathMet(a) || !applicantDrivingLicencePathMet(a)) {
            driverDocsMissing += 1;
            continue;
          }
          if (!a.founderDocsVerified) awaitingReview += 1;
        }
        setVolunteerAppSnap({ awaitingReview, driverDocsMissing });
      } catch {
        setVolunteerAppSnap({ awaitingReview: 0, driverDocsMissing: 0 });
      }
    }
    readVolunteerApplicants();
    const onFocus = () => readVolunteerApplicants();
    const onVis = () => {
      if (document.visibilityState === 'visible') readVolunteerApplicants();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const lastRefAudit = auditLog.find((a) => a.entityType === 'referral');
  const headRef = referrals[0];

  const heardAboutAllCounts = React.useMemo(() => {
    const inferHeardAbout = (r) => {
      const explicit = String(r?.heardAboutUs || '').trim();
      if (explicit) return explicit;

      const route = String(r?.referredBy || '').trim();
      const org = String(r?.referrerOrganisation || '').trim().toLowerCase();
      if (org.includes('citizens advice') || org.includes('cab')) return 'Citizens Advice (CAB)';

      if (!route) return '—';
      if (route === 'GP practice') return 'GP / NHS service';
      if (route === 'Health visiting (NHS)') return 'GP / NHS service';
      if (route === 'School or education') return 'School / education';
      if (route === 'Social care') return 'Council / social care';
      if (route === 'Faith group') return 'Faith group';
      if (route === 'Friend or neighbour') return 'Friend / family / neighbour';
      if (route === 'Charity or community') return 'Charity / community';
      if (route === 'Citizens Advice (CAB)') return 'Citizens Advice (CAB)';
      if (route === 'Self-referral') return 'Self-referral';
      return route;
    };

    const counts = new Map();
    for (const r of referrals || []) {
      const key = inferHeardAbout(r);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()]
      .filter(([k]) => k !== '—')
      .sort((a, b) => b[1] - a[1]);
  }, [referrals]);

  const heardAboutTopCounts = React.useMemo(
    () => heardAboutAllCounts.slice(0, 4),
    [heardAboutAllCounts]
  );

  const handleExportHeardAbout = () => {
    const rows = heardAboutAllCounts;
    const generatedAt = new Date();
    const csvEscape = (value) => {
      const s = String(value ?? '');
      if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const csv = [
      ['Heard about us report', '', ''],
      ['Generated at', generatedAt.toISOString(), ''],
      ['Total referrals counted', referrals?.length || 0, ''],
      ['', '', ''],
      ['Source', 'Count', 'Percent'],
      ...rows.map(([label, count]) => {
        const total = Math.max(1, referrals?.length || 0);
        const pct = ((count / total) * 100).toFixed(1) + '%';
        return [label, count, pct];
      }),
    ]
      .map((r) => r.map(csvEscape).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ymd = generatedAt.toISOString().slice(0, 10);
    a.href = url;
    a.download = `luna-heard-about-us-report-${ymd}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const quickLinks = [
    { to: '/admin/volunteers', label: 'Volunteers', tone: 'pink' },
    ...(actorRole === 'founder'
      ? [
          { to: '/admin/recruitment', label: 'Recruitment', tone: 'gradient' },
          { to: '/admin/settings', label: 'Admin settings', tone: 'blue' },
        ]
      : []),
  ];

  return (
    <div className="admin-dashboard admin-panel__fade-in admin-panel__page">
      {/* Welcome — split heading like reference */}
      <div className="admin-dashboard__welcome relative overflow-hidden">
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-2/5 -translate-x-6 skew-x-[-18deg] bg-pink-50/60"
          aria-hidden
        />
        <div className="relative z-10 p-8 md:p-10">
          <h2 className="mb-2 text-3xl font-black tracking-tighter md:text-4xl lg:text-5xl">
            <span style={{ color: 'var(--luna-grey-800)' }}>Welcome back,</span>{' '}
            <span className="admin-panel__gradient-text">LUNA</span>{' '}
            <span style={{ color: 'var(--luna-grey-800)' }}>SEN PANTRY</span>
          </h2>
          <p className="text-lg font-bold" style={{ color: 'var(--luna-grey-600)' }}>
            Operational Overview ·{' '}
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--luna-grey-500)' }}>
            Signed in as {displayName}
          </p>
        </div>
      </div>

      {/* Four KPI cards — fixed 4-column grid on large screens, equal height */}
      <div className="admin-dashboard__kpi-grid">
        <Link to="/admin/referrals" className="admin-dashboard__kpi-card admin-dashboard__kpi-card--pink">
          <ClipboardList className="admin-dashboard__kpi-icon" size={26} strokeWidth={2} aria-hidden />
          <p className="admin-dashboard__kpi-label admin-dashboard__kpi-label--blue">New requests</p>
          <p className="admin-dashboard__kpi-value">{stats.receivedReferrals}</p>
          <div className="min-h-[0.5rem] flex-1" aria-hidden />
          <span className="admin-dashboard__kpi-footer admin-dashboard__kpi-footer--pink">
            Received referrals <ChevronRight size={14} aria-hidden />
          </span>
        </Link>

        <Link to="/admin/stock" className="admin-dashboard__kpi-card admin-dashboard__kpi-card--blue">
          <AlertTriangle className="admin-dashboard__kpi-icon" size={26} strokeWidth={2} aria-hidden />
          <p className="admin-dashboard__kpi-label admin-dashboard__kpi-label--danger">Safety alerts</p>
          <p className="admin-dashboard__kpi-value">{EXPIRY_SAFETY_COUNT}</p>
          <div className="min-h-[0.5rem] flex-1" aria-hidden />
          <span className="admin-dashboard__kpi-footer admin-dashboard__kpi-footer--sky">
            Expiry safety check <ChevronRight size={14} aria-hidden />
          </span>
        </Link>

        <div className="admin-dashboard__kpi-card admin-dashboard__kpi-card--neutral">
          <FileText className="admin-dashboard__kpi-icon" size={26} strokeWidth={2} aria-hidden />
          <p className="admin-dashboard__kpi-label admin-dashboard__kpi-label--blue">Audit trail</p>
          <p className="admin-dashboard__kpi-value--audit">
            {toLspId(headRef?.id)} <span style={{ color: 'var(--luna-grey-300)' }}>·</span> {stats.totalReferrals}
          </p>
          <p className="admin-dashboard__kpi-sub admin-dashboard__kpi-sub--grow">
            {lastRefAudit ? lastRefAudit.action : 'Latest referral action appears here'}
          </p>
        </div>

        <Link to="/admin/audit" className="admin-dashboard__kpi-card admin-dashboard__kpi-card--green">
          <Wallet className="admin-dashboard__kpi-icon" size={26} strokeWidth={2} aria-hidden />
          <p className="admin-dashboard__kpi-label admin-dashboard__kpi-label--blue">Pantry liquidity</p>
          <p className="text-3xl font-black tracking-tighter text-green-600 md:text-[2rem]">
            £{totalLiquidity.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
          </p>
          <div className="min-h-[0.5rem] flex-1" aria-hidden />
          <span className="admin-dashboard__kpi-footer admin-dashboard__kpi-footer--muted">
            Funds &amp; audit <ChevronRight size={14} aria-hidden />
          </span>
        </Link>
      </div>

      {actorRole === 'founder' ? (
        <div className="admin-panel__card admin-panel__card--shadow mt-6 w-full px-6 py-5 md:mt-8">
          <h3 className="mb-2 text-base font-bold" style={{ color: 'var(--luna-grey-900)' }}>
            Volunteer applications (this device)
          </h3>
          <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--luna-grey-600)' }}>
            At <strong>Application received</strong>:{' '}
            <strong style={{ color: 'var(--luna-grey-900)' }}>{volunteerAppSnap.driverDocsMissing}</strong> driver
            application(s) still need licence and/or insurance (upload or in person).{' '}
            <strong style={{ color: 'var(--luna-grey-900)' }}>{volunteerAppSnap.awaitingReview}</strong> have that
            covered and are waiting for your <strong>Documents reviewed</strong> tick before they can move to the next
            stage.
          </p>
          <div className="admin-panel__dash-queue-cta">
            <Link
              to="/admin/recruitment"
              className="admin-panel__btn admin-panel__btn--primary rounded-xl px-5 py-2.5 text-sm font-bold"
            >
              Open recruitment
            </Link>
          </div>
        </div>
      ) : null}

      {actorRole === 'founder' && (
        <div className="mt-6 w-full md:mt-8">
          <TeamAvailabilityPanel />
        </div>
      )}

      <div className="admin-dashboard__bottom-grid">
        <div className="admin-panel__card admin-panel__card--shadow admin-panel__dash-bottom-card">
          <h3 className="mb-5 text-center text-lg font-bold" style={{ color: 'var(--luna-grey-900)' }}>
            Queue snapshot
          </h3>
          <div className="admin-dashboard__queue-mini-grid">
            <div className="admin-dashboard__queue-mini admin-dashboard__queue-mini--pink">
              <p className="admin-dashboard__queue-mini-label">Total on file</p>
              <p className="admin-dashboard__queue-mini-value admin-dashboard__queue-mini-value--muted">
                {stats.totalReferrals}
              </p>
            </div>
            <div className="admin-dashboard__queue-mini admin-dashboard__queue-mini--gradient">
              <p className="admin-dashboard__queue-mini-label">In queue</p>
              <p className="admin-dashboard__queue-mini-value admin-dashboard__queue-mini-value--muted">
                {stats.receivedReferrals}
              </p>
            </div>
            <div className="admin-dashboard__queue-mini admin-dashboard__queue-mini--warm">
              <p className="admin-dashboard__queue-mini-label">Pending review</p>
              <p className="admin-dashboard__queue-mini-value admin-dashboard__queue-mini-value--orange">
                {stats.pendingReview}
              </p>
            </div>
            <div className="admin-dashboard__queue-mini admin-dashboard__queue-mini--urgent">
              <p className="admin-dashboard__queue-mini-label">Urgent / crisis</p>
              <p className="admin-dashboard__queue-mini-value admin-dashboard__queue-mini-value--red">
                {stats.urgentReferrals}
              </p>
            </div>
          </div>
          <div className="admin-panel__dash-queue-cta">
            <Link to="/admin/referrals" className="admin-panel__btn admin-panel__btn--primary rounded-xl py-3">
              Open referrals
            </Link>
          </div>
        </div>

        <div className="admin-panel__card admin-panel__card--shadow admin-panel__dash-bottom-card">
          <h3 className="mb-5 text-center text-lg font-bold" style={{ color: 'var(--luna-grey-900)' }}>
            Heard about us
          </h3>
          {heardAboutTopCounts.length ? (
            <div className="admin-panel__dash-heard">
              <p className="admin-panel__label mb-3 text-center">Top sources (live)</p>
              <div className="admin-dashboard__queue-mini-grid admin-dashboard__heard-mini-grid" aria-label="Top heard about us sources">
                {heardAboutTopCounts.map(([label, count], idx) => (
                  <div
                    key={label}
                    className={[
                      'admin-dashboard__queue-mini',
                      idx === 0 ? 'admin-dashboard__queue-mini--pink' : '',
                      idx === 1 ? 'admin-dashboard__queue-mini--gradient' : '',
                      idx === 2 ? 'admin-dashboard__queue-mini--gradient' : '',
                      idx === 3 ? 'admin-dashboard__queue-mini--blue' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <p className="admin-dashboard__queue-mini-label">{label}</p>
                    <p className="admin-dashboard__queue-mini-value admin-dashboard__queue-mini-value--muted">{count}</p>
                  </div>
                ))}
              </div>
              <div className="admin-panel__dash-heard-actions">
                <button
                  type="button"
                  onClick={handleExportHeardAbout}
                  className="admin-panel__btn admin-panel__btn--primary rounded-xl py-3"
                >
                  Download report (CSV)
                </button>
              </div>
              <p className="admin-panel__dash-heard-foot">
                Based on submitted referrals. New web referrals include an explicit “How did you hear about us?” answer.
              </p>
            </div>
          ) : (
            <div
              className="admin-panel__dash-heard-empty"
              style={{ color: 'var(--luna-grey-500)' }}
            >
              No “heard about us” data yet.
            </div>
          )}
        </div>

        <div className="admin-panel__card admin-panel__card--shadow admin-panel__dash-bottom-card">
          <h3 className="mb-5 text-center text-lg font-bold" style={{ color: 'var(--luna-grey-900)' }}>
            Quick links
          </h3>
          <div className="admin-panel__dash-quicklinks">
            {quickLinks.map(({ to, label, tone }) => (
              <Link
                key={to}
                to={to}
                className={`admin-panel__dash-quicklink admin-panel__dash-quicklink--${tone}`}
              >
                {label}
              </Link>
            ))}
          </div>
          {actorRole === 'founder' ? (
            <p className="mt-4 text-center text-xs leading-relaxed" style={{ color: 'var(--luna-grey-500)' }}>
              Driver insurance and optional DBS uploads from the volunteer form are shown when you open an applicant
              under{' '}
              <Link to="/admin/recruitment" className="font-semibold text-pink-600 transition hover:underline">
                Recruitment
              </Link>{' '}
              or a team member under{' '}
              <Link to="/admin/volunteers" className="font-semibold text-pink-600 transition hover:underline">
                Volunteers
              </Link>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
