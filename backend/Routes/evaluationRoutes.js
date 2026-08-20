// backend/Routes/evaluationRoutes.js
// -----------------------------------------------------------------------------
// Module ÉVALUATION — conforme à la fiche technique v1.0.
// Base locale (JSON), schéma calqué sur les quinze entités cibles.
//
// Les huit contraintes bloquantes sont vérifiées ICI, côté serveur :
//   C1 séparation des canaux · C2 aucune cotation par IA · C3 situation
//   obligatoire · C4 « non observé » ≠ zéro · C5 clé hors client · C6 aucune
//   randomisation · C7 observateur ≠ hiérarchique · C8 aucun diagnostic sur
//   un cycle unique.
// -----------------------------------------------------------------------------
const express = require('express');
const jwt = require('jsonwebtoken');

const store = require('../evaluation/store');
const moteur = require('../evaluation/moteur'); // C5 — jamais exposé
const acces = require('../evaluation/acces');
const purge = require('../evaluation/purge');

const router = express.Router();
const JWT_SECRET = 'neuro_science_secret_key_2024';

// Tant que le manuel d'évaluateur n'a pas livré les cas-étalons, l'habilitation
// par objet ne peut pas être obtenue. Le contrôle existe et se déclenche en
// basculant ce drapeau — il ne sera pas à écrire plus tard.
const EXIGER_HABILITATION = false;

const MSG = {
    max_objets: 'Un collaborateur ne peut pas avoir plus de 3 objets d\u2019évaluation par cycle trimestriel.',
    situation: 'La situation observée est obligatoire avant l\u2019attribution du niveau.',
    date: 'La date d\u2019observation est obligatoire et doit tomber dans la période du cycle.',
    admin_mesure: 'Le rôle administrateur n\u2019a aucun accès aux données de mesure.',
    cycle_ferme: 'Aucune saisie n\u2019est possible : le cycle n\u2019est plus ouvert.',
    irreversible: 'La clôture est irréversible : un cycle clos ne peut pas être rouvert.'
};

// ============================================================================
// AUTHENTIFICATION — réutilise le JWT existant, aucun nouveau login.
// L'utilisateur applicatif est rattaché à une personne du dispositif par email.
// ============================================================================
const acteurDepuisJeton = (req) => {
    const h = req.headers.authorization;
    if (!h || !h.startsWith('Bearer ')) return null;
    let jeton;
    try { jeton = jwt.verify(h.slice(7), JWT_SECRET); } catch { return null; }

    const data = store.lire();
    const email = String(jeton.email || '').trim().toLowerCase();
    const personne = data.personne.find((p) => String(p.email || '').trim().toLowerCase() === email);

    if (!personne) {
        // Un compte applicatif « admin » sans fiche personne reste administrateur.
        if (jeton.role === 'admin') {
            return { id: null, nom: jeton.name || 'Administrateur', email, role: 'admin', entite_id: null, ligne_id: null };
        }
        // Compte authentifié mais non inscrit au dispositif d'évaluation.
        // Ce n'est PAS un défaut d'authentification : l'utilisateur est
        // légitime, il n'est simplement rattaché à aucune entité. Renvoyer 401
        // ici afficherait « Authentification requise » à un utilisateur
        // correctement connecté. Les routes de mesure le rejetteront d'elles-mêmes.
        return { id: null, nom: jeton.name || email, email, role: 'non_enrole', entite_id: null, ligne_id: null };
    }
    // Le rôle du dispositif prime sur le rôle applicatif, sauf pour l'admin.
    return Object.assign({}, personne, { role: jeton.role === 'admin' ? 'admin' : personne.role });
};

const authentifier = (req, res, next) => {
    req.acteur = acteurDepuisJeton(req);
    if (!req.acteur) return res.status(401).json({ success: false, message: 'Authentification requise.' });
    next();
};

const roles = (...autorises) => (req, res, next) => {
    if (!autorises.includes(req.acteur.role)) {
        return res.status(403).json({ success: false, message: 'Rôle non autorisé pour cette opération.' });
    }
    next();
};

// Barrière explicite : aucune donnée de mesure ne transite vers un admin.
const horsMesurePourAdmin = (req, res, next) => {
    if (acces.interditAdmin(req.acteur)) {
        return res.status(403).json({ success: false, code: 'ADMIN_SANS_MESURE', message: MSG.admin_mesure });
    }
    next();
};

// ============================================================================
// HELPERS
// ============================================================================
const nomPersonne = (d, id) => (d.personne.find((p) => p.id === id) || {}).nom || '—';
const libelleObjet = (d, id) => (d.objet.find((o) => o.id === id) || {}).libelle || '—';
const trouverCycle = (d, id) => d.cycle.find((c) => c.id === Number(id));
const dansPeriode = (date, cycle) => !!date && date >= cycle.date_debut && date <= cycle.date_fin;

const habilitationValide = (d, observateurId, objetId) => {
    if (!EXIGER_HABILITATION) return true;
    const aujourdhui = new Date().toISOString().slice(0, 10);
    return d.habilitation.some((h) =>
        h.observateur_id === observateurId && h.objet_id === objetId &&
        h.statut === 'habilite' && h.expire_le >= aujourdhui);
};

