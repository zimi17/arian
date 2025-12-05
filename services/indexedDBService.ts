// indexedDBService.ts - IndexedDB implementation for better storage
interface DBConfig {
  dbName: string;
  version: number;
  storeName: string;
}

// Initialize IndexedDB
export const initDB = (config: DBConfig): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.dbName, config.version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(config.storeName)) {
        const store = db.createObjectStore(config.storeName, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// Save data to IndexedDB
export const saveToDB = async (config: DBConfig, data: any): Promise<void> => {
  const db = await initDB(config);
  const transaction = db.transaction([config.storeName], 'readwrite');
  const store = transaction.objectStore(config.storeName);

  return new Promise((resolve, reject) => {
    const request = store.put(data);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Load data from IndexedDB by ID
export const loadFromDB = async (config: DBConfig, id: string): Promise<any> => {
  const db = await initDB(config);
  const transaction = db.transaction([config.storeName], 'readonly');
  const store = transaction.objectStore(config.storeName);

  return new Promise((resolve, reject) => {
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Delete data from IndexedDB
export const deleteFromDB = async (config: DBConfig, id: string): Promise<void> => {
  const db = await initDB(config);
  const transaction = db.transaction([config.storeName], 'readwrite');
  const store = transaction.objectStore(config.storeName);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Get all records from IndexedDB
export const getAllFromDB = async (config: DBConfig): Promise<any[]> => {
  const db = await initDB(config);
  const transaction = db.transaction([config.storeName], 'readonly');
  const store = transaction.objectStore(config.storeName);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// Clear all records from the store
export const clearDB = async (config: DBConfig): Promise<void> => {
  const db = await initDB(config);
  const transaction = db.transaction([config.storeName], 'readwrite');
  const store = transaction.objectStore(config.storeName);

  return new Promise((resolve, reject) => {
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};