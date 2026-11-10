// frontend/src/client/EspaceClient.jsx
// -----------------------------------------------------------------------------
// Vues du Dashboard Client.
//   apercu | fichiers (documents) | formations | tests | resultats | feedback
//   programmes | generation
//
// Filtré par entreprise rattachée via utilisateurs[] (voir useWorkflow).
// La vue "fichiers" gère l'upload vers /api/documents.
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import {
  getEntrepriseDuClient, getFormationsEntreprise, getContenusFormation,
  getReponsesFormation, getResultatsFormation, getFeedbacksFormation
} from '../workflow/useWorkflow';

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
const EXT_ACCEPTEES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.md', '.csv'];
const MAX_SIZE_MB = 10;
const CATEGORIES = ['Bilan stratégique', 'Organigramme', 'Effectif', 'Fiches de poste', 'Plan de formation', 'Compte-rendu', 'Support', 'Autre'];

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================
const EspaceClient = ({ vue = 'apercu', workflow, onDocumentsCount, onNavigate }) => {
  const { user } = useAuth();
  const { etat } = workflow;

  const monEntreprise = useMemo(
    () => getEntrepriseDuClient(etat, user?.id),
    [etat, user]
  );

  const mesFormations = useMemo(
    () => monEntreprise ? getFormationsEntreprise(etat, monEntreprise.id) : [],
    [etat, monEntreprise]
  );

  const mesReponses = useMemo(() => {
    if (!user?.id) return [];
    return etat.reponses.filter(r => r.participantId === user.id);
  }, [etat.reponses, user]);

  const shared = { user, etat, monEntreprise, mesFormations, mesReponses, workflow, onNavigate };

  if (vue === 'fichiers')   return <VueDocuments key="fichiers" {...shared} onDocumentsCount={onDocumentsCount} />;
  if (vue === 'formations') return <VueFormations key="formations" {...shared} />;
  if (vue === 'tests')      return <VueTests key="tests" {...shared} />;
  if (vue === 'resultats')  return <VueResultats key="resultats" {...shared} />;
  if (vue === 'feedback')   return <VueFeedback key="feedback" {...shared} />;
  if (vue === 'programmes') return <VueProgrammes key="programmes" {...shared} />;
  if (vue === 'generation') return <VueGeneration key="generation" {...shared} />;
  return <VueApercu key="apercu" {...shared} />;
};

export default EspaceClient;