// ============================================================================
// CONTEXTE
// ============================================================================
router.get('/contexte', authentifier, (req, res) => {
    const d = store.lire();
    const a = req.acteur;

    const enrole = a.id != null;
    const cycles = enrole ? d.cycle.filter((c) => c.entite_id === a.entite_id) : [];
    const courant = cycles.filter((c) => c.statut !== 'archive').slice(-1)[0] || cycles.slice(-1)[0] || null;

    res.json({
        success: true,
        acteur: { id: a.id, nom: a.nom, email: a.email, role: a.role, ligne_id: a.ligne_id, entite_id: a.entite_id },
        enrole,
        cycle_courant: courant,
        capacites: {
            saisir_canal_a: enrole && d.objet_assigne.some((o) => o.personne_id === a.id),
            saisir_canal_b: enrole && d.relation_observation.some((r) => r.observateur_id === a.id),
            piloter_cycles: ['responsable_structure', 'drh', 'admin'].includes(a.role),
            administrer: a.role === 'admin',
            voir_mesure: !acces.interditAdmin(a)
        },
        ncm_reference: moteur.NCM
    });
});

// ============================================================================
// ORGANISATION — administration des comptes, rôles et structures.
// ============================================================================
router.get('/entites', authentifier, roles('admin', 'drh', 'responsable_structure'), (req, res) => {
    const d = store.lire();
    res.json({
        success: true,
        entites: d.entite.map((e) => ({
            ...e,
            nb_lignes: d.ligne_hierarchique.filter((l) => l.entite_id === e.id).length,
            nb_personnes: d.personne.filter((p) => p.entite_id === e.id).length,
            nb_cycles: d.cycle.filter((c) => c.entite_id === e.id).length
        }))
    });
});

router.post('/entites', authentifier, roles('admin'), (req, res) => {
    const { nom, email, telephone } = req.body || {};
    if (!nom || !String(nom).trim()) return res.status(400).json({ success: false, message: 'Nom obligatoire.' });
    const d = store.lire();
    const entite = {
        id: store.prochainId(d, 'entite'),
        nom: String(nom).trim(),
        email: (email || '').trim(),
        telephone: (telephone || '').trim(),
        cree_le: new Date().toISOString()
    };
    d.entite.push(entite);
    store.tracer(d, req.acteur.nom, 'CREATION_ENTITE', entite.nom);
    store.ecrire(d);
    res.status(201).json({ success: true, entite });
});

router.get('/entites/:id', authentifier, roles('admin', 'drh', 'responsable_structure'), (req, res) => {
    const d = store.lire();
    const id = Number(req.params.id);
    const entite = d.entite.find((e) => e.id === id);
    if (!entite) return res.status(404).json({ success: false, message: 'Entité introuvable.' });

    const lignes = d.ligne_hierarchique.filter((l) => l.entite_id === id);
    const personnes = d.personne.filter((p) => p.entite_id === id).map((p) => ({
        ...p,
        ligne_libelle: (lignes.find((l) => l.id === p.ligne_id) || {}).libelle || '—'
    }));
    const relations = d.relation_observation
        .filter((r) => personnes.some((p) => p.id === r.observe_id))
        .map((r) => ({...r, observe_nom: nomPersonne(d, r.observe_id), observateur_nom: nomPersonne(d, r.observateur_id) }));

    res.json({ success: true, entite, lignes, personnes, relations });
});

router.post('/lignes', authentifier, roles('admin'), (req, res) => {
    const { entite_id, libelle, parent_ligne_id, responsable_id } = req.body || {};
    const d = store.lire();
    const parent = parent_ligne_id ? d.ligne_hierarchique.find((l) => l.id === Number(parent_ligne_id)) : null;
    if (parent_ligne_id && !parent) return res.status(400).json({ success: false, message: 'Ligne parente invalide.' });

    const id = store.prochainId(d, 'ligne_hierarchique');
    const ligne = {
        id,
        entite_id: Number(entite_id),
        parent_ligne_id: parent ? parent.id : null,
        libelle: String(libelle || '').trim(),
        responsable_id: responsable_id ? Number(responsable_id) : null,
        niveau_profondeur: parent ? parent.niveau_profondeur + 1 : 0,
        // Chemin matérialisé : évite une récursion à chaque lecture et se
        // transposera tel quel en politique Postgres.
        chemin: parent ? `${parent.chemin}.${id}` : String(id)
    };
    d.ligne_hierarchique.push(ligne);
    store.tracer(d, req.acteur.nom, 'CREATION_LIGNE', ligne.libelle);
    store.ecrire(d);
    res.status(201).json({ success: true, ligne });
});

router.post('/personnes', authentifier, roles('admin'), (req, res) => {
    const { entite_id, ligne_id, nom, email, role } = req.body || {};
    if (!nom || !acces.ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: 'Nom et rôle valides obligatoires.' });
    }
    const d = store.lire();
    const personne = {
        id: store.prochainId(d, 'personne'),
        entite_id: Number(entite_id),
        ligne_id: ligne_id ? Number(ligne_id) : null,
        nom: String(nom).trim(),
        email: String(email || '').trim(),
        role,
        actif: true,
        premier_cycle_valide: false
    };
    d.personne.push(personne);
    store.tracer(d, req.acteur.nom, 'CREATION_PERSONNE', `${personne.nom} — ${role}`);
    store.ecrire(d);
    res.status(201).json({ success: true, personne });
});

