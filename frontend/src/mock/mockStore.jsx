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
// AVERTISSEMENT : les questions et contenus sont fictifs. Ils ne proviennent
// pas du manuel d'évaluateur et ne doivent jamais être présentés comme les
// formulations officielles du protocole RESPECT.
// -----------------------------------------------------------------------------
import { useSyncExternalStore } from 'react';

// ============================================================================
// CONSTANTES PARTAGÉES
// ============================================================================
// Formats proposés dans l'interface d'ajout. Aucun fichier n'est réellement
// lu ni analysé à ce stade : seule l'extension oriente l'icône affichée.
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

// Statuts d'intégration d'un document. Aujourd'hui déclaratifs : ils
// préfigurent le traitement réel (extraction, indexation) qui viendra avec le
// backend. L'Admin les ajuste depuis sa console pour éprouver l'affichage.
export const STATUTS_DOCUMENT = {
    integre: { code: 'integre', label: 'Intégré', ton: 'termine', icone: 'bi-check-circle-fill' },
    en_cours: { code: 'en_cours', label: 'En cours d’intégration', ton: 'soumis', icone: 'bi-hourglass-split' },
    attention: { code: 'attention', label: 'Problème d’intégration', ton: 'attente', icone: 'bi-exclamation-triangle-fill' },
    echec: { code: 'echec', label: 'Échec', ton: 'danger', icone: 'bi-x-circle-fill' }
};

// Statuts d'une formation, du point de vue du client.
export const STATUTS_FORMATION = {
    a_venir: { code: 'a_venir', label: 'À venir', ton: 'attente' },
    en_cours: { code: 'en_cours', label: 'En cours', ton: 'soumis' },
    terminee: { code: 'terminee', label: 'Terminée', ton: 'termine' }
};

// Types d'action tracés dans le journal d'activité.
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

// Échelle de réponse du collaborateur (canal A).
export const ECHELLE = [
    { valeur: 1, label: 'Faible' },
    { valeur: 2, label: 'Modérée' },
    { valeur: 3, label: 'Élevée' },
    { valeur: 4, label: 'Très élevée' }
];

// Niveaux de cotation de l'observateur (canal B).
// « Non observé » figure au même rang que les quatre niveaux : ce n'est pas un
// zéro, et il n'est jamais repris automatiquement du cycle précédent.
export const NIVEAUX = [
    { valeur: 1, label: 'Niveau 1' },
    { valeur: 2, label: 'Niveau 2' },
    { valeur: 3, label: 'Niveau 3' },
    { valeur: 4, label: 'Niveau 4' },
    { valeur: 'non_observe', label: 'Non observé' }
];

// L'observateur ne reçoit jamais plus de deux questions : au-delà, la cotation
// devient déclarative et la donnée perd sa valeur.
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
    _version: 9,

    // Vide. AUCUNE société n'est créée automatiquement — ni depuis le champ
    // `company` d'un compte, ni depuis quoi que ce soit d'autre. Seul l'Admin
    // décide de leur création, depuis son interface.
    societes: [],

    // ⚠ AUCUN compte n'est inventé. Ces trois entrées correspondent aux trois
    // comptes client de backend/data/users.json. Le compte admin n'a pas de
    // fiche : il administre sans être évalué.
    //
    // `societe_id: null` et `roles: []` sont l'état de départ, et un état
    // parfaitement valide. Le rattachement et les rôles relèvent de l'Admin :
    // rien n'est deviné à partir du nom, de l'email ou de l'entreprise déclarée.
    utilisateurs: [
        { id: 1, nom: 'Client Test', email: 'client@test.com', telephone: '', societe_id: null, roles: [], actif: true },
        { id: 2, nom: 'Chkiwa AMAL', email: 'amalch206@gmail.com', telephone: '', societe_id: null, roles: [], actif: true },
        { id: 3, nom: 'Amira', email: 'justf6115@gmail.com', telephone: '', societe_id: null, roles: [], actif: true }
    ],

    // Vide. Chaque entrée porte `societe_id` et `ajoute_par`, figés au moment
    // du dépôt : si l'Admin déplace ensuite l'utilisateur vers une autre
    // société, le document reste rattaché à celle d'origine. L'historique
    // ne se réécrit pas.
    documents: [],

    // Vide : c'est l'Admin qui renseigne les formations et leurs thèmes.
    // Aucune formation n'est préchargée.
    formations: [],

    // Vide : un cycle naît de la préparation d'une évaluation par l'Admin.
    cycles: [],

    // Vide : les questions sont produites par la commande de génération.
    questions_observateur: [],

    // Vide : les tests sont produits par la commande de génération.
    tests: [],

    // Journal d'activité. Alimenté par les actions réelles des utilisateurs.
    // Les entrées d'amorçage reprennent les connexions consignées dans
    // users.json : aucune activité n'est inventée sur un compte fictif.
    journal: [
        { id: 1, utilisateur_id: 1, type: 'connexion', detail: '', date: '2026-08-17T11:02:53.000Z' },
        { id: 2, utilisateur_id: 2, type: 'connexion', detail: '', date: '2026-08-14T10:59:16.000Z' },
        { id: 3, utilisateur_id: 3, type: 'connexion', detail: '', date: '2026-02-05T11:54:57.000Z' }
    ],

    // Historique des programmes. Vide au départ : un programme n'y figure que
    // s'il a été réellement généré depuis « Génération Programme ».
    // Ne jamais y placer d'entrées fictives : l'historique n'est pas une vitrine.
    programmes: [],

    sequences: {
        societe: 1, utilisateur: 4, document: 1, formation: 1, cycle: 1,
        question_observateur: 1, test: 1, resultat_test: 1, programme: 1, journal: 4
    }
});

