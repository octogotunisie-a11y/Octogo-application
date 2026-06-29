// backend/programmeEngine.js
// -----------------------------------------------------------------------------
// Moteur serveur : génération du programme annuel + recommandation de formateurs
// filtrée par DISPONIBILITÉ RÉELLE (indisponibilités + jours réservés).
// CommonJS (require/module.exports) — aligné sur le reste du backend.
// -----------------------------------------------------------------------------
//
// Abréviations :
//   KPI    = Indicateur Clé de Performance (Key Performance Indicator)
//   RH     = Ressources Humaines
//   TFP    = Taxe de Formation Professionnelle
//   CNFCPP = Centre National de Formation Continue et de Promotion Professionnelle
//   DT     = Dinar Tunisien
//   HT     = Hors Taxes
// -----------------------------------------------------------------------------

const MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const TAILLE_GROUPE_PAR_DEFAUT = 12;
const TARIF_JOUR_PAR_DEFAUT = 1200;

const CATALOGUE_OCTOGO = [{
        code: 'EVEIL',
        titre: 'ÉVEIL — NeuroLeadership & Performance Collective',
        categorie: 'LEADERSHIP',
        dureeJoursParDefaut: 3,
        motsCles: ['leadership', 'manager', 'management', 'équipe', 'collectif', 'performance', 'direction', 'responsable', 'chef', 'leader', 'dirigeant', 'cohésion', 'décision']
    },
    {
        code: 'RESET',
        titre: 'RESET — Neuromanagement & Performance durable',
        categorie: 'MANAGEMENT',
        dureeJoursParDefaut: 3,
        motsCles: ['management', 'équipe', 'performance', 'durable', 'organisation', 'ressources humaines', 'rh', 'gestion', 'stress', 'régulation', 'production', 'opérationnel']
    },
    {
        code: 'CAPTE',
        titre: 'CAPTE — Le cerveau au cœur de la relation client',
        categorie: 'RELATION CLIENT',
        dureeJoursParDefaut: 2,
        motsCles: ['client', 'relation client', 'service client', 'satisfaction', 'fidélisation', 'accueil', 'support', 'expérience client']
    },
    {
        code: 'NEUROVENTE',
        titre: 'NEUROVENTE — Vendre au cerveau pour toucher le cœur',
        categorie: 'VENTE',
        dureeJoursParDefaut: 2,
        motsCles: ['vente', 'commercial', 'négociation', 'persuasion', 'influence', 'convaincre', 'argumentation', 'vendre', 'closing', 'prospection']
    },
    {
        code: 'NEUROMARKETING',
        titre: 'NEUROMARKETING — Le cerveau au service de la stratégie',
        categorie: 'MARKETING',
        dureeJoursParDefaut: 2,
        motsCles: ['marketing', 'communication', 'publicité', 'marque', 'consommateur', 'stratégie marketing', 'digital', 'contenu']
    },
    {
        code: 'TRANSFORMATION',
        titre: 'TRANS-FORMATION — Leadership transformationnel & intelligence émotionnelle',
        categorie: 'TRANSFORMATION',
        dureeJoursParDefaut: 3,
        motsCles: ['transformation', 'changement', 'évolution', 'adaptation', 'innovation', 'transition', 'mutation', 'agilité', 'intelligence émotionnelle', 'émotion']
    },
    {
        code: 'VOLDAIGLE',
        titre: 'VOL D\u2019AIGLE — Vision stratégique & lecture de l\u2019environnement',
        categorie: 'STRATÉGIE',
        dureeJoursParDefaut: 2,
        motsCles: ['stratégie', 'vision', 'géopolitique', 'économie', 'international', 'décision', 'stratégique', 'gouvernance', 'incertitude', 'risque']
    },
];
const PROGRAMME_PAR_DEFAUT = { code: 'NEURO-SOCLE', titre: 'Socle Neuro-Cognitif sur-mesure', categorie: 'SOCLE', dureeJoursParDefaut: 2, motsCles: [] };