router.put('/personnes/:id', authentifier, roles('admin'), (req, res) => {
    const d = store.lire();
    const p = d.personne.find((x) => x.id === Number(req.params.id));
    if (!p) return res.status(404).json({ success: false, message: 'Personne introuvable.' });

    const { nom, email, role, ligne_id, actif, premier_cycle_valide } = req.body || {};
    if (nom !== undefined) p.nom = String(nom).trim();
    if (email !== undefined) p.email = String(email).trim();
    if (role !== undefined && acces.ROLES.includes(role)) p.role = role;
    if (ligne_id !== undefined) p.ligne_id = ligne_id ? Number(ligne_id) : null;
    if (actif !== undefined) p.actif = !!actif;
    if (premier_cycle_valide !== undefined) p.premier_cycle_valide = !!premier_cycle_valide;

    store.tracer(d, req.acteur.nom, 'MODIFICATION_PERSONNE', p.nom, `Rôle : ${p.role}`);
    store.ecrire(d);
    res.json({ success: true, personne: p });
});

// --- C7 : relation d'observation, entité à part entière ---------------------
router.post('/relations-observation', authentifier, roles('admin'), (req, res) => {
    const { observe_id, observateur_id, contexte, periode_debut, periode_fin, ligne_id } = req.body || {};
    if (Number(observe_id) === Number(observateur_id)) {
        return res.status(400).json({ success: false, message: 'Une personne ne peut pas s\u2019observer elle-même.' });
    }
    if (!['hierarchique', 'projet', 'filiere'].includes(contexte)) {
        return res.status(400).json({ success: false, message: 'Contexte invalide : hierarchique, projet ou filiere.' });
    }
    const d = store.lire();
    const relation = {
        id: store.prochainId(d, 'relation_observation'),
        observe_id: Number(observe_id),
        observateur_id: Number(observateur_id),
        contexte,
        periode_debut: periode_debut || new Date().toISOString().slice(0, 10),
        periode_fin: periode_fin || null,
        ligne_id: ligne_id ? Number(ligne_id) : null
    };
    d.relation_observation.push(relation);
    store.tracer(d, req.acteur.nom, 'CREATION_RELATION_OBSERVATION',
        `${nomPersonne(d, relation.observateur_id)} → ${nomPersonne(d, relation.observe_id)}`, `Contexte : ${contexte}`);
    store.ecrire(d);
    res.status(201).json({ success: true, relation });
});

router.delete('/relations-observation/:id', authentifier, roles('admin'), (req, res) => {
    const d = store.lire();
    const avant = d.relation_observation.length;
    d.relation_observation = d.relation_observation.filter((r) => r.id !== Number(req.params.id));
    if (d.relation_observation.length === avant) return res.status(404).json({ success: false, message: 'Relation introuvable.' });
    store.tracer(d, req.acteur.nom, 'SUPPRESSION_RELATION_OBSERVATION', `#${req.params.id}`);
    store.ecrire(d);
    res.json({ success: true });
});

// ============================================================================
// RÉFÉRENTIEL
// ============================================================================
router.get('/referentiel/objets', authentifier, (req, res) => {
    const d = store.lire();
    res.json({ success: true, objets: d.objet.filter((o) => o.actif !== false) });
});

router.get('/referentiel/objets/:id/descripteurs', authentifier, (req, res) => {
    const d = store.lire();
    const objetId = Number(req.params.id);
    const descripteurs = d.descripteur_niveau
        .filter((x) => x.objet_id === objetId)
        .sort((a, b) => a.niveau - b.niveau)
        // formulation_canal_a n'est servie qu'au répondant, jamais à l'observateur.
        .map((x) => (req.acteur.role === 'collaborateur' ?
            { niveau: x.niveau, formulation_canal_a: x.formulation_canal_a } :
            { niveau: x.niveau, question_tri: x.question_tri, manifestations: x.manifestations, exclusions: x.exclusions }));
    res.json({ success: true, descripteurs });
});

router.post('/referentiel/objets', authentifier, roles('admin'), (req, res) => {
    const { code, libelle, registre, secteur } = req.body || {};
    if (!libelle || !code) return res.status(400).json({ success: false, message: 'Code et libellé obligatoires.' });
    const d = store.lire();
    if (d.objet.some((o) => o.code === code)) return res.status(409).json({ success: false, message: 'Code déjà utilisé.' });
    const objet = {
        id: store.prochainId(d, 'objet'),
        code: String(code).trim(),
        libelle: String(libelle).trim(),
        registre: registre === 'situe' ? 'situe' : 'socle',
        secteur: secteur || null,
        version: 1,
        actif: true
    };
    d.objet.push(objet);
    store.tracer(d, req.acteur.nom, 'CREATION_OBJET', objet.code);
    store.ecrire(d);
    res.status(201).json({ success: true, objet });
});

// ============================================================================
// CYCLES ET MACHINE D'ÉTATS
//   ouvert → saisie_close → calcule → archive
// La transition ouvert → saisie_close est atomique et irréversible.
// ============================================================================
router.get('/cycles', authentifier, (req, res) => {
    const d = store.lire();
    const a = req.acteur;
    const cycles = d.cycle
        .filter((c) => a.entite_id == null || c.entite_id === a.entite_id)
        .map((c) => ({
            ...c,
            entite_nom: (d.entite.find((e) => e.id === c.entite_id) || {}).nom || '—',
            nb_personnes: new Set(d.objet_assigne.filter((o) => o.cycle_id === c.id).map((o) => o.personne_id)).size,
            nb_cotations: d.cotation_canal_b.filter((x) => x.cycle_id === c.id).length,
            nb_cotations_faites: d.cotation_canal_b.filter((x) => x.cycle_id === c.id && (x.niveau != null || x.non_observe)).length
        }));
    res.json({ success: true, cycles });
});

