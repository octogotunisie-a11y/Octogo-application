// src/components/generation/TrainingDetailsForm.jsx
// -----------------------------------------------------------------------------
// Étape 3 — VERSION MINIMALISTE.
// Le client ne renseigne QUE ce qu'il sait réellement : le sujet, le nombre
// de participants, les informations de son entreprise, ses objectifs, et
// quelques infos complémentaires facultatives.
//
// Tout le reste (contenu pédagogique, nombre d'heures, modules, formateur,
// devis, facture, évaluations, KPI, étude d'impact) sera généré
// AUTOMATIQUEMENT à l'étape suivante par le moteur de simulation (backend),
// qui préfigure le futur modèle IA — voir backend/simulationEngine.js.
//
// La liste des thèmes vient du backend (aucune donnée codée en dur ici).
// -----------------------------------------------------------------------------
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { C, MODALITES, LANGUES, SECTEURS_ACTIVITE, CHAMPS_PAR_TYPE } from '../../constants/generationConstants';
import { listerThemes } from '../../services/generationService';
import { useMock, documentsDe, utilisateurParEmail } from '../../mock/mockStore.jsx';
import { useAuth } from '../../AuthContext';

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
  fontSize: 14, color: C.dark, outline: 'none', boxSizing: 'border-box',
  background: '#fff', fontFamily: 'inherit',
};

const Label = ({ children, requis }) => (
  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>
    {children}{requis && <span style={{ color: C.danger }}> *</span>}
  </label>
);

const Field = ({ label, requis, children }) => (
  <div style={{ marginBottom: 16 }}>
    <Label requis={requis}>{label}</Label>
    {children}
  </div>
);

