// src/pages/GenerationProgramme.jsx
// -----------------------------------------------------------------------------
// Page « Génération de Programme » — refonte complète (architecture uniquement,
// sans IA — voir consigne du 03/07/2026).
//
// Parcours : Type de demande -> Description du besoin -> Infos complémentaires
//            -> Espace de travail (12 cartes de modules) -> Documents générés.
//
// TOUS les points d'intégration du futur modèle IA sont marqués `TODO IA`
// dans generationService.js (frontend) et generationRoutes.js (backend).
// -----------------------------------------------------------------------------
import React from 'react';
import {
  GraduationCap, Route, UserCheck, Handshake, ChevronRight, ChevronLeft,
  Sparkles, Loader2, AlertTriangle, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import Stepper from '../components/generation/shared/Stepper';
import UploadTrainingRequest from '../components/generation/UploadTrainingRequest';
import TrainingDetailsForm from '../components/generation/TrainingDetailsForm';
import AIWorkspace from '../components/generation/AIWorkspace';
import useGenerationRequest from '../hooks/useGenerationRequest';
import { C, REQUEST_TYPES } from '../constants/generationConstants';

const ICONES_TYPE = { GraduationCap, Route, UserCheck, Handshake };

const Card = ({ children }) => (
  <div style={{
    background: '#fff', borderRadius: 18, padding: 28, border: `1px solid ${C.border}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 20,
  }}>{children}</div>
);

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
  background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
};
const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px',
  background: '#fff', color: C.dark, border: `1px solid ${C.border}`,
  borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer',
};

function EtapeType({ type, setType }) {
  return (
    <Card>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Quel type de demande souhaitez-vous générer ?</div>
      <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 22 }}>Sélectionnez la catégorie qui correspond le mieux à votre besoin.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {REQUEST_TYPES.map((t) => {
          const Icone = ICONES_TYPE[t.icone];
          const actif = type === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setType(t.id)}
              style={{
                padding: '24px 18px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${actif ? C.primary : C.border}`,
                background: actif ? `${C.primary}08` : '#fff', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px',
                background: actif ? `linear-gradient(135deg, ${C.primary}, ${C.secondary})` : C.light,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icone size={24} color={actif ? '#fff' : C.muted} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: actif ? C.primary : C.dark }}>{t.label}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function GenerationProgramme() {
  const { user } = useAuth();
  const g = useGenerationRequest();

  const peutContinuerEtape0 = !!g.type;
  const peutContinuerEtape1 = g.description.mode === 'text' ? g.description.texte.trim().length > 0 : !!g.description.fichier;
  const peutFinaliser = !!(g.details.theme && g.details.societe && g.details.nbParticipants && g.details.objectifs);

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px 64px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.dark, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={26} color={C.primary} />
          Assistant de Génération de Programme
        </div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
          {user ? `Bonjour ${user.name?.split(' ')[0] || ''}, décrivez votre besoin et laissez l\u2019assistant préparer votre dossier complet.` : 'Décrivez votre besoin pour générer votre dossier de formation complet.'}
        </div>
      </div>

      <Stepper etapeActuelle={g.etape} />

      {g.error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 10, marginBottom: 16,
        }}>
          <AlertTriangle size={18} color={C.danger} />
          <span style={{ fontSize: 13.5, color: C.danger }}>{g.error}</span>
        </div>
      )}

      {g.etape === 0 && <EtapeType type={g.type} setType={g.setType} />}

      {g.etape === 1 && (
        <Card>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Décrivez votre besoin</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 22 }}>Importez un document existant ou décrivez votre besoin directement.</div>
          <UploadTrainingRequest description={g.description} setDescription={g.setDescription} />
        </Card>
      )}

      {g.etape === 2 && (
        <Card>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Informations complémentaires</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 22 }}>Ces informations permettront de personnaliser votre dossier complet.</div>
          <TrainingDetailsForm details={g.details} setDetailField={g.setDetailField} />
        </Card>
      )}

      {g.etape === 3 && (
        <AIWorkspace
          documents={g.documents}
          genererCarte={g.genererCarte}
          regenererCarte={g.regenererCarte}
          modifierCarte={g.modifierCarte}
          supprimerCarte={g.supprimerCarte}
          enregistrerCarte={g.enregistrerCarte}
          validerCarte={g.validerCarte}
          telechargerCarte={g.telechargerCarte}
          copierCarte={g.copierCarte}
        />
      )}

      {g.etape < 3 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <button style={btnGhost} onClick={g.etapePrecedente} disabled={g.etape === 0}>
            <ChevronLeft size={18} /> Précédent
          </button>

          {g.etape < 2 && (
            <button
              style={{ ...btnPrimary, opacity: (g.etape === 0 ? peutContinuerEtape0 : peutContinuerEtape1) ? 1 : 0.5 }}
              disabled={g.etape === 0 ? !peutContinuerEtape0 : !peutContinuerEtape1}
              onClick={g.etapeSuivante}
            >
              Suivant <ChevronRight size={18} />
            </button>
          )}

          {g.etape === 2 && (
            <button
              style={{ ...btnPrimary, opacity: peutFinaliser && !g.loading ? 1 : 0.5 }}
              disabled={!peutFinaliser || g.loading}
              onClick={g.finaliserEtCreerDemande}
            >
              {g.loading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={18} />}
              {g.loading ? 'Génération en cours…' : 'Générer mon dossier'}
            </button>
          )}
        </div>
      )}

      {g.etape === 3 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button style={btnGhost} onClick={g.reinitialiser}>
            <RotateCcw size={16} /> Nouvelle demande
          </button>
        </div>
      )}
    </div>
  );
}
