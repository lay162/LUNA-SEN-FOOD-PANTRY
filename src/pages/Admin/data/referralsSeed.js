/**
 * Initial referral records (demo seed). Persisted overrides live in localStorage via AdminOpsContext.
 * Referrer-facing fields use organisations / places (Wirral-familiar examples), not individual clinician names.
 */

/** Short route/type for meta lines — paired with referrerOrganisation */
const REFERRER_ROUTES = [
  'School or education',
  'Health visiting (NHS)',
  'Social care',
  'GP practice',
  'Charity or community',
  'Faith group',
  'Self-referral',
  'Friend or neighbour',
];

const WIRRAL_REFERRER_ORGS = [
  'Wirral Ark',
  'Citizens Advice Wirral',
  'Age UK Wirral',
  'Wirral Borough Council — social care',
  'Involve Northwest',
  'Neo Community — Wirral',
  'Claremount Community Centre',
  'Wallasey Islamic Centre — outreach',
  'NHS Wirral — health visiting (east)',
  'NHS primary care — Greasby & Pensby network',
  'Wirral school — SENCO (secondary)',
  'Wallasey secondary — pastoral team',
  'Wirral Methodist Housing — support service',
  'Tranmere Rovers in the Community',
  'Faith Hall Food Pantry (Birkenhead)',
  'Magpies Community Space — Neston',
  'Wirral Deen Centre',
];

const PRIORITIES = ['urgent', 'high', 'medium', 'medium'];
const STATUSES_POOL = ['pending', 'pending', 'active', 'active', 'urgent'];

const CORE_REFERRALS = [
  {
    id: 'REF-001',
    familyCode: 'FAM-2024-089',
    referredBy: 'School or education',
    referrerOrganisation: 'Wirral school — SENCO (primary, CH41 area)',
    contactName: 'Sarah Williams',
    contactEmail: 'sarah.williams.family@email.com',
    dateReferred: '2024-01-15',
    priority: 'urgent',
    status: 'pending',
    familySize: 4,
    childrenAges: [6, 8, 12],
    senNeeds: ['Autism', 'ADHD', 'Sensory Processing'],
    dietaryReqs: ['Gluten-Free', 'Dairy-Free'],
    lastContact: '2 days ago',
    nextAction: 'Initial assessment call',
    notes:
      'Mother reports significant food anxiety in 6-year-old. Texture sensitivity extreme. Family struggling with suitable foods after recent diagnosis.',
    urgencyReason: 'Child not eating, weight loss concern',
  },
  {
    id: 'REF-002',
    familyCode: 'FAM-2024-091',
    referredBy: 'Health visiting (NHS)',
    referrerOrganisation: 'NHS Wirral — health visiting (east)',
    contactName: 'Leanne Porter',
    contactEmail: 'leanne.porter.family@email.com',
    dateReferred: '2024-01-12',
    priority: 'high',
    status: 'active',
    familySize: 3,
    childrenAges: [4, 7],
    senNeeds: ['Down Syndrome', 'Swallowing Difficulties'],
    dietaryReqs: ['Soft Foods', 'No Nuts'],
    lastContact: '1 week ago',
    nextAction: 'Weekly food parcel delivery',
    notes: 'Established support plan. Regular deliveries working well. Mother very grateful.',
    packages: ['Weekly SEN-Safe Essentials', 'Soft Foods Pack', 'Child Nutrition Supplements'],
  },
  {
    id: 'REF-003',
    familyCode: 'FAM-2024-087',
    referredBy: 'Social care',
    referrerOrganisation: 'Wirral Borough Council — social care',
    contactName: 'Marcus Lee',
    contactEmail: 'marcus.lee.family@email.com',
    dateReferred: '2024-01-10',
    priority: 'urgent',
    status: 'urgent',
    familySize: 5,
    childrenAges: [3, 5, 9, 11],
    senNeeds: ['Multiple Learning Disabilities', 'Severe Autism'],
    dietaryReqs: ['Limited Safe Foods List', 'Texture-Specific'],
    lastContact: '1 day ago',
    nextAction: 'Emergency food delivery today',
    notes:
      'Crisis situation. Multiple children with severe food limitations. Only 8 foods accepted across all children.',
    urgencyReason: 'Benefits delayed, no food in house, children refusing alternative foods',
    safefoods: [
      'White bread (specific brand)',
      'Plain pasta shapes',
      'Chicken nuggets (frozen)',
      'Banana',
      'Plain rice cakes',
      'UHT milk',
      'Apple juice',
      'Plain digestive biscuits',
    ],
  },
  {
    id: 'REF-004',
    familyCode: 'FAM-2024-093',
    referredBy: 'GP practice',
    referrerOrganisation: 'NHS primary care — Greasby & Pensby network',
    contactName: 'Rachel Owen',
    contactEmail: 'rachel.owen.family@email.com',
    dateReferred: '2024-01-08',
    priority: 'medium',
    status: 'active',
    familySize: 2,
    childrenAges: [14],
    senNeeds: ['Eating Disorder (ARFID)', 'Anxiety'],
    dietaryReqs: ['Very Limited Foods', 'No Food Mixing'],
    lastContact: '3 days ago',
    nextAction: 'Fortnightly check-in call',
    notes:
      'Teenager with ARFID. Progress slow but steady. Mother reports small improvements in food acceptance.',
    packages: ['ARFID-Safe Selection', 'Individual Portions Pack'],
  },
  {
    id: 'REF-005',
    familyCode: 'FAM-2024-101',
    referredBy: 'Self-referral',
    referrerOrganisation: 'Family — direct (no agency)',
    contactName: 'Jordan Hayes',
    contactEmail: 'j.hayes.family@email.com',
    dateReferred: '2024-01-18',
    priority: 'high',
    status: 'pending',
    familySize: 3,
    childrenAges: [5, 9],
    senNeeds: ['Autism', 'Sensory food refusal'],
    dietaryReqs: ['Beige foods only', 'No mixed textures'],
    lastContact: '5 days ago',
    nextAction: 'Call back to complete intake',
    notes: 'Parent reached out directly after hearing about LUNA from a friend.',
  },
  {
    id: 'REF-006',
    familyCode: 'FAM-2024-102',
    referredBy: 'Friend or neighbour',
    referrerOrganisation: 'Community — neighbour support (no organisation)',
    contactName: 'Aliyah Rahman',
    contactEmail: 'aliyah.rahman.family@email.com',
    dateReferred: '2024-01-17',
    priority: 'medium',
    status: 'pending',
    familySize: 4,
    childrenAges: [2, 7, 10],
    senNeeds: ['ADHD', 'Anxiety'],
    dietaryReqs: ['Vegetarian', 'Texture sensitivity'],
    lastContact: '4 days ago',
    nextAction: 'Verify contact details',
    notes: 'Neighbour helped the family submit the form; referrer is not a professional service.',
  },
];