// Gabarit de questions vrai/faux, utilisé par la commande de génération de
// l'Admin. Les items sont composés à partir de la formation et du thème qu'il
// a lui-même renseignés — rien n'est préchargé dans l'application.
// TODO IA — remplacer par un appel réel : POST /api/ia/test { formation, theme, documents }
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
// MAGASIN — singleton, sans provider à monter.
// Les dashboards existants n'ont pas à être enveloppés dans un contexte.
// ============================================================================
const CLE = 'octogo_mock_v9';

const charger = () => {
    try {
        const brut = sessionStorage.getItem(CLE);
        if (!brut) return donneesInitiales();
        const data = JSON.parse(brut);
        // Structure obsolète : on repart propre plutôt que de laisser un écran
        // planter sur une clé absente.
        if (!data || data._version !== donneesInitiales()._version) return donneesInitiales();
        return data;
    } catch (e) {
        return donneesInitiales();
    }
};

let etat = charger();
const abonnes = new Set();

const persister = () => {
    try { sessionStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* quota : on continue en mémoire */ }
};

const subscribe = (f) => { abonnes.add(f); return () => abonnes.delete(f); };
const getSnapshot = () => etat;

/** Applique une mutation sur une copie de l'état. */
export const maj = (muter) => {
    const copie = JSON.parse(JSON.stringify(etat));
    muter(copie);
    etat = copie;
    persister();
    abonnes.forEach((f) => f());
};

/** Remet le jeu de données à son état d'origine. */
export const reinitialiser = () => {
    etat = donneesInitiales();
    persister();
    abonnes.forEach((f) => f());
};

/** Abonnement React à l'état mock. */
export const useMock = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

/**
 * Résout la société courante depuis le compte connecté.
 * AUCUN repli : si l'utilisateur n'est rattaché à aucune société, societeId
 * vaut null et l'écran le dit. Choisir une société à sa place serait
 * exactement l'automatisme que l'Admin doit contrôler.
 */
export const useSocieteCourante = (user) => {
    const data = useMock();
    const profil = utilisateurParEmail(data, user && user.email);
    const societeId = profil ? profil.societe_id : null;
    const societe = societeId != null ? (data.societes.find((s) => s.id === societeId) || null) : null;
    return { data, profil, societe, societeId };
};

// ============================================================================
// SÉLECTEURS — tout accès passe par ici, avec l'identifiant de la société.
// L'isolation entre sociétés ne peut pas être oubliée dans un écran.
// ============================================================================
export const utilisateurParEmail = (d, email) => {
    if (!email) return null;
    const e = String(email).trim().toLowerCase();
    return d.utilisateurs.find((u) => String(u.email).trim().toLowerCase() === e) || null;
};

export const documentsDe = (d, societeId) => d.documents.filter((x) => x.societe_id === societeId);
export const formationsDe = (d, societeId) => d.formations.filter((f) => f.societe_id === societeId);
// Un utilisateur possède un rôle si son tableau `roles` le contient.
export const aRole = (u, role) => !!u && Array.isArray(u.roles) && u.roles.includes(role);

export const utilisateursDe = (d, societeId, role) =>
    d.utilisateurs.filter((u) => u.societe_id === societeId && (!role || aRole(u, role)));

// Comptes existants non encore rattachés à une société : c'est parmi eux que
// l'Admin choisit. Aucun compte n'est créé au passage.
export const utilisateursNonRattaches = (d) =>
    d.utilisateurs.filter((u) => u.societe_id == null);

