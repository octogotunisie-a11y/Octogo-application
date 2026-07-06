// src/components/generation/shared/fields.jsx
// -----------------------------------------------------------------------------
// Petits composants réutilisés par tous les modules pour afficher/éditer les
// données générées (mode lecture par défaut, mode édition via le bouton
// « Modifier » de GenCard).
// -----------------------------------------------------------------------------
import React from 'react';
import { C } from '../../../constants/generationConstants';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
  fontSize: 13.5, color: C.dark, outline: 'none', boxSizing: 'border-box',
  background: '#fff', fontFamily: 'inherit',
};

export function Row({ label, value, editable, onChange, textarea, type = 'text' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {label}
      </div>
      {editable ? (
        textarea ? (
          <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input type={type} style={inputStyle} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        )
      ) : (
        <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
          {value === '' || value == null ? <span style={{ color: C.muted, fontStyle: 'italic' }}>Non renseigné</span> : String(value)}
        </div>
      )}
    </div>
  );
}

export function Grid({ children, cols = 2 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0 20px' }}>{children}</div>;
}

export function EmptyHint({ children }) {
  return <div style={{ fontSize: 12.5, color: C.muted, fontStyle: 'italic', marginTop: 4 }}>{children}</div>;
}

export function useEditableData(rawData, onChange) {
  const [editing, setEditing] = React.useState(false);
  const data = rawData || {};
  const set = (key, value) => onChange({ ...data, [key]: value });
  return { data, editing, setEditing, set };
}
