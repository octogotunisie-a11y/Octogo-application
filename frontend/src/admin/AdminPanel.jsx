// frontend/src/admin/AdminPanel.jsx
// -----------------------------------------------------------------------------
// Panneau Admin — version minimale et robuste.
// Chaque section retourne TOUJOURS du contenu affichable.
// Ne dépend que de workflow/useWorkflow.js.
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Generateur } from '../workflow/useWorkflow';
import { seedDemo } from '../workflow/seedDemo';

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

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================
export function AdminPanel({ section, setSection, workflow, notify }) {
  const { etat, chargerDemo } = workflow;
  const [users, setUsers] = useState([]);
  const [entrepriseOuverte, setEntrepriseOuverte] = useState(null);
  const [formationOuverte, setFormationOuverte] = useState(null);

  const rechargerUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error('fetchUsers:', e);
    }
  }, []);

  useEffect(() => { rechargerUsers(); }, [rechargerUsers]);

  const onChargerDemo = () => {
    if (users.length === 0) {
      if (notify) notify('error', 'Aucun utilisateur chargé depuis /api/users.');
      return;
    }
    chargerDemo(users, seedDemo);
    if (notify) notify('success', 'Démo chargée.');
  };

  // ------------------------------ Fiche entreprise
  if (entrepriseOuverte) {
    const entreprise = etat.entreprises.find(e => e.id === entrepriseOuverte);
    if (!entreprise) {
      setEntrepriseOuverte(null);
      return null;
    }
    return (
      <FicheEntreprise
        entreprise={entreprise}
        workflow={workflow}
        users={users}
        notify={notify}
        onRetour={() => setEntrepriseOuverte(null)}
        onOpenFormation={(id) => { setEntrepriseOuverte(null); setFormationOuverte(id); }}
        onNavigateFormations={() => { setEntrepriseOuverte(null); setSection('formations'); }}
      />
    );
  }

  // ------------------------------ Fiche formation
  if (formationOuverte) {
    const formation = etat.formations.find(f => f.id === formationOuverte);
    if (!formation) {
      setFormationOuverte(null);
      return null;
    }
    return (
      <FicheFormation
        formation={formation}
        workflow={workflow}
        users={users}
        notify={notify}
        onRetour={() => setFormationOuverte(null)}
      />
    );
  }

  // ------------------------------ Sections
  const renderSection = () => {
    switch (section) {
      case 'apercu':
        return (
          <Apercu
            etat={etat}
            users={users}
            onOpenEntreprise={setEntrepriseOuverte}
            onOpenFormation={setFormationOuverte}
            setSection={setSection}
            onChargerDemo={onChargerDemo}
          />
        );

      case 'entreprises':
        return (
          <Entreprises
            etat={etat}
            workflow={workflow}
            users={users}
            notify={notify}
            onOpen={setEntrepriseOuverte}
            onReload={rechargerUsers}
          />
        );

      case 'formations':
        return (
          <Formations
            etat={etat}
            workflow={workflow}
            users={users}
            notify={notify}
            onOpen={setFormationOuverte}
          />
        );

      case 'reponses':
        return <ReponsesSection etat={etat} users={users} />;

      case 'feedbacks':
        return <FeedbacksSection etat={etat} workflow={workflow} notify={notify} />;

      case 'parametres':
        return (
          <Parametres
            etat={etat}
            users={users}
            onChargerDemo={onChargerDemo}
            onReinitialiser={workflow.reinitialiser}
            onReload={rechargerUsers}
            notify={notify}
          />
        );

      default:
        return (
          <Apercu
            etat={etat}
            users={users}
            onOpenEntreprise={setEntrepriseOuverte}
            onOpenFormation={setFormationOuverte}
            setSection={setSection}
            onChargerDemo={onChargerDemo}
          />
        );
    }
  };

  return renderSection();
}

