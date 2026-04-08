import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TeamRecruitmentContext } from './volunteerRecruitmentContext';
import AdminPanelModal from './components/AdminPanelModal';
import AdminVolunteerDocSlot from './components/AdminVolunteerDocSlot';
import {
  applicantCanAdvanceStage,
  applicantCanMarkDocumentsReviewed,
  applicantDocReviewLabel,
  applicantDrivingLicencePathMet,
  applicantInsurancePathMet,
  applicantMeetsOnboardingDocRequirements,
  applicantNeedsFounderDocReviewToAdvance,
} from './utils/applicantDocReview';
import { DEMO_MODE } from '../../utils/demoMode';

// Always use the live keys for real operations (no demo seed data).
const LS_SUFFIX = '-live';
const LS_APPLICANTS = `luna-admin-applicants-v1${LS_SUFFIX}`;
const LS_VOLUNTEERS_ROSTER = `luna-admin-volunteers-roster-v1${LS_SUFFIX}`;

function normalizeApplicantRow(a) {
  if (!a || typeof a !== 'object') return a;
  const stage = a.stage || 'application-received';
  const verified =
    typeof a.founderDocsVerified === 'boolean'
      ? a.founderDocsVerified
      : stage !== 'application-received';
  return {
    ...a,
    drivingLicenceProofDataUrl: a.drivingLicenceProofDataUrl || '',
    drivingLicenceProofFileName: a.drivingLicenceProofFileName || '',
    bringInsuranceInPerson: Boolean(a.bringInsuranceInPerson),
    bringDrivingLicenceInPerson: Boolean(a.bringDrivingLicenceInPerson),
    bringDbsInPerson: Boolean(a.bringDbsInPerson),
    founderDocsVerified: verified,
  };
}

function loadApplicantsInitial() {
  try {
    const raw = localStorage.getItem(LS_APPLICANTS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr.map(normalizeApplicantRow);
    }
  } catch {
    /* ignore */
  }
  return [];
}
import { useAdminOps } from '../../context/AdminOpsContext';
import { getDb, isFirebaseConfigured } from '../../firebase';
import { createVolunteersTeamSeed } from './data/volunteersTeamSeed';
import {
  buildEmptySchedule,
  buildNext14Days,
  ensureSchedule as ensureScheduleForVolunteer,
} from './utils/teamAvailabilityUtils';

/** Opens the meeting modal without a linked applicant (Zoom / call / informal chat). */
const STANDALONE_MEETING = { id: 'MEET-STANDALONE', isStandaloneMeeting: true };

/** Bumped when in-app pledge wording changes (audit / exports). */
const VOLUNTEER_VALUES_VERSION = '2026.04';

function normalizeVolunteerRow(v, next14) {
  const docDefaults = {
    drivingLicenceProofDataUrl: '',
    drivingLicenceProofFileName: '',
    insuranceProofDataUrl: '',
    insuranceProofFileName: '',
    dbsProofDataUrl: '',
    dbsProofFileName: '',
  };
  const perfDefaults = {
    familiesServedCount: 0,
    deliveriesCompletedCount: 0,
    supportNeedsFlag: false,
    supportNeedsNotes: '',
    progressionStage: '',
    recognitionNotes: '',
  };
  const base = { ...docDefaults, ...perfDefaults, ...v };
  if (!next14 || !Array.isArray(next14)) return base;
  const sched = base.availabilitySchedule;
  if (sched && typeof sched === 'object') {
    const merged = buildEmptySchedule(next14);
    for (const d of next14) {
      if (sched[d.key]) merged[d.key] = { ...merged[d.key], ...sched[d.key] };
    }
    base.availabilitySchedule = merged;
  } else {
    base.availabilitySchedule = buildEmptySchedule(next14);
  }
  return base;
}

function loadVolunteersInitial() {
  const next14 = buildNext14Days();
  try {
    const raw = localStorage.getItem(LS_VOLUNTEERS_ROSTER);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr.map((row) => normalizeVolunteerRow(row, next14));
    }
  } catch {
    /* ignore */
  }
  return createVolunteersTeamSeed();
}

function applicantIsDriver(a) {
  const r = a?.roleApplied;
  return r === 'delivery' || r === 'driver';
}