router.post('/cycles', authentifier, roles('admin', 'responsable_structure', 'drh'), (req, res) => {
    const { entite_id, libelle, date_debut, date_fin } = req.body || {};
    if (!libelle || !date_debut || !date_fin) {
        return res.status(400).json({ success: false, message: 'Libellé et période obligatoires.' });
    }
    if (new Date(date_fin) < new Date(date_debut)) {
        return res.status(400).json({ success: false, message: 'La date de fin précède la date de début.' });
    }
    const d = store.lire();
    const eid = Number(entite_id);
    const precedents = d.cycle.filter((c) => c.entite_id === eid);
    const cycle = {
        id: store.prochainId(d, 'cycle'),
        entite_id: eid,
        numero: precedents.length + 1,
        libelle: String(libelle).trim(),
        date_debut,
        date_fin,
        statut: 'ouvert',
        cloture_le: null,
        calcule_le: null,
        restitution_ouverte: false,
        cree_le: new Date().toISOString()
    };
    d.cycle.push(cycle);
    store.tracer(d, req.acteur.nom, 'CREATION_CYCLE', cycle.libelle, `${date_debut} → ${date_fin}`);
    store.ecrire(d);
    res.status(201).json({ success: true, cycle });
});

// --- Assignation des objets : plafond de 3 + séquencement hiérarchique ------
router.post('/cycles/:id/objets-assignes', authentifier, roles('admin', 'responsable_structure', 'drh'), (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });
    if (cycle.statut !== 'ouvert') return res.status(409).json({ success: false, message: MSG.cycle_ferme });

    const personneId = Number((req.body || {}).personne_id);
    const objetIds = [...new Set(((req.body || {}).objet_ids || []).map(Number))];

    // Plafond dur — vérifié serveur, pas un défaut modifiable.
    if (objetIds.length > moteur.PARAMETRES.plafond_objets_par_cycle) {
        return res.status(422).json({ success: false, code: 'MAX_OBJETS', message: MSG.max_objets });
    }
    const dejaAssignes = d.objet_assigne
        .filter((o) => o.cycle_id === cycle.id && o.personne_id === personneId)
        .map((o) => o.objet_id);
    const total = new Set([...dejaAssignes, ...objetIds]).size;
    if (total > moteur.PARAMETRES.plafond_objets_par_cycle) {
        return res.status(422).json({
            success: false,
            code: 'MAX_OBJETS',
            message: `${MSG.max_objets} (${nomPersonne(d, personneId)} atteindrait ${total} objets.)`
        });
    }

    // Séquencement hiérarchique — vérifié à l'assignation, pas à l'affichage.
    const seq = acces.sequencementRespecte(d, personneId);
    if (!seq.ok) return res.status(422).json({ success: false, code: seq.code || 'SEQUENCEMENT', message: seq.message });

    objetIds.forEach((objetId) => {
        if (dejaAssignes.includes(objetId)) return;
        d.objet_assigne.push({
            id: store.prochainId(d, 'objet_assigne'),
            cycle_id: cycle.id,
            personne_id: personneId,
            objet_id: objetId,
            valide_par_manager: true
        });
    });

    store.tracer(d, req.acteur.nom, 'ASSIGNATION_OBJETS', nomPersonne(d, personneId),
        objetIds.map((o) => libelleObjet(d, o)).join(', '));
    store.ecrire(d);
    res.status(201).json({ success: true, assignes: total });
});

