// backend/Routes/formationsRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Chemin vers le fichier formations.json
const formationsFilePath = path.join(__dirname, '..', 'data', 'formations.json');

// Fonction pour lire les formations
const readFormations = () => {
    try {
        if (!fs.existsSync(formationsFilePath)) {
            // Données par défaut
            const defaultFormations = [{
                    id: 1,
                    title: "Neuroleadership Avancé",
                    description: "Formation complète en neuroleadership",
                    price: 2990,
                    duration: "3 jours",
                    category: "LEADERSHIP",
                    image: "/images/formation1.jpg",
                    features: ["Certification", "Support continu", "Matériel inclus"],
                    rating: 4.8,
                    participants: 89
                },
                {
                    id: 2,
                    title: "Team Building Neurosciences",
                    description: "Atelier de team building basé sur les neurosciences",
                    price: 4500,
                    duration: "2 jours",
                    category: "TEAM_BUILDING",
                    image: "/images/team-building.jpg",
                    features: ["Animation professionnelle", "Matériel fourni", "Rapport personnalisé"],
                    rating: 4.9,
                    participants: 45
                }
            ];

            // Créer le dossier data s'il n'existe pas
            const dataDir = path.dirname(formationsFilePath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(formationsFilePath, JSON.stringify(defaultFormations, null, 2));
            return defaultFormations;
        }

        const data = fs.readFileSync(formationsFilePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('❌ Erreur lecture formations:', error.message);
        return [];
    }
};

// Fonction pour écrire les formations
const writeFormations = (formations) => {
    try {
        fs.writeFileSync(formationsFilePath, JSON.stringify(formations, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Erreur écriture formations:', error.message);
        return false;
    }
};

// Route de test
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API Formations fonctionne',
        timestamp: new Date().toISOString()
    });
});

// Récupérer toutes les formations
router.get('/', (req, res) => {
    try {
        const formations = readFormations();
        res.json({
            success: true,
            data: formations
        });
    } catch (error) {
        console.error('🔥 Erreur GET formations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Récupérer une formation par ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const formations = readFormations();
        const formation = formations.find(f => f.id == id);

        if (!formation) {
            return res.status(404).json({
                success: false,
                message: 'Formation non trouvée'
            });
        }

        res.json({
            success: true,
            data: formation
        });

    } catch (error) {
        console.error('🔥 Erreur GET formation par ID:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Ajouter une formation (admin)
router.post('/', (req, res) => {
    try {
        const { title, description, price, duration, category, features } = req.body;

        if (!title || !description || !price) {
            return res.status(400).json({
                success: false,
                message: 'Titre, description et prix sont requis'
            });
        }

        const formations = readFormations();

        const newFormation = {
            id: formations.length > 0 ? Math.max(...formations.map(f => f.id)) + 1 : 1,
            title,
            description,
            price: parseFloat(price),
            duration: duration || 'Sur mesure',
            category: category || 'FORMATION',
            image: req.body.image || '/images/default-formation.jpg',
            features: features || [],
            rating: 0,
            participants: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        formations.push(newFormation);
        writeFormations(formations);

        res.status(201).json({
            success: true,
            message: 'Formation ajoutée avec succès',
            data: newFormation
        });

    } catch (error) {
        console.error('🔥 Erreur POST formation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout de la formation'
        });
    }
});

module.exports = router;