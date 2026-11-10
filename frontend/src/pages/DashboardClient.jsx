// frontend/src/pages/DashboardClient.jsx
// -----------------------------------------------------------------------------
// Dashboard Client — navigation COMPLÈTE restaurée + workflow intégré.
//
// Onglets conservés :
//   • Vue d'ensemble          • Mes formations
//   • Mes tests               • Mes résultats
//   • Mes documents           • Génération IA
//   • Mon feedback            • Documents et devis
//   • Mon profil
//
// Le workflow (localStorage) partage l'état avec l'admin.
// Aucune donnée inventée. Aucun utilisateur créé. Aucun seed automatique.
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EspaceClient from '../client/EspaceClient.jsx';
import { useWorkflow } from '../workflow/useWorkflow';

// ------------------------------------------------------------------ Palette
const T = {
  primary:        '#1E3A8A',
  primaryLight:   '#2563EB',
  primarySoft:    '#EFF6FF',
  primaryDark:    '#172554',
  primaryGradient:'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
  accent:         '#0D9488',
  accentSoft:     '#F0FDFA',
  success:        '#059669', successSoft: '#ECFDF5',
  warning:        '#D97706', warningSoft: '#FFFBEB',
  danger:         '#DC2626', dangerSoft:  '#FEF2F2',
  info:           '#0284C7', infoSoft:    '#EFF6FF',
  ink:      '#0F172A', inkSoft:  '#334155',
  inkMuted: '#64748B', inkFaint: '#94A3B8',
  line:     '#E2E8F0', lineSoft: '#F1F5F9',
  bg:       '#F8FAFC', bgCard:   '#FFFFFF', bgSunken: '#F1F5F9',
  white:    '#FFFFFF',
  shadowSm: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
  shadowMd: '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.04)',
  shadowLg: '0 12px 28px -8px rgb(15 23 42 / 0.12), 0 4px 8px -4px rgb(15 23 42 / 0.06)',
  shadowXl: '0 20px 30px -10px rgb(15 23 42 / 0.15)'
};

const SIDEBAR_WIDTH = 260;

