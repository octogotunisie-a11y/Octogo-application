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

// -----------------------------------------------------------------------------
// MODE MOCK — étape « front-end uniquement ».
//
// Quand MODE_MOCK vaut true, AUCUNE requête réseau n'est émise : chaque fonction
// renvoie une structure composée localement. Tout le module Génération (page,
// hook, 12 cartes de modules) fonctionne alors sans backend et sans IA.
//
// Pour rebrancher le serveur réel : passer MODE_MOCK à false. Aucun composant
// n'a à changer.
// -----------------------------------------------------------------------------
export const MODE_MOCK = true;

const LATENCE_MS = 500;
const attendre = () => new Promise((r) => setTimeout(r, LATENCE_MS));

// Séquence déterministe : aucun Math.random(), deux exécutions identiques
// produisent les mêmes identifiants.
let _seqMock = 1000;
const idMock = () => ++_seqMock;

const memoireMock = { demandes: [] };

const THEMES_MOCK = [
  'Leadership', 'Management', 'Communication', 'Négociation',
  'Gestion du stress', 'Conduite du changement', 'Prise de parole',
];



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
  if (MODE_MOCK) {
    await attendre();
    const demande = { id: idMock(), ...payload, modules: {}, creeLe: new Date().toISOString() };
    memoireMock.demandes.push(demande);
    return { request: demande };
  }
  const resp = await fetch(`${API_BASE}/generation/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(resp);
}

export async function listerDemandes() {
  if (MODE_MOCK) { await attendre(); return { requests: memoireMock.demandes }; }
  const resp = await fetch(`${API_BASE}/generation/requests`, { headers: authHeaders() });
  return handle(resp);
}

export async function obtenirDemande(id) {
  if (MODE_MOCK) { await attendre(); return { request: memoireMock.demandes.find((d) => String(d.id) === String(id)) || null }; }
  const resp = await fetch(`${API_BASE}/generation/requests/${id}`, { headers: authHeaders() });
  return handle(resp);
}

export async function mettreAJourDemande(id, patch) {
  if (MODE_MOCK) {
    await attendre();
    const d = memoireMock.demandes.find((x) => String(x.id) === String(id));
    if (d) Object.assign(d, patch);
    return { request: d };
  }
  const resp = await fetch(`${API_BASE}/generation/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  });
  return handle(resp);
}

