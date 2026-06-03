// backend/Routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'neuro_science_secret_key_2024';

// Fonction sécurisée pour lire JSON
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

// Middleware d'authentification simplifié
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

// Route de test
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Dashboard API fonctionne',
        time: new Date().toISOString()
    });
});

// Dashboard admin
router.get('/admin', authenticateToken, (req, res) => {
    try {
        const users = readJSON('users.json');
        const formations = readJSON('formations.json');
        const devis = readJSON('devis.json');

        // Vérifier si admin
        const currentUser = users.find(u => u.id == req.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        const stats = {
            totalUsers: users.length,
            totalClients: users.filter(u => u.role === 'client').length,
            totalFormations: formations.length,
            totalDevis: devis.length,
            devisEnAttente: devis.filter(d => d.status === 'en_attente').length
        };

        res.json({
            success: true,
            data: {
                stats,
                recentUsers: users.slice(-5).map(u => {
                    const { password, ...user } = u;
                    return user;
                }),
                recentDevis: devis.slice(-10)
            }
        });

    } catch (error) {
        console.error('🔥 Erreur dashboard admin:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Dashboard client
router.get('/client', authenticateToken, (req, res) => {
    try {
        const users = readJSON('users.json');
        const formations = readJSON('formations.json');
        const devis = readJSON('devis.json');

        const currentUser = users.find(u => u.id == req.user.id);

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const userDevis = devis.filter(d => d.userId == req.user.id);

        const { password, ...userWithoutPassword } = currentUser;

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                devis: userDevis,
                stats: {
                    totalDevis: userDevis.length,
                    devisEnAttente: userDevis.filter(d => d.status === 'en_attente').length,
                    devisTraites: userDevis.filter(d => d.status === 'traité').length
                }
            }
        });

    } catch (error) {
        console.error('🔥 Erreur dashboard client:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

module.exports = router;