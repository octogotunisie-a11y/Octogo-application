// src/services/documentsService.js — « Mes documents » (API /api/documents)
import { requete, telecharger } from './apiClient';

export const FORMATS_ACCEPTES = ['.pdf', '.docx', '.doc', '.txt'];
export const TAILLE_MAX_MO = 10;

export const CATEGORIES = [
  { valeur: 'besoin', label: 'Besoin de formation' },
  { valeur: 'referentiel', label: 'Référentiel de compétences' },
  { valeur: 'programme', label: 'Programme' },
  { valeur: 'rapport', label: 'Rapport' },
  { valeur: 'autre', label: 'Autre' },
];

// Contrôle côté navigateur (le serveur revérifie toujours) pour répondre vite et clairement.
export function validerFichier(file) {
  if (!file) return 'Sélectionnez un document.';
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!FORMATS_ACCEPTES.includes(ext)) return `Format non supporté. Formats acceptés : ${FORMATS_ACCEPTES.join(', ')}.`;
  if (file.size > TAILLE_MAX_MO * 1024 * 1024) return `Fichier trop volumineux (maximum ${TAILLE_MAX_MO} Mo).`;
  if (file.size === 0) return 'Ce fichier est vide.';
  return null;
}

export const listerDocuments = async () => (await requete('GET', '/documents')).documents;

export async function importerDocument(file, { categorie = 'autre', note = '' } = {}) {
  const form = new FormData();
  form.append('document', file);
  form.append('categorie', categorie);
  form.append('note', note);
  return (await requete('POST', '/documents', { form })).document;
}

export const supprimerDocument = (id) => requete('DELETE', `/documents/${id}`);
export const telechargerDocument = (doc) => telecharger(`/documents/${doc.id}/download`, doc.nom);
export const monAcces = () => requete('GET', '/access/me');

export const formaterTaille = (octets) => {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1)} Mo`;
};

// Libellé + ton du statut de lecture automatique (utilisé par l'IA).
export function statutExtraction(extraction) {
  switch (extraction && extraction.status) {
    case 'extracted': return { ton: 'succes', label: 'Lisible par l’IA' };
    case 'empty': return { ton: 'attente', label: 'Aucun texte détecté' };
    case 'unsupported': return { ton: 'attente', label: 'Lecture non prise en charge' };
    default: return { ton: 'danger', label: 'Lecture impossible' };
  }
}
