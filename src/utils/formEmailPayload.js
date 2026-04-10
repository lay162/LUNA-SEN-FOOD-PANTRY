/**
 * Shared HTML/plain payloads for form notification emails (EmailJS + Cloud Function SMTP).
 * Keep in sync with functions/formEmailPayload.cjs
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatValue(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object' && !Array.isArray(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

export function formTypeLabel(formType) {
  if (formType === 'referral') return 'Support referral';
  if (formType === 'volunteer') return 'Volunteer application';
  if (formType === 'story') return 'Story / thank you';
  return String(formType || 'Website form');
}

function urgencyLabel(v) {
  const u = String(v || '').toLowerCase();
  if (u === 'urgent') return 'Urgent';
  if (u === 'normal') return 'Normal';
  return v || '—';
}

function buildReferralSummaryLines(data) {
  const d = data || {};
  const name = `${String(d.firstName || '').trim()} ${String(d.lastName || '').trim()}`.trim() || '—';
  const contactBits = [
    d.phone && `Phone: ${d.phone}`,
    d.email && `Email: ${d.email}`,
    d.postcode && `Postcode: ${d.postcode}`,
    d.contactPreference && `Preferred contact: ${d.contactPreference}`,
    d.preferredContact && `Best time: ${d.preferredContact}`,
    d.preferredLanguage && `Language: ${d.preferredLanguage}`,
  ].filter(Boolean);

  const senBits = [];
  if (d.hasSpecialNeeds) senBits.push('Household has SEN / additional needs (yes)');
  if (d.senNeedsDetails) senBits.push(`SEN / support details: ${d.senNeedsDetails}`);
  if (d.childSafeFoods) senBits.push(`Safe / preferred foods: ${d.childSafeFoods}`);
  if (d.childFoodAvoid) senBits.push(`Foods to avoid: ${d.childFoodAvoid}`);
  if (d.sensoryNeeds) senBits.push(`Sensory: ${d.sensoryNeeds}`);
  if (d.communicationNeeds) senBits.push(`Communication: ${d.communicationNeeds}`);
  if (d.ehcpStatus) senBits.push(`EHCP: ${d.ehcpStatus}`);
  if (d.dietaryRequirements) senBits.push(`Dietary: ${d.dietaryRequirements}`);
  if (d.allergies) senBits.push(`Allergies: ${d.allergies}`);
  if (Array.isArray(d.dietaryTags) && d.dietaryTags.length) senBits.push(`Diet tags: ${d.dietaryTags.join(', ')}`);

  const notesBits = [];
  if (d.additionalComments) notesBits.push(d.additionalComments);
  if (Array.isArray(d.supportType) && d.supportType.length) notesBits.push(`Support requested: ${d.supportType.join(', ')}`);
  if (d.householdItemsNotes) notesBits.push(`Household items notes: ${d.householdItemsNotes}`);
  if (d.applyingFor === 'on_behalf') {
    notesBits.push(
      `On behalf of another household — org: ${d.submitterOrganisation || '—'}, role: ${d.submitterCapacity || '—'}${d.submitterCapacityDetail ? ` (${d.submitterCapacityDetail})` : ''}`
    );
  }

  return [
    'LUNA SEN PANTRY — referral summary',
    `Submitted: ${new Date().toISOString()}`,
    '',
    `Name: ${name}`,
    '',
    'Contact details:',
    ...contactBits.map((x) => `  ${x}`),
    '',
    `Urgency: ${urgencyLabel(d.urgencyLevel)}`,
    '',
    'SEN & related needs:',
    ...(senBits.length ? senBits.map((x) => `  ${x}`) : ['  (none specified)']),
    '',
    'Notes & other requests:',
    ...(notesBits.length ? notesBits.map((x) => `  ${x}`) : ['  —']),
    '',
  ];
}

export function formatFormBodyPlain(formType, data) {
  const lines = [];
  if (formType === 'referral') {
    lines.push(...buildReferralSummaryLines(data));
    lines.push('---', 'All fields (raw):');
  } else {
    lines.push(`Form: ${formTypeLabel(formType)}`, `Time: ${new Date().toISOString()}`, '---');
  }
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined || value === null) continue;
    const v = formatValue(value);
    if (v === '' || v === 'false') continue;
    lines.push(`${key}: ${v}`);
  }
  return lines.join('\n');
}

function sectionHtml(title, rows) {
  const body =
    rows.length === 0
      ? '<p style="margin:0;color:#555;">—</p>'
      : `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.45;">${rows
          .map(
            ([k, v]) =>
              `<tr><td style="vertical-align:top;padding:4px 12px 4px 0;color:#333;font-weight:600;width:38%;">${escapeHtml(k)}</td><td style="vertical-align:top;padding:4px 0;color:#111;">${escapeHtml(v)}</td></tr>`
          )
          .join('')}</table>`;
  return `<div style="margin-bottom:20px;"><h2 style="margin:0 0 8px;font-size:15px;color:#6b21a8;border-bottom:1px solid #e9d5ff;padding-bottom:6px;">${escapeHtml(title)}</h2>${body}</div>`;
}

function buildReferralHtml(data) {
  const d = data || {};
  const name = `${String(d.firstName || '').trim()} ${String(d.lastName || '').trim()}`.trim() || '—';
  const contactRows = [
    ['Phone', d.phone],
    ['Email', d.email],
    ['Postcode', d.postcode],
    ['Preferred contact method', d.contactPreference],
    ['Best time to contact', d.preferredContact],
    ['Preferred language', d.preferredLanguage],
  ].filter(([, v]) => v != null && String(v).trim() !== '');

  const senRows = [];
  if (d.hasSpecialNeeds) senRows.push(['SEN / additional needs', 'Yes']);
  if (d.senNeedsDetails) senRows.push(['SEN / support details', d.senNeedsDetails]);
  if (d.childSafeFoods) senRows.push(['Safe / preferred foods', d.childSafeFoods]);
  if (d.childFoodAvoid) senRows.push(['Foods to avoid', d.childFoodAvoid]);
  if (d.sensoryNeeds) senRows.push(['Sensory needs', d.sensoryNeeds]);
  if (d.communicationNeeds) senRows.push(['Communication needs', d.communicationNeeds]);
  if (d.ehcpStatus) senRows.push(['EHCP', d.ehcpStatus]);
  if (d.dietaryRequirements) senRows.push(['Dietary requirements', d.dietaryRequirements]);
  if (d.allergies) senRows.push(['Allergies', d.allergies]);
  if (Array.isArray(d.dietaryTags) && d.dietaryTags.length) senRows.push(['Diet tags', d.dietaryTags.join(', ')]);

  const noteParts = [];
  if (d.additionalComments) noteParts.push(d.additionalComments);
  if (Array.isArray(d.supportType) && d.supportType.length) noteParts.push(`Support requested: ${d.supportType.join(', ')}`);
  if (d.householdItemsNotes) noteParts.push(`Household items: ${d.householdItemsNotes}`);
  if (d.applyingFor === 'on_behalf') {
    noteParts.push(
      `Referral on behalf of another household. Organisation: ${d.submitterOrganisation || '—'}. Role: ${d.submitterCapacity || '—'}${d.submitterCapacityDetail ? `. Detail: ${d.submitterCapacityDetail}` : ''}`
    );
  }
  const notesText = noteParts.filter(Boolean).join('\n\n') || '—';

  const wrap = `<div style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">`;
  const head = `<p style="margin:0 0 16px;font-size:13px;color:#666;">LUNA SEN PANTRY · Wirral · <time>${escapeHtml(new Date().toISOString())}</time></p>`;
  const nameBlock = sectionHtml('Name', [['Full name', name]]);
  const urgencyBlock = sectionHtml('Urgency', [['Level', urgencyLabel(d.urgencyLevel)]]);
  const contactBlock = sectionHtml('Contact details', contactRows);
  const senBlock = sectionHtml('SEN & related needs', senRows);
  const notesBlock = sectionHtml('Notes & other requests', [['Details', notesText]]);
  const foot = `<p style="margin:24px 0 0;font-size:12px;color:#888;">This message was generated from the website referral form.</p></div>`;
  return wrap + head + nameBlock + urgencyBlock + contactBlock + senBlock + notesBlock + foot;
}

function buildGenericHtml(formType, data) {
  const rows = [];
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined || value === null) continue;
    const v = formatValue(value);
    if (v === '' || v === 'false') continue;
    rows.push([key, v]);
  }
  const inner = sectionHtml(formTypeLabel(formType), rows);
  return `<div style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;">${inner}<p style="font-size:12px;color:#888;margin-top:16px;">${escapeHtml(new Date().toISOString())}</p></div>`;
}

export function buildFormEmailHtml(formType, data) {
  return formType === 'referral' ? buildReferralHtml(data || {}) : buildGenericHtml(formType, data || {});
}

export function buildFormEmailSubject(formType) {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  if (formType === 'referral') return `[LUNA] New support referral · ${stamp}`;
  if (formType === 'volunteer') return `[LUNA] Volunteer application · ${stamp}`;
  if (formType === 'story') return `[LUNA] Story / thank you · ${stamp}`;
  return `[LUNA] Form: ${formType} · ${stamp}`;
}

export function formReplyToEmail(data) {
  const e = String(data?.email || '').trim();
  return e || undefined;
}
