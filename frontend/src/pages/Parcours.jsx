import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Parcours = () => {
  const [selectedType, setSelectedType] = useState('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParcours, setSelectedParcours] = useState(null);
  const [imageError, setImageError] = useState({});
  const [animatedNumbers, setAnimatedNumbers] = useState({
    satisfaction: 0,
    roi: 0,
    entreprises: 0,
    transformation: 0
  });
  const [downloadStatus, setDownloadStatus] = useState({
    isDownloading: false,
    isSuccess: false,
    parcoursName: null,
    color: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
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

    animateNumber('98', (val) => setAnimatedNumbers(prev => ({...prev, satisfaction: val + '%'})));
    animateNumber('265', (val) => setAnimatedNumbers(prev => ({...prev, roi: val + '%'})));
    animateNumber('500', (val) => setAnimatedNumbers(prev => ({...prev, entreprises: val + '+'})));
    animateNumber('92', (val) => setAnimatedNumbers(prev => ({...prev, transformation: val + '%'})));
  }, []);

  const parcours = [
    {
      id: 1,
      title: 'ÉVEIL',
      subtitle: 'NeuroLeadership & Performance Collective',
      category: 'LEADERSHIP',
      duration: '3 à 5 sessions × 2 jours',
      price: 'Sur devis',
      description: 'Développez un leadership conscient basé sur les neurosciences pour optimiser la performance collective.',
      image: 'src/images/parcours/ÉVEIL.jpg',
      detailedImage: 'src/images/parcours/ÉVEIL.jpg',
      pdf: 'src/pdfs/parcour/ÉVEIL.pdf',
      rating: 4.9,
      participants: 124,
      features: ['Plan managérial', 'Carnet d\'ancrage', 'Rapport complet', 'Certification'],
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      icon: 'bi-brain',
      type: 'LEADERSHIP',
      detailedDescription: 'Développement personnel & professionnel. Programme complet pour développer la conscience de soi et des autres.',
      objectifsPedagogiques: [
        'Développer la conscience de soi et des autres',
        'Renforcer l\'intelligence émotionnelle et les soft skills',
        'Transformer les comportements en leviers de performance'
      ],
      objectifsOperationnels: [
        'Améliorer la résilience, gestion du stress et cohésion d\'équipe',
        'Réduire le turnover',
        'Augmenter la productivité et satisfaction client'
      ],
      deroule: 'Basé sur 3 piliers : formation expérientielle, questionnaire ÉVEIL et carnet d\'ancrage. Travail sur 5 axes : Émotion, Vision, Empathie, Intelligence, Leadership.',
      scenarios: [
        'Initiatique : 3 sessions × 2 jours – introduction aux 5 piliers',
        'Expansif : 5 sessions × 2 jours – parcours complet',
        'Plénitude : format hybride (présentiel + digital + art) immersion transformationnelle'
      ],
      evaluation: 'Mesure avant, pendant et après via outils EQ-i, PSS, NASA-TLX. Indicateurs : baisse du stress (-20%), hausse productivité (+12%). ROI moyen 1 DT → 2,65 DT.',
      livrables: [
        'Plan d\'ÉVEIL managérial',
        'Carnet personnel',
        'Rapport d\'évaluation',
        'Attestation du parcours'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 2,
      title: 'CAPTER',
      subtitle: 'Le cerveau au cœur de la relation client',
      category: 'VENTE',
      duration: '36h à 60h',
      price: 'Sur devis',
      description: 'Maîtrisez les techniques de vente basées sur la compréhension du cerveau du client.',
      image: 'src/images/parcours/capter.png',
      detailedImage: 'src/images/parcours/capter.png',
      pdf: 'src/pdfs/parcour/capter.pdf',
      rating: 4.8,
      participants: 89,
      features: ['Grille d\'auto-évaluation', 'Plan commercial', 'Rapport performance', 'Certification'],
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      icon: 'bi-heart-pulse',
      type: 'VENTE',
      detailedDescription: 'Méthode CAPTE : Comprendre les bases neuroscientifiques de la vente pour développer une approche commerciale éthique.',
      objectifsPedagogiques: [
        'Comprendre les bases neuroscientifiques de la vente',
        'Maîtriser les 5 étapes CAPTE (Confiance, Attention, Personnalisation, Trier & Simplifier, Engagement)',
        'Développer une approche commerciale éthique et centrée sur le cerveau client'
      ],
      objectifsOperationnels: [
        'Améliorer la performance commerciale',
        'Renforcer la confiance et fidélisation client',
        'Réduire la charge cognitive dans le discours de vente',
        'Augmenter les taux de closing'
      ],
      deroule: 'Formation structurée autour des 5 piliers CAPTE. 2 formats : version courte (36h) et version longue (60h).',
      scenarios: [
        'Version courte : 3 sessions × 2 jours – outil rapide et pratique pour vendeurs terrain',
        'Version longue : 5 sessions × 2 jours – parcours complet pour managers et directeurs commerciaux'
      ],
      evaluation: 'Suivi par indicateurs (attention, engagement closing, NPS émotionnel). KPI clés : confiance >4/5, attention >70%, engagement >60%, décision >50%.',
      livrables: [
        'Grille d\'auto-évaluation CAPTE',
        'Plan d\'action commercial',
        'Rapport de performance',
        'Attestation du parcours'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 3,
      title: 'RESET',
      subtitle: 'Neuromanagement & Performance durable',
      category: 'MANAGEMENT',
      duration: '36h à 60h',
      price: 'Sur devis',
      description: 'Adoptez un management durable fondé sur les neurosciences cognitives et sociales.',
      image: 'src/images/parcours/RESET.jpg',
      detailedImage: 'src/images/parcours/RESET.jpg',
      pdf: 'src/pdfs/parcour/RESET.pdf',
      rating: 4.7,
      participants: 156,
      features: ['Questionnaire RESET', 'Plan d\'action', 'Rapport managérial', 'Certification'],
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      icon: 'bi-arrow-repeat',
      type: 'MANAGEMENT',
      detailedDescription: 'Un nouveau départ pour le management tunisien. Programme pour développer un management fondé sur la reconnaissance, l\'équité, le sens, l\'engagement et l\'autonomie.',
      objectifsPedagogiques: [
        'Comprendre les leviers cognitifs et émotionnels de la motivation',
        'Développer un management fondé sur la reconnaissance, l\'équité, le sens, l\'engagement et l\'autonomie'
      ],
      objectifsOperationnels: [
        'Améliorer la confiance et cohésion d\'équipe',
        'Réduire le stress et résistance au changement',
        'Renforcer l\'engagement et performance collective',
        'Instaurer un management durable et conscient'
      ],
      deroule: 'Formation basée sur le modèle R.E.S.E.T : R – Reconnaissance | E – Équité | S – Sens | E – Engagement | T – Territoire/Autonomie. Deux formats : courte (36h) et longue (60h).',
      scenarios: [
        'Compréhension du cerveau managérial et des émotions',
        'Application des leviers RESET en situation réelle',
        'Transformation managériale et plan d\'action collectif'
      ],
      evaluation: 'Suivi par indicateurs RESET : reconnaissance, équité, sens, engagement, autonomie. Objectifs : +20% estime de soi, +15% justice perçue, +25% alignement au sens, +20% autonomie, +15% engagement global. ROI estimé : 800% sur 12 mois.',
      livrables: [
        'Questionnaire RESET',
        'Plan d\'action individuel et collectif',
        'Rapport d\'impact managérial',
        'Attestation du parcours'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 4,
      title: 'TRANS-FORMATION',
      subtitle: 'Leadership transformationnel et intelligence émotionnelle',
      category: 'TRANSFORMATION',
      duration: '72h (12 jours)',
      price: 'Sur devis',
      description: 'Leadership transformationnel et intelligence émotionnelle pour une performance optimale.',
      image: 'src/images/parcours/transformation.jpg',
      detailedImage: 'src/images/parcours/transformation.jpg',
      pdf: 'src/pdfs/parcour/transformation.pdf',
      rating: 4.8,
      participants: 112,
      features: ['Journal émotionnel', 'Rapport EQ-i', 'Plan personnalisé', 'Certification'],
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      icon: 'bi-stars',
      type: 'TRANSFORMATION',
      detailedDescription: 'Programme intensif pour développer la conscience de soi, la gestion émotionnelle et la prise de décision consciente.',
      objectifsPedagogiques: [
        'Développer la conscience de soi, la gestion émotionnelle et la prise de décision consciente',
        'Renforcer les compétences en communication, leadership et gestion du stress',
        'Utiliser les neurosciences et le modèle de Bar-On'
      ],
      objectifsOperationnels: [
        'Former des leaders capables d\'inspirer, de décider avec clarté et de transformer leurs équipes',
        'Améliorer l\'efficacité managériale, collaboration et résilience organisationnelle',
        '+25% d\'engagement'
      ],
      deroule: 'Programme de 72h (12 jours, 6 sessions de 2 jours). Structure basée sur 5 dimensions : perception de soi, expression individuelle, relations humaines, prise de décision, gestion du stress.',
      scenarios: [
        'Présentiel intensif : 6 sessions de 2 jours – développement complet des 5 dimensions',
        'Hybride : sessions en ligne et ateliers immersifs – flexibilité et accompagnement personnalisé'
      ],
      evaluation: 'Évaluation avant/après via EQ-i 2.0 et outils de mesure émotionnelle. KPI : +25% engagement, +20% prise de décision consciente, +15% gestion du stress, +30% performance collective.',
      livrables: [
        'Journal de leadership émotionnel',
        'Rapport EQ-i individuel',
        'Plan d\'action personnalisé',
        'Attestation du parcours'
      ],
      contact: '+216 98 21 05 10',
      website: 'www.octogo.tn',
      email: 'contact@octogo.tn'
    },
    {
      id: 5,
      title: 'VOL D\'AIGLE',
      subtitle: 'Comprendre les tensions géopolitiques et économiques',
      category: 'STRATÉGIE',
      duration: '2 à 3 jours',
      price: 'Sur devis',
      description: 'Comprenez les tensions géopolitiques et économiques pour un leadership éclairé.',
      image: 'src/images/parcours/vol.jpg',
      detailedImage: 'src/images/parcours/vol.jpg',
      pdf: 'src/pdfs/parcour/vol.pdf',
      rating: 4.9,
      participants: 98,
      features: ['Guide stratégique', 'Fiches communication', 'Plan leadership', 'Synthèse finale'],
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      icon: 'bi-eye',
      type: 'STRATÉGIE',
      detailedDescription: 'Un parcours de résilience et de clarté dans un monde en tempête. Voir loin. Voler haut. Agir juste.',
      objectifsPedagogiques: [
        'Comprendre les mécanismes cognitifs de la prise de décision',
        'Adopter une posture de leader inspirant',
        'Développer la capacité à prendre de la hauteur (observer → analyser → décider → agir)',
        'Renforcer l\'impact de la communication managériale'
      ],
      objectifsOperationnels: [
        'Améliorer l\'alignement stratégique des équipes',
        'Fluidifier la communication interne',
        'Renforcer l\'autonomie et responsabilisation',
        'Mettre en place un plan d\'action de leadership sur 90 jours'
      ],
      deroule: 'Formation articulée autour de la méthode Vol d\'Aigle (Vision, Hauteur, Clarté, Action). 2 formats : séminaire (2 jours) et version renforcée (3 jours + coaching).',
      scenarios: [
        'Version Séminaire (2 jours) : prise de hauteur + construction du plan d\'action',
        'Version Renforcée (3 jours + 1 point d\'ancrage à 30 jours) : intégration terrain + accompagnement de mise en œuvre'
      ],
      evaluation: 'Suivi par indicateurs d\'évolution de posture (clarté, assertivité, autonomie, alignement). KPI : clarté objectifs >70%, qualité feedbacks >60%, cohésion perçue >4/5.',
      livrables: [
        'Guide de prise de hauteur',
        'Fiches outils de communication',
        'Plan d\'action leadership 90 jours',
        'Synthèse d\'évaluation finale'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 6,
      title: 'NEUROVENTE',
      subtitle: 'Vendre au cerveau pour toucher le cœur',
      category: 'VENTE',
      duration: '54h (3 sessions × 18h)',
      price: 'Sur devis',
      description: 'Vendre au cerveau pour toucher le cœur et optimiser vos performances commerciales.',
      image: 'src/images/parcours/neurovente.jpg',
      detailedImage: 'src/images/parcours/neurovente.jpg',
      pdf: 'src/pdfs/parcour/neurovente.pdf',
      rating: 4.7,
      participants: 145,
      features: ['Plan commercial', 'Grille d\'évaluation', 'Rapport performance', 'Certification'],
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      icon: 'bi-cart-check',
      type: 'VENTE',
      detailedDescription: 'Comprendre le cerveau. Parler aux émotions. Vendre avec impact. Parcours complet de neurovente basé sur les neurosciences.',
      objectifsPedagogiques: [
        'Comprendre les mécanismes cérébraux et émotionnels qui influencent la décision d\'achat',
        'Maîtriser les techniques de neurovente et neuropersuasion éthique',
        'Basé sur les neurosciences, intelligences multiples et intelligence émotionnelle'
      ],
      objectifsOperationnels: [
        'Augmenter le taux de closing et fidélisation client',
        'Adapter les approches commerciales aux besoins cognitifs et émotionnels des clients',
        'Développer une posture de vendeur confiant, empathique et stratégique'
      ],
      deroule: 'Durée : 54h (3 sessions × 18h). Session 1 : Maîtriser son cerveau. Session 2 : Décrypter le cerveau client. Session 3 : Influencer avec éthique.',
      scenarios: [
        'Format présentiel ou hybride',
        'Méthodes : ateliers pratiques, études de cas, jeux de rôle, auto-évaluations'
      ],
      evaluation: 'Suivi par indicateurs clés : +20 à +35% taux de closing, x2 à x3 fidélisation client. Évaluation via EQ-i, tests de profil émotionnel et indicateurs SIM.',
      livrables: [
        'Plan d\'action commercial personnalisé',
        'Grille d\'auto-évaluation',
        'Rapport de performance',
        'Attestation du parcours'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn'
    },
    {
      id: 7,
      title: 'NEUROMARKETING',
      subtitle: 'Le cerveau au service de la stratégie',
      category: 'MARKETING',
      duration: '24h à 48h',
      price: 'Sur devis',
      description: 'Comprendre comment le cerveau prend ses décisions pour créer des messages et offres qui influencent avec éthique.',
      image: 'src/images/parcours/neuromarketing.jpg',
      detailedImage: 'src/images/parcours/neuromarketing.jpg',
      pdf: 'src/pdfs/parcour/neuromarketing.pdf',
      rating: 4.8,
      participants: 178,
      features: ['Analyse neuromarketing', 'Canevas de message', 'Benchmark d\'influence', 'Rapport d\'évaluation'],
      color: '#f65c9cff',
      gradient: 'linear-gradient(135deg, #f65c9cff 0%, #A78BFA 100%)',
      icon: 'bi-bullseye',
      type: 'MARKETING',
      detailedDescription: 'Décoder les mécanismes du cerveau. Captiver l\'attention. Influencer avec éthique. Une approche scientifique qui unit psychologie, émotions et stratégies marketing.',
      objectifsPedagogiques: [
        'Comprendre comment le cerveau prend ses décisions',
        'Maîtriser les leviers cognitifs d\'attention, d\'émotion et de mémorisation',
        'Apprendre à construire des messages, visuels et offres qui influencent sans manipuler'
      ],
      objectifsOperationnels: [
        'Renforcer l\'impact des campagnes et supports de communication',
        'Augmenter l\'engagement et le taux de conversion',
        'Améliorer l\'attractivité de l\'offre en réduisant la charge cognitive',
        'Optimiser les points de contact marketing'
      ],
      deroule: 'Formation structurée autour des 3 piliers du neuromarketing : Attention → Émotion → Décision.',
      scenarios: [
        'Version Courte (24h) : bases neuro + optimisation immédiate d\'un support (site, brochure, pitch)',
        'Version Intensive (48h + atelier terrain) : refonte stratégique du positionnement et des messages clés'
      ],
      evaluation: 'Suivi par indicateurs d\'attention, engagement émotionnel, mémorisation et conversion. KPI : attention >70%, émotion >60%, souvenir >50%, action >30%.',
      livrables: [
        'Grille d\'analyse neuromarketing',
        'Canevas de construction de message',
        'Benchmark d\'influence éthique',
        'Rapport d\'évaluation et attestation'
      ],
      contact: '+216 28 26 28 29',
      website: 'www.octogo.tn',
      email: 'contact@octogo.tn'
    },
   {
  id: 8,
  title: 'TRIVIUM',
  subtitle: 'Leadership, discernement et gouvernance stratégique',
  category: 'LEADERSHIP',
  duration: '24h à 72h',
  price: 'Sur devis',
  description: 'TRIVIUM est une architecture de développement du leadership conçue pour renforcer la qualité des décisions, la stabilité humaine et la gouvernance dans des environnements complexes et incertains.',
  image: 'src/images/parcours/trivium.jpg',
  detailedImage: 'src/images/parcours/trivium.jpg',
  pdf: 'src/pdfs/parcour/trivium.pdf',
  rating: 4.9,
  participants: 210,
  features: [
    'Leadership stratégique',
    'Discernement décisionnel',
    'Influence et communication',
    'Gouvernance humaine'
  ],
  color: '#dc2626',
  gradient: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
  icon: 'bi-diagram-3',
  type: 'LEADERSHIP',
  detailedDescription: 'TRIVIUM transpose l’architecture historique du Trivium — Grammaire, Rhétorique et Logique — au leadership moderne. Le programme développe la stabilité intérieure du dirigeant, sa capacité d’influence et son discernement stratégique pour gouverner avec lucidité dans un monde instable.',
  objectifsPedagogiques: [
    'Développer une prise de décision lucide sous pression',
    'Renforcer la stabilité émotionnelle et cognitive du leader',
    'Structurer une communication claire et influente',
    'Maîtriser les fondamentaux du leadership stratégique'
  ],
  objectifsOperationnels: [
    'Améliorer la qualité des décisions stratégiques',
    'Renforcer la cohérence et la gouvernance des équipes',
    'Développer une influence durable et éthique',
    'Réduire les risques liés à la surcharge cognitive et émotionnelle'
  ],
  deroule: 'Formation structurée autour des trois piliers du programme TRIVIUM : ÉVEIL → CAPTER → VOL D’AIGLE.',
  scenarios: [
    'Version Executive (24h) : vision stratégique, leadership et gouvernance',
    'Version Immersive (48h à 72h) : ateliers de décision, intelligence émotionnelle et simulation de gestion sous pression'
  ],
  evaluation: 'Évaluation basée sur la qualité décisionnelle, la stabilité émotionnelle, la capacité d’influence et le discernement stratégique. KPI : clarté décisionnelle >75%, stabilité cognitive >70%, impact relationnel >65%.',
  livrables: [
    'Diagnostic de leadership',
    'Matrice de discernement stratégique',
    'Plan de gouvernance personnelle',
    'Rapport d’évaluation et attestation'
  ],
  contact: '+216 28 26 28 29',
  website: 'www.octogo.tn',
  email: 'contact@octogo.tn'
}
];

  const categories = ['TOUS', 'LEADERSHIP', 'VENTE', 'MANAGEMENT', 'TRANSFORMATION', 'STRATÉGIE', 'MARKETING'];

  const filteredParcours = selectedType === 'TOUS' 
    ? parcours 
    : parcours.filter(p => p.type === selectedType);

  const handleImageError = (id) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const handleDownload = async (parcoursItem) => {
    setDownloadStatus({
      isDownloading: true,
      isSuccess: false,
      parcoursName: parcoursItem.title,
      color: parcoursItem.color
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      window.open(parcoursItem.pdf, '_blank');
      
      setDownloadStatus({
        isDownloading: false,
        isSuccess: true,
        parcoursName: parcoursItem.title,
        color: parcoursItem.color
      });
      
      setTimeout(() => {
        setDownloadStatus({
          isDownloading: false,
          isSuccess: false,
          parcoursName: null,
          color: null
        });
      }, 3000);
      
      console.log(`PDF ouvert: ${parcoursItem.title}`);
      
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du PDF:', error);
      setDownloadStatus({
        isDownloading: false,
        isSuccess: false,
        parcoursName: parcoursItem.title,
        color: parcoursItem.color
      });
      
      setTimeout(() => {
        setDownloadStatus({
          isDownloading: false,
          isSuccess: false,
          parcoursName: null,
          color: null
        });
      }, 3000);
    }
  };

  const handleContact = () => {
    navigate('/contact');
  };

  const handleViewDetails = (parcoursItem) => {
    setSelectedParcours(parcoursItem);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedParcours(null);
    document.body.style.overflow = 'auto';
  };

  // Fonction pour gérer la demande de devis avec nom du parcours
  const handleDemandeDevis = (parcoursItem) => {
    // Fermer le modal
    handleCloseModal();
    
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      // Si non connecté, rediriger vers login avec retour vers dashboard
      navigate(`/login?redirect=/dashboard&action=demande-devis&parcoursId=${parcoursItem.id}&parcoursNom=${encodeURIComponent(parcoursItem.title)}`);
    } else {
      // Si connecté, rediriger vers le dashboard avec paramètres
      navigate(`/dashboard?action=demande-devis&parcoursId=${parcoursItem.id}&parcoursNom=${encodeURIComponent(parcoursItem.title)}`);
    }
  };

  const parcoursStats = [
    {
      icon: 'bi-emoji-smile-fill',
      value: animatedNumbers.satisfaction,
      label: 'Satisfaction'
    },
    {
      icon: 'bi-graph-up-arrow',
      value: animatedNumbers.roi,
      label: 'ROI Moyen'
    },
    {
      icon: 'bi-building',
      value: animatedNumbers.entreprises,
      label: 'Entreprises'
    },
    {
      icon: 'bi-award-fill',
      value: animatedNumbers.transformation,
      label: 'Transformation'
    }
  ];

  const mainGradient = 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%)';
  const titleGradient = 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)';

  return (
    <>
      <style jsx>{`
        /* CSS pour le responsive mobile */
        @media (max-width: 768px) {
          /* Container responsive */
          .container {
            width: 100%;
            padding: 0 15px;
            margin: 0 auto;
          }
          
          /* Header responsive */
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
          
          /* Stats responsive */
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
          
          /* Filters responsive */
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
          
          /* Parcours Grid responsive */
          .parcours-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            margin-bottom: 3rem !important;
          }
          
          .parcours-card {
            border-radius: 15px !important;
          }
          
          .category-badge {
            top: 12px !important;
            left: 12px !important;
            padding: 4px 12px !important;
            font-size: 0.7rem !important;
          }
          
          .parcours-image {
            height: 180px !important;
          }
          
          .parcours-content {
            padding: 1.25rem !important;
          }
          
          .parcours-title {
            font-size: 1.25rem !important;
          }
          
          .parcours-subtitle {
            font-size: 0.85rem !important;
          }
          
          .parcours-description {
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
          
          /* CTA Section responsive */
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
            fontSize: 0.9rem !important;
            marginBottom: 1.5rem !important;
          }
          
          .cta-buttons {
            flexDirection: column !important;
            gap: 0.5rem !important;
          }
          
          .cta-button {
            padding: 12px !important;
            fontSize: 0.9rem !important;
          }
          
          .quote-text {
            fontSize: 1rem !important;
            padding: 0 1rem !important;
          }
          
          /* Modal responsive */
          .modal-overlay {
            padding: 10px !important;
          }
          
          .modal-container {
            maxHeight: 85vh !important;
            borderRadius: 15px !important;
          }
          
          .modal-image {
            height: 200px !important;
          }
          
          .modal-content {
            padding: 1.25rem !important;
          }
          
          .modal-type-badge {
            fontSize: 0.8rem !important;
            padding: 6px 15px !important;
          }
          
          .modal-title {
            fontSize: 1.5rem !important;
          }
          
          .modal-subtitle {
            fontSize: 1rem !important;
          }
          
          .modal-price {
            fontSize: 1.5rem !important;
          }
          
          .modal-info-grid {
            gridTemplateColumns: repeat(2, 1fr) !important;
            gap: 1rem !important;
            padding: 1rem !important;
          }
          
          .objectifs-grid {
            gridTemplateColumns: 1fr !important;
            gap: 1rem !important;
          }
          
          .objectifs-section {
            padding: 1rem !important;
          }
          
          .deroule-content, .objectifs-list li {
            fontSize: 0.9rem !important;
          }
          
          .livrables-grid {
            gridTemplateColumns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }
          
          .livrable-item {
            fontSize: 0.75rem !important;
            padding: 0.75rem !important;
          }
          
          .modal-actions {
            flexDirection: column !important;
            gap: 0.75rem !important;
          }
          
          .modal-action-button {
            minWidth: 100% !important;
            padding: 14px !important;
            fontSize: 0.9rem !important;
          }
          
          /* Notification responsive */
          .download-notification {
            bottom: 15px !important;
            right: 15px !important;
            left: 15px !important;
            maxWidth: none !important;
            width: auto !important;
            padding: 1.25rem !important;
          }
          
          .notification-icon {
            width: 45px !important;
            height: 45px !important;
            fontSize: 1.25rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            gridTemplateColumns: 1fr !important;
          }
          
          .modal-info-grid {
            gridTemplateColumns: 1fr !important;
          }
          
          .livrables-grid {
            gridTemplateColumns: 1fr !important;
          }
          
          .page-title {
            fontSize: 1.5rem !important;
          }
          
          .page-header-logo {
            height: 50px !important;
          }
        }
        
        /* Pour très petits écrans */
        @media (max-width: 360px) {
          .container {
            padding: 0 10px;
          }
          
          .filter-button {
            padding: 0.4rem 0.8rem !important;
            fontSize: 0.75rem !important;
          }
          
          .parcours-image {
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
            Parcours Certifiants
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
              Programmes complets de transformation basés sur les neurosciences
            </strong>{' '}
            conçus pour développer vos compétences avec certification et ROI mesurable.
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
            {parcoursStats.map((stat, index) => (
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
                  onClick={() => setSelectedType(category)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: selectedType === category 
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' 
                      : 'rgba(139, 92, 246, 0.05)',
                    color: selectedType === category ? 'white' : '#6B7280',
                    border: selectedType === category 
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

          {/* Parcours Grid */}
          <div className="parcours-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
            gap: '2.5rem',
            marginBottom: '5rem'
          }}>
            {filteredParcours.map((parcoursItem, index) => (
              <motion.div
                key={parcoursItem.id}
                className="parcours-card"
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
                  background: parcoursItem.color,
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  zIndex: 2
                }}>
                  {parcoursItem.category}
                </div>

                {/* Image */}
                <div className="parcours-image" style={{ 
                  height: '250px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: `3px solid ${parcoursItem.color}`
                }}>
                  {parcoursItem.detailedImage || parcoursItem.image ? (
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
                        src={parcoursItem.detailedImage || parcoursItem.image}
                        alt={`Affiche ${parcoursItem.title}`}
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onError={() => handleImageError(parcoursItem.id)}
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
                      color: parcoursItem.color,
                      fontSize: '3rem'
                    }}>
                      <i className={`bi ${parcoursItem.icon}`}></i>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="parcours-content" style={{ 
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
                      <h3 className="parcours-title" style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 700,
                        color: '#1F2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {parcoursItem.title}
                      </h3>
                      <p className="parcours-subtitle" style={{
                        fontSize: '0.9rem',
                        color: parcoursItem.color,
                        fontWeight: 600,
                        margin: 0
                      }}>
                        {parcoursItem.subtitle}
                      </p>
                    </div>
                    
                    <div style={{ 
                      fontSize: '1.75rem', 
                      fontWeight: 800,
                      background: parcoursItem.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'right'
                    }}>
                      {parcoursItem.price}
                    </div>
                  </div>

                  <p className="parcours-description" style={{ 
                    color: '#6B7280', 
                    marginBottom: '1.5rem',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    flex: 1
                  }}>
                    {parcoursItem.detailedDescription || parcoursItem.description}
                  </p>

                  {/* Features */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem', 
                    marginBottom: '1.5rem'
                  }}>
                    {parcoursItem.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="feature-tag"
                        style={{
                          background: `${parcoursItem.color}08`,
                          color: parcoursItem.color,
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          border: `1px solid ${parcoursItem.color}20`
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
                          {parcoursItem.duration}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`bi ${i < Math.floor(parcoursItem.rating) ? 'bi-star-fill' : 'bi-star'}`} 
                            style={{ 
                              color: i < parcoursItem.rating ? '#F59E0B' : '#D1D5DB',
                              fontSize: '0.8rem'
                            }}
                          />
                        ))}
                        <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                          ({parcoursItem.participants})
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
                      onClick={() => handleViewDetails(parcoursItem)}
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
                      onClick={() => handleDownload(parcoursItem)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: parcoursItem.color,
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
              Parcours Sur Mesure
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
                Besoin d'un parcours adapté à votre entreprise ?
              </strong>{' '}
              Nos experts créent des programmes personnalisés basés sur vos objectifs spécifiques.
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
                « La transformation commence par la compréhension du cerveau. »
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
                Octogo Parcours & Certification
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
                        "{downloadStatus.parcoursName}"
                      </strong> est en cours de téléchargement...
                    </>
                  ) : (
                    <>
                      Votre fichier <strong style={{ color: downloadStatus.color || '#8B5CF6' }}>
                        "{downloadStatus.parcoursName}"
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
                    parcoursName: null,
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
        {isModalOpen && selectedParcours && (
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
                  borderBottom: `3px solid ${selectedParcours.color}`
                }}>
                  {(selectedParcours.detailedImage || selectedParcours.image) ? (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '30px'
                    }}>
                      <img
                        src={selectedParcours.detailedImage || selectedParcours.image}
                        alt={`Présentation ${selectedParcours.title}`}
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          objectFit: 'contain',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          e.target.onerror = null
                          if (selectedParcours.image) {
                            e.target.src = selectedParcours.image
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
                      background: selectedParcours.gradient,
                      color: 'white',
                      fontSize: '4rem'
                    }}>
                      <i className={`bi ${selectedParcours.icon}`}></i>
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
                        background: selectedParcours.color,
                        color: 'white',
                        padding: '8px 20px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        display: 'inline-block'
                      }}>
                        {selectedParcours.category}
                      </span>
                      <h2 className="modal-title" style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 800, 
                        color: '#1F2937', 
                        margin: '0 0 0.5rem 0',
                        lineHeight: 1.2
                      }}>
                        {selectedParcours.title}
                      </h2>
                      <p className="modal-subtitle" style={{
                        fontSize: '1.25rem',
                        color: selectedParcours.color,
                        fontWeight: 600,
                        margin: '0 0 1rem 0'
                      }}>
                        {selectedParcours.subtitle}
                      </p>
                      <p style={{ 
                        color: '#6B7280', 
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                      }}>
                        {selectedParcours.detailedDescription}
                      </p>
                    </div>
                    
                    <div style={{ 
                      textAlign: 'right',
                      minWidth: '150px'
                    }}>
                      <div className="modal-price" style={{ 
                        fontSize: '3rem', 
                        fontWeight: 800,
                        background: selectedParcours.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1
                      }}>
                        {selectedParcours.price}
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
                    background: `${selectedParcours.color}08`,
                    padding: '2rem',
                    borderRadius: '16px',
                    border: `1px solid ${selectedParcours.color}20`
                  }}>
                    <div className="modal-info-item" style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: selectedParcours.color,
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
                        {selectedParcours.duration}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Durée</div>
                    </div>
                    
                    <div className="modal-info-item" style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: selectedParcours.color,
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
                        {selectedParcours.participants}+
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Participants</div>
                    </div>
                    
                    <div className="modal-info-item" style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: selectedParcours.color,
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
                        {selectedParcours.rating}/5
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
                      background: `${selectedParcours.color}08`,
                      padding: '2rem',
                      borderRadius: '16px',
                      border: `1px solid ${selectedParcours.color}20`
                    }}>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 700, 
                        color: selectedParcours.color,
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
                        {selectedParcours.objectifsPedagogiques.map((obj, idx) => (
                          <li key={idx} style={{ 
                            marginBottom: '0.75rem',
                            display: 'flex',
                            gap: '10px'
                          }}>
                            <i className="bi bi-check-circle" style={{ color: selectedParcours.color }}></i>
                            <span style={{ color: '#4B5563' }}>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="objectifs-section" style={{
                      background: `${selectedParcours.color}08`,
                      padding: '2rem',
                      borderRadius: '16px',
                      border: `1px solid ${selectedParcours.color}20`
                    }}>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 700, 
                        color: selectedParcours.color,
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
                        {selectedParcours.objectifsOperationnels.map((obj, idx) => (
                          <li key={idx} style={{ 
                            marginBottom: '0.75rem',
                            display: 'flex',
                            gap: '10px'
                          }}>
                            <i className="bi bi-check-circle" style={{ color: selectedParcours.color }}></i>
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
                        Déroulé du parcours
                      </h3>
                      <div className="deroule-content" style={{
                        background: `${selectedParcours.color}08`,
                        padding: '1.5rem',
                        borderRadius: '12px',
                        color: '#4B5563',
                        lineHeight: 1.6
                      }}>
                        {selectedParcours.deroule}
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
                        {selectedParcours.livrables.map((livrable, idx) => (
                          <div
                            key={idx}
                            className="livrable-item"
                            style={{
                              background: `${selectedParcours.color}08`,
                              color: selectedParcours.color,
                              padding: '1rem',
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              border: `2px solid ${selectedParcours.color}20`,
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
                      onClick={() => handleDownload(selectedParcours)}
                      style={{
                        padding: '18px 32px',
                        background: selectedParcours.color,
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
                        boxShadow: `0 4px 20px ${selectedParcours.color}40`
                      }}
                    >
                      <i className="bi bi-download" style={{ fontSize: '1.2rem' }}></i>
                      Télécharger le programme
                    </motion.button>

                    <motion.button
                      className="modal-action-button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDemandeDevis(selectedParcours)}
                      style={{
                        padding: '18px 32px',
                        background: 'white',
                        color: selectedParcours.color,
                        border: `2px solid ${selectedParcours.color}`,
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

export default Parcours;