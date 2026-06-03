import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { Menu, X, User, LogOut, Home, BookOpen, Users, FileText, Mail, Target } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Menu items avec icônes
  const navItems = [
    { path: '/', label: 'Accueil', icon: <Home size={20} /> },
    { path: '/formations', label: 'Formations', icon: <BookOpen size={20} /> },
    { path: '/parcours', label: 'Parcours', icon: <Target size={20} /> },
    { path: '/team-building', label: 'Team Building', icon: <Users size={20} /> },
    { path: '/coaching', label: 'Coaching', icon: <Users size={20} /> },
    { path: '/articles', label: 'Articles', icon: <FileText size={20} /> },
    { path: '/clients', label: 'Clients', icon: <Users size={20} /> },
    { path: '/contact', label: 'Contact', icon: <Mail size={20} /> }
  ]

  const colors = {
    primary: '#7C3AED',
    secondary: '#EC4899',
    dark: '#1F2937',
    light: '#F9FAFB',
    border: '#E5E7EB'
  }

  // Styles simples
  const styles = {
    nav: {
      position: 'fixed',
      top: 0,
      width: '100%',
      height: '70px',
      background: '#FFFFFF',
      borderBottom: `1px solid ${colors.border}`,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    container: {
      width: '100%',
      height: '100%',
      padding: isMobile ? '0 16px' : '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      height: '100%'
    },
    logoImage: {
      height: isMobile ? '45px' : '55px',
      width: 'auto',
      objectFit: 'contain',
      transition: 'transform 0.3s ease'
    },
    // Menu desktop simple
    desktopMenu: {
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      marginLeft: '40px'
    },
    desktopLink: {
      padding: '10px 18px',
      textDecoration: 'none',
      color: colors.dark,
      fontSize: '15px',
      fontWeight: '500',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    // Menu mobile
    mobileMenuButton: {
      background: 'transparent',
      border: 'none',
      padding: '10px',
      borderRadius: '8px',
      color: colors.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      minWidth: '44px',
      minHeight: '44px'
    },
    mobileMenu: {
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      background: '#FFFFFF',
      zIndex: 999,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      maxHeight: 'calc(100vh - 70px)',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: '20px'
    },
    mobileMenuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 24px',
      textDecoration: 'none',
      color: colors.dark,
      fontSize: '16px',
      fontWeight: '500',
      borderBottom: `1px solid ${colors.border}`,
      transition: 'all 0.2s ease',
      minHeight: '44px'
    },
    mobileMenuIcon: {
      width: '24px',
      color: colors.primary
    },
    // Boutons d'authentification
    authButtons: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    loginButton: {
      padding: '10px 20px',
      background: 'transparent',
      border: `1px solid ${colors.primary}`,
      color: colors.primary,
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '44px',
      minHeight: '44px',
      transition: 'all 0.3s ease'
    },
    registerButton: {
      padding: '10px 20px',
      background: colors.primary,
      border: 'none',
      color: 'white',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '44px',
      minHeight: '44px',
      transition: 'all 0.3s ease'
    },
    // User menu
    userMenu: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    userAvatar: {
      width: '38px',
      height: '38px',
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '15px'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: colors.dark
    },
    dashboardButton: {
      padding: '10px 20px',
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      color: 'white',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: 'none',
      cursor: 'pointer',
      minWidth: '44px',
      minHeight: '44px',
      transition: 'all 0.3s ease'
    },
    logoutButton: {
      padding: '10px 20px',
      background: 'transparent',
      border: `1px solid #EF4444`,
      color: '#EF4444',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      minWidth: '44px',
      minHeight: '44px',
      transition: 'all 0.3s ease'
    },
    // User menu mobile
    userMobileMenu: {
      padding: '24px',
      borderTop: `1px solid ${colors.border}`
    },
    userMobileItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 18px',
      background: colors.light,
      borderRadius: '8px',
      marginBottom: '10px',
      textDecoration: 'none',
      color: colors.dark,
      fontSize: '16px',
      minHeight: '44px'
    },
    activeIndicator: {
      position: 'absolute',
      bottom: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: colors.primary,
      opacity: 0
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const getInitials = (name) => {
    if (!name) return 'US'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.container}>
          {/* Logo - Image seule, plus grande */}
          <NavLink to="/" style={styles.logo} onClick={closeMenu}>
            <img 
              src="/src/images/1.png" 
              alt="OCTOGO Logo" 
              style={styles.logoImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.style.cssText = `
                  height: ${isMobile ? '45px' : '55px'};
                  width: ${isMobile ? '45px' : '55px'};
                  background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: ${isMobile ? '20px' : '24px'};
                `;
                fallback.textContent = 'O';
                e.target.parentElement.appendChild(fallback);
              }}
            />
          </NavLink>

          {/* Desktop Menu */}
          {!isMobile && (
            <div style={styles.desktopMenu}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    ...styles.desktopLink,
                    color: isActive ? colors.primary : colors.dark,
                    background: isActive ? `${colors.primary}10` : 'transparent'
                  })}
                  className={({ isActive }) => isActive ? 'active-nav-item' : ''}
                >
                  {item.label}
                  {({ isActive }) => isActive && (
                    <div style={{...styles.activeIndicator, opacity: 1}}></div>
                  )}
                </NavLink>
              ))}
            </div>
          )}

          {/* Right side - Auth buttons or User menu */}
          <div style={styles.authButtons}>
            {isAuthenticated ? (
              <div style={styles.userMenu}>
                {!isMobile && (
                  <>
                    <div style={styles.userAvatar}>
                      {getInitials(user?.name)}
                    </div>
                    <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
                    <NavLink to="/dashboard">
                      <button 
                        style={styles.dashboardButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <User size={16} />
                        Dashboard
                      </button>
                    </NavLink>
                    <button 
                      onClick={handleLogout} 
                      style={styles.logoutButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEF2F2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <LogOut size={16} />
                      Déconnexion
                    </button>
                  </>
                )}
                
                {/* Mobile menu button for authenticated users */}
                {isMobile && (
                  <button 
                    style={styles.mobileMenuButton}
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  >
                    {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                  </button>
                )}
              </div>
            ) : (
              <>
                {!isMobile ? (
                  <>
                    <NavLink 
                      to="/login" 
                      style={styles.loginButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.primary;
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = colors.primary;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Connexion
                    </NavLink>
                    <NavLink 
                      to="/register" 
                      style={styles.registerButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.secondary;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.primary;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      Inscription
                    </NavLink>
                  </>
                ) : (
                  <button 
                    style={styles.mobileMenuButton}
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  >
                    {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobile && isMenuOpen && (
          <div style={styles.mobileMenu}>
            {/* Navigation links */}
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.mobileMenuItem,
                  background: isActive ? `${colors.primary}10` : 'transparent',
                  color: isActive ? colors.primary : colors.dark
                })}
                onClick={closeMenu}
              >
                <div style={styles.mobileMenuIcon}>
                  {item.icon}
                </div>
                {item.label}
              </NavLink>
            ))}

            {/* Authentication section in mobile menu */}
            {isAuthenticated ? (
              <div style={styles.userMobileMenu}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '16px',
                  background: colors.light,
                  borderRadius: '12px'
                }}>
                  <div style={styles.userAvatar}>
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: colors.dark, fontSize: '16px' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>

                <NavLink 
                  to="/dashboard" 
                  style={styles.userMobileItem}
                  onClick={closeMenu}
                >
                  <User size={22} />
                  Mon Dashboard
                </NavLink>

                <button 
                  onClick={handleLogout}
                  style={{
                    ...styles.userMobileItem,
                    background: '#FEF2F2',
                    color: '#DC2626',
                    border: 'none',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={22} />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div style={{
                padding: '24px',
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <NavLink 
                  to="/login" 
                  style={styles.loginButton}
                  onClick={closeMenu}
                >
                  Connexion
                </NavLink>
                <NavLink 
                  to="/register" 
                  style={styles.registerButton}
                  onClick={closeMenu}
                >
                  Inscription
                </NavLink>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Espace pour éviter que le contenu ne soit caché sous la navbar */}
      <div style={{
        height: '70px',
        width: '100%'
      }} />
    </>
  )
}

export default Navbar