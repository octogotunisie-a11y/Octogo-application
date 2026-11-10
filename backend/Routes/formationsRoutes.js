// backend/Routes/formationsRoutes.js
// -----------------------------------------------------------------------------
// Module Formations — de la création par l'admin jusqu'à l'observation N+1.
//
// Cycle :
//   1. Admin crée une formation pour une société
//   2. Admin génère les tests (IA locale)
//   3. Admin envoie la formation aux clients
//   4. Client passe les tests (pré + post)
//   5. Observateur N+1 complète les observations
//   6. Admin collecte, génère rapport + KPI, envoie aux destinataires
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const moteurIA = require('./moteurIA');

const JWT_SECRET = 'neuro_science_secret_key_2024';
const dataDir = path.join(__dirname, '..', 'data');
const formationsFile = path.join(dataDir, 'formations.json');
const testsFile = path.join(dataDir, 'tests.json');
const reponsesFile = path.join(dataDir, 'reponses_tests.json');
const observationsFile = path.join(dataDir, 'observations.json');
const rapportsFile = path.join(dataDir, 'rapports.json');

// ---------------------------------------------------------------- Helpers JSON
function readJSON(file) {
  try {
    if (!fs.existsSync(file)) { fs.writeFileSync(file, '[]'); return []; }
    const raw = fs.readFileSync(file, 'utf8');
    return raw && raw.trim() ? JSON.parse(raw) : [];
  } catch (e) { console.error(`Lecture ${path.basename(file)}:`, e.message); return []; }
}
function writeJSON(file, data) {
  try {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
    return true;
  } catch (e) { console.error(`Écriture ${path.basename(file)}:`, e.message); return false; }
}

// ---------------------------------------------------------------- Auth
function authenticateToken(req, res, next) {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token non fourni' });
    }
    req.user = jwt.verify(h.split(' ')[1], JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès administrateur requis' });
  }
  next();
}

// =========================================================================
// FORMATIONS (admin + client)
// =========================================================================

