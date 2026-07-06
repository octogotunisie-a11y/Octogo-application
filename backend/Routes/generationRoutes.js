// backend/Routes/generationRoutes.js
// -----------------------------------------------------------------------------
// Routeur « Génération de Programme » — v2.
//
// Le client ne renseigne que : thème, nombre de participants, informations
// entreprise, objectifs, quelques infos complémentaires. TOUT le reste
// (contenu pédagogique, formateur, agenda, devis, facture, présence,
// évaluations, KPI, étude d'impact) est généré AUTOMATIQUEMENT dès la création
// de la demande, par le moteur de SIMULATION (backend/simulationEngine.js) qui
// lit des fichiers de config (backend/data/simulation/*.json).
//
// TODO IA : le jour où le modèle est branché, seul simulationEngine.js doit
// être modifié (mêmes signatures) — aucune modification de ce routeur ni du
// frontend n'est nécessaire.
//
// À monter dans server.js :
//     const generationRoutes = require('./Routes/generationRoutes');
//     app.use('/api/generation', generationRoutes);
// -----------------------------------------------------------------------------
const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const engine = require('../simulationEngine');
const docGen = require('../documentGenerator');

const router = express.Router();
const JWT_SECRET = 'neuro_science_secret_key_2024'; // identique à server.js
const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(__dirname, '..', 'uploads', 'generation');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ---- persistance JSON (même principe que server.js / programmeRoutes.js) ----
const fichier = (nom) => path.join(dataDir, nom);
const readJSON = (nom, parDefaut) => {
    try {
        const p = fichier(nom);
        if (!fs.existsSync(p)) { fs.writeFileSync(p, JSON.stringify(parDefaut, null, 2)); return parDefaut; }
        const d = fs.readFileSync(p, 'utf8');
        return d ? JSON.parse(d) : parDefaut;
    } catch (e) { console.error(`❌ lecture ${nom}:`, e.message); return parDefaut; }
};
const writeJSON = (nom, data) => {
    try { fs.writeFileSync(fichier(nom), JSON.stringify(data, null, 2)); return true; }
    catch (e) { console.error(`❌ écriture ${nom}:`, e.message); return false; }
};

const REQUESTS = 'generationRequests.json';

// ---- middleware d'authentification (identique aux autres routeurs) ----
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token non fourni' });
        }
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        console.error('❌ Erreur token (generation):', error.message);
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};

// ---- upload du document décrivant le besoin (étape 2 — INCHANGÉE) ----
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `besoin_${req.params.id}_${suffix}${path.extname(file.originalname)}`);
    },
});
const TYPES_AUTORISES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (TYPES_AUTORISES.includes(file.mimetype) || /\.(pdf|docx?|txt)$/i.test(file.originalname)) return cb(null, true);
        cb(new Error('Format non supporté (PDF, DOCX, DOC, TXT uniquement)'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
});

const MODULE_KEYS = ['formateur', 'programme', 'duree', 'agenda', 'devis', 'facture', 'fiche', 'presence', 'evaluation', 'kpi', 'impact'];
// ^ ordre de dépendance : formateur/programme d'abord (agenda a besoin du formateur,
//   devis a besoin de la durée du programme, facture a besoin du devis, fiche = programme).

function documentsVides() {
    const docs = {};
    MODULE_KEYS.forEach((k) => { docs[k] = { status: 'vide', data: null, generatedAt: null, version: 0 }; });
    return docs;
}

