const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== CONFIG ====================
// CORS — en développement, on autorise toute origine locale (n'importe quel port)
// ainsi que les requêtes sans origine (curl, applications mobiles). Cela évite les
// échecs intermittents quand Vite démarre sur 5174/5175 ou via 127.0.0.1.
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // curl, Postman, mobile, même origine
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return callback(null, true);
        // En production, restreindre ici à votre domaine. En dev, on reste permissif.
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Clé JWT
const JWT_SECRET = 'neuro_science_secret_key_2024';

// ==================== DOSSIERS ====================
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const devisUploadsDir = path.join(uploadsDir, 'devis');
if (!fs.existsSync(devisUploadsDir)) {
    fs.mkdirSync(devisUploadsDir, { recursive: true });
}

// ==================== FICHIERS DATA ====================
const usersFile = path.join(dataDir, 'users.json');
const activityFile = path.join(dataDir, 'activity.json');
const devisFile = path.join(dataDir, 'devis.json');

// Nouveaux fichiers pour les services
const parcoursFile = path.join(dataDir, 'parcours.json');
const coachingFile = path.join(dataDir, 'coaching.json');
const formationFile = path.join(dataDir, 'formation.json');
const teambuildingFile = path.join(dataDir, 'teambuilding.json');

// ==================== HELPERS ====================
// Lecture robuste : si le fichier est corrompu (écriture interrompue), on tente
// une récupération depuis la sauvegarde .bak avant de renvoyer un tableau vide.
const readJSON = (filename) => {
    const filePath = path.join(dataDir, filename);
    const lire = (p) => {
        const data = fs.readFileSync(p, 'utf8');
        return data && data.trim() ? JSON.parse(data) : [];
    };
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
            return [];
        }
        return lire(filePath);
    } catch (e) {
        console.error(`❌ Lecture ${filename} corrompue:`, e.message);
        // Tentative de récupération depuis la sauvegarde
        try {
            const bak = filePath + '.bak';
            if (fs.existsSync(bak)) {
                const recovered = lire(bak);
                fs.writeFileSync(filePath, JSON.stringify(recovered, null, 2));
                console.warn(`↩ ${filename} restauré depuis la sauvegarde .bak (${recovered.length} entrées)`);
                return recovered;
            }
        } catch (e2) {
            console.error(`❌ Échec récupération .bak pour ${filename}:`, e2.message);
        }
        return [];
    }
};

// Écriture ATOMIQUE : on écrit dans un fichier temporaire, on sauvegarde l'ancien
// (.bak), puis on renomme. Le renommage est atomique → jamais de fichier à moitié
// écrit, donc plus de lecture « cassée » pendant une écriture concurrente.
const writeJSON = (filename, data) => {
    try {
        const filePath = path.join(dataDir, filename);
        const tmpPath = filePath + '.tmp';
        fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
        if (fs.existsSync(filePath)) {
            try { fs.copyFileSync(filePath, filePath + '.bak'); } catch (e) { /* sauvegarde best-effort */ }
        }
        fs.renameSync(tmpPath, filePath); // remplacement atomique
        return true;
    } catch (e) {
        console.error(`❌ Erreur écriture ${filename}:`, e.message);
        return false;
    }
};

