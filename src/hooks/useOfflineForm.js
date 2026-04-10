import { useState, useEffect } from 'react';
import { OfflineStorage, isOnline, onNetworkChange } from '../utils/offline';
import { isFirebaseConfigured, omitUndefinedDeep } from '../firebase';
import { isEmailJsConfigured, sendFormViaEmailJs } from '../utils/emailJsSubmit';
import { isFormEmailCloudConfigured, sendFormViaCloudFunction } from '../utils/formEmailCloud';

export function useOfflineForm(formType) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(isOnline());

  useEffect(() => {
    const cleanup = onNetworkChange(setNetworkStatus);
    return cleanup;
  }, []);

  /**
   * @returns {Promise<{ success: boolean; message?: string; offline?: boolean; viaEmail?: boolean }>}
   */
  const submitForm = async (formData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    const safeData = omitUndefinedDeep(formData) || {};
    const FIRESTORE_TIMEOUT_MS = 25000;

    try {
      if (networkStatus) {
        if (isFirebaseConfigured()) {
          try {
            await Promise.race([
              submitToFirebase(safeData, formType),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error('Firestore request timed out. Check network and Firebase rules.')),
                  FIRESTORE_TIMEOUT_MS
                )
              ),
            ]);
            await notifyTeamByEmail(formType, safeData);
            setSubmitStatus({ success: true, message: 'Form submitted successfully!' });
            return { success: true, message: 'Form submitted successfully!' };
          } catch (firestoreErr) {
            console.error('Firestore submit:', firestoreErr);
          }
        }

        const emailed = await notifyTeamByEmail(formType, safeData);
        if (emailed) {
          const id = await OfflineStorage.saveSubmission({
            type: formType,
            data: safeData,
          });
          setSubmitStatus({
            success: true,
            message: 'Emailed to team.',
            offline: true,
            id,
          });
          return {
            success: true,
            message:
              'Your form was sent by email to the team. A copy was also saved on this device.',
            offline: true,
            viaEmail: true,
          };
        }

        const id = await OfflineStorage.saveSubmission({
          type: formType,
          data: safeData,
        });
        setSubmitStatus({
          success: true,
          message: 'Saved on this device.',
          offline: true,
          id,
        });
        return {
          success: true,
          message:
            isFirebaseConfigured() || isEmailJsConfigured() || isFormEmailCloudConfigured()
              ? 'We could not finish sending to the cloud or email. Your answers were saved on this device.'
              : 'Your answers were saved on this device. Configure EmailJS or deploy form email (see .env.example) to notify the team automatically.',
          offline: true,
        };
      }

      const id = await OfflineStorage.saveSubmission({
        type: formType,
        data: safeData,
      });
      setSubmitStatus({
        success: true,
        message: 'Saved offline. Will sync when connection returns.',
        offline: true,
        id,
      });
      return {
        success: true,
        message: 'Saved offline. Will sync when connection returns.',
        offline: true,
      };
    } catch (error) {
      console.error('Form submit error:', error);
      if (networkStatus) {
        try {
          const id = await OfflineStorage.saveSubmission({
            type: formType,
            data: safeData,
          });
          setSubmitStatus({
            success: true,
            message: 'Saved offline due to connection issue. Will retry automatically.',
            offline: true,
            id,
          });
          return {
            success: true,
            message: 'Saved offline due to connection issue. Will retry automatically.',
            offline: true,
          };
        } catch (offlineError) {
          console.error('Offline save failed:', offlineError);
          setSubmitStatus({
            success: false,
            message: 'Unable to save form. Please try again.',
          });
          return {
            success: false,
            message:
              error?.message ||
              'Unable to submit right now. Please check your connection or call us on 07718851362.',
          };
        }
      }
      setSubmitStatus({
        success: false,
        message: 'Unable to save form. Please check your connection.',
      });
      return { success: false, message: 'Unable to save form. Please check your connection.' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitStatus,
    networkStatus,
    submitForm,
  };
}

/**
 * Try Cloud Function (SMTP) first when VITE_FORM_NOTIFY_CLOUD is set, then EmailJS.
 * @returns {true} if at least one path succeeded
 */
async function notifyTeamByEmail(formType, safeData) {
  if (isFormEmailCloudConfigured()) {
    try {
      await sendFormViaCloudFunction(formType, safeData);
      return true;
    } catch (err) {
      console.error('Form email (Cloud Function):', err);
    }
  }
  if (isEmailJsConfigured()) {
    try {
      await sendFormViaEmailJs(formType, safeData);
      return true;
    } catch (err) {
      console.error('Form email (EmailJS):', err);
    }
  }
  return false;
}

async function submitToFirebase(formData, formType) {
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
  const { getDb } = await import('../firebase');
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  const docData = {
    ...formData,
    type: formType,
    status: 'pending',
    createdAt: serverTimestamp(),
    source: 'web',
  };

  const collectionName =
    formType === 'referral' ? 'referrals' : formType === 'story' ? 'stories' : 'volunteers';
  await addDoc(collection(db, collectionName), docData);
}
