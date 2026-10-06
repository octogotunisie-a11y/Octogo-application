// frontend/src/mock/mockStore.jsx
// -----------------------------------------------------------------------------
// COUCHE MOCK UNIQUE de l'application front.
//
// Regroupe en un seul endroit : le jeu de données, le magasin d'état partagé et
// les sélecteurs. Aucun autre fichier ne détient de données. C'est ce fichier,
// et lui seul, qui sera remplacé par des appels Supabase.
//
// ⚠ AUCUNE base de données, AUCUN appel réseau, AUCUNE IA.
// Persistance en sessionStorage : l'état survit à un rafraîchissement pendant
// les tests et disparaît à la fermeture de l'onglet.
//
// Hiérarchie respectée dès maintenant :  Société → Formation → Cycle → Questions
//
// ⚠️ MODIFICATION (05/10/2026) :
//  - Ajout de `conversations: []` pour l'historique du chat type ChatGPT.
//  - Isolation par société ET par email (chaque compte a son propre historique).
//  - `_version` bumpée à 10, clé sessionStorage → 'octogo_mock_v10'.
// -----------------------------------------------------------------------------
import { useSyncExternalStore } from 'react';

// ============================================================================
// CONSTANTES PARTAGÉES
// ============================================================================
export const FORMATS_DOCUMENT = [
    { ext: 'pdf', label: 'PDF', icone: 'bi-file-earmark-pdf' },
    { ext: 'docx', label: 'Word (DOCX)', icone: 'bi-file-earmark-word' },
    { ext: 'xlsx', label: 'Excel (XLSX)', icone: 'bi-file-earmark-excel' }
];

export const extensionDe = (nom) => {
    const p = String(nom || '').split('.');
    return p.length > 1 ? p.pop().toLowerCase() : '';
};

export const typeDocument = (nom) => {
    const e = extensionDe(nom);
    if (e === 'pdf') return 'PDF';
    if (e === 'doc' || e === 'docx') return 'Word';
    if (e === 'xls' || e === 'xlsx') return 'Excel';
    return 'Autre';
};

export const iconeDocument = (nom) => {
    const n = String(nom || '').toLowerCase();
    if (n.endsWith('.pdf')) return 'bi-file-earmark-pdf';
    if (n.endsWith('.doc') || n.endsWith('.docx')) return 'bi-file-earmark-word';
    if (n.endsWith('.xls') || n.endsWith('.xlsx')) return 'bi-file-earmark-excel';
    return 'bi-file-earmark-text';
};

export const STATUTS_DOCUMENT = {
    integre: { code: 'integre', label: 'Intégré', ton: 'termine', icone: 'bi-check-circle-fill' },
    en_cours: { code: 'en_cours', label: 'En cours d’intégration', ton: 'soumis', icone: 'bi-hourglass-split' },
    attention: { code: 'attention', label: 'Problème d’intégration', ton: 'attente', icone: 'bi-exclamation-triangle-fill' },
    echec: { code: 'echec', label: 'Échec', ton: 'danger', icone: 'bi-x-circle-fill' }
};

export const STATUTS_FORMATION = {
    a_venir: { code: 'a_venir', label: 'À venir', ton: 'attente' },
    en_cours: { code: 'en_cours', label: 'En cours', ton: 'soumis' },
    terminee: { code: 'terminee', label: 'Terminée', ton: 'termine' }
};

export const TYPES_ACTIVITE = {
    connexion: { label: 'Connexion', icone: 'bi-box-arrow-in-right', ton: 'neutre' },
    deconnexion: { label: 'Déconnexion', icone: 'bi-box-arrow-right', ton: 'neutre' },
    document_ajoute: { label: 'Document ajouté', icone: 'bi-file-earmark-plus', ton: 'termine' },
    document_remplace: { label: 'Document remplacé', icone: 'bi-arrow-repeat', ton: 'soumis' },
    document_supprime: { label: 'Document supprimé', icone: 'bi-trash', ton: 'attente' },
    programme_genere: { label: 'Programme généré', icone: 'bi-stars', ton: 'termine' },
    evaluation_debutee: { label: 'Évaluation commencée', icone: 'bi-play-circle', ton: 'soumis' },
    evaluation_terminee: { label: 'Évaluation terminée', icone: 'bi-check2-circle', ton: 'termine' },
    test_soumis: { label: 'Test soumis', icone: 'bi-ui-checks', ton: 'termine' },
    role_modifie: { label: 'Rôle modifié', icone: 'bi-shield-check', ton: 'soumis' },
    generation_demandee: { label: 'Génération demandée', icone: 'bi-magic', ton: 'soumis' },
    societe_modifiee: { label: 'Rattachement modifié', icone: 'bi-building', ton: 'soumis' },
    compte_cree: { label: 'Compte créé', icone: 'bi-person-plus', ton: 'termine' },
    compte_supprime: { label: 'Compte supprimé', icone: 'bi-person-x', ton: 'attente' }
};

