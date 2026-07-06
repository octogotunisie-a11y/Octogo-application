// src/components/generation/InvoiceTemplate.jsx
// TODO : modèle simple — à remplacer par le modèle de facture officiel de
// l'utilisateur ("Je remplacerai ensuite les informations par mon propre modèle").
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { C } from '../../constants/generationConstants';
import { Row, useEditableData } from './shared/fields';

export default function InvoiceTemplate({ data, onChange, editable }) {
  const { data: d, set } = useEditableData(data, onChange);
  const lignes = d.lignes && d.lignes.length ? d.lignes : [{ designation: '', quantite: 1, prixUnitaire: 0 }];

  const updateLigne = (i, champ, valeur) => {
    const next = [...lignes];
    next[i] = { ...next[i], [champ]: valeur };
    set('lignes', next);
  };
  const ajouterLigne = () => set('lignes', [...lignes, { designation: '', quantite: 1, prixUnitaire: 0 }]);
  const supprimerLigne = (i) => set('lignes', lignes.filter((_, idx) => idx !== i));

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
      <Row label="Client / société" value={d.infosClient} editable={editable} onChange={(v) => set('infosClient', v)} />

      <div style={{ marginTop: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              {['Désignation', 'Qté', 'Prix unitaire (DT)', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11.5, color: C.muted, borderBottom: `2px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, i) => (
              <tr key={i}>
                <td style={{ padding: '6px 10px', borderBottom: `1px solid ${C.border}` }}>
                  {editable ? <input style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13 }} value={l.designation} onChange={(e) => updateLigne(i, 'designation', e.target.value)} /> : l.designation}
                </td>
                <td style={{ padding: '6px 10px', borderBottom: `1px solid ${C.border}`, width: 70 }}>
                  {editable ? <input type="number" style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13 }} value={l.quantite} onChange={(e) => updateLigne(i, 'quantite', e.target.value)} /> : l.quantite}
                </td>
                <td style={{ padding: '6px 10px', borderBottom: `1px solid ${C.border}`, width: 130 }}>
                  {editable ? <input type="number" style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13 }} value={l.prixUnitaire} onChange={(e) => updateLigne(i, 'prixUnitaire', e.target.value)} /> : l.prixUnitaire}
                </td>
                <td style={{ padding: '6px 10px', borderBottom: `1px solid ${C.border}`, width: 32 }}>
                  {editable && <button onClick={() => supprimerLigne(i)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}><Trash2 size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editable && (
          <button onClick={ajouterLigne} style={{ marginTop: 8, fontSize: 12, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Plus size={13} /> Ajouter une ligne
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.muted }}>Total HT</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{d.totalHT ?? '—'} DT</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.muted }}>TVA</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{d.tva ?? '—'} DT</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.primary }}>Total TTC</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.primary }}>{d.totalTTC ?? '—'} DT</div>
        </div>
      </div>
    </div>
  );
}