const normaliser = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const toNombre = (v, d = 0) => { const n = parseFloat(String(v).replace(',', '.').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : d; };
const trimestreDepuisMois = (mois) => Math.floor(((mois - 1) % 12) / 3) + 1;
let _seq = 0;
const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(_seq++).toString(36)}`;

// --- POINT D'EXTENSION IA ----------------------------------------------------
function apparierProgramme(texte) {
    const base = normaliser(texte);
    if (!base.trim()) return Object.assign({}, PROGRAMME_PAR_DEFAUT, { score: 0 });
    let meilleur = null,
        meilleurScore = 0;
    for (const prog of CATALOGUE_OCTOGO) {
        let score = 0;
        for (const mot of prog.motsCles)
            if (base.includes(normaliser(mot))) score += 1;
        if (score > meilleurScore) { meilleurScore = score;
            meilleur = prog; }
    }
    if (!meilleur) return Object.assign({}, PROGRAMME_PAR_DEFAUT, { score: 0 });
    return Object.assign({}, meilleur, { score: meilleurScore });
}

// --- DISPONIBILITÉ -----------------------------------------------------------
// Un formateur est INDISPONIBLE pour une action si l'un de ses créneaux occupés
// (indisponibilites = [{debut,fin}] format AAAA-MM-JJ, ou joursReserves = [AAAA-MM-JJ])
// tombe dans le mois de l'action. Modèle volontairement simple et déterministe ;
// alimentable par une synchronisation d'agenda (voir route /sync-agenda).
function formateurDisponiblePourMois(formateur, annee, mois) {
    const debutMois = new Date(annee, mois - 1, 1);
    const finMois = new Date(annee, mois, 0); // dernier jour du mois
    const chevauche = (d1, f1) => d1 <= finMois && f1 >= debutMois;

    const indispos = Array.isArray(formateur.indisponibilites) ? formateur.indisponibilites : [];
    for (const bloc of indispos) {
        const d = new Date(bloc.debut),
            f = new Date(bloc.fin || bloc.debut);
        if (!isNaN(d) && !isNaN(f) && chevauche(d, f)) return false;
    }
    const jours = Array.isArray(formateur.joursReserves) ? formateur.joursReserves : [];
    for (const j of jours) {
        const d = new Date(j);
        if (!isNaN(d) && d >= debutMois && d <= finMois) return false;
    }
    return true;
}

// Recommande, pour chaque action, les formateurs dont la catégorie correspond
// ET qui sont disponibles le mois de l'action.
function recommanderFormateurs(actions, formateurs, annee) {
    const list = Array.isArray(formateurs) ? formateurs : [];
    return actions.map((a) => {
        const candidats = list.filter((f) => {
            const cats = (f.categories || []).map(normaliser);
            const specs = normaliser((f.specialites || []).join(' ') + ' ' + (f.specialite || ''));
            const matchCategorie = cats.includes(normaliser(a.categorie)) || specs.includes(normaliser(a.categorie)) ||
                (a.programmeSource && specs.includes(normaliser(a.programmeSource)));
            return matchCategorie;
        });
        const disponibles = candidats.filter((f) => formateurDisponiblePourMois(f, annee, a.mois));
        const tri = (arr) => arr.slice().sort((x, y) =>
            (Number(!!y.agrementCNFCPP) - Number(!!x.agrementCNFCPP)) ||
            (toNombre(x.tarifJour, 9999) - toNombre(y.tarifJour, 9999)));
        return {
            actionId: a.id,
            action: a.intituleAction,
            categorie: a.categorie,
            mois: a.moisLibelle,
            formateursDisponibles: tri(disponibles).map((f) => ({ id: f.id, nom: f.nom, tarifJour: f.tarifJour, agrementCNFCPP: !!f.agrementCNFCPP, specialites: f.specialites || [] })),
            formateursIndisponibles: tri(candidats.filter((f) => !disponibles.includes(f))).map((f) => ({ id: f.id, nom: f.nom, motif: 'indisponible ce mois' })),
            alerte: disponibles.length === 0 ? `Aucun formateur ${a.categorie} disponible en ${a.moisLibelle} ${annee}.` : null,
        };
    });
}

// --- GÉNÉRATION PRINCIPALE ---------------------------------------------------
function genererProgrammeAnnuel(state, formateurs, params) {
    const s = state || {};
    const ent = s.entreprise || {};
    const budgetIn = s.budget || {};
    const agendaIn = s.agenda || {};
    const P = params || {};
    // PRIX AUTORITAIRE : le tarif jour provient EXCLUSIVEMENT du backend
    // (paramètres définis par l'administrateur). Toute valeur « tarifJour »
    // éventuellement envoyée par le client est volontairement ignorée.
    const tarifJour = toNombre(P.tarifJourParDefaut, TARIF_JOUR_PAR_DEFAUT) || TARIF_JOUR_PAR_DEFAUT;
    const devise = P.devise || 'DT';
    const moisDepart = Math.min(12, Math.max(1, toNombre(agendaIn.moisDemarrage, 1)));
    const annee = toNombre(agendaIn.annee, new Date().getFullYear());

    const corpsMetiers = (s.corpsMetiers || []).filter((c) => (c.intitule || '').trim());
    const objectifs = (s.objectifsPedagogiques || []).filter((o) => (o.libelle || '').trim());
    const competences = (s.competencesCibles || []).filter((c) => (c.libelle || '').trim());

    const actions = [];
    let curseurMois = moisDepart;
    const metiersEffectifs = corpsMetiers.length ? corpsMetiers :
        [{ id: uid('cm'), intitule: 'Population globale', effectif: ent.effectifGlobal || '', missions: '', priorite: 'Normale' }];
    const axes = objectifs.length ? objectifs.map((o) => o.libelle) :
        (competences.length ? competences.map((c) => c.libelle) : ['Développement des compétences clés']);

    for (const metier of metiersEffectifs) {
        const effectif = Math.max(0, toNombre(metier.effectif, 0));
        const nbGroupes = effectif > 0 ? Math.ceil(effectif / TAILLE_GROUPE_PAR_DEFAUT) : 1;
        const programmesParMetier = new Map();
        for (const axe of axes) {
            const texte = [axe, metier.missions, competences.map((c) => c.libelle).join(' ')].join(' ');
            const prog = apparierProgramme(texte);
            if (!programmesParMetier.has(prog.code)) programmesParMetier.set(prog.code, { prog, objectifs: new Set() });
            programmesParMetier.get(prog.code).objectifs.add(axe);
        }
        for (const { prog, objectifs: objs }
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
                objectifLie: [...objs].join(' · '),
                competences: prog.competencesDeveloppees || [],
                dureeJours,
                mois,
                moisLibelle: MOIS_FR[mois - 1],
                trimestre: trimestreDepuisMois(mois),
                modalite: effectif > TAILLE_GROUPE_PAR_DEFAUT ? 'Présentiel multi-groupes' : 'Présentiel / Hybride',
                coutEstime,
                coutLibelle: `${coutEstime.toLocaleString('fr-FR')} ${devise} HT`,
            });
            curseurMois += 1;
        }
    }

    const planParMetier = metiersEffectifs.map((metier) => {
        const am = actions.filter((a) => a.corpsMetier === metier.intitule);
        return {
            corpsMetier: metier.intitule,
            effectif: Math.max(0, toNombre(metier.effectif, 0)),
            priorite: metier.priorite || 'Normale',
            missions: metier.missions || '',
            actions: am,
            joursTotal: am.reduce((t, a) => t + a.dureeJours * a.nbGroupes, 0),
            coutTotal: am.reduce((t, a) => t + a.coutEstime, 0)
        };
    });

    const calendrier = { T1: [], T2: [], T3: [], T4: [] };
    for (const a of actions) calendrier[`T${a.trimestre}`].push(a);

    const coutTotalEstime = actions.reduce((t, a) => t + a.coutEstime, 0);
    const budgetDisponible = toNombre(budgetIn.montantAnnuel, 0);
    const ecart = budgetDisponible > 0 ? budgetDisponible - coutTotalEstime : null;
    let statutBudget = 'NON_RENSEIGNÉ';
    if (budgetDisponible > 0) statutBudget = coutTotalEstime <= budgetDisponible ? 'DANS_LE_BUDGET' : 'DÉPASSEMENT';
    const repartitionParTrimestre = ['T1', 'T2', 'T3', 'T4'].map((t) => ({ trimestre: t, cout: calendrier[t].reduce((a, x) => a + x.coutEstime, 0), nbActions: calendrier[t].length }));

    const budget = {
        devise,
        tarifJour,
        coutTotalEstime,
        coutTotalLibelle: `${coutTotalEstime.toLocaleString('fr-FR')} ${devise} HT`,
        budgetDisponible,
        ecart,
        statut: statutBudget,
        repartitionParMetier: planParMetier.map((p) => ({ corpsMetier: p.corpsMetier, cout: p.coutTotal })),
        repartitionParTrimestre
    };

    const kpisSaisis = (s.kpis || []).filter((k) => (k.libelle || '').trim());
    const kpis = [
        ...kpisSaisis.map((k) => ({ libelle: k.libelle, cible: k.cible || 'À définir', modeMesure: 'Défini par l\u2019entreprise' })),
        { libelle: 'Taux de réalisation du plan de formation', cible: '\u2265 90 %', modeMesure: 'Actions réalisées / actions planifiées' },
        { libelle: 'Taux de satisfaction des participants', cible: '\u2265 4,2 / 5', modeMesure: 'Questionnaire à chaud' },
        { libelle: 'Transfert sur le terrain à 90 jours', cible: '\u2265 70 %', modeMesure: 'Grille d\u2019auto-observation + entretien manager' },
    ];

    const impactCompetences = (competences.length ? competences.map((c) => c.libelle) : axes).map((lib) => {
        const aa = actions.filter((a) => normaliser(a.objectifLie).includes(normaliser(lib)) || a.competences.some((cc) => normaliser(cc).includes(normaliser(lib)))).map((a) => a.intituleAction);
        return { competence: lib, niveauVise: 'Maîtrise opérationnelle', actionsAssociees: aa.length ? [...new Set(aa)] : actions.slice(0, 1).map((a) => a.intituleAction) };
    });

    // Recommandation formateurs (catégorie + disponibilité réelle)
    const recommandationsFormateurs = recommanderFormateurs(actions, formateurs, annee);
    const categoriesRequises = [...new Set(actions.map((a) => a.categorie))];
    const cabinetsSaisis = (s.cabinets || []).filter((c) => (c.nom || '').trim());
    const besoinsNonCouverts = recommandationsFormateurs.filter((r) => r.alerte).map((r) => r.categorie);

    const recommandations = {
        cabinets: cabinetsSaisis.map((c) => ({ nom: c.nom, type: c.type, specialite: c.specialite || 'Généraliste' })),
        formateursParAction: recommandationsFormateurs,
        categoriesRequises,
        besoinsNonCouverts: [...new Set(besoinsNonCouverts)],
        note: besoinsNonCouverts.length ?
            `Catégories sans formateur disponible : ${[...new Set(besoinsNonCouverts)].join(', ')}. Décaler la période ou élargir le vivier (CNFCPP).` :
            'Couverture formateurs assurée sur les périodes planifiées.',
    };

    const resultatsAttendus = (s.resultatsAttendus || '').trim() ||
        `Montée en compétence de ${planParMetier.reduce((t, p) => t + p.effectif, 0)} collaborateurs sur ${metiersEffectifs.length} corps de métier.`;

    const meta = {
        entreprise: ent.nom || 'Entreprise',
        domaineActivite: ent.domaineActivite || '',
        annee,
        moisDemarrage: MOIS_FR[moisDepart - 1],
        caracteristiques: ent.caracteristiques || '',
        strategieGlobale: ent.strategieGlobale || '',
        strategieRH: ent.strategieRH || '',
        dossierTFP: !!(s.cadreTFP && s.cadreTFP.dossierTFP),
        detailsTFP: (s.cadreTFP && s.cadreTFP.detailsTFP) || '',
        dateGeneration: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        nbActions: actions.length,
        joursTotal: actions.reduce((t, a) => t + a.dureeJours * a.nbGroupes, 0),
        effectifTotal: planParMetier.reduce((t, p) => t + p.effectif, 0),
    };

    return { meta, programmeAnnuel: actions, planParMetier, calendrier, budget, kpis, impactCompetences, recommandations, resultatsAttendus };
}

module.exports = {
    genererProgrammeAnnuel,
    recommanderFormateurs,
    formateurDisponiblePourMois,
    apparierProgramme,
    CATALOGUE_OCTOGO,
    MOIS_FR,
};