// --- CLÔTURE : transition atomique et irréversible --------------------------
router.post('/cycles/:id/clore', authentifier, roles('admin', 'responsable_structure', 'drh'), (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });
    if (cycle.statut !== 'ouvert') {
        return res.status(409).json({ success: false, code: 'IRREVERSIBLE', message: MSG.irreversible });
    }

    // Toutes les écritures ci-dessous sont validées en une seule persistance :
    // le cycle ne peut pas rester dans un état intermédiaire.
    cycle.statut = 'saisie_close';
    cycle.cloture_le = new Date().toISOString();

    // Date de purge du verbatim : fin du cycle + deux trimestres.
    d.cotation_canal_b
        .filter((c) => c.cycle_id === cycle.id)
        .forEach((c) => { c.purge_prevue_le = purge.datePurgePrevue(cycle.date_fin); });

    // --- Calcul des écarts -------------------------------------------------
    const assignations = d.objet_assigne.filter((o) => o.cycle_id === cycle.id);
    assignations.forEach((a) => {
        const cotation = d.cotation_canal_b.find((c) =>
            c.cycle_id === cycle.id && c.observe_id === a.personne_id && c.objet_id === a.objet_id);
        const declaration = d.declaration_canal_a.find((x) =>
            x.cycle_id === cycle.id && x.personne_id === a.personne_id && x.objet_id === a.objet_id);

        const r = moteur.calculerEcart(cotation, declaration);
        d.ecart_calcule.push({
            id: store.prochainId(d, 'ecart_calcule'),
            cycle_id: cycle.id,
            personne_id: a.personne_id,
            objet_id: a.objet_id,
            ecart: r.ecart,
            signe: r.signe,
            motif: r.motif,
            condition_signalee: false, // renseigné quand les blocs I/III sont passés
            version_moteur: moteur.VERSION_MOTEUR
        });
    });

    // --- Signatures : C8, jamais sur un cycle unique -----------------------
    const cyclesEntite = d.cycle
        .filter((c) => c.entite_id === cycle.entite_id && c.statut !== 'ouvert')
        .sort((a, b) => a.numero - b.numero);

    const couples = new Set(assignations.map((a) => `${a.personne_id}|${a.objet_id}`));
    let emises = 0;
    couples.forEach((cle) => {
        const [personneId, objetId] = cle.split('|').map(Number);
        const chronologie = cyclesEntite.map((c) =>
            d.ecart_calcule.find((e) => e.cycle_id === c.id && e.personne_id === personneId && e.objet_id === objetId)
        ).filter(Boolean);

        const s = moteur.determinerSignature(chronologie);
        if (!s.emettre) return;

        const existante = d.signature.find((x) => x.personne_id === personneId && x.objet_id === objetId && x.actif !== false);
        if (existante) existante.actif = false;

        d.signature.push({
            id: store.prochainId(d, 'signature'),
            personne_id: personneId,
            objet_id: objetId,
            cycle_id: cycle.id,
            type: s.type,
            cycles_consecutifs: s.cycles_consecutifs,
            statut_traitement: 'traite',
            escalade_vers_id: null,
            actif: true,
            emise_le: new Date().toISOString(),
            version_moteur: moteur.VERSION_MOTEUR
        });
        emises++;
    });

    // --- Indice de fiabilité par observateur -------------------------------
    const cotationsCycle = d.cotation_canal_b.filter((c) => c.cycle_id === cycle.id);
    const observateurs = [...new Set(cotationsCycle.map((c) => c.observateur_id))];
    observateurs.forEach((obsId) => {
        const siennes = cotationsCycle.filter((c) => c.observateur_id === obsId);
        const i = moteur.indiceFiabilite(siennes, cotationsCycle);
        d.indice_fiabilite_observateur.push({
            id: store.prochainId(d, 'indice_fiabilite_observateur'),
            observateur_id: obsId,
            cycle_id: cycle.id,
            ...i
        });
    });

    cycle.statut = 'calcule';
    cycle.calcule_le = new Date().toISOString();

    store.tracer(d, req.acteur.nom, 'CLOTURE_CYCLE', cycle.libelle,
        `${assignations.length} écart(s) calculé(s), ${emises} signature(s) émise(s). Moteur ${moteur.VERSION_MOTEUR}.`);
    store.ecrire(d);

    res.json({
        success: true,
        cycle,
        ecarts_calcules: assignations.length,
        signatures_emises: emises,
        avertissement: emises === 0 ? 'Aucune signature : deux cycles consécutifs de même signe sont requis (C8).' : null
    });
});

// Ouverture de la restitution — geste du manager, au moment de l'entretien.
router.post('/cycles/:id/ouvrir-restitution', authentifier, roles('manager_observateur', 'responsable_structure', 'drh'), (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });
    if (cycle.statut !== 'calcule') return res.status(409).json({ success: false, message: 'Le cycle doit être calculé.' });
    cycle.restitution_ouverte = true;
    store.tracer(d, req.acteur.nom, 'OUVERTURE_RESTITUTION', cycle.libelle);
    store.ecrire(d);
    res.json({ success: true, cycle });
});

router.post('/cycles/:id/archiver', authentifier, roles('admin', 'responsable_structure', 'drh'), (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });
    if (cycle.statut !== 'calcule') return res.status(409).json({ success: false, message: 'Le cycle doit être calculé.' });
    cycle.statut = 'archive';
    store.tracer(d, req.acteur.nom, 'ARCHIVAGE_CYCLE', cycle.libelle);
    store.ecrire(d);
    res.json({ success: true, cycle });
});

// ============================================================================
// CANAL A — exigence perçue, saisie par le répondant.
// C1 : ne renvoie jamais la cotation de l'observateur tant que le cycle est ouvert.
// ============================================================================
router.get('/canal-a/:cycleId', authentifier, horsMesurePourAdmin, (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.cycleId);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });

    const objets = d.objet_assigne
        .filter((o) => o.cycle_id === cycle.id && o.personne_id === req.acteur.id)
        .map((o) => {
            const dec = d.declaration_canal_a.find((x) =>
                x.cycle_id === cycle.id && x.personne_id === req.acteur.id && x.objet_id === o.objet_id);
            return {
                objet_id: o.objet_id,
                objet_libelle: libelleObjet(d, o.objet_id),
                niveau_exigence: dec ? dec.niveau_exigence : null,
                convergence_a: dec ? dec.convergence_a : null,
                convergence_b: dec ? dec.convergence_b : null,
                soumis_le: dec ? dec.soumis_le : null
            };
        });

    res.json({
        success: true,
        cycle,
        saisie_ouverte: cycle.statut === 'ouvert',
        objets,
        // C1 rendu explicite dans la réponse : rien du canal B n'est joint ici.
        canal_b_visible: false
    });
});

