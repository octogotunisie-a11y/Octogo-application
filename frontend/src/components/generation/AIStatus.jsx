// src/components/generation/AIStatus.jsx
// -----------------------------------------------------------------------------
// Bandeau d'état affiché en haut de l'espace de travail : indique que les
// documents ont été générés par le moteur de SIMULATION (données de
// démonstration issues de backend/data/simulation/*.json), en attendant le
// branchement du modèle IA réel.
// TODO IA : remplacer ce bandeau par un vrai indicateur de statut du modèle
// une fois celui-ci branché (connecté / quota / erreur...).
// -----------------------------------------------------------------------------
import React from 'react';
import { Sparkles } from 'lucide-react';
import { C } from '../../constants/generationConstants';

export default function AIStatus() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
      background: `${C.info}0D`, border: `1px solid ${C.info}30`, borderRadius: 12, marginBottom: 20,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: `${C.info}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Sparkles size={18} color={C.info} />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.dark }}>Mode simulation — Modèle IA non branché</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
          Tous les documents ci-dessous ont été générés automatiquement à partir de données de
          démonstration (formateurs, tarifs, disponibilités, contenus fictifs). Utilisez
          <strong> Régénérer</strong> pour simuler une nouvelle proposition, ou <strong>Modifier</strong> pour
          ajuster manuellement. Le modèle IA remplacera ces données sans changement d\u2019interface.
        </div>
      </div>
    </div>
  );
}
