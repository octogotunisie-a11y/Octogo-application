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
  { id: 'team_building', label: 'Team Building', icone: 'Handshake' },
];

// Champs propres à chaque catégorie — une formation, un parcours, un coaching
// et un team building ne se décrivent pas avec les mêmes informations.
// Rendus dynamiquement par TrainingDetailsForm : aucun formulaire dupliqué.
export const CHAMPS_PAR_TYPE = {
  formation: [
    { cle: 'population', label: 'Population concernée', type: 'text' },
    { cle: 'duree', label: 'Durée souhaitée', type: 'select', options: ['1 jour', '2 jours', '3 jours', '5 jours'] },
    { cle: 'niveau', label: 'Niveau', type: 'select', options: ['Découverte', 'Intermédiaire', 'Avancé', 'Expert'] },
  ],
  parcours: [
    { cle: 'population', label: 'Population concernée', type: 'text' },
    { cle: 'duree', label: 'Durée du parcours', type: 'select', options: ['1 mois', '3 mois', '6 mois', '1 an'] },
    { cle: 'nbModules', label: 'Nombre de modules', type: 'number', min: 1, max: 8 },
    { cle: 'contexte', label: 'Contexte', type: 'textarea' },
  ],
  coaching: [
    { cle: 'population', label: 'Personne ou groupe accompagné', type: 'text' },
    { cle: 'problematique', label: 'Problématique', type: 'textarea' },
    { cle: 'duree', label: 'Durée', type: 'select', options: ['1 mois', '3 mois', '6 mois'] },
    { cle: 'nbSeances', label: 'Nombre de séances', type: 'number', min: 1, max: 12 },
  ],
  team_building: [
    { cle: 'nbParticipantsTB', label: 'Nombre de participants', type: 'number', min: 2, max: 300 },
    { cle: 'duree', label: 'Durée', type: 'select', options: ['Demi-journée', '1 journée', '2 journées'] },
    { cle: 'typeActivite', label: 'Type d’activité', type: 'select', options: ['Atelier collaboratif', 'Activité sportive', 'Activité créative', 'Jeu de rôle', 'Sortie terrain'] },
    { cle: 'contexte', label: 'Contexte', type: 'textarea' },
  ],
};

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
  // Champs spécifiques par catégorie (voir CHAMPS_PAR_TYPE)
  population: '', duree: '', niveau: '', nbModules: '3', contexte: '',
  problematique: '', nbSeances: '6', nbParticipantsTB: '12', typeActivite: '',
  // Documents de référence de la société cochés par le client
  documentsReference: [],
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