router.put('/canal-a/:cycleId/:objetId', authentifier, horsMesurePourAdmin, (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.cycleId);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });
    if (cycle.statut !== 'ouvert') return res.status(409).json({ success: false, message: MSG.cycle_ferme });

    const objetId = Number(req.params.objetId);
    const assigne = d.objet_assigne.some((o) =>
        o.cycle_id === cycle.id && o.personne_id === req.acteur.id && o.objet_id === objetId);
    if (!assigne) return res.status(403).json({ success: false, message: 'Objet non assigné pour ce cycle.' });

    const { niveau_exigence, convergence_a, convergence_b } = req.body || {};
    const niveau = Number(niveau_exigence);
    if (![1, 2, 3, 4].includes(niveau)) {
        return res.status(422).json({ success: false, message: 'Niveau d\u2019exigence attendu entre 1 et 4.' });
    }

    let dec = d.declaration_canal_a.find((x) =>
        x.cycle_id === cycle.id && x.personne_id === req.acteur.id && x.objet_id === objetId);
    if (!dec) {
        dec = {
            id: store.prochainId(d, 'declaration_canal_a'),
            cycle_id: cycle.id,
            personne_id: req.acteur.id,
            objet_id: objetId,
            niveau_exigence: null,
            convergence_a: null,
            convergence_b: null,
            soumis_le: null
        };
        d.declaration_canal_a.push(dec);
    }
    dec.niveau_exigence = niveau;
    if (convergence_a != null) dec.convergence_a = Number(convergence_a);
    if (convergence_b != null) dec.convergence_b = Number(convergence_b);
    dec.soumis_le = new Date().toISOString();

    store.ecrire(d);
    res.json({ success: true, declaration: dec });
});

// ============================================================================
// CANAL B — cotation par l'observateur.
// Contrainte d'interface portée par l'API : le cockpit est organisé OBJET PAR
// OBJET pour toute l'équipe, jamais personne par personne. C'est le correctif
// de l'effet de halo, et la structure de la réponse l'impose.
// ============================================================================
router.get('/canal-b/:cycleId/cockpit', authentifier, horsMesurePourAdmin, (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.cycleId);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });

    const mesRelations = d.relation_observation.filter((r) =>
        r.observateur_id === req.acteur.id &&
        (!r.periode_fin || r.periode_fin >= cycle.date_debut) &&
        r.periode_debut <= cycle.date_fin);

    const observes = [...new Set(mesRelations.map((r) => r.observe_id))];

    // Regroupement par objet, puis par personne.
    const parObjet = new Map();
    d.objet_assigne
        .filter((o) => o.cycle_id === cycle.id && observes.includes(o.personne_id))
        .forEach((o) => {
            if (!parObjet.has(o.objet_id)) {
                parObjet.set(o.objet_id, {
                    objet_id: o.objet_id,
                    objet_libelle: libelleObjet(d, o.objet_id),
                    habilite: habilitationValide(d, req.acteur.id, o.objet_id),
                    personnes: []
                });
            }
            const relation = mesRelations.find((r) => r.observe_id === o.personne_id);
            const cot = d.cotation_canal_b.find((c) =>
                c.cycle_id === cycle.id && c.observe_id === o.personne_id && c.objet_id === o.objet_id);

            parObjet.get(o.objet_id).personnes.push({
                observe_id: o.personne_id,
                observe_nom: nomPersonne(d, o.personne_id),
                contexte: relation ? relation.contexte : null,
                relation_observation_id: relation ? relation.id : null,
                niveau: cot ? cot.niveau : null,
                non_observe: cot ? !!cot.non_observe : false,
                situation_texte: cot ? cot.situation_texte : '',
                situation_date: cot ? cot.situation_date : null,
                saisi_le: cot ? cot.saisi_le : null,
                complete: !!cot && (cot.niveau != null || cot.non_observe === true)
            });
        });

    const objets = [...parObjet.values()];
    res.json({
        success: true,
        cycle,
        saisie_ouverte: cycle.statut === 'ouvert',
        // C1 : la déclaration du répondant n'est jointe qu'après clôture.
        canal_a_visible: acces.canauxVisibles(cycle),
        objets,
        total: objets.reduce((a, o) => a + o.personnes.length, 0),
        faits: objets.reduce((a, o) => a + o.personnes.filter((p) => p.complete).length, 0)
    });
});