// =============================================================================
// GÉNÉRATION D'UN MODULE — délègue entièrement au moteur de simulation.
// Réutilise les modules déjà générés de la même demande pour rester cohérent
// (ex : le devis doit utiliser le même formateur/durée que le programme).
// =============================================================================
function genererUnModule(moduleKey, demande) {
    const details = demande.details || {};
    const theme = details.theme;
    const docs = demande.documents;

    switch (moduleKey) {
        case 'formateur':
            return engine.genererFormateur(theme);
        case 'programme':
            return engine.genererProgramme(theme, details);
        case 'duree':
            return engine.genererDuree(docs.programme?.data || engine.genererProgramme(theme, details));
        case 'agenda': {
            const formateurId = docs.formateur?.data?.formateurId || engine.genererFormateur(theme).formateurId;
            return engine.genererAgenda(formateurId);
        }
        case 'devis':
            return engine.genererDevis(theme, details, docs.programme?.data || engine.genererProgramme(theme, details));
        case 'facture':
            return engine.genererFacture(theme, details, docs.devis?.data || engine.genererDevis(theme, details, docs.programme?.data));
        case 'fiche':
            return docs.programme?.data || engine.genererProgramme(theme, details);
        case 'presence':
            return engine.genererPresence(details);
        case 'evaluation':
            return engine.genererEvaluation();
        case 'kpi':
            return engine.genererKPI();
        case 'impact':
            return engine.genererImpact(theme, details);
        default:
            return {};
    }
}

// Génère automatiquement TOUS les modules d'une demande, dans l'ordre de
// dépendance, et retourne l'objet `documents` complet. Appelé une seule fois
// à la création de la demande (simulation immédiate de la réponse IA).
function genererTousLesModules(demande) {
    demande.documents = documentsVides();
    MODULE_KEYS.forEach((key) => {
        const data = genererUnModule(key, demande);
        demande.documents[key] = { status: 'genere', data, generatedAt: new Date().toISOString(), version: 1 };
    });
    return demande.documents;
}

// =============================================================================
// THÈMES (vocabulaire de référence pour le formulaire étape 3)
// =============================================================================

// GET /api/generation/themes — pas d'auth requise (liste de référence publique)
router.get('/themes', (req, res) => {
    const { themes } = engine.config();
    res.json({ success: true, themes });
});

// =============================================================================
// CRUD des demandes de génération
// =============================================================================

