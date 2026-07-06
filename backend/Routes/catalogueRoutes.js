// backend/Routes/catalogueRoutes.js
// -----------------------------------------------------------------------------
// Module « Catalogue & Génération de Formation par sélection » — OCTOGO
// -----------------------------------------------------------------------------
// Rôle :
//   1. ADMINISTRATION (CRUD complet, réservé au rôle 'admin') :
//        • Formateurs   (nom, photo, bio, domaines, tarif, disponibilité)
//        • Formations   (titre, description, domaine, durée, objectifs, programme)
//        • Créneaux      (dates : formateur + formation + statut Libre/Réservée)
//        • Tarification  (grille de prix + règles de calcul)
//   2. ESPACE CLIENT (lecture + génération) :
//        • Listes dynamiques filtrées en cascade
//        • Créneaux RÉSERVÉS jamais exposés
//        • Calcul du prix 100 % côté serveur (le client ne fixe jamais le prix)
//        • Génération d'une proposition complète, prête à enregistrer
//
// Montage (déjà câblé dans server.js) :
//     const catalogueRoutes = require('./Routes/catalogueRoutes');
//     app.use('/api/catalogue', catalogueRoutes);
//
// Persistance : fichiers JSON dans backend/data (même principe que server.js).
// Réutilise les fichiers existants : formateurs.json, formation.json,
// disponibilites.json, tarifs.json. Crée propositions.json au besoin.
//
// Abréviations :
//   CRUD   = Créer, Lire, Modifier, Supprimer (Create, Read, Update, Delete)
//   HT     = Hors Taxes
//   TTC    = Toutes Taxes Comprises
//   TVA    = Taxe sur la Valeur Ajoutée
//   CNFCPP = Centre National de Formation Continue et de Promotion Professionnelle
//   DT     = Dinar Tunisien
// -----------------------------------------------------------------------------

const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const router = express.Router();

// Secret JWT identique à server.js (cohérence d'authentification).
const JWT_SECRET = 'neuro_science_secret_key_2024';

// ==================== DOSSIERS & FICHIERS ====================
const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(__dirname, '..', 'uploads');
const formateursUploadsDir = path.join(uploadsDir, 'formateurs');
[dataDir, uploadsDir, formateursUploadsDir].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const FORMATEURS = 'formateurs.json';
const FORMATIONS = 'formation.json'; // fichier existant (on étend son schéma)
const CRENEAUX = 'disponibilites.json';
const TARIFS = 'tarifs.json';
const PROPOSITIONS = 'propositions.json';

// ==================== PERSISTANCE JSON (atomique) ====================
const fichier = (nom) => path.join(dataDir, nom);

const readJSON = (nom, parDefaut) => {
    try {
        const p = fichier(nom);
        if (!fs.existsSync(p)) {
            fs.writeFileSync(p, JSON.stringify(parDefaut, null, 2));
            return Array.isArray(parDefaut) ? parDefaut.slice() : { ...parDefaut };
        }
        const d = fs.readFileSync(p, 'utf8');
        return d && d.trim() ? JSON.parse(d) : parDefaut;
    } catch (e) {
        console.error(`❌ lecture ${nom}:`, e.message);
        return parDefaut;
    }
};

// Écriture atomique (tmp -> rename) pour éviter tout fichier à moitié écrit.
const writeJSON = (nom, data) => {
    try {
        const p = fichier(nom);
        const tmp = p + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
        if (fs.existsSync(p)) {
            try { fs.copyFileSync(p, p + '.bak'); } catch (_) { /* best-effort */ }
        }
        fs.renameSync(tmp, p);
        return true;
    } catch (e) {
        console.error(`❌ écriture ${nom}:`, e.message);
        return false;
    }
};

