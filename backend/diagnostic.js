// backend/diagnostic.js
// ---------------------------------------------------------------------------
// Diagnostic autonome. Aucune dépendance, aucun curl.
// Le serveur doit tourner (npm run dev) dans une AUTRE fenêtre.
//
//     cd G:\octogo_app\backend
//     node diagnostic.js
// ---------------------------------------------------------------------------
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const PORT = 5000;
const TIMEOUT = 8000;

const vert = (s) => `\x1b[32m${s}\x1b[0m`;
const rouge = (s) => `\x1b[31m${s}\x1b[0m`;
const jaune = (s) => `\x1b[33m${s}\x1b[0m`;

// --- 1. Le port accepte-t-il une connexion TCP, en IPv4 puis en IPv6 ? ------
function testerTCP(hote) {
    return new Promise((resolve) => {
        const t0 = Date.now();
        const s = new net.Socket();
        s.setTimeout(4000);
        s.on('connect', () => { s.destroy(); resolve({ ok: true, ms: Date.now() - t0 }); });
        s.on('timeout', () => { s.destroy(); resolve({ ok: false, raison: 'timeout', ms: Date.now() - t0 }); });
        s.on('error', (e) => { resolve({ ok: false, raison: e.code || e.message, ms: Date.now() - t0 }); });
        s.connect(PORT, hote);
    });
}

// --- 2. Requête HTTP complète ----------------------------------------------
function requete(hote, methode, chemin, corps) {
    return new Promise((resolve) => {
        const t0 = Date.now();
        const donnees = corps ? JSON.stringify(corps) : null;
        const req = http.request({
            host: hote,
            port: PORT,
            path: chemin,
            method: methode,
            family: hote.includes(':') ? 6 : 4,
            headers: donnees
                ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(donnees) }
                : {}
        }, (res) => {
            let b = '';
            res.on('data', (c) => { b += c; });
            res.on('end', () => resolve({ ok: true, status: res.statusCode, ms: Date.now() - t0, corps: b.slice(0, 200) }));
        });
        req.setTimeout(TIMEOUT, () => { req.destroy(); resolve({ ok: false, raison: 'TIMEOUT', ms: Date.now() - t0 }); });
        req.on('error', (e) => resolve({ ok: false, raison: e.code || e.message, ms: Date.now() - t0 }));
        if (donnees) req.write(donnees);
        req.end();
    });
}

// --- 3. Vitesse d'accès disque sur le dossier data -------------------------
function testerDisque() {
    const dossier = path.join(__dirname, 'data');
    const cible = path.join(dossier, '_diag_tmp.json');
    const t0 = Date.now();
    try {
        for (let i = 0; i < 20; i++) {
            fs.writeFileSync(cible, JSON.stringify({ i, d: 'x'.repeat(2000) }));
            fs.readFileSync(cible, 'utf8');
        }
        fs.unlinkSync(cible);
        return { ok: true, ms: Date.now() - t0 };
    } catch (e) {
        return { ok: false, raison: e.message, ms: Date.now() - t0 };
    }
}

(async () => {
    console.log('\n=== DIAGNOSTIC OCTOGO ===\n');
    console.log('Node       :', process.version);
    console.log('Dossier    :', __dirname);
    console.log('Lecteur    :', __dirname.slice(0, 2), '\n');

    // Disque
    const d = testerDisque();
    console.log('--- Disque (40 opérations sur backend/data) ---');
    if (!d.ok) console.log(rouge('  ÉCHEC : ' + d.raison));
    else if (d.ms > 2000) console.log(rouge(`  ${d.ms} ms — TRÈS LENT. Le lecteur bloque le serveur.`));
    else if (d.ms > 500) console.log(jaune(`  ${d.ms} ms — lent.`));
    else console.log(vert(`  ${d.ms} ms — normal.`));

    // TCP
    console.log('\n--- Connexion TCP au port 5000 ---');
    for (const h of ['127.0.0.1', '::1']) {
        const r = await testerTCP(h);
        console.log(r.ok ? vert(`  ${h.padEnd(10)} OK (${r.ms} ms)`) : rouge(`  ${h.padEnd(10)} ÉCHEC : ${r.raison}`));
    }

    // HTTP
    console.log('\n--- Requêtes HTTP ---');
    const test4 = await requete('127.0.0.1', 'GET', '/api/test');
    console.log(test4.ok ? vert(`  GET  /api/test        ${test4.status} (${test4.ms} ms)`) : rouge(`  GET  /api/test        ${test4.raison} (${test4.ms} ms)`));

    const login = await requete('127.0.0.1', 'POST', '/api/auth/login', { email: 'test@inexistant.tn', password: 'x' });
    console.log(login.ok ? vert(`  POST /api/auth/login  ${login.status} (${login.ms} ms) ${login.corps}`) : rouge(`  POST /api/auth/login  ${login.raison} (${login.ms} ms)`));

    const evalr = await requete('127.0.0.1', 'GET', '/api/evaluation/referentiel');
    console.log(evalr.ok ? vert(`  GET  /api/evaluation  ${evalr.status} (${evalr.ms} ms)`) : rouge(`  GET  /api/evaluation  ${evalr.raison} (${evalr.ms} ms)`));

    // Verdict
    console.log('\n--- VERDICT ---');
    if (!test4.ok && test4.raison === 'TIMEOUT') {
        console.log(rouge('  Le serveur accepte la connexion mais ne répond jamais.'));
        console.log('  → Boucle bloquante ou I/O suspendue. Regardez le lecteur ci-dessus.');
    } else if (!test4.ok) {
        console.log(rouge('  Le serveur est injoignable : ' + test4.raison));
        console.log('  → Port occupé par un autre processus, ou pare-feu, ou serveur non démarré.');
    } else if (test4.ok && !login.ok) {
        console.log(rouge('  /api/test répond mais /api/auth/login pend.'));
        console.log('  → Lecture/écriture de users.json ou activity.json bloquée.');
    } else if (test4.ok && login.ok) {
        console.log(vert('  Le backend fonctionne normalement depuis cette machine.'));
        console.log('  → Le problème est côté navigateur : ouvrez F12 > Réseau,');
        console.log('    relancez le login, et regardez l\'URL exacte appelée et son statut.');
    }
    console.log('');
})();
