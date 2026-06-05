// Login.jsx - VERSION SIMPLIFIÉE ET CORRIGÉE
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, error: authError, clearError } = useAuth();

  const colors = {
    primary: '#8B5CF6',
    secondary: '#EC4899',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
  };

  // Effacer les erreurs précédentes
  useEffect(() => {
    clearError();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }
    
    return newErrors;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  setLoading(true);
  setErrors({});
  clearError();
  
  try {
    console.log('🔑 Tentative de connexion...');
    
    // Appeler la fonction login du AuthContext
    const result = await login(formData.email, formData.password);
    
    console.log('Résultat login:', result);
    
    if (result.success) {
      // Rechargement complet pour repartir d'un état propre à chaque connexion.
      if (result.user.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      setErrors({ 
        submit: result.message || 'Email ou mot de passe incorrect' 
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    setErrors({ 
      submit: 'Erreur de connexion au serveur' 
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      minHeight: '100vh',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      marginTop: '80px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '3.5rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(124, 58, 237, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: colors.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            transform: 'rotate(-5deg)'
          }}>
            <i className="bi bi-cpu" style={{ 
              color: 'white', 
              fontSize: '2.5rem',
              transform: 'rotate(5deg)'
            }}></i>
          </div>
          
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            marginBottom: '0.5rem',
            color: '#1F2937',
            lineHeight: 1.2
          }}>
            Connexion
          </h1>
          <p style={{ 
            color: '#6B7280', 
            fontSize: '1.1rem',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            Accédez à votre espace client Octogo
          </p>
        </div>
        
        {/* Affichage des erreurs */}
        {(errors.submit || authError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.2rem' }}></i>
            <span style={{ fontWeight: '500' }}>{errors.submit || authError}</span>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Champ Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              color: '#374151', 
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              <i className="bi bi-envelope" style={{ 
                marginRight: '8px', 
                color: colors.primary 
              }}></i>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: '#F9FAFB',
                border: `2px solid ${errors.email ? '#DC2626' : '#E5E7EB'}`,
                borderRadius: '12px',
                color: '#1F2937',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
            {errors.email && (
              <div style={{ 
                color: '#DC2626', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="bi bi-exclamation-circle"></i>
                {errors.email}
              </div>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              color: '#374151', 
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              <i className="bi bi-lock" style={{ 
                marginRight: '8px', 
                color: colors.primary 
              }}></i>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem 1rem 1.5rem',
                  background: '#F9FAFB',
                  border: `2px solid ${errors.password ? '#DC2626' : '#E5E7EB'}`,
                  borderRadius: '12px',
                  color: '#1F2937',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  paddingRight: '3.5rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <div style={{ 
                color: '#DC2626', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="bi bi-exclamation-circle"></i>
                {errors.password}
              </div>
            )}
          </div>

          {/* Bouton de connexion */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '1.2rem',
              background: colors.gradient,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: loading ? 0.8 : 1,
              transition: 'all 0.3s ease',
              marginBottom: '2rem'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Connexion en cours...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                Se connecter
              </>
            )}
          </motion.button>

          {/* Lien vers inscription */}
          <div style={{ 
            textAlign: 'center', 
            paddingTop: '2rem',
            borderTop: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            <p style={{ 
              color: '#6B7280', 
              marginBottom: '1.5rem',
              fontSize: '1rem'
            }}>
              Pas encore de compte ?
            </p>
            <Link 
              to="/register" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                background: 'white',
                color: colors.primary,
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                border: `2px solid ${colors.primary}20`,
                transition: 'all 0.3s ease'
              }}
            >
              <i className="bi bi-person-plus"></i>
              Créer un compte
            </Link>
          </div>
        </form>
      </motion.div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          background: white !important;
          box-shadow: 0 0 0 3px ${colors.primary}15 !important;
          border-color: ${colors.primary} !important;
        }
        
        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Login;