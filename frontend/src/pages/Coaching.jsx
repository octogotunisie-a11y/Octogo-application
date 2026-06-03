import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain,
  Heart,
  Target,
  Users,
  Zap,
  Award,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Star,
  Shield,
  Rocket,
  Calendar,
  UserCheck,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  BookOpen,
  Briefcase,
  TargetIcon,
  BarChart,
  UsersRound,
  BrainCircuit,
  Trophy,
  Crown,
  Sparkle,
  Target as TargetIcon2,
  TrendingUp as TrendingUpIcon,
  Zap as ZapIcon,
  Award as AwardIcon,
  UserPlus,
  Clock3,
  CheckSquare,
  ArrowUpRight,
  Eye,
  Brain as BrainIcon,
  Baby,
  Home,
  Building,
  Dumbbell
} from 'lucide-react'

// ==================== COULEURS ====================
const COLORS = {
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  secondary: '#EC4899',
  secondaryLight: '#F472B6',
  secondaryDark: '#DB2777',
  accent: '#F97316',
  accentLight: '#FB923C',
  accentDark: '#EA580C',
  dark: '#1F2937',
  darkGray: '#4B5563',
  light: '#FFFFFF',
  lightGray: '#F9FAFB',
  textGray: '#6B7280',
  white: '#FFFFFF',
  lightViolet: 'rgba(139, 92, 246, 0.05)',
  lightPink: 'rgba(236, 72, 153, 0.05)',
  lightOrange: 'rgba(249, 115, 22, 0.05)',
  gradientMain: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  gradientLight: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(236, 72, 153, 0.05))',
  gradientDark: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
  gradientAccent: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)'
}

// ==================== ANIMATIONS ====================
const animations = {
  fadeInUp: {
    animation: 'fadeInUp 0.6s ease-out forwards',
    opacity: 0,
    transform: 'translateY(20px)'
  },
  fadeIn: {
    animation: 'fadeIn 0.8s ease-out forwards',
    opacity: 0
  },
  scaleIn: {
    animation: 'scaleIn 0.6s ease-out forwards',
    opacity: 0,
    transform: 'scale(0.95)'
  },
  slideInLeft: {
    animation: 'slideInLeft 0.6s ease-out forwards',
    opacity: 0,
    transform: 'translateX(-30px)'
  },
  slideInRight: {
    animation: 'slideInRight 0.6s ease-out forwards',
    opacity: 0,
    transform: 'translateX(30px)'
  },
  pulse: {
    animation: 'pulse 2s infinite'
  },
  float: {
    animation: 'float 3s ease-in-out infinite'
  }
}