// =============================================================================
// APERÇU
// =============================================================================
function Apercu({ etat, users, onOpenEntreprise, onOpenFormation, setSection, onChargerDemo }) {
  const kpis = useMemo(() => ({
    entreprises: etat.entreprises.length,
    formations: etat.formations.length,
    contenus: etat.contenus.length,
    reponses: etat.reponses.length,
    feedbacks: etat.feedbacks.length,
    feedbacksNouveaux: etat.feedbacks.filter(f => f.statut === 'nouveau').length
  }), [etat]);

  return (
    <div>
      <SectionTitle icon="bi-speedometer2" title="Vue d'ensemble"
        subtitle="Synthèse de votre activité." />

      <ContextBanner tone="guide">
        Créez vos entreprises, rattachez-y vos clients, puis créez des formations.
        Utilisateurs chargés : <strong>{users.length}</strong>.
      </ContextBanner>

      {kpis.entreprises === 0 && (
        <ContextBanner tone="warning">
          <strong>Aucune entreprise pour l'instant.</strong> Deux options :
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Button icon="bi-magic" onClick={onChargerDemo} disabled={users.length === 0}>
              Charger la démo
            </Button>
            <Button variant="secondary" icon="bi-plus-lg" onClick={() => setSection('entreprises')}>
              Créer une entreprise
            </Button>
          </div>
        </ContextBanner>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <KpiCard icon="bi-building" label="Entreprises" value={kpis.entreprises}
          sub="créées" onClick={() => setSection('entreprises')} />
        <KpiCard icon="bi-mortarboard" label="Formations" value={kpis.formations}
          sub="créées" onClick={() => setSection('formations')} />
        <KpiCard icon="bi-files" label="Contenus" value={kpis.contenus}
          sub="générés" onClick={() => setSection('formations')} />
        <KpiCard icon="bi-clipboard-check" label="Réponses" value={kpis.reponses}
          sub="soumises" onClick={() => setSection('reponses')} />
        <KpiCard icon="bi-chat-square-text" label="Feedbacks" value={kpis.feedbacks}
          sub={`${kpis.feedbacksNouveaux} nouveau(x)`}
          tone={kpis.feedbacksNouveaux > 0 ? T.warning : T.ink}
          onClick={() => setSection('feedbacks')} />
      </div>

      {etat.entreprises.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: T.ink }}>
            <i className="bi bi-building" style={{ color: T.primary, marginRight: 8 }} />
            Entreprises
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {etat.entreprises.map(e => {
              const forms = etat.formations.filter(f => f.entrepriseId === e.id);
              return (
                <motion.button key={e.id} whileHover={{ y: -3, boxShadow: T.shadowLg }}
                  onClick={() => onOpenEntreprise(e.id)}
                  style={{
                    background: T.white, border: `1px solid ${T.line}`,
                    borderRadius: 14, padding: 18, cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit', boxShadow: T.shadowSm
                  }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{e.nom}</div>
                  <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 4 }}>
                    {e.utilisateurs?.length || 0} client(s) · {forms.length} formation(s)
                  </div>
                </motion.button>
              );
            })}
          </div>
        </Card>
      )}

      {etat.formations.length > 0 && (
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: T.ink }}>
            <i className="bi bi-mortarboard" style={{ color: T.primary, marginRight: 8 }} />
            Formations récentes
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {etat.formations.slice(0, 6).map(f => {
              const ent = etat.entreprises.find(x => x.id === f.entrepriseId);
              return (
                <button key={f.id} onClick={() => onOpenFormation(f.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: T.bgSunken, border: 'none',
                    borderRadius: 12, padding: 12, cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit'
                  }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: T.primarySoft, color: T.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="bi bi-mortarboard" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: T.ink, fontSize: 13.5 }}>{f.titre}</div>
                    <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 2 }}>
                      {ent?.nom || '—'}
                    </div>
                  </div>
                  <Badge tone={statutTone(f.statut)}>{statutLabel(f.statut)}</Badge>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// ENTREPRISES
// =============================================================================
function Entreprises({ etat, workflow, users, notify, onOpen, onReload }) {
  const [q, setQ] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtrees = etat.entreprises.filter(e =>
    !q || e.nom.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <SectionTitle icon="bi-building" title="Entreprises"
        subtitle={`${etat.entreprises.length} entreprise(s)`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" icon="bi-arrow-clockwise" onClick={onReload}>
              Recharger clients
            </Button>
            <Button icon="bi-plus-lg" onClick={() => setShowCreate(true)}>
              Créer une entreprise
            </Button>
          </div>
        } />

      <ContextBanner tone="guide">
        Créez vos entreprises, puis rattachez-y vos clients existants ({users.length} disponibles).
      </ContextBanner>

      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
        <i className="bi bi-search" style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: T.inkFaint, pointerEvents: 'none'
        }} />
        <input type="search" placeholder="Rechercher…" value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px 10px 36px',
            border: `1px solid ${T.line}`, borderRadius: 10,
            fontSize: 13.5, outline: 'none',
            boxSizing: 'border-box', fontFamily: 'inherit'
          }} />
      </div>

      {filtrees.length === 0 ? (
        <Empty icon="bi-building" title="Aucune entreprise"
          texte="Cliquez sur « Créer une entreprise » pour commencer."
          action={<Button icon="bi-plus-lg" onClick={() => setShowCreate(true)}>
            Créer une entreprise
          </Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtrees.map(e => {
            const forms = etat.formations.filter(f => f.entrepriseId === e.id);
            return (
              <motion.button key={e.id} whileHover={{ y: -3, boxShadow: T.shadowLg }}
                onClick={() => onOpen(e.id)}
                style={{
                  background: T.white, border: `1px solid ${T.line}`,
                  borderRadius: 16, padding: 20, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', boxShadow: T.shadowSm
                }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: T.primarySoft, color: T.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginBottom: 12
                }}>
                  <i className="bi bi-building" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{e.nom}</div>
                {e.secteur && (
                  <div style={{ fontSize: 12.5, color: T.inkMuted, marginTop: 4 }}>
                    {e.secteur}
                  </div>
                )}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
                  marginTop: 16, paddingTop: 14,
                  borderTop: `1px solid ${T.lineSoft}`
                }}>
                  <Mini label="Clients" value={e.utilisateurs?.length || 0} />
                  <Mini label="Formations" value={forms.length} />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {showCreate && (
        <EntrepriseModal
          onClose={() => setShowCreate(false)}
          onCreate={(data) => {
            const id = workflow.creerEntreprise(data);
            setShowCreate(false);
            if (notify) notify('success', `Entreprise « ${data.nom} » créée.`);
            if (id) onOpen(id);
          }}
        />
      )}
    </div>
  );
}

function EntrepriseModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ nom: '', secteur: '', ville: '', contactEmail: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <ModalShell onClose={onClose} width={520}>
      <ModalHeader title="Créer une entreprise" onClose={onClose} />
      <form onSubmit={(e) => { e.preventDefault(); if (form.nom.trim()) onCreate(form); }}
        style={{ padding: 24 }}>
        <Field label="Nom de l'entreprise" required>
          <Input value={form.nom} onChange={(e) => set('nom', e.target.value)}
            placeholder="Ex. ACME Industries" autoFocus />
        </Field>
        <Field label="Secteur">
          <Input value={form.secteur} onChange={(e) => set('secteur', e.target.value)}
            placeholder="Ex. Industrie" />
        </Field>
        <Field label="Ville">
          <Input value={form.ville} onChange={(e) => set('ville', e.target.value)}
            placeholder="Ex. Tunis" />
        </Field>
        <Field label="Email de contact">
          <Input type="email" value={form.contactEmail}
            onChange={(e) => set('contactEmail', e.target.value)} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" icon="bi-check-lg" disabled={!form.nom.trim()}>
            Créer
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

// =============================================================================
// FICHE ENTREPRISE
// =============================================================================
function FicheEntreprise({ entreprise, workflow, users, notify, onRetour, onOpenFormation, onNavigateFormations }) {
  const [showRattacher, setShowRattacher] = useState(false);

  const clientsRattaches = users.filter(u =>
    entreprise.utilisateurs?.includes(u.id)
  );
  const clientsDisponibles = users.filter(u =>
    u.role !== 'admin' && !entreprise.utilisateurs?.includes(u.id)
  );
  const formations = (workflow.etat.formations || []).filter(f => f.entrepriseId === entreprise.id);

  return (
    <div>
      <button onClick={onRetour} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', color: T.primaryLight,
        cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
        padding: 0, marginBottom: 16, fontFamily: 'inherit'
      }}>
        <i className="bi bi-chevron-left" /> Retour
      </button>

      <SectionTitle icon="bi-building" title={entreprise.nom}
        subtitle={[entreprise.secteur, entreprise.ville].filter(Boolean).join(' · ') || 'Entreprise cliente'} />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>
            <i className="bi bi-people" style={{ color: T.primary, marginRight: 8 }} />
            Clients rattachés ({clientsRattaches.length})
          </h3>
          <Button icon="bi-person-plus" onClick={() => setShowRattacher(true)}
            disabled={clientsDisponibles.length === 0}>
            Rattacher un client
          </Button>
        </div>

        {clientsRattaches.length === 0 ? (
          <Empty icon="bi-people" title="Aucun client rattaché"
            texte={clientsDisponibles.length > 0
              ? "Rattachez des clients existants."
              : "Tous les clients sont déjà rattachés ou aucun client n'existe."} />
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {clientsRattaches.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: T.bgSunken, borderRadius: 12, padding: 12
              }}>
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1E3A8A&color=fff`}
                  alt={u.name}
                  style={{ width: 36, height: 36, borderRadius: 10 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: T.ink, fontSize: 13.5 }}>{u.name}</div>
                  <div style={{ fontSize: 11.5, color: T.inkMuted }}>{u.email}</div>
                </div>
                <button onClick={() => {
                  if (window.confirm(`Détacher ${u.name} ?`)) {
                    workflow.detacherClient(entreprise.id, u.id);
                    if (notify) notify('success', 'Client détaché.');
                  }
                }} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: T.danger, padding: 4
                }}>
                  <i className="bi bi-x-circle" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>
            <i className="bi bi-mortarboard" style={{ color: T.primary, marginRight: 8 }} />
            Formations ({formations.length})
          </h3>
          <Button variant="secondary" icon="bi-plus-lg" onClick={onNavigateFormations}>
            Créer une formation
          </Button>
        </div>

        {formations.length === 0 ? (
          <Empty icon="bi-mortarboard" title="Aucune formation"
            texte="Aucune formation n'a encore été créée pour cette entreprise." />
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {formations.map(f => (
              <button key={f.id} onClick={() => onOpenFormation(f.id)}
                style={{
                  background: T.white, border: `1px solid ${T.line}`,
                  borderRadius: 14, padding: 16, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', boxShadow: T.shadowSm
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: T.ink, fontSize: 14.5 }}>{f.titre}</div>
                    <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 3 }}>
                      {f.theme} · {f.participants} participants
                    </div>
                  </div>
                  <Badge tone={statutTone(f.statut)}>{statutLabel(f.statut)}</Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {showRattacher && (
        <RattacherModal
          entreprise={entreprise}
          clientsDisponibles={clientsDisponibles}
          onClose={() => setShowRattacher(false)}
          onRattacher={(userId) => {
            workflow.rattacherClient(entreprise.id, userId);
            if (notify) notify('success', 'Client rattaché.');
          }}
        />
      )}
    </div>
  );
}

function RattacherModal({ entreprise, clientsDisponibles, onClose, onRattacher }) {
  const [selection, setSelection] = useState([]);
  const toggle = (id) => setSelection(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  return (
    <ModalShell onClose={onClose} width={520}>
      <ModalHeader title={`Rattacher des clients à ${entreprise.nom}`} onClose={onClose} />
      <div style={{ padding: 24, maxHeight: '60vh', overflowY: 'auto' }}>
        {clientsDisponibles.length === 0 ? (
          <Empty icon="bi-people" title="Aucun client disponible"
            texte="Tous les clients sont déjà rattachés." />
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {clientsDisponibles.map(u => (
              <label key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 12, borderRadius: 10,
                background: selection.includes(u.id) ? T.primarySoft : T.bgSunken,
                border: `1px solid ${selection.includes(u.id) ? T.primary : 'transparent'}`,
                cursor: 'pointer'
              }}>
                <input type="checkbox" checked={selection.includes(u.id)}
                  onChange={() => toggle(u.id)}
                  style={{ accentColor: T.primary }} />
                <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1E3A8A&color=fff`}
                  alt={u.name}
                  style={{ width: 36, height: 36, borderRadius: 10 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: T.ink, fontSize: 13.5 }}>{u.name}</div>
                  <div style={{ fontSize: 11.5, color: T.inkMuted }}>{u.email}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.lineSoft}`, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="secondary" onClick={onClose}>Annuler</Button>
        <Button icon="bi-check-lg" disabled={selection.length === 0}
          onClick={() => {
            selection.forEach(id => onRattacher(id));
            onClose();
          }}>
          Rattacher ({selection.length})
        </Button>
      </div>
    </ModalShell>
  );
}

// =============================================================================
// FORMATIONS
// =============================================================================
function Formations({ etat, workflow, users, notify, onOpen }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <SectionTitle icon="bi-mortarboard" title="Formations"
        subtitle={`${etat.formations.length} formation(s)`}
        action={<Button icon="bi-plus-lg" onClick={() => setShowCreate(true)}
          disabled={etat.entreprises.length === 0}>
          Créer une formation
        </Button>} />

      <ContextBanner tone="guide">
        Chaque formation est rattachée à une entreprise et apparaîtra dans l'espace des clients rattachés.
      </ContextBanner>

      {etat.entreprises.length === 0 ? (
        <Empty icon="bi-building" title="Créez d'abord une entreprise"
          texte="Vous devez créer une entreprise avant de pouvoir créer une formation." />
      ) : etat.formations.length === 0 ? (
        <Empty icon="bi-mortarboard" title="Aucune formation"
          texte="Cliquez sur « Créer une formation » pour commencer."
          action={<Button icon="bi-plus-lg" onClick={() => setShowCreate(true)}>
            Créer une formation
          </Button>} />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {etat.formations.map(f => {
            const ent = etat.entreprises.find(x => x.id === f.entrepriseId);
            return (
              <motion.button key={f.id} whileHover={{ y: -2 }}
                onClick={() => onOpen(f.id)}
                style={{
                  background: T.white, border: `1px solid ${T.line}`,
                  borderRadius: 16, padding: 20, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', boxShadow: T.shadowSm
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>{f.titre}</div>
                    <div style={{ fontSize: 12.5, color: T.inkMuted, marginTop: 3 }}>
                      {ent?.nom || '—'} · {f.theme}
                    </div>
                  </div>
                  <Badge tone={statutTone(f.statut)}>{statutLabel(f.statut)}</Badge>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {showCreate && (
        <FormationModal
          etat={etat} workflow={workflow} notify={notify}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => { setShowCreate(false); onOpen(id); }}
        />
      )}
    </div>
  );
}

function FormationModal({ etat, workflow, notify, onClose, onCreated }) {
  const [form, setForm] = useState({
    entrepriseId: etat.entreprises[0]?.id || '',
    titre: '', theme: '', dateDebut: '', dateFin: '',
    objectifs: '', participants: '', niveau: 'Intermédiaire'
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.entrepriseId || !form.titre || !form.theme) {
      if (notify) notify('error', 'Entreprise, titre et thème sont obligatoires.');
      return;
    }
    const id = workflow.creerFormation({
      ...form,
      participants: parseInt(form.participants) || 0
    });
    if (notify) notify('success', 'Formation créée.');
    if (id) onCreated(id);
  };

  return (
    <ModalShell onClose={onClose} width={620}>
      <ModalHeader title="Créer une formation" onClose={onClose} />
      <form onSubmit={submit} style={{ padding: 24, maxHeight: '70vh', overflowY: 'auto' }}>
        <Field label="Entreprise" required>
          <Select value={form.entrepriseId} onChange={(e) => set('entrepriseId', e.target.value)}>
            {etat.entreprises.map(e => (
              <option key={e.id} value={e.id}>{e.nom}</option>
            ))}
          </Select>
        </Field>
        <Field label="Titre" required>
          <Input value={form.titre} onChange={(e) => set('titre', e.target.value)}
            placeholder="Ex. Intelligence émotionnelle collective" />
        </Field>
        <Field label="Thème" required>
          <Input value={form.theme} onChange={(e) => set('theme', e.target.value)}
            placeholder="Ex. Leadership conscient" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Date début">
            <Input type="date" value={form.dateDebut}
              onChange={(e) => set('dateDebut', e.target.value)} />
          </Field>
          <Field label="Date fin">
            <Input type="date" value={form.dateFin}
              onChange={(e) => set('dateFin', e.target.value)} />
          </Field>
        </div>
        <Field label="Objectifs">
          <Textarea rows={3} value={form.objectifs}
            onChange={(e) => set('objectifs', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Participants">
            <Input type="number" min={0} value={form.participants}
              onChange={(e) => set('participants', e.target.value)} />
          </Field>
          <Field label="Niveau">
            <Select value={form.niveau} onChange={(e) => set('niveau', e.target.value)}>
              <option>Débutant</option>
              <option>Intermédiaire</option>
              <option>Avancé</option>
            </Select>
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" icon="bi-check-lg">Créer</Button>
        </div>
      </form>
    </ModalShell>
  );
}

// =============================================================================
// FICHE FORMATION
// =============================================================================
function FicheFormation({ formation, workflow, users, notify, onRetour }) {
  const { etat } = workflow;
  const entreprise = etat.entreprises.find(e => e.id === formation.entrepriseId);
  const contenus = etat.contenus.filter(c => c.formationId === formation.id);
  const reponses = etat.reponses.filter(r => r.formationId === formation.id);
  const resultats = etat.resultats.filter(r => r.formationId === formation.id);

  const [selectionEnvoi, setSelectionEnvoi] = useState([]);
  const [busy, setBusy] = useState(false);

  const genererContenu = async (type) => {
    setBusy(true);
    await new Promise(r => setTimeout(r, 500));

    let contenu = null;
    if (type === 'test_pre') contenu = Generateur.testPre(formation);
    else if (type === 'test_post') contenu = Generateur.testPost(formation);
    else if (type === 'cahier') contenu = Generateur.cahierParticipant(formation);
    else if (type === 'questionnaire') contenu = Generateur.questionnaireEvaluation(formation);

    if (contenu) {
      workflow.ajouterContenu({ formationId: formation.id, ...contenu });
      if (notify) notify('success', `« ${contenu.titre} » généré.`);
    }
    setBusy(false);
  };

  const envoyerSelection = () => {
    if (selectionEnvoi.length === 0) {
      if (notify) notify('error', 'Sélectionnez au moins un contenu.');
      return;
    }
    workflow.envoyerAuClient(formation.id, selectionEnvoi);
    if (notify) notify('success', `Envoi effectué (${selectionEnvoi.length}).`);
    setSelectionEnvoi([]);
  };

  const publierRapport = () => {
    const rapport = Generateur.rapport(formation, reponses);
    workflow.publierResultat({
      formationId: formation.id,
      rapport,
      kpis: rapport.kpis,
      recommandations: rapport.recommandations
    });
    if (notify) notify('success', 'Résultats publiés.');
  };

  return (
    <div>
      <button onClick={onRetour} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', color: T.primaryLight,
        cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
        padding: 0, marginBottom: 16, fontFamily: 'inherit'
      }}>
        <i className="bi bi-chevron-left" /> Retour
      </button>

      <SectionTitle icon="bi-mortarboard" title={formation.titre}
        subtitle={`${entreprise?.nom || '—'} · ${formation.theme}`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KpiCard icon="bi-people" label="Participants" value={formation.participants} />
        <KpiCard icon="bi-files" label="Contenus" value={contenus.length} />
        <KpiCard icon="bi-clipboard-check" label="Réponses" value={reponses.length} />
        <KpiCard icon="bi-file-bar-graph" label="Rapports" value={resultats.length} />
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Statut
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge tone={statutTone(formation.statut)}>{statutLabel(formation.statut)}</Badge>
            </div>
          </div>
          {resultats.length === 0 && reponses.length > 0 && (
            <Button icon="bi-file-bar-graph" onClick={publierRapport}>
              Publier les résultats
            </Button>
          )}
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: T.ink }}>
          <i className="bi bi-stars" style={{ color: T.primary, marginRight: 8 }} />
          Générer des contenus
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          <Button variant="secondary" onClick={() => genererContenu('test_pre')} disabled={busy}>
            Prétest
          </Button>
          <Button variant="secondary" onClick={() => genererContenu('test_post')} disabled={busy}>
            Post-test
          </Button>
          <Button variant="secondary" onClick={() => genererContenu('cahier')} disabled={busy}>
            Cahier
          </Button>
          <Button variant="secondary" onClick={() => genererContenu('questionnaire')} disabled={busy}>
            Questionnaire
          </Button>
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.ink }}>
            Contenus ({contenus.length})
          </h3>
          {selectionEnvoi.length > 0 && (
            <Button icon="bi-send" onClick={envoyerSelection}>
              Envoyer ({selectionEnvoi.length})
            </Button>
          )}
        </div>

        {contenus.length === 0 ? (
          <Empty icon="bi-files" title="Aucun contenu" texte="Générez un contenu ci-dessus." />
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {contenus.map(c => {
              const dejaEnvoye = c.statut === 'envoye' || c.statut === 'consulte';
              const selectionne = selectionEnvoi.includes(c.id);
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: dejaEnvoye ? T.successSoft : T.bgSunken,
                  border: `1px solid ${selectionne ? T.primary : 'transparent'}`,
                  borderRadius: 12, padding: 12
                }}>
                  {!dejaEnvoye && (
                    <input type="checkbox" checked={selectionne}
                      onChange={() => setSelectionEnvoi(prev =>
                        prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                      )}
                      style={{ accentColor: T.primary }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: T.ink, fontSize: 13.5 }}>{c.titre}</div>
                    <div style={{ fontSize: 11.5, color: T.inkMuted }}>{c.type}</div>
                  </div>
                  <Badge tone={dejaEnvoye ? 'success' : 'neutral'}>
                    {dejaEnvoye ? 'Envoyé' : 'Brouillon'}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {reponses.length > 0 && (
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: T.ink }}>
            Réponses ({reponses.length})
          </h3>
          <ReponsesTable reponses={reponses} users={users} />
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// RÉPONSES
// =============================================================================
function ReponsesSection({ etat, users }) {
  const formations = etat.formations.filter(f =>
    etat.reponses.some(r => r.formationId === f.id)
  );

  return (
    <div>
      <SectionTitle icon="bi-clipboard-check" title="Réponses"
        subtitle={`${etat.reponses.length} réponse(s)`} />
      {formations.length === 0 ? (
        <Empty icon="bi-clipboard-check" title="Aucune réponse"
          texte="Aucune réponse n'a encore été soumise." />
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {formations.map(f => {
            const reponses = etat.reponses.filter(r => r.formationId === f.id);
            return (
              <Card key={f.id}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>{f.titre}</div>
                  <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 3 }}>
                    {reponses.length} réponse(s)
                  </div>
                </div>
                <ReponsesTable reponses={reponses} users={users} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReponsesTable({ reponses, users }) {
  const parParticipant = useMemo(() => {
    const map = new Map();
    for (const r of reponses) {
      if (!map.has(r.participantId)) map.set(r.participantId, { id: r.participantId, pre: null, post: null });
      map.get(r.participantId)[r.type] = r;
    }
    return [...map.values()];
  }, [reponses]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Participant', 'Prétest', 'Post-test', 'Écart'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '8px 10px',
                color: T.inkMuted, fontWeight: 600,
                fontSize: 11.5, textTransform: 'uppercase',
                letterSpacing: '0.04em', borderBottom: `1px solid ${T.line}`
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parParticipant.map(p => {
            const user = users.find(u => u.id === p.id);
            const pre = p.pre?.score ?? null;
            const post = p.post?.score ?? null;
            const ecart = (pre != null && post != null) ? post - pre : null;
            return (
              <tr key={p.id} style={{ borderTop: `1px solid ${T.lineSoft}` }}>
                <td style={{ padding: '8px 10px', color: T.ink, fontWeight: 600 }}>
                  {user?.name || `Participant ${p.id}`}
                </td>
                <td style={{ padding: '8px 10px', color: pre != null ? T.ink : T.inkFaint }}>
                  {pre != null ? `${pre}/100` : '—'}
                </td>
                <td style={{ padding: '8px 10px', color: post != null ? T.ink : T.inkFaint }}>
                  {post != null ? `${post}/100` : '—'}
                </td>
                <td style={{ padding: '8px 10px', color: ecart != null ? (ecart > 0 ? T.success : ecart < 0 ? T.danger : T.inkMuted) : T.inkFaint, fontWeight: 600 }}>
                  {ecart != null ? `${ecart > 0 ? '+' : ''}${ecart}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// FEEDBACKS
