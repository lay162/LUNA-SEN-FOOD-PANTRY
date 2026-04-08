import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { useFormValidation } from '../hooks/useFormValidation';
import { useOfflineForm } from '../hooks/useOfflineForm';
import { announceToScreenReader } from '../utils/validation';

const GetSupport = () => {
  const [searchParams] = useSearchParams();
  const isUrgent = searchParams.get('urgent') === 'true';
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Russell Trust style form data structure
  const initialFormData = {
    // Step 1: Basic Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    postcode: '',
    address: '',
    phoneNumber: '',
    email: '',
    
    // Step 2: Household Information
    adultsCount: '',
    childrenCount: '',
    childrenAges: '',
    totalPeople: '',
    householdIncome: '',
    benefitsReceived: '',
    nextPayDate: '',
    lastPayDate: '',
    
    // Step 3: Dietary & Special Needs
    allergies: '',
    intolerances: '',
    religiousRequirements: '',
    culturalDietaryNeeds: '',
    senNeeds: '',
    sensoryNeeds: '',
    safeFoods: '',
    medicalConditions: '',
    medications: '',
    
    // Step 4: Additional Information
    pets: '',
    petType: '',
    petFood: false,
    sanitaryProducts: false,
    babyProducts: false,
    householdItems: '',
    transportIssues: '',
    crisisReason: '',
    urgentSupport: isUrgent,
    preferredLanguage: 'English',
    interpreterNeeded: false,
    
    // Contact & Consent
    contactMethod: '',
    bestTimeToContact: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    consent: false,
    dataProcessing: false,
    
    // Internal fields
    additionalInfo: '',
    referralSource: 'website',
    referrerName: '',
    referrerOrganisation: ''
  };

  const requiredFieldsByStep = {
    1: ['firstName', 'lastName', 'postcode', 'phoneNumber'],
    2: ['adultsCount', 'nextPayDate', 'crisisReason'],
    3: [], // Optional dietary information
    4: ['contactMethod', 'consent', 'dataProcessing']
  };

  const allRequiredFields = Object.values(requiredFieldsByStep).flat();

  const { formData, errors, touched, updateField, touchField, validateForm, resetForm } = 
    useFormValidation(initialFormData, allRequiredFields);

  const { isSubmitting, submitStatus, networkStatus, submitForm } = 
    useOfflineForm('referral');

  // Set page meta
  useEffect(() => {
    document.title = isUrgent 
      ? 'Emergency Food Support - LUNA SEN PANTRY Wirral'
      : 'Get Food Support - LUNA SEN PANTRY Wirral CH62';
  }, [isUrgent]);

  // Auto-save form data to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('luna-referral-form', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load saved form data on mount
  useEffect(() => {
    const saved = localStorage.getItem('luna-referral-form');
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        Object.keys(savedData).forEach(key => {
          updateField(key, savedData[key]);
        });
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Calculate total people
  useEffect(() => {
    const adults = parseInt(formData.adultsCount) || 0;
    const children = parseInt(formData.childrenCount) || 0;
    updateField('totalPeople', (adults + children).toString());
  }, [formData.adultsCount, formData.childrenCount]);

  const handleNext = () => {
    const currentRequiredFields = requiredFieldsByStep[currentStep];
    let isStepValid = true;

    currentRequiredFields.forEach(field => {
      touchField(field);
      if (!formData[field] || formData[field] === '') {
        isStepValid = false;
      }
    });

    if (isStepValid) {
      setCurrentStep(currentStep + 1);
      announceToScreenReader(`Step ${currentStep + 1} of ${totalSteps}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    announceToScreenReader(`Step ${currentStep - 1} of ${totalSteps}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announceToScreenReader('Please correct the errors and try again');
      return;
    }

    await submitForm(formData);
    
    if (submitStatus?.success) {
      localStorage.removeItem('luna-referral-form');
      announceToScreenReader('Your referral has been submitted successfully');
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <>
      <main className="luna-page">
        <div className="luna-container">
          {/* Header Section */}
          <div className="luna-page-header">
            <h1 className="luna-page-title">
              {isUrgent ? (
                <>Emergency Food Support</>
              ) : (
                <>Get Food Support</>
              )}
            </h1>
            <p className="luna-page-subtitle">
              {isUrgent 
                ? 'We\'ll prioritise your request and aim to help within 24 hours'
                : 'Simple self-referral - takes about 2 minutes'
              }
            </p>
          </div>

          {/* Progress Section */}
          <div className="luna-progress-section" role="progressbar" aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax={totalSteps}>
            <div className="luna-progress-header">
              <span className="luna-progress-step">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="luna-progress-percent">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
            <div className="luna-progress">
              <div 
                className="luna-progress__bar"
                style={{ width: `${progressPercentage}%` }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Offline Indicator */}
          {!networkStatus && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Offline mode:</strong> Your form will be saved and sent when connection returns.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="luna-card">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
                  <p className="text-gray-600 mt-2">We need these details to process your application</p>
                </div>

                <div className="luna-card-grid luna-card-grid--2-col">
                  <FormField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.firstName ? errors.firstName : ''}
                    placeholder="Enter your first name"
                    required
                  />

                  <FormField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.lastName ? errors.lastName : ''}
                    placeholder="Enter your last name"
                    required
                  />

                  <FormField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.dateOfBirth ? errors.dateOfBirth : ''}
                  />

                  <FormField
                    label="Postcode"
                    name="postcode"
                    value={formData.postcode}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.postcode ? errors.postcode : ''}
                    placeholder="CH62 1AA"
                    required
                    helpText="We prioritise Wirral postcodes"
                  />
                </div>

                <FormField
                  label="Full Address"
                  name="address"
                  type="textarea"
                  value={formData.address}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.address ? errors.address : ''}
                  placeholder="Enter your full address"
                  rows="3"
                />

                <div className="luna-card-grid luna-card-grid--2-col">
                  <FormField
                    label="Phone Number"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.phoneNumber ? errors.phoneNumber : ''}
                    placeholder="07718851362"
                    required
                  />

                  <FormField
                    label="Email Address (Optional)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.email ? errors.email : ''}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Household Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Household Information</h2>
                  <p className="text-gray-600 mt-2">Tell us about your household and circumstances</p>
                </div>

                <div className="luna-card-grid luna-card-grid--3-col">
                  <FormField
                    label="Number of Adults"
                    name="adultsCount"
                    type="select"
                    value={formData.adultsCount}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.adultsCount ? errors.adultsCount : ''}
                    required
                    options={[
                      { value: '', label: 'Select...' },
                      { value: '1', label: '1 adult' },
                      { value: '2', label: '2 adults' },
                      { value: '3', label: '3 adults' },
                      { value: '4', label: '4 adults' },
                      { value: '5+', label: '5 or more adults' }
                    ]}
                  />

                  <FormField
                    label="Number of Children"
                    name="childrenCount"
                    type="select"
                    value={formData.childrenCount}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.childrenCount ? errors.childrenCount : ''}
                    options={[
                      { value: '0', label: 'No children' },
                      { value: '1', label: '1 child' },
                      { value: '2', label: '2 children' },
                      { value: '3', label: '3 children' },
                      { value: '4', label: '4 children' },
                      { value: '5+', label: '5 or more children' }
                    ]}
                  />

                  <FormField
                    label="Total People"
                    name="totalPeople"
                    value={formData.totalPeople}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.totalPeople ? errors.totalPeople : ''}
                    disabled
                    helpText="Calculated automatically"
                  />
                </div>

                {formData.childrenCount && formData.childrenCount !== '0' && (
                  <FormField
                    label="Children's Ages"
                    name="childrenAges"
                    value={formData.childrenAges}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.childrenAges ? errors.childrenAges : ''}
                    placeholder="e.g., 3, 7, 12"
                    helpText="Please list all children's ages separated by commas"
                  />
                )}

                <div className="luna-card-grid luna-card-grid--2-col">
                  <FormField
                    label="When do you next get paid/receive benefits?"
                    name="nextPayDate"
                    type="date"
                    value={formData.nextPayDate}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.nextPayDate ? errors.nextPayDate : ''}
                    required
                  />

                  <FormField
                    label="When did you last get paid/receive benefits?"
                    name="lastPayDate"
                    type="date"
                    value={formData.lastPayDate}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.lastPayDate ? errors.lastPayDate : ''}
                  />
                </div>

                <FormField
                  label="What benefits do you receive?"
                  name="benefitsReceived"
                  type="textarea"
                  value={formData.benefitsReceived}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.benefitsReceived ? errors.benefitsReceived : ''}
                  placeholder="e.g., Universal Credit, JSA, ESA, PIP, Child Tax Credits..."
                  rows="3"
                />

                <FormField
                  label="What has brought you to need crisis food support?"
                  name="crisisReason"
                  type="textarea"
                  value={formData.crisisReason}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.crisisReason ? errors.crisisReason : ''}
                  placeholder="e.g., benefit delay, unexpected expense, job loss, domestic violence, mental health crisis..."
                  rows="4"
                  required
                  helpText="Understanding your situation helps us provide the right support"
                />
              </div>
            )}

            {/* Step 3: Dietary & Special Needs */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Dietary & Special Needs</h2>
                  <p className="text-gray-600 mt-2">Help us provide appropriate food and support</p>
                </div>

                <div className="luna-card-grid luna-card-grid--2-col">
                  <FormField
                    label="Food Allergies"
                    name="allergies"
                    type="textarea"
                    value={formData.allergies}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.allergies ? errors.allergies : ''}
                    placeholder="e.g., nuts, dairy, eggs, shellfish..."
                    rows="3"
                    helpText="Please list all food allergies"
                  />

                  <FormField
                    label="Food Intolerances"
                    name="intolerances"
                    type="textarea"
                    value={formData.intolerances}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.intolerances ? errors.intolerances : ''}
                    placeholder="e.g., lactose, gluten, high histamine foods..."
                    rows="3"
                    helpText="Please list all food intolerances"
                  />
                </div>

                <FormField
                  label="Religious/Cultural Dietary Requirements"
                  name="religiousRequirements"
                  type="textarea"
                  value={formData.religiousRequirements}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.religiousRequirements ? errors.religiousRequirements : ''}
                  placeholder="e.g., Halal, Kosher, Vegetarian, Vegan..."
                  rows="2"
                />

                <FormField
                  label="SEN/Disability Needs"
                  name="senNeeds"
                  type="textarea"
                  value={formData.senNeeds}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.senNeeds ? errors.senNeeds : ''}
                  placeholder="e.g., Autism, ADHD, Learning disabilities, Physical disabilities..."
                  rows="3"
                  helpText="This helps us provide appropriate support"
                />

                <FormField
                  label="Sensory or Eating Difficulties"
                  name="sensoryNeeds"
                  type="textarea"
                  value={formData.sensoryNeeds}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.sensoryNeeds ? errors.sensoryNeeds : ''}
                  placeholder="e.g., ARFID, texture sensitivities, safe foods only..."
                  rows="3"
                  helpText="Important for families with eating difficulties"
                />

                <FormField
                  label="Safe Foods (if eating difficulties)"
                  name="safeFoods"
                  type="textarea"
                  value={formData.safeFoods}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.safeFoods ? errors.safeFoods : ''}
                  placeholder="e.g., specific brands, textures, or foods that are accepted..."
                  rows="3"
                  helpText="Essential for ARFID and autism support"
                />

                <FormField
                  label="Medical Conditions"
                  name="medicalConditions"
                  type="textarea"
                  value={formData.medicalConditions}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.medicalConditions ? errors.medicalConditions : ''}
                  placeholder="e.g., Diabetes, heart conditions, kidney disease..."
                  rows="2"
                />
              </div>
            )}

            {/* Step 4: Additional Support & Contact */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Additional Support & Contact</h2>
                  <p className="text-gray-600 mt-2">Final details to complete your application</p>
                </div>

                <div className="luna-card-grid luna-card-grid--2-col">
                  <FormField
                    label="Do you have pets?"
                    name="pets"
                    type="select"
                    value={formData.pets}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.pets ? errors.pets : ''}
                    options={[
                      { value: '', label: 'Select...' },
                      { value: 'no', label: 'No pets' },
                      { value: 'dog', label: 'Dog(s)' },
                      { value: 'cat', label: 'Cat(s)' },
                      { value: 'both', label: 'Dogs and cats' },
                      { value: 'other', label: 'Other pets' }
                    ]}
                  />

                  {formData.pets && formData.pets !== 'no' && (
                    <FormField
                      label="Pet Details"
                      name="petType"
                      value={formData.petType}
                      onChange={updateField}
                      onBlur={touchField}
                      error={touched.petType ? errors.petType : ''}
                      placeholder="e.g., 2 small dogs, 1 elderly cat..."
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="petFood"
                      checked={formData.petFood}
                      onChange={(e) => updateField('petFood', e.target.checked)}
                      className="h-4 w-4 text-luna-pink border-gray-300 rounded focus:ring-luna-pink"
                    />
                    <label htmlFor="petFood" className="text-sm font-medium text-gray-700">
                      Do you need pet food support?
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sanitaryProducts"
                      checked={formData.sanitaryProducts}
                      onChange={(e) => updateField('sanitaryProducts', e.target.checked)}
                      className="h-4 w-4 text-luna-pink border-gray-300 rounded focus:ring-luna-pink"
                    />
                    <label htmlFor="sanitaryProducts" className="text-sm font-medium text-gray-700">
                      Do you need sanitary products?
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="babyProducts"
                      checked={formData.babyProducts}
                      onChange={(e) => updateField('babyProducts', e.target.checked)}
                      className="h-4 w-4 text-luna-pink border-gray-300 rounded focus:ring-luna-pink"
                    />
                    <label htmlFor="babyProducts" className="text-sm font-medium text-gray-700">
                      Do you need baby products (nappies, formula, baby food)?
                    </label>
                  </div>
                </div>

                <div className="luna-card-grid luna-card-grid--2-col">
                  <FormField
                    label="Preferred Contact Method"
                    name="contactMethod"
                    type="select"
                    value={formData.contactMethod}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.contactMethod ? errors.contactMethod : ''}
                    required
                    options={[
                      { value: '', label: 'Select...' },
                      { value: 'phone', label: 'Phone call' },
                      { value: 'text', label: 'Text message' },
                      { value: 'email', label: 'Email' },
                      { value: 'whatsapp', label: 'WhatsApp' }
                    ]}
                  />

                  <FormField
                    label="Best Time to Contact"
                    name="bestTimeToContact"
                    value={formData.bestTimeToContact}
                    onChange={updateField}
                    onBlur={touchField}
                    error={touched.bestTimeToContact ? errors.bestTimeToContact : ''}
                    placeholder="e.g., Weekday mornings, evenings after 6pm..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={formData.consent}
                      onChange={(e) => updateField('consent', e.target.checked)}
                      className="mt-1 h-4 w-4 text-luna-pink border-gray-300 rounded focus:ring-luna-pink"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-700">
                      <span className="font-medium">I consent to LUNA SEN Pantry</span> contacting me about my food support application and processing my personal data to provide this service. Required.
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="dataProcessing"
                      checked={formData.dataProcessing}
                      onChange={(e) => updateField('dataProcessing', e.target.checked)}
                      className="mt-1 h-4 w-4 text-luna-pink border-gray-300 rounded focus:ring-luna-pink"
                    />
                    <label htmlFor="dataProcessing" className="text-sm text-gray-700">
                      <span className="font-medium">I understand</span> that my information will be kept confidential and used only to provide food support services. Required.
                    </label>
                  </div>
                </div>

                <FormField
                  label="Additional Information"
                  name="additionalInfo"
                  type="textarea"
                  value={formData.additionalInfo}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.additionalInfo ? errors.additionalInfo : ''}
                  placeholder="Anything else we should know to help support your family..."
                  rows="4"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              {currentStep > 1 ? (
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  type="button"
                >
                  Previous
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < totalSteps ? (
                <Button 
                  variant="primary"
                  onClick={handleNext}
                  type="button"
                >
                  Next Step
                </Button>
              ) : (
                <Button 
                  variant="gradient"
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[160px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>

            {/* Submit Status */}
            {submitStatus && (
              <div className={`mt-4 p-4 rounded-md ${
                submitStatus.success 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="font-medium">
                  {submitStatus.success 
                    ? '✅ Application submitted successfully!'
                    : '❌ ' + (submitStatus.error || 'Failed to submit application')
                  }
                </p>
                {submitStatus.success && (
                  <p className="text-sm mt-2">
                    We'll contact you using your preferred method within 24 hours. 
                    Your reference number is: <strong>REF-{Date.now().toString().slice(-6)}</strong>
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
        
        {/* Emergency Contact Strip */}
        <div className="luna-emergency-strip mt-8">
          <div className="luna-container">
            <div className="luna-emergency-strip__content">
              <div className="luna-emergency-strip__icon">🚨</div>
              <div className="luna-emergency-strip__text">
                <strong>NEED HELP NOW?</strong> Call or text our crisis line:
                <a href="tel:07718851362" className="luna-emergency-strip__phone"> 07718851362</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    {/* Footer */}
    <footer className="luna-footer">
      <div className="luna-container">
        <div className="luna-footer__top">
          <div className="luna-footer__section">
            <h3 className="luna-footer__title">LUNA SEN Pantry</h3>
            <p className="luna-footer__text">
              We're committed to making food support accessible, respectful, and tailored to families with special educational needs and disabilities.
            </p>
          </div>
          
          <div className="luna-footer__section">
            <h4 className="luna-footer__subtitle">Quick Links</h4>
            <ul className="luna-footer__links">
              <li><a href="/get-support" className="luna-footer__link">Get Support</a></li>
              <li><a href="/donate" className="luna-footer__link">Donate</a></li>
              <li><a href="/volunteer" className="luna-footer__link">Volunteer</a></li>
              <li><a href="/admin" className="luna-footer__link">Admin Portal</a></li>
            </ul>
          </div>
          
          <div className="luna-footer__section">
            <h4 className="luna-footer__subtitle">Contact</h4>
            <ul className="luna-footer__contact">
              <li>📧 hello@lunasen.org</li>
              <li>📱 07718851362</li>
              <li>📍 Serving Wirral (CH62+)</li>
            </ul>
          </div>
        </div>
        
        <div className="luna-footer__bottom">
          <p className="luna-footer__copyright">
            © 2026 LUNA SEN Pantry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>

    <style jsx>{`
      .luna-emergency-strip {
        background: #dc2626;
        color: white;
        padding: 1rem 0;
        margin-top: 2rem;
      }

      .luna-emergency-strip__content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        text-align: center;
      }

      .luna-emergency-strip__icon {
        font-size: 1.5rem;
        animation: pulse 2s infinite;
      }

      .luna-emergency-strip__text {
        font-weight: 600;
      }

      .luna-emergency-strip__phone {
        color: white;
        font-weight: bold;
        text-decoration: underline;
        margin-left: 0.25rem;
      }

      .luna-emergency-strip__phone:hover {
        color: #fecaca;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      .luna-footer {
        background: var(--luna-bg-secondary);
        border-top: 1px solid var(--luna-grey-200);
        margin-top: 4rem;
        padding: 3rem 0 1rem;
      }

      .luna-footer__top {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 3rem;
        margin-bottom: 2rem;
      }

      .luna-footer__title {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--luna-pink);
        margin-bottom: 1rem;
      }

      .luna-footer__subtitle {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--luna-text-primary);
        margin-bottom: 1rem;
      }

      .luna-footer__text {
        color: var(--luna-text-secondary);
        line-height: 1.6;
      }

      .luna-footer__links {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .luna-footer__links li {
        margin-bottom: 0.5rem;
      }

      .luna-footer__link {
        color: var(--luna-text-secondary);
        text-decoration: none;
        transition: color 0.2s;
      }

      .luna-footer__link:hover {
        color: var(--luna-pink);
      }

      .luna-footer__contact {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .luna-footer__contact li {
        color: var(--luna-text-secondary);
        margin-bottom: 0.5rem;
      }

      .luna-footer__bottom {
        text-align: center;
        padding-top: 2rem;
        border-top: 1px solid var(--luna-grey-200);
      }

      .luna-footer__copyright {
        color: var(--luna-text-secondary);
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .luna-footer__top {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        
        .luna-emergency-strip__content {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `}</style>
  </>
  );
};

export default GetSupport;
                  label="Allergies & Intolerances"
                  name="allergies"
                  type="textarea"
                  value={formData.allergies}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.allergies ? errors.allergies : ''}
                  placeholder="e.g., nuts, dairy, gluten, eggs..."
                  helpText="Critical for food safety - please be as specific as possible"
                />

                <FormField
                  label="Safe Foods List"
                  name="safeFoods"
                  type="textarea"
                  value={formData.safeFoods}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.safeFoods ? errors.safeFoods : ''}
                  placeholder="e.g., plain pasta, specific brands, textures that work..."
                  helpText="For selective eaters - foods that are always accepted"
                />

                <FormField
                  label="Cultural or Religious Dietary Needs"
                  name="culturalDiet"
                  type="textarea"
                  value={formData.culturalDiet}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.culturalDiet ? errors.culturalDiet : ''}
                  placeholder="e.g., Halal, Kosher, vegetarian, vegan..."
                />
              </div>
            )}

            {/* Step 3: Additional Needs */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Additional Household Needs</h2>
                  <p className="text-sm text-gray-600 mt-1">Other items we might be able to help with</p>
                </div>

                <FormField
                  label="Do you have pets?"
                  name="pets"
                  type="select"
                  value={formData.pets}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.pets ? errors.pets : ''}
                  options={[
                    { value: 'none', label: 'No pets' },
                    { value: 'dog', label: 'Dog(s)' },
                    { value: 'cat', label: 'Cat(s)' },
                    { value: 'both', label: 'Both dogs and cats' },
                    { value: 'other', label: 'Other pets' }
                  ]}
                  helpText="We may have pet food donations available"
                />

                <FormField
                  label="Sanitary products needed"
                  name="sanitaryProducts"
                  type="checkbox"
                  value={formData.sanitaryProducts}
                  onChange={updateField}
                  onBlur={touchField}
                  helpText="We provide period products, nappies, and hygiene items"
                />

                <FormField
                  label="Laundry detergent preference"
                  name="laundryType"
                  type="radio"
                  value={formData.laundryType}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.laundryType ? errors.laundryType : ''}
                  options={[
                    { value: 'bio', label: 'Bio (regular) detergent' },
                    { value: 'non-bio', label: 'Non-bio (sensitive skin)' },
                    { value: 'either', label: 'Either is fine' },
                    { value: 'none', label: 'No detergent needed' }
                  ]}
                />

                <FormField
                  label="Anything else we should know?"
                  name="additionalInfo"
                  type="textarea"
                  value={formData.additionalInfo}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.additionalInfo ? errors.additionalInfo : ''}
                  placeholder="e.g., mobility issues, delivery preferences, specific brands needed..."
                />
              </div>
            )}

            {/* Step 4: Contact Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                  <p className="text-sm text-gray-600 mt-1">How can we reach you?</p>
                </div>

                <FormField
                  label="Preferred contact method"
                  name="contactMethod"
                  type="radio"
                  value={formData.contactMethod}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.contactMethod ? errors.contactMethod : ''}
                  required
                  options={[
                    { value: 'phone', label: 'Phone call' },
                    { value: 'text', label: 'Text message' },
                    { value: 'email', label: 'Email' },
                    { value: 'whatsapp', label: 'WhatsApp' }
                  ]}
                />

                <FormField
                  label={
                    formData.contactMethod === 'email' ? 'Email Address' :
                    formData.contactMethod === 'phone' || formData.contactMethod === 'text' || formData.contactMethod === 'whatsapp' ? 'Phone Number' :
                    'Contact Details'
                  }
                  name="contactDetails"
                  type={formData.contactMethod === 'email' ? 'email' : 'text'}
                  value={formData.contactDetails}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.contactDetails ? errors.contactDetails : ''}
                  required
                  placeholder={
                    formData.contactMethod === 'email' ? 'your.email@example.com' : 
                    '07718851362'
                  }
                />

                <FormField
                  label="Best time to contact you"
                  name="bestTime"
                  type="select"
                  value={formData.bestTime}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.bestTime ? errors.bestTime : ''}
                  options={[
                    { value: 'morning', label: 'Morning (9am-12pm)' },
                    { value: 'afternoon', label: 'Afternoon (12pm-5pm)' },
                    { value: 'evening', label: 'Evening (5pm-8pm)' },
                    { value: 'anytime', label: 'Any time is fine' },
                    { value: 'weekends', label: 'Weekends only' }
                  ]}
                />

                {isUrgent && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-red-800">Emergency Support</h3>
                    <p className="text-sm text-red-700 mt-1">
                      We've marked your referral as urgent and will prioritise getting help to you within 24 hours.
                    </p>
                  </div>
                )}

                <FormField
                  label="I consent to LUNA SEN PANTRY contacting me about this referral and storing my information to provide food support. I understand this information will be kept confidential and only used to help my family."
                  name="consent"
                  type="checkbox"
                  value={formData.consent}
                  onChange={updateField}
                  onBlur={touchField}
                  error={touched.consent ? errors.consent : ''}
                  required
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
              </div>

              <div>
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="gradient"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Submit Referral
                  </Button>
                )}
              </div>
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
                      <li>We'll contact you using your preferred method within 24 hours</li>
                      <li>We'll arrange collection or delivery based on your needs</li>
                      <li>No need to do anything else - we'll handle everything from here</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Help Text */}
        <div className="luna-help-section">
          <p className="luna-help-text">
            Need immediate help? Call our emergency line: <strong className="luna-text-gradient">07718851362</strong>
          </p>
          <p className="luna-help-text">
            This form is saved as you type and works offline.
          </p>
        </div>

      <style jsx>{`
        .luna-page {
          min-height: 100vh;
          background-color: var(--luna-bg-secondary);
          padding: var(--luna-space-12) 0;
        }

        .luna-page-header {
          text-align: center;
          margin-bottom: var(--luna-space-12);
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .luna-page-title {
          font-size: var(--luna-font-size-4xl);
          font-weight: var(--luna-font-weight-bold);
          color: var(--luna-text-primary);
          margin-bottom: var(--luna-space-4);
          line-height: var(--luna-line-height-tight);
        }

        .luna-page-subtitle {
          font-size: var(--luna-font-size-lg);
          color: var(--luna-text-secondary);
          line-height: var(--luna-line-height-relaxed);
        }

        .luna-progress-section {
          margin-bottom: var(--luna-space-8);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .luna-progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--luna-space-3);
        }

        .luna-progress-step {
          font-size: var(--luna-font-size-sm);
          font-weight: var(--luna-font-weight-semibold);
          color: var(--luna-text-primary);
        }

        .luna-progress-percent {
          font-size: var(--luna-font-size-sm);
          color: var(--luna-text-muted);
        }

        .luna-help-section {
          margin-top: var(--luna-space-12);
          text-align: center;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .luna-help-text {
          font-size: var(--luna-font-size-sm);
          color: var(--luna-text-muted);
          margin-bottom: var(--luna-space-2);
        }

        .luna-help-text:last-child {
          margin-bottom: 0;
        }
      `}</style>
        </div> {/* Close luna-container */}
      </main> {/* Close luna-page */}
    </>
  );
};

export default GetSupport;