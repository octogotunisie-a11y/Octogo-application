// backend/simulationEngine.js
// -----------------------------------------------------------------------------
// MOTEUR DE SIMULATION — POINT UNIQUE DE BRANCHEMENT DE LA FUTURE IA.
//
// Toutes les données produites ici proviennent de fichiers de configuration
// statiques (backend/data/simulation/*.json), PAS de valeurs codées en dur
// dans les composants React. Le jour où le modèle IA sera branché, il suffira
// de remplacer les fonctions de ce fichier (même signatures d'entrée/sortie)
// par de véritables appels au modèle — aucune modification de l'interface ni
// des routes ne sera nécessaire.
// -----------------------------------------------------------------------------
const path = require('path');
const fs = require('fs');

const simDir = path.join(__dirname, 'data', 'simulation');
const dataDir = path.join(__dirname, 'data');

const lireJSON = (dir, nom, parDefaut = {}) => {
    try {
        const p = path.join(dir, nom);
        if (!fs.existsSync(p)) return parDefaut;
        const d = fs.readFileSync(p, 'utf8');
        return d ? JSON.parse(d) : parDefaut;
    } catch (e) {
        console.error(`❌ lecture simulation ${nom}:`, e.message);
        return parDefaut;
    }
};

// ---- chargement des fichiers de configuration (rechargés à chaque appel :
//      permet de modifier les JSON de simulation sans redémarrer le serveur) ----
function config() {
    return {
        themes: lireJSON(simDir, 'themes.json', []),
        heures: lireJSON(simDir, 'heures.json', {}),
        tarifs: lireJSON(simDir, 'tarifs.json', {}),
        formateurs: lireJSON(simDir, 'formateurs.json', []),
        disponibilites: lireJSON(simDir, 'disponibilites.json', {}),
        contenuModules: lireJSON(simDir, 'contenuModules.json', {}),
        parametres: lireJSON(dataDir, 'parametresGeneration.json', { devise: 'DT', tauxTVA: 19 }),
    };
}

function labelTheme(themeKey, themes) {
    const t = themes.find((x) => x.key === themeKey);
    return t ? t.label : (themeKey || 'Formation');
}

// =============================================================================
// TODO IA : chaque fonction ci-dessous est un point de branchement du futur
// modèle. Signature d'entrée/sortie à conserver à l'identique.
// =============================================================================

// ---- Formateur ----
function choisirFormateur(themeKey) {
    const { formateurs } = config();
    if (!formateurs.length) return null;

    const scores = formateurs.map((f) => {
        const match = (f.domainesFormation || []).includes(themeKey);
        const score = match ? 85 + Math.min(f.anneesExperience || 0, 12) : 30;
        return { f, score: Math.min(score, 99) };
    });
    scores.sort((a, b) => b.score - a.score);
    return scores[0];
}

function genererFormateur(themeKey) {
    const { themes } = config();
    const meilleur = choisirFormateur(themeKey);
    if (!meilleur) {
        return { formateurPropose: null, scoreCompatibilite: null, competences: [], experiences: '', certifications: '', cv: '' };
    }
    const { f, score } = meilleur;
    return {
        formateurId: f.id,
        formateurPropose: { nom: f.nom, specialite: f.specialite, categories: f.domainesFormation, agrementCNFCPP: true },
        scoreCompatibilite: score,
        competences: f.competences || [],
        experiences: `${f.anneesExperience} ans d\u2019expérience en ${labelTheme(themeKey, themes).toLowerCase()}`,
        certifications: 'Agréé CNFCPP (Centre National de Formation Continue et de Promotion Professionnelle)',
        cv: f.cv,
    };
}

// ---- Agenda ----
function genererAgenda(formateurId) {
    const { disponibilites } = config();
    const dispo = disponibilites[formateurId];
    if (!dispo) return { datesProposees: [], creneauxDisponibles: '' };
    return { datesProposees: dispo.dates || [], creneauxDisponibles: dispo.creneau || '' };
}

// ---- Programme (contenu pédagogique) ----
function genererProgramme(themeKey, details) {
    const { themes, heures, contenuModules } = config();
    const label = labelTheme(themeKey, themes);
    const totalHeures = heures[themeKey] || 14;
    const titresModules = contenuModules[themeKey] || ['Introduction', 'Approfondissement', 'Mise en pratique'];
    const heuresParModule = Math.round((totalHeures / titresModules.length) * 10) / 10;
    const decoupageModules = titresModules.map((titre) => ({ titre, heures: heuresParModule }));
    const nbJours = Math.round((totalHeures / 7) * 10) / 10;

    return {
        titre: `Formation — ${label}`,
        duree: `${nbJours} jour(s)`,
        nombreHeures: totalHeures,
        niveau: 'Tous niveaux',
        publicCible: details.societe ? `Collaborateurs de ${details.societe}` : 'Collaborateurs concernés par la thématique',
        prerequis: 'Aucun prérequis spécifique.',
        introduction: `Cette formation en ${label.toLowerCase()} répond à l\u2019objectif suivant : ${details.objectifs || 'renforcer les compétences des participants sur cette thématique'}.`,
        objectifsPedagogiques: details.objectifs || `Développer une compréhension opérationnelle de la thématique « ${label} ».`,
        competencesDeveloppees: titresModules.join(', '),
        methodesPedagogiques: 'Apports théoriques, ateliers pratiques, mises en situation, études de cas.',
        moyensPedagogiques: 'Support de formation remis aux participants, vidéoprojecteur, exercices interactifs.',
        contenuDetaille: titresModules.map((t, i) => `Module ${i + 1} — ${t}`).join('\n'),
        decoupageModules,
        deroulement: `Formation organisée sur ${nbJours} jour(s), ${details.modalite || 'en présentiel'}.`,
        ateliers: 'Ateliers pratiques en sous-groupes avec restitution collective.',
        exercices: 'Mises en situation et exercices d\u2019application individuels.',
        conclusion: 'Synthèse collective, plan d\u2019action individuel et évaluation à chaud.',
    };
}