function padRefNum(n) {
  return String(n).padStart(3, '0');
}

const PARENT_NAMES = [
  'Alex Morgan',
  'Sam Taylor',
  'Riley Brooks',
  'Casey Hughes',
  'Morgan Ellis',
  'Jamie Quinn',
  'Drew Patterson',
];

function buildGeneratedReferrals(startNum, count) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const n = startNum + i;
    const route = REFERRER_ROUTES[(n + i) % REFERRER_ROUTES.length];
    const org =
      route === 'Self-referral'
        ? 'Family — direct (no agency)'
        : route === 'Friend or neighbour'
          ? 'Community — personal contact (no organisation)'
          : WIRRAL_REFERRER_ORGS[(n * 3) % WIRRAL_REFERRER_ORGS.length];
    const priority = PRIORITIES[n % PRIORITIES.length];
    const status = STATUSES_POOL[n % STATUSES_POOL.length];
    const contactName = PARENT_NAMES[n % PARENT_NAMES.length];
    out.push({
      id: `REF-${padRefNum(n)}`,
      familyCode: `FAM-2026-${padRefNum(n)}`,
      referredBy: route,
      referrerOrganisation: org,
      contactName,
      contactEmail: `family.ref${n}@example.com`,
      dateReferred: `2026-${padRefNum((n % 12) + 1)}-${padRefNum((n % 27) + 1)}`,
      priority,
      status,
      familySize: 2 + (n % 4),
      childrenAges: [4, 9, 12].slice(0, 1 + (n % 3)),
      senNeeds: ['Autism', 'ADHD'].slice(0, 1 + (n % 2)),
      dietaryReqs: ['Gluten-Free'],
      lastContact: `${(n % 9) + 1} days ago`,
      nextAction: 'Review request',
      notes: `Demo row ${n}; route: ${route}; source: ${org}.`,
    });
  }
  return out;
}

/** ~58 referrals: hand-crafted variety + generated rows for list/pagination demos */
export const REFERRALS_SEED = [...CORE_REFERRALS, ...buildGeneratedReferrals(7, 52)];
