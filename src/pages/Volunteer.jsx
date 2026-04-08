import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Card, { UserGroupIcon, PhoneIcon, HeartIcon } from '../components/Card';
import { useFormValidation } from '../hooks/useFormValidation';
import { useOfflineForm } from '../hooks/useOfflineForm';
import HeroLogo from '../components/HeroLogo';
import VolunteerDocUploadRow from '../components/VolunteerDocUploadRow';

const Volunteer = () => {
  const [searchParams] = useSearchParams();
  const preferredRole = searchParams.get('role');
  
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.title = 'Volunteer with LUNA SEN PANTRY - Help Wirral Families | Hub & Driver Roles';
  }, []);

  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    role: preferredRole || '',
    availability: '',
    experience: '',
    hasVehicle: false,
    drivingLicense: '',
    canLiftHeavy: false,
    additionalInfo: '',
    consent: false,
    references: '',
    startDate: '',
    keepOnFile: false,
    drivingLicenceProofDataUrl: '',
    drivingLicenceProofFileName: '',
    insuranceProofDataUrl: '',
    insuranceProofFileName: '',
    dbsProofDataUrl: '',
    dbsProofFileName: '',
    bringInsuranceInPerson: false,
    bringDrivingLicenceInPerson: false,
    bringDbsInPerson: false,
  };

  const requiredFields = ['name', 'email', 'phone', 'role', 'availability', 'consent'];

  const { formData, errors, touched, updateField, touchField, validateForm } = 
    useFormValidation(initialFormData, requiredFields);

  const { isSubmitting, submitStatus, networkStatus, submitForm } = 
    useOfflineForm('volunteer');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (
      formData.role === 'driver' &&
      !formData.bringInsuranceInPerson &&
      !String(formData.insuranceProofDataUrl || '').trim()
    ) {
      window.alert(
        'Please add proof of motor insurance (Choose file or Take photo), or tick the box to show it in person.'
      );
      return;
    }

    if (
      formData.role === 'driver' &&
      !formData.bringDrivingLicenceInPerson &&
      !String(formData.drivingLicenceProofDataUrl || '').trim()
    ) {
      window.alert(
        "Please add a photo/PDF of your driving licence, or tick the box to show it in person."
      );
      return;
    }

    const result = await submitForm(formData);

    if (result.success) {
      setShowForm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const volunteerRoles = [
    {
      variant: 'primary',
      icon: HeartIcon,
      title: 'Hub Volunteer',
      description: 'Sort donations, pack food parcels, and welcome families at our community hub. Perfect for those who want regular, structured volunteering.',
      requirements: [
        'Friendly and patient approach',
        'Understanding of SEN needs helpful',
        'Able to lift light-medium items',
        'Flexible 2-4 hour shifts'
      ],
      commitment: 'Weekly shifts available',
      action: (
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full"
          onClick={() => {
            updateField('role', 'hub');
            setShowForm(true);
          }}
        >
          Apply for Hub Role
        </Button>
      )
    },
    {
      variant: 'gradient',
      icon: PhoneIcon,
      title: 'Delivery Driver',
      description: 'Deliver food parcels directly to families who cannot collect. Essential for supporting isolated families and those with mobility challenges.',
      requirements: [
        'Full driving license',
        'Own vehicle with insurance',
        'Comfortable lifting 10-20kg',
        'Flexible daytime availability'
      ],
      commitment: 'Ad-hoc deliveries, typically 2-3 per week',
      action: (
        <Button 
          variant="gradient" 
          size="lg" 
          className="w-full"
          onClick={() => {
            updateField('role', 'driver');
            setShowForm(true);
          }}
        >
          Apply as Driver
        </Button>
      )
    },
    {
      variant: 'secondary',
      icon: UserGroupIcon,
      title: 'Support Volunteer',
      description: 'Help with admin, social media, fundraising, or special projects. Use your skills to support operations behind the scenes.',
      requirements: [
        'Specific skills (admin, marketing, etc)',
        'Home-based or hub-based',
        'Good communication skills',
        'Reliable internet connection'
      ],
      commitment: 'Flexible hours, project-based',
      action: (
        <Button 
          variant="secondary" 
          size="lg" 
          className="w-full"
          onClick={() => {
            updateField('role', 'support');
            setShowForm(true);
          }}
        >
          Apply for Support Role
        </Button>
      )
    }
  ];

  if (showForm) {
    return (
      <>
        <main className="luna-main">
          <div className="luna-container" style={{ maxWidth: '42rem' }}>
            {/* Header */}
            <div className="luna-page-header">
              <button
                onClick={() => setShowForm(false)}
                className="inline-flex items-center text-luna-pink hover:text-pink-600 mb-4 luna-focus"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Volunteer Roles
              </button>
              <h1 className="luna-page-title">
                Volunteer Application
              </h1>
              <p className="luna-page-subtitle">
                {formData.role === 'hub' ? 'Hub Volunteer Application' :
                 formData.role === 'driver' ? 'Delivery Driver Application' :
                 formData.role === 'support' ? 'Support Volunteer Application' :
                 'General Volunteer Application'}
              </p>
            </div>

            {/* Offline indicator */}
            {!networkStatus && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Offline mode:</strong> Your application will be saved and sent when connection returns.
                </p>
              </div>
            )}

            <div className="luna-card luna-card--primary">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                  </div>

                  <FormField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.name ? errors.name : ''}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={updateField}
                      onBlur={touchField}
                      error={touched.email ? errors.email : ''}
                      required
                    />

                    <FormField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={updateField}
                      onBlur={touchField}
                      error={touched.phone ? errors.phone : ''}
                      required
                      placeholder="07718851362"
                    />
                  </div>
                </div>

                {/* Role & Availability */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold">Role & Availability</h2>
                  </div>

                  <FormField
                    label="Volunteer Role"
                    name="role"
                    type="select"
                    value={formData.role}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.role ? errors.role : ''}
                    required
                    options={[
                      { value: 'hub', label: 'Hub Volunteer' },
                      { value: 'driver', label: 'Delivery Driver' },
                      { value: 'support', label: 'Support Volunteer' },
                      { value: 'flexible', label: 'Flexible - any role' }
                    ]}
                  />

                  <FormField
                    label="Availability"
                    name="availability"
                    type="textarea"
                    value={formData.availability}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.availability ? errors.availability : ''}
                    required
                    placeholder="e.g., Tuesday mornings, weekends, flexible evenings..."
                    helpText="Please let us know what days/times work best for you"
                  />

                  <FormField
                    label="When can you start?"
                    name="startDate"
                    type="select"
                    value={formData.startDate}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.startDate ? errors.startDate : ''}
                    options={[
                      { value: 'immediately', label: 'Immediately' },
                      { value: 'week', label: 'Within a week' },
                      { value: 'month', label: 'Within a month' },
                      { value: 'flexible', label: 'I\'m flexible' }
                    ]}
                  />
                </div>

                {/* Driver-specific questions */}
                {formData.role === 'driver' && (
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h2 className="text-xl font-semibold">Driver Information</h2>
                    </div>

                    <FormField
                      label="Driving License"
                      name="drivingLicense"
                      type="select"
                      value={formData.drivingLicense}
                      onChange={updateField}
                      onBlur={touchField}
                      error={touched.drivingLicense ? errors.drivingLicense : ''}
                      options={[
                        { value: 'full', label: 'Full UK License' },
                        { value: 'provisional', label: 'Provisional License' },
                        { value: 'international', label: 'International License' },
                        { value: 'none', label: 'No License' }
                      ]}
                    />

                    <FormField
                      label="Vehicle Available"
                      name="hasVehicle"
                      type="checkbox"
                      value={formData.hasVehicle}
                      onChange={updateField}
                      onBlur={touchField}
                      helpText="We need volunteers with their own insured vehicle for deliveries"
                    />

                    <FormField
                      label="Can you lift 10-20kg packages?"
                      name="canLiftHeavy"
                      type="checkbox"
                      value={formData.canLiftHeavy}
                      onChange={updateField}
                      onBlur={touchField}
                      helpText="Food parcels can be heavy, especially for larger families"
                    />

                    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 space-y-4">
                      <VolunteerDocUploadRow
                        idPrefix="vol-licence"
                        label="Driving licence (photo or PDF)"
                        description="Required for delivery drivers unless you choose in person below. Upload a clear photo (front/back) or PDF."
                        dataUrl={formData.drivingLicenceProofDataUrl}
                        fileName={formData.drivingLicenceProofFileName}
                        onChange={({ dataUrl, fileName }) => {
                          updateField('drivingLicenceProofDataUrl', dataUrl);
                          updateField('drivingLicenceProofFileName', fileName);
                        }}
                      />
                      <FormField
                        label="I'll show my driving licence in person instead of uploading (we'll check it at interview or induction)"
                        name="bringDrivingLicenceInPerson"
                        type="checkbox"
                        value={formData.bringDrivingLicenceInPerson}
                        onChange={updateField}
                        onBlur={touchField}
                      />
                      <VolunteerDocUploadRow
                        idPrefix="vol-insurance"
                        label="Motor insurance certificate"
                        description="Required for delivery drivers unless you choose in person below. Upload a clear photo or PDF of your current cover (business use if applicable)."
                        dataUrl={formData.insuranceProofDataUrl}
                        fileName={formData.insuranceProofFileName}
                        onChange={({ dataUrl, fileName }) => {
                          updateField('insuranceProofDataUrl', dataUrl);
                          updateField('insuranceProofFileName', fileName);
                        }}
                      />
                      <FormField
                        label="I'll show my motor insurance in person instead of uploading (we'll check it at interview or induction)"
                        name="bringInsuranceInPerson"
                        type="checkbox"
                        value={formData.bringInsuranceInPerson}
                        onChange={updateField}
                        onBlur={touchField}
                      />
                    </div>
                  </div>
                )}

                {/* Experience & Additional Info */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold">Experience & Additional Information</h2>
                  </div>

                  <FormField
                    label="Previous Volunteering Experience"
                    name="experience"
                    type="textarea"
                    value={formData.experience}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.experience ? errors.experience : ''}
                    placeholder="Tell us about any relevant experience, skills, or reasons for wanting to volunteer..."
                    helpText="Any experience with food banks, SEN support, or community work is valuable but not required"
                  />

                  <FormField
                    label="References"
                    name="references"
                    type="textarea"
                    value={formData.references}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.references ? errors.references : ''}
                    placeholder="Please provide 2 character references with contact details..."
                    helpText="Can be personal, professional, or other volunteers who know you"
                  />

                  <FormField
                    label="Additional Information"
                    name="additionalInfo"
                    type="textarea"
                    value={formData.additionalInfo}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.additionalInfo ? errors.additionalInfo : ''}
                    placeholder="Anything else we should know? Special skills, accessibility needs, etc..."
                  />
                </div>

                {/* DBS / safeguarding — optional proof */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold">DBS &amp; safeguarding (optional)</h2>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 space-y-4">
                    <VolunteerDocUploadRow
                      idPrefix="vol-dbs"
                      label="DBS certificate or update service summary"
                      description="If you already have an enhanced DBS for regulated activity, or subscribe to the DBS Update Service, you can upload a photo or PDF here. Optional — or show in person below."
                      dataUrl={formData.dbsProofDataUrl}
                      fileName={formData.dbsProofFileName}
                      onChange={({ dataUrl, fileName }) => {
                        updateField('dbsProofDataUrl', dataUrl);
                        updateField('dbsProofFileName', fileName);
                      }}
                    />
                    <FormField
                      label="I'll show DBS or update-service evidence in person instead of uploading"
                      name="bringDbsInPerson"
                      type="checkbox"
                      value={formData.bringDbsInPerson}
                      onChange={updateField}
                      onBlur={touchField}
                    />
                  </div>
                </div>

                {/* Data retention — mirrors clarity of the food bank referral form */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold">How we use your application</h2>
                  </div>
                  <FormField
                    label="If we can't offer a role straight away, I'm happy for LUNA to keep my details on file for future volunteer opportunities."
                    name="keepOnFile"
                    type="checkbox"
                    value={formData.keepOnFile}
                    onChange={updateField}
                    onBlur={touchField}
                    helpText="Optional. You can ask us to remove your details at any time. We only use your information for recruitment in line with our privacy practices."
                  />
                </div>

                {/* Consent */}
                <div className="space-y-6">
                  <FormField
                    label="I consent to LUNA SEN PANTRY processing my application and contacting me about volunteer opportunities. I understand that volunteering will require a basic background check and training."
                    name="consent"
                    type="checkbox"
                    value={formData.consent}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.consent ? errors.consent : ''}
                    required
                  />
                </div>

                {/* Submit buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="gradient"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Submit Application
                  </Button>
                </div>

                {/* Submit status */}
                {submitStatus && (
                  <div className={`p-4 rounded-md ${submitStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm ${submitStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                      {submitStatus.message}
                    </p>
                    {submitStatus.success && (
                      <div className="mt-3">
                        <p className="text-sm text-green-700">
                          <strong>What happens next:</strong>
                        </p>
                        <ul className="list-disc list-inside text-sm text-green-700 mt-2 space-y-1">
                          <li>We'll review your application within 48 hours</li>
                          <li>We'll contact you to arrange a brief informal chat</li>
                          <li>If successful, we'll arrange training and background checks</li>
                          <li>You'll be matched with suitable volunteer opportunities</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div> {/* Close luna-container */}
        </main> {/* Close luna-main */}
      </>
    );
  }

  return (
    <>
      <main className="luna-main">
        {/* Hero Section */}
        <section className="luna-hero" aria-labelledby="hero-title">
          <div className="luna-container">
            <div className="luna-hero__content">
              <HeroLogo />
              <h1 id="hero-title" className="luna-hero__title">
                Volunteer with <span className="luna-brand-text">LUNA</span>
              </h1>
              <p className="luna-hero__subtitle">
                Join our team supporting Wirral families with SEN and sensory needs
              </p>
              <p className="luna-hero__description">
                Every volunteer makes a direct impact - from sorting donations to delivering food to families who need it most • Flexible roles • Full training provided
              </p>
              
              <div className="luna-hero__actions">
                <Button
                  variant="gradient"
                  size="xl"
                  onClick={() => {
                    updateField('role', 'flexible');
                    setShowForm(true);
                  }}
                >
                  Apply to Volunteer
                </Button>
                <a href="tel:07718851362" className="luna-link-button">
                  <Button variant="secondary" size="xl">
                    Call to Discuss
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="luna-emergency-strip luna-emergency-strip--after-hero" aria-label="Crisis food support">
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

        <div className="luna-container">

          {/* Volunteer Roles */}
          <section className="luna-section">
            <div className="luna-section-header">
              <h2 className="luna-section-title">
                Volunteer Roles
              </h2>
              <p className="luna-section-subtitle">
                Choose the role that fits your schedule and skills - all make a real difference
              </p>
            </div>

            <div className="luna-grid luna-grid--3">
              {volunteerRoles.map((role, index) => (
                <Card
                  key={index}
                  variant={role.variant}
                  icon={role.icon}
                  title={role.title}
                  description={role.description}
                  action={role.action}
                  className="luna-card--full-height"
                >
                  <div className="mt-4 space-y-4 flex-grow">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-gray-700">Requirements:</h4>
                      <ul className="text-sm space-y-1">
                        {role.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-600">{role.commitment}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick application */}
            <div className="luna-card luna-card--gradient luna-text-center luna-section-spacer">
              <h3 className="luna-card-title">Not sure which role is right?</h3>
              <p className="luna-card-text mb-6">
                Apply generally and we'll find the perfect fit for your skills and availability
              </p>
              <Button 
                variant="gradient" 
                size="xl"
                onClick={() => {
                  updateField('role', 'flexible');
                  setShowForm(true);
                }}
              >
                Apply to Volunteer
              </Button>
            </div>
          </section>

          {/* Why Volunteer */}
          <section className="luna-section">
            <div className="luna-section-header">
              <h2 className="luna-section-title">
                Why Volunteer with <span className="luna-text-gradient">LUNA</span>?
              </h2>
              <p className="luna-section-subtitle">
                Join a passionate team making a real difference to local families
              </p>
            </div>

            <div className="luna-grid luna-grid--why-volunteer">
              <div className="luna-mini-card luna-mini-card--primary">
                <div className="luna-mini-card__header">
                  <h3 className="luna-mini-card__title">SEN Focus</h3>
                </div>
                <ul className="luna-mini-list text-center">
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--primary"></span>
                    95% of families have SEN or disabilities
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--primary"></span>
                    Specialized food and support needs
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--primary"></span>
                    Understanding sensory requirements
                  </li>
                </ul>
              </div>
              
              <div className="luna-mini-card luna-mini-card--gradient">
                <div className="luna-mini-card__header">
                  <h3 className="luna-mini-card__title">Fast Impact</h3>
                </div>
                <ul className="luna-mini-list text-center">
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--gradient"></span>
                    48 hours from referral to delivery
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--gradient"></span>
                    Direct help to families in crisis
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--gradient"></span>
                    Immediate visible difference
                  </li>
                </ul>
              </div>
              
              <div className="luna-mini-card luna-mini-card--secondary">
                <div className="luna-mini-card__header">
                  <h3 className="luna-mini-card__title">Local Community</h3>
                </div>
                <ul className="luna-mini-list text-center">
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--secondary"></span>
                    All support stays within Wirral
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--secondary"></span>
                    Know the families you're helping
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--secondary"></span>
                    Building stronger communities
                  </li>
                </ul>
              </div>

              <div className="luna-mini-card luna-mini-card--primary">
                <div className="luna-mini-card__header">
                  <h3 className="luna-mini-card__title">Supportive Team</h3>
                </div>
                <ul className="luna-mini-list text-center">
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--primary"></span>
                    Friendly volunteer community
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--primary"></span>
                    Full training and ongoing support
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--primary"></span>
                    Regular team events and recognition
                  </li>
                </ul>
              </div>

              <div className="luna-mini-card luna-mini-card--gradient">
                <div className="luna-mini-card__header">
                  <h3 className="luna-mini-card__title">Flexible Volunteering</h3>
                </div>
                <ul className="luna-mini-list text-center">
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--gradient"></span>
                    Choose your own schedule
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--gradient"></span>
                    From 2 hours to full days
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--gradient"></span>
                    Work around your commitments
                  </li>
                </ul>
              </div>

              <div className="luna-mini-card luna-mini-card--secondary">
                <div className="luna-mini-card__header">
                  <h3 className="luna-mini-card__title">Skills & Development</h3>
                </div>
                <ul className="luna-mini-list text-center">
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--secondary"></span>
                    Learn SEN awareness skills
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--secondary"></span>
                    Food safety and handling training
                  </li>
                  <li className="luna-mini-list-item">
                    <span className="luna-mini-bullet luna-mini-bullet--secondary"></span>
                    References and certificates provided
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Volunteer Support */}
          <section className="luna-section">
            <div className="luna-grid luna-grid--2">
              <div className="luna-card luna-card--primary luna-text-center">
                <h3 className="luna-card-title">What We Provide</h3>
                <div className="luna-card-content">
                  <ul className="luna-list luna-list--centered">
                    <li>Full training on SEN awareness and food safety</li>
                    <li>Ongoing support from experienced volunteer coordinators</li>
                    <li>Flexible scheduling to fit around your life</li>
                    <li>Travel expenses and protective equipment</li>
                    <li>Regular volunteer appreciation events</li>
                    <li>References and volunteering certificates</li>
                  </ul>
                </div>
              </div>

              <div className="luna-card luna-card--secondary luna-text-center">
                <h3 className="luna-card-title">Volunteer Stories</h3>
                <div className="luna-card-content">
                  <blockquote className="luna-testimonial luna-testimonial--primary luna-testimonial--spaced">
                    <p className="luna-testimonial-quote">
                      "Volunteering with LUNA has been incredibly rewarding. Knowing I'm helping local families, especially those with SEN children, gives me such purpose."
                    </p>
                    <cite className="luna-testimonial-author">- Sarah, Hub Volunteer</cite>
                  </blockquote>
                  
                  <blockquote className="luna-testimonial luna-testimonial--gradient luna-testimonial--spaced">
                    <p className="luna-testimonial-quote">
                      "The delivery role fits perfectly around my work schedule. The families are so grateful, and the team support is amazing."
                    </p>
                    <cite className="luna-testimonial-author">- Mark, Delivery Driver</cite>
                  </blockquote>

                  <blockquote className="luna-testimonial luna-testimonial--secondary luna-testimonial--spaced">
                    <p className="luna-testimonial-quote">
                      "I love that I can use my marketing skills to help the pantry reach more families. It's flexible and meaningful work."
                    </p>
                    <cite className="luna-testimonial-author">- Jenny, Support Volunteer</cite>
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          {/* Application Process */}
          <section className="luna-section">
            <div className="luna-section-header">
              <h2 className="luna-section-title">
                Application Process
              </h2>
              <p className="luna-section-subtitle">
                Simple steps to join our volunteer team
              </p>
            </div>

            <div className="luna-grid luna-grid--4">
              <div className="luna-card luna-card--primary luna-text-center">
                <div className="luna-step-number luna-step-number--primary">1</div>
                <h3 className="luna-card-title">Apply Online</h3>
                <p className="luna-card-description">Complete our simple application form above</p>
              </div>
              
              <div className="luna-card luna-card--gradient luna-text-center">
                <div className="luna-step-number luna-step-number--gradient">2</div>
                <h3 className="luna-card-title text-white">Informal Chat</h3>
                <p className="luna-card-description text-white opacity-90">We'll arrange a friendly conversation about the role</p>
              </div>
              
              <div className="luna-card luna-card--gradient luna-text-center">
                <div className="luna-step-number luna-step-number--gradient">3</div>
                <h3 className="luna-card-title text-white">Checks & Training</h3>
                <p className="luna-card-description text-white opacity-90">Basic background check and role-specific training</p>
              </div>
              
              <div className="luna-card luna-card--secondary luna-text-center">
                <div className="luna-step-number luna-step-number--secondary">4</div>
                <h3 className="luna-card-title">Start Helping</h3>
                <p className="luna-card-description">Begin your volunteering journey with full support</p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="luna-card luna-card--gradient luna-text-center luna-section-spacer">
            <h2 className="luna-card-title">
              Ready to Make a Difference?
            </h2>
            <p className="luna-card-text mb-8">
              Join our team of dedicated volunteers supporting Wirral families
            </p>
            
            <div className="luna-grid luna-grid--2">
              <Button
                variant="gradient"
                size="xl"
                className="luna-button--full-width"
                onClick={() => {
                  updateField('role', 'flexible');
                  setShowForm(true);
                }}
              >
                Apply to Volunteer
              </Button>
              <a href="tel:07718851362" className="luna-link-button">
                <Button variant="secondary" size="xl" className="luna-button--full-width">
                  Call to Discuss
                </Button>
              </a>
            </div>
            
            <p className="luna-card-note">
              Questions? Email us at <a href="mailto:volunteers@lunasen.org" className="luna-link">volunteers@lunasen.org</a>
            </p>
          </section>

        </div> {/* Close luna-container */}
      </main> {/* Close luna-main */}
    </>
  );
};

export default Volunteer;