// Enregistrement d'une cotation.
// C2 : aucun endpoint ne renvoie ni ne pré-remplit le champ niveau.
// C3 : situation datée obligatoire dès qu'un niveau est posé.
// C4 : « non observé » est un drapeau, niveau reste null.
router.put('/canal-b/:cycleId/cotation', authentifier, horsMesurePourAdmin, (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.cycleId);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });
    if (cycle.statut !== 'ouvert') return res.status(409).json({ success: false, code: 'CYCLE_FERME', message: MSG.cycle_ferme });

    const observeId = Number((req.body || {}).observe_id);
    const objetId = Number((req.body || {}).objet_id);
    const { situation_texte, situation_date, niveau, non_observe } = req.body || {};

    const relation = d.relation_observation.find((r) =>
        r.observateur_id === req.acteur.id && r.observe_id === observeId &&
        (!r.periode_fin || r.periode_fin >= cycle.date_debut) && r.periode_debut <= cycle.date_fin);
    if (!relation) {
        return res.status(403).json({ success: false, message: 'Aucune relation d\u2019observation active sur cette personne pour ce cycle.' });
    }
    if (!habilitationValide(d, req.acteur.id, objetId)) {
        return res.status(403).json({ success: false, code: 'HABILITATION', message: 'Habilitation absente ou expirée sur cet objet.' });
    }

    const texte = situation_texte == null ? '' : String(situation_texte).trim();
    const pose = (niveau != null) || non_observe === true;

    // C3 — validation serveur, pas seulement formulaire.
    if (pose && !texte) {
        return res.status(422).json({ success: false, code: 'SITUATION_REQUISE', message: MSG.situation });
    }
    if (pose && !dansPeriode(situation_date, cycle)) {
        return res.status(422).json({ success: false, code: 'DATE_REQUISE', message: MSG.date });
    }
    // C4 — « non observé » exclut tout niveau, et n'est pas zéro.
    if (non_observe === true && niveau != null) {
        return res.status(422).json({ success: false, message: '« Non observé » et un niveau ne peuvent pas coexister.' });
    }
    if (niveau != null && ![1, 2, 3, 4].includes(Number(niveau))) {
        return res.status(422).json({ success: false, message: 'Niveau attendu entre 1 et 4, ou « non observé ».' });
    }

    let cot = d.cotation_canal_b.find((c) =>
        c.cycle_id === cycle.id && c.observe_id === observeId && c.objet_id === objetId);
    if (!cot) {
        cot = {
            id: store.prochainId(d, 'cotation_canal_b'),
            cycle_id: cycle.id,
            objet_id: objetId,
            observe_id: observeId,
            observateur_id: req.acteur.id,
            relation_observation_id: relation.id,
            niveau: null,
            non_observe: false,
            situation_texte: '',
            situation_date: null,
            saisi_le: null,
            purge_prevue_le: null,
            purge_effectuee_le: null
        };
        d.cotation_canal_b.push(cot);
    }
    if (cot.observateur_id !== req.acteur.id) {
        return res.status(403).json({ success: false, message: 'Cette cotation appartient à un autre observateur.' });
    }

    cot.situation_texte = texte;
    cot.situation_date = situation_date || null;
    cot.relation_observation_id = relation.id;
    if (non_observe === true) { cot.non_observe = true;
        cot.niveau = null; } else if (niveau != null) { cot.non_observe = false;
        cot.niveau = Number(niveau); }
    cot.saisi_le = new Date().toISOString(); // horodatage au fil de l'eau

    store.tracer(d, req.acteur.nom, 'COTATION',
        `${nomPersonne(d, observeId)} — ${libelleObjet(d, objetId)}`,
        cot.non_observe ? 'Non observé' : `Niveau ${cot.niveau}`);
    store.ecrire(d);

    res.json({
        success: true,
        cotation: {
            observe_id: cot.observe_id,
            objet_id: cot.objet_id,
            niveau: cot.niveau,
            non_observe: cot.non_observe,
            situation_date: cot.situation_date,
            saisi_le: cot.saisi_le
        }
    });
});

// ============================================================================
// RESTITUTION — résultats structurés, chacun porteur de son NCM.
// ============================================================================
router.get('/restitution/:cycleId/:personneId', authentifier, horsMesurePourAdmin, (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.cycleId);
    const personneId = Number(req.params.personneId);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });

    if (!acces.peutVoirResultatsDe(d, req.acteur, personneId)) {
        return res.status(403).json({ success: false, message: 'Hors de votre périmètre.' });
    }
    if (!acces.restitutionAccessible(cycle, req.acteur)) {
        return res.status(409).json({
            success: false,
            code: 'RESTITUTION_FERMEE',
            message: 'La restitution est accessible au moment de l\u2019entretien trimestriel.'
        });
    }

    const ecarts = d.ecart_calcule
        .filter((e) => e.cycle_id === cycle.id && e.personne_id === personneId)
        .map((e) => {
            const cot = d.cotation_canal_b.find((c) =>
                c.cycle_id === cycle.id && c.observe_id === personneId && c.objet_id === e.objet_id);
            const dec = d.declaration_canal_a.find((x) =>
                x.cycle_id === cycle.id && x.personne_id === personneId && x.objet_id === e.objet_id);
            return {
                objet_id: e.objet_id,
                objet_libelle: libelleObjet(d, e.objet_id),
                niveau_observe: cot ? cot.niveau : null,
                non_observe: cot ? !!cot.non_observe : false,
                niveau_exigence: dec ? dec.niveau_exigence : null,
                ecart: e.ecart,
                signe: e.signe,
                motif: e.motif,
                condition_signalee: e.condition_signalee,
                // Le verbatim n'est joint qu'à son auteur et à la personne concernée.
                situation_texte: (cot && acces.peutVoirVerbatim(req.acteur, cot)) ? cot.situation_texte : null,
                situation_date: cot ? cot.situation_date : null,
                observateur_nom: cot ? nomPersonne(d, cot.observateur_id) : null,
                ncm: {
                    niveau_observe: moteur.NCM_PAR_INDICATEUR.niveau_observe,
                    ecart: moteur.NCM_PAR_INDICATEUR.ecart
                }
            };
        });

    // C8 — aucune signature n'est renvoyée si elle n'existe pas ; sur un cycle
    // unique le système enregistre une variation et n'affiche aucun diagnostic.
    const signatures = d.signature
        .filter((s) => s.personne_id === personneId && s.actif !== false)
        .map((s) => ({
            objet_id: s.objet_id,
            objet_libelle: libelleObjet(d, s.objet_id),
            type: s.type,
            cycles_consecutifs: s.cycles_consecutifs,
            statut_traitement: s.statut_traitement,
            ncm: moteur.NCM_PAR_INDICATEUR.signature
        }));

    res.json({
        success: true,
        cycle,
        personne: { id: personneId, nom: nomPersonne(d, personneId) },
        ecarts, // listés, jamais moyennés
        signatures,
        mention: signatures.length === 0 ?
            'Variation enregistrée. Aucun diagnostic n\u2019est émis avant deux cycles consécutifs de même signe.' :
            null
    });
});

