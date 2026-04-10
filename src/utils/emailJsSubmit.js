import emailjs from '@emailjs/browser';
import {
  buildFormEmailHtml,
  buildFormEmailSubject,
  formatFormBodyPlain,
  formReplyToEmail,
  formTypeLabel,
} from './formEmailPayload';

/**
 * Free tier (~200 emails/month): https://www.emailjs.com/
 * Connect the EmailJS “Email service” to Namecheap Private Email SMTP (not Gmail/Zoho).
 *
 * Prefer Firebase `sendFormNotificationEmail` (nodemailer) when VITE_FORM_NOTIFY_CLOUD=true — see .env.example.
 */
export function isEmailJsConfigured() {
  const k = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const s = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const t = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  return Boolean(k && s && t && String(k).trim().length > 5);
}

/**
 * @returns {Promise<void>}
 */
export async function sendFormViaEmailJs(formType, data) {
  if (!isEmailJsConfigured()) {
    throw new Error('EmailJS is not configured');
  }

  const safe = data && typeof data === 'object' ? data : {};
  const form_body = formatFormBodyPlain(formType, safe);
  const form_html = buildFormEmailHtml(formType, safe);
  const reply_to = formReplyToEmail(safe);

  const templateParams = {
    form_subject: buildFormEmailSubject(formType),
    form_type: formTypeLabel(formType),
    form_body,
    form_html,
    ...(reply_to ? { reply_to } : {}),
  };

  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    templateParams,
    { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
  );
}