// POST /api/generation/requests
// Crée la demande puis GÉNÈRE IMMÉDIATEMENT tous les documents (simulation).
router.post('/requests', authenticateToken, (req, res) => {
    try {
        const { type, description, details } = req.body;
        if (!type) return res.status(400).json({ success: false, message: 'Le type de demande est requis.' });
        if (!details || !details.theme) return res.status(400).json({ success: false, message: 'Le thème de la formation est requis.' });

        const demandes = readJSON(REQUESTS, []);
        const nouvelle = {
            id: Date.now(),
            userId: req.user.id,
            userName: req.user.name,
            type,
            description: description || { mode: 'text', texte: '' },
            details: details || {},
            documents: documentsVides(),
            statut: 'brouillon',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Simulation immédiate de la génération IA pour tous les modules.
        genererTousLesModules(nouvelle);
        nouvelle.statut = 'generee';

        demandes.push(nouvelle);
        writeJSON(REQUESTS, demandes);

        res.status(201).json({ success: true, demande: nouvelle });
    } catch (e) {
        console.error('🔥 Erreur création demande génération:', e.message);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET /api/generation/requests
router.get('/requests', authenticateToken, (req, res) => {
    try {
        const demandes = readJSON(REQUESTS, []);
        const filtrees = req.user.role === 'admin' ? demandes : demandes.filter((d) => d.userId === req.user.id);
        res.json({ success: true, demandes: filtrees, total: filtrees.length });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

function chargerDemande(req, res) {
    const demandes = readJSON(REQUESTS, []);
    const idx = demandes.findIndex((d) => d.id === parseInt(req.params.id, 10));
    if (idx === -1) { res.status(404).json({ success: false, message: 'Demande non trouvée' }); return null; }
    if (req.user.role !== 'admin' && demandes[idx].userId !== req.user.id) {
        res.status(403).json({ success: false, message: 'Accès non autorisé' }); return null;
    }
    return { demandes, idx };
}

// GET /api/generation/requests/:id
router.get('/requests/:id', authenticateToken, (req, res) => {
    const ctx = chargerDemande(req, res);
    if (!ctx) return;
    res.json({ success: true, demande: ctx.demandes[ctx.idx] });
});

// PUT /api/generation/requests/:id (mise à jour générique)
router.put('/requests/:id', authenticateToken, (req, res) => {
    const ctx = chargerDemande(req, res);
    if (!ctx) return;
    const { demandes, idx } = ctx;
    const { details, description, statut } = req.body;

    if (details) demandes[idx].details = { ...demandes[idx].details, ...details };
    if (description) demandes[idx].description = { ...demandes[idx].description, ...description };
    if (statut) demandes[idx].statut = statut;
    demandes[idx].updatedAt = new Date().toISOString();

    writeJSON(REQUESTS, demandes);
    res.json({ success: true, demande: demandes[idx] });
});

// DELETE /api/generation/requests/:id
router.delete('/requests/:id', authenticateToken, (req, res) => {
    const ctx = chargerDemande(req, res);
    if (!ctx) return;
    const { demandes, idx } = ctx;
    demandes.splice(idx, 1);
    writeJSON(REQUESTS, demandes);
    res.json({ success: true, message: 'Demande supprimée' });
});

// POST /api/generation/requests/:id/upload — INCHANGÉ (étape 2)
router.post('/requests/:id/upload', authenticateToken, upload.single('document'), (req, res) => {
    const ctx = chargerDemande(req, res);
    if (!ctx) { if (req.file) fs.unlinkSync(req.file.path); return; }
    const { demandes, idx } = ctx;

    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun document fourni' });

    demandes[idx].description = {
        ...demandes[idx].description,
        mode: 'upload',
        fichierNom: req.file.originalname,
        fichierChemin: `/uploads/generation/${req.file.filename}`,
    };
    demandes[idx].updatedAt = new Date().toISOString();
    writeJSON(REQUESTS, demandes);

    res.json({ success: true, message: 'Document importé avec succès', fichier: demandes[idx].description });
});

// =============================================================================
// MODULES (cartes de l'espace de travail) — régénération individuelle
// =============================================================================

// POST /api/generation/requests/:id/modules/:moduleKey/generate
// Régénère UN module (ex: Régénérer sur une carte). Réutilise les autres
// modules déjà générés pour rester cohérent (ex: devis réutilise le programme).
router.post('/requests/:id/modules/:moduleKey/generate', authenticateToken, (req, res) => {
    const ctx = chargerDemande(req, res);
    if (!ctx) return;
    const { demandes, idx } = ctx;
    const { moduleKey } = req.params;

    if (!MODULE_KEYS.includes(moduleKey)) {
        return res.status(400).json({ success: false, message: 'Module inconnu' });
    }

    const data = genererUnModule(moduleKey, demandes[idx]);
    const version = (demandes[idx].documents[moduleKey]?.version || 0) + 1;

    demandes[idx].documents[moduleKey] = { status: 'genere', data, generatedAt: new Date().toISOString(), version };
    demandes[idx].updatedAt = new Date().toISOString();
    writeJSON(REQUESTS, demandes);

    res.json({ success: true, data, version });
});

// PUT /api/generation/requests/:id/modules/:moduleKey — enregistrer une édition manuelle
router.put('/requests/:id/modules/:moduleKey', authenticateToken, (req, res) => {
    const ctx = chargerDemande(req, res);
    if (!ctx) return;
    const { demandes, idx } = ctx;
    const { moduleKey } = req.params;
    const { data } = req.body;

    if (!demandes[idx].documents[moduleKey]) {
        return res.status(404).json({ success: false, message: 'Module non initialisé' });
    }

    demandes[idx].documents[moduleKey].data = data;
    demandes[idx].documents[moduleKey].status = 'modifie';
    demandes[idx].updatedAt = new Date().toISOString();
    writeJSON(REQUESTS, demandes);

    res.json({ success: true, document: demandes[idx].documents[moduleKey] });
});

// PUT /api/generation/requests/:id/modules/:moduleKey/valider
router.put('/requests/:id/modules/:moduleKey/valider', authenticateToken, (req, res) => {
    const ctx = chargerDemande(req, res);
    if (!ctx) return;
    const { demandes, idx } = ctx;
    const { moduleKey } = req.params;

    if (!demandes[idx].documents[moduleKey]) {
        return res.status(404).json({ success: false, message: 'Module non initialisé' });
    }
    demandes[idx].documents[moduleKey].status = 'valide';
    demandes[idx].updatedAt = new Date().toISOString();
    writeJSON(REQUESTS, demandes);

    res.json({ success: true });
});

// GET /api/generation/requests/:id/modules/:moduleKey/download
// Génère un VRAI fichier PDF pour les documents destinés à être imprimés /
// partagés (fiche, devis, facture, présence, évaluations, KPI, impact).
// Les autres modules (programme brut, formateur, agenda, durée) restent en
// export JSON — leur contenu est déjà consultable/éditable dans la carte, et
// « fiche » fournit la version PDF du programme.
const MODULES_PDF = ['fiche', 'devis', 'facture', 'presence', 'evaluation', 'kpi', 'impact'];

router.get('/requests/:id/modules/:moduleKey/download', authenticateToken, (req, res) => {
    const ctx = chargerDemande(req, res);
    if (!ctx) return;
    const { demandes, idx } = ctx;
    const { moduleKey } = req.params;
    const demande = demandes[idx];
    const doc = demande.documents[moduleKey];

    if (!doc || !doc.data) return res.status(404).json({ success: false, message: 'Aucune donnée à télécharger pour ce module' });

    if (!MODULES_PDF.includes(moduleKey)) {
        // Export JSON brut (modules non destinés à l'impression).
        res.setHeader('Content-Disposition', `attachment; filename="${moduleKey}_${req.params.id}.json"`);
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify(doc.data, null, 2));
    }

    // ---- génération PDF réelle ----
    const { themes } = engine.config();
    const themeLabel = engine.labelTheme(demande.details?.theme, themes);
    res.setHeader('Content-Disposition', `attachment; filename="${moduleKey}_${req.params.id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');

    let titrePDF = 'Document';
    const pdf = (() => {
        switch (moduleKey) {
            case 'fiche':
                titrePDF = 'Fiche Programme';
                return (d) => docGen.genererFicheProgrammePDF(d, doc.data);
            case 'devis':
                titrePDF = 'Devis';
                return (d) => docGen.genererDevisPDF(d, doc.data);
            case 'facture':
                titrePDF = 'Facture';
                return (d) => docGen.genererFacturePDF(d, doc.data);
            case 'presence':
                titrePDF = 'Feuille de présence';
                return (d) => docGen.genererPresencePDF(d, doc.data, {
                    formation: `Formation — ${themeLabel}`, societe: demande.details?.societe, date: demande.details?.datePrevue,
                });
            case 'evaluation':
                titrePDF = 'Évaluations';
                return (d) => {
                    docGen.genererEvaluationPDF(d, doc.data, 'avant');
                    d.addPage();
                    docGen.genererEvaluationPDF(d, doc.data, 'apres');
                };
            case 'kpi':
                titrePDF = 'KPI (Indicateur Clé de Performance)';
                return (d) => docGen.genererKPIPDF(d, doc.data);
            case 'impact':
                titrePDF = 'Étude d\u2019impact';
                return (d) => docGen.genererImpactPDF(d, doc.data);
            default:
                return () => {};
        }
    })();

    const pdfDoc = docGen.nouveauDocument(titrePDF);
    pdfDoc.pipe(res);
    pdf(pdfDoc);
    pdfDoc.end();
});

// GET /api/generation/cv/:formateurId — télécharge le CV (PDF) d'un formateur
// du vivier de simulation (backend/data/simulation/cv/). TODO IA / TODO admin :
// à terme, ce vivier sera le même que le catalogue formateurs réel de l'admin
// (backend/data/formateurs.json + backend/uploads) — ce endpoint restera valide.
router.get('/cv/:formateurId', authenticateToken, (req, res) => {
    const { formateurs } = engine.config();
    const f = formateurs.find((x) => x.id === req.params.formateurId);
    if (!f || !f.cv) return res.status(404).json({ success: false, message: 'CV non trouvé' });

    const cvPath = path.join(dataDir, 'simulation', 'cv', f.cv);
    if (!fs.existsSync(cvPath)) return res.status(404).json({ success: false, message: 'Fichier CV manquant sur le serveur' });

    res.download(cvPath, f.cv);
});

module.exports = router;
