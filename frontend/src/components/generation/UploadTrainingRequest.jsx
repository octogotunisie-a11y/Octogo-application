// src/components/generation/UploadTrainingRequest.jsx
// -----------------------------------------------------------------------------
// Étape 2 du parcours : le client décrit son besoin, soit en important un
// document (PDF/DOCX/DOC/TXT — analysé plus tard par l'IA), soit en tapant
// directement sa demande dans une zone de texte avec thèmes suggérés.
// -----------------------------------------------------------------------------
import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Type } from 'lucide-react';
import {
  C, DESCRIPTION_MODES, ACCEPTED_DOCUMENT_TYPES, ACCEPTED_DOCUMENT_MIME, THEMES_SUGGERES,
} from '../../constants/generationConstants';

const tabStyle = (actif) => ({
  flex: 1, padding: '12px 16px', textAlign: 'center', cursor: 'pointer',
  fontWeight: 700, fontSize: 14, borderRadius: 10,
  background: actif ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})` : '#fff',
  color: actif ? '#fff' : C.muted,
  border: actif ? 'none' : `1px solid ${C.border}`,
  transition: 'all 0.15s',
});

export default function UploadTrainingRequest({ description, setDescription }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const setMode = (mode) => setDescription((d) => ({ ...d, mode }));
  const setTexte = (texte) => setDescription((d) => ({ ...d, texte }));

  const handleFile = (file) => {
    if (!file) return;
    const extOk = ACCEPTED_DOCUMENT_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext));
    const mimeOk = ACCEPTED_DOCUMENT_MIME.includes(file.type) || file.type === '';
    if (!extOk && !mimeOk) {
      alert(`Format non supporté. Formats acceptés : ${ACCEPTED_DOCUMENT_TYPES.join(', ')}`);
      return;
    }
    setDescription((d) => ({ ...d, fichier: file, fichierNom: file.name }));
  };

  const retirerFichier = () => setDescription((d) => ({ ...d, fichier: null, fichierNom: null }));

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {DESCRIPTION_MODES.map((m) => (
          <div key={m.id} style={tabStyle(description.mode === m.id)} onClick={() => setMode(m.id)}>
            {m.label}
          </div>
        ))}
      </div>

      {description.mode === 'upload' && (
        <div>
          {!description.fichierNom ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
              style={{
                border: `2px dashed ${dragOver ? C.primary : C.border}`, borderRadius: 14,
                padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? `${C.primary}08` : C.light, transition: 'all 0.15s',
              }}
            >
              <UploadCloud size={40} color={C.primary} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 700, color: C.dark, marginBottom: 4 }}>
                Glissez votre document ici ou cliquez pour parcourir
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                Formats acceptés : {ACCEPTED_DOCUMENT_TYPES.join(', ')}
              </div>
              <input
                ref={inputRef} type="file" hidden
                accept={ACCEPTED_DOCUMENT_TYPES.join(',')}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px',
              border: `1px solid ${C.border}`, borderRadius: 12, background: '#fff',
            }}>
              <FileText size={28} color={C.primary} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: C.dark, fontSize: 14 }}>{description.fichierNom}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Sera analysé par l\u2019IA lors de la génération</div>
              </div>
              <button onClick={retirerFichier} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger }}>
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {description.mode === 'text' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Type size={16} color={C.primary} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>Décrivez votre besoin</span>
          </div>
          <textarea
            rows={7}
            value={description.texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Ex : Nous souhaitons une formation en gestion du stress pour 15 managers, orientée neurosciences appliquées, sur 2 jours..."
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: `1px solid ${C.border}`,
              fontSize: 14, color: C.dark, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Thèmes fréquents (cliquez pour ajouter) :</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {THEMES_SUGGERES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => setTexte(description.texte ? `${description.texte}, ${theme}` : theme)}
                  style={{
                    fontSize: 12.5, padding: '6px 12px', borderRadius: 999,
                    border: `1px solid ${C.primary}40`, background: `${C.primary}08`,
                    color: C.primary, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  + {theme}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