export const CATEGORIES_DOCUMENT = [
    'Stratégie', 'Organisation', 'Ressources humaines', 'Identité', 'Présentation', 'Postes', 'Autre'
];

export const ECHELLE = [
    { valeur: 1, label: 'Faible' },
    { valeur: 2, label: 'Modérée' },
    { valeur: 3, label: 'Élevée' },
    { valeur: 4, label: 'Très élevée' }
];

export const NIVEAUX = [
    { valeur: 1, label: 'Niveau 1' },
    { valeur: 2, label: 'Niveau 2' },
    { valeur: 3, label: 'Niveau 3' },
    { valeur: 4, label: 'Niveau 4' },
    { valeur: 'non_observe', label: 'Non observé' }
];

export const MAX_QUESTIONS_OBSERVATEUR = 2;

export const MSG = {
    situation_vide: 'Veuillez renseigner la situation observée.',
    date_vide: 'Veuillez renseigner la date de la situation.',
    niveau_vide: 'Sélectionnez un niveau ou « Non observé ».'
};

// ============================================================================
// ÉTAT INITIAL
// ============================================================================
export const donneesInitiales = () => ({
    _version: 10,

    societes: [],

    utilisateurs: [
        { id: 1, nom: 'Client Test', email: 'client@test.com', telephone: '', societe_id: null, roles: [], actif: true },
        { id: 2, nom: 'Chkiwa AMAL', email: 'amalch206@gmail.com', telephone: '', societe_id: null, roles: [], actif: true },
        { id: 3, nom: 'Amira', email: 'justf6115@gmail.com', telephone: '', societe_id: null, roles: [], actif: true }
    ],

    documents: [],

    formations: [],

    cycles: [],

    questions_observateur: [],

    tests: [],

    journal: [
        { id: 1, utilisateur_id: 1, type: 'connexion', detail: '', date: '2026-08-17T11:02:53.000Z' },
        { id: 2, utilisateur_id: 2, type: 'connexion', detail: '', date: '2026-08-14T10:59:16.000Z' },
        { id: 3, utilisateur_id: 3, type: 'connexion', detail: '', date: '2026-02-05T11:54:57.000Z' }
    ],

    // Historique des programmes. Vide au départ.
    programmes: [],

    // ⚠️ AJOUT — Historique des conversations (chat type ChatGPT), isolé par
    // société ET par email. Chaque entrée :
    //   { id, societe_id, utilisateur_email, titre, messages: [], cree_le, maj_le }
    conversations: [],

    sequences: {
        societe: 1, utilisateur: 4, document: 1, formation: 1, cycle: 1,
        question_observateur: 1, test: 1, resultat_test: 1, programme: 1, journal: 4,
        conversation: 1
    }
});

// Gabarit de questions vrai/faux (inchangé)
export function banqueTest(formation, theme = '') {
    return [
        { id: 1, texte: `Les apports de « ${formation} » s’appliquent de la même façon quel que soit l’interlocuteur.`, bonne: false },
        ...(theme ? [{ id: 6, texte: `« ${theme} » se travaille uniquement en formation, jamais en situation de travail.`, bonne: false }] : []),
        { id: 2, texte: 'Déléguer une tâche suppose de transmettre aussi le pouvoir de décision qui va avec.', bonne: true },
        { id: 3, texte: 'Un retour est plus utile lorsqu’il porte sur un comportement observable que sur un trait de personnalité.', bonne: true },
        { id: 4, texte: 'Un désaccord exprimé ouvertement dans une équipe traduit nécessairement un dysfonctionnement.', bonne: false },
        { id: 5, texte: 'Adapter sa posture au niveau d’autonomie de son interlocuteur renforce l’engagement.', bonne: true }
    ];
}