function modalApplicantRoleLabel(role) {
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

/** Shared state for /admin/volunteers and /admin/recruitment — keeps roster + applications in sync. */
export function VolunteerRecruitmentLayout() {
  const { addAudit } = useAdminOps();
  const navigate = useNavigate();
  const [addVolunteerOpen, setAddVolunteerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVolunteerId, setExpandedVolunteerId] = useState(null);
  const [personModal, setPersonModal] = useState({ open: false, kind: 'volunteer', mode: 'view', person: null });
  const [selectedApplicantStage, setSelectedApplicantStage] = useState('all');
  const [selectedApplicantRole, setSelectedApplicantRole] = useState('all');
  const [applicantSearchQuery, setApplicantSearchQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteApplicant, setInviteApplicant] = useState(null);
  const [applicants, setApplicants] = useState(() => loadApplicantsInitial());

  useEffect(() => {
    try {
      localStorage.setItem(LS_APPLICANTS, JSON.stringify(applicants));
    } catch {
      /* quota */
    }
  }, [applicants]);

  const [volunteers, setVolunteers] = useState(() => loadVolunteersInitial());

  const roleOptions = useMemo(() => {
    const counts = { delivery: 0, packer: 0, admin: 0, fundraiser: 0, specialist: 0 };
    for (const v of volunteers || []) {
      const r = v?.role;
      if (r && Object.prototype.hasOwnProperty.call(counts, r)) counts[r] += 1;
    }
    const total = (volunteers || []).length;
    return [
      { id: 'all', name: 'All Volunteers', count: total },
      { id: 'delivery', name: 'Delivery Drivers', count: counts.delivery, priority: 'high' },
      { id: 'packer', name: 'Food Packers', count: counts.packer, priority: 'high' },
      { id: 'admin', name: 'Admin Support', count: counts.admin, priority: 'medium' },
      { id: 'fundraiser', name: 'Fundraisers', count: counts.fundraiser, priority: 'medium' },
      { id: 'specialist', name: 'SEN Specialists', count: counts.specialist, priority: 'high' },
    ];
  }, [volunteers]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_VOLUNTEERS_ROSTER, JSON.stringify(volunteers));
    } catch {
      /* quota — roster may include large data URLs; see console */
      window.console.warn('Could not persist volunteer roster (browser storage may be full).');
    }
  }, [volunteers]);

  // Load real submitted schedules (Firebase) or local aggregate (fallback)
  useEffect(() => {
    const LS_TEAM_AVAIL = 'luna-team-availability-v1';
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
        // ignore (rules may block list for non-founder)
      }
    })();
  }, []);

  const formatDateTime = (iso) => {
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
  };

  const next14Days = useMemo(() => buildNext14Days(), []);

  const buildMonthGrid = (monthDate) => {
    const base = new Date(monthDate);
    base.setDate(1);
    base.setHours(0, 0, 0, 0);

    // Monday-based week (Mon=0..Sun=6)
    const jsDay = base.getDay(); // Sun=0..Sat=6
    const monIndex = (jsDay + 6) % 7;
    const start = new Date(base);
    start.setDate(base.getDate() - monIndex);

    const days = [];
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      days.push({
        key,
        date: d,
        inMonth: d.getMonth() === base.getMonth(),
        label: String(d.getDate()),
      });
    }
    return { monthStart: base, days };
  };

  const ensureSchedule = (v) => ensureScheduleForVolunteer(v, next14Days);

  const toggleAvailabilitySlot = (personId, dayKey, slotKey) => {
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id !== personId) return v;
        const schedule = { ...ensureSchedule(v) };
        const day = { ...(schedule[dayKey] || { am: false, pm: false, onCall: false, hoursNote: '' }) };
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
        schedule[dayKey] = day;
        return { ...v, availabilitySchedule: schedule };
      })
    );
  };

  const setAvailabilityHoursNote = (personId, dayKey, value) => {
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id !== personId) return v;
        const schedule = { ...ensureSchedule(v) };
        const day = { ...(schedule[dayKey] || { am: false, pm: false, onCall: false, hoursNote: '' }) };
        day.hoursNote = String(value || '').slice(0, 80);
        schedule[dayKey] = day;
        return { ...v, availabilitySchedule: schedule };
      })
    );
  };


  const summariseSchedule = (v) => {
    const schedule = ensureSchedule(v);
    let am = 0;
    let pm = 0;
    let onCall = 0;
    for (const k of Object.keys(schedule)) {
      const d = schedule[k];
      if (d?.am) am += 1;
      if (d?.pm) pm += 1;
      if (d?.onCall) onCall += 1;
    }
    return { am, pm, onCall };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBackgroundCheckColor = (status) => {
    switch (status) {
      case 'valid': return 'text-green-600';
      case 'expires-soon': return 'text-orange-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesRole = selectedRole === 'all' || volunteer.role === selectedRole;
    const skills = Array.isArray(volunteer.skills) ? volunteer.skills : [];
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const applicantStages = [
    { id: 'all', name: 'All Stages', tone: 'stage-all' },
    { id: 'application-received', name: 'Application Received', tone: 'stage-received' },
    { id: 'informal-chat-booked', name: 'Informal Chat Booked', tone: 'stage-chat' },
    { id: 'interview-complete', name: 'Interview Complete', tone: 'stage-interview' },
    { id: 'offered', name: 'Offered', tone: 'stage-offered' },
    { id: 'onboarded', name: 'Onboarded', tone: 'stage-onboarded' },
    { id: 'on-file', name: 'On file', tone: 'stage-onfile' },
    { id: 'rejected', name: 'Rejected', tone: 'stage-rejected' },
  ];

  const applicantRoleFilterDefs = [
    { id: 'all', name: 'All roles', tone: 'role-all' },
    { id: 'delivery', name: 'Drivers', tone: 'role-delivery' },
    { id: 'packer', name: 'Packers', tone: 'role-packer' },
    { id: 'admin', name: 'Admin support', tone: 'role-admin' },
  ];

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'application-received':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'informal-chat-booked':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview-complete':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'offered':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'onboarded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-file':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      case 'rejected':
        return 'bg-red-100 text-red-900 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const advanceApplicant = (id) => {
    const stageOrder = ['application-received', 'informal-chat-booked', 'interview-complete', 'offered', 'onboarded'];
    setApplicants((current) => {
      const applicant = current.find((x) => x.id === id);
      if (!applicant) return current;
      if (applicantNeedsFounderDocReviewToAdvance(applicant) && !applicantCanAdvanceStage(applicant)) {
        window.alert(
          'Open the application and tick “Documents reviewed” after you have checked driver documents (licence + insurance) and any DBS evidence they offered — upload or in person. Then you can move them to the next stage.'
        );
        return current;
      }
      const idx = stageOrder.indexOf(applicant.stage);
      const nextStage = idx >= 0 && idx < stageOrder.length - 1 ? stageOrder[idx + 1] : null;
      if (nextStage === 'onboarded' && !applicantMeetsOnboardingDocRequirements(applicant)) {
        window.alert(
          'Before onboarding: DBS must be provided (upload or in person). Drivers also need licence + insurance (upload or in person).'
        );
        return current;
      }
      return current.map((a) => {
        if (a.id !== id) return a;
        const index = stageOrder.indexOf(a.stage);
        if (index < 0 || index === stageOrder.length - 1) return a;
        const nextStage = stageOrder[index + 1];
        addAudit({
          action: 'volunteer_application_stage_advanced',
          entityType: 'volunteer_application',
          entityId: a.id,
          details: `${a.name} moved from ${a.stage} → ${nextStage}`,
        });
        return { ...a, stage: nextStage };
      });
    });
  };

  const rejectApplicant = (id) => {
    if (!window.confirm('Mark this application as rejected? It will leave the active onboarding pipeline.')) return;
    setApplicants((current) =>
      current.map((applicant) => {
        if (applicant.id !== id) return applicant;
        addAudit({
          action: 'volunteer_application_rejected',
          entityType: 'volunteer_application',
          entityId: applicant.id,
          details: `${applicant.name} (${applicant.email}) marked rejected`,
        });
        return { ...applicant, stage: 'rejected' };
      })
    );
  };

  const keepApplicantOnFile = (id) => {
    if (
      !window.confirm(
        'Keep this application on file for future opportunities? You can find them again using the “On file” stage filter.'
      )
    )
      return;
    setApplicants((current) =>
      current.map((applicant) => {
        if (applicant.id !== id) return applicant;
        addAudit({
          action: 'volunteer_application_on_file',
          entityType: 'volunteer_application',
          entityId: applicant.id,
          details: `${applicant.name} (${applicant.email}) kept on file`,
        });
        return { ...applicant, stage: 'on-file' };
      })
    );
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesStage = selectedApplicantStage === 'all' || applicant.stage === selectedApplicantStage;
    const matchesRole = selectedApplicantRole === 'all' || applicant.roleApplied === selectedApplicantRole;
    const q = applicantSearchQuery.trim().toLowerCase();
    const matchesApplicantSearch =
      !q ||
      applicant.name.toLowerCase().includes(q) ||
      applicant.roleApplied.toLowerCase().includes(q) ||
      applicant.email.toLowerCase().includes(q);
    return matchesStage && matchesRole && matchesApplicantSearch;
  });

  const recruitmentSnapshot = useMemo(() => {
    const drivers = volunteers.filter((v) => v.role === 'delivery').length;
    const packers = volunteers.filter((v) => v.role === 'packer').length;
    const admins = volunteers.filter((v) => v.role === 'admin').length;
    const other = volunteers.filter((v) => !['delivery', 'packer', 'admin'].includes(v.role)).length;

    const newApplications = applicants.filter((a) => a.stage === 'application-received').length;
    const inProgress = applicants.filter((a) =>
      ['informal-chat-booked', 'interview-complete'].includes(a.stage)
    ).length;
    const offered = applicants.filter((a) => a.stage === 'offered').length;
    const onboardedCount = applicants.filter((a) => a.stage === 'onboarded').length;

    return {
      drivers,
      packers,
      admins,
      other,
      newApplications,
      inProgress,
      offered,
      onboardedCount,
    };
  }, [volunteers, applicants]);

  const updateApplicant = (id, patch) => {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const updateVolunteer = (id, patch) => {
    setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const inviteDefaults = useMemo(() => {
    const iso = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    iso.setHours(10, 0, 0, 0);
    return {
      title: 'Informal chat — LUNA SEN Pantry',
      when: iso.toISOString().slice(0, 16),
      durationMins: 20,
      location: 'Phone / Google Meet',
      notes: 'A friendly chat to confirm availability and answer questions.',
    };
  }, []);

  const meetingInviteDefaults = useMemo(() => {
    const iso = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    iso.setHours(10, 0, 0, 0);
    return {
      title: 'LUNA SEN Pantry — meeting / informal chat',
      when: iso.toISOString().slice(0, 16),
      durationMins: 30,
      location: 'Zoom / Google Meet / voice call (add your link in the email)',
      notes: 'Informal chat — confirm attendance, training, or onboarding. Edit this text before sending.',
    };
  }, []);

  function buildMailto({ to, subject, body }) {
    const s = encodeURIComponent(subject || '');
    const b = encodeURIComponent(body || '');
    return `mailto:${encodeURIComponent(to || '')}?subject=${s}&body=${b}`;
  }

  function downloadIcs({ title, startIsoLocal, durationMins, location, description, attendeeEmail }) {
    const start = new Date(startIsoLocal);
    const end = new Date(start.getTime() + Number(durationMins || 20) * 60 * 1000);

    const toIcsDate = (d) => {
      // UTC format: YYYYMMDDTHHMMSSZ
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

    const uid = `luna-${Date.now()}@luna-sen-pantry`;
    const dtstamp = toIcsDate(new Date());
    const dtstart = toIcsDate(start);
    const dtend = toIcsDate(end);
    const safe = (v) => String(v || '').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LUNA SEN Pantry//Admin//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${safe(title)}`,
      location ? `LOCATION:${safe(location)}` : '',
      description ? `DESCRIPTION:${safe(description)}` : '',
      attendeeEmail ? `ATTENDEE;CN=${safe(attendeeEmail)}:MAILTO:${safe(attendeeEmail)}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean);

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna-interview-${(attendeeEmail || 'applicant').replace(/[^a-z0-9]/gi, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getInviteFormData() {
    const modal = document.querySelector('#admin-modal-title')?.closest('.admin-panel__modal');
    const form = modal?.querySelector('form');
    if (!form) return null;
    const fd = new FormData(form);
    return {
      when: String(fd.get('when') || ''),
      duration: Number(fd.get('duration') || 20),
      location: String(fd.get('location') || ''),
      notes: String(fd.get('notes') || ''),
      attendeeName: String(fd.get('attendeeName') || '').trim(),
      attendeeEmail: String(fd.get('attendeeEmail') || '').trim(),
    };
  }

  function csvCell(v) {
    const s = String(v ?? '');
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function volunteerServiceMonths(v) {
    const iso = v?.joinDate;
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return Math.max(0, months);
  }

  function downloadIndividualVolunteerReport(volunteer) {
    if (!volunteer) return;
    const v = volunteer;
    const genDate = new Date();
    const ymd = genDate.toISOString().slice(0, 10);

    const lines = [];
    const row = (k, val) => `${csvCell(k)},${csvCell(val)}`;

    lines.push(row('Organisation', 'LUNA SEN Pantry'));
    lines.push(row('Report title', 'Volunteer record (individual)'));
    lines.push(row('Generated (ISO)', genDate.toISOString()));
    lines.push(row('Volunteer ID', v.id || '—'));
    lines.push(row('Name', v.name || '—'));
    lines.push(row('Email', v.email || '—'));
    lines.push(row('Phone', v.phone || '—'));
    lines.push(row('Role', v.role || '—'));
    lines.push(row('Status', String(v.status || '').replace(/-/g, ' ') || '—'));
    lines.push(row('Join date', v.joinDate || '—'));
    lines.push(row('Time served (months)', volunteerServiceMonths(v)));
    lines.push(row('Last active', formatDateTime(v.lastActiveAt)));
    lines.push(row('Hours (this month)', v.hoursThisMonth ?? 0));
    lines.push(row('Hours (total)', v.totalHours ?? 0));
    lines.push(row('Families served (count)', v.familiesServedCount ?? 0));
    lines.push(row('Deliveries completed (count)', v.deliveriesCompletedCount ?? 0));
    lines.push(row('Support needs (flag)', v.supportNeedsFlag ? 'Yes' : 'No'));
    lines.push(row('Support notes', v.supportNeedsNotes || '—'));
    lines.push(row('Progression stage', v.progressionStage || '—'));
    lines.push(row('Recognition / awards', v.recognitionNotes || '—'));
    lines.push(row('File notes', v.notes || '—'));
    lines.push(row('Background check status', String(v.backgroundCheck || '').replace(/-/g, ' ') || '—'));
    lines.push(row('Driving licence file', v.drivingLicenceProofFileName || '—'));
    lines.push(row('Insurance file', v.insuranceProofFileName || '—'));
    lines.push(row('DBS file', v.dbsProofFileName || '—'));
    lines.push(row('Training', Array.isArray(v.training) ? v.training.join('; ') : ''));
    lines.push(row('Skills', Array.isArray(v.skills) ? v.skills.join('; ') : ''));
    lines.push(row('Volunteer values pledge', v.volunteerValuesAcceptedAt ? 'Recorded' : 'Not recorded in app'));
    lines.push(row('Values recorded at', v.volunteerValuesAcceptedAt ? formatDateTime(v.volunteerValuesAcceptedAt) : '—'));
    lines.push(row('Employment & placement suitability', volunteerEmploymentSuitability(v)));
    lines.push(row('Disclaimer', 'Internal coordination record. Verify facts before external references.'));

    const csv = `\uFEFFsep=,\r\n${lines.join('\r\n')}\r\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = String(v.name || 'volunteer').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    a.href = url;
    a.download = `luna-volunteer-${safeName || 'record'}-${ymd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addAudit({
      action: 'volunteer_individual_report_exported',
      entityType: 'volunteers',
      entityId: v.id || 'volunteer',
      details: `Exported individual volunteer report: ${v.name || v.email || v.id || '—'}`,
    });
  }

  function daysSinceLastActive(iso) {
    if (!iso) return 999;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return 999;
    return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
  }

  function volunteerAttendanceSummary(v) {
    const days = daysSinceLastActive(v.lastActiveAt);
    const parts = [];
    if (v.signedInNow) parts.push('Signed in to session now');
    if (days <= 3) parts.push('Active within last 3 days');
    else if (days <= 14) parts.push('Active within last 2 weeks');
    else if (days < 90) parts.push(`Last activity ${days} days ago`);
    else parts.push('Long gap since last recorded activity');
    const h = Number(v.hoursThisMonth || 0);
    if (h >= 16) parts.push('High hours this month');
    else if (h >= 8) parts.push('Regular hours this month');
    else if (h > 0) parts.push('Limited hours this month');
    else parts.push('No hours logged this month');
    return parts.join(' · ');
  }

  function volunteerPerformanceRating(v) {
    const st = String(v.status || '');
    const days = daysSinceLastActive(v.lastActiveAt);
    const h = Number(v.hoursThisMonth || 0);
    if (st === 'inactive' || days > 60) return 'Needs attention — low recent engagement';
    if (st === 'on-leave') return 'On leave — performance not assessed this period';
    if (v.backgroundCheck === 'expired') return 'Needs attention — DBS / check expired';
    if (v.backgroundCheck === 'expires-soon') return 'Satisfactory — renew background check soon';
    if (h >= 12 && days <= 14) return 'Strong — consistent contribution';
    if (h >= 4 && days <= 21) return 'Satisfactory — meeting expectations';
    if (h > 0 || days <= 30) return 'Satisfactory — monitor hours / availability';
    return 'Review — increase touchpoints or update volunteer list';
  }

  function volunteerEmploymentSuitability(v) {
    const st = String(v.status || '');
    if (st === 'inactive') return 'Not currently suitable for new placement';
    if (v.backgroundCheck === 'expired') return 'Not suitable until background check renewed';
    if (st === 'on-leave') return 'Suitable after return from leave — confirm dates';
    if (v.backgroundCheck === 'expires-soon') return 'Suitable with condition — prioritise DBS renewal';
    if (st === 'active' && v.backgroundCheck === 'valid') return 'Suitable for active volunteer placement (subject to interview)';
    return 'Review file — confirm status and checks before offer';
  }

  function downloadVolunteerTrainingCalendar() {
    const pad = (n) => String(n).padStart(2, '0');
    const toIcsDate = (d) =>
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z';
    const safe = (x) => String(x || '').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

    const now = new Date();
    const events = [];
    for (let m = 0; m < 4; m += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() + m, 1, 12, 0, 0, 0);
      while (d.getDay() !== 2) d.setDate(d.getDate() + 1);
      const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 18, 30, 0));
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      events.push({ start, end, uid: `luna-train-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}@luna-sen-pantry` });
    }

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LUNA SEN Pantry//Volunteer training template//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:LUNA SEN Pantry — volunteer training',
    ];
    events.forEach((ev) => {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${ev.uid}`,
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${toIcsDate(ev.start)}`,
        `DTEND:${toIcsDate(ev.end)}`,
        `SUMMARY:${safe('LUNA SEN Pantry — team training / briefing')}`,
        `DESCRIPTION:${safe('Template dates (first Tuesday of month, 18:30 UTC). Adjust in your calendar and confirm final sessions on Admin → Announcements.')}`,
        'LOCATION:LUNA SEN Pantry (confirm venue)',
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna-volunteer-training-calendar-${new Date().toISOString().slice(0, 10)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    addAudit({
      action: 'volunteer_training_calendar_downloaded',
      entityType: 'volunteers',
      entityId: 'calendar',
      details: 'Downloaded volunteer training calendar template (.ics)',
    });
  }

  const downloadVolunteerListCsv = () => {
    const rows = filteredVolunteers;
    if (!rows.length) {
      window.alert('No volunteers match the current filters. Clear search or widen the role filter, then try again.');
      return;
    }

    const roleLabel = roleOptions.find((r) => r.id === selectedRole)?.name || 'All roles';
    const genDate = new Date();
    const genReadable = genDate.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const tableHeader = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Join date',
      'Last active',
      'Hours (this month)',
      'Hours (total)',
      'Next commitment',
      'Values pledge (recorded in app)',
      'Values recorded at',
      'Driving licence proof (on file)',
      'Insurance proof (on file)',
      'DBS proof (on file)',
      'Notes',
    ];

    const dataLines = rows.map((r) =>
      [
        r.id,
        r.name,
        r.email,
        r.phone,
        r.role,
        String(r.status || '').replace(/-/g, ' '),
        r.joinDate,
        formatDateTime(r.lastActiveAt),
        r.hoursThisMonth,
        r.totalHours,
        r.nextShift || '—',
        r.volunteerValuesAcceptedAt ? 'Yes' : 'No',
        r.volunteerValuesAcceptedAt ? formatDateTime(r.volunteerValuesAcceptedAt) : '—',
        r.drivingLicenceProofFileName || '—',
        r.insuranceProofFileName || '—',
        r.dbsProofFileName || '—',
        r.notes || '—',
      ].map(csvCell)
    );

    const meta = [
      ['Organisation', 'LUNA SEN Pantry'],
      ['Export title', 'Volunteer list (summary)'],
      ['Generated', genReadable],
      ['Role filter', roleLabel],
      ['Search text', searchTerm.trim() || '(none)'],
      ['Row count', String(rows.length)],
    ].map((pair) => `${csvCell(pair[0])},${csvCell(pair[1])}`);

    const csvBody = [tableHeader.map(csvCell).join(','), ...dataLines.map((line) => line.join(','))].join('\r\n');
    const csv = `\uFEFFsep=,\r\n${meta.join('\r\n')}\r\n\r\n${csvBody}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna-volunteer-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addAudit({
      action: 'volunteer_list_exported',
      entityType: 'volunteers',
      entityId: 'list',
      details: `Exported volunteer list summary: ${rows.length} row(s); filters: ${roleLabel}`,
    });
    window.alert(`Volunteer list downloaded (${rows.length} row${rows.length === 1 ? '' : 's'}).`);
  };

  const downloadVolunteerReport = () => {
    const rows = filteredVolunteers;
    if (!rows.length) {
      window.alert('No volunteers match the current filters. Clear search or widen the role filter, then try again.');
      return;
    }

    const roleLabel = roleOptions.find((r) => r.id === selectedRole)?.name || 'All roles';
    const genDate = new Date();
    const genIso = genDate.toISOString();
    const genReadable = genDate.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const tableHeader = [
      'Name',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Join date',
      'Last active',
      'Signed in now',
      'Hours (this month)',
      'Hours (total)',
      'Availability slots (AM / PM / on-call)',
      'Attendance summary',
      'Performance (period view)',
      'Background check',
      'Driving licence proof (filename on file)',
      'Insurance proof (filename on file)',
      'DBS proof (filename on file)',
      'Training completed',
      'Skills',
      'Next commitment',
      'Supervisor / file notes',
      'Volunteer values pledge (app)',
      'Values recorded at',
      'Employment & placement suitability',
    ];

    const dataLines = rows.map((r) => {
      const s = summariseSchedule(r);
      const roster = `${s.am} AM · ${s.pm} PM · ${s.onCall} on-call`;
      return [
        r.name,
        r.email,
        r.phone,
        r.role,
        String(r.status || '').replace(/-/g, ' '),
        r.joinDate,
        formatDateTime(r.lastActiveAt),
        r.signedInNow ? 'Yes' : 'No',
        r.hoursThisMonth,
        r.totalHours,
        roster,
        volunteerAttendanceSummary(r),
        volunteerPerformanceRating(r),
        String(r.backgroundCheck || '').replace(/-/g, ' '),
        r.drivingLicenceProofFileName || '—',
        r.insuranceProofFileName || '—',
        r.dbsProofFileName || '—',
        Array.isArray(r.training) ? r.training.join('; ') : '',
        Array.isArray(r.skills) ? r.skills.join('; ') : '',
        r.nextShift,
        r.notes,
        r.volunteerValuesAcceptedAt ? `Yes (${r.volunteerValuesVersion || VOLUNTEER_VALUES_VERSION})` : 'No',
        r.volunteerValuesAcceptedAt ? formatDateTime(r.volunteerValuesAcceptedAt) : '—',
        volunteerEmploymentSuitability(r),
      ].map(csvCell);
    });

    const meta = [
      ['Organisation', 'LUNA SEN Pantry'],
      ['Report title', 'Volunteer record — attendance, performance & employment reference'],
      ['Generated', genReadable],
      ['ISO timestamp', genIso],
      ['Role filter', roleLabel],
      ['Search text', searchTerm.trim() || '(none)'],
      ['Row count', String(rows.length)],
      ['Disclaimer', 'For internal HR / coordination. Verify facts before external references.'],
    ].map((pair) => `${csvCell(pair[0])},${csvCell(pair[1])}`);

    const csvBody = [tableHeader.map(csvCell).join(','), ...dataLines.map((line) => line.join(','))].join('\r\n');
    const csv = `\uFEFFsep=,\r\n${meta.join('\r\n')}\r\n\r\n${csvBody}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna-volunteer-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addAudit({
      action: 'volunteer_report_exported',
      entityType: 'volunteers',
      entityId: 'list',
      details: `Exported professional report: ${rows.length} row(s); filters: ${roleLabel}; search: ${searchTerm.trim() || 'none'}`,
    });
    window.alert(
      `Report downloaded (${rows.length} volunteer${rows.length === 1 ? '' : 's'}). Open in Excel or Google Sheets. It includes attendance, performance, notes, and employment suitability columns.`
    );
  };

  const submitNewVolunteer = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const role = String(fd.get('role') || 'delivery');
    const valuesAgreed = fd.get('volunteerValuesAgreed') === 'on';
    if (!name || !email) {
      window.alert('Name and email are required.');
      return;
    }
    if (!valuesAgreed) {
      window.alert(
        'Please confirm the volunteer values pledge — patience, understanding, and commitment to help — before saving.'
      );
      return;
    }
    const id = `VOL-${Date.now().toString(36)}`.toUpperCase();
    setVolunteers((prev) => [
      ...prev,
      {
        id,
        name,
        email,
        phone: phone || '—',
        role,
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
        lastActiveAt: new Date().toISOString(),
        signedInNow: false,
        hoursThisMonth: 0,
        totalHours: 0,
        familiesServedCount: 0,
        deliveriesCompletedCount: 0,
        supportNeedsFlag: false,
        supportNeedsNotes: '',
        progressionStage: 'Onboarding',
        recognitionNotes: '',
        availability: [],
        availabilitySchedule: buildEmptySchedule(buildNext14Days()),
        skills: [],
        backgroundCheck: 'valid',
        training: [],
        notes: 'Added from Volunteers screen.',
        emergencyContact: '—',
        address: 'Local Area',
        nextShift: 'Not scheduled',
        drivingLicenceProofDataUrl: '',
        drivingLicenceProofFileName: '',
        insuranceProofDataUrl: '',
        insuranceProofFileName: '',
        dbsProofDataUrl: '',
        dbsProofFileName: '',
        volunteerValuesAcceptedAt: new Date().toISOString(),
        volunteerValuesVersion: VOLUNTEER_VALUES_VERSION,
      },
    ]);
    addAudit({
      action: 'volunteer_created',
      entityType: 'volunteer',
      entityId: id,
      details: `Added volunteer ${name} (${email}) · ${role}`,
    });
    setAddVolunteerOpen(false);
    e.currentTarget.reset();
    window.alert(`${name} was added to the volunteer list for this session.`);
  };

  const team = {
    navigate,
    addAudit,
    volunteers,
    setVolunteers,
    selectedRole,
    setSelectedRole,
    searchTerm,
    setSearchTerm,
    expandedVolunteerId,
    setExpandedVolunteerId,
    personModal,
    setPersonModal,
    selectedApplicantStage,
    setSelectedApplicantStage,
    selectedApplicantRole,
    setSelectedApplicantRole,
    applicantSearchQuery,
    setApplicantSearchQuery,
    inviteOpen,
    setInviteOpen,
    inviteApplicant,
    setInviteApplicant,
    applicants,
    setApplicants,
    roleOptions,
    filteredVolunteers,
    filteredApplicants,
    recruitmentSnapshot,
    applicantStages,
    applicantRoleFilterDefs,
    formatDateTime,
    next14Days,
    buildMonthGrid,
    ensureSchedule,
    toggleAvailabilitySlot,
    setAvailabilityHoursNote,
    summariseSchedule,
    getStatusColor,
    getBackgroundCheckColor,
    getStageBadge,
    advanceApplicant,
    rejectApplicant,
    keepApplicantOnFile,
    updateApplicant,
    updateVolunteer,
    addVolunteerOpen,
    setAddVolunteerOpen,
    submitNewVolunteer,
    inviteDefaults,
    meetingInviteDefaults,
    buildMailto,
    downloadIcs,
    getInviteFormData,
    downloadVolunteerTrainingCalendar,
    downloadVolunteerListCsv,
    downloadVolunteerReport,
    STANDALONE_MEETING,
  };

  return (
    <TeamRecruitmentContext.Provider value={team}>
      <Outlet />

            <AdminPanelModal isOpen={addVolunteerOpen} onClose={() => setAddVolunteerOpen(false)} title="Add new volunteer">
        <form className="space-y-5" onSubmit={submitNewVolunteer}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="admin-panel__label" htmlFor="new-vol-name">
                Full name
              </label>
              <input id="new-vol-name" name="name" className="admin-panel__input" required autoComplete="name" />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-panel__label" htmlFor="new-vol-email">
                Email
              </label>
              <input id="new-vol-email" name="email" type="email" className="admin-panel__input" required autoComplete="email" />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-panel__label" htmlFor="new-vol-phone">
                Phone (optional)
              </label>
              <input id="new-vol-phone" name="phone" type="tel" className="admin-panel__input" autoComplete="tel" />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-panel__label" htmlFor="new-vol-role">
                Role
              </label>
              <select id="new-vol-role" name="role" className="admin-panel__input" defaultValue="delivery">
                <option value="delivery">Delivery</option>
                <option value="packer">Packer</option>
                <option value="admin">Admin support</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="specialist">SEN specialist</option>
              </select>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <label className="flex cursor-pointer gap-3 text-left">
                <input
                  id="new-vol-values"
                  name="volunteerValuesAgreed"
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                  required
                />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Volunteer values pledge</span> — I confirm this person understands
                  our food bank welcomes everyone with patience and respect, will treat families and colleagues with understanding, and wants
                  to help people in need in line with LUNA SEN Pantry’s values (including any induction / policies you share outside the app).
                </span>
              </label>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            This adds the person to the volunteer list in your current session (and audit log). Follow up with your usual onboarding / DBS process
            outside the app.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" className="admin-panel__btn admin-panel__btn--outline flex-1 rounded-xl px-6 py-3" onClick={() => setAddVolunteerOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="admin-panel__btn admin-panel__btn--primary flex-1 rounded-xl px-6 py-3">
              Save to volunteer list
            </button>
          </div>
        </form>
      </AdminPanelModal>

      <AdminPanelModal
        isOpen={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setInviteApplicant(null);
        }}
        title={
          inviteApplicant?.isStandaloneMeeting
            ? 'Schedule meeting'
            : inviteApplicant
              ? `Invite: ${inviteApplicant.name}`
              : 'Invite'
        }
        wide
      >
        {inviteApplicant ? (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            {inviteApplicant.isStandaloneMeeting ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="admin-panel__label text-left" htmlFor="meet-attendee-name">
                    Attendee name
                  </label>
                  <input
                    id="meet-attendee-name"
                    name="attendeeName"
                    className="admin-panel__input"
                    placeholder="e.g. Emma Thompson"
                    autoComplete="name"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="admin-panel__label text-left" htmlFor="meet-attendee-email">
                    Attendee email
                  </label>
                  <input
                    id="meet-attendee-email"
                    name="attendeeEmail"
                    type="email"
                    className="admin-panel__input"
                    placeholder="For Zoom / Meet invite email"
                    autoComplete="email"
                  />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="admin-panel__label text-left" htmlFor="invite-when">
                  Date &amp; time
                </label>
                <input
                  id="invite-when"
                  name="when"
                  type="datetime-local"
                  className="admin-panel__input"
                  defaultValue={inviteApplicant.isStandaloneMeeting ? meetingInviteDefaults.when : inviteDefaults.when}
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <label className="admin-panel__label text-left" htmlFor="invite-duration">
                  Duration (mins)
                </label>
                <input
                  id="invite-duration"
                  name="duration"
                  type="number"
                  min="10"
                  step="5"
                  className="admin-panel__input"
                  defaultValue={inviteApplicant.isStandaloneMeeting ? meetingInviteDefaults.durationMins : inviteDefaults.durationMins}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-panel__label text-left" htmlFor="invite-location">
                  Location / call type
                </label>
                <input
                  id="invite-location"
                  name="location"
                  className="admin-panel__input"
                  defaultValue={inviteApplicant.isStandaloneMeeting ? meetingInviteDefaults.location : inviteDefaults.location}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-panel__label text-left" htmlFor="invite-notes">
                  Notes to include
                </label>
                <textarea
                  id="invite-notes"
                  name="notes"
                  className="admin-panel__input"
                  defaultValue={inviteApplicant.isStandaloneMeeting ? meetingInviteDefaults.notes : inviteDefaults.notes}
                  rows={4}
                  style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">What happens next</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                <li>
                  <span className="font-semibold">Open email invite</span> launches your mail app with a draft — add a Zoom or Meet link if needed.
                </li>
                <li>
                  <span className="font-semibold">Download .ics</span> adds the slot to your calendar (share or attach for the other person).
                </li>
              </ul>
            </div>

            <div className="admin-panel__invite-modal-actions">
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--accent-pink rounded-xl px-6 py-3"
                onClick={() => {
                  const data = getInviteFormData();
                  if (!data) return;
                  const { when, duration, location, notes, attendeeName, attendeeEmail } = data;

                  if (inviteApplicant.isStandaloneMeeting) {
                    if (!attendeeEmail || !attendeeEmail.includes('@')) {
                      window.alert('Please enter the attendee’s email so the draft can be addressed (Zoom / Meet / follow-up).');
                      return;
                    }
                    addAudit({
                      action: 'volunteer_meeting_email_opened',
                      entityType: 'volunteers',
                      entityId: 'meeting',
                      details: `Meeting email draft for ${attendeeName || attendeeEmail} · ${new Date(when).toLocaleString('en-GB')} · ${duration} mins`,
                    });
                    const subject = 'LUNA SEN Pantry — meeting / informal chat';
                    const greet = attendeeName ? `Hi ${attendeeName},` : 'Hi,';
                    const body = [
                      greet,
                      '',
                      'We’d like to schedule a quick informal chat (voice / video or phone — whatever works best).',
                      '',
                      `Time: ${new Date(when).toLocaleString('en-GB')}`,
                      `Duration: ${duration} minutes`,
                      location ? `How we’ll meet: ${location}` : '',
                      '',
                      notes ? `Details: ${notes}` : '',
                      '',
                      'If you need a different time, reply to this email.',
                      '',
                      'Kind regards,',
                      'LUNA SEN Pantry',
                    ]
                      .filter(Boolean)
                      .join('\n');
                    window.location.href = buildMailto({ to: attendeeEmail, subject, body });
                    return;
                  }

                  addAudit({
                    action: 'volunteer_invite_email_opened',
                    entityType: 'volunteer_application',
                    entityId: inviteApplicant.id,
                    details: `Email invite opened for ${inviteApplicant.name} (${inviteApplicant.email}) · ${new Date(when).toLocaleString('en-GB')} · ${duration} mins`,
                  });
                  const subject = `Interview invite: ${inviteApplicant.name} (${inviteApplicant.id})`;
                  const body = [
                    `Hi ${inviteApplicant.name},`,
                    '',
                    `Thanks for applying to volunteer with LUNA SEN Pantry. We’d love to schedule a quick informal chat.`,
                    '',
                    `Time: ${new Date(when).toLocaleString('en-GB')}`,
                    `Duration: ${duration} minutes`,
                    location ? `Location: ${location}` : '',
                    '',
                    notes ? `Notes: ${notes}` : '',
                    '',
                    'Kind regards,',
                    'LUNA SEN Pantry',
                  ]
                    .filter(Boolean)
                    .join('\n');
                  window.location.href = buildMailto({ to: inviteApplicant.email, subject, body });
                }}
              >
                Open email invite
              </button>
              <button
                type="button"
                className="admin-panel__btn admin-panel__btn--accent-blue rounded-xl px-6 py-3"
                onClick={() => {
                  const data = getInviteFormData();
                  if (!data) return;

                  if (inviteApplicant.isStandaloneMeeting) {
                    addAudit({
                      action: 'volunteer_meeting_calendar_downloaded',
                      entityType: 'volunteers',
                      entityId: 'meeting',
                      details: `Meeting .ics downloaded · ${new Date(data.when).toLocaleString('en-GB')}`,
                    });
                    downloadIcs({
                      title: meetingInviteDefaults.title,
                      startIsoLocal: data.when,
                      durationMins: data.duration,
                      location: data.location,
                      description: data.notes,
                      attendeeEmail: data.attendeeEmail || '',
                    });
                    return;
                  }

                  addAudit({
                    action: 'volunteer_invite_calendar_downloaded',
                    entityType: 'volunteer_application',
                    entityId: inviteApplicant.id,
                    details: `Calendar invite downloaded for ${inviteApplicant.name} (${inviteApplicant.email}) · ${new Date(data.when).toLocaleString('en-GB')}`,
                  });
                  downloadIcs({
                    title: inviteDefaults.title,
                    startIsoLocal: data.when,
                    durationMins: data.duration,
                    location: data.location,
                    description: data.notes,
                    attendeeEmail: inviteApplicant.email,
                  });
                }}
              >
                Download calendar (.ics)
              </button>
            </div>
          </form>
        ) : null}
      </AdminPanelModal>

      <AdminPanelModal
        isOpen={personModal.open}
        onClose={() => setPersonModal({ open: false, kind: 'volunteer', mode: 'view', person: null })}
        title={
          personModal.person
            ? personModal.kind === 'applicant'
              ? `Application: ${personModal.person.name}`
              : `Volunteer: ${personModal.person.name}`
            : ''
        }
      >
        {personModal.person ? (
          personModal.kind === 'applicant' ? (
            <div className="admin-panel__applicant-detail">
              <div className="admin-panel__applicant-detail__hero">
                <span className="admin-panel__applicant-detail__hero-id">{personModal.person.id}</span>
                <span className="admin-panel__applicant-detail__hero-pill admin-panel__applicant-detail__hero-pill--role">
                  {modalApplicantRoleLabel(personModal.person.roleApplied)}
                </span>
                <span className="admin-panel__applicant-detail__hero-pill admin-panel__applicant-detail__hero-pill--stage">
                  {(
                    applicantStages.find((s) => s.id === personModal.person.stage)?.name ||
                    String(personModal.person.stage || '').replace(/-/g, ' ')
                  ).toUpperCase()}
                </span>
              </div>

              <div className="admin-panel__applicant-detail__section admin-panel__applicant-detail__section--contact">
                <p className="admin-panel__applicant-detail__section-title">Contact</p>
                <p className="admin-panel__applicant-detail__value">{personModal.person.email}</p>
                {'phone' in personModal.person && personModal.person.phone ? (
                  <p
                    className="admin-panel__applicant-detail__value"
                    style={{ marginTop: '0.5rem', fontSize: 'var(--luna-font-size-sm)', fontWeight: 600 }}
                  >
                    {personModal.person.phone}
                  </p>
                ) : null}
              </div>

              {applicantIsDriver(personModal.person) ? (
                <div className="admin-panel__applicant-detail__section admin-panel__applicant-detail__section--compliance">
                  <p className="admin-panel__applicant-detail__section-title">Driver compliance</p>
                  <div className="admin-panel__applicant-detail__compliance-list">
                    <div className="admin-panel__applicant-detail__compliance-row">
                      <label htmlFor="app-modal-licence">
                        <span className="admin-panel__applicant-detail__compliance-label">Driving licence</span>
                        <input
                          id="app-modal-licence"
                          type="checkbox"
                          className="admin-panel__applicant-detail__check"
                          checked={Boolean(personModal.person.driverLicenceOk)}
                          onChange={(e) => {
                            updateApplicant(personModal.person.id, { driverLicenceOk: e.target.checked });
                            setPersonModal((p) => ({
                              ...p,
                              person: { ...p.person, driverLicenceOk: e.target.checked },
                            }));
                            addAudit({
                              action: 'driver_doc_updated',
                              entityType: 'volunteer_application',
                              entityId: personModal.person.id,
                              details: `Driving licence marked ${e.target.checked ? 'OK' : 'missing'} for ${personModal.person.name}`,
                            });
                          }}
                        />
                      </label>
                    </div>
                    <div className="admin-panel__applicant-detail__compliance-row">
                      <label htmlFor="app-modal-insurance">
                        <span className="admin-panel__applicant-detail__compliance-label">Insurance</span>
                        <input
                          id="app-modal-insurance"
                          type="checkbox"
                          className="admin-panel__applicant-detail__check"
                          checked={Boolean(personModal.person.insuranceOk)}
                          onChange={(e) => {
                            updateApplicant(personModal.person.id, { insuranceOk: e.target.checked });
                            setPersonModal((p) => ({
                              ...p,
                              person: { ...p.person, insuranceOk: e.target.checked },
                            }));
                            addAudit({
                              action: 'driver_doc_updated',
                              entityType: 'volunteer_application',
                              entityId: personModal.person.id,
                              details: `Insurance marked ${e.target.checked ? 'OK' : 'missing'} for ${personModal.person.name}`,
                            });
                          }}
                        />
                      </label>
                    </div>
                    <div className="admin-panel__applicant-detail__compliance-row">
                      <label htmlFor="app-modal-vehicle">
                        <span className="admin-panel__applicant-detail__compliance-label">Vehicle</span>
                        <input
                          id="app-modal-vehicle"
                          type="checkbox"
                          className="admin-panel__applicant-detail__check"
                          checked={Boolean(personModal.person.vehicleOk)}
                          onChange={(e) => {
                            updateApplicant(personModal.person.id, { vehicleOk: e.target.checked });
                            setPersonModal((p) => ({
                              ...p,
                              person: { ...p.person, vehicleOk: e.target.checked },
                            }));
                            addAudit({
                              action: 'driver_doc_updated',
                              entityType: 'volunteer_application',
                              entityId: personModal.person.id,
                              details: `Vehicle marked ${e.target.checked ? 'OK' : 'missing'} for ${personModal.person.name}`,
                            });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="admin-panel__applicant-detail__hint">
                    Internal checklist only — changes are audit logged. Upload insurance proof in the section below when
                    you have a file from the applicant.
                  </p>
                </div>
              ) : null}

              <div className="admin-panel__applicant-detail__section admin-panel__applicant-detail__section--review">
                <p className="admin-panel__applicant-detail__section-title">Document status</p>
                <p className="admin-panel__applicant-detail__hint" style={{ marginTop: 0, marginBottom: '0.65rem' }}>
                  See what the applicant submitted on the form. You can add uploads below after seeing originals in
                  person.
                </p>
                <div className="admin-panel__applicant-detail__doc-status-chips" aria-label="Document status">
                  {applicantIsDriver(personModal.person) ? (
                    <span
                      className={`admin-panel__applicant-detail__doc-chip ${
                        String(personModal.person.insuranceProofDataUrl || '').trim() && personModal.person.insuranceProofFileName
                          ? 'admin-panel__applicant-detail__doc-chip--ok'
                          : personModal.person.bringInsuranceInPerson
                            ? 'admin-panel__applicant-detail__doc-chip--pending'
                            : 'admin-panel__applicant-detail__doc-chip--warn'
                      }`}
                    >
                      Insurance:{' '}
                      {String(personModal.person.insuranceProofDataUrl || '').trim() && personModal.person.insuranceProofFileName
                        ? 'Uploaded'
                        : personModal.person.bringInsuranceInPerson
                          ? 'In person'
                          : 'Not provided'}
                    </span>
                  ) : (
                    <span className="admin-panel__applicant-detail__doc-chip admin-panel__applicant-detail__doc-chip--na">
                      Insurance: N/A (not a driver role)
                    </span>
                  )}
                  {applicantIsDriver(personModal.person) ? (
                    <span
                      className={`admin-panel__applicant-detail__doc-chip ${
                        String(personModal.person.drivingLicenceProofDataUrl || '').trim() && personModal.person.drivingLicenceProofFileName
                          ? 'admin-panel__applicant-detail__doc-chip--ok'
                          : personModal.person.bringDrivingLicenceInPerson
                            ? 'admin-panel__applicant-detail__doc-chip--pending'
                            : 'admin-panel__applicant-detail__doc-chip--warn'
                      }`}
                    >
                      Licence:{' '}
                      {String(personModal.person.drivingLicenceProofDataUrl || '').trim() && personModal.person.drivingLicenceProofFileName
                        ? 'Uploaded'
                        : personModal.person.bringDrivingLicenceInPerson
                          ? 'In person'
                          : 'Not provided'}
                    </span>
                  ) : (
                    <span className="admin-panel__applicant-detail__doc-chip admin-panel__applicant-detail__doc-chip--na">
                      Licence: N/A (not a driver role)
                    </span>
                  )}
                  <span
                    className={`admin-panel__applicant-detail__doc-chip ${
                      String(personModal.person.dbsProofDataUrl || '').trim() && personModal.person.dbsProofFileName
                        ? 'admin-panel__applicant-detail__doc-chip--ok'
                        : personModal.person.bringDbsInPerson
                          ? 'admin-panel__applicant-detail__doc-chip--pending'
                          : 'admin-panel__applicant-detail__doc-chip--warn'
                    }`}
                  >
                    DBS:{' '}
                    {String(personModal.person.dbsProofDataUrl || '').trim() && personModal.person.dbsProofFileName
                      ? 'Uploaded'
                      : personModal.person.bringDbsInPerson
                        ? 'In person'
                        : 'Not provided'}
                  </span>
                </div>
                {applicantIsDriver(personModal.person) ? (
                  <label className="admin-panel__applicant-detail__inperson-row" htmlFor="app-bring-ins-ip">
                    <input
                      id="app-bring-ins-ip"
                      type="checkbox"
                      className="admin-panel__applicant-detail__check"
                      checked={Boolean(personModal.person.bringInsuranceInPerson)}
                      onChange={(e) => {
                        const v = e.target.checked;
                        const id = personModal.person.id;
                        updateApplicant(id, { bringInsuranceInPerson: v });
                        setPersonModal((p) => ({
                          ...p,
                          person: p.person ? { ...p.person, bringInsuranceInPerson: v } : null,
                        }));
                        addAudit({
                          action: 'volunteer_application_field_updated',
                          entityType: 'volunteer_application',
                          entityId: id,
                          details: `Insurance in-person flag set to ${v} for ${personModal.person.name}`,
                        });
                      }}
                    />
                    <span>Applicant is showing motor insurance in person (not uploaded here)</span>
                  </label>
                ) : null}
                {applicantIsDriver(personModal.person) ? (
                  <label className="admin-panel__applicant-detail__inperson-row" htmlFor="app-bring-lic-ip">
                    <input
                      id="app-bring-lic-ip"
                      type="checkbox"
                      className="admin-panel__applicant-detail__check"
                      checked={Boolean(personModal.person.bringDrivingLicenceInPerson)}
                      onChange={(e) => {
                        const v = e.target.checked;
                        const id = personModal.person.id;
                        updateApplicant(id, { bringDrivingLicenceInPerson: v });
                        setPersonModal((p) => ({
                          ...p,
                          person: p.person ? { ...p.person, bringDrivingLicenceInPerson: v } : null,
                        }));
                        addAudit({
                          action: 'volunteer_application_field_updated',
                          entityType: 'volunteer_application',
                          entityId: id,
                          details: `Driving licence in-person flag set to ${v} for ${personModal.person.name}`,
                        });
                      }}
                    />
                    <span>Applicant is showing driving licence in person (not uploaded here)</span>
                  </label>
                ) : null}
                <label className="admin-panel__applicant-detail__inperson-row" htmlFor="app-bring-dbs-ip">
                  <input
                    id="app-bring-dbs-ip"
                    type="checkbox"
                    className="admin-panel__applicant-detail__check"
                    checked={Boolean(personModal.person.bringDbsInPerson)}
                    onChange={(e) => {
                      const v = e.target.checked;
                      const id = personModal.person.id;
                      updateApplicant(id, { bringDbsInPerson: v });
                      setPersonModal((p) => ({
                        ...p,
                        person: p.person ? { ...p.person, bringDbsInPerson: v } : null,
                      }));
                      addAudit({
                        action: 'volunteer_application_field_updated',
                        entityType: 'volunteer_application',
                        entityId: id,
                        details: `DBS in-person flag set to ${v} for ${personModal.person.name}`,
                      });
                    }}
                  />
                  <span>Applicant is showing DBS / update evidence in person</span>
                </label>
              </div>

              <div className="admin-panel__applicant-detail__section admin-panel__applicant-detail__section--docs">
                <p className="admin-panel__applicant-detail__section-title">Proof on file</p>
                <p className="admin-panel__applicant-detail__hint" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                  Matches the public volunteer form: photo, PDF, or camera. Stored in this browser session until you
                  connect cloud storage.
                </p>
                {applicantIsDriver(personModal.person) ? (
                  <AdminVolunteerDocSlot
                    label="Motor insurance (driver)"
                    dataUrl={personModal.person.insuranceProofDataUrl}
                    fileName={personModal.person.insuranceProofFileName}
                    chooseId={`app-ins-file-${personModal.person.id}`}
                    cameraId={`app-ins-cam-${personModal.person.id}`}
                    onUploaded={({ dataUrl, fileName }) => {
                      const id = personModal.person.id;
                      const name = personModal.person.name;
                      updateApplicant(id, { insuranceProofDataUrl: dataUrl, insuranceProofFileName: fileName });
                      setPersonModal((prev) => ({
                        ...prev,
                        person: prev.person
                          ? {
                              ...prev.person,
                              insuranceProofDataUrl: dataUrl,
                              insuranceProofFileName: fileName,
                            }
                          : null,
                      }));
                      addAudit({
                        action: 'volunteer_insurance_doc_attached',
                        entityType: 'volunteer_application',
                        entityId: id,
                        details: `Insurance proof attached for ${name}`,
                      });
                    }}
                    onClear={() => {
                      const id = personModal.person.id;
                      const name = personModal.person.name;
                      updateApplicant(id, { insuranceProofDataUrl: '', insuranceProofFileName: '' });
                      setPersonModal((prev) => ({
                        ...prev,
                        person: prev.person
                          ? { ...prev.person, insuranceProofDataUrl: '', insuranceProofFileName: '' }
                          : null,
                      }));
                      addAudit({
                        action: 'volunteer_insurance_doc_removed',
                        entityType: 'volunteer_application',
                        entityId: id,
                        details: `Insurance proof removed for ${name}`,
                      });
                    }}
                  />
                ) : null}
                {applicantIsDriver(personModal.person) ? (
                  <AdminVolunteerDocSlot
                    label="Driving licence (driver)"
                    dataUrl={personModal.person.drivingLicenceProofDataUrl}
                    fileName={personModal.person.drivingLicenceProofFileName}
                    chooseId={`app-lic-file-${personModal.person.id}`}
                    cameraId={`app-lic-cam-${personModal.person.id}`}
                    onUploaded={({ dataUrl, fileName }) => {
                      const id = personModal.person.id;
                      const name = personModal.person.name;
                      updateApplicant(id, { drivingLicenceProofDataUrl: dataUrl, drivingLicenceProofFileName: fileName });
                      setPersonModal((prev) => ({
                        ...prev,
                        person: prev.person
                          ? {
                              ...prev.person,
                              drivingLicenceProofDataUrl: dataUrl,
                              drivingLicenceProofFileName: fileName,
                            }
                          : null,
                      }));
                      addAudit({
                        action: 'volunteer_licence_doc_attached',
                        entityType: 'volunteer_application',
                        entityId: id,
                        details: `Driving licence proof attached for ${name}`,
                      });
                    }}
                    onClear={() => {
                      const id = personModal.person.id;
                      const name = personModal.person.name;
                      updateApplicant(id, { drivingLicenceProofDataUrl: '', drivingLicenceProofFileName: '' });
                      setPersonModal((prev) => ({
                        ...prev,
                        person: prev.person
                          ? { ...prev.person, drivingLicenceProofDataUrl: '', drivingLicenceProofFileName: '' }
                          : null,
                      }));
                      addAudit({
                        action: 'volunteer_licence_doc_removed',
                        entityType: 'volunteer_application',
                        entityId: id,
                        details: `Driving licence proof removed for ${name}`,
                      });
                    }}
                  />
                ) : null}
                <AdminVolunteerDocSlot
                  label="DBS / safeguarding"
                  dataUrl={personModal.person.dbsProofDataUrl}
                  fileName={personModal.person.dbsProofFileName}
                  chooseId={`app-dbs-file-${personModal.person.id}`}
                  cameraId={`app-dbs-cam-${personModal.person.id}`}
                  onUploaded={({ dataUrl, fileName }) => {
                    const id = personModal.person.id;
                    const name = personModal.person.name;
                    updateApplicant(id, { dbsProofDataUrl: dataUrl, dbsProofFileName: fileName });
                    setPersonModal((prev) => ({
                      ...prev,
                      person: prev.person
                        ? { ...prev.person, dbsProofDataUrl: dataUrl, dbsProofFileName: fileName }
                        : null,
                    }));
                    addAudit({
                      action: 'volunteer_dbs_doc_attached',
                      entityType: 'volunteer_application',
                      entityId: id,
                      details: `DBS-related document attached for ${name}`,
                    });
                  }}
                  onClear={() => {
                    const id = personModal.person.id;
                    const name = personModal.person.name;
                    updateApplicant(id, { dbsProofDataUrl: '', dbsProofFileName: '' });
                    setPersonModal((prev) => ({
                      ...prev,
                      person: prev.person
                        ? { ...prev.person, dbsProofDataUrl: '', dbsProofFileName: '' }
                        : null,
                    }));
                    addAudit({
                      action: 'volunteer_dbs_doc_removed',
                      entityType: 'volunteer_application',
                      entityId: id,
                      details: `DBS-related document removed for ${name}`,
                    });
                  }}
                />
              </div>

              {personModal.person.stage === 'application-received' ? (
                <div className="admin-panel__applicant-detail__section admin-panel__applicant-detail__section--founder-review">
                  <p className="admin-panel__applicant-detail__section-title">Lauren — ready for next stage</p>
                  <p className="admin-panel__applicant-detail__hint" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                    After you have checked uploads here and/or what they showed in person (and added files if needed),
                    confirm below. Only then can you use <strong>Next stage</strong> on the recruitment list.
                  </p>
                  <label
                    className={`admin-panel__applicant-detail__founder-verify ${
                      !applicantCanMarkDocumentsReviewed(personModal.person)
                        ? 'admin-panel__applicant-detail__founder-verify--disabled'
                        : ''
                    }`}
                    htmlFor="app-founder-docs-verified"
                  >
                    <input
                      id="app-founder-docs-verified"
                      type="checkbox"
                      className="admin-panel__applicant-detail__check"
                      disabled={!applicantCanMarkDocumentsReviewed(personModal.person)}
                      checked={Boolean(personModal.person.founderDocsVerified)}
                      onChange={(e) => {
                        const v = e.target.checked;
                        const id = personModal.person.id;
                        const name = personModal.person.name;
                        updateApplicant(id, { founderDocsVerified: v });
                        setPersonModal((p) => ({
                          ...p,
                          person: p.person ? { ...p.person, founderDocsVerified: v } : null,
                        }));
                        addAudit({
                          action: 'volunteer_application_doc_review',
                          entityType: 'volunteer_application',
                          entityId: id,
                          details: `Documents reviewed flag ${v ? 'ON' : 'OFF'} for ${name} (driver: licence+insurance; DBS — upload or in person)`,
                        });
                      }}
                    />
                    <span>
                      I have reviewed this applicant&apos;s driver documents (licence + insurance, if driver) and DBS — upload
                      and/or in person. They may move to the next recruitment stage.
                    </span>
                  </label>
                  {!applicantCanMarkDocumentsReviewed(personModal.person) ? (
                    <p className="admin-panel__applicant-detail__hint" style={{ marginTop: '0.65rem' }}>
                      For <strong>drivers</strong>, provide licence + insurance (upload and/or in person) before this box can be used.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {personModal.mode === 'view' ? (
                <div className="admin-panel__applicant-detail__section admin-panel__applicant-detail__section--notes">
                  <p className="admin-panel__applicant-detail__section-title">Application notes</p>
                  <p className="admin-panel__applicant-detail__notes">{personModal.person.notes || '—'}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Contact</p>
                <p className="mt-2 font-bold text-gray-900">{personModal.person.email}</p>
                {'phone' in personModal.person ? (
                  <p className="mt-1 text-sm font-semibold text-gray-700">{personModal.person.phone}</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Volunteer values pledge</p>
                <p className="mt-2 text-sm text-gray-700">
                  {personModal.person.volunteerValuesAcceptedAt
                    ? `Recorded in admin on ${formatDateTime(personModal.person.volunteerValuesAcceptedAt)} (pledge version ${personModal.person.volunteerValuesVersion || VOLUNTEER_VALUES_VERSION}).`
                    : 'Not recorded in this app yet — note acceptance in file notes or confirm at induction.'}
                </p>
              </div>

              <div className="admin-panel__applicant-detail__section admin-panel__applicant-detail__section--docs">
                <p className="admin-panel__applicant-detail__section-title">Compliance documents</p>
                <p className="admin-panel__applicant-detail__hint" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                  Same uploads as the volunteer application form — view, add, or replace here for active volunteers.
                </p>
                {personModal.person.role === 'delivery' ? (
                  <>
                    <AdminVolunteerDocSlot
                    label="Driving licence (driver)"
                    dataUrl={personModal.person.drivingLicenceProofDataUrl}
                    fileName={personModal.person.drivingLicenceProofFileName}
                    chooseId={`vol-lic-file-${personModal.person.id}`}
                    cameraId={`vol-lic-cam-${personModal.person.id}`}
                    onUploaded={({ dataUrl, fileName }) => {
                      const id = personModal.person.id;
                      const name = personModal.person.name;
                      updateVolunteer(id, { drivingLicenceProofDataUrl: dataUrl, drivingLicenceProofFileName: fileName });
                      setPersonModal((prev) => ({
                        ...prev,
                        person: prev.person
                          ? {
                              ...prev.person,
                              drivingLicenceProofDataUrl: dataUrl,
                              drivingLicenceProofFileName: fileName,
                            }
                          : null,
                      }));
                      addAudit({
                        action: 'volunteer_licence_doc_attached',
                        entityType: 'volunteer',
                        entityId: id,
                        details: `Driving licence proof attached for volunteer ${name}`,
                      });
                    }}
                    onClear={() => {
                      const id = personModal.person.id;
                      const name = personModal.person.name;
                      updateVolunteer(id, { drivingLicenceProofDataUrl: '', drivingLicenceProofFileName: '' });
                      setPersonModal((prev) => ({
                        ...prev,
                        person: prev.person
                          ? { ...prev.person, drivingLicenceProofDataUrl: '', drivingLicenceProofFileName: '' }
                          : null,
                      }));
                      addAudit({
                        action: 'volunteer_licence_doc_removed',
                        entityType: 'volunteer',
                        entityId: id,
                        details: `Driving licence proof removed for volunteer ${name}`,
                      });
                    }}
                  />
                  <AdminVolunteerDocSlot
                    label="Motor insurance (driver)"
                    dataUrl={personModal.person.insuranceProofDataUrl}
                    fileName={personModal.person.insuranceProofFileName}
                    chooseId={`vol-ins-file-${personModal.person.id}`}
                    cameraId={`vol-ins-cam-${personModal.person.id}`}
                    onUploaded={({ dataUrl, fileName }) => {
                      const id = personModal.person.id;
                      const name = personModal.person.name;
                      updateVolunteer(id, { insuranceProofDataUrl: dataUrl, insuranceProofFileName: fileName });
                      setPersonModal((prev) => ({
                        ...prev,
                        person: prev.person
                          ? {
                              ...prev.person,
                              insuranceProofDataUrl: dataUrl,
                              insuranceProofFileName: fileName,
                            }
                          : null,
                      }));
                      addAudit({
                        action: 'volunteer_insurance_doc_attached',
                        entityType: 'volunteer',
                        entityId: id,
                        details: `Insurance proof attached for volunteer ${name}`,
                      });
                    }}
                    onClear={() => {
                      const id = personModal.person.id;
                      const name = personModal.person.name;
                      updateVolunteer(id, { insuranceProofDataUrl: '', insuranceProofFileName: '' });
                      setPersonModal((prev) => ({
                        ...prev,
                        person: prev.person
                          ? { ...prev.person, insuranceProofDataUrl: '', insuranceProofFileName: '' }
                          : null,
                      }));
                      addAudit({
                        action: 'volunteer_insurance_doc_removed',
                        entityType: 'volunteer',
                        entityId: id,
                        details: `Insurance proof removed for volunteer ${name}`,
                      });
                    }}
                  />
                  </>
                ) : null}
                <AdminVolunteerDocSlot
                  label="DBS / safeguarding"
                  dataUrl={personModal.person.dbsProofDataUrl}
                  fileName={personModal.person.dbsProofFileName}
                  chooseId={`vol-dbs-file-${personModal.person.id}`}
                  cameraId={`vol-dbs-cam-${personModal.person.id}`}
                  onUploaded={({ dataUrl, fileName }) => {
                    const id = personModal.person.id;
                    const name = personModal.person.name;
                    updateVolunteer(id, { dbsProofDataUrl: dataUrl, dbsProofFileName: fileName });
                    setPersonModal((prev) => ({
                      ...prev,
                      person: prev.person
                        ? { ...prev.person, dbsProofDataUrl: dataUrl, dbsProofFileName: fileName }
                        : null,
                    }));
                    addAudit({
                      action: 'volunteer_dbs_doc_attached',
                      entityType: 'volunteer',
                      entityId: id,
                      details: `DBS-related document attached for volunteer ${name}`,
                    });
                  }}
                  onClear={() => {
                    const id = personModal.person.id;
                    const name = personModal.person.name;
                    updateVolunteer(id, { dbsProofDataUrl: '', dbsProofFileName: '' });
                    setPersonModal((prev) => ({
                      ...prev,
                      person: prev.person
                        ? { ...prev.person, dbsProofDataUrl: '', dbsProofFileName: '' }
                        : null,
                    }));
                    addAudit({
                      action: 'volunteer_dbs_doc_removed',
                      entityType: 'volunteer',
                      entityId: id,
                      details: `DBS-related document removed for volunteer ${name}`,
                    });
                  }}
                />
              </div>

              {personModal.mode === 'view' ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Service, progression &amp; support</p>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Families served</p>
                      <input
                        className="admin-panel__input mt-2"
                        type="number"
                        min="0"
                        value={Number(personModal.person.familiesServedCount || 0)}
                        onChange={(e) => {
                          const v = Math.max(0, Number(e.target.value || 0));
                          updateVolunteer(personModal.person.id, { familiesServedCount: v });
                          setPersonModal((p) => ({
                            ...p,
                            person: p.person ? { ...p.person, familiesServedCount: v } : null,
                          }));
                          addAudit({
                            action: 'volunteer_service_metric_updated',
                            entityType: 'volunteer',
                            entityId: personModal.person.id,
                            details: `Families served set to ${v} for ${personModal.person.name}`,
                          });
                        }}
                      />
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Deliveries completed</p>
                      <input
                        className="admin-panel__input mt-2"
                        type="number"
                        min="0"
                        value={Number(personModal.person.deliveriesCompletedCount || 0)}
                        onChange={(e) => {
                          const v = Math.max(0, Number(e.target.value || 0));
                          updateVolunteer(personModal.person.id, { deliveriesCompletedCount: v });
                          setPersonModal((p) => ({
                            ...p,
                            person: p.person ? { ...p.person, deliveriesCompletedCount: v } : null,
                          }));
                          addAudit({
                            action: 'volunteer_service_metric_updated',
                            entityType: 'volunteer',
                            entityId: personModal.person.id,
                            details: `Deliveries completed set to ${v} for ${personModal.person.name}`,
                          });
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Progression stage</p>
                      <input
                        className="admin-panel__input mt-2"
                        value={String(personModal.person.progressionStage || '')}
                        onChange={(e) => {
                          const v = String(e.target.value || '').slice(0, 60);
                          updateVolunteer(personModal.person.id, { progressionStage: v });
                          setPersonModal((p) => ({
                            ...p,
                            person: p.person ? { ...p.person, progressionStage: v } : null,
                          }));
                          addAudit({
                            action: 'volunteer_progression_updated',
                            entityType: 'volunteer',
                            entityId: personModal.person.id,
                            details: `Progression stage updated for ${personModal.person.name}`,
                          });
                        }}
                        placeholder="e.g. Onboarding · Active · Mentor · Team lead"
                      />
                    </div>
                    <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <label className="flex items-start gap-3 text-left">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                          checked={Boolean(personModal.person.supportNeedsFlag)}
                          onChange={(e) => {
                            const v = e.target.checked;
                            updateVolunteer(personModal.person.id, { supportNeedsFlag: v });
                            setPersonModal((p) => ({
                              ...p,
                              person: p.person ? { ...p.person, supportNeedsFlag: v } : null,
                            }));
                            addAudit({
                              action: 'volunteer_support_flag_updated',
                              entityType: 'volunteer',
                              entityId: personModal.person.id,
                              details: `Support needs flag set to ${v} for ${personModal.person.name}`,
                            });
                          }}
                        />
                        <span className="text-sm font-semibold text-gray-800">This volunteer needs additional support / check-in</span>
                      </label>
                      <textarea
                        className="admin-panel__input mt-3"
                        rows={3}
                        value={String(personModal.person.supportNeedsNotes || '')}
                        onChange={(e) => {
                          const v = String(e.target.value || '').slice(0, 400);
                          updateVolunteer(personModal.person.id, { supportNeedsNotes: v });
                          setPersonModal((p) => ({
                            ...p,
                            person: p.person ? { ...p.person, supportNeedsNotes: v } : null,
                          }));
                        }}
                        placeholder="What support is needed? (e.g. buddy shifts, check-in call, role adjustment)"
                      />
                    </div>
                    <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Recognition / service notes</p>
                      <textarea
                        className="admin-panel__input mt-2"
                        rows={3}
                        value={String(personModal.person.recognitionNotes || '')}
                        onChange={(e) => {
                          const v = String(e.target.value || '').slice(0, 400);
                          updateVolunteer(personModal.person.id, { recognitionNotes: v });
                          setPersonModal((p) => ({
                            ...p,
                            person: p.person ? { ...p.person, recognitionNotes: v } : null,
                          }));
                        }}
                        placeholder="Milestones, awards, feedback highlights, commendations…"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {personModal.mode === 'view' ? (
                <div className="admin-panel__vol-profile-actions admin-panel__vol-profile-actions--spaced mt-4">
                  <button
                    type="button"
                    className="admin-panel__btn admin-panel__btn--primary admin-panel__vol-profile-actions__download w-full rounded-xl py-3"
                    onClick={() => downloadIndividualVolunteerReport(personModal.person)}
                  >
                    Download report (.csv)
                  </button>
                  <div className="admin-panel__vol-profile-actions__contact">
                    <a
                      className="admin-panel__btn admin-panel__btn--accent-pink rounded-xl py-3"
                      href={`mailto:${encodeURIComponent(personModal.person.email)}`}
                    >
                      Email
                    </a>
                    {'phone' in personModal.person ? (
                      <a
                        className="admin-panel__btn admin-panel__btn--accent-blue rounded-xl py-3"
                        href={`tel:${String(personModal.person.phone || '').replace(/\s+/g, '')}`}
                      >
                        Call
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="admin-panel__btn admin-panel__btn--accent-blue rounded-xl py-3"
                        disabled
                      >
                        Call
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {personModal.mode === 'schedule' ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Next shift</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{personModal.person.nextShift || 'Not scheduled'}</p>
                  <p className="mt-3 text-sm text-gray-600">
                    This is a lightweight schedule view (no paid scheduling tool). Shifts can be managed in the volunteer
                    list data and every change can be logged in Audit.
                  </p>
                </div>
              ) : null}

              {personModal.mode === 'view' ? (
                <div className="admin-panel__applicant-detail__section admin-panel__applicant-detail__section--notes admin-panel__vol-notes-card">
                  <p className="admin-panel__applicant-detail__section-title">Volunteer notes</p>
                  <p className="admin-panel__applicant-detail__notes">{personModal.person.notes || '—'}</p>
                </div>
              ) : null}
            </div>
          )
        ) : null}
      </AdminPanelModal>

      {/* Team availability is self-managed in "My rota". Admin view is read-only. */}
    </TeamRecruitmentContext.Provider>
  );
};