// ------------------------------------------------------------------ Navigation COMPLÈTE
const NAV_GROUPS = [
  { label: 'Pilotage', items: [
    { id: 'overview',    label: 'Vue d’ensemble',       icon: 'bi-grid-1x2',        backend: 'ok' },
    { id: 'besoins',     label: 'Besoins et stratégie', icon: 'bi-bullseye',        backend: 'absent' },
    { id: 'evaluations', label: 'Évaluations et KPI',   icon: 'bi-clipboard-check', backend: 'ok' }
  ]},
  { label: 'Apprentissage', items: [
    { id: 'formations',   label: 'Mes formations',        icon: 'bi-calendar3',    backend: 'ok' },
    { id: 'resultats',    label: 'Mes résultats',         icon: 'bi-file-bar-graph', backend: 'ok' },
    { id: 'parcours',     label: 'Compétences et parcours', icon: 'bi-signpost-2', backend: 'ok' },
    { id: 'participants', label: 'Participants',          icon: 'bi-people',       backend: 'absent' },
    { id: 'ressources',   label: 'Ressources pédagogiques', icon: 'bi-folder2-open', backend: 'absent' }
  ]},
  { label: 'Documents & IA', items: [
    { id: 'documents',  label: 'Mes documents',      icon: 'bi-files',            backend: 'ok', counter: 'documents' },
    { id: 'generation', label: 'Génération IA',      icon: 'bi-stars',            backend: 'ok' },
    { id: 'feedback',   label: 'Mon feedback',       icon: 'bi-chat-square-text', backend: 'ok' },
    { id: 'devis',      label: 'Documents et devis', icon: 'bi-file-earmark-text', backend: 'api', counter: 'devis' }
  ]},
  { label: 'Organisation', items: [
    { id: 'budget',   label: 'Budget et prestataires', icon: 'bi-wallet2',        backend: 'absent' },
    { id: 'profile',  label: 'Mon profil',             icon: 'bi-person',         backend: 'api' }
  ]}
];

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================
const DashboardClient = () => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState({ parcours: [], coaching: [], formation: [], teambuilding: [] });
  const [documentsCount, setDocumentsCount] = useState(null);

  const workflow = useWorkflow();
  const { synchroniserEntreprisesDepuisUsers } = workflow;

  const [notification, setNotification] = useState({ show: false, type: 'info', message: '' });
  const notify = useCallback((type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), 3500);
  }, []);

  const [devisState, setDevisState] = useState({
    showModal: false, submitting: false,
    selected: null, showMessageModal: false,
    newComment: '', sendingComment: false
  });
  const [devisForm, setDevisForm] = useState({
    serviceType: 'parcours', serviceId: '', serviceTitle: '', serviceCategory: '',
    entreprise: user?.company || '', matriculeFiscale: user?.matriculeFiscale || '',
    participants: 1, duree: 1, uniteDuree: 'jours', lieu: '', datePrevue: '',
    message: '', contactPhone: user?.phone || '', devise: 'TND'
  });

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: user?.name || '', email: user?.email || '',
    company: user?.company || '', phone: user?.phone || '',
    matriculeFiscale: user?.matriculeFiscale || ''
  });

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { handleLogout(); return; }

      const [profileRes, devisRes, usersRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null),
        fetch('http://127.0.0.1:5000/api/devis/mes-devis', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null),
        fetch('http://127.0.0.1:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null)
      ]);

      if (profileRes && profileRes.ok) {
        const d = await profileRes.json();
        setUser(d.user || {});
        localStorage.setItem('user', JSON.stringify(d.user || {}));
      }
      if (devisRes && devisRes.ok) {
        const d = await devisRes.json();
        setDevis(d.devis || []);
      } else if (devisRes && devisRes.status === 401) {
        handleLogout();
      }

      // Synchronise les entreprises du workflow à partir des vrais users
      if (usersRes && usersRes.ok) {
        const d = await usersRes.json();
        if (d.users) synchroniserEntreprisesDepuisUsers(d.users);
      }
    } catch (err) {
      console.error('fetchUserData:', err);
      notify('error', 'Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, [handleLogout, notify, synchroniserEntreprisesDepuisUsers]);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  // Actions devis (inchangées)
  const openDevisModal = useCallback((type = 'parcours') => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setDevisForm({
      serviceType: type, serviceId: '', serviceTitle: '', serviceCategory: '',
      entreprise: u?.company || '', matriculeFiscale: u?.matriculeFiscale || '',
      participants: 1, duree: 1, uniteDuree: 'jours', lieu: '', datePrevue: '',
      message: '', contactPhone: u?.phone || '', devise: 'TND'
    });
    fetch('http://127.0.0.1:5000/api/services/all')
      .then(r => r.ok ? r.json() : { services: {} })
      .then(d => setServices(d.services || {}))
      .catch(() => {});
    setDevisState(s => ({ ...s, showModal: true }));
  }, []);

  const submitDevis = async (e) => {
    e.preventDefault();
    if (!devisForm.serviceId || !devisForm.entreprise || !devisForm.matriculeFiscale || !devisForm.lieu) {
      notify('error', 'Veuillez remplir tous les champs obligatoires (*)');
      return;
    }
    setDevisState(s => ({ ...s, submitting: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/api/devis/demander', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(devisForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify('success', 'Votre demande de devis a bien été envoyée.');
        setDevisState(s => ({ ...s, showModal: false }));
        fetchUserData();
      } else {
        notify('error', data.message || 'Erreur lors de l’envoi.');
      }
    } catch {
      notify('error', 'Problème de connexion.');
    } finally {
      setDevisState(s => ({ ...s, submitting: false }));
    }
  };

  const deleteDevis = async (id) => {
    if (!window.confirm('Supprimer cette demande de devis ?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/devis/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify('success', 'Devis supprimé.');
        fetchUserData();
      } else {
        notify('error', 'Erreur lors de la suppression.');
      }
    } catch {
      notify('error', 'Problème de connexion.');
    }
  };

  const openMessages = (d) => setDevisState(s => ({ ...s, selected: d, showMessageModal: true }));

  const sendComment = async () => {
    if (!devisState.newComment.trim()) return;
    setDevisState(s => ({ ...s, sendingComment: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5000/api/devis/${devisState.selected.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: devisState.newComment, isFromClient: true })
      });
      if (res.ok) {
        notify('success', 'Message envoyé.');
        setDevisState(s => ({ ...s, newComment: '' }));
        const r = await fetch(`http://127.0.0.1:5000/api/devis/${devisState.selected.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (r.ok) {
          const d = await r.json();
          setDevisState(s => ({ ...s, selected: d.devis }));
          setDevis(prev => prev.map(x => x.id === devisState.selected.id ? d.devis : x));
        }
      } else {
        notify('error', 'Erreur lors de l’envoi.');
      }
    } catch {
      notify('error', 'Problème de connexion.');
    } finally {
      setDevisState(s => ({ ...s, sendingComment: false }));
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const r = await fetch('http://127.0.0.1:5000/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editProfileForm)
      });
      const data = await r.json();
      if (r.ok) {
        notify('success', 'Profil mis à jour.');
        setShowProfileEdit(false);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        notify('error', data.message || 'Erreur lors de la mise à jour.');
      }
    } catch {
      notify('error', 'Problème de connexion.');
    }
  };

  const filteredDevis = useMemo(() => devis.filter(d => {
    const s = filterStatus === 'all' || d.status === filterStatus;
    const q = !searchQuery || [d.serviceTitle, d.entreprise]
      .some(v => (v || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return s && q;
  }), [devis, filterStatus, searchQuery]);

  const counters = useMemo(() => ({
    documents: documentsCount,
    devis: devis.length
  }), [documentsCount, devis.length]);

  const activeItem = useMemo(
    () => NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab),
    [activeTab]
  );

  if (loading) return <LoadingScreen />;
  if (!user || !user.name) return <AccessDenied />;

  return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex'
    }}>
      <Sidebar
        activeTab={activeTab}
        onSelect={(id) => { setActiveTab(id); setSidebarOpen(false); }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        counters={counters}
        user={user}
        onLogout={handleLogout}
        onSwitchToAdmin={() => {
          if (user?.role === 'admin') window.location.href = '/admin/dashboard';
          else notify('error', 'Accès administrateur requis.');
        }}
      />

      <div className="apa-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          title={activeItem?.label || 'Espace APA'}
          user={user}
          onMenu={() => setSidebarOpen(true)}
          onRefresh={() => { fetchUserData(); notify('info', 'Données actualisées.'); }}
        />

        <main style={{
          flex: 1,
          padding: '24px clamp(16px, 2.5vw, 32px)',
          maxWidth: 1400, width: '100%', margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab({
                activeTab,
                activeItem,
                user,
                workflow,
                notify,
                documentsCount,
                setDocumentsCount,
                devis,
                filteredDevis,
                filterStatus,
                setFilterStatus,
                searchQuery,
                setSearchQuery,
                openDevisModal,
                deleteDevis,
                openMessages,
                setShowProfileEdit,
                onOpenGenerator: () => setActiveTab('generation'),
                onNavigate: (id) => setActiveTab(id)
              })}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="apa-overlay"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
              zIndex: 90, display: 'none'
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification.show && (
          <Toast
            notification={notification}
            onClose={() => setNotification(n => ({ ...n, show: false }))}
          />
        )}
      </AnimatePresence>

      {devisState.showModal && (
        <DevisModal
          form={devisForm} setForm={setDevisForm} services={services}
          submitting={devisState.submitting}
          onClose={() => setDevisState(s => ({ ...s, showModal: false }))}
          onSubmit={submitDevis}
        />
      )}
      {devisState.showMessageModal && devisState.selected && (
        <MessagesModal
          devis={devisState.selected}
          comment={devisState.newComment}
          setComment={(v) => setDevisState(s => ({ ...s, newComment: v }))}
          sending={devisState.sendingComment}
          onSend={sendComment}
          onClose={() => setDevisState(s => ({ ...s, showMessageModal: false }))}
        />
      )}
      {showProfileEdit && (
        <ProfileModal
          form={editProfileForm} setForm={setEditProfileForm}
          onClose={() => setShowProfileEdit(false)}
          onSubmit={updateProfile}
        />
      )}

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
// RENDU PAR ONGLET — TOUS les onglets retournent du contenu réel
// =============================================================================
function renderTab(ctx) {
  const {
    activeTab, activeItem, user, workflow, notify,
    documentsCount, setDocumentsCount,
    devis, filteredDevis, filterStatus, setFilterStatus, searchQuery, setSearchQuery,
    openDevisModal, deleteDevis, openMessages,
    setShowProfileEdit, onOpenGenerator, onNavigate
  } = ctx;

  const wrap = (children) => (
    <div style={{
      background: T.white, borderRadius: 20,
      padding: 'clamp(16px, 2vw, 28px)',
      boxShadow: T.shadowMd, border: `1px solid ${T.lineSoft}`
    }}>{children}</div>
  );

  const absent = (item) => wrap(
    <div>
      <SectionTitle icon={item.icon} title={item.label} />
      <ContextBanner tone="warning" icon="bi-lock-fill">
        <strong>Module en préparation.</strong>
        <div style={{ marginTop: 4, fontSize: '0.85rem', opacity: 0.9 }}>
          Cette section fait partie de la feuille de route. Elle n'est pas encore disponible.
        </div>
      </ContextBanner>
    </div>
  );

  switch (activeTab) {
    case 'overview':
      return wrap(
        <EspaceClient
          vue="apercu"
          workflow={workflow}
          onDocumentsCount={setDocumentsCount}
          onNavigate={onNavigate}
        />
      );

    case 'evaluations':
      return wrap(
        <EspaceClient
          vue="tests"
          workflow={workflow}
          onNavigate={onNavigate}
        />
      );

    case 'formations':
      return wrap(
        <EspaceClient
          vue="formations"
          workflow={workflow}
          onNavigate={onNavigate}
        />
      );

    case 'resultats':
      return wrap(
        <EspaceClient
          vue="resultats"
          workflow={workflow}
          onNavigate={onNavigate}
        />
      );

    case 'parcours':
      return wrap(<EspaceClient vue="programmes" workflow={workflow} />);

    case 'documents':
      return wrap(
        <EspaceClient
          vue="fichiers"
          workflow={workflow}
          onDocumentsCount={setDocumentsCount}
          onGenerateWithDocuments={(ids) => {
            try { sessionStorage.setItem('apa_pending_docs', JSON.stringify(ids || [])); } catch {}
            onOpenGenerator && onOpenGenerator();
          }}
        />
      );

    case 'generation':
      return wrap(
        <EspaceClient
          vue="generation"
          workflow={workflow}
          onDocumentsCount={setDocumentsCount}
        />
      );

    case 'feedback':
      return wrap(
        <EspaceClient
          vue="feedback"
          workflow={workflow}
          onNavigate={onNavigate}
        />
      );

    case 'devis':
      return wrap(
        <DevisPanel
          devis={devis}
          filteredDevis={filteredDevis}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openDevisModal={openDevisModal}
          deleteDevis={deleteDevis}
          openMessages={openMessages}
        />
      );

    case 'profile':
      return wrap(
        <ProfilePanel user={user} onEdit={() => setShowProfileEdit(true)} />
      );

    case 'besoins':
    case 'participants':
    case 'ressources':
    case 'budget':
      return absent(activeItem);

    default:
      return wrap(
        <div>
          <SectionTitle icon="bi-question-circle" title="Onglet inconnu" />
          <p style={{ color: T.inkMuted }}>Identifiant : {activeTab}</p>
        </div>
      );
  }
}

// =============================================================================
// SIDEBAR
// =============================================================================
const Sidebar = ({ activeTab, onSelect, open, onClose, counters, user, onLogout, onSwitchToAdmin }) => (
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
        <div style={{ fontWeight: 800, color: T.ink, fontSize: 15 }}>APA</div>
        <div style={{ fontSize: 11, color: T.inkMuted }}>Assistant pédagogique</div>
      </div>
      <button onClick={onClose} aria-label="Fermer" className="apa-close"
        style={{
          marginLeft: 'auto', background: 'transparent', border: 'none',
          cursor: 'pointer', color: T.inkMuted, display: 'none'
        }}>
        <i className="bi bi-x-lg" />
      </button>
    </div>

    <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}
         aria-label="Navigation principale">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: T.inkFaint,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '8px 12px'
          }}>{group.label}</div>
          {group.items.map((it) => {
            const active = activeTab === it.id;
            const disabled = it.backend === 'absent';
            const count = it.counter ? counters[it.counter] : null;
            return (
              <button
                key={it.id}
                onClick={() => onSelect(it.id)}
                aria-current={active ? 'page' : undefined}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 12,
                  background: active ? T.primarySoft : 'transparent',
                  color: active ? T.primaryDark : (disabled ? T.inkFaint : T.inkSoft),
                  border: 'none', cursor: 'pointer',
                  fontSize: 13.5, fontWeight: active ? 700 : 500,
                  marginBottom: 2, textAlign: 'left', fontFamily: 'inherit',
                  transition: 'background .15s'
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = T.lineSoft; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <i className={`bi ${it.icon}`} style={{ fontSize: 16, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {it.label}
                </span>
                {disabled && <i className="bi bi-lock" style={{ fontSize: 11, opacity: 0.6 }} />}
                {count != null && count > 0 && (
                  <span style={{
                    background: active ? T.white : T.lineSoft,
                    color: active ? T.primary : T.inkMuted,
                    fontSize: 11, fontWeight: 700,
                    padding: '1px 7px', borderRadius: 999
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
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
        }}>{user?.name || 'Utilisateur'}</div>
        <div style={{
          fontSize: 11, color: T.inkMuted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{user?.company || user?.role || 'client'}</div>
      </div>
      {user?.role === 'admin' && (
        <button onClick={onSwitchToAdmin} title="Espace admin"
          style={{
            background: 'transparent', border: 'none', color: T.primary,
            cursor: 'pointer', padding: 4
          }}>
          <i className="bi bi-shield-fill" />
        </button>
      )}
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
const Topbar = ({ title, user, onMenu, onRefresh }) => (
  <header style={{
    position: 'sticky', top: 0, zIndex: 50,
    background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${T.line}`,
    padding: '12px clamp(16px, 2.5vw, 32px)',
    display: 'flex', alignItems: 'center', gap: 16
  }}>
    <button onClick={onMenu} aria-label="Ouvrir le menu" className="apa-burger"
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 20, color: T.inkSoft, display: 'none', padding: 4
      }}>
      <i className="bi bi-list" />
    </button>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: T.inkMuted }}>
        Espace participant · {user?.company || 'APA'}
      </div>
      <h1 style={{
        margin: 0, fontSize: 17, fontWeight: 700, color: T.ink,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>{title}</h1>
    </div>
    <Button variant="secondary" icon="bi-arrow-clockwise" onClick={onRefresh}>
      Actualiser
    </Button>
    <style>{`
      @media (max-width: 1024px) { .apa-burger { display: inline-block !important; } }
    `}</style>
  </header>
);

// =============================================================================
// PANELS (DevisPanel / ProfilePanel identiques à l'original)
// =============================================================================
const DevisPanel = ({
  devis, filteredDevis, filterStatus, setFilterStatus, searchQuery, setSearchQuery,
  openDevisModal, deleteDevis, openMessages
}) => {
  const statusLabel = { 'en attente': 'En attente', 'validé': 'Validé', 'payé': 'Payé', 'refusé': 'Refusé' };
  const serviceLabel = {
    parcours: 'Parcours', coaching: 'Coaching',
    formation: 'Formation', teambuilding: 'Team Building'
  };

  return (
    <div>
      <SectionTitle
        icon="bi-file-earmark-text"
        title="Documents et devis"
        subtitle={`${filteredDevis.length} demande(s)`}
        action={<Button icon="bi-plus-lg" onClick={() => openDevisModal('parcours')}>
          Nouvelle demande
        </Button>}
      />

      <ContextBanner tone="guide">
        Suivez vos demandes de devis et échangez avec l’équipe OCTOGO.
      </ContextBanner>

      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        marginBottom: 20, alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
          <i className="bi bi-search" style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: T.inkFaint, pointerEvents: 'none'
          }} />
          <input
            type="search" placeholder="Rechercher un devis…"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 36px',
              border: `1px solid ${T.line}`, borderRadius: 12,
              fontSize: 13.5, outline: 'none',
              background: T.bgSunken, boxSizing: 'border-box', fontFamily: 'inherit'
            }}
          />
        </div>
        <FilterPill active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
          Tous
        </FilterPill>
        {Object.entries(statusLabel).map(([s, l]) => {
          const n = devis.filter(d => d.status === s).length;
          if (!n) return null;
          return (
            <FilterPill key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)}>
              {l} ({n})
            </FilterPill>
          );
        })}
      </div>

      {filteredDevis.length === 0 ? (
        <Empty
          icon="bi-file-earmark"
          title={devis.length === 0 ? 'Aucune demande' : 'Aucun résultat'}
          texte={devis.length === 0
            ? 'Créez votre première demande de devis depuis le bouton ci-dessus.'
            : 'Aucun devis ne correspond à votre recherche.'}
          action={devis.length === 0
            ? <Button icon="bi-plus-lg" onClick={() => openDevisModal('parcours')}>
                Nouvelle demande
              </Button>
            : null}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16
        }}>
          {filteredDevis.map(d => (
            <Card key={d.id} hover>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: 12, gap: 6, flexWrap: 'wrap'
              }}>
                <Badge tone={
                  d.status === 'validé' ? 'success' :
                  d.status === 'payé' ? 'info' :
                  d.status === 'refusé' ? 'danger' : 'warning'
                }>
                  {statusLabel[d.status] || d.status}
                </Badge>
                <Badge tone="neutral">
                  {serviceLabel[d.serviceType] || d.serviceType}
                </Badge>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.ink, margin: '0 0 12px' }}>
                {d.serviceTitle || 'Service'}
              </h3>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                fontSize: 12, color: T.inkMuted, marginBottom: 14
              }}>
                <div><i className="bi bi-building" style={{ marginRight: 4 }} />{d.entreprise || '—'}</div>
                <div><i className="bi bi-calendar" style={{ marginRight: 4 }} />
                  {d.datePrevue ? new Date(d.datePrevue).toLocaleDateString('fr-FR') : '—'}
                </div>
                <div><i className="bi bi-geo-alt" style={{ marginRight: 4 }} />{d.lieu || '—'}</div>
                <div><i className="bi bi-clock" style={{ marginRight: 4 }} />
                  {d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="secondary" icon="bi-chat-dots" onClick={() => openMessages(d)}>
                  Messages
                </Button>
                {d.status === 'en attente' && (
                  <Button variant="danger" icon="bi-trash" onClick={() => deleteDevis(d.id)}>
                    Supprimer
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilePanel = ({ user, onEdit }) => (
  <div>
    <SectionTitle
      icon="bi-person"
      title="Mon profil"
      subtitle="Ces informations sont utilisées pour vos devis et vos échanges avec OCTOGO."
      action={<Button icon="bi-pencil" onClick={onEdit}>Modifier</Button>}
    />

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 16
    }}>
      {[
        { l: 'Nom complet', v: user?.name, i: 'bi-person' },
        { l: 'Email', v: user?.email, i: 'bi-envelope' },
        { l: 'Entreprise', v: user?.company, i: 'bi-briefcase' },
        { l: 'Téléphone', v: user?.phone, i: 'bi-telephone' },
        { l: 'Matricule fiscale', v: user?.matriculeFiscale, i: 'bi-file-earmark-text' },
        { l: 'Membre depuis', v: user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString('fr-FR') : null, i: 'bi-calendar-check' }
      ].map((item) => (
        <div key={item.l} style={{
          background: T.bgSunken, borderRadius: 12,
          padding: 16, border: `1px solid ${T.line}`
        }}>
          <div style={{
            fontSize: 11, color: T.inkMuted,
            textTransform: 'uppercase', letterSpacing: '0.04em',
            fontWeight: 700, marginBottom: 4
          }}>
            <i className={`bi ${item.i}`} style={{ marginRight: 6 }} />{item.l}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>
            {item.v || 'Non spécifié'}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// =============================================================================
// PRIMITIVES UI (identiques à l'original)
// =============================================================================
const SectionTitle = ({ icon, title, subtitle, action }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 16, marginBottom: 20, flexWrap: 'wrap'
  }}>
    <div style={{ minWidth: 0 }}>
      <h2 style={{
        margin: 0, fontSize: 22, fontWeight: 700,
        letterSpacing: '-0.01em', color: T.ink,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        {icon && <i className={`bi ${icon}`} style={{ color: T.primary }} />}
        {title}
      </h2>
      {subtitle && (
        <p style={{ margin: '5px 0 0', color: T.inkMuted, fontSize: 13.5 }}>
          {subtitle}
        </p>
      )}
    </div>
    {action}
  </div>
);

const Card = ({ children, hover = false, style = {} }) => (
  <motion.div
    whileHover={hover ? { y: -2, boxShadow: T.shadowLg } : undefined}
    style={{
      background: T.white, border: `1px solid ${T.line}`,
      borderRadius: 16, padding: 20, boxShadow: T.shadowSm,
      ...style
    }}
  >
    {children}
  </motion.div>
);

const Button = ({ children, variant = 'primary', icon, iconRight, full, loading, disabled, onClick, type = 'button', title }) => {
  const variants = {
    primary:   { bg: T.primaryGradient, fg: T.white, border: 'none' },
    secondary: { bg: T.white, fg: T.inkSoft, border: `1.5px solid ${T.line}` },
    ghost:     { bg: 'transparent', fg: T.inkSoft, border: 'none' },
    danger:    { bg: T.dangerSoft, fg: T.danger, border: `1px solid ${T.danger}33` },
    success:   { bg: T.successSoft, fg: T.success, border: `1px solid ${T.success}33` }
  };
  const v = variants[variant] || variants.primary;
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
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '10px 18px', borderRadius: 12,
        background: v.bg, color: v.fg, border: v.border,
        fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        width: full ? '100%' : undefined,
        boxShadow: variant === 'primary' && !isDisabled ? T.shadowMd : 'none',
        transition: 'opacity .15s'
      }}
    >
      {loading ? <Spinner size={14} /> : icon && <i className={`bi ${icon}`} style={{ fontSize: 15 }} />}
      <span>{children}</span>
      {iconRight && !loading && <i className={`bi ${iconRight}`} style={{ fontSize: 13 }} />}
    </motion.button>
  );
};

const Spinner = ({ size = 16, color = 'currentColor' }) => (
  <span aria-hidden="true" style={{
    width: size, height: size,
    border: `2px solid ${color}55`, borderTopColor: color,
    borderRadius: '50%', display: 'inline-block',
    animation: 'apa-spin 0.7s linear infinite'
  }} />
);

const Badge = ({ tone = 'neutral', children, icon }) => {
  const tones = {
    neutral: { bg: T.lineSoft, fg: T.inkSoft },
    primary: { bg: T.primarySoft, fg: T.primary },
    success: { bg: T.successSoft, fg: T.success },
    warning: { bg: T.warningSoft, fg: T.warning },
    danger:  { bg: T.dangerSoft, fg: T.danger },
    info:    { bg: T.infoSoft, fg: T.info }
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: t.bg, color: t.fg,
      padding: '3px 10px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 700
    }}>
      {icon && <i className={`bi ${icon}`} style={{ fontSize: 11 }} />}
      {children}
    </span>
  );
};