// ==================== HELPERS ====================
let _seq = 0;
const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(_seq++).toString(36)}`;
const toNombre = (v, d = 0) => {
    const n = parseFloat(String(v == null ? '' : v).replace(',', '.').replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : d;
};
const normaliser = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const arrondir = (n) => Math.round((Number(n) + Number.EPSILON) * 1000) / 1000;

// Un créneau est « réservé » (donc masqué côté client) si son statut l'indique.
const estReserve = (c) => {
    const st = normaliser(c && c.statut);
    return st === 'reserve' || st === 'reservee' || st === 'reserved' || st === 'occupe' || st === 'indisponible';
};
const dateCreneau = (c) => c.dateDebut || c.date || null;

// ==================== AUTHENTIFICATION ====================
const decoder = (req) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return null;
    try { return jwt.verify(h.slice(7), JWT_SECRET); } catch { return null; }
};
const optionalAuth = (req, _res, next) => { req.user = decoder(req); next(); };
const requireAdmin = (req, res, next) => {
    req.user = decoder(req);
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Accès réservé à l\u2019administrateur.' });
    }
    next();
};

// ==================== UPLOAD PHOTO FORMATEUR (multer) ====================
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, formateursUploadsDir),
    filename: (req, file, cb) => {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'formateur_' + (req.params.id || 'x') + '_' + suffix + path.extname(file.originalname));
    },
});
const uploadPhoto = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) cb(null, true);
        else cb(new Error('Seules les images sont autorisées (png, jpg, webp).'), false);
    },
    limits: { fileSize: 4 * 1024 * 1024 },
});

// =============================================================================
//                       NORMALISATION DES MODÈLES
// =============================================================================
// Formateur : on conserve la compatibilité avec programmeEngine (categories,
// tarifJour, agrementCNFCPP, indisponibilites, joursReserves) et on ajoute les
// champs métier demandés (photo, bio, tarifSession, disponible).
const normaliserFormateur = (f = {}, base = {}) => ({
    id: base.id || f.id || uid('fmt'),
    nom: f.nom != null ? f.nom : (base.nom || ''),
    photo: f.photo !== undefined ? f.photo : (base.photo || ''),
    bio: f.bio !== undefined ? f.bio : (base.bio || f.description || base.description || ''),
    specialite: f.specialite !== undefined ? f.specialite : (base.specialite || ''),
    // Domaines d'expertise = categories (compat programmeEngine).
    categories: Array.isArray(f.categories) ? f.categories : (base.categories || []),
    tarifJour: f.tarifJour !== undefined ? toNombre(f.tarifJour, 0) : toNombre(base.tarifJour, 0),
    tarifSession: f.tarifSession !== undefined ? toNombre(f.tarifSession, 0) : toNombre(base.tarifSession, 0),
    agrementCNFCPP: f.agrementCNFCPP !== undefined ? !!f.agrementCNFCPP : (base.agrementCNFCPP !== false),
    // Disponibilité globale (interrupteur on/off de l'admin).
    disponible: f.disponible !== undefined ? !!f.disponible : (base.disponible !== undefined ? base.disponible : (base.actif !== false)),
    actif: f.actif !== undefined ? !!f.actif : (base.actif !== false),
    indisponibilites: Array.isArray(f.indisponibilites) ? f.indisponibilites : (base.indisponibilites || []),
    joursReserves: Array.isArray(f.joursReserves) ? f.joursReserves : (base.joursReserves || []),
    email: f.email !== undefined ? f.email : (base.email || ''),
    telephone: f.telephone !== undefined ? f.telephone : (base.telephone || ''),
});

// Formation : schéma existant (nom, categorie, description, dureeJoursParDefaut,
// actif) + champs ajoutés (objectifs[], programmeDetaille[{jour,titre,contenu}]).
const normaliserFormation = (f = {}, base = {}) => ({
    id: base.id || f.id || uid('form'),
    nom: f.nom != null ? f.nom : (base.nom || f.titre || ''),
    categorie: f.categorie != null ? f.categorie : (base.categorie || f.domaine || ''),
    description: f.description !== undefined ? f.description : (base.description || ''),
    dureeJoursParDefaut: f.dureeJoursParDefaut !== undefined ? toNombre(f.dureeJoursParDefaut, 1) : toNombre(base.dureeJoursParDefaut, 1),
    objectifs: Array.isArray(f.objectifs) ? f.objectifs : (base.objectifs || []),
    programmeDetaille: Array.isArray(f.programmeDetaille) ? f.programmeDetaille : (base.programmeDetaille || []),
    fraisAnnexes: Array.isArray(f.fraisAnnexes) ? f.fraisAnnexes : (base.fraisAnnexes || []),
    actif: f.actif !== undefined ? !!f.actif : (base.actif !== false),
});

// Créneau (date disponible) : formateur(s) associé(s), formation concernée
// (optionnelle), lieu, statut (Libre / Réservée).
const normaliserCreneau = (c = {}, base = {}) => {
    let formateurIds = [];
    if (Array.isArray(c.formateurIds)) formateurIds = c.formateurIds;
    else if (c.formateurId) formateurIds = [c.formateurId];
    else if (Array.isArray(base.formateurIds)) formateurIds = base.formateurIds;
    return {
        id: base.id || c.id || uid('disp'),
        dateDebut: c.dateDebut || c.date || base.dateDebut || '',
        dateFin: c.dateFin || c.dateDebut || c.date || base.dateFin || base.dateDebut || '',
        formateurIds,
        formationId: c.formationId !== undefined ? c.formationId : (base.formationId || ''),
        lieu: c.lieu !== undefined ? c.lieu : (base.lieu || ''),
        statut: c.statut || base.statut || 'disponible', // 'disponible' (Libre) | 'reserve' (Réservée)
    };
};

// =============================================================================
//                          MOTEUR DE CALCUL DU PRIX
// =============================================================================
// PRIX AUTORITAIRE : entièrement calculé ici, à partir de la grille tarifaire
// administrée (tarifs.json). Aucune valeur de prix envoyée par le client n'est
// utilisée — seuls des identifiants et des quantités le sont.
function calculerPrix({ formationId, formateurId, dureeJours, participants, modalite }) {
    const T = readJSON(TARIFS, {});
    const formations = readJSON(FORMATIONS, []);
    const formateurs = readJSON(FORMATEURS, []);

    const devise = T.devise || 'DT';
    const tauxTVA = toNombre(T.tauxTVA, 0);
    const tailleGroupe = toNombre(T.tailleGroupeParDefaut, 12) || 12;

    const formation = formations.find((f) => f.id === formationId) || null;
    const formateur = formateurs.find((f) => f.id === formateurId) || null;

    // Durée : valeur transmise, sinon durée par défaut de la formation, plancher 1.
    const duree = Math.max(1, toNombre(dureeJours, toNombre(formation && formation.dureeJoursParDefaut, 1)));
    const nbParticipants = Math.max(0, toNombre(participants, 0));
    const nbGroupes = nbParticipants > 0 ? Math.ceil(nbParticipants / tailleGroupe) : 1;
    const joursFormateur = duree * nbGroupes;

    // Majoration selon la modalité (Présentiel / Hybride / Distanciel).
    const majModaliteMap = T.majorationsModalite || {};
    const majModalite = toNombre(majModaliteMap[modalite], 1) || 1;

    // Règle tarifaire propre à la formation (mode JOUR ou FORFAIT).
    const regleFormation = (T.tarifsParFormation && T.tarifsParFormation[formationId]) || {};
    const mode = (regleFormation.modeTarification || 'JOUR').toUpperCase();

    const lignes = [];
    let sousTotal = 0;
    let tarifJourRetenu = 0;

    if (mode === 'FORFAIT' && toNombre(regleFormation.forfait, 0) > 0) {
        const forfait = toNombre(regleFormation.forfait, 0);
        sousTotal = forfait * nbGroupes * majModalite;
        lignes.push({
            libelle: `Forfait formation${nbGroupes > 1 ? ` × ${nbGroupes} groupe(s)` : ''}`,
            detail: `${forfait.toLocaleString('fr-FR')} ${devise}${majModalite !== 1 ? ` × ${majModalite} (modalité)` : ''}`,
            montant: arrondir(sousTotal),
        });
    } else {
        // Mode JOUR : priorité tarif formation > tarif formateur > tarif par défaut.
        tarifJourRetenu = toNombre(regleFormation.tarifJour, 0) ||
            toNombre(formateur && formateur.tarifJour, 0) ||
            toNombre(T.tarifJourParDefaut, 1200) || 1200;
        sousTotal = tarifJourRetenu * joursFormateur * majModalite;
        lignes.push({
            libelle: `Honoraires formateur (${duree} j × ${nbGroupes} groupe(s))`,
            detail: `${tarifJourRetenu.toLocaleString('fr-FR')} ${devise}/jour${majModalite !== 1 ? ` × ${majModalite} (modalité)` : ''}`,
            montant: arrondir(sousTotal),
        });
    }

    // Remise volume : on retient le palier le plus élevé atteint.
    const paliers = (Array.isArray(T.remisesVolume) ? T.remisesVolume : [])
        .slice()
        .sort((a, b) => toNombre(a.seuilJoursFormateur) - toNombre(b.seuilJoursFormateur));
    let remisePct = 0;
    let remiseLibelle = null;
    for (const p of paliers) {
        if (joursFormateur >= toNombre(p.seuilJoursFormateur)) {
            remisePct = toNombre(p.remisePct, 0);
            remiseLibelle = p.libelle || `Remise volume ${remisePct}%`;
        }
    }
    const remise = arrondir(sousTotal * (remisePct / 100));
    if (remise > 0) lignes.push({ libelle: remiseLibelle, detail: `- ${remisePct}%`, montant: -remise });

    // Autres frais éventuels (définis par l'admin sur la formation).
    let fraisAnnexesTotal = 0;
    const fraisListe = (formation && Array.isArray(formation.fraisAnnexes)) ? formation.fraisAnnexes : [];
    for (const fr of fraisListe) {
        const m = toNombre(fr.montant, 0);
        if (m !== 0) {
            fraisAnnexesTotal += m;
            lignes.push({ libelle: fr.libelle || 'Frais annexes', detail: 'Frais', montant: arrondir(m) });
        }
    }

    // Majoration CNFCPP éventuelle (généralement 0).
    const majCNFCPP = toNombre(T.majorationCNFCPP, 0);
    let majCNFCPPMontant = 0;
    if (majCNFCPP > 0 && formateur && formateur.agrementCNFCPP) {
        majCNFCPPMontant = arrondir(sousTotal * (majCNFCPP / 100));
        lignes.push({ libelle: 'Dossier CNFCPP', detail: `+ ${majCNFCPP}%`, montant: majCNFCPPMontant });
    }

    const totalHT = arrondir(sousTotal - remise + fraisAnnexesTotal + majCNFCPPMontant);
    const montantTVA = arrondir(totalHT * (tauxTVA / 100));
    const totalTTC = arrondir(totalHT + montantTVA);

    return {
        devise,
        modeTarification: mode,
        tarifJourRetenu,
        dureeJours: duree,
        participants: nbParticipants,
        nbGroupes,
        joursFormateur,
        modalite: modalite || 'Présentiel',
        majorationModalite: majModalite,
        remisePct,
        lignes,
        totalHT,
        tauxTVA,
        montantTVA,
        totalTTC,
        totalHTLibelle: `${totalHT.toLocaleString('fr-FR')} ${devise} HT`,
        totalTTCLibelle: `${totalTTC.toLocaleString('fr-FR')} ${devise} TTC`,
    };
}

// =============================================================================
//                         ROUTES PUBLIQUES (CLIENT)
// =============================================================================

// --- Domaines : dérivés des catégories des formations actives ---------------
router.get('/public/domaines', (req, res) => {
    const formations = readJSON(FORMATIONS, []).filter((f) => f.actif !== false);
    const map = new Map();
    for (const f of formations) {
        const cat = (f.categorie || '').trim();
        if (!cat) continue;
        map.set(cat, (map.get(cat) || 0) + 1);
    }
    const domaines = [...map.entries()].map(([nom, nbFormations]) => ({ nom, nbFormations }))
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    res.json({ success: true, domaines });
});

// --- Formations (filtrables par domaine) ------------------------------------
router.get('/public/formations', (req, res) => {
    const domaine = (req.query.domaine || '').trim();
    let formations = readJSON(FORMATIONS, []).filter((f) => f.actif !== false);
    if (domaine) formations = formations.filter((f) => normaliser(f.categorie) === normaliser(domaine));
    res.json({ success: true, formations: formations.map((f) => normaliserFormation(f)) });
});

// --- Formateurs (filtrables par formation/domaine) --------------------------
// Le vivier est filtré : formateurs actifs/disponibles ET qualifiés pour le
// domaine de la formation (categories).
router.get('/public/formateurs', (req, res) => {
    const formations = readJSON(FORMATIONS, []);
    let formateurs = readJSON(FORMATEURS, []).map((f) => normaliserFormateur(f));
    formateurs = formateurs.filter((f) => f.actif !== false && f.disponible !== false);

    const formationId = (req.query.formationId || '').trim();
    const domaineQuery = (req.query.domaine || '').trim();
    let domaine = domaineQuery;
    if (formationId) {
        const form = formations.find((f) => f.id === formationId);
        if (form) domaine = form.categorie;
    }
    if (domaine) {
        formateurs = formateurs.filter((f) =>
            (f.categories || []).map(normaliser).includes(normaliser(domaine)) ||
            normaliser(f.specialite).includes(normaliser(domaine)));
    }
    // On n'expose pas les indisponibilités internes au client.
    const publics = formateurs.map((f) => ({
        id: f.id, nom: f.nom, photo: f.photo, bio: f.bio, specialite: f.specialite,
        categories: f.categories, agrementCNFCPP: f.agrementCNFCPP, tarifJour: f.tarifJour,
    }));
    res.json({ success: true, formateurs: publics });
});

// --- Créneaux disponibles (les RÉSERVÉS ne sont jamais renvoyés) ------------
router.get('/public/creneaux', (req, res) => {
    const formateurId = (req.query.formateurId || '').trim();
    const formationId = (req.query.formationId || '').trim();
    const aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);

    let creneaux = readJSON(CRENEAUX, []).map((c) => normaliserCreneau(c));
    creneaux = creneaux.filter((c) => {
        if (estReserve(c)) return false; // RÈGLE : jamais de créneau réservé
        const d = dateCreneau(c);
        if (d) { const dd = new Date(d); if (!isNaN(dd) && dd < aujourdhui) return false; } // pas de date passée
        if (formateurId) {
            const ok = !c.formateurIds || c.formateurIds.length === 0 || c.formateurIds.includes(formateurId);
            if (!ok) return false;
        }
        if (formationId) {
            // Un créneau sans formation précisée reste éligible à toute formation.
            if (c.formationId && c.formationId !== formationId) return false;
        }
        return true;
    });
    creneaux.sort((a, b) => new Date(dateCreneau(a)) - new Date(dateCreneau(b)));
    res.json({ success: true, creneaux });
});

// --- Calcul du prix (aperçu, sans persistance) ------------------------------
router.post('/public/calculer-prix', (req, res) => {
    try {
        const { formationId, formateurId, dureeJours, participants, modalite } = req.body || {};
        if (!formationId) return res.status(400).json({ success: false, message: 'Formation requise.' });
        const tarification = calculerPrix({ formationId, formateurId, dureeJours, participants, modalite });
        res.json({ success: true, tarification });
    } catch (e) {
        console.error('❌ calculer-prix:', e);
        res.status(500).json({ success: false, message: 'Erreur de calcul du prix.' });
    }
});

// --- Génération d'une proposition complète (persistée) ----------------------
router.post('/public/generer-proposition', optionalAuth, (req, res) => {
    try {
        const body = req.body || {};
        const { client = {}, formationId, formateurId, creneauId, dureeJours, participants, modalite } = body;

        if (!formationId) return res.status(400).json({ success: false, message: 'Veuillez choisir une formation.' });
        if (!formateurId) return res.status(400).json({ success: false, message: 'Veuillez choisir un formateur.' });

        const formations = readJSON(FORMATIONS, []);
        const formateurs = readJSON(FORMATEURS, []).map((f) => normaliserFormateur(f));
        const creneaux = readJSON(CRENEAUX, []).map((c) => normaliserCreneau(c));

        const formation = formations.find((f) => f.id === formationId);
        const formateur = formateurs.find((f) => f.id === formateurId);
        if (!formation) return res.status(404).json({ success: false, message: 'Formation introuvable.' });
        if (!formateur) return res.status(404).json({ success: false, message: 'Formateur introuvable.' });

        let creneau = null;
        if (creneauId) {
            creneau = creneaux.find((c) => c.id === creneauId) || null;
            if (creneau && estReserve(creneau)) {
                return res.status(409).json({ success: false, message: 'Ce créneau vient d\u2019être réservé. Choisissez une autre date.' });
            }
        }

        const duree = Math.max(1, toNombre(dureeJours, toNombre(formation.dureeJoursParDefaut, 1)));
        // PRIX : recalculé côté serveur — la valeur cliente n'est jamais utilisée.
        const tarification = calculerPrix({ formationId, formateurId, dureeJours: duree, participants, modalite });

        const proposition = {
            id: uid('prop'),
            reference: `PROP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            userId: req.user ? req.user.id : null,
            createdAt: new Date().toISOString(),
            statut: 'en_attente',
            client: {
                nom: (client.nom || (req.user && req.user.name) || '').trim(),
                entreprise: (client.entreprise || '').trim(),
                email: (client.email || (req.user && req.user.email) || '').trim(),
                telephone: (client.telephone || '').trim(),
            },
            domaine: formation.categorie || '',
            formation: {
                id: formation.id,
                titre: formation.nom,
                description: formation.description || '',
                domaine: formation.categorie || '',
                objectifs: formation.objectifs || [],
                programmeDetaille: formation.programmeDetaille || [],
            },
            formateur: {
                id: formateur.id, nom: formateur.nom, photo: formateur.photo || '',
                specialite: formateur.specialite || '', bio: formateur.bio || '',
                agrementCNFCPP: !!formateur.agrementCNFCPP,
            },
            dates: creneau ? {
                creneauId: creneau.id, dateDebut: creneau.dateDebut, dateFin: creneau.dateFin, lieu: creneau.lieu || '',
            } : null,
            dureeJours: duree,
            participants: Math.max(0, toNombre(participants, 0)),
            modalite: modalite || 'Présentiel',
            tarification, // contient le détail + totaux HT/TTC
        };

        const recapitulatif = construireRecap(proposition);

        const toutes = readJSON(PROPOSITIONS, []);
        toutes.push({ ...proposition, recapitulatif });
        writeJSON(PROPOSITIONS, toutes);

        res.json({ success: true, propositionId: proposition.id, proposition: { ...proposition, recapitulatif } });
    } catch (e) {
        console.error('❌ generer-proposition:', e);
        res.status(500).json({ success: false, message: 'Erreur lors de la génération de la proposition.' });
    }
});

