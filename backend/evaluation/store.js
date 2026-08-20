// backend/evaluation/store.js
// -----------------------------------------------------------------------------
// Stockage local du module Évaluation — un seul fichier JSON, comme le reste
// du projet. Le schéma reprend les quinze entités de la fiche technique v1.0
// afin qu'une migration ultérieure vers Postgres soit une transposition et non
// une refonte : mêmes noms de tables, mêmes noms de colonnes, mêmes clés.
//
// LIMITE ASSUMÉE — à faire figurer au procès-verbal de recette :
// le cloisonnement par ligne hiérarchique est ici applicatif (vérifié dans
// acces.js), pas garanti par le moteur de stockage. Sur fichiers plats il
// n'existe pas de politique de sécurité au niveau de la ligne. Tant que la
// base est locale, la matrice d'accès de la section 03 est respectée par le
// code, non imposée par l'infrastructure.
// -----------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');

const FICHIER = path.join(__dirname, '..', 'data', 'evaluation.json');

// Les quinze entités + le journal de purge et la voie d'escalade.
const TABLES = [
    'entite', 'ligne_hierarchique', 'personne', 'relation_observation',
    'objet', 'descripteur_niveau', 'cas_etalon', 'item',
    'cycle', 'objet_assigne', 'cotation_canal_b', 'declaration_canal_a',
    'passation', 'reponse_item',
    'habilitation', 'session_calibrage', 'cotation_calibrage',
    'ecart_calcule', 'signature', 'indice_fiabilite_observateur',
    'signalement_hors_dispositif', 'journal_purge', 'audit'
];

const vide = () => {
    const base = { _version_schema: '1.0', sequences: {} };
    TABLES.forEach((t) => { base[t] = [];
        base.sequences[t] = 1; });
    return base;
};

// ---------------------------------------------------------------------------
// Rattachement aux comptes réels de l'application.
// Le dispositif ne crée PAS de comptes : il s'appuie sur users.json, seule
// source d'identité du projet. Un email figurant ici est un email qui permet
// réellement de se connecter — sans cela, personne ne peut tester.
// ---------------------------------------------------------------------------
const lireUtilisateurs = () => {
    try {
        const p = path.join(__dirname, '..', 'data', 'users.json');
        if (!fs.existsSync(p)) return [];
        const brut = fs.readFileSync(p, 'utf8');
        const users = brut && brut.trim() ? JSON.parse(brut) : [];
        // Les comptes « admin » ne reçoivent pas de fiche personne : le rôle
        // administrateur n'a aucun accès aux données de mesure.
        return users
            .filter((u) => u && u.email && u.role !== 'admin')
            .sort((a, b) => (a.id || 0) - (b.id || 0));
    } catch (e) {
        console.error('⚠ users.json illisible, amorçage sur données fictives :', e.message);
        return [];
    }
};

// Comptes de complément, utilisés seulement si users.json ne fournit pas assez
// de personnes pour qu'un cockpit ait du sens.
const COMPLEMENTS = [
    { nom: 'Sarra Ben Salah', email: 'sarra@demo.local' },
    { nom: 'Ali Trabelsi', email: 'ali@demo.local' }
];

