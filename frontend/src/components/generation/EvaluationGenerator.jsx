// src/components/generation/EvaluationGenerator.jsx
import React from 'react';
import { C } from '../../constants/generationConstants';
import { Row, useEditableData } from './shared/fields';

const Bloc = ({ titre, children }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: 18, flex: 1 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, textTransform: 'uppercase', marginBottom: 12 }}>{titre}</div>
    {children}
  </div>
);

export default function EvaluationGenerator({ data, onChange, editable }) {
  const { data: d, set } = useEditableData(data, onChange);
  const avant = d.avant || {};
  const apres = d.apres || {};
  const setAvant = (k, v) => set('avant', { ...avant, [k]: v });
  const setApres = (k, v) => set('apres', { ...apres, [k]: v });

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Bloc titre="Avant la formation">
        <Row label="Attentes" value={avant.attentes} editable={editable} onChange={(v) => setAvant('attentes', v)} textarea />
        <Row label="Niveau actuel" value={avant.niveau} editable={editable} onChange={(v) => setAvant('niveau', v)} />
        <Row label="Besoins spécifiques" value={avant.besoins} editable={editable} onChange={(v) => setAvant('besoins', v)} textarea />
      </Bloc>
      <Bloc titre="Après la formation">
        <Row label="Satisfaction globale" value={apres.satisfaction} editable={editable} onChange={(v) => setApres('satisfaction', v)} />
        <Row label="Qualité de la formation" value={apres.qualite} editable={editable} onChange={(v) => setApres('qualite', v)} />
        <Row label="Animation" value={apres.animation} editable={editable} onChange={(v) => setApres('animation', v)} />
        <Row label="Contenu" value={apres.contenu} editable={editable} onChange={(v) => setApres('contenu', v)} />
        <Row label="Utilité" value={apres.utilite} editable={editable} onChange={(v) => setApres('utilite', v)} />
        <Row label="Recommandations" value={apres.recommandations} editable={editable} onChange={(v) => setApres('recommandations', v)} textarea />
      </Bloc>
    </div>
  );
}
