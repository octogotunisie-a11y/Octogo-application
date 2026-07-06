// src/components/generation/shared/Stepper.jsx
import React from 'react';
import { Check } from 'lucide-react';
import { C } from '../../../constants/generationConstants';

const ETAPES = [
  { id: 0, titre: 'Type de demande' },
  { id: 1, titre: 'Description du besoin' },
  { id: 2, titre: 'Informations complémentaires' },
  { id: 3, titre: 'Espace de travail' },
];

export default function Stepper({ etapeActuelle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, overflowX: 'auto', padding: '4px 2px' }}>
      {ETAPES.map((e, i) => {
        const estFaite = e.id < etapeActuelle;
        const estActive = e.id === etapeActuelle;
        return (
          <React.Fragment key={e.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
                background: estFaite ? C.ok : estActive ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})` : '#fff',
                color: estFaite || estActive ? '#fff' : C.muted,
                border: estActive || estFaite ? 'none' : `2px solid ${C.border}`,
                transition: 'all 0.2s',
              }}>
                {estFaite ? <Check size={16} /> : e.id + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: estActive ? 700 : 500,
                color: estActive ? C.dark : C.muted, whiteSpace: 'nowrap',
              }}>
                {e.titre}
              </span>
            </div>
            {i < ETAPES.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 24, margin: '0 12px',
                background: estFaite ? C.ok : C.border,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
