import React, { useState } from 'react';

function scrollToFirstFormError() {
  requestAnimationFrame(() => {
    const el =
      document.querySelector('[aria-invalid="true"]') ||
      document.querySelector('.luna-form-error');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
import FormField from '../components/FormField';
import Button from '../components/Button';
import { useOfflineForm } from '../hooks/useOfflineForm';
import { validateSupportReferralStep } from '../utils/validation';
import '../styles/global.css';
import { ADMIN_EMAIL } from '../constants/contact';

const SUPPORT_OPTIONS = ['Food parcel', 'Clothing', 'Household essentials', 'Other'];
const DIETARY_OPTIONS = ['Halal', 'Kosher', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'];
/** Laundry + washing dishes only — keeps clothes and crockery clean */
const HOUSEHOLD_ITEM_OPTIONS = [
  'Laundry detergent / washing powder or liquid',
  'Fabric conditioner / softener',
  'Washing-up liquid (washing dishes by hand)',
  'Dishwasher tablets',
  'Dish cloths / sponges',
];

const countOptions = (max) =>
  Array.from({ length: max + 1 }, (_, i) => ({ value: String(i), label: String(i) }));

const adultCountOptions = () =>
  Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

const SUBMITTER_CAPACITY_OPTIONS = [
  { value: 'school', label: 'School, nursery, or other education setting' },
  { value: 'nhs_health', label: 'NHS, GP practice, or other health service' },
  { value: 'social_council', label: 'Social care or local council (e.g. Wirral Council)' },
  { value: 'charity', label: 'Charity, food bank, or community organisation' },
  { value: 'faith', label: 'Faith group, church, mosque, temple, or chaplaincy' },
  { value: 'family_friend', label: 'Family member or friend (not a paid service)' },
  { value: 'other', label: 'Other — please describe below' },
];

const HEARD_ABOUT_US_OPTIONS = [
  { value: 'gp', label: 'GP / NHS service' },
  { value: 'school', label: 'School / SENCO / education setting' },
  { value: 'cab', label: 'Citizens Advice (CAB)' },
  { value: 'charity', label: 'Charity / community group' },
  { value: 'social', label: 'Wirral Council / social care' },
  { value: 'faith', label: 'Faith group' },
  { value: 'friend', label: 'Friend / family / neighbour' },
  { value: 'social_media', label: 'Social media (Facebook/Instagram/etc.)' },
  { value: 'search', label: 'Google / internet search' },
  { value: 'poster', label: 'Poster / leaflet' },
  { value: 'other', label: 'Other' },
];

const initialFormData = {
  applyingFor: 'myself',
  submitterOrganisation: '',
  submitterCapacity: '',
  submitterCapacityDetail: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  postcode: '',
  contactPreference: 'phone',
  adultsCount: '',
  childrenCount: '',
  childrenAges: '',
  hasSpecialNeeds: false,
  senNeedsDetails: '',
  childSafeFoods: '',
  childFoodAvoid: '',
  sensoryNeeds: '',
  communicationNeeds: '',
  ehcpStatus: '',
  dietaryRequirements: '',
  allergies: '',
  dietaryTags: [],
  householdItemRequests: [],
  householdItemsNotes: '',
  supportType: [],
  urgencyLevel: 'normal',
  hasPets: false,
  petFoodNeeded: false,
  petDetails: '',
  additionalComments: '',
  consentData: false,
  preferredLanguage: 'english',
  preferredContact: 'weekday',
  heardAboutUs: '',
  heardAboutUsDetail: '',
};

const Support = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;
  const { submitForm, isSubmitting } = useOfflineForm('referral');

  const mirrorSupportToAdminReferrals = (data) => {
    try {
      const LS_REF = 'luna-admin-referrals-v3';
      const toInt = (v) => {
        const n = Number.parseInt(String(v || '0'), 10);
        return Number.isFinite(n) ? n : 0;
      };
      const parseAges = (raw) => {
        const str = String(raw || '').trim();
        if (!str) return [];
        return str
          .split(/[,\n]/g)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => Number.parseInt(s, 10))
          .filter((n) => Number.isFinite(n) && n >= 0 && n <= 120);
      };
      const routeFromCapacity = (d) => {
        if (String(d?.applyingFor || '') !== 'on_behalf') return 'Self-referral';
        const cap = String(d?.submitterCapacity || '').trim();
        const org = String(d?.submitterOrganisation || '').trim().toLowerCase();
        if (cap === 'school') return 'School or education';
        if (cap === 'nhs_health') return 'Health visiting (NHS)';
        if (cap === 'social_council') return 'Social care';
        if (cap === 'faith') return 'Faith group';
        if (cap === 'family_friend') return 'Friend or neighbour';
        if (cap === 'charity') {
          if (org.includes('citizens advice') || org.includes('cab')) return 'Citizens Advice (CAB)';
          return 'Charity or community';
        }
        return 'Other';
      };

      const now = new Date();
      const referredBy = routeFromCapacity(data);
      const submitterOrg = String(data?.submitterOrganisation || '').trim();
      const referrerOrganisation =
        submitterOrg || (referredBy === 'Self-referral' ? 'Family — direct (no agency)' : '');

      const heard = String(data?.heardAboutUs || '').trim();
      const heardDetail = String(data?.heardAboutUsDetail || '').trim();
      const heardLabel =
        heard === 'gp'
          ? 'GP / NHS service'
          : heard === 'school'
            ? 'School / education'
            : heard === 'cab'
              ? 'Citizens Advice (CAB)'
              : heard === 'charity'
                ? 'Charity / community'
                : heard === 'social'
                  ? 'Council / social care'
                  : heard === 'faith'
                    ? 'Faith group'
                    : heard === 'friend'
                      ? 'Friend / family / neighbour'
                      : heard === 'social_media'
                        ? 'Social media'
                        : heard === 'search'
                          ? 'Google / internet search'
                          : heard === 'poster'
                            ? 'Poster / leaflet'
                            : heard || '—';

      const row = {
        id: `REF-WEB-${now.getTime()}`,
        familyCode: `WEB-${String(now.getTime()).slice(-6)}`,
        referredBy,
        referrerOrganisation,
        contactName: `${String(data?.firstName || '').trim()} ${String(data?.lastName || '').trim()}`.trim() || '—',
        contactEmail: String(data?.email || '').trim(),
        dateReferred: now.toISOString().slice(0, 10),
        priority: String(data?.urgencyLevel || '').toLowerCase() === 'urgent' ? 'urgent' : 'medium',
        status: 'pending',
        familySize: Math.max(1, toInt(data?.adultsCount) + toInt(data?.childrenCount)),
        childrenAges: parseAges(data?.childrenAges),
        senNeeds: [],
        dietaryReqs: [],
        lastContact: 'Just now (web)',
        nextAction: 'Initial assessment call',
        notes: [
          `Heard about us: ${heardLabel}${heard === 'other' && heardDetail ? ` — ${heardDetail}` : ''}`,
          String(data?.additionalComments || '').trim(),
        ]
          .filter(Boolean)
          .join('\n\n'),
        heardAboutUs: heardLabel,
      };

      const raw = localStorage.getItem(LS_REF);
      const existing = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(existing) ? existing : [];
      localStorage.setItem(LS_REF, JSON.stringify([row, ...arr].slice(0, 500)));
    } catch {
      // ignore
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => {
      if (name === 'applyingFor' && value === 'myself') {
        return {
          ...prev,
          applyingFor: 'myself',
          submitterOrganisation: '',
          submitterCapacity: '',
          submitterCapacityDetail: '',
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const toggleInArray = (name, item) => {
    setFormData((prev) => {
      const arr = [...(prev[name] || [])];
      const i = arr.indexOf(item);
      if (i === -1) arr.push(item);
      else arr.splice(i, 1);
      return { ...prev, [name]: arr };
    });
  };

  const nextStep = () => {
    const stepErrors = validateSupportReferralStep(formData, currentStep);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setErrors({});
    } else {
      setErrors(stepErrors);
      scrollToFirstFormError();
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    /* Enter in a field submits the form — on steps 1–5 that must advance, not POST a half-filled referral */
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }
    const stepErrors = validateSupportReferralStep(formData, currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      scrollToFirstFormError();
      return;
    }
    const result = await submitForm(formData);
    if (result.success) {
      mirrorSupportToAdminReferrals(formData);
      alert(
        result.offline
          ? result.message ||
              (result.viaEmail
                ? 'Your referral was emailed to the team and a copy was saved on this device.'
                : 'Your referral was saved and will send when you are back online.')
          : 'Thank you — your referral has been submitted. Our team will be in touch.'
      );
      setFormData(initialFormData);
      setCurrentStep(1);
      setErrors({});
    } else {
      alert(result.message || 'We could not submit your referral. Please try again or call 07718851362.');
    }
  };

  const renderCheckboxGroup = (legend, name, options, errorKey) => (
    <fieldset className="luna-form-group" style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend className="luna-form-label">{legend}</legend>
      <div className="luna-checkbox-group" role="group" aria-label={legend}>
        {options.map((opt) => (
          <label key={opt} className="luna-checkbox-group__item">
            <input
              type="checkbox"
              checked={(formData[name] || []).includes(opt)}
              onChange={() => toggleInArray(name, opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {errors[errorKey] && (
        <p className="luna-form-error" role="alert">
          {errors[errorKey]}
        </p>
      )}
    </fieldset>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <FormField
              label="Is this application for your own household, or for someone else you are supporting?"
              name="applyingFor"
              type="radio"
              value={formData.applyingFor}
              onChange={handleInputChange}
              error={errors.applyingFor}
              required
              options={[
                { value: 'myself', label: 'For myself and my household' },
                {
                  value: 'on_behalf',
                  label:
                    'For someone else — I am referring another family or young person (e.g. as a worker, school, friend, or relative)',
                },
              ]}
            />
            {formData.applyingFor === 'on_behalf' && (
              <>
                <p className="luna-form-help" style={{ marginBottom: 'var(--luna-space-4)' }}>
                  We use this to record whether the request came from a service (e.g. GP surgery, Citizens Advice
                  Wirral, Wirral Ark) or from a friend, neighbour, or family member. Fields stay plain language so
                  they work with screen readers and mobiles.
                </p>
                <FormField
                  label="Who is completing this form?"
                  name="submitterCapacity"
                  type="select"
                  value={formData.submitterCapacity}
                  onChange={handleInputChange}
                  error={errors.submitterCapacity}
                  required
                  options={SUBMITTER_CAPACITY_OPTIONS}
                />
                <FormField
                  label="Organisation, school, or place name (if it applies)"
                  name="submitterOrganisation"
                  value={formData.submitterOrganisation}
                  onChange={handleInputChange}
                  error={errors.submitterOrganisation}
                  required
                  placeholder="e.g. Citizens Advice Wirral, Wirral Ark, your school name or GP surgery — or “friend / neighbour”"
                  helpText="If you are a friend or relative without an organisation, you can write “Friend or family” or “None”."
                />
                {formData.submitterCapacity === 'other' && (
                  <FormField
                    label="Briefly describe who you are in relation to the family"
                    name="submitterCapacityDetail"
                    type="textarea"
                    value={formData.submitterCapacityDetail}
                    onChange={handleInputChange}
                    error={errors.submitterCapacityDetail}
                    required
                    placeholder="e.g. extended family member, volunteer, advocate…"
                  />
                )}
              </>
            )}
            <p
              className="luna-form-help"
              style={{ marginBottom: 'var(--luna-space-4)', marginTop: 'var(--luna-space-2)' }}
            >
              {formData.applyingFor === 'on_behalf'
                ? 'Details below should be the family or young person being referred — name, phone, and postcode — so we can contact them about support.'
                : 'Your details below should be for the main contact in the household (usually a parent or carer).'}
            </p>
            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              required
            />
            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              required
            />
            <FormField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              required
              placeholder="07718851362"
            />
            <FormField
              label="Email (optional but recommended)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="you@example.com"
            />
            <FormField
              label="Postcode"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              error={errors.postcode}
              placeholder="e.g. CH41 6EA"
              helpText="We prioritise Wirral (CH) but welcome all referrals."
            />
            <FormField
              label="How should we contact you?"
              name="contactPreference"
              type="select"
              value={formData.contactPreference}
              onChange={handleInputChange}
              error={errors.contactPreference}
              options={[
                { value: 'phone', label: 'Phone' },
                { value: 'text', label: 'Text / SMS' },
                { value: 'email', label: 'Email' },
              ]}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <p className="luna-form-help" style={{ marginBottom: 'var(--luna-space-4)' }}>
              Tell us who lives in your household so we can size food and support appropriately.
            </p>
            <FormField
              label="Number of adults (18+)"
              name="adultsCount"
              type="select"
              value={formData.adultsCount}
              onChange={handleInputChange}
              error={errors.adultsCount}
              required
              options={adultCountOptions()}
            />
            <FormField
              label="Number of children (under 18)"
              name="childrenCount"
              type="select"
              value={formData.childrenCount}
              onChange={handleInputChange}
              error={errors.childrenCount}
              required
              options={countOptions(10)}
            />
            <FormField
              label="Children’s ages"
              name="childrenAges"
              value={formData.childrenAges}
              onChange={handleInputChange}
              error={errors.childrenAges}
              placeholder="e.g. 3, 7 and 14 — or N/A if none"
              helpText="Required if you have children. Helps us with age-appropriate portions and extras."
            />
          </div>
        );
      case 3:
        return (
          <div>
            <p className="luna-form-help" style={{ marginBottom: 'var(--luna-space-4)' }}>
              This step is especially for <strong>children</strong> with SEN or sensory needs around <strong>food</strong> — safe
              meals, trusted brands, and what to avoid. List anything that helps us pack parcels your family can actually use.
            </p>
            <FormField
              label="Does a child in the household have SEN, a disability, or additional needs that affect eating or food?"
              name="hasSpecialNeeds"
              type="checkbox"
              value={formData.hasSpecialNeeds}
              onChange={handleInputChange}
              error={errors.hasSpecialNeeds}
            />
            {formData.hasSpecialNeeds && (
              <FormField
                label="SEN / diagnosis or support (briefly)"
                name="senNeedsDetails"
                type="textarea"
                value={formData.senNeedsDetails}
                onChange={handleInputChange}
                error={errors.senNeedsDetails}
                placeholder="e.g. autism, ARFID, ADHD, learning disability, medical diet from GP or dietitian…"
                helpText="Helps us understand why certain foods matter. Names or initials optional."
              />
            )}
            <FormField
              label="Safe / preferred foods for your children (list brands, meals, snacks that always work)"
              name="childSafeFoods"
              type="textarea"
              value={formData.childSafeFoods}
              onChange={handleInputChange}
              error={errors.childSafeFoods}
              placeholder="e.g. same-brand plain pasta, specific chicken nuggets, smooth yoghurts, beige foods only, school-safe snacks…"
              helpText="The more specific, the better we can match what you already know is safe for them."
            />
            <FormField
              label="Foods or textures to avoid (sensory, taste, allergy, or routine)"
              name="childFoodAvoid"
              type="textarea"
              value={formData.childFoodAvoid}
              onChange={handleInputChange}
              error={errors.childFoodAvoid}
              placeholder="e.g. mixed textures, strong smells, certain colours, new brands, anything crunchy…"
            />
            <FormField
              label="Delivery & packing — other sensory needs (non-food)"
              name="sensoryNeeds"
              type="textarea"
              value={formData.sensoryNeeds}
              onChange={handleInputChange}
              error={errors.sensoryNeeds}
              placeholder="e.g. quiet knock, leave at door, no strong-smelling cleaning products in the bag, routine matters…"
            />
            <FormField
              label="Communication preferences or access needs"
              name="communicationNeeds"
              type="textarea"
              value={formData.communicationNeeds}
              onChange={handleInputChange}
              error={errors.communicationNeeds}
              placeholder="e.g. large print, need a call instead of text, interpreter, quiet doorstep drop…"
            />
            <FormField
              label="EHCP / care plan / diagnosis paperwork"
              name="ehcpStatus"
              type="select"
              value={formData.ehcpStatus}
              onChange={handleInputChange}
              error={errors.ehcpStatus}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'unknown', label: 'Not sure' },
                { value: 'prefer_not', label: 'Prefer not to say' },
              ]}
            />
          </div>
        );
      case 4:
        return (
          <div>
            {renderCheckboxGroup('Types of support needed (tick all that apply)', 'supportType', SUPPORT_OPTIONS, 'supportType')}
            {renderCheckboxGroup(
              'Laundry & washing-up (tick what you need so you can wash clothes and dishes)',
              'householdItemRequests',
              HOUSEHOLD_ITEM_OPTIONS,
              'householdItemRequests'
            )}
            <FormField
              label="Laundry / washing-up — any detail (brand, non-bio, unscented, etc.)"
              name="householdItemsNotes"
              type="textarea"
              value={formData.householdItemsNotes}
              onChange={handleInputChange}
              error={errors.householdItemsNotes}
              placeholder="e.g. non-bio laundry only, sensitive skin, unscented, large family pack…"
              helpText="Optional. We only stock laundry and dish-washing supplies here — not toiletries or general cleaning."
            />
            {renderCheckboxGroup('Dietary labels (tick any that apply)', 'dietaryTags', DIETARY_OPTIONS, 'dietaryTags')}
            <FormField
              label="Other dietary or cultural food needs"
              name="dietaryRequirements"
              type="textarea"
              value={formData.dietaryRequirements}
              onChange={handleInputChange}
              error={errors.dietaryRequirements}
              placeholder="e.g. soft foods, kosher meals, extra calories, baby formula…"
            />
            <FormField
              label="Allergies or intolerances (people in the household)"
              name="allergies"
              type="textarea"
              value={formData.allergies}
              onChange={handleInputChange}
              error={errors.allergies}
              placeholder="List allergens and severity if known (e.g. nuts — anaphylaxis)."
            />
            <FormField
              label="How urgent is support?"
              name="urgencyLevel"
              type="select"
              value={formData.urgencyLevel}
              onChange={handleInputChange}
              error={errors.urgencyLevel}
              required
              options={[
                { value: 'normal', label: 'Within a few days' },
                { value: 'soon', label: 'Needed this week' },
                { value: 'urgent', label: 'Crisis / needed today or tomorrow' },
              ]}
            />
          </div>
        );
      case 5:
        return (
          <div>
            <p className="luna-form-help" style={{ marginBottom: 'var(--luna-space-4)' }}>
              Many families need pet food or litter alongside their own groceries — tell us here so we can try to help.
            </p>
            <FormField
              label="Pets in the household?"
              name="hasPets"
              type="checkbox"
              value={formData.hasPets}
              onChange={handleInputChange}
              error={errors.hasPets}
            />
            {formData.hasPets && (
              <>
                <FormField
                  label="Pets & pet supply needs"
                  name="petDetails"
                  type="textarea"
                  value={formData.petDetails}
                  onChange={handleInputChange}
                  error={errors.petDetails}
                  placeholder="e.g. 1 medium dog — dry food; 2 cats — wet and litter."
                />
                <FormField
                  label="We need help with pet food or supplies"
                  name="petFoodNeeded"
                  type="checkbox"
                  value={formData.petFoodNeeded}
                  onChange={handleInputChange}
                  error={errors.petFoodNeeded}
                />
              </>
            )}
            <FormField
              label="Anything else we should know?"
              name="additionalComments"
              type="textarea"
              value={formData.additionalComments}
              onChange={handleInputChange}
              error={errors.additionalComments}
              placeholder="Other agencies involved, access instructions, safeguarding notes, or anything not covered above."
              helpText="Optional — share only what you are comfortable with."
            />
          </div>
        );
      case 6:
        return (
          <div>
            <FormField
              label="How did you hear about LUNA SEN Pantry?"
              name="heardAboutUs"
              type="select"
              value={formData.heardAboutUs}
              onChange={handleInputChange}
              error={errors.heardAboutUs}
              required
              options={HEARD_ABOUT_US_OPTIONS}
              helpText="This helps us understand which routes are reaching families (e.g. school, GP, CAB, social media)."
            />
            {formData.heardAboutUs === 'other' && (
              <FormField
                label="Please tell us where you heard about us"
                name="heardAboutUsDetail"
                type="textarea"
                value={formData.heardAboutUsDetail}
                onChange={handleInputChange}
                error={errors.heardAboutUsDetail}
                required
                placeholder="e.g. Local group, newsletter, support worker, community centre…"
              />
            )}
            <FormField
              label="I consent to LUNA SEN Pantry storing and using this information to arrange support, in line with the privacy policy."
              name="consentData"
              type="checkbox"
              value={formData.consentData}
              onChange={handleInputChange}
              error={errors.consentData}
              required
            />
            <FormField
              label="Preferred language"
              name="preferredLanguage"
              type="select"
              value={formData.preferredLanguage}
              onChange={handleInputChange}
              error={errors.preferredLanguage}
              options={[
                { value: 'english', label: 'English' },
                { value: 'welsh', label: 'Welsh' },
                { value: 'polish', label: 'Polish' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <FormField
              label="Best time to contact"
              name="preferredContact"
              type="select"
              value={formData.preferredContact}
              onChange={handleInputChange}
              error={errors.preferredContact}
              options={[
                { value: 'weekday', label: 'Weekday daytime' },
                { value: 'evening', label: 'Weekday evening' },
                { value: 'weekend', label: 'Weekend' },
              ]}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const stepLabels = ['Contact', 'Household', 'SEN', 'Food', 'Pets', 'Consent'];

  return (
    <div className="luna-support-form">
      <div className="luna-support-crisis-bar">
        <section className="luna-emergency-strip luna-emergency-strip--sticky" aria-label="Crisis food support">
          <div className="luna-container">
            <div className="luna-emergency-strip__content">
              <div className="luna-emergency-strip__icon" aria-hidden="true">
                🚨
              </div>
              <div className="luna-emergency-strip__text">
                <strong>CRISIS SUPPORT:</strong> Need food today? Call or text
                <a href="tel:07718851362" className="luna-emergency-strip__phone">
                  {' '}
                  07718851362
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="luna-support-form__main">
        <header className="luna-support-page__header">
          <h1 className="luna-support-page__title">
            Get <span className="luna-text-gradient">Support</span>
          </h1>
          <p className="luna-page-subtitle">
            For Wirral households — especially where SEN, sensory needs, or crisis circumstances mean ordinary food-bank
            referrals don’t cover everything. You can apply for your own family or refer someone else (school, GP, charity,
            faith group, friend, or neighbour). Share as much detail as you can; it helps us respond with dignity.
          </p>
          <p className="luna-page-subtitle luna-support-form__contact-email">
            Questions about this form? Email{' '}
            <a href={`mailto:${encodeURIComponent(ADMIN_EMAIL)}`} className="luna-link">
              {ADMIN_EMAIL}
            </a>
            .
          </p>
        </header>

        <div className="luna-progress luna-mb" aria-label="Form progress">
          <div className="luna-progress__header">
            <div>
              <p className="luna-progress__text">Current progress</p>
              <h3 className="luna-progress__title">Step {currentStep} of {totalSteps}</h3>
            </div>
            <span className="luna-progress__percentage luna-progress__percentage--gradient">{Math.round(progress)}%</span>
          </div>
          <div className="luna-progress__bar" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={currentStep}>
            <div className="luna-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="luna-progress__steps">
            {stepLabels.map((label, idx) => {
              const n = idx + 1;
              const completed = n < currentStep;
              const active = n === currentStep;
              return (
                <div key={label} className="luna-progress__step-wrap">
                  <div
                    className={[
                      'luna-progress__step',
                      completed ? 'luna-progress__step--completed' : '',
                      active ? 'luna-progress__step--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  >
                    {completed ? '✓' : n}
                  </div>
                  <span className={`luna-progress__step-label ${active ? 'luna-progress__step-label--active' : ''}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="luna-form-step luna-support-form__card">
          <form onSubmit={handleSubmit} className="luna-support-form__form">
            {renderStep()}
            <div
              className={`luna-form-actions luna-support-form__actions${
                currentStep === 1 ? ' luna-support-form__actions--single' : ''
              }`}
            >
              {currentStep > 1 && (
                <div className="luna-support-form__action-secondary">
                  <Button variant="primary" onClick={prevStep} fullWidth className="luna-support-form__action-btn">
                    Previous
                  </Button>
                </div>
              )}
              <div className="luna-support-form__action-primary">
                {currentStep < totalSteps ? (
                  <Button variant="gradient" onClick={nextStep} fullWidth className="luna-support-form__action-btn">
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gradient"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="luna-support-form__action-btn"
                  >
                    Submit Application
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        <footer className="luna-support-form__footer luna-text-center">
          <div className="luna-support-footer__links">
            <a href="/privacy" className="luna-support-footer__link luna-support-footer__link--privacy">
              Privacy Policy
            </a>
            <a href="/#services-title" className="luna-support-footer__link luna-support-footer__link--help">
              How we help
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Support;
