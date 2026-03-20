import React, { useState } from 'react';
import FormField from '../components/FormField';
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
    <div className="support-page">
      <h2>Request Support</h2>
      <form onSubmit={handleSubmit}>
        {renderStep()}
        <div className="form-navigation">
          {currentStep > 1 && <button type="button" onClick={prevStep}>Back</button>}
          {currentStep < totalSteps && <button type="button" onClick={nextStep}>Next</button>}
          {currentStep === totalSteps && <button type="submit">Submit</button>}
        </div>
      </form>
    </div>
  );
};

export default Support;
