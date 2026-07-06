// src/components/generation/TrainerRecommendation.jsx
// -----------------------------------------------------------------------------
// Module « Proposition du meilleur formateur ».
// Le score est calculé aujourd'hui par recoupement de catégories (backend,
// voir generationRoutes.js /formateur-recommande). TODO IA : remplacer par une
// analyse sémantique réelle des CV PDF déjà présents dans l'application.
// -----------------------------------------------------------------------------
import React from 'react';
import { BadgeCheck, Award, FileText, Download } from 'lucide-react';
import { C } from '../../constants/generationConstants';
import { telechargerCV } from '../../services/generationService';

export default function TrainerRecommendation({ data }) {
  const d = data || {};
  const f = d.formateurPropose;

  if (!f) {
    return <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>Aucun formateur proposé pour l\u2019instant.</div>;
  }

  const handleTelechargerCV = async () => {
    try {
      await telechargerCV(d.formateurId, d.cv);
    } catch (e) {
      alert(e.message || 'Téléchargement du CV impossible.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, flexShrink: 0,
        }}>
          {(f.nom || '?').split(' ').map((s) => s[0]).slice(0, 2).join('')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.dark, display: 'flex', alignItems: 'center', gap: 6 }}>
            {f.nom}
            {f.agrementCNFCPP && <BadgeCheck size={16} color={C.ok} />}
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>{f.specialite}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>{d.scoreCompatibilite ?? '—'}%</div>
          <div style={{ fontSize: 11, color: C.muted }}>compatibilité</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={14} /> Compétences
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(d.competences || f.categories || []).map((c, i) => (
              <span key={i} style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 999, background: `${C.primary}10`, color: C.primary, fontWeight: 600 }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8 }}>Expériences & certifications</div>
          <div style={{ fontSize: 13, color: C.dark }}>{d.experiences || 'Non renseigné'}</div>
          <div style={{ fontSize: 13, color: C.dark, marginTop: 6 }}>{d.certifications || (f.agrementCNFCPP ? 'Agréé CNFCPP' : '—')}</div>
        </div>
      </div>

      <div
        onClick={handleTelechargerCV}
        style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, cursor: d.formateurId ? 'pointer' : 'default' }}
      >
        <FileText size={18} color={C.muted} />
        <span style={{ fontSize: 13, color: C.dark, flex: 1 }}>{d.cv || 'CV du formateur'}</span>
        {d.formateurId && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: C.primary }}>
            <Download size={14} /> Télécharger
          </span>
        )}
      </div>
    </div>
  );
}
