// frontend/src/services/mockEvaluationGenerator.js
// -----------------------------------------------------------------------------
// Génération de tests simulée — AUCUN appel IA externe.
// Déterministe : mêmes entrées → mêmes sorties.
//
// ⚠ Point d'extension : remplacer `genererTestSimule` par un appel
//    POST /api/formations/:id/generer-tests plus tard. La signature
//    et le format de retour doivent rester identiques.
// -----------------------------------------------------------------------------

/**
 * Génère un test pré ou post-formation.
 * @param {Object} p
 * @param {string} p.formation       Nom de la formation
 * @param {string} p.theme           Thème principal
 * @param {string} p.type            'pre' | 'post'
 * @param {number} p.nbQuestions     Nombre de questions souhaité (défaut 10)
 * @param {string} p.niveau          'Débutant' | 'Intermédiaire' | 'Avancé'
 * @param {string[]} p.competences   Liste des compétences à évaluer
 * @param {string} p.langue          'fr' (défaut)
 * @returns {Promise<Object>} Test structuré
 */
export async function genererTestSimule({
  formation = 'Formation',
  theme = '',
  type = 'pre',
  nbQuestions = 10,
  niveau = 'Intermédiaire',
  competences = [],
  langue = 'fr'
} = {}) {
  // Simulation d'un délai réseau
  await new Promise(r => setTimeout(r, 800));

  const base = baseQuestions(formation, theme, type);
  const questions = base.slice(0, nbQuestions).map((q, i) => ({
    id: `${type}_q${i + 1}`,
    type: q.type,                       // 'vrai_faux' | 'qcm_unique' | 'qcm_multiple' | 'echelle' | 'ouverte'
    texte: q.texte,
    choix: q.choix || null,
    bonne: q.bonne !== undefined ? q.bonne : null,
    bareme: q.bareme || 1,
    competence: q.competence || competences[i % (competences.length || 1)] || null,
    obligatoire: true
  }));

  return {
    id: `${type}_${Date.now()}`,
    titre: `Test ${type === 'pre' ? 'pré' : 'post'}-formation — ${formation}`,
    formation,
    theme,
    type,
    niveau,
    langue,
    nbQuestions: questions.length,
    questions,
    statut: 'brouillon',
    source: 'simulation',
    genereLe: new Date().toISOString()
  };
}

/**
 * Banque de questions prédéfinies — adaptées au type pré/post.
 * En mode réel, ces questions viendraient de l'IA.
 */
function baseQuestions(formation, theme, type) {
  const estPost = type === 'post';

  return [
    { type: 'vrai_faux',
      texte: `La formation « ${formation} » couvre les fondamentaux du sujet.`,
      choix: ['Vrai', 'Faux'], bonne: 0,
      competence: 'Compréhension' },

    { type: 'vrai_faux',
      texte: `Un plan d'action individuel est recommandé en fin de parcours.`,
      choix: ['Vrai', 'Faux'], bonne: 0,
      competence: 'Application' },

    { type: 'qcm_unique',
      texte: `Quel est l'objectif principal de la formation « ${formation} » ?`,
      choix: [
        'Renforcer les compétences opérationnelles',
        'Remplacer les procédures existantes',
        'Documenter les incidents',
        'Aucune des réponses'
      ],
      bonne: 0,
      competence: 'Objectifs' },

    { type: 'qcm_unique',
      texte: `Laquelle de ces pratiques renforce l'ancrage des acquis ?`,
      choix: [
        'Les cas pratiques',
        'La lecture seule',
        'L'écoute passive',
        'Aucune de ces pratiques'
      ],
      bonne: 0,
      competence: 'Application' },

    { type: 'vrai_faux',
      texte: `L'évaluation à froid est facultative dans ce dispositif.`,
      choix: ['Vrai', 'Faux'], bonne: 1,
      competence: 'Processus' },

    { type: 'qcm_multiple',
      texte: `Quels éléments renforcent la progression en ${estPost ? 'post' : 'pré'}-formation ?`,
      choix: [
        'Les mises en situation',
        'Les échanges entre pairs',
        'L'isolement',
        'Les retours d'expérience'
      ],
      bonne: [0, 1, 3],
      competence: 'Progression' },

    { type: 'vrai_faux',
      texte: `Les objectifs pédagogiques doivent être mesurables.`,
      choix: ['Vrai', 'Faux'], bonne: 0,
      competence: 'Conception' },

    { type: 'echelle',
      texte: `Sur une échelle de 1 à 5, évaluez votre confiance à appliquer les acquis.`,
      choix: ['1','2','3','4','5'], bonne: null,
      competence: 'Confiance' },

    { type: 'qcm_unique',
      texte: `Le contexte professionnel influence-t-il l'application des acquis ?`,
      choix: ['Oui, fortement', 'Non', 'Occasionnellement', 'Jamais'],
      bonne: 0,
      competence: 'Application' },

    { type: 'ouverte',
      texte: `Décrivez une situation concrète où vous appliquerez les acquis de la formation.`,
      choix: null, bonne: null,
      competence: 'Transfert' }
  ];
}

/**
 * Génère des questions d'observation N+1 (comportements observables).
 * @returns {Promise<string[]>}
 */
export async function genererQuestionsObservationSimule({ formation, theme, nb = 2 } = {}) {
  await new Promise(r => setTimeout(r, 500));

  const toutes = [
    `L'apprenant applique les principes de « ${formation} » dans son quotidien professionnel.`,
    `L'apprenant adapte son comportement selon le contexte lié à « ${theme} ».`,
    `L'apprenant partage ses acquis avec ses collègues.`,
    `L'apprenant identifie seul les situations où appliquer la formation.`
  ];
  return toutes.slice(0, nb);
}