// backend/documentGenerator.js
// -----------------------------------------------------------------------------
// Génération de VRAIS fichiers PDF (pas de simple export JSON) pour les
// documents du module Génération de Programme, en mode 100% local (aucune IA).
//
// Utilise `pdfkit` (npm install pdfkit — voir INTEGRATION.md).
//
// OÙ PERSONNALISER :
//   - Couleurs / nom d'entreprise / logo → backend/templates/branding.json
//     (rien n'est codé en dur ici : toute la mise en forme lit ce fichier)
//   - Mise en page de CHAQUE document → les fonctions ci-dessous, une par
//     type de document. Chacune est un point de remplacement clair.
//
// PASSAGE FUTUR EN DOCX (si vous préférez du Word éditable plutôt que du PDF,
// notamment pour la facture) : installez `docx` (npm install docx) et créez
// backend/documentGeneratorDocx.js avec les mêmes noms de fonctions
// (genererFacturePDF -> genererFactureDOCX, etc.), puis changez l'import dans
// generationRoutes.js. La route de téléchargement n'a pas besoin d'autre
// changement que le Content-Type et l'extension du fichier.
// -----------------------------------------------------------------------------
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const templatesDir = path.join(__dirname, 'templates');

function branding() {
    try {
        return JSON.parse(fs.readFileSync(path.join(templatesDir, 'branding.json'), 'utf8'));
    } catch (e) {
        return { entreprise: 'OCTOGO', couleurPrimaire: '#7C3AED', couleurTexte: '#1F2937', pied: '' };
    }
}

// ---- mise en page commune ----
function nouveauDocument(titreDocument) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const b = branding();

    const dessinerEntete = () => {
        doc.rect(0, 0, doc.page.width, 90).fill(b.couleurPrimaire);
        doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
            .text(b.entreprise || 'OCTOGO', 50, 28);
        if (b.sousTitre) {
            doc.fontSize(10).font('Helvetica').text(b.sousTitre, 50, 52);
        }
        doc.fontSize(13).font('Helvetica-Bold')
            .text(titreDocument, 50, 28, { align: 'right', width: doc.page.width - 100 });
        doc.fillColor(b.couleurTexte || '#1F2937');
        doc.y = 110;
    };

    dessinerEntete();
    doc.on('pageAdded', dessinerEntete);

    doc._brandingPied = b.pied || '';
    return doc;
}

function ajouterPiedDePage(doc) {
    const pied = doc._brandingPied;
    if (!pied) return;
    // Rester STRICTEMENT dans la zone de marge (page.height - margin.bottom),
    // sinon pdfkit interprète la position comme hors-page et ajoute une page
    // vierge supplémentaire avant d'écrire le texte.
    const y = doc.page.height - doc.page.margins.bottom - 15;
    doc.fontSize(8).fillColor('#9CA3AF')
        .text(pied, 50, y, { align: 'center', width: doc.page.width - 100, lineBreak: false });
}

function titreSection(doc, texte) {
    doc.moveDown(0.6);
    doc.fontSize(12).font('Helvetica-Bold').fillColor(branding().couleurPrimaire).text(texte);
    doc.fillColor(branding().couleurTexte || '#1F2937');
    doc.moveDown(0.2);
}

function champ(doc, label, valeur) {
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#6B7280').text(label.toUpperCase());
    doc.fontSize(11).font('Helvetica').fillColor(branding().couleurTexte || '#1F2937')
        .text(valeur && String(valeur).trim() ? String(valeur) : 'Non renseigné', { paragraphGap: 8 });
}

function ligneSeparation(doc) {
    doc.moveDown(0.3);
    doc.strokeColor('#E5E7EB').moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(0.5);
}

