// src/components/generation/KPIPage.jsx
// TODO IA : ces indicateurs seront à terme calculés à partir des évaluations
// réelles collectées (module EvaluationGenerator) et des données d'agenda.
import React from 'react';
import { C } from '../../constants/generationConstants';

const KPI_LIST = [
  ['tauxSatisfaction', 'Taux de satisfaction'],
  ['tauxParticipation', 'Taux de participation'],
  ['tauxReussite', 'Taux de réussite'],
  ['roi', 'ROI (Retour sur investissement)'],
  ['efficacite', 'Efficacité'],
];

export default function KPIPage({ data }) {
  const d = data || {};
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        {KPI_LIST.map(([key, label]) => (
          <div key={key} style={{ background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{d[key] ?? '—'}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {Array.isArray(d.indicateurs) && d.indicateurs.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Indicateur', 'Objectif', 'Résultat'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12, color: C.muted, borderBottom: `2px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.indicateurs.map((ind, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 14px', fontSize: 13, borderBottom: `1px solid ${C.border}` }}>{ind.nom}</td>
                  <td style={{ padding: '8px 14px', fontSize: 13, borderBottom: `1px solid ${C.border}` }}>{ind.objectif}</td>
                  <td style={{ padding: '8px 14px', fontSize: 13, borderBottom: `1px solid ${C.border}` }}>{ind.resultat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(!d.indicateurs || !d.indicateurs.length) && (
        <div style={{ fontSize: 12.5, color: C.muted, fontStyle: 'italic' }}>Aucun indicateur détaillé pour l\u2019instant.</div>
      )}
    </div>
  );
}
