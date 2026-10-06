// src/hooks/useGenerationRequest.js
// -----------------------------------------------------------------------------
// Hook central : tout l'état du parcours « Génération de Programme » vit ici.
// Les composants (formulaires, stepper, cartes) ne font que lire/appeler ce
// hook — aucune logique métier dupliquée dans les composants d'affichage.
//
// ⚠️ MODIFICATION (05/10/2026) :
//  - Ajout de la gestion des conversations (chat type ChatGPT).
//  - `envoyerMessage` persiste dans sessionStorage via maj().
//  - Isolation par société ET par email.
// -----------------------------------------------------------------------------
import { useState, useCallback, useMemo } from 'react';
import { envoyerMessageProgramme } from '../services/generationService';
import {
  DETAILS_FIELDS_DEFAULT, MODULES, DOCUMENT_STATUS,
} from '../constants/generationConstants';
import * as api from '../services/generationService';
import {
  useMock, maj, conversationsDe, utilisateurParEmail, prochainId,
} from '../mock/mockStore.jsx';
import { useAuth } from '../AuthContext';

function documentsInitiaux() {
  const docs = {};
  MODULES.forEach((m) => {
    docs[m.key] = { status: DOCUMENT_STATUS.VIDE, data: null, generatedAt: null, version: 0 };
  });
  return docs;
}

