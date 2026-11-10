// frontend/src/services/mockReportGenerator.js
// -----------------------------------------------------------------------------
// Génération de rapports simulée — construite à partir des données réelles
// présentes dans la campagne. AUCUN appel IA externe.
//
// ⚠ Point d'extension : remplacer le corps par un appel API plus tard.
// -----------------------------------------------------------------------------
import { calculerKpis, parCompetence, progressionRelative } from './kpiCalculator';

/**
 * Génère un rapport à partir d'une campagne et de ses participants.
 * @param {Object} p
 * @param {string} p.typeRapport   'individuel' | 'entreprise' | 'groupe' | 'global'
 * @param {string} p.entreprise
 * @param {Object} p.formation     { titre, theme }
 * @param {Array}  p.participants  [{ id, nom, pre, post, competences? }]
 * @param {Array}  p.competences   [{ competence, moyPre, moyPost, ecart }]
 * @returns {Promise<Object>} Rapport structuré
 */
export async function genererRapportSimule({
  typeRapport = 'entreprise',
  entreprise = '',
  formation = {},
  participants = [],
  competences = []
} = {}) {
  await new Promise(r => setTimeout(r, 900));

  const kpis = calculerKpis({
    participants,
    testsAttendus: participants.length * 2,
    testsTermines: participants.reduce((s, p) =>
      s + (p.pre != null ? 1 : 0) + (p.post != null ? 1 : 0), 0)
  });

  const comp = competences.length
    ? competences
    : parCompetence(participants.flatMap(p => p.competences || []));

  const synthese = construireSynthese({ kpis, participants, formation, typeRapport });

  return {
    id: `rapport_${Date.now()}`,
    typeRapport,
    entreprise,
    formation: formation.titre || formation,
    dateGeneration: new Date().toISOString(),

    synthese,
    kpis,
    competences: comp,

    pointsForts: identifierPointsForts(comp),
    axesAmelioration: identifierAxes(comp),
    recommandations: construireRecommandations({ kpis, comp }),

    participants: participants.map(p => ({
      nom: p.nom,
      scorePre: p.pre,
      scorePost: p.post,
      ecart: (p.pre != null && p.post != null) ? p.post - p.pre : null,
      progressionRelative: progressionRelative(p.pre, p.post)
    })),

    mention: 'Rapport de démonstration — génération IA simulée',
    version: 1
  };
}

// ------------------------------------------------------------------ Helpers

function construireSynthese({ kpis, participants, formation, typeRapport }) {
  const lignes = [];

  lignes.push(
    `Ce rapport ${typeRapport} couvre la formation « ${formation.titre || formation} ».`
  );

  if (kpis.participantsComplets === 0) {
    lignes.push(
      "Aucun participant n'a encore complété les deux tests (pré et post). " +
      "L'analyse comparative n'est pas encore possible."
    );
    return lignes;
  }

  lignes.push(
    `${kpis.participantsComplets} participant(s) sur ${kpis.participantsTotal} ` +
    `ont complété les deux tests.`
  );

  if (kpis.scoreMoyenPre != null && kpis.scoreMoyenPost != null) {
    const evo = kpis.ecartMoyen;
    const sens = evo > 0 ? 'progressé' : evo < 0 ? 'régressé' : 'stagné';
    lignes.push(
      `Le score moyen est passé de ${kpis.scoreMoyenPre} à ${kpis.scoreMoyenPost} ` +
      `points sur 100 (${sens} de ${Math.abs(evo)} points).`
    );
  }

  if (kpis.progressionRelative != null) {
    lignes.push(
      `La progression relative est de ${kpis.progressionRelative}% par rapport au niveau initial.`
    );
  } else if (kpis.scoreMoyenPre === 0) {
    lignes.push(
      "La progression relative n'est pas calculable : le score initial est à zéro."
    );
  }

  if (kpis.participantsPartiels > 0) {
    lignes.push(
      `${kpis.participantsPartiels} participant(s) n'ont complété qu'un seul test. ` +
      `Leurs données ne sont pas intégrées à la comparaison.`
    );
  }

  return lignes;
}

function identifierPointsForts(competences) {
  return competences
    .filter(c => c.ecart != null && c.ecart > 5)
    .sort((a, b) => b.ecart - a.ecart)
    .slice(0, 3)
    .map(c => `${c.competence} (+${c.ecart} points)`);
}

function identifierAxes(competences) {
  return competences
    .filter(c => c.ecart != null && c.ecart <= 0)
    .sort((a, b) => a.ecart - b.ecart)
    .slice(0, 3)
    .map(c => `${c.competence} (${c.ecart >= 0 ? '+' : ''}${c.ecart} points)`);
}

function construireRecommandations({ kpis, competences }) {
  const recos = [];

  if (kpis.tauxCompletion != null && kpis.tauxCompletion < 70) {
    recos.push(
      "Le taux de complétion est inférieur à 70%. Envisagez une relance " +
      "des participants n'ayant pas terminé les deux tests."
    );
  }

  if (kpis.regressionCount > 0) {
    recos.push(
      `${kpis.regressionCount} participant(s) n'ont pas progressé. ` +
      "Un accompagnement individualisé pourrait être bénéfique."
    );
  }

  const faibles = competences.filter(c => c.moyPost != null && c.moyPost < 50);
  for (const f of faibles.slice(0, 2)) {
    recos.push(
      `Renforcer la compétence « ${f.competence} » (score moyen ${f.moyPost}/100).`
    );
  }

  if (recos.length === 0) {
    recos.push("Maintenir le dispositif actuel : les indicateurs sont satisfaisants.");
  }

  return recos;
}