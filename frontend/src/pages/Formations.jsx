// Formations.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Formations = () => {
  const [formations, setFormations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [imageError, setImageError] = useState({});
  const [animatedNumbers, setAnimatedNumbers] = useState({
    professionals: 0,
    satisfaction: 0,
    entreprises: 0,
    format: 0
  });
  const [downloadStatus, setDownloadStatus] = useState({
    isDownloading: false,
    isSuccess: false,
    formationName: null,
    color: null
  });

  const navigate = useNavigate();

  const formationData = [
    {
      id: 1,
      title: 'Neurovente & Management',
      subtitle: 'Vendre au cerveau des clients',
      category: 'VENTES & MANAGEMENT',
      duration: '3 JOURS',
      price: 'sur devis',
      description: 'Former les managers à vendre au cerveau du client grâce aux neurosciences. Apprenez à comprendre les mécanismes décisionnels du cerveau pour optimiser vos ventes et votre management.',
      image: 'src/images/formation/Neurovente & Management.jpg',
      pdf: 'src/pdfs/formation/neurovente-management.pdf',
      rating: 4.8,
      participants: 89,
      features: ['Neurosciences appliquées à la vente', 'Compréhension des biais cognitifs', 'Techniques de persuasion éthique', 'Management neuroscientifique'],
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      icon: 'bi-graph-up-arrow',
      detailedImage: 'src/images/formation/Neurovente & Management.jpg',
      detailedDescription: 'Programme intensif de 3 jours pour maîtriser les techniques de vente basées sur les neurosciences.',
      objectifsPedagogiques: [
        'Comprendre les mécanismes décisionnels du cerveau',
        'Maîtriser les techniques de persuasion éthique',
        'Développer un management neuroscientifique'
      ],
      objectifsOperationnels: [
        'Améliorer la performance commerciale',
        'Renforcer la confiance et fidélisation client',
        'Réduire la charge cognitive dans le discours de vente',
        'Augmenter les taux de closing'
      ],
      deroule: 'Formation pratique avec études de cas, mises en situation et outils concrets.',
      scenarios: [
        'Version standard : 3 jours - perfectionnement des techniques de vente',
        'Version intensive : 5 jours - avec coaching individuel intégré'
      ],
      evaluation: 'Suivi par indicateurs de performance commerciale : taux de closing, satisfaction client, fidélisation.',
      livrables: [
        'Grille d\'auto-évaluation',
        'Plan d\'action commercial',
        'Rapport de performance',
        'Attestation de formation'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 2,
      title: 'NeuroSécurité',
      subtitle: 'Intelligence émotionnelle et décision sous tension',
      category: 'SÉCURITÉ',
      duration: '2 JOURS',
      price: 'sur devis',
      description: 'Destinée aux équipes de sécurité, basée sur les neurosciences du stress et de la cohésion. Développez la résilience et la prise de décision optimale en situations critiques.',
      image: 'src/images/formation/sécurité.png', 
      pdf: 'src/pdfs/formation/neurosecurite.pdf',
      rating: 4.9,
      participants: 124,
      features: ['Gestion du stress neuroscientifique', 'Cohésion d\'équipe en situation de crise', 'Décision rapide sous pression', 'Intelligence émotionnelle appliquée'],
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      icon: 'bi-shield-check',
      detailedImage: 'src/images/formation/sécurité.png',
      detailedDescription: 'Formation spécialisée pour les professionnels de la sécurité.',
      objectifsPedagogiques: [
        'Gérer le stress en situations critiques',
        'Prendre des décisions rapides et optimales',
        'Renforcer la cohésion d\'équipe'
      ],
      objectifsOperationnels: [
        'Améliorer la sécurité et la vigilance',
        'Réduire les erreurs humaines',
        'Renforcer la résilience opérationnelle',
        'Optimiser la communication en équipe'
      ],
      deroule: 'Ateliers pratiques, simulations et outils de gestion du stress.',
      scenarios: [
        'Formation standard : 2 jours - bases de la neuro-sécurité',
        'Formation avancée : 3 jours - avec simulations en situation réelle'
      ],
      evaluation: 'Mesure du stress, temps de réaction, qualité des décisions.',
      livrables: [
        'Guide de gestion du stress',
        'Protocoles de décision rapide',
        'Plan de cohésion d\'équipe',
        'Certification'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 3,
      title: 'NeuroÉducation',
      subtitle: 'Excellence en Leadership et Communication',
      category: 'LEADERSHIP',
      duration: '2 JOURS',
      price: 'sur devis',
      description: 'La NeuroÉducation explore la neuroplasticité chez l\'adulte et la neuroergonomie. Développez un leadership basé sur la science du cerveau pour une communication optimale.',
      image: 'src/images/formation/NeuroÉducation .jpg',
      pdf: 'src/pdfs/formation/neuroeducation.pdf',
      rating: 4.7,
      participants: 156,
      features: ['Neuroplasticité adulte', 'Neuroergonomie appliquée', 'Communication neuroscientifique', 'Leadership adaptatif'],
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      icon: 'bi-mortarboard',
      detailedImage: 'src/images/formation/NeuroÉducation .jpg',
      detailedDescription: 'Programme avancé de leadership basé sur les neurosciences.',
      objectifsPedagogiques: [
        'Développer la neuroplasticité chez l\'adulte',
        'Améliorer la communication grâce aux neurosciences',
        'Adopter un leadership adaptatif'
      ],
      objectifsOperationnels: [
        'Améliorer l\'efficacité pédagogique',
        'Renforcer l\'engagement des apprenants',
        'Développer des méthodes d\'enseignement innovantes',
        'Augmenter la rétention d\'information'
      ],
      deroule: 'Modules théoriques et exercices pratiques de communication.',
      scenarios: [
        'Format standard : 2 jours - bases de la neuroéducation',
        'Format expert : 4 jours - avec création de contenus pédagogiques'
      ],
      evaluation: 'Mesure de l\'engagement, rétention d\'information, application des concepts.',
      livrables: [
        'Kit d\'outils pédagogiques',
        'Guide de création de contenu',
        'Plan de développement',
        'Certification en neuroéducation'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 4,
      title: 'La parole d\'un leader',
      subtitle: 'Communication et influence',
      category: 'COMMUNICATION',
      duration: '2 JOURS',
      price: 'sur devis',
      description: 'Apprendre à communiquer avec influence et engagement, en utilisant les neurosciences pour captiver, inspirer et mobiliser les équipes.',
      image: 'src/images/formation/la parole.jpg',
      pdf: 'src/pdfs/formation/parole-leader.pdf',
      rating: 4.8,
      participants: 98,
      features: ['Neurosciences de la communication', 'Influence et persuasion éthique', 'Storytelling cérébral', 'Engagement d\'équipe'],
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      icon: 'bi-mic',
      detailedImage: 'src/images/formation/la parole.jpg',
      detailedDescription: 'Masterclass en communication et influence leadership.',
      objectifsPedagogiques: [
        'Maîtriser les neurosciences de la communication',
        'Développer son influence et persuasion éthique',
        'Captiver et mobiliser les équipes'
      ],
      objectifsOperationnels: [
        'Améliorer l\'impact des communications',
        'Renforcer la cohésion d\'équipe',
        'Augmenter l\'adhésion aux projets',
        'Développer la présence et l\'authenticité'
      ],
      deroule: 'Techniques de storytelling, exercices pratiques et feedback personnalisé.',
      scenarios: [
        'Workshop intensif : 2 jours - techniques avancées',
        'Programme complet : 3 jours - avec coaching individuel'
      ],
      evaluation: 'Analyse vidéo, feedback 360°, mesure de l\'impact.',
      livrables: [
        'Template de présentation',
        'Guide de storytelling',
        'Plan de développement personnel',
        'Certification'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 5,
      title: 'Neurosciences Appliquées',
      subtitle: 'Parcours de formation complet',
      category: 'NEUROSCIENCES',
      duration: '4 JOURS',
      price: 'sur devis',
      description: 'Un ensemble de parcours innovants fondés sur les neurosciences appliquées, visant à développer le leadership, la communication, la résilience et la performance.',
      image: 'src/images/formation/Neurosciences Appliquées.jpg',
      pdf: 'src/pdfs/formation/parcours-neurosciences.pdf',
      rating: 4.9,
      participants: 145,
      features: ['Leadership neuroscientifique', 'Communication optimale', 'Résilience cognitive', 'Performance collective'],
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      icon: 'bi-diagram-3',
      detailedImage: 'src/images/formation/Neurosciences Appliquées.jpg',
      detailedDescription: 'Parcours complet de formation en neurosciences appliquées.',
      objectifsPedagogiques: [
        'Intégrer les neurosciences dans la pratique professionnelle',
        'Développer la résilience cognitive',
        'Améliorer la performance collective'
      ],
      objectifsOperationnels: [
        'Transformer les pratiques managériales',
        'Améliorer le bien-être au travail',
        'Augmenter la productivité',
        'Favoriser l\'innovation'
      ],
      deroule: 'Modules complets avec certification finale.',
      scenarios: [
        'Parcours découverte : 4 jours - bases des neurosciences',
        'Parcours expert : 8 jours - approfondissement spécialisé'
      ],
      evaluation: 'Projets pratiques, études de cas, évaluation continue.',
      livrables: [
        'Portfolio de compétences',
        'Projet d\'application',
        'Rapport d\'impact',
        'Certification internationale'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 6,
      title: 'Mindset de gagnant',
      subtitle: 'Pour un avenir brillant',
      category: 'DÉVELOPPEMENT PERSONNEL',
      duration: '2.5 JOURS',
      price: 'sur devis',
      description: 'Un parcours immersif au cœur du cerveau humain pour développer les power skills de demain : pensée critique, créativité, résilience et intelligence émotionnelle.',
      image: 'src/images/formation/Un mindset.jpg',
      pdf: 'src/pdfs/formation/mindset-gagnant.pdf',
      rating: 4.8,
      participants: 112,
      features: ['Pensée critique neuroscientifique', 'Créativité cérébrale', 'Résilience émotionnelle', 'Intelligence adaptative'],
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      icon: 'bi-trophy',
      detailedImage: 'src/images/formation/Un mindset.jpg',
      detailedDescription: 'Transformation personnelle par les neurosciences.',
      objectifsPedagogiques: [
        'Développer une pensée critique',
        'Renforcer la créativité et l\'innovation',
        'Améliorer la résilience émotionnelle'
      ],
      objectifsOperationnels: [
        'Augmenter la confiance en soi',
        'Améliorer la prise de décision',
        'Développer l\'agilité mentale',
        'Renforcer la motivation intrinsèque'
      ],
      deroule: 'Ateliers créatifs, réflexion personnelle et outils pratiques.',
      scenarios: [
        'Retraite intensive : 2.5 jours - transformation profonde',
        'Programme étalé : 5 demi-journées - intégration progressive'
      ],
      evaluation: 'Tests psychométriques, journal de bord, projets créatifs.',
      livrables: [
        'Journal de transformation',
        'Plan de développement personnel',
        'Boîte à outils mentale',
        'Certification de compétences'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 7,
      title: 'NeuroLeadership',
      subtitle: 'Performance Collective',
      category: 'LEADERSHIP',
      duration: '3 JOURS',
      price: 'sur devis',
      description: 'Former les managers à comprendre le cerveau de leurs équipes, renforcer la motivation et améliorer la performance collective grâce aux neurosciences appliquées.',
      image: 'src/images/formation/Neuroleadership.jpg',
      pdf: 'src/pdfs/formation/neuroleadership-performance.pdf',
      rating: 4.9,
      participants: 134,
      features: ['Compréhension du cerveau collectif', 'Motivation neuroscientifique', 'Performance d\'équipe', 'Coaching individuel'],
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      icon: 'bi-people',
      detailedImage: 'src/images/formation/Neuroleadership.jpg',
      detailedDescription: 'Programme de leadership basé sur les neurosciences.',
      objectifsPedagogiques: [
        'Comprendre la dynamique des équipes',
        'Développer la motivation collective',
        'Améliorer la performance d\'équipe'
      ],
      objectifsOperationnels: [
        'Augmenter l\'engagement des collaborateurs',
        'Réduire le turnover',
        'Améliorer la collaboration inter-équipes',
        'Développer une culture de performance'
      ],
      deroule: 'Coaching individuel et ateliers de team building.',
      scenarios: [
        'Formation managers : 3 jours - bases du neuroleadership',
        'Programme dirigeants : 5 jours - stratégie et transformation'
      ],
      evaluation: 'Enquêtes d\'engagement, mesure de la performance, feedback 360°.',
      livrables: [
        'Plan de leadership',
        'Outil d\'évaluation d\'équipe',
        'Guide d\'entretiens motivationnels',
        'Certification en neuroleadership'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 8,
      title: 'Leadership Émotionnel',
      subtitle: 'Les Valeurs en Action',
      category: 'LEADERSHIP',
      duration: '2 JOURS',
      price: 'sur devis',
      description: 'Développer un leadership aligné sur les valeurs et l\'intelligence émotionnelle afin de renforcer la confiance, l\'engagement et la coopération au sein des équipes.',
      image: 'src/images/formation/Leadership Émotionnel .png',
      pdf: 'src/pdfs/formation/leadership-emotionnel.pdf',
      rating: 4.7,
      participants: 167,
      features: ['Intelligence émotionnelle appliquée', 'Alignement valeurs-action', 'Confiance et engagement', 'Coopération optimale'],
      color: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
      icon: 'bi-heart',
      detailedImage: 'src/images/formation/Leadership Émotionnel .png',
      detailedDescription: 'Leadership basé sur l\'intelligence émotionnelle et les valeurs.',
      objectifsPedagogiques: [
        'Développer l\'intelligence émotionnelle',
        'Aligner le leadership sur les valeurs',
        'Renforcer la confiance et l\'engagement'
      ],
      objectifsOperationnels: [
        'Améliorer le climat de travail',
        'Renforcer la cohésion d\'équipe',
        'Développer l\'empathie managériale',
        'Favoriser la rétention des talents'
      ],
      deroule: 'Exercices d\'introspection et développement personnel.',
      scenarios: [
        'Atelier pratique : 2 jours - développement des compétences émotionnelles',
        'Programme complet : 4 jours - avec coaching de mise en œuvre'
      ],
      evaluation: 'Tests d\'intelligence émotionnelle, feedback collaborateur, observations.',
      livrables: [
        'Carte des valeurs',
        'Plan de développement émotionnel',
        'Guide de communication empathique',
        'Certification en leadership émotionnel'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    }
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Animation des nombres
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const animateNumber = (targetValue, setter, suffix = '') => {
      let current = 0;
      const targetNum = parseInt(targetValue);
      const increment = targetNum / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
          current = targetNum;
          clearInterval(timer);
        }
        setter(Math.floor(current) + suffix);
      }, interval);
    };

    animateNumber('500', (val) => setAnimatedNumbers(prev => ({...prev, professionals: val + '+'})));
    animateNumber('98', (val) => setAnimatedNumbers(prev => ({...prev, satisfaction: val + '%'})));
    animateNumber('50', (val) => setAnimatedNumbers(prev => ({...prev, entreprises: val + '+'})));
    animateNumber('100', (val) => setAnimatedNumbers(prev => ({...prev, format: val + '%'})));
    
    // Charger les formations
    setFormations(formationData);
  }, []);

  const categories = ['TOUS', 'LEADERSHIP', 'VENTES & MANAGEMENT', 'SÉCURITÉ', 'COMMUNICATION', 'NEUROSCIENCES', 'DÉVELOPPEMENT PERSONNEL'];

  const filteredFormations = selectedCategory === 'TOUS' 
    ? formations 
    : formations.filter(f => f.category === selectedCategory);

  const handleImageError = (id) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const handleDownload = async (formation) => {
    setDownloadStatus({
      isDownloading: true,
      isSuccess: false,
      formationName: formation.title,
      color: formation.color
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      window.open(formation.pdf, '_blank');
      
      setDownloadStatus({
        isDownloading: false,
        isSuccess: true,
        formationName: formation.title,
        color: formation.color
      });
      
      setTimeout(() => {
        setDownloadStatus({
          isDownloading: false,
          isSuccess: false,
          formationName: null,
          color: null
        });
      }, 3000);
      
      console.log(`PDF ouvert: ${formation.title}`);
      
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du PDF:', error);
      setDownloadStatus({
        isDownloading: false,
        isSuccess: false,
        formationName: formation.title,
        color: formation.color
      });
      
      setTimeout(() => {
        setDownloadStatus({
          isDownloading: false,
          isSuccess: false,
          formationName: null,
          color: null
        });
      }, 3000);
    }
  };

  const handleContact = () => {
    navigate('/contact');
  };

  const handleViewDetails = (formation) => {
    setSelectedFormation(formation);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFormation(null);
    document.body.style.overflow = 'auto';
  };

  // Fonction pour gérer la demande de devis avec nom de la formation
  const handleDemandeDevis = (formation) => {
    // Fermer le modal
    handleCloseModal();
    
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      // Si non connecté, rediriger vers login avec retour vers dashboard
      navigate(`/login?redirect=/dashboard&action=demande-devis&formationId=${formation.id}&formationNom=${encodeURIComponent(formation.title)}`);
    } else {
      // Si connecté, rediriger vers le dashboard avec paramètres
      navigate(`/dashboard?action=demande-devis&formationId=${formation.id}&formationNom=${encodeURIComponent(formation.title)}`);
    }
  };

  const formationStats = [
    {
      icon: 'bi-people-fill',
      value: animatedNumbers.professionals,
      label: 'Professionnels Formés'
    },
    {
      icon: 'bi-award-fill',
      value: animatedNumbers.satisfaction,
      label: 'Satisfaction'
    },
    {
      icon: 'bi-building',
      value: animatedNumbers.entreprises,
      label: 'Entreprises'
    },
    {
      icon: 'bi-clock-history',
      value: animatedNumbers.format,
      label: 'Format Flexible'
    }
  ];

  const mainGradient = 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%)';
  const titleGradient = 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)';

  return (
    <>
      <style jsx>{`
        /* CSS pour le responsive mobile */
        @media (max-width: 768px) {
          .container {
            width: 100%;
            padding: 0 15px;
            margin: 0 auto;
          }
          
          .page-header {
            padding: 1.5rem 0 2rem !important;
          }
          
          .page-header-logo {
            height: 60px !important;
            max-width: 180px !important;
          }
          
          .page-title {
            font-size: 1.75rem !important;
            padding: 0 10px;
          }
          
          .page-subtitle {
            font-size: 0.9rem !important;
            padding: 0 10px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
            margin-bottom: 2rem !important;
          }
          
          .stat-card {
            padding: 1.25rem 0.75rem !important;
          }
          
          .stat-icon {
            width: 45px !important;
            height: 45px !important;
            font-size: 1.2rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          .stat-value {
            font-size: 1.5rem !important;
            margin-bottom: 0.25rem !important;
          }
          
          .stat-label {
            font-size: 0.8rem !important;
          }
          
          .filter-container {
            padding: 1.25rem 0.75rem !important;
            margin-bottom: 2rem !important;
            border-radius: 15px !important;
            overflow-x: auto;
          }
          
          .filter-buttons {
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            padding-bottom: 5px;
            min-width: max-content;
          }
          
          .filter-button {
            padding: 0.5rem 1rem !important;
            font-size: 0.8rem !important;
            white-space: nowrap;
          }
          
          .formations-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            margin-bottom: 3rem !important;
          }
          
          .formation-card {
            border-radius: 15px !important;
          }
          
          .category-badge {
            top: 12px !important;
            left: 12px !important;
            padding: 4px 12px !important;
            font-size: 0.7rem !important;
          }
          
          .formation-image {
            height: 180px !important;
          }
          
          .formation-content {
            padding: 1.25rem !important;
          }
          
          .formation-title {
            font-size: 1.25rem !important;
          }
          
          .formation-subtitle {
            font-size: 0.85rem !important;
          }
          
          .formation-description {
            font-size: 0.85rem !important;
            margin-bottom: 1rem !important;
          }
          
          .feature-tag {
            font-size: 0.7rem !important;
            padding: 3px 8px !important;
          }
          
          .action-buttons {
            flex-direction: column !important;
            gap: 0.5rem !important;
            margin-top: 1rem !important;
          }
          
          .action-button {
            padding: 10px !important;
            font-size: 0.85rem !important;
          }
          
          .cta-section {
            padding: 1.5rem !important;
            margin-bottom: 2rem !important;
          }
          
          .cta-icon {
            width: 60px !important;
            height: 60px !important;
            font-size: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
          
          .cta-title {
            font-size: 1.5rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          .cta-description {
            font-size: 0.9rem !important;
            margin-bottom: 1.5rem !important;
          }
          
          .cta-buttons {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .cta-button {
            padding: 12px !important;
            font-size: 0.9rem !important;
          }
          
          .quote-text {
            font-size: 1rem !important;
            padding: 0 1rem !important;
          }
          
          .modal-overlay {
            padding: 10px !important;
          }
          
          .modal-container {
            max-height: 85vh !important;
            border-radius: 15px !important;
          }
          
          .modal-image {
            height: 200px !important;
          }
          
          .modal-content {
            padding: 1.25rem !important;
          }
          
          .modal-type-badge {
            font-size: 0.8rem !important;
            padding: 6px 15px !important;
          }
          
          .modal-title {
            font-size: 1.5rem !important;
          }
          
          .modal-subtitle {
            font-size: 1rem !important;
          }
          
          .modal-price {
            font-size: 1.5rem !important;
          }
          
          .modal-info-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
            padding: 1rem !important;
          }
          
          .objectifs-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          
          .objectifs-section {
            padding: 1rem !important;
          }
          
          .deroule-content, .objectifs-list li {
            font-size: 0.9rem !important;
          }
          
          .livrables-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }
          
          .livrable-item {
            font-size: 0.75rem !important;
            padding: 0.75rem !important;
          }
          
          .modal-actions {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          
          .modal-action-button {
            min-width: 100% !important;
            padding: 14px !important;
            font-size: 0.9rem !important;
          }
          
          .download-notification {
            bottom: 15px !important;
            right: 15px !important;
            left: 15px !important;
            max-width: none !important;
            width: auto !important;
            padding: 1.25rem !important;
          }
          
          .notification-icon {
            width: 45px !important;
            height: 45px !important;
            font-size: 1.25rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .modal-info-grid {
            grid-template-columns: 1fr !important;
          }
          
          .livrables-grid {
            grid-template-columns: 1fr !important;
          }
          
          .page-title {
            font-size: 1.5rem !important;
          }
          
          .page-header-logo {
            height: 50px !important;
          }
        }
        
        @media (max-width: 360px) {
          .container {
            padding: 0 10px;
          }
          
          .filter-button {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.75rem !important;
          }
          
          .formation-image {
            height: 150px !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header" style={{ 
        textAlign: 'center',
        padding: '3rem 0 3rem',
        position: 'relative'
      }}>
        <div className="container" style={{ 
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <img src="src/images/1.png" alt="Octogo Logo" className="page-header-logo" style={{ 
            height: '120px',
            width: 'auto',
            display: 'block',
            margin: '0 auto 2rem'
          }} />
          <h1 className="page-title" style={{ 
            fontSize: '3rem',
            fontWeight: 800,
            margin: '0.5rem 0',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}>
            Nos Formations
          </h1>
          <p className="page-subtitle" style={{ 
            fontSize: '1.2rem',
            color: '#6B7280',
            maxWidth: '800px',
            margin: '1rem auto',
            lineHeight: 1.6,
            textAlign: 'center'
          }}>
            <strong style={{ 
              background: titleGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}>
              Programmes innovants en neurosciences appliquées
            </strong>{' '}
            conçus pour développer vos compétences et transformer vos pratiques professionnelles.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="section">
        <div className="container" style={{ 
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {/* Stats Section */}
          <div className="stats-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {formationStats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.1)'
                }}
              >
                <div className="stat-icon" style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <div className="stat-value" style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem',
                  lineHeight: 1
                }}>
                  {stat.value}
                </div>
                <div className="stat-label" style={{ 
                  color: '#6B7280',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="filter-container" style={{ 
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            marginBottom: '3rem'
          }}>
            <div className="filter-buttons" style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  className="filter-button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: selectedCategory === category 
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' 
                      : 'rgba(139, 92, 246, 0.05)',
                    color: selectedCategory === category ? 'white' : '#6B7280',
                    border: selectedCategory === category 
                      ? 'none' 
                      : '1.5px solid rgba(139, 92, 246, 0.15)',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.02em'
                  }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Formations Grid */}
          <div className="formations-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
            gap: '2.5rem',
            marginBottom: '5rem'
          }}>
            {filteredFormations.map((formation, index) => (
              <motion.div
                key={formation.id}
                className="formation-card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 10px 40px rgba(124, 58, 237, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Category Badge */}
                <div className="category-badge" style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: formation.color,
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  zIndex: 2
                }}>
                  {formation.category}
                </div>

                {/* Image */}
                <div className="formation-image" style={{ 
                  height: '250px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: `3px solid ${formation.color}`
                }}>
                  {formation.detailedImage || formation.image ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '15px',
                      backgroundColor: 'white'
                    }}>
                      <img
                        src={formation.detailedImage || formation.image}
                        alt={`Affiche ${formation.title}`}
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onError={() => handleImageError(formation.id)}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      color: formation.color,
                      fontSize: '3rem'
                    }}>
                      <i className={`bi ${formation.icon}`}></i>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="formation-content" style={{ 
                  padding: '2rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 className="formation-title" style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 700,
                        color: '#1F2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {formation.title}
                      </h3>
                      <p className="formation-subtitle" style={{
                        fontSize: '0.9rem',
                        color: formation.color,
                        fontWeight: 600,
                        margin: 0
                      }}>
                        {formation.subtitle}
                      </p>
                    </div>
                    
                    <div style={{ 
                      fontSize: '1.75rem', 
                      fontWeight: 800,
                      background: formation.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'right'
                    }}>
                      {formation.price}
                    </div>
                  </div>

                  <p className="formation-description" style={{ 
                    color: '#6B7280', 
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    flex: 1
                  }}>
                    {formation.detailedDescription || formation.description}
                  </p>

                  {/* Features */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem', 
                    marginBottom: '1.5rem'
                  }}>
                    {formation.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="feature-tag"
                        style={{
                          background: `${formation.color}08`,
                          color: formation.color,
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          border: `1px solid ${formation.color}20`
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(139, 92, 246, 0.1)',
                    marginTop: 'auto'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="bi bi-clock" style={{ color: '#9CA3AF' }}></i>
                        <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                          {formation.duration}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`bi ${i < Math.floor(formation.rating) ? 'bi-star-fill' : 'bi-star'}`} 
                            style={{ 
                              color: i < formation.rating ? '#F59E0B' : '#D1D5DB',
                              fontSize: '0.8rem'
                            }}
                          />
                        ))}
                        <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                          ({formation.participants})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Boutons */}
                  <div className="action-buttons" style={{ 
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1.5rem'
                  }}>
                    <motion.button
                      className="action-button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewDetails(formation)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: 'white',
                        color: '#1F2937',
                        border: '1.5px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <i className="bi bi-eye"></i>
                      Détails
                    </motion.button>

                    <motion.button
                      className="action-button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDownload(formation)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: formation.color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <i className="bi bi-download"></i>
                      Programme
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="cta-section" style={{ 
            background: 'white',
            borderRadius: '20px',
            padding: '4rem',
            boxShadow: '0 20px 60px rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)',
              zIndex: 0
            }} />
            
            <div className="cta-icon" style={{
              width: '80px',
              height: '80px',
              background: mainGradient,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              color: 'white',
              fontSize: '2rem',
              transform: 'rotate(-5deg)',
              position: 'relative',
              zIndex: 1
            }}>
              <i className="bi bi-gear-fill"></i>
            </div>
            
            <h2 className="cta-title" style={{ 
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: '#1F2937',
              fontWeight: 800,
              position: 'relative',
              zIndex: 1
            }}>
              Formation Sur Mesure
            </h2>
            
            <p className="cta-description" style={{ 
              color: '#6B7280', 
              fontSize: '1.1rem', 
              maxWidth: '600px', 
              margin: '0 auto 2.5rem',
              lineHeight: '1.6',
              position: 'relative',
              zIndex: 1
            }}>
              <strong style={{ 
                background: titleGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Besoin d'un programme adapté à votre entreprise ?
              </strong>{' '}
              Nos experts créent des formations personnalisées basées sur vos objectifs spécifiques.
            </p>
            
            <div className="cta-buttons" style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 1
            }}>
              <motion.button
                className="cta-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContact}
                style={{
                  padding: '16px 32px',
                  background: mainGradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <i className="bi bi-calendar-check"></i>
                Demander un devis
              </motion.button>
              
              <motion.button
                className="cta-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('tel:+21628262829')}
                style={{
                  padding: '16px 32px',
                  background: 'white',
                  color: '#1F2937',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <i className="bi bi-telephone"></i>
                +216 28 262 829
              </motion.button>
            </div>
            
            {/* Quote Section */}
            <div style={{
              marginTop: '3rem',
              paddingTop: '3rem',
              borderTop: '1px solid rgba(139, 92, 246, 0.1)',
              position: 'relative',
              zIndex: 1
            }}>
              <blockquote className="quote-text" style={{
                fontSize: '1.2rem',
                color: '#4B5563',
                fontStyle: 'italic',
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.8',
                position: 'relative',
                padding: '0 2rem'
              }}>
                <i className="bi bi-quote" style={{
                  position: 'absolute',
                  left: '0',
                  top: '-10px',
                  fontSize: '2rem',
                  color: 'rgba(139, 92, 246, 0.2)'
                }}></i>
                « Les neurosciences ne changent pas l'humain, elles lui permettent enfin de se comprendre. »
                <i className="bi bi-quote" style={{
                  position: 'absolute',
                  right: '0',
                  bottom: '-20px',
                  fontSize: '2rem',
                  color: 'rgba(139, 92, 246, 0.2)'
                }}></i>
              </blockquote>
              <p style={{
                textAlign: 'center',
                color: '#8B5CF6',
                fontWeight: '600',
                marginTop: '1.5rem',
                fontSize: '1rem'
              }}>
                Octogo Formation & Conseil
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Notification de téléchargement */}
      <AnimatePresence>
        {(downloadStatus.isDownloading || downloadStatus.isSuccess) && (
          <motion.div
            className="download-notification"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              zIndex: 99999,
              background: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
              border: `3px solid ${downloadStatus.color || '#8B5CF6'}`,
              maxWidth: '350px',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)',
              overflow: 'hidden'
            }}
          >
            <style>
              {`
                @keyframes progress {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
                  50% { opacity: 0.2; transform: translate(-50%, -50%) scale(1.1); }
                }
              `}
            </style>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              marginBottom: '15px'
            }}>
              {/* Icône animée */}
              <div className="notification-icon" style={{
                width: '60px',
                height: '60px',
                background: `linear-gradient(135deg, ${downloadStatus.color || '#8B5CF6'} 0%, ${downloadStatus.color || '#8B5CF6'}80 100%)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                animation: downloadStatus.isDownloading ? 'none' : 'float 2s ease-in-out infinite'
              }}>
                {downloadStatus.isDownloading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      color: 'white',
                      fontSize: '28px'
                    }}
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    style={{
                      color: 'white',
                      fontSize: '28px'
                    }}
                  >
                    <i className="bi bi-file-earmark-check-fill"></i>
                  </motion.div>
                )}
                
                {/* Cercles concentriques */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80px',
                  height: '80px',
                  border: `2px solid ${downloadStatus.color || '#8B5CF6'}40`,
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  margin: '0 0 5px 0', 
                  color: '#1F2937',
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}>
                  {downloadStatus.isDownloading ? '⏳ Téléchargement en cours...' : '✅ Téléchargement réussi !'}
                </h4>
                <p style={{ 
                  margin: 0, 
                  color: '#6B7280',
                  fontSize: '0.9rem',
                  lineHeight: 1.4
                }}>
                  {downloadStatus.isDownloading ? (
                    <>
                      Votre fichier <strong style={{ color: downloadStatus.color || '#8B5CF6' }}>
                        "{downloadStatus.formationName}"
                      </strong> est en cours de téléchargement...
                    </>
                  ) : (
                    <>
                      Votre fichier <strong style={{ color: downloadStatus.color || '#8B5CF6' }}>
                        "{downloadStatus.formationName}"
                      </strong> a été téléchargé avec succès.
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div style={{
              height: '6px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '15px'
            }}>
              {downloadStatus.isDownloading ? (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, ease: 'linear' }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${downloadStatus.color || '#8B5CF6'} 0%, ${downloadStatus.color || '#8B5CF6'}80 100%)`,
                    borderRadius: '3px'
                  }}
                />
              ) : (
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${downloadStatus.color || '#8B5CF6'} 0%, ${downloadStatus.color || '#8B5CF6'}80 100%)`,
                    borderRadius: '3px'
                  }}
                />
              )}
            </div>
            
            {/* Actions rapides */}
            {downloadStatus.isSuccess && (
              <div style={{ 
                display: 'flex', 
                gap: '10px',
                marginTop: '15px'
              }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Ouvrir le dossier de téléchargements
                    window.open('chrome://downloads', '_blank');
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 15px',
                    background: `${downloadStatus.color || '#8B5CF6'}15`,
                    color: downloadStatus.color || '#8B5CF6',
                    border: `1.5px solid ${downloadStatus.color || '#8B5CF6'}30`,
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bi bi-folder"></i>
                  Ouvrir le dossier
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDownloadStatus({
                    isDownloading: false,
                    isSuccess: false,
                    formationName: null,
                    color: null
                  })}
                  style={{
                    padding: '10px 15px',
                    background: 'white',
                    color: '#6B7280',
                    border: '1.5px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bi bi-x-lg"></i>
                  Fermer
                </motion.button>
              </div>
            )}
            
            {/* Petite info */}
            <p style={{ 
              marginTop: '12px',
              fontSize: '0.75rem',
              color: '#9CA3AF',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              <i className="bi bi-info-circle" style={{ marginRight: '5px' }}></i>
              {downloadStatus.isDownloading 
                ? 'Le téléchargement sera terminé dans quelques secondes...' 
                : 'Le fichier se trouve dans votre dossier "Téléchargements"'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal détaillé */}
      <AnimatePresence>
        {isModalOpen && selectedFormation && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
              backdropFilter: 'blur(5px)'
            }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="modal-container"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '1000px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.9)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
              >
                <i className="bi bi-x-lg" style={{ fontSize: '1.2rem' }}></i>
              </button>

              {/* Modal Content */}
              <div style={{
                maxHeight: '90vh',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}>
                {/* Image */}
                <div className="modal-image" style={{
                  height: '450px',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: `3px solid ${selectedFormation.color}`
                }}>
                  {(selectedFormation.detailedImage || selectedFormation.image) ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '30px'
                    }}>
                      <img
                        src={selectedFormation.detailedImage || selectedFormation.image}
                        alt={`Présentation ${selectedFormation.title}`}
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          e.target.onerror = null
                          if (selectedFormation.image) {
                            e.target.src = selectedFormation.image
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: selectedFormation.gradient,
                      color: 'white',
                      fontSize: '4rem'
                    }}>
                      <i className={`bi ${selectedFormation.icon}`}></i>
                    </div>
                  )}
                </div>

                {/* Détails */}
                <div className="modal-content" style={{ padding: '3rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                      <span className="modal-type-badge" style={{
                        background: selectedFormation.color,
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        display: 'inline-block'
                      }}>
                        {selectedFormation.category}
                      </span>
                      <h2 className="modal-title" style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 800, 
                        color: '#1F2937', 
                        margin: '0 0 0.5rem 0',
                        lineHeight: 1.2
                      }}>
                        {selectedFormation.title}
                      </h2>
                      <p className="modal-subtitle" style={{
                        fontSize: '1.25rem',
                        color: selectedFormation.color,
                        fontWeight: 600,
                        margin: '0 0 1rem 0'
                      }}>
                        {selectedFormation.subtitle}
                      </p>
                      <p style={{ 
                        color: '#6B7280', 
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                      }}>
                        {selectedFormation.detailedDescription}
                      </p>
                    </div>
                    
                    <div style={{ 
                      textAlign: 'right',
                      minWidth: '150px'
                    }}>
                      <div className="modal-price" style={{ 
                        fontSize: '3rem', 
                        fontWeight: 800,
                        background: selectedFormation.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1
                      }}>
                        {selectedFormation.price}
                      </div>
                      <div style={{ 
                        color: '#6B7280',
                        fontSize: '0.9rem',
                        marginTop: '0.5rem'
                      }}>
                        HT / personne
                      </div>
                    </div>
                  </div>

                  {/* Informations clés */}
                  <div className="modal-info-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '1.5rem',
                    marginBottom: '3rem',
                    background: `${selectedFormation.color}08`,
                    padding: '2rem',
                    borderRadius: '16px',
                    border: `1px solid ${selectedFormation.color}20`
                  }}>
                    <div className="modal-info-item" style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: selectedFormation.color,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}>
                        <i className="bi bi-clock"></i>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>
                        {selectedFormation.duration}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Durée</div>
                    </div>
                    
                    <div className="modal-info-item" style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: selectedFormation.color,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}>
                        <i className="bi bi-people"></i>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>
                        {selectedFormation.participants}+
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Participants</div>
                    </div>
                    
                    <div className="modal-info-item" style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: selectedFormation.color,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'white',
                        fontSize: '1.5rem'
                      }}>
                        <i className="bi bi-star"></i>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>
                        {selectedFormation.rating}/5
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Satisfaction</div>
                    </div>
                  </div>

                  {/* Objectifs */}
                  <div className="objectifs-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '2rem',
                    marginBottom: '3rem'
                  }}>
                    <div className="objectifs-section" style={{
                      background: `${selectedFormation.color}08`,
                      padding: '2rem',
                      borderRadius: '16px',
                      border: `1px solid ${selectedFormation.color}20`
                    }}>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 700, 
                        color: selectedFormation.color,
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <i className="bi bi-bullseye"></i>
                        Objectifs Pédagogiques
                      </h3>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0,
                        margin: 0
                      }}>
                        {selectedFormation.objectifsPedagogiques.map((obj, idx) => (
                          <li key={idx} style={{ 
                            marginBottom: '0.75rem',
                            display: 'flex',
                            gap: '10px'
                          }}>
                            <i className="bi bi-check-circle" style={{ color: selectedFormation.color }}></i>
                            <span style={{ color: '#4B5563' }}>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="objectifs-section" style={{
                      background: `${selectedFormation.color}08`,
                      padding: '2rem',
                      borderRadius: '16px',
                      border: `1px solid ${selectedFormation.color}20`
                    }}>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 700, 
                        color: selectedFormation.color,
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <i className="bi bi-graph-up-arrow"></i>
                        Objectifs Opérationnels
                      </h3>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0,
                        margin: 0
                      }}>
                        {selectedFormation.objectifsOperationnels.map((obj, idx) => (
                          <li key={idx} style={{ 
                            marginBottom: '0.75rem',
                            display: 'flex',
                            gap: '10px'
                          }}>
                            <i className="bi bi-check-circle" style={{ color: selectedFormation.color }}></i>
                            <span style={{ color: '#4B5563' }}>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Programme et Livrables */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '2rem',
                    marginBottom: '3rem'
                  }}>
                    <div className="deroule-section">
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 700, 
                        color: '#1F2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <i className="bi bi-journal-text"></i>
                        Déroulé de la formation
                      </h3>
                      <div className="deroule-content" style={{
                        background: `${selectedFormation.color}08`,
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: '#4B5563',
                        lineHeight: 1.6
                      }}>
                        {selectedFormation.deroule}
                      </div>
                    </div>
                    
                    <div>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 700, 
                        color: '#1F2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <i className="bi bi-box-seam"></i>
                        Livrables inclus
                      </h3>
                      <div className="livrables-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                        gap: '1rem'
                      }}>
                        {selectedFormation.livrables.map((livrable, idx) => (
                          <div
                            key={idx}
                            className="livrable-item"
                            style={{
                              background: `${selectedFormation.color}08`,
                              color: selectedFormation.color,
                              padding: '1rem',
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              border: `2px solid ${selectedFormation.color}20`,
                              textAlign: 'center',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            <i className="bi bi-check-circle-fill" style={{ marginRight: '5px' }}></i>
                            {livrable}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="modal-actions" style={{ 
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    <motion.button
                      className="modal-action-button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDownload(selectedFormation)}
                      style={{
                        padding: '18px 32px',
                        background: selectedFormation.color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        minWidth: '250px',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 4px 20px ${selectedFormation.color}40`
                      }}
                    >
                      <i className="bi bi-download" style={{ fontSize: '1.2rem' }}></i>
                      Télécharger le programme
                    </motion.button>

                    <motion.button
                      className="modal-action-button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDemandeDevis(selectedFormation)}
                      style={{
                        padding: '18px 32px',
                        background: 'white',
                        color: selectedFormation.color,
                        border: `2px solid ${selectedFormation.color}`,
                        borderRadius: '14px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        minWidth: '250px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className="bi bi-calendar-check" style={{ fontSize: '1.2rem' }}></i>
                      Demander un devis
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Formations;