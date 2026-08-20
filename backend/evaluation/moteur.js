// backend/evaluation/moteur.js
// -----------------------------------------------------------------------------
// C5 — CLÉ DE COTATION. Ce fichier ne doit jamais être importé par le frontend,
// jamais sérialisé dans une réponse API, jamais inséré dans un prompt.
// Recodage des items inversés, pondérations, seuils de drapeau et règles
// d'agrégation vivent ici et nulle part ailleurs.
//
// Toutes les règles sont déterministes et versionnées. Aucune ne passe par un
// modèle. Aucun Math.random() n'est admis dans ce fichier (C6).
// -----------------------------------------------------------------------------

const VERSION_MOTEUR = 'eca-moteur-1.0.0';

// ---------------------------------------------------------------------------
// NCM — niveau de certitude méthodologique attaché à chaque indicateur produit.
// Aucun indicateur ne sort du moteur sans son NCM (section 05 de la fiche).
// ---------------------------------------------------------------------------
const NCM = {
    ETABLI: { code: 'NCM-1', libelle: 'Établi', note: 'Mesure directe, règle de calcul stabilisée.' },
    FONDE: { code: 'NCM-2', libelle: 'Fondé, non calibré', note: 'Construit théoriquement ; seuils non validés empiriquement.' },
    EXPLORATOIRE: { code: 'NCM-3', libelle: 'Exploratoire', note: 'Indicateur en cours de construction ; lecture indicative.' }
};

const NCM_PAR_INDICATEUR = {
    niveau_observe: NCM.ETABLI,
    niveau_exigence: NCM.ETABLI,
    ecart: NCM.FONDE,
    signature: NCM.FONDE,
    score_levier: NCM.FONDE,
    dispersion_ligne: NCM.EXPLORATOIRE,
    gradient_ligne: NCM.EXPLORATOIRE,
    kappa: NCM.EXPLORATOIRE,
    indice_fiabilite: NCM.EXPLORATOIRE
};

// ---------------------------------------------------------------------------
// Paramètres serveur. Non calibrés à ce jour, révisables après étude pilote.
// Jamais exposés au client.
// ---------------------------------------------------------------------------
const PARAMETRES = {
    seuil_bas_levier: 8.0,        // sur une plage 2..14
    kappa_minimum: 0.70,
    ecart_moyen_maximum: 0.5,
    cycles_consecutifs_signature: 2,
    plafond_objets_par_cycle: 3,
    retention_verbatim_cycles: 2
};

// ---------------------------------------------------------------------------
// ÉCART P–C — par (cycle, personne, objet). Jamais moyenné.
// ---------------------------------------------------------------------------
function calculerEcart(cotationB, declarationA) {
    if (!cotationB || cotationB.non_observe === true) {
        return { ecart: null, signe: 'indeterminable', motif: 'non_observe' };
    }
    if (!declarationA || declarationA.niveau_exigence == null || cotationB.niveau == null) {
        return { ecart: null, signe: 'indeterminable', motif: 'canal_absent' };
    }
    const ecart = declarationA.niveau_exigence - cotationB.niveau; // −3 .. +3
    const signe = ecart === 0 ? 'nul' : (ecart < 0 ? 'negatif' : 'positif');
    return { ecart, signe, motif: null };
}

// INTERDICTION explicite : aucune moyenne d'écarts sur plusieurs objets.
// La fonction n'existe pas. Les écarts se listent.

// ---------------------------------------------------------------------------
// SIGNATURES — C8. Deux cycles consécutifs de même signe minimum.
// Un cycle « indeterminable » rompt la consécutivité sans remettre le
// compteur à zéro : il est ignoré, la série se poursuit de part et d'autre.
// ---------------------------------------------------------------------------
const TYPE_SIGNATURE = { nul: 'regime_maintenu', negatif: 'sous_utilisation', positif: 'surcharge_chronique' };

function determinerSignature(ecartsChronologiques) {
    const retenus = ecartsChronologiques.filter((e) => e.signe !== 'indeterminable');
    if (retenus.length < PARAMETRES.cycles_consecutifs_signature) {
        return { emettre: false, motif: 'cycles_insuffisants', cycles_retenus: retenus.length };
    }
    const dernier = retenus[retenus.length - 1].signe;
    let consecutifs = 0;
    for (let i = retenus.length - 1; i >= 0; i--) {
        if (retenus[i].signe === dernier) consecutifs++; else break;
    }
    if (consecutifs < PARAMETRES.cycles_consecutifs_signature) {
        return { emettre: false, motif: 'signe_non_stable', cycles_retenus: consecutifs };
    }
    return {
        emettre: true,
        type: TYPE_SIGNATURE[dernier],
        signe: dernier,
        cycles_consecutifs: consecutifs,
        ncm: NCM_PAR_INDICATEUR.signature
    };
}

