// src/client/api/documents.js
// -----------------------------------------------------------------------------
// Couche documents — deux implémentations :
//   • MOCK   : métadonnées dans mockStore + fichiers dans IndexedDB (navigateur)
//   • RÉEL   : /api/documents côté Express (à venir)
//
// Le composant UI appelle UNIQUEMENT ces fonctions. Aucune ne touche le DOM.
// -----------------------------------------------------------------------------
import { USE_MOCK, http } from './index';
import {
  useMock, maj, documentsDe, prochainId, tracer,
  CATEGORIES_DOCUMENT, iconeDocument, typeDocument
} from '../../mock/mockStore.jsx';

export const MAX_FILE_MB = 10;
export const EXTENSIONS_ACCEPTEES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.md', '.csv'];

// ---------------------------------------------------------- IndexedDB (mock)
const DB_NAME = 'apa_documents';
const STORE = 'files';
const VERSION = 1;

let _dbPromise = null;
function _getDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

async function _putFile(id, file) {
  const db = await _getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(file, String(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function _getFile(id) {
  const db = await _getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(String(id));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function _delFile(id) {
  const db = await _getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(String(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ------------------------------------------------------------------ Utils
export function formaterTaille(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function validerFichier(file) {
  if (!file) return { ok: false, raison: 'Aucun fichier sélectionné.' };
  const name = (file.name || '').toLowerCase();
  if (!EXTENSIONS_ACCEPTEES.some(ext => name.endsWith(ext))) {
    return { ok: false, raison: 'format', nom: file.name };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return { ok: false, raison: 'taille', max: MAX_FILE_MB };
  }
  return { ok: true };
}

// ------------------------------------------------------------------ API
// Lecture des documents d'une société (mock uniquement pour l'instant).
export function lireDocuments(data, societeId) {
  if (USE_MOCK) return documentsDe(data, societeId);
  throw new Error('Mode réel non implémenté côté documents');
}

// Ajout d'un document. Renvoie l'id créé.
export async function ajouterDocument({ data, societeId, profilId, nom, categorie, file }) {
  if (!USE_MOCK) throw new Error('Mode réel non implémenté côté documents');
  let newId = null;
  maj((s) => {
    newId = prochainId(s, 'document');
    s.documents.push({
      id: newId,
      societe_id: societeId,
      nom,
      categorie: categorie || 'Autre',
      ajoute_par: profilId || null,
      date: new Date().toISOString().slice(0, 10),
      taille: file ? formaterTaille(file.size) : '—',
      statut: 'en_cours'
    });
    tracer(s, profilId || null, 'document_ajoute', nom);
  });
  if (newId && file) {
    try { await _putFile(newId, file); } catch (e) { console.warn('IndexedDB:', e); }
  }
  return newId;
}

// Suppression d'un document.
export async function supprimerDocument({ data, docId, profilId, nom }) {
  if (!USE_MOCK) throw new Error('Mode réel non implémenté côté documents');
  await _delFile(docId).catch(() => {});
  maj((s) => {
    s.documents = s.documents.filter((x) => x.id !== docId);
    tracer(s, profilId || null, 'document_supprime', nom);
  });
}

// Obtient une URL affichable pour un document (blob URL ou mock).
export async function urlApercu(docId) {
  if (!USE_MOCK) throw new Error('Mode réel non implémenté côté documents');
  const file = await _getFile(docId);
  return file ? URL.createObjectURL(file) : null;
}

// Extrait le texte exploitable par l'IA (mock uniquement : txt/md/csv).
export async function extraireTexte(docId) {
  if (!USE_MOCK) return '';
  const file = await _getFile(docId);
  if (!file) return '';
  const n = (file.name || '').toLowerCase();
  if (n.endsWith('.txt') || n.endsWith('.md') || n.endsWith('.csv')) {
    try { return await file.text(); } catch { return ''; }
  }
  return '';
}

// Ré-exports pour commodité côté UI
export { CATEGORIES_DOCUMENT, iconeDocument, typeDocument };