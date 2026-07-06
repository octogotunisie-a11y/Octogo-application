// src/utils/durationCalculator.js
// -----------------------------------------------------------------------------
// Calcul local (sans IA) de la durée totale d'un programme à partir de son
// découpage en modules. Sert de base au bloc « Calcul automatique de la durée »
// tant que le module IA (qui affinera la répartition) n'est pas branché.
//
// Convention : 1 jour de formation = 7 heures (modifiable ci-dessous).
// -----------------------------------------------------------------------------

export const HEURES_PAR_JOUR = 7;

/**
 * @param {Array<{ titre?: string, heures?: number }>} decoupageModules
 * @returns {{ nombreTotalHeures: number, nombreJours: number, repartitionParModule: Array }}
 */
export function calculerDuree(decoupageModules = []) {
  const modules = Array.isArray(decoupageModules) ? decoupageModules : [];

  const repartitionParModule = modules.map((m, i) => ({
    titre: m.titre || `Module ${i + 1}`,
    heures: Number(m.heures) || 0,
  }));

  const nombreTotalHeures = repartitionParModule.reduce((sum, m) => sum + m.heures, 0);
  const nombreJours = nombreTotalHeures > 0
    ? Math.round((nombreTotalHeures / HEURES_PAR_JOUR) * 10) / 10
    : 0;

  return { nombreTotalHeures, nombreJours, repartitionParModule };
}

/**
 * Calcule un prix HT simple à partir d'un tarif/jour et d'un nombre de jours.
 * Purement indicatif tant que la grille tarifaire officielle (backend) n'est
 * pas branchée sur ce module.
 */
export function calculerPrixIndicatif(nombreJours, tarifJour = 1200) {
  const jours = Number(nombreJours) || 0;
  const tarif = Number(tarifJour) || 0;
  const prixHT = Math.round(jours * tarif);
  return prixHT;
}

export function calculerTVA(prixHT, tauxTVA = 19) {
  const ht = Number(prixHT) || 0;
  const taux = Number(tauxTVA) || 0;
  const tva = Math.round(ht * (taux / 100));
  return { tva, totalTTC: ht + tva };
}
