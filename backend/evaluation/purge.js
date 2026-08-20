// backend/evaluation/purge.js
// -----------------------------------------------------------------------------
// Purge du verbatim — section 05 de la fiche technique.
// Tâche planifiée côté serveur, jamais déclenchée manuellement, jamais
// désactivable par un administrateur client. Aucune route HTTP ne l'expose.
//
// Ce qui est purgé : situation_texte uniquement, après deux cycles glissants.
// Ce qui survit : niveau, écart, signature, date, observateur, contexte.
// Ce qui est conservé de la purge : sa trace — date, volume — jamais le contenu.
// -----------------------------------------------------------------------------
const store = require('./store');

const INTERVALLE_MS = 24 * 60 * 60 * 1000; // une fois par jour
let minuterie = null;

// purge_prevue_le est posée à la clôture du cycle : fin du cycle + 2 trimestres.
const datePurgePrevue = (dateFinCycle) => {
    const d = new Date(dateFinCycle);
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
};

function executer() {
    const data = store.lire();
    const aujourdhui = new Date().toISOString().slice(0, 10);
    let traites = 0;

    data.cotation_canal_b.forEach((c) => {
        if (!c.purge_prevue_le) return;
        if (c.purge_effectuee_le) return;
        if (c.purge_prevue_le > aujourdhui) return;
        if (!c.situation_texte) { c.purge_effectuee_le = new Date().toISOString(); return; }
        c.situation_texte = null;          // écrasement du champ
        c.purge_effectuee_le = new Date().toISOString();
        traites++;
    });

    // Cotations de calibrage : habilitation + 1 an.
    data.cotation_calibrage.forEach((c) => {
        if (c.purge_prevue_le && !c.purge_effectuee_le && c.purge_prevue_le <= aujourdhui) {
            c.purge_effectuee_le = new Date().toISOString();
            traites++;
        }
    });

    if (traites > 0 || estPremiereDuJour(data, aujourdhui)) {
        data.journal_purge.push({
            id: store.prochainId(data, 'journal_purge'),
            execute_le: new Date().toISOString(),
            enregistrements_traites: traites,
            commentaire: traites === 0 ? 'Aucun enregistrement échu.' : 'Verbatim écrasé.'
        });
        store.ecrire(data);
        if (traites > 0) console.log(`🧹 Purge du verbatim : ${traites} enregistrement(s).`);
    }
    return traites;
}

const estPremiereDuJour = (data, jour) => {
    const derniere = data.journal_purge[data.journal_purge.length - 1];
    return !derniere || !String(derniere.execute_le).startsWith(jour);
};

function demarrer() {
    if (minuterie) return;
    executer();                                   // une passe au démarrage
    minuterie = setInterval(executer, INTERVALLE_MS);
    if (minuterie.unref) minuterie.unref();
    console.log('🧹 Tâche de purge du verbatim planifiée (24 h).');
}

module.exports = { demarrer, datePurgePrevue, _executer: executer };
