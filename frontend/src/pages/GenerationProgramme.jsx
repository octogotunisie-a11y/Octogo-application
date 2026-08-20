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
import React, { useState } from 'react';
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
import { useMock, maj, programmesDe, utilisateurParEmail, prochainId } from '../mock/mockStore.jsx';

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

// -----------------------------------------------------------------------------
// Historique des programmes du client — écran d'accueil de la page.
// Le client retrouve ses anciens programmes et peut en générer d'autres.
// Données mock : aucun appel réseau, aucune IA.
// -----------------------------------------------------------------------------
function MesProgrammes({ programmes, onNouveau, onVoir, onDupliquer }) {
  const LIBELLE_TYPE = REQUEST_TYPES.reduce((a, t) => ({ ...a, [t.id]: t.label }), {});
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>Mes programmes</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 2 }}>
            {programmes.length} programme(s) généré(s).
          </div>
        </div>
        <button style={btnPrimary} onClick={onNouveau}>
          <Sparkles size={16} /> Nouveau programme
        </button>
      </div>

      {programmes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '38px 16px' }}>
          <Sparkles size={34} color={C.border} />
          <div style={{ fontSize: 15.5, fontWeight: 700, color: C.dark, margin: '12px 0 6px' }}>
            Aucun programme généré pour le moment.
          </div>
          <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 18 }}>
            Les programmes que vous générerez apparaîtront ici.
          </div>
          <button style={btnPrimary} onClick={onNouveau}>
            <Sparkles size={16} /> Nouveau programme
          </button>
        </div>
      ) : programmes.map((p) => (
        <div key={p.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
          flexWrap: 'wrap', padding: '14px 0', borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>{p.titre}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
              {LIBELLE_TYPE[p.categorie] || p.categorie} · {new Date(p.genere_le).toLocaleDateString('fr-FR')}
              {p.documents_ids && p.documents_ids.length > 0 && ` · ${p.documents_ids.length} document(s)`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={btnGhost} onClick={() => onVoir(p, false)}>Voir</button>
            <button style={btnGhost} onClick={() => onVoir(p, true)}>Modifier</button>
            <button style={btnGhost} onClick={() => onDupliquer(p)}>Dupliquer</button>
          </div>
        </div>
      ))}
    </Card>
  );
}

export default function GenerationProgramme() {
  const { user } = useAuth();
  const g = useGenerationRequest();

  // Accueil = historique. L'assistant ne démarre que sur action explicite.
  const [vue, setVue] = useState('historique');
  const mock = useMock();
  const profil = utilisateurParEmail(mock, user && user.email);
  const societeId = profil ? profil.societe_id : (mock.societes[0] || {}).id;
  const programmes = programmesDe(mock, societeId);

  const dupliquer = (p) => {
    maj((d) => {
      d.programmes.push({
        ...p,
        id: prochainId(d, 'programme'),
        titre: `${p.titre} (copie)`,
        genere_le: new Date().toISOString(),
      });
    });
  };

  // Un programme n'entre dans l'historique QUE lorsqu'il est réellement
  // finalisé par le client. Rien n'y est inscrit par avance.
  const finaliser = async () => {
    await g.finaliserEtCreerDemande();
    maj((d) => {
      d.programmes.push({
        id: prochainId(d, 'programme'),
        societe_id: societeId,
        categorie: g.type,
        titre: g.details.theme || (REQUEST_TYPES.find((t) => t.id === g.type) || {}).label || 'Programme',
        parametres: { ...g.details },
        documents_ids: g.details.documentsReference || [],
        genere_le: new Date().toISOString(),
      });
    });
  };

  const ouvrir = (p, modifiable) => {
    // Reprend les paramètres du programme dans l'assistant.
    g.setType(p.categorie);
    Object.entries(p.parametres || {}).forEach(([k, v]) => g.setDetailField(k, v));
    g.allerEtape(modifiable ? 2 : 3);
    setVue('assistant');
  };

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

      {vue === 'historique' && (
        <MesProgrammes
          programmes={programmes}
          onNouveau={() => { g.allerEtape(0); setVue('assistant'); }}
          onVoir={ouvrir}
          onDupliquer={dupliquer}
        />
      )}

      {vue === 'assistant' && (
        <button style={{ ...btnGhost, marginBottom: 16 }} onClick={() => setVue('historique')}>
          <ChevronLeft size={16} /> Mes programmes
        </button>
      )}

      {/* Une fois la catégorie choisie, l'écran devient dédié à cette catégorie :
          son titre et ses champs lui sont propres, jamais ceux d'une autre. */}
      {vue === 'assistant' && g.type && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', marginBottom: 16,
          background: `${C.primary}0A`, border: `1px solid ${C.primary}33`, borderRadius: 12,
        }}>
          <Sparkles size={18} color={C.primary} />
          <div style={{ fontSize: 15.5, fontWeight: 800, color: C.primary }}>
            Génération Programme — {(REQUEST_TYPES.find((t) => t.id === g.type) || {}).label || g.type}
          </div>
        </div>
      )}

      {vue === 'assistant' && <Stepper etapeActuelle={g.etape} />}

      {g.error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          background: `${C.danger}10`, border: `1px solid ${C.danger}30`, borderRadius: 10, marginBottom: 16,
        }}>
          <AlertTriangle size={18} color={C.danger} />
          <span style={{ fontSize: 13.5, color: C.danger }}>{g.error}</span>
        </div>
      )}

      {vue === 'assistant' && g.etape === 0 && <EtapeType type={g.type} setType={g.setType} />}

      {vue === 'assistant' && g.etape === 1 && (
        <Card>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Décrivez votre besoin</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 22 }}>Importez un document existant ou décrivez votre besoin directement.</div>
          <UploadTrainingRequest description={g.description} setDescription={g.setDescription} />
        </Card>
      )}

      {vue === 'assistant' && g.etape === 2 && (
        <Card>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginBottom: 4 }}>Informations complémentaires</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 22 }}>Ces informations permettront de personnaliser votre dossier complet.</div>
          <TrainingDetailsForm details={g.details} setDetailField={g.setDetailField} type={g.type} />
        </Card>
      )}

      {vue === 'assistant' && g.etape === 3 && (
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

          {vue === 'assistant' && g.etape === 2 && (
            <button
              style={{ ...btnPrimary, opacity: peutFinaliser && !g.loading ? 1 : 0.5 }}
              disabled={!peutFinaliser || g.loading}
              onClick={finaliser}
            >
              {g.loading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={18} />}
              {g.loading ? 'Génération en cours…' : 'Générer mon dossier'}
            </button>
          )}
        </div>
      )}

      {vue === 'assistant' && g.etape === 3 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button style={btnGhost} onClick={g.reinitialiser}>
            <RotateCcw size={16} /> Nouvelle demande
          </button>
        </div>
      )}
    </div>
  );
}
