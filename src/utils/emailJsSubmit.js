import emailjs from '@emailjs/browser';

/**
 * Free tier (~200 emails/month): https://www.emailjs.com/
 * Template should include {{form_type}} and {{form_body}} (plain text).
 */
export function isEmailJsConfigured() {
  const k = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const s = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const t = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  return Boolean(k && s && t && String(k).trim().length > 5);
}

function formatFormBody(formType, data) {
  const lines = [`Form: ${formType}`, `Time: ${new Date().toISOString()}`, '---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const v =
      typeof value === 'object' && !Array.isArray(value)
        ? JSON.stringify(value)
        : Array.isArray(value)
          ? value.join(', ')
          : String(value);
    lines.push(`${key}: ${v}`);
  }
  return lines.join('\n');
}

/**
 * @returns {Promise<void>}
 */
export async function sendFormViaEmailJs(formType, data) {
  if (!isEmailJsConfigured()) {
    throw new Error('EmailJS is not configured');
  }

  const templateParams = {
    form_type: formType === 'referral' ? 'Support referral' : 'Volunteer application',
    form_body: formatFormBody(formType, data),
  };

  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    templateParams,
    { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
  );
}
