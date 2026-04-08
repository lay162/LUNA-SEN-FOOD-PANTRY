export function localDateKey(date) {
  const dt = new Date(date);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildNext14Days() {
  const days = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    days.push({
      key: localDateKey(d),
      label: d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }),
      dayNum: String(d.getDate()),
    });
  }
  return days;
}

export function buildEmptySchedule(next14Days) {
  return Object.fromEntries(
    next14Days.map((d) => [d.key, { am: false, pm: false, onCall: false, hoursNote: '' }])
  );
}

export function ensureSchedule(v, next14Days) {
  if (v && v.availabilitySchedule && typeof v.availabilitySchedule === 'object') return v.availabilitySchedule;
  return buildEmptySchedule(next14Days);
}

export function computeTeamCoverage(volunteers, next14Days) {
  const base = Object.fromEntries(next14Days.map((d) => [d.key, { am: 0, pm: 0, onCall: 0 }]));
  const team = volunteers.filter((v) => v.status !== 'inactive' && v.status !== 'on-leave');
  for (const v of team) {
    const sched = ensureSchedule(v, next14Days);
    for (const dayKey of Object.keys(base)) {
      const row = sched?.[dayKey];
      if (!row) continue;
      if (row.am) base[dayKey].am += 1;
      if (row.pm) base[dayKey].pm += 1;
      if (row.onCall) base[dayKey].onCall += 1;
    }
  }
  return base;
}

/** @param {Record<number, { am?: boolean; pm?: boolean; onCall?: boolean }>} bySun0 — Date.getDay(): 0 Sun … 6 Sat */
export function fillScheduleByWeekdayPattern(schedule, next14Days, bySun0) {
  const next = { ...schedule };
  for (const d of next14Days) {
    const dt = new Date(`${d.key}T12:00:00`);
    const sun0 = dt.getDay();
    const hit = bySun0[sun0];
    if (!hit) continue;
    const cell = { ...(next[d.key] || { am: false, pm: false, onCall: false, hoursNote: '' }) };
    if (hit.onCall) {
      cell.onCall = true;
      cell.am = true;
      cell.pm = true;
    } else {
      if (hit.am) cell.am = true;
      if (hit.pm) cell.pm = true;
    }
    next[d.key] = cell;
  }
  return next;
}

export function scheduleHasAnyBookedSlots(schedule) {
  if (!schedule || typeof schedule !== 'object') return false;
  return Object.values(schedule).some((cell) => cell && (cell.am || cell.pm || cell.onCall));
}

