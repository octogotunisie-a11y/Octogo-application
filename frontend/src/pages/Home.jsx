import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  Users,
  Target,
  Award,
  GraduationCap,
  Heart,
  Sparkles,
  ArrowUpRight,
  Star,
  MessageCircle,
  BookOpen,
  Clock,
  Zap,
  Lightbulb,
  Shield,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Users as UsersIcon,
  Atom,
  BrainCircuit,
  Zap as ZapIcon,
  Eye,
  Rocket,
  HeartPulse,
  Download,
  ExternalLink
} from 'lucide-react'

const COLORS = {
  primary: '#2563EB',
  secondary: '#7C3AED',
  accent: '#EC4899',
  dark: '#0F172A',
  light: '#FFFFFF',
  lightGray: '#F1F5F9',
  mediumGray: '#E2E8F0',
  textGray: '#64748B',
  white: '#FFFFFF',
  gradientMain: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
  gradientLight: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05))',
  gradientText: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #EC4899 100%)'
}

// ==================== COMPOSANTS ANIMÉS ====================
const AnimatedNumber = ({ value, suffix = '+', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  useEffect(() => {
    if (!isVisible) return
    
    let start = 0
    const end = parseInt(value)
    const incrementTime = Math.max(10, duration / end)
    
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start === end) clearInterval(timer)
    }, incrementTime)
    
    return () => clearInterval(timer)
  }, [isVisible, value, duration])
  
  return (
    <span ref={ref} style={{ display: 'inline-block' }}>
      {count}{suffix}
    </span>
  )
}

