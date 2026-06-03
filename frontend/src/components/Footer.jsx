import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setTimeout(() => {
        setSubscribed(false)
        setEmail('')
      }, 3000)
    }
  }

  const footerLinks = {
    navigation: [
      { to: '/', label: 'Accueil', icon: 'bi-house' },
      { to: '/formations', label: 'Formations', icon: 'bi-journal-text' },
      { to: '/parcours', label: 'Parcours', icon: 'bi-graph-up-arrow' },
      { to: '/team-building', label: 'Team Building', icon: 'bi-people' },
      { to: '/articles', label: 'Articles', icon: 'bi bi-book' },
      { to: '/clients', label: 'Clients', icon: 'bi-people' },
      { to: '/contact', label: 'Contact', icon: 'bi-envelope' }
    ],
    services: [
      { label: 'NeuroLeadership', icon: 'bi-graph-up' },
      { label: 'Neuroselling & Marketing', icon: 'bi-cart' },
      { label: 'NeuroLearning', icon: 'bi-book' },
      { label: 'NeuroRésilience', icon: 'bi-heart' },
      { label: 'Coaching individuel', icon: 'bi-person' }
    ],
    contact: [
      { href: 'tel:+21628262829', label: '+216 28 26 28 29', icon: 'bi-telephone' },
      { href: 'mailto:contact@octogo.tn', label: 'contact@octogo.tn', icon: 'bi-envelope' },
      { href: 'https://www.octogo.tn', label: 'www.octogo.tn', icon: 'bi-globe', external: true }
    ]
  }

  const socialLinks = [
    { icon: 'bi-facebook', label: 'Facebook', color: '#4267B2', url: 'https://www.facebook.com/octogo.tn' },
    { icon: 'bi-linkedin', label: 'LinkedIn', color: '#0077B5', url: 'https://www.linkedin.com/company/octogo-conseil-et-formation/' },
    { icon: 'bi-instagram', label: 'Instagram', color: '#E4405F', url: 'https://www.instagram.com/octogo.tn/' },
  ]

  const styles = {
    footer: {
      background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
      color: 'white',
      paddingTop: isMobile ? '3rem' : '4rem',
      paddingBottom: isMobile ? '1.5rem' : '0',
      position: 'relative',
      width: '100%',
      overflow: 'hidden'
    },
    container: {
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: isMobile ? '0 16px' : '0 24px',
      position: 'relative',
      zIndex: 1
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
      gap: isMobile ? '2.5rem' : '3rem',
      marginBottom: isMobile ? '2.5rem' : '3rem'
    },
    column: {
      padding: isMobile ? '0' : '0 0.5rem'
    },
    logoContainer: {
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: isMobile ? 'center' : 'flex-start'
    },
    logoLink: {
      display: 'inline-block'
    },
    logoImage: {
      height: isMobile ? '70px' : '90px',
      width: 'auto',
      objectFit: 'contain',
      filter: 'brightness(0) invert(1)',
      transition: 'transform 0.3s ease'
    },
    description: {
      color: 'rgba(255,255,255,0.7)',
      lineHeight: '1.6',
      fontSize: isMobile ? '0.95rem' : '1.05rem',
      marginBottom: '2rem',
      textAlign: isMobile ? 'center' : 'left'
    },
    newsletter: {
      marginBottom: isMobile ? '2.5rem' : '0'
    },
    newsletterTitle: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: isMobile ? '1rem' : '1.1rem',
      marginBottom: '1.2rem',
      fontWeight: '500',
      textAlign: isMobile ? 'center' : 'left'
    },
    inputContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '1rem'
    },
    input: {
      flex: 1,
      padding: '14px 18px',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '1rem',
      minHeight: '48px',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    subscribeButton: {
      padding: isMobile ? '14px 24px' : '14px 28px',
      background: subscribed ? '#10B981' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      minHeight: '48px',
      minWidth: '48px',
      whiteSpace: 'nowrap',
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: isMobile ? '1.1rem' : '1.25rem',
      fontWeight: '600',
      marginBottom: '1.5rem',
      color: 'white',
      position: 'relative',
      display: 'inline-block',
      paddingBottom: '10px'
    },
    titleUnderline: {
      position: 'absolute',
      bottom: '0',
      left: 0,
      width: '40px',
      height: '3px',
      background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
      borderRadius: '2px'
    },
    linkList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    linkItem: {
      marginBottom: isMobile ? '0.75rem' : '1rem'
    },
    link: {
      color: 'rgba(255,255,255,0.7)',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: isMobile ? '0.95rem' : '1.05rem',
      padding: '8px 0',
      transition: 'all 0.2s ease'
    },
    icon: {
      fontSize: '1rem',
      color: 'rgba(139, 92, 246, 0.7)',
      minWidth: '24px'
    },
    schedule: {
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    },
    scheduleText: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    socialContainer: {
      marginTop: '2rem'
    },
    socialTitle: {
      fontSize: isMobile ? '1rem' : '1.1rem',
      fontWeight: '600',
      marginBottom: '1.2rem',
      color: 'white'
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'center' : 'flex-start'
    },
    socialButton: {
      width: '48px',
      height: '48px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textDecoration: 'none',
      minWidth: '48px',
      minHeight: '48px',
      transition: 'all 0.3s ease',
      fontSize: '1.3rem'
    },
    bottom: {
      padding: isMobile ? '2rem 0' : '2.5rem 0',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'center' : 'center',
      gap: '1.5rem',
      textAlign: isMobile ? 'center' : 'left'
    },
    copyright: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: isMobile ? '0.9rem' : '1rem',
      margin: 0,
      lineHeight: '1.5'
    },
    bottomLinks: {
      display: 'flex',
      gap: isMobile ? '1.5rem' : '2.5rem',
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'center' : 'flex-start'
    },
    bottomLink: {
      color: 'rgba(255,255,255,0.5)',
      textDecoration: 'none',
      fontSize: isMobile ? '0.9rem' : '1rem',
      transition: 'color 0.2s ease'
    },
    backToTop: {
      position: 'fixed',
      bottom: isMobile ? '1.5rem' : '2.5rem',
      right: isMobile ? '1.5rem' : '2.5rem',
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.4rem',
      zIndex: 1000,
      opacity: 0.8,
      boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
      minWidth: '50px',
      minHeight: '50px',
      transition: 'all 0.3s ease'
    }
  }

  return (
    <footer style={styles.footer}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        opacity: 0.6
      }}></div>

      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Colonne Logo et Description - Logo seul, plus grand */}
          <div style={styles.column}>
            <div style={styles.logoContainer}>
              <Link to="/" style={styles.logoLink}>
                <img 
                  src="/src/images/1.png" 
                  alt="OCTOGO Logo" 
                  style={styles.logoImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.style.cssText = `
                      height: ${isMobile ? '70px' : '90px'};
                      width: ${isMobile ? '70px' : '90px'};
                      background: linear-gradient(135deg, #8B5CF6, #EC4899);
                      border-radius: 15px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                      font-size: ${isMobile ? '28px' : '36px'};
                    `;
                    fallback.textContent = 'O';
                    e.target.parentElement.appendChild(fallback);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                />
              </Link>
            </div>
            
            <p style={styles.description}>
              Premier cabinet tunisien spécialisé en neurosciences appliquées à l'éducation, 
              la formation et le travail. Libérez le potentiel humain avec la science du cerveau.
            </p>
            
            {/* Newsletter */}
            <div style={styles.newsletter}>
              <p style={styles.newsletterTitle}>
                Restez informé de nos dernières formations
              </p>
              <form onSubmit={handleSubscribe}>
                <div style={styles.inputContainer}>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre email"
                    required
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.15)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                  />
                  <button 
                    type="submit"
                    disabled={subscribed}
                    style={styles.subscribeButton}
                    onMouseEnter={(e) => {
                      if (!subscribed) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!subscribed) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {subscribed ? (
                      <>
                        <i className="bi bi-check-lg"></i>
                        Merci!
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send"></i>
                        S'abonner
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Colonne Navigation */}
          <div style={styles.column}>
            <h4 style={styles.title}>
              Navigation
              <span style={styles.titleUnderline}></span>
            </h4>
            <ul style={styles.linkList}>
              {footerLinks.navigation.map((link, index) => (
                <li key={index} style={styles.linkItem}>
                  <Link 
                    to={link.to}
                    style={styles.link}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className={`bi ${link.icon}`} style={styles.icon}></i>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne Services */}
          <div style={styles.column}>
            <h4 style={styles.title}>
              Services
              <span style={styles.titleUnderline}></span>
            </h4>
            <ul style={styles.linkList}>
              {footerLinks.services.map((service, index) => (
                <li key={index} style={styles.linkItem}>
                  <a 
                    href="#"
                    style={styles.link}
                    onClick={(e) => e.preventDefault()}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <i className={`bi ${service.icon}`} style={styles.icon}></i>
                    <span>{service.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne Contact et Réseaux sociaux */}
          <div style={styles.column}>
            <h4 style={styles.title}>
              Contact
              <span style={styles.titleUnderline}></span>
            </h4>
            <ul style={styles.linkList}>
              {footerLinks.contact.map((contact, index) => (
                <li key={index} style={styles.linkItem}>
                  <a 
                    href={contact.href}
                    target={contact.external ? '_blank' : '_self'}
                    rel={contact.external ? 'noopener noreferrer' : ''}
                    style={styles.link}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#8B5CF6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                    }}
                  >
                    <i className={`bi ${contact.icon}`} style={styles.icon}></i>
                    <span>{contact.label}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Horaires */}
            <div style={styles.schedule}>
              <p style={styles.scheduleText}>
                <i className="bi bi-clock" style={{fontSize: '1.1rem'}}></i>
                Lun - Ven: 9h - 16h
              </p>
            </div>

            {/* Réseaux sociaux - CORRIGÉ ICI */}
            <div style={styles.socialContainer}>
              <h4 style={styles.socialTitle}>
                Suivez-nous
              </h4>
              <div style={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url}  
                    aria-label={social.label}
                    style={styles.socialButton}
                    target="_blank"    
                    rel="noopener noreferrer"  
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = social.color;
                      e.currentTarget.style.transform = 'translateY(-5px) rotate(5deg)';
                      e.currentTarget.style.boxShadow = `0 10px 25px ${social.color}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0) rotate(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <i className={`bi ${social.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={styles.bottom}>
          <div>
            <p style={styles.copyright}>
              &copy; {currentYear} OCTOGO Formation & Conseil. Tous droits réservés.
            </p>
          </div>
          
          <div style={styles.bottomLinks}>
            {['Confidentialité', 'Conditions', 'Cookies', 'Plan du site'].map((link, index) => (
              <a 
                key={index}
                href="#"
                style={styles.bottomLink}
                onClick={(e) => e.preventDefault()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bouton retour en haut */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={styles.backToTop}
        aria-label="Retour en haut"
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'scale(1) rotate(0)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
        }}
      >
        <i className="bi bi-arrow-up"></i>
      </button>
    </footer>
  )
}

export default Footer