const Grid = ({ children, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0 16px' }}>{children}</div>
);

export default function TrainingDetailsForm({ details, setDetailField, type }) {
  // Documents de référence de la société — sélection préparant le futur flow
  // « documents → IA → programme ». Aucun fichier n'est lu ni transmis ici.
  const { user } = useAuth();
  const mock = useMock();
  const profil = utilisateurParEmail(mock, user && user.email);
  const societeId = profil ? profil.societe_id : (mock.societes[0] || {}).id;
  const documents = documentsDe(mock, societeId);
  const selection = details.documentsReference || [];
  const basculerDoc = (id) => setDetailField(
    'documentsReference',
    selection.includes(id) ? selection.filter((x) => x !== id) : [...selection, id]
  );

  const [themes, setThemes] = useState([]);
  const [chargementThemes, setChargementThemes] = useState(true);
  const [erreurThemes, setErreurThemes] = useState(null);
  const [ouvrirComplement, setOuvrirComplement] = useState(false);

  const chargerThemes = () => {
    setChargementThemes(true);
    setErreurThemes(null);
    listerThemes()
      .then((liste) => {
        if (!liste.length) throw new Error('Liste vide');
        setThemes(liste);
      })
      .catch(() => setErreurThemes('Impossible de charger la liste des thèmes. Vérifiez que le backend est démarré (node server.js) et réessayez.'))
      .finally(() => setChargementThemes(false));
  };

  useEffect(() => { chargerThemes(); }, []);

  const val = (k) => details[k] ?? '';
  const upd = (k) => (e) => setDetailField(k, e.target.value);

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
        background: `${C.primary}08`, border: `1px solid ${C.primary}25`, borderRadius: 10, marginBottom: 22,
      }}>
        <Sparkles size={16} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: 13, color: C.dark, lineHeight: 1.5 }}>
          Renseignez uniquement ce que vous savez. Le programme détaillé, le nombre d\u2019heures, le
          formateur, le devis et tous les autres documents seront générés automatiquement à l\u2019étape suivante.
        </span>
      </div>

      <Field label="Sujet / formation souhaitée" requis>
        <select style={inputStyle} value={val('theme')} onChange={upd('theme')} disabled={chargementThemes || !themes.length}>
          <option value="">{chargementThemes ? 'Chargement…' : themes.length ? 'Sélectionner un thème…' : 'Aucun thème disponible'}</option>
          {themes.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        {erreurThemes && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12.5, color: C.danger }}>{erreurThemes}</span>
            <button onClick={chargerThemes} style={{ fontSize: 12, fontWeight: 700, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Réessayer
            </button>
          </div>
        )}
      </Field>

      <Grid>
        <Field label="Nombre de participants" requis>
          <input type="number" min="1" style={inputStyle} value={val('nbParticipants')} onChange={upd('nbParticipants')} placeholder="Ex : 15" />
        </Field>
        <Field label="Nom de la société" requis>
          <input style={inputStyle} value={val('societe')} onChange={upd('societe')} placeholder="Ex : BIAT Banque" />
        </Field>
      </Grid>

      <Grid>
        <Field label="Secteur d\u2019activité">
          <select style={inputStyle} value={val('secteur')} onChange={upd('secteur')}>
            <option value="">Sélectionner\u2026</option>
            {SECTEURS_ACTIVITE.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Ville">
          <input style={inputStyle} value={val('ville')} onChange={upd('ville')} placeholder="Ex : Tunis" />
        </Field>
      </Grid>

      <Field label="Objectifs de la formation" requis>
        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={val('objectifs')} onChange={upd('objectifs')} placeholder="Quels résultats attendez-vous de cette formation ?" />
      </Field>

      <button
        onClick={() => setOuvrirComplement((o) => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
          color: C.primary, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', marginBottom: 8,
        }}
      >
        {ouvrirComplement ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Informations complémentaires (facultatif)
      </button>

      {/* Champs propres à la catégorie choisie — définis dans CHAMPS_PAR_TYPE,
          jamais dupliqués dans un formulaire séparé par catégorie. */}
      {(CHAMPS_PAR_TYPE[type] || []).length > 0 && (
        <Grid cols={2}>
          {(CHAMPS_PAR_TYPE[type] || []).map((champ) => (
            <Field key={champ.cle} label={champ.label}>
              {champ.type === 'select' ? (
                <select style={inputStyle} value={val(champ.cle)} onChange={upd(champ.cle)}>
                  <option value="">— Choisir —</option>
                  {champ.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : champ.type === 'textarea' ? (
                <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }}
                  value={val(champ.cle)} onChange={upd(champ.cle)} />
              ) : (
                <input type={champ.type === 'number' ? 'number' : 'text'}
                  min={champ.min} max={champ.max}
                  style={inputStyle} value={val(champ.cle)} onChange={upd(champ.cle)} />
              )}
            </Field>
          ))}
        </Grid>
      )}

      {/* Documents de référence de la société */}
      <Field label="Documents de référence de la société">
        {documents.length === 0 ? (
          <div style={{ fontSize: 13, color: C.muted }}>
            Aucun document. Ajoutez-en depuis l’onglet « Mes fichiers » de votre espace.
          </div>
        ) : (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 8, maxHeight: 180, overflowY: 'auto' }}>
            {documents.map((d) => (
              <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', cursor: 'pointer', fontSize: 13.5, color: C.dark }}>
                <input type="checkbox" checked={selection.includes(d.id)} onChange={() => basculerDoc(d.id)} />
                <span style={{ flex: 1 }}>{d.nom}</span>
                <span style={{ fontSize: 11.5, color: C.muted }}>{d.categorie}</span>
              </label>
            ))}
          </div>
        )}
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
          Ces documents serviront de contexte lors de la future génération. Aucun fichier n’est analysé à ce stade.
        </div>
      </Field>

      {ouvrirComplement && (
        <div style={{ paddingTop: 8 }}>
          <Grid cols={3}>
            <Field label="Responsable">
              <input style={inputStyle} value={val('responsable')} onChange={upd('responsable')} placeholder="Nom du contact" />
            </Field>
            <Field label="Format">
              <select style={inputStyle} value={val('modalite')} onChange={upd('modalite')}>
                {MODALITES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Date souhaitée">
              <input type="date" style={inputStyle} value={val('datePrevue')} onChange={upd('datePrevue')} />
            </Field>
          </Grid>
          <Field label="Langue souhaitée">
            <select style={inputStyle} value={val('langue')} onChange={upd('langue')}>
              {LANGUES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Commentaires / contraintes">
            <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={val('commentaires')} onChange={upd('commentaires')} placeholder="Toute autre information utile" />
          </Field>
        </div>
      )}
    </div>
  );
}
