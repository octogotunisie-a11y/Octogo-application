// src/pages/programmeExport.js
// -----------------------------------------------------------------------------
// Export du programme annuel — Word (.doc) et PDF (Portable Document Format)
// -----------------------------------------------------------------------------
// SANS DÉPENDANCE EXTERNE :
//   - Word : on génère un fichier HTML balisé "application/msword". Microsoft
//     Word, LibreOffice et Google Docs ouvrent et reconvertissent ce format.
//   - PDF  : on ouvre une fenêtre d'impression mise en page (système ÉCA) et on
//     déclenche l'impression native du navigateur → « Enregistrer en PDF ».
//
//   Mise en page conforme au système ÉCA (École de la Cohérence Adaptative) :
//   titres Georgia navy, corps Calibri, filets or, accents teal, bandeaux navy.
//
//   Le logo OCTOGO n'est PAS remplacé par un placeholder géométrique : on insère
//   un bandeau au libellé textuel "OCTOGO". Passez `logoDataUrl` (image base64)
//   à buildDocumentHtml pour afficher le logo réel double-octogone.
// -----------------------------------------------------------------------------

const ECA = {
    navy: '#1B2A4A',
    teal: '#1A6B6B',
    gold: '#B8960C',
    coverDark: '#0D1A2E',
    purple: '#4A2C7A',
    light: '#F5F7FA',
    border: '#D6DCE5',
};

const esc = (v) =>
    String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');

const statutBudgetLabel = (statut) => {
    switch (statut) {
        case 'DANS_LE_BUDGET':
            return 'Dans le budget';
        case 'DÉPASSEMENT':
            return 'Dépassement budgétaire';
        default:
            return 'Budget non renseigné';
    }
};

