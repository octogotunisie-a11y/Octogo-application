// src/components/generation/AIWorkspace.jsx
// -----------------------------------------------------------------------------
// Étape 4 : l'espace de travail. Affiche une carte (GenCard) par module, avec
// les 6 actions (Générer/Régénérer/Modifier/Télécharger/Copier/Valider) et,
// une fois ouverte, le composant de détail spécifique au module.
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import {
  BookOpen, Clock, Calendar, UserCheck, FileSpreadsheet, FileText,
  ClipboardList, Star, BarChart3, TrendingUp, Receipt,
} from 'lucide-react';
import { MODULES, C } from '../../constants/generationConstants';
import GenCard from './shared/GenCard';
import AIStatus from './AIStatus';
import GeneratedDocuments from './GeneratedDocuments';

import TrainingProgramCard from './TrainingProgramCard';
import AgendaGenerator from './AgendaGenerator';
import TrainerRecommendation from './TrainerRecommendation';
import QuoteGenerator from './QuoteGenerator';
import AttendanceGenerator from './AttendanceGenerator';
import ProgramSheet from './ProgramSheet';
import EvaluationGenerator from './EvaluationGenerator';
import KPIPage from './KPIPage';
import ImpactStudy from './ImpactStudy';
import InvoiceTemplate from './InvoiceTemplate';
import { calculerDuree } from '../../utils/durationCalculator';

const ICONES = {
  BookOpen, Clock, Calendar, UserCheck, FileSpreadsheet, FileText,
  ClipboardList, Star, BarChart3, TrendingUp, Receipt,
};

// Module « Calcul de la durée » — dérivé, pas d'écran dédié complexe.
function DureeDetail({ data }) {
  const d = data || {};
  const rep = d.repartitionParModule || [];
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
        <div><div style={{ fontSize: 11, color: C.muted }}>Total heures</div><div style={{ fontSize: 20, fontWeight: 800 }}>{d.nombreTotalHeures ?? 0} h</div></div>
        <div><div style={{ fontSize: 11, color: C.muted }}>Total jours</div><div style={{ fontSize: 20, fontWeight: 800 }}>{d.nombreJours ?? 0} j</div></div>
      </div>
      {rep.map((m, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
          <span>{m.titre}</span><span style={{ color: C.muted }}>{m.heures} h</span>
        </div>
      ))}
    </div>
  );
}

const DETAIL_COMPONENTS = {
  programme: TrainingProgramCard,
  duree: DureeDetail,
  agenda: AgendaGenerator,
  formateur: TrainerRecommendation,
  devis: QuoteGenerator,
  fiche: ProgramSheet,
  presence: AttendanceGenerator,
  evaluation: EvaluationGenerator,
  kpi: KPIPage,
  impact: ImpactStudy,
  facture: InvoiceTemplate,
};

export default function AIWorkspace({
  documents, genererCarte, regenererCarte, modifierCarte, supprimerCarte,
  enregistrerCarte, validerCarte, telechargerCarte, copierCarte,
}) {
  const [editingKey, setEditingKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopier = async (key) => {
    const ok = await copierCarte(key);
    if (ok) { setCopiedKey(key); setTimeout(() => setCopiedKey(null), 1500); }
  };

  const handleToggleEdit = (key) => {
    if (editingKey === key) {
      enregistrerCarte(key);
      setEditingKey(null);
    } else {
      setEditingKey(key);
    }
  };

  const scrollToModule = (key) => {
    document.getElementById(`gen-module-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div>
      <AIStatus />

      <div style={{ display: 'grid', gap: 4 }}>
        {MODULES.map((mod) => {
          const doc = documents[mod.key] || {};
          const Detail = DETAIL_COMPONENTS[mod.key];
          const editable = editingKey === mod.key;
          const editableProps = ['programme', 'devis', 'presence', 'evaluation', 'impact', 'facture'].includes(mod.key)
            ? { editable, onChange: (nd) => modifierCarte(mod.key, nd), onToggleEdit: () => handleToggleEdit(mod.key) }
            : {};

          return (
            <div id={`gen-module-${mod.key}`} key={mod.key}>
              <GenCard
                icon={ICONES[mod.icone] || FileText}
                titre={mod.titre}
                description={mod.description}
                statut={doc.status}
                genere={!!doc.data}
                genererEnCours={doc.status === 'generation_en_cours'}
                onGenerer={() => genererCarte(mod.key)}
                onRegenerer={() => regenererCarte(mod.key)}
                onModifier={() => {
                  if (editableProps.onToggleEdit) editableProps.onToggleEdit();
                }}
                onTelecharger={() => telechargerCarte(mod.key)}
                onCopier={() => handleCopier(mod.key)}
                onValider={() => validerCarte(mod.key)}
                defaultOpen={false}
                modifiable={!!editableProps.onToggleEdit}
              >
                {copiedKey === mod.key && (
                  <div style={{ fontSize: 12, color: C.ok, fontWeight: 600, marginBottom: 10 }}>Copié dans le presse-papiers ✓</div>
                )}
                {Detail && <Detail data={doc.data} {...editableProps} />}
              </GenCard>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <GeneratedDocuments
          documents={documents}
          onVoir={scrollToModule}
          onModifier={(key) => { scrollToModule(key); setEditingKey(key); }}
          onTelecharger={telechargerCarte}
          onSupprimer={supprimerCarte}
        />
      </div>
    </div>
  );
}