// ==================== PAGE COACHING ====================
const Coaching = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [animatedElements, setAnimatedElements] = useState({})
  const navigate = useNavigate()
  const sectionRefs = useRef([])
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    setIsVisible(true)
    
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    
    // Animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements(prev => ({
              ...prev,
              [entry.target.id]: true
            }))
          }
        })
      },
      { threshold: 0.1 }
    )
    
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })
    
    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [])
  
  // Fonction pour gérer le contact (bouton principal)
  const handleContact = () => {
    navigate('/contact')
  }

  // Fonction pour gérer la demande de devis (identique à Parcours)
  const handleDemandeDevis = (coaching) => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      // Si non connecté, rediriger vers login avec retour vers dashboard
      navigate(`/login?redirect=/dashboard&action=demande-devis&coachingId=${coaching.id}&coachingNom=${encodeURIComponent(coaching.title)}`);
    } else {
      // Si connecté, rediriger vers le dashboard avec paramètres
      navigate(`/dashboard?action=demande-devis&coachingId=${coaching.id}&coachingNom=${encodeURIComponent(coaching.title)}`);
    }
  };

  // Données combinées pour coaching avec IDs
  const COACHING_DATA = {
    personal: [
      {
        id: 'personal-eveil',
        title: 'Éveil Intérieur',
        sessions: '5 séances',
        duration: '1h30 par séance',
        description: 'Un parcours initiatique pour découvrir votre véritable potentiel et aligner vos aspirations profondes.',
        features: [
          'Clarification des objectifs de vie',
          'Identification des schémas limitants',
          'Techniques de pleine conscience avancées',
          'Plan d\'action personnalisé sur 3 mois'
        ],
        color: COLORS.primary,
        gradient: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.primary}05)`,
        bestFor: 'Débutants en développement personnel',
        image: 'src/images/coaching/1.jpg',
        imageAlt: 'Coaching Éveil Intérieur'
      },
      {
        id: 'personal-alignement',
        title: 'Alignement Profond',
        sessions: '15 séances',
        duration: '1h30 par séance',
        description: 'Une transformation progressive pour ancrer des changements durables dans votre vie quotidienne.',
        features: [
          'Transformation des croyances limitantes',
          'Développement personnel intégral',
          'Gestion émotionnelle avancée',
          'Suivi régulier et ajustements personnalisés'
        ],
        color: COLORS.secondary,
        gradient: `linear-gradient(135deg, ${COLORS.secondary}15, ${COLORS.secondary}05)`,
        bestFor: 'Ceux qui cherchent une transformation durable',
        image: 'src/images/coaching/2.jpg',
        imageAlt: 'Coaching Alignement Profond'
      },
      {
        id: 'personal-transformation',
        title: 'Transformation 360°',
        sessions: '30 séances',
        duration: '1h30 par séance',
        description: 'Un accompagnement complet pour une métamorphose profonde de tous les aspects de votre vie.',
        features: [
          'Accompagnement complet sur 6 mois',
          'Intégration des nouvelles habitudes',
          'Développement de la résilience émotionnelle',
          'Communauté de soutien exclusive'
        ],
        color: COLORS.accent,
        gradient: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.accent}05)`,
        bestFor: 'Ceux prêts pour une transformation totale',
        image: 'src/images/coaching/3.jpg',
        imageAlt: 'Coaching Transformation 360°'
      }
    ],
    professional: [
      {
        id: 'professional-performance',
        title: 'Performance Essentielle',
        sessions: '5 séances',
        duration: '1h30 par séance',
        description: 'Optimisez votre productivité et développez des habitudes de travail basées sur les neurosciences.',
        features: [
          'Optimisation de la productivité neuronale',
          'Gestion du temps neuroscientifique',
          'Techniques de focus et concentration profonde',
          'Stratégies anti-procrastination efficaces'
        ],
        color: COLORS.primary,
        gradient: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.primary}05)`,
        bestFor: 'Professionnels cherchant à optimiser leur temps',
        image: 'src/images/coaching/4.jpg',
        imageAlt: 'Coaching Performance Essentielle'
      },
      {
        id: 'professional-impact',
        title: 'Impact Professionnel',
        sessions: '15 séances',
        duration: '1h30 par séance',
        description: 'Développez une présence et une influence professionnelle qui font la différence.',
        features: [
          'Communication neuroscientifique avancée',
          'Leadership conscient et inspirant',
          'Gestion des conflits constructifs',
          'Développement de l\'influence stratégique'
        ],
        color: COLORS.secondary,
        gradient: `linear-gradient(135deg, ${COLORS.secondary}15, ${COLORS.secondary}05)`,
        bestFor: 'Managers et leaders en développement',
        image: 'src/images/coaching/5.jpg',
        imageAlt: 'Coaching Impact Professionnel'
      },
      {
        id: 'professional-excellence',
        title: 'Excellence Stratégique',
        sessions: '30 séances',
        duration: '1h30 par séance',
        description: 'Élaborez une vision stratégique à long terme et positionnez-vous comme expert dans votre domaine.',
        features: [
          'Stratégie de carrière sur 5 ans',
          'Développement du leadership exécutif',
          'Réseautage efficace et stratégique',
          'Transformation managériale complète'
        ],
        color: COLORS.accent,
        gradient: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.accent}05)`,
        bestFor: 'Cadres supérieurs et dirigeants',
        image: 'src/images/coaching/6.jpg',
        imageAlt: 'Coaching Excellence Stratégique'
      }
    ]
  }

  const SPECIALIZED_COACHING = [
    {
      id: 'specialized-sportif',
      title: 'Coaching Sportif et Athlètes',
      description: 'Maximisez votre performance mentale, développez la discipline et gérez la pression comme un champion.',
      features: [
        'Préparation mentale avancée pour compétitions',
        'Gestion du stress et de la pression compétitive',
        'Focus et concentration absolue',
        'Visualisation de la réussite et techniques de performance'
      ],
      color: COLORS.primary,
      gradient: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.primary}05)`,
      duration: 'Programmes sur mesure selon les saisons sportives',
      image: 'src/images/coaching/sport.jpg',
      imageAlt: 'Coaching Sportif et Athlètes'
    },
    {
      id: 'specialized-business',
      title: 'Coaching Business',
      description: 'Développez un leadership efficace pour chefs d\'équipes, cadres et managers. Optimisez la performance collective.',
      features: [
        'Leadership stratégique et gestion d\'équipe',
        'Communication managériale neuroscientifique',
        'Résolution de problèmes complexes',
        'Développement du leadership situationnel'
      ],
      color: COLORS.secondary,
      gradient: `linear-gradient(135deg, ${COLORS.secondary}15, ${COLORS.secondary}05)`,
      duration: 'Programmes de 3 à 12 mois selon les besoins',
      image: 'src/images/coaching/business.jpg',
      imageAlt: 'Coaching Business'
    },
    {
      id: 'specialized-parental',
      title: 'Coaching Parental',
      description: 'Accompagnement pour développer des relations familiales harmonieuses et une éducation consciente.',
      features: [
        'Communication positive parents-enfants',
        'Gestion des émotions familiales',
        'Éducation basée sur les neurosciences',
        'Équilibre vie familiale et professionnelle'
      ],
      color: COLORS.accent,
      gradient: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.accent}05)`,
      duration: 'Sessions individuelles ou familiales',
      image: 'src/images/coaching/parental.jpg',
      imageAlt: 'Coaching Parental'
    },
    {
      id: 'specialized-individuel',
      title: 'Coaching Individuel',
      description: 'Un accompagnement personnalisé pour votre développement personnel et professionnel unique.',
      features: [
        'Plan de développement personnel sur mesure',
        'Identification et dépassement des blocages',
        'Stratégies d\'épanouissement personnel',
        'Accompagnement vers l\'autonomie et la confiance'
      ],
      color: COLORS.primaryDark,
      gradient: `linear-gradient(135deg, ${COLORS.primaryDark}15, ${COLORS.primaryDark}05)`,
      duration: 'Accompagnement flexible selon vos objectifs',
      image: 'src/images/coaching/individual.jpg',
      imageAlt: 'Coaching Individuel'
    }
  ]

  const BENEFITS = [
    {
      title: 'Approche Neurosciences',
      description: 'Méthodes basées sur les dernières recherches en neurosciences cognitives pour des résultats prouvés',
      icon: <BrainIcon size={28} />,
      gradient: COLORS.gradientMain
    },
    {
      title: 'Personnalisation Totale',
      description: 'Programmes entièrement adaptés à votre profil unique, vos besoins spécifiques et vos objectifs',
      icon: <UserPlus size={28} />,
      gradient: COLORS.gradientAccent
    },
    {
      title: 'Résultats Durables',
      description: 'Transformations profondes qui s\'inscrivent dans la durée grâce à un ancrage progressif',
      icon: <Shield size={28} />,
      gradient: COLORS.gradientDark
    },
    {
      title: 'Suivi & Support Continu',
      description: 'Accompagnement régulier, ajustements en temps réel et support entre les séances',
      icon: <Calendar size={28} />,
      gradient: COLORS.gradientMain
    }
  ]

  const PROCESS_STEPS = [
    {
      step: '01',
      title: 'Diagnostic Initial',
      description: 'Analyse approfondie de vos besoins, objectifs et potentiel',
      icon: <Eye size={24} />
    },
    {
      step: '02',
      title: 'Programme Sur Mesure',
      description: 'Création d\'un plan d\'action personnalisé adapté à votre profil',
      icon: <TargetIcon size={24} />
    },
    {
      step: '03',
      title: 'Accompagnement',
      description: 'Séances régulières avec ajustements en fonction de votre évolution',
      icon: <BookOpen size={24} />
    },
    {
      step: '04',
      title: 'Ancrage & Suivi',
      description: 'Intégration des changements et suivi à long terme des résultats',
      icon: <TrendingUpIcon size={24} />
    }
  ]

  const addRef = (element, index) => {
    sectionRefs.current[index] = element
  }

  const getAnimationStyle = (id, delay = 0) => {
    const isAnimated = animatedElements[id] || isMobile
    return {
      ...(isAnimated ? animations.fadeInUp : {}),
      animationDelay: `${delay}s`
    }
  }

  // Composant Image avec fallback
  const CoachingImage = ({ src, alt, style, fallbackColor = COLORS.lightGray }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoad = () => {
      setIsLoading(false);
    };

    if (hasError) {
      return (
        <div style={{
          ...style,
          background: fallbackColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.textGray,
          fontSize: '0.9rem',
          borderRadius: style.borderRadius || '0px'
        }}>
          {alt}
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', ...style }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: fallbackColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: style.borderRadius || '0px'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: `3px solid ${COLORS.primary}30`,
              borderTopColor: COLORS.primary,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          style={{
            ...style,
            display: isLoading ? 'none' : 'block',
            objectFit: 'cover'
          }}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    );
  };

  return (
    <div style={{
      background: COLORS.white,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      width: '100%',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15) !important;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradientShift 3s ease infinite;
          }
          
          .card-hover-effect {
            position: relative;
            overflow: hidden;
          }
          
          .card-hover-effect::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          
          .card-hover-effect:hover::before {
            left: 100%;
          }
          
          .pulse-dot {
            animation: pulse 2s infinite;
          }
          
          .stat-card {
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-5px) scale(1.02);
          }
          
          .glow-effect {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.1);
          }
          
          .border-glow {
            position: relative;
          }
          
          .border-glow::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #8B5CF6, #EC4899, #F97316, #8B5CF6);
            border-radius: inherit;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .border-glow:hover::after {
            opacity: 1;
          }
          
          .tab-glow {
            position: relative;
            overflow: hidden;
          }
          
          .tab-glow::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s;
          }
          
          .tab-glow:hover::before {
            transform: translateX(100%);
          }
        `}
      </style>
      
      {/* Logo Header avec effet de flottement */}
      <div style={{
        background: COLORS.white,
        padding: 'clamp(40px, 6vw, 60px) 0 clamp(20px, 4vw, 30px)',
        textAlign: 'center',
      }} ref={(el) => addRef(el, 0)}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 40px)',
          ...getAnimationStyle(0)
        }}>
          <img 
            src="src/images/1.png" 
            style={{
              height: 'clamp(50px, 8vw, 70px)',
              margin: '0 auto',
              display: 'block',
              animation: 'float 3s ease-in-out infinite',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          />
        </div>
      </div>

      {/* Hero Section améliorée */}
      <section style={{
        padding: 'clamp(40px, 6vw, 80px) 0',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }} ref={(el) => addRef(el, 1)}>
        {/* Background elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${COLORS.primary}10 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
          animationDelay: '0s'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${COLORS.secondary}10 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '1s'
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 40px)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: `${COLORS.primary}10`,
              padding: '12px 24px',
              borderRadius: '50px',
              marginBottom: '30px',
              ...animations.fadeInUp,
              animationDelay: '0.2s'
            }}>
              <Sparkle size={20} color={COLORS.primary} />
              <span style={{
                color: COLORS.primary,
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '0.5px'
              }}>
                Transformez votre vie avec les neurosciences
              </span>
            </div>
            
            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 800,
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
              ...animations.fadeInUp,
              animationDelay: '0.4s'
            }}>
              <span className="gradient-text">Coaching Neurosciences</span>
              <br />
              <span style={{ color: COLORS.dark }}>Appliquées</span>
            </h1>
            
            <p style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
              color: COLORS.darkGray,
              marginBottom: '2.5rem',
              lineHeight: 1.6,
              ...animations.fadeInUp,
              animationDelay: '0.6s'
            }}>
              Accompagnement personnalisé basé sur les neurosciences pour une{' '}
              <span style={{ 
                color: COLORS.primary, 
                fontWeight: 600,
                position: 'relative',
                display: 'inline-block'
              }}>
                transformation durable
                <span style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  borderRadius: '2px'
                }} />
              </span>
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '20px',
              justifyContent: 'center',
              alignItems: 'center',
              ...animations.fadeInUp,
              animationDelay: '0.8s'
            }}>
              <button
                onClick={handleContact}
                style={{
                  padding: 'clamp(16px, 3vw, 20px) clamp(32px, 5vw, 48px)',
                  background: COLORS.gradientMain,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: isMobile ? '100%' : 'auto'
                }}
                className="hover-lift border-glow"
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = COLORS.gradientDark;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = COLORS.gradientMain;
                  }
                }}
              >
                <MessageCircle size={22} />
                <span>Demander un rendez-vous gratuit</span>
                <ArrowUpRight size={18} style={{ marginLeft: '5px' }} />
              </button>
              
              <button
                onClick={() => {
                  const element = document.getElementById('programs-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  padding: 'clamp(16px, 3vw, 20px) clamp(32px, 5vw, 48px)',
                  background: 'transparent',
                  color: COLORS.primary,
                  border: `2px solid ${COLORS.primary}30`,
                  borderRadius: '12px',
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: isMobile ? '100%' : 'auto'
                }}
                className="hover-lift"
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = `${COLORS.primary}10`;
                    e.currentTarget.style.borderColor = COLORS.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = `${COLORS.primary}30`;
                  }
                }}
              >
                <BookOpen size={22} />
                Découvrir les programmes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section style={{
        padding: 'clamp(60px, 8vw, 80px) 0',
        background: COLORS.lightGray,
        width: '100%'
      }} ref={(el) => addRef(el, 3)}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 40px)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px',
            ...getAnimationStyle('process-title', 0)
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              color: COLORS.dark,
              lineHeight: 1.2
            }}>
              Notre{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Méthode
              </span>{' '}
              en 4 Étapes
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: COLORS.textGray,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Un accompagnement structuré pour garantir votre réussite
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '30px',
            position: 'relative'
          }}>
            {/* Connecting line for desktop */}
            {!isMobile && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '2px',
                background: `linear-gradient(90deg, ${COLORS.primary}30, ${COLORS.secondary}30)`,
                transform: 'translateY(-50%)',
                zIndex: 1
              }} />
            )}
            
            {PROCESS_STEPS.map((step, index) => (
              <div 
                key={index}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  ...getAnimationStyle(`process-${index}`, index * 0.2)
                }}
              >
                <div 
                  className="hover-lift"
                  style={{
                    background: COLORS.white,
                    borderRadius: '20px',
                    padding: '40px 25px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    border: `1px solid ${COLORS.primary}20`,
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '70px',
                    height: '70px',
                    background: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.secondary}15)`,
                    borderRadius: '20px',
                    marginBottom: '25px',
                    color: COLORS.primary,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>
                    {step.step}
                  </div>
                  
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: `${COLORS.primary}10`,
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: COLORS.primary
                  }}>
                    {step.icon}
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '15px',
                    color: COLORS.dark
                  }}>
                    {step.title}
                  </h3>
                  
                  <p style={{
                    color: COLORS.textGray,
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section 
        id="programs-section"
        style={{
          padding: 'clamp(60px, 8vw, 80px) 0',
          background: COLORS.white,
          width: '100%'
        }} 
        ref={(el) => addRef(el, 4)}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 40px)'
        }}>
          {/* Tab Navigation améliorée */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '60px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveTab('personal')}
              className="tab-glow"
              style={{
                padding: '20px 40px',
                background: activeTab === 'personal' ? COLORS.gradientMain : 'transparent',
                color: activeTab === 'personal' ? COLORS.white : COLORS.dark,
                border: activeTab === 'personal' ? 'none' : `2px solid ${COLORS.lightViolet}`,
                borderRadius: '15px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                position: 'relative',
                overflow: 'hidden',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (!isMobile && activeTab !== 'personal') {
                  e.currentTarget.style.borderColor = COLORS.primary;
                  e.currentTarget.style.color = COLORS.primary;
                  e.currentTarget.style.background = `${COLORS.primary}10`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile && activeTab !== 'personal') {
                  e.currentTarget.style.borderColor = COLORS.lightViolet;
                  e.currentTarget.style.color = COLORS.dark;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <UserCheck size={22} />
                Coaching Personnel
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('professional')}
              className="tab-glow"
              style={{
                padding: '20px 40px',
                background: activeTab === 'professional' ? COLORS.gradientAccent : 'transparent',
                color: activeTab === 'professional' ? COLORS.white : COLORS.dark,
                border: activeTab === 'professional' ? 'none' : `2px solid ${COLORS.lightViolet}`,
                borderRadius: '15px',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                position: 'relative',
                overflow: 'hidden',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (!isMobile && activeTab !== 'professional') {
                  e.currentTarget.style.borderColor = COLORS.accent;
                  e.currentTarget.style.color = COLORS.accent;
                  e.currentTarget.style.background = `${COLORS.accent}10`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile && activeTab !== 'professional') {
                  e.currentTarget.style.borderColor = COLORS.lightViolet;
                  e.currentTarget.style.color = COLORS.dark;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Briefcase size={22} />
                Coaching Professionnel
              </div>
            </button>
          </div>

          {/* Section Title */}
          <div style={{
            textAlign: 'center',
            marginBottom: '60px',
            ...getAnimationStyle('programs-title', 0)
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.1,
              letterSpacing: '-0.5px'
            }}>
              {activeTab === 'personal' ? 'Coaching Personnel' : 'Coaching Professionnel'}
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.375rem)',
              color: COLORS.textGray,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              {activeTab === 'personal' 
                ? 'Développez votre potentiel intérieur grâce aux neurosciences appliquées' 
                : 'Performance, posture professionnelle et efficacité durable basées sur les neurosciences'}
            </p>
          </div>

          {/* Coaching Cards avec images */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '40px'
          }}>
            {COACHING_DATA[activeTab].map((coaching, index) => (
              <div
                key={index}
                className="hover-lift card-hover-effect"
                style={{
                  background: COLORS.white,
                  borderRadius: '25px',
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(139, 92, 246, 0.08)',
                  border: `1px solid ${coaching.color}20`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  ...getAnimationStyle(`coaching-${index}`, index * 0.2)
                }}
                onMouseEnter={() => !isMobile && setHoveredCard(index)}
                onMouseLeave={() => !isMobile && setHoveredCard(null)}
              >
                {/* Image Section */}
                <div style={{
                  height: '200px',
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CoachingImage
                    src={coaching.image}
                    alt={coaching.imageAlt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    fallbackColor={`${coaching.color}20`}
                  />
                  {/* Overlay avec titre sur l'image */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: `linear-gradient(to top, ${coaching.color}DD, transparent)`,
                    padding: '20px',
                    paddingTop: '40px'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: COLORS.white,
                      margin: 0,
                      lineHeight: 1.2,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {coaching.title}
                    </h3>
                  </div>
                </div>
                
                {/* Content Section */}
                <div style={{
                  padding: '30px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Durée et séances */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      color: coaching.color,
                      fontWeight: 600,
                      background: `${coaching.color}10`,
                      padding: '6px 12px',
                      borderRadius: '8px'
                    }}>
                      <Clock size={14} />
                      <span>{coaching.sessions}</span>
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: coaching.color,
                      opacity: 0.8,
                      background: `${coaching.color}08`,
                      padding: '6px 12px',
                      borderRadius: '8px'
                    }}>
                      {coaching.duration}
                    </div>
                  </div>
                  
                  <p style={{
                    color: COLORS.textGray,
                    lineHeight: 1.6,
                    marginBottom: '25px',
                    flex: 1,
                    fontSize: '0.95rem'
                  }}>
                    {coaching.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    marginBottom: '30px'
                  }}>
                    {coaching.features.map((feature, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          background: `${coaching.color}15`,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: coaching.color
                        }}>
                          <CheckCircle size={14} />
                        </div>
                        <span style={{
                          fontSize: '0.95rem',
                          color: COLORS.textGray,
                          lineHeight: 1.4
                        }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Best for */}
                  <div style={{
                    background: `${coaching.color}08`,
                    padding: '15px',
                    borderRadius: '12px',
                    marginBottom: '25px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '5px'
                    }}>
                      <TargetIcon size={16} color={coaching.color} />
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: coaching.color
                      }}>
                        Idéal pour
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: COLORS.textGray,
                      lineHeight: 1.4
                    }}>
                      {coaching.bestFor}
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemandeDevis(coaching);
                    }}
                    style={{
                      padding: '16px',
                      background: `${coaching.color}15`,
                      color: coaching.color,
                      border: `2px solid ${coaching.color}30`,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      width: '100%',
                      marginTop: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.background = coaching.color;
                        e.currentTarget.style.color = COLORS.white;
                        e.currentTarget.style.borderColor = coaching.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.background = `${coaching.color}15`;
                        e.currentTarget.style.color = coaching.color;
                        e.currentTarget.style.borderColor = `${coaching.color}30`;
                      }
                    }}
                  >
                    <span>Demander un devis</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Coaching Section avec images */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) 0',
        background: `linear-gradient(135deg, ${COLORS.lightGray} 0%, ${COLORS.white} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }} ref={(el) => addRef(el, 5)}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${COLORS.primary}05 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 40px)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px',
            ...getAnimationStyle('specialized-title', 0)
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: `${COLORS.primary}10`,
              padding: '12px 24px',
              borderRadius: '50px',
              marginBottom: '20px'
            }}>
              <Star size={20} color={COLORS.primary} />
              <span style={{
                color: COLORS.primary,
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '0.5px'
              }}>
                Coachings Spécialisés
              </span>
            </div>
            
            <h2 style={{
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              color: COLORS.dark,
              lineHeight: 1.1,
              letterSpacing: '-0.5px'
            }}>
              Solutions{' '}
              <span style={{
                background: 'linear-gradient(135deg, #EC4899 0%, #F97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Sur Mesure
              </span>
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.375rem)',
              color: COLORS.textGray,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Programmes adaptés aux besoins spécifiques de chaque individu ou équipe
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '40px'
          }}>
            {SPECIALIZED_COACHING.map((coaching, index) => (
              <div
                key={index}
                className="hover-lift card-hover-effect"
                style={{
                  background: COLORS.white,
                  borderRadius: '25px',
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)',
                  border: `1px solid ${coaching.color}20`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  ...getAnimationStyle(`specialized-${index}`, index * 0.2)
                }}
                onMouseEnter={() => !isMobile && setHoveredCard(index + 3)}
                onMouseLeave={() => !isMobile && setHoveredCard(null)}
              >
                {/* Image Section */}
                <div style={{
                  height: '200px',
                  width: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <CoachingImage
                    src={coaching.image}
                    alt={coaching.imageAlt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    fallbackColor={`${coaching.color}20`}
                  />
                  {/* Overlay avec titre sur l'image */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: `linear-gradient(to top, ${coaching.color}DD, transparent)`,
                    padding: '20px',
                    paddingTop: '40px'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: COLORS.white,
                      margin: 0,
                      lineHeight: 1.2,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {coaching.title}
                    </h3>
                  </div>
                </div>
                
                {/* Content */}
                <div style={{
                  padding: '30px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Durée */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    color: coaching.color,
                    fontWeight: 600,
                    background: `${coaching.color}10`,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    marginBottom: '20px',
                    alignSelf: 'flex-start'
                  }}>
                    <Clock3 size={14} />
                    <span>{coaching.duration}</span>
                  </div>
                  
                  <p style={{
                    color: COLORS.textGray,
                    lineHeight: 1.6,
                    marginBottom: '30px',
                    flex: 1,
                    fontSize: '0.95rem'
                  }}>
                    {coaching.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '30px'
                  }}>
                    {coaching.features.map((feature, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          background: `${coaching.color}15`,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: coaching.color
                        }}>
                          <CheckCircle size={14} />
                        </div>
                        <span style={{
                          fontSize: '0.95rem',
                          color: COLORS.textGray
                        }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDemandeDevis(coaching);
                    }}
                    style={{
                      padding: '16px',
                      background: `${coaching.color}15`,
                      color: coaching.color,
                      border: `2px solid ${coaching.color}30`,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      width: '100%',
                      marginTop: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.background = coaching.color;
                        e.currentTarget.style.color = COLORS.white;
                        e.currentTarget.style.borderColor = coaching.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.background = `${coaching.color}15`;
                        e.currentTarget.style.color = coaching.color;
                        e.currentTarget.style.borderColor = `${coaching.color}30`;
                      }
                    }}
                  >
                    <span>Obtenir un devis personnalisé</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section améliorée */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) 0',
        background: COLORS.white,
        width: '100%'
      }} ref={(el) => addRef(el, 6)}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 40px)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '60px',
            ...getAnimationStyle('benefits-title', 0)
          }}>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              fontWeight: 800,
              marginBottom: '1rem',
              color: COLORS.dark,
              lineHeight: 1.1,
              letterSpacing: '-0.5px'
            }}>
              Pourquoi Choisir{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Octogo
              </span>
              ?
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.375rem)',
              color: COLORS.textGray,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Notre différence : une approche unique basée sur la science et l'humain
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '40px'
          }}>
            {BENEFITS.map((benefit, index) => (
              <div 
                key={index}
                className="hover-lift"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '25px',
                  padding: '40px 35px',
                  background: COLORS.white,
                  borderRadius: '25px',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  transition: 'all 0.3s ease',
                  ...getAnimationStyle(`benefit-${index}`, index * 0.1)
                }}
                onMouseEnter={(e) => !isMobile && (e.currentTarget.style.transform = 'translateY(-5px)')}
                onMouseLeave={(e) => !isMobile && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: benefit.gradient,
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.white,
                  flexShrink: 0,
                  animation: 'pulse 2s infinite',
                  animationDelay: `${index * 0.5}s`
                }}>
                  {benefit.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.375rem',
                    fontWeight: 700,
                    marginBottom: '15px',
                    color: COLORS.dark
                  }}>
                    {benefit.title}
                  </h3>
                  <p style={{
                    color: COLORS.textGray,
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}>
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section finale */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) 0',
        background: COLORS.white,
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }} ref={(el) => addRef(el, 7)}>
        {/* Background elements - simplifiés pour fond blanc */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: `radial-gradient(circle at 30% 50%, ${COLORS.primary}05 0%, transparent 50%)`,
          opacity: 0.3
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(20px, 4vw, 40px)',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center'
        }}>
          <div style={{
            background: COLORS.white,
            borderRadius: '30px',
            padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 60px)',
            border: `1px solid ${COLORS.primary}20`,
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.1)',
            ...animations.scaleIn,
            animationDelay: '0.2s'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: `${COLORS.primary}10`,
              padding: '12px 24px',
              borderRadius: '50px',
              marginBottom: '30px'
            }}>
              <Rocket size={22} color={COLORS.primary} />
              <span style={{
                color: COLORS.primary,
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '0.5px'
              }}>
                Commencez votre transformation dès aujourd'hui
              </span>
            </div>
            
            <h2 style={{
              fontSize: 'clamp(2rem, 6vw, 3.5rem)',
              fontWeight: 800,
              marginBottom: '1.5rem',
              color: COLORS.dark,
              lineHeight: 1.1,
              letterSpacing: '-0.5px'
            }}>
              Prêt à libérer votre{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block'
              }}>
                plein potentiel
              </span>
              ?
            </h2>
            
            <p style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
              color: COLORS.darkGray,
              marginBottom: '50px',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6
            }}>
              Contactez-nous pour un diagnostic gratuit et découvrez le programme adapté à vos objectifs
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '20px',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button
                onClick={handleContact}
                style={{
                  padding: '20px 48px',
                  background: COLORS.gradientMain,
                  color: COLORS.white,
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: isMobile ? '100%' : 'auto'
                }}
                className="hover-lift"
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <MessageCircle size={24} />
                Prendre rendez-vous gratuit
                <ArrowUpRight size={20} />
              </button>
              
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  padding: '20px 40px',
                  background: 'transparent',
                  color: COLORS.primary,
                  border: `2px solid ${COLORS.primary}30`,
                  borderRadius: '15px',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: isMobile ? '100%' : 'auto'
                }}
                className="hover-lift"
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = `${COLORS.primary}10`;
                    e.currentTarget.style.borderColor = COLORS.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = `${COLORS.primary}30`;
                  }
                }}
              >
                <BookOpen size={24} />
                Revoir les programmes
              </button>
            </div>
            
            <div style={{
              marginTop: '40px',
              paddingTop: '30px',
              borderTop: `1px solid ${COLORS.primary}20`
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '30px',
                color: COLORS.darkGray,
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={COLORS.primary} />
                  <span>Rendez-vous sous 48h</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={COLORS.primary} />
                  <span>Garantie satisfait ou remboursé</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color={COLORS.primary} />
                  <span>Accompagnement personnalisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Coaching