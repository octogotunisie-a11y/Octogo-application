// src/components/generation/TrainingProgramCard.jsx
// -----------------------------------------------------------------------------
// Contenu détaillé du module « Programme de formation ».
// TODO IA : tous les champs ci-dessous sont ceux que le modèle devra remplir
// (voir MODULES.programme.champs dans generationConstants.js).
// -----------------------------------------------------------------------------
import React from 'react';
import { Pencil, Save } from 'lucide-react';
import { C } from '../../constants/generationConstants';
import { Row, Grid, useEditableData } from './shared/fields';
import { calculerDuree } from '../../utils/durationCalculator';

export default function TrainingProgramCard({ data, onChange, editable, onToggleEdit }) {
  const { data: d, set } = useEditableData(data, onChange);
  const duree = calculerDuree(d.decoupageModules);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={onToggleEdit} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
          color: C.primary, background: 'none', border: 'none', cursor: 'pointer',
        }}>
          {editable ? <><Save size={14} /> Terminer l\u2019édition</> : <><Pencil size={14} /> Éditer les champs</>}
        </button>
      </div>

      <Grid>
        <Row label="Titre" value={d.titre} editable={editable} onChange={(v) => set('titre', v)} />
        <Row label="Niveau" value={d.niveau} editable={editable} onChange={(v) => set('niveau', v)} />
        <Row label="Durée" value={d.duree} editable={editable} onChange={(v) => set('duree', v)} />
        <Row label="Nombre d\u2019heures" value={d.nombreHeures} editable={editable} onChange={(v) => set('nombreHeures', v)} />
      </Grid>
      <Row label="Public cible" value={d.publicCible} editable={editable} onChange={(v) => set('publicCible', v)} />
      <Row label="Prérequis" value={d.prerequis} editable={editable} onChange={(v) => set('prerequis', v)} textarea />
      <Row label="Introduction" value={d.introduction} editable={editable} onChange={(v) => set('introduction', v)} textarea />
      <Row label="Objectifs pédagogiques" value={d.objectifsPedagogiques} editable={editable} onChange={(v) => set('objectifsPedagogiques', v)} textarea />
      <Row label="Compétences développées" value={d.competencesDeveloppees} editable={editable} onChange={(v) => set('competencesDeveloppees', v)} textarea />
      <Row label="Méthodes pédagogiques" value={d.methodesPedagogiques} editable={editable} onChange={(v) => set('methodesPedagogiques', v)} textarea />
      <Row label="Moyens pédagogiques" value={d.moyensPedagogiques} editable={editable} onChange={(v) => set('moyensPedagogiques', v)} textarea />
      <Row label="Contenu détaillé" value={d.contenuDetaille} editable={editable} onChange={(v) => set('contenuDetaille', v)} textarea />
      <Row label="Déroulement" value={d.deroulement} editable={editable} onChange={(v) => set('deroulement', v)} textarea />
      <Row label="Ateliers" value={d.ateliers} editable={editable} onChange={(v) => set('ateliers', v)} textarea />
      <Row label="Exercices" value={d.exercices} editable={editable} onChange={(v) => set('exercices', v)} textarea />
      <Row label="Conclusion" value={d.conclusion} editable={editable} onChange={(v) => set('conclusion', v)} textarea />

      {/* Calcul automatique de la durée — dérivé du découpage par modules, sans IA */}
      <div style={{ marginTop: 16, padding: 14, background: '#fff', borderRadius: 10, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 10, textTransform: 'uppercase' }}>
          Calcul automatique de la durée
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted }}>Total heures</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{duree.nombreTotalHeures} h</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted }}>Total jours</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{duree.nombreJours} j</div>
          </div>
        </div>
        {duree.repartitionParModule.length > 0 ? (
          <div>
            {duree.repartitionParModule.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
                <span style={{ color: C.dark }}>{m.titre}</span>
                <span style={{ color: C.muted }}>{m.heures} h</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: C.muted, fontStyle: 'italic' }}>
            Aucun découpage par module renseigné pour l\u2019instant.
          </div>
        )}
      </div>
    </div>
  );
}
