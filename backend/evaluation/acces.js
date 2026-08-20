// backend/evaluation/acces.js
// -----------------------------------------------------------------------------
// Matrice d'accès — section 03 de la fiche technique.
// Cinq rôles. Le cloisonnement s'opère PAR LIGNE HIÉRARCHIQUE, jamais par rôle
// global : un manager voit sa ligne, pas toutes les lignes de son niveau.
//
// Sur base locale, ces règles sont applicatives. Toute lecture de données de
// mesure doit passer par une fonction de ce fichier ; aucune route ne doit
// filtrer elle-même. C'est ce point d'entrée unique qui rendra la migration
// vers des politiques Postgres mécanique.
// -----------------------------------------------------------------------------

const ROLES = ['collaborateur', 'manager_observateur', 'responsable_structure', 'drh', 'admin'];

// ---------------------------------------------------------------------------
// Résolution de la ligne et de ses descendants (chemin matérialisé).
// ---------------------------------------------------------------------------
const lignesDescendantes = (data, ligneId) => {
    const racine = data.ligne_hierarchique.find((l) => l.id === ligneId);
    if (!racine) return [];
    return data.ligne_hierarchique
        .filter((l) => l.chemin === racine.chemin || String(l.chemin).startsWith(racine.chemin + '.'))
        .map((l) => l.id);
};

const personnesDeLignes = (data, ligneIds) =>
    data.personne.filter((p) => ligneIds.includes(p.ligne_id)).map((p) => p.id);

// Périmètre nominatif d'une personne, en identifiants de personnes observées.
const perimetre = (data, acteur) => {
    if (!acteur) return [];
    switch (acteur.role) {
        case 'collaborateur':
            return [acteur.id];

        case 'manager_observateur': {
            // Sa ligne, plus toute personne qu'il observe effectivement — y compris
            // hors ligne hiérarchique (C7 : contexte projet ou filière).
            const saLigne = personnesDeLignes(data, [acteur.ligne_id]);
            const observes = data.relation_observation
                .filter((r) => r.observateur_id === acteur.id)
                .map((r) => r.observe_id);
            return [...new Set([acteur.id, ...saLigne, ...observes])];
        }

        case 'responsable_structure':
            return [...new Set(personnesDeLignes(data, lignesDescendantes(data, acteur.ligne_id)))];

        case 'drh':
            return data.personne.filter((p) => p.entite_id === acteur.entite_id).map((p) => p.id);

        case 'admin':
        default:
            // L'admin gère comptes, rôles et référentiel. Aucun accès à la mesure.
            return [];
    }
};

// ---------------------------------------------------------------------------
// Règles unitaires
// ---------------------------------------------------------------------------

// Le rôle admin n'accède à aucune donnée de mesure. Vérifié au niveau du
// service, pas seulement de l'interface.
const interditAdmin = (acteur) => acteur && acteur.role === 'admin';

const peutVoirResultatsDe = (data, acteur, personneId) =>
    !interditAdmin(acteur) && perimetre(data, acteur).includes(personneId);

// Le verbatim est le seul objet réellement cloisonné : son auteur et la
// personne concernée, personne d'autre — ni le responsable de structure, ni la DRH.
const peutVoirVerbatim = (acteur, cotation) =>
    !!acteur && !interditAdmin(acteur) &&
    (cotation.observateur_id === acteur.id || cotation.observe_id === acteur.id);

// L'indice de fiabilité n'est jamais opposable à l'observateur : il lui est
// restitué à lui seul. La DRH n'y accède qu'agrégé et non nominatif.
const peutVoirIndiceFiabilite = (acteur, observateurId) =>
    !!acteur && acteur.role === 'manager_observateur' && acteur.id === observateurId;

// Descente nominative depuis le niveau groupe : interdite. Une holding accède
// aux comparaisons inter-entités agrégées, jamais aux individus d'une filiale.
const peutDescendreNominativement = (acteur, entiteIdCible) =>
    !!acteur && acteur.entite_id === entiteIdCible;

// C1 — séparation des canaux. La visibilité croisée n'est levée qu'à partir de
// saisie_close. Vérification côté serveur, pas seulement côté UI.
const canauxVisibles = (cycle) => !!cycle && cycle.statut !== 'ouvert';

// Restitution au collaborateur : au moment de l'entretien, pas en consultation
// permanente. Le manager ouvre la restitution ; elle n'est pas ouverte par défaut.
const restitutionAccessible = (cycle, acteur) => {
    if (!cycle) return false;
    if (acteur && acteur.role !== 'collaborateur') return cycle.statut === 'calcule' || cycle.statut === 'archive';
    return (cycle.statut === 'calcule' || cycle.statut === 'archive') && cycle.restitution_ouverte === true;
};

// Séquencement hiérarchique : personne d'un niveau N ne peut entrer dans le
// dispositif si le responsable de sa ligne N+1 n'y est pas entré et n'a pas
// validé son premier cycle. Vérifié à l'assignation des objets.
const sequencementRespecte = (data, personneId) => {
    const personne = data.personne.find((p) => p.id === personneId);
    if (!personne) return { ok: false, message: 'Personne introuvable.' };
    const ligne = data.ligne_hierarchique.find((l) => l.id === personne.ligne_id);
    if (!ligne) return { ok: false, message: 'Personne non rattachée à une ligne hiérarchique.' };

    // Le N+1 est le responsable de la ligne de rattachement. Si la personne EST
    // ce responsable, son N+1 est le responsable de la ligne parente.
    let ligneNPlus1 = ligne;
    if (ligne.responsable_id === personneId) {
        if (ligne.parent_ligne_id == null) return { ok: true }; // sommet du dispositif
        ligneNPlus1 = data.ligne_hierarchique.find((l) => l.id === ligne.parent_ligne_id);
    }
    if (!ligneNPlus1 || ligneNPlus1.responsable_id == null) return { ok: true };

    const responsable = data.personne.find((p) => p.id === ligneNPlus1.responsable_id);
    if (!responsable || responsable.premier_cycle_valide !== true) {
        return {
            ok: false,
            code: 'SEQUENCEMENT',
            message: `${responsable ? responsable.nom : 'Le responsable'} (ligne « ${ligneNPlus1.libelle} ») n\u2019a pas validé son premier cycle : ${personne.nom} ne peut pas entrer dans le dispositif.`
        };
    }
    return { ok: true };
};

// Escalade : remonte la ligne de l'observé, pas celle de l'observation.
const responsableNPlus2 = (data, personneId) => {
    const personne = data.personne.find((p) => p.id === personneId);
    if (!personne) return null;
    let ligne = data.ligne_hierarchique.find((l) => l.id === personne.ligne_id);
    for (let i = 0; i < 2 && ligne && ligne.parent_ligne_id != null; i++) {
        ligne = data.ligne_hierarchique.find((l) => l.id === ligne.parent_ligne_id);
    }
    return ligne ? ligne.responsable_id : null;
};

module.exports = {
    ROLES,
    lignesDescendantes,
    personnesDeLignes,
    perimetre,
    interditAdmin,
    peutVoirResultatsDe,
    peutVoirVerbatim,
    peutVoirIndiceFiabilite,
    peutDescendreNominativement,
    canauxVisibles,
    restitutionAccessible,
    sequencementRespecte,
    responsableNPlus2
};
