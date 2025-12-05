import { openDB } from 'idb';

const DB_NAME = 'grounded-theory-db';
const DB_VERSION = 1;
const STORE_NAME = 'analyses';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('name', 'name');
      }
    },
  });
};

export const saveAnalysis = async (analysis) => {
  const db = await initDB();
  const timestamp = Date.now();
  const data = { ...analysis, timestamp };
  const id = await db.add(STORE_NAME, data);
  return { ...data, id };
};

export const getAllAnalyses = async () => {
  const db = await initDB();
  return db.getAllFromIndex(STORE_NAME, 'timestamp');
};

export const getAnalysis = async (id) => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const updateAnalysis = async (id, analysis) => {
  const db = await initDB();
  const data = { ...analysis, id, timestamp: Date.now() };
  await db.put(STORE_NAME, data);
  return data;
};

export const deleteAnalysis = async (id) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};
