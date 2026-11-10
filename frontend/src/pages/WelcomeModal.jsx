// frontend/src/pages/WelcomeModal.jsx
// -----------------------------------------------------------------------------
// Fenêtre d'accueil affichée sur le DashboardClient.
// S'affiche :
//   - à la première visite après connexion (localStorage 'apa_welcome_seen' absent)
//   - ou si l'utilisateur clique sur le bouton "Aide / Accueil" du Topbar
//
// Props :
//   user      : objet utilisateur (nom, role, company…)
//   onClose   : callback de fermeture
//   onNavigate: (tabId) => void  — pour les boutons d'action rapide
//   counters  : { documents, devis }  — chiffres clés affichés
// -----------------------------------------------------------------------------
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const T = {
  primary: '#6366F1', primaryLight: '#818CF8', primaryDark: '#4F46E5',
  primaryGradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  primarySoft: '#EEF2FF',
  secondary: '#0EA5E9', secondaryGradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
  success: '#10B981', successGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  successSoft: '#ECFDF5',
  warning: '#F59E0B', warningGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  warningSoft: '#FFFBEB',
  info: '#3B82F6', infoGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  infoSoft: '#EFF6FF',
  gray900: '#111827', gray800: '#1F2937', gray700: '#374151', gray600: '#4B5563',
  gray500: '#6B7280', gray400: '#9CA3AF', gray300: '#D1D5DB', gray200: '#E5E7EB',
  gray100: '#F3F4F6', gray50: '#F9FAFB', white: '#FFFFFF',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
  shadowLg: '0 10px 20px -5px rgb(0 0 0 / 0.10)',
  shadowXl: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
};

const STORAGE_KEY = 'apa_welcome_seen';
const STORAGE_DAY = 'apa_welcome_day';

// Détermine si la modale doit s'ouvrir automatiquement.
// Règle : première visite OU première visite du jour.
export function shouldShowWelcome() {
  try {
    const seen = localStorage.getItem(STORAGE_KEY);
    const day  = localStorage.getItem(STORAGE_DAY);
    const today = new Date().toISOString().slice(0, 10);
    if (!seen) return true;
    if (day !== today) return true;   // re-affiche une fois par jour
    return false;
  } catch { return true; }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
    localStorage.setItem(STORAGE_DAY, new Date().toISOString().slice(0, 10));
  } catch {}
}

export function resetWelcome() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_DAY);
  } catch {}
}