// =============================================================================
// VUE : DOCUMENTS (upload réel vers /api/documents)
// =============================================================================
function VueDocuments({ user, onDocumentsCount }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('');
  const champFichier = useRef(null);

  const charger = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/documents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      const docs = data.documents || [];
      setDocuments(docs);
      if (typeof onDocumentsCount === 'function') onDocumentsCount(docs.length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { charger(); }, []); // eslint-disable-line

  const notifier = (type, texte) => {
    setNotification({ type, texte });
    setTimeout(() => setNotification(null), 3500);
  };

  const choisirFichier = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const name = f.name.toLowerCase();
    if (!EXT_ACCEPTEES.some(ext => name.endsWith(ext))) {
      notifier('error', `Format de « ${f.name} » non pris en charge.`);
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      notifier('error', `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
      return;
    }
    setPendingFile({ nom: f.name, taille: formaterTaille(f.size), fichier: f });
  };

  const uploader = async (nom, categorie) => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', pendingFile.fichier);
      form.append('categorie', categorie || 'Autre');
      form.append('sourceContext', 'client');

      const res = await fetch(`${API}/api/documents/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Erreur ${res.status}`);
      }
      setPendingFile(null);
      notifier('success', `« ${nom} » a été ajouté.`);
      await charger();
    } catch (e) {
      notifier('error', e.message || 'Échec de l’import.');
    } finally {
      setUploading(false);
    }
  };

  const supprimer = async (doc) => {
    const nom = doc.originalName || doc.nom;
    if (!window.confirm(`Supprimer « ${nom} » ?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/documents/${doc.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Suppression impossible');
      notifier('success', 'Document supprimé.');
      await charger();
    } catch (e) {
      notifier('error', e.message);
    }
  };

  const telecharger = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/documents/${doc.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Téléchargement impossible');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName || doc.nom || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      notifier('error', e.message);
    }
  };

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return documents.filter(d => {
      const nom = (d.originalName || d.nom || '').toLowerCase();
      const okCat = !filtre || d.categorie === filtre;
      const okQ = !q || nom.includes(q);
      return okCat && okQ;
    });
  }, [documents, filtre, recherche]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SectionTitle
        icon="bi-files"
        title="Mes documents"
        subtitle={`${documents.length} document(s) importé(s)`}
        action={<Button icon="bi-plus-lg" onClick={() => champFichier.current?.click()}>
          Importer un document
        </Button>}
      />

      <ContextBanner tone="guide">
        Vos documents sont conservés sur le serveur, liés à votre compte.
        Vous pouvez les télécharger à tout moment.
      </ContextBanner>

      {notification && (
        <div style={{
          marginBottom: 16, padding: '10px 14px',
          background: notification.type === 'success' ? T.successSoft : T.dangerSoft,
          color: notification.type === 'success' ? T.success : T.danger,
          borderRadius: 12, fontSize: 13.5, fontWeight: 500
        }}>{notification.texte}</div>
      )}

      <input
        ref={champFichier}
        type="file"
        hidden
        accept={EXT_ACCEPTEES.join(',')}
        onChange={choisirFichier}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <FilterPill active={!filtre} onClick={() => setFiltre('')}>Toutes</FilterPill>
          {CATEGORIES
            .filter(cat => documents.some(d => d.categorie === cat))
            .map(cat => (
              <FilterPill key={cat} active={filtre === cat} onClick={() => setFiltre(cat)}>
                {cat}
              </FilterPill>
            ))}
        </div>
        <div style={{ position: 'relative', marginLeft: 'auto', minWidth: 220 }}>
          <i className="bi bi-search" style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: T.inkFaint, pointerEvents: 'none'
          }} />
          <input type="search" placeholder="Rechercher…"
            value={recherche} onChange={(e) => setRecherche(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 36px',
              border: `1px solid ${T.line}`, borderRadius: 10,
              fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
            }} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>
          <div style={{
            width: 36, height: 36, margin: '0 auto 16px',
            border: `3px solid ${T.primarySoft}`, borderTopColor: T.primary,
            borderRadius: '50%', animation: 'apa-spin 0.9s linear infinite'
          }} />
          Chargement de vos documents…
        </div>
      ) : error ? (
        <ContextBanner tone="warning">
          {error}
          <div style={{ marginTop: 10 }}>
            <Button variant="secondary" icon="bi-arrow-clockwise" onClick={charger}>
              Réessayer
            </Button>
          </div>
        </ContextBanner>
      ) : visibles.length === 0 ? (
        <Empty icon="bi-files"
          title={documents.length === 0 ? 'Aucun document' : 'Aucun résultat'}
          texte={documents.length === 0
            ? 'Cliquez sur « Importer un document » pour ajouter votre premier fichier.'
            : 'Aucun document ne correspond à votre recherche.'}
          action={documents.length === 0
            ? <Button icon="bi-plus-lg" onClick={() => champFichier.current?.click()}>
                Importer un document
              </Button>
            : null}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {visibles.map(d => {
            const nom = d.originalName || d.nom;
            return (
              <Card key={d.id}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: T.primarySoft, color: T.primary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className={`bi ${iconeDocument(nom)}`} style={{ fontSize: 20 }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 700, color: T.ink, fontSize: 13.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }} title={nom}>{nom}</div>
                    <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 2 }}>
                      {typeDocument(nom)} · {d.taille || formaterTaille(d.size)}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: T.inkFaint, marginBottom: 12 }}>
                  <i className="bi bi-calendar3" style={{ marginRight: 4 }} />
                  {d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '—'}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Button variant="secondary" icon="bi-download" onClick={() => telecharger(d)}>
                    Télécharger
                  </Button>
                  <Button variant="danger" icon="bi-trash" onClick={() => supprimer(d)}>
                    Supprimer
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {pendingFile && (
        <ModalFileUpload
          initial={pendingFile}
          uploading={uploading}
          onClose={() => !uploading && setPendingFile(null)}
          onValidate={uploader}
        />
      )}
    </motion.div>
  );
}

