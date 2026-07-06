// src/components/generation/ImpactStudy.jsx
import React from 'react';
import { C } from '../../constants/generationConstants';
import { Row, useEditableData } from './shared/fields';

export default function ImpactStudy({ data, onChange, editable }) {
  const { data: d, set } = useEditableData(data, onChange);
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: 18 }}>
      <Row label="Objectifs" value={d.objectifs} editable={editable} onChange={(v) => set('objectifs', v)} textarea />
      <Row label="Indicateurs" value={d.indicateurs} editable={editable} onChange={(v) => set('indicateurs', v)} textarea />
      <Row label="Observations" value={d.observations} editable={editable} onChange={(v) => set('observations', v)} textarea />
      <Row label="Recommandations" value={d.recommandations} editable={editable} onChange={(v) => set('recommandations', v)} textarea />
      <Row label="Conclusions" value={d.conclusions} editable={editable} onChange={(v) => set('conclusions', v)} textarea />
    </div>
  );
}
