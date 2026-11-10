// src/components/generation/UploadTrainingRequest.jsx
// -----------------------------------------------------------------------------
// Étape 2 du parcours : le client décrit son besoin, soit en important un
// document (PDF/DOCX/DOC/TXT — analysé plus tard par l'IA), soit en tapant
// directement sa demande dans une zone de texte avec thèmes suggérés.
// -----------------------------------------------------------------------------
import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, Type } from 'lucide-react';
import {
  C, DESCRIPTION_MODES, ACCEPTED_DOCUMENT_TYPES, THEMES_SUGGERES,
} from '../../constants/generationConstants';
import DocumentPicker from './DocumentPicker';
import { importerDocument, validerFichier, statutExtraction } from '../../services/documentsService';

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
  const [source, setSource] = useState('nouveau');   // 'nouveau' | 'existant'
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const setMode = (mode) => setDescription((d) => ({ ...d, mode }));
  const setTexte = (texte) => setDescription((d) => ({ ...d, texte }));

  // Import réel immédiat dans « Mes documents » (stockage privé du serveur).
  const handleFile = async (file) => {
    if (!file || envoi) return;
    const err = validerFichier(file);
    if (err) { setErreur(err); return; }
    setErreur(null); setEnvoi(true);
    try {
      const doc = await importerDocument(file, { categorie: 'besoin' });
      setDescription((d) => ({ ...d, fichier: null, documentId: doc.id, fichierNom: doc.nom, extraction: doc.extraction }));
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  const choisirExistant = (doc) => {
    setErreur(null);
    setDescription((d) => ({ ...d, fichier: null, documentId: doc.id, fichierNom: doc.nom, extraction: doc.extraction }));
  };

  // Retire la source de CETTE génération ; le document reste dans « Mes documents ».
  const retirerFichier = () => setDescription((d) => ({ ...d, fichier: null, fichierNom: null, documentId: null, extraction: null }));

  const onglet = (actif) => ({
    padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
    border: `1px solid ${actif ? C.primary : C.border}`, background: actif ? `${C.primary}10` : '#fff',
    color: actif ? C.primary : C.muted,
  });
  const st = description.extraction ? statutExtraction(description.extraction) : null;

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
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
            Le document que vous choisissez sera enregistré dans « Mes documents » et servira de source pour cette génération.
            Formats acceptés : {ACCEPTED_DOCUMENT_TYPES.join(', ')}.
          </div>

          {!description.fichierNom && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <button type="button" style={onglet(source === 'nouveau')} onClick={() => setSource('nouveau')}>Importer un nouveau document</button>
              <button type="button" style={onglet(source === 'existant')} onClick={() => setSource('existant')}>Choisir dans Mes documents</button>
            </div>
          )}

          {erreur && (
            <div role="alert" style={{ color: C.danger, fontSize: 13.5, marginBottom: 12 }}>{erreur}</div>
          )}

          {!description.fichierNom ? (
            source === 'existant' ? (
              <DocumentPicker selectionId={description.documentId} onSelect={choisirExistant} />
            ) : (
              <div
                onClick={() => !envoi && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                style={{
                  border: `2px dashed ${dragOver ? C.primary : C.border}`, borderRadius: 14,
                  padding: '48px 24px', textAlign: 'center', cursor: envoi ? 'progress' : 'pointer',
                  background: dragOver ? `${C.primary}08` : C.light, transition: 'all 0.15s',
                }}
              >
                <UploadCloud size={40} color={C.primary} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700, color: C.dark, marginBottom: 4 }}>
                  {envoi ? 'Import en cours…' : 'Glissez votre document ici ou cliquez pour parcourir'}
                </div>
                <div style={{ fontSize: 13, color: C.muted }}>
                  Formats acceptés : {ACCEPTED_DOCUMENT_TYPES.join(', ')} — 10 Mo maximum
                </div>
                <input
                  ref={inputRef} type="file" hidden
                  accept={ACCEPTED_DOCUMENT_TYPES.join(',')}
                  onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
                />
              </div>
            )
          ) : (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px',
                border: `1px solid ${C.border}`, borderRadius: 12, background: '#fff',
              }}>
                <FileText size={28} color={C.primary} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: C.dark, fontSize: 14, wordBreak: 'break-word' }}>{description.fichierNom}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    Document sélectionné comme source de cette génération — {st ? st.label : ''}
                  </div>
                </div>
                <button type="button" onClick={retirerFichier} title="Retirer de cette génération (le document reste dans Mes documents)"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>
                Votre document a été ajouté. Il est disponible dans « Mes documents » ; le retirer ici ne le supprime pas.
              </div>
              {description.extraction && description.extraction.status !== 'extracted' && (
                <div role="alert" style={{ fontSize: 13, color: C.danger, marginTop: 8 }}>
                  Ce document ne pourra pas être utilisé comme source par l’IA : {description.extraction.message}
                </div>
              )}
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