// -----------------------------------------------------------------------------
const WelcomeModal = ({ user, counters = {}, onClose, onNavigate }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Empêche le scroll du body quand la modale est ouverte
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Ferme avec la touche Échap
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line

  const handleClose = () => {
    if (dontShowAgain) markWelcomeSeen();
    else markWelcomeSeen();  // on marque toujours au moins la visite du jour
    onClose && onClose();
  };

  const handleAction = (tabId) => {
    markWelcomeSeen();
    if (typeof onNavigate === 'function') onNavigate(tabId);
    onClose && onClose();
  };

  const prenom = (user?.name || '').split(' ')[0] || 'cher utilisateur';
  const heure  = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  const kpis = [
    { l: 'Documents', v: counters.documents ?? '—', i: 'bi-files',          t: T.primary, go: 'documents' },
    { l: 'Devis',     v: counters.devis     ?? 0,   i: 'bi-file-earmark-text', t: T.info,  go: 'devis' },
    { l: 'Sessions',  v: '—',                       i: 'bi-calendar3',       t: T.warning, go: 'formations' },
    { l: 'Programmes',v: '—',                       i: 'bi-stars',           t: T.success, go: 'programmes' }
  ];

  const actions = [
    {
      icon: 'bi-files',
      titre: 'Importer un document',
      desc:  'Ajoutez un PDF, Word, Excel ou texte à votre espace.',
      tab:   'documents',
      ton:   T.primary,
      grad:  T.primaryGradient
    },
    {
      icon: 'bi-stars',
      titre: 'Générer un programme IA',
      desc:  'Sélectionnez des documents et laissez l’IA composer un parcours.',
      tab:   'generation',
      ton:   '#8B5CF6',
      grad:  'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
    },
    {
      icon: 'bi-file-earmark-plus',
      titre: 'Demander un devis',
      desc:  'Parcours, coaching, formation, team building — en 3 minutes.',
      tab:   'devis',
      ton:   T.info,
      grad:  T.infoGradient
    },
    {
      icon: 'bi-person',
      titre: 'Compléter mon profil',
      desc:  'Vérifiez vos informations pour des échanges plus fluides.',
      tab:   'profile',
      ton:   T.success,
      grad:  T.successGradient
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 2500,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: T.white,
            borderRadius: 28,
            width: '100%',
            maxWidth: 780,
            boxShadow: T.shadowXl,
            overflow: 'hidden',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* ---------- En-tête avec dégradé ---------- */}
          <div style={{
            background: T.primaryGradient,
            padding: 'clamp(1.5rem, 3vw, 2.25rem)',
            color: T.white,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Cercles décoratifs */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: -60, right: -60, width: 220, height: 220,
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
            }} />
            <div aria-hidden="true" style={{
              position: 'absolute', bottom: -80, right: 60, width: 160, height: 160,
              borderRadius: '50%', background: 'rgba(255,255,255,0.06)'
            }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                <i className="bi bi-hand-thumbs-up-fill"></i>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.9, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Espace participant APA
                </div>
                <h2 id="welcome-title" style={{
                  margin: '0.35rem 0 0.5rem',
                  fontSize: 'clamp(1.4rem, 2.6vw, 1.85rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}>
                  {salutation}, {prenom} 👋
                </h2>
                <p style={{
                  margin: 0,
                  opacity: 0.92,
                  fontSize: 'clamp(0.88rem, 1.6vw, 1rem)',
                  lineHeight: 1.5,
                  maxWidth: 560
                }}>
                  Bienvenue dans votre assistant pédagogique et administratif.
                  Voici tout ce que vous pouvez faire en quelques clics.
                </p>
              </div>

              <button
                onClick={handleClose}
                aria-label="Fermer"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  width: 38, height: 38, borderRadius: 12,
                  color: T.white, fontSize: '1.2rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* ---------- Corps défilable ---------- */}
          <div style={{ padding: 'clamp(1.25rem, 2.5vw, 2rem)', overflowY: 'auto' }}>
            {/* KPI rapides */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.75rem'
            }}>
              {kpis.map((k) => (
                <motion.button
                  key={k.l}
                  whileHover={{ y: -3 }}
                  onClick={() => handleAction(k.go)}
                  style={{
                    background: T.gray50,
                    border: `1px solid ${T.gray200}`,
                    borderRadius: 14,
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: `${k.t}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 8
                  }}>
                    <i className={`bi ${k.i}`} style={{ color: k.t, fontSize: '1rem' }}></i>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: T.gray900, lineHeight: 1 }}>
                    {k.v}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: T.gray500, marginTop: 4 }}>
                    {k.l}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Actions rapides */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{
                margin: '0 0 0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: T.gray800,
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <i className="bi bi-lightning-charge-fill" style={{ color: T.warning }}></i>
                Actions rapides
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.75rem'
              }}>
                {actions.map((a) => (
                  <motion.button
                    key={a.titre}
                    whileHover={{ y: -3, boxShadow: T.shadowLg }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(a.tab)}
                    style={{
                      background: T.white,
                      border: `1px solid ${T.gray200}`,
                      borderRadius: 14,
                      padding: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontFamily: 'inherit',
                      transition: 'box-shadow .15s'
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 11,
                      background: a.grad,
                      color: T.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '1.05rem',
                      boxShadow: `0 6px 14px ${a.ton}30`
                    }}>
                      <i className={`bi ${a.icon}`}></i>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: T.gray900,
                        marginBottom: 3
                      }}>
                        {a.titre}
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        color: T.gray500,
                        lineHeight: 1.45
                      }}>
                        {a.desc}
                      </div>
                    </div>
                    <i className="bi bi-arrow-right" style={{
                      color: T.gray400,
                      alignSelf: 'center',
                      fontSize: '0.9rem'
                    }}></i>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* ---------- Pied ---------- */}
          <div style={{
            padding: '1rem clamp(1.25rem, 2.5vw, 2rem)',
            background: T.gray50,
            borderTop: `1px solid ${T.gray200}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.85rem', color: T.gray600, cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={{ accentColor: T.primary }}
              />
              Ne plus afficher automatiquement
            </label>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleAction('documents')}
                style={{
                  padding: '0.65rem 1.15rem',
                  background: T.white,
                  color: T.gray700,
                  border: `1.5px solid ${T.gray300}`,
                  borderRadius: 30,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit'
                }}
              >
                Voir mes documents
              </button>
              <button
                onClick={handleClose}
                style={{
                  padding: '0.65rem 1.35rem',
                  background: T.primaryGradient,
                  color: T.white,
                  border: 'none',
                  borderRadius: 30,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontFamily: 'inherit',
                  boxShadow: `0 8px 18px ${T.primary}35`
                }}
              >
                <i className="bi bi-check2"></i>
                Commencer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;