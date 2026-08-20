// frontend/src/evaluation/evaluationMock.js
// -----------------------------------------------------------------------------
// DONNÉES DE TEST DU MODULE ÉVALUATION — VERSION SIMPLE
//
// Les questions sont des DONNÉES, pas du code écrit dans un composant.
// L'administrateur les ajoute depuis son dashboard, société par société,
// à partir des formations que cette société a réalisées.
//
// AVERTISSEMENT : questions de TEST. Elles ne proviennent pas du manuel
// d'évaluateur et ne doivent jamais être présentées comme les questions
// officielles du protocole RESPECT.
//
// Migration ultérieure : ce fichier sera remplacé par des appels Supabase.
// La forme des objets doit rester identique pour que l'interface ne bouge pas.
// -----------------------------------------------------------------------------

// Échelle de réponse du collaborateur.
export const ECHELLE = [
    { valeur: 1, label: 'Faible' },
    { valeur: 2, label: 'Modérée' },
    { valeur: 3, label: 'Élevée' },
    { valeur: 4, label: 'Très élevée' }
];

// Niveaux de cotation de l'observateur.
// « Non observé » figure au même rang que les quatre niveaux : ce n'est pas un
// zéro, et il n'est jamais repris automatiquement du cycle précédent.
export const NIVEAUX = [
    { valeur: 1, label: 'Niveau 1' },
    { valeur: 2, label: 'Niveau 2' },
    { valeur: 3, label: 'Niveau 3' },
    { valeur: 4, label: 'Niveau 4' },
    { valeur: 'non_observe', label: 'Non observé' }
];

export const MSG = {
    situation_vide: 'Veuillez renseigner la situation observée.',
    date_vide: 'Veuillez renseigner la date de la situation.',
    niveau_vide: 'Sélectionnez un niveau ou « Non observé ».'
};

// ============================================================================
// ÉTAT INITIAL
// ============================================================================
export const donneesInitiales = () => ({
    societes: [
        { id: 1, nom: 'Société Demo' },
        { id: 2, nom: 'Société XYZ' }
    ],

    // Formations réalisées par chaque société. Les questions en découlent.
    formations: [
        { id: 1, societe_id: 1, libelle: 'Leadership & Management' },
        { id: 2, societe_id: 2, libelle: 'Communication professionnelle' }
    ],

    // role ∈ observateur | collaborateur
    personnes: [
        { id: 1, societe_id: 1, nom: 'Ahmed', role: 'observateur' },
        { id: 2, societe_id: 1, nom: 'Amal', role: 'collaborateur' },
        { id: 3, societe_id: 1, nom: 'Sarra', role: 'collaborateur' },
        { id: 4, societe_id: 1, nom: 'Ali', role: 'collaborateur' },
        { id: 5, societe_id: 2, nom: 'Nadia', role: 'observateur' },
        { id: 6, societe_id: 2, nom: 'Karim', role: 'collaborateur' }
    ],

    // statut ∈ ouvert | ferme. Ouvert par défaut : rien ne bloque le test.
    cycles: [
        { id: 1, societe_id: 1, formation_id: 1, libelle: 'T3 2026', debut: '2026-07-01', fin: '2026-09-30', statut: 'ouvert' },
        { id: 2, societe_id: 2, formation_id: 2, libelle: 'T3 2026', debut: '2026-07-01', fin: '2026-09-30', statut: 'ouvert' }
    ],

    // Questions ajoutées par l'administrateur, propres à chaque société.
    // Le collaborateur y répond ; l'observateur cote la même compétence à
    // partir de ce qu'il a observé. Les deux saisies restent séparées.
    questions: [
        { id: 1, societe_id: 1, cycle_id: 1, ordre: 1, actif: true, texte: 'Dans votre travail, à quel niveau devez-vous adapter votre communication selon les situations ?' },
        { id: 2, societe_id: 1, cycle_id: 1, ordre: 2, actif: true, texte: 'À quelle fréquence devez-vous gérer des situations difficiles ?' },
        { id: 3, societe_id: 1, cycle_id: 1, ordre: 3, actif: true, texte: 'À quel niveau devez-vous organiser plusieurs priorités simultanément ?' },

        // Société XYZ — formulations différentes. La configuration d'une
        // société n'apparaît jamais dans l'évaluation d'une autre.
        { id: 4, societe_id: 2, cycle_id: 2, ordre: 1, actif: true, texte: 'À quel niveau devez-vous reformuler un message pour être compris de tous ?' },
        { id: 5, societe_id: 2, cycle_id: 2, ordre: 2, actif: true, texte: 'À quelle fréquence devez-vous désamorcer un malentendu avec un interlocuteur ?' }
    ],

    sequences: { societe: 3, formation: 3, personne: 7, cycle: 3, question: 6 }
});

// ============================================================================
// SÉLECTEURS — tout accès aux données passe par ici, avec l'identifiant de la
// société ou de la personne. L'isolation ne peut pas être oubliée par mégarde.
// ============================================================================
export const societeDe = (d, personneId) => {
    const p = d.personnes.find((x) => x.id === personneId);
    return p ? p.societe_id : null;
};

export const cycleDeSociete = (d, societeId) =>
    d.cycles.find((c) => c.societe_id === societeId) || null;

export const formationDuCycle = (d, cycle) =>
    cycle ? d.formations.find((f) => f.id === cycle.formation_id) || null : null;

export const questionsDuCycle = (d, cycleId, inclureInactives = false) =>
    d.questions
        .filter((q) => q.cycle_id === cycleId && (inclureInactives || q.actif))
        .sort((a, b) => a.ordre - b.ordre);

export const equipeDe = (d, societeId, role) =>
    d.personnes.filter((p) => p.societe_id === societeId && (!role || p.role === role));

// Cycle d'une personne : celui de sa société, quel que soit son rôle.
// Aucune assignation d'objet n'est requise pour entrer dans le dispositif.
export const cycleDe = (d, personneId) => {
    const societeId = societeDe(d, personneId);
    return societeId ? cycleDeSociete(d, societeId) : null;
};

// Identifiant suivant — compteur déterministe, aucun aléatoire.
export const prochainId = (d, cle) => {
    const n = d.sequences[cle] || 1;
    d.sequences[cle] = n + 1;
    return n;
};
