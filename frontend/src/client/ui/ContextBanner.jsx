// src/client/ui/ContextBanner.jsx
// -----------------------------------------------------------------------------
// Bandeau explicatif affiché en haut de chaque page.
// Objectif : dire à l'utilisateur ce que fait l'écran, ce qu'il peut y faire
// et ce qui va se passer.
// -----------------------------------------------------------------------------
import React from 'react';
import { colors, radius, space, typography } from '../../config/theme';

const TONES = {
  guide:   { bg: colors.bgSunken,    border: colors.line,           icon: 'bi-info-circle',           fg: colors.inkSoft },
  action:  { bg: colors.primarySoft, border: '#C7D2FE',             icon: 'bi-lightning-charge-fill',  fg: colors.primaryDark },
  success: { bg: colors.successSoft, border: '#A7F3D0',             icon: 'bi-check-circle-fill',      fg: '#065F46' },
  warning: { bg: colors.warningSoft, border: '#FDE68A',             icon: 'bi-exclamation-triangle-fill', fg: '#92400E' },
  error:   { bg: colors.dangerSoft,  border: '#FECACA',             icon: 'bi-x-circle-fill',          fg: '#991B1B' }
};

export const ContextBanner = ({ tone = 'guide', icon, children }) => {
  const t = TONES[tone] || TONES.guide;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: space.md,
      background: t.bg, border: `1px solid ${t.border}`,
      borderRadius: radius.md, padding: '0.85rem 1rem',
      marginBottom: space.lg,
      fontSize: typography.body.fontSize, color: t.fg, lineHeight: 1.55
    }}>
      <i className={`bi ${icon || t.icon}`} style={{ fontSize: '1rem', marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
};