export async function supprimerDemande(id) {
  if (MODE_MOCK) { await attendre(); memoireMock.demandes = memoireMock.demandes.filter((d) => String(d.id) !== String(id)); return { success: true }; }
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
  if (MODE_MOCK) { await attendre(); return { success: true, fichierNom: file && file.name, analyse: false }; } // aucun fichier n'est lu ni transmis
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
  if (MODE_MOCK) {
    // TODO IA — remplacer par : POST /api/ia/module { id, moduleKey, documents }
    await attendre();
    const d = memoireMock.demandes.find((x) => String(x.id) === String(id));
    const contenu = construireModuleMock(moduleKey, d);
    if (d) d.modules = { ...(d.modules || {}), [moduleKey]: contenu };
    return { module: contenu, source: 'mock' };
  }
  const resp = await fetch(`${API_BASE}/generation/requests/${id}/modules/${moduleKey}/generate`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handle(resp);
}

// Régénérer = même endpoint que générer (le backend incrémente une version).
export async function regenererModule(id, moduleKey) {
  if (MODE_MOCK) return genererModule(id, moduleKey);
  return genererModule(id, moduleKey);
}

export async function enregistrerModule(id, moduleKey, data) {
  if (MODE_MOCK) {
    await attendre();
    const d = memoireMock.demandes.find((x) => String(x.id) === String(id));
    if (d) d.modules = { ...(d.modules || {}), [moduleKey]: data };
    return { module: data };
  }
  const resp = await fetch(`${API_BASE}/generation/requests/${id}/modules/${moduleKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ data }),
  });
  return handle(resp);
}

export async function validerModule(id, moduleKey) {
  if (MODE_MOCK) {
    await attendre();
    const d = memoireMock.demandes.find((x) => String(x.id) === String(id));
    if (d) d.valides = { ...(d.valides || {}), [moduleKey]: true };
    return { success: true };
  }
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
  if (MODE_MOCK) { await attendre(); throw new Error('Téléchargement indisponible en mode mock : le document sera produit par le serveur.'); }
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
  if (MODE_MOCK) { await attendre(); throw new Error('Téléchargement indisponible en mode mock.'); }
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
  if (MODE_MOCK) { await attendre(); return THEMES_MOCK; }
  const resp = await fetch(`${API_BASE}/generation/themes`);
  const data = await handle(resp);
  return data.themes || [];
}

// ==================== SERVICES EXISTANTS (réutilisés) ====================

// Réutilise le catalogue existant (formations / parcours / coaching / team building)
// pour préremplir les thèmes suggérés ou associer la demande à un service existant.
export async function listerServicesExistants() {
  if (MODE_MOCK) { await attendre(); return { formations: [], parcours: [], coaching: [], teambuilding: [] }; }
  const resp = await fetch(`${API_BASE}/services/all`);
  return handle(resp);
}


// ============================================================================
// SERVICE DE GÉNÉRATION — VERSION MOCK (préparation à l'intégration IA)
//
// ⚠ AUCUN modèle n'est appelé, AUCUN document n'est transmis. Chaque fonction
// compose son résultat à partir des paramètres, de façon déterministe : deux
// appels identiques donnent le même résultat. Un contenu aléatoire donnerait
// l'illusion d'une génération.
//
// Les signatures sont définitives : à l'intégration, seul le CORPS change.
// ============================================================================

const listeOuVide = (v) => (Array.isArray(v) && v.length ? v : []);

const decouper = (texte, defaut) => {
  if (!texte || !String(texte).trim()) return defaut;
  return String(texte).split(/\n|;/).map((x) => x.trim()).filter(Boolean);
};

/**
 * Programme complet, toutes catégories.
 * @param {{categorie:string, champs:object, documents:Array}} params
 */
export async function generateTrainingProgram({ categorie = 'formation', champs = {}, documents = [] } = {}) {
  // TODO IA — remplacer par : POST /api/ia/programme { categorie, champs, documents }
  await attendre();
  const noms = listeOuVide(documents).map((d) => d.nom);
  const base = {
    categorie, source: 'mock', genere_le: new Date().toISOString(),
    documents_utilises: noms,
    contexte: noms.length ? `Contexte constitué à partir de ${noms.length} document(s) : ${noms.join(', ')}.`
                          : 'Aucun document de référence sélectionné.',
    objectifs: decouper(champs.objectifs || champs.objectif, [
      'Situer sa pratique actuelle au regard des attendus du poste.',
      'Mobiliser des repères transposables en situation de travail.',
      'Construire un plan d’application sur les trois mois suivants.',
    ]),
    methodes: ['Étude de cas', 'Mise en situation', 'Analyse de pratique', 'Atelier de transfert'],
    evaluation: 'Test de positionnement en amont, test de consolidation en aval, observation en situation à 90 jours.',
  };

  if (categorie === 'parcours') {
    const n = Math.max(1, Math.min(8, parseInt(champs.nbModules, 10) || 3));
    return { ...base, titre: `Parcours — ${champs.theme || champs.objectif || 'sans titre'}`,
      public_cible: champs.population || '—', duree: champs.duree || '3 mois', contexte_client: champs.contexte || '',
      modules: Array.from({ length: n }, (_, i) => ({
        titre: `Module ${i + 1}`, duree: '1 jour',
        contenu: i === 0 ? 'Ouverture du parcours et diagnostic partagé.'
                         : `Approfondissement ${i} — reprise des acquis et nouvel apport.`,
      })) };
  }
  if (categorie === 'coaching') {
    const n = Math.max(1, Math.min(12, parseInt(champs.nbSeances, 10) || 6));
    return { ...base, titre: `Coaching — ${champs.theme || champs.objectif || 'sans titre'}`,
      public_cible: champs.population || '—', duree: champs.duree || '3 mois', problematique: champs.problematique || '',
      modules: Array.from({ length: n }, (_, i) => ({
        titre: `Séance ${i + 1}`, duree: '1 h 30',
        contenu: i === 0 ? 'Contractualisation et clarification de la demande.'
                         : 'Travail sur situations réelles apportées par la personne accompagnée.',
      })) };
  }
  if (categorie === 'team_building') {
    return { ...base, titre: `Team Building — ${champs.theme || champs.objectif || 'sans titre'}`,
      public_cible: `${champs.nbParticipantsTB || '—'} participants`,
      duree: champs.duree || '1 journée', type_activite: champs.typeActivite || 'Atelier collaboratif',
      contexte_client: champs.contexte || '',
      modules: [
        { titre: 'Ouverture', duree: '1 h', contenu: 'Cadre, règles du jeu, objectif partagé.' },
        { titre: 'Activité collective', duree: '3 h', contenu: 'Mise en situation coopérative sur un objectif commun.' },
        { titre: 'Débriefing', duree: '1 h 30', contenu: 'Analyse de ce qui s’est joué dans le fonctionnement du groupe.' },
        { titre: 'Engagements', duree: '1 h', contenu: 'Traduction en règles de fonctionnement pour le quotidien.' },
      ] };
  }
  return { ...base, titre: `Programme — ${champs.theme || 'formation'}`,
    public_cible: champs.population || 'Collaborateurs concernés', niveau: champs.niveau || 'Intermédiaire',
    duree: champs.duree || '2 jours',
    modules: [
      { titre: 'Cadrage et diagnostic', duree: '3 h', contenu: 'Repérage des situations professionnelles réellement rencontrées.' },
      { titre: 'Apports structurants', duree: '5 h', contenu: 'Repères théoriques reliés aux situations identifiées.' },
      { titre: 'Mise en situation', duree: '4 h', contenu: 'Travail sur cas issus du contexte de la société.' },
      { titre: 'Transfert et ancrage', duree: '2 h', contenu: 'Engagements individuels et indicateurs de suivi.' },
    ] };
}

/** Questions du canal A + descripteurs du canal B. */
export async function generateEvaluationQuestions({ formation = '', nb = 3 } = {}) {
  // TODO IA — remplacer par : POST /api/ia/questions-evaluation { formation, referentiel, nb }
  await attendre();
  const modeles = [
    `Dans votre travail, à quel niveau devez-vous mobiliser les acquis de « ${formation} » ?`,
    `À quelle fréquence rencontrez-vous des situations relevant de « ${formation} » ?`,
    'À quel niveau ces situations vous semblent-elles complexes à traiter seul ?',
    'À quel niveau devez-vous transmettre ces pratiques à d’autres ?',
    'À quel niveau votre poste exige-t-il d’ajuster votre pratique en cours d’action ?',
  ];
  const total = Math.max(1, Math.min(modeles.length, parseInt(nb, 10) || 3));
  return {
    source: 'mock',
    questions_a: modeles.slice(0, total).map((texte, i) => ({ ordre: i + 1, texte, source: 'mock' })),
    descripteurs_b: [
      { niveau: 1, texte: `Reconnaît la situation relevant de « ${formation} » sans encore agir dessus.`, source: 'mock' },
      { niveau: 2, texte: 'Applique les repères appris dans les situations courantes.', source: 'mock' },
      { niveau: 3, texte: 'Ajuste sa pratique quand la situation sort du cadre appris.', source: 'mock' },
      { niveau: 4, texte: 'Transmet ces repères et fait progresser son entourage.', source: 'mock' },
    ],
  };
}

const banqueTestMock = (formation) => ([
  { id: 1, texte: `Les apports de « ${formation} » s’appliquent de la même façon quel que soit l’interlocuteur.`, bonne: false },
  { id: 2, texte: 'Déléguer une tâche suppose de transmettre aussi le pouvoir de décision qui va avec.', bonne: true },
  { id: 3, texte: 'Un retour est plus utile lorsqu’il porte sur un comportement observable que sur un trait de personnalité.', bonne: true },
  { id: 4, texte: 'Un désaccord exprimé ouvertement dans une équipe traduit nécessairement un dysfonctionnement.', bonne: false },
  { id: 5, texte: 'Adapter sa posture au niveau d’autonomie de son interlocuteur renforce l’engagement.', bonne: true },
]);

/** Test pré-formation. */
export async function generatePreTrainingTest({ formation = '' } = {}) {
  // TODO IA — remplacer par : POST /api/ia/test { formation, type: 'pre' }
  await attendre();
  return { type: 'pre', source: 'mock', formation, questions: banqueTestMock(formation) };
}

/** Test post-formation. */
export async function generatePostTrainingTest({ formation = '' } = {}) {
  // TODO IA — remplacer par : POST /api/ia/test { formation, type: 'post' }
  await attendre();
  return { type: 'post', source: 'mock', formation, questions: banqueTestMock(formation) };
}

// Gabarit renvoyé par genererModule() en mode mock, pour les 12 cartes de
// l'espace de travail. Le contenu réel viendra du modèle.
function construireModuleMock(moduleKey, demande) {
  const d = demande || {};
  const details = d.details || {};
  return {
    _source: 'mock',
    _module: moduleKey,
    titre: details.theme ? `${moduleKey} — ${details.theme}` : moduleKey,
    societe: details.societe || '',
    participants: details.nbParticipants || '',
    objectifs: details.objectifs || '',
    contenu: 'Contenu de démonstration. Aucun modèle n’a été sollicité et aucun document n’a été analysé.',
    genereLe: new Date().toISOString(),
  };
}