// Construit un récapitulatif texte lisible, prêt à enregistrer/exporter.
function construireRecap(p) {
    const t = p.tarification || {};
    const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return d; } };
    const datesTxt = p.dates ?
        (p.dates.dateDebut === p.dates.dateFin ? fmtDate(p.dates.dateDebut) : `du ${fmtDate(p.dates.dateDebut)} au ${fmtDate(p.dates.dateFin)}`)
        : 'À convenir';
    return {
        titre: `Proposition de formation — ${p.formation.titre}`,
        reference: p.reference,
        client: `${p.client.nom || '—'}${p.client.entreprise ? ' · ' + p.client.entreprise : ''}`,
        formation: p.formation.titre,
        domaine: p.domaine,
        formateur: p.formateur.nom,
        dates: datesTxt,
        lieu: (p.dates && p.dates.lieu) || 'À convenir',
        duree: `${p.dureeJours} jour(s)`,
        participants: p.participants || 'Non précisé',
        modalite: p.modalite,
        prixHT: t.totalHTLibelle,
        prixTTC: t.totalTTCLibelle,
    };
}

// --- Mes propositions (client connecté) -------------------------------------
router.get('/public/mes-propositions', optionalAuth, (req, res) => {
    if (!req.user) return res.json({ success: true, propositions: [] });
    const toutes = readJSON(PROPOSITIONS, []);
    res.json({ success: true, propositions: toutes.filter((p) => p.userId === req.user.id) });
});

