// frontend/src/config/contextMessages.js
// -----------------------------------------------------------------------------
// Messages explicatifs adressés à l'utilisateur, centralisés.
// Règle : succès UNIQUEMENT après confirmation réelle de l'opération.
// -----------------------------------------------------------------------------

export const M = {

  // ============================================================== GÉNÉRAL
  state: {
    loading:  "Chargement…",
    saving:   "Enregistrement…",
    deleting: "Suppression…",
    sending:  "Envoi…",
    network:  "Problème de connexion. Vérifiez votre réseau et réessayez.",
    empty:    "Aucune donnée à afficher.",
    demo:     "Mode démonstration — données locales, aucune IA externe."
  },

  // ============================================================ PERMISSIONS
  permissions: {
    forbidden:
      "Vous n'avez pas les droits pour effectuer cette action. " +
      "Contactez votre administrateur.",
    moduleAbsent:
      "Ce module n'est pas encore disponible dans votre espace. " +
      "Contactez l'administrateur.",
    moduleAbsentReason:
      "Le service correspondant n'est pas encore exposé côté serveur.",
    roleRequired: (role) =>
      `Cette fonctionnalité nécessite le rôle « ${role} ». Contactez votre administrateur.`
  },

  // ============================================================== ADMIN
  admin: {
    overview: {
      guide:
        "Vue consolidée de votre activité : entreprises, évaluations, " +
        "progression et rapports. Cliquez sur une carte pour accéder à sa section.",
      kpiParticipation: "Pourcentage de participants ayant commencé le test.",
      kpiCompletion:    "Pourcentage de tests terminés sur les tests attendus.",
      kpiProgression:   "Écart moyen entre score post-formation et pré-formation."
    },

    evaluations: {
      guide:
        "Cet espace centralise toutes vos évaluations. " +
        "Créez un test pré-formation ou post-formation, éditez les questions, " +
        "validez, puis affectez-le à une entreprise cliente.",
      workflow:
        "Brouillon → Validation → Affectation au client → Réponses → Analyse → Rapport.",
      emptyDraft:    "Aucun test en préparation. Créez votre premier test.",
      emptyValidated:"Aucun test validé pour l'instant.",
      emptyAssigned: "Aucune évaluation affectée à ce jour.",
      created:       "Test créé avec succès.",
      updated:       "Test mis à jour.",
      validated:     "Test validé. Il peut maintenant être affecté à une entreprise.",
      deleted:       "Test supprimé.",
      cannotValidate:
        "Le test ne peut pas être validé : vérifiez qu'il contient un titre " +
        "et au moins une question avec une réponse correcte définie.",
      cannotDelete:
        "Ce test ne peut pas être supprimé : il est déjà affecté à une campagne."
    },

    testEditor: {
      step1: "Informations générales — décrivez le test.",
      step2: "Sources et critères — sélectionnez les documents qui inspirent les questions.",
      step3: "Génération — produisez une proposition de test que vous pourrez modifier.",
      step4: "Édition — ajustez chaque question, son barème et sa bonne réponse.",
      step5: "Validation — vérifiez la cohérence avant de rendre le test disponible.",
      generating:
        "Génération en cours. L'IA simulée analyse les critères et propose des questions…",
      generated:
        "Proposition générée. Éditez les questions ci-dessous avant de valider.",
      savingDraft: "Brouillon enregistré.",
      aiNotice: "Mode démonstration — génération IA simulée, aucun appel externe."
    },

    campagnes: {
      guide:
        "Une campagne regroupe une formation, ses tests pré et post, " +
        "une entreprise destinataire et ses participants. Elle matérialise " +
        "l'envoi effectif des évaluations.",
      empty:       "Aucune campagne pour l'instant. Créez-en une depuis les évaluations validées.",
      sending:     "Affectation en cours…",
      sent:        "Campagne affectée. Elle apparaît désormais dans l'espace du client.",
      cannotSend:  "Complétez la campagne : entreprise, participants et tests requis."
    },

    analyse: {
      guide:
        "Analyse comparative des résultats pré-formation et post-formation. " +
        "Utilisez les filtres pour cibler une entreprise, une formation ou une période.",
      empty: "Aucune donnée disponible pour ces filtres.",
      partialData:
        "Certains participants n'ont pas terminé les deux tests. " +
        "Ils sont identifiés dans le tableau individuel."
    },

    rapports: {
      guide:
        "Générez un rapport individuel, d'entreprise ou de groupe à partir " +
        "des données réellement présentes dans la campagne.",
      generating: "Préparation du rapport…",
      generated:  "Rapport généré. Consultez-le ci-dessous ou téléchargez-le.",
      aiNotice:   "Rapport de démonstration — génération IA simulée."
    }
  },

  // ============================================================== CLIENT
  client: {
    welcome: {
      sub: "Voici l'essentiel de votre espace de formation.",
      quickStart: "Commencez par consulter vos formations assignées."
    },

    documents: {
      guide:
        "Vos documents importés apparaissent ici. Ils peuvent être consultés, " +
        "téléchargés, ou réutilisés comme sources pour la génération de programmes.",
      action:
        "Importez un nouveau fichier (PDF, Word, Excel, texte) " +
        "ou sélectionnez-en un pour lancer une génération IA.",
      empty:
        "Vous n'avez pas encore de document. Importez votre premier fichier " +
        "pour commencer.",
      pending:      "Enregistrement du document…",
      success:      (nom) => `« ${nom} » a été ajouté à vos documents.`,
      deleteConfirm:(nom) => `Supprimer définitivement « ${nom} » ?`,
      deleteSuccess:"Document supprimé.",
      error:        "Le document n'a pas pu être enregistré.",
      invalidFormat:(nom) =>
        `Format de « ${nom} » non pris en charge. Formats acceptés : ` +
        `PDF, DOC, DOCX, XLS, XLSX, TXT, MD, CSV.`,
      tooLarge:     (max) => `Fichier trop volumineux. Maximum ${max} Mo.`,
      previewUnavailable: "Aperçu indisponible pour ce format. Utilisez le téléchargement."
    },

    formations: {
      guide:
        "Les formations assignées par votre administrateur apparaissent ici. " +
        "Vous y trouverez les tests pré et post-formation à réaliser.",
      empty: "Aucune formation assignée pour l'instant."
    },

    tests: {
      guide:
        "Répondez aux tests pour évaluer votre progression. " +
        "Vos scores sont calculés à partir de vos réponses, jamais au hasard.",
      empty: "Aucun test disponible pour l'instant.",
      startPre: "Commencer le prétest",
      startPost: "Commencer le post-test",
      resume: "Reprendre le test",
      viewResults: "Voir mes résultats",

      preIntro:
        "Ce test sert à établir un état initial de vos connaissances. " +
        "Il n'est pas sanctionnant et ne peut pas être réussi ou échoué.",
      postIntro:
        "Ce test mesure ce que vous avez appris depuis la formation initiale. " +
        "Répondez avec sincérité pour un diagnostic utile.",

      pending: "Soumission en cours…",
      submitted:
        "Votre test a été enregistré. Les résultats sont disponibles dans la section Résultats.",
      incomplete:
        "Certaines questions obligatoires sont sans réponse. " +
        "Complétez-les avant de terminer le test.",
      blocked:
        "Vous devez d'abord terminer le prétest avant d'accéder au post-test."
    },

    resultats: {
      guide:
        "Consultez vos scores et votre progression entre le pré et le post-formation.",
      empty:     "Aucun résultat disponible pour le moment.",
      incomplete:"Résultat partiel : un seul des deux tests est terminé.",
      cannotCompute:
        "Progression relative non calculable : score initial à zéro."
    }
  },

  // ============================================================== DEVIS
  devis: {
    guide:
      "Suivez vos demandes de devis et échangez avec l'équipe OCTOGO.",
    empty:    "Aucune demande pour l'instant.",
    success:  "Votre demande a bien été envoyée.",
    error:    "La demande n'a pas pu être envoyée."
  }
};