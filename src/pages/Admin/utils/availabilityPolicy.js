/** Interpret YYYY-MM-DD in the browser's local calendar. */
export function isWeekendDayKey(dayKey) {
  const parts = String(dayKey || '').split('-').map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return false;
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 || dow === 6;
}

/**
 * On-call rows must include both AM and PM (= minimum ~12h daytime band in this rota).
 * Weekends / overnight: callers should note extended hours in `hoursNote` when possible.
 *
 * @param {Record<string, { am?: boolean; pm?: boolean; onCall?: boolean; hoursNote?: string }>} schedule
 * @param {{ key: string; inMonth?: boolean; label?: string }[]} days
 */
export function getOnCallPolicyIssues(schedule, days) {
  const violations = [];
  const weekendWithoutNote = [];
  for (const d of days) {
    if (d.inMonth === false) continue;
    const row = schedule[d.key];
    if (!row?.onCall) continue;
    if (!row.am || !row.pm) {
      violations.push({
        key: d.key,
        label: d.label ? `${d.key} (${d.label})` : d.key,
      });
    } else if (isWeekendDayKey(d.key) && !String(row.hoursNote || '').trim()) {
      weekendWithoutNote.push(d.key);
    }
  }
  return { violations, weekendWithoutNote };
}
