// src/pages/programmeGenerator.js
// -----------------------------------------------------------------------------
// Moteur de génération du programme annuel de formation — OCTOGO
// -----------------------------------------------------------------------------
// IMPORTANT (architecture) :
//   Ce module est une LOGIQUE PURE, sans dépendance React ni réseau.
//   Il prend en entrée l'état du formulaire (voir createEmptyState) et retourne
//   un objet structuré (voir genererProgrammeAnnuel).
//
//   La génération repose sur des MODÈLES PRÉDÉFINIS (catalogue OCTOGO) et une
//   correspondance par mots-clés, cohérente avec aiService.jsx déjà présent
//   dans le projet. AUCUN appel à un modèle de langage distant n'est effectué.
//
//   POUR BRANCHER PLUS TARD UNE IA (Intelligence Artificielle) RÉELLE :
//   ne remplacez QUE la fonction `apparierProgramme()` (ou ajoutez un mode
//   asynchrone) — le reste de la chaîne (budget, calendrier, KPI, export)
//   reste inchangé.
// -----------------------------------------------------------------------------

// Abréviations utilisées dans ce module :
//   KPI  = Indicateur Clé de Performance (Key Performance Indicator)
//   RH   = Ressources Humaines
//   TFP  = Taxe de Formation Professionnelle
//   CNFCPP = Centre National de Formation Continue et de Promotion Professionnelle
//   DT   = Dinar Tunisien
//   HT   = Hors Taxes

// -----------------------------------------------------------------------------
// 1. Catalogue OCTOGO (modèles prédéfinis) — aligné sur aiService.jsx
// -----------------------------------------------------------------------------
export const CATALOGUE_OCTOGO = [{
        code: 'EVEIL',
        titre: 'ÉVEIL — NeuroLeadership & Performance Collective',
        categorie: 'LEADERSHIP',
        dureeJoursParDefaut: 3,
        motsCles: ['leadership', 'manager', 'management', 'équipe', 'collectif', 'performance', 'direction', 'responsable', 'chef', 'leader', 'dirigeant', 'cohésion', 'décision'],
        competencesDeveloppees: ['Leadership conscient', 'Prise de décision', 'Cohésion d\u2019équipe'],
    },
    {
        code: 'RESET',
        titre: 'RESET — Neuromanagement & Performance durable',
        categorie: 'MANAGEMENT',
        dureeJoursParDefaut: 3,
        motsCles: ['management', 'équipe', 'performance', 'durable', 'organisation', 'ressources humaines', 'rh', 'gestion', 'stress', 'régulation', 'production', 'opérationnel'],
        competencesDeveloppees: ['Management durable', 'Régulation du stress', 'Pilotage opérationnel'],
    },
    {
        code: 'CAPTE',
        titre: 'CAPTE — Le cerveau au cœur de la relation client',
        categorie: 'RELATION CLIENT',
        dureeJoursParDefaut: 2,
        motsCles: ['client', 'relation client', 'service client', 'satisfaction', 'fidélisation', 'accueil', 'support', 'expérience client'],
        competencesDeveloppees: ['Relation client', 'Qualité de service', 'Fidélisation'],
    },
    {
        code: 'NEUROVENTE',
        titre: 'NEUROVENTE — Vendre au cerveau pour toucher le cœur',
        categorie: 'VENTE',
        dureeJoursParDefaut: 2,
        motsCles: ['vente', 'commercial', 'négociation', 'persuasion', 'influence', 'convaincre', 'argumentation', 'vendre', 'closing', 'prospection'],
        competencesDeveloppees: ['Techniques de vente', 'Négociation', 'Argumentation'],
    },
    {
        code: 'NEUROMARKETING',
        titre: 'NEUROMARKETING — Le cerveau au service de la stratégie',
        categorie: 'MARKETING',
        dureeJoursParDefaut: 2,
        motsCles: ['marketing', 'communication', 'publicité', 'marque', 'consommateur', 'stratégie marketing', 'digital', 'contenu'],
        competencesDeveloppees: ['Stratégie marketing', 'Communication d\u2019impact'],
    },
    {
        code: 'TRANSFORMATION',
        titre: 'TRANS-FORMATION — Leadership transformationnel & intelligence émotionnelle',
        categorie: 'TRANSFORMATION',
        dureeJoursParDefaut: 3,
        motsCles: ['transformation', 'changement', 'évolution', 'adaptation', 'innovation', 'transition', 'mutation', 'agilité', 'intelligence émotionnelle', 'émotion'],
        competencesDeveloppees: ['Conduite du changement', 'Intelligence émotionnelle', 'Agilité'],
    },
    {
        code: 'VOLDAIGLE',
        titre: 'VOL D\u2019AIGLE — Vision stratégique & lecture de l\u2019environnement',
        categorie: 'STRATÉGIE',
        dureeJoursParDefaut: 2,
        motsCles: ['stratégie', 'vision', 'géopolitique', 'économie', 'international', 'décision', 'stratégique', 'gouvernance', 'incertitude', 'risque'],
        competencesDeveloppees: ['Vision stratégique', 'Lecture de l\u2019environnement', 'Décision en incertitude'],
    },
];

