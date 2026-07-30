// Native IndexedDB storage manager to efficiently store & query 30,000+ channels, 30,000+ movies, and 30,000+ series
// bypassing localStorage 5MB quota limits.

const DB_NAME = 'RedStream_IPTV_Storage_DB';
const DB_VERSION = 2;

export interface StorageCounts {
  liveCount: number;
  movieCount: number;
  seriesCount: number;
  lastUpdated: number | null;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB não é suportado neste navegador.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Live Channels Store
      if (!db.objectStoreNames.contains('live_channels')) {
        const liveStore = db.createObjectStore('live_channels', { keyPath: 'storeId' });
        liveStore.createIndex('serverKey', 'serverKey', { unique: false });
        liveStore.createIndex('category_id', 'category_id', { unique: false });
      }

      // Movies Store
      if (!db.objectStoreNames.contains('movies')) {
        const movieStore = db.createObjectStore('movies', { keyPath: 'storeId' });
        movieStore.createIndex('serverKey', 'serverKey', { unique: false });
        movieStore.createIndex('category_id', 'category_id', { unique: false });
      }

      // Series Store
      if (!db.objectStoreNames.contains('series')) {
        const seriesStore = db.createObjectStore('series', { keyPath: 'storeId' });
        seriesStore.createIndex('serverKey', 'serverKey', { unique: false });
        seriesStore.createIndex('category_id', 'category_id', { unique: false });
      }

      // Metadata Store
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'serverKey' });
      }
    };
  });
}

/**
 * Save items into IndexedDB in bulk chunks
 */
export async function saveItemsToStorage<T extends Record<string, any>>(
  serverKey: string,
  type: 'live' | 'vod' | 'series',
  items: T[]
): Promise<number> {
  try {
    const db = await openDB();
    const storeName = type === 'live' ? 'live_channels' : type === 'vod' ? 'movies' : 'series';
    const idProp = type === 'series' ? 'series_id' : 'stream_id';

    // First clear old items for this serverKey
    await clearServerTypeStorage(db, storeName, serverKey);

    if (!items || items.length === 0) return 0;

    const tx = db.transaction([storeName, 'metadata'], 'readwrite');
    const store = tx.objectStore(storeName);

    // Prepare items with composite primary key
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = item[idProp] ?? i;
      const record = {
        ...item,
        storeId: `${serverKey}_${itemId}`,
        serverKey: serverKey,
        category_id: String(item.category_id || '')
      };
      store.put(record);
    }

    // Update metadata count
    const metaStore = tx.objectStore('metadata');
    const metaRequest = metaStore.get(serverKey);

    metaRequest.onsuccess = () => {
      const currentMeta = metaRequest.result || {
        serverKey,
        liveCount: 0,
        movieCount: 0,
        seriesCount: 0,
        lastUpdated: Date.now()
      };

      if (type === 'live') currentMeta.liveCount = items.length;
      if (type === 'vod') currentMeta.movieCount = items.length;
      if (type === 'series') currentMeta.seriesCount = items.length;
      currentMeta.lastUpdated = Date.now();

      metaStore.put(currentMeta);
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(items.length);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`IndexedDB save error for ${type}:`, err);
    return items ? items.length : 0;
  }
}

/**
 * Get items from IndexedDB
 */
export async function getItemsFromStorage<T>(
  serverKey: string,
  type: 'live' | 'vod' | 'series',
  categoryId?: string,
  search?: string,
  limit?: number
): Promise<T[]> {
  try {
    const db = await openDB();
    const storeName = type === 'live' ? 'live_channels' : type === 'vod' ? 'movies' : 'series';

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index('serverKey');
      const request = index.getAll(serverKey);

      request.onsuccess = () => {
        let results: T[] = request.result || [];

        // Filter by category
        if (categoryId && categoryId !== 'all' && categoryId !== 'm_all' && categoryId !== 's_all') {
          const catStr = String(categoryId);
          results = results.filter((item: any) => String(item.category_id) === catStr);
        }

        // Filter by search query
        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          results = results.filter((item: any) => {
            const name = String(item.name || '').toLowerCase();
            return name.includes(q);
          });
        }

        // Apply limit if specified
        if (limit && limit > 0 && results.length > limit) {
          results = results.slice(0, limit);
        }

        resolve(results);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    console.warn(`IndexedDB read error for ${type}:`, err);
    return [];
  }
}

/**
 * Get storage counts for a server
 */
export async function getStorageCounts(serverKey: string): Promise<StorageCounts> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('metadata', 'readonly');
      const store = tx.objectStore('metadata');
      const req = store.get(serverKey);

      req.onsuccess = () => {
        if (req.result) {
          resolve({
            liveCount: req.result.liveCount || 0,
            movieCount: req.result.movieCount || 0,
            seriesCount: req.result.seriesCount || 0,
            lastUpdated: req.result.lastUpdated || null
          });
        } else {
          resolve({ liveCount: 0, movieCount: 0, seriesCount: 0, lastUpdated: null });
        }
      };

      req.onerror = () => {
        resolve({ liveCount: 0, movieCount: 0, seriesCount: 0, lastUpdated: null });
      };
    });
  } catch (err) {
    return { liveCount: 0, movieCount: 0, seriesCount: 0, lastUpdated: null };
  }
}

/**
 * Clear items for a specific server and type
 */
function clearServerTypeStorage(db: IDBDatabase, storeName: string, serverKey: string): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const index = store.index('serverKey');
    const req = index.openCursor(IDBKeyRange.only(serverKey));

    req.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };

    req.onerror = () => resolve();
  });
}

/**
 * Clear all data for a server
 */
export async function clearAllStorageForServer(serverKey: string): Promise<void> {
  try {
    const db = await openDB();
    await Promise.all([
      clearServerTypeStorage(db, 'live_channels', serverKey),
      clearServerTypeStorage(db, 'movies', serverKey),
      clearServerTypeStorage(db, 'series', serverKey)
    ]);

    const tx = db.transaction('metadata', 'readwrite');
    tx.objectStore('metadata').delete(serverKey);
  } catch (e) {
    console.warn('Error clearing storage:', e);
  }
}