const readActivity = () => {
    try {
        if (!fs.existsSync(activityFile)) {
            fs.writeFileSync(activityFile, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(activityFile, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('❌ Erreur lecture activity:', e);
        return [];
    }
};

const writeActivity = (activity) => {
    try {
        fs.writeFileSync(activityFile, JSON.stringify(activity, null, 2));
        return true;
    } catch (e) {
        console.error('❌ Erreur écriture activity:', e);
        return false;
    }
};

const logActivity = (userId, type, details = {}) => {
    try {
        const activities = readActivity();
        const activity = {
            id: Date.now(),
            userId,
            type,
            timestamp: new Date().toISOString(),
            details,
            ip: '127.0.0.1'
        };
        activities.push(activity);
        writeActivity(activities);
        return true;
    } catch (error) {
        console.error('❌ Erreur log activity:', error);
        return false;
    }
};

// ==================== MULTER CONFIG ====================
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, devisUploadsDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'devis_' + req.params.id + '_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// ==================== MIDDLEWARE ====================
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

// ==================== INITIALISATION DES SERVICES ====================

const initializeServiceData = () => {
    // Données des parcours
    if (!fs.existsSync(parcoursFile)) {
        const parcoursData = [{
                id: 1,
                title: 'ÉVEIL',
                subtitle: 'NeuroLeadership & Performance Collective',
                category: 'LEADERSHIP',
                price: 'Sur devis',
                description: 'Développez un leadership conscient basé sur les neurosciences pour optimiser la performance collective.',
                type: 'parcours'
            },
            {
                id: 2,
                title: 'CAPTE',
                subtitle: 'Le cerveau au cœur de la relation client',
                category: 'VENTE',
                price: 'Sur devis',
                description: 'Maîtrisez les techniques de vente basées sur la compréhension du cerveau du client.',
                type: 'parcours'
            },
            {
                id: 3,
                title: 'RESET',
                subtitle: 'Neuromanagement & Performance durable',
                category: 'MANAGEMENT',
                price: 'Sur devis',
                description: 'Adoptez un management durable fondé sur les neurosciences cognitives et sociales.',
                type: 'parcours'
            },
            {
                id: 4,
                title: 'TRANS-FORMATION',
                subtitle: 'Leadership transformationnel et intelligence émotionnelle',
                category: 'TRANSFORMATION',
                price: 'Sur devis',
                description: 'Leadership transformationnel et intelligence émotionnelle pour une performance optimale.',
                type: 'parcours'
            },
            {
                id: 5,
                title: "VOL D'AIGLE",
                subtitle: 'Comprendre les tensions géopolitiques et économiques',
                category: 'STRATÉGIE',
                price: 'Sur devis',
                description: 'Comprenez les tensions géopolitiques et économiques pour un leadership éclairé.',
                type: 'parcours'
            },
            {
                id: 6,
                title: 'NEUROVENTE',
                subtitle: 'Vendre au cerveau pour toucher le cœur',
                category: 'VENTE',
                price: 'Sur devis',
                description: 'Vendre au cerveau pour toucher le cœur et optimiser vos performances commerciales.',
                type: 'parcours'
            },
            {
                id: 7,
                title: 'NEUROMARKETING',
                subtitle: 'Le cerveau au service de la stratégie',
                category: 'MARKETING',
                price: 'Sur devis',
                description: 'Comprendre comment le cerveau prend ses décisions pour créer des messages et offres qui influencent avec éthique.',
                type: 'parcours'
            }
        ];
        fs.writeFileSync(parcoursFile, JSON.stringify(parcoursData, null, 2));
    }

    // Données des coachings
    if (!fs.existsSync(coachingFile)) {
        const coachingData = [{
                id: 'personal-eveil',
                title: 'Éveil Intérieur',
                category: 'PERSONNEL',
                price: 'Sur devis',
                description: 'Un parcours initiatique pour découvrir votre véritable potentiel et aligner vos aspirations profondes.',
                type: 'coaching'
            },
            {
                id: 'personal-alignement',
                title: 'Alignement Profond',
                category: 'PERSONNEL',
                price: 'Sur devis',
                description: 'Une transformation progressive pour ancrer des changements durables dans votre vie quotidienne.',
                type: 'coaching'
            },
            {
                id: 'personal-transformation',
                title: 'Transformation 360°',
                category: 'PERSONNEL',
                price: 'Sur devis',
                description: 'Un accompagnement complet pour une métamorphose profonde de tous les aspects de votre vie.',
                type: 'coaching'
            },
            {
                id: 'professional-performance',
                title: 'Performance Essentielle',
                category: 'PROFESSIONNEL',
                price: 'Sur devis',
                description: 'Optimisez votre productivité et développez des habitudes de travail basées sur les neurosciences.',
                type: 'coaching'
            },
            {
                id: 'professional-impact',
                title: 'Impact Professionnel',
                category: 'PROFESSIONNEL',
                price: 'Sur devis',
                description: 'Développez une présence et une influence professionnelle qui font la différence.',
                type: 'coaching'
            },
            {
                id: 'professional-excellence',
                title: 'Excellence Stratégique',
                category: 'PROFESSIONNEL',
                price: 'Sur devis',
                description: 'Élaborez une vision stratégique à long terme et positionnez-vous comme expert dans votre domaine.',
                type: 'coaching'
            }
        ];
        fs.writeFileSync(coachingFile, JSON.stringify(coachingData, null, 2));
    }

    // Données des formations
    if (!fs.existsSync(formationFile)) {
        const formationData = [{
                id: 'formation-neurovente',
                title: 'Neurovente & Management',
                category: 'VENTES & MANAGEMENT',
                price: 'Sur devis',
                description: 'Former les managers à vendre au cerveau du client grâce aux neurosciences.',
                type: 'formation'
            },
            {
                id: 'formation-neurosecurite',
                title: 'NeuroSécurité',
                category: 'SÉCURITÉ',
                price: 'Sur devis',
                description: 'Destinée aux équipes de sécurité, basée sur les neurosciences du stress et de la cohésion.',
                type: 'formation'
            },
            {
                id: 'formation-neuroeducation',
                title: 'NeuroÉducation',
                category: 'LEADERSHIP',
                price: 'Sur devis',
                description: 'La NeuroÉducation explore la neuroplasticité chez l\'adulte et la neuroergonomie.',
                type: 'formation'
            },
            {
                id: 'formation-parole-leader',
                title: 'La parole d\'un leader',
                category: 'COMMUNICATION',
                price: 'Sur devis',
                description: 'Apprendre à communiquer avec influence et engagement.',
                type: 'formation'
            },
            {
                id: 'formation-neurosciences-appliquees',
                title: 'Neurosciences Appliquées',
                category: 'NEUROSCIENCES',
                price: 'Sur devis',
                description: 'Un ensemble de parcours innovants fondés sur les neurosciences appliquées.',
                type: 'formation'
            },
            {
                id: 'formation-mindset-gagnant',
                title: 'Mindset de gagnant',
                category: 'DÉVELOPPEMENT PERSONNEL',
                price: 'Sur devis',
                description: 'Un parcours immersif au cœur du cerveau humain pour développer les power skills de demain.',
                type: 'formation'
            },
            {
                id: 'formation-neuroleadership',
                title: 'NeuroLeadership',
                category: 'LEADERSHIP',
                price: 'Sur devis',
                description: 'Former les managers à comprendre le cerveau de leurs équipes.',
                type: 'formation'
            },
            {
                id: 'formation-leadership-emotionnel',
                title: 'Leadership Émotionnel',
                category: 'LEADERSHIP',
                price: 'Sur devis',
                description: 'Développer un leadership aligné sur les valeurs et l\'intelligence émotionnelle.',
                type: 'formation'
            }
        ];
        fs.writeFileSync(formationFile, JSON.stringify(formationData, null, 2));
    }

    // Données des team buildings
    if (!fs.existsSync(teambuildingFile)) {
        const teambuildingData = [{
                id: 'tb-voyage-alchimique',
                title: 'Le Voyage Alchimique',
                category: 'TRANSFORMATION',
                price: 'Sur devis',
                description: 'Expérience de transformation humaine et collective pour transcender les poids de l\'ego',
                type: 'teambuilding'
            },
            {
                id: 'tb-neurosynergie',
                title: 'NEUROSYNERGIE',
                category: 'NEUROSCIENCES',
                price: 'Sur devis',
                description: 'Basé sur les neurosciences sociales pour explorer les mécanismes cérébraux de cohésion',
                type: 'teambuilding'
            },
            {
                id: 'tb-full-energy',
                title: 'FULL ENERGY',
                category: 'ÉNERGIE',
                price: 'Sur devis',
                description: 'Journée rythmée par des défis sportifs favorisant cohésion et esprit d\'équipe',
                type: 'teambuilding'
            },
            {
                id: 'tb-heart-synergie',
                title: 'Heart Synergie - Future Leaders',
                category: 'LEADERSHIP',
                price: 'Sur devis',
                description: 'Programme exclusif pour renforcer un leadership humain et inspirant',
                type: 'teambuilding'
            },
            {
                id: 'tb-emergent-leaders',
                title: 'Heart Synergie - Emergent Leaders',
                category: 'DÉVELOPPEMENT',
                price: 'Sur devis',
                description: 'Parcours immersif pour renforcer cohésion et révéler le potentiel collectif',
                type: 'teambuilding'
            }
        ];
        fs.writeFileSync(teambuildingFile, JSON.stringify(teambuildingData, null, 2));
    }
};

// Initialiser les données au démarrage
initializeServiceData();

// ==================== ROUTES POUR LES SERVICES ====================

// Obtenir tous les services
app.get('/api/services/all', (req, res) => {
    try {
        const parcours = readJSON('parcours.json');
        const coaching = readJSON('coaching.json');
        const formation = readJSON('formation.json');
        const teambuilding = readJSON('teambuilding.json');

        res.json({
            success: true,
            services: {
                parcours,
                coaching,
                formation,
                teambuilding
            }
        });
    } catch (error) {
        console.error('❌ Erreur services/all:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Obtenir un service par type et ID
app.get('/api/services/:type/:id', (req, res) => {
    try {
        const { type, id } = req.params;

        let services = [];
        switch (type) {
            case 'parcours':
                services = readJSON('parcours.json');
                break;
            case 'coaching':
                services = readJSON('coaching.json');
                break;
            case 'formation':
                services = readJSON('formation.json');
                break;
            case 'teambuilding':
                services = readJSON('teambuilding.json');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Type de service non valide'
                });
        }

        const service = services.find(s => {
            if (type === 'parcours') {
                return s.id == id;
            } else {
                return s.id === id;
            }
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service non trouvé'
            });
        }

        res.json({
            success: true,
            service
        });
    } catch (error) {
        console.error('❌ Erreur service spécifique:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Obtenir les services par type
app.get('/api/services/:type', (req, res) => {
    try {
        const { type } = req.params;

        let services = [];
        switch (type) {
            case 'parcours':
                services = readJSON('parcours.json');
                break;
            case 'coaching':
                services = readJSON('coaching.json');
                break;
            case 'formation':
                services = readJSON('formation.json');
                break;
            case 'teambuilding':
                services = readJSON('teambuilding.json');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Type de service non valide'
                });
        }

        res.json({
            success: true,
            services
        });
    } catch (error) {
        console.error('❌ Erreur services par type:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const users = readJSON('users.json');
    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    user.lastLogin = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;

    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        writeJSON('users.json', users);
    }

    logActivity(user.id, 'login', { email: user.email });

    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
        success: true,
        token,
        user: safeUser,
        message: 'Connexion réussie'
    });
});

// Register
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone, company, matriculeFiscale } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }

    const users = readJSON('users.json');

    if (users.some(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        phone: phone || '',
        company: company || '',
        matriculeFiscale: matriculeFiscale || '',
        role: 'client',
        brainPoints: 100,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff`,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1,
        status: 'active'
    };

    users.push(newUser);
    writeJSON('users.json', users);

    logActivity(newUser.id, 'register', {
        name: newUser.name,
        email: newUser.email,
        company: newUser.company
    });

    const { password: _, ...safeUser } = newUser;
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
        success: true,
        token,
        user: safeUser,
        message: 'Inscription réussie'
    });
});

// ==================== USER ROUTES ====================

// Get all users (Admin only)
app.get('/api/users', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const users = readJSON('users.json');
        const safeUsers = users.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });

        res.json({
            success: true,
            users: safeUsers,
            total: safeUsers.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Get user by ID
app.get('/api/users/:id', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const users = readJSON('users.json');
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const { password, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Get current user profile
app.get('/api/users/me', authenticateToken, (req, res) => {
    try {
        const users = readJSON('users.json');
        const user = users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const { password, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Mettre à jour le profil utilisateur
app.put('/api/users/me', authenticateToken, (req, res) => {
    try {
        const { name, phone, company, matriculeFiscale } = req.body;
        const users = readJSON('users.json');
        const userIndex = users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        if (name) users[userIndex].name = name;
        if (phone) users[userIndex].phone = phone;
        if (company) users[userIndex].company = company;
        if (matriculeFiscale) users[userIndex].matriculeFiscale = matriculeFiscale;

        if (name) {
            users[userIndex].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B5CF6&color=fff`;
        }

        writeJSON('users.json', users);

        const { password, ...updatedUser } = users[userIndex];

        logActivity(req.user.id, 'profile_update', {
            updatedFields: { name, phone, company }
        });

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            user: updatedUser
        });

    } catch (error) {
        console.error('❌ Erreur mise à jour profil:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ==================== DEVIS ROUTES ====================

// Demander un devis
app.post('/api/devis/demander', authenticateToken, (req, res) => {
    try {
        const {
            serviceType,
            serviceId,
            serviceTitle,
            serviceCategory,
            entreprise,
            matriculeFiscale,
            participants = 1,
            duree = 1,
            uniteDuree = 'jours',
            lieu,
            datePrevue,
            message,
            contactPhone,
            devise = 'TND'
        } = req.body;

        if (!serviceType || !serviceId || !entreprise || !matriculeFiscale || !lieu) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires sont requis'
            });
        }

        const validServiceTypes = ['parcours', 'coaching', 'formation', 'teambuilding'];
        if (!validServiceTypes.includes(serviceType)) {
            return res.status(400).json({
                success: false,
                message: 'Type de service non valide'
            });
        }

        let devis = readJSON('devis.json');

        const users = readJSON('users.json');
        const user = users.find(u => u.id == req.user.id);

        const newDevis = {
            id: devis.length > 0 ? Math.max(...devis.map(d => d.id)) + 1 : 1,
            userId: req.user.id,
            userName: user ? user.name : 'Client',
            userEmail: user ? user.email : '',
            serviceType,
            serviceId,
            serviceTitle: serviceTitle || 'Service',
            serviceCategory: serviceCategory || '',
            entreprise,
            matriculeFiscale: matriculeFiscale || '',
            participants: parseInt(participants),
            duree: parseInt(duree),
            uniteDuree: uniteDuree,
            lieu,
            datePrevue: datePrevue || null,
            message: message || '',
            contactPhone: contactPhone || (user ? user.phone : ''),
            contactEmail: user ? user.email : '',
            status: 'en attente',
            montant: null,
            montantFinal: null,
            devise: devise,
            commentaireAdmin: null,
            fichierPdf: null,
            fileName: null,
            messages: [], // Nouveau champ pour les messages
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        devis.push(newDevis);
        writeJSON('devis.json', devis);

        logActivity(req.user.id, 'devis_request', {
            devisId: newDevis.id,
            serviceType,
            serviceId,
            serviceTitle,
            entreprise,
            participants: parseInt(participants),
            duree: parseInt(duree),
            devise: devise
        });

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

// Mes devis (pour client connecté)
app.get('/api/devis/mes-devis', authenticateToken, (req, res) => {
    try {
        const devis = readJSON('devis.json');
        const userDevis = devis.filter(d => d.userId == req.user.id);

        res.json({
            success: true,
            devis: userDevis
        });

    } catch (error) {
        console.error('🔥 Erreur récupération devis:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Tous les devis (admin only)
app.get('/api/devis', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const devis = readJSON('devis.json');

        res.json({
            success: true,
            devis: devis,
            total: devis.length
        });

    } catch (error) {
        console.error('🔥 Erreur récupération tous devis:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Récupérer un devis spécifique
app.get('/api/devis/:id', authenticateToken, (req, res) => {
    try {
        const devisId = parseInt(req.params.id);
        const devis = readJSON('devis.json');
        const devisItem = devis.find(d => d.id === devisId);

        if (!devisItem) {
            return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        }

        if (req.user.role !== 'admin' && devisItem.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        res.json({
            success: true,
            devis: devisItem
        });

    } catch (error) {
        console.error('🔥 Erreur récupération devis:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// ==================== NOUVELLES ROUTES POUR LES MESSAGES ====================

// Ajouter un message à un devis
app.post('/api/devis/:id/messages', authenticateToken, (req, res) => {
    try {
        const devisId = parseInt(req.params.id);
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Le message ne peut pas être vide'
            });
        }

        let devis = readJSON('devis.json');
        const devisIndex = devis.findIndex(d => d.id === devisId);

        if (devisIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Devis non trouvé'
            });
        }

        if (req.user.role !== 'admin' && devis[devisIndex].userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        if (!devis[devisIndex].messages) {
            devis[devisIndex].messages = [];
        }

        const newMessage = {
            id: Date.now(),
            content: content.trim(),
            senderId: req.user.id,
            senderName: req.user.name || (req.user.role === 'admin' ? 'Administrateur' : 'Client'),
            senderRole: req.user.role,
            isFromAdmin: req.user.role === 'admin',
            isFromClient: req.user.role === 'client',
            createdAt: new Date().toISOString(),
            read: false
        };

        devis[devisIndex].messages.push(newMessage);
        devis[devisIndex].updatedAt = new Date().toISOString();

        writeJSON('devis.json', devis);

        logActivity(req.user.id, 'new_message', {
            devisId,
            messageId: newMessage.id,
            isFromAdmin: req.user.role === 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Message envoyé avec succès',
            data: newMessage
        });

    } catch (error) {
        console.error('🔥 Erreur ajout message:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Récupérer tous les messages d'un devis
app.get('/api/devis/:id/messages', authenticateToken, (req, res) => {
    try {
        const devisId = parseInt(req.params.id);
        const devis = readJSON('devis.json');
        const devisItem = devis.find(d => d.id === devisId);

        if (!devisItem) {
            return res.status(404).json({
                success: false,
                message: 'Devis non trouvé'
            });
        }

        if (req.user.role !== 'admin' && devisItem.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        const messages = devisItem.messages || [];

        res.json({
            success: true,
            messages: messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        });

    } catch (error) {
        console.error('🔥 Erreur récupération messages:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Marquer les messages comme lus
app.put('/api/devis/:id/messages/read', authenticateToken, (req, res) => {
    try {
        const devisId = parseInt(req.params.id);
        let devis = readJSON('devis.json');
        const devisIndex = devis.findIndex(d => d.id === devisId);

        if (devisIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Devis non trouvé'
            });
        }

        if (req.user.role !== 'admin' && devis[devisIndex].userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        if (devis[devisIndex].messages) {
            devis[devisIndex].messages = devis[devisIndex].messages.map(msg => {
                if (msg.senderId !== req.user.id) {
                    return {...msg, read: true };
                }
                return msg;
            });
        }

        writeJSON('devis.json', devis);

        res.json({
            success: true,
            message: 'Messages marqués comme lus'
        });

    } catch (error) {
        console.error('🔥 Erreur marquage messages:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Compter les messages non lus
app.get('/api/devis/:id/messages/unread-count', authenticateToken, (req, res) => {
    try {
        const devisId = parseInt(req.params.id);
        const devis = readJSON('devis.json');
        const devisItem = devis.find(d => d.id === devisId);

        if (!devisItem) {
            return res.status(404).json({
                success: false,
                message: 'Devis non trouvé'
            });
        }

        if (req.user.role !== 'admin' && devisItem.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }

        const unreadCount = (devisItem.messages || [])
            .filter(msg => msg.senderId !== req.user.id && !msg.read)
            .length;

        res.json({
            success: true,
            unreadCount
        });

    } catch (error) {
        console.error('🔥 Erreur comptage messages non lus:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// ==================== ADMIN ROUTES ====================

// Statistiques générales (admin)
app.get('/api/admin/stats', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const users = readJSON('users.json');
        const activities = readActivity();
        const devis = readJSON('devis.json');

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        const statsByServiceType = {
            parcours: devis.filter(d => d.serviceType === 'parcours').length,
            coaching: devis.filter(d => d.serviceType === 'coaching').length,
            formation: devis.filter(d => d.serviceType === 'formation').length,
            teambuilding: devis.filter(d => d.serviceType === 'teambuilding').length
        };

        // Compter les messages non lus par l'admin
        const unreadMessages = devis.reduce((total, d) => {
            return total + (d.messages || []).filter(msg => msg.senderRole === 'client' && !msg.read).length;
        }, 0);

        const stats = {
            totalUsers: users.length,
            totalClients: users.filter(u => u.role === 'client').length,
            totalAdmins: users.filter(u => u.role === 'admin').length,
            totalDevis: devis.length,
            unreadMessages,

            statsByServiceType,

            devisStats: {
                enAttente: devis.filter(d => d.status === 'en attente').length,
                valides: devis.filter(d => d.status === 'validé').length,
                payes: devis.filter(d => d.status === 'payé').length,
                refuses: devis.filter(d => d.status === 'refusé').length
            },

            today: {
                logins: users.filter(u => {
                    if (!u.lastLogin) return false;
                    const loginDate = new Date(u.lastLogin);
                    return loginDate >= today;
                }).length,
                devis: devis.filter(d => {
                    const date = new Date(d.createdAt);
                    return date >= today;
                }).length,
                registrations: users.filter(u => {
                    const date = new Date(u.createdAt);
                    return date >= today;
                }).length,
                messages: devis.reduce((total, d) => {
                    return total + (d.messages || []).filter(msg => {
                        const date = new Date(msg.createdAt);
                        return date >= today;
                    }).length;
                }, 0)
            },

            last7Days: {
                logins: users.filter(u => {
                    if (!u.lastLogin) return false;
                    const loginDate = new Date(u.lastLogin);
                    return loginDate >= last7Days;
                }).length,
                devis: devis.filter(d => {
                    const date = new Date(d.createdAt);
                    return date >= last7Days;
                }).length,
                registrations: users.filter(u => {
                    const date = new Date(u.createdAt);
                    return date >= last7Days;
                }).length,
                messages: devis.reduce((total, d) => {
                    return total + (d.messages || []).filter(msg => {
                        const date = new Date(msg.createdAt);
                        return date >= last7Days;
                    }).length;
                }, 0)
            },

            montantTotal: devis.reduce((sum, d) => sum + (d.montantFinal || 0), 0),

            recentActiveUsers: users.filter(u => {
                if (!u.lastLogin) return false;
                return new Date(u.lastLogin) >= last30Days;
            }).length
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Erreur stats:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Statistiques devis (admin)
app.get('/api/admin/devis-stats', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const devis = readJSON('devis.json');
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        const devisParService = {
            parcours: devis.filter(d => d.serviceType === 'parcours').length,
            coaching: devis.filter(d => d.serviceType === 'coaching').length,
            formation: devis.filter(d => d.serviceType === 'formation').length,
            teambuilding: devis.filter(d => d.serviceType === 'teambuilding').length
        };

        const stats = {
            total: devis.length,
            enAttente: devis.filter(d => d.status === 'en attente').length,
            valides: devis.filter(d => d.status === 'validé').length,
            payes: devis.filter(d => d.status === 'payé').length,
            refuses: devis.filter(d => d.status === 'refusé').length,
            parService: devisParService,
            aujourdhui: devis.filter(d => {
                const date = new Date(d.createdAt);
                return date >= today;
            }).length,
            derniers7jours: devis.filter(d => {
                const date = new Date(d.createdAt);
                return date >= last7Days;
            }).length,
            derniers30jours: devis.filter(d => {
                const date = new Date(d.createdAt);
                return date >= last30Days;
            }).length,
            montantTotal: devis.reduce((sum, d) => sum + (d.montantFinal || 0), 0),
            montantMoyen: devis.length > 0 ?
                devis.reduce((sum, d) => sum + (d.montantFinal || 0), 0) / devis.length : 0
        };

        res.json({ success: true, stats });

    } catch (error) {
        console.error('🔥 Erreur stats devis:', error.message);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Activités récentes (admin)
app.get('/api/admin/activities', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const activities = readActivity();
        const users = readJSON('users.json');

        const enrichedActivities = activities.map(activity => {
            const user = users.find(u => u.id === activity.userId);
            return {
                ...activity,
                user: user ? {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    company: user.company
                } : null
            };
        });

        enrichedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            activities: enrichedActivities,
            total: enrichedActivities.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Upload PDF simple pour un devis
app.post('/api/devis/:id/upload-pdf', authenticateToken, upload.single('pdf'), (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Aucun fichier PDF fourni' });
        }

        const devisId = parseInt(req.params.id);
        let devis = readJSON('devis.json');
        const devisIndex = devis.findIndex(d => d.id === devisId);

        if (devisIndex === -1) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        }

        if (devis[devisIndex].fichierPdf) {
            const oldFilePath = path.join(__dirname, devis[devisIndex].fichierPdf);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        const fichierPdf = `/uploads/devis/${req.file.filename}`;
        devis[devisIndex].fichierPdf = fichierPdf;
        devis[devisIndex].fileName = req.file.originalname;
        devis[devisIndex].updatedAt = new Date().toISOString();
        devis[devisIndex].status = 'validé';

        writeJSON('devis.json', devis);

        logActivity(req.user.id, 'devis_pdf_upload', {
            devisId,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            newStatus: 'validé'
        });

        res.json({
            success: true,
            message: 'PDF uploadé avec succès',
            fichierPdf,
            fileName: req.file.originalname,
            devis: devis[devisIndex]
        });

    } catch (error) {
        console.error('🔥 Erreur upload PDF:', error.message);
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Mettre à jour un devis avec ou sans fichier
app.put('/api/devis/:id/update', authenticateToken, upload.single('pdf'), (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const devisId = parseInt(req.params.id);
        let devis = readJSON('devis.json');
        const devisIndex = devis.findIndex(d => d.id === devisId);

        if (devisIndex === -1) {
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        }

        const { status, montantFinal, commentaireAdmin, devise } = req.body;

        const oldStatus = devis[devisIndex].status;
        if (status) devis[devisIndex].status = status;
        if (montantFinal !== undefined) devis[devisIndex].montantFinal = montantFinal;
        if (commentaireAdmin !== undefined) devis[devisIndex].commentaireAdmin = commentaireAdmin;
        if (devise) devis[devisIndex].devise = devise;

        if (req.file) {
            if (devis[devisIndex].fichierPdf) {
                const oldFilePath = path.join(__dirname, devis[devisIndex].fichierPdf);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            const fichierPdf = `/uploads/devis/${req.file.filename}`;
            devis[devisIndex].fichierPdf = fichierPdf;
            devis[devisIndex].fileName = req.file.originalname;
        }

        devis[devisIndex].updatedAt = new Date().toISOString();

        writeJSON('devis.json', devis);

        logActivity(req.user.id, 'devis_update_complete', {
            devisId,
            oldStatus,
            newStatus: status,
            montantFinal,
            devise,
            hasFile: !!req.file
        });

        res.json({
            success: true,
            message: 'Devis mis à jour avec succès',
            devis: devis[devisIndex]
        });

    } catch (error) {
        console.error('🔥 Erreur mise à jour complète devis:', error.message);
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Erreur serveur: ' + error.message
        });
    }
});

// Supprimer un devis
app.delete('/api/devis/:id', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const devisId = parseInt(req.params.id);
        let devis = readJSON('devis.json');
        const devisIndex = devis.findIndex(d => d.id === devisId);

        if (devisIndex === -1) {
            return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        }

        const devisItem = devis[devisIndex];
        if (devisItem.fichierPdf) {
            const filePath = path.join(__dirname, devisItem.fichierPdf);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        devis.splice(devisIndex, 1);
        writeJSON('devis.json', devis);

        logActivity(req.user.id, 'devis_delete', {
            devisId,
            clientName: devisItem.userName,
            entreprise: devisItem.entreprise
        });

        res.json({
            success: true,
            message: 'Devis supprimé avec succès'
        });

    } catch (error) {
        console.error('🔥 Erreur suppression devis:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Télécharger un fichier PDF
app.get('/api/devis/:id/download', authenticateToken, (req, res) => {
    try {
        const devisId = parseInt(req.params.id);
        const devis = readJSON('devis.json');
        const devisItem = devis.find(d => d.id === devisId);

        if (!devisItem) {
            return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        }

        if (req.user.role !== 'admin' && devisItem.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        if (!devisItem.fichierPdf) {
            return res.status(404).json({ success: false, message: 'Fichier PDF non trouvé' });
        }

        const filePath = path.join(__dirname, devisItem.fichierPdf);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Fichier non trouvé sur le serveur' });
        }

        logActivity(req.user.id, 'devis_download', {
            devisId,
            fileName: devisItem.fileName
        });

        res.download(filePath, devisItem.fileName || 'devis.pdf');

    } catch (error) {
        console.error('🔥 Erreur téléchargement PDF:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// ==================== ROUTES SUPPLÉMENTAIRES ====================

// Changer le mot de passe
app.put('/api/users/me/password', authenticateToken, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mot de passe actuel et nouveau mot de passe requis'
            });
        }

        const users = readJSON('users.json');
        const userIndex = users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        if (users[userIndex].password !== currentPassword) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe actuel incorrect'
            });
        }

        users[userIndex].password = newPassword;
        writeJSON('users.json', users);

        logActivity(req.user.id, 'password_change', {});

        res.json({
            success: true,
            message: 'Mot de passe changé avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur changement mot de passe:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Route pour vérifier si un email existe
app.post('/api/users/check-email', (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email requis'
            });
        }

        const users = readJSON('users.json');
        const exists = users.some(u => u.email === email);

        res.json({
            success: true,
            exists,
            message: exists ? 'Email déjà utilisé' : 'Email disponible'
        });

    } catch (error) {
        console.error('❌ Erreur vérification email:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Route pour obtenir les devis par service type
app.get('/api/devis/service/:serviceType', authenticateToken, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès non autorisé' });
        }

        const { serviceType } = req.params;
        const devis = readJSON('devis.json');

        const validServiceTypes = ['parcours', 'coaching', 'formation', 'teambuilding'];
        if (!validServiceTypes.includes(serviceType)) {
            return res.status(400).json({
                success: false,
                message: 'Type de service non valide'
            });
        }

        const serviceDevis = devis.filter(d => d.serviceType === serviceType);

        res.json({
            success: true,
            devis: serviceDevis,
            total: serviceDevis.length
        });

    } catch (error) {
        console.error('🔥 Erreur devis par service:', error.message);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Route test
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Backend OK', timestamp: new Date().toISOString() });
});

// ==================== GÉNÉRATION DE PROGRAMME ====================
// Chargement PROTÉGÉ : si un fichier du module manque, le serveur démarre quand
// même et l'authentification reste fonctionnelle.
try {
    const programmeRoutes = require('./Routes/programmeRoutes');
    app.use('/api/programmes', programmeRoutes);
    console.log('✅ Module Génération de Programme chargé');
} catch (e) {
    console.error('⚠ Module Génération de Programme NON chargé:', e.message);
}

// Route 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log('\n📡 Routes principales:');
    console.log('├── AUTH');
    console.log('│   ├── POST /api/auth/login');
    console.log('│   └── POST /api/auth/register');
    console.log('├── SERVICES');
    console.log('│   ├── GET  /api/services/all');
    console.log('│   ├── GET  /api/services/:type');
    console.log('│   └── GET  /api/services/:type/:id');
    console.log('├── DEVIS (AVEC MESSAGES)');
    console.log('│   ├── POST /api/devis/demander');
    console.log('│   ├── GET  /api/devis/mes-devis');
    console.log('│   ├── GET  /api/devis');
    console.log('│   ├── GET  /api/devis/service/:serviceType');
    console.log('│   ├── GET  /api/devis/:id');
    console.log('│   ├── GET  /api/devis/:id/download');
    console.log('│   ├── PUT  /api/devis/:id/update');
    console.log('│   ├── POST /api/devis/:id/upload-pdf');
    console.log('│   └── DELETE /api/devis/:id');
    console.log('├── MESSAGES (NOUVEAU)');
    console.log('│   ├── POST   /api/devis/:id/messages');
    console.log('│   ├── GET    /api/devis/:id/messages');
    console.log('│   ├── PUT    /api/devis/:id/messages/read');
    console.log('│   └── GET    /api/devis/:id/messages/unread-count');
    console.log('├── ADMIN');
    console.log('│   ├── GET  /api/admin/stats');
    console.log('│   ├── GET  /api/admin/devis-stats');
    console.log('│   └── GET  /api/admin/activities');
    console.log('├── USERS');
    console.log('│   ├── GET  /api/users');
    console.log('│   ├── GET  /api/users/me');
    console.log('│   ├── PUT  /api/users/me');
    console.log('│   ├── PUT  /api/users/me/password');
    console.log('│   └── POST /api/users/check-email');
    console.log('└── UPLOAD: /uploads/devis/');
});