// Programme générique de repli si aucune correspondance n'est trouvée.
const PROGRAMME_PAR_DEFAUT = {
    code: 'NEURO-SOCLE',
    titre: 'Socle Neuro-Cognitif sur-mesure',
    categorie: 'SOCLE',
    dureeJoursParDefaut: 2,
    motsCles: [],
    competencesDeveloppees: ['Socle cognitif', 'Régulation', 'Coopération'],
};

// -----------------------------------------------------------------------------
// 2. Modèle de données (schéma de l'état du formulaire)
// -----------------------------------------------------------------------------
export const TAILLE_GROUPE_PAR_DEFAUT = 12; // participants maximum par groupe
export const TARIF_JOUR_PAR_DEFAUT = 1200; // DT (Dinar Tunisien) HT (Hors Taxes) / jour

let _seq = 0;
export const uid = (prefixe = 'id') => `${prefixe}_${Date.now().toString(36)}_${(_seq++).toString(36)}`;

export function createEmptyState() {
    return {
        entreprise: {
            nom: '',
            domaineActivite: '',
            caracteristiques: '',
            effectifGlobal: '',
            strategieGlobale: '',
            strategieRH: '',
        },
        corpsMetiers: [
            { id: uid('cm'), intitule: '', effectif: '', missions: '', priorite: 'Normale' },
        ],
        objectifsPedagogiques: [
            { id: uid('obj'), libelle: '' },
        ],
        competencesCibles: [
            { id: uid('comp'), libelle: '' },
        ],
        kpis: [
            { id: uid('kpi'), libelle: '', cible: '' },
        ],
        resultatsAttendus: '',
        cadreTFP: {
            dossierTFP: false,
            detailsTFP: '',
        },
        budget: {
            montantAnnuel: '',
            tarifJour: TARIF_JOUR_PAR_DEFAUT,
            devise: 'DT',
        },
        agenda: {
            annee: new Date().getFullYear(),
            moisDemarrage: 1,
        },
        cabinets: [
            { id: uid('cab'), nom: '', type: 'local', specialite: '' },
        ],
        formateurs: [
            { id: uid('fmt'), nom: '', specialite: '', agrementCNFCPP: true },
        ],
    };
}