// =============================================================================
//                       ROUTES ADMINISTRATEUR — CRUD
// =============================================================================

// ---------- FORMATEURS ----------
router.get('/admin/formateurs', requireAdmin, (req, res) => {
    res.json({ success: true, formateurs: readJSON(FORMATEURS, []).map((f) => normaliserFormateur(f)) });
});

router.post('/admin/formateurs', requireAdmin, (req, res) => {
    const body = req.body || {};
    if (!body.nom || !body.nom.trim()) return res.status(400).json({ success: false, message: 'Le nom est requis.' });
    const formateurs = readJSON(FORMATEURS, []);
    const nouveau = normaliserFormateur(body, { id: uid('fmt') });
    formateurs.push(nouveau);
    writeJSON(FORMATEURS, formateurs);
    res.json({ success: true, formateur: nouveau });
});

router.put('/admin/formateurs/:id', requireAdmin, (req, res) => {
    const formateurs = readJSON(FORMATEURS, []);
    const i = formateurs.findIndex((f) => f.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, message: 'Formateur introuvable.' });
    formateurs[i] = normaliserFormateur(req.body || {}, formateurs[i]);
    writeJSON(FORMATEURS, formateurs);
    res.json({ success: true, formateur: formateurs[i] });
});

router.delete('/admin/formateurs/:id', requireAdmin, (req, res) => {
    const formateurs = readJSON(FORMATEURS, []);
    const reste = formateurs.filter((f) => f.id !== req.params.id);
    if (reste.length === formateurs.length) return res.status(404).json({ success: false, message: 'Formateur introuvable.' });
    writeJSON(FORMATEURS, reste);
    res.json({ success: true });
});

