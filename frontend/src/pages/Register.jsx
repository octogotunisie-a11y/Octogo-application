// Register.jsx - VERSION COMPLÈTE CORRIGÉE
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const colors = {
    primary: '#8B5CF6',
    secondary: '#EC4899',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
    
    try {
      console.log('🔄 Tentative d\'inscription...');
      
      // Utiliser la fonction register du contexte
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company
      });
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur d\'inscription');
      }
      
      console.log('✅ Inscription réussie!');
      // La redirection est gérée dans AuthContext
      
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      setErrors({ submit: error.message });
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
          maxWidth: '520px',
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
            <i className="bi bi-person-plus" style={{ 
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
            Créer un compte
          </h1>
          <p style={{ 
            color: '#6B7280', 
            fontSize: '1.1rem',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            Rejoignez la communauté neurosciences
          </p>
        </div>
        
        {errors.submit && (
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
            <span style={{ fontWeight: '500' }}>{errors.submit}</span>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              color: '#374151', 
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              <i className="bi bi-person" style={{ 
                marginRight: '8px', 
                color: colors.primary 
              }}></i>
              Nom complet *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Votre nom complet"
              required
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: '#F9FAFB',
                border: `2px solid ${errors.name ? '#DC2626' : '#E5E7EB'}`,
                borderRadius: '12px',
                color: '#1F2937',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = errors.name ? '#DC2626' : '#E5E7EB'}
            />
            {errors.name && (
              <div style={{ 
                color: '#DC2626', 
                fontSize: '0.875rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="bi bi-exclamation-circle"></i>
                {errors.name}
              </div>
            )}
          </div>

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
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
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
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = errors.email ? '#DC2626' : '#E5E7EB'}
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

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
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
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: '#F9FAFB',
                  border: `2px solid ${errors.password ? '#DC2626' : '#E5E7EB'}`,
                  borderRadius: '12px',
                  color: '#1F2937',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primary}
                onBlur={(e) => e.target.style.borderColor = errors.password ? '#DC2626' : '#E5E7EB'}
              />
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

            <div>
              <label style={{ 
                display: 'block', 
                color: '#374151', 
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}>
                <i className="bi bi-lock-fill" style={{ 
                  marginRight: '8px', 
                  color: colors.primary 
                }}></i>
                Confirmation *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: '#F9FAFB',
                  border: `2px solid ${errors.confirmPassword ? '#DC2626' : '#E5E7EB'}`,
                  borderRadius: '12px',
                  color: '#1F2937',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primary}
                onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#DC2626' : '#E5E7EB'}
              />
              {errors.confirmPassword && (
                <div style={{ 
                  color: '#DC2626', 
                  fontSize: '0.875rem', 
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <i className="bi bi-exclamation-circle"></i>
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              color: '#374151', 
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              <i className="bi bi-phone" style={{ 
                marginRight: '8px', 
                color: colors.primary 
              }}></i>
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+33 1 23 45 67 89"
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: '#F9FAFB',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                color: '#1F2937',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              color: '#374151', 
              marginBottom: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              <i className="bi bi-building" style={{ 
                marginRight: '8px', 
                color: colors.primary 
              }}></i>
              Entreprise
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Nom de votre entreprise"
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                background: '#F9FAFB',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                color: '#1F2937',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
    <label style={{ 
        display: 'block', 
        color: '#374151', 
        marginBottom: '0.5rem',
        fontSize: '0.95rem',
        fontWeight: '600'
    }}>
        <i className="bi bi-building" style={{ 
            marginRight: '8px', 
            color: colors.primary 
        }}></i>
        Matricule Fiscale
    </label>
    <input
        type="text"
        name="matriculeFiscale"
        value={formData.matriculeFiscale}
        onChange={handleChange}
        placeholder="Ex: 12345678/A/M/000"
        disabled={loading}
        style={{
            width: '100%',
            padding: '1rem 1.5rem',
            background: '#F9FAFB',
            border: `2px solid ${errors.matriculeFiscale ? '#DC2626' : '#E5E7EB'}`,
            borderRadius: '12px',
            color: '#1F2937',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease'
        }}
    />
    {errors.matriculeFiscale && (
        <div style={{ 
            color: '#DC2626', 
            fontSize: '0.875rem', 
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        }}>
            <i className="bi bi-exclamation-circle"></i>
            {errors.matriculeFiscale}
        </div>
    )}
</div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.75rem', 
              cursor: 'pointer',
              color: '#4B5563',
              fontSize: '0.9rem',
              userSelect: 'none'
            }}>
              <input 
                type="checkbox" 
                required
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '0.2rem',
                  accentColor: colors.primary
                }}
              />
              <span>
                J'accepte les <Link to="/terms" style={{ 
                  color: colors.primary, 
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>conditions d'utilisation</Link> et la <Link to="/privacy" style={{ 
                  color: colors.primary, 
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>politique de confidentialité</Link>
              </span>
            </label>
          </div>

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
              transition: 'all 0.3s ease'
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
                Inscription...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus"></i>
                S'inscrire gratuitement
              </>
            )}
          </motion.button>

          <div style={{ 
            textAlign: 'center', 
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            <p style={{ 
              color: '#6B7280', 
              marginBottom: '1.5rem',
              fontSize: '1rem'
            }}>
              Déjà un compte ?
            </p>
            <Link 
              to="/login" 
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
              onMouseEnter={(e) => {
                e.target.style.background = colors.primary;
                e.target.style.color = 'white';
                e.target.style.borderColor = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = colors.primary;
                e.target.style.borderColor = `${colors.primary}20`;
              }}
            >
              <i className="bi bi-box-arrow-in-right"></i>
              Se connecter
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
        }
      `}</style>
    </div>
  );
};

export default Register;