function genererDuree(programmeData) {
    const modules = programmeData?.decoupageModules || [];
    const nombreTotalHeures = modules.reduce((s, m) => s + (Number(m.heures) || 0), 0);
    return {
        nombreTotalHeures,
        nombreJours: nombreTotalHeures ? Math.round((nombreTotalHeures / 7) * 10) / 10 : 0,
        repartitionParModule: modules,
    };
}

// ---- Devis / Facture ----
function genererDevis(themeKey, details, programmeData) {
    const { themes, tarifs, parametres } = config();
    const label = labelTheme(themeKey, themes);
    const tarifJour = tarifs[themeKey] || parametres.tarifJourParDefaut || 1200;
    const nbJours = genererDuree(programmeData).nombreJours || 1;
    const prixHT = Math.round(tarifJour * nbJours);
    const tauxTVA = parametres.tauxTVA ?? 19;
    const tva = Math.round(prixHT * (tauxTVA / 100));
    const devise = parametres.devise || 'DT';

    return {
        infosClient: details.societe || '',
        formation: `Formation — ${label}`,
        nbParticipants: details.nbParticipants || '',
        nbJours,
        prixHT: `${prixHT} ${devise}`,
        tva: `${tva} ${devise} (${tauxTVA}%)`,
        totalTTC: `${prixHT + tva} ${devise}`,
        conditions: 'Devis valable 30 jours à compter de sa date d\u2019émission. Formation confirmée à réception du bon pour accord.',
        signature: '',
    };
}

function genererFacture(themeKey, details, devisData) {
    const { parametres } = config();
    const devise = parametres.devise || 'DT';
    const prixHT = parseInt(String(devisData?.prixHT || '0'), 10) || 0;
    const tva = parseInt(String(devisData?.tva || '0'), 10) || 0;

    return {
        infosClient: details.societe || '',
        lignes: [{ designation: devisData?.formation || 'Formation', quantite: 1, prixUnitaire: prixHT }],
        totalHT: `${prixHT} ${devise}`,
        tva: `${tva} ${devise}`,
        totalTTC: `${prixHT + tva} ${devise}`,
    };
}

// ---- Feuille de présence ----
function genererPresence(details) {
    const n = Math.max(parseInt(details.nbParticipants, 10) || 0, 0);
    const lignes = Array.from({ length: n }, () => ({ nom: '', prenom: '', fonction: '', signatureMatin: '', signatureApresMidi: '' }));
    return { lignes };
}

// ---- Évaluations (gabarit générique — pas de résultats simulés, formulaire vide) ----
function genererEvaluation() {
    return {
        avant: { attentes: '', niveau: '', besoins: '' },
        apres: { satisfaction: '', qualite: '', animation: '', contenu: '', utilite: '', recommandations: '' },
    };
}

// ---- KPI (indicateurs fictifs, changent à chaque régénération pour simuler l'IA) ----
function alea(min, max) { return Math.round(min + Math.random() * (max - min)); }

function genererKPI() {
    const satisfaction = alea(82, 97);
    const participation = alea(88, 100);
    const reussite = alea(80, 96);
    return {
        indicateurs: [
            { nom: 'Taux de satisfaction', objectif: '≥ 85%', resultat: `${satisfaction}%` },
            { nom: 'Taux de participation', objectif: '≥ 90%', resultat: `${participation}%` },
            { nom: 'Taux de réussite', objectif: '≥ 80%', resultat: `${reussite}%` },
        ],
        objectifs: 'Atteindre un niveau de satisfaction et d\u2019application opérationnelle élevé.',
        resultats: `Formation jugée efficace par ${satisfaction}% des participants.`,
        tauxSatisfaction: `${satisfaction}%`,
        tauxParticipation: `${participation}%`,
        tauxReussite: `${reussite}%`,
        roi: `Estimation ROI (Retour Sur Investissement) : ${alea(110, 240)}%`,
        efficacite: satisfaction >= 90 ? 'Élevée' : satisfaction >= 80 ? 'Satisfaisante' : 'À surveiller',
    };
}

// ---- Étude d'impact ----
function genererImpact(themeKey, details) {
    const { themes } = config();
    const label = labelTheme(themeKey, themes);
    return {
        objectifs: details.objectifs || `Mesurer l\u2019impact de la formation « ${label} » sur la performance des équipes.`,
        indicateurs: 'Taux de satisfaction, taux d\u2019application des acquis, évolution de la performance observée.',
        observations: `Premiers retours positifs sur l\u2019application des acquis suite à la formation ${label}.`,
        recommandations: 'Prévoir un suivi à 3 mois et un atelier de renforcement des acquis.',
        conclusions: 'Formation jugée pertinente au regard des objectifs fixés par l\u2019entreprise.',
    };
}

module.exports = {
    config,
    labelTheme,
    choisirFormateur,
    genererFormateur,
    genererAgenda,
    genererProgramme,
    genererDuree,
    genererDevis,
    genererFacture,
    genererPresence,
    genererEvaluation,
    genererKPI,
    genererImpact,
};
