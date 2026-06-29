// src/pages/GenerationProgramme.jsx
// -----------------------------------------------------------------------------
// Page « Génération de Programme » — OCTOGO
// Assistant multi-étapes : saisie -> génération -> aperçu -> export Word / PDF.
//
// MODIFICATIONS (conformité aux règles métier) :
//   • Le client NE SAISIT PLUS le tarif : le prix est calculé automatiquement
//     par le backend selon la grille tarifaire définie par l'administrateur.
//   • Les formateurs ne sont plus saisis en texte libre : le vivier provient du
//     backend (/api/catalogue/public/formateurs) et le système affecte
//     automatiquement un formateur qualifié et disponible à chaque action.
// -----------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  Building2, Users, Target, Wallet,
  Sparkles, Plus, Trash2, ChevronRight, ChevronLeft, FileText, FileDown,
  CheckCircle2, AlertTriangle, RotateCcw, Lock, UserPlus, BadgeCheck,
} from 'lucide-react';
import {
  createEmptyState, genererProgrammeAnnuel, uid, MOIS_FRANCAIS,
} from './programmeGenerator';
import { exporterWord, exporterPDF } from './programmeExport';

const C = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  dark: '#1F2937',
  muted: '#6B7280',
  light: '#F9FAFB',
  border: '#E5E7EB',
  ok: '#10B981',
  warn: '#F59E0B',
  danger: '#EF4444',
};

const ETAPES = [
  { id: 0, titre: 'Entreprise & contexte', icone: Building2 },
  { id: 1, titre: 'Population & métiers', icone: Users },
  { id: 2, titre: 'Objectifs & compétences', icone: Target },
  { id: 3, titre: 'Cadre & ressources', icone: Wallet },
  { id: 4, titre: 'Génération & résultat', icone: Sparkles },
];

// --- petits composants de formulaire ---------------------------------------
const Label = ({ children, hint }) => (
  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 6 }}>
    {children}
    {hint && <span style={{ fontWeight: 400, color: C.muted, marginLeft: 6, fontSize: 12 }}>{hint}</span>}
  </label>
);

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
  fontSize: 14, color: C.dark, outline: 'none', boxSizing: 'border-box', background: '#fff',
  fontFamily: 'inherit',
};

const Field = ({ label, hint, value, onChange, placeholder, type = 'text', textarea, rows = 3 }) => (
  <div style={{ marginBottom: 16 }}>
    <Label hint={hint}>{label}</Label>
    {textarea ? (
      <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={rows} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    ) : (
      <input style={inputStyle} type={type} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    )}
  </div>
);

