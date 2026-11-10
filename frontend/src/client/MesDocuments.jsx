// src/client/MesDocuments.jsx
// -----------------------------------------------------------------------------
// Module « Mes documents » du Dashboard Client — branché sur l'API réelle
// (/api/documents). Les documents importés dans l'interface de génération
// apparaissent ici ; ils peuvent être téléchargés, consultés, supprimés et
// réutilisés comme source IA sans nouvel import.
// -----------------------------------------------------------------------------
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bouton, Badge, Carte, Modale, Chargement, EtatVide, Alerte, ChampListe, ChampTexte, fusionner } from '../evaluation/ui.jsx';
import useAccess from '../hooks/useAccess';
import {
  listerDocuments, importerDocument, supprimerDocument, telechargerDocument,
  validerFichier, formaterTaille, statutExtraction, CATEGORIES, FORMATS_ACCEPTES, TAILLE_MAX_MO,
} from '../services/documentsService';

const libelleCategorie = (v) => (CATEGORIES.find((c) => c.valeur === v) || {}).label || 'Autre';
const dateFr = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function MesDocuments({ colors }) {
  const c = fusionner(colors);
  const navigate = useNavigate();
  const { acces, peut } = useAccess();

  const [documents, setDocuments] = useState(null); // null = chargement
  const [erreurListe, setErreurListe] = useState(null);
  const [message, setMessage] = useState(null);     // { ton, texte }
  const [recherche, setRecherche] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');

  // import
  const inputRef = useRef(null);
  const [fichier, setFichier] = useState(null);
  const [categorie, setCategorie] = useState('autre');
  const [note, setNote] = useState('');
  const [erreurFichier, setErreurFichier] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [glisse, setGlisse] = useState(false);

  // modales
  const [detail, setDetail] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);
  const [telechargementId, setTelechargementId] = useState(null);

  const charger = useCallback(async () => {
    setErreurListe(null);
    try { setDocuments(await listerDocuments()); }
    catch (e) { setErreurListe(e.message); setDocuments([]); }
  }, []);
  useEffect(() => { charger(); }, [charger]);

  const peutImporter = peut('documents.upload');

  const choisirFichier = (f) => {
    const err = validerFichier(f);
    setErreurFichier(err);
    setFichier(err ? null : f);
  };

  const importer = async () => {
    if (envoi) return; // empêche la double soumission
    const err = validerFichier(fichier);
    if (err) { setErreurFichier(err); return; }
    setEnvoi(true); setMessage(null);
    try {
      const doc = await importerDocument(fichier, { categorie, note });
      setMessage({ ton: 'succes', texte: `Votre document « ${doc.nom} » a été ajouté. Vous pouvez le consulter, le télécharger ou le sélectionner comme source pour une future génération.` });
      setFichier(null); setNote(''); setErreurFichier(null);
      if (inputRef.current) inputRef.current.value = '';
      await charger();
    } catch (e) {
      setMessage({ ton: 'danger', texte: e.message });
    } finally { setEnvoi(false); }
  };

  const telecharger = async (doc) => {
    setTelechargementId(doc.id); setMessage(null);
    try { await telechargerDocument(doc); }
    catch (e) { setMessage({ ton: 'danger', texte: e.message }); }
    finally { setTelechargementId(null); }
  };

  const confirmerSuppression = async () => {
    if (suppression) return;
    setSuppression(true);
    try {
      await supprimerDocument(aSupprimer.id);
      setMessage({ ton: 'succes', texte: `Le document « ${aSupprimer.nom} » a été supprimé.` });
      setASupprimer(null); setDetail(null);
      await charger();
    } catch (e) {
      setMessage({ ton: 'danger', texte: e.message }); setASupprimer(null);
    } finally { setSuppression(false); }
  };

  const filtres = useMemo(() => (documents || []).filter((d) =>
    (!filtreCategorie || d.categorie === filtreCategorie)
    && (!recherche || d.nom.toLowerCase().includes(recherche.toLowerCase()))
  ), [documents, recherche, filtreCategorie]);

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.35rem', color: c.gray900 }}>Mes documents</h2>
        <p style={{ margin: '.4rem 0 0', color: c.gray500, fontSize: '.9rem', maxWidth: 760 }}>
          Retrouvez ici les documents que vous avez importés (besoins de formation, référentiels, rapports…).
          Chaque document peut être consulté, téléchargé, puis sélectionné comme source lors d’une génération
          de programme, sans avoir à le réimporter. Seuls les documents de votre entreprise vous sont accessibles.
        </p>
      </div>

      {message && <Alerte c={c} ton={message.ton} onFermer={() => setMessage(null)}>{message.texte}</Alerte>}
      {erreurListe && <Alerte c={c} ton="danger">{erreurListe} <button onClick={charger} style={{ marginLeft: 8, cursor: 'pointer' }}>Réessayer</button></Alerte>}

      {/* ---------- Import ---------- */}
      <Carte c={c} style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 .25rem', fontSize: '1rem', color: c.gray800 }}>Importer un document</h3>
        {acces && !peutImporter ? (
          <Alerte c={c} ton="info">
            Votre rôle ne permet pas d’importer des documents. Les rôles et les autorisations sont définis par
            l’administrateur : contactez-le si vous avez besoin d’un accès supplémentaire.
          </Alerte>
        ) : (
          <>
            <p style={{ margin: '0 0 .9rem', fontSize: '.82rem', color: c.gray500 }}>
              Formats acceptés : {FORMATS_ACCEPTES.join(', ')} — {TAILLE_MAX_MO} Mo maximum. Le texte des PDF, DOCX et TXT est lu
              automatiquement afin de pouvoir servir de source à l’IA.
            </p>
            <div
              onClick={() => inputRef.current && inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setGlisse(true); }}
              onDragLeave={() => setGlisse(false)}
              onDrop={(e) => { e.preventDefault(); setGlisse(false); choisirFichier(e.dataTransfer.files && e.dataTransfer.files[0]); }}
              style={{
                border: `2px dashed ${glisse ? c.primary : c.gray300}`, borderRadius: 14, padding: '1.5rem 1rem',
                textAlign: 'center', cursor: 'pointer', background: glisse ? c.primarySoft || '#EEF2FF' : c.gray50,
              }}
            >
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: '1.8rem', color: c.primary }} />
              <div style={{ fontWeight: 600, color: c.gray800, marginTop: 6 }}>
                {fichier ? fichier.name : 'Glissez un document ici ou cliquez pour parcourir'}
              </div>
              {fichier && <div style={{ fontSize: '.8rem', color: c.gray500 }}>{formaterTaille(fichier.size)}</div>}
              <input ref={inputRef} type="file" hidden accept={FORMATS_ACCEPTES.join(',')}
                onChange={(e) => choisirFichier(e.target.files && e.target.files[0])} />
            </div>
            {erreurFichier && <div style={{ color: c.danger, fontSize: '.82rem', marginTop: 8 }}>{erreurFichier}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <ChampListe c={c} label="Catégorie" valeur={categorie} onChange={(v) => setCategorie(v || 'autre')} options={CATEGORIES} />
              <ChampTexte c={c} label="Note (facultatif)" valeur={note} onChange={setNote} placeholder="Ex : besoin du service commercial" />
            </div>
            <Bouton c={c} icone={envoi ? 'bi-hourglass-split' : 'bi-upload'} disabled={!fichier || envoi} onClick={importer}>
              {envoi ? 'Import en cours…' : 'Importer le document'}
            </Bouton>
          </>
        )}
      </Carte>

      {/* ---------- Liste ---------- */}
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un document…"
          aria-label="Rechercher un document"
          style={{ flex: '1 1 220px', padding: '.65rem .9rem', borderRadius: 12, border: `1px solid ${c.gray300}`, fontSize: '.9rem' }} />
        <select value={filtreCategorie} onChange={(e) => setFiltreCategorie(e.target.value)} aria-label="Filtrer par catégorie"
          style={{ padding: '.65rem .9rem', borderRadius: 12, border: `1px solid ${c.gray300}`, fontSize: '.9rem' }}>
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((x) => <option key={x.valeur} value={x.valeur}>{x.label}</option>)}
        </select>
      </div>

      {documents === null ? <Chargement c={c} texte="Chargement de vos documents…" />
        : documents.length === 0 && !erreurListe ? (
          <EtatVide c={c} icone="bi-folder2-open" titre="Vous n’avez pas encore de document enregistré."
            texte="Les documents importés ici, ou dans l’interface de génération de programme, apparaîtront dans cette liste." />
        ) : filtres.length === 0 ? (
          <EtatVide c={c} icone="bi-search" titre="Aucun document ne correspond à votre recherche." texte="Modifiez la recherche ou le filtre de catégorie." />
        ) : (
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {filtres.map((d) => {
              const st = statutExtraction(d.extraction);
              const autre = acces && d.proprietaireId !== acces.id;
              return (
                <Carte key={d.id} c={c} style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <i className="bi bi-file-earmark-text" style={{ fontSize: '1.7rem', color: c.primary }} />
                    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: c.gray900, wordBreak: 'break-word' }}>{d.nom}</div>
                      <div style={{ fontSize: '.78rem', color: c.gray500, marginTop: 3, display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Badge c={c} ton="primaire">{libelleCategorie(d.categorie)}</Badge>
                        <span>{formaterTaille(d.taille)}</span><span>·</span><span>{dateFr(d.creeLe)}</span>
                        {autre && <><span>·</span><span>ajouté par {d.proprietaire}</span></>}
                        <span title={d.extraction && d.extraction.message}><Badge c={c} ton={st.ton}>{st.label}</Badge></span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                      <Bouton c={c} variante="secondaire" icone="bi-eye" onClick={() => setDetail(d)}>Voir les détails</Bouton>
                      <Bouton c={c} variante="secondaire" icone="bi-download" disabled={telechargementId === d.id} onClick={() => telecharger(d)}>
                        {telechargementId === d.id ? 'Téléchargement…' : 'Télécharger'}
                      </Bouton>
                    </div>
                  </div>
                </Carte>
              );
            })}
          </div>
        )}

      {/* ---------- Détails ---------- */}
      {detail && (
        <Modale c={c} titre={detail.nom} sousTitre={`${libelleCategorie(detail.categorie)} · ${formaterTaille(detail.taille)}`} onFermer={() => setDetail(null)}>
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.5rem 1rem', margin: '0 0 1rem', fontSize: '.88rem' }}>
            <dt style={{ color: c.gray500 }}>Ajouté le</dt><dd style={{ margin: 0 }}>{dateFr(detail.creeLe)} par {detail.proprietaire}</dd>
            <dt style={{ color: c.gray500 }}>Origine</dt>
            <dd style={{ margin: 0 }}>{detail.origine === 'generation' ? 'Importé depuis la génération de programme' : 'Importé depuis Mes documents'}</dd>
            <dt style={{ color: c.gray500 }}>Lecture par l’IA</dt><dd style={{ margin: 0 }}>{detail.extraction && detail.extraction.message}</dd>
            {detail.note && <><dt style={{ color: c.gray500 }}>Note</dt><dd style={{ margin: 0 }}>{detail.note}</dd></>}
          </dl>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            <Bouton c={c} icone="bi-download" onClick={() => telecharger(detail)}>Télécharger l’original</Bouton>
            <Bouton c={c} variante="secondaire" icone="bi-stars" onClick={() => navigate('/generation-programme')}>Utiliser pour générer un programme</Bouton>
            <Bouton c={c} variante="danger" icone="bi-trash" onClick={() => setASupprimer(detail)}>Supprimer</Bouton>
          </div>
          <p style={{ fontSize: '.78rem', color: c.gray500, marginTop: '1rem' }}>
            Dans l’étape « Description du besoin » de la génération, choisissez « Mes documents » pour sélectionner ce fichier sans le réimporter.
          </p>
        </Modale>
      )}

      {/* ---------- Confirmation de suppression ---------- */}
      {aSupprimer && (
        <Modale c={c} titre="Supprimer ce document ?" largeur="460px" onFermer={() => !suppression && setASupprimer(null)}>
          <p style={{ color: c.gray700, fontSize: '.92rem', marginTop: 0 }}>
            « {aSupprimer.nom} » sera supprimé définitivement, ainsi que sa copie sur le serveur. Les générations qui l’utilisaient perdront cette source.
          </p>
          <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
            <Bouton c={c} variante="secondaire" disabled={suppression} onClick={() => setASupprimer(null)}>Annuler</Bouton>
            <Bouton c={c} variante="danger" icone="bi-trash" disabled={suppression} onClick={confirmerSuppression}>
              {suppression ? 'Suppression…' : 'Supprimer définitivement'}
            </Bouton>
          </div>
        </Modale>
      )}
    </div>
  );
}
