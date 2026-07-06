// src/components/generation/GeneratedDocuments.jsx
// -----------------------------------------------------------------------------
// Section « Documents générés » : vue bibliothèque de tous les livrables
// (Programme, Devis, Feuille de présence, Fiche programme, Évaluations,
// KPI, Étude d'impact, Facture) avec actions Voir / Modifier / Télécharger / Supprimer.
// -----------------------------------------------------------------------------
import React from 'react';
import { Eye, Pencil, Download, Trash2, FileStack } from 'lucide-react';
import { C, STATUS_LABELS, STATUS_COLORS, DOCUMENT_STATUS } from '../../constants/generationConstants';

const DOCS = [
  { key: 'programme', label: 'Programme' },
  { key: 'devis', label: 'Devis' },
  { key: 'presence', label: 'Feuille de présence' },
  { key: 'fiche', label: 'Fiche programme' },
  { key: 'evaluation', label: 'Évaluation (avant/après)' },
  { key: 'kpi', label: 'KPI' },
  { key: 'impact', label: 'Étude d\u2019impact' },
  { key: 'facture', label: 'Facture' },
];

const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' };

export default function GeneratedDocuments({ documents, onVoir, onModifier, onTelecharger, onSupprimer }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <FileStack size={18} color={C.primary} />
        <span style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>Documents générés</span>
      </div>

      <div>
        {DOCS.map((doc, i) => {
          const d = documents[doc.key] || {};
          const dispo = d.status && d.status !== DOCUMENT_STATUS.VIDE;
          return (
            <div key={doc.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px', borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{doc.label}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
                  background: `${STATUS_COLORS[d.status || DOCUMENT_STATUS.VIDE]}15`,
                  color: STATUS_COLORS[d.status || DOCUMENT_STATUS.VIDE],
                }}>
                  {STATUS_LABELS[d.status || DOCUMENT_STATUS.VIDE]}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ ...iconBtn, color: dispo ? C.primary : C.border }} disabled={!dispo} onClick={() => onVoir(doc.key)} title="Voir"><Eye size={16} /></button>
                <button style={{ ...iconBtn, color: dispo ? C.dark : C.border }} disabled={!dispo} onClick={() => onModifier(doc.key)} title="Modifier"><Pencil size={16} /></button>
                <button style={{ ...iconBtn, color: dispo ? C.ok : C.border }} disabled={!dispo} onClick={() => onTelecharger(doc.key)} title="Télécharger"><Download size={16} /></button>
                <button style={{ ...iconBtn, color: dispo ? C.danger : C.border }} disabled={!dispo} onClick={() => onSupprimer(doc.key)} title="Supprimer"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