export const ROLES_EVALUATION = [
    { valeur: 'collaborateur', label: 'Collaborateur' },
    { valeur: 'observateur', label: 'Observateur' }
];

export const cycleDeSociete = (d, societeId) => d.cycles.find((c) => c.societe_id === societeId) || null;
export const formationDuCycle = (d, cycle) =>
    cycle ? d.formations.find((f) => f.id === cycle.formation_id) || null : null;

// Questions posées à l'observateur pour un cycle. Deux au maximum.
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

/** Cycle d'une personne : celui de sa société, quel que soit son rôle. */
export const cycleDe = (d, utilisateurId) => {
    const u = d.utilisateurs.find((x) => x.id === utilisateurId);
    return u && u.societe_id != null ? cycleDeSociete(d, u.societe_id) : null;
};

/** Identifiant suivant — compteur déterministe, aucun aléatoire. */
export const prochainId = (d, cle) => {
    const n = d.sequences[cle] || 1;
    d.sequences[cle] = n + 1;
    return n;
};

// Gabarit des questions d'observation. Une à deux, jamais davantage.
// TODO IA — remplacer par : POST /api/ia/questions-observateur { formation, theme, documents }
export function gabaritQuestionsObservateur(formation, theme = '') {
    const sujet = theme || formation;
    return [
        `Quelle situation concrète démontre l’application des acquis de « ${sujet} » ?`,
        `Quels comportements liés à « ${sujet} » avez-vous observés ?`
    ].slice(0, MAX_QUESTIONS_OBSERVATEUR);
}

// ---------------------------------------------------------------- Fichiers
// Les fichiers réellement choisis par le client sont conservés en mémoire, le
// temps de la session, pour permettre la consultation. Un Blob n'est pas
// sérialisable : il ne part donc jamais dans sessionStorage, et disparaît au
// rafraîchissement — l'entrée du document, elle, subsiste.
const fichiers = new Map();

export const memoriserFichier = (documentId, file) => {
    try { fichiers.set(documentId, { url: URL.createObjectURL(file), type: file.type }); }
    catch (e) { /* consultation simplement indisponible */ }
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
//
// Aucune de ces fonctions n'impose de règle métier : elles exécutent ce que
// l'Admin décide. Une société peut être vide, un utilisateur sans société,
// un utilisateur sans rôle — ce sont des états valides, pas des erreurs.
// ============================================================================

/** Rattache, déplace ou détache un utilisateur. `societeId = null` détache. */
export const rattacherUtilisateur = (d, utilisateurId, societeId) => {
    const u = d.utilisateurs.find((x) => x.id === utilisateurId);
    if (!u) return;
    u.societe_id = societeId == null ? null : Number(societeId);
    // Les documents déjà déposés ne bougent pas : ils restent rattachés à la
    // société qui était la sienne au moment du dépôt (voir §14).
};

/**
 * Supprime une société sans supprimer les comptes de ses membres : ils
 * redeviennent simplement non attribués. Supprimer un compte parce que sa
 * société disparaît serait une décision que l'Admin n'a pas prise.
 */
export const supprimerSociete = (d, societeId) => {
    d.societes = d.societes.filter((s) => s.id !== societeId);
    d.utilisateurs.forEach((u) => { if (u.societe_id === societeId) u.societe_id = null; });
    d.formations = d.formations.filter((f) => f.societe_id !== societeId);
    const cycles = d.cycles.filter((cy) => cy.societe_id === societeId).map((cy) => cy.id);
    d.cycles = d.cycles.filter((cy) => cy.societe_id !== societeId);
    d.questions_observateur = d.questions_observateur.filter((q) => !cycles.includes(q.cycle_id));
    d.tests = d.tests.filter((t) => t.societe_id !== societeId);
    // Les documents sont conservés : ils gardent la trace de leur société
    // d'origine, y compris supprimée. L'historique ne se réécrit pas.
};

/** Supprime un compte. Ses documents restent, avec leur auteur d'origine. */
export const supprimerUtilisateur = (d, utilisateurId) => {
    d.utilisateurs = d.utilisateurs.filter((u) => u.id !== utilisateurId);
};

/** Nom d'une société, y compris supprimée : le document en garde la trace. */
export const nomSociete = (d, societeId) => {
    if (societeId == null) return null;
    const s = d.societes.find((x) => x.id === societeId);
    return s ? s.nom : 'Société supprimée';
};

// ---------------------------------------------------------------- Activité
/**
 * Trace une action dans le journal. À appeler DANS un maj().
 * @param {object} d           brouillon de l'état
 * @param {number} utilisateurId
 * @param {string} type        clé de TYPES_ACTIVITE
 * @param {string} detail      complément lisible
 */
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
