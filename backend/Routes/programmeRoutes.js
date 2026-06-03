// backend/Routes/programmeRoutes.js
// -----------------------------------------------------------------------------
// Routeur « Génération de Programme » + formateurs & disponibilités.
// Autonome : lit/écrit ses propres fichiers JSON dans backend/data, réutilise
// le secret JWT du serveur. À monter dans server.js :
//     const programmeRoutes = require('./Routes/programmeRoutes');
//     app.use('/api/programmes', programmeRoutes);
// -----------------------------------------------------------------------------
const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { genererProgrammeAnnuel, recommanderFormateurs, formateurDisponiblePourMois } = require('../programmeEngine');
const { enrichirFormateursAvecAgenda, estOccupeMaintenant, fetchBusyIntervals } = require('../googleAgendaSync');

const router = express.Router();
const JWT_SECRET = 'neuro_science_secret_key_2024'; // identique à server.js
const dataDir = path.join(__dirname, '..', 'data');

// ---- persistance JSON (même principe que server.js) ----
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
    try { fs.writeFileSync(fichier(nom), JSON.stringify(data, null, 2)); return true; } catch (e) { console.error(`❌ écriture ${nom}:`, e.message); return false; }
};

const FORMATEURS = 'formateurs.json';
const PROGRAMMES = 'programmes.json';

// ---- middlewares d'authentification ----
const decoder = (req) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return null;
    try { return jwt.verify(h.slice(7), JWT_SECRET); } catch { return null; }
};
const optionalAuth = (req, _res, next) => { req.user = decoder(req);
    next(); };
const requireAuth = (req, res, next) => { req.user = decoder(req); if (!req.user) return res.status(401).json({ success: false, message: 'Authentification requise.' });
    next(); };
const requireAdmin = (req, res, next) => { req.user = decoder(req); if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé à l\u2019administrateur.' });
    next(); };

// =============================================================================
// POST /api/programmes/generer   (auth optionnelle)
// Body = état du formulaire. Génère le programme + recommande des formateurs
// disponibles, puis persiste pour l'utilisateur connecté.
// =============================================================================
router.post('/generer', optionalAuth, async(req, res) => {
    try {
        const state = req.body || {};
        // Disponibilités en temps réel : fusion des créneaux Google Agenda (iCal).
        const formateurs = await enrichirFormateursAvecAgenda(readJSON(FORMATEURS, []));
        const resultat = genererProgrammeAnnuel(state, formateurs);

        const enregistrement = {
            id: `prog_${Date.now()}`,
            userId: req.user ? req.user.id : null,
            userEmail: req.user ? req.user.email : (state.entreprise && state.entreprise.email) || null,
            entreprise: resultat.meta.entreprise,
            annee: resultat.meta.annee,
            createdAt: new Date().toISOString(),
            etatSaisi: state,
            resultat,
        };
        const tous = readJSON(PROGRAMMES, []);
        tous.push(enregistrement);
        writeJSON(PROGRAMMES, tous);

        res.json({ success: true, programmeId: enregistrement.id, resultat });
    } catch (e) {
        console.error('❌ /generer:', e);
        res.status(500).json({ success: false, message: 'Erreur lors de la génération.' });
    }
});

// =============================================================================
// GET /api/programmes/disponibilites?annee=2026&mois=2&categorie=MANAGEMENT
// Formateurs disponibles pour un mois / une catégorie donnés.
// =============================================================================
router.get('/disponibilites', optionalAuth, async(req, res) => {
    const annee = parseInt(req.query.annee, 10) || new Date().getFullYear();
    const mois = parseInt(req.query.mois, 10) || 1;
    const categorie = (req.query.categorie || '').toUpperCase();
    const formateurs = await enrichirFormateursAvecAgenda(readJSON(FORMATEURS, []));
    const dispo = formateurs.filter((f) => {
        const okCat = !categorie || (f.categories || []).map((c) => c.toUpperCase()).includes(categorie);
        return okCat && formateurDisponiblePourMois(f, annee, mois);
    });
    res.json({ success: true, annee, mois, categorie, formateurs: dispo });
});

// GET /api/programmes/formateurs/:id/temps-reel — occupé maintenant ? (live)
router.get('/formateurs/:id/temps-reel', optionalAuth, async(req, res) => {
    const formateurs = readJSON(FORMATEURS, []);
    const f = formateurs.find((x) => x.id === req.params.id);
    if (!f) return res.status(404).json({ success: false, message: 'Formateur introuvable.' });
    const occupe = await estOccupeMaintenant(f);
    res.json({ success: true, formateurId: f.id, nom: f.nom, occupeMaintenant: occupe, agendaSynchronise: !!f.icalUrl });
});

