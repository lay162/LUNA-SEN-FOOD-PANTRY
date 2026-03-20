// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your actual Firebase config
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "luna-sen-pantry",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Auto-sign in anonymously for SEN-friendly experience
let authInitialized = false;
export const initializeAuth = () => {
  if (authInitialized) return Promise.resolve();
  
  authInitialized = true;
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribe();
        resolve();
      } else {
        signInAnonymously(auth)
          .then(() => {
            unsubscribe();
            resolve();
          })
          .catch((error) => {
            console.error('Auth error:', error);
            unsubscribe();
            resolve(); // Continue even if auth fails
          });
      }
    });
  });
};

export default app;