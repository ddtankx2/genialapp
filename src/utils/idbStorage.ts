export async function saveToIDB<T>(key: string, value: T): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('RedStreamIPTVDB', 2);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('cacheStore')) {
          db.createObjectStore('cacheStore');
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        try {
          const tx = db.transaction('cacheStore', 'readwrite');
          const store = tx.objectStore('cacheStore');
          store.put(value, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      };
      request.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getFromIDB<T>(key: string): Promise<T | null> {
  if (typeof indexedDB === 'undefined') return null;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('RedStreamIPTVDB', 2);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('cacheStore')) {
          db.createObjectStore('cacheStore');
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        try {
          const tx = db.transaction('cacheStore', 'readonly');
          const store = tx.objectStore('cacheStore');
          const getReq = store.get(key);
          getReq.onsuccess = () => resolve(getReq.result || null);
          getReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function clearIDB(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('RedStreamIPTVDB', 2);
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        try {
          const tx = db.transaction('cacheStore', 'readwrite');
          const store = tx.objectStore('cacheStore');
          store.clear();
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      };
      request.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}
