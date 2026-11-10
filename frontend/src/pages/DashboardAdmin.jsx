// frontend/src/pages/DashboardAdmin.jsx
// -----------------------------------------------------------------------------
// Dashboard Admin — layout pro, workflow partagé avec le client.
// Aucune dépendance aux anciens AdminPanel/DashboardAdmin.
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPanel } from '../admin/AdminPanel.jsx';
import { useWorkflow } from '../workflow/useWorkflow';

const T = {
  primary: '#1E3A8A', primaryLight: '#2563EB', primarySoft: '#EFF6FF', primaryDark: '#172554',
  primaryGradient: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
  accent: '#0D9488', accentSoft: '#F0FDFA',
  success: '#059669', successSoft: '#ECFDF5',
  warning: '#D97706', warningSoft: '#FFFBEB',
  danger: '#DC2626', dangerSoft: '#FEF2F2',
  info: '#0284C7', infoSoft: '#EFF6FF',
  ink: '#0F172A', inkSoft: '#334155', inkMuted: '#64748B', inkFaint: '#94A3B8',
  line: '#E2E8F0', lineSoft: '#F1F5F9',
  bg: '#F8FAFC', bgCard: '#FFFFFF', bgSunken: '#F1F5F9', white: '#FFFFFF',
  shadowSm: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
  shadowMd: '0 4px 12px -2px rgb(15 23 42 / 0.08)',
  shadowLg: '0 12px 28px -8px rgb(15 23 42 / 0.12)'
};

const SIDEBAR_WIDTH = 260;

