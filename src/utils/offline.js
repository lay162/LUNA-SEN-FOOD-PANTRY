// Offline storage utilities for PWA
export class OfflineStorage {
  static dbName = 'LunaSenPantryDB';
  static version = 1;
  static storeName = 'submissions';

  static async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  static async saveSubmission(data) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const submission = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        synced: false,
        ...data
      };
      
      await store.add(submission);
      return submission.id;
    } catch (error) {
      console.error('Error saving offline submission:', error);
      throw error;
    }
  }

  static async getSubmissions() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting submissions:', error);
      return [];
    }
  }

  static async deleteSubmission(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  }

  static async markSynced(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const submission = getRequest.result;
        if (submission) {
          submission.synced = true;
          store.put(submission);
        }
      };
    } catch (error) {
      console.error('Error marking submission as synced:', error);
    }
  }
}

// Check if user is online
export function isOnline() {
  return navigator.onLine;
}

// Network status listener
export function onNetworkChange(callback) {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
  
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

// Register service worker for PWA (production only — in dev, cache-first SW makes Chrome
// show stale HTML/CSS/JS while Cursor’s preview often has no SW, so the two look “different”.)
export async function registerServiceWorker() {
  if (import.meta.env.DEV) {
    return null;
  }
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('SW registered:', registration);
      
      // Background sync registration
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        registration.sync.register('background-sync');
      }
      
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
}