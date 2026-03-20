import React, { useState } from 'react';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { useFormValidation } from '../hooks/useFormValidation';
import { useOfflineForm } from '../hooks/useOfflineForm';
import '../styles/global.css';

const initialFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  contactPreference: 'phone',
  familySize: '',
  childrenAges: '',
  hasSpecialNeeds: false,
  specialNeedsDetails: '',
  dietaryRequirements: '',
  allergies: '',
  supportType: [],
  urgencyLevel: 'normal',
  consentData: false,
  preferredLanguage: 'english',
  preferredContact: 'weekday',
};

const Support = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;
  const { validateForm } = useFormValidation();
  useOfflineForm(formData);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value),
    }));
  };

  const nextStep = () => {
    const stepErrors = validateForm(formData, currentStep);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const stepErrors = validateForm(formData, currentStep);
    if (Object.keys(stepErrors).length === 0) {
      // Submit logic here (API call, etc.)
      alert('Support request submitted!');
      setFormData(initialFormData);
      setCurrentStep(1);
    } else {
      setErrors(stepErrors);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} />
            <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} />
            <FormField label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
            <FormField label="Email" name="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
            <FormField label="Contact Preference" name="contactPreference" value={formData.contactPreference} onChange={handleInputChange} error={errors.contactPreference} />
          </div>
        );
      case 2:
        return (
          <div>
            <FormField label="Family Size" name="familySize" value={formData.familySize} onChange={handleInputChange} error={errors.familySize} />
            <FormField label="Children Ages" name="childrenAges" value={formData.childrenAges} onChange={handleInputChange} error={errors.childrenAges} />
          </div>
        );
      case 3:
        return (
          <div>
            <FormField label="Special Needs" name="hasSpecialNeeds" value={formData.hasSpecialNeeds} onChange={handleInputChange} error={errors.hasSpecialNeeds} type="checkbox" />
            {formData.hasSpecialNeeds && (
              <FormField label="Special Needs Details" name="specialNeedsDetails" value={formData.specialNeedsDetails} onChange={handleInputChange} error={errors.specialNeedsDetails} />
            )}
            <FormField label="Dietary Requirements" name="dietaryRequirements" value={formData.dietaryRequirements} onChange={handleInputChange} error={errors.dietaryRequirements} />
            <FormField label="Allergies" name="allergies" value={formData.allergies} onChange={handleInputChange} error={errors.allergies} />
          </div>
        );
      case 4:
        return (
          <div>
            <FormField label="Support Type" name="supportType" value={formData.supportType} onChange={handleArrayChange} error={errors.supportType} type="checkbox" options={["Food", "Clothing", "Other"]} />
            <FormField label="Urgency Level" name="urgencyLevel" value={formData.urgencyLevel} onChange={handleInputChange} error={errors.urgencyLevel} options={["normal", "urgent"]} />
          </div>
        );
      case 5:
        return (
          <div>
            <FormField label="Consent" name="consentData" value={formData.consentData} onChange={handleInputChange} error={errors.consentData} type="checkbox" />
            <FormField label="Preferred Language" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleInputChange} error={errors.preferredLanguage} options={["english", "spanish", "other"]} />
            <FormField label="Preferred Contact" name="preferredContact" value={formData.preferredContact} onChange={handleInputChange} error={errors.preferredContact} options={["weekday", "weekend"]} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="luna-support-form luna-bg luna-min-h luna-pb">
      {/* Crisis Strip */}
      <div className="luna-help-section luna-bg-alert luna-sticky luna-z luna-shadow">
        <div className="luna-help-box luna-flex luna-max luna-font luna-gap">
          <div className="luna-help-box__title luna-flex luna-gap">
            <span className="luna-animate" aria-hidden="true">!</span>
            <span>CRISIS SUPPORT: NEED FOOD TODAY?</span>
          </div>
          <div className="luna-help-phone luna-flex luna-gap">
            <a href="tel:07123456789" className="luna-help-phone luna-bg-white luna-text-alert luna-rounded luna-hover luna-transition">
              Call/Text: 07123 456 789
            </a>
          </div>
        </div>
      </div>

      <main className="luna-max luna-p luna-pt">
        <header className="luna-form-step__header luna-text-center luna-mb">
          <div className="luna-form-step__title luna-inline luna-bg luna-text luna-font luna-mb luna-border">
            <span aria-hidden="true">❤</span> LUNA SEN PANTRY WIRRAL
          </div>
          <h1 className="luna-form-step__title luna-text luna-font luna-mb luna-tracking">
            Get <span className="luna-text-gradient">Support</span>
          </h1>
          <p className="luna-form-step__description luna-text luna-max luna-mx">
            Comprehensive family support assessment. Please fill out all details so we can best assist your household.
          </p>
        </header>

        {/* Progress Tracker */}
        <div className="luna-progress luna-bg luna-p luna-rounded luna-shadow luna-border luna-mb">
          <div className="luna-flex luna-justify luna-items luna-mb">
            <div>
              <p className="luna-progress__text luna-text luna-font luna-uppercase luna-tracking luna-mb">Current Progress</p>
              <h3 className="luna-progress__header luna-text luna-font">Step {currentStep} of {totalSteps}</h3>
            </div>
            <span className="luna-progress__percentage">{Math.round(progress)}%</span>
          </div>
          <div className="luna-progress__bar luna-bg luna-h luna-rounded luna-overflow">
            <div 
              className="luna-progress__fill luna-transition"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="luna-progress__steps luna-grid luna-gap luna-mt">
            {['Personal', 'Household', 'Needs', 'Contact'].map((label, idx) => (
              <div key={label} className="luna-progress__step luna-text-center">
                <div className={`luna-progress__step ${idx + 1 <= currentStep ? 'luna-progress__step--active' : ''}`} />
                <span className={`luna-progress__text luna-font luna-uppercase luna-tracking ${idx + 1 <= currentStep ? 'luna-progress__step--active' : ''}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="luna-form-step luna-bg luna-rounded luna-shadow luna-overflow luna-border">
          <form onSubmit={handleSubmit} className="luna-p luna-space luna-form-grid">
            {renderStep()}
            <div className="luna-form-actions luna-flex luna-justify luna-items luna-gap luna-pt luna-border luna-mt">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep} className="luna-button luna-button--secondary luna-w-full luna-order">
                  Previous
                </Button>
              )}
              <div className="luna-w-full luna-order">
                {currentStep < totalSteps ? (
                  <Button variant="gradient" onClick={nextStep} className="luna-button luna-button--primary luna-w-full">
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    variant="gradient" 
                    className="luna-button luna-button--primary luna-w-full luna-px"
                  >
                    Submit Application
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        <footer className="luna-mt luna-text-center luna-text luna-text-sm">
          <p>© {new Date().getFullYear()} LUNA SEN Pantry Wirral - Working with families across the Wirral.</p>
          <div className="luna-mt luna-flex luna-items luna-justify luna-gap">
            <a href="#" className="luna-text luna-hover luna-underline luna-decoration">Privacy Policy</a>
            <a href="#" className="luna-text luna-hover luna-underline luna-decoration">How we help</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Support;