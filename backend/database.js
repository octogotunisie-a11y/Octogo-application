// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données
const dbPath = path.join(__dirname, '..', 'data', 'octogo.db');
const db = new sqlite3.Database(dbPath);

// Fonction pour initialiser la base de données
const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Table des utilisateurs
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone TEXT,
                company TEXT,
                role TEXT DEFAULT 'user',
                brain_points INTEGER DEFAULT 100,
                avatar TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) reject(err);
            });

            // Table des formations
            db.run(`CREATE TABLE IF NOT EXISTS formations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                duration TEXT,
                price DECIMAL(10,2),
                category TEXT,
                image TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) reject(err);
            });

            // Table des devis
            db.run(`CREATE TABLE IF NOT EXISTS devis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                formation_id INTEGER,
                entreprise TEXT NOT NULL,
                participants INTEGER,
                heures INTEGER,
                lieu TEXT,
                date_prevue DATE,
                message TEXT,
                status TEXT DEFAULT 'en_attente',
                montant DECIMAL(10,2),
                montant_final DECIMAL(10,2),
                commentaire TEXT,
                contact_email TEXT,
                contact_phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (formation_id) REFERENCES formations(id)
            )`, (err) => {
                if (err) reject(err);
            });

            console.log('✅ Base de données initialisée avec succès');
            resolve();
        });
    });
};

// Fonction pour obtenir la connexion à la base
const getDB = () => db;

module.exports = { db, getDB, initDatabase };