// frontend/src/client/generationEngine.js
// Moteur de génération — remplaçable par un appel IA plus tard.

export async function generateProgramFromDocuments({ documents, parameters, user, societe }) {
  const failures = [];
  const usable = [];

  for (const d of documents) {
    const hasContent = (d.text && d.text.trim().length > 40) || d.blob;
    if (!hasContent) {
      failures.push({ id: d.id, name: d.nom, reason: 'Contenu non exploitable' });
      continue;
    }
    usable.push(d);
  }

  if (documents.length > 0 && usable.length === 0) {
    const err = new Error('Aucun document exploitable parmi la sélection.');
    err.failures = failures;
    throw err;
  }

  const words = usable.map((d) => d.text || '').join(' ').toLowerCase().match(/[a-zà-ÿ]{4,}/g) || [];
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const topWords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);

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

  return {
    program,
    sourcesUsed: usable.map((d) => d.id),
    failures
  };
}