// backend/check-routes.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des fichiers de routes...\n');

const routesDir = path.join(__dirname, 'Routes');
const requiredFiles = [
    'authRoutes.js',
    'formationsRoutes.js',
    'devisRoutes.js',
    'dashboardRoutes.js'
];

// Vérifier si le dossier Routes existe
if (!fs.existsSync(routesDir)) {
    console.log('❌ Le dossier "Routes/" n\'existe pas!');
    console.log('Création du dossier...');
    fs.mkdirSync(routesDir, { recursive: true });
} else {
    console.log('✅ Dossier "Routes/" existe');
}

// Vérifier chaque fichier
let allExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(routesDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} existe`);
    } else {
        console.log(`❌ ${file} MANQUANT!`);
        allExist = false;

        // Créer un fichier vide si manquant
        const defaultContent = `// ${file}\nconst express = require('express');\nconst router = express.Router();\n\nrouter.get('/test', (req, res) => {\n    res.json({\n        success: true,\n        message: '${file} fonctionne',\n        timestamp: new Date().toISOString()\n    });\n});\n\nmodule.exports = router;`;

        fs.writeFileSync(filePath, defaultContent);
        console.log(`   📄 ${file} créé avec un template de base`);
    }
});

console.log('\n📋 Résultat:');
if (allExist) {
    console.log('✅ Tous les fichiers de routes sont présents');
} else {
    console.log('⚠️  Certains fichiers étaient manquants mais ont été créés');
}

console.log('\n🚀 Vous pouvez maintenant redémarrer le serveur:');
console.log('npm run dev');