export default function useGenerationRequest() {
  // Navigation du stepper : 0 = type, 1 = description, 2 = infos, 3 = résultat
  const [etape, setEtape] = useState(0);

  const [requestId, setRequestId] = useState(null);
  const [type, setType] = useState(null);

  const [description, setDescription] = useState({ mode: 'text', texte: '', fichier: null, fichierNom: null });
  const [details, setDetails] = useState(DETAILS_FIELDS_DEFAULT);

  const [documents, setDocuments] = useState(documentsInitiaux());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ----- Chat / conversation -----
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  // ----- Contexte utilisateur (pour filtrer l'historique par compte) -----
  const { user } = useAuth();
  const mock = useMock();
  const profil = utilisateurParEmail(mock, user && user.email);
  const societeId = profil ? profil.societe_id : (mock.societes[0] || {}).id;
  const email = user && user.email;

  // Liste des conversations du compte connecté (recalculée à chaque rendu)
  const conversations = useMemo(
    () => conversationsDe(mock, societeId, email),
    [mock, societeId, email]
  );

  const setDetailField = useCallback((champ, valeur) => {
    setDetails((d) => ({ ...d, [champ]: valeur }));
  }, []);

  const allerEtape = useCallback((n) => setEtape(n), []);
  const etapeSuivante = useCallback(() => setEtape((e) => Math.min(e + 1, 3)), []);
  const etapePrecedente = useCallback(() => setEtape((e) => Math.max(e - 1, 0)), []);

  // ---------------------------------------------------------------------------
  // Création de la demande (backend en arrière-plan)
  // ---------------------------------------------------------------------------
  const finaliserEtCreerDemande = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        type,
        description: { mode: description.mode, texte: description.texte, fichierNom: description.fichierNom },
        details,
      };
      const resp = await api.creerDemande(payload);
      const demande = resp.demande || resp.request;
      const id = demande?.id;
      setRequestId(id);

      if (description.mode === 'upload' && description.fichier) {
        await api.uploaderDocumentBesoin(id, description.fichier);
      }

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

  // ---------------------------------------------------------------------------
  // Gestion des cartes / modules (conservé pour compatibilité)
  // ---------------------------------------------------------------------------
  const marquerStatut = useCallback((moduleKey, status, patch = {}) => {
    setDocuments((docs) => ({
      ...docs,
      [moduleKey]: { ...docs[moduleKey], status, ...patch },
    }));
  }, []);

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
      setError(e.message || 'Erreur lors de l\'enregistrement.');
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

  // ---------------------------------------------------------------------------
  // Gestion des conversations (chat type ChatGPT)
  // ---------------------------------------------------------------------------

  /** Crée une nouvelle conversation vide et la retourne. */
  const nouvelleConversation = useCallback((titre = 'Nouvelle conversation') => {
    let idCree = null;
    maj((d) => {
      idCree = prochainId(d, 'conversation');
      if (!d.conversations) d.conversations = [];
      d.conversations.push({
        id: idCree,
        societe_id: societeId,
        utilisateur_email: email,
        titre,
        messages: [],
        cree_le: new Date().toISOString(),
        maj_le: new Date().toISOString(),
      });
    });
    setConversationId(idCree);
    setMessages([]);
    return idCree;
  }, [societeId, email]);

  /** Charge une conversation existante dans l'état local. */
  const chargerConversation = useCallback((id) => {
    const conv = (mock.conversations || []).find((c) => c.id === id);
    if (!conv) return;
    setConversationId(id);
    setMessages(conv.messages || []);
  }, [mock.conversations]);

  /** Supprime une conversation. */
  const supprimerConversation = useCallback((id) => {
    maj((d) => {
      d.conversations = (d.conversations || []).filter((c) => c.id !== id);
    });
    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
    }
  }, [conversationId]);

  /** Persiste le fil de messages dans la conversation courante. */
  const persistMessages = useCallback((msgs) => {
    if (!conversationId) return;
    maj((d) => {
      const conv = (d.conversations || []).find((c) => c.id === conversationId);
      if (conv) {
        conv.messages = msgs;
        conv.maj_le = new Date().toISOString();
        // Auto-titre : premier message utilisateur (40 premiers caractères)
        if (conv.titre === 'Nouvelle conversation') {
          const premier = msgs.find((m) => m.role === 'user');
          if (premier) {
            conv.titre = premier.contenu.slice(0, 40) + (premier.contenu.length > 40 ? '…' : '');
          }
        }
      }
    });
  }, [conversationId]);

  // ---------------------------------------------------------------------------
  // Envoi de message (chat) — persiste automatiquement
  // ---------------------------------------------------------------------------
  const envoyerMessage = useCallback(async (texte) => {
    if (!texte || !texte.trim()) return;

    // 1) Crée la conversation si aucune n'est active
    let convId = conversationId;
    if (!convId) {
      convId = nouvelleConversation('Nouvelle conversation');
    }

    const userMsg = { role: 'user', contenu: texte.trim(), date: new Date().toISOString() };
    const nouveaux = [...messages, userMsg];
    setMessages(nouveaux);
    persistMessages(nouveaux);

    setLoading(true);
    setError(null);

    try {
      const resp = await envoyerMessageProgramme(requestId, texte, messages);
      const assistantMsg = {
        role: 'assistant',
        contenu: resp.contenu,
        documents: resp.documents || [],
        date: new Date().toISOString(),
      };
      const avecReponse = [...nouveaux, assistantMsg];
      setMessages(avecReponse);
      persistMessages(avecReponse);
    } catch (e) {
      setError(e.message || 'Erreur lors de l\'envoi du message.');
    } finally {
      setLoading(false);
    }
  }, [requestId, messages, conversationId, nouvelleConversation, persistMessages]);

  // ---------------------------------------------------------------------------
  // Actions globales
  // ---------------------------------------------------------------------------
  const telechargerTout = useCallback(async () => {
    try {
      await telechargerCarte('devis');
      await telechargerCarte('presence');
      await telechargerCarte('fiche');
    } catch (e) {
      setError(e.message || 'Erreur lors du téléchargement groupé.');
    }
  }, [telechargerCarte]);

  const copierTout = useCallback(async () => {
    try {
      const texte = messages
        .map((m) => `${m.role === 'user' ? 'Vous' : 'Assistant'} : ${m.contenu}`)
        .join('\n\n');
      await navigator.clipboard.writeText(texte);
    } catch (_) { /* ignoré */ }
  }, [messages]);

  const reinitialiser = useCallback(() => {
    setEtape(0);
    setRequestId(null);
    setType(null);
    setDescription({ mode: 'text', texte: '', fichier: null, fichierNom: null });
    setDetails(DETAILS_FIELDS_DEFAULT);
    setDocuments(documentsInitiaux());
    setError(null);
    setConversationId(null);
    setMessages([]);
  }, []);

  return {
    // ----- Chat / conversations -----
    conversations,
    conversationId,
    messages,
    setMessages,
    envoyerMessage,
    nouvelleConversation,
    chargerConversation,
    supprimerConversation,
    telechargerTout,
    copierTout,

    // ----- Navigation -----
    etape, allerEtape, etapeSuivante, etapePrecedente,

    // ----- Étape 1 -----
    type, setType,

    // ----- Étape 2 -----
    description, setDescription,

    // ----- Étape 3 -----
    details, setDetailField,

    // ----- Création -----
    requestId, finaliserEtCreerDemande, loading, error, setError,

    // ----- Espace de travail (ancien) -----
    documents, genererCarte, regenererCarte, modifierCarte, supprimerCarte,
    enregistrerCarte, validerCarte, telechargerCarte, copierCarte, saving,

    // ----- Divers -----
    reinitialiser,
  };
}