// simple tableau (en-têtes + lignes de texte)
function tableau(doc, headers, rows, colWidths) {
    const startX = 50;
    let y = doc.y;
    const rowHeight = 22;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(branding().couleurPrimaire);
    let x = startX;
    headers.forEach((h, i) => {
        doc.fillColor('#FFFFFF').text(h, x + 6, y + 6, { width: colWidths[i] - 10 });
        x += colWidths[i];
    });
    y += rowHeight;

    doc.font('Helvetica').fontSize(9);
    rows.forEach((row, ri) => {
        if (y > doc.page.height - 80) { doc.addPage(); y = doc.y; }
        if (ri % 2 === 1) doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#F9FAFB');
        x = startX;
        row.forEach((cell, i) => {
            doc.fillColor('#1F2937').text(String(cell ?? ''), x + 6, y + 6, { width: colWidths[i] - 10 });
            x += colWidths[i];
        });
        y += rowHeight;
    });
    doc.y = y + 10;
}

// =============================================================================
// 1. FICHE PROGRAMME
// =============================================================================
function genererFicheProgrammePDF(doc, data = {}) {
    doc.fontSize(16).font('Helvetica-Bold').text(data.titre || 'Fiche Programme');
    doc.fontSize(10).font('Helvetica').fillColor('#6B7280')
        .text([data.niveau, data.duree, data.nombreHeures && `${data.nombreHeures} h`].filter(Boolean).join('  ·  '));
    doc.fillColor(branding().couleurTexte || '#1F2937');
    ligneSeparation(doc);

    titreSection(doc, 'Public cible'); champ(doc, '', data.publicCible);
    titreSection(doc, 'Prérequis'); champ(doc, '', data.prerequis);
    titreSection(doc, 'Objectifs pédagogiques'); champ(doc, '', data.objectifsPedagogiques);
    titreSection(doc, 'Compétences développées'); champ(doc, '', data.competencesDeveloppees);
    titreSection(doc, 'Méthodes & moyens pédagogiques');
    champ(doc, '', [data.methodesPedagogiques, data.moyensPedagogiques].filter(Boolean).join(' — '));
    titreSection(doc, 'Contenu détaillé'); champ(doc, '', data.contenuDetaille);
    titreSection(doc, 'Déroulement'); champ(doc, '', data.deroulement);
    ajouterPiedDePage(doc);
}

// =============================================================================
// 2. DEVIS
// =============================================================================
function genererDevisPDF(doc, data = {}) {
    titreSection(doc, 'Informations client');
    champ(doc, 'Client / société', data.infosClient);
    champ(doc, 'Formation', data.formation);

    doc.moveDown(0.3);
    tableau(doc, ['Désignation', 'Participants', 'Jours', 'Prix HT'], [
        [data.formation || 'Formation', data.nbParticipants || '-', data.nbJours || '-', data.prixHT || '-'],
    ], [220, 90, 70, 110]);

    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text(`TVA : ${data.tva || '-'}`, { align: 'right' });
    doc.fontSize(13).fillColor(branding().couleurPrimaire).text(`Total TTC : ${data.totalTTC || '-'}`, { align: 'right' });
    doc.fillColor(branding().couleurTexte || '#1F2937');

    ligneSeparation(doc);
    titreSection(doc, 'Conditions'); champ(doc, '', data.conditions);
    doc.moveDown(1.5);
    doc.fontSize(10).text('Signature (bon pour accord) :');
    doc.moveDown(2);
    doc.strokeColor('#E5E7EB').moveTo(50, doc.y).lineTo(220, doc.y).stroke();
    ajouterPiedDePage(doc);
}

