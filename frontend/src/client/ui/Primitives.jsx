// src/client/ui/Primitives.jsx
// -----------------------------------------------------------------------------
// Primitives UI partagées. Un seul endroit pour l'apparence des boutons,
// cartes, badges, inputs, modales, etc.
// -----------------------------------------------------------------------------
import React from 'react';
import { motion } from 'framer-motion';
import { colors, radius, space, shadow, typography } from '../../config/theme';

// -------------------------------------------------------------- Carte
export const Card = ({ children, style = {}, hover = false, ...rest }) => (
  <motion.div
    whileHover={hover ? { y: -2, boxShadow: shadow.lg } : undefined}
    style={{
      background: colors.bgCard,
      border: `1px solid ${colors.line}`,
      borderRadius: radius.lg,
      padding: space.xl,
      boxShadow: shadow.sm,
      ...style
    }}
    {...rest}
  >{children}</motion.div>
);

// -------------------------------------------------------------- Bouton
const BTN_VARIANTS = {
  primary:   { bg: colors.primaryGradient, fg: colors.white, border: 'none' },
  secondary: { bg: colors.white,           fg: colors.inkSoft, border: `1.5px solid ${colors.line}` },
  ghost:     { bg: 'transparent',          fg: colors.inkSoft, border: 'none' },
  danger:    { bg: colors.dangerSoft,      fg: colors.danger, border: `1px solid ${colors.danger}33` },
  success:   { bg: colors.successSoft,     fg: colors.success, border: `1px solid ${colors.success}33` }
};

export const Button = ({
  children, variant = 'primary', icon, iconRight, full,
  loading, disabled, onClick, type = 'button', title
}) => {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
  const isDisabled = disabled || loading;
  return (
    <motion.button
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        padding: '0.65rem 1.1rem',
        borderRadius: radius.md,
        background: v.bg,
        color: v.fg,
        border: v.border,
        fontSize: typography.small.fontSize,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        width: full ? '100%' : undefined,
        boxShadow: variant === 'primary' && !isDisabled ? shadow.md : 'none',
        transition: 'opacity .15s'
      }}
    >
      {loading
        ? <Spinner size={14} />
        : icon && <i className={`bi ${icon}`} style={{ fontSize: '0.95rem' }} />}
      <span>{children}</span>
      {iconRight && !loading && (
        <i className={`bi ${iconRight}`} style={{ fontSize: '0.85rem' }} />
      )}
    </motion.button>
  );
};

// -------------------------------------------------------------- Spinner
export const Spinner = ({ size = 16, color = 'currentColor' }) => (
  <span
    aria-hidden="true"
    style={{
      width: size, height: size,
      border: `2px solid ${color}55`,
      borderTopColor: color,
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'apa-spin 0.7s linear infinite'
    }}
  />
);

// -------------------------------------------------------------- Badge
const BADGE_TONES = {
  neutral: { bg: colors.lineSoft,    fg: colors.inkSoft },
  primary: { bg: colors.primarySoft, fg: colors.primary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger:  { bg: colors.dangerSoft,  fg: colors.danger },
  info:    { bg: colors.infoSoft,    fg: colors.info }
};

export const Badge = ({ tone = 'neutral', children, icon }) => {
  const t = BADGE_TONES[tone] || BADGE_TONES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: t.bg, color: t.fg,
      padding: '3px 10px', borderRadius: radius.full,
      fontSize: typography.tiny.fontSize,
      fontWeight: 700, letterSpacing: '0.01em'
    }}>
      {icon && <i className={`bi ${icon}`} style={{ fontSize: '0.7rem' }} />}
      {children}
    </span>
  );
};

// -------------------------------------------------------------- Field
export const Field = ({ label, hint, required, children, error }) => (
  <div style={{ marginBottom: space.lg }}>
    {label && (
      <label style={{
        display: 'block', marginBottom: '0.35rem',
        fontWeight: 600, color: colors.inkSoft,
        fontSize: typography.small.fontSize
      }}>
        {label} {required && <span style={{ color: colors.danger }}>*</span>}
      </label>
    )}
    {children}
    {hint && !error && (
      <div style={{ fontSize: typography.tiny.fontSize, color: colors.inkMuted, marginTop: '0.3rem' }}>
        {hint}
      </div>
    )}
    {error && (
      <div style={{ fontSize: typography.tiny.fontSize, color: colors.danger, marginTop: '0.3rem' }}>
        <i className="bi bi-exclamation-circle" style={{ marginRight: 4 }} />{error}
      </div>
    )}
  </div>
);

export const inputStyle = {
  width: '100%',
  padding: '0.7rem 0.85rem',
  border: `1.5px solid ${colors.line}`,
  borderRadius: radius.sm,
  fontSize: typography.body.fontSize,
  color: colors.ink,
  background: colors.white,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color .15s, box-shadow .15s'
};

