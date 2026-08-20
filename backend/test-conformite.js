// backend/test-conformite.js
// ---------------------------------------------------------------------------
// Vérifie les huit contraintes bloquantes et la matrice d'accès.
//     cd backend && node test-conformite.js
// Le serveur n'a pas besoin de tourner : le test monte son propre Express.
// ---------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');

const FICHIER = path.join(__dirname, 'data', 'evaluation.json');
['', '.tmp'].forEach((s) => { try { fs.unlinkSync(FICHIER + s); } catch (e) { /* absent */ } });

const app = express();
app.use(express.json());
app.use('/api/evaluation', require('./Routes/evaluationRoutes'));

const S = 'neuro_science_secret_key_2024';
const jeton = (email, role, name) => jwt.sign({ id: 1, email, role, name }, S);

// Les identités ne sont plus codées en dur : elles sont lues dans le jeu
// amorcé, lui-même construit à partir de users.json. Le test suit donc les
// comptes réels du projet quels qu'ils soient.
const store = require('./evaluation/store');
const amorce = store.lire();
const parRole = (r) => amorce.personne.find((p) => p.role === r);
const RESP = parRole('responsable_structure');
const OBS = parRole('manager_observateur');
const COLLABS = amorce.personne.filter((p) => p.role === 'collaborateur');
if (!RESP || !OBS || COLLABS.length < 2) {
    console.error('❌ Amorçage insuffisant : il faut au moins 4 comptes non-admin dans users.json.');
    process.exit(1);
}
const C1 = COLLABS[0];
const C2 = COLLABS[1];

const T = {
    admin: jeton('admin@octogo.com', 'admin', 'Admin'),
    resp: jeton(RESP.email, 'client', RESP.nom),
    obs: jeton(OBS.email, 'client', OBS.nom),
    c1: jeton(C1.email, 'client', C1.nom),
    c2: jeton(C2.email, 'client', C2.nom)
};

console.log('\nActeurs du test :');
console.log(`  responsable_structure : ${RESP.nom} <${RESP.email}>`);
console.log(`  manager_observateur   : ${OBS.nom} <${OBS.email}>`);
COLLABS.forEach((p) => console.log(`  collaborateur         : ${p.nom} <${p.email}>`));

let reussis = 0,
    echoues = 0;
const ok = (label, condition, detail) => {
    if (condition) { reussis++;
        console.log('  \x1b[32m✅\x1b[0m ' + label); } else { echoues++;
        console.log('  \x1b[31m❌\x1b[0m ' + label + (detail ? '  → ' + JSON.stringify(detail).slice(0, 160) : '')); }
};

let srv;
const appel = async(methode, chemin, token, corps) => {
    const r = await fetch('http://127.0.0.1:5098/api/evaluation' + chemin, {
        method: methode,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: corps ? JSON.stringify(corps) : undefined
    });
    return [r.status, await r.json()];
};

