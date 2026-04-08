import { useState } from 'react';
import { validatePostcode, validateEmail, validatePhone, calculateFormProgress } from '../utils/validation';

export function useFormValidation(initialData = {}, requiredFields = []) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'postcode': {
        const postcodeResult = validatePostcode(value);
        if (!postcodeResult.valid) {
          error = postcodeResult.message;
        } else if (postcodeResult.message) {
          // Warning, not error
          error = postcodeResult.message;
        }
        break;
      }

      case 'email':
        if (value) {
          const emailResult = validateEmail(value);
          if (!emailResult.valid) error = emailResult.message;
        }
        break;

      case 'phone':
        if (value) {
          const phoneResult = validatePhone(value);
          if (!phoneResult.valid) error = phoneResult.message;
        }
        break;

      default:
        if (requiredFields.includes(name) && (!value || value.toString().trim() === '')) {
          error = 'This field is required';
        }
    }

    return error;
  };

  const updateField = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const touchField = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(requiredFields.reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {}));

    return isValid;
  };

  const progress = calculateFormProgress(formData, requiredFields);

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  };

  return {
    formData,
    errors,
    touched,
    progress,
    updateField,
    touchField,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0 && requiredFields.every(field => 
      formData[field] !== null && 
      formData[field] !== undefined && 
      formData[field] !== '' && 
      formData[field] !== false
    )
  };
}