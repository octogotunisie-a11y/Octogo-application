// src/client/api/index.js
// -----------------------------------------------------------------------------
// Aiguillage unique entre le mode DÉMO (mock local) et le mode RÉEL (backend).
// Bascule par variable d'environnement :
//     VITE_USE_MOCK=true    → démo
//     VITE_USE_MOCK=false   → réel (appelle Express)
//
// Les composants UI n'appellent JAMAIS fetch directement. Ils passent par ici.
// -----------------------------------------------------------------------------

export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// Enveloppe fetch : gère token, JSON, erreurs lisibles.
export async function http(path, { method = 'GET', body, headers = {}, isForm = false } = {}) {
  const token = localStorage.getItem('token');
  const finalHeaders = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined)
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expirée');
  }

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.blob();

  if (!res.ok) {
    const message = (payload && payload.message) || `Erreur ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload ;
}