import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const p = path.join(root, 'src/pages/Admin/VolunteerManagement.jsx');
let s = fs.readFileSync(p, 'utf8');

const markerInner = '<div className="admin-panel__fade-in admin-panel__page">';
const markerModal = '      <AdminPanelModal isOpen={addVolunteerOpen}';
const innerIdx = s.indexOf(markerInner);
const start = innerIdx > 0 ? s.lastIndexOf('  return (', innerIdx) : -1;
const mid = s.indexOf(markerModal);
console.log('start', start, 'mid', mid, 'innerIdx', innerIdx);
if (start < 0 || mid < 0) {
  console.error('markers', start, mid);
  process.exit(1);
}

const before = s.slice(0, start);
const afterModal = s.slice(mid);

const teamBlock = `  const team = {
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
    updateApplicant,
    addVolunteerOpen,
    setAddVolunteerOpen,
    submitNewVolunteer,
    inviteDefaults,
    meetingInviteDefaults,
    buildMailto,
    downloadIcs,
    getInviteFormData,
    downloadVolunteerTrainingCalendar,
    downloadVolunteerReport,
    STANDALONE_MEETING,
  };

  return (
    <TeamRecruitmentContext.Provider value={team}>
      <Outlet />

      `;

const commentIdx = afterModal.indexOf('      {/* Team availability');
if (commentIdx < 0) {
  console.error('no comment');
  process.exit(1);
}
const modalsOnly = afterModal.slice(0, commentIdx);
const afterComment = afterModal.slice(commentIdx);
const exportBlock = afterComment.slice(afterComment.indexOf('export default'));

const closing = `      {/* Team availability is self-managed in "My rota". Admin view is read-only. */}
    </TeamRecruitmentContext.Provider>
  );
};

`;

const fixed = before + teamBlock + modalsOnly + closing + exportBlock;
fs.writeFileSync(p, fixed.replace('export default VolunteerManagement;\n', ''));
console.log('patched');
