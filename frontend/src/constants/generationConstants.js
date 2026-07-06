// src/constants/generationConstants.js
// -----------------------------------------------------------------------------
// Constantes partagées par tout le module « Génération de Programme ».
// Centraliser ici évite de dupliquer des listes en dur dans chaque composant.
// -----------------------------------------------------------------------------

export const C = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  dark: '#1F2937',
  muted: '#6B7280',
  light: '#F9FAFB',
  border: '#E5E7EB',
  ok: '#10B981',
  warn: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

// Étape 1 — type de demande
export const REQUEST_TYPES = [
  { id: 'formation', label: 'Formation', icone: 'GraduationCap' },
  { id: 'parcours', label: 'Parcours de formation', icone: 'Route' },
  { id: 'coaching', label: 'Coaching', icone: 'UserCheck' },
  { id: 'accompagnement', label: 'Accompagnement', icone: 'Handshake' },
];

// Étape 2 — méthodes de description du besoin
export const DESCRIPTION_MODES = [
  { id: 'upload', label: 'Importer un document' },
  { id: 'text', label: 'Décrire mon besoin' },
];

export const ACCEPTED_DOCUMENT_TYPES = ['.pdf', '.docx', '.doc', '.txt'];
export const ACCEPTED_DOCUMENT_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const THEMES_SUGGERES = [
  'Neurosciences', 'Gestion du stress', 'Leadership', 'Communication',
  'Intelligence collective', 'Soft Skills', 'Vente', 'Management', 'Audit',
];

// Étape 3 — informations complémentaires (UNIQUEMENT ce que le client sait :
// le reste — programme, formateur, devis, KPI... — est généré automatiquement
// par la simulation / le futur modèle IA, voir backend/simulationEngine.js).
export const MODALITES = ['Présentiel', 'Distanciel', 'Hybride'];
export const LANGUES = ['Français', 'Arabe', 'Anglais'];
export const SECTEURS_ACTIVITE = [
  'Banque & Finance', 'Assurance', 'Industrie', 'Aviation & Transport',
  'Tourisme & Hôtellerie', 'Grande distribution', 'Santé', 'Éducation',
  'Technologies', 'Services', 'Secteur public', 'Autre',
];

export const DETAILS_FIELDS_DEFAULT = {
  theme: '',              // sujet / formation souhaitée (obligatoire — pilote toute la simulation)
  nbParticipants: '',     // obligatoire
  societe: '',            // obligatoire — informations entreprise
  secteur: '',
  ville: '',
  responsable: '',
  objectifs: '',          // obligatoire
  // informations complémentaires (facultatives)
  modalite: MODALITES[0],
  datePrevue: '',
  langue: LANGUES[0],
  commentaires: '',
};

// Les 12 modules générés (cartes de l'espace de travail IA)
// `champs` décrit la structure de données attendue — utile pour générer les
// formulaires/aperçus et pour le futur modèle IA (schéma de sortie attendu).
export const MODULES = [
  {
    key: 'programme',
    titre: 'Programme de formation',
    description: 'Titre, objectifs, contenu détaillé, découpage par modules.',
    icone: 'BookOpen',
    champs: [
      'titre', 'duree', 'nombreHeures', 'niveau', 'publicCible', 'prerequis',
      'introduction', 'objectifsPedagogiques', 'competencesDeveloppees',
      'methodesPedagogiques', 'moyensPedagogiques', 'contenuDetaille',
      'decoupageModules', 'deroulement', 'ateliers', 'exercices', 'conclusion',
    ],
  },
  {
    key: 'duree',
    titre: 'Calcul automatique de la durée',
    description: 'Nombre total d\u2019heures, jours, répartition par module.',
    icone: 'Clock',
    champs: ['nombreTotalHeures', 'nombreJours', 'repartitionParModule'],
  },
  {
    key: 'agenda',
    titre: 'Agenda de formation',
    description: 'Calendrier et dates proposées selon les disponibilités.',
    icone: 'Calendar',
    champs: ['datesProposees', 'creneauxDisponibles'],
  },
  {
    key: 'formateur',
    titre: 'Proposition du meilleur formateur',
    description: 'Formateur recommandé, score de compatibilité, CV.',
    icone: 'UserCheck',
    champs: ['formateurPropose', 'scoreCompatibilite', 'competences', 'experiences', 'certifications', 'cv'],
  },
  {
    key: 'devis',
    titre: 'Devis',
    description: 'Informations client, prix HT, TVA, total TTC, conditions.',
    icone: 'FileSpreadsheet',
    champs: [
      'infosClient', 'formation', 'nbParticipants', 'nbJours', 'prixHT',
      'tva', 'totalTTC', 'conditions', 'signature',
    ],
  },
  {
    key: 'fiche',
    titre: 'Fiche programme',
    description: 'Fiche complète synthétisant la formation.',
    icone: 'FileText',
    champs: ['toutesInformations'],
  },
  {
    key: 'presence',
    titre: 'Feuille de présence',
    description: 'Modèle vierge (colonnes officielles).',
    icone: 'ClipboardList',
    champs: ['lignes'], // chaque ligne : nom, prenom, fonction, signatureMatin, signatureApresMidi
  },
  {
    key: 'evaluation',
    titre: 'Évaluations',
    description: 'Formulaires avant / après formation.',
    icone: 'Star',
    champs: ['avant', 'apres'],
  },
  {
    key: 'kpi',
    titre: 'KPI (Indicateur Clé de Performance)',
    description: 'Indicateurs, objectifs, résultats, ROI (Retour sur investissement).',
    icone: 'BarChart3',
    champs: ['indicateurs', 'objectifs', 'resultats', 'tauxSatisfaction', 'tauxParticipation', 'tauxReussite', 'roi', 'efficacite'],
  },
  {
    key: 'impact',
    titre: 'Étude d\u2019impact',
    description: 'Objectifs, indicateurs, observations, recommandations.',
    icone: 'TrendingUp',
    champs: ['objectifs', 'indicateurs', 'observations', 'recommandations', 'conclusions'],
  },
  {
    key: 'facture',
    titre: 'Facture',
    description: 'Modèle de facture (à personnaliser).',
    icone: 'Receipt',
    champs: ['infosClient', 'lignes', 'totalHT', 'tva', 'totalTTC'],
  },
];

// Statuts possibles d'un document généré (cycle de vie d'une carte)
export const DOCUMENT_STATUS = {
  VIDE: 'vide',
  GENERATION_EN_COURS: 'generation_en_cours',
  GENERE: 'genere',
  MODIFIE: 'modifie',
  VALIDE: 'valide',
};

export const STATUS_LABELS = {
  [DOCUMENT_STATUS.VIDE]: 'À générer',
  [DOCUMENT_STATUS.GENERATION_EN_COURS]: 'Génération en cours',
  [DOCUMENT_STATUS.GENERE]: 'Généré',
  [DOCUMENT_STATUS.MODIFIE]: 'Modifié',
  [DOCUMENT_STATUS.VALIDE]: 'Validé',
};

export const STATUS_COLORS = {
  [DOCUMENT_STATUS.VIDE]: C.muted,
  [DOCUMENT_STATUS.GENERATION_EN_COURS]: C.info,
  [DOCUMENT_STATUS.GENERE]: C.primary,
  [DOCUMENT_STATUS.MODIFIE]: C.warn,
  [DOCUMENT_STATUS.VALIDE]: C.ok,
};