const Card = ({ children }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: 24, border: `1px solid ${C.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 18,
  }}>{children}</div>
);

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px',
  background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer',
};
const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px',
  background: '#fff', color: C.primary, border: `1px solid ${C.primary}`,
  borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer',
};
const btnSmall = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  background: `${C.primary}10`, color: C.primary, border: `1px dashed ${C.primary}`,
  borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

// Encadré d'information réutilisable (note « prix automatique », etc.).
const Info = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: `${C.primary}08`, border: `1px solid ${C.primary}25`, borderRadius: 10, marginBottom: 16 }}>
    <Lock size={16} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
    <span style={{ fontSize: 13, color: C.dark, lineHeight: 1.5 }}>{children}</span>
  </div>
);

// --- composant principal -----------------------------------------------------
export default function GenerationProgramme() {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState(createEmptyState());
  const [etape, setEtape] = useState(0);
  const [resultat, setResultat] = useState(null);
  const [enCours, setEnCours] = useState(false);

  // Vivier de formateurs géré par l'administrateur (backend).
  const [formateursBackend, setFormateursBackend] = useState([]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Chargement du vivier de formateurs depuis le backend (lecture seule).
  useEffect(() => {
    fetch('/api/catalogue/public/formateurs')
      .then((r) => r.json())
      .then((d) => setFormateursBackend(d.formateurs || []))
      .catch(() => { /* backend indisponible : on n'affiche simplement pas le vivier */ });
  }, []);

  // helpers d'édition immuable
  const setEntreprise = (k, v) => setState((s) => ({ ...s, entreprise: { ...s.entreprise, [k]: v } }));
  const setBudget = (k, v) => setState((s) => ({ ...s, budget: { ...s.budget, [k]: v } }));
  const setAgenda = (k, v) => setState((s) => ({ ...s, agenda: { ...s.agenda, [k]: v } }));
  const setTFP = (k, v) => setState((s) => ({ ...s, cadreTFP: { ...s.cadreTFP, [k]: v } }));

  const addItem = (cle, modele) => setState((s) => ({ ...s, [cle]: [...s[cle], modele()] }));
  const removeItem = (cle, id) => setState((s) => ({ ...s, [cle]: s[cle].filter((x) => x.id !== id) }));
  const updateItem = (cle, id, champ, valeur) =>
    setState((s) => ({ ...s, [cle]: s[cle].map((x) => (x.id === id ? { ...x, [champ]: valeur } : x)) }));

  const [sourceGeneration, setSourceGeneration] = useState(null); // 'backend' | 'local'

  const lancerGeneration = async () => {
    setEnCours(true);
    try {
      // 1) Génération dynamique côté backend (données + disponibilités + tarifs réels).
      //    Le prix est calculé par le serveur selon la grille tarifaire de l'admin.
      const token = localStorage.getItem('token');
      const resp = await fetch('/api/programmes/generer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(state),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (!data || !data.resultat) throw new Error('Réponse invalide');
      setResultat(data.resultat);
      setSourceGeneration('backend');
    } catch (e) {
      // 2) Repli local si le backend est indisponible (mode hors-ligne).
      console.warn('Backend indisponible, génération locale :', e.message);
      setResultat(genererProgrammeAnnuel(state));
      setSourceGeneration('local');
    } finally {
      setEnCours(false);
    }
  };

  const reinitialiser = () => {
    setState(createEmptyState());
    setResultat(null);
    setSourceGeneration(null);
    setEtape(0);
  };

  // ------- rendu des étapes ---------------------------------------------------
  const renduEtape = () => {
    switch (etape) {
      case 0:
        return (
          <Card>
            <Field label="Nom de l'entreprise" value={state.entreprise.nom}
              onChange={(v) => setEntreprise('nom', v)} placeholder="Ex. : Société Industrielle X" />
            <Field label="Domaine d'activité" value={state.entreprise.domaineActivite}
              onChange={(v) => setEntreprise('domaineActivite', v)} placeholder="Ex. : Industrie automobile, agroalimentaire, banque…" />
            <Field label="Effectif global" hint="(nombre total de collaborateurs)" type="number"
              value={state.entreprise.effectifGlobal} onChange={(v) => setEntreprise('effectifGlobal', v)} placeholder="Ex. : 1900" />
            <Field label="Caractéristiques de l'entreprise" textarea
              value={state.entreprise.caracteristiques} onChange={(v) => setEntreprise('caracteristiques', v)}
              placeholder="Taille, sites, organisation, contexte social, contraintes…" />
            <Field label="Stratégie globale de développement de l'entreprise" textarea
              value={state.entreprise.strategieGlobale} onChange={(v) => setEntreprise('strategieGlobale', v)}
              placeholder="Orientations à 3-5 ans, ambitions, marchés visés…" />
            <Field label="Stratégie de développement RH (Ressources Humaines)" textarea
              value={state.entreprise.strategieRH} onChange={(v) => setEntreprise('strategieRH', v)}
              placeholder="Politique de montée en compétence, mobilité, fidélisation…" />
          </Card>
        );

      case 1:
        return (
          <Card>
            <Label hint="(un bloc par corps de métier : intitulé, effectif, fiche de poste / missions)">
              Population à former par corps de métier
            </Label>
            {state.corpsMetiers.map((cm, i) => (
              <div key={cm.id} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, background: C.light }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: C.primary }}>Corps de métier {i + 1}</span>
                  {state.corpsMetiers.length > 1 && (
                    <button style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
                      onClick={() => removeItem('corpsMetiers', cm.id)}><Trash2 size={16} /> Retirer</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: 12 }}>
                  <input style={inputStyle} placeholder="Intitulé du poste (ex. : Opérateur de production)"
                    value={cm.intitule} onChange={(e) => updateItem('corpsMetiers', cm.id, 'intitule', e.target.value)} />
                  <input style={inputStyle} type="number" placeholder="Effectif"
                    value={cm.effectif} onChange={(e) => updateItem('corpsMetiers', cm.id, 'effectif', e.target.value)} />
                  <select style={inputStyle} value={cm.priorite}
                    onChange={(e) => updateItem('corpsMetiers', cm.id, 'priorite', e.target.value)}>
                    <option>Haute</option><option>Normale</option><option>Basse</option>
                  </select>
                </div>
                <textarea style={{ ...inputStyle, marginTop: 12, resize: 'vertical' }} rows={2}
                  placeholder="Fiche de poste / missions principales (sert à l'appariement des programmes)"
                  value={cm.missions} onChange={(e) => updateItem('corpsMetiers', cm.id, 'missions', e.target.value)} />
              </div>
            ))}
            <button style={btnSmall} onClick={() => addItem('corpsMetiers', () => ({ id: uid('cm'), intitule: '', effectif: '', missions: '', priorite: 'Normale' }))}>
              <Plus size={16} /> Ajouter un corps de métier
            </button>
          </Card>
        );

      case 2:
        return (
          <>
            <Card>
              <Label hint="(1 à 3 objectifs annuels)">Objectifs pédagogiques annuels</Label>
              {state.objectifsPedagogiques.map((o, i) => (
                <div key={o.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  <input style={inputStyle} placeholder={`Objectif ${i + 1}`} value={o.libelle}
                    onChange={(e) => updateItem('objectifsPedagogiques', o.id, 'libelle', e.target.value)} />
                  {state.objectifsPedagogiques.length > 1 && (
                    <button style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}
                      onClick={() => removeItem('objectifsPedagogiques', o.id)}><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
              {state.objectifsPedagogiques.length < 3 && (
                <button style={btnSmall} onClick={() => addItem('objectifsPedagogiques', () => ({ id: uid('obj'), libelle: '' }))}>
                  <Plus size={16} /> Ajouter un objectif
                </button>
              )}
            </Card>

            <Card>
              <Label hint="(compétences cibles à développer durant l'année)">Compétences cibles</Label>
              {state.competencesCibles.map((c) => (
                <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  <input style={inputStyle} placeholder="Ex. : Management d'équipe, relation client…" value={c.libelle}
                    onChange={(e) => updateItem('competencesCibles', c.id, 'libelle', e.target.value)} />
                  {state.competencesCibles.length > 1 && (
                    <button style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}
                      onClick={() => removeItem('competencesCibles', c.id)}><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
              <button style={btnSmall} onClick={() => addItem('competencesCibles', () => ({ id: uid('comp'), libelle: '' }))}>
                <Plus size={16} /> Ajouter une compétence
              </button>
            </Card>

            <Card>
              <Label hint="(KPI = Indicateur Clé de Performance visé + cible)">Indicateurs de performance (KPI)</Label>
              {state.kpis.map((k) => (
                <div key={k.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  <input style={inputStyle} placeholder="Indicateur (ex. : taux de transfert terrain)" value={k.libelle}
                    onChange={(e) => updateItem('kpis', k.id, 'libelle', e.target.value)} />
                  <input style={inputStyle} placeholder="Cible (ex. : ≥ 80 %)" value={k.cible}
                    onChange={(e) => updateItem('kpis', k.id, 'cible', e.target.value)} />
                  {state.kpis.length > 1 && (
                    <button style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}
                      onClick={() => removeItem('kpis', k.id)}><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
              <button style={btnSmall} onClick={() => addItem('kpis', () => ({ id: uid('kpi'), libelle: '', cible: '' }))}>
                <Plus size={16} /> Ajouter un KPI (Indicateur Clé de Performance)
              </button>
            </Card>

            <Card>
              <Field label="Résultats attendus" textarea value={state.resultatsAttendus}
                onChange={(v) => setState((s) => ({ ...s, resultatsAttendus: v }))}
                placeholder="Impact visé sur la performance, le climat, les compétences…" />
            </Card>
          </>
        );

      case 3:
        return (
          <>
            <Card>
              <Label>Cadre TFP (Taxe de Formation Professionnelle) / CNFCPP</Label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={state.cadreTFP.dossierTFP}
                  onChange={(e) => setTFP('dossierTFP', e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 14, color: C.dark }}>Constituer un dossier TFP / CNFCPP (Centre National de Formation Continue et de Promotion Professionnelle)</span>
              </label>
              {state.cadreTFP.dossierTFP && (
                <Field label="Détails du dossier TFP" value={state.cadreTFP.detailsTFP}
                  onChange={(v) => setTFP('detailsTFP', v)} placeholder="Référence, ristourne visée, période de dépôt…" />
              )}
            </Card>

            <Card>
              {/* Le budget annuel reste saisi : c'est l'enveloppe DISPONIBLE du client,
                  utilisée pour comparer au coût estimé (dans le budget / dépassement).
                  Le TARIF, lui, n'est plus saisi : il vient du backend. */}
              <Field label="Budget annuel de formation disponible" hint="(DT — Dinar Tunisien — HT — Hors Taxes)" type="number"
                value={state.budget.montantAnnuel} onChange={(v) => setBudget('montantAnnuel', v)} placeholder="Ex. : 60000" />

              <Info>
                Le <strong>tarif jour-formateur</strong> n'est pas saisi ici. Le prix de chaque action et le coût total sont
                <strong> calculés automatiquement</strong> selon la grille tarifaire définie par l'administrateur dans le backend.
              </Info>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <Label>Année de l'agenda annuel</Label>
                  <input style={inputStyle} type="number" value={state.agenda.annee}
                    onChange={(e) => setAgenda('annee', e.target.value)} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Label>Mois de démarrage</Label>
                  <select style={inputStyle} value={state.agenda.moisDemarrage}
                    onChange={(e) => setAgenda('moisDemarrage', parseInt(e.target.value, 10))}>
                    {MOIS_FRANCAIS.map((mois, i) => <option key={mois} value={i + 1}>{mois}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <Label hint="(locaux et internationaux)">Cabinets de formation spécialisés</Label>
              {state.cabinets.map((cab) => (
                <div key={cab.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 2fr auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                  <input style={inputStyle} placeholder="Nom du cabinet" value={cab.nom}
                    onChange={(e) => updateItem('cabinets', cab.id, 'nom', e.target.value)} />
                  <select style={inputStyle} value={cab.type} onChange={(e) => updateItem('cabinets', cab.id, 'type', e.target.value)}>
                    <option value="local">Local</option><option value="international">International</option>
                  </select>
                  <input style={inputStyle} placeholder="Spécialité" value={cab.specialite}
                    onChange={(e) => updateItem('cabinets', cab.id, 'specialite', e.target.value)} />
                  {state.cabinets.length > 1 && (
                    <button style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}
                      onClick={() => removeItem('cabinets', cab.id)}><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
              <button style={btnSmall} onClick={() => addItem('cabinets', () => ({ id: uid('cab'), nom: '', type: 'local', specialite: '' }))}>
                <Plus size={16} /> Ajouter un cabinet
              </button>
            </Card>

            {/* Vivier de formateurs : géré dans le backend (lecture seule).
                Le client ne saisit plus de formateurs ; le système affecte
                automatiquement, pour chaque action, un formateur qualifié et
                disponible à la date prévue. */}
            <Card>
              <Label hint="(gérés par l'administrateur — affectation automatique)">Vivier de formateurs disponibles</Label>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
                Vous n'avez aucun formateur à saisir. À la génération, le système affecte à chaque action un formateur
                <strong> qualifié pour la catégorie</strong> et <strong>disponible à la période prévue</strong>, parmi le vivier ci-dessous.
              </div>
              {formateursBackend.length === 0 ? (
                <div style={{ fontSize: 13, color: C.muted }}>Vivier indisponible (serveur non joignable). Les formateurs seront proposés à la génération.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {formateursBackend.map((f) => (
                    <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, padding: '7px 12px', borderRadius: 999, background: C.light, border: `1px solid ${C.border}`, color: C.dark }}>
                      <strong>{f.nom}</strong>
                      {f.specialite ? <span style={{ color: C.muted }}>· {f.specialite}</span> : null}
                      {f.agrementCNFCPP ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: C.ok, fontWeight: 600 }}><BadgeCheck size={13} /> CNFCPP</span> : null}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          </>
        );

      case 4:
        return (
          <div>
            {!resultat && (
              <Card>
                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <Sparkles size={42} color={C.primary} style={{ marginBottom: 12 }} />
                  <h3 style={{ margin: '0 0 8px', color: C.dark }}>Prêt à générer le programme annuel</h3>
                  <p style={{ color: C.muted, fontSize: 14, maxWidth: 480, margin: '0 auto 8px' }}>
                    Le moteur OCTOGO va apparier vos objectifs et compétences à nos programmes,
                    construire le plan par corps de métier, le calendrier, l'estimation budgétaire et les KPI (Indicateur Clé de Performance).
                  </p>
                  <p style={{ color: C.muted, fontSize: 13, maxWidth: 480, margin: '0 auto 20px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} color={C.primary} /> Le prix est calculé automatiquement selon les tarifs de l'administrateur.
                  </p>
                  <div>
                    <button style={{ ...btnPrimary, opacity: enCours ? 0.7 : 1 }} onClick={lancerGeneration} disabled={enCours}>
                      <Sparkles size={18} /> {enCours ? 'Génération en cours…' : 'Générer le programme'}
                    </button>
                  </div>
                </div>
              </Card>
            )}
            {resultat && <Apercu resultat={resultat} isMobile={isMobile} source={sourceGeneration} />}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '20px 14px 60px' : '32px 24px 80px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${C.primary}12`, color: C.primary, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          <Sparkles size={15} /> Outil OCTOGO
        </div>
        <h1 style={{ margin: 0, fontSize: isMobile ? 26 : 32, color: C.dark, fontWeight: 800 }}>
          Génération de Programme
        </h1>
        <p style={{ color: C.muted, fontSize: 15, marginTop: 8 }}>
          Construisez automatiquement un programme annuel de formation exportable (Word / PDF — Portable Document Format),
          prêt pour la direction et les dossiers TFP (Taxe de Formation Professionnelle) / CNFCPP. Le prix est calculé automatiquement selon les tarifs de l'administrateur.
        </p>
      </div>

      {/* Bannière selon le statut de connexion */}
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: `${C.ok}10`, border: `1px solid ${C.ok}40`, marginBottom: 20 }}>
          <CheckCircle2 size={18} color={C.ok} />
          <span style={{ fontSize: 13.5, color: C.dark }}>
            Connecté{user && user.name ? ` en tant que ${user.name.split(' ')[0]}` : ''} — vos programmes générés sont enregistrés sur votre compte et consultables dans votre tableau de bord.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, background: `${C.primary}08`, border: `1px solid ${C.primary}25`, marginBottom: 20, flexWrap: 'wrap' }}>
          <Lock size={20} color={C.primary} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: C.dark, flex: 1, minWidth: 200 }}>
            <strong>Mode invité.</strong> Vous pouvez générer et exporter librement un programme. Connectez-vous pour <strong>sauvegarder</strong> vos programmes et les <strong>retrouver</strong> plus tard.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" style={{ ...btnGhost, padding: '9px 16px', textDecoration: 'none' }}>Se connecter</Link>
            <Link to="/register" style={{ ...btnPrimary, padding: '9px 16px', textDecoration: 'none' }}>
              <UserPlus size={16} /> Créer un compte
            </Link>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div style={{ display: 'flex', gap: isMobile ? 4 : 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {ETAPES.map((e) => {
          const Icone = e.icone;
          const actif = e.id === etape;
          const fait = e.id < etape;
          return (
            <button key={e.id} onClick={() => setEtape(e.id)}
              style={{
                flex: isMobile ? '1 1 60px' : '1 1 0', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, padding: '10px 6px', borderRadius: 12, cursor: 'pointer',
                border: `1px solid ${actif ? C.primary : C.border}`,
                background: actif ? `${C.primary}10` : fait ? `${C.ok}10` : '#fff',
              }}>
              <Icone size={20} color={actif ? C.primary : fait ? C.ok : C.muted} />
              {!isMobile && <span style={{ fontSize: 12, fontWeight: 600, color: actif ? C.primary : C.muted, textAlign: 'center' }}>{e.titre}</span>}
            </button>
          );
        })}
      </div>

      {renduEtape()}

      {/* Navigation bas de page */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {etape > 0 && (
            <button style={btnGhost} onClick={() => setEtape((e) => e - 1)}>
              <ChevronLeft size={18} /> Précédent
            </button>
          )}
          {resultat && (
            <button style={{ ...btnGhost, color: C.muted, borderColor: C.border }} onClick={reinitialiser}>
              <RotateCcw size={18} /> Réinitialiser
            </button>
          )}
        </div>
        {etape < 4 && (
          <button style={btnPrimary} onClick={() => setEtape((e) => Math.min(4, e + 1))}>
            Suivant <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// --- panneau d'aperçu + export ----------------------------------------------
function Apercu({ resultat, isMobile, source }) {
  const r = resultat;
  const b = r.budget;
  const devise = b.devise;
  const maxTrim = Math.max(1, ...b.repartitionParTrimestre.map((x) => x.cout));

  const statutCouleur = b.statut === 'DÉPASSEMENT' ? C.danger : b.statut === 'DANS_LE_BUDGET' ? C.ok : C.muted;

  const Section = ({ titre, children }) => (
    <Card>
      <h3 style={{ margin: '0 0 14px', color: C.primary, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>{titre}</h3>
      {children}
    </Card>
  );

  const th = { textAlign: 'left', padding: '8px 10px', background: C.light, fontSize: 12, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 };
  const td = { padding: '8px 10px', fontSize: 13, color: C.dark, borderTop: `1px solid ${C.border}` };

  return (
    <div>
      {/* barre d'export */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
        background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, borderRadius: 16, padding: 18, marginBottom: 18,
      }}>
        <div style={{ color: '#fff' }}>
          <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={20} /> Programme généré
          </div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            {r.meta.nbActions} actions · {r.meta.joursTotal} jours-formateur · {r.meta.effectifTotal} collaborateurs
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ ...btnPrimary, background: '#fff', color: C.primary }} onClick={() => exporterWord(r)}>
            <FileText size={18} /> Export Word
          </button>
          <button style={{ ...btnPrimary, background: 'rgba(255,255,255,0.15)', border: '1px solid #fff' }} onClick={() => exporterPDF(r)}>
            <FileDown size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* synthèse budget */}
      <Section titre="Synthèse budgétaire">
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          {[
            ['Coût total estimé', `${b.coutTotalEstime.toLocaleString('fr-FR')} ${devise}`],
            ['Budget disponible', b.budgetDisponible ? `${b.budgetDisponible.toLocaleString('fr-FR')} ${devise}` : '—'],
            ['Écart', b.ecart == null ? '—' : `${b.ecart >= 0 ? '+' : ''}${b.ecart.toLocaleString('fr-FR')} ${devise}`],
          ].map(([k, v]) => (
            <div key={k} style={{ background: C.light, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, color: C.muted }}>{k}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginTop: 4 }}>{v}</div>
            </div>
          ))}
          <div style={{ background: `${statutCouleur}15`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, color: C.muted }}>Statut</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: statutCouleur, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              {b.statut === 'DÉPASSEMENT' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {b.statut === 'DANS_LE_BUDGET' ? 'Dans le budget' : b.statut === 'DÉPASSEMENT' ? 'Dépassement' : 'Non renseigné'}
            </div>
          </div>
        </div>
        {/* mini-bar chart par trimestre (sans dépendance) */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 120, padding: '0 4px' }}>
          {b.repartitionParTrimestre.map((x) => (
            <div key={x.trimestre} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{x.cout.toLocaleString('fr-FR')}</div>
              <div style={{
                height: `${Math.round((x.cout / maxTrim) * 80) + 4}px`,
                background: `linear-gradient(180deg, ${C.primary}, ${C.secondary})`, borderRadius: '6px 6px 0 0',
              }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginTop: 6 }}>{x.trimestre}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* programme détaillé */}
      <Section titre="Programme annuel détaillé">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead><tr>
              <th style={th}>Action</th><th style={th}>Corps de métier</th><th style={th}>Période</th>
              <th style={th}>Durée</th><th style={{ ...th, textAlign: 'right' }}>Coût HT</th>
            </tr></thead>
            <tbody>
              {r.programmeAnnuel.map((a) => (
                <tr key={a.id}>
                  <td style={{ ...td, fontWeight: 600 }}>{a.intituleAction.split('—')[0].trim()}</td>
                  <td style={td}>{a.corpsMetier}</td>
                  <td style={td}>{a.moisLibelle} (T{a.trimestre})</td>
                  <td style={td}>{a.dureeJours} j × {a.nbGroupes}</td>
                  <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>{a.coutEstime.toLocaleString('fr-FR')} {devise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* plan par métier */}
      <Section titre="Plan par corps de métier">
        {r.planParMetier.map((p) => (
          <div key={p.corpsMetier} style={{ borderLeft: `3px solid ${C.secondary}`, paddingLeft: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.dark }}>{p.corpsMetier}
              <span style={{ fontWeight: 400, color: C.muted, fontSize: 13 }}> — {p.effectif} pers. · priorité {p.priorite}</span>
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              {p.actions.map((a) => a.intituleAction.split('—')[0].trim()).join(' · ') || 'Aucune action'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{p.joursTotal} jours-formateur · {p.coutTotal.toLocaleString('fr-FR')} {devise} HT</div>
          </div>
        ))}
      </Section>

      {/* KPI */}
      <Section titre="Indicateurs de performance (KPI — Indicateur Clé de Performance)">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead><tr><th style={th}>Indicateur</th><th style={th}>Cible</th><th style={th}>Mode de mesure</th></tr></thead>
            <tbody>{r.kpis.map((k, i) => (
              <tr key={i}><td style={{ ...td, fontWeight: 600 }}>{k.libelle}</td><td style={td}>{k.cible}</td><td style={td}>{k.modeMesure}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </Section>

      {/* impact + recommandations */}
      <Section titre="Résultats attendus & impact">
        <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.6, marginTop: 0 }}>{r.resultatsAttendus}</p>
      </Section>

      <Section titre="Cabinets & formateurs recommandés">
        {source === 'local' && (
          <div style={{ fontSize: 12, color: C.warn, marginBottom: 12, padding: '8px 12px', background: `${C.warn}15`, borderRadius: 8 }}>
            Mode hors-ligne : serveur indisponible. Recommandations sans vérification des disponibilités réelles.
          </div>
        )}

        <div style={{ fontSize: 14, color: C.dark, marginBottom: 12 }}>
          <strong>Cabinets :</strong> {r.recommandations.cabinets.length
            ? r.recommandations.cabinets.map((c) => `${c.nom} (${c.type === 'international' ? 'international' : 'local'})`).join(', ')
            : 'à sourcer'}
        </div>

        {/* Vue riche : formateurs disponibles par action (backend, agenda synchronisé) */}
        {Array.isArray(r.recommandations.formateursParAction) ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {r.recommandations.formateursParAction.map((x) => (
              <div key={x.actionId} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>
                  {x.action.split('—')[0].trim()}
                  <span style={{ fontWeight: 400, color: C.muted }}> — {x.categorie} · {x.mois}</span>
                </div>
                {x.formateursDisponibles.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {x.formateursDisponibles.map((f) => (
                      <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 10px', borderRadius: 999, background: `${C.ok}15`, color: '#047857', fontWeight: 600 }}>
                        {f.nom}{f.agrementCNFCPP ? ' · CNFCPP' : ''}{f.tarifJour ? ` · ${f.tarifJour} DT/j` : ''}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: C.danger, marginTop: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} /> {x.alerte || 'Aucun formateur disponible sur cette période.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 14, color: C.dark }}>
            <strong>Formateurs :</strong> {(r.recommandations.formateurs || []).length
              ? r.recommandations.formateurs.map((f) => `${f.nom}${f.agrementCNFCPP ? ' — CNFCPP' : ''}`).join(', ')
              : 'à sourcer'}
          </div>
        )}

        <div style={{ fontSize: 13, color: C.warn, marginTop: 12, fontWeight: 600 }}>{r.recommandations.note}</div>
      </Section>
    </div>
  );
}