// ---------------------------------------------------------------------------
// BLOCS I ET III — recodage. La valeur recodée n'est jamais stockée.
// ---------------------------------------------------------------------------
function recoder(item, valeurBrute) {
    if (item.type === 'inverse') return (item.echelle_points + 1) - valeurBrute;
    return valeurBrute;
}

function evaluerValidite(items, reponses) {
    const motifs = [];
    const parItem = new Map(items.map((i) => [i.id, i]));

    const attention = reponses.filter((r) => (parItem.get(r.item_id) || {}).type === 'attention');
    if (attention.some((r) => r.valeur_brute !== 1 && r.valeur_brute !== 7)) motifs.push('item_attention_echoue');

    const valeurs = reponses.map((r) => r.valeur_brute);
    if (valeurs.length >= 20 && new Set(valeurs).size === 1) motifs.push('variance_nulle');

    const desirabilite = reponses.filter((r) => (parItem.get(r.item_id) || {}).type === 'desirabilite');
    const desirabiliteExtreme = desirabilite.length > 0 && desirabilite.every((r) => r.valeur_brute >= 7);

    const sincerite = reponses.find((r) => (parItem.get(r.item_id) || {}).type === 'sincerite');
    const sinceriteFaible = sincerite && sincerite.valeur_brute <= 2;

    if (motifs.includes('item_attention_echoue') || motifs.includes('variance_nulle')) {
        return { statut: 'invalidee', motifs };
    }
    if (desirabiliteExtreme) return { statut: 'signalee', motifs: [...motifs, 'desirabilite_extreme'] };
    if (sinceriteFaible) return { statut: 'signalee', motifs: [...motifs, 'sincerite_faible'] };
    return { statut: 'valide', motifs: [] };
}

function calculerLeviers(items, reponses) {
    const parItem = new Map(items.map((i) => [i.id, i]));
    const paires = new Map();
    reponses.forEach((r) => {
        const item = parItem.get(r.item_id);
        if (!item || !item.paire_id) return;
        if (!paires.has(item.paire_id)) paires.set(item.paire_id, { levier: item.levier, total: 0, n: 0 });
        const p = paires.get(item.paire_id);
        p.total += recoder(item, r.valeur_brute);
        p.n++;
    });
    const parLevier = {};
    paires.forEach((p) => {
        if (!p.levier || p.n < 2) return;
        if (!parLevier[p.levier]) parLevier[p.levier] = [];
        parLevier[p.levier].push(p.total); // score_paire, plage 2..14
    });
    const scores = {};
    Object.entries(parLevier).forEach(([levier, liste]) => {
        scores[levier] = liste.reduce((a, b) => a + b, 0) / liste.length;
    });
    return scores;
}

// Signalement de condition : REC, EQU ou TER bas → lecture non concluante.
function conditionSignalee(scoresLevier) {
    return ['REC', 'EQU', 'TER'].some(
        (l) => scoresLevier[l] != null && scoresLevier[l] < PARAMETRES.seuil_bas_levier
    );
}

// ---------------------------------------------------------------------------
// DISPERSION DE LIGNE — indicateur propriétaire. Les « non observé » sont
// exclus du calcul, jamais imputés.
// ---------------------------------------------------------------------------
function dispersionLigne(cotations, profondeurParPersonne) {
    const retenues = cotations.filter((c) => c.non_observe !== true && c.niveau != null);
    if (retenues.length < 2) {
        return { dispersion: null, gradient: null, n: retenues.length, ncm: NCM_PAR_INDICATEUR.dispersion_ligne };
    }
    const niveaux = retenues.map((c) => c.niveau);
    const moyenne = niveaux.reduce((a, b) => a + b, 0) / niveaux.length;
    const variance = niveaux.reduce((a, n) => a + (n - moyenne) ** 2, 0) / niveaux.length;
    const dispersion = Math.sqrt(variance);

    const profondeurs = retenues.map((c) => profondeurParPersonne[c.observe_id] ?? null);
    let gradient = null;
    if (profondeurs.every((p) => p != null)) {
        const mp = profondeurs.reduce((a, b) => a + b, 0) / profondeurs.length;
        const num = profondeurs.reduce((a, p, i) => a + (p - mp) * (niveaux[i] - moyenne), 0);
        const dp = Math.sqrt(profondeurs.reduce((a, p) => a + (p - mp) ** 2, 0));
        const dn = Math.sqrt(niveaux.reduce((a, n) => a + (n - moyenne) ** 2, 0));
        gradient = (dp > 0 && dn > 0) ? num / (dp * dn) : null;
    }
    return {
        dispersion: Number(dispersion.toFixed(3)),
        gradient: gradient == null ? null : Number(gradient.toFixed(3)),
        n: retenues.length,
        ncm: NCM_PAR_INDICATEUR.dispersion_ligne
    };
}