const ModalFileUpload = ({ initial, uploading, onClose, onValidate }) => {
  const [categorie, setCategorie] = useState('Autre');
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
      backdropFilter: 'blur(4px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.white, borderRadius: 20, maxWidth: 480,
          width: '100%', padding: 24, boxShadow: T.shadowLg
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: T.ink }}>
          Ajouter un document
        </h3>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: T.bgSunken, borderRadius: 12, padding: 14, marginBottom: 16
        }}>
          <i className={`bi ${iconeDocument(initial.nom)}`} style={{ color: T.primary, fontSize: 22 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: T.ink, fontSize: 13.5 }}>{initial.nom}</div>
            <div style={{ fontSize: 11.5, color: T.inkMuted }}>
              {typeDocument(initial.nom)} · {initial.taille}
            </div>
          </div>
        </div>
        <Field label="Catégorie">
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              border: `1.5px solid ${T.line}`, borderRadius: 10,
              fontSize: 13.5, fontFamily: 'inherit'
            }}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <Button variant="secondary" onClick={onClose} disabled={uploading}>Annuler</Button>
          <Button onClick={() => onValidate(initial.nom, categorie)} disabled={uploading}>
            {uploading ? 'Envoi…' : 'Enregistrer'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// =============================================================================
// VUE : APERÇU
// =============================================================================
function VueApercu({ user, monEntreprise, mesFormations, mesReponses, onNavigate }) {
  const prenom = (user?.name || '').split(' ')[0] || '';

  if (!monEntreprise) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionTitle icon="bi-grid-1x2"
          title={`Bonjour${prenom ? `, ${prenom}` : ''}`}
          subtitle="Votre espace de formation" />
        <Empty icon="bi-building" title="Aucune entreprise rattachée"
          texte="Votre compte n'est rattaché à aucune entreprise pour le moment. Contactez votre administrateur." />
      </motion.div>
    );
  }

  const stats = {
    formations: mesFormations.length,
    testsFaits: mesReponses.length,
    testsAttendus: mesFormations.length * 2
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SectionTitle icon="bi-grid-1x2"
        title={`Bonjour${prenom ? `, ${prenom}` : ''}`}
        subtitle={monEntreprise.nom} />

      <ContextBanner tone="guide">
        Retrouvez ici vos formations, vos tests, vos résultats et votre feedback.
      </ContextBanner>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <KpiCard icon="bi-calendar3" label="Formations" value={stats.formations} sub="assignées" />
        <KpiCard icon="bi-clipboard-check" label="Tests faits"
          value={`${stats.testsFaits}/${stats.testsAttendus}`}
          sub="complétés" />
      </div>

      {mesFormations.length === 0 && (
        <Empty icon="bi-calendar3" title="Aucune formation assignée"
          texte="Votre administrateur ne vous a pas encore assigné de formation." />
      )}
    </motion.div>
  );
}

