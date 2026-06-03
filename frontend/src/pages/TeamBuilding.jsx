import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const TeamBuilding = () => {
  const [selectedType, setSelectedType] = useState('TOUS')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [animatedStats, setAnimatedStats] = useState({
    teams: 150,
    satisfaction: 98,
    companies: 25,
    participants: 5000
  })
  const [downloadState, setDownloadState] = useState({})
  const [showDownloadMessage, setShowDownloadMessage] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  
  const statsRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const activities = [
    {
      id: 'tb-voyage-alchimique',
      title: 'Le Voyage Alchimique',
      subtitle: 'Transformer le Plomb en Or',
      type: 'TRANSFORMATION',
      duration: '1 JOUR',
      participants: '11 chefs de département',
      pdfFile: '/src/pdfs/tb/voyage-alchimique.pdf',
      coverImage: '/src/images/tb/Le Voyage Alchimique.jpg',
      description: 'Expérience de transformation humaine et collective pour transcender les poids de l\'ego',
      detailedDescription: 'Un parcours immersif basé sur les principes alchimiques pour transformer les défis en opportunités. Cette expérience unique combine métaphores alchimiques et outils de développement personnel pour créer un changement durable.',
      benefits: [
        'Libération des tensions individuelles',
        'Unification de la vision du groupe',
        'Ancrage de pratiques durables',
        'Coopération et sérénité renforcées',
        'Clarté sur les objectifs communs',
        'Renforcement de la confiance mutuelle'
      ],
      methodology: [
        'Ateliers métaphoriques',
        'Exercices de visualisation',
        'Partages en cercle de parole',
        'Rituels symboliques de transformation'
      ],
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      icon: 'bi-arrow-repeat'
    },
    {
      id: 'tb-neurosynergie',
      title: 'NEUROSYNERGIE',
      subtitle: 'Activer les neurones, connecter les cerveaux',
      type: 'NEUROSCIENCES',
      duration: '1 JOUR',
      participants: 'Équipes complètes',
      pdfFile: '/src/pdfs/tb/neurosynergie.pdf',
      coverImage: '/src/images/tb/neurosynergie.jpg',
      description: 'Basé sur les neurosciences sociales pour explorer les mécanismes cérébraux de cohésion',
      detailedDescription: 'Un programme scientifique qui utilise les dernières découvertes en neurosciences sociales pour optimiser la collaboration. Comprenez comment fonctionne votre cerveau en équipe et apprenez à synchroniser vos efforts.',
      benefits: [
        'Sécurité psychologique renforcée',
        'Performance collective optimisée',
        'Conscience et confiance accrues',
        'Coopération entre collaborateurs',
        'Réduction des biais cognitifs',
        'Meilleure prise de décision collective'
      ],
      methodology: [
        'Exercices de synchronisation neuronale',
        'Ateliers sur l\'intelligence collective',
        'Tests de profil cognitif',
        'Jeux basés sur les neurosciences'
      ],
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      icon: 'bi-cpu'
    },
    {
      id: 'tb-full-energy',
      title: 'FULL ENERGY',
      subtitle: 'Défis sportifs et jeux interactifs',
      type: 'ÉNERGIE',
      duration: '1 JOUR',
      participants: '10-50 personnes',
      pdfFile: '/src/pdfs/tb/full energy.pdf',
      coverImage: '/src/images/tb/full energy.jpg',
      description: 'Journée rythmée par des défis sportifs favorisant cohésion et esprit d\'équipe',
      detailedDescription: 'Une journée haute en énergie qui combine sport, fun et collaboration. Parfait pour booster le moral de l\'équipe et créer des souvenirs mémorables tout en renforçant les liens.',
      benefits: [
        'Cohésion et motivation boostées',
        'Créativité et collaboration',
        'Énergie positive du groupe',
        'Esprit d\'équipe renforcé',
        'Amélioration de la communication',
        'Gestion du stress collective'
      ],
      methodology: [
        'Défis sportifs en équipe',
        'Jeux de coordination',
        'Activités outdoor',
        'Compétitions amicales'
      ],
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      icon: 'bi-lightning'
    },
    {
      id: 'tb-heart-synergie',
      title: 'Heart Synergie - Future Leaders',
      subtitle: 'L\'intelligence du cœur au service du leadership',
      type: 'LEADERSHIP',
      duration: '1-2 JOURS',
      participants: 'Leaders et cadres',
      pdfFile: '/src/pdfs/tb/heart-synergie.pdf',
      coverImage: '/src/images/tb/heart-synergie.jpg',
      description: 'Programme exclusif pour renforcer un leadership humain et inspirant',
      detailedDescription: 'Un programme transformateur pour les leaders qui souhaitent développer une approche plus humaine et authentique. Apprenez à combiner intelligence émotionnelle et efficacité managériale.',
      benefits: [
        'Posture managériale améliorée',
        'Cohérence émotionnelle',
        'Capacité à fédérer et inspirer',
        'Leadership du cœur développé',
        'Empathie managériale',
        'Communication authentique'
      ],
      methodology: [
        'Ateliers d\'intelligence émotionnelle',
        'Exercices de leadership situationnel',
        'Feedback 360°',
        'Mises en situation réelles'
      ],
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      icon: 'bi-award'
    },
    {
      id: 'tb-emergent-leaders',
      title: 'Heart Synergie - Emergent Leaders',
      subtitle: 'Révéler le potentiel collectif',
      type: 'DÉVELOPPEMENT',
      duration: '1 JOUR',
      participants: 'Équipes opérationnelles',
      pdfFile: '/src/pdfs/tb/emergent-leaders.pdf',
      coverImage: '/src/images/tb/emergent-leaders.jpg',
      description: 'Parcours immersif pour renforcer cohésion et révéler le potentiel collectif',
      detailedDescription: 'Spécialement conçu pour les équipes opérationnelles, ce programme révèle les talents cachés et renforce la synergie collective pour une performance optimale.',
      benefits: [
        'Communication authentique',
        'Confiance mutuelle renforcée',
        'Responsabilisation accrue',
        'Esprit d\'équipe soudé',
        'Identification des talents',
        'Optimisation des rôles'
      ],
      methodology: [
        'Team building collaboratif',
        'Exercices de confiance',
        'Ateliers de communication',
        'Jeux de rôle professionnels'
      ],
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      icon: 'bi-people'
    }
  ]

  const types = ['TOUS', 'TRANSFORMATION', 'NEUROSCIENCES', 'ÉNERGIE', 'LEADERSHIP', 'DÉVELOPPEMENT']

  // Animation des stats - SEULEMENT quand la section entre dans le viewport la première fois
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          // Animation initiale seulement si pas encore animé
          animateNumbers()
          setHasAnimated(true)
        }
      },
      { 
        threshold: 0.3,
        rootMargin: '50px'
      }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  // Animation initiale au chargement de la page si la section est visible
  useEffect(() => {
    const checkIfVisible = () => {
      if (statsRef.current && !hasAnimated) {
        const rect = statsRef.current.getBoundingClientRect()
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
        
        if (isVisible) {
          animateNumbers()
          setHasAnimated(true)
        }
      }
    }

    const timer = setTimeout(checkIfVisible, 300)
    return () => clearTimeout(timer)
  }, [hasAnimated])

  const animateNumbers = () => {
    setAnimatedStats({
      teams: 0,
      satisfaction: 0,
      companies: 0,
      participants: 0
    })

    const duration = 1500
    const steps = 60
    const incrementTimes = {
      teams: 150 / steps,
      satisfaction: 98 / steps,
      companies: 25 / steps,
      participants: 5000 / steps
    }

    let step = 0
    const timer = setInterval(() => {
      step++
      setAnimatedStats({
        teams: Math.min(Math.floor(incrementTimes.teams * step), 150),
        satisfaction: Math.min(Math.floor(incrementTimes.satisfaction * step), 98),
        companies: Math.min(Math.floor(incrementTimes.companies * step), 25),
        participants: Math.min(Math.floor(incrementTimes.participants * step), 5000)
      })

      if (step >= steps) {
        clearInterval(timer)
        setAnimatedStats({
          teams: 150,
          satisfaction: 98,
          companies: 25,
          participants: 5000
        })
      }
    }, duration / steps)
  }

  const filteredActivities = selectedType === 'TOUS' 
    ? activities 
    : activities.filter(a => a.type === selectedType)

  const handleDownload = async (activity) => {
    setDownloadState(prev => ({ ...prev, [activity.id]: 'loading' }))
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const link = document.createElement('a')
    link.href = activity.pdfFile
    link.download = `${activity.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setDownloadState(prev => ({ ...prev, [activity.id]: 'success' }))
    setShowDownloadMessage(true)
    
    setTimeout(() => {
      setDownloadState(prev => ({ ...prev, [activity.id]: null }))
      setShowDownloadMessage(false)
    }, 2000)
  }

  // Fonction pour gérer la demande de devis (identique à Parcours et Coaching)
  const handleDemandeDevis = (activity) => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      // Si non connecté, rediriger vers login avec retour vers dashboard
      navigate(`/login?redirect=/dashboard&action=demande-devis&teamBuildingId=${activity.id}&teamBuildingNom=${encodeURIComponent(activity.title)}`);
    } else {
      // Si connecté, rediriger vers le dashboard avec paramètres
      navigate(`/dashboard?action=demande-devis&teamBuildingId=${activity.id}&teamBuildingNom=${encodeURIComponent(activity.title)}`);
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedActivity(null)
    document.body.style.overflow = 'auto'
  }

  // Fonction pour contacter (bouton principal CTA)
  const handleContact = () => {
    navigate('/contact')
  }

  return (
    <>
      {/* Download Success Message */}
      <AnimatePresence>
        {showDownloadMessage && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="download-message"
          >
            <div className="download-message-content">
              <i className="bi bi-check-circle-fill"></i>
              <span>Téléchargement réussi !</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header avec logo centré */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          {/* Logo centré */}
          <div className="logo-container">
            <motion.img 
              src="/src/images/1.png" 
              alt="Octogo Logo" 
              className="page-header-logo"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <motion.h1 
            className="page-title"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Team Building Neurosciences
          </motion.h1>
          <motion.p 
            className="page-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Basé sur les neurosciences sociales, la communication émotionnelle et la psychologie positive. 
            Renforcez la cohésion, la confiance et la collaboration au sein de vos équipes.
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          {/* Stats Section - Animation UNE SEULE FOIS */}
          <motion.div 
            ref={statsRef}
            className="stats-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ amount: 0.3, once: true }}
          >
            <div className="stats-container">
              {[
                { value: `${animatedStats.teams}+`, label: 'Équipes Transformées', icon: 'bi-people-fill', color: '#8B5CF6' },
                { value: `${animatedStats.satisfaction}%`, label: 'Satisfaction', icon: 'bi-award-fill', color: '#EC4899' },
                { value: `${animatedStats.companies}+`, label: 'Entreprises Partenaires', icon: 'bi-building', color: '#3B82F6' },
                { value: `${animatedStats.participants}+`, label: 'Participants', icon: 'bi-person-check-fill', color: '#10B981' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ amount: 0.3, once: true }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 20px 40px ${stat.color}20`
                  }}
                >
                  <motion.div
                    className="stat-icon-container"
                    style={{ background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}80 100%)` }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <i className={`bi ${stat.icon}`}></i>
                  </motion.div>
                  <motion.div
                    key={`${stat.value}-${hasAnimated}`}
                    className="stat-value"
                    style={{ color: stat.color }}
                    initial={{ scale: hasAnimated ? 1 : 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200,
                      delay: hasAnimated ? 0 : 0.5
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="stat-label">
                    {stat.label}
                  </div>
                  <motion.div 
                    className="stat-underline"
                    style={{ background: stat.color }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    viewport={{ amount: 0.3, once: true }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="filter-container"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ amount: 0.3 }}
          >
            <div className="filter-buttons">
              {types.map((type, index) => (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 8px 25px rgba(139, 92, 246, 0.3)"
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedType(type)}
                  className={`filter-button ${selectedType === type ? 'active' : ''}`}
                >
                  {type}
                  {selectedType === type && (
                    <motion.div 
                      className="filter-active-indicator"
                      layoutId="activeFilter"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Horizontal Activities Grid */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedType}
              className="horizontal-activities-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: `0 20px 50px ${activity.color}40`
                  }}
                  className="horizontal-activity-card"
                  style={{ 
                    background: 'white',
                    borderLeft: `6px solid ${activity.color}`,
                    boxShadow: `0 8px 30px ${activity.color}20`
                  }}
                >
                  {/* Card Header */}
                  <div className="horizontal-card-header">
                    <div className="header-left">
                      <motion.span 
                        className="activity-type-badge"
                        style={{ background: activity.color }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {activity.type}
                      </motion.span>
                      <div className="activity-meta">
                        <motion.span 
                          className="meta-item"
                          whileHover={{ scale: 1.05 }}
                        >
                          <i className="bi bi-clock"></i>
                          {activity.duration}
                        </motion.span>
                        <motion.span 
                          className="meta-item"
                          whileHover={{ scale: 1.05 }}
                        >
                          <i className="bi bi-people"></i>
                          {activity.participants}
                        </motion.span>
                      </div>
                    </div>
                    <div className="header-right">
                      <motion.div 
                        className="activity-icon"
                        style={{ 
                          background: `${activity.color}15`,
                          color: activity.color
                        }}
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <i className={`bi ${activity.icon}`}></i>
                      </motion.div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="horizontal-card-body">
                    <div className="card-content-left">
                      <div className="activity-title-section">
                        <motion.h3 
                          className="activity-title"
                          whileHover={{ color: activity.color }}
                        >
                          {activity.title}
                        </motion.h3>
                        <motion.p 
                          className="activity-subtitle"
                          style={{ color: activity.color }}
                          whileHover={{ scale: 1.02 }}
                        >
                          {activity.subtitle}
                        </motion.p>
                      </div>
                      
                      <div className="activity-description">
                        <p>{activity.description}</p>
                      </div>

                      {/* Benefits */}
                      <div className="benefits-section">
                        <motion.h4 
                          className="section-title"
                          whileHover={{ scale: 1.02 }}
                        >
                          <i className="bi bi-check-circle-fill" style={{ color: activity.color }}></i>
                          Bénéfices
                        </motion.h4>
                        <div className="benefits-list">
                          {activity.benefits.slice(0, 3).map((benefit, idx) => (
                            <motion.div 
                              key={idx} 
                              className="benefit-item"
                              style={{
                                borderLeftColor: activity.color
                              }}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              whileHover={{ 
                                x: 5,
                                backgroundColor: `${activity.color}08`
                              }}
                            >
                              <i className="bi bi-check" style={{ color: activity.color }}></i>
                              <span>{benefit}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="card-content-right">
                      <motion.div 
                        className="image-container"
                        whileHover={{ scale: 1.03 }}
                      >
                        <div 
                          className="image-wrapper"
                          style={{ background: activity.gradient }}
                        >
                          {activity.coverImage ? (
                            <motion.img
                              src={activity.coverImage}
                              alt={activity.title}
                              className="activity-image"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.3 }}
                            />
                          ) : (
                            <div className="image-placeholder">
                              <i className={`bi ${activity.icon}`}></i>
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {/* Action Buttons - MODIFIÉ */}
                      <div className="action-buttons">
                        <motion.button
                          whileHover={{ 
                            scale: 1.05,
                            backgroundColor: `${activity.color}05`
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewDetails(activity)}
                          className="action-button outline"
                          style={{
                            borderColor: activity.color,
                            color: activity.color
                          }}
                        >
                          <motion.i 
                            className="bi bi-eye"
                            whileHover={{ rotate: 15 }}
                          />
                          Voir détails
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(activity)}
                          disabled={downloadState[activity.id] === 'loading'}
                          className="action-button primary"
                          style={{
                            background: activity.color,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {downloadState[activity.id] === 'loading' ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="loading-spinner"
                              />
                              Téléchargement...
                            </>
                          ) : downloadState[activity.id] === 'success' ? (
                            <>
                              <i className="bi bi-check-circle"></i>
                              Téléchargé !
                            </>
                          ) : (
                            <>
                              <i className="bi bi-download"></i>
                              Télécharger
                            </>
                          )}
                        </motion.button>

                        {/* NOUVEAU BOUTON "Demander devis" avec la même logique */}
                        <motion.button
                          whileHover={{ 
                            scale: 1.05,
                            backgroundColor: `${activity.color}15`
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDemandeDevis(activity);
                          }}
                          className="action-button secondary"
                          style={{
                            background: `${activity.color}10`,
                            color: activity.color
                          }}
                        >
                          <i className="bi bi-calendar-check"></i>
                          Demander devis
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Quote Section */}
          <motion.div
            className="quote-section"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ amount: 0.3 }}
          >
            <motion.div
              className="quote-icon"
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <i className="bi bi-quote"></i>
            </motion.div>
            
            <motion.h2
              className="quote-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ amount: 0.3 }}
            >
              « Le talent gagne des matchs, mais le travail d'équipe et l'intelligence gagnent des championnats. »
            </motion.h2>
            
            <motion.p
              className="quote-author"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ amount: 0.3 }}
            >
              Michael Jordan
            </motion.p>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="cta-section"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ amount: 0.3 }}
          >
            <motion.div
              className="cta-icon"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <i className="bi bi-calendar-heart-fill"></i>
            </motion.div>
            
            <h2 className="cta-title">
              Organisez votre Team Building
            </h2>
            
            <p className="cta-description">
              Contactez-nous pour créer une expérience sur mesure adaptée à votre équipe
            </p>
            
            <div className="cta-buttons">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 15px 30px rgba(139, 92, 246, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContact}
                className="cta-button primary"
              >
                <i className="bi bi-calendar-check"></i>
                Réserver un Team Building
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 8px 20px rgba(139, 92, 246, 0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('tel:+21628262829')}
                className="cta-button secondary"
              >
                <i className="bi bi-telephone"></i>
                +216 28 262 829
              </motion.button>
            </div>
            
            <motion.p
              className="cta-footer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ amount: 0.3 }}
            >
              <i className="bi bi-shield-check"></i>
              Approche neuroscientifique validée par la recherche
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && selectedActivity && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={handleCloseModal}
                className="modal-close-button"
                whileHover={{ rotate: 90, scale: 1.1 }}
              >
                <i className="bi bi-x"></i>
              </motion.button>

              <div>
                <div 
                  className="modal-hero"
                  style={{ background: selectedActivity.gradient }}
                >
                  <motion.div
                    className="modal-hero-icon"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <i className={`bi ${selectedActivity.icon}`}></i>
                  </motion.div>
                </div>

                <div className="modal-content">
                  <div className="modal-header">
                    <motion.span 
                      className="modal-type-badge"
                      style={{ background: selectedActivity.color }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {selectedActivity.type}
                    </motion.span>
                    <h2 className="modal-title">{selectedActivity.title}</h2>
                    <p className="modal-subtitle" style={{ color: selectedActivity.color }}>
                      {selectedActivity.subtitle}
                    </p>
                  </div>

                  <div className="modal-info-grid">
                    {[
                      { icon: 'bi-clock', label: 'Durée', value: selectedActivity.duration },
                      { icon: 'bi-people', label: 'Participants', value: selectedActivity.participants }
                    ].map((info, index) => (
                      <motion.div
                        key={index}
                        className="modal-info-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="modal-info-icon" style={{ background: `${selectedActivity.color}15`, color: selectedActivity.color }}>
                          <i className={`bi ${info.icon}`}></i>
                        </div>
                        <div>
                          <div className="modal-info-label">{info.label}</div>
                          <div className="modal-info-value">{info.value}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    className="modal-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="modal-section-title">Description complète</h3>
                    <p className="modal-section-content">
                      {selectedActivity.detailedDescription}
                    </p>
                  </motion.div>

                  <motion.div 
                    className="modal-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="modal-section-title">Bénéfices clés</h3>
                    <div className="modal-benefits-grid">
                      {selectedActivity.benefits.map((benefit, idx) => (
                        <motion.div
                          key={idx}
                          className="modal-benefit-item"
                          style={{
                            background: `${selectedActivity.color}08`,
                            color: selectedActivity.color,
                            border: `1px solid ${selectedActivity.color}20`
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <i className="bi bi-check-circle"></i>
                          {benefit}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    className="modal-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="modal-section-title">Méthodologie</h3>
                    <div className="modal-methodology-list">
                      {selectedActivity.methodology.map((method, idx) => (
                        <motion.div 
                          key={idx} 
                          className="modal-methodology-item"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <i className="bi bi-check-lg" style={{ color: selectedActivity.color }}></i>
                          {method}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Actions du modal - MODIFIÉ */}
                  <div className="modal-actions">
                    <motion.button
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: `0 10px 25px ${selectedActivity.color}40`
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDownload(selectedActivity)}
                      className="modal-action-button primary"
                      style={{ background: selectedActivity.color }}
                    >
                      <i className="bi bi-download"></i>
                      Télécharger le programme
                    </motion.button>

                    {/* NOUVEAU BOUTON dans le modal */}
                    <motion.button
                      whileHover={{ 
                        scale: 1.02,
                        backgroundColor: `${selectedActivity.color}15`
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemandeDevis(selectedActivity);
                        handleCloseModal();
                      }}
                      className="modal-action-button secondary"
                      style={{ 
                        color: selectedActivity.color,
                        borderColor: selectedActivity.color
                      }}
                    >
                      <i className="bi bi-calendar-plus"></i>
                      Demander un devis
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        /* Reset CSS pour éviter les espaces inutiles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .section {
          padding: 0;
        }

        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }

        /* Message de téléchargement */
        .download-message {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 2000;
          background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }

        .download-message-content {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .download-message-content i {
          font-size: 1.2rem;
        }

        /* Loading spinner */
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          margin-right: 10px;
        }

        /* Page Header ajusté pour mobile */
        .page-header {
          text-align: center;
          padding: 1.5rem 0 2rem;
          position: relative;
          background: white;
          margin: 0;
          width: 100%;
          overflow: hidden;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 0;
        }

        .page-header-logo {
          height: 80px;
          width: auto;
          max-width: 200px;
          object-fit: contain;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          margin: 0.5rem 0;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
          line-height: 1.2;
          padding: 0 15px;
        }

        .page-subtitle {
          font-size: 1rem;
          color: #6B7280;
          max-width: 800px;
          margin: 1rem auto;
          line-height: 1.6;
          text-align: center;
          padding: 0 15px;
        }

        /* Stats section responsive */
        .stats-section {
          margin-bottom: 3rem;
          padding: 0 15px;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem 1rem;
          text-align: center;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.1);
          position: relative;
          overflow: hidden;
        }

        .stat-icon-container {
          width: 45px;
          height: 45px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
          color: white;
          font-size: 1.2rem;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
          line-height: 1;
        }

        .stat-label {
          color: #6B7280;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .stat-underline {
          display: none;
        }

        /* Filter container mobile */
        .filter-container {
          background: white;
          border-radius: 15px;
          padding: 1.5rem 1rem;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.1);
          margin-bottom: 2rem;
          margin: 0 15px 2rem;
          overflow-x: auto;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: nowrap;
          min-width: max-content;
          padding-bottom: 5px;
        }

        .filter-button {
          padding: 0.6rem 1rem;
          background: rgba(139, 92, 246, 0.05);
          color: #6B7280;
          border: 1.5px solid rgba(139, 92, 246, 0.15);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.02em;
          position: relative;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Horizontal Activities Grid - Mobile First */
        .horizontal-activities-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 3rem;
          padding: 0 15px;
        }

        .horizontal-activity-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          position: relative;
        }

        .horizontal-card-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-type-badge {
          color: white;
          padding: 6px 15px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          align-self: flex-start;
        }

        .activity-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #6B7280;
          font-weight: 500;
        }

        .header-right {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        /* Main Horizontal Layout Mobile */
        .horizontal-card-body {
          display: flex;
          flex-direction: column;
        }

        .card-content-left {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .activity-title-section {
          margin-bottom: 1rem;
        }

        .activity-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1F2937;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .activity-subtitle {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.5;
          margin: 0;
        }

        .activity-description {
          color: #6B7280;
          margin-bottom: 1.5rem;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .benefits-section {
          margin-top: 0;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
          border-left: 4px solid;
          font-size: 0.9rem;
          color: #4B5563;
        }

        .card-content-right {
          padding: 0 1.5rem 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .image-container {
          margin-bottom: 1.5rem;
          border-radius: 12px;
          overflow: hidden;
        }

        .image-wrapper {
          width: 100%;
          height: 180px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .activity-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2.5rem;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-button {
          padding: 12px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 2px solid;
          transition: all 0.3s ease;
        }

        /* Quote Section Mobile */
        .quote-section {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 5px 20px rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.1);
          text-align: center;
          margin: 0 15px 3rem;
        }

        .quote-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
          font-size: 1.5rem;
          transform: rotate(180deg);
        }

        .quote-text {
          font-size: 1.25rem;
          font-style: italic;
          font-weight: 300;
          color: #1F2937;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .quote-author {
          color: #8B5CF6;
          font-size: 1rem;
          font-weight: 600;
        }

        /* CTA Section Mobile */
        .cta-section {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 5px 20px rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.1);
          text-align: center;
          margin: 0 15px 2rem;
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8B5CF6, #EC4899, #8B5CF6);
        }

        .cta-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
          font-size: 1.5rem;
        }

        .cta-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #1F2937;
          font-weight: 800;
        }

        .cta-description {
          color: #6B7280;
          font-size: 1rem;
          margin: 0 auto 1.5rem;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .cta-button {
          padding: 14px 20px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          color: white;
        }

        .cta-button.secondary {
          background: white;
          color: #1F2937;
          border: 2px solid rgba(139, 92, 246, 0.2);
        }

        .cta-footer {
          color: #9CA3AF;
          font-size: 0.85rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(139, 92, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Modal Styles Mobile */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 15px;
        }

        .modal-container {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-height: 85vh;
          overflow: auto;
          position: relative;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
        }

        .modal-close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        }

        .modal-hero {
          height: 150px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-hero-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          backdrop-filter: blur(10px);
        }

        .modal-content {
          padding: 1.5rem;
        }

        .modal-header {
          margin-bottom: 1.5rem;
        }

        .modal-type-badge {
          color: white;
          padding: 6px 15px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: inline-block;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1F2937;
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .modal-subtitle {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .modal-info-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .modal-info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.02);
          padding: 12px;
          border-radius: 10px;
        }

        .modal-info-icon {
          width: 35px;
          height: 35px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .modal-info-label {
          font-size: 0.8rem;
          color: #6B7280;
        }

        .modal-info-value {
          font-weight: 600;
          color: #1F2937;
          font-size: 0.95rem;
        }

        .modal-section {
          margin-bottom: 1.5rem;
        }

        .modal-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1F2937;
          margin-bottom: 1rem;
          padding-bottom: 8px;
          border-bottom: 2px solid rgba(139, 92, 246, 0.1);
        }

        .modal-section-content {
          color: #6B7280;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .modal-benefits-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .modal-benefit-item {
          padding: 10px 15px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-methodology-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .modal-methodology-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6B7280;
          font-size: 0.9rem;
          padding: 8px;
          border-radius: 8px;
        }

        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(139, 92, 246, 0.1);
        }

        .modal-action-button {
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        /* Media Queries pour desktop */
        @media (min-width: 768px) {
          .page-header {
            padding: 3rem 0 3rem;
          }

          .page-header-logo {
            height: 120px;
            max-width: 300px;
          }

          .page-title {
            font-size: 3rem;
          }

          .page-subtitle {
            font-size: 1.2rem;
          }

          .stats-container {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }

          .stat-card {
            padding: 2rem;
          }

          .stat-icon-container {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          .stat-value {
            font-size: 2.5rem;
          }

          .stat-label {
            font-size: 0.95rem;
          }

          .stat-underline {
            display: block;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            border-radius: 2px;
          }

          .filter-container {
            padding: 2rem;
            border-radius: 20px;
            margin: 0 0 3rem;
          }

          .filter-buttons {
            justify-content: center;
            flex-wrap: wrap;
            min-width: auto;
          }

          .filter-button {
            padding: 0.75rem 1.5rem;
            font-size: 0.9rem;
          }

          .horizontal-activities-grid {
            gap: 3rem;
            margin-bottom: 5rem;
            padding: 0;
          }

          .horizontal-card-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
          }

          .header-left {
            flex-direction: row;
            align-items: center;
            gap: 1.5rem;
          }

          .activity-meta {
            flex-direction: row;
            gap: 1.5rem;
          }

          .header-right {
            position: static;
          }

          .horizontal-card-body {
            flex-direction: row;
            min-height: 350px;
          }

          .card-content-left {
            flex: 1;
            padding: 2.5rem;
          }

          .activity-title {
            font-size: 2rem;
          }

          .activity-subtitle {
            font-size: 1.1rem;
          }

          .card-content-right {
            flex: 0 0 400px;
            border-left: 1px solid rgba(0, 0, 0, 0.05);
            border-top: none;
            padding: 2.5rem;
            padding-left: 0;
          }

          .image-wrapper {
            height: 200px;
          }

          .quote-section {
            padding: 4rem;
            margin: 0 0 5rem;
          }

          .quote-icon {
            width: 80px;
            height: 80px;
            font-size: 2rem;
            margin-bottom: 2rem;
          }

          .quote-text {
            font-size: 2rem;
          }

          .quote-author {
            font-size: 1.1rem;
          }

          .cta-section {
            padding: 4rem;
            margin: 0 0 2rem;
          }

          .cta-icon {
            width: 80px;
            height: 80px;
            font-size: 2rem;
            margin-bottom: 2rem;
          }

          .cta-title {
            font-size: 2.5rem;
          }

          .cta-description {
            font-size: 1.1rem;
          }

          .cta-buttons {
            flex-direction: row;
            gap: 1rem;
            justify-content: center;
          }

          .cta-button {
            padding: 16px 32px;
          }

          .modal-container {
            max-width: 900px;
          }

          .modal-content {
            padding: 3rem;
          }

          .modal-info-grid {
            grid-template-columns: repeat(2, 1fr);
            display: grid;
          }

          .modal-benefits-grid {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .modal-benefit-item {
            flex: 1 1 calc(50% - 0.75rem);
            min-width: 200px;
          }

          .modal-actions {
            flex-direction: row;
          }
        }

        @media (min-width: 1024px) {
          .container {
            padding: 0 20px;
          }

          .stats-section {
            margin-bottom: 4rem;
          }

          .horizontal-activity-card:hover {
            transform: translateY(-8px);
          }
        }

        /* Fix pour les très petits écrans */
        @media (max-width: 360px) {
          .page-header-logo {
            height: 60px;
          }

          .page-title {
            font-size: 1.75rem;
          }

          .page-subtitle {
            font-size: 0.9rem;
          }

          .stats-container {
            grid-template-columns: 1fr;
          }

          .activity-title {
            font-size: 1.3rem;
          }

          .quote-text {
            font-size: 1.1rem;
          }

          .cta-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </>
  )
}

export default TeamBuilding