// ---------------------------------------------------------------------------
// KAPPA DE COHEN — habilitation par objet.
// ---------------------------------------------------------------------------
function kappaCohen(paires) {
    if (paires.length === 0) return { kappa: null, ecart_moyen: null, biais: null };
    const n = paires.length;
    const accord = paires.filter((p) => p.cote === p.reference).length / n;

    const categories = [...new Set(paires.flatMap((p) => [p.cote, p.reference]))];
    let attendu = 0;
    categories.forEach((cat) => {
        const pc = paires.filter((p) => p.cote === cat).length / n;
        const pr = paires.filter((p) => p.reference === cat).length / n;
        attendu += pc * pr;
    });
    const kappa = attendu === 1 ? 1 : (accord - attendu) / (1 - attendu);

    const numeriques = paires.filter((p) => typeof p.cote === 'number' && typeof p.reference === 'number');
    const ecarts = numeriques.map((p) => p.cote - p.reference);
    const ecartMoyen = ecarts.length ? ecarts.reduce((a, e) => a + Math.abs(e), 0) / ecarts.length : null;
    const biais = ecarts.length ? ecarts.reduce((a, e) => a + e, 0) / ecarts.length : null;

    return {
        kappa: Number(kappa.toFixed(3)),
        ecart_moyen: ecartMoyen == null ? null : Number(ecartMoyen.toFixed(3)),
        biais: biais == null ? null : Number(biais.toFixed(3)),
        ncm: NCM_PAR_INDICATEUR.kappa
    };
}

function habilitationAccordee(resultat) {
    return resultat.kappa != null
        && resultat.kappa >= PARAMETRES.kappa_minimum
        && resultat.ecart_moyen != null && resultat.ecart_moyen <= PARAMETRES.ecart_moyen_maximum
        && resultat.biais != null && Math.abs(resultat.biais) <= 0.25;
}

// ---------------------------------------------------------------------------
// INDICE DE FIABILITÉ OBSERVATEUR — restitué à l'observateur seul.
// ---------------------------------------------------------------------------
function indiceFiabilite(cotationsObservateur, cotationsTousObservateurs) {
    const total = cotationsObservateur.length;
    const renseignees = cotationsObservateur.filter((c) => c.niveau != null || c.non_observe === true);
    const completude = total === 0 ? 0 : renseignees.length / total;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, non_observe: 0 };
    cotationsObservateur.forEach((c) => {
        if (c.non_observe) distribution.non_observe++;
        else if (c.niveau != null) distribution[c.niveau]++;
    });

    const notees = cotationsObservateur.filter((c) => c.niveau != null).map((c) => c.niveau);
    const moyenneSienne = notees.length ? notees.reduce((a, b) => a + b, 0) / notees.length : null;
    const autres = cotationsTousObservateurs.filter((c) => c.niveau != null).map((c) => c.niveau);
    const moyenneGlobale = autres.length ? autres.reduce((a, b) => a + b, 0) / autres.length : null;
    const derive = (moyenneSienne != null && moyenneGlobale != null)
        ? Number((moyenneSienne - moyenneGlobale).toFixed(3)) : null;

    const drapeaux = [];
    if (completude < 0.8) drapeaux.push('completude_faible');
    if (derive != null && derive <= -0.5) drapeaux.push('severite');
    if (derive != null && derive >= 0.5) drapeaux.push('indulgence');
    if (notees.length >= 5 && new Set(notees).size <= 1) drapeaux.push('tendance_centrale');

    return {
        taux_completude: Number(completude.toFixed(3)),
        distribution_niveaux: distribution,
        derive_severite: derive,
        accord_double_observation: null,
        drapeaux,
        ncm: NCM_PAR_INDICATEUR.indice_fiabilite
    };
}

module.exports = {
    VERSION_MOTEUR,
    NCM,
    NCM_PAR_INDICATEUR,
    PARAMETRES,
    calculerEcart,
    determinerSignature,
    recoder,
    evaluerValidite,
    calculerLeviers,
    conditionSignalee,
    dispersionLigne,
    kappaCohen,
    habilitationAccordee,
    indiceFiabilite
};
