import { useState, useEffect } from 'react';
import { OfflineStorage, isOnline, onNetworkChange } from '../utils/offline';

export function useOfflineForm(formType) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(isOnline());

  useEffect(() => {
    const cleanup = onNetworkChange(setNetworkStatus);
    return cleanup;
  }, []);

  const submitForm = async (formData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (networkStatus) {
        // Try to submit online first
        await submitToFirebase(formData, formType);
        setSubmitStatus({ success: true, message: 'Form submitted successfully!' });
      } else {
        // Save offline
        const id = await OfflineStorage.saveSubmission({
          type: formType,
          data: formData
        });
        setSubmitStatus({ 
          success: true, 
          message: 'Saved offline. Will sync when connection returns.',
          offline: true,
          id
        });
      }
    } catch (error) {
      // If online submission fails, try offline storage
      if (networkStatus) {
        try {
          const id = await OfflineStorage.saveSubmission({
            type: formType,
            data: formData
          });
          setSubmitStatus({ 
            success: true, 
            message: 'Saved offline due to connection issue. Will retry automatically.',
            offline: true,
            id
          });
        } catch (offlineError) {
          setSubmitStatus({ 
            success: false, 
            message: 'Unable to save form. Please try again.' 
          });
        }
      } else {
        setSubmitStatus({ 
          success: false, 
          message: 'Unable to save form. Please check your connection.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitStatus,
    networkStatus,
    submitForm
  };
}

async function submitToFirebase(formData, formType) {
  // Import Firebase functions here to avoid bundle issues
  const { collection, addDoc } = await import('firebase/firestore');
  const { db } = await import('../firebase');

  const docData = {
    ...formData,
    type: formType,
    status: 'pending',
    createdAt: new Date(),
    source: 'web'
  };

  await addDoc(collection(db, formType === 'referral' ? 'referrals' : 'volunteers'), docData);
}