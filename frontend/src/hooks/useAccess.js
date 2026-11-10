// src/hooks/useAccess.js — ce que l'utilisateur connecté a le droit de faire.
// Sert uniquement à GUIDER l'interface (message explicatif, bouton désactivé) :
// le serveur revérifie toujours chaque action.
import { useEffect, useState, useCallback } from 'react';
import { monAcces } from '../services/documentsService';

export default function useAccess() {
  const [acces, setAcces] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let actif = true;
    monAcces().then((a) => actif && setAcces(a)).catch((e) => actif && setErreur(e.message));
    return () => { actif = false; };
  }, []);

  const peut = useCallback((p) => !!acces && (acces.role === 'admin' || acces.permissions.includes(p)), [acces]);
  return { acces, peut, chargement: !acces && !erreur, erreur };
}
