// src/components/generation/AttendanceGenerator.jsx
// -----------------------------------------------------------------------------
// Module « Feuille de présence ». Modèle vierge simple, à remplacer par le
// fichier Excel officiel de l'utilisateur (voir consigne : "Je remplacerai
// ensuite ce modèle par mon fichier Excel officiel").
// -----------------------------------------------------------------------------
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { C } from '../../constants/generationConstants';

const th = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: C.muted, borderBottom: `2px solid ${C.border}`, textTransform: 'uppercase' };
const td = { padding: '8px 12px', fontSize: 13, borderBottom: `1px solid ${C.border}` };
const cellInput = { width: '100%', border: 'none', background: 'transparent', fontSize: 13, padding: 4, outline: 'none' };

export default function AttendanceGenerator({ data, onChange, editable }) {
  const d = data || {};
  const lignes = d.lignes && d.lignes.length ? d.lignes : Array.from({ length: 5 }, () => ({ nom: '', prenom: '', fonction: '', signatureMatin: '', signatureApresMidi: '' }));

  const updateLigne = (i, champ, valeur) => {
    const next = [...lignes];
    next[i] = { ...next[i], [champ]: valeur };
    onChange({ ...d, lignes: next });
  };
  const ajouterLigne = () => onChange({ ...d, lignes: [...lignes, { nom: '', prenom: '', fonction: '', signatureMatin: '', signatureApresMidi: '' }] });
  const supprimerLigne = (i) => onChange({ ...d, lignes: lignes.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, border: `1px solid ${C.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr>
              <th style={th}>Nom</th><th style={th}>Prénom</th><th style={th}>Fonction</th>
              <th style={th}>Signature matin</th><th style={th}>Signature après-midi</th>
              {editable && <th style={th}></th>}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, i) => (
              <tr key={i}>
                {['nom', 'prenom', 'fonction', 'signatureMatin', 'signatureApresMidi'].map((champ) => (
                  <td key={champ} style={td}>
                    {editable ? (
                      <input style={cellInput} value={l[champ] || ''} onChange={(e) => updateLigne(i, champ, e.target.value)} />
                    ) : (l[champ] || <span style={{ color: C.muted }}>—</span>)}
                  </td>
                ))}
                {editable && (
                  <td style={td}>
                    <button onClick={() => supprimerLigne(i)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editable && (
        <button onClick={ajouterLigne} style={{
          marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
          color: C.primary, background: `${C.primary}08`, border: `1px dashed ${C.primary}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
        }}>
          <Plus size={14} /> Ajouter une ligne
        </button>
      )}
    </div>
  );
}
