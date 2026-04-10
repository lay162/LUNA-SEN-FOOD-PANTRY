import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance, isFirebaseConfigured } from '../firebase';

/**
 * Production path: Firebase Callable + nodemailer + Namecheap Private Email SMTP.
 * Set VITE_FORM_NOTIFY_CLOUD=true after deploying sendFormNotificationEmail and SMTP_* secrets.
 */
export function isFormEmailCloudConfigured() {
  const v = import.meta.env.VITE_FORM_NOTIFY_CLOUD;
  return v === 'true' || v === '1';
}

/**
 * @param {string} formType referral | volunteer | story
 * @param {Record<string, unknown>} data
 * @returns {Promise<void>}
 */
export async function sendFormViaCloudFunction(formType, data) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured');
  }
  const fns = getFunctionsInstance();
  if (!fns) {
    throw new Error('Firebase Functions not available');
  }
  const callable = httpsCallable(fns, 'sendFormNotificationEmail');
  await callable({ formType, data });
}