// -----------------------------------------------------------------------------
// Construction du document HTML (utilisé pour Word ET PDF)
// -----------------------------------------------------------------------------
export function buildDocumentHtml(resultat, options = {}) {
    const { logoDataUrl = '' } = options;
    const r = resultat;
    const m = r.meta;
    const devise = r.budget.devise || 'DT';

    const bandeau = (titre) =>
        `<h2 style="background:${ECA.navy};color:#fff;font-family:Georgia,serif;font-size:15pt;
      margin:26px 0 12px;padding:9px 14px;border-radius:3px;">${esc(titre)}</h2>`;

    const filetOr = `<div style="height:3px;background:${ECA.gold};width:90px;margin:4px 0 16px;"></div>`;

    // -- Couverture --
    const logoBloc = logoDataUrl ?
        `<img src="${logoDataUrl}" alt="OCTOGO" style="height:64px;margin-bottom:18px;" />` :
        `<div style="font-family:Georgia,serif;font-weight:bold;font-size:30pt;letter-spacing:4px;color:#fff;margin-bottom:10px;">OCTOGO</div>`;

    const couverture = `
    <table width="100%" style="background:${ECA.coverDark};color:#fff;border-collapse:collapse;">
      <tr><td style="padding:60px 48px;">
        ${logoBloc}
        <div style="font-family:Calibri,sans-serif;font-size:11pt;letter-spacing:2px;color:${ECA.gold};text-transform:uppercase;">École de la Cohérence Adaptative</div>
        <div style="height:2px;background:${ECA.gold};width:120px;margin:22px 0;"></div>
        <div style="font-family:Georgia,serif;font-size:26pt;line-height:1.2;">Programme Annuel de Formation</div>
        <div style="font-family:Georgia,serif;font-size:18pt;color:${ECA.teal};margin-top:8px;">${esc(m.entreprise)} — ${esc(m.annee)}</div>
        <div style="font-family:Calibri,sans-serif;font-size:12pt;margin-top:28px;line-height:1.7;">
          ${m.domaineActivite ? 'Domaine d\u2019activité : ' + esc(m.domaineActivite) + '<br/>' : ''}
          Effectif concerné : ${fmt(m.effectifTotal)} collaborateurs<br/>
          ${m.nbActions} actions de formation &nbsp;&middot;&nbsp; ${fmt(m.joursTotal)} jours-formateur<br/>
          Démarrage : ${esc(m.moisDemarrage)} ${esc(m.annee)}
        </div>
        <div style="font-family:Calibri,sans-serif;font-size:9pt;color:#9fb0c8;margin-top:40px;">
          Document généré le ${esc(m.dateGeneration)} &nbsp;&middot;&nbsp; OCTOGO Formation &amp; Conseil
          ${m.dossierTFP ? '&nbsp;&middot;&nbsp; Éligible dossier TFP (Taxe de Formation Professionnelle) / CNFCPP (Centre National de Formation Continue et de Promotion Professionnelle)' : ''}
        </div>
      </td></tr>
    </table>`;

    // -- 1. Contexte stratégique --
    const contexte = `
    ${bandeau('1. Contexte stratégique')}
    ${filetOr}
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:11pt;">
      ${[
        ['Stratégie globale de l\u2019entreprise', m.strategieGlobale],
        ['Stratégie de développement RH (Ressources Humaines)', m.strategieRH],
        ['Caractéristiques de l\u2019entreprise', m.caracteristiques],
        ['Dossier TFP (Taxe de Formation Professionnelle)', m.dossierTFP ? 'Oui — ' + (esc(m.detailsTFP) || 'à constituer') : 'Non'],
      ].filter(([, v]) => v).map(([k, v]) => `
        <tr>
          <td style="padding:7px 10px;border-left:3px solid ${ECA.teal};background:${ECA.light};width:34%;font-weight:bold;color:${ECA.navy};">${esc(k)}</td>
          <td style="padding:7px 12px;">${esc(v)}</td>
        </tr>`).join('')}
    </table>`;

  // -- 2. Programme annuel détaillé --
  const lignesProg = r.programmeAnnuel.map((a, i) => `
    <tr style="background:${i % 2 ? '#fff' : ECA.light};">
      <td style="padding:6px 8px;font-size:10pt;">${i + 1}</td>
      <td style="padding:6px 8px;font-size:10pt;font-weight:bold;color:${ECA.navy};">${esc(a.intituleAction)}</td>
      <td style="padding:6px 8px;font-size:10pt;">${esc(a.corpsMetier)}</td>
      <td style="padding:6px 8px;font-size:10pt;">${esc(a.objectifLie)}</td>
      <td style="padding:6px 8px;font-size:10pt;text-align:center;">${a.dureeJours} j × ${a.nbGroupes}</td>
      <td style="padding:6px 8px;font-size:10pt;text-align:center;">${esc(a.moisLibelle)} (T${a.trimestre})</td>
      <td style="padding:6px 8px;font-size:10pt;text-align:right;white-space:nowrap;">${fmt(a.coutEstime)} ${devise}</td>
    </tr>`).join('');

  const programme = `
    ${bandeau('2. Programme annuel détaillé')}
    ${filetOr}
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;">
      <tr style="background:${ECA.navy};color:#fff;font-size:10pt;">
        <td style="padding:7px 8px;">#</td>
        <td style="padding:7px 8px;">Action</td>
        <td style="padding:7px 8px;">Corps de métier</td>
        <td style="padding:7px 8px;">Objectif lié</td>
        <td style="padding:7px 8px;text-align:center;">Durée</td>
        <td style="padding:7px 8px;text-align:center;">Période</td>
        <td style="padding:7px 8px;text-align:right;">Coût HT</td>
      </tr>
      ${lignesProg || '<tr><td colspan="7" style="padding:10px;font-style:italic;">Aucune action générée.</td></tr>'}
    </table>`;

  // -- 3. Plan par corps de métier --
  const planMetier = `
    ${bandeau('3. Plan de formation par corps de métier')}
    ${filetOr}
    ${r.planParMetier.map((p) => `
      <div style="margin-bottom:14px;border-left:3px solid ${ECA.gold};padding:4px 0 4px 12px;">
        <div style="font-family:Georgia,serif;font-size:13pt;color:${ECA.navy};">${esc(p.corpsMetier)}
          <span style="font-family:Calibri,sans-serif;font-size:10pt;color:${ECA.teal};">— ${fmt(p.effectif)} pers. · priorité ${esc(p.priorite)}</span>
        </div>
        <div style="font-family:Calibri,sans-serif;font-size:10pt;margin-top:4px;">
          ${p.actions.map((a) => esc(a.intituleAction)).join(' &nbsp;·&nbsp; ') || 'Aucune action'}
        </div>
        <div style="font-family:Calibri,sans-serif;font-size:10pt;color:#555;margin-top:3px;">
          ${fmt(p.joursTotal)} jours-formateur · ${fmt(p.coutTotal)} ${devise} HT
        </div>
      </div>`).join('')}`;

  // -- 4. Calendrier annuel --
  const calendrier = `
    ${bandeau('4. Calendrier annuel des actions')}
    ${filetOr}
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:10pt;">
      <tr style="background:${ECA.navy};color:#fff;">
        ${['T1', 'T2', 'T3', 'T4'].map((t) => `<td style="padding:7px 8px;width:25%;">Trimestre ${t.slice(1)}</td>`).join('')}
      </tr>
      <tr style="vertical-align:top;">
        ${['T1', 'T2', 'T3', 'T4'].map((t) => `
          <td style="padding:8px;border:1px solid ${ECA.border};">
            ${r.calendrier[t].map((a) => `<div style="margin-bottom:6px;"><b style="color:${ECA.teal};">${esc(a.moisLibelle)}</b> — ${esc(a.intituleAction.split('—')[0].trim())}<br/><span style="color:#666;">${esc(a.corpsMetier)}</span></div>`).join('') || '<span style="color:#999;font-style:italic;">—</span>'}
          </td>`).join('')}
      </tr>
    </table>`;

  // -- 5. Estimation budgétaire --
  const b = r.budget;
  const budget = `
    ${bandeau('5. Estimation budgétaire')}
    ${filetOr}
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:11pt;">
      <tr><td style="padding:6px 10px;background:${ECA.light};font-weight:bold;color:${ECA.navy};width:50%;">Coût total estimé</td><td style="padding:6px 10px;text-align:right;">${fmt(b.coutTotalEstime)} ${devise} HT</td></tr>
      <tr><td style="padding:6px 10px;font-weight:bold;color:${ECA.navy};">Budget annuel disponible</td><td style="padding:6px 10px;text-align:right;">${b.budgetDisponible ? fmt(b.budgetDisponible) + ' ' + devise + ' HT' : 'Non renseigné'}</td></tr>
      <tr><td style="padding:6px 10px;background:${ECA.light};font-weight:bold;color:${ECA.navy};">Écart</td><td style="padding:6px 10px;text-align:right;">${b.ecart == null ? '—' : (b.ecart >= 0 ? '+' : '') + fmt(b.ecart) + ' ' + devise}</td></tr>
      <tr><td style="padding:6px 10px;font-weight:bold;color:${ECA.navy};">Statut</td><td style="padding:6px 10px;text-align:right;color:${b.statut === 'DÉPASSEMENT' ? '#B91C1C' : ECA.teal};font-weight:bold;">${statutBudgetLabel(b.statut)}</td></tr>
      <tr><td style="padding:6px 10px;background:${ECA.light};font-weight:bold;color:${ECA.navy};">Tarif jour-formateur appliqué</td><td style="padding:6px 10px;text-align:right;">${fmt(b.tarifJour)} ${devise} HT</td></tr>
    </table>
    <div style="font-family:Calibri,sans-serif;font-size:10pt;color:${ECA.navy};margin-top:10px;font-weight:bold;">Répartition par trimestre</div>
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:10pt;margin-top:4px;">
      <tr style="background:${ECA.teal};color:#fff;">${b.repartitionParTrimestre.map((x) => `<td style="padding:5px 8px;">${x.trimestre} (${x.nbActions})</td>`).join('')}</tr>
      <tr>${b.repartitionParTrimestre.map((x) => `<td style="padding:5px 8px;border:1px solid ${ECA.border};">${fmt(x.cout)} ${devise}</td>`).join('')}</tr>
    </table>`;

  // -- 6. KPI --
  const kpis = `
    ${bandeau('6. Indicateurs de performance (KPI — Indicateur Clé de Performance)')}
    ${filetOr}
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:10pt;">
      <tr style="background:${ECA.navy};color:#fff;"><td style="padding:7px 8px;">Indicateur</td><td style="padding:7px 8px;">Cible</td><td style="padding:7px 8px;">Mode de mesure</td></tr>
      ${r.kpis.map((k, i) => `<tr style="background:${i % 2 ? '#fff' : ECA.light};"><td style="padding:6px 8px;font-weight:bold;color:${ECA.navy};">${esc(k.libelle)}</td><td style="padding:6px 8px;">${esc(k.cible)}</td><td style="padding:6px 8px;">${esc(k.modeMesure)}</td></tr>`).join('')}
    </table>`;

  // -- 7. Résultats attendus & impact --
  const impact = `
    ${bandeau('7. Résultats attendus & impact sur les compétences')}
    ${filetOr}
    <p style="font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;">${esc(r.resultatsAttendus)}</p>
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:10pt;margin-top:8px;">
      <tr style="background:${ECA.navy};color:#fff;"><td style="padding:7px 8px;">Compétence cible</td><td style="padding:7px 8px;">Niveau visé</td><td style="padding:7px 8px;">Actions associées</td></tr>
      ${r.impactCompetences.map((c, i) => `<tr style="background:${i % 2 ? '#fff' : ECA.light};"><td style="padding:6px 8px;font-weight:bold;color:${ECA.navy};">${esc(c.competence)}</td><td style="padding:6px 8px;">${esc(c.niveauVise)}</td><td style="padding:6px 8px;">${c.actionsAssociees.map(esc).join(', ')}</td></tr>`).join('')}
    </table>`;

  // -- 8. Recommandations cabinets / formateurs --
  const rec = r.recommandations;
  const formateursBloc = Array.isArray(rec.formateursParAction)
    ? `
    <div style="font-family:Calibri,sans-serif;font-size:10pt;color:${ECA.navy};font-weight:bold;">Formateurs disponibles par action (agrément CNFCPP — Centre National de Formation Continue et de Promotion Professionnelle)</div>
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:10pt;margin:4px 0 12px;">
      <tr style="background:${ECA.teal};color:#fff;"><td style="padding:6px 8px;">Action</td><td style="padding:6px 8px;">Période</td><td style="padding:6px 8px;">Formateurs disponibles</td></tr>
      ${rec.formateursParAction.map((x) => `<tr>
        <td style="padding:5px 8px;border:1px solid ${ECA.border};">${esc(x.action.split('—')[0].trim())}</td>
        <td style="padding:5px 8px;border:1px solid ${ECA.border};">${esc(x.mois)}</td>
        <td style="padding:5px 8px;border:1px solid ${ECA.border};">${x.formateursDisponibles.length ? x.formateursDisponibles.map((f) => esc(f.nom) + (f.agrementCNFCPP ? ' (CNFCPP)' : '')).join(', ') : '<span style="color:#B91C1C;">' + esc(x.alerte || 'Aucun disponible') + '</span>'}</td>
      </tr>`).join('')}
    </table>`
    : `
    <div style="font-family:Calibri,sans-serif;font-size:10pt;color:${ECA.navy};font-weight:bold;">Formateurs (agrément CNFCPP — Centre National de Formation Continue et de Promotion Professionnelle)</div>
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:10pt;margin:4px 0 12px;">
      <tr style="background:${ECA.teal};color:#fff;"><td style="padding:6px 8px;">Formateur</td><td style="padding:6px 8px;">Spécialité</td><td style="padding:6px 8px;">Agrément CNFCPP</td></tr>
      ${(rec.formateurs || []).length ? rec.formateurs.map((f) => `<tr><td style="padding:5px 8px;border:1px solid ${ECA.border};">${esc(f.nom)}</td><td style="padding:5px 8px;border:1px solid ${ECA.border};">${esc(f.specialite)}</td><td style="padding:5px 8px;border:1px solid ${ECA.border};">${f.agrementCNFCPP ? 'Oui' : 'À vérifier'}</td></tr>`).join('') : `<tr><td colspan="3" style="padding:6px 8px;border:1px solid ${ECA.border};font-style:italic;">À sourcer</td></tr>`}
    </table>`;

  const recommandations = `
    ${bandeau('8. Cabinets & formateurs recommandés')}
    ${filetOr}
    <div style="font-family:Calibri,sans-serif;font-size:10pt;color:${ECA.navy};font-weight:bold;">Cabinets de formation</div>
    <table width="100%" style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:10pt;margin:4px 0 12px;">
      <tr style="background:${ECA.teal};color:#fff;"><td style="padding:6px 8px;">Cabinet</td><td style="padding:6px 8px;">Type</td><td style="padding:6px 8px;">Spécialité</td></tr>
      ${rec.cabinets.length ? rec.cabinets.map((c) => `<tr><td style="padding:5px 8px;border:1px solid ${ECA.border};">${esc(c.nom)}</td><td style="padding:5px 8px;border:1px solid ${ECA.border};">${c.type === 'international' ? 'International' : 'Local'}</td><td style="padding:5px 8px;border:1px solid ${ECA.border};">${esc(c.specialite)}</td></tr>`).join('') : `<tr><td colspan="3" style="padding:6px 8px;border:1px solid ${ECA.border};font-style:italic;">À sourcer</td></tr>`}
    </table>
    ${formateursBloc}
    <p style="font-family:Calibri,sans-serif;font-size:10pt;color:${ECA.gold};font-weight:bold;">${esc(rec.note)}</p>`;

  const corps = [contexte, programme, planMetier, calendrier, budget, kpis, impact, recommandations].join('\n');

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8" />
<title>Programme Annuel de Formation — ${esc(m.entreprise)} ${esc(m.annee)}</title>
</head>
<body style="margin:0;background:#fff;color:#222;">
  ${couverture}
  <div style="padding:34px 48px;">${corps}
    <div style="margin-top:36px;padding-top:12px;border-top:2px solid ${ECA.gold};font-family:Calibri,sans-serif;font-size:9pt;color:#888;text-align:center;">
      OCTOGO Formation &amp; Conseil — École de la Cohérence Adaptative · Document généré le ${esc(m.dateGeneration)}
    </div>
  </div>
</body></html>`;
}

// -----------------------------------------------------------------------------
// Export Word (.doc) — Blob application/msword, sans dépendance
// -----------------------------------------------------------------------------
export function exporterWord(resultat, options = {}) {
  const html = buildDocumentHtml(resultat, options);
  // On insère les espaces de noms Office dans la balise <html> et on conserve
  // le <head> (donc le charset UTF-8) pour un rendu correct des accents.
  const contenu = html
    .replace(/<!DOCTYPE html>/i, '')
    .replace(
      /<html[^>]*>/i,
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
        'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
        'xmlns="http://www.w3.org/TR/REC-html40">'
    );
  const blob = new Blob(['\ufeff', contenu], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const nom = `Programme_Formation_${(resultat.meta.entreprise || 'OCTOGO').replace(/[^a-z0-9]/gi, '_')}_${resultat.meta.annee}.doc`;
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// -----------------------------------------------------------------------------
// Export PDF (Portable Document Format) — impression native, sans dépendance
// -----------------------------------------------------------------------------
export function exporterPDF(resultat, options = {}) {
  const html = buildDocumentHtml(resultat, options);
  const w = window.open('', '_blank');
  if (!w) {
    alert('Veuillez autoriser les fenêtres contextuelles pour générer le PDF (Portable Document Format).');
    return;
  }
  w.document.open();
  w.document.write(html.replace('</head>', `<style>
    @page { size: A4; margin: 14mm; }
    @media print { table { page-break-inside: avoid; } h2 { page-break-after: avoid; } }
  </style></head>`));
  w.document.close();
  w.focus();
  // Laisser le temps au rendu avant impression.
  setTimeout(() => { w.print(); }, 500);
}