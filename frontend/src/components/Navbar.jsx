import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import {
  Menu, X, User, LogOut, Home, BookOpen, Users, FileText, Mail, Target, Sparkles, ChevronDown
} from 'lucide-react'

const COLORS = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  dark: '#1F2937',
  text: '#374151',
  muted: '#6B7280',
  light: '#F9FAFB',
  border: '#E5E7EB',
}

// Liens de navigation. `highlight` = mis en avant comme bouton d'action.
const NAV_ITEMS = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/formations', label: 'Formations', icon: BookOpen },
  { path: '/parcours', label: 'Parcours', icon: Target },
  { path: '/team-building', label: 'Team Building', icon: Users },
  { path: '/coaching', label: 'Coaching', icon: Users },
  { path: '/articles', label: 'Articles', icon: FileText },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/contact', label: 'Contact', icon: Mail },
  { path: '/generation-programme', label: 'Génération de Programme', shortLabel: 'Générateur', icon: Sparkles, highlight: true },
]

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Deux paliers : mobile (<992, menu burger) et compact (<1200, labels courts).
  const isMobile = width < 992
  const isCompact = width < 1200

  const closeMenu = () => { setIsMenuOpen(false); setUserMenuOpen(false) }
  // Déconnexion : on vide la session PUIS on recharge complètement l'app
  // (window.location) pour repartir d'un état propre — évite tout état résiduel
  // qui empêchait le dashboard de se rouvrir après une reconnexion.
  const handleLogout = () => { logout(); window.location.href = '/'; }
  const getInitials = (name) => {
    if (!name) return 'US'
    return name.split(' ').map((p) => p[0]).join('').toUpperCase().substring(0, 2)
  }

  // ---- styles cohérents ----
  const S = {
    nav: {
      position: 'fixed', top: 0, left: 0, width: '100%', height: 70, background: '#fff',
      borderBottom: `1px solid ${COLORS.border}`, zIndex: 1000, boxShadow: '0 1px 12px rgba(17,24,39,0.06)',
    },
    container: {
      height: '100%', maxWidth: 1400, margin: '0 auto', padding: isMobile ? '0 16px' : '0 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    },
    logo: { display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 },
    logoImg: { height: isMobile ? 42 : 50, width: 'auto', objectFit: 'contain', display: 'block' },
    desktopNav: {
      display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center',
      flexWrap: 'nowrap', overflow: 'visible',
    },
    link: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: isCompact ? '8px 10px' : '8px 13px',
      fontSize: isCompact ? 13.5 : 14.5, fontWeight: 500, lineHeight: 1, color: COLORS.text,
      textDecoration: 'none', borderRadius: 8, whiteSpace: 'nowrap', transition: 'color .18s, background .18s',
    },
    cta: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: isCompact ? '8px 12px' : '9px 16px',
      fontSize: isCompact ? 13.5 : 14.5, fontWeight: 600, lineHeight: 1, color: '#fff',
      textDecoration: 'none', borderRadius: 9, whiteSpace: 'nowrap',
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
      boxShadow: '0 4px 12px rgba(124,58,237,0.25)', marginLeft: 4,
    },
    right: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
    btnOutline: {
      padding: '9px 16px', background: 'transparent', border: `1px solid ${COLORS.primary}`, color: COLORS.primary,
      borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    },
    btnSolid: {
      padding: '9px 16px', background: COLORS.primary, border: 'none', color: '#fff',
      borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    },
    avatar: {
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14,
    },
    burger: {
      background: 'transparent', border: 'none', padding: 8, borderRadius: 8, color: COLORS.primary,
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44,
    },
    // dropdown utilisateur (desktop)
    userWrap: { position: 'relative' },
    userBtn: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', borderRadius: 999,
      border: `1px solid ${COLORS.border}`, background: '#fff', cursor: 'pointer',
    },
    userDropdown: {
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 220, background: '#fff',
      border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: '0 12px 30px rgba(17,24,39,0.12)',
      padding: 8, zIndex: 1100,
    },
    dropItem: {
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
      textDecoration: 'none', color: COLORS.text, fontSize: 14, fontWeight: 500, cursor: 'pointer',
      width: '100%', border: 'none', background: 'transparent', textAlign: 'left',
    },
    // menu mobile
    mobilePanel: {
      position: 'fixed', top: 70, left: 0, right: 0, background: '#fff', zIndex: 999,
      boxShadow: '0 12px 30px rgba(17,24,39,0.12)', maxHeight: 'calc(100vh - 70px)', overflowY: 'auto',
      padding: '10px 0 24px', borderTop: `1px solid ${COLORS.border}`,
    },
    mobileItem: {
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', textDecoration: 'none',
      color: COLORS.text, fontSize: 15.5, fontWeight: 500,
    },
  }

  const linkStyle = ({ isActive }) => ({
    ...S.link,
    color: isActive ? COLORS.primary : COLORS.text,
    background: isActive ? `${COLORS.primary}0F` : 'transparent',
  })

  const renderLogo = () => (
    <NavLink to="/" style={S.logo} onClick={closeMenu} aria-label="OCTOGO — Accueil">
      <img
        src="/src/images/1.png" alt="OCTOGO" style={S.logoImg}
        onError={(e) => {
          e.target.onerror = null
          e.target.style.display = 'none'
          const f = document.createElement('div')
          f.style.cssText = `height:${isMobile ? 42 : 50}px;width:${isMobile ? 42 : 50}px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:${isMobile ? 20 : 24}px;background:linear-gradient(135deg,${COLORS.primary},${COLORS.secondary});`
          f.textContent = 'O'
          e.target.parentElement.appendChild(f)
        }}
      />
    </NavLink>
  )

  return (
    <>
      <nav style={S.nav}>
        <div style={S.container}>
          {renderLogo()}

          {/* ---------- NAVIGATION DESKTOP ---------- */}
          {!isMobile && (
            <div style={S.desktopNav}>
              {NAV_ITEMS.filter((i) => !i.highlight).map((item) => {
                const Icone = item.icon
                return (
                  <NavLink key={item.path} to={item.path} style={linkStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${COLORS.primary}0A` }}
                    onMouseLeave={(e) => {
                      const active = e.currentTarget.getAttribute('aria-current') === 'page'
                      e.currentTarget.style.background = active ? `${COLORS.primary}0F` : 'transparent'
                    }}>
                    {!isCompact && <Icone size={16} />}
                    {item.label}
                  </NavLink>
                )
              })}
              {/* Outil phare mis en avant */}
              {NAV_ITEMS.filter((i) => i.highlight).map((item) => {
                const Icone = item.icon
                return (
                  <NavLink key={item.path} to={item.path} style={S.cta}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(124,58,237,0.35)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.25)' }}>
                    <Icone size={16} />
                    {isCompact ? (item.shortLabel || item.label) : item.label}
                  </NavLink>
                )
              })}
            </div>
          )}

          {/* ---------- ZONE DROITE ---------- */}
          <div style={S.right}>
            {isAuthenticated ? (
              !isMobile ? (
                <div style={S.userWrap}>
                  <button style={S.userBtn} onClick={() => setUserMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={userMenuOpen}>
                    <div style={S.avatar}>{getInitials((user||{}).name)}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.dark, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {((user||{}).name||'').split(' ')[0]}
                    </span>
                    <ChevronDown size={16} color={COLORS.muted} />
                  </button>
                  {userMenuOpen && (
                    <div style={S.userDropdown} role="menu">
                      <div style={{ padding: '8px 12px 10px', borderBottom: `1px solid ${COLORS.border}`, marginBottom: 6 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark }}>{(user||{}).name}</div>
                        <div style={{ fontSize: 12.5, color: COLORS.muted, overflow: 'hidden', textOverflow: 'ellipsis' }}>{(user||{}).email}</div>
                      </div>
                      <NavLink to="/dashboard" style={S.dropItem} onClick={closeMenu}
                        onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.light }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                        <User size={18} /> Mon Dashboard
                      </NavLink>
                      <button style={{ ...S.dropItem, color: '#DC2626' }} onClick={handleLogout}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                        <LogOut size={18} /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button style={S.burger} onClick={() => setIsMenuOpen((v) => !v)} aria-label="Menu">
                  {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
              )
            ) : (
              !isMobile ? (
                <>
                  <NavLink to="/login" style={S.btnOutline}
                    onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.primary; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.primary }}>
                    Connexion
                  </NavLink>
                  <NavLink to="/register" style={S.btnSolid}
                    onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.secondary }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.primary }}>
                    Inscription
                  </NavLink>
                </>
              ) : (
                <button style={S.burger} onClick={() => setIsMenuOpen((v) => !v)} aria-label="Menu">
                  {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
              )
            )}
          </div>
        </div>

        {/* ---------- MENU MOBILE ---------- */}
        {isMobile && isMenuOpen && (
          <div style={S.mobilePanel}>
            {NAV_ITEMS.map((item) => {
              const Icone = item.icon
              return (
                <NavLink key={item.path} to={item.path} onClick={closeMenu}
                  style={({ isActive }) => ({
                    ...S.mobileItem,
                    color: item.highlight ? COLORS.primary : isActive ? COLORS.primary : COLORS.text,
                    background: isActive ? `${COLORS.primary}0F` : 'transparent',
                    fontWeight: item.highlight ? 700 : 500,
                  })}>
                  <Icone size={20} color={COLORS.primary} />
                  {item.label}
                </NavLink>
              )
            })}

            <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 8, padding: '16px 20px 0' }}>
              {isAuthenticated ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: COLORS.light, borderRadius: 12, marginBottom: 12 }}>
                    <div style={S.avatar}>{getInitials((user||{}).name)}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, color: COLORS.dark, fontSize: 15 }}>{(user||{}).name}</div>
                      <div style={{ fontSize: 13, color: COLORS.muted, overflow: 'hidden', textOverflow: 'ellipsis' }}>{(user||{}).email}</div>
                    </div>
                  </div>
                  <NavLink to="/dashboard" style={{ ...S.btnSolid, display: 'block', textAlign: 'center', marginBottom: 10 }} onClick={closeMenu}>
                    Mon Dashboard
                  </NavLink>
                  <button onClick={handleLogout} style={{ ...S.btnOutline, width: '100%', border: '1px solid #EF4444', color: '#DC2626' }}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <NavLink to="/login" style={{ ...S.btnOutline, textAlign: 'center' }} onClick={closeMenu}>Connexion</NavLink>
                  <NavLink to="/register" style={{ ...S.btnSolid, textAlign: 'center' }} onClick={closeMenu}>Inscription</NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer pour compenser la navbar fixe */}
      <div style={{ height: 70, width: '100%' }} />
    </>
  )
}

export default Navbar