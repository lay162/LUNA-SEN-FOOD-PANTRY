/**
 * Display names for the admin shell (aligned with demo / Gemini reference).
 */
export function getAdminProfile() {
  if (typeof window === 'undefined') {
    return { displayName: 'Staff', firstName: 'Team' };
  }
  const u = (localStorage.getItem('luna-admin-user') || '').toLowerCase();
  if (!u) {
    return { displayName: 'Staff', firstName: 'Team' };
  }
  const cap = u.charAt(0).toUpperCase() + u.slice(1);
  if (u === 'lunaadmin') return { displayName: 'Luna Admin', firstName: 'Luna' };
  return { displayName: cap, firstName: cap };
}