router.post('/admin/formateurs/:id/photo', requireAdmin, uploadPhoto.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucune image reçue.' });
    const formateurs = readJSON(FORMATEURS, []);
    const i = formateurs.findIndex((f) => f.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, message: 'Formateur introuvable.' });
    const url = `/uploads/formateurs/${req.file.filename}`;
    formateurs[i] = normaliserFormateur({ photo: url }, formateurs[i]);
    writeJSON(FORMATEURS, formateurs);
    res.json({ success: true, photo: url, formateur: formateurs[i] });
});

// ---------- FORMATIONS ----------
router.get('/admin/formations', requireAdmin, (req, res) => {
    res.json({ success: true, formations: readJSON(FORMATIONS, []).map((f) => normaliserFormation(f)) });
});

router.post('/admin/formations', requireAdmin, (req, res) => {
    const body = req.body || {};
    if (!body.nom || !body.nom.trim()) return res.status(400).json({ success: false, message: 'Le titre est requis.' });
    const formations = readJSON(FORMATIONS, []);
    const nouvelle = normaliserFormation(body, { id: uid('form') });
    formations.push(nouvelle);
    writeJSON(FORMATIONS, formations);
    res.json({ success: true, formation: nouvelle });
});

router.put('/admin/formations/:id', requireAdmin, (req, res) => {
    const formations = readJSON(FORMATIONS, []);
    const i = formations.findIndex((f) => f.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, message: 'Formation introuvable.' });
    formations[i] = normaliserFormation(req.body || {}, formations[i]);
    writeJSON(FORMATIONS, formations);
    res.json({ success: true, formation: formations[i] });
});

