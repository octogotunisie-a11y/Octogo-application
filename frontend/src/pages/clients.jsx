import React, { useState, useEffect } from 'react'

const Clients = () => {
  const [hoveredLogo, setHoveredLogo] = useState(null)
  const [activeLogo, setActiveLogo] = useState(null)
  const [counters, setCounters] = useState({
    entreprises: 0,
    professionnels: 0,
    satisfaction: 0,
    secteurs: 0
  })
  const [targetCounters, setTargetCounters] = useState({
    entreprises: 20,
    professionnels: 500,
    satisfaction: 98,
    secteurs: 15
  })
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Animation des compteurs
    const animateCounters = () => {
      const interval = setInterval(() => {
        setCounters(prev => ({
          entreprises: Math.min(prev.entreprises + 1, targetCounters.entreprises),
          professionnels: Math.min(prev.professionnels + 25, targetCounters.professionnels),
          satisfaction: Math.min(prev.satisfaction + 2, targetCounters.satisfaction),
          secteurs: Math.min(prev.secteurs + 1, targetCounters.secteurs)
        }))
      }, 50)
      
      setTimeout(() => clearInterval(interval), 2000)
    }
    
    // Démarrer l'animation après 500ms
    const timer = setTimeout(animateCounters, 500)
    return () => clearTimeout(timer)
  }, [])

  const clientsData = [
    { id: 1, name: "Orange Tunisie", logo: "src/images/clients/client1.png" },
    { id: 2, name: "Amen Bank", logo: "src/images/clients/client2.png" },
    { id: 3, name: "Tunisie Telecom", logo: "/src/images/clients/client3.png" },
    { id: 4, name: "BIAT", logo: "src/images/clients/client4.png" },
    { id: 5, name: "Sanofi", logo: "src/images/clients/client5.png" },
    { id: 6, name: "Sagemcom", logo: "src/images/clients/client6.png" },
    { id: 7, name: "Groupe Chimique", logo: "src/images/clients/client7.png" },
    { id: 8, name: "Magasin Général", logo: "src/images/clients/client8.png" },
    { id: 9, name: "Banque de Tunisie", logo: "src/images/clients/client9.png" },
    { id: 10, name: "Ooredoo", logo: "src/images/clients/client10.png" },
    { id: 11, name: "Elite", logo: "src/images/clients/client11.png" },
    { id: 12, name: "Carthage Cement", logo: "src/images/clients/client12.png" },
    { id: 13, name: "Carthage Cement", logo: "src/images/clients/client13.png" },
    { id: 14, name: "Carthage Cement", logo: "src/images/clients/client14.png" },
    { id: 15, name: "Carthage Cement", logo: "src/images/clients/client15.png" },
    { id: 16, name: "Carthage Cement", logo: "src/images/clients/client16.png" },
    { id: 17, name: "Carthage Cement", logo: "src/images/clients/client17.png" },
    { id: 18, name: "Carthage Cement", logo: "src/images/clients/client18.png" },
    { id: 19, name: "Carthage Cement", logo: "src/images/clients/client19.png" },
    { id: 20, name: "Carthage Cement", logo: "src/images/clients/client20.png" },
  ]

  // Prendre 10 clients pour le haut et 10 différents pour le bas
  const topClients = clientsData.slice(0, 10)
  const bottomClients = clientsData.slice(10, 20)

  // SVG de cerveau avec seulement stroke dégradé
  const BrainSVG = ({ size = 100, opacity = 0.05, className = '', style = {}, animated = false }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      style={style}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="brainStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#EC4899" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="lightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
          <stop offset="70%" stopColor="#EC4899" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <circle cx="50" cy="50" r="45" fill="url(#lightGlow)" opacity={opacity * 2} />
      
      <path 
        d="M35,35 Q25,50 35,65 Q45,70 50,70 Q55,70 65,65 Q75,50 65,35 Q55,30 50,30 Q45,30 35,35" 
        fill="none" 
        stroke="url(#brainStrokeGradient)" 
        strokeWidth="0.8" 
        strokeOpacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      <path 
        d="M35,35 Q30,45 32,55 Q35,60 40,60 Q45,65 50,65 Q55,65 60,60 Q65,60 68,55 Q70,45 65,35" 
        fill="none" 
        stroke="url(#brainStrokeGradient)" 
        strokeWidth="0.6" 
        strokeOpacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      <path 
        d="M50,30 L50,70" 
        fill="none" 
        stroke="url(#brainStrokeGradient)" 
        strokeWidth="0.3" 
        strokeOpacity={opacity}
        strokeLinecap="round"
      />
      
      <path 
        d="M25,40 Q20,50 25,60" 
        fill="none" 
        stroke="url(#brainStrokeGradient)" 
        strokeWidth="0.4" 
        strokeOpacity={opacity}
        strokeLinecap="round"
      >
        {animated && <animate attributeName="d" values="M25,40 Q20,50 25,60;M25,38 Q20,52 25,62;M25,40 Q20,50 25,60" dur="3s" repeatCount="indefinite" />}
      </path>
      <path 
        d="M75,40 Q80,50 75,60" 
        fill="none" 
        stroke="url(#brainStrokeGradient)" 
        strokeWidth="0.4" 
        strokeOpacity={opacity}
        strokeLinecap="round"
      >
        {animated && <animate attributeName="d" values="M75,40 Q80,50 75,60;M75,38 Q80,52 75,62;M75,40 Q80,50 75,60" dur="3s" repeatCount="indefinite" />}
      </path>
    </svg>
  )

  // SVG d'onde cérébrale avec seulement stroke
  const BrainWaveSVG = ({ size = 120, opacity = 0.03, className = '', style = {} }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="waveStrokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#EC4899" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="waveLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Effet de lumière dégradé */}
      <circle cx="50" cy="50" r="45" fill="url(#waveLight)" opacity={opacity * 3} />
      
      <path 
        d="M10,50 Q20,30 30,50 Q40,70 50,50 Q60,30 70,50 Q80,70 90,50" 
        fill="none" 
        stroke="url(#waveStrokeGradient)" 
        strokeWidth="0.5" 
        strokeOpacity={opacity}
        strokeLinecap="round"
      >
        <animate 
          attributeName="d"
          values="M10,50 Q20,30 30,50 Q40,70 50,50 Q60,30 70,50 Q80,70 90,50;
                  M10,50 Q20,35 30,50 Q40,65 50,50 Q60,35 70,50 Q80,65 90,50;
                  M10,50 Q20,30 30,50 Q40,70 50,50 Q60,30 70,50 Q80,70 90,50"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )

  // SVG icône réseau d'excellence avec stroke seulement
  const ExcellenceIcon = ({ size = 60 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="starStrokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <radialGradient id="starLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Effet de lumière dégradé derrière */}
      <circle cx="12" cy="12" r="10" fill="url(#starLight)" />
      
      {/* Étoile avec stroke dégradé */}
      <path 
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
        fill="none"
        stroke="url(#starStrokeGradient)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  )

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translate(0px, 0px) rotate(0deg);
            }
            33% {
              transform: translate(30px, -20px) rotate(5deg);
            }
            66% {
              transform: translate(-20px, 15px) rotate(-5deg);
            }
          }
          
          @keyframes floatReverse {
            0%, 100% {
              transform: translate(0px, 0px) rotate(0deg);
            }
            33% {
              transform: translate(-30px, 20px) rotate(-5deg);
            }
            66% {
              transform: translate(20px, -15px) rotate(5deg);
            }
          }
          
          @keyframes lightPulse {
            0%, 100% {
              opacity: 0.05;
              transform: scale(1);
            }
            50% {
              opacity: 0.15;
              transform: scale(1.1);
            }
          }
          
          @keyframes gentleGlow {
            0%, 100% {
              opacity: 0.1;
            }
            50% {
              opacity: 0.3;
            }
          }
          
          @keyframes gradientPulse {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          @keyframes scrollLeft {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          @keyframes scrollRight {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }
          
          @keyframes logoGlow {
            0%, 100% {
              box-shadow: 
                0 0 15px rgba(139, 92, 246, 0.15),
                inset 0 0 15px rgba(139, 92, 246, 0.05);
            }
            50% {
              box-shadow: 
                0 0 30px rgba(139, 92, 246, 0.25),
                inset 0 0 25px rgba(139, 92, 246, 0.1),
                0 0 45px rgba(236, 72, 153, 0.15);
            }
          }
          
          @keyframes borderFlow {
            0% {
              border-color: rgba(139, 92, 246, 0.2);
            }
            33% {
              border-color: rgba(236, 72, 153, 0.3);
            }
            66% {
              border-color: rgba(249, 115, 22, 0.2);
            }
            100% {
              border-color: rgba(139, 92, 246, 0.2);
            }
          }
          
          .scroll-container {
            width: 100%;
            overflow: hidden;
            position: relative;
            mask-image: linear-gradient(
              to right,
              transparent,
              black 10%,
              black 90%,
              transparent
            );
            -webkit-mask-image: linear-gradient(
              to right,
              transparent,
              black 10%,
              black 90%,
              transparent
            );
          }
          
          .scroll-content {
            display: flex;
            width: fit-content;
          }
          
          .logo-item {
            flex-shrink: 0;
            padding: 0 2rem;
          }
          
          .logo-wrapper {
            position: relative;
            cursor: pointer;
            width: 300px;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .logo-frame {
            position: relative;
            width: 100%;
            height: 100%;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            box-shadow: 
              0 10px 30px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(139, 92, 246, 0.1);
            overflow: hidden;
          }
          
          /* Effet de lumière dégradé derrière le logo */
          .logo-frame::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(
              circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
              rgba(139, 92, 246, 0.1) 0%,
              rgba(236, 72, 153, 0.07) 30%,
              rgba(249, 115, 22, 0.03) 50%,
              transparent 70%
            );
            opacity: 0;
            transition: opacity 0.5s ease;
            pointer-events: none;
          }
          
          .logo-wrapper:hover .logo-frame::before {
            opacity: 1;
          }
          
          .logo-wrapper:hover .logo-frame {
            transform: translateY(-8px) scale(1.05);
            animation: borderFlow 3s infinite;
          }
          
          .logo-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: grayscale(100%) brightness(1.1) contrast(0.9);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            z-index: 2;
          }
          
          .logo-wrapper:hover .logo-img {
            filter: grayscale(0%) brightness(1.15) contrast(1.05);
          }
          
          /* Effet de lumière active (clic) */
          .logo-active .logo-frame {
            animation: logoGlow 2s infinite, borderFlow 3s infinite;
            border: 2px solid;
            border-image: linear-gradient(135deg, #8B5CF6, #EC4899, #F97316) 1;
            border-image-slice: 1;
          }
          
          .logo-active .logo-frame::before {
            opacity: 0.3;
            background: radial-gradient(
              circle at center,
              rgba(139, 92, 246, 0.25) 0%,
              rgba(236, 72, 153, 0.2) 30%,
              rgba(249, 115, 22, 0.15) 50%,
              transparent 70%
            );
          }
          
          .logo-active .logo-img {
            filter: grayscale(0%) brightness(1.2) contrast(1.1);
          }
          
          /* Effets de particules de lumière dégradé */
          .light-particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            animation: lightPulse 3s infinite;
            z-index: 1;
          }
          
          .logo-active .light-particle {
            opacity: 0.6;
          }
          
          .counter-number {
            font-variant-numeric: tabular-nums;
          }
          
          .gradient-stroke {
            background: linear-gradient(135deg, #8B5CF6, #EC4899, #F97316);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% auto;
            animation: gradientPulse 3s infinite;
          }
          
          .gradient-light {
            background: linear-gradient(135deg, 
              rgba(139, 92, 246, 0.1) 0%,
              rgba(236, 72, 153, 0.07) 50%,
              rgba(249, 115, 22, 0.05) 100%
            );
          }
        `}
      </style>

      

      {/* Fond avec cerveaux SVG et effets de lumière dégradés */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)'
      }}>
        {/* Légère superposition de lumière dégradée */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.04) 0%, transparent 40%)',
          opacity: 0.4,
          animation: 'gentleGlow 8s ease-in-out infinite'
        }} />
        
        {/* Cerveau 1 - Animated */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          animation: 'float 25s infinite ease-in-out',
          opacity: 0.04
        }}>
          <BrainSVG size={180} opacity={0.04} animated={true} />
        </div>
        
        {/* Cerveau 2 - Reverse animation */}
        <div style={{
          position: 'absolute',
          top: '70%',
          left: '85%',
          animation: 'floatReverse 30s infinite ease-in-out',
          animationDelay: '5s',
          opacity: 0.03
        }}>
          <BrainSVG size={220} opacity={0.03} animated={true} />
        </div>
        
        {/* Cerveau 3 - Wave */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '80%',
          animation: 'float 35s infinite ease-in-out',
          animationDelay: '10s',
          opacity: 0.025
        }}>
          <BrainWaveSVG size={150} opacity={0.025} />
        </div>
        
        {/* Cerveau 4 - Animated */}
        <div style={{
          position: 'absolute',
          top: '80%',
          left: '10%',
          animation: 'floatReverse 40s infinite ease-in-out',
          animationDelay: '15s',
          opacity: 0.02
        }}>
          <BrainSVG size={250} opacity={0.02} animated={true} />
        </div>
        
        {/* Particules de lumière flottantes dégradées */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="light-particle" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            background: `radial-gradient(circle, 
              rgba(139, 92, 246, ${0.3 + Math.random() * 0.2}) 0%, 
              rgba(236, 72, 153, ${0.2 + Math.random() * 0.1}) 30%, 
              rgba(249, 115, 22, ${0.1 + Math.random() * 0.1}) 50%, 
              transparent 70%)`,
            width: `${3 + Math.random() * 5}px`,
            height: `${3 + Math.random() * 5}px`
          }} />
        ))}
      </div>

      {/* Contenu principal */}
      <div style={{ position: 'relative', zIndex: 10, background: 'white', minHeight: '100vh' }}>
        
        {/* Hero Section - RÉDUIT avec moins d'espace vide */}
        <div style={{
          padding: '6rem 2rem 3rem', // Réduit de 8rem/4rem à 6rem/3rem
          textAlign: 'center',
          background: 'linear-gradient(180deg, white 0%, rgba(248, 250, 252, 0.8) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Effet de lumière dégradé en haut */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
            opacity: 0.6
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* SUPPRIMÉ: La section "Écosystème de partenaires d'excellence" */}
            
            <h1 style={{ 
              fontSize: '3rem', // Réduit de 3.5rem à 3rem
              fontWeight: 800,
              marginBottom: '1.5rem',
              lineHeight: 1.2,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              Des leaders qui nous{' '}
              <span className="gradient-stroke">
                font confiance
              </span>
            </h1>
            
            <p style={{ 
              fontSize: '1.2rem', // Réduit de 1.25rem à 1.2rem
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: '700px',
              margin: '0 auto 3rem', // Réduit de 4rem à 3rem
              fontWeight: 500
            }}>
              Découvrez les entreprises visionnaires qui ont choisi les neurosciences 
              appliquées pour développer leur potentiel humain et optimiser leurs performances
            </p>
            
            {/* Statistiques animées */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem', // Réduit de 3rem à 2rem
              marginTop: '3rem', // Réduit de 4rem à 3rem
              flexWrap: 'wrap'
            }}>
              {[
                { key: 'entreprises', value: counters.entreprises, label: 'Entreprises partenaires', suffix: '+', color: '#8B5CF6' },
                { key: 'professionnels', value: counters.professionnels, label: 'Professionnels formés', suffix: '+', color: '#EC4899' },
                { key: 'satisfaction', value: counters.satisfaction, label: 'Taux de satisfaction', suffix: '%', color: '#F97316' },
                { key: 'secteurs', value: counters.secteurs, label: "Secteurs d'activité", suffix: '+', color: '#8B5CF6' }
              ].map((stat, index) => (
                <div key={index} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '1.5rem', // Réduit de 2rem à 1.5rem
                    borderRadius: '16px', // Réduit de 20px à 16px
                    textAlign: 'center',
                    minWidth: '200px', // Réduit de 220px à 200px
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Effet de lumière dégradé sur les cartes stats */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: `linear-gradient(135deg, 
                      rgba(139, 92, 246, 0.05) 0%,
                      rgba(236, 72, 153, 0.03) 50%,
                      rgba(249, 115, 22, 0.02) 100%)`,
                    opacity: 0.5
                  }} />
                  
                  <div className="counter-number" style={{
                    fontSize: '2.5rem', // Réduit de 3rem à 2.5rem
                    fontWeight: 800,
                    marginBottom: '0.5rem',
                    color: stat.color,
                    lineHeight: 1,
                    position: 'relative',
                    zIndex: 2
                  }}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div style={{
                    fontSize: '0.95rem', // Réduit de 1rem à 0.95rem
                    color: '#64748b',
                    fontWeight: 500,
                    position: 'relative',
                    zIndex: 2
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section logos - Ligne du haut (défile vers la gauche) */}
        <div style={{ padding: '3rem 0', background: 'white', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#0F172A'
            }}>
              Nos Partenaires Stratégiques
            </h2>
            <p style={{ 
              fontSize: '1.1rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Les leaders de l'industrie qui nous font confiance
            </p>
          </div>
          
          <div className="scroll-container" style={{ marginBottom: '2rem' }}>
            <div className="scroll-content" style={{ animation: 'scrollLeft 40s linear infinite' }}>
              {[...topClients, ...topClients].map((client, index) => (
                <div key={`top-${index}`} className="logo-item">
                  <div 
                    className={`logo-wrapper ${activeLogo === client.id ? 'logo-active' : ''}`}
                    onClick={() => setActiveLogo(activeLogo === client.id ? null : client.id)}
                    onMouseEnter={(e) => {
                      setHoveredLogo(client.id);
                      const frame = e.currentTarget.querySelector('.logo-frame');
                      const rect = frame.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      frame.style.setProperty('--mouse-x', `${x}%`);
                      frame.style.setProperty('--mouse-y', `${y}%`);
                    }}
                    onMouseLeave={() => setHoveredLogo(null)}
                  >
                    {/* Particules de lumière dégradées */}
                    <div className="light-particle" style={{ 
                      top: '20%', 
                      left: '30%',
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.3) 30%, transparent 70%)'
                    }} />
                    <div className="light-particle" style={{ 
                      top: '60%', 
                      left: '70%',
                      background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(249, 115, 22, 0.3) 30%, transparent 70%)'
                    }} />
                    
                    <div className="logo-frame">
                      <img 
                        src={client.logo} 
                        alt={client.name}
                        className="logo-img"
                      />
                    </div>
                    
                    {/* Tooltip au survol - CORRIGÉ ICI */}
                    {hoveredLogo === client.id && activeLogo !== client.id && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(15, 23, 42, 0.95)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                        zIndex: 100
                      }}>
                        {client.name}
                        <div style={{
                          position: 'absolute',
                          top: '-6px',
                          left: '50%',
                          transform: 'translateX(-50%) rotate(45deg)', // CORRIGÉ
                          width: '12px',
                          height: '12px',
                          background: 'rgba(15, 23, 42, 0.95)',
                          borderTop: '1px solid rgba(139, 92, 246, 0.3)',
                          borderLeft: '1px solid rgba(139, 92, 246, 0.3)'
                        }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section logos - Ligne du bas (défile vers la droite) */}
        <div style={{ padding: '1rem 0 4rem', background: 'white', position: 'relative' }}>
          <div className="scroll-container">
            <div className="scroll-content" style={{ animation: 'scrollRight 45s linear infinite' }}>
              {[...bottomClients, ...bottomClients].map((client, index) => (
                <div key={`bottom-${index}`} className="logo-item">
                  <div 
                    className={`logo-wrapper ${activeLogo === client.id ? 'logo-active' : ''}`}
                    onClick={() => setActiveLogo(activeLogo === client.id ? null : client.id)}
                    onMouseEnter={(e) => {
                      setHoveredLogo(client.id + 100);
                      const frame = e.currentTarget.querySelector('.logo-frame');
                      const rect = frame.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      frame.style.setProperty('--mouse-x', `${x}%`);
                      frame.style.setProperty('--mouse-y', `${y}%`);
                    }}
                    onMouseLeave={() => setHoveredLogo(null)}
                  >
                    {/* Particules de lumière dégradées */}
                    <div className="light-particle" style={{ 
                      top: '30%', 
                      left: '40%',
                      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.3) 30%, transparent 70%)'
                    }} />
                    <div className="light-particle" style={{ 
                      top: '70%', 
                      left: '60%',
                      background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(139, 92, 246, 0.3) 30%, transparent 70%)'
                    }} />
                    
                    <div className="logo-frame">
                      <img 
                        src={client.logo} 
                        alt={client.name}
                        className="logo-img"
                      />
                    </div>
                    
                    {/* Tooltip au survol - CORRIGÉ ICI */}
                    {hoveredLogo === client.id + 100 && activeLogo !== client.id && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(15, 23, 42, 0.95)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                        zIndex: 100
                      }}>
                        {client.name}
                        <div style={{
                          position: 'absolute',
                          top: '-6px',
                          left: '50%',
                          transform: 'translateX(-50%) rotate(45deg)', // CORRIGÉ
                          width: '12px',
                          height: '12px',
                          background: 'rgba(15, 23, 42, 0.95)',
                          borderTop: '1px solid rgba(139, 92, 246, 0.3)',
                          borderLeft: '1px solid rgba(139, 92, 246, 0.3)'
                        }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section CTA avec icône */}
        <div style={{
          padding: '6rem 2rem', // Réduit de 8rem à 6rem
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, white 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Effets de lumière dégradés */}
          <div className="gradient-light" style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            opacity: 0.6,
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
            {/* Icône au-dessus du titre */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              <ExcellenceIcon size={80} />
            </div>
            
            <h2 style={{ 
              fontSize: '2.8rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              lineHeight: 1.3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>Rejoignez notre</span>
              <span className="gradient-stroke">
                réseau d'excellence
              </span>
            </h2>
            
            <p style={{ 
              fontSize: '1.3rem',
              color: '#64748b',
              lineHeight: 1.7,
              marginBottom: '3rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Devenez le prochain leader à libérer le potentiel de votre équipe 
              grâce aux neurosciences appliquées et aux méthodologies innovantes
            </p>
            
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.href = '/contact'}
                style={{
                  padding: '1.2rem 3rem',
                  background: 'white',
                  color: '#8B5CF6',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #8B5CF6, #EC4899, #F97316)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(139, 92, 246, 0.15)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(139, 92, 246, 0.25)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #EC4899)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.border = '2px solid transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#8B5CF6';
                  e.currentTarget.style.border = '2px solid transparent';
                  e.currentTarget.style.backgroundImage = 'linear-gradient(white, white), linear-gradient(135deg, #8B5CF6, #EC4899, #F97316)';
                  e.currentTarget.style.backgroundOrigin = 'border-box';
                  e.currentTarget.style.backgroundClip = 'padding-box, border-box';
                }}
              >
                <i className="bi bi-calendar-check"></i>
                Demander un audit gratuit
              </button>
              
              <button
                onClick={() => window.location.href = '/formations'}
                style={{
                  padding: '1.2rem 3rem',
                  background: 'rgba(139, 92, 246, 0.08)',
                  color: '#8B5CF6',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))';
                  e.currentTarget.style.color = '#8B5CF6';
                  e.currentTarget.style.border = '2px solid rgba(139, 92, 246, 0.3)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                  e.currentTarget.style.color = '#8B5CF6';
                  e.currentTarget.style.border = '2px solid rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-graph-up-arrow"></i>
                Découvrir nos solutions
              </button>
            </div>
            
            {/* Témoignage avec effets de lumière dégradés */}
            <div style={{
              marginTop: '4rem', // Réduit de 5rem à 4rem
              padding: '2.5rem', // Réduit de 3rem à 2.5rem
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px', // Réduit de 24px à 20px
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              textAlign: 'left',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
              position: 'relative',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Effet de lumière dégradé en haut du témoignage */}
              <div className="gradient-light" style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '3px',
                opacity: 0.6
              }} />
              
              <div style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                boxShadow: '0 15px 40px rgba(139, 92, 246, 0.2)'
              }}>
                <i className="bi bi-quote"></i>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)'
                }}>
                  <i className="bi bi-building"></i>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                    Directeur des Ressources Humaines
                  </div>
                  <div style={{ fontSize: '1rem', color: '#64748b' }}>
                    Groupe International - Partenaire depuis 3 ans
                  </div>
                </div>
              </div>
              
              <p style={{ 
                fontSize: '1.2rem',
                color: '#475569',
                lineHeight: 1.7,
                fontStyle: 'italic',
                margin: 0,
                textAlign: 'center',
                padding: '1rem'
              }}>
                "La transformation opérée par Octogo grâce aux neurosciences appliquées 
                a été spectaculaire. Nos équipes sont plus engagées, plus créatives 
                et nos performances ont augmenté de 40% en seulement 18 mois."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles responsives */}
      <style>
        {`
          @media (max-width: 1200px) {
            .logo-wrapper {
              width: 260px;
              height: 180px;
            }
            
            h1 {
              font-size: 2.5rem !important;
            }
          }
          
          @media (max-width: 1024px) {
            .logo-wrapper {
              width: 220px;
              height: 160px;
            }
            
            .logo-item {
              padding: 0 1.5rem;
            }
            
            .logo-frame {
              padding: 1.5rem;
            }
            
            h1 {
              font-size: 2.2rem !important;
            }
            
            .counter-number {
              font-size: 2.2rem !important;
            }
          }
          
          @media (max-width: 768px) {
            .logo-wrapper {
              width: 200px;
              height: 140px;
            }
            
            .logo-item {
              padding: 0 1rem;
            }
            
            .logo-frame {
              padding: 1rem;
              border-radius: 12px;
            }
            
            h1 {
              font-size: 2rem !important;
              padding: 0 1rem;
            }
            
            h2 {
              font-size: 1.8rem !important;
            }
            
            p {
              font-size: 1.1rem !important;
              padding: 0 1rem;
            }
            
            .counter-number {
              font-size: 2rem !important;
            }
            
            .scroll-content {
              animation-duration: 60s !important;
            }
            
            .light-particle {
              display: none;
            }
          }
          
          @media (max-width: 480px) {
            .logo-wrapper {
              width: 160px;
              height: 120px;
            }
            
            .logo-item {
              padding: 0 0.75rem;
            }
            
            h1 {
              font-size: 1.8rem !important;
            }
            
            h2 {
              font-size: 1.5rem !important;
            }
            
            .counter-number {
              font-size: 1.8rem !important;
            }
            
            .stats-card {
              min-width: 100% !important;
              margin-bottom: 1rem;
            }
            
            .cta-buttons {
              flex-direction: column;
              width: 100%;
            }
            
            .cta-buttons button {
              width: 100%;
              justify-content: center;
            }
          }
          
          /* Pause animation on hover for better UX */
          .scroll-container:hover .scroll-content {
            animation-play-state: paused;
          }
          
          /* Smooth transitions */
          * {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}
      </style>
    </>
  )
}

export default Clients