const FadeInSection = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])
  
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Composant pour les cerveaux flottants
const FloatingBrains = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  if (isMobile) return null
  
  return (
    <>
      {/* Cerveaux flottants sur la page entière */}
      <div style={{
        position: 'fixed',
        top: '10%',
        left: '5%',
        animation: 'float 6s ease-in-out infinite',
        opacity: 0.1,
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <Brain size={30} color={COLORS.primary} />
      </div>
      <div style={{
        position: 'fixed',
        top: '20%',
        right: '8%',
        animation: 'float 8s ease-in-out infinite 1s',
        opacity: 0.1,
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <Brain size={40} color={COLORS.secondary} />
      </div>
      <div style={{
        position: 'fixed',
        bottom: '15%',
        left: '7%',
        animation: 'float 7s ease-in-out infinite 2s',
        opacity: 0.1,
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <Brain size={35} color={COLORS.accent} />
      </div>
      <div style={{
        position: 'fixed',
        bottom: '25%',
        right: '10%',
        animation: 'float 9s ease-in-out infinite 3s',
        opacity: 0.1,
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <Brain size={25} color={COLORS.primary} />
      </div>
      <div style={{
        position: 'fixed',
        top: '40%',
        left: '12%',
        animation: 'float 5s ease-in-out infinite 4s',
        opacity: 0.1,
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <Brain size={45} color={COLORS.secondary} />
      </div>
      <div style={{
        position: 'fixed',
        top: '60%',
        right: '15%',
        animation: 'float 6.5s ease-in-out infinite 5s',
        opacity: 0.1,
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <Brain size={30} color={COLORS.accent} />
      </div>
    </>
  )
}

// ==================== COMPOSANTS DE BASE ====================
const SectionTitle = ({ children, subtitle, centered = true }) => (
  <FadeInSection>
    <div style={{
      textAlign: centered ? 'center' : 'left',
      marginBottom: 'clamp(2rem, 5vw, 4rem)',
      position: 'relative'
    }}>
      <div style={{
        display: 'inline-block',
        fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
        fontWeight: 600,
        letterSpacing: '1px',
        marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
        padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(1rem, 2vw, 1.5rem)',
        background: COLORS.gradientMain,
        color: COLORS.white,
        borderRadius: '20px',
        textTransform: 'uppercase'
      }}>
        <Sparkles size={12} style={{ display: 'inline', marginRight: '8px' }} />
        Neurosciences Appliquées
      </div>

      <h2 style={{
        fontSize: 'clamp(1.75rem, 5vw, 3rem)',
        fontWeight: 800,
        marginBottom: subtitle ? 'clamp(1rem, 3vw, 1.5rem)' : '0',
        color: COLORS.dark,
        lineHeight: 1.1,
        maxWidth: '800px',
        marginLeft: centered ? 'auto' : '0',
        marginRight: centered ? 'auto' : '0'
      }}>
        {children}
      </h2>

      {subtitle && (
        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.25rem)',
          color: COLORS.textGray,
          maxWidth: '700px',
          margin: centered ? '0 auto' : '0',
          lineHeight: 1.7
        }}>
          {subtitle}
        </p>
      )}
    </div>
  </FadeInSection>
)

const Card = ({ children, hover = true, delay = 0 }) => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <FadeInSection delay={delay}>
      <div
        style={{
          background: COLORS.white,
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(37, 99, 235, 0.1)',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: hover && !isMobile ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
        onMouseEnter={hover && !isMobile ? (e) => {
          e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)'
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(37, 99, 235, 0.15)'
        } : undefined}
        onMouseLeave={hover && !isMobile ? (e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)'
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.08)'
        } : undefined}
      >
        {/* Effet de brillance */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.5), transparent)',
          opacity: 0.6
        }} />
        {children}
      </div>
    </FadeInSection>
  )
}

// ==================== SECTION NOTRE CATALOGUE 2026 ====================
const Catalogue2026Section = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [hovered, setHovered] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <section style={{
      padding: 'clamp(40px, 8vw, 100px) 0',
      background: COLORS.white,
      position: 'relative',
      width: '100%'
    }}>
      {/* Cerveaux flottants dans la section catalogue */}
      {!isMobile && (
        <>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            animation: 'float 6s ease-in-out infinite',
            opacity: 0.08,
            zIndex: 1
          }}>
            <Brain size={25} color={COLORS.primary} />
          </div>
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '5%',
            animation: 'float 8s ease-in-out infinite 1s',
            opacity: 0.08,
            zIndex: 1
          }}>
            <Brain size={35} color={COLORS.secondary} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            animation: 'float 7s ease-in-out infinite 2s',
            opacity: 0.08,
            zIndex: 1
          }}>
            <Brain size={30} color={COLORS.accent} />
          </div>
        </>
      )}
      
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        maxWidth: '1200px',
        position: 'relative',
        zIndex: 2
      }}>
        <SectionTitle
          subtitle="Découvrez notre collection exclusive de programmes et solutions neuroscientifiques pour 2026"
          centered
        >
          Notre Catalogue 2026
        </SectionTitle>

        <div style={{
          marginTop: 'clamp(2rem, 4vw, 3rem)',
          width: '100%'
        }}>
          <Card delay={200}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 'clamp(2rem, 4vw, 4rem)',
              alignItems: 'center'
            }}>
              {/* Book Container - Design amélioré */}
              <div 
                style={{
                  flex: isMobile ? '1' : '0 0 280px',
                  position: 'relative',
                  transform: hovered && !isMobile ? 'perspective(1000px) rotateY(-5deg) translateY(-5px)' : 'perspective(1000px) rotateY(-5deg)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: hovered && !isMobile ? 
                    '30px 30px 60px rgba(0, 0, 0, 0.15), 15px 15px 30px rgba(37, 99, 235, 0.15)' : 
                    '15px 15px 30px rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'white'
                }}
                onMouseEnter={() => !isMobile && setHovered(true)}
                onMouseLeave={() => !isMobile && setHovered(false)}
              >
                {/* Book Cover - Design plus élégant */}
                <div style={{
                  width: '280px',
                  height: '360px',
                  position: 'relative',
                  background: 'linear-gradient(145deg, #2563EB 0%, #7C3AED 100%)',
                  borderRadius: '12px 4px 4px 12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {/* Catalogue Image */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    bottom: '20px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.2)'
                  }}>
                    <img 
                      src="/src/images/catalogue.png" 
                      alt="Catalogue 2026 Octogo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                        // Fallback design élégant
                        const fallback = document.createElement('div')
                        fallback.style.cssText = `
                          width: 100%;
                          height: 100%;
                          background: linear-gradient(145deg, #1E40AF 0%, #5B21B6 100%);
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          padding: 2rem;
                          text-align: center;
                        `
                        fallback.innerHTML = `
                          <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; color: white;">2026</div>
                          <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; color: rgba(255,255,255,0.9); max-width: 180px;">CATALOGUE</div>
                          <div style="font-size: 0.8rem; opacity: 0.8; margin-bottom: 1.5rem; color: rgba(255,255,255,0.7);">NEUROSCIENCES APPLIQUÉES</div>
                          <div style="width: 40px; height: 3px; background: rgba(255,255,255,0.4); margin: 1rem 0;"></div>
                          <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 1rem;">Édition Exclusive</div>
                        `
                        e.target.parentElement.appendChild(fallback)
                      }}
                    />
                  </div>
                  
                  {/* Book Spine élégant */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '15px',
                    bottom: '15px',
                    width: '15px',
                    background: 'linear-gradient(to right, #1E3A8A, #4C1D95)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: 'inset -2px 0 5px rgba(0, 0, 0, 0.3)',
                    borderRadius: '2px 0 0 2px'
                  }} />
                  
                  
                  
                  {/* Shine Effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '30%',
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
                    pointerEvents: 'none'
                  }} />
                  
                  {/* Corner Accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.1) 50%)',
                    pointerEvents: 'none'
                  }} />
                </div>
                
                {/* Glow Effect on Hover */}
                {hovered && !isMobile && (
                  <div style={{
                    position: 'absolute',
                    inset: '-15px',
                    background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.1), transparent 70%)',
                    zIndex: -1,
                    animation: 'glow 2s ease-in-out infinite'
                  }} />
                )}
                
                {/* Page curl effect */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '0',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '60px',
                  background: 'linear-gradient(to left, rgba(255,255,255,0.3), rgba(255,255,255,0.1), transparent)',
                  borderLeft: '1px solid rgba(255,255,255,0.2)',
                  borderTopLeftRadius: '10px',
                  borderBottomLeftRadius: '10px',
                  pointerEvents: 'none'
                }} />
              </div>
              
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: `${COLORS.primary}20`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.primary
                  }}>
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      color: COLORS.dark
                    }}>
                      Catalogue Octogo 2026
                    </h3>
                    <p style={{
                      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                      color: COLORS.primary,
                      fontWeight: 600
                    }}>
                      Édition exclusive - Programmes de formation avancés
                    </p>
                  </div>
                </div>
                
                <div style={{
                  marginBottom: 'clamp(1.5rem, 3vw, 2rem)'
                }}>
                  <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                    color: COLORS.textGray,
                    lineHeight: 1.6,
                    marginBottom: '1.5rem'
                  }}>
                    Plongez au cœur de nos solutions neuroscientifiques innovantes pour 2026. 
                    Ce catalogue présente nos programmes de formation certifiants, nos ateliers 
                    spécialisés et nos outils d'optimisation cognitive.
                  </p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: 'clamp(1rem, 2vw, 1.5rem)',
                    marginTop: '2rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: `${COLORS.primary}20`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={12} color={COLORS.primary} />
                      </div>
                      <span style={{
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        color: COLORS.dark
                      }}>
                        Programmes NeuroLeadership
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: `${COLORS.primary}20`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={12} color={COLORS.primary} />
                      </div>
                      <span style={{
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        color: COLORS.dark
                      }}>
                        Ateliers NeuroMarketing
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: `${COLORS.primary}20`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={12} color={COLORS.primary} />
                      </div>
                      <span style={{
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        color: COLORS.dark
                      }}>
                        Formations NeuroLearning
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: `${COLORS.primary}20`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CheckCircle size={12} color={COLORS.primary} />
                      </div>
                      <span style={{
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        color: COLORS.dark
                      }}>
                        Solutions NeuroRésilience
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '1rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(37, 99, 235, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    color: COLORS.textGray
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: `${COLORS.primary}10`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: COLORS.primary
                    }}>
                      <Sparkles size={16} />
                    </div>
                    <span>Édition limitée 2026 • 128 pages • Format PDF & Imprimé</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: isMobile ? 'center' : 'flex-end'
                  }}>
                    <Link
                      to="/download-catalogue"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: COLORS.gradientMain,
                        color: COLORS.white,
                        padding: 'clamp(12px, 2vw, 14px) clamp(20px, 3vw, 28px)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        transition: 'all 0.3s ease',
                        minWidth: isMobile ? '100%' : 'auto'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.3)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }
                      }}
                    >
                      <Download size={18} />
                      Télécharger PDF
                    </Link>
                    
                    <Link
                      to="/contact"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        color: COLORS.primary,
                        padding: 'clamp(12px, 2vw, 14px) clamp(20px, 3vw, 28px)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                        border: `2px solid ${COLORS.primary}`,
                        transition: 'all 0.3s ease',
                        minWidth: isMobile ? '100%' : 'auto'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.background = `${COLORS.primary}10`
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <ExternalLink size={18} />
                      Demander l'Imprimé
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <style>{`
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  )
}

// ==================== DONNÉES ====================
const SERVICES = [
  {
    title: 'NeuroLeadership',
    icon: <BrainCircuit size={28} />,
    description: 'Performance optimisée grâce aux neurosciences',
    features: ['Décisions éclairées', 'Influence positive', 'Gestion d\'équipe'],
    color: '#2563EB',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Neuroselling & Marketing',
    icon: <ZapIcon size={28} />,
    description: 'Boostez vos ventes par la compréhension du cerveau',
    features: ['Stratégies cognitives', 'Optimisation client', 'Campagnes percutantes'],
    color: '#7C3AED',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'NeuroLearning',
    icon: <GraduationCap size={28} />,
    description: 'Apprentissage accéléré par les neurosciences',
    features: ['Formation innovante', 'Neuroplasticité', 'Mémoire optimisée'],
    color: '#10B981',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'NeuroRésilience',
    icon: <HeartPulse size={28} />,
    description: 'Résilience et bien-être au travail',
    features: ['Gestion du stress', 'Pleine conscience', 'Équilibre professionnel'],
    color: '#EC4899',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
  }
]

const TEAM = [
  {
    name: 'Fredj bouslam',
    role: 'Directrice R&D Neurosciences',
    specialty: 'Neuroplasticité Cognitive',
    description: 'PhD en neurosciences cognitives avec 10 ans d\'expérience en recherche appliquée',
    color: '#2563EB',
    image: '/src/images/fredj.jpg'
  },
  {
    name: 'Ahlam Amara',
    role: 'Chief Science Officer',
    specialty: 'Neuroéconomie & Décision',
    description: 'Expert en prise de décision et comportements économiques cérébraux',
    color: '#7C3AED',
    image: '/src/images/ahlam.jpg'
  },
  {
    name: 'Amal Chkiwa',
    role: 'Directrice Marketing Neuroscience',
    specialty: 'Neuromarketing Affectif',
    description: 'Spécialiste des émotions et décisions d\'achat basées sur les neurosciences',
    color: '#10B981',
    image: '/src/images/amal.jpeg'
  },
]

const VALUES = [
  {
    title: 'Innovation Scientifique',
    description: 'Solutions fondées sur les dernières recherches en neurosciences',
    icon: <Atom size={32} />,
    color: '#2563EB'
  },
  {
    title: 'Confiance & Transparence',
    description: 'Relations durables basées sur l\'intégrité et la clarté',
    icon: <ShieldCheck size={32} />,
    color: '#7C3AED'
  },
  {
    title: 'Agilité Neuronale',
    description: 'Adaptation rapide grâce à la compréhension des mécanismes cérébraux',
    icon: <Brain size={32} />,
    color: '#10B981'
  },
  {
    title: 'Bienveillance Cognitive',
    description: 'Approche humaine favorisant l\'épanouissement et le développement',
    icon: <Heart size={32} />,
    color: '#EC4899'
  }
]

const TESTIMONIALS = [
  {
    text: 'La transformation a été spectaculaire. Nos équipes managériales ont amélioré leur performance de 40% en 6 mois.',
    rating: 5,
  },
  {
    text: 'L\'approche neuroscientifique a révolutionné notre culture d\'entreprise. Le bien-être et la productivité ont augmenté simultanément.',
    rating: 5,
  },
  {
    text: 'Les outils de neurorésilience nous ont permis de traverser les crises avec une créativité décuplée.',
    rating: 5,
  }
]

// ==================== SECTIONS ====================
const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  const handleMouseMove = (e) => {
    if (!isMobile) {
      const { clientX, clientY } = e
      const x = (clientX / window.innerWidth - 0.5) * 20
      const y = (clientY / window.innerHeight - 0.5) * 20
      setMousePosition({ x, y })
    }
  }
  
  return (
    <section 
      style={{
        padding: 'clamp(60px, 10vw, 120px) 0 clamp(40px, 8vw, 80px)',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Background elements - only on desktop */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
          transition: 'transform 0.1s ease-out'
        }} />
      )}
      
      {/* Brain icons floating effect */}
      {!isMobile && (
        <>
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            animation: 'float 6s ease-in-out infinite',
            opacity: 0.15
          }}>
            <Brain size={40} color={COLORS.primary} />
          </div>
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '15%',
            animation: 'float 8s ease-in-out infinite 1s',
            opacity: 0.15
          }}>
            <Brain size={60} color={COLORS.secondary} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '25%',
            left: '15%',
            animation: 'float 7s ease-in-out infinite 2s',
            opacity: 0.15
          }}>
            <Brain size={50} color={COLORS.accent} />
          </div>
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '20%',
            animation: 'float 5s ease-in-out infinite 3s',
            opacity: 0.15
          }}>
            <Brain size={35} color={COLORS.primary} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '40%',
            left: '20%',
            animation: 'float 6.5s ease-in-out infinite 4s',
            opacity: 0.15
          }}>
            <Brain size={45} color={COLORS.secondary} />
          </div>
        </>
      )}
      
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        position: 'relative',
        zIndex: 2
      }}>
        <FadeInSection>
          <div style={{
            textAlign: 'center',
            color: COLORS.white,
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
              borderRadius: '30px',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              fontWeight: 600,
              marginBottom: 'clamp(1rem, 3vw, 2rem)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Brain size={16} />
              Premier cabinet tunisien en neurosciences appliquées depuis 2020
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: 800,
              marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #93C5FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Libérez le{' '}
              <span style={{
                background: COLORS.gradientText,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Potentiel Cérébral
              </span>
              <br />
              de votre Organisation
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: '#CBD5E1',
              marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
              lineHeight: 1.6
            }}>
              Octogo est le premier cabinet tunisien spécialisé en neurosciences appliquées à l'éducation, 
              la formation et le travail. Nous utilisons les découvertes scientifiques sur le cerveau 
              pour libérer le potentiel humain, améliorer la performance des organisations et favoriser le bien-être.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 'clamp(2rem, 4vw, 3rem)'
            }}>
              <Link to="/contact" style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 32px)',
                background: COLORS.gradientMain,
                color: COLORS.white,
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 30px rgba(37, 99, 235, 0.4)',
                transition: 'transform 0.2s ease',
                width: isMobile ? '100%' : 'auto',
                maxWidth: '300px'
              }}>
                <MessageCircle size={20} />
                <span>Démarrer la Transformation</span>
              </Link>
              
              <Link to="/formations" style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 32px)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: COLORS.white,
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : 'auto',
                maxWidth: '300px'
              }}>
                <BookOpen size={20} />
                <span>Explorer nos Solutions</span>
              </Link>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(1rem, 4vw, 3rem)',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: 800,
                  color: COLORS.white,
                  marginBottom: '0.5rem'
                }}>
                  <AnimatedNumber value="500" suffix="+" />
                </div>
                <div style={{
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: '#CBD5E1'
                }}>
                  Clients Transformés
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: 800,
                  color: COLORS.white,
                  marginBottom: '0.5rem'
                }}>
                  <AnimatedNumber value="98" suffix="%" />
                </div>
                <div style={{
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: '#CBD5E1'
                }}>
                  Satisfaction Clients
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: 800,
                  color: COLORS.white,
                  marginBottom: '0.5rem'
                }}>
                  <AnimatedNumber value="50" suffix="+" />
                </div>
                <div style={{
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                  color: '#CBD5E1'
                }}>
                  Programmes Innovants
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  )
}

const MissionSection = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <section style={{
      padding: 'clamp(40px, 8vw, 100px) 0',
      background: COLORS.white,
      position: 'relative',
      width: '100%'
    }}>
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        maxWidth: '1200px'
      }}>
        <SectionTitle
          subtitle="Transformer les défis d'un monde chaotique en opportunités grâce aux neurosciences"
          centered
        >
          Notre Mission
        </SectionTitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 'clamp(1rem, 3vw, 2rem)',
          marginTop: 'clamp(2rem, 4vw, 3rem)',
          width: '100%'
        }}>
          <Card>
            <div style={{
              width: 'clamp(48px, 8vw, 60px)',
              height: 'clamp(48px, 8vw, 60px)',
              background: `${COLORS.primary}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              color: COLORS.primary
            }}>
              <Lightbulb size={28} />
            </div>
            
            <h3 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              color: COLORS.dark
            }}>
              1. Éveiller les consciences
            </h3>
            
            <p style={{
              color: COLORS.textGray,
              lineHeight: 1.6,
              fontSize: 'clamp(0.9rem, 2vw, 1rem)'
            }}>
              Aider à mieux gérer pensées et émotions via la pleine conscience
            </p>
          </Card>
          
          <Card delay={100}>
            <div style={{
              width: 'clamp(48px, 8vw, 60px)',
              height: 'clamp(48px, 8vw, 60px)',
              background: `${COLORS.secondary}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              color: COLORS.secondary
            }}>
              <Zap size={28} />
            </div>
            
            <h3 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              color: COLORS.dark
            }}>
              2. Libérer le potentiel humain
            </h3>
            
            <p style={{
              color: COLORS.textGray,
              lineHeight: 1.6,
              fontSize: 'clamp(0.9rem, 2vw, 1rem)'
            }}>
              Réduire stress et surcharge cognitive pour reprendre le contrôle
            </p>
          </Card>
          
          <Card delay={200}>
            <div style={{
              width: 'clamp(48px, 8vw, 60px)',
              height: 'clamp(48px, 8vw, 60px)',
              background: `${COLORS.accent}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              color: COLORS.accent
            }}>
              <TrendingUp size={28} />
            </div>
            
            <h3 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              color: COLORS.dark
            }}>
              3. Stimuler le développement
            </h3>
            
            <p style={{
              color: COLORS.textGray,
              lineHeight: 1.6,
              fontSize: 'clamp(0.9rem, 2vw, 1rem)'
            }}>
              Renforcer leadership et résilience avec des outils neuroscientifiques
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}

