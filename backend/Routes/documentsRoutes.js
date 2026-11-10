// backend/Routes/documentsRoutes.js
// -----------------------------------------------------------------------------
// API Documents — gestion complète des fichiers par les clients.
// Compatible avec l'architecture existante : JSON files + JWT + multer.
//
// Un document appartient TOUJOURS à :
//   - un utilisateur (userId)
//   - une organisation (company du user)
//
// L'admin voit tous les documents. Le client voit UNIQUEMENT les siens.
// -----------------------------------------------------------------------------
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const JWT_SECRET = 'neuro_science_secret_key_2024';

// ---------------------------------------------------------------- Dossiers
const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const documentsFile = path.join(dataDir, 'documents.json');

// ---------------------------------------------------------------- Helpers JSON
function readJSON(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) { fs.writeFileSync(file, '[]'); return []; }
    const raw = fs.readFileSync(file, 'utf8');
    return raw && raw.trim() ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Lecture ${path.basename(file)}:`, e.message);
    return fallback;
  }
}

function writeJSON(file, data) {
  try {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
    return true;
  } catch (e) {
    console.error(`Écriture ${path.basename(file)}:`, e.message);
    return false;
  }
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

// ---------------------------------------------------------------- Multer
const EXT_ACCEPTEES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.md', '.csv'];
const MAX_SIZE_MB = 10;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc_' + unique + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!EXT_ACCEPTEES.includes(ext)) {
      return cb(new Error(`Format ${ext} non pris en charge`), false);
    }
    cb(null, true);
  }
});

// ---------------------------------------------------------------- Utils
function detecterType(nom) {
  const ext = path.extname(nom).toLowerCase();
  if (ext === '.pdf') return 'PDF';
  if (['.doc', '.docx'].includes(ext)) return 'Word';
  if (['.xls', '.xlsx'].includes(ext)) return 'Excel';
  if (['.txt', '.md', '.csv'].includes(ext)) return 'Texte';
  return 'Autre';
}

function formaterTaille(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// ---------------------------------------------------------------- Routes

// GET /api/documents — liste des documents visibles par l'utilisateur connecté
router.get('/', authenticateToken, (req, res) => {
  try {
    const documents = readJSON(documentsFile);

    // L'admin voit tout ; le client ne voit QUE ses documents + même organisation
    let visibles;
    if (req.user.role === 'admin') {
      visibles = documents;
    } else {
      const users = readJSON(path.join(dataDir, 'users.json'));
      const me = users.find(u => u.id === req.user.id);
      const maCompany = (me?.company || '').trim().toLowerCase();
      visibles = documents.filter(d =>
        d.userId === req.user.id ||
        (maCompany && (d.company || '').trim().toLowerCase() === maCompany)
      );
    }

    // Ne jamais renvoyer le chemin physique ni l'extraction brute
    const sansSensible = visibles.map(d => {
      const { storedName, extractedText, ...safe } = d;
      return safe;
    });

    res.json({ success: true, documents: sansSensible, total: sansSensible.length });
  } catch (e) {
    console.error('GET /documents:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/documents/:id — métadonnées d'un document
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const documents = readJSON(documentsFile);
    const doc = documents.find(d => String(d.id) === String(req.params.id));
    if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });

    // Contrôle d'accès : admin OU propriétaire OU même organisation
    if (req.user.role !== 'admin') {
      const users = readJSON(path.join(dataDir, 'users.json'));
      const me = users.find(u => u.id === req.user.id);
      const maCompany = (me?.company || '').trim().toLowerCase();
      const memeOrganisation =
        maCompany && (doc.company || '').trim().toLowerCase() === maCompany;
      if (doc.userId !== req.user.id && !memeOrganisation) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
      }
    }

    const { storedName, extractedText, ...safe } = doc;
    res.json({ success: true, document: safe });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /api/documents/upload — import d'un fichier
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }

    const users = readJSON(path.join(dataDir, 'users.json'));
    const me = users.find(u => u.id === req.user.id);

    const documents = readJSON(documentsFile);
    const id = documents.length > 0 ? Math.max(...documents.map(d => d.id)) + 1 : 1;

    const doc = {
      id,
      userId: req.user.id,
      userName: me?.name || 'Utilisateur',
      company: me?.company || '',
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      taille: formaterTaille(req.file.size),
      type: detecterType(req.file.originalname),
      categorie: req.body.categorie || 'Autre',
      statut: 'analyse',
      sourceContext: req.body.sourceContext || 'client',
      extractedText: '',
      createdAt: new Date().toISOString()
    };

    // Extraction texte basique pour txt/md/csv
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (['.txt', '.md', '.csv'].includes(ext)) {
      try {
        doc.extractedText = fs.readFileSync(req.file.path, 'utf8').slice(0, 50000);
      } catch (e) { /* silencieux */ }
    }

    documents.push(doc);
    writeJSON(documentsFile, documents);

    const { storedName, extractedText, ...safe } = doc;
    res.status(201).json({ success: true, document: safe });
  } catch (e) {
    console.error('POST /documents/upload:', e);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/documents/:id/download — téléchargement du VRAI fichier
router.get('/:id/download', authenticateToken, (req, res) => {
  try {
    const documents = readJSON(documentsFile);
    const doc = documents.find(d => String(d.id) === String(req.params.id));
    if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });

    if (req.user.role !== 'admin') {
      const users = readJSON(path.join(dataDir, 'users.json'));
      const me = users.find(u => u.id === req.user.id);
      const maCompany = (me?.company || '').trim().toLowerCase();
      const memeOrganisation =
        maCompany && (doc.company || '').trim().toLowerCase() === maCompany;
      if (doc.userId !== req.user.id && !memeOrganisation) {
        return res.status(403).json({ success: false, message: 'Accès refusé' });
      }
    }

    const filePath = path.join(uploadsDir, doc.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Fichier absent du serveur' });
    }

    res.setHeader('Content-Disposition',
      `attachment; filename="${encodeURIComponent(doc.originalName)}"`);
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    console.error('GET /documents/:id/download:', e);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const documents = readJSON(documentsFile);
    const idx = documents.findIndex(d => String(d.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Document introuvable' });

    const doc = documents[idx];
    if (req.user.role !== 'admin' && doc.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    // Supprime le fichier physique
    const filePath = path.join(uploadsDir, doc.storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    documents.splice(idx, 1);
    writeJSON(documentsFile, documents);

    res.json({ success: true, message: 'Document supprimé' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/documents/:id/text — pour l'IA : contenu exploitable
router.get('/:id/text', authenticateToken, async (req, res) => {
  try {
    const documents = readJSON(documentsFile);
    const doc = documents.find(d => String(d.id) === String(req.params.id));
    if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });

    if (req.user.role !== 'admin' && doc.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    res.json({
      success: true,
      id: doc.id,
      nom: doc.originalName,
      text: doc.extractedText || '',
      exploitable: Boolean(doc.extractedText && doc.extractedText.length > 40)
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/documents/stats/all — vue admin : compteur par organisation
router.get('/stats/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const documents = readJSON(documentsFile);
    const parSociete = {};
    for (const d of documents) {
      const org = d.company || 'Sans organisation';
      parSociete[org] = (parSociete[org] || 0) + 1;
    }
    res.json({ success: true, total: documents.length, parSociete });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;