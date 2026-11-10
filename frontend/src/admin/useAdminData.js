// frontend/src/admin/useAdminData.js
// -----------------------------------------------------------------------------
// Chargement des données Admin depuis le backend réel.
// Sources :
//   GET /api/users               → utilisateurs (avec company)
//   GET /api/formations          → formations assignées
//   GET /api/formations/rapports → rapports
//   GET /api/documents           → documents
//
// AUCUNE donnée inventée. AUCUN seed.
// Les entreprises sont dérivées du champ `company` des utilisateurs.
// -----------------------------------------------------------------------------
import { useState, useEffect, useCallback, useMemo } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

async function fetchJson(path) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) {
    const err = new Error(`Erreur ${res.status} sur ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export function useAdminData() {
  const [users, setUsers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const recharger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // allSettled : si une route échoue (ex : /api/formations pas encore utilisée),
      // on continue avec les autres.
      const results = await Promise.allSettled([
        fetchJson('/api/users'),
        fetchJson('/api/formations'),
        fetchJson('/api/formations/rapports'),
        fetchJson('/api/documents')
      ]);

      const [usersRes, formRes, rapportsRes, docsRes] = results;

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.users || []);
      if (formRes.status === 'fulfilled') setFormations(formRes.value.formations || []);
      if (rapportsRes.status === 'fulfilled') setRapports(rapportsRes.value.rapports || []);
      if (docsRes.status === 'fulfilled') setDocuments(docsRes.value.documents || []);

      // Si users échoue, c'est critique (401/403)
      if (usersRes.status === 'rejected') {
        setError(usersRes.reason?.message || 'Impossible de charger les utilisateurs.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { recharger(); }, [recharger]);

  // ---------------------------------------------------------------- Entreprises
  // Une "entreprise" = valeur unique de user.company (hors admin à part)
  const entreprises = useMemo(() => {
    const map = new Map();

    for (const u of users) {
      const nom = (u.company || '').trim();
      if (!nom) continue;
      if (!map.has(nom)) {
        map.set(nom, { id: nom, nom, utilisateurs: [], admins: [] });
      }
      if (u.role === 'admin') map.get(nom).admins.push(u);
      else map.get(nom).utilisateurs.push(u);
    }

    return [...map.values()].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [users]);

  // ---------------------------------------------------------------- Formations
  const formationsParEntreprise = useMemo(() => {
    const map = {};
    for (const f of formations) {
      const org = (f.organisation || '').trim();
      if (!org) continue;
      if (!map[org]) map[org] = [];
      map[org].push(f);
    }
    return map;
  }, [formations]);

  // ---------------------------------------------------------------- Rapports
  const rapportsParEntreprise = useMemo(() => {
    const map = {};
    for (const r of rapports) {
      const org = (r.organisation || '').trim();
      if (!org) continue;
      if (!map[org]) map[org] = [];
      map[org].push(r);
    }
    return map;
  }, [rapports]);

  // ---------------------------------------------------------------- Documents
  const documentsParEntreprise = useMemo(() => {
    const map = {};
    for (const d of documents) {
      const org = (d.company || '').trim();
      if (!org) continue;
      if (!map[org]) map[org] = [];
      map[org].push(d);
    }
    return map;
  }, [documents]);

  // ---------------------------------------------------------------- KPI globaux
  const kpisGlobaux = useMemo(() => {
    const clients = users.filter(u => u.role !== 'admin');
    return {
      entreprises: entreprises.length,
      utilisateurs: users.length,
      clients: clients.length,
      formations: formations.length,
      rapports: rapports.length,
      documents: documents.length
    };
  }, [users, entreprises, formations, rapports, documents]);

  return {
    users,
    formations,
    rapports,
    documents,
    entreprises,
    formationsParEntreprise,
    rapportsParEntreprise,
    documentsParEntreprise,
    kpisGlobaux,
    loading,
    error,
    recharger
  };
}