// -----------------------------------------------------------------------------
// 3. Utilitaires
// -----------------------------------------------------------------------------
const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const normaliser = (s) =>
    (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toNombre = (v, parDefaut = 0) => {
    const n = parseFloat(String(v).replace(',', '.').replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : parDefaut;
};

const trimestreDepuisMois = (mois) => Math.floor(((mois - 1) % 12) / 3) + 1;

// -----------------------------------------------------------------------------
// 4. Appariement programme (POINT D'EXTENSION IA)
// -----------------------------------------------------------------------------
// Pour brancher une IA réelle plus tard : remplacez le corps de cette fonction
// par un appel à votre endpoint, en conservant la même signature de retour.
export function apparierProgramme(texte) {
    const base = normaliser(texte);
    if (!base.trim()) return {...PROGRAMME_PAR_DEFAUT, score: 0 };

    let meilleur = null;
    let meilleurScore = 0;
    for (const prog of CATALOGUE_OCTOGO) {
        let score = 0;
        for (const mot of prog.motsCles) {
            if (base.includes(normaliser(mot))) score += 1;
        }
        if (score > meilleurScore) {
            meilleurScore = score;
            meilleur = prog;
        }
    }
    if (!meilleur) return {...PROGRAMME_PAR_DEFAUT, score: 0 };
    return {...meilleur, score: meilleurScore };
}

// -----------------------------------------------------------------------------
// 5. Génération principale
// -----------------------------------------------------------------------------
export function genererProgrammeAnnuel(state) {
    const s = state || createEmptyState();
    // Références sécurisées (sans accès optionnel, pour éviter toute corruption par un
    // formateur de code) : chaque sous-objet est garanti non nul.
    const ent = s.entreprise || {};
    const budgetIn = s.budget || {};
    const agendaIn = s.agenda || {};
    const cadreTFP = s.cadreTFP || {};

    const tarifJour = toNombre(budgetIn.tarifJour, TARIF_JOUR_PAR_DEFAUT) || TARIF_JOUR_PAR_DEFAUT;
    const devise = budgetIn.devise || 'DT';
    const moisDepart = Math.min(12, Math.max(1, toNombre(agendaIn.moisDemarrage, 1)));
    const annee = toNombre(agendaIn.annee, new Date().getFullYear());

    const corpsMetiers = (s.corpsMetiers || []).filter((c) => (c.intitule || '').trim());
    const objectifs = (s.objectifsPedagogiques || []).filter((o) => (o.libelle || '').trim());
    const competences = (s.competencesCibles || []).filter((c) => (c.libelle || '').trim());

    // -- 5.1 Construction des actions de formation -----------------------------
    const actions = [];
    let curseurMois = moisDepart;

    // Si aucun corps de métier saisi, on génère sur un corps "Tous publics".
    const metiersEffectifs = corpsMetiers.length ?
        corpsMetiers :
        [{ id: uid('cm'), intitule: 'Population globale', effectif: ent.effectifGlobal || '', missions: '', priorite: 'Normale' }];

    // Si aucun objectif saisi, on dérive des actions depuis les compétences.
    const axes = objectifs.length ?
        objectifs.map((o) => o.libelle) :
        (competences.length ? competences.map((c) => c.libelle) : ['Développement des compétences clés']);

    for (const metier of metiersEffectifs) {
        const effectif = Math.max(0, toNombre(metier.effectif, 0));
        const nbGroupes = effectif > 0 ? Math.ceil(effectif / TAILLE_GROUPE_PAR_DEFAUT) : 1;

        // On apparie chaque axe (objectif) à un programme, puis on DÉDOUBLONNE par
        // programme : si deux objectifs pointent vers le même module, on fusionne en
        // une seule action couvrant les deux objectifs (évite les actions identiques).
        const programmesParMetier = new Map(); // code -> { prog, objectifs:Set }
        for (const axe of axes) {
            const texteAppariement = [
                axe,
                metier.missions,
                competences.map((c) => c.libelle).join(' '),
            ].join(' ');
            const prog = apparierProgramme(texteAppariement);
            if (!programmesParMetier.has(prog.code)) {
                programmesParMetier.set(prog.code, { prog, objectifs: new Set() });
            }
            programmesParMetier.get(prog.code).objectifs.add(axe);
        }

        for (const { prog, objectifs }
            of programmesParMetier.values()) {
            const dureeJours = prog.dureeJoursParDefaut;
            const mois = ((curseurMois - 1) % 12) + 1;
            const coutEstime = dureeJours * nbGroupes * tarifJour;

            actions.push({
                id: uid('act'),
                intituleAction: prog.titre,
                programmeSource: prog.code,
                categorie: prog.categorie,
                corpsMetier: metier.intitule,
                effectif,
                nbGroupes,
                objectifLie: [...objectifs].join(' · '),
                competences: prog.competencesDeveloppees,
                dureeJours,
                mois,
                moisLibelle: MOIS_FR[mois - 1],
                trimestre: trimestreDepuisMois(mois),
                modalite: effectif > TAILLE_GROUPE_PAR_DEFAUT ? 'Présentiel multi-groupes' : 'Présentiel / Hybride',
                coutEstime,
                coutLibelle: `${coutEstime.toLocaleString('fr-FR')} ${devise} HT`,
            });

            curseurMois += 1; // étalement séquentiel sur l'année
        }
    }

    // -- 5.2 Plan par corps de métier ------------------------------------------
    const planParMetier = metiersEffectifs.map((metier) => {
        const actionsMetier = actions.filter((a) => a.corpsMetier === metier.intitule);
        return {
            corpsMetier: metier.intitule,
            effectif: Math.max(0, toNombre(metier.effectif, 0)),
            priorite: metier.priorite || 'Normale',
            missions: metier.missions || '',
            actions: actionsMetier,
            joursTotal: actionsMetier.reduce((t, a) => t + a.dureeJours * a.nbGroupes, 0),
            coutTotal: actionsMetier.reduce((t, a) => t + a.coutEstime, 0),
        };
    });

    // -- 5.3 Calendrier annuel (par trimestre) ---------------------------------
    const calendrier = { T1: [], T2: [], T3: [], T4: [] };
    for (const a of actions) {
        calendrier[`T${a.trimestre}`].push(a);
    }

    // -- 5.4 Estimation budgétaire ---------------------------------------------
    const coutTotalEstime = actions.reduce((t, a) => t + a.coutEstime, 0);
    const budgetDisponible = toNombre(budgetIn.montantAnnuel, 0);
    const ecart = budgetDisponible > 0 ? budgetDisponible - coutTotalEstime : null;
    let statutBudget = 'NON_RENSEIGNÉ';
    if (budgetDisponible > 0) {
        statutBudget = coutTotalEstime <= budgetDisponible ? 'DANS_LE_BUDGET' : 'DÉPASSEMENT';
    }

    const repartitionParTrimestre = ['T1', 'T2', 'T3', 'T4'].map((t) => ({
        trimestre: t,
        cout: calendrier[t].reduce((acc, a) => acc + a.coutEstime, 0),
        nbActions: calendrier[t].length,
    }));

    const budget = {
        devise,
        tarifJour,
        coutTotalEstime,
        coutTotalLibelle: `${coutTotalEstime.toLocaleString('fr-FR')} ${devise} HT`,
        budgetDisponible,
        ecart,
        statut: statutBudget,
        repartitionParMetier: planParMetier.map((p) => ({ corpsMetier: p.corpsMetier, cout: p.coutTotal })),
        repartitionParTrimestre,
    };

    // -- 5.5 Indicateurs de performance (KPI) ----------------------------------
    const kpisSaisis = (s.kpis || []).filter((k) => (k.libelle || '').trim());
    const kpisSocle = [
        { libelle: 'Taux de réalisation du plan de formation', cible: '\u2265 90 %', modeMesure: 'Actions réalisées / actions planifiées' },
        { libelle: 'Taux de satisfaction des participants', cible: '\u2265 4,2 / 5', modeMesure: 'Questionnaire à chaud (fin de session)' },
        { libelle: 'Transfert sur le terrain à 90 jours', cible: '\u2265 70 %', modeMesure: 'Grille d\u2019auto-observation + entretien manager' },
    ];
    const kpis = [
        ...kpisSaisis.map((k) => ({ libelle: k.libelle, cible: k.cible || 'À définir', modeMesure: 'Défini par l\u2019entreprise' })),
        ...kpisSocle,
    ];

    // -- 5.6 Impact compétences -------------------------------------------------
    const impactCompetences = (competences.length ? competences : axes.map((a) => ({ libelle: a })))
        .map((c) => {
            const lib = c.libelle || c;
            const actionsAssociees = actions
                .filter((a) => normaliser(a.objectifLie).includes(normaliser(lib)) || a.competences.some((cc) => normaliser(cc).includes(normaliser(lib))))
                .map((a) => a.intituleAction);
            return {
                competence: lib,
                niveauVise: 'Maîtrise opérationnelle',
                actionsAssociees: actionsAssociees.length ? [...new Set(actionsAssociees)] : actions.slice(0, 1).map((a) => a.intituleAction),
            };
        });

    // -- 5.7 Recommandations cabinets / formateurs -----------------------------
    const cabinets = (s.cabinets || []).filter((c) => (c.nom || '').trim());
    const formateurs = (s.formateurs || []).filter((f) => (f.nom || '').trim());
    const categoriesRequises = [...new Set(actions.map((a) => a.categorie))];
    const besoinsNonCouverts = categoriesRequises.filter(
        (cat) => !cabinets.some((c) => normaliser(c.specialite).includes(normaliser(cat))) &&
        !formateurs.some((f) => normaliser(f.specialite).includes(normaliser(cat)))
    );

    const recommandations = {
        cabinets: cabinets.map((c) => ({ nom: c.nom, type: c.type, specialite: c.specialite || 'Généraliste' })),
        formateurs: formateurs.map((f) => ({ nom: f.nom, specialite: f.specialite || 'Généraliste', agrementCNFCPP: !!f.agrementCNFCPP })),
        besoinsNonCouverts,
        note: besoinsNonCouverts.length ?
            `Catégories sans cabinet/formateur identifié : ${besoinsNonCouverts.join(', ')}. Prévoir un sourcing complémentaire (CNFCPP).` :
            'Couverture des besoins assurée par les ressources renseignées.',
    };

    // -- 5.8 Résultats attendus -------------------------------------------------
    const resultatsAttendus = (s.resultatsAttendus || '').trim() ||
        `Montée en compétence de ${planParMetier.reduce((t, p) => t + p.effectif, 0)} collaborateurs sur ${metiersEffectifs.length} corps de métier, alignée sur la stratégie ${ent.strategieGlobale ? '« ' + ent.strategieGlobale + ' »' : 'de développement'} de l\u2019entreprise.`;

    // -- 5.9 Méta ---------------------------------------------------------------
    const meta = {
        entreprise: ent.nom || 'Entreprise',
        domaineActivite: ent.domaineActivite || '',
        annee,
        moisDemarrage: MOIS_FR[moisDepart - 1],
        caracteristiques: ent.caracteristiques || '',
        strategieGlobale: ent.strategieGlobale || '',
        strategieRH: ent.strategieRH || '',
        dossierTFP: !!cadreTFP.dossierTFP,
        detailsTFP: cadreTFP.detailsTFP || '',
        dateGeneration: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        nbActions: actions.length,
        joursTotal: actions.reduce((t, a) => t + a.dureeJours * a.nbGroupes, 0),
        effectifTotal: planParMetier.reduce((t, p) => t + p.effectif, 0),
    };

    return {
        meta,
        programmeAnnuel: actions,
        planParMetier,
        calendrier,
        budget,
        kpis,
        impactCompetences,
        recommandations,
        resultatsAttendus,
    };
}

export const MOIS_FRANCAIS = MOIS_FR;