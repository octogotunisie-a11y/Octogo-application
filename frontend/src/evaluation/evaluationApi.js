// frontend/src/evaluation/evaluationApi.js
// -----------------------------------------------------------------------------
// Accès réseau du module Évaluation.
// Reprend la stratégie d'AuthContext.jsx : appel direct du backend, 127.0.0.1
// forcé en local, jeton existant dans localStorage. Aucun nouveau login.
//
// C5 — ce fichier ne contient aucune règle de calcul, aucun seuil, aucune
// pondération. Le client affiche ce que le serveur lui renvoie ; il ne calcule
// jamais un niveau, un écart, ni une signature.
// -----------------------------------------------------------------------------
const HOST = (window.location.hostname === 'localhost' || window.location.hostname === '::1' || window.location.hostname === '')
    ? '127.0.0.1'
    : window.location.hostname;

const API = `${window.location.protocol}//${HOST}:5000/api/evaluation`;
const TIMEOUT_MS = 12000;

async function appel(chemin, options = {}) {
    const token = localStorage.getItem('token');
    const controleur = new AbortController();
    const minuterie = setTimeout(() => controleur.abort(), TIMEOUT_MS);
    try {
        const resp = await fetch(`${API}${chemin}`, {
            ...options,
            signal: controleur.signal,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {})
            }
        });
        let data = {};
        try { data = await resp.json(); } catch (e) { /* réponse non JSON */ }
        if (!resp.ok) {
            const erreur = new Error(data.message || `Erreur serveur (${resp.status}).`);
            erreur.code = data.code;
            erreur.status = resp.status;
            throw erreur;
        }
        return data;
    } catch (e) {
        if (e.name === 'AbortError') throw new Error('Le serveur met trop de temps à répondre. Réessayez.');
        if (e.message && /Failed to fetch|NetworkError|ERR_/.test(e.message)) {
            throw new Error('Serveur injoignable. Vérifiez que le backend est démarré.');
        }
        throw e;
    } finally {
        clearTimeout(minuterie);
    }
}

const corps = (body) => ({ body: JSON.stringify(body) });

export const evaluationApi = {
    contexte: () => appel('/contexte'),

    // Organisation
    listerEntites: () => appel('/entites'),
    creerEntite: (data) => appel('/entites', { method: 'POST', ...corps(data) }),
    ficheEntite: (id) => appel(`/entites/${id}`),
    creerLigne: (data) => appel('/lignes', { method: 'POST', ...corps(data) }),
    creerPersonne: (data) => appel('/personnes', { method: 'POST', ...corps(data) }),
    modifierPersonne: (id, data) => appel(`/personnes/${id}`, { method: 'PUT', ...corps(data) }),
    creerRelation: (data) => appel('/relations-observation', { method: 'POST', ...corps(data) }),
    supprimerRelation: (id) => appel(`/relations-observation/${id}`, { method: 'DELETE' }),

    // Référentiel
    listerObjets: () => appel('/referentiel/objets'),
    creerObjet: (data) => appel('/referentiel/objets', { method: 'POST', ...corps(data) }),
    descripteurs: (objetId) => appel(`/referentiel/objets/${objetId}/descripteurs`),

    // Cycles
    listerCycles: () => appel('/cycles'),
    creerCycle: (data) => appel('/cycles', { method: 'POST', ...corps(data) }),
    assignerObjets: (cycleId, data) => appel(`/cycles/${cycleId}/objets-assignes`, { method: 'POST', ...corps(data) }),
    cloreCycle: (id) => appel(`/cycles/${id}/clore`, { method: 'POST' }),
    ouvrirRestitution: (id) => appel(`/cycles/${id}/ouvrir-restitution`, { method: 'POST' }),
    archiverCycle: (id) => appel(`/cycles/${id}/archiver`, { method: 'POST' }),

    // Canal A — exigence perçue
    canalA: (cycleId) => appel(`/canal-a/${cycleId}`),
    declarerExigence: (cycleId, objetId, data) => appel(`/canal-a/${cycleId}/${objetId}`, { method: 'PUT', ...corps(data) }),

    // Canal B — cotation observée
    cockpit: (cycleId) => appel(`/canal-b/${cycleId}/cockpit`),
    coter: (cycleId, data) => appel(`/canal-b/${cycleId}/cotation`, { method: 'PUT', ...corps(data) }),

    // Restitution et pilotage
    restitution: (cycleId, personneId) => appel(`/restitution/${cycleId}/${personneId}`),
    dispersion: (cycleId, ligneId) => appel(`/dispersion/${cycleId}/${ligneId}`),
    maFiabilite: () => appel('/fiabilite/moi'),

    // Hors dispositif
    signaler: (data) => appel('/signalements', { method: 'POST', ...corps(data) }),
    listerSignalements: () => appel('/signalements'),

    // Audit
    audit: () => appel('/audit')
};

export const PLAFOND_OBJETS = 3;
export const MSG_PLAFOND = 'Un collaborateur ne peut pas avoir plus de 3 objets d\u2019évaluation par cycle trimestriel.';

// Les quatre niveaux, plus « Non observé » présenté AU MÊME RANG et non en
// option secondaire. Ce n'est ni zéro, ni un niveau 1 dégradé.
export const NIVEAUX = [
    { valeur: 1, label: 'Niveau 1', tag: 'Reconnaître' },
    { valeur: 2, label: 'Niveau 2', tag: 'Appliquer' },
    { valeur: 3, label: 'Niveau 3', tag: 'Réguler' },
    { valeur: 4, label: 'Niveau 4', tag: 'Transmettre' },
    { valeur: 'non_observe', label: 'Non observé', tag: 'Hors calcul' }
];

export const LIBELLE_SIGNATURE = {
    regime_maintenu: 'Régime maintenu',
    sous_utilisation: 'Sous-utilisation',
    surcharge_chronique: 'Surcharge chronique'
};

export const LIBELLE_STATUT_CYCLE = {
    ouvert: 'Ouvert — saisie en cours',
    saisie_close: 'Saisie close',
    calcule: 'Calculé',
    archive: 'Archivé'
};

export default evaluationApi;
