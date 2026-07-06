// src/hooks/useGenerationRequest.js
// -----------------------------------------------------------------------------
// Hook central : tout l'état du parcours « Génération de Programme » vit ici.
// Les composants (formulaires, stepper, cartes) ne font que lire/appeler ce
// hook — aucune logique métier dupliquée dans les composants d'affichage.
// -----------------------------------------------------------------------------
import { useState, useCallback } from 'react';
import {
  DETAILS_FIELDS_DEFAULT, MODULES, DOCUMENT_STATUS,
} from '../constants/generationConstants';
import * as api from '../services/generationService';

function documentsInitiaux() {
  const docs = {};
  MODULES.forEach((m) => {
    docs[m.key] = { status: DOCUMENT_STATUS.VIDE, data: null, generatedAt: null, version: 0 };
  });
  return docs;
}

export default function useGenerationRequest() {
  // Navigation du stepper : 0 = type, 1 = description, 2 = infos complémentaires, 3 = espace de travail
  const [etape, setEtape] = useState(0);

  const [requestId, setRequestId] = useState(null);
  const [type, setType] = useState(null); // 'formation' | 'parcours' | 'coaching' | 'accompagnement'

  const [description, setDescription] = useState({ mode: 'text', texte: '', fichier: null, fichierNom: null });
  const [details, setDetails] = useState(DETAILS_FIELDS_DEFAULT);

  const [documents, setDocuments] = useState(documentsInitiaux());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const setDetailField = useCallback((champ, valeur) => {
    setDetails((d) => ({ ...d, [champ]: valeur }));
  }, []);

  const allerEtape = useCallback((n) => setEtape(n), []);
  const etapeSuivante = useCallback(() => setEtape((e) => Math.min(e + 1, 3)), []);
  const etapePrecedente = useCallback(() => setEtape((e) => Math.max(e - 1, 0)), []);

  // Crée la demande en base. Le backend génère IMMÉDIATEMENT tous les
  // documents via le moteur de simulation (voir simulationEngine.js) — la
  // réponse contient donc déjà les 11 modules remplis, prêts à afficher.
  const finaliserEtCreerDemande = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { type, description: { mode: description.mode, texte: description.texte, fichierNom: description.fichierNom }, details };
      const resp = await api.creerDemande(payload);
      const demande = resp.demande;
      const id = demande?.id;
      setRequestId(id);

      if (description.mode === 'upload' && description.fichier) {
        await api.uploaderDocumentBesoin(id, description.fichier);
      }

      // Hydrate l'état local avec les documents déjà générés par la simulation.
      if (demande?.documents) {
        setDocuments((docsActuels) => ({ ...docsActuels, ...demande.documents }));
      }

      setEtape(3);
      return id;
    } catch (e) {
      setError(e.message || 'Erreur lors de la création de la demande.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [type, description, details]);

  // ---- gestion des cartes / modules ----

  const marquerStatut = useCallback((moduleKey, status, patch = {}) => {
    setDocuments((docs) => ({
      ...docs,
      [moduleKey]: { ...docs[moduleKey], status, ...patch },
    }));
  }, []);

  // TODO IA : `api.genererModule` appelle pour l'instant un stub backend qui
  // renvoie une structure vide/gabarit. À terme, cet appel déclenchera le
  // véritable pipeline IA (analyse besoin + génération de contenu).
  const genererCarte = useCallback(async (moduleKey) => {
    if (!requestId) return;
    marquerStatut(moduleKey, DOCUMENT_STATUS.GENERATION_EN_COURS);
    try {
      const resp = await api.genererModule(requestId, moduleKey);
      marquerStatut(moduleKey, DOCUMENT_STATUS.GENERE, {
        data: resp.data, generatedAt: new Date().toISOString(), version: (resp.version ?? 1),
      });
    } catch (e) {
      setError(e.message || `Erreur de génération (${moduleKey}).`);
      marquerStatut(moduleKey, DOCUMENT_STATUS.VIDE);
    }
  }, [requestId, marquerStatut]);

  const regenererCarte = useCallback(async (moduleKey) => {
    if (!requestId) return;
    marquerStatut(moduleKey, DOCUMENT_STATUS.GENERATION_EN_COURS);
    try {
      const resp = await api.regenererModule(requestId, moduleKey);
      marquerStatut(moduleKey, DOCUMENT_STATUS.GENERE, {
        data: resp.data, generatedAt: new Date().toISOString(), version: (resp.version ?? 1),
      });
    } catch (e) {
      setError(e.message || `Erreur de régénération (${moduleKey}).`);
    }
  }, [requestId, marquerStatut]);

  const modifierCarte = useCallback((moduleKey, nouvellesDonnees) => {
    setDocuments((docs) => ({
      ...docs,
      [moduleKey]: { ...docs[moduleKey], data: nouvellesDonnees, status: DOCUMENT_STATUS.MODIFIE },
    }));
  }, []);

  const enregistrerCarte = useCallback(async (moduleKey) => {
    if (!requestId) return;
    setSaving(true);
    try {
      const doc = documents[moduleKey];
      await api.enregistrerModule(requestId, moduleKey, doc.data);
    } catch (e) {
      setError(e.message || 'Erreur lors de l\u2019enregistrement.');
    } finally {
      setSaving(false);
    }
  }, [requestId, documents]);

  const validerCarte = useCallback(async (moduleKey) => {
    if (!requestId) return;
    try {
      await api.validerModule(requestId, moduleKey);
      marquerStatut(moduleKey, DOCUMENT_STATUS.VALIDE);
    } catch (e) {
      setError(e.message || 'Erreur lors de la validation.');
    }
  }, [requestId, marquerStatut]);

  const telechargerCarte = useCallback(async (moduleKey) => {
    if (!requestId) return;
    try {
      await api.telechargerModule(requestId, moduleKey);
    } catch (e) {
      setError(e.message || 'Erreur lors du téléchargement.');
    }
  }, [requestId]);

  const copierCarte = useCallback(async (moduleKey) => {
    const doc = documents[moduleKey];
    if (!doc?.data) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(doc.data, null, 2));
      return true;
    } catch (_) {
      return false;
    }
  }, [documents]);

  const supprimerCarte = useCallback((moduleKey) => {
    setDocuments((docs) => ({
      ...docs,
      [moduleKey]: { status: DOCUMENT_STATUS.VIDE, data: null, generatedAt: null, version: 0 },
    }));
  }, []);

  const reinitialiser = useCallback(() => {
    setEtape(0);
    setRequestId(null);
    setType(null);
    setDescription({ mode: 'text', texte: '', fichier: null, fichierNom: null });
    setDetails(DETAILS_FIELDS_DEFAULT);
    setDocuments(documentsInitiaux());
    setError(null);
  }, []);

  return {
    // navigation
    etape, allerEtape, etapeSuivante, etapePrecedente,
    // étape 1
    type, setType,
    // étape 2
    description, setDescription,
    // étape 3
    details, setDetailField,
    // création
    requestId, finaliserEtCreerDemande, loading, error, setError,
    // espace de travail (étape 4)
    documents, genererCarte, regenererCarte, modifierCarte, supprimerCarte,
    enregistrerCarte, validerCarte, telechargerCarte, copierCarte, saving,
    // divers
    reinitialiser,
  };
}