const NAV_ITEMS = [
  { id: 'apercu',      label: 'Vue d’ensemble', icon: 'bi-speedometer2' },
  { id: 'entreprises', label: 'Entreprises',    icon: 'bi-building' },
  { id: 'formations',  label: 'Formations',     icon: 'bi-mortarboard' },
  { id: 'reponses',    label: 'Réponses',       icon: 'bi-clipboard-check' },
  { id: 'feedbacks',   label: 'Feedbacks',      icon: 'bi-chat-square-text' },
  { id: 'parametres',  label: 'Paramètres',     icon: 'bi-gear' }
];

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================
const DashboardAdmin = () => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  });
  const [section, setSection] = useState('apercu');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: 'info', message: '' });
  const [authChecked, setAuthChecked] = useState(false);

  // Hook workflow — partagé avec le client
  const workflow = useWorkflow();

  const notify = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), 3500);
  }, []);

  // Vérifie la session au montage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetch('http://127.0.0.1:5000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user) {
          setUser(d.user);
          localStorage.setItem('user', JSON.stringify(d.user));
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const activeItem = useMemo(
    () => NAV_ITEMS.find(i => i.id === section) || NAV_ITEMS[0],
    [section]
  );

  // Écran de chargement initial
  if (!authChecked && !user?.name) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.bg
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 20px',
            border: `4px solid ${T.primarySoft}`, borderTopColor: T.primary,
            borderRadius: '50%', animation: 'apa-spin 0.9s linear infinite'
          }} />
          <p style={{ color: T.inkMuted, fontSize: 14 }}>Chargement de l'espace administrateur…</p>
        </div>
      </div>
    );
  }

  if (!user?.name) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.ink
      }}>
        <div style={{ textAlign: 'center', color: T.white, maxWidth: 420, padding: 32 }}>
          <div style={{
            width: 80, height: 80, margin: '0 auto 24px',
            background: `${T.danger}20`, border: `2px solid ${T.danger}50`,
            borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38
          }}>
            <i className="bi bi-shield-lock" style={{ color: T.danger }} />
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 700 }}>Accès restreint</h2>
          <p style={{ opacity: 0.8, marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
            Veuillez vous connecter pour accéder à l'espace administrateur.
          </p>
          <button onClick={() => window.location.href = '/login'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 12,
              background: T.white, color: T.primary,
              border: 'none', fontSize: 14, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer'
            }}>
            <i className="bi bi-box-arrow-in-right" />
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex'
    }}>
      <AdminSidebar
        activeSection={section}
        onSelect={(id) => { setSection(id); setSidebarOpen(false); }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="apa-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminTopbar
          title={activeItem.label}
          user={user}
          onMenu={() => setSidebarOpen(true)}
          onRefresh={() => window.location.reload()}
          onSwitchToClient={() => window.location.href = '/dashboard-client'}
        />

        <main style={{
          flex: 1, padding: '24px clamp(16px, 2.5vw, 32px)',
          maxWidth: 1400, width: '100%', margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPanel
                section={section}
                setSection={setSection}
                workflow={workflow}
                notify={notify}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)} className="apa-overlay"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
              zIndex: 90, display: 'none'
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
              background: T.white, borderRadius: 12, boxShadow: T.shadowLg,
              borderLeft: `4px solid ${
                notification.type === 'success' ? T.success :
                notification.type === 'error' ? T.danger : T.info
              }`,
              padding: '12px 18px', display: 'flex',
              alignItems: 'center', gap: 12, minWidth: 280, maxWidth: 400
            }}
          >
            <i className={`bi ${
              notification.type === 'success' ? 'bi-check-circle-fill' :
              notification.type === 'error' ? 'bi-x-circle-fill' : 'bi-info-circle-fill'
            }`} style={{
              color: notification.type === 'success' ? T.success :
                     notification.type === 'error' ? T.danger : T.info,
              fontSize: 18
            }} />
            <span style={{ fontSize: 13.5, color: T.ink, flex: 1 }}>{notification.message}</span>
            <button onClick={() => setNotification(n => ({ ...n, show: false }))}
              style={{ background: 'transparent', border: 'none', color: T.inkFaint, cursor: 'pointer', padding: 4 }}>
              <i className="bi bi-x" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes apa-spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .apa-sidebar { transform: translateX(-100%); transition: transform .25s ease; }
          .apa-sidebar.open { transform: translateX(0); }
          .apa-overlay { display: block !important; }
        }
        @media (min-width: 1025px) {
          .apa-sidebar { position: fixed; height: 100vh; }
          .apa-main { margin-left: ${SIDEBAR_WIDTH}px; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
};

// =============================================================================
// SIDEBAR
// =============================================================================
const AdminSidebar = ({ activeSection, onSelect, open, onClose, user, onLogout }) => (
  <aside className={`apa-sidebar ${open ? 'open' : ''}`} style={{
    width: SIDEBAR_WIDTH, background: T.white,
    borderRight: `1px solid ${T.line}`,
    display: 'flex', flexDirection: 'column',
    zIndex: 100, position: 'fixed', top: 0, left: 0, bottom: 0
  }}>
    <div style={{
      padding: '20px 20px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `1px solid ${T.lineSoft}`
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: T.primaryGradient, color: T.white,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 17, boxShadow: T.shadowMd
      }}>A</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, color: T.ink, fontSize: 15 }}>OCTOGO</div>
        <div style={{ fontSize: 11, color: T.inkMuted }}>Administration</div>
      </div>
      <button onClick={onClose} aria-label="Fermer" className="apa-close"
        style={{
          marginLeft: 'auto', background: 'transparent', border: 'none',
          cursor: 'pointer', color: T.inkMuted, display: 'none'
        }}>
        <i className="bi bi-x-lg" />
      </button>
    </div>

    <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.inkFaint,
        textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px'
      }}>Navigation</div>
      {NAV_ITEMS.map((it) => {
        const active = activeSection === it.id;
        return (
          <button key={it.id} onClick={() => onSelect(it.id)}
            aria-current={active ? 'page' : undefined}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12,
              background: active ? T.primarySoft : 'transparent',
              color: active ? T.primaryDark : T.inkSoft,
              border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: active ? 700 : 500,
              marginBottom: 2, textAlign: 'left', fontFamily: 'inherit',
              transition: 'background .15s'
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.lineSoft; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
          >
            <i className={`bi ${it.icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>

    <div style={{
      padding: 12, borderTop: `1px solid ${T.lineSoft}`,
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 12,
        background: T.primaryGradient, color: T.white,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 13.5, flexShrink: 0
      }}>{(user?.name || 'A').substring(0, 2).toUpperCase()}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: T.ink,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{user?.name || 'Admin'}</div>
        <div style={{ fontSize: 11, color: T.inkMuted }}>Administrateur</div>
      </div>
      <button onClick={onLogout} title="Se déconnecter" aria-label="Se déconnecter"
        style={{
          background: 'transparent', border: 'none', color: T.inkMuted,
          cursor: 'pointer', padding: 4
        }}>
        <i className="bi bi-box-arrow-right" />
      </button>
    </div>

    <style>{`@media (max-width: 1024px) { .apa-close { display: flex !important; } }`}</style>
  </aside>
);

// =============================================================================
// TOPBAR
// =============================================================================
const AdminTopbar = ({ title, user, onMenu, onRefresh, onSwitchToClient }) => (
  <header style={{
    position: 'sticky', top: 0, zIndex: 50,
    background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${T.line}`,
    padding: '12px clamp(16px, 2.5vw, 32px)',
    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
  }}>
    <button onClick={onMenu} aria-label="Ouvrir le menu" className="apa-burger"
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 20, color: T.inkSoft, display: 'none', padding: 4
      }}>
      <i className="bi bi-list" />
    </button>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: T.inkMuted }}>Espace administrateur · OCTOGO APA</div>
      <h1 style={{
        margin: 0, fontSize: 17, fontWeight: 700, color: T.ink,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>{title}</h1>
    </div>
    <button onClick={onSwitchToClient}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 14px', borderRadius: 10,
        background: T.accentSoft, color: T.accent,
        border: `1px solid #99F6E4`, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
      }}>
      <i className="bi bi-person" />
      Vue client
    </button>
    <button onClick={onRefresh}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 14px', borderRadius: 10,
        background: T.white, color: T.inkSoft,
        border: `1px solid ${T.line}`, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, fontFamily: 'inherit'
      }}>
      <i className="bi bi-arrow-clockwise" />
      Rafraîchir
    </button>
    <style>{`
      @media (max-width: 1024px) { .apa-burger { display: inline-block !important; } }
    `}</style>
  </header>
);

export default DashboardAdmin;