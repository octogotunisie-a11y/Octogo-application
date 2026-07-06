// src/pages/CatalogueAdmin.jsx
// -----------------------------------------------------------------------------
// Interface d'ADMINISTRATION du module « Catalogue & Génération de Formation ».
// -----------------------------------------------------------------------------
// Permet à l'administrateur de gérer entièrement, depuis le tableau de bord, les
// données utilisées par la page client « Génération de Formation » :
//   • Formateurs      (nom, photo, bio, spécialité, domaines, tarifs, dispo)
//   • Formations      (titre, domaine, description, durée, objectifs, programme,
//                      frais annexes)
//   • Dates disponibles (créneaux : dates, formateurs, formation, lieu, statut)
//   • Tarification     (devise, TVA, tarif/jour, taille de groupe, majorations,
//                      remises volume, tarif par formation, frais)
//   • Propositions     (suivi des propositions générées par les clients)
//
// Toutes les opérations CRUD passent par catalogueAdmin (src/catalogueApi.js) qui
// appelle le backend /api/catalogue/admin/* (réservé au rôle 'admin' via JWT).
//
// Ce composant est volontairement autonome : il reçoit `colors`, `currentTheme`
// et `onNotify` du DashboardAdmin pour rester cohérent visuellement, sans dupli-
// quer la logique de thème.
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useCallback } from 'react';
import { catalogueAdmin } from '../catalogueApi';

// Sous-sections de l'onglet Catalogue.
const SECTIONS = [
  { id: 'formateurs',   label: 'Formateurs',        icon: 'bi-person-badge' },
  { id: 'formations',   label: 'Formations',        icon: 'bi-mortarboard' },
  { id: 'creneaux',     label: 'Dates disponibles', icon: 'bi-calendar-week' },
  { id: 'tarifs',       label: 'Tarification',      icon: 'bi-cash-coin' },
  { id: 'propositions', label: 'Propositions',      icon: 'bi-file-earmark-check' },
];

const MODALITES = ['Présentiel', 'Hybride', 'Distanciel'];