export const Input = (props) => <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
export const Textarea = (props) => (
  <textarea {...props} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', ...(props.style || {}) }} />
);
export const Select = ({ children, ...props }) => (
  <select {...props} style={{ ...inputStyle, cursor: 'pointer', ...(props.style || {}) }}>
    {children}
  </select>
);

// -------------------------------------------------------------- Section
export const SectionTitle = ({ icon, title, subtitle, action }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: space.lg, marginBottom: space.lg, flexWrap: 'wrap'
  }}>
    <div style={{ minWidth: 0 }}>
      <h2 style={{
        margin: 0, ...typography.h2, color: colors.ink,
        display: 'flex', alignItems: 'center', gap: '0.55rem'
      }}>
        {icon && <i className={`bi ${icon}`} style={{ color: colors.primary }} />}
        {title}
      </h2>
      {subtitle && (
        <p style={{ margin: '0.35rem 0 0', color: colors.inkMuted, fontSize: typography.body.fontSize }}>
          {subtitle}
        </p>
      )}
    </div>
    {action}
  </div>
);

// -------------------------------------------------------------- Empty
export const Empty = ({ icon = 'bi-inbox', title, texte, action }) => (
  <div style={{
    padding: space['3xl'], background: colors.bgSunken,
    borderRadius: radius.lg, border: `1px dashed ${colors.line}`,
    textAlign: 'center'
  }}>
    <i className={`bi ${icon}`} style={{ fontSize: '2.2rem', color: colors.inkFaint }} />
    {title && (
      <h3 style={{ margin: '0.75rem 0 0.35rem', color: colors.inkSoft, fontSize: typography.h3.fontSize }}>
        {title}
      </h3>
    )}
    {texte && (
      <p style={{
        color: colors.inkMuted, fontSize: typography.body.fontSize,
        maxWidth: 480, margin: '0 auto', lineHeight: 1.55
      }}>{texte}</p>
    )}
    {action && <div style={{ marginTop: space.lg }}>{action}</div>}
  </div>
);

// -------------------------------------------------------------- Skeleton
export const Skeleton = ({ height = 20, width = '100%', radius: r = 8 }) => (
  <div style={{
    height, width, borderRadius: r,
    background: `linear-gradient(90deg, ${colors.lineSoft} 25%, ${colors.line} 50%, ${colors.lineSoft} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'apa-shimmer 1.4s ease-in-out infinite'
  }} />
);

// -------------------------------------------------------------- Modal
export const Modal = ({ open, onClose, title, subtitle, children, width = 640, footer }) => {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog" aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: space.lg
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.white, borderRadius: radius.xl,
          maxWidth: width, width: '100%', maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: shadow.lg, overflow: 'hidden'
        }}
      >
        <div style={{
          padding: `${space.lg} ${space.xl}`,
          borderBottom: `1px solid ${colors.lineSoft}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.lg
        }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: 0, ...typography.h3, color: colors.ink }}>{title}</h3>
            {subtitle && (
              <p style={{ margin: '0.25rem 0 0', color: colors.inkMuted, fontSize: typography.small.fontSize }}>
                {subtitle}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Fermer"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: colors.inkMuted, padding: 4, fontSize: '1.1rem', lineHeight: 1
            }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div style={{ padding: space.xl, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div style={{
            padding: `${space.md} ${space.xl}`, borderTop: `1px solid ${colors.lineSoft}`,
            background: colors.bg, display: 'flex', justifyContent: 'flex-end',
            gap: space.sm, flexWrap: 'wrap'
          }}>{footer}</div>
        )}
      </motion.div>
    </motion.div>
  );
};

// -------------------------------------------------------------- Toast
const TOAST_TONES = {
  success: { c: colors.success, icon: 'bi-check-circle-fill' },
  error:   { c: colors.danger,  icon: 'bi-x-circle-fill' },
  warning: { c: colors.warning, icon: 'bi-exclamation-triangle-fill' },
  info:    { c: colors.info,    icon: 'bi-info-circle-fill' }
};

export const Toast = ({ notification, onClose }) => {
  const t = TOAST_TONES[notification.type] || TOAST_TONES.info;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      role="status" aria-live="polite"
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        background: colors.white, borderRadius: radius.md,
        boxShadow: shadow.lg, borderLeft: `4px solid ${t.c}`,
        padding: `${space.md} ${space.lg}`,
        display: 'flex', alignItems: 'center', gap: space.md,
        minWidth: 280, maxWidth: 400
      }}
    >
      <i className={`bi ${t.icon}`} style={{ color: t.c, fontSize: '1.15rem' }} />
      <div style={{ flex: 1, fontSize: typography.body.fontSize, color: colors.ink, lineHeight: 1.45 }}>
        {notification.message}
      </div>
      <button onClick={onClose} aria-label="Fermer"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.inkFaint }}>
        <i className="bi bi-x-lg" style={{ fontSize: '0.85rem' }} />
      </button>
    </motion.div>
  );
};