// =============================================================================
function FeedbacksSection({ etat, workflow, notify }) {
  const [filtre, setFiltre] = useState('tous');
  const filtres = etat.feedbacks.filter(f =>
    filtre === 'tous' || f.statut === filtre
  );

  return (
    <div>
      <SectionTitle icon="bi-chat-square-text" title="Feedbacks"
        subtitle={`${etat.feedbacks.length} feedback(s)`} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <FilterPill active={filtre === 'tous'} onClick={() => setFiltre('tous')}>Tous</FilterPill>
        <FilterPill active={filtre === 'nouveau'} onClick={() => setFiltre('nouveau')}>Nouveaux</FilterPill>
        <FilterPill active={filtre === 'traite'} onClick={() => setFiltre('traite')}>Traités</FilterPill>
      </div>

      {filtres.length === 0 ? (
        <Empty icon="bi-chat-square-text" title="Aucun feedback"
          texte="Aucun feedback reçu." />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtres.map(f => {
            const formation = etat.formations.find(x => x.id === f.formationId);
            return (
              <Card key={f.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.ink, fontSize: 14 }}>
                      {formation?.titre || 'Formation'}
                    </div>
                    <div style={{ fontSize: 12, color: T.inkMuted, marginTop: 2 }}>
                      {new Date(f.envoyeLe).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <Badge tone="primary">Note : {f.note}/5</Badge>
                </div>
                {f.commentaire && (
                  <div style={{ padding: 10, background: T.bgSunken, borderRadius: 10, fontSize: 13, color: T.inkSoft, marginBottom: 10 }}>
                    {f.commentaire}
                  </div>
                )}
                {f.reponseAdmin && (
                  <div style={{ padding: 10, background: T.successSoft, borderRadius: 10, fontSize: 13, color: '#065F46', marginBottom: 10 }}>
                    <strong>Réponse :</strong> {f.reponseAdmin}
                  </div>
                )}
                <FeedbackActions feedback={f} workflow={workflow} notify={notify} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeedbackActions({ feedback, workflow, notify }) {
  const [reponse, setReponse] = useState(feedback.reponseAdmin || '');
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" icon="bi-reply" onClick={() => setOpen(true)}>
        {feedback.reponseAdmin ? 'Modifier' : 'Répondre'}
      </Button>
    );
  }

  return (
    <div>
      <Textarea rows={3} value={reponse} onChange={(e) => setReponse(e.target.value)}
        placeholder="Réponse au client…" />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
        <Button icon="bi-send" onClick={() => {
          workflow.traiterFeedback(feedback.id, { statut: 'traite', reponseAdmin: reponse });
          if (notify) notify('success', 'Réponse envoyée.');
          setOpen(false);
        }}>Envoyer</Button>
      </div>
    </div>
  );
}

// =============================================================================
// PARAMÈTRES
// =============================================================================
function Parametres({ etat, users, onChargerDemo, onReinitialiser, onReload, notify }) {
  return (
    <div>
      <SectionTitle icon="bi-gear" title="Paramètres" />

      <ContextBanner tone="warning">
        Mode démonstration — les données sont en <code>localStorage</code>.
      </ContextBanner>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: T.ink }}>
          Source utilisateurs
        </h3>
        <div style={{ fontSize: 13.5, color: T.inkSoft, marginBottom: 10 }}>
          <strong>{users.length}</strong> utilisateur(s) chargé(s).
        </div>
        <Button variant="secondary" icon="bi-arrow-clockwise" onClick={onReload}>
          Recharger
        </Button>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: T.ink }}>
          Charger la démo
        </h3>
        <div style={{ fontSize: 13.5, color: T.inkSoft, marginBottom: 10 }}>
          Crée une entreprise + rattache les clients + crée une formation avec tests et réponses.
        </div>
        <Button icon="bi-magic" onClick={onChargerDemo}>Charger la démo</Button>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: T.ink }}>
          Réinitialiser
        </h3>
        <div style={{ fontSize: 13.5, color: T.inkSoft, marginBottom: 10 }}>
          Efface toutes les données du workflow. Vos utilisateurs ne sont pas affectés.
        </div>
        <Button variant="secondary" icon="bi-trash" onClick={() => {
          if (window.confirm('Réinitialiser toutes les données ?')) {
            onReinitialiser();
            if (notify) notify('success', 'Réinitialisé.');
          }
        }}>
          Réinitialiser
        </Button>
      </Card>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================
function statutTone(s) {
  if (s === 'terminee') return 'success';
  if (s === 'envoyee') return 'info';
  if (s === 'prete') return 'warning';
  if (s === 'en_cours') return 'primary';
  return 'neutral';
}
function statutLabel(s) {
  return { brouillon: 'Brouillon', prete: 'Prête', envoyee: 'Envoyée', en_cours: 'En cours', terminee: 'Terminée' }[s] || 'Brouillon';
}

// =============================================================================
// PRIMITIVES UI
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
      {subtitle && <p style={{ margin: '5px 0 0', color: T.inkMuted, fontSize: 13.5 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.white, border: `1px solid ${T.line}`,
    borderRadius: 16, padding: 20, boxShadow: T.shadowSm, ...style
  }}>{children}</div>
);

const Button = ({ children, variant = 'primary', icon, disabled, onClick, type = 'button' }) => {
  const variants = {
    primary:   { bg: T.primaryGradient, fg: T.white, border: 'none' },
    secondary: { bg: T.white, fg: T.inkSoft, border: `1.5px solid ${T.line}` }
  };
  const v = variants[variant] || variants.primary;
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type={type}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '10px 18px', borderRadius: 12,
        background: v.bg, color: v.fg, border: v.border,
        fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1
      }}
    >
      {icon && <i className={`bi ${icon}`} style={{ fontSize: 15 }} />}
      <span>{children}</span>
    </motion.button>
  );
};

