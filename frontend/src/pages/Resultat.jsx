// src/pages/Resultat.jsx
// -----------------------------------------------------------------------------
// Interface de résultat type ChatGPT — sidebar + fil de conversation.
//
//  - Sidebar gauche : historique des conversations du compte connecté
//  - Bouton "+ Nouvelle conversation"
//  - Fil de conversation à droite (bulles user/assistant)
//  - Message d'accueil personnalisé : « Bonjour [Prénom] 👋 »
//  - Zone de saisie fixée en bas
// -----------------------------------------------------------------------------
import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles, Send, Loader2, Copy, Download, Edit3, RotateCcw,
  ChevronLeft, FileText, Paperclip, Bot, User as UserIcon,
  AlertTriangle, Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { C, REQUEST_TYPES } from '../constants/generationConstants';
import { useAuth } from '../AuthContext';

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
  background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
};
const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px',
  background: '#fff', color: C.dark, border: `1px solid ${C.border}`,
  borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

// -----------------------------------------------------------------------------
// Bulle de message
// -----------------------------------------------------------------------------
function Bulle({ role, children, documents, onTelecharger, onCopier }) {
  const estUser = role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 12, marginBottom: 20,
      flexDirection: estUser ? 'row-reverse' : 'row',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: estUser ? C.light : `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {estUser ? <UserIcon size={18} color={C.muted} /> : <Bot size={18} color="#fff" />}
      </div>

      <div style={{ maxWidth: '78%', minWidth: 0 }}>
        <div style={{
          background: estUser ? `${C.primary}10` : '#fff',
          border: `1px solid ${estUser ? `${C.primary}30` : C.border}`,
          borderRadius: 14, padding: '12px 16px', fontSize: 14, color: C.dark,
          lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {children}
        </div>

        {documents && documents.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {documents.map((d) => (
              <div key={d.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 10, padding: '10px 14px', background: '#fff',
                border: `1px solid ${C.border}`, borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <FileText size={16} color={C.primary} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.titre}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted }}>{d.type || 'Document'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ ...btnGhost, padding: '6px 10px', fontSize: 12 }}
                    onClick={() => onCopier && onCopier(d.id)}>
                    <Copy size={13} />
                  </button>
                  <button style={{ ...btnGhost, padding: '6px 10px', fontSize: 12 }}
                    onClick={() => onTelecharger && onTelecharger(d.id)}>
                    <Download size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sidebar — historique des conversations
// -----------------------------------------------------------------------------
function Sidebar({ ouvert, conversations, conversationId, onNouvelle, onCharger, onSupprimer, onToggle, prenom }) {
  if (!ouvert) {
    return (
      <div style={{
        width: 60, borderRight: `1px solid ${C.border}`, background: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 12,
      }}>
        <button style={{ ...btnGhost, padding: 8 }} onClick={onToggle} title="Ouvrir l'historique">
          <PanelLeftOpen size={18} />
        </button>
        <button style={{ ...btnPrimary, padding: 8 }} onClick={onNouvelle} title="Nouvelle conversation">
          <Plus size={18} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: 280, borderRight: `1px solid ${C.border}`, background: '#FAFAFB',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* En-tête */}
      <div style={{ padding: '16px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={15} color="#fff" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.dark }}>Historique</div>
          </div>
          <button style={{ ...btnGhost, padding: 6 }} onClick={onToggle} title="Réduire">
            <PanelLeftClose size={16} />
          </button>
        </div>

        <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }} onClick={onNouvelle}>
          <Plus size={16} /> Nouvelle conversation
        </button>

        {prenom && (
          <div style={{ marginTop: 12, fontSize: 12.5, color: C.muted, textAlign: 'center' }}>
            Bonjour <strong style={{ color: C.dark }}>{prenom}</strong> 👋
          </div>
        )}
      </div>

      {/* Liste des conversations */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 16px' }}>
        {conversations.length === 0 ? (
          <div style={{ padding: '20px 12px', fontSize: 12.5, color: C.muted, textAlign: 'center' }}>
            Aucune conversation pour l'instant.
            <br />
            Cliquez sur « Nouvelle conversation ».
          </div>
        ) : conversations.map((c) => {
          const actif = c.id === conversationId;
          return (
            <div
              key={c.id}
              onClick={() => onCharger(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                background: actif ? `${C.primary}12` : 'transparent',
                border: `1px solid ${actif ? `${C.primary}40` : 'transparent'}`,
              }}
            >
              <MessageSquare size={15} color={actif ? C.primary : C.muted} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: actif ? 700 : 500,
                  color: actif ? C.primary : C.dark,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.titre}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {new Date(c.maj_le).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onSupprimer(c.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.5 }}
                title="Supprimer"
              >
                <Trash2 size={13} color={C.muted} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Page Résultat
// -----------------------------------------------------------------------------
export default function Resultat({ g, onRetour, onNouvelle }) {
  const { user } = useAuth();
  const prenom = (user?.name || '').split(' ')[0] || '';
  const [saisie, setSaisie] = useState('');
  const [sidebarOuverte, setSidebarOuverte] = useState(true);
  const filRef = useRef(null);

  // Auto-scroll en bas
  useEffect(() => {
    if (filRef.current) filRef.current.scrollTop = filRef.current.scrollHeight;
  }, [g.messages, g.loading]);

  // Crée une conversation au premier montage si aucune n'est active
  useEffect(() => {
    if (!g.conversationId && g.nouvelleConversation) {
      g.nouvelleConversation('Nouvelle conversation');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const envoyer = () => {
    const texte = saisie.trim();
    if (!texte || g.loading) return;
    setSaisie('');
    g.envoyerMessage(texte);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  };

  const libelleType = (REQUEST_TYPES.find((t) => t.id === g.type) || {}).label || 'Programme';

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', background: '#fff', zIndex: 100,
    }}>
      {/* ---------- SIDEBAR ---------- */}
      <Sidebar
        ouvert={sidebarOuverte}
        conversations={g.conversations || []}
        conversationId={g.conversationId}
        onNouvelle={() => g.nouvelleConversation('Nouvelle conversation')}
        onCharger={g.chargerConversation}
        onSupprimer={g.supprimerConversation}
        onToggle={() => setSidebarOuverte((o) => !o)}
        prenom={prenom}
      />

      {/* ---------- ZONE PRINCIPALE ---------- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* En-tête */}
        <div style={{
          padding: '14px 24px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button style={{ ...btnGhost, padding: '8px 12px' }} onClick={onRetour}>
              <ChevronLeft size={16} /> Retour
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.dark }}>
                {g.conversations?.find((c) => c.id === g.conversationId)?.titre || 'Nouvelle conversation'}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {libelleType}
                {g.details?.societe ? ` · ${g.details.societe}` : ''}
                {g.details?.nbParticipants ? ` · ${g.details.nbParticipants} participants` : ''}
                {g.details?.nombreJours ? ` · ${g.details.nombreJours} jour(s)` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={btnGhost} onClick={g.copierTout}>
              <Copy size={15} /> Copier
            </button>
            <button style={btnGhost} onClick={g.telechargerTout}>
              <Download size={15} /> Télécharger
            </button>
            <button style={btnPrimary} onClick={onNouvelle}>
              <RotateCcw size={15} /> Nouvelle génération
            </button>
          </div>
        </div>

        {/* Fil de conversation */}
        <div ref={filRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', background: '#FCFCFD' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>

            {/* Message d'accueil personnalisé */}
            {prenom && (
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.dark, marginBottom: 6 }}>
                  Bonjour {prenom} 👋
                </div>
                <div style={{ fontSize: 13.5, color: C.muted }}>
                  Décrivez votre besoin, je prépare votre dossier complet.
                </div>
              </div>
            )}

            {g.messages && g.messages.length > 0 ? (
              g.messages.map((m, i) => (
                <Bulle
                  key={i}
                  role={m.role}
                  documents={m.documents}
                  onTelecharger={g.telechargerCarte}
                  onCopier={g.copierCarte}
                >
                  {m.contenu}
                </Bulle>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: C.muted, fontSize: 14 }}>
                <Loader2 size={22} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
                <div>Connexion au modèle et préparation du programme…</div>
              </div>
            )}

            {g.loading && (
              <Bulle role="assistant">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.muted }}>
                  <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                  Génération en cours…
                </span>
              </Bulle>
            )}
          </div>
        </div>

        {/* Erreur */}
        {g.error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            background: `${C.danger}10`, borderTop: `1px solid ${C.danger}30`,
          }}>
            <AlertTriangle size={18} color={C.danger} />
            <span style={{ fontSize: 13.5, color: C.danger }}>{g.error}</span>
          </div>
        )}

        {/* Zone de saisie */}
        <div style={{ padding: '14px 24px 20px', borderTop: `1px solid ${C.border}`, background: '#fff' }}>
          <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14,
              padding: '10px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Paperclip size={16} color={C.muted} />
              <textarea
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Affinez votre demande… (ex : ajoute un module sur la gestion du stress)"
                rows={1}
                style={{
                  flex: 1, border: 'none', outline: 'none', resize: 'none',
                  fontSize: 14, color: C.dark, fontFamily: 'inherit', maxHeight: 120,
                }}
              />
            </div>
            <button
              style={{ ...btnPrimary, padding: '12px 16px', opacity: saisie.trim() && !g.loading ? 1 : 0.5 }}
              disabled={!saisie.trim() || g.loading}
              onClick={envoyer}
            >
              {g.loading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={18} />}
            </button>
          </div>
          <div style={{ maxWidth: 820, margin: '8px auto 0', fontSize: 11.5, color: C.muted, textAlign: 'center' }}>
            L'assistant peut faire des erreurs. Vérifiez les informations importantes.
          </div>
        </div>
      </div>
    </div>
  );
}