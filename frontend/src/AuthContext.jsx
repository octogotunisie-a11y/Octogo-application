import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// URLs RELATIVES : passent par le proxy Vite (/api -> http://localhost:5000).
// Évite le piège CORS/origine (localhost vs 127.0.0.1) qui faisait échouer le login.
const API = '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vérifie l'authentification au démarrage ET valide le token côté serveur.
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (!token || !savedUser) {
        setLoading(false);
        return;
      }

      // Affichage optimiste immédiat (évite un écran vide).
      try { setUser(JSON.parse(savedUser)); } catch { /* ignoré */ }

      // Validation réelle : le token est-il toujours valide ?
      try {
        const resp = await fetch(`${API}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          const fresh = data.user || data; // tolère plusieurs formes de réponse
          if (fresh && fresh.email) {
            setUser(fresh);
            localStorage.setItem('user', JSON.stringify(fresh));
          }
        } else if (resp.status === 401 || resp.status === 403) {
          // Token expiré ou invalide -> session nettoyée.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        // Autres statuts (500, réseau) : on garde l'affichage optimiste.
      } catch (e) {
        // Serveur injoignable : on conserve la session locale (mode dégradé).
        console.warn('Validation token impossible (serveur ?):', e.message);
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Identifiants incorrects');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message || 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || 'Erreur d\'inscription');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message || 'Erreur lors de l\'inscription' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
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