(async() => {
    srv = app.listen(5098);
    await new Promise((r) => setTimeout(r, 300));
    let s, d;

    console.log('\n\x1b[1mC7 — observateur ≠ responsable hiérarchique\x1b[0m');
    [s, d] = await appel('GET', '/contexte', T.obs);
    ok('Mohamed (ligne RH) est observateur d\'Amal (ligne Commerciale) en contexte projet',
        d.capacites && d.capacites.saisir_canal_b === true, d);

    console.log('\n\x1b[1mCompte non inscrit au dispositif\x1b[0m');
    const inconnu = jeton('inconnu@client.tn', 'client', 'Client Inconnu');
    [s, d] = await appel('GET', '/contexte', inconnu);
    ok('Compte client hors dispositif : 200 et non 401', s === 200 && d.enrole === false, { s, d });
    ok('Aucun cycle exposé à un compte non inscrit', d.cycle_courant === null);
    [s, d] = await appel('GET', '/canal-b/1/cockpit', inconnu);
    ok('Cockpit vide plutôt qu\'erreur', s === 200 && d.total === 0, d);

    console.log('\n\x1b[1mAdmin — aucun accès aux données de mesure\x1b[0m');
    [s, d] = await appel('GET', '/canal-b/1/cockpit', T.admin);
    ok('Cockpit de cotation refusé à l\'admin (403 ADMIN_SANS_MESURE)', s === 403 && d.code === 'ADMIN_SANS_MESURE', d);
    [s, d] = await appel('GET', '/referentiel/objets', T.admin);
    ok('Référentiel accessible à l\'admin', s === 200);

    console.log('\n\x1b[1mCockpit — cotation objet par objet (correctif de halo)\x1b[0m');
    [s, d] = await appel('GET', '/canal-b/1/cockpit', T.obs);
    ok('Structure de premier niveau = objets, pas personnes',
        s === 200 && Array.isArray(d.objets) && d.objets.every((o) => Array.isArray(o.personnes)), d);
    ok(`3 objets × ${COLLABS.length} collaborateurs = ${3 * COLLABS.length} cotations attendues`,
        d.total === 3 * COLLABS.length, { total: d.total });

    console.log('\n\x1b[1mC1 — séparation stricte des canaux\x1b[0m');
    ok('Canal A invisible de l\'observateur tant que le cycle est ouvert', d.canal_a_visible === false);
    ok('Aucune donnée canal A n\'est sérialisée dans le cockpit', !JSON.stringify(d).includes('niveau_exigence'));
    [s, d] = await appel('GET', '/canal-a/1', T.c1);
    ok('Canal B invisible du répondant', s === 200 && d.canal_b_visible === false);
    ok('Aucun niveau observé dans la réponse canal A', !JSON.stringify(d.objets).includes('niveau_observe'));

    console.log('\n\x1b[1mC3 — situation datée obligatoire avant le niveau\x1b[0m');
    [s, d] = await appel('PUT', '/canal-b/1/cotation', T.obs, { observe_id: C1.id, objet_id: 1, niveau: 3 });
    ok('Niveau refusé sans situation (422 SITUATION_REQUISE)', s === 422 && d.code === 'SITUATION_REQUISE', d);
    [s, d] = await appel('PUT', '/canal-b/1/cotation', T.obs, { observe_id: C1.id, objet_id: 1, situation_texte: 'A recadré un client mécontent en préservant la relation.', niveau: 3 });
    ok('Niveau refusé sans date (422 DATE_REQUISE)', s === 422 && d.code === 'DATE_REQUISE', d);
    [s, d] = await appel('PUT', '/canal-b/1/cotation', T.obs, { observe_id: C1.id, objet_id: 1, situation_texte: 'A recadré un client mécontent.', situation_date: '2026-12-01', niveau: 3 });
    ok('Date hors période du cycle refusée', s === 422 && d.code === 'DATE_REQUISE', d);

    console.log('\n\x1b[1mC4 — « non observé » n\'est pas zéro\x1b[0m');
    [s, d] = await appel('PUT', '/canal-b/1/cotation', T.obs, { observe_id: C1.id, objet_id: 3, situation_texte: 'Aucune occasion d\'observer cet objet ce trimestre.', situation_date: '2026-08-20', non_observe: true, niveau: 1 });
    ok('« Non observé » + niveau simultanés refusés', s === 422, d);
    [s, d] = await appel('PUT', '/canal-b/1/cotation', T.obs, { observe_id: C1.id, objet_id: 3, situation_texte: 'Aucune occasion d\'observer cet objet ce trimestre.', situation_date: '2026-08-20', non_observe: true });
    ok('« Non observé » stocké avec niveau = null', s === 200 && d.cotation.niveau === null && d.cotation.non_observe === true, d);

    console.log('\n\x1b[1mCloisonnement de la cotation\x1b[0m');
    [s, d] = await appel('PUT', '/canal-b/1/cotation', T.c2, { observe_id: C1.id, objet_id: 2, situation_texte: 'Tentative de cotation par une collègue non observatrice.', situation_date: '2026-08-20', niveau: 4 });
    ok('Une collaboratrice ne peut pas coter une autre', s === 403, d);

    // Saisies valides pour la suite
    const saisies = [
        [C1.id, 1, 2],
        [C1.id, 2, 2],
        [C2.id, 1, 3],
        [C2.id, 2, 2],
        [C2.id, 3, 3]
    ];
    for (const [obs, objet, niv] of saisies) {
        await appel('PUT', '/canal-b/1/cotation', T.obs, {
            observe_id: obs,
            objet_id: objet,
            situation_texte: `Situation documentée pour l'objet ${objet}.`,
            situation_date: '2026-08-15',
            niveau: niv
        });
    }
    for (const [p, tok] of[[C1.id, T.c1], [C2.id, T.c2]]) {
        for (const objet of[1, 2, 3]) {
            await appel('PUT', `/canal-a/1/${objet}`, tok, { niveau_exigence: 3, convergence_a: 4, convergence_b: 4 });
        }
    }

    console.log('\n\x1b[1mPlafond de trois objets\x1b[0m');
    [s, d] = await appel('POST', '/cycles/1/objets-assignes', T.admin, { personne_id: C1.id, objet_ids: [4] });
    ok('4ᵉ objet refusé (422 MAX_OBJETS)', s === 422 && d.code === 'MAX_OBJETS', d);

    console.log('\n\x1b[1mSéquencement hiérarchique\x1b[0m');
    await appel('PUT', `/personnes/${OBS.id}`, T.admin, { premier_cycle_valide: false });
    await appel('POST', '/cycles', T.admin, { entite_id: 1, libelle: 'T4 2026', date_debut: '2026-10-01', date_fin: '2026-12-31' });
    [s, d] = await appel('POST', '/cycles/2/objets-assignes', T.admin, { personne_id: C1.id, objet_ids: [1] });
    ok('Entrée bloquée tant que le responsable N+1 n\'a pas validé son premier cycle',
        s === 422 && d.code === 'SEQUENCEMENT', d);
    await appel('PUT', `/personnes/${OBS.id}`, T.admin, { premier_cycle_valide: true });

    console.log('\n\x1b[1mCréation d\'un rôle DRH par l\'admin\x1b[0m');
    [s, d] = await appel('POST', '/personnes', T.admin, {
        entite_id: 1,
        ligne_id: 1,
        nom: 'Direction RH',
        email: 'drh@demo.local',
        role: 'drh'
    });
    ok('DRH créée par l\'administrateur', s === 201, d);
    const T_drh = jeton('drh@demo.local', 'client', 'Direction RH');

    console.log('\n\x1b[1mRestitution — fermée hors entretien\x1b[0m');
    [s, d] = await appel('GET', `/restitution/1/${C1.id}`, T.c1);
    ok('Restitution refusée tant que le cycle n\'est pas calculé', s === 409, d);

    console.log('\n\x1b[1mMachine d\'états — clôture atomique et irréversible\x1b[0m');
    [s, d] = await appel('POST', '/cycles/1/clore', T.resp);
    ok('Clôture par le responsable de structure : écarts calculés',
        s === 200 && d.ecarts_calcules === 3 * COLLABS.length, d);
    ok('C8 — aucune signature sur un cycle unique', d.signatures_emises === 0, d);
    [s, d] = await appel('POST', '/cycles/1/clore', T.resp);
    ok('Seconde clôture refusée (409 IRREVERSIBLE)', s === 409 && d.code === 'IRREVERSIBLE', d);
    [s, d] = await appel('PUT', '/canal-b/1/cotation', T.obs, { observe_id: C1.id, objet_id: 1, situation_texte: 'Tentative de modification après clôture.', situation_date: '2026-08-20', niveau: 4 });
    ok('Aucune cotation possible après clôture', s === 409 && d.code === 'CYCLE_FERME', d);

    console.log('\n\x1b[1mC1 — levée de la séparation à la clôture\x1b[0m');
    [s, d] = await appel('GET', '/canal-b/1/cockpit', T.obs);
    ok('Canaux devenus visibles après clôture', d.canal_a_visible === true);

    console.log('\n\x1b[1mRestitution et matrice d\'accès\x1b[0m');
    await appel('POST', '/cycles/1/ouvrir-restitution', T.obs);
    [s, d] = await appel('GET', `/restitution/1/${C1.id}`, T.c1);
    ok('Amal accède à ses résultats une fois la restitution ouverte', s === 200, d);
    ok('Écarts listés objet par objet, jamais moyennés',
        Array.isArray(d.ecarts) && d.ecarts.length === 3 && !('ecart_moyen' in d));
    const nonObs = d.ecarts.find((e) => e.non_observe);
    ok('Objet non observé → écart null, signe indeterminable', !!nonObs && nonObs.ecart === null && nonObs.signe === 'indeterminable', nonObs);
    ok('Mention explicite d\'absence de diagnostic', typeof d.mention === 'string' && d.mention.length > 0);
    ok('Chaque écart porte son NCM', d.ecarts.every((e) => e.ncm && e.ncm.ecart && e.ncm.ecart.code));
    ok('Amal voit le verbatim la concernant', d.ecarts.some((e) => e.situation_texte));

    [s, d] = await appel('GET', `/restitution/1/${C1.id}`, T_drh);
    ok('La DRH accède aux résultats structurés', s === 200);
    ok('La DRH ne reçoit aucun verbatim', d.ecarts.every((e) => e.situation_texte === null));

    [s, d] = await appel('GET', `/restitution/1/${C1.id}`, T.c2);
    ok('Une collaboratrice n\'accède pas aux résultats d\'une autre', s === 403);

    [s, d] = await appel('GET', `/restitution/1/${C1.id}`, T.admin);
    ok('L\'admin n\'accède à aucune restitution', s === 403 && d.code === 'ADMIN_SANS_MESURE');

    console.log('\n\x1b[1mIndice de fiabilité — non opposable\x1b[0m');
    [s, d] = await appel('GET', '/fiabilite/moi', T.obs);
    ok('Ahmed reçoit son propre indice', s === 200 && d.indices.length > 0, d);
    [s, d] = await appel('GET', '/fiabilite/moi', T.resp);
    ok('Le responsable de structure ne reçoit pas celui de ses managers', s === 200 && d.indices.length === 0);

    console.log('\n\x1b[1mDispersion de ligne\x1b[0m');
    [s, d] = await appel('GET', '/dispersion/1/2', T.resp);
    ok('Dispersion calculée par objet, non observés exclus',
        s === 200 && Object.values(d.dispersion_par_objet).every((x) => x.ncm), d);

    console.log('\n\x1b[1mVoie d\'escalade hors dispositif\x1b[0m');
    [s, d] = await appel('POST', '/signalements', T.obs, { nature: 'danger', personne_concernee_id: 14, description: 'Situation de danger constatée sur le poste, à traiter hors dispositif de mesure.' });
    ok('Signalement enregistré hors table de cotation', s === 201, d);
    [s, d] = await appel('GET', '/signalements', T.resp);
    ok('Le responsable de structure n\'accède pas aux signalements', s === 403);
    [s, d] = await appel('GET', '/signalements', T_drh);
    ok('La DRH y accède', s === 200 && d.signalements.length === 1);

    console.log('\n\x1b[1mC5 / C6 — clé serveur et absence de randomisation\x1b[0m');
    const [, brut] = await appel('GET', `/restitution/1/${C1.id}`, T.c1);
    const sortie = JSON.stringify(brut);
    ok('Aucun paramètre de cotation dans la réponse API', !/seuil_bas|kappa_minimum|plafond_objets|ecart_moyen_maximum|version_moteur|PARAMETRES/.test(sortie));
    ok('Le moteur n\'est importé par aucun fichier frontend', !fs.readdirSync(path.join(__dirname, '..', 'frontend', 'src', 'evaluation'), { withFileTypes: true })
        .filter((f) => f.isFile())
        .some((f) => /(import|require)[^\n]*moteur/.test(
            fs.readFileSync(path.join(__dirname, '..', 'frontend', 'src', 'evaluation', f.name), 'utf8'))));
    const fichiersModule = ['evaluation/store.js', 'evaluation/moteur.js', 'evaluation/acces.js', 'evaluation/purge.js', 'Routes/evaluationRoutes.js'];
    ok('Aucun Math.random() dans la chaîne d\'évaluation',
        fichiersModule.every((f) => {
            const sansCommentaires = fs.readFileSync(path.join(__dirname, f), 'utf8')
                .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
            return !/Math\.random\s*\(/.test(sansCommentaires);
        }));

    console.log('\n\x1b[1mPurge du verbatim\x1b[0m');
    const purge = require('./evaluation/purge');
    const store = require('./evaluation/store');
    const dataAvant = store.lire();
    dataAvant.cotation_canal_b.forEach((c) => { c.purge_prevue_le = '2020-01-01'; });
    store.ecrire(dataAvant);
    const traites = purge._executer();
    const dataApres = store.lire();
    ok(`Verbatim écrasé après échéance (${traites} enregistrement(s))`, traites > 0);
    ok('Aucun texte de situation résiduel',
        dataApres.cotation_canal_b.every((c) => c.situation_texte === null));
    ok('Niveaux et dates conservés',
        dataApres.cotation_canal_b.some((c) => c.niveau != null && c.situation_date != null));
    ok('Trace de purge conservée sans le contenu',
        dataApres.journal_purge.some((j) => j.enregistrements_traites > 0));

    console.log(`\n\x1b[1mRésultat : ${reussis} réussis, ${echoues} échoués\x1b[0m\n`);
    srv.close();
    process.exit(echoues === 0 ? 0 : 1);
})();