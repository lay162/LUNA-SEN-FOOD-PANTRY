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
  const ukPhoneRegex = /^(\+44|0)[0-9]{10}$/;
  const clean = phone.replace(/\s+/g, '');
  
  return {
    valid: ukPhoneRegex.test(clean),
    message: ukPhoneRegex.test(clean) ? '' : 'Please enter a valid UK phone number'
  };
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