// frontend/src/workflow/seedDemo.js
// -----------------------------------------------------------------------------
// Données de démonstration.
// ⚠ Crée EXPLICITEMENT une entreprise + rattache des users + crée formation.
// Aucune entreprise n'est dérivée automatiquement : elle est créée par l'admin
// comme dans le vrai workflow.
// -----------------------------------------------------------------------------
import { Generateur } from './useWorkflow';

export function seedDemo(users = []) {
  const now = Date.now();
  const day = 86400000;

  // On n'utilise QUE les vrais utilisateurs — on n'en crée aucun
  const clients = users.filter(u => u.role !== 'admin');
  if (clients.length === 0) {
    return {
      version: 2,
      entreprises: [], formations: [], contenus: [], envois: [],
      reponses: [], resultats: [], feedbacks: [],
      journal: [{
        id: 'j_0',
        date: new Date().toISOString(),
        action: 'seed_impossible',
        detail: 'Aucun client inscrit. Impossible de créer la démo.'
      }]
    };
  }

  // ---------------------------------------------------------------- ENTREPRISE
  // Nom dérivé du premier client (ou nom générique si pas de company)
  const premierClient = clients[0];
  const nomEntreprise = (premierClient.company || 'Entreprise Cliente').trim();

  const entreprise = {
    id: 'ent_demo_1',
    nom: nomEntreprise,
    secteur: 'Secteur d\'activité',
    ville: '',
    contactEmail: premierClient.email || '',
    utilisateurs: clients.map(u => u.id),  // tous les clients rattachés
    creeLe: new Date(now - 60 * day).toISOString()
  };

  // ---------------------------------------------------------------- FORMATION
  const form1 = {
    id: 'frm_1',
    entrepriseId: entreprise.id,
    titre: 'Intelligence émotionnelle collective',
    theme: 'Leadership conscient et neurosciences appliquées',
    dateDebut: new Date(now - 45 * day).toISOString().slice(0, 10),
    dateFin: new Date(now - 40 * day).toISOString().slice(0, 10),
    objectifs: 'Développer la conscience de soi et la régulation émotionnelle en équipe.',
    participants: clients.length,
    niveau: 'Intermédiaire',
    statut: 'terminee',
    creeLe: new Date(now - 60 * day).toISOString(),
    contenusIds: ['cnt_1', 'cnt_2', 'cnt_3', 'cnt_4'],
    envoiId: 'env_1'
  };

  // ---------------------------------------------------------------- CONTENUS
  const t1 = Generateur.testPre(form1);
  const t2 = Generateur.testPost(form1);
  const c1 = Generateur.cahierParticipant(form1);
  const q1 = Generateur.questionnaireEvaluation(form1);

  const contenus = [
    { id: 'cnt_1', formationId: form1.id, ...t1, statut: 'envoye', genereLe: new Date(now - 50 * day).toISOString() },
    { id: 'cnt_2', formationId: form1.id, ...t2, statut: 'envoye', genereLe: new Date(now - 50 * day).toISOString() },
    { id: 'cnt_3', formationId: form1.id, ...c1, statut: 'consulte', genereLe: new Date(now - 50 * day).toISOString() },
    { id: 'cnt_4', formationId: form1.id, ...q1, statut: 'envoye', genereLe: new Date(now - 50 * day).toISOString() }
  ];

  const envois = [{
    id: 'env_1',
    formationId: form1.id,
    contenuIds: ['cnt_1', 'cnt_2', 'cnt_3', 'cnt_4'],
    envoyeLe: new Date(now - 45 * day).toISOString(),
    statut: 'consulte',
    consulteLe: new Date(now - 44 * day).toISOString()
  }];

  // ---------------------------------------------------------------- RÉPONSES
  const reponses = [];
  clients.forEach((c, i) => {
    const base = 35 + (i * 7) % 30;
    const progress = 25 + (i * 5) % 15;
    const preScore = base;
    const postScore = Math.min(100, base + progress);

    reponses.push({
      id: `rep_${c.id}_pre`,
      formationId: form1.id,
      contenuId: 'cnt_1',
      participantId: c.id,
      type: 'pre',
      reponses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
      score: preScore,
      total: 100,
      soumisLe: new Date(now - 44 * day).toISOString()
    });

    reponses.push({
      id: `rep_${c.id}_post`,
      formationId: form1.id,
      contenuId: 'cnt_2',
      participantId: c.id,
      type: 'post',
      reponses: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      score: postScore,
      total: 100,
      soumisLe: new Date(now - 10 * day).toISOString()
    });
  });

  const rapport = Generateur.rapport(form1, reponses);
  const resultats = [{
    id: 'res_1',
    formationId: form1.id,
    rapport,
    kpis: rapport.kpis,
    recommandations: rapport.recommandations,
    publieLe: new Date(now - 5 * day).toISOString(),
    statut: 'publie'
  }];

  // ---------------------------------------------------------------- FEEDBACKS
  const feedbacks = clients.length > 0 ? [
    {
      id: 'fb_1',
      formationId: form1.id,
      note: 5, qualite: 5, organisation: 4, pertinence: 5,
      commentaire: 'Formation très enrichissante. Le formateur a su créer une dynamique de groupe excellente.',
      ameliorations: 'Prévoir plus de temps pour les mises en situation.',
      envoyeLe: new Date(now - 3 * day).toISOString(),
      statut: 'traite',
      reponseAdmin: 'Merci pour votre retour. Nous prendrons en compte votre suggestion.',
      reponseLe: new Date(now - 2 * day).toISOString()
    }
  ] : [];

  const journal = [
    { id: 'j_1', date: new Date(now - 60 * day).toISOString(), action: 'entreprise_creee', detail: nomEntreprise },
    { id: 'j_2', date: new Date(now - 60 * day).toISOString(), action: 'formation_creee', detail: form1.titre },
    { id: 'j_3', date: new Date(now - 45 * day).toISOString(), action: 'envoi_client', detail: nomEntreprise },
    { id: 'j_4', date: new Date(now - 5 * day).toISOString(), action: 'resultat_publie', detail: 'Rapport publié' },
    { id: 'j_5', date: new Date(now - 3 * day).toISOString(), action: 'feedback_envoye', detail: nomEntreprise }
  ];

  return {
    version: 2,
    entreprises: [entreprise],
    formations: [form1],
    contenus,
    envois,
    reponses,
    resultats,
    feedbacks,
    journal
  };
}