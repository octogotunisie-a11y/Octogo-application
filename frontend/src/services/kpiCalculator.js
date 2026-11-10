// frontend/src/services/kpiCalculator.js
// -----------------------------------------------------------------------------
// Calculs KPI purs — aucune dépendance UI, aucun état.
// Toutes les fonctions retournent des valeurs explicites (null si non calculable).
// -----------------------------------------------------------------------------

/**
 * Score d'un test sur 100.
 * @param {number} points   points obtenus
 * @param {number} max      points maximum
 * @returns {number|null}
 */
export function scoreSur100(points, max) {
  if (!max || max <= 0) return null;
  return Math.round((points / max) * 100);
}

/**
 * Écart absolu post − pré.
 * @returns {number|null}
 */
export function ecartAbsolu(scorePre, scorePost) {
  if (scorePre == null || scorePost == null) return null;
  return scorePost - scorePre;
}

/**
 * Progression relative en % — §11 : si score initial = 0, retourne null.
 * @returns {number|null}
 */
export function progressionRelative(scorePre, scorePost) {
  if (scorePre == null || scorePost == null) return null;
  if (scorePre === 0) return null;
  return Math.round(((scorePost - scorePre) / scorePre) * 100);
}

/**
 * Taux de complétion : tests terminés / tests attendus × 100.
 */
export function tauxCompletion(termine, attendu) {
  if (!attendu || attendu <= 0) return null;
  return Math.round((termine / attendu) * 100);
}

/**
 * Taux de participation : participants ayant commencé / participants affectés × 100.
 */
export function tauxParticipation(commence, affecte) {
  if (!affecte || affecte <= 0) return null;
  return Math.round((commence / affecte) * 100);
}

/**
 * Calcule les KPI consolidés pour une campagne ou un ensemble de résultats.
 * @param {Object} params
 * @param {Array}  params.participants        liste { id, pre?, post? } — scores sur 100
 * @param {number} params.testsAttendus       nombre total de tests attendus
 * @param {number} params.testsTermines       nombre total de tests terminés
 * @returns {Object} KPI consolidés
 */
export function calculerKpis({ participants = [], testsAttendus = 0, testsTermines = 0 }) {
  const avecDeuxTests = participants.filter(p => p.pre != null && p.post != null);
  const avecUnSeul    = participants.filter(p => (p.pre == null) !== (p.post == null));
  const sansAucun     = participants.filter(p => p.pre == null && p.post == null);

  const moyPre  = moyenne(avecDeuxTests.map(p => p.pre));
  const moyPost = moyenne(avecDeuxTests.map(p => p.post));

  const ecart    = ecartAbsolu(moyPre, moyPost);
  const progRel  = progressionRelative(moyPre, moyPost);

  const progresse  = avecDeuxTests.filter(p => p.post > p.pre).length;
  const stagne     = avecDeuxTests.filter(p => p.post === p.pre).length;
  const regresse   = avecDeuxTests.filter(p => p.post < p.pre).length;

  return {
    participantsTotal: participants.length,
    participantsComplets: avecDeuxTests.length,
    participantsPartiels: avecUnSeul.length,
    participantsSansReponse: sansAucun.length,

    scoreMoyenPre:  moyPre,
    scoreMoyenPost: moyPost,
    ecartMoyen:     ecart,
    progressionRelative: progRel,

    progressionCount: progresse,
    stagnationCount:  stagne,
    regressionCount:  regresse,

    tauxCompletion: tauxCompletion(testsTermines, testsAttendus),
    besoinAccompagnement: regresse + stagne
  };
}

/**
 * Moyenne robuste : ignore les valeurs null/undefined.
 * @returns {number|null}
 */
export function moyenne(valeurs) {
  const valides = valeurs.filter(v => v != null && Number.isFinite(v));
  if (valides.length === 0) return null;
  return Math.round(valides.reduce((a, b) => a + b, 0) / valides.length);
}

/**
 * Regroupe des résultats par compétence.
 * @param {Array} resultats    [{ competence, scorePre, scorePost }]
 * @returns {Array}            [{ competence, moyPre, moyPost, ecart }]
 */
export function parCompetence(resultats = []) {
  const map = new Map();
  for (const r of resultats) {
    if (!r.competence) continue;
    if (!map.has(r.competence)) map.set(r.competence, { pre: [], post: [] });
    if (r.scorePre  != null) map.get(r.competence).pre.push(r.scorePre);
    if (r.scorePost != null) map.get(r.competence).post.push(r.scorePost);
  }
  return [...map.entries()].map(([competence, { pre, post }]) => {
    const moyPre  = moyenne(pre);
    const moyPost = moyenne(post);
    return {
      competence,
      moyPre,
      moyPost,
      ecart: ecartAbsolu(moyPre, moyPost)
    };
  });
}