router.delete('/admin/formations/:id', requireAdmin, (req, res) => {
    const formations = readJSON(FORMATIONS, []);
    const reste = formations.filter((f) => f.id !== req.params.id);
    if (reste.length === formations.length) return res.status(404).json({ success: false, message: 'Formation introuvable.' });
    writeJSON(FORMATIONS, reste);
    res.json({ success: true });
});

// ---------- CRÉNEAUX (DATES DISPONIBLES) ----------
router.get('/admin/creneaux', requireAdmin, (req, res) => {
    res.json({ success: true, creneaux: readJSON(CRENEAUX, []).map((c) => normaliserCreneau(c)) });
});

router.post('/admin/creneaux', requireAdmin, (req, res) => {
    const body = req.body || {};
    if (!(body.dateDebut || body.date)) return res.status(400).json({ success: false, message: 'La date est requise.' });
    const creneaux = readJSON(CRENEAUX, []);
    const nouveau = normaliserCreneau(body, { id: uid('disp') });
    creneaux.push(nouveau);
    writeJSON(CRENEAUX, creneaux);
    res.json({ success: true, creneau: nouveau });
});

router.put('/admin/creneaux/:id', requireAdmin, (req, res) => {
    const creneaux = readJSON(CRENEAUX, []);
    const i = creneaux.findIndex((c) => c.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, message: 'Créneau introuvable.' });
    creneaux[i] = normaliserCreneau(req.body || {}, creneaux[i]);
    writeJSON(CRENEAUX, creneaux);
    res.json({ success: true, creneau: creneaux[i] });
});

