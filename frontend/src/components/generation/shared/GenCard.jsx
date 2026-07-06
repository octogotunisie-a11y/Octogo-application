// src/components/generation/shared/GenCard.jsx
// -----------------------------------------------------------------------------
// Coquille commune à toutes les cartes de modules (Programme, Devis, KPI...).
// Porte les 6 actions demandées : Générer / Régénérer / Modifier / Télécharger
// / Copier / Valider. Les boutons restent actifs même sans IA branchée — ils
// appellent les stubs backend (voir generationService.js).
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import {
  Sparkles, RotateCcw, Pencil, Download, Copy, CheckCircle2, Check,
  Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { C, STATUS_LABELS, STATUS_COLORS, DOCUMENT_STATUS } from '../../../constants/generationConstants';

const btnBase = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px',
  borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  border: `1px solid ${C.border}`, background: '#fff', color: C.dark,
  transition: 'all 0.15s', whiteSpace: 'nowrap',
};

function ActionButton({ icon: Icon, label, onClick, disabled, tone, busy }) {
  const toneStyle = tone === 'primary'
    ? { background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: '#fff', border: 'none' }
    : tone === 'ok'
      ? { background: `${C.ok}12`, color: C.ok, border: `1px solid ${C.ok}40` }
      : {};
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...btnBase, ...toneStyle, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {busy ? <Loader2 size={14} className="spin" style={{ animation: 'gen-spin 0.8s linear infinite' }} /> : <Icon size={14} />}
      {label}
    </button>
  );
}

export default function GenCard({
  icon: Icon, titre, description, statut, genere, valide,
  onGenerer, onRegenerer, onModifier, onTelecharger, onCopier, onValider,
  genererEnCours, children, defaultOpen = false, modifiable = true,
}) {
  const [ouvert, setOuvert] = useState(defaultOpen);
  const aDesDonnees = !!genere;
  const estValide = statut === DOCUMENT_STATUS.VALIDE;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: 16,
    }}>
      <style>{'@keyframes gen-spin { to { transform: rotate(360deg); } }'}</style>

      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${C.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={C.primary} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>{titre}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{description}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
            background: `${STATUS_COLORS[statut]}15`, color: STATUS_COLORS[statut],
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {estValide && <Check size={12} />}
            {STATUS_LABELS[statut]}
          </span>
          {aDesDonnees && (
            <button onClick={() => setOuvert((o) => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}>
              {ouvert ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <ActionButton icon={Sparkles} label="Générer" tone="primary" onClick={onGenerer} disabled={genererEnCours} busy={genererEnCours} />
        <ActionButton icon={RotateCcw} label="Régénérer" onClick={onRegenerer} disabled={!aDesDonnees || genererEnCours} />
        <ActionButton icon={Pencil} label="Modifier" onClick={onModifier} disabled={!aDesDonnees || !modifiable} />
        <ActionButton icon={Download} label="Télécharger" onClick={onTelecharger} disabled={!aDesDonnees} />
        <ActionButton icon={Copy} label="Copier" onClick={onCopier} disabled={!aDesDonnees} />
        <ActionButton icon={CheckCircle2} label="Valider" tone={estValide ? 'ok' : undefined} onClick={onValider} disabled={!aDesDonnees} />
      </div>

      {ouvert && aDesDonnees && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: 20, background: C.light }}>
          {children}
        </div>
      )}

      {!aDesDonnees && !genererEnCours && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '20px', background: C.light, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: C.muted }}>
            Aucun contenu généré pour l\u2019instant. Cliquez sur <strong>Générer</strong> pour créer ce document.
          </div>
        </div>
      )}

      {genererEnCours && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px', background: C.light, textAlign: 'center' }}>
          <Loader2 size={22} color={C.primary} style={{ animation: 'gen-spin 0.8s linear infinite' }} />
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Génération en cours\u2026</div>
        </div>
      )}
    </div>
  );
}