const ApproachSection = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <section style={{
      padding: 'clamp(40px, 8vw, 100px) 0',
      background: COLORS.lightGray,
      width: '100%'
    }}>
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        maxWidth: '1200px'
      }}>
        <SectionTitle
          subtitle="Notre méthode repose sur quatre piliers fondamentaux"
          centered
        >
          Notre Approche Mindful Humans
        </SectionTitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 'clamp(1rem, 3vw, 2rem)',
          marginTop: 'clamp(2rem, 4vw, 3rem)',
          width: '100%'
        }}>
          <Card>
            <div style={{
              width: 'clamp(48px, 8vw, 60px)',
              height: 'clamp(48px, 8vw, 60px)',
              background: `${COLORS.primary}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              color: COLORS.primary
            }}>
              <UsersIcon size={28} />
            </div>
            
            <h3 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              color: COLORS.dark
            }}>
              Leadership Conscient
            </h3>
            
            <p style={{
              color: COLORS.textGray,
              lineHeight: 1.6,
              marginBottom: '1rem',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)'
            }}>
              Décisions éclairées et influence positive
            </p>
          </Card>
          
          <Card delay={100}>
            <div style={{
              width: 'clamp(48px, 8vw, 60px)',
              height: 'clamp(48px, 8vw, 60px)',
              background: `${COLORS.secondary}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              color: COLORS.secondary
            }}>
              <Brain size={28} />
            </div>
            
            <h3 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              color: COLORS.dark
            }}>
              Neurosciences
            </h3>
            
            <p style={{
              color: COLORS.textGray,
              lineHeight: 1.6,
              marginBottom: '1rem',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)'
            }}>
              Amélioration de la pensée grâce à la neuroplasticité
            </p>
          </Card>
          
          <Card delay={200}>
            <div style={{
              width: 'clamp(48px, 8vw, 60px)',
              height: 'clamp(48px, 8vw, 60px)',
              background: `${COLORS.accent}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              color: COLORS.accent
            }}>
              <Eye size={28} />
            </div>
            
            <h3 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              color: COLORS.dark
            }}>
              Pleine Conscience
            </h3>
            
            <p style={{
              color: COLORS.textGray,
              lineHeight: 1.6,
              marginBottom: '1rem',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)'
            }}>
              Gestion du stress et des émotions
            </p>
          </Card>
          
          <Card delay={300}>
            <div style={{
              width: 'clamp(48px, 8vw, 60px)',
              height: 'clamp(48px, 8vw, 60px)',
              background: `${COLORS.primary}20`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              color: COLORS.primary
            }}>
              <Shield size={28} />
            </div>
            
            <h3 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
              color: COLORS.dark
            }}>
              Résilience
            </h3>
            
            <p style={{
              color: COLORS.textGray,
              lineHeight: 1.6,
              marginBottom: '1rem',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)'
            }}>
              Rebondir face aux défis avec des techniques scientifiques
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}

const ServicesSection = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <section style={{
      padding: 'clamp(40px, 8vw, 100px) 0',
      background: COLORS.white,
      position: 'relative',
      width: '100%'
    }}>
      {/* Cerveaux flottants dans la section services */}
      {!isMobile && (
        <>
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '8%',
            animation: 'float 7s ease-in-out infinite',
            opacity: 0.08,
            zIndex: 1
          }}>
            <Brain size={35} color={COLORS.primary} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '40%',
            right: '8%',
            animation: 'float 5s ease-in-out infinite 2s',
            opacity: 0.08,
            zIndex: 1
          }}>
            <Brain size={40} color={COLORS.secondary} />
          </div>
        </>
      )}
      
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        maxWidth: '1200px',
        position: 'relative',
        zIndex: 2
      }}>
        <SectionTitle
          subtitle="Des solutions neuroscientifiques innovantes pour optimiser chaque aspect de votre organisation"
          centered
        >
          Nos Expertises Neurosciences
        </SectionTitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 'clamp(1rem, 3vw, 2rem)',
          marginTop: 'clamp(2rem, 4vw, 3rem)',
          width: '100%'
        }}>
          {SERVICES.map((service, index) => (
            <Card key={index} delay={index * 100}>
              <div style={{
                position: 'relative',
                height: 'clamp(150px, 30vw, 200px)',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
              }}>
                <img 
                  src={service.image}
                  alt={service.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: service.color,
                  color: COLORS.white,
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                  fontWeight: 600
                }}>
                  {service.title}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(0.75rem, 2vw, 1rem)',
                marginBottom: 'clamp(0.75rem, 2vw, 1rem)'
              }}>
                <div style={{
                  width: 'clamp(48px, 8vw, 56px)',
                  height: 'clamp(48px, 8vw, 56px)',
                  background: `rgba(${parseInt(service.color.slice(1,3), 16)}, ${parseInt(service.color.slice(3,5), 16)}, ${parseInt(service.color.slice(5,7), 16)}, 0.1)`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: service.color
                }}>
                  {service.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                    fontWeight: 700,
                    marginBottom: '0.25rem',
                    color: COLORS.dark
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                    color: service.color,
                    fontWeight: 600
                  }}>
                    {service.description}
                  </p>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
              }}>
                {service.features.map((feature, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <CheckCircle size={16} color={service.color} />
                    <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: COLORS.textGray }}>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link
                to={`/services#${service.title.toLowerCase()}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: service.color,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                }}
              >
                <span>Explorer cette expertise</span>
                <ArrowUpRight size={16} />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const ValuesSection = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <section style={{
      padding: 'clamp(40px, 8vw, 100px) 0',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      width: '100%'
    }}>
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        maxWidth: '1200px'
      }}>
        <SectionTitle
          subtitle="Les principes fondamentaux qui guident notre approche neuroscientifique"
          centered
        >
          Nos Valeurs Fondamentales
        </SectionTitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 'clamp(1rem, 3vw, 2rem)',
          marginTop: 'clamp(2rem, 4vw, 3rem)',
          width: '100%'
        }}>
          {VALUES.map((value, index) => (
            <Card key={index} delay={index * 100}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 'clamp(60px, 10vw, 80px)',
                  height: 'clamp(60px, 10vw, 80px)',
                  background: `linear-gradient(135deg, ${value.color}20, ${value.color}10)`,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
                  border: `2px solid ${value.color}20`
                }}>
                  <div style={{
                    width: 'clamp(40px, 7vw, 56px)',
                    height: 'clamp(40px, 7vw, 56px)',
                    background: value.color,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.white
                  }}>
                    {value.icon}
                  </div>
                </div>
                
                <h3 style={{
                  fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                  fontWeight: 700,
                  marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
                  color: COLORS.dark
                }}>
                  {value.title}
                </h3>
                
                <p style={{
                  color: COLORS.textGray,
                  lineHeight: 1.6,
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                }}>
                  {value.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const TeamSection = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <section style={{
      padding: 'clamp(40px, 8vw, 100px) 0',
      background: COLORS.white,
      width: '100%'
    }}>
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        maxWidth: '1200px'
      }}>
        <SectionTitle
          subtitle="Une équipe d'experts passionnés par l'exploration et l'optimisation du potentiel cérébral humain"
          centered
        >
          Notre Équipe d'Experts Neurosciences
        </SectionTitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 'clamp(1rem, 3vw, 2rem)',
          marginTop: 'clamp(2rem, 4vw, 3rem)',
          width: '100%'
        }}>
          {TEAM.map((member, index) => (
            <Card key={index} delay={index * 100}>
              <div style={{
                position: 'relative',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
              }}>
                {/* Image du membre avec fallback */}
                <div style={{
                  width: 'clamp(100px, 20vw, 140px)',
                  height: 'clamp(100px, 20vw, 140px)',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto',
                  border: `4px solid ${member.color}20`,
                  position: 'relative'
                }}>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.style.cssText = `
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(135deg, ${member.color}40, ${member.color}20);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: ${member.color};
                        font-weight: bold;
                        font-size: ${isMobile ? '2rem' : '2.5rem'};
                      `;
                      fallback.textContent = member.name.split(' ').map(n => n[0]).join('');
                      e.target.parentElement.appendChild(fallback);
                    }}
                  />
                </div>
                
                {/* Effet de halo */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'clamp(120px, 22vw, 160px)',
                  height: 'clamp(120px, 22vw, 160px)',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${member.color}20 0%, transparent 70%)`,
                  zIndex: -1
                }} />
              </div>
              
              <h3 style={{
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: COLORS.dark,
                textAlign: 'center'
              }}>
                {member.name}
              </h3>
              
              <div style={{
                background: `${member.color}10`,
                color: member.color,
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                fontWeight: 600,
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                {member.role}
              </div>
              
              <div style={{
                background: `${member.color}05`,
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                  fontWeight: 600,
                  color: member.color,
                  marginBottom: '0.25rem'
                }}>
                  Spécialité : {member.specialty}
                </div>
                <div style={{
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
                  color: COLORS.textGray,
                  lineHeight: 1.5
                }}>
                  {member.description}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{
                    width: '8px',
                    height: '8px',
                    background: member.color,
                    borderRadius: '50%',
                    opacity: 0.5
                  }} />
                ))}
              </div>
            </Card>
          ))}
        </div>
        
        {/* Ajout de la section Catalogue 2026 après l'équipe - MÊME STYLE */}
        <div style={{ marginTop: 'clamp(60px, 8vw, 100px)' }}>
          <Catalogue2026Section />
        </div>
      </div>
    </section>
  )
}

const TestimonialsSection = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <section style={{
      padding: 'clamp(40px, 8vw, 100px) 0',
      background: COLORS.white,
      position: 'relative',
      width: '100%'
    }}>
      <div style={{
        width: '100%',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        maxWidth: '1200px'
      }}>
        <SectionTitle
          subtitle="Découvrez comment les neurosciences ont transformé leurs organisations"
          centered
        >
          Ils nous font Confiance
        </SectionTitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 'clamp(1rem, 3vw, 2rem)',
          marginTop: 'clamp(2rem, 4vw, 3rem)',
          width: '100%'
        }}>
          {TESTIMONIALS.map((testimonial, index) => (
            <Card key={index} delay={index * 100}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
              }}>
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <div style={{
                    fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                    fontWeight: 700,
                    color: COLORS.dark,
                    marginBottom: '0.25rem'
                  }}>
                    {testimonial.name}
                  </div>
                  <div style={{
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                    color: COLORS.textGray
                  }}>
                    {testimonial.company}
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
              }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} color="#F59E0B" fill="#F59E0B" />
                ))}
              </div>
              
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                color: COLORS.dark,
                lineHeight: 1.6,
                fontStyle: 'italic',
                position: 'relative',
                paddingLeft: '1.5rem'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  fontSize: '3rem',
                  color: COLORS.primary,
                  opacity: 0.2,
                  lineHeight: 1
                }}>"</span>
                {testimonial.text}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const CTASection = () => {
  const [hover, setHover] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  return (
    <section style={{
      padding: 'clamp(60px, 10vw, 120px) 0',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      position: 'relative',
      overflow: 'hidden',
      width: '100%'
    }}>
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)`,
          animation: 'pulse 4s ease-in-out infinite'
        }} />
      )}
      
      {/* Cerveaux flottants dans la section CTA */}
      {!isMobile && (
        <>
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '15%',
            animation: 'float 6s ease-in-out infinite',
            opacity: 0.15
          }}>
            <Brain size={50} color={COLORS.primary} />
          </div>
          <div style={{
            position: 'absolute',
            bottom: '30%',
            right: '15%',
            animation: 'float 8s ease-in-out infinite 2s',
            opacity: 0.15
          }}>
            <Brain size={40} color={COLORS.secondary} />
          </div>
        </>
      )}
      
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        width: '100%'
      }}>
        <FadeInSection>
          <div style={{
            width: 'clamp(60px, 10vw, 100px)',
            height: 'clamp(60px, 10vw, 100px)',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto clamp(1.5rem, 3vw, 2rem)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Rocket size={isMobile ? 30 : 40} color={COLORS.white} />
          </div>
          
          <h2 style={{
            fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
            lineHeight: 1.1,
            color: COLORS.white
          }}>
            Prêt pour la{' '}
            <span style={{
              background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Révolution Neurosciences
            </span>
            ?
          </h2>
          
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.6,
            color: '#CBD5E1',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Transformez vos défis organisationnels en opportunités de croissance avec nos solutions neuroscientifiques validées.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Link 
              to="/contact"
              onMouseEnter={() => !isMobile && setHover(true)}
              onMouseLeave={() => !isMobile && setHover(false)}
              style={{
                padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 40px)',
                background: hover && !isMobile ? COLORS.white : COLORS.gradientMain,
                color: hover && !isMobile ? COLORS.primary : COLORS.white,
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 10px 40px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover && !isMobile ? 'scale(1.05)' : 'scale(1)',
                width: isMobile ? '100%' : 'auto',
                maxWidth: '300px'
              }}
            >
              <Brain size={20} />
              <span>Commencer la Transformation</span>
            </Link>
            
            <Link to="/formations" style={{
              padding: 'clamp(14px, 3vw, 18px) clamp(24px, 5vw, 40px)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: COLORS.white,
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              width: isMobile ? '100%' : 'auto',
              maxWidth: '300px'
            }}>
              <BookOpen size={20} />
              <span>Voir nos Programmes</span>
            </Link>
          </div>
          
          <div style={{
            marginTop: 'clamp(2rem, 4vw, 3rem)',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <Clock size={14} />
            <span>Premier cabinet tunisien spécialisé en neurosciences appliquées • Leader depuis 2020</span>
          </div>
        </FadeInSection>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  )
}

// ==================== COMPOSANT PRINCIPAL ====================
const Home = () => {
  return (
    <div style={{
      background: COLORS.white,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      width: '100%',
      overflowX: 'hidden',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Cerveaux flottants sur toute la page */}
      <FloatingBrains />
      
      <HeroSection />
      <MissionSection />
      <ApproachSection />
      <ServicesSection />
      <ValuesSection />
      <TeamSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}

export default Home