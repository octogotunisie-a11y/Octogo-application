// backend/Routes/devisRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'neuro_science_secret_key_2024';

// Fonction sécurisée pour lire/écrire JSON
const readJSON = (filename) => {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error(`❌ Erreur lecture ${filename}:`, error.message);
        return [];
    }
};

const writeJSON = (filename, data) => {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`❌ Erreur écriture ${filename}:`, error.message);
        return false;
    }
};

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token non fourni'
            });
        }

        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        console.error('❌ Erreur token:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Token invalide'
        });
    }
};

// Demander un devis
router.post('/demander', authenticateToken, (req, res) => {
    try {
        const { formationId, entreprise, participants, lieu } = req.body;

        if (!formationId || !entreprise || !participants || !lieu) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires sont requis'
            });
        }

        const formations = readJSON('formations.json');
        let devis = readJSON('devis.json');

        const formation = formations.find(f => f.id == formationId);
        if (!formation) {
            return res.status(404).json({
                success: false,
                message: 'Formation non trouvée'
            });
        }

        const newDevis = {
            id: devis.length > 0 ? Math.max(...devis.map(d => d.id)) + 1 : 1,
            userId: req.user.id,
            formationId,
            entreprise,
            participants: parseInt(participants),
            lieu,
            status: 'en_attente',
            montant: (formation.price || 0) * parseInt(participants),
            createdAt: new Date().toISOString()
        };

        devis.push(newDevis);
        writeJSON('devis.json', devis);

        res.status(201).json({
            success: true,
            message: 'Devis demandé avec succès',
            devis: newDevis
        });

    } catch (error) {
        console.error('🔥 Erreur création devis:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Mes devis
router.get('/mes-devis', authenticateToken, (req, res) => {
    try {
        const devis = readJSON('devis.json');
        const formations = readJSON('formations.json');

        const userDevis = devis
            .filter(d => d.userId == req.user.id)
            .map(devis => {
                const formation = formations.find(f => f.id == devis.formationId);
                return {
                    ...devis,
                    formationTitle: formation ? formation.title : 'Formation inconnue'
                };
            });

        res.json({
            success: true,
            data: userDevis
        });

    } catch (error) {
        console.error('🔥 Erreur récupération devis:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

module.exports = router;