// =============================================================================
// VUE : FORMATIONS
// =============================================================================
function VueFormations({ user, etat, monEntreprise, mesFormations, onNavigate }) {
  if (!monEntreprise) {
    return (
      <div>
        <SectionTitle icon="bi-calendar3" title="Mes formations" />
        <Empty icon="bi-building" title="Entreprise non rattachée"
          texte="Contactez votre administrateur." />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SectionTitle icon="bi-calendar3" title="Mes formations"
        subtitle={`${mesFormations.length} formation(s) · ${monEntreprise.nom}`} />

      {mesFormations.length === 0 ? (
        <Empty icon="bi-calendar3" title="Aucune formation"
          texte="Aucune formation ne vous a encore été assignée." />
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {mesFormations.map(f => {
            const reponses = getReponsesFormation(etat, f.id);
            const mesRep = reponses.filter(r => r.participantId === user?.id);
            const preOk = mesRep.some(r => r.type === 'pre');
            const postOk = mesRep.some(r => r.type === 'post');
            const resultats = getResultatsFormation(etat, f.id);
            return (
              <Card key={f.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{f.titre}</div>
                    <div style={{ fontSize: 12.5, color: T.inkMuted, marginTop: 3 }}>{f.theme}</div>
                  </div>
                  <Badge tone={statutTone(f.statut)}>{statutLabel(f.statut)}</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, paddingTop: 12, borderTop: `1px solid ${T.lineSoft}`, marginBottom: 14 }}>
                  <Mini label="Prétest" value={preOk ? '✓ Terminé' : 'À faire'} color={preOk ? T.success : T.warning} />
                  <Mini label="Post-test" value={postOk ? '✓ Terminé' : 'À faire'} color={postOk ? T.success : T.warning} />
                  <Mini label="Résultats" value={resultats.length > 0 ? 'Publiés' : 'Non publiés'} color={resultats.length > 0 ? T.success : T.inkMuted} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button variant="secondary" icon="bi-clipboard-check" onClick={() => onNavigate('tests')}>
                    Voir mes tests
                  </Button>
                  {resultats.length > 0 && (
                    <Button variant="secondary" icon="bi-file-bar-graph" onClick={() => onNavigate('resultats')}>
                      Voir mes résultats
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// VUE : TESTS
// =============================================================================
function VueTests({ user, etat, monEntreprise, mesFormations }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SectionTitle icon="bi-clipboard-check" title="Mes tests" subtitle="Tests pré et post-formation" />

      {!monEntreprise ? (
        <Empty icon="bi-building" title="Aucune entreprise" texte="Contactez votre administrateur." />
      ) : mesFormations.length === 0 ? (
        <Empty icon="bi-clipboard-check" title="Aucun test" texte="Aucune formation assignée." />
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {mesFormations.map(f => {
            const contenus = getContenusFormation(etat, f.id);
            const reponses = getReponsesFormation(etat, f.id);
            const mesRep = reponses.filter(r => r.participantId === user?.id);
            const testPre = contenus.find(c => c.type === 'test_pre');
            const testPost = contenus.find(c => c.type === 'test_post');
            const repPre = mesRep.find(r => r.type === 'pre');
            const repPost = mesRep.find(r => r.type === 'post');

            return (
              <Card key={f.id}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 12 }}>{f.titre}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, background: repPre ? T.successSoft : T.bgSunken, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: repPre ? T.success : T.primarySoft, color: repPre ? T.white : T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${repPre ? 'bi-check2' : 'bi-clipboard-check'}`} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: T.ink, fontSize: 13.5 }}>Prétest</div>
                    <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 2 }}>
                      {repPre ? `Terminé — ${repPre.score}/100` : testPre ? 'Disponible' : 'Non fourni'}
                    </div>
                  </div>
                  {repPre && <div style={{ fontSize: 18, fontWeight: 800, color: T.success }}>{repPre.score}/100</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, background: repPost ? T.successSoft : T.bgSunken, opacity: repPre ? 1 : 0.6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: repPost ? T.success : T.lineSoft, color: repPost ? T.white : T.inkFaint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${repPost ? 'bi-check2' : 'bi-clipboard-check'}`} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: T.ink, fontSize: 13.5 }}>Post-test</div>
                    <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 2 }}>
                      {repPost ? `Terminé — ${repPost.score}/100` : repPre ? (testPost ? 'Disponible' : 'Non fourni') : 'Après le prétest'}
                    </div>
                  </div>
                  {repPost && <div style={{ fontSize: 18, fontWeight: 800, color: T.success }}>{repPost.score}/100</div>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// VUE : RÉSULTATS
// =============================================================================
function VueResultats({ etat, mesFormations }) {
  const resultatsDispo = mesFormations.flatMap(f => {
    const res = getResultatsFormation(etat, f.id);
    return res.map(r => ({ formation: f, resultat: r }));
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SectionTitle icon="bi-file-bar-graph" title="Mes résultats" subtitle={`${resultatsDispo.length} rapport(s)`} />

      {resultatsDispo.length === 0 ? (
        <Empty icon="bi-file-bar-graph" title="Aucun résultat" texte="Vos résultats apparaîtront ici une fois publiés." />
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {resultatsDispo.map(({ formation, resultat }) => (
            <Card key={resultat.id}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{formation.titre}</div>
              <div style={{ fontSize: 12, color: T.inkMuted, marginBottom: 14 }}>
                Publié le {new Date(resultat.publieLe).toLocaleDateString('fr-FR')}
              </div>
              {resultat.rapport?.synthese && (
                <ul style={{ margin: '0 0 14px 18px', padding: 0, fontSize: 13, color: T.inkSoft, lineHeight: 1.6 }}>
                  {resultat.rapport.synthese.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              )}
              {resultat.kpis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, paddingTop: 12, borderTop: `1px solid ${T.lineSoft}` }}>
                  <Mini label="Score pré" value={resultat.kpis.scoreMoyenPre != null ? `${resultat.kpis.scoreMoyenPre}/100` : '—'} />
                  <Mini label="Score post" value={resultat.kpis.scoreMoyenPost != null ? `${resultat.kpis.scoreMoyenPost}/100` : '—'} />
                  <Mini label="Progression" value={resultat.kpis.progression != null ? `${resultat.kpis.progression > 0 ? '+' : ''}${resultat.kpis.progression}` : '—'} color={resultat.kpis.progression > 0 ? T.success : T.danger} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// VUE : FEEDBACK
// =============================================================================
function VueFeedback({ etat, mesFormations, workflow }) {
  const [formationId, setFormationId] = useState(mesFormations[0]?.id || '');
  const [form, setForm] = useState({ note: 4, qualite: 4, organisation: 4, pertinence: 4, commentaire: '', ameliorations: '' });
  const [busy, setBusy] = useState(false);

  const mesFeedbacks = etat.feedbacks.filter(f =>
    mesFormations.some(mf => mf.id === f.formationId)
  );

  const envoyer = async () => {
    if (!formationId) return;
    setBusy(true);
    workflow.envoyerFeedback({ formationId, ...form });
    setBusy(false);
    setForm({ note: 4, qualite: 4, organisation: 4, pertinence: 4, commentaire: '', ameliorations: '' });
  };

  if (mesFormations.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <SectionTitle icon="bi-chat-square-text" title="Feedback & Satisfaction" />
        <Empty icon="bi-chat-square-text" title="Aucune formation"
          texte="Vous devez avoir suivi une formation pour donner un feedback." />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SectionTitle icon="bi-chat-square-text" title="Feedback & Satisfaction"
        subtitle="Partagez votre retour" />

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: T.ink }}>Donner un feedback</h3>
        <Field label="Formation">
          <select value={formationId} onChange={(e) => setFormationId(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit' }}>
            {mesFormations.map(f => <option key={f.id} value={f.id}>{f.titre}</option>)}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 16 }}>
          {['note', 'qualite', 'organisation', 'pertinence'].map(k => (
            <Field key={k} label={labelFeedback(k)}>
              <select value={form[k]} onChange={(e) => setForm(f => ({ ...f, [k]: parseInt(e.target.value) }))}
                style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit' }}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}
              </select>
            </Field>
          ))}
        </div>
        <Field label="Commentaire">
          <textarea rows={3} value={form.commentaire} onChange={(e) => setForm(f => ({ ...f, commentaire: e.target.value }))}
            placeholder="Votre avis général…"
            style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button icon="bi-send" onClick={envoyer} disabled={busy}>
            {busy ? 'Envoi…' : 'Envoyer le feedback'}
          </Button>
        </div>
      </Card>

      {mesFeedbacks.length > 0 && (
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: T.ink }}>
            Historique ({mesFeedbacks.length})
          </h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {mesFeedbacks.map(f => {
              const formation = mesFormations.find(x => x.id === f.formationId);
              return (
                <div key={f.id} style={{ background: T.bgSunken, borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, color: T.ink, fontSize: 13.5 }}>{formation?.titre}</div>
                    <Badge tone={f.statut === 'traite' ? 'success' : f.statut === 'en_cours' ? 'warning' : 'info'}>
                      {f.statut === 'nouveau' ? 'En attente' : f.statut === 'en_cours' ? 'En cours' : 'Traité'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 12, color: T.inkMuted }}>
                    Note : {f.note}/5 · {new Date(f.envoyeLe).toLocaleDateString('fr-FR')}
                  </div>
                  {f.reponseAdmin && (
                    <div style={{ marginTop: 10, padding: 10, background: T.successSoft, borderRadius: 8, fontSize: 12.5, color: '#065F46' }}>
                      <strong>Réponse admin :</strong> {f.reponseAdmin}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

// =============================================================================
// VUE : PROGRAMMES (programmes générés localement)
// =============================================================================
function VueProgrammes({ user }) {
  const PROGS_KEY = 'apa_programmes_locaux_v2';
  const programmes = (() => {
    try {
      const all = JSON.parse(localStorage.getItem(PROGS_KEY) || '{}');
      return all[user?.id] || [];
    } catch { return []; }
  })();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SectionTitle icon="bi-signpost-2" title="Compétences et parcours" subtitle={`${programmes.length} programme(s)`} />
      {programmes.length === 0 ? (
        <Empty icon="bi-signpost-2" title="Aucun programme" texte="Générez un programme depuis l'onglet Génération IA." />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {programmes.map(p => (
            <Card key={p.id}>
              <div style={{ fontWeight: 700, color: T.ink, fontSize: 15 }}>{p.titre}</div>
              <div style={{ fontSize: 12.5, color: T.inkMuted, marginTop: 4 }}>
                {new Date(p.genere_le).toLocaleDateString('fr-FR')} · {p.duree}
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// VUE : GÉNÉRATION (utilise /api/documents + règles locales)
// =============================================================================
function VueGeneration({ user }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState([]);
  const [params, setParams] = useState({ objectif: '', public: '', duree: '', niveau: 'Intermédiaire', categorie: 'Parcours' });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/api/documents`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const toggle = (id) => setSelection(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const lancer = async () => {
    if (!selection.length) return;
    setRunning(true);
    await new Promise(r => setTimeout(r, 800));

    const docsSources = documents.filter(d => selection.includes(d.id));
    const objectifFinal = params.objectif?.trim() || 'Développer les compétences clés identifiées';

    const programme = {
      id: `prog_${Date.now()}`,
      titre: `Programme — ${objectifFinal.slice(0, 60)}`,
      categorie: params.categorie || 'Parcours',
      objectif: objectifFinal,
      public: params.public || 'Managers',
      duree: params.duree || '3 jours',
      niveau: params.niveau,
      structure: [
        { titre: 'Cadrage et objectifs', duree: '0.5 j', objectifs: ['Comprendre le contexte'] },
        { titre: 'Apports fondamentaux', duree: '1 j', objectifs: ['Maîtriser les bases'] },
        { titre: 'Mise en pratique', duree: '1 j', objectifs: ['Appliquer sur cas réels'] },
        { titre: 'Ancrage et évaluation', duree: '0.5 j', objectifs: ['Consolider les acquis'] }
      ],
      sources: docsSources.map(d => ({ id: d.id, nom: d.originalName || d.nom })),
      genere_le: new Date().toISOString()
    };

    try {
      const PROGS_KEY = 'apa_programmes_locaux_v2';
      const all = JSON.parse(localStorage.getItem(PROGS_KEY) || '{}');
      if (!all[user?.id]) all[user.id] = [];
      all[user.id].unshift(programme);
      localStorage.setItem(PROGS_KEY, JSON.stringify(all));
    } catch {}

    setResult({ programme, sourcesUsed: selection });
    setRunning(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: T.inkMuted }}>Chargement…</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <SectionTitle icon="bi-stars" title="Génération IA" subtitle="Composez un programme à partir de vos documents" />

      {documents.length === 0 ? (
        <Empty icon="bi-files" title="Aucun document" texte="Importez d'abord des documents dans « Mes documents »." />
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: T.ink }}>
              1. Sélectionnez les documents sources
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
              {documents.map(d => {
                const active = selection.includes(d.id);
                const nom = d.originalName || d.nom;
                return (
                  <label key={d.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 12, borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${active ? T.primary : T.line}`,
                    background: active ? T.primarySoft : T.white
                  }}>
                    <input type="checkbox" checked={active} onChange={() => toggle(d.id)}
                      style={{ accentColor: T.primary }} />
                    <i className={`bi ${iconeDocument(nom)}`} style={{ color: T.primary, fontSize: 16 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nom}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: T.ink }}>
              2. Contexte
            </h3>
            <Field label="Objectif">
              <textarea rows={2} value={params.objectif}
                onChange={(e) => setParams({ ...params, objectif: e.target.value })}
                placeholder="Ex. Renforcer les compétences managériales."
                style={{ width: '100%', padding: 12, border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <Field label="Public">
                <input value={params.public} onChange={(e) => setParams({ ...params, public: e.target.value })}
                  placeholder="Managers…" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </Field>
              <Field label="Durée">
                <input value={params.duree} onChange={(e) => setParams({ ...params, duree: e.target.value })}
                  placeholder="3 jours" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.line}`, borderRadius: 10, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </Field>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: T.ink }}>
              3. Lancer
            </h3>
            <Button icon="bi-stars" disabled={!selection.length || running} onClick={lancer}>
              {running ? 'Génération…' : `Générer${selection.length ? ` (${selection.length})` : ''}`}
            </Button>
          </Card>

          {result && (
            <Card style={{ marginTop: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.ink }}>
                <i className="bi bi-check2-circle" style={{ color: T.success, marginRight: 8 }} />
                {result.programme.titre}
              </h3>
              <p style={{ marginTop: 12, color: T.inkSoft, fontSize: 13.5 }}>
                <strong>Objectif :</strong> {result.programme.objectif}
              </p>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}

function labelFeedback(k) {
  return { note: 'Note globale', qualite: 'Qualité', organisation: 'Organisation', pertinence: 'Pertinence' }[k];
}
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
function formaterTaille(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
function iconeDocument(nom) {
  const ext = (nom || '').toLowerCase().split('.').pop();
  if (ext === 'pdf') return 'bi-file-earmark-pdf';
  if (ext === 'doc' || ext === 'docx') return 'bi-file-earmark-word';
  if (ext === 'xls' || ext === 'xlsx') return 'bi-file-earmark-excel';
  if (ext === 'txt' || ext === 'md' || ext === 'csv') return 'bi-file-earmark-text';
  return 'bi-file-earmark';
}
function typeDocument(nom) {
  const ext = (nom || '').toLowerCase().split('.').pop();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc' || ext === 'docx') return 'Word';
  if (ext === 'xls' || ext === 'xlsx') return 'Excel';
  if (ext === 'txt' || ext === 'md' || ext === 'csv') return 'Texte';
  return 'Autre';
}

// =============================================================================
// PRIMITIVES UI
// =============================================================================
const SectionTitle = ({ icon, title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
    <div style={{ minWidth: 0 }}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: T.ink, display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <i className={`bi ${icon}`} style={{ color: T.primary }} />}
        {title}
      </h2>
      {subtitle && <p style={{ margin: '5px 0 0', color: T.inkMuted, fontSize: 13.5 }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 16, padding: 20, boxShadow: T.shadowSm, ...style }}>{children}</div>
);

const Button = ({ children, variant = 'primary', icon, disabled, onClick }) => {
  const variants = {
    primary:   { bg: T.primaryGradient, fg: T.white, border: 'none' },
    secondary: { bg: T.white, fg: T.inkSoft, border: `1.5px solid ${T.line}` },
    danger:    { bg: T.dangerSoft, fg: T.danger, border: `1px solid ${T.danger}33` }
  };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '10px 18px', borderRadius: 12,
        background: v.bg, color: v.fg, border: v.border,
        fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1
      }}>
      {icon && <i className={`bi ${icon}`} style={{ fontSize: 15 }} />}
      <span>{children}</span>
    </button>
  );
};

const KpiCard = ({ icon, label, value, sub, tone }) => (
  <div style={{ background: T.white, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, boxShadow: T.shadowSm }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${tone || T.primary}18`, color: tone || T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
        <i className={`bi ${icon}`} />
      </div>
      <div style={{ fontSize: 11.5, color: T.inkMuted, fontWeight: 600 }}>{label}</div>
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color: tone || T.ink, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11.5, color: T.inkFaint, marginTop: 4 }}>{sub}</div>}
  </div>
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
    warning: { bg: T.warningSoft, border: '#FDE68A', icon: 'bi-exclamation-triangle-fill', fg: '#92400E' }
  };
  const t = tones[tone] || tones.guide;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: t.fg, lineHeight: 1.55 }}>
      <i className={`bi ${t.icon}`} style={{ fontSize: 15, marginTop: 1, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
};

const Empty = ({ icon = 'bi-inbox', title, texte, action }) => (
  <div style={{ padding: 40, background: T.bgSunken, borderRadius: 16, border: `1px dashed ${T.line}`, textAlign: 'center' }}>
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

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: T.inkSoft, fontSize: 13 }}>{label}</label>}
    {children}
    {hint && <div style={{ fontSize: 11.5, color: T.inkMuted, marginTop: 4 }}>{hint}</div>}
  </div>
);