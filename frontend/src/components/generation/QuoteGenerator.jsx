// src/components/generation/QuoteGenerator.jsx
// -----------------------------------------------------------------------------
// Module « Devis ». Le prix est aujourd'hui calculé localement à titre
// indicatif (utils/durationCalculator.js). TODO IA / TODO backend : brancher
// la grille tarifaire officielle (backend/data/tarifs.json + parametresGeneration.json)
// une fois ce module relié au moteur de génération de programme existant.
// -----------------------------------------------------------------------------
import React from 'react';
import { C } from '../../constants/generationConstants';
import { Row, Grid, useEditableData } from './shared/fields';

export default function QuoteGenerator({ data, onChange, editable }) {
  const { data: d, set } = useEditableData(data, onChange);

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 12, textTransform: 'uppercase' }}>
          Informations client
        </div>
        <Grid>
          <Row label="Client / société" value={d.infosClient} editable={editable} onChange={(v) => set('infosClient', v)} />
          <Row label="Formation concernée" value={d.formation} editable={editable} onChange={(v) => set('formation', v)} />
          <Row label="Nombre de participants" value={d.nbParticipants} editable={editable} onChange={(v) => set('nbParticipants', v)} />
          <Row label="Nombre de jours" value={d.nbJours} editable={editable} onChange={(v) => set('nbJours', v)} />
        </Grid>

        <div style={{ height: 1, background: C.border, margin: '16px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ background: C.light, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.muted }}>Prix HT (Hors Taxes)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>
              {editable ? (
                <input style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 6, padding: 6, fontSize: 16 }}
                  value={d.prixHT ?? ''} onChange={(e) => set('prixHT', e.target.value)} />
              ) : (d.prixHT ? `${d.prixHT} DT` : '—')}
            </div>
          </div>
          <div style={{ background: C.light, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.muted }}>TVA (Taxe sur la Valeur Ajoutée, 19%)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{d.tva ? `${d.tva} DT` : '—'}</div>
          </div>
          <div style={{ background: `${C.primary}12`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.primary }}>Total TTC (Toutes Taxes Comprises)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{d.totalTTC ? `${d.totalTTC} DT` : '—'}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Row label="Conditions" value={d.conditions} editable={editable} onChange={(v) => set('conditions', v)} textarea />
          <Row label="Signature" value={d.signature} editable={editable} onChange={(v) => set('signature', v)} />
        </div>
      </div>
    </div>
  );
}
