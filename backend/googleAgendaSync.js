// backend/googleAgendaSync.js
// -----------------------------------------------------------------------------
// Synchronisation Google Agenda via URL iCal SECRÈTE (format .ics).
// Aucune dépendance, aucun OAuth, aucune clé : on lit l'agenda en direct.
//
// COMMENT OBTENIR L'URL (à faire une seule fois, côté Google Agenda) :
//   Google Agenda > Paramètres > [votre agenda] > « Intégrer l'agenda »
//   > « Adresse secrète au format iCal » (commence par https://calendar.google.com/.../basic.ics)
//   Collez cette URL dans le champ `icalUrl` du formateur (data/formateurs.json).
//
// Le module récupère les événements OCCUPÉS (busy) et les expose comme créneaux
// d'indisponibilité, fusionnés à la volée lors des vérifications de disponibilité.
// Un cache mémoire (5 min) évite de refrapper Google à chaque requête → "temps réel".
//
// LIMITES assumées : les événements récurrents (RRULE) ne sont pas dépliés ; seuls
// les événements datés simples sont pris en compte (suffisant pour bloquer des dates).
// -----------------------------------------------------------------------------

const TTL_MS = 5 * 60 * 1000; // cache 5 minutes
const _cache = new Map(); // url -> { expires, intervals }

// Déplie les lignes iCal repliées (RFC 5545 : une ligne continuée commence par espace/tab)
function unfold(texte) {
  return texte.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

// Parse une valeur de date iCal en objet Date.
//   20260201            (VALUE=DATE)
//   20260201T090000Z    (UTC)
//   20260201T090000     (heure locale / TZID)
function parseDate(valeur) {
  if (!valeur) return null;
  const v = valeur.trim();
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) { const d = new Date(v); return isNaN(d) ? null : d; }
  const [, y, mo, d, hh, mm, ss, z] = m;
  if (!hh) return new Date(Number(y), Number(mo) - 1, Number(d)); // date seule
  if (z) return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss)));
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss));
}

// Extrait les créneaux occupés d'un texte iCal.
function parserICS(texte) {
  const data = unfold(texte);
  const blocs = data.split('BEGIN:VEVENT').slice(1);
  const intervals = [];
  for (const bloc of blocs) {
    const corps = bloc.split('END:VEVENT')[0];
    if (/STATUS:CANCELLED/i.test(corps)) continue;
    if (/TRANSP:TRANSPARENT/i.test(corps)) continue; // marqué "disponible" → ignoré
    const mStart = corps.match(/DTSTART[^:\n]*:([^\n]+)/i);
    const mEnd = corps.match(/DTEND[^:\n]*:([^\n]+)/i);
    if (!mStart) continue;
    const debut = parseDate(mStart[1]);
    let fin = mEnd ? parseDate(mEnd[1]) : null;
    if (!debut) continue;
    if (!fin) fin = new Date(debut.getTime() + 60 * 60 * 1000); // 1 h par défaut
    intervals.push({ debut: debut.toISOString(), fin: fin.toISOString() });
  }
  return intervals;
}

// Récupère (avec cache) les créneaux occupés depuis une URL iCal.
async function fetchBusyIntervals(icalUrl) {
  if (!icalUrl) return [];
  const cached = _cache.get(icalUrl);
  if (cached && cached.expires > Date.now()) return cached.intervals;
  if (typeof fetch !== 'function') {
    console.warn('⚠ fetch global indisponible (Node < 18) — synchro agenda ignorée.');
    return cached ? cached.intervals : [];
  }
  try {
    const resp = await fetch(icalUrl, { redirect: 'follow' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const texte = await resp.text();
    const intervals = parserICS(texte);
    _cache.set(icalUrl, { expires: Date.now() + TTL_MS, intervals });
    return intervals;
  } catch (e) {
    console.error('❌ Synchro agenda iCal:', e.message);
    return cached ? cached.intervals : []; // on garde l'ancien cache en cas d'échec
  }
}

// Enrichit une liste de formateurs : pour chacun ayant un `icalUrl`, fusionne les
// créneaux Google dans `indisponibilites` (copie, ne modifie pas le fichier).
async function enrichirFormateursAvecAgenda(formateurs) {
  const list = Array.isArray(formateurs) ? formateurs : [];
  return Promise.all(list.map(async (f) => {
    if (!f.icalUrl) return f;
    const busy = await fetchBusyIntervals(f.icalUrl);
    return Object.assign({}, f, {
      indisponibilites: [...(f.indisponibilites || []), ...busy],
      agendaSynchronise: true,
    });
  }));
}

// Vérification ponctuelle "temps réel" : un formateur est-il occupé maintenant ?
async function estOccupeMaintenant(formateur) {
  if (!formateur || !formateur.icalUrl) return false;
  const now = new Date();
  const busy = await fetchBusyIntervals(formateur.icalUrl);
  return busy.some((b) => new Date(b.debut) <= now && new Date(b.fin) >= now);
}

module.exports = {
  fetchBusyIntervals,
  enrichirFormateursAvecAgenda,
  estOccupeMaintenant,
  parserICS, // exporté pour tests
};
