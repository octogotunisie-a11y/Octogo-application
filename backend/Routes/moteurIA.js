// backend/Routes/moteurIA.js
// -----------------------------------------------------------------------------
// Moteur IA local (règles, pas d'API externe).
// Remplace les corps par des appels à ton service IA plus tard.
// -----------------------------------------------------------------------------

/**
 * Génère des questions de test (pré/post) à partir d'une formation et d'un thème.
 * Sortie : [{ id, texte, bonne }]
 */
function genererQuestionsTest(formation, theme, type = 'pre', nombre = 10) {
  const questions = [];
  const contexte = `${formation || 'formation'} — ${theme || 'thème'}`;

  const gabaritsVraiFaux = [
    { t: `La formation « ${contexte} » couvre les fondamentaux du sujet.`, b: true },
    { t: `Un plan d'action individuel est recommandé en fin de ${type === 'pre' ? 'formation' : 'parcours'}.`, b: true },
    { t: `L'évaluation à froid est facultative dans ce dispositif.`, b: false },
    { t: `Les cas pratiques renforcent l'ancrage des acquis.`, b: true },
    { t: `Aucun suivi post-formation n'est nécessaire.`, b: false },
    { t: `Les objectifs pédagogiques doivent être mesurables.`, b: true },
    { t: `Le retour d'expérience entre pairs est inutile.`, b: false },
    { t: `Le contexte professionnel influence l'application des acquis.`, b: true },
    { t: `Une seule modalité pédagogique suffit pour tous les apprenants.`, b: false },
    { t: `L'auto-évaluation aide à identifier les axes de progrès.`, b: true }
  ];

  for (let i = 0; i < Math.min(nombre, gabaritsVraiFaux.length); i++) {
    questions.push({
      id: i + 1,
      texte: gabaritsVraiFaux[i].t,
      bonne: gabaritsVraiFaux[i].b
    });
  }
  return questions;
}

/**
 * Génère des questions d'observation N+1 (comportements observables).
 */
function genererQuestionsObservation(formation, theme, nombre = 2) {
  const g = [
    `L'apprenant applique les principes de « ${formation} » dans son quotidien professionnel.`,
    `L'apprenant adapte son comportement selon le contexte lié à « ${theme} ».`,
    `L'apprenant partage ses acquis avec ses collègues.`,
    `L'apprenant identifie seul les situations où appliquer la formation.`
  ];
  return g.slice(0, Math.min(nombre, g.length));
}

/**
 * Génère un programme pédagogique structuré.
 */
function genererProgramme({ formation, theme, objectif, publicCible, duree, niveau, categorie, documents }) {
  const mots = (documents || [])
    .map(d => (d.text || '').toLowerCase())
    .join(' ')
    .match(/[a-zà-ÿ]{4,}/g) || [];

  const freq = new Map();
  for (const m of mots) freq.set(m, (freq.get(m) || 0) + 1);
  const topWords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);

  const objectifFinal = objectif?.trim() ||
    (topWords.length
      ? `Renforcer les compétences autour de : ${topWords.slice(0, 3).join(', ')}`
      : 'Développer les compétences clés identifiées dans les documents fournis');

  return {
    titre: `Programme — ${formation || objectifFinal.slice(0, 60)}`,
    categorie: categorie || 'Parcours',
    objectif: objectifFinal,
    public: publicCible || 'Managers',
    duree: duree || '3 jours',
    niveau: niveau || 'Intermédiaire',
    mots_cles: topWords,
    structure: [
      { titre: 'Cadrage et objectifs', duree: '0.5 j',
        objectifs: ['Comprendre le contexte', 'Clarifier les attentes'],
        activites: ['Atelier de cadrage', 'Auto-évaluation initiale'] },
      { titre: 'Apports fondamentaux', duree: '1 j',
        objectifs: topWords.slice(0, 3).map(w => `Maîtriser : ${w}`),
        activites: ['Exposés interactifs', 'Exercices guidés'] },
      { titre: 'Mise en pratique', duree: '1 j',
        objectifs: ['Appliquer sur cas réels', 'Développer les réflexes'],
        activites: ['Études de cas', 'Jeux de rôle'] },
      { titre: 'Ancrage et évaluation', duree: '0.5 j',
        objectifs: ['Consolider les acquis', 'Définir un plan d’action'],
        activites: ['Plan d’action individuel', 'Évaluation à chaud'] }
    ],
    genere_le: new Date().toISOString(),
    version: 1
  };
}

/**
 * Génère un rapport consolidé à partir de réponses de tests + observations.
 */
function genererRapport({ formation, participants, reponsesTests, observations }) {
  const totalTests = reponsesTests.length;
  const scoreMoyen = totalTests > 0
    ? Math.round(reponsesTests.reduce((s, r) => s + (r.score / r.total) * 100, 0) / totalTests)
    : 0;

  const scorePre = reponsesTests.filter(r => r.type === 'pre');
  const scorePost = reponsesTests.filter(r => r.type === 'post');
  const moyPre = scorePre.length
    ? Math.round(scorePre.reduce((s, r) => s + (r.score / r.total) * 100, 0) / scorePre.length)
    : 0;
  const moyPost = scorePost.length
    ? Math.round(scorePost.reduce((s, r) => s + (r.score / r.total) * 100, 0) / scorePost.length)
    : 0;

  const evolution = moyPost - moyPre;

  const synthese = [];
  if (totalTests === 0) synthese.push('Aucune réponse de test disponible pour cette formation.');
  else {
    synthese.push(`Score moyen global : ${scoreMoyen}%.`);
    if (scorePre.length && scorePost.length) {
      synthese.push(`Évolution pré → post : ${evolution >= 0 ? '+' : ''}${evolution} points.`);
    }
    if (observations.length > 0) {
      synthese.push(`${observations.length} observation(s) terrain recueillie(s).`);
    }
  }

  return {
    formation,
    participants: participants || 0,
    scoreMoyen,
    moyPre,
    moyPost,
    evolution,
    synthese,
    kpis: {
      tauxReussite: scoreMoyen >= 70 ? 'Élevé' : scoreMoyen >= 50 ? 'Moyen' : 'À améliorer',
      participation: totalTests,
      satisfaction: 'Non mesurée (à brancher sur questionnaire)'
    },
    genere_le: new Date().toISOString()
  };
}

module.exports = {
  genererQuestionsTest,
  genererQuestionsObservation,
  genererProgramme,
  genererRapport
};