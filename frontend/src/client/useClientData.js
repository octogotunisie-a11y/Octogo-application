// frontend/src/client/useClientData.js
// -----------------------------------------------------------------------------
// Chargement des données Client depuis le backend réel.
//   GET /api/users/me                 → fiche utilisateur connecté
//   GET /api/formations/mes-tests      → formations + tests assignés
//   GET /api/documents                 → ses documents
//   GET /api/formations/rapports       → rapports reçus
//
// AUCUN seed. AUCUNE donnée inventée.
// -----------------------------------------------------------------------------
import { useState, useEffect, useCallback, useMemo } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

async function fetchJson(path) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
}

export function useClientData(user) {
  const [items, setItems] = useState([]); // formations + tests + réponses
  const [documents, setDocuments] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const recharger = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true); setError(null);

    const [mesTestsRes, docsRes, rapportsRes] = await Promise.allSettled([
      fetchJson('/api/formations/mes-tests'),
      fetchJson('/api/documents'),
      fetchJson('/api/formations/rapports')
    ]);

    if (mesTestsRes.status === 'fulfilled') setItems(mesTestsRes.value.items || []);
    if (docsRes.status === 'fulfilled') setDocuments(docsRes.value.documents || []);
    if (rapportsRes.status === 'fulfilled') setRapports(rapportsRes.value.rapports || []);

    if (mesTestsRes.status === 'rejected') {
      setError(mesTestsRes.reason?.message || 'Erreur de chargement.');
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { recharger(); }, [recharger]);

  // ---------------------------------------------------------- Dérivations
  const formationsAssignees = useMemo(() =>
    items.map(item => ({
      formation: item.formation,
      campagne: item.formation,
      tests: item.tests || [],
      reponses: item.reponses || [],
      testPre: (item.tests || []).find(t => t.type === 'pre') || null,
      testPost: (item.tests || []).find(t => t.type === 'post') || null,
      repPre: (item.reponses || []).find(r => r.type === 'pre') || null,
      repPost: (item.reponses || []).find(r => r.type === 'post') || null
    }))
  , [items]);

  const mesDocuments = documents;
  const mesRapports = rapports;

  // Statistiques client
  const stats = useMemo(() => {
    const totalTests = formationsAssignees.length * 2;
    const faits = formationsAssignees.reduce((acc, f) => {
      if (f.repPre) acc++;
      if (f.repPost) acc++;
      return acc;
    }, 0);
    return {
      formations: formationsAssignees.length,
      testsFaits: faits,
      testsTotal: totalTests,
      progression: totalTests > 0 ? Math.round((faits / totalTests) * 100) : 0,
      documents: mesDocuments.length,
      rapports: mesRapports.length
    };
  }, [formationsAssignees, mesDocuments, mesRapports]);

  return {
    formationsAssignees,
    mesDocuments,
    mesRapports,
    stats,
    loading,
    error,
    recharger
  };
}