// GET /api/formations — liste filtrée selon rôle
router.get('/', authenticateToken, (req, res) => {
  try {
    const formations = readJSON(formationsFile);
    const users = readJSON(path.join(dataDir, 'users.json'));

    if (req.user.role === 'admin') {
      return res.json({ success: true, formations });
    }

    const me = users.find(u => u.id === req.user.id);
    const maCompany = (me?.company || '').trim().toLowerCase();
    if (!maCompany) return res.json({ success: true, formations: [] });

    const visibles = formations.filter(f =>
      (f.organisation || '').trim().toLowerCase() === maCompany
      && f.statut !== 'brouillon'
    );
    res.json({ success: true, formations: visibles });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/formations — admin crée une formation
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { titre, theme, organisation, duree, participants, dateDebut, dateFin } = req.body;
    if (!titre || !organisation) {
      return res.status(400).json({ success: false, message: 'Titre et organisation requis' });
    }

    const formations = readJSON(formationsFile);
    const id = formations.length > 0 ? Math.max(...formations.map(f => f.id)) + 1 : 1;

    const formation = {
      id,
      titre,
      theme: theme || '',
      organisation,
      duree: duree || '—',
      participants: parseInt(participants) || 0,
      dateDebut: dateDebut || null,
      dateFin: dateFin || null,
      statut: 'brouillon',
      creePar: req.user.id,
      creeLe: new Date().toISOString(),
      envoyeeLe: null,
      observateurId: null,
      destinataires: []
    };

    formations.push(formation);
    writeJSON(formationsFile, formations);

    res.status(201).json({ success: true, formation });
  } catch (e) {
    console.error('POST /formations:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /api/formations/:id — admin modifie
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const formations = readJSON(formationsFile);
    const idx = formations.findIndex(f => String(f.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Formation introuvable' });

    Object.assign(formations[idx], req.body, { modifieLe: new Date().toISOString() });
    writeJSON(formationsFile, formations);

    res.json({ success: true, formation: formations[idx] });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/formations/:id
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const formations = readJSON(formationsFile);
    const filtered = formations.filter(f => String(f.id) !== String(req.params.id));
    writeJSON(formationsFile, filtered);
    res.json({ success: true, message: 'Formation supprimée' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// =========================================================================
// GÉNÉRATION IA DES TESTS (admin)
// =========================================================================

// POST /api/formations/:id/generer-tests
router.post('/:id/generer-tests', authenticateToken, requireAdmin, (req, res) => {
  try {
    const formations = readJSON(formationsFile);
    const formation = formations.find(f => String(f.id) === String(req.params.id));
    if (!formation) return res.status(404).json({ success: false, message: 'Formation introuvable' });

    const tests = readJSON(testsFile);
    const testsFiltres = tests.filter(t => String(t.formationId) !== String(formation.id));

    for (const type of ['pre', 'post']) {
      const questions = moteurIA.genererQuestionsTest(
        formation.titre, formation.theme, type, 10
      );
      testsFiltres.push({
        id: Date.now() + (type === 'post' ? 1 : 0),
        formationId: formation.id,
        type,
        questions,
        genereLe: new Date().toISOString()
      });
    }

    writeJSON(testsFile, testsFiltres);

    const idx = formations.findIndex(f => String(f.id) === String(formation.id));
    formations[idx].statut = 'prete';
    formations[idx].testsGeneresLe = new Date().toISOString();
    writeJSON(formationsFile, formations);

    res.json({
      success: true,
      message: 'Tests pré et post générés',
      tests: testsFiltres.filter(t => String(t.formationId) === String(formation.id))
    });
  } catch (e) {
    console.error('POST /formations/:id/generer-tests:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/formations/:id/generer-questions-observateur
router.post('/:id/generer-questions-observateur', authenticateToken, requireAdmin, (req, res) => {
  try {
    const formations = readJSON(formationsFile);
    const formation = formations.find(f => String(f.id) === String(req.params.id));
    if (!formation) return res.status(404).json({ success: false, message: 'Formation introuvable' });

    const questions = moteurIA.genererQuestionsObservation(
      formation.titre, formation.theme, 2
    );

    const idx = formations.findIndex(f => String(f.id) === String(formation.id));
    formations[idx].questionsObservation = questions;
    writeJSON(formationsFile, formations);

    res.json({ success: true, questions });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// =========================================================================
// ENVOI AUX CLIENTS (admin)
// =========================================================================

// POST /api/formations/:id/envoyer
router.post('/:id/envoyer', authenticateToken, requireAdmin, (req, res) => {
  try {
    const formations = readJSON(formationsFile);
    const idx = formations.findIndex(f => String(f.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Formation introuvable' });

    const formation = formations[idx];
    if (formation.statut === 'brouillon') {
      return res.status(400).json({
        success: false,
        message: 'Générez les tests avant d\'envoyer la formation.'
      });
    }

    const users = readJSON(path.join(dataDir, 'users.json'));
    const orgNorm = (formation.organisation || '').trim().toLowerCase();
    const destinataires = users.filter(u =>
      u.role === 'client' &&
      (u.company || '').trim().toLowerCase() === orgNorm
    );

    if (destinataires.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun client rattaché à cette organisation.'
      });
    }

    formation.statut = 'envoyee';
    formation.envoyeeLe = new Date().toISOString();
    formation.envoyeeA = destinataires.map(u => ({ id: u.id, name: u.name, email: u.email }));

    if (req.body.observateurId) formation.observateurId = req.body.observateurId;
    if (Array.isArray(req.body.destinataires)) formation.destinataires = req.body.destinataires;

    writeJSON(formationsFile, formations);

    res.json({
      success: true,
      message: `Formation envoyée à ${destinataires.length} client(s).`,
      destinataires: destinataires.length
    });
  } catch (e) {
    console.error('POST /formations/:id/envoyer:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// =========================================================================
// PASSATION DES TESTS (client)
// =========================================================================

// GET /api/formations/mes-tests
router.get('/mes-tests', authenticateToken, (req, res) => {
  try {
    const users = readJSON(path.join(dataDir, 'users.json'));
    const me = users.find(u => u.id === req.user.id);
    if (!me) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });

    const maCompany = (me.company || '').trim().toLowerCase();
    const formations = readJSON(formationsFile);
    const tests = readJSON(testsFile);
    const reponses = readJSON(reponsesFile);

    const mesFormations = formations.filter(f =>
      (f.organisation || '').trim().toLowerCase() === maCompany &&
      f.statut === 'envoyee'
    );

    const resultat = mesFormations.map(f => {
      const testsF = tests.filter(t => String(t.formationId) === String(f.id));
      const mesReponses = reponses.filter(r =>
        String(r.formationId) === String(f.id) && r.userId === req.user.id
      );
      return { formation: f, tests: testsF, reponses: mesReponses };
    });

    res.json({ success: true, items: resultat });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/formations/tests/:testId
router.get('/tests/:testId', authenticateToken, (req, res) => {
  try {
    const tests = readJSON(testsFile);
    const test = tests.find(t => String(t.id) === String(req.params.testId));
    if (!test) return res.status(404).json({ success: false, message: 'Test introuvable' });

    const questionsSansReponse = test.questions.map(q => ({ id: q.id, texte: q.texte }));
    res.json({ success: true, test: { ...test, questions: questionsSansReponse } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/formations/tests/:testId/soumettre
router.post('/tests/:testId/soumettre', authenticateToken, (req, res) => {
  try {
    const { reponses } = req.body;
    if (!reponses || typeof reponses !== 'object') {
      return res.status(400).json({ success: false, message: 'Réponses requises' });
    }

    const tests = readJSON(testsFile);
    const test = tests.find(t => String(t.id) === String(req.params.testId));
    if (!test) return res.status(404).json({ success: false, message: 'Test introuvable' });

    const score = test.questions.filter(q => reponses[q.id] === q.bonne).length;

    const allReponses = readJSON(reponsesFile);
    const filtrées = allReponses.filter(r =>
      !(String(r.testId) === String(test.id) && r.userId === req.user.id)
    );

    const nouvelle = {
      id: Date.now(),
      testId: test.id,
      formationId: test.formationId,
      type: test.type,
      userId: req.user.id,
      userName: req.user.name || 'Client',
      reponses,
      score,
      total: test.questions.length,
      soumisLe: new Date().toISOString()
    };
    filtrées.push(nouvelle);
    writeJSON(reponsesFile, filtrées);

    res.json({
      success: true,
      message: 'Test enregistré.',
      score,
      total: test.questions.length
    });
  } catch (e) {
    console.error('POST /tests/:testId/soumettre:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// =========================================================================
// OBSERVATIONS N+1
// =========================================================================

// GET /api/formations/mes-observations
router.get('/mes-observations', authenticateToken, (req, res) => {
  try {
    const formations = readJSON(formationsFile);
    const observations = readJSON(observationsFile);
    const mesFormations = formations.filter(f => f.observateurId === req.user.id);

    const items = mesFormations.map(f => {
      const obs = observations.filter(o => String(o.formationId) === String(f.id));
      return { formation: f, observations: obs };
    });
    res.json({ success: true, items });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/formations/:id/observations
router.post('/:id/observations', authenticateToken, (req, res) => {
  try {
    const { collaborateurId, questionIndex, valeur } = req.body;
    if (collaborateurId == null || questionIndex == null || valeur == null) {
      return res.status(400).json({ success: false, message: 'Champs manquants' });
    }

    const formations = readJSON(formationsFile);
    const formation = formations.find(f => String(f.id) === String(req.params.id));
    if (!formation) return res.status(404).json({ success: false, message: 'Formation introuvable' });

    if (formation.observateurId && formation.observateurId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Vous n\'êtes pas l\'observateur désigné.' });
    }

    const observations = readJSON(observationsFile);
    observations.push({
      id: Date.now(),
      formationId: formation.id,
      collaborateurId,
      questionIndex,
      valeur,
      observateurId: req.user.id,
      observateurName: req.user.name || 'Observateur',
      date: new Date().toISOString()
    });
    writeJSON(observationsFile, observations);

    res.status(201).json({ success: true, message: 'Observation enregistrée.' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// =========================================================================
// COLLECTE + RAPPORT + KPI
// =========================================================================

// GET /api/formations/:id/collecte
router.get('/:id/collecte', authenticateToken, requireAdmin, (req, res) => {
  try {
    const reponses = readJSON(reponsesFile);
    const observations = readJSON(observationsFile);
    const formationId = String(req.params.id);

    res.json({
      success: true,
      reponses: reponses.filter(r => String(r.formationId) === formationId),
      observations: observations.filter(o => String(o.formationId) === formationId)
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/formations/:id/generer-rapport
router.post('/:id/generer-rapport', authenticateToken, requireAdmin, (req, res) => {
  try {
    const formations = readJSON(formationsFile);
    const formation = formations.find(f => String(f.id) === String(req.params.id));
    if (!formation) return res.status(404).json({ success: false, message: 'Formation introuvable' });

    const reponses = readJSON(reponsesFile).filter(r => String(r.formationId) === String(formation.id));
    const observations = readJSON(observationsFile).filter(o => String(o.formationId) === String(formation.id));

    const rapport = moteurIA.genererRapport({
      formation: formation.titre,
      participants: formation.participants,
      reponsesTests: reponses,
      observations
    });

    rapport.id = Date.now();
    rapport.formationId = formation.id;
    rapport.organisation = formation.organisation;

    const rapports = readJSON(rapportsFile);
    rapports.push(rapport);
    writeJSON(rapportsFile, rapports);

    res.status(201).json({ success: true, rapport });
  } catch (e) {
    console.error('POST /formations/:id/generer-rapport:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/formations/:id/envoyer-rapport
router.post('/:id/envoyer-rapport', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { rapportId } = req.body;
    const formations = readJSON(formationsFile);
    const formation = formations.find(f => String(f.id) === String(req.params.id));
    if (!formation) return res.status(404).json({ success: false, message: 'Formation introuvable' });

    const rapports = readJSON(rapportsFile);
    const rapport = rapports.find(r => String(r.id) === String(rapportId));
    if (!rapport) return res.status(404).json({ success: false, message: 'Rapport introuvable' });

    rapport.envoye = true;
    rapport.envoyeLe = new Date().toISOString();
    rapport.destinataires = [
      ...(formation.destinataires || []),
      formation.observateurId ? `user:${formation.observateurId}` : null
    ].filter(Boolean);

    writeJSON(rapportsFile, rapports);

    res.json({
      success: true,
      message: `Rapport envoyé à ${rapport.destinataires.length} destinataire(s).`,
      destinataires: rapport.destinataires
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/formations/rapports
router.get('/rapports', authenticateToken, (req, res) => {
  try {
    const rapports = readJSON(rapportsFile);
    if (req.user.role === 'admin') {
      return res.json({ success: true, rapports });
    }
    const users = readJSON(path.join(dataDir, 'users.json'));
    const me = users.find(u => u.id === req.user.id);
    const maCompany = (me?.company || '').trim().toLowerCase();
    const mes = rapports.filter(r =>
      r.envoye && (r.organisation || '').trim().toLowerCase() === maCompany
    );
    res.json({ success: true, rapports: mes });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;