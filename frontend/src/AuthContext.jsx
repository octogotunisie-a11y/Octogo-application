import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// URLs RELATIVES via le proxy Vite (/api -> http://localhost:5000).
// Évite tout problème CORS/origine (localhost vs 127.0.0.1, port 5174, etc.).
const API = '/api';
const TIMEOUT_MS = 12000;
const log = (...a) => console.log('%c[AUTH]', 'color:#7C3AED;font-weight:bold', ...a);

// fetch avec délai d'expiration : une requête qui ne répond pas n'immobilise plus l'app.
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(`${API}${path}`, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(timer);
  }
}

// Traduit une erreur technique en message clair pour l'utilisateur.
function messageErreur(e) {
  if (e.name === 'AbortError') return 'Le serveur met trop de temps à répondre. Réessayez.';
  if (e.message && /Failed to fetch|NetworkError|ERR_/.test(e.message)) {
    return 'Serveur injoignable. Vérifiez que le backend est démarré (npm run dev).';
  }
  return e.message || 'Une erreur est survenue.';
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Au démarrage : restaure la session ET valide le token côté serveur.
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!token || !savedUser) {
        log('Aucune session enregistrée.');
        setLoading(false);
        return;
      }

      try { setUser(JSON.parse(savedUser)); log('Session restaurée (optimiste).'); } catch (e) { /* ignoré */ }

      try {
        const resp = await apiFetch('/users/me', { headers: { Authorization: 'Bearer ' + token } });
        if (resp.ok) {
          const data = await resp.json();
          const fresh = data.user || data;
          if (fresh && fresh.email) {
            setUser(fresh);
            localStorage.setItem('user', JSON.stringify(fresh));
            log('Token valide, utilisateur rafraîchi:', fresh.email, '| rôle:', fresh.role);
          }
        } else if (resp.status === 401 || resp.status === 403) {
          log('Token expiré/invalide -> déconnexion.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          log('Validation token : statut', resp.status, '- session locale conservée.');
        }
      } catch (e) {
        console.warn('[AUTH] Validation token impossible:', e.message, '- session locale conservée.');
      }
    } catch (error) {
      console.error('[AUTH] Erreur checkAuth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    log('Connexion:', email);
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: (email || '').trim().toLowerCase(), password }),
      });

      let data = {};
      try { data = await response.json(); } catch (e) { /* réponse non-JSON */ }

      if (!response.ok || !data.success) {
        const msg = data.message || (response.status === 401 ? 'Email ou mot de passe incorrect.' : 'Erreur serveur (' + response.status + ').');
        log('Échec connexion:', msg);
        setError(msg);
        return { success: false, message: msg };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      log('Connexion réussie:', data.user.email, '| rôle:', data.user.role);
      return { success: true, user: data.user, token: data.token };
    } catch (e) {
      const msg = messageErreur(e);
      console.error('[AUTH] Erreur réseau login:', e.message);
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setError(null);
    setLoading(true);
    log('Inscription:', userData && userData.email);
    try {
      const payload = Object.assign({}, userData);
      if (payload.email) payload.email = payload.email.trim().toLowerCase();

      const response = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try { data = await response.json(); } catch (e) { /* réponse non-JSON */ }

      if (!response.ok || !data.success || !data.token) {
        const msg = data.message || ('Erreur d\'inscription (' + response.status + ').');
        log('Échec inscription:', msg);
        setError(msg);
        return { success: false, message: msg };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      log('Inscription réussie:', data.user.email);
      return { success: true, user: data.user, token: data.token };
    } catch (e) {
      const msg = messageErreur(e);
      console.error('[AUTH] Erreur réseau register:', e.message);
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    log('Déconnexion.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;