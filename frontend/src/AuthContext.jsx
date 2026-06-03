import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      console.log('🔍 Vérification de l\'authentification...');
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!token || !savedUser) {
        console.log('❌ Pas de token ou utilisateur enregistré');
        setLoading(false);
        return;
      }
      
      console.log('✅ Token trouvé');
      
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        console.log('✅ Utilisateur restauré:', user.name);
      } catch (e) {
        console.error('Erreur parsing user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
    } catch (error) {
      console.error('🔥 Erreur vérification auth:', error);
    } finally {
      setLoading(false);
      console.log('✅ Initialisation terminée');
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔑 Tentative de connexion pour:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('📡 Réponse serveur:', response.status);
      
      const data = await response.json();
      console.log('📊 Données reçues:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }
      
      if (data.success) {
        console.log('✅ Connexion réussie!');
        
        // Stocker le token et l'utilisateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        console.log('👤 Utilisateur stocké:', data.user);
        
        return { 
          success: true, 
          user: data.user,
          token: data.token 
        };
      } else {
        throw new Error(data.message || 'Échec de la connexion');
      }
      
    } catch (error) {
      console.error('🔥 Erreur login:', error.message);
      setError(error.message);
      
      return { 
        success: false, 
        message: error.message || 'Erreur de connexion' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      console.log('📝 Tentative d\'inscription:', userData.email);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('📊 Réponse register:', data);
      
      if (data.success && data.token) {
        // Sauvegarder le token et l'utilisateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        console.log('✅ Inscription réussie:', data.user.name);
        
        return { 
          success: true, 
          user: data.user,
          token: data.token 
        };
      } else {
        setError(data.message || 'Erreur d\'inscription');
        return { 
          success: false, 
          message: data.message || 'Erreur d\'inscription' 
        };
      }
    } catch (error) {
      console.error('🔥 Erreur register:', error);
      setError('Erreur lors de l\'inscription');
      return { 
        success: false, 
        message: 'Erreur lors de l\'inscription' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Déconnexion');
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
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;