// ============================================================================
// MAGASIN — singleton
// ============================================================================
const CLE = 'octogo_mock_v10';  // ⚠️ bumpé de v9 → v10

const charger = () => {
    try {
        const brut = sessionStorage.getItem(CLE);
        if (!brut) return donneesInitiales();
        const data = JSON.parse(brut);
        if (!data || data._version !== donneesInitiales()._version) return donneesInitiales();
        return data;
    } catch (e) {
        return donneesInitiales();
    }
};

let etat = charger();
const abonnes = new Set();

const persister = () => {
    try { sessionStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* quota */ }
};

const subscribe = (f) => { abonnes.add(f); return () => abonnes.delete(f); };
const getSnapshot = () => etat;

export const maj = (muter) => {
    const copie = JSON.parse(JSON.stringify(etat));
    muter(copie);
    etat = copie;
    persister();
    abonnes.forEach((f) => f());
};

export const reinitialiser = () => {
    etat = donneesInitiales();
    persister();
    abonnes.forEach((f) => f());
};

export const useMock = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const useSocieteCourante = (user) => {
    const data = useMock();
    const profil = utilisateurParEmail(data, user && user.email);
    const societeId = profil ? profil.societe_id : null;
    const societe = societeId != null ? (data.societes.find((s) => s.id === societeId) || null) : null;
    return { data, profil, societe, societeId };
};

// ============================================================================
// SÉLECTEURS
// ============================================================================
export const utilisateurParEmail = (d, email) => {
    if (!email) return null;
    const e = String(email).trim().toLowerCase();
    return d.utilisateurs.find((u) => String(u.email).trim().toLowerCase() === e) || null;
};

export const documentsDe = (d, societeId) => d.documents.filter((x) => x.societe_id === societeId);
export const formationsDe = (d, societeId) => d.formations.filter((f) => f.societe_id === societeId);
export const aRole = (u, role) => !!u && Array.isArray(u.roles) && u.roles.includes(role);

export const utilisateursDe = (d, societeId, role) =>
    d.utilisateurs.filter((u) => u.societe_id === societeId && (!role || aRole(u, role)));

export const utilisateursNonRattaches = (d) =>
    d.utilisateurs.filter((u) => u.societe_id == null);

export const ROLES_EVALUATION = [
    { valeur: 'collaborateur', label: 'Collaborateur' },
    { valeur: 'observateur', label: 'Observateur' }
];

export const cycleDeSociete = (d, societeId) => d.cycles.find((c) => c.societe_id === societeId) || null;
export const formationDuCycle = (d, cycle) =>
    cycle ? d.formations.find((f) => f.id === cycle.formation_id) || null : null;

export const questionsObservateur = (d, cycleId, inclureInactives = false) =>
    d.questions_observateur
        .filter((q) => q.cycle_id === cycleId && (inclureInactives || q.actif))
        .sort((a, b) => a.ordre - b.ordre)
        .slice(0, MAX_QUESTIONS_OBSERVATEUR);

export const testDe = (d, formationId, type) =>
    d.tests.find((t) => t.formation_id === formationId && t.type === type) || null;

export const resultatDe = (d, testId, utilisateurId) =>
    d.resultats_test.find((r) => r.test_id === testId && r.utilisateur_id === utilisateurId) || null;

export const programmesDe = (d, societeId) =>
    d.programmes.filter((p) => p.societe_id === societeId).slice().reverse();

export const cycleDe = (d, utilisateurId) => {
    const u = d.utilisateurs.find((x) => x.id === utilisateurId);
    return u && u.societe_id != null ? cycleDeSociete(d, u.societe_id) : null;
};

export const prochainId = (d, cle) => {
    const n = d.sequences[cle] || 1;
    d.sequences[cle] = n + 1;
    return n;
};

// ============================================================================
// CONVERSATIONS (chat type ChatGPT) — ⚠️ AJOUT
// ============================================================================

/**
 * Liste les conversations d'un compte donné, triées par date de mise à jour
 * décroissante (la plus récente en premier).
 *
 * Isolation : filtre sur `societe_id` ET `utilisateur_email` pour qu'un
 * utilisateur ne voie jamais les conversations d'un autre.
 */
export const conversationsDe = (d, societeId, email) => {
    if (!d.conversations) return [];
    const e = String(email || '').trim().toLowerCase();
    return d.conversations
        .filter((c) =>
            c.societe_id === societeId &&
            String(c.utilisateur_email || '').trim().toLowerCase() === e
        )
        .slice()
        .sort((a, b) => new Date(b.maj_le) - new Date(a.maj_le));
};

