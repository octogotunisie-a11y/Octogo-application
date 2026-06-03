import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  const [animated, setAnimated] = useState(false)
  const [stats, setStats] = useState({ clients: 0, formations: 0, satisfaction: 0 })
  
  useEffect(() => {
    setAnimated(true)
    
    // Animation progressive des stats
    const interval = setInterval(() => {
      setStats(prev => ({
        clients: prev.clients < 500 ? prev.clients + 10 : 500,
        formations: prev.formations < 50 ? prev.formations + 1 : 50,
        satisfaction: prev.satisfaction < 98 ? prev.satisfaction + 1 : 98
      }))
    }, 30)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="hero" style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '6rem 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Background animé */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        animation: 'pulse 4s ease-in-out infinite alternate'
      }}></div>
      
      {/* Particules animées */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      <div className="container">
        <div className="hero-content" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Hero Text */}
          <div className="hero-text" style={{
            opacity: animated ? 1 : 0,
            transform: animated ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              lineHeight: '1.2',
              marginBottom: '1.5rem',
              background: 'linear-gradient(45deg, #fff, rgba(255,255,255,0.8))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Libérez Votre<br />
              <span style={{
                background: 'linear-gradient(45deg, #F97316, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Potentiel Humain</span>
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '2.5rem',
              lineHeight: '1.6'
            }}>
              Premier cabinet tunisien spécialisé en neurosciences appliquées.
              Transformez votre organisation avec la science du cerveau et des solutions innovantes.
            </p>
            
            {/* Boutons avec animations */}
            <div className="hero-buttons" style={{
              display: 'flex',
              gap: '1.5rem',
              marginBottom: '4rem'
            }}>
              <Link 
                to="/formations" 
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '1rem 2rem',
                  background: 'linear-gradient(45deg, #F97316, #EC4899)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 20px rgba(249, 115, 22, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(249, 115, 22, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(249, 115, 22, 0.3)'
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '0',
                  height: '0',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'translate(-50%, -50%)',
                  transition: 'width 0.6s ease, height 0.6s ease'
                }} className="btn-ripple"></span>
                <i className="bi bi-play-circle" style={{ fontSize: '1.2rem' }}></i>
                Découvrir nos formations
              </Link>
              
              <Link 
                to="/contact" 
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '1rem 2rem',
                  background: 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <i className="bi bi-calendar-check" style={{ fontSize: '1.2rem' }}></i>
                Réserver un appel
              </Link>
            </div>

            {/* Stats animées */}
            <div className="hero-stats" style={{
              display: 'flex',
              gap: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              {[
                { icon: 'bi-people-fill', value: stats.clients, label: 'Clients satisfaits', suffix: '+' },
                { icon: 'bi-mortarboard-fill', value: stats.formations, label: 'Formations', suffix: '+' },
                { icon: 'bi-award-fill', value: stats.satisfaction, label: 'Taux de satisfaction', suffix: '%' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="stat-card"
                  style={{
                    opacity: animated ? 1 : 0,
                    transform: animated ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.8s ease ${index * 0.2}s, transform 0.8s ease ${index * 0.2}s`
                  }}
                >
                  <div className="stat-icon" style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <i className={`bi ${stat.icon}`} style={{
                      fontSize: '1.5rem',
                      color: 'white'
                    }}></i>
                  </div>
                  <div className="stat-number" style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    background: 'linear-gradient(45deg, #fff, rgba(255,255,255,0.8))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="stat-label" style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual - Cartes flottantes */}
          <div className="hero-visual" style={{
            position: 'relative',
            height: '500px'
          }}>
            {/* Carte principale */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '400px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '24px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              animation: 'float 6s ease-in-out infinite',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <i className="bi bi-brain" style={{
                  fontSize: '2.5rem',
                  color: 'white'
                }}></i>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Neurosciences Appliquées
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                Des solutions basées sur la science du cerveau pour optimiser performance et bien-être.
              </p>
            </div>

            {/* Cartes flottantes */}
            {[
              { icon: 'bi-lightning-charge', title: 'Formation Accélérée', desc: 'Résultats rapides garantis', delay: 0 },
              { icon: 'bi-person-check', title: 'Experts Certifiés', desc: 'Professionnels expérimentés', delay: 1 },
              { icon: 'bi-shield-check', title: 'Support 24/7', desc: 'Accompagnement continu', delay: 2 }
            ].map((card, index) => (
              <div
                key={index}
                className="floating-card"
                style={{
                  position: 'absolute',
                  width: '220px',
                  padding: '1.25rem',
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  animation: `floatSub 4s ease-in-out infinite`,
                  animationDelay: `${card.delay}s`,
                  opacity: animated ? 1 : 0,
                  transform: animated ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.8s ease ${0.5 + card.delay * 0.2}s, transform 0.8s ease ${0.5 + card.delay * 0.2}s`
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem'
                }}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    marginBottom: '0.25rem',
                    color: '#1F2937'
                  }}>
                    {card.title}
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    margin: 0
                  }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }
        
        @keyframes floatSub {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .btn-primary:hover .btn-ripple {
          width: 300px;
          height: 300px;
        }
        
        .floating-card:nth-child(1) { top: 0; left: 0; }
        .floating-card:nth-child(2) { top: 20%; right: 0; }
        .floating-card:nth-child(3) { bottom: 10%; left: 10%; }
      `}</style>
    </section>
  )
}

export default Hero