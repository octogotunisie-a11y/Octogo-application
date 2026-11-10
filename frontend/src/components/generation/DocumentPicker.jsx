// src/components/generation/DocumentPicker.jsx
// Sélection d'un document déjà présent dans « Mes documents » comme source de la
// génération en cours (aucun réimport). Données réelles : /api/documents.
import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { C } from '../../constants/generationConstants';
import { listerDocuments, formaterTaille, statutExtraction } from '../../services/documentsService';

export default function DocumentPicker({ selectionId, onSelect }) {
  const [documents, setDocuments] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let actif = true;
    listerDocuments().then((d) => actif && setDocuments(d)).catch((e) => { if (actif) { setErreur(e.message); setDocuments([]); } });
    return () => { actif = false; };
  }, []);

  if (documents === null) return <div style={{ color: C.muted, fontSize: 14 }}>Chargement de vos documents…</div>;
  if (erreur) return <div style={{ color: C.danger, fontSize: 14 }}>{erreur}</div>;
  if (documents.length === 0) {
    return (
      <div style={{ padding: '28px 16px', textAlign: 'center', border: `1px dashed ${C.border}`, borderRadius: 12, color: C.muted, fontSize: 14 }}>
        Vous n’avez pas encore de document enregistré. Importez-en un nouveau : il apparaîtra ensuite dans « Mes documents » et pourra être réutilisé.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
      {documents.map((d) => {
        const actif = d.id === selectionId;
        const st = statutExtraction(d.extraction);
        const lisible = d.extraction && d.extraction.status === 'extracted';
        return (
          <button
            key={d.id} type="button" onClick={() => onSelect(d)} aria-pressed={actif}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', textAlign: 'left',
              borderRadius: 12, cursor: 'pointer', background: actif ? `${C.primary}08` : '#fff',
              border: `2px solid ${actif ? C.primary : C.border}`,
            }}
          >
            {actif ? <CheckCircle2 size={22} color={C.primary} /> : <FileText size={22} color={C.muted} />}
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 14, color: C.dark, wordBreak: 'break-word' }}>{d.nom}</span>
              <span style={{ fontSize: 12, color: C.muted }}>
                {formaterTaille(d.taille)} · {new Date(d.creeLe).toLocaleDateString('fr-FR')} · {st.label}
              </span>
            </span>
            {!lisible && <span title={d.extraction && d.extraction.message} style={{ fontSize: 12, color: C.danger }}>⚠ non lisible</span>}
          </button>
        );
      })}
    </div>
  );
}
