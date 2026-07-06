// src/components/generation/AgendaGenerator.jsx
// -----------------------------------------------------------------------------
// Module « Agenda de formation ». TODO IA : croiser automatiquement avec les
// disponibilités réelles (backend/data/disponibilites.json + synchronisation
// Google Agenda déjà existante dans googleAgendaSync.js) pour proposer les
// meilleurs créneaux.
// -----------------------------------------------------------------------------
import React from 'react';
import Calendar from 'react-calendar';
import { CalendarDays } from 'lucide-react';
import { C } from '../../constants/generationConstants';

export default function AgendaGenerator({ data }) {
  const d = data || {};
  const dates = d.datesProposees || [];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: 12 }}>
          <Calendar
            tileClassName={({ date }) => {
              const iso = date.toISOString().slice(0, 10);
              return dates.includes(iso) ? 'gen-date-proposee' : null;
            }}
          />
          <style>{'.gen-date-proposee { background: #7C3AED33 !important; border-radius: 6px; font-weight: 700; }'}</style>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={14} /> Dates proposées
          </div>
          {dates.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dates.map((date, i) => (
                <div key={i} style={{ padding: '10px 14px', background: '#fff', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13.5, color: C.dark, fontWeight: 600 }}>
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic' }}>Aucune date proposée pour l\u2019instant.</div>
          )}

          {d.creneauxDisponibles && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8 }}>Créneaux disponibles</div>
              <div style={{ fontSize: 13, color: C.dark }}>{d.creneauxDisponibles}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