// =============================================================================
// GET /api/programmes/formateurs   — liste des formateurs
// =============================================================================
router.get('/formateurs', optionalAuth, (req, res) => {
    res.json({ success: true, formateurs: readJSON(FORMATEURS, []) });
});

// =============================================================================
// GET /api/programmes/mes-programmes   (auth) — programmes de l'utilisateur
// =============================================================================
router.get('/mes-programmes', requireAuth, (req, res) => {
    const tous = readJSON(PROGRAMMES, []);
    res.json({ success: true, programmes: tous.filter((p) => p.userId === req.user.id) });
});

// =============================================================================
// ADMIN — création / mise à jour de formateurs
// =============================================================================
router.post('/formateurs', requireAdmin, (req, res) => {
    const f = req.body || {};
    if (!f.nom) return res.status(400).json({ success: false, message: 'Le nom est requis.' });
    const formateurs = readJSON(FORMATEURS, []);
    const nouveau = {
        id: f.id || `fmt_${Date.now()}`,
        nom: f.nom,
        specialites: f.specialites || [],
        categories: f.categories || [],
        agrementCNFCPP: f.agrementCNFCPP !== false,
        tarifJour: f.tarifJour || 1200,
        bio: f.bio || '',
        indisponibilites: f.indisponibilites || [],
        joursReserves: f.joursReserves || [],
    };
    formateurs.push(nouveau);
    writeJSON(FORMATEURS, formateurs);
    res.json({ success: true, formateur: nouveau });
});

router.put('/formateurs/:id', requireAdmin, (req, res) => {
    const formateurs = readJSON(FORMATEURS, []);
    const i = formateurs.findIndex((f) => f.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, message: 'Formateur introuvable.' });
    formateurs[i] = Object.assign({}, formateurs[i], req.body, { id: formateurs[i].id });
    writeJSON(FORMATEURS, formateurs);
    res.json({ success: true, formateur: formateurs[i] });
});

// =============================================================================
// POST /api/programmes/sync-agenda   (admin)
// Pont de synchronisation : ingère des créneaux occupés pour un formateur.
// Un job planifié ou le connecteur Google Calendar peut appeler cette route
// pour pousser les indisponibilités réelles dans la couche de disponibilités.
// Body : { formateurId, indisponibilites:[{debut,fin}], remplacer:bool }
// =============================================================================
router.post('/sync-agenda', requireAdmin, (req, res) => {
    const { formateurId, indisponibilites = [], remplacer = true } = req.body || {};
    const formateurs = readJSON(FORMATEURS, []);
    const i = formateurs.findIndex((f) => f.id === formateurId);
    if (i === -1) return res.status(404).json({ success: false, message: 'Formateur introuvable.' });
    formateurs[i].indisponibilites = remplacer ?
        indisponibilites :
        [...(formateurs[i].indisponibilites || []), ...indisponibilites];
    writeJSON(FORMATEURS, formateurs);
    res.json({ success: true, formateur: formateurs[i] });
});

// =============================================================================
// POST /api/programmes/formateurs/:id/connecter-agenda   (admin)
// Connecte l'URL iCal secrète de Google Agenda à un formateur et la valide
// immédiatement (lecture test). Body : { icalUrl }
// =============================================================================
router.post('/formateurs/:id/connecter-agenda', requireAdmin, async(req, res) => {
    const { icalUrl } = req.body || {};
    if (!icalUrl || !/^https?:\/\//i.test(icalUrl)) {
        return res.status(400).json({ success: false, message: 'URL iCal invalide.' });
    }
    const formateurs = readJSON(FORMATEURS, []);
    const i = formateurs.findIndex((f) => f.id === req.params.id);
    if (i === -1) return res.status(404).json({ success: false, message: 'Formateur introuvable.' });

    // Validation : on tente une lecture immédiate de l'agenda.
    const intervals = await fetchBusyIntervals(icalUrl);
    formateurs[i].icalUrl = icalUrl;
    writeJSON(FORMATEURS, formateurs);
    res.json({ success: true, formateur: formateurs[i], creneauxDetectes: intervals.length, message: 'Agenda connecté.' });
});

module.exports = router;