/** Récupère une conversation par son id. */
export const conversationParId = (d, id) =>
    (d.conversations || []).find((c) => c.id === id) || null;

/** Compte les conversations d'un utilisateur (utile pour l'UI). */
export const nombreConversations = (d, societeId, email) =>
    conversationsDe(d, societeId, email).length;

// ============================================================================
// Gabarit questions observateur (inchangé)
// ============================================================================
export function gabaritQuestionsObservateur(formation, theme = '') {
    const sujet = theme || formation;
    return [
        `Quelle situation concrète démontre l’application des acquis de « ${sujet} » ?`,
        `Quels comportements liés à « ${sujet} » avez-vous observés ?`
    ].slice(0, MAX_QUESTIONS_OBSERVATEUR);
}

// ---------------------------------------------------------------- Fichiers
const fichiers = new Map();

export const memoriserFichier = (documentId, file) => {
    try { fichiers.set(documentId, { url: URL.createObjectURL(file), type: file.type }); }
    catch (e) { /* consultation indisponible */ }
};

export const urlFichier = (documentId) => {
    const f = fichiers.get(documentId);
    return f ? f.url : null;
};

export const oublierFichier = (documentId) => {
    const f = fichiers.get(documentId);
    if (f) { try { URL.revokeObjectURL(f.url); } catch (e) { /* ignoré */ } fichiers.delete(documentId); }
};

// ============================================================================
// OPÉRATIONS D'ADMINISTRATION
// ============================================================================
export const rattacherUtilisateur = (d, utilisateurId, societeId) => {
    const u = d.utilisateurs.find((x) => x.id === utilisateurId);
    if (!u) return;
    u.societe_id = societeId == null ? null : Number(societeId);
};

export const supprimerSociete = (d, societeId) => {
    d.societes = d.societes.filter((s) => s.id !== societeId);
    d.utilisateurs.forEach((u) => { if (u.societe_id === societeId) u.societe_id = null; });
    d.formations = d.formations.filter((f) => f.societe_id !== societeId);
    const cycles = d.cycles.filter((cy) => cy.societe_id === societeId).map((cy) => cy.id);
    d.cycles = d.cycles.filter((cy) => cy.societe_id !== societeId);
    d.questions_observateur = d.questions_observateur.filter((q) => !cycles.includes(q.cycle_id));
    d.tests = d.tests.filter((t) => t.societe_id !== societeId);
    // ⚠️ On supprime aussi les conversations rattachées à cette société.
    d.conversations = (d.conversations || []).filter((c) => c.societe_id !== societeId);
};

export const supprimerUtilisateur = (d, utilisateurId) => {
    d.utilisateurs = d.utilisateurs.filter((u) => u.id !== utilisateurId);
};

export const nomSociete = (d, societeId) => {
    if (societeId == null) return null;
    const s = d.societes.find((x) => x.id === societeId);
    return s ? s.nom : 'Société supprimée';
};

// ---------------------------------------------------------------- Activité
export const tracer = (d, utilisateurId, type, detail = '') => {
    d.journal.unshift({
        id: prochainId(d, 'journal'),
        utilisateur_id: utilisateurId || null,
        type,
        detail,
        date: new Date().toISOString()
    });
    if (d.journal.length > 300) d.journal.length = 300;
};

export const journalDe = (d, societeId, limite = 50) => {
    const ids = d.utilisateurs.filter((u) => u.societe_id === societeId).map((u) => u.id);
    return d.journal.filter((e) => ids.includes(e.utilisateur_id)).slice(0, limite);
};

export const journalUtilisateur = (d, utilisateurId, limite = 20) =>
    d.journal.filter((e) => e.utilisateur_id === utilisateurId).slice(0, limite);

// ---------------------------------------------------------------- Réordonnancement
export const permuterOrdre = (liste, id, sens, cycleId) => {
    const items = liste.filter((q) => q.cycle_id === cycleId).sort((a, b) => a.ordre - b.ordre);
    const i = items.findIndex((q) => q.id === id);
    const j = i + sens;
    if (i < 0 || j < 0 || j >= items.length) return;
    const tmp = items[i].ordre;
    items[i].ordre = items[j].ordre;
    items[j].ordre = tmp;
};