// Dispersion de ligne — indicateur propriétaire, réservé aux rôles de pilotage.
router.get('/dispersion/:cycleId/:ligneId', authentifier, roles('responsable_structure', 'drh'), (req, res) => {
    const d = store.lire();
    const cycle = trouverCycle(d, req.params.cycleId);
    const ligneId = Number(req.params.ligneId);
    if (!cycle) return res.status(404).json({ success: false, message: 'Cycle introuvable.' });

    if (req.acteur.role === 'responsable_structure' && !acces.lignesDescendantes(d, req.acteur.ligne_id).includes(ligneId)) {
        return res.status(403).json({ success: false, message: 'Hors de votre périmètre.' });
    }

    const lignes = acces.lignesDescendantes(d, ligneId);
    const membres = d.personne.filter((p) => lignes.includes(p.ligne_id));
    const profondeurs = {};
    membres.forEach((m) => {
        const l = d.ligne_hierarchique.find((x) => x.id === m.ligne_id);
        profondeurs[m.id] = l ? l.niveau_profondeur : null;
    });

    const parObjet = {};
    d.objet.forEach((o) => {
        const cotations = d.cotation_canal_b.filter((c) =>
            c.cycle_id === cycle.id && c.objet_id === o.id && membres.some((m) => m.id === c.observe_id));
        if (cotations.length === 0) return;
        parObjet[o.libelle] = moteur.dispersionLigne(cotations, profondeurs);
    });

    res.json({ success: true, cycle, ligne_id: ligneId, dispersion_par_objet: parObjet });
});

// Indice de fiabilité — restitué à l'observateur seul, jamais à sa hiérarchie.
router.get('/fiabilite/moi', authentifier, horsMesurePourAdmin, (req, res) => {
    const d = store.lire();
    const indices = d.indice_fiabilite_observateur
        .filter((i) => acces.peutVoirIndiceFiabilite(req.acteur, i.observateur_id))
        .map((i) => ({...i, cycle_libelle: (trouverCycle(d, i.cycle_id) || {}).libelle || '—' }));
    res.json({
        success: true,
        indices,
        mention: 'Cet indice vous est restitué à vous seul. Il n\u2019est visible ni de votre hiérarchie ni de la DRH sous forme nominative.'
    });
});

// ============================================================================
// VOIE D'ESCALADE HORS DISPOSITIF
// N'emprunte jamais la table de cotation : entité séparée, hors purge, hors calcul.
// ============================================================================
router.post('/signalements', authentifier, horsMesurePourAdmin, (req, res) => {
    const { personne_concernee_id, nature, description } = req.body || {};
    if (!['danger', 'harcelement', 'incompetence_critique', 'autre'].includes(nature)) {
        return res.status(400).json({ success: false, message: 'Nature de signalement invalide.' });
    }
    if (!description || String(description).trim().length < 20) {
        return res.status(400).json({ success: false, message: 'Une description circonstanciée est requise.' });
    }
    const d = store.lire();
    const s = {
        id: store.prochainId(d, 'signalement_hors_dispositif'),
        auteur_id: req.acteur.id,
        personne_concernee_id: personne_concernee_id ? Number(personne_concernee_id) : null,
        nature,
        description: String(description).trim(),
        cree_le: new Date().toISOString(),
        statut: 'ouvert',
        traite_par_id: null
    };
    d.signalement_hors_dispositif.push(s);
    store.tracer(d, req.acteur.nom, 'SIGNALEMENT_HORS_DISPOSITIF', nature, 'Contenu non journalisé.');
    store.ecrire(d);
    res.status(201).json({ success: true, signalement: { id: s.id, statut: s.statut } });
});

router.get('/signalements', authentifier, roles('drh'), (req, res) => {
    const d = store.lire();
    res.json({
        success: true,
        signalements: d.signalement_hors_dispositif.map((s) => ({
            ...s,
            auteur_nom: nomPersonne(d, s.auteur_id),
            personne_concernee_nom: s.personne_concernee_id ? nomPersonne(d, s.personne_concernee_id) : null
        }))
    });
});

// ============================================================================
// AUDIT ET CONFORMITÉ
// ============================================================================
router.get('/audit', authentifier, roles('admin', 'drh'), (req, res) => {
    const d = store.lire();
    res.json({
        success: true,
        audit: d.audit.slice(0, 200),
        journal_purge: d.journal_purge.slice(-30).reverse(),
        version_moteur: moteur.VERSION_MOTEUR,
        version_schema: d._version_schema
    });
});

module.exports = router;
module.exports.demarrerTachesPlanifiees = purge.demarrer;