export default function CatalogueAdmin({ colors, currentTheme, onNotify }) {
  const notify = (type, msg) => { if (onNotify) onNotify(type, msg); };

  const [section, setSection] = useState('formateurs');
  const [loading, setLoading] = useState(true);
  const [formateurs, setFormateurs] = useState([]);
  const [formations, setFormations] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [tarifs, setTarifs] = useState({});
  const [propositions, setPropositions] = useState([]);

  // Élément en cours d'édition (null = aucun panneau ouvert).
  const [editing, setEditing] = useState(null); // { type, data, isNew }

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [f, fo, c, t, p] = await Promise.all([
        catalogueAdmin.listFormateurs().catch(() => []),
        catalogueAdmin.listFormations().catch(() => []),
        catalogueAdmin.listCreneaux().catch(() => []),
        catalogueAdmin.getTarifs().catch(() => ({})),
        catalogueAdmin.listPropositions().catch(() => []),
      ]);
      setFormateurs(f); setFormations(fo); setCreneaux(c); setTarifs(t || {}); setPropositions(p);
    } catch (e) {
      notify('error', 'Impossible de charger le catalogue. Vérifiez votre connexion / vos droits admin.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadAll(); }, [loadAll]);

  // ---- Styles dérivés du thème du dashboard ---------------------------------
  const cardStyle = {
    background: currentTheme.cardBg, border: `1px solid ${currentTheme.border}`,
    borderRadius: 16, padding: '1.25rem 1.5rem',
  };
  const inputStyle = {
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: 10, boxSizing: 'border-box',
    border: `1px solid ${currentTheme.border}`, background: currentTheme.background,
    color: currentTheme.text, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 5, color: currentTheme.text };
  const btn = (bg, fg = '#fff') => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.55rem 1rem', borderRadius: 10,
    border: 'none', background: bg, color: fg, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
  });
  const ghostBtn = {
    ...btn('transparent', currentTheme.text), border: `1px solid ${currentTheme.border}`,
  };
  const thStyle = {
    textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.72rem', textTransform: 'uppercase',
    letterSpacing: '0.04em', color: currentTheme.textSecondary, borderBottom: `1px solid ${currentTheme.border}`,
  };
  const tdStyle = { padding: '0.7rem 0.75rem', fontSize: '0.88rem', color: currentTheme.text, borderBottom: `1px solid ${currentTheme.border}`, verticalAlign: 'middle' };

  const devise = tarifs?.devise || 'DT';

  // Domaines connus (catégories de formations) : sert d'aide à la saisie.
  const domainesConnus = Array.from(new Set(formations.map((f) => f.categorie).filter(Boolean))).sort();
  const nomFormation = (id) => formations.find((f) => f.id === id)?.nom || '—';
  const nomFormateur = (id) => formateurs.find((f) => f.id === id)?.nom || id;

  // ================= ACTIONS CRUD =================
  const removeWithConfirm = async (label, fn) => {
    if (!window.confirm(`Supprimer ${label} ? Cette action est irréversible.`)) return;
    try { await fn(); notify('success', 'Suppression effectuée.'); loadAll(); }
    catch (e) { notify('error', e.message || 'Échec de la suppression.'); }
  };

  // =====================================================================
  //                       PANNEAU D'ÉDITION
  // =====================================================================
  const openNew = (type) => {
    const defaults = {
      formateur: { nom: '', specialite: '', bio: '', categories: [], tarifJour: 1200, tarifSession: 0, agrementCNFCPP: true, disponible: true, actif: true, email: '', telephone: '', photo: '' },
      formation: { nom: '', categorie: '', description: '', dureeJoursParDefaut: 2, objectifs: [], programmeDetaille: [], fraisAnnexes: [], actif: true },
      creneau: { dateDebut: '', dateFin: '', formateurIds: [], formationId: '', lieu: '', statut: 'disponible' },
    };
    setEditing({ type, isNew: true, data: { ...defaults[type] } });
  };
  const openEdit = (type, data) => setEditing({ type, isNew: false, data: { ...data } });
  const closePanel = () => setEditing(null);

  const saveEditing = async () => {
    const { type, isNew, data } = editing;
    try {
      if (type === 'formateur') {
        if (!data.nom?.trim()) return notify('warning', 'Le nom du formateur est requis.');
        const saved = isNew ? await catalogueAdmin.createFormateur(data) : await catalogueAdmin.updateFormateur(data.id, data);
        if (data._photoFile) { try { await catalogueAdmin.uploadPhoto(saved.id, data._photoFile); } catch (_) { notify('warning', 'Formateur enregistré, mais la photo n\'a pas pu être envoyée.'); } }
      } else if (type === 'formation') {
        if (!data.nom?.trim()) return notify('warning', 'Le titre de la formation est requis.');
        isNew ? await catalogueAdmin.createFormation(data) : await catalogueAdmin.updateFormation(data.id, data);
      } else if (type === 'creneau') {
        if (!data.dateDebut) return notify('warning', 'La date de début est requise.');
        const payload = { ...data, dateFin: data.dateFin || data.dateDebut };
        isNew ? await catalogueAdmin.createCreneau(payload) : await catalogueAdmin.updateCreneau(data.id, payload);
      }
      notify('success', isNew ? 'Élément créé avec succès.' : 'Modifications enregistrées.');
      closePanel(); loadAll();
    } catch (e) {
      notify('error', e.message || 'Échec de l\'enregistrement.');
    }
  };

  const setField = (k, v) => setEditing((p) => ({ ...p, data: { ...p.data, [k]: v } }));

  // =====================================================================
  //                             RENDU
  // =====================================================================
  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem', color: currentTheme.text, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <i className="bi bi-mortarboard" style={{ color: colors.primary }}></i>
        Catalogue de formation
      </h2>
      <p style={{ color: currentTheme.textSecondary, marginTop: 0, marginBottom: '1.5rem', fontSize: '0.92rem' }}>
        Gérez les données alimentant la page client « Génération de Formation ». Le prix est toujours recalculé côté serveur.
      </p>

      {/* Sous-navigation */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSection(s.id)}
            style={{
              ...btn(section === s.id ? colors.primary : 'transparent', section === s.id ? '#fff' : currentTheme.text),
              border: section === s.id ? 'none' : `1px solid ${currentTheme.border}`,
            }}>
            <i className={`bi ${s.icon}`}></i> {s.label}
            <span style={{
              background: section === s.id ? 'rgba(255,255,255,0.25)' : currentTheme.border,
              color: section === s.id ? '#fff' : currentTheme.textSecondary,
              borderRadius: 10, padding: '0 7px', fontSize: '0.72rem', fontWeight: 700,
            }}>
              {s.id === 'formateurs' ? formateurs.length : s.id === 'formations' ? formations.length
                : s.id === 'creneaux' ? creneaux.length : s.id === 'propositions' ? propositions.length : ''}
            </span>
          </button>
        ))}
        <button onClick={loadAll} style={{ ...ghostBtn, marginLeft: 'auto' }} title="Rafraîchir">
          <i className="bi bi-arrow-clockwise"></i> Rafraîchir
        </button>
      </div>

      {loading ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: currentTheme.textSecondary }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: '1.5rem' }}></i>
          <p style={{ margin: '0.5rem 0 0' }}>Chargement du catalogue…</p>
        </div>
      ) : (
        <>
          {/* ====================== FORMATEURS ====================== */}
          {section === 'formateurs' && (
            <div style={cardStyle}>
              <SectionHeader title="Formateurs" colors={colors} theme={currentTheme}
                onAdd={() => openNew('formateur')} addLabel="Ajouter un formateur" btn={btn} />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                  <thead><tr>
                    <th style={thStyle}>Formateur</th><th style={thStyle}>Spécialité</th>
                    <th style={thStyle}>Domaines</th><th style={thStyle}>Tarif/jour</th>
                    <th style={thStyle}>Statut</th><th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr></thead>
                  <tbody>
                    {formateurs.length === 0 && <tr><td style={tdStyle} colSpan={6}>Aucun formateur. Cliquez sur « Ajouter ».</td></tr>}
                    {formateurs.map((f) => (
                      <tr key={f.id}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar src={f.photo} nom={f.nom} colors={colors} />
                            <div>
                              <div style={{ fontWeight: 600 }}>{f.nom}</div>
                              {f.email && <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>{f.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>{f.specialite || '—'}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(f.categories || []).map((c, i) => <Chip key={i} colors={colors}>{c}</Chip>)}
                          </div>
                        </td>
                        <td style={tdStyle}>{Number(f.tarifJour || 0).toLocaleString('fr-FR')} {devise}</td>
                        <td style={tdStyle}><StatusDot ok={f.actif !== false && f.disponible !== false} colors={colors}
                          label={f.actif !== false && f.disponible !== false ? 'Disponible' : 'Inactif'} /></td>
                        <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <ActionBtns onEdit={() => openEdit('formateur', f)}
                            onDelete={() => removeWithConfirm(`le formateur « ${f.nom} »`, () => catalogueAdmin.deleteFormateur(f.id))}
                            colors={colors} theme={currentTheme} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================== FORMATIONS ====================== */}
          {section === 'formations' && (
            <div style={cardStyle}>
              <SectionHeader title="Formations" colors={colors} theme={currentTheme}
                onAdd={() => openNew('formation')} addLabel="Ajouter une formation" btn={btn} />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                  <thead><tr>
                    <th style={thStyle}>Titre</th><th style={thStyle}>Domaine</th>
                    <th style={thStyle}>Durée (déf.)</th><th style={thStyle}>Objectifs</th>
                    <th style={thStyle}>Statut</th><th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr></thead>
                  <tbody>
                    {formations.length === 0 && <tr><td style={tdStyle} colSpan={6}>Aucune formation.</td></tr>}
                    {formations.map((f) => (
                      <tr key={f.id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600 }}>{f.nom}</div>
                          {f.description && <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</div>}
                        </td>
                        <td style={tdStyle}><Chip colors={colors}>{f.categorie || '—'}</Chip></td>
                        <td style={tdStyle}>{f.dureeJoursParDefaut} j</td>
                        <td style={tdStyle}>{(f.objectifs || []).length} objectif(s)</td>
                        <td style={tdStyle}><StatusDot ok={f.actif !== false} colors={colors} label={f.actif !== false ? 'Active' : 'Inactive'} /></td>
                        <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <ActionBtns onEdit={() => openEdit('formation', f)}
                            onDelete={() => removeWithConfirm(`la formation « ${f.nom} »`, () => catalogueAdmin.deleteFormation(f.id))}
                            colors={colors} theme={currentTheme} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================== CRÉNEAUX ====================== */}
          {section === 'creneaux' && (
            <div style={cardStyle}>
              <SectionHeader title="Dates disponibles" colors={colors} theme={currentTheme}
                onAdd={() => openNew('creneau')} addLabel="Ajouter une date" btn={btn} />
              <p style={{ fontSize: '0.8rem', color: currentTheme.textSecondary, marginTop: -8 }}>
                Les créneaux marqués « Réservée » ne sont jamais proposés au client.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                  <thead><tr>
                    <th style={thStyle}>Période</th><th style={thStyle}>Formateur(s)</th>
                    <th style={thStyle}>Formation</th><th style={thStyle}>Lieu</th>
                    <th style={thStyle}>Statut</th><th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr></thead>
                  <tbody>
                    {creneaux.length === 0 && <tr><td style={tdStyle} colSpan={6}>Aucune date.</td></tr>}
                    {creneaux.map((c) => {
                      const reserve = /reserv|occup|indispo/i.test(c.statut || '');
                      return (
                        <tr key={c.id}>
                          <td style={tdStyle}>{fmtDate(c.dateDebut)}{c.dateFin && c.dateFin !== c.dateDebut ? ` → ${fmtDate(c.dateFin)}` : ''}</td>
                          <td style={tdStyle}>{(c.formateurIds || []).length ? (c.formateurIds || []).map(nomFormateur).join(', ') : <span style={{ color: currentTheme.textSecondary }}>Tous</span>}</td>
                          <td style={tdStyle}>{c.formationId ? nomFormation(c.formationId) : <span style={{ color: currentTheme.textSecondary }}>Toutes</span>}</td>
                          <td style={tdStyle}>{c.lieu || '—'}</td>
                          <td style={tdStyle}><StatusDot ok={!reserve} colors={colors} label={reserve ? 'Réservée' : 'Libre'} /></td>
                          <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <ActionBtns onEdit={() => openEdit('creneau', c)}
                              onDelete={() => removeWithConfirm('cette date', () => catalogueAdmin.deleteCreneau(c.id))}
                              colors={colors} theme={currentTheme} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ====================== TARIFS ====================== */}
          {section === 'tarifs' && (
            <TarifsEditor tarifs={tarifs} setTarifs={setTarifs} formations={formations}
              colors={colors} theme={currentTheme} inputStyle={inputStyle} labelStyle={labelStyle}
              cardStyle={cardStyle} btn={btn} ghostBtn={ghostBtn} notify={notify} reload={loadAll} />
          )}

          {/* ====================== PROPOSITIONS ====================== */}
          {section === 'propositions' && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: currentTheme.text }}>Propositions générées</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                  <thead><tr>
                    <th style={thStyle}>Référence</th><th style={thStyle}>Client</th>
                    <th style={thStyle}>Formation</th><th style={thStyle}>Total TTC</th>
                    <th style={thStyle}>Statut</th><th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr></thead>
                  <tbody>
                    {propositions.length === 0 && <tr><td style={tdStyle} colSpan={6}>Aucune proposition pour le moment.</td></tr>}
                    {propositions.slice().reverse().map((p) => (
                      <tr key={p.id}>
                        <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{p.reference}</span></td>
                        <td style={tdStyle}>{p.client?.nom || '—'}{p.client?.entreprise ? ` · ${p.client.entreprise}` : ''}</td>
                        <td style={tdStyle}>{p.formation?.titre || '—'}</td>
                        <td style={tdStyle}>{p.tarification?.totalTTCLibelle || '—'}</td>
                        <td style={tdStyle}>
                          <select value={p.statut || 'en_attente'} style={{ ...inputStyle, padding: '0.35rem 0.5rem', width: 'auto' }}
                            onChange={async (e) => {
                              try { await catalogueAdmin.updateProposition(p.id, { statut: e.target.value }); notify('success', 'Statut mis à jour.'); loadAll(); }
                              catch (err) { notify('error', err.message); }
                            }}>
                            <option value="en_attente">En attente</option>
                            <option value="acceptee">Acceptée</option>
                            <option value="refusee">Refusée</option>
                          </select>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <button style={{ ...btn('transparent', colors.danger), border: `1px solid ${currentTheme.border}` }}
                            onClick={() => removeWithConfirm(`la proposition ${p.reference}`, () => catalogueAdmin.deleteProposition(p.id))}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ====================== PANNEAU MODAL D'ÉDITION ====================== */}
      {editing && (
        <Modal onClose={closePanel} theme={currentTheme}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: currentTheme.text }}>
              {editing.isNew ? 'Ajouter' : 'Modifier'} — {editing.type === 'formateur' ? 'Formateur' : editing.type === 'formation' ? 'Formation' : 'Date disponible'}
            </h3>
            <button onClick={closePanel} style={{ ...ghostBtn, padding: '0.35rem 0.6rem' }}><i className="bi bi-x-lg"></i></button>
          </div>

          {/* ---- Formulaire FORMATEUR ---- */}
          {editing.type === 'formateur' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <PhotoField data={editing.data} setField={setField} colors={colors} theme={currentTheme} labelStyle={labelStyle} />
              <Row>
                <Field label="Nom complet *" labelStyle={labelStyle}>
                  <input style={inputStyle} value={editing.data.nom} onChange={(e) => setField('nom', e.target.value)} placeholder="Ex. Fredj Bouslama" />
                </Field>
                <Field label="Spécialité" labelStyle={labelStyle}>
                  <input style={inputStyle} value={editing.data.specialite} onChange={(e) => setField('specialite', e.target.value)} placeholder="Ex. Neurosciences & leadership" />
                </Field>
              </Row>
              <Field label="Biographie / description" labelStyle={labelStyle}>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={editing.data.bio} onChange={(e) => setField('bio', e.target.value)} />
              </Field>
              <Field label="Domaines d'expertise" hint="séparés par des virgules" labelStyle={labelStyle}>
                <input style={inputStyle} list="domaines-list"
                  value={(editing.data.categories || []).join(', ')}
                  onChange={(e) => setField('categories', e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))}
                  placeholder="NEUROSCIENCES, LEADERSHIP" />
                <datalist id="domaines-list">{domainesConnus.map((d) => <option key={d} value={d} />)}</datalist>
              </Field>
              <Row>
                <Field label={`Tarif / jour (${devise})`} labelStyle={labelStyle}>
                  <input type="number" min="0" style={inputStyle} value={editing.data.tarifJour} onChange={(e) => setField('tarifJour', Number(e.target.value))} />
                </Field>
                <Field label={`Tarif / session (${devise})`} hint="optionnel" labelStyle={labelStyle}>
                  <input type="number" min="0" style={inputStyle} value={editing.data.tarifSession || 0} onChange={(e) => setField('tarifSession', Number(e.target.value))} />
                </Field>
              </Row>
              <Row>
                <Field label="Email" labelStyle={labelStyle}>
                  <input style={inputStyle} value={editing.data.email || ''} onChange={(e) => setField('email', e.target.value)} />
                </Field>
                <Field label="Téléphone" labelStyle={labelStyle}>
                  <input style={inputStyle} value={editing.data.telephone || ''} onChange={(e) => setField('telephone', e.target.value)} />
                </Field>
              </Row>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <Toggle label="Disponible (visible côté client)" checked={editing.data.disponible !== false} onChange={(v) => setField('disponible', v)} colors={colors} theme={currentTheme} />
                <Toggle label="Actif" checked={editing.data.actif !== false} onChange={(v) => setField('actif', v)} colors={colors} theme={currentTheme} />
                <Toggle label="Agrément CNFCPP" checked={!!editing.data.agrementCNFCPP} onChange={(v) => setField('agrementCNFCPP', v)} colors={colors} theme={currentTheme} />
              </div>
            </div>
          )}

          {/* ---- Formulaire FORMATION ---- */}
          {editing.type === 'formation' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Row>
                <Field label="Titre *" labelStyle={labelStyle}>
                  <input style={inputStyle} value={editing.data.nom} onChange={(e) => setField('nom', e.target.value)} placeholder="Ex. Neurosciences appliquées" />
                </Field>
                <Field label="Domaine" hint="catégorie" labelStyle={labelStyle}>
                  <input style={inputStyle} list="domaines-list" value={editing.data.categorie}
                    onChange={(e) => setField('categorie', e.target.value.toUpperCase())} placeholder="NEUROSCIENCES" />
                  <datalist id="domaines-list">{domainesConnus.map((d) => <option key={d} value={d} />)}</datalist>
                </Field>
              </Row>
              <Field label="Description" labelStyle={labelStyle}>
                <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={editing.data.description} onChange={(e) => setField('description', e.target.value)} />
              </Field>
              <Field label="Durée par défaut (jours)" labelStyle={labelStyle}>
                <input type="number" min="1" style={{ ...inputStyle, maxWidth: 160 }} value={editing.data.dureeJoursParDefaut} onChange={(e) => setField('dureeJoursParDefaut', Number(e.target.value))} />
              </Field>
              <Field label="Objectifs pédagogiques" hint="un par ligne" labelStyle={labelStyle}>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  value={(editing.data.objectifs || []).join('\n')}
                  onChange={(e) => setField('objectifs', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
                  placeholder={'Comprendre les mécanismes…\nAppliquer les outils…'} />
              </Field>
              {/* Programme détaillé (jours) */}
              <ListEditor label="Programme détaillé (par jour)" items={editing.data.programmeDetaille || []}
                onChange={(items) => setField('programmeDetaille', items)}
                blank={{ jour: (editing.data.programmeDetaille?.length || 0) + 1, titre: '', contenu: '' }}
                colors={colors} theme={currentTheme} inputStyle={inputStyle} ghostBtn={ghostBtn} btn={btn}
                render={(item, set) => (
                  <>
                    <input type="number" min="1" style={{ ...inputStyle, maxWidth: 70 }} value={item.jour} onChange={(e) => set({ ...item, jour: Number(e.target.value) })} title="Jour" />
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="Titre du jour" value={item.titre} onChange={(e) => set({ ...item, titre: e.target.value })} />
                    <input style={{ ...inputStyle, flex: 2 }} placeholder="Contenu / modules" value={item.contenu} onChange={(e) => set({ ...item, contenu: e.target.value })} />
                  </>
                )} />
              {/* Frais annexes */}
              <ListEditor label="Frais annexes éventuels" items={editing.data.fraisAnnexes || []}
                onChange={(items) => setField('fraisAnnexes', items)}
                blank={{ libelle: '', montant: 0 }}
                colors={colors} theme={currentTheme} inputStyle={inputStyle} ghostBtn={ghostBtn} btn={btn}
                render={(item, set) => (
                  <>
                    <input style={{ ...inputStyle, flex: 2 }} placeholder="Libellé (ex. Support, location salle)" value={item.libelle} onChange={(e) => set({ ...item, libelle: e.target.value })} />
                    <input type="number" style={{ ...inputStyle, maxWidth: 140 }} placeholder={`Montant ${devise}`} value={item.montant} onChange={(e) => set({ ...item, montant: Number(e.target.value) })} />
                  </>
                )} />
              <Toggle label="Formation active (visible côté client)" checked={editing.data.actif !== false} onChange={(v) => setField('actif', v)} colors={colors} theme={currentTheme} />
            </div>
          )}

          {/* ---- Formulaire CRÉNEAU ---- */}
          {editing.type === 'creneau' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Row>
                <Field label="Date de début *" labelStyle={labelStyle}>
                  <input type="date" style={inputStyle} value={editing.data.dateDebut} onChange={(e) => setField('dateDebut', e.target.value)} />
                </Field>
                <Field label="Date de fin" hint="= début si vide" labelStyle={labelStyle}>
                  <input type="date" style={inputStyle} value={editing.data.dateFin} onChange={(e) => setField('dateFin', e.target.value)} />
                </Field>
              </Row>
              <Field label="Formateur(s) associé(s)" hint="aucun = tous" labelStyle={labelStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {formateurs.map((f) => {
                    const sel = (editing.data.formateurIds || []).includes(f.id);
                    return (
                      <button key={f.id} type="button"
                        onClick={() => {
                          const cur = new Set(editing.data.formateurIds || []);
                          sel ? cur.delete(f.id) : cur.add(f.id);
                          setField('formateurIds', [...cur]);
                        }}
                        style={{ ...btn(sel ? colors.primary : 'transparent', sel ? '#fff' : currentTheme.text), border: `1px solid ${sel ? colors.primary : currentTheme.border}`, padding: '0.4rem 0.7rem' }}>
                        {f.nom}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Row>
                <Field label="Formation concernée" hint="optionnel" labelStyle={labelStyle}>
                  <select style={inputStyle} value={editing.data.formationId || ''} onChange={(e) => setField('formationId', e.target.value)}>
                    <option value="">Toutes les formations</option>
                    {formations.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </Field>
                <Field label="Lieu" labelStyle={labelStyle}>
                  <input style={inputStyle} value={editing.data.lieu || ''} onChange={(e) => setField('lieu', e.target.value)} placeholder="Ex. Sousse" />
                </Field>
              </Row>
              <Field label="Statut" labelStyle={labelStyle}>
                <select style={{ ...inputStyle, maxWidth: 240 }} value={editing.data.statut} onChange={(e) => setField('statut', e.target.value)}>
                  <option value="disponible">Libre (proposée au client)</option>
                  <option value="reserve">Réservée (masquée)</option>
                </select>
              </Field>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1.5rem' }}>
            <button onClick={closePanel} style={ghostBtn}>Annuler</button>
            <button onClick={saveEditing} style={btn(colors.primary)}>
              <i className="bi bi-check-lg"></i> {editing.isNew ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// =============================================================================
//                       ÉDITEUR DE TARIFICATION
// =============================================================================
function TarifsEditor({ tarifs, setTarifs, formations, colors, theme, inputStyle, labelStyle, cardStyle, btn, ghostBtn, notify, reload }) {
  const [t, setT] = useState(() => ({ ...tarifs }));
  const [saving, setSaving] = useState(false);
  useEffect(() => { setT({ ...tarifs }); }, [tarifs]);

  const devise = t.devise || 'DT';
  const set = (k, v) => setT((p) => ({ ...p, [k]: v }));
  const setModalite = (m, v) => setT((p) => ({ ...p, majorationsModalite: { ...(p.majorationsModalite || {}), [m]: Number(v) } }));
  const setRemise = (i, k, v) => setT((p) => {
    const arr = [...(p.remisesVolume || [])];
    arr[i] = { ...arr[i], [k]: k === 'libelle' ? v : Number(v) };
    return { ...p, remisesVolume: arr };
  });
  const addRemise = () => setT((p) => ({ ...p, remisesVolume: [...(p.remisesVolume || []), { seuilJoursFormateur: 0, remisePct: 0, libelle: '' }] }));
  const delRemise = (i) => setT((p) => ({ ...p, remisesVolume: (p.remisesVolume || []).filter((_, j) => j !== i) }));
  const setRegle = (fid, k, v) => setT((p) => {
    const tpf = { ...(p.tarifsParFormation || {}) };
    const cur = { modeTarification: 'JOUR', tarifJour: null, forfait: null, ...(tpf[fid] || {}) };
    cur[k] = k === 'modeTarification' ? v : (v === '' ? null : Number(v));
    tpf[fid] = cur;
    return { ...p, tarifsParFormation: tpf };
  });

  const save = async () => {
    setSaving(true);
    try {
      const updated = await catalogueAdmin.updateTarifs(t);
      setTarifs(updated); notify('success', 'Grille tarifaire enregistrée.'); reload();
    } catch (e) { notify('error', e.message || 'Échec de l\'enregistrement des tarifs.'); }
    finally { setSaving(false); }
  };

  const cell = { padding: '0.5rem', borderBottom: `1px solid ${theme.border}`, fontSize: '0.85rem', color: theme.text };

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: theme.text }}>Paramètres généraux</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Field label="Devise" labelStyle={labelStyle}>
            <input style={inputStyle} value={t.devise || ''} onChange={(e) => set('devise', e.target.value)} />
          </Field>
          <Field label="Taux de TVA (%)" labelStyle={labelStyle}>
            <input type="number" style={inputStyle} value={t.tauxTVA ?? 0} onChange={(e) => set('tauxTVA', Number(e.target.value))} />
          </Field>
          <Field label={`Tarif/jour par défaut (${devise})`} labelStyle={labelStyle}>
            <input type="number" style={inputStyle} value={t.tarifJourParDefaut ?? 0} onChange={(e) => set('tarifJourParDefaut', Number(e.target.value))} />
          </Field>
          <Field label="Taille de groupe par défaut" labelStyle={labelStyle}>
            <input type="number" style={inputStyle} value={t.tailleGroupeParDefaut ?? 12} onChange={(e) => set('tailleGroupeParDefaut', Number(e.target.value))} />
          </Field>
          <Field label="Majoration CNFCPP (%)" labelStyle={labelStyle}>
            <input type="number" style={inputStyle} value={t.majorationCNFCPP ?? 0} onChange={(e) => set('majorationCNFCPP', Number(e.target.value))} />
          </Field>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: theme.text }}>Majorations par modalité</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {MODALITES.map((m) => (
            <Field key={m} label={m} hint="coefficient (1 = neutre)" labelStyle={labelStyle}>
              <input type="number" step="0.05" style={inputStyle}
                value={(t.majorationsModalite || {})[m] ?? 1} onChange={(e) => setModalite(m, e.target.value)} />
            </Field>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, color: theme.text }}>Remises volume</h3>
          <button onClick={addRemise} style={ghostBtn}><i className="bi bi-plus-lg"></i> Palier</button>
        </div>
        {(t.remisesVolume || []).length === 0 && <p style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>Aucun palier de remise.</p>}
        {(t.remisesVolume || []).map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <input type="number" style={{ ...inputStyle, maxWidth: 150 }} placeholder="Seuil jours-formateur" value={r.seuilJoursFormateur} onChange={(e) => setRemise(i, 'seuilJoursFormateur', e.target.value)} title="Seuil (jours-formateur)" />
            <input type="number" style={{ ...inputStyle, maxWidth: 110 }} placeholder="Remise %" value={r.remisePct} onChange={(e) => setRemise(i, 'remisePct', e.target.value)} title="Remise %" />
            <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Libellé" value={r.libelle || ''} onChange={(e) => setRemise(i, 'libelle', e.target.value)} />
            <button onClick={() => delRemise(i)} style={{ ...btn('transparent', colors.danger), border: `1px solid ${theme.border}` }}><i className="bi bi-trash"></i></button>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: theme.text }}>Tarif par formation</h3>
        <p style={{ fontSize: '0.8rem', color: theme.textSecondary, marginTop: -6 }}>
          Mode JOUR : un tarif/jour spécifique (vide ⇒ tarif du formateur ou défaut). Mode FORFAIT : un montant global par groupe.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead><tr>
              <th style={{ ...cell, textAlign: 'left', color: theme.textSecondary }}>Formation</th>
              <th style={{ ...cell, color: theme.textSecondary }}>Mode</th>
              <th style={{ ...cell, color: theme.textSecondary }}>Tarif/jour</th>
              <th style={{ ...cell, color: theme.textSecondary }}>Forfait</th>
            </tr></thead>
            <tbody>
              {formations.map((f) => {
                const r = (t.tarifsParFormation || {})[f.id] || {};
                const mode = (r.modeTarification || 'JOUR').toUpperCase();
                return (
                  <tr key={f.id}>
                    <td style={cell}>{f.nom}</td>
                    <td style={cell}>
                      <select style={{ ...inputStyle, padding: '0.35rem 0.5rem' }} value={mode} onChange={(e) => setRegle(f.id, 'modeTarification', e.target.value)}>
                        <option value="JOUR">JOUR</option>
                        <option value="FORFAIT">FORFAIT</option>
                      </select>
                    </td>
                    <td style={cell}>
                      <input type="number" disabled={mode === 'FORFAIT'} style={{ ...inputStyle, maxWidth: 120, opacity: mode === 'FORFAIT' ? 0.4 : 1 }}
                        value={r.tarifJour ?? ''} onChange={(e) => setRegle(f.id, 'tarifJour', e.target.value)} placeholder="défaut" />
                    </td>
                    <td style={cell}>
                      <input type="number" disabled={mode !== 'FORFAIT'} style={{ ...inputStyle, maxWidth: 120, opacity: mode !== 'FORFAIT' ? 0.4 : 1 }}
                        value={r.forfait ?? ''} onChange={(e) => setRegle(f.id, 'forfait', e.target.value)} placeholder="—" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} disabled={saving} style={{ ...btn(colors.primary), opacity: saving ? 0.6 : 1 }}>
          <i className="bi bi-save"></i> {saving ? 'Enregistrement…' : 'Enregistrer la tarification'}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
//                         PETITS COMPOSANTS UI
// =============================================================================
function SectionHeader({ title, onAdd, addLabel, colors, theme, btn }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
      <h3 style={{ margin: 0, color: theme.text }}>{title}</h3>
      <button onClick={onAdd} style={btn(colors.primary)}><i className="bi bi-plus-lg"></i> {addLabel}</button>
    </div>
  );
}

function ActionBtns({ onEdit, onDelete, colors, theme }) {
  const base = { width: 34, height: 34, borderRadius: 9, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', marginLeft: 6 };
  return (
    <>
      <button title="Modifier" onClick={onEdit} style={{ ...base, color: colors.primary }}><i className="bi bi-pencil"></i></button>
      <button title="Supprimer" onClick={onDelete} style={{ ...base, color: colors.danger }}><i className="bi bi-trash"></i></button>
    </>
  );
}

function Chip({ children, colors }) {
  return <span style={{ background: `${colors.primary}1A`, color: colors.primary, padding: '2px 8px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600 }}>{children}</span>;
}

function StatusDot({ ok, label, colors }) {
  const c = ok ? colors.success : colors.gray400 || '#9CA3AF';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{label}
  </span>;
}

function Avatar({ src, nom, colors }) {
  const initials = (nom || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  if (src) return <img src={src} alt={nom} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />;
  return <div style={{ width: 38, height: 38, borderRadius: '50%', background: colors.primary, color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{initials}</div>;
}

function Field({ label, hint, children, labelStyle }) {
  return (
    <div>
      <label style={labelStyle}>{label}{hint && <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: 5, fontSize: '0.75rem' }}>({hint})</span>}</label>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>{children}</div>;
}

function Toggle({ label, checked, onChange, colors, theme }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: theme.text }}>
      <span onClick={() => onChange(!checked)} style={{
        width: 40, height: 22, borderRadius: 22, background: checked ? colors.success : theme.border,
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <span style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </span>
      {label}
    </label>
  );
}

// Éditeur générique de liste d'objets (programme détaillé, frais annexes…).
function ListEditor({ label, items, onChange, blank, render, colors, theme, inputStyle, ghostBtn, btn }) {
  const update = (i, v) => { const arr = [...items]; arr[i] = v; onChange(arr); };
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, typeof blank === 'function' ? blank() : { ...blank }]);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: theme.text }}>{label}</span>
        <button type="button" onClick={add} style={{ ...ghostBtn, padding: '0.35rem 0.7rem' }}><i className="bi bi-plus-lg"></i> Ajouter</button>
      </div>
      {items.length === 0 && <p style={{ fontSize: '0.8rem', color: theme.textSecondary, margin: '4px 0' }}>Aucun élément.</p>}
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          {render(item, (v) => update(i, v))}
          <button type="button" onClick={() => remove(i)} style={{ ...btn('transparent', colors.danger), border: `1px solid ${theme.border}`, padding: '0.4rem 0.6rem' }}><i className="bi bi-x-lg"></i></button>
        </div>
      ))}
    </div>
  );
}

// Champ photo avec aperçu + sélection de fichier (envoyé après l'enregistrement).
function PhotoField({ data, setField, colors, theme, labelStyle }) {
  const [preview, setPreview] = useState(data.photo || '');
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setField('_photoFile', file);
    setPreview(URL.createObjectURL(file));
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar src={preview} nom={data.nom} colors={colors} />
      <div>
        <label style={labelStyle}>Photo <span style={{ fontWeight: 400, opacity: 0.6, fontSize: '0.75rem' }}>(optionnel)</span></label>
        <input type="file" accept="image/*" onChange={onFile} style={{ fontSize: '0.82rem', color: theme.text }} />
      </div>
    </div>
  );
}

// Fenêtre modale simple (overlay) cohérente avec le dashboard.
function Modal({ children, onClose, theme }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4vh 1rem', overflowY: 'auto',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: theme.cardBg, color: theme.text, borderRadius: 18, padding: '1.75rem',
        width: '100%', maxWidth: 720, border: `1px solid ${theme.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {children}
      </div>
    </div>
  );
}

// ---- utilitaires ----
function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}
