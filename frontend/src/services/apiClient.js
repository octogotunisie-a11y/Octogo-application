// frontend/src/services/apiClient.js
// -----------------------------------------------------------------------------
// Client HTTP centralisé. Aucun composant ne fait `fetch` directement.
// - Injecte le token JWT automatiquement
// - Gère 401 (redirection login)
// - Renvoie le payload JSON ou un Blob selon le Content-Type
// - Lève des erreurs enrichies (status, payload)
//
// COMPATIBILITÉ : expose aussi `requete` et `telecharger` pour les services
// existants (adminService.js, documentsService.js) qui les utilisaient déjà.
// -----------------------------------------------------------------------------

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// ---------------------------------------------------------- Fonction principale
export async function api(path, { method = 'GET', body, headers = {}, isForm = false } = {}) {
  const token = localStorage.getItem('token');

  const finalHeaders = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: isForm ? body : (body !== undefined ? JSON.stringify(body) : undefined)
    });
  } catch (networkError) {
    const err = new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
    err.status = 0;
    err.network = true;
    throw err;
  }

  // 401 → session expirée
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expirée');
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let payload;
  if (isJson) {
    payload = await res.json().catch(() => null);
  } else if (contentType.includes('octet-stream') || contentType.includes('pdf')) {
    payload = await res.blob();
  } else {
    payload = await res.text().catch(() => '');
  }

  if (!res.ok) {
    const message = (payload && payload.message) || `Erreur ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

// ---------------------------------------------------------- Helpers GET/POST
export const get  = (path, opts) => api(path, { ...opts, method: 'GET' });
export const post = (path, body, opts) => api(path, { ...opts, method: 'POST', body });
export const put  = (path, body, opts) => api(path, { ...opts, method: 'PUT', body });
export const del  = (path, opts) => api(path, { ...opts, method: 'DELETE' });

// ---------------------------------------------------------- Upload
export async function upload(path, { file, fields = {} } = {}) {
  const form = new FormData();
  if (file) form.append('file', file);
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return api(path, { method: 'POST', body: form, isForm: true });
}

// ---------------------------------------------------------- Téléchargement
export async function downloadBlobUrl(path) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error('Téléchargement impossible');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// =========================================================================
// COMPATIBILITÉ avec les services existants
// =========================================================================

/**
 * Alias de `api` — les services adminService.js et documentsService.js
 * importaient `requete` depuis ce fichier.
 *
 * Signature : requete(path, options)
 *   - options.method    : 'GET' | 'POST' | 'PUT' | 'DELETE'
 *   - options.body      : objet ou FormData
 *   - options.isForm    : true si body est un FormData
 */
export async function requete(path, options = {}) {
  return api(path, options);
}

/**
 * Alias de `downloadBlobUrl` — documentsService.js importait `telecharger`.
 *
 * Retourne une URL de blob utilisable dans <a download> ou <iframe src>.
 * L'appelant doit faire URL.revokeObjectURL quand il a fini.
 */
export async function telecharger(path) {
  return downloadBlobUrl(path);
}