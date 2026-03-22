// Form validation utilities
export function validatePostcode(postcode) {
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();
  
  if (!ukPostcodeRegex.test(cleanPostcode)) {
    return { valid: false, message: 'Please enter a valid UK postcode' };
  }
  
  // Check if it's in Wirral/Merseyside area (CH postcodes)
  const isWirral = cleanPostcode.startsWith('CH');
  
  return {
    valid: true,
    isWirral,
    formatted: formatPostcode(cleanPostcode),
    message: isWirral ? '' : 'We prioritise Wirral (CH) postcodes but welcome all referrals'
  };
}

export function formatPostcode(postcode) {
  const clean = postcode.replace(/\s+/g, '').toUpperCase();
  if (clean.length <= 4) return clean;
  return clean.slice(0, -3) + ' ' + clean.slice(-3);
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
}

export function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    return { valid: false, message: 'Please enter a valid UK phone number' };
  }
  /* National 0… (10–11 digits) or +44 without leading 0 */
  let national = digits;
  if (digits.startsWith('44') && digits.length >= 12) {
    national = `0${digits.slice(2)}`;
  }
  const ok =
    national.startsWith('0') && national.length >= 10 && national.length <= 11 && /^0\d+$/.test(national);
  return {
    valid: ok,
    message: ok ? '' : 'Please enter a valid UK phone number (e.g. 07123 456 789)',
  };
}

/**
 * Multi-step validation for the Get Support / self-referral form.
 * @param {Record<string, unknown>} data
 * @param {number} step 1-based
 * @returns {Record<string, string>} field key → error message
 */
export function validateSupportReferralStep(data, step) {
  const errors = {};

  const trim = (v) => (v == null ? '' : String(v).trim());
  const required = (key, message = 'This field is required') => {
    const v = data[key];
    if (v === false) return;
    if (v === undefined || v === null || trim(v) === '') {
      errors[key] = message;
    }
  };

  switch (step) {
    case 1: {
      required('firstName');
      required('lastName');
      required('phone');
      const phone = trim(data.phone);
      if (phone) {
        const phoneResult = validatePhone(phone);
        if (!phoneResult.valid) errors.phone = phoneResult.message;
      }
      const email = trim(data.email);
      if (email) {
        const emailResult = validateEmail(email);
        if (!emailResult.valid) errors.email = emailResult.message;
      }
      const postcode = trim(data.postcode);
      if (postcode) {
        const pc = validatePostcode(postcode);
        if (!pc.valid) errors.postcode = pc.message;
      }
      break;
    }
    case 2: {
      required('adultsCount', 'Please select number of adults');
      required('childrenCount', 'Please select number of children');
      const adults = parseInt(data.adultsCount, 10);
      if (!Number.isNaN(adults) && adults < 1) {
        errors.adultsCount = 'Please include at least one adult (18+) in the household';
      }
      const children = parseInt(data.childrenCount, 10);
      if (!Number.isNaN(children) && children > 0) {
        if (!trim(data.childrenAges)) {
          errors.childrenAges = 'Please give ages of children (e.g. 4, 7, 12)';
        }
      }
      break;
    }
    case 3: {
      if (data.hasSpecialNeeds) {
        if (!trim(data.senNeedsDetails)) {
          errors.senNeedsDetails = 'Please describe SEN / additional needs so we can support you';
        }
      }
      break;
    }
    case 4: {
      const types = data.supportType;
      const household = data.householdItemRequests;
      const hasSupportType = Array.isArray(types) && types.length > 0;
      const hasHouseholdTicks = Array.isArray(household) && household.length > 0;
      if (!hasSupportType && !hasHouseholdTicks) {
        errors.supportType =
          'Please tick at least one type of support (e.g. food parcel) or a household item (e.g. laundry detergent)';
      }
      required('urgencyLevel');
      break;
    }
    case 5: {
      if (data.hasPets && !trim(data.petDetails)) {
        errors.petDetails = 'Please briefly describe your pets and what you need (e.g. pet food)';
      }
      break;
    }
    case 6: {
      if (!data.consentData) {
        errors.consentData = 'Please confirm consent to continue';
      }
      break;
    }
    default:
      break;
  }

  return errors;
}

// Form progress tracking
export function calculateFormProgress(formData, requiredFields) {
  const completed = requiredFields.filter(field => {
    const value = formData[field];
    return value !== null && value !== undefined && value !== '' && value !== false;
  });
  
  return Math.round((completed.length / requiredFields.length) * 100);
}

// Accessibility helpers
export function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });
  
  firstElement?.focus();
}

// Local storage helpers with expiry
export function setWithExpiry(key, value, ttl) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  const item = JSON.parse(itemStr);
  const now = new Date();
  
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return item.value;
}

// Debounce utility for form inputs
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}