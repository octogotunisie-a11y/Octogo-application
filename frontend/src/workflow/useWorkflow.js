// frontend/src/workflow/useWorkflow.js
// -----------------------------------------------------------------------------
// Cerveau du workflow OCTOGO — gestion de l'état partagé Admin ↔ Client.
//
// Modèle :
//   • Entreprises créées PAR L'ADMIN (id, nom, secteur…)
//   • Clients rattachés à une entreprise via user.entrepriseId
//   • Formations rattachées à une entreprise
//
// Stockage : localStorage (`octogo_workflow_v1`).
// Aucune IA réelle : `Generateur` produit du contenu par règles locales.
// -----------------------------------------------------------------------------
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'octogo_workflow_v1';

function etatVide() {
  return {
    version: 2,
    entreprises: [],   // { id, nom, secteur, ville, contactEmail, utilisateurs: [userId], creeLe }
    formations: [],
    contenus: [],
    envois: [],
    reponses: [],
    resultats: [],
    feedbacks: [],
    journal: []
  };
}

export function chargerEtat() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return etatVide();
    return { ...etatVide(), ...JSON.parse(raw) };
  } catch { return etatVide(); }
}

function persister(etat) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(etat));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  } catch (e) { console.warn('Persistance impossible', e); }
}

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// =============================================================================
// HOOK PRINCIPAL
// =============================================================================
export function useWorkflow() {
  const [etat, setEtat] = useState(() => chargerEtat());

  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key || e.key === STORAGE_KEY) setEtat(chargerEtat());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const muter = useCallback((fn) => {
    setEtat(prev => {
      const next = fn({ ...prev });
      persister(next);
      return next;
    });
  }, []);

  const tracer = useCallback((action, detail) => {
    muter(s => ({
      ...s,
      journal: [
        { id: newId('j'), date: new Date().toISOString(), action, detail },
        ...(s.journal || [])
      ].slice(0, 200)
    }));
  }, [muter]);

  // ------------------------------------------------------------- ENTREPRISES
  // Créées EXPLICITEMENT par l'admin. Aucune dérivation automatique.
  const creerEntreprise = useCallback(({ nom, secteur, ville, contactEmail }) => {
    if (!nom || !nom.trim()) return null;
    const id = newId('ent');
    muter(s => ({
      ...s,
      entreprises: [...s.entreprises, {
        id,
        nom: nom.trim(),
        secteur: secteur || '',
        ville: ville || '',
        contactEmail: contactEmail || '',
        utilisateurs: [],       // ids des users rattachés
        creeLe: new Date().toISOString()
      }]
    }));
    tracer('entreprise_creee', nom);
    return id;
  }, [muter, tracer]);

  const modifierEntreprise = useCallback((id, updates) => {
    muter(s => ({
      ...s,
      entreprises: s.entreprises.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
    tracer('entreprise_modifiee', id);
  }, [muter, tracer]);

  const supprimerEntreprise = useCallback((id) => {
    muter(s => ({
      ...s,
      entreprises: s.entreprises.filter(e => e.id !== id),
      formations: s.formations.filter(f => f.entrepriseId !== id),
      contenus: s.contenus.filter(c => {
        const f = s.formations.find(x => x.id === c.formationId);
        return f && f.entrepriseId !== id;
      })
    }));
    tracer('entreprise_supprimee', id);
  }, [muter, tracer]);

  // Rattache un client existant à une entreprise
  const rattacherClient = useCallback((entrepriseId, userId) => {
    muter(s => ({
      ...s,
      entreprises: s.entreprises.map(e =>
        e.id === entrepriseId && !e.utilisateurs.includes(userId)
          ? { ...e, utilisateurs: [...e.utilisateurs, userId] }
          : e
      )
    }));
    tracer('client_rattache', `${userId} → ${entrepriseId}`);
  }, [muter, tracer]);

  // Détache un client d'une entreprise
  const detacherClient = useCallback((entrepriseId, userId) => {
    muter(s => ({
      ...s,
      entreprises: s.entreprises.map(e =>
        e.id === entrepriseId
          ? { ...e, utilisateurs: e.utilisateurs.filter(id => id !== userId) }
          : e
      )
    }));
    tracer('client_detache', `${userId} ← ${entrepriseId}`);
  }, [muter, tracer]);

  // ------------------------------------------------------------- FORMATIONS
  const creerFormation = useCallback(({ entrepriseId, titre, theme, dateDebut, dateFin, objectifs, participants, niveau }) => {
    const id = newId('frm');
    muter(s => ({
      ...s,
      formations: [...s.formations, {
        id, entrepriseId, titre, theme,
        dateDebut: dateDebut || null,
        dateFin: dateFin || null,
        objectifs: objectifs || '',
        participants: participants || 0,
        niveau: niveau || 'Intermédiaire',
        statut: 'brouillon',
        creeLe: new Date().toISOString(),
        contenusIds: [],
        envoiId: null
      }]
    }));
    tracer('formation_creee', titre);
    return id;
  }, [muter, tracer]);

  const modifierFormation = useCallback((id, updates) => {
    muter(s => ({
      ...s,
      formations: s.formations.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  }, [muter]);

  const supprimerFormation = useCallback((id) => {
    muter(s => ({
      ...s,
      formations: s.formations.filter(f => f.id !== id),
      contenus: s.contenus.filter(c => c.formationId !== id),
      envois: s.envois.filter(e => e.formationId !== id),
      reponses: s.reponses.filter(r => r.formationId !== id),
      resultats: s.resultats.filter(r => r.formationId !== id),
      feedbacks: s.feedbacks.filter(f => f.formationId !== id)
    }));
    tracer('formation_supprimee', id);
  }, [muter, tracer]);

  const changerStatutFormation = useCallback((id, statut) => {
    muter(s => ({
      ...s,
      formations: s.formations.map(f => f.id === id ? { ...f, statut } : f)
    }));
    tracer('formation_statut', `${id} → ${statut}`);
  }, [muter, tracer]);

  // ------------------------------------------------------------- CONTENUS
  const ajouterContenu = useCallback((contenu) => {
    const id = newId('cnt');
    muter(s => ({
      ...s,
      contenus: [...s.contenus, {
        id, ...contenu, statut: 'brouillon',
        genereLe: new Date().toISOString()
      }],
      formations: s.formations.map(f =>
        f.id === contenu.formationId
          ? { ...f, contenusIds: [...(f.contenusIds || []), id] }
          : f
      )
    }));
    tracer('contenu_genere', `${contenu.type} — ${contenu.titre}`);
    return id;
  }, [muter, tracer]);

  const modifierContenu = useCallback((id, updates) => {
    muter(s => ({
      ...s,
      contenus: s.contenus.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, [muter]);

  const supprimerContenu = useCallback((id) => {
    muter(s => ({
      ...s,
      contenus: s.contenus.filter(c => c.id !== id),
      formations: s.formations.map(f => ({
        ...f, contenusIds: (f.contenusIds || []).filter(x => x !== id)
      }))
    }));
    tracer('contenu_supprime', id);
  }, [muter, tracer]);

  const marquerContenuPret = useCallback((id) => {
    modifierContenu(id, { statut: 'pret' });
    tracer('contenu_pret', id);
  }, [modifierContenu, tracer]);

  // ------------------------------------------------------------- ENVOIS
  const envoyerAuClient = useCallback((formationId, contenuIds) => {
    const envoiId = newId('env');
    muter(s => ({
      ...s,
      envois: [...s.envois, {
        id: envoiId, formationId, contenuIds,
        envoyeLe: new Date().toISOString(),
        statut: 'envoye', consulteLe: null
      }],
      contenus: s.contenus.map(c => contenuIds.includes(c.id) ? { ...c, statut: 'envoye' } : c),
      formations: s.formations.map(f =>
        f.id === formationId ? { ...f, statut: 'envoyee', envoiId } : f
      )
    }));
    tracer('envoi_client', `formation ${formationId}`);
    return envoiId;
  }, [muter, tracer]);

  const marquerEnvoiConsulte = useCallback((envoiId) => {
    muter(s => ({
      ...s,
      envois: s.envois.map(e =>
        e.id === envoiId && e.statut === 'envoye'
          ? { ...e, statut: 'consulte', consulteLe: new Date().toISOString() }
          : e
      )
    }));
  }, [muter]);

  // ------------------------------------------------------------- RÉPONSES
  const enregistrerReponse = useCallback(({ formationId, contenuId, participantId, type, reponses, score, total }) => {
    const id = newId('rep');
    muter(s => {
      const filtre = s.reponses.filter(r =>
        !(r.formationId === formationId && r.contenuId === contenuId && r.participantId === participantId)
      );
      return {
        ...s,
        reponses: [...filtre, {
          id, formationId, contenuId, participantId, type,
          reponses,
          score: score != null ? score : null,
          total: total != null ? total : null,
          soumisLe: new Date().toISOString()
        }],
        formations: s.formations.map(f =>
          f.id === formationId ? { ...f, statut: 'en_cours' } : f
        )
      };
    });
    tracer('reponse_enregistree', `${type} — participant ${participantId}`);
    return id;
  }, [muter, tracer]);

  // ------------------------------------------------------------- RÉSULTATS
  const publierResultat = useCallback(({ formationId, rapport, kpis, recommandations }) => {
    const id = newId('res');
    muter(s => ({
      ...s,
      resultats: [...s.resultats, {
        id, formationId, rapport,
        kpis: kpis || {},
        recommandations: recommandations || [],
        publieLe: new Date().toISOString(),
        statut: 'publie'
      }],
      formations: s.formations.map(f =>
        f.id === formationId ? { ...f, statut: 'terminee' } : f
      )
    }));
    tracer('resultat_publie', `formation ${formationId}`);
    return id;
  }, [muter, tracer]);

  // ------------------------------------------------------------- FEEDBACKS
  const envoyerFeedback = useCallback(({ formationId, note, qualite, organisation, pertinence, commentaire, ameliorations }) => {
    const id = newId('fb');
    muter(s => ({
      ...s,
      feedbacks: [...s.feedbacks, {
        id, formationId, note, qualite, organisation, pertinence,
        commentaire: commentaire || '',
        ameliorations: ameliorations || '',
        envoyeLe: new Date().toISOString(),
        statut: 'nouveau', reponseAdmin: null, reponseLe: null
      }]
    }));
    tracer('feedback_envoye', `formation ${formationId}`);
    return id;
  }, [muter, tracer]);

  const traiterFeedback = useCallback((id, { statut, reponseAdmin }) => {
    muter(s => ({
      ...s,
      feedbacks: s.feedbacks.map(f =>
        f.id === id
          ? { ...f, statut: statut || 'traite', reponseAdmin: reponseAdmin || f.reponseAdmin, reponseLe: new Date().toISOString() }
          : f
      )
    }));
    tracer('feedback_traite', id);
  }, [muter, tracer]);

  // ------------------------------------------------------------- RESET
  const reinitialiser = useCallback(() => {
    setEtat(etatVide());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  // ------------------------------------------------------------- SEED
  const chargerDemo = useCallback((users, seedFn) => {
    const demo = seedFn(users);
    setEtat(demo);
    persister(demo);
  }, []);

  return {
    etat,
    reinitialiser,
    chargerDemo,
    creerEntreprise, modifierEntreprise, supprimerEntreprise,
    rattacherClient, detacherClient,
    creerFormation, modifierFormation, supprimerFormation, changerStatutFormation,
    ajouterContenu, modifierContenu, supprimerContenu, marquerContenuPret,
    envoyerAuClient, marquerEnvoiConsulte,
    enregistrerReponse,
    publierResultat,
    envoyerFeedback, traiterFeedback
  };
}

// =============================================================================
// SÉLECTEURS
// =============================================================================
export function getEntreprise(etat, id) {
  return etat.entreprises.find(e => e.id === id) || null;
}
export function getFormation(etat, id) {
  return etat.formations.find(f => f.id === id) || null;
}
export function getFormationsEntreprise(etat, entrepriseId) {
  return etat.formations.filter(f => f.entrepriseId === entrepriseId);
}
export function getContenusFormation(etat, formationId) {
  return etat.contenus.filter(c => c.formationId === formationId);
}
export function getEnvoisFormation(etat, formationId) {
  return etat.envois.filter(e => e.formationId === formationId);
}
export function getReponsesFormation(etat, formationId) {
  return etat.reponses.filter(r => r.formationId === formationId);
}
export function getResultatsFormation(etat, formationId) {
  return etat.resultats.filter(r => r.formationId === formationId);
}
export function getFeedbacksFormation(etat, formationId) {
  return etat.feedbacks.filter(f => f.formationId === formationId);
}
export function getEntrepriseDuClient(etat, userId) {
  return etat.entreprises.find(e => e.utilisateurs?.includes(userId)) || null;
}

// =============================================================================
// GÉNÉRATION IA LOCALE
// =============================================================================
export const Generateur = {
  testPre: (formation) => {
    const theme = formation?.theme || formation?.titre || 'la formation';
    return {
      type: 'test_pre',
      titre: `Prétest — ${formation.titre}`,
      questions: [
        { id: 1, texte: `La formation « ${theme} » couvre les fondamentaux du sujet.`, type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonne: 0 },
        { id: 2, texte: `Un plan d'action individuel est recommandé en fin de parcours.`, type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonne: 0 },
        { id: 3, texte: `Quel est l'objectif principal de la formation ?`, type: 'qcm', choix: ['Renforcer les compétences', 'Remplacer les procédures', 'Documenter les incidents', 'Aucune réponse'], bonne: 0 },
        { id: 4, texte: `Les cas pratiques renforcent l'ancrage des acquis.`, type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonne: 0 },
        { id: 5, texte: `L'évaluation à froid est facultative dans ce dispositif.`, type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonne: 1 }
      ]
    };
  },
  testPost: (formation) => {
    const theme = formation?.theme || formation?.titre || 'la formation';
    return {
      type: 'test_post',
      titre: `Post-test — ${formation.titre}`,
      questions: [
        { id: 1, texte: `Après la formation, je sais appliquer les principes de « ${theme} ».`, type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonne: 0 },
        { id: 2, texte: `J'ai identifié des situations concrètes d'application.`, type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonne: 0 },
        { id: 3, texte: `Quel est le principal acquis de la formation ?`, type: 'qcm', choix: ['De nouvelles compétences', 'Un certificat', 'Des notes', 'Rien'], bonne: 0 },
        { id: 4, texte: `Les objectifs pédagogiques ont été atteints.`, type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonne: 0 },
        { id: 5, texte: `Je peux transmettre mes acquis à mes collègues.`, type: 'vrai_faux', choix: ['Vrai', 'Faux'], bonne: 0 }
      ]
    };
  },
  cahierParticipant: (formation) => ({
    type: 'cahier',
    titre: `Cahier du participant — ${formation.titre}`,
    sections: [
      { titre: 'Introduction', contenu: `Bienvenue dans la formation « ${formation.titre} ».` },
      { titre: 'Objectifs', contenu: formation.objectifs || 'Objectifs à préciser par le formateur.' },
      { titre: 'Contenu pédagogique', contenu: 'Le programme complet sera présenté lors de la session.' },
      { titre: 'Exercices', contenu: 'Des exercices pratiques sont prévus à chaque module.' },
      { titre: 'Notes personnelles', contenu: 'Utilisez cet espace pour vos notes.' }
    ]
  }),
  questionnaireEvaluation: (formation) => ({
    type: 'questionnaire',
    titre: `Questionnaire d'évaluation — ${formation.titre}`,
    questions: [
      { id: 1, texte: 'La formation a répondu à vos attentes.', type: 'echelle', choix: ['1', '2', '3', '4', '5'] },
      { id: 2, texte: 'Le contenu était pertinent.', type: 'echelle', choix: ['1', '2', '3', '4', '5'] },
      { id: 3, texte: 'Le formateur était clair.', type: 'echelle', choix: ['1', '2', '3', '4', '5'] },
      { id: 4, texte: 'Commentaires libres', type: 'ouverte' }
    ]
  }),
  rapport: (formation, reponses = []) => {
    const pre = reponses.filter(r => r.type === 'pre');
    const post = reponses.filter(r => r.type === 'post');
    const moy = (arr) => arr.length ? Math.round(arr.reduce((s, r) => s + (r.score / r.total) * 100, 0) / arr.length) : null;
    const moyPre = moy(pre), moyPost = moy(post);
    const ecart = (moyPre != null && moyPost != null) ? moyPost - moyPre : null;
    return {
      type: 'rapport',
      titre: `Rapport d'analyse — ${formation.titre}`,
      synthese: [
        `Formation : ${formation.titre}`,
        `Réponses prétest : ${pre.length}`,
        `Réponses post-test : ${post.length}`,
        moyPre != null ? `Score moyen prétest : ${moyPre}/100` : 'Aucun score prétest',
        moyPost != null ? `Score moyen post-test : ${moyPost}/100` : 'Aucun score post-test',
        ecart != null ? `Progression : ${ecart > 0 ? '+' : ''}${ecart} points` : 'Progression non calculable'
      ],
      kpis: {
        participants: formation.participants || 0,
        reponsesPre: pre.length, reponsesPost: post.length,
        scoreMoyenPre: moyPre, scoreMoyenPost: moyPost, progression: ecart
      },
      recommandations: [
        pre.length === 0 ? 'Encourager la participation au prétest.' : null,
        post.length === 0 ? 'Relancer les participants pour le post-test.' : null,
        ecart != null && ecart < 5 ? 'Renforcer l\'accompagnement post-formation.' : null,
        ecart != null && ecart >= 20 ? 'Excellente progression.' : null
      ].filter(Boolean)
    };
  }
};