const KpiCard = ({ icon, label, value, sub, tone, onClick }) => (
  <motion.div
    whileHover={onClick ? { y: -2, boxShadow: T.shadowLg } : undefined}
    onClick={onClick}
    style={{
      background: T.white, border: `1px solid ${T.line}`,
      borderRadius: 14, padding: 16,
      cursor: onClick ? 'pointer' : 'default', boxShadow: T.shadowSm
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: `${tone || T.primary}18`, color: tone || T.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
      }}>
        <i className={`bi ${icon}`} />
      </div>
      <div style={{ fontSize: 11.5, color: T.inkMuted, fontWeight: 600 }}>{label}</div>
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color: tone || T.ink, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>{sub}</div>}
  </motion.div>
);

const Mini = ({ label, value, color }) => (
  <div>
    <div style={{ fontSize: 11, color: T.inkMuted, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: color || T.ink, marginTop: 3 }}>{value}</div>
  </div>
);

const Badge = ({ tone = 'neutral', children }) => {
  const tones = {
    neutral: { bg: T.lineSoft, fg: T.inkSoft }, primary: { bg: T.primarySoft, fg: T.primary },
    success: { bg: T.successSoft, fg: T.success }, warning: { bg: T.warningSoft, fg: T.warning },
    danger:  { bg: T.dangerSoft, fg: T.danger }, info: { bg: T.infoSoft, fg: T.info }
  };
  const t = tones[tone] || tones.neutral;
  return <span style={{ display: 'inline-flex', alignItems: 'center', background: t.bg, color: t.fg, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>{children}</span>;
};

const ContextBanner = ({ tone = 'guide', children }) => {
  const tones = {
    guide:   { bg: T.bgSunken, border: T.line, icon: 'bi-info-circle', fg: T.inkSoft },
    success: { bg: T.successSoft, border: '#A7F3D0', icon: 'bi-check-circle-fill', fg: '#065F46' },
    warning: { bg: T.warningSoft, border: '#FDE68A', icon: 'bi-exclamation-triangle-fill', fg: '#92400E' },
    error:   { bg: T.dangerSoft, border: '#FECACA', icon: 'bi-x-circle-fill', fg: '#991B1B' }
  };
  const t = tones[tone] || tones.guide;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: t.bg, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '12px 14px',
      marginBottom: 16, fontSize: 13, color: t.fg, lineHeight: 1.55
    }}>
      <i className={`bi ${t.icon}`} style={{ fontSize: 15, marginTop: 1, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
};

const Empty = ({ icon = 'bi-inbox', title, texte, action }) => (
  <div style={{
    padding: 40, background: T.bgSunken,
    borderRadius: 16, border: `1px dashed ${T.line}`,
    textAlign: 'center'
  }}>
    <i className={`bi ${icon}`} style={{ fontSize: 32, color: T.inkFaint }} />
    {title && <h3 style={{ margin: '12px 0 6px', color: T.inkSoft, fontSize: 16 }}>{title}</h3>}
    {texte && <p style={{ color: T.inkMuted, fontSize: 13, maxWidth: 480, margin: '0 auto', lineHeight: 1.55 }}>{texte}</p>}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

const FilterPill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '7px 12px', borderRadius: 999,
    background: active ? T.primary : T.white,
    color: active ? T.white : T.inkSoft,
    border: `1px solid ${active ? T.primary : T.line}`,
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
  }}>{children}</button>
);

const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: T.inkSoft, fontSize: 13 }}>{label} {required && <span style={{ color: T.danger }}>*</span>}</label>}
    {children}
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
      onClick={(e) => e.stopPropagation()}
      style={{
        background: T.white, borderRadius: 20, maxWidth: width,
        width: '100%', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: T.shadowLg, overflow: 'hidden'
      }}
    >
      {children}
    </motion.div>
  </div>
);

const ModalHeader = ({ title, subtitle, onClose }) => (
  <div style={{
    padding: '20px 24px', borderBottom: `1px solid ${T.lineSoft}`,
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 16
  }}>
    <div style={{ minWidth: 0 }}>
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.ink }}>{title}</h3>
      {subtitle && <p style={{ margin: '4px 0 0', color: T.inkMuted, fontSize: 13 }}>{subtitle}</p>}
    </div>
    <button onClick={onClose} aria-label="Fermer"
      style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: T.inkMuted, padding: 4, fontSize: 16
      }}>
      <i className="bi bi-x-lg" />
    </button>
  </div>
);