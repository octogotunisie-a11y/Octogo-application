// AuthContext.jsx - Version simplifiée sans vérification serveur
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
    const [loading, setLoading] = useState(false); // Mettre à false pour démarrer directement
    const [error, setError] = useState(null);

    // Vérifier l'authentification au démarrage - version simplifiée
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setUser(user);
                console.log('✅ Utilisateur restauré depuis localStorage:', user.name);
            } catch (error) {
                console.error('Erreur parsing user:', error);
            }
        }
        
        // Désactiver le loading immédiatement
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            console.log('🔐 Tentative de connexion:', email);
            
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success && data.token) {
                // Sauvegarder le token et l'utilisateur
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                
                console.log('✅ Connexion réussie:', data.user.name);
                return { 
                    success: true, 
                    user: data.user,
                    token: data.token 
                };
            } else {
                setError(data.message || 'Email ou mot de passe incorrect');
                return { 
                    success: false, 
                    message: data.message || 'Email ou mot de passe incorrect' 
                };
            }
        } catch (error) {
            console.error('🔥 Erreur login:', error);
            
            // En cas d'erreur réseau, simuler une connexion réussie avec les comptes de test
            if ((email === 'admin@octogo.com' && password === 'admin123') || 
                (email === 'client@test.com' && password === 'client123')) {
                
                const testUser = {
                    id: email === 'admin@octogo.com' ? 1 : 2,
                    name: email === 'admin@octogo.com' ? 'Administrateur' : 'Test Client',
                    email: email,
                    role: email === 'admin@octogo.com' ? 'admin' : 'client',
                    company: email === 'admin@octogo.com' ? 'Octogo' : 'Entreprise Test',
                    phone: email === 'admin@octogo.com' ? '+21628262829' : '+21612345678',
                    brainPoints: email === 'admin@octogo.com' ? 1000 : 100
                };
                
                const fakeToken = 'fake_token_' + Date.now();
                
                localStorage.setItem('token', fakeToken);
                localStorage.setItem('user', JSON.stringify(testUser));
                setUser(testUser);
                
                console.log('✅ Connexion simulée pour compte de test:', testUser.name);
                
                return { 
                    success: true, 
                    user: testUser,
                    token: fakeToken 
                };
            }
            
            setError('Erreur de connexion au serveur');
            return { 
                success: false, 
                message: 'Erreur de connexion au serveur' 
            };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            console.log('📝 Tentative d\'inscription:', userData.email);
            
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success && data.token) {
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
        }
    };

    const logout = () => {
        console.log('🚪 Déconnexion');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};