// frontend/src/client/docStore.js
// Stockage local IndexedDB pour les documents clients.

const DB_NAME = 'apa_documents';
const STORE   = 'files';
const VERSION = 1;

let _dbPromise = null;

function getDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
  return _dbPromise;
}

export async function saveFile(documentId, file) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(file, String(documentId));
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

export async function getFile(documentId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(String(documentId));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror   = () => reject(req.error);
  });
}

export async function deleteFile(documentId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(String(documentId));
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

export async function getFileObjectURL(documentId) {
  const file = await getFile(documentId);
  if (!file) return null;
  return URL.createObjectURL(file);
}

export async function extractText(documentId) {
  const file = await getFile(documentId);
  if (!file) return '';
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.csv')) {
    try { return await file.text(); } catch { return ''; }
  }
  return '';
}