const ContextBanner = ({ tone = 'guide', icon, children }) => {
  const tones = {
    guide:   { bg: T.bgSunken, border: T.line, icon: 'bi-info-circle', fg: T.inkSoft },
    action:  { bg: T.primarySoft, border: '#BFDBFE', icon: 'bi-lightning-charge-fill', fg: T.primaryDark },
    success: { bg: T.successSoft, border: '#A7F3D0', icon: 'bi-check-circle-fill', fg: '#065F46' },
    warning: { bg: T.warningSoft, border: '#FDE68A', icon: 'bi-exclamation-triangle-fill', fg: '#92400E' },
    error:   { bg: T.dangerSoft, border: '#FECACA', icon: 'bi-x-circle-fill', fg: '#991B1B' }
  };
  const t = tones[tone] || tones.guide;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: t.bg, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '14px 16px',
      marginBottom: 20, fontSize: 13.5, color: t.fg, lineHeight: 1.55
    }}>
      <i className={`bi ${icon || t.icon}`} style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
};

const Empty = ({ icon = 'bi-inbox', title, texte, action }) => (
  <div style={{
    padding: 48, background: T.bgSunken,
    borderRadius: 16, border: `1px dashed ${T.line}`,
    textAlign: 'center'
  }}>
    <i className={`bi ${icon}`} style={{ fontSize: 36, color: T.inkFaint }} />
    {title && (
      <h3 style={{ margin: '12px 0 6px', color: T.inkSoft, fontSize: 17 }}>
        {title}
      </h3>
    )}
    {texte && (
      <p style={{
        color: T.inkMuted, fontSize: 13.5,
        maxWidth: 480, margin: '0 auto', lineHeight: 1.55
      }}>{texte}</p>
    )}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

const FilterPill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '8px 14px', borderRadius: 999,
    background: active ? T.primary : T.white,
    color: active ? T.white : T.inkSoft,
    border: `1px solid ${active ? T.primary : T.line}`,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
  }}>{children}</button>
);