router.delete('/admin/creneaux/:id', requireAdmin, (req, res) => {
    const creneaux = readJSON(CRENEAUX, []);
    const reste = creneaux.filter((c) => c.id !== req.params.id);
    if (reste.length === creneaux.length) return res.status(404).json({ success: false, message: 'Créneau introuvable.' });
    writeJSON(CRENEAUX, reste);
    res.json({ success: true });
});

// ---------- TARIFICATION ----------
router.get('/admin/tarifs', requireAdmin, (req, res) => {
    res.json({ success: true, tarifs: readJSON(TARIFS, {}) });
});

router.put('/admin/tarifs', requireAdmin, (req, res) => {
    const actuel = readJSON(TARIFS, {});
    const maj = { ...actuel, ...(req.body || {}), miseAJour: new Date().toISOString().slice(0, 10) };
    writeJSON(TARIFS, maj);
    res.json({ success: true, tarifs: maj });
});

// ---------- PROPOSITIONS (suivi admin) ----------
router.get('/admin/propositions', requireAdmin, (req, res) => {
    res.json({ success: true, propositions: readJSON(PROPOSITIONS, []) });
});

router.put('/admin/propositions/:id', requireAdmin, (req, res) => {
    const props = readJSON(PROPOSITIONS, []);
    const i = props.findIndex((p) => p.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, message: 'Proposition introuvable.' });
    const champsAutorises = ['statut', 'commentaire'];
    for (const k of champsAutorises) if (req.body[k] !== undefined) props[i][k] = req.body[k];

    // Si la proposition est acceptée, on réserve automatiquement le créneau lié.
    if (normaliser(req.body.statut) === 'acceptee' && props[i].dates && props[i].dates.creneauId) {
        const creneaux = readJSON(CRENEAUX, []);
        const ci = creneaux.findIndex((c) => c.id === props[i].dates.creneauId);
        if (ci !== -1) { creneaux[ci].statut = 'reserve'; writeJSON(CRENEAUX, creneaux); }
    }
    writeJSON(PROPOSITIONS, props);
    res.json({ success: true, proposition: props[i] });
});

router.delete('/admin/propositions/:id', requireAdmin, (req, res) => {
    const props = readJSON(PROPOSITIONS, []);
    const reste = props.filter((p) => p.id !== req.params.id);
    writeJSON(PROPOSITIONS, reste);
    res.json({ success: true });
});

module.exports = router;
