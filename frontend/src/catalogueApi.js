// src/catalogueApi.js
// -----------------------------------------------------------------------------
// Client API du module « Catalogue & Génération de Formation ».
// Chemins relatifs (/api/...) : passent par le proxy Vite -> backend Express.
// Le jeton JWT est lu depuis localStorage (même convention qu'AuthContext).
// -----------------------------------------------------------------------------

const BASE = '/api/catalogue';

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(url, options = {}) {
    const resp = await fetch(url, {
        ...options,
        headers: {
            ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
            ...authHeaders(),
            ...(options.headers || {}),
        },
    });
    let data = null;
    try { data = await resp.json(); } catch (_) { /* réponse non JSON */ }
    if (!resp.ok || (data && data.success === false)) {
        const message = (data && data.message) || `Erreur HTTP ${resp.status}`;
        throw new Error(message);
    }
    return data;
}

const qs = (params = {}) => {
    const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
    return entries.length ? '?' + new URLSearchParams(entries).toString() : '';
};

// ============================ ESPACE CLIENT ============================
export const catalogue = {
    domaines: () => request(`${BASE}/public/domaines`).then((d) => d.domaines || []),
    formations: (domaine) => request(`${BASE}/public/formations${qs({ domaine })}`).then((d) => d.formations || []),
    formateurs: ({ formationId, domaine } = {}) =>
        request(`${BASE}/public/formateurs${qs({ formationId, domaine })}`).then((d) => d.formateurs || []),
    creneaux: ({ formateurId, formationId } = {}) =>
        request(`${BASE}/public/creneaux${qs({ formateurId, formationId })}`).then((d) => d.creneaux || []),
    calculerPrix: (payload) =>
        request(`${BASE}/public/calculer-prix`, { method: 'POST', body: JSON.stringify(payload) }).then((d) => d.tarification),
    genererProposition: (payload) =>
        request(`${BASE}/public/generer-proposition`, { method: 'POST', body: JSON.stringify(payload) }).then((d) => d.proposition),
    mesPropositions: () => request(`${BASE}/public/mes-propositions`).then((d) => d.propositions || []),
};

// ============================ ADMINISTRATION ============================
export const catalogueAdmin = {
    // Formateurs
    listFormateurs: () => request(`${BASE}/admin/formateurs`).then((d) => d.formateurs || []),
    createFormateur: (f) => request(`${BASE}/admin/formateurs`, { method: 'POST', body: JSON.stringify(f) }).then((d) => d.formateur),
    updateFormateur: (id, f) => request(`${BASE}/admin/formateurs/${id}`, { method: 'PUT', body: JSON.stringify(f) }).then((d) => d.formateur),
    deleteFormateur: (id) => request(`${BASE}/admin/formateurs/${id}`, { method: 'DELETE' }),
    uploadPhoto: (id, file) => {
        const fd = new FormData();
        fd.append('photo', file);
        return request(`${BASE}/admin/formateurs/${id}/photo`, { method: 'POST', body: fd }).then((d) => d.photo);
    },
    // Formations
    listFormations: () => request(`${BASE}/admin/formations`).then((d) => d.formations || []),
    createFormation: (f) => request(`${BASE}/admin/formations`, { method: 'POST', body: JSON.stringify(f) }).then((d) => d.formation),
    updateFormation: (id, f) => request(`${BASE}/admin/formations/${id}`, { method: 'PUT', body: JSON.stringify(f) }).then((d) => d.formation),
    deleteFormation: (id) => request(`${BASE}/admin/formations/${id}`, { method: 'DELETE' }),
    // Créneaux
    listCreneaux: () => request(`${BASE}/admin/creneaux`).then((d) => d.creneaux || []),
    createCreneau: (c) => request(`${BASE}/admin/creneaux`, { method: 'POST', body: JSON.stringify(c) }).then((d) => d.creneau),
    updateCreneau: (id, c) => request(`${BASE}/admin/creneaux/${id}`, { method: 'PUT', body: JSON.stringify(c) }).then((d) => d.creneau),
    deleteCreneau: (id) => request(`${BASE}/admin/creneaux/${id}`, { method: 'DELETE' }),
    // Tarification
    getTarifs: () => request(`${BASE}/admin/tarifs`).then((d) => d.tarifs || {}),
    updateTarifs: (t) => request(`${BASE}/admin/tarifs`, { method: 'PUT', body: JSON.stringify(t) }).then((d) => d.tarifs),
    // Propositions
    listPropositions: () => request(`${BASE}/admin/propositions`).then((d) => d.propositions || []),
    updateProposition: (id, p) => request(`${BASE}/admin/propositions/${id}`, { method: 'PUT', body: JSON.stringify(p) }).then((d) => d.proposition),
    deleteProposition: (id) => request(`${BASE}/admin/propositions/${id}`, { method: 'DELETE' }),
};

export default catalogue;