const Field = ({ label, hint, required, children, error }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label style={{
        display: 'block', marginBottom: 5, fontWeight: 600,
        color: T.inkSoft, fontSize: 13
      }}>
        {label} {required && <span style={{ color: T.danger }}>*</span>}
      </label>
    )}
    {children}
    {hint && !error && (
      <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 4 }}>{hint}</div>
    )}
    {error && (
      <div style={{ fontSize: 11.5, color: T.danger, marginTop: 4 }}>
        <i className="bi bi-exclamation-circle" style={{ marginRight: 4 }} />{error}
      </div>
    )}
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: `1.5px solid ${T.line}`, borderRadius: 10,
  fontSize: 13.5, color: T.ink, background: T.white,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
};

const Input = (props) => <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
const Textarea = (props) => <textarea {...props} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', ...(props.style || {}) }} />;
const Select = ({ children, ...props }) => (
  <select {...props} style={{ ...inputStyle, cursor: 'pointer', ...(props.style || {}) }}>
    {children}
  </select>
);

const ModalShell = ({ children, onClose, width = 640 }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
    backdropFilter: 'blur(4px)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16
  }} onClick={onClose}>
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      onClick={(e) => e.stopPropagation()}
      style={{
        background: T.white, borderRadius: 20, maxWidth: width,
        width: '100%', maxHeight: '92vh', display: 'flex',
        flexDirection: 'column', boxShadow: T.shadowXl, overflow: 'hidden'
      }}
    >
      {children}
    </motion.div>
  </div>
);

