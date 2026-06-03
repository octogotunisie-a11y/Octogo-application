// Routes/authRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'neuro_science_secret_key_2024';

// Chemin vers users.json
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

// Fonction sécurisée pour lire les utilisateurs
const readUsers = () => {
    try {
        if (!fs.existsSync(usersFilePath)) {
            // Créer le dossier si nécessaire
            const dir = path.dirname(usersFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Données par défaut
            const defaultUsers = [{
                    "id": 1,
                    "email": "admin@octogo.com",
                    "password": "admin123",
                    "name": "Administrateur",
                    "role": "admin",
                    "company": "Octogo",
                    "phone": "+21628262829"
                },
                {
                    "id": 2,
                    "email": "client@test.com",
                    "password": "client123",
                    "name": "Test Client",
                    "role": "client",
                    "company": "Entreprise Test",
                    "phone": "+21612345678"
                }
            ];
            fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers, null, 2));
            return defaultUsers;
        }

        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('❌ Erreur lecture users:', error.message);
        return [];
    }
};

// Fonction sécurisée pour écrire les utilisateurs
const writeUsers = (users) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Erreur écriture users:', error.message);
        return false;
    }
};

// Route de test
router.get('/test', (req, res) => {
    try {
        res.json({
            success: true,
            message: 'API Auth fonctionne!',
            timestamp: new Date().toISOString(),
            usersCount: readUsers().length
        });
    } catch (error) {
        console.error('Erreur route test:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

// Route de connexion
router.post('/login', (req, res) => {
    try {
        console.log('🔑 Tentative de connexion pour:', req.body.email);

        const { email, password } = req.body;

        // Validation simple
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        const users = readUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            console.log('❌ Échec connexion pour:', email);
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        console.log('✅ Connexion réussie pour:', user.name);

        // Créer un token simple
        const token = jwt.sign({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            JWT_SECRET, { expiresIn: '24h' }
        );

        // Retirer le mot de passe de la réponse
        const userResponse = {...user };
        delete userResponse.password;

        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('🔥 Erreur connexion:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route d'inscription
router.post('/register', (req, res) => {
    try {
        console.log('📝 Inscription pour:', req.body.email);

        const { name, email, password, phone, company } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nom, email et mot de passe requis'
            });
        }

        const users = readUsers();

        // Vérifier si l'email existe
        if (users.some(u => u.email === email)) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        // Créer nouvel utilisateur
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password,
            phone: phone || '',
            company: company || '',
            role: 'client',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        // Générer token
        const token = jwt.sign({
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            },
            JWT_SECRET, { expiresIn: '24h' }
        );

        const userResponse = {...newUser };
        delete userResponse.password;

        console.log('✅ Inscription réussie pour:', newUser.email);

        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('🔥 Erreur inscription:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route de vérification de token
router.post('/verify', (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token non fourni'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token non fourni'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const users = readUsers();
        const user = users.find(u => u.id == decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const userResponse = {...user };
        delete userResponse.password;

        res.json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('❌ Erreur vérification token:', error.message);

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou expiré'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur de vérification'
        });
    }
});

module.exports = router;