// =============================================================================
// 3. FACTURE
// =============================================================================
function genererFacturePDF(doc, data = {}) {
    titreSection(doc, 'Facturé à'); champ(doc, '', data.infosClient);

    const lignes = data.lignes || [];
    doc.moveDown(0.3);
    tableau(
        doc, ['Désignation', 'Qté', 'Prix unitaire'],
        lignes.map((l) => [l.designation || '', l.quantite || '', l.prixUnitaire || '']),
        [300, 80, 110],
    );

    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Total HT : ${data.totalHT || '-'}`, { align: 'right' });
    doc.text(`TVA : ${data.tva || '-'}`, { align: 'right' });
    doc.fontSize(13).font('Helvetica-Bold').fillColor(branding().couleurPrimaire)
        .text(`Total TTC : ${data.totalTTC || '-'}`, { align: 'right' });
    doc.fillColor(branding().couleurTexte || '#1F2937');
    ajouterPiedDePage(doc);
}

// =============================================================================
// 4. FEUILLE DE PRÉSENCE
// =============================================================================
function genererPresencePDF(doc, data = {}, contexte = {}) {
    champ(doc, 'Formation', contexte.formation);
    champ(doc, 'Société', contexte.societe);
    champ(doc, 'Date', contexte.date);

    doc.moveDown(0.3);
    const lignes = (data.lignes || []).map((l) => [l.nom || '', l.prenom || '', l.fonction || '', '', '']);
    tableau(doc, ['Nom', 'Prénom', 'Fonction', 'Sign. matin', 'Sign. après-midi'], lignes, [110, 110, 110, 80, 90]);
    ajouterPiedDePage(doc);
}

// =============================================================================
// 5. ÉVALUATIONS (modèle vierge à remplir à la main)
// =============================================================================
function genererEvaluationPDF(doc, data = {}, phase = 'avant') {
    const questions = phase === 'avant'
        ? [['Vos attentes vis-à-vis de cette formation :', data?.avant?.attentes],
            ['Votre niveau actuel sur le sujet :', data?.avant?.niveau],
            ['Vos besoins spécifiques :', data?.avant?.besoins]]
        : [['Satisfaction globale (1 à 5) :', data?.apres?.satisfaction],
            ['Qualité de la formation :', data?.apres?.qualite],
            ['Animation :', data?.apres?.animation],
            ['Contenu :', data?.apres?.contenu],
            ['Utilité pour votre activité :', data?.apres?.utilite],
            ['Recommandations :', data?.apres?.recommandations]];

    doc.fontSize(14).font('Helvetica-Bold')
        .text(phase === 'avant' ? 'Évaluation — Avant formation' : 'Évaluation — Après formation');
    doc.moveDown(0.5);

    questions.forEach(([q, reponse]) => {
        doc.fontSize(11).font('Helvetica-Bold').text(q);
        doc.fontSize(10).font('Helvetica').fillColor('#6B7280')
            .text(reponse && String(reponse).trim() ? String(reponse) : '_______________________________________________');
        doc.fillColor(branding().couleurTexte || '#1F2937');
        doc.moveDown(0.8);
    });
    ajouterPiedDePage(doc);
}

// =============================================================================
// 6. KPI (Indicateur Clé de Performance)
// =============================================================================
function genererKPIPDF(doc, data = {}) {
    const indicateurs = data.indicateurs || [];
    tableau(doc, ['Indicateur', 'Objectif', 'Résultat'], indicateurs.map((i) => [i.nom, i.objectif, i.resultat]), [220, 130, 130]);

    doc.moveDown(0.5);
    titreSection(doc, 'Synthèse');
    champ(doc, 'ROI (Retour sur investissement)', data.roi);
    champ(doc, 'Efficacité globale', data.efficacite);
    ajouterPiedDePage(doc);
}

// =============================================================================
// 7. ÉTUDE D'IMPACT
// =============================================================================
function genererImpactPDF(doc, data = {}) {
    titreSection(doc, 'Objectifs'); champ(doc, '', data.objectifs);
    titreSection(doc, 'Indicateurs suivis'); champ(doc, '', data.indicateurs);
    titreSection(doc, 'Observations'); champ(doc, '', data.observations);
    titreSection(doc, 'Recommandations'); champ(doc, '', data.recommandations);
    titreSection(doc, 'Conclusions'); champ(doc, '', data.conclusions);
    ajouterPiedDePage(doc);
}

module.exports = {
    nouveauDocument,
    genererFicheProgrammePDF,
    genererDevisPDF,
    genererFacturePDF,
    genererPresencePDF,
    genererEvaluationPDF,
    genererKPIPDF,
    genererImpactPDF,
};