const ModalHeader = ({ title, subtitle, onClose }) => (
  <div style={{
    padding: '20px 24px', borderBottom: `1px solid ${T.lineSoft}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16
  }}>
    <div style={{ minWidth: 0 }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.ink }}>{title}</h3>
      {subtitle && (
        <p style={{ margin: '4px 0 0', color: T.inkMuted, fontSize: 13 }}>{subtitle}</p>
      )}
    </div>
    <button onClick={onClose} aria-label="Fermer"
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: T.inkMuted, padding: 4, fontSize: 16, lineHeight: 1
      }}>
      <i className="bi bi-x-lg" />
    </button>
  </div>
);

const DevisModal = ({ form, setForm, services, submitting, onClose, onSubmit }) => {
  const list = services[form.serviceType] || [];
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <ModalShell onClose={onClose} width={720}>
      <ModalHeader
        title="Nouvelle demande de devis"
        subtitle="Remplissez les informations ci-dessous. Les champs marqués * sont obligatoires."
        onClose={onClose}
      />
      <form onSubmit={onSubmit} style={{ padding: 24, overflowY: 'auto' }}>
        <Field label="Type de service" required>
          <Select value={form.serviceType} onChange={(e) => set('serviceType', e.target.value)}>
            <option value="parcours">Parcours</option>
            <option value="coaching">Coaching</option>
            <option value="formation">Formation</option>
            <option value="teambuilding">Team Building</option>
          </Select>
        </Field>
        <Field label="Programme" required>
          <Select value={form.serviceId} required
            onChange={(e) => {
              const s = list.find(x => x.id == e.target.value);
              setForm(f => ({
                ...f, serviceId: e.target.value,
                serviceTitle: s?.title || '',
                serviceCategory: s?.category || ''
              }));
            }}>
            <option value="">— Sélectionnez un programme —</option>
            {list.map(s => (
              <option key={s.id} value={s.id}>{s.title} • {s.category}</option>
            ))}
          </Select>
        </Field>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16
        }}>
          <Field label="Entreprise" required>
            <Input value={form.entreprise} required onChange={(e) => set('entreprise', e.target.value)} />
          </Field>
          <Field label="Matricule fiscale" required>
            <Input value={form.matriculeFiscale} required onChange={(e) => set('matriculeFiscale', e.target.value)} />
          </Field>
          <Field label="Participants">
            <Input type="number" min={1} value={form.participants}
              onChange={(e) => set('participants', parseInt(e.target.value) || 1)} />
          </Field>
          <Field label="Lieu" required>
            <Input value={form.lieu} required onChange={(e) => set('lieu', e.target.value)} />
          </Field>
          <Field label="Date prévue">
            <Input type="date" value={form.datePrevue}
              onChange={(e) => set('datePrevue', e.target.value)} />
          </Field>
        </div>
        <Field label="Message additionnel" hint="Décrivez le contexte si nécessaire.">
          <Textarea rows={3} value={form.message}
            onChange={(e) => set('message', e.target.value)} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button type="submit" loading={submitting} icon="bi-send-check">Envoyer</Button>
        </div>
      </form>
    </ModalShell>
  );
};

const MessagesModal = ({ devis, comment, setComment, sending, onSend, onClose }) => (
  <ModalShell onClose={onClose} width={720}>
    <ModalHeader
      title="Conversation"
      subtitle={`Devis #${devis.id} · ${devis.serviceTitle || 'Service'}`}
      onClose={onClose}
    />
    <div style={{
      padding: 20, overflowY: 'auto', flex: 1,
      background: T.bgSunken, minHeight: 260, maxHeight: '55vh'
    }}>
      {devis.message && <Bubble fromUser text={devis.message} date={devis.createdAt} />}
      {(devis.comments || []).length === 0 && !devis.message ? (
        <div style={{ textAlign: 'center', padding: 32, color: T.inkFaint }}>
          <i className="bi bi-chat" style={{ fontSize: 32 }} />
          <p style={{ color: T.inkMuted, marginTop: 8 }}>
            Aucun message. Écrivez le premier ci-dessous.
          </p>
        </div>
      ) : (
        (devis.comments || []).map((c, i) => (
          <Bubble key={c.id || i} fromUser={c.isFromClient} text={c.content} date={c.createdAt} />
        ))
      )}
    </div>
    <div style={{ padding: 16, borderTop: `1px solid ${T.lineSoft}`, display: 'flex', gap: 12 }}>
      <Textarea rows={2} value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Écrivez votre message…"
        style={{ flex: 1 }} />
      <Button onClick={onSend} disabled={sending || !comment.trim()} loading={sending} icon="bi-send" />
    </div>
  </ModalShell>
);

const Bubble = ({ fromUser, text, date }) => (
  <div style={{ display: 'flex', justifyContent: fromUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
    <div style={{
      maxWidth: '75%', padding: '10px 14px',
      background: fromUser ? T.primaryGradient : T.white,
      color: fromUser ? T.white : T.ink,
      borderRadius: fromUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
      border: !fromUser ? `1px solid ${T.line}` : 'none',
      fontSize: 13.5, lineHeight: 1.5, boxShadow: T.shadowSm
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, marginBottom: 3 }}>
        {fromUser ? 'Vous' : 'Support'}
      </div>
      <div>{text}</div>
      {date && (
        <div style={{ fontSize: 10.5, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
          {new Date(date).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </div>
      )}
    </div>
  </div>
);

const ProfileModal = ({ form, setForm, onClose, onSubmit }) => {
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <ModalShell onClose={onClose} width={520}>
      <ModalHeader title="Modifier mon profil" onClose={onClose} />
      <form onSubmit={onSubmit} style={{ padding: 24, overflowY: 'auto' }}>
        {[
          { k: 'name', l: 'Nom complet', t: 'text', req: true },
          { k: 'email', l: 'Email', t: 'email', req: true },
          { k: 'company', l: 'Entreprise', t: 'text' },
          { k: 'phone', l: 'Téléphone', t: 'tel' },
          { k: 'matriculeFiscale', l: 'Matricule fiscale', t: 'text' }
        ].map(f => (
          <Field key={f.k} label={f.l} required={f.req}>
            <Input type={f.t} required={f.req} value={form[f.k] || ''}
              onChange={(e) => set(f.k, e.target.value)} />
          </Field>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" icon="bi-check-lg">Enregistrer</Button>
        </div>
      </form>
    </ModalShell>
  );
};

// =============================================================================
// TOAST
// =============================================================================
const Toast = ({ notification, onClose }) => {
  const tone = { success: T.success, error: T.danger, warning: T.warning, info: T.info }[notification.type] || T.info;
  const icon = {
    success: 'bi-check-circle-fill', error: 'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill'
  }[notification.type] || 'bi-info-circle-fill';
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      role="status" aria-live="polite"
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        background: T.white, borderRadius: 14, boxShadow: T.shadowXl,
        border: `1px solid ${T.line}`, borderLeft: `4px solid ${tone}`,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 380
      }}
    >
      <i className={`bi ${icon}`} style={{ color: tone, fontSize: 16 }} />
      <div style={{ flex: 1, fontSize: 13.5, color: T.ink }}>{notification.message}</div>
      <button onClick={onClose} aria-label="Fermer"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.inkFaint }}>×</button>
    </motion.div>
  );
};

// =============================================================================
// CHARGEMENT / REFUS
// =============================================================================
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, margin: '0 auto 20px',
        border: `4px solid ${T.primarySoft}`, borderTopColor: T.primary,
        borderRadius: '50%', animation: 'apa-spin 0.9s linear infinite'
      }} />
      <p style={{ color: T.inkMuted, fontSize: 14 }}>Chargement de votre espace…</p>
    </div>
  </div>
);

const AccessDenied = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.ink
  }}>
    <div style={{ textAlign: 'center', color: T.white, maxWidth: 420, padding: 32 }}>
      <div style={{
        width: 80, height: 80, margin: '0 auto 24px',
        background: `${T.danger}20`, border: `2px solid ${T.danger}50`,
        borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38
      }}>
        <i className="bi bi-shield-lock" style={{ color: T.danger }} />
      </div>
      <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 700 }}>Accès restreint</h2>
      <p style={{ opacity: 0.8, marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
        Veuillez vous connecter pour accéder à votre espace APA.
      </p>
      <Button icon="bi-box-arrow-in-right" onClick={() => window.location.href = '/login'}>
        Se connecter
      </Button>
    </div>
  </div>
);

export default DashboardClient;