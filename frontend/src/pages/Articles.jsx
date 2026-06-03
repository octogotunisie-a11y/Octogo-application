import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Articles = () => {
  const [filter, setFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [animatedStats, setAnimatedStats] = useState({
    articles: 0,
    readers: 0,
    authors: 0,
    categories: 0
  })
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const [carouselDirection, setCarouselDirection] = useState('right')
  const carouselIntervalRef = useRef(null)

  // Articles basés sur le catalogue PDF (5 articles exactement)
  const articles = [
    {
      id: 1,
      title: 'Du management de guerre au management durable',
      excerpt: 'Comme de la médecine de guerre à la médecine préventive. Transformer les modèles managériaux vers la coopération et la confiance.',
      category: 'MANAGEMENT',
      author: 'Fredj Bouslama',
      date: '2024',
      readTime: '8 min',
      image: 'src/images/articles/magazine1.jpg',
      featured: true,
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      icon: 'bi-shield-check',
      pdfUrl: 'src/pdfs/articles/du managment de guerre.pdf',
      tags: ['Transformation', 'Durabilité', 'Neurosciences']
    },
    {
      id: 2,
      title: 'Routine, cerveau & leadership',
      excerpt: 'Quand la routine améliore l\'efficacité, mais affaiblit le cerveau du leader. Préserver la plasticité cérébrale par la nouveauté.',
      category: 'LEADERSHIP',
      author: 'Fredj Bouslama',
      date: '2024',
      readTime: '6 min',
      image: 'src/images/articles/magazine2.jpg',
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      icon: 'bi-brain',
      pdfUrl: 'src/pdfs/articles/Routine , cerveau & leadership.pdf',
      tags: ['Plasticité', 'Efficacité', 'Innovation']
    },
    {
      id: 3,
      title: 'Le management neurocognitif',
      excerpt: 'Une solution durable pour l\'intelligence humaine au travail. Renforcer lucidité, résilience et prise de décision éclairée.',
      category: 'NEUROSCIENCES',
      author: 'Fredj Bouslama',
      date: '2024',
      readTime: '9 min',
      image: 'src/images/articles/magazine3.jpg',
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      icon: 'bi-cpu-fill',
      pdfUrl: 'src/pdfs/articles/Le management neurocognitif.pdf',
      tags: ['Neurocognition', 'Résilience', 'Performance']
    },
    {
      id: 4,
      title: 'Les 20 Maximes des Neurosciences Appliquées au Travail',
      excerpt: 'Synthèse des enseignements neuroscientifiques pour comprendre, motiver et transformer les dynamiques humaines en entreprise.',
      category: 'NEUROSCIENCES',
      author: 'Fredj Bouslama',
      date: '2024',
      readTime: '12 min',
      image: 'src/images/articles/magazine4.jpg',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      icon: 'bi-lightbulb-fill',
      pdfUrl: 'src/pdfs/articles/Les 20 Maximes des Neurosciences Appliquées au Travail (1).pdf',
      tags: ['Guide', 'Pratique', 'Science']
    },
    {
      id: 5,
      title: 'Les 20 Maximes Neurocognitives',
      excerpt: 'Fondements scientifiques et implications managériales des maximes neurocognitives pour un leadership éclairé et durable.',
      category: 'SCIENCE',
      author: 'Fredj Bouslama',
      date: '2024',
      readTime: '10 min',
      image: 'src/images/articles/magazine5.jpg',
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      icon: 'bi-journal-text',
      pdfUrl: 'src/pdfs/articles/Les 20 Maximes Neurocognitives.pdf',
      tags: ['Recherche', 'Études', 'Evidence-based']
    }
  ]

  const categories = [
    { id: 'all', name: 'TOUS', icon: 'bi-grid-fill' },
    { id: 'MANAGEMENT', name: 'MANAGEMENT', icon: 'bi-diagram-3' },
    { id: 'LEADERSHIP', name: 'LEADERSHIP', icon: 'bi-award' },
    { id: 'NEUROSCIENCES', name: 'NEUROSCIENCES', icon: 'bi-brain' },
    { id: 'SCIENCE', name: 'SCIENCE', icon: 'bi-flask' }
  ]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Animation des stats au chargement de la page
  useEffect(() => {
    const animateNumbers = () => {
      const duration = 2000
      const steps = 60
      const incrementTimes = {
        articles: 5 / steps,
        readers: 10000 / steps,
        authors: 5 / steps,
        categories: 6 / steps
      }

      let step = 0
      const timer = setInterval(() => {
        step++
        setAnimatedStats({
          articles: Math.floor(incrementTimes.articles * step),
          readers: Math.floor(incrementTimes.readers * step),
          authors: Math.floor(incrementTimes.authors * step),
          categories: Math.floor(incrementTimes.categories * step)
        })

        if (step >= steps) {
          clearInterval(timer)
          setAnimatedStats({
            articles: 5,
            readers: 10000,
            authors: 5,
            categories: 6
          })
        }
      }, duration / steps)
    }

    animateNumbers()
  }, [])

  // Gestion du carousel automatique avec transition plus smooth
  useEffect(() => {
    carouselIntervalRef.current = setInterval(() => {
      setCarouselDirection('right')
      setCurrentCarouselIndex((prevIndex) => (prevIndex + 1) % articles.length)
    }, 6000) // 6 secondes pour plus de smoothness

    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current)
      }
    }
  }, [articles.length])

  const handleCarouselNavigation = (index, direction = 'right') => {
    setCarouselDirection(direction)
    setCurrentCarouselIndex(index)
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current)
      carouselIntervalRef.current = setInterval(() => {
        setCarouselDirection('right')
        setCurrentCarouselIndex((prevIndex) => (prevIndex + 1) % articles.length)
      }, 6000)
    }
  }

  const filteredArticles = filter === 'all' 
    ? articles 
    : articles.filter(article => article.category === filter)

  const handleViewArticle = (article) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedArticle(null)
  }

  const handleDownloadPDF = (pdfUrl) => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = pdfUrl.split('/').pop()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    const email = e.target.email.value
    alert(`Merci ${email} pour votre inscription à notre newsletter !`)
    e.target.reset()
  }

  return (
    <>
      {/* Hero Section avec texte plus grand et moins d'espace */}
      <div className="page-header" style={{
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '0.5rem',
        paddingBottom: '1rem'
      }}>
        <div className="container" style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Logo centré avec marge minimale */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              marginBottom: '0.75rem'
            }}
          >
            <img 
              src="src/images/1.png" 
              alt="Octogo Logo" 
              style={{
                maxWidth: '130px',
                height: 'auto',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            <h1 className="page-title" style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1F2937 0%, #4B5563 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
              lineHeight: 1.1
            }}>
              Insights & Inspiration
            </h1>
            
            <p className="page-subtitle" style={{
              fontSize: '1.1rem',
              color: '#6B7280',
              lineHeight: 1.5,
              maxWidth: '600px',
              marginBottom: '0'
            }}>
              Découvrez nos articles experts sur les neurosciences appliquées au management, 
              le leadership durable et la transformation organisationnelle.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section avec texte plus grand */}
      <section className="section" style={{ 
        paddingTop: '0.5rem', 
        paddingBottom: '2rem',
        background: 'white',
        position: 'relative'
      }}>
        <div className="container">
          <div 
            className="stats-grid"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
              gap: '1rem',
              marginBottom: '2rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            {[
              { 
                value: `${animatedStats.articles}`, 
                label: 'Articles Premium', 
                icon: 'bi-journal-text',
                color: '#8B5CF6',
                suffix: ''
              },
              { 
                value: `${animatedStats.readers}`, 
                label: 'Lecteurs Engagés', 
                icon: 'bi-people-fill',
                color: '#EC4899',
                suffix: '+'
              },
              { 
                value: `${animatedStats.authors}`, 
                label: 'Experts Renommés', 
                icon: 'bi-person-check-fill',
                color: '#10B981',
                suffix: ''
              },
              { 
                value: `${animatedStats.categories}`, 
                label: 'Domaines Experts', 
                icon: 'bi-tags-fill',
                color: '#3B82F6',
                suffix: ''
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -3 }}
                className="stat-card"
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '1.25rem 0.75rem',
                  textAlign: 'center',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Effet de bord coloré */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px'
                }}></div>
                
                <div style={{
                  width: '55px',
                  height: '55px',
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  color: stat.color,
                  fontSize: '1.4rem',
                  border: `1px solid ${stat.color}20`
                }}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 + index * 0.1, ease: "easeOut" }}
                  style={{ 
                    fontSize: '2.2rem', 
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}99 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.25rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  {stat.value}
                  {stat.suffix && <span style={{ fontSize: '1.4rem' }}>{stat.suffix}</span>}
                </motion.div>
                
                <div style={{ 
                  color: '#6B7280',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ 
        background: 'white',
        position: 'relative',
        paddingTop: '0'
      }}>
        <div className="container">
          {/* Filters avec texte plus grand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="filters-container"
            style={{ 
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(229, 231, 235, 0.8)',
              marginBottom: '2.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              textAlign: 'center',
              marginBottom: '1.25rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1F2937',
                marginBottom: '0.5rem'
              }}>
                Explorez par catégorie
              </h2>
              <p style={{
                color: '#6B7280',
                fontSize: '0.95rem'
              }}>
                Filtrez nos articles pour découvrir des contenus adaptés à vos besoins
              </p>
            </div>
            
            <div className="filters-grid" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              position: 'relative',
              zIndex: 1
            }}>
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.2, ease: "easeOut" }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -1
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(category.id)}
                  className="filter-button"
                  style={{
                    padding: '0.75rem 1rem',
                    background: filter === category.id 
                      ? `linear-gradient(135deg, ${category.id === 'all' ? '#8B5CF6' : articles.find(a => a.category === category.id)?.color || '#8B5CF6'} 0%, ${category.id === 'all' ? '#EC4899' : articles.find(a => a.category === category.id)?.color + 'CC' || '#EC4899'} 100%)` 
                      : 'rgba(249, 250, 251, 0.8)',
                    color: filter === category.id ? 'white' : '#4B5563',
                    border: filter === category.id 
                      ? 'none' 
                      : '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: filter === category.id 
                      ? '0 4px 12px rgba(139, 92, 246, 0.15)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    minHeight: '45px'
                  }}
                >
                  <i className={`bi ${category.icon}`} style={{
                    fontSize: '1rem'
                  }}></i>
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Carousel des articles avec texte plus grand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="carousel-container"
            style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(229, 231, 235, 0.8)',
              position: 'relative',
              marginBottom: '3.5rem'
            }}
          >
            {/* Header du carousel */}
            <div className="carousel-header" style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(229, 231, 235, 0.8)',
              background: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: `linear-gradient(135deg, ${articles[currentCarouselIndex].color} 0%, ${articles[currentCarouselIndex].color}CC 100%)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    boxShadow: `0 6px 20px ${articles[currentCarouselIndex].color}40`
                  }}>
                    <i className="bi bi-arrow-left-right"></i>
                  </div>
                  <div>
                    <h2 style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 800, 
                      color: '#1F2937',
                      margin: 0
                    }}>
                      Découvrez nos articles
                    </h2>
                    <p style={{ 
                      color: '#6B7280', 
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.9rem'
                    }}>
                      Changement automatique toutes les 6 secondes
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem'
                }}>
                  <div style={{ color: '#6B7280', fontSize: '0.95rem', fontWeight: 600 }}>
                    <span style={{ color: articles[currentCarouselIndex].color, fontSize: '1.1rem' }}>{currentCarouselIndex + 1}</span>
                    <span style={{ margin: '0 0.25rem', color: '#D1D5DB' }}>/</span>
                    <span>{articles.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu du carousel */}
            <div style={{ padding: '1.5rem' }}>
              <AnimatePresence mode="wait" custom={carouselDirection}>
                <motion.div
                  key={currentCarouselIndex}
                  custom={carouselDirection}
                  initial={{ 
                    opacity: 0,
                    x: carouselDirection === 'right' ? 60 : -60,
                    scale: 0.95
                  }}
                  animate={{ 
                    opacity: 1,
                    x: 0,
                    scale: 1
                  }}
                  exit={{ 
                    opacity: 0,
                    x: carouselDirection === 'right' ? -60 : 60,
                    scale: 0.95
                  }}
                  transition={{ 
                    duration: 0.4,
                    ease: "easeInOut"
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}
                >
                  {/* Image article */}
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.5,
                      delay: 0.1,
                      ease: "easeOut"
                    }}
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '250px',
                      height: '320px',
                      margin: '0 auto'
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      background: articles[currentCarouselIndex].gradient,
                      boxShadow: `0 12px 25px ${articles[currentCarouselIndex].color}20`,
                      transform: 'perspective(1000px) rotateY(-5deg)'
                    }}>
                      <img
                        src={articles[currentCarouselIndex].image}
                        alt={articles[currentCarouselIndex].title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center'
                        }}
                      />
                      
                      {/* Badge sur l'article */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(12px)',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: articles[currentCarouselIndex].color,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <i className="bi bi-stars"></i>
                        ARTICLE PRÉSENTATION
                      </div>
                    </div>
                  </motion.div>

                  {/* Contenu texte */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: 0.15,
                      ease: "easeOut"
                    }}
                    style={{
                      textAlign: 'center',
                      maxWidth: '100%',
                      margin: '0 auto'
                    }}
                  >
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: `${articles[currentCarouselIndex].color}10`,
                      color: articles[currentCarouselIndex].color,
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                      border: `1px solid ${articles[currentCarouselIndex].color}20`
                    }}>
                      <i className="bi bi-lightning-fill"></i>
                      ARTICLE {currentCarouselIndex + 1} • {articles[currentCarouselIndex].category}
                    </div>

                    <h2 style={{ 
                      fontSize: '1.6rem', 
                      fontWeight: 800,
                      marginBottom: '0.75rem',
                      color: '#1F2937',
                      lineHeight: 1.2
                    }}>
                      {articles[currentCarouselIndex].title}
                    </h2>

                    <p style={{ 
                      fontSize: '1.05rem',
                      color: '#6B7280',
                      marginBottom: '1rem',
                      lineHeight: 1.5
                    }}>
                      {articles[currentCarouselIndex].excerpt}
                    </p>

                    {/* Tags */}
                    <div style={{ 
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      marginBottom: '1.25rem'
                    }}>
                      {articles[currentCarouselIndex].tags?.map((tag, index) => (
                        <motion.span 
                          key={index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: 0.2 + (index * 0.05),
                            duration: 0.3,
                            ease: "easeOut"
                          }}
                          whileHover={{ y: -1 }}
                          style={{
                            background: `${articles[currentCarouselIndex].color}10`,
                            color: articles[currentCarouselIndex].color,
                            padding: '0.4rem 0.9rem',
                            borderRadius: '50px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: `1px solid ${articles[currentCarouselIndex].color}20`
                          }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>

                    {/* Métadonnées */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        delay: 0.3,
                        duration: 0.4,
                        ease: "easeOut"
                      }}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        marginBottom: '1.5rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#4B5563',
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }}>
                        <div style={{
                          width: '45px',
                          height: '45px',
                          background: `${articles[currentCarouselIndex].color}10`,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: articles[currentCarouselIndex].color,
                          fontSize: '1.1rem',
                          border: `1px solid ${articles[currentCarouselIndex].color}20`
                        }}>
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Auteur</div>
                          <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>{articles[currentCarouselIndex].author}</div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#4B5563',
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }}>
                        <div style={{
                          width: '45px',
                          height: '45px',
                          background: `${articles[currentCarouselIndex].color}10`,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: articles[currentCarouselIndex].color,
                          fontSize: '1.1rem',
                          border: `1px solid ${articles[currentCarouselIndex].color}20`
                        }}>
                          <i className="bi bi-calendar-week"></i>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Publication</div>
                          <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>{articles[currentCarouselIndex].date}</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Boutons d'action */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.4,
                        duration: 0.4,
                        ease: "easeOut"
                      }}
                      style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        justifyContent: 'center', 
                        flexWrap: 'wrap'
                      }}
                    >
                      <motion.button
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: `0 6px 20px ${articles[currentCarouselIndex].color}40`
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewArticle(articles[currentCarouselIndex])}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: `linear-gradient(135deg, ${articles[currentCarouselIndex].color} 0%, ${articles[currentCarouselIndex].color}CC 100%)`,
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          boxShadow: `0 4px 15px ${articles[currentCarouselIndex].color}30`
                        }}
                      >
                        <i className="bi bi-eye-fill" style={{ fontSize: '1rem' }}></i>
                        Lire l'article
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownloadPDF(articles[currentCarouselIndex].pdfUrl)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'white',
                          color: articles[currentCarouselIndex].color,
                          border: `1px solid ${articles[currentCarouselIndex].color}40`,
                          borderRadius: '10px',
                          fontSize: '1rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        <i className="bi bi-download" style={{ fontSize: '1rem' }}></i>
                        Télécharger PDF
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation manuelle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid rgba(229, 231, 235, 0.8)',
              background: 'white'
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCarouselNavigation(
                  currentCarouselIndex === 0 ? articles.length - 1 : currentCarouselIndex - 1,
                  'left'
                )}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(249, 250, 251, 0.9)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  gap: '0.75rem',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)'
                }}
              >
                <i className="bi bi-chevron-left" style={{ fontSize: '1rem' }}></i>
                <span className="hide-on-mobile">Précédent</span>
              </motion.button>
              
              {/* Indicateurs de points */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                {articles.map((_, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCarouselNavigation(idx, idx > currentCarouselIndex ? 'right' : 'left')}
                    style={{
                      width: idx === currentCarouselIndex ? '18px' : '10px',
                      height: '10px',
                      borderRadius: '5px',
                      border: 'none',
                      background: idx === currentCarouselIndex 
                        ? `linear-gradient(135deg, ${articles[currentCarouselIndex].color} 0%, ${articles[currentCarouselIndex].color}CC 100%)` 
                        : 'rgba(209, 213, 219, 0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCarouselNavigation(
                  currentCarouselIndex === articles.length - 1 ? 0 : currentCarouselIndex + 1,
                  'right'
                )}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(249, 250, 251, 0.9)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4B5563',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  gap: '0.75rem',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)'
                }}
              >
                <span className="hide-on-mobile">Suivant</span>
                <i className="bi bi-chevron-right" style={{ fontSize: '1rem' }}></i>
              </motion.button>
            </div>
          </motion.div>

          {/* Tous les articles en grille avec texte plus grand */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            style={{ 
              marginBottom: '3.5rem'
            }}
          >
            <div style={{
              textAlign: 'center',
              marginBottom: '2.5rem'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#1F2937',
                marginBottom: '0.75rem'
              }}>
                Explorez notre collection complète
              </h2>
              <p style={{
                color: '#6B7280',
                fontSize: '1.05rem',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.5
              }}>
                Découvrez tous nos articles premium sur les neurosciences appliquées au management
              </p>
            </div>
            
            <div className="articles-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.08, 
                    duration: 0.4,
                    ease: "easeOut" 
                  }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.08)'
                  }}
                  style={{
                    background: 'white',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => handleViewArticle(article)}
                >
                  {/* Effet de bord coloré */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${article.color} 0%, ${article.color}80 100%)`,
                    zIndex: 2
                  }}></div>
                  
                  {/* Image avec effet */}
                  <div style={{ 
                    height: '200px',
                    position: 'relative', 
                    overflow: 'hidden',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5rem'
                  }}>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '140px',
                      height: '180px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                      transform: 'rotate(-2deg)',
                      border: '1px solid rgba(0, 0, 0, 0.08)'
                    }}>
                      <img
                        src={article.image}
                        alt={article.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center top'
                        }}
                      />
                      
                      {/* Overlay gradient */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
                      }} />
                    </div>
                    
                    {/* Badge Article */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(12px)',
                      color: article.color,
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      zIndex: 2
                    }}>
                      <i className="bi bi-file-earmark-text"></i>
                      ARTICLE OCTOGO
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: `${article.color}10`,
                      color: article.color,
                      padding: '0.4rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '1rem',
                      border: `1px solid ${article.color}20`
                    }}>
                      <i className={`bi ${article.icon}`}></i>
                      {article.category}
                    </div>

                    <h3 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: 800,
                      marginBottom: '0.75rem',
                      color: '#1F2937',
                      lineHeight: 1.3
                    }}>
                      {article.title}
                    </h3>

                    <p style={{ 
                      color: '#6B7280', 
                      marginBottom: '1.25rem',
                      lineHeight: 1.6,
                      fontSize: '0.95rem'
                    }}>
                      {article.excerpt}
                    </p>
                    
                    {/* Tags */}
                    <div style={{ 
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      marginBottom: '1.5rem'
                    }}>
                      {article.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} style={{
                          background: `${article.color}08`,
                          color: article.color,
                          padding: '0.35rem 0.8rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: `1px solid ${article.color}20`
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(229, 231, 235, 0.8)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#4B5563',
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: `${article.color}10`,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: article.color,
                          fontSize: '1rem',
                          border: `1px solid ${article.color}20`
                        }}>
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Expert</div>
                          <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>{article.author}</div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#9CA3AF',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        background: 'rgba(249, 250, 251, 0.8)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px'
                      }}>
                        <i className="bi bi-clock" style={{ color: article.color, fontSize: '0.9rem' }}></i>
                        {article.readTime}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter Section avec texte plus grand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            style={{ 
              background: 'white',
              borderRadius: '22px',
              padding: '3rem 2rem',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(229, 231, 235, 0.8)',
              textAlign: 'center',
              marginBottom: '3rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'relative',
              zIndex: 1
            }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
                style={{
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.75rem',
                  color: 'white',
                  fontSize: '1.8rem',
                  transform: 'rotate(-5deg)',
                  boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                }}
              >
                <i className="bi bi-envelope-paper-heart-fill"></i>
              </motion.div>
              
              <h2 style={{ 
                fontSize: '1.8rem',
                marginBottom: '1rem',
                color: '#1F2937',
                fontWeight: 800
              }}>
                Restez informé
              </h2>
              
              <p style={{ 
                color: '#6B7280', 
                fontSize: '1.05rem', 
                maxWidth: '600px', 
                margin: '0 auto 1.75rem',
                lineHeight: 1.6
              }}>
                Recevez nos derniers articles et insights directement dans votre boîte mail. 
                Des contenus exclusifs sur les neurosciences appliquées au management.
              </p>
              
              <form onSubmit={handleSubscribe} style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      border: '2px solid rgba(229, 231, 235, 0.8)',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    <i className="bi bi-check-circle-fill"></i>
                    S'abonner
                  </motion.button>
                </div>
                
                <p style={{ 
                  color: '#9CA3AF', 
                  fontSize: '0.9rem',
                  lineHeight: 1.5
                }}>
                  <i className="bi bi-shield-check" style={{ marginRight: '0.5rem', color: '#10B981' }}></i>
                  Recevez nos articles au format PDF. Désabonnement à tout moment. Vos données sont protégées.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal for Article Details */}
      <AnimatePresence>
        {isModalOpen && selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '1rem'
            }}
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ 
                type: 'spring', 
                damping: 25,
                stiffness: 200
              }}
              style={{
                background: 'white',
                borderRadius: '20px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  fontSize: '1.1rem',
                  color: '#1F2937',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
              >
                <i className="bi bi-x-lg"></i>
              </motion.button>

              {/* Modal Content */}
              <div>
                {/* Article Preview */}
                <div style={{ 
                  height: '220px',
                  position: 'relative',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '180px',
                    height: '220px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    transform: 'perspective(1000px) rotateY(-5deg)'
                  }}>
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top'
                      }}
                    />
                    
                    {/* Article Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(12px)',
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: selectedArticle.color,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      <i className="bi bi-file-earmark-text-fill"></i>
                      ARTICLE OCTOGO • {selectedArticle.category}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '2rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <span style={{
                        background: selectedArticle.color,
                        color: 'white',
                        padding: '0.5rem 1.25rem',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        boxShadow: `0 4px 15px ${selectedArticle.color}40`
                      }}>
                        {selectedArticle.category}
                      </span>
                    </div>
                    
                    <h2 style={{ 
                      fontSize: '1.6rem', 
                      fontWeight: 800, 
                      color: '#1F2937', 
                      margin: '0 0 1rem 0',
                      lineHeight: 1.2
                    }}>
                      {selectedArticle.title}
                    </h2>
                    
                    <p style={{ 
                      fontSize: '1.05rem', 
                      color: '#6B7280', 
                      lineHeight: 1.5,
                      marginBottom: '1.25rem'
                    }}>
                      {selectedArticle.excerpt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownloadPDF(selectedArticle.pdfUrl)}
                      style={{
                        padding: '0.9rem 1.5rem',
                        background: `linear-gradient(135deg, ${selectedArticle.color} 0%, ${selectedArticle.color}CC 100%)`,
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: `0 6px 20px ${selectedArticle.color}40`
                      }}
                    >
                      <i className="bi bi-download"></i>
                      Télécharger l'article (PDF)
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        /* Styles responsive */
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .section {
          padding: 1.5rem 0;
        }

        .hide-on-mobile {
          display: none;
        }

        @media (min-width: 768px) {
          .container {
            padding: 0 2rem;
          }
          
          .section {
            padding: 2rem 0;
          }
          
          .page-header {
            padding-top: 1rem !important;
            padding-bottom: 1.5rem !important;
          }
          
          .hide-on-mobile {
            display: inline;
          }
          
          .stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 1.5rem !important;
          }
          
          .stat-card {
            padding: 1.75rem 1rem !important;
          }
          
          .filters-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 1rem !important;
          }
          
          .filter-button {
            padding: 0.9rem 1.25rem !important;
            font-size: 0.95rem !important;
          }
          
          .carousel-header {
            padding: 2rem !important;
          }
          
          .articles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 2.5rem !important;
          }
          
          .newsletter-section {
            padding: 4rem 3rem !important;
          }
        }

        @media (min-width: 1024px) {
          .articles-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .newsletter-section {
            padding: 5rem 4rem !important;
          }
          
          .page-title {
            font-size: 2.8rem !important;
          }
          
          .page-header .page-title {
            font-size: 2.8rem !important;
          }
        }

        @media (max-width: 480px) {
          .articles-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
          
          .filters-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }
          
          .page-title {
            font-size: 1.8rem !important;
          }
          
          .page-header .page-title {
            font-size: 1.8rem !important;
          }
          
          .page-subtitle {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </>
  )
}

export default Articles