// ---------------------------------------------------------------------------
// Jeu d'amorçage. Structure réelle, contenu de référentiel volontairement
// minimal : un seul objet entièrement documenté suffit à conduire un pilote
// valide sur une ligne (fiche technique, ordre de développement).
// ---------------------------------------------------------------------------
const amorcer = () => {
    const d = vide();
    const suivant = (t) => { const n = d.sequences[t];
        d.sequences[t] = n + 1; return n; };
    const maintenant = new Date().toISOString();

    d.entite.push({ id: 1, nom: 'ABC', email: 'contact@abc.tn', telephone: '+216 71 000 000', cree_le: maintenant });
    d.sequences.entite = 2;

    d.ligne_hierarchique.push({ id: 1, entite_id: 1, parent_ligne_id: null, libelle: 'Direction générale', responsable_id: null, niveau_profondeur: 0, chemin: '1' }, { id: 2, entite_id: 1, parent_ligne_id: 1, libelle: 'Commerciale', responsable_id: null, niveau_profondeur: 1, chemin: '1.2' });
    d.sequences.ligne_hierarchique = 3;

    // --- Personnes, construites À PARTIR DES COMPTES EXISTANTS ---------------
    // Répartition par défaut, dans l'ordre des identifiants de users.json :
    //   1er compte → responsable de structure
    //   2e  compte → manager-observateur
    //   suivants   → collaborateurs
    // Point de départ modifiable en un clic dans Personnes et rôles.
    const utilisateurs = lireUtilisateurs();
    const sources = utilisateurs.map((u) => ({ nom: u.name || u.email, email: u.email }));
    COMPLEMENTS.forEach((cpl) => { if (sources.length < 4) sources.push(cpl); });

    const rolesInitiaux = ['responsable_structure', 'manager_observateur'];
    sources.forEach((s, i) => {
        const role = rolesInitiaux[i] || 'collaborateur';
        d.personne.push({
            id: suivant('personne'),
            entite_id: 1,
            ligne_id: role === 'responsable_structure' ? 1 : 2,
            nom: s.nom,
            email: s.email,
            role,
            actif: true,
            // Les deux premiers valident d'office leur premier cycle : sans cela
            // le séquencement hiérarchique bloquerait toute entrée au dispositif.
            premier_cycle_valide: i < 2
        });
    });

    const responsable = d.personne.find((p) => p.role === 'responsable_structure');
    const observateur = d.personne.find((p) => p.role === 'manager_observateur');
    const collaborateurs = d.personne.filter((p) => p.role === 'collaborateur');

    if (responsable) d.ligne_hierarchique[0].responsable_id = responsable.id;
    if (observateur) d.ligne_hierarchique[1].responsable_id = observateur.id;

    // --- C7 : relation d'observation à part entière -------------------------
    if (observateur) {
        collaborateurs.forEach((p) => {
            d.relation_observation.push({
                id: suivant('relation_observation'),
                observe_id: p.id,
                observateur_id: observateur.id,
                contexte: 'hierarchique',
                periode_debut: '2026-01-01',
                periode_fin: null,
                ligne_id: 2
            });
        });
    }

    // --- Référentiel ---
    d.objet.push({ id: 1, code: 'COM-PRO', libelle: 'Communication professionnelle', registre: 'socle', secteur: null, version: 1, actif: true }, { id: 2, code: 'SIT-DIF', libelle: 'Gestion des situations difficiles', registre: 'socle', secteur: null, version: 1, actif: true }, { id: 3, code: 'ORG-PRI', libelle: 'Organisation et priorisation', registre: 'socle', secteur: null, version: 1, actif: true }, { id: 4, code: 'LEA-ENT', libelle: 'Leadership', registre: 'socle', secteur: null, version: 1, actif: true }, { id: 5, code: 'REL-CLI', libelle: 'Relation client', registre: 'situe', secteur: 'distribution', version: 1, actif: true });
    d.sequences.objet = 6;

    ['Reconnaître', 'Appliquer', 'Réguler', 'Transmettre'].forEach((lib, i) => {
        d.descripteur_niveau.push({
            id: suivant('descripteur_niveau'),
            objet_id: 1,
            niveau: i + 1,
            question_tri: `La personne se situe-t-elle au niveau « ${lib.toLowerCase()} » ?`,
            manifestations: [`À documenter — manifestations du niveau ${i + 1}.`],
            exclusions: [`À documenter — ce qui ne fonde pas le niveau ${i + 1}.`],
            formulation_canal_a: `À ce poste, j'attends de moi de savoir ${lib.toLowerCase()}.`
        });
    });

    d.cycle.push({
        id: 1,
        entite_id: 1,
        numero: 1,
        libelle: 'T3 2026',
        date_debut: '2026-07-01',
        date_fin: '2026-09-30',
        statut: 'ouvert',
        cloture_le: null,
        calcule_le: null,
        restitution_ouverte: false,
        cree_le: maintenant
    });
    d.sequences.cycle = 2;

    // Trois objets par personne — plafond dur.
    collaborateurs.forEach((p) => {
        [1, 2, 3].forEach((o) => {
            d.objet_assigne.push({
                id: suivant('objet_assigne'),
                cycle_id: 1,
                personne_id: p.id,
                objet_id: o,
                valide_par_manager: true
            });
        });
    });

    d.journal_purge.push({
        id: suivant('journal_purge'),
        execute_le: maintenant,
        enregistrements_traites: 0,
        commentaire: 'Initialisation du journal — aucune purge due.'
    });

    console.log(`✅ Évaluation amorcée — ${d.personne.length} personne(s) rattachée(s) aux comptes de l'application :`);
    d.personne.forEach((p) => console.log(`   · ${p.nom} <${p.email}> — ${p.role}`));

    return d;
};

// ---------------------------------------------------------------------------
// Lecture / écriture
// ---------------------------------------------------------------------------
let cache = null;

// Détecte un fichier de la génération précédente ou resté vide.
// Le fichier que vous aviez portait les clés v1 (societes, membres, cycles)
// avec toutes les tables v2 vides : personne introuvable, donc aucun compte
// reconnu et un dashboard admin sans entité.
const fichierObsolete = (data) => {
    if (!data) return true;
    const v1 = Array.isArray(data.membres) || Array.isArray(data.societes) || Array.isArray(data.evaluations);
    const sansPersonnes = !Array.isArray(data.personne) || data.personne.length === 0;
    // Ne rien écraser si des mesures ont déjà été saisies.
    const sansMesure = !Array.isArray(data.cotation_canal_b) || data.cotation_canal_b.length === 0;
    return (v1 || sansPersonnes) && sansMesure;
};

const lire = () => {
    if (cache) return cache;
    try {
        if (!fs.existsSync(FICHIER)) {
            cache = amorcer();
            ecrire(cache);
            return cache;
        }
        const brut = fs.readFileSync(FICHIER, 'utf8');
        const data = brut && brut.trim() ? JSON.parse(brut) : null;

        if (fichierObsolete(data)) {
            // Archivage plutôt que suppression : rien n'est perdu, et la trace
            // reste consultable si une donnée devait être récupérée.
            const archive = FICHIER.replace(/\.json$/, `.obsolete-${Date.now()}.json`);
            try { fs.renameSync(FICHIER, archive); } catch (e) { /* best-effort */ }
            console.log(`♻ evaluation.json obsolète archivé (${path.basename(archive)}) — réamorçage.`);
            cache = amorcer();
            ecrire(cache);
            return cache;
        }

        // Complète les tables absentes sans écraser les données présentes.
        const base = vide();
        TABLES.forEach((t) => { if (!Array.isArray(data[t])) data[t] = []; });
        data.sequences = Object.assign(base.sequences, data.sequences || {});
        cache = data;
        return cache;
    } catch (e) {
        console.error('❌ evaluation.json illisible:', e.message);
        cache = vide();
        return cache;
    }
};

const ecrire = (data) => {
    cache = data;
    try {
        const tmp = FICHIER + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
        fs.renameSync(tmp, FICHIER);
        return true;
    } catch (e) {
        console.error('❌ écriture evaluation.json:', e.message);
        return false;
    }
};

const prochainId = (data, table) => {
    const n = data.sequences[table] || 1;
    data.sequences[table] = n + 1;
    return n;
};

const tracer = (data, acteur, action, cible, details) => {
    data.audit.unshift({
        id: prochainId(data, 'audit'),
        date: new Date().toISOString(),
        acteur: acteur || 'inconnu',
        action,
        cible: cible || '',
        details: details || ''
    });
    if (data.audit.length > 1000) data.audit.length = 1000;
};

module.exports = { lire, ecrire, prochainId, tracer, TABLES, FICHIER };