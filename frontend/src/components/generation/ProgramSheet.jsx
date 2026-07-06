// src/components/generation/ProgramSheet.jsx
// -----------------------------------------------------------------------------
// Module « Fiche programme » : vue de synthèse imprimable reprenant les
// informations du module Programme. TODO : modèle vierge à remplacer par la
// mise en page officielle ÉCA/OCTOGO une fois fournie.
// -----------------------------------------------------------------------------
import React from 'react';
import { C } from '../../constants/generationConstants';

const SectionBloc = ({ titre, valeur }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', marginBottom: 4 }}>{titre}</div>
    <div style={{ fontSize: 13.5, color: C.dark, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
      {valeur || <span style={{ color: C.muted, fontStyle: 'italic' }}>Non renseigné</span>}
    </div>
  </div>
);

export default function ProgramSheet({ data }) {
  const d = data || {};
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${C.border}` }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.dark }}>{d.titre || 'Fiche Programme'}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
          {[d.niveau, d.duree, d.nombreHeures && `${d.nombreHeures} h`].filter(Boolean).join(' · ') || 'Détails à générer'}
        </div>
      </div>
      <SectionBloc titre="Public cible" valeur={d.publicCible} />
      <SectionBloc titre="Prérequis" valeur={d.prerequis} />
      <SectionBloc titre="Objectifs pédagogiques" valeur={d.objectifsPedagogiques} />
      <SectionBloc titre="Compétences développées" valeur={d.competencesDeveloppees} />
      <SectionBloc titre="Méthodes & moyens pédagogiques" valeur={[d.methodesPedagogiques, d.moyensPedagogiques].filter(Boolean).join(' — ')} />
      <SectionBloc titre="Contenu détaillé" valeur={d.contenuDetaille} />
      <SectionBloc titre="Déroulement" valeur={d.deroulement} />
    </div>
  );
}
