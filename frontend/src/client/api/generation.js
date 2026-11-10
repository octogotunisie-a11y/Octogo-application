// src/client/api/generation.js
// -----------------------------------------------------------------------------
// Moteur de génération de programmes.
//
// ⚠ POINT D'EXTENSION IA — Remplacer le corps de `genererProgramme` par un appel
// à votre service IA. La signature et le format de retour doivent rester
// identiques, sinon l'UI devra être adaptée.
//
//   Entrée  : { documents, parameters, user, societe }
//   Sortie  : Promise<{ program, sourcesUsed, failures }>
// -----------------------------------------------------------------------------
import { extraireTexte } from './documents';

export async function genererProgramme({ documents, parameters, user, societe }) {
  const failures = [];
  const usable = [];

  for (const d of documents) {
    const text = d.text || await extraireTexte(d.id).catch(() => '');
    const hasContent = (text && text.trim().length > 40) || d.blob;
    if (!hasContent) {
      failures.push({ id: d.id, name: d.nom, reason: 'Contenu non exploitable' });
      continue;
    }
    usable.push({ ...d, text });
  }

  if (documents.length > 0 && usable.length === 0) {
    const err = new Error('Aucun document exploitable parmi la sélection.');
    err.failures = failures;
    throw err;
  }

  // ----- Simulation IA locale (règles simples) -----
  await new Promise((r) => setTimeout(r, 600));

  const words = usable
    .map((d) => d.text || '')
    .join(' ')
    .toLowerCase()
    .match(/[a-zà-ÿ]{4,}/g) || [];

  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const topWords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  const publicCible = parameters.public?.trim() || 'Managers';
  const duree = parameters.duree?.trim() || '3 jours';
  const objectif = parameters.objectif?.trim()
    || (topWords.length
        ? `Renforcer les compétences autour de : ${topWords.slice(0, 3).join(', ')}`
        : 'Développer les compétences clés identifiées dans les documents fournis');

  const modules = [
    { titre: 'Cadrage et objectifs', duree: '0.5 j',
      objectifs: ['Comprendre le contexte', 'Clarifier les attentes'],
      activites: ['Atelier de cadrage', 'Auto-évaluation initiale'] },
    { titre: 'Apports fondamentaux', duree: '1 j',
      objectifs: topWords.slice(0, 3).map((w) => `Maîtriser les bases : ${w}`),
      activites: ['Exposés interactifs', 'Exercices guidés'] },
    { titre: 'Mise en pratique', duree: '1 j',
      objectifs: ['Appliquer sur cas réels', 'Développer les réflexes'],
      activites: ['Études de cas', 'Jeux de rôle'] },
    { titre: 'Ancrage et évaluation', duree: '0.5 j',
      objectifs: ['Consolider les acquis', 'Définir un plan d’action'],
      activites: ['Plan d’action individuel', 'Évaluation à chaud'] }
  ];

  const program = {
    id: `prog_${Date.now()}`,
    titre: `Programme — ${objectif.slice(0, 60)}${objectif.length > 60 ? '…' : ''}`,
    categorie: parameters.categorie || 'Parcours',
    objectif, public: publicCible, duree,
    niveau: parameters.niveau || 'Intermédiaire',
    structure: modules,
    sources: usable.map((d) => ({ id: d.id, nom: d.nom, categorie: d.categorie })),
    mots_cles: topWords,
    genere_le: new Date().toISOString(),
    organisation: societe?.nom || user?.company || null,
    version: 1
  };

  return { program, sourcesUsed: usable.map((d) => d.id), failures };
}