// src/services/generationService.js
// -----------------------------------------------------------------------------
// Toute la communication réseau du module « Génération de Programme » passe
// par ce fichier. Aucune logique IA ici : les fonctions marquées TODO IA
// renvoient pour l'instant des structures vides/gabarits générées côté
// backend (voir backend/Routes/generationRoutes.js), à remplacer plus tard
// par un véritable appel au modèle.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// BUG CORRIGÉ (03/07/2026) : l'ancienne version construisait une URL absolue
// (`http://<host>:5000/api`) qui contournait le proxy Vite configuré dans
// vite.config.js (`/api` -> http://127.0.0.1:5000). Sur certaines machines
// (résolution localhost/IPv6, port déjà occupé, accès via 127.0.0.1 au lieu
// de localhost...), cet appel direct échouait silencieusement — c'est ce qui
// rendait le champ "Sujet / formation souhaitée" inopérant : la liste des
// thèmes ne se chargeait jamais. On utilise maintenant une URL RELATIVE,
// exactement comme AuthContext.jsx, DashboardAdmin.jsx, etc.
// -----------------------------------------------------------------------------
const API_BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(resp) {
  let data = {};
  try { data = await resp.json(); } catch (_) { /* réponse non-JSON (ex: download) */ }
  if (!resp.ok) {
    const msg = data.message || `Erreur serveur (${resp.status})`;
    throw new Error(msg);
  }
  return data;
}

// ==================== DEMANDES DE GÉNÉRATION ====================

export async function creerDemande(payload) {
  const resp = await fetch(`${API_BASE}/generation/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(resp);
}

export async function listerDemandes() {
  const resp = await fetch(`${API_BASE}/generation/requests`, { headers: authHeaders() });
  return handle(resp);
}

export async function obtenirDemande(id) {
  const resp = await fetch(`${API_BASE}/generation/requests/${id}`, { headers: authHeaders() });
  return handle(resp);
}

export async function mettreAJourDemande(id, patch) {
  const resp = await fetch(`${API_BASE}/generation/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  });
  return handle(resp);
}

export async function supprimerDemande(id) {
  const resp = await fetch(`${API_BASE}/generation/requests/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handle(resp);
}

// Upload du document décrivant le besoin (PDF / DOCX / DOC / TXT).
// TODO IA : ce document sera plus tard analysé automatiquement par le modèle
// pour préremplir les champs de l'étape 3 et alimenter la génération.
export async function uploaderDocumentBesoin(id, file) {
  const form = new FormData();
  form.append('document', file);
  const resp = await fetch(`${API_BASE}/generation/requests/${id}/upload`, {
    method: 'POST',
    headers: authHeaders(), // ne pas fixer Content-Type : le navigateur gère le multipart
    body: form,
  });
  return handle(resp);
}

// ==================== MODULES (cartes IA) ====================

// TODO IA : remplacer l'appel backend stub par un vrai pipeline de génération
// (analyse du besoin + document importé -> modèle -> structure JSON du module).
export async function genererModule(id, moduleKey) {
  const resp = await fetch(`${API_BASE}/generation/requests/${id}/modules/${moduleKey}/generate`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handle(resp);
}

// Régénérer = même endpoint que générer (le backend incrémente une version).
export async function regenererModule(id, moduleKey) {
  return genererModule(id, moduleKey);
}

export async function enregistrerModule(id, moduleKey, data) {
  const resp = await fetch(`${API_BASE}/generation/requests/${id}/modules/${moduleKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ data }),
  });
  return handle(resp);
}

export async function validerModule(id, moduleKey) {
  const resp = await fetch(`${API_BASE}/generation/requests/${id}/modules/${moduleKey}/valider`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  return handle(resp);
}

// Téléchargement : renvoie pour l'instant un export JSON lisible (gabarit).
// TODO : brancher la génération PDF/DOCX réelle (mise en page officielle)
// une fois les modèles Word/Excel officiels fournis par l'utilisateur.
export function urlTelechargementModule(id, moduleKey) {
  return `${API_BASE}/generation/requests/${id}/modules/${moduleKey}/download`;
}

const MODULES_PDF = ['fiche', 'devis', 'facture', 'presence', 'evaluation', 'kpi', 'impact'];

export async function telechargerModule(id, moduleKey) {
  const resp = await fetch(urlTelechargementModule(id, moduleKey), { headers: authHeaders() });
  if (!resp.ok) throw new Error(`Téléchargement impossible (${resp.status})`);
  const blob = await resp.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${moduleKey}_${id}.${MODULES_PDF.includes(moduleKey) ? 'pdf' : 'json'}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// Télécharge le CV (PDF) du formateur proposé.
export async function telechargerCV(formateurId, nomFichier) {
  const resp = await fetch(`${API_BASE}/generation/cv/${formateurId}`, { headers: authHeaders() });
  if (!resp.ok) throw new Error(`Téléchargement du CV impossible (${resp.status})`);
  const blob = await resp.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier || `cv_${formateurId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ==================== THÈMES (vocabulaire de référence — étape 3) ====================

// Liste de référence utilisée pour le sélecteur "sujet / formation souhaitée".
// Vient entièrement du backend (backend/data/simulation/themes.json) — aucune
// valeur n'est codée en dur dans les composants React.
export async function listerThemes() {
  const resp = await fetch(`${API_BASE}/generation/themes`);
  const data = await handle(resp);
  return data.themes || [];
}

// ==================== SERVICES EXISTANTS (réutilisés) ====================

// Réutilise le catalogue existant (formations / parcours / coaching / team building)
// pour préremplir les thèmes suggérés ou associer la demande à un service existant.
export async function listerServicesExistants() {
  const resp = await fetch(`${API_BASE}/services/all`);
  return handle(resp);
}
