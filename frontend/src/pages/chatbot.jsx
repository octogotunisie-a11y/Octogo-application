import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "🧠 Bonjour ! Je suis l'assistant virtuel d'OCTOGO. Je peux vous rediriger vers nos différentes pages. Que souhaitez-vous découvrir ?", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Mapping des mots-clés vers les pages de l'application
  const pageMapping = {
    // Page d'accueil
    'accueil': { path: '/', nom: 'Accueil', emoji: '🏠' },
    'home': { path: '/', nom: 'Accueil', emoji: '🏠' },
    
    // Pages principales
    'services': { path: '/services', nom: 'Services', emoji: '🔧' },
    'articles': { path: '/articles', nom: 'Articles', emoji: '📚' },
    'clients': { path: '/clients', nom: 'Clients', emoji: '🤝' },
    'contact': { path: '/contact', nom: 'Contact', emoji: '📞' },
    
    // Formations
    'formations': { path: '/formations', nom: 'Formations', emoji: '🎓' },
    'formation': { path: '/formations', nom: 'Formations', emoji: '🎓' },
    
    // Coaching
    'coaching': { path: '/coaching', nom: 'Coaching', emoji: '🧠' },
    
    // Parcours
    'parcours': { path: '/parcours', nom: 'Parcours', emoji: '🗺️' },
    
    // Team Building
    'team building': { path: '/team-building', nom: 'Team Building', emoji: '🤝' },
    'teambuilding': { path: '/team-building', nom: 'Team Building', emoji: '🤝' },
    'cohésion': { path: '/team-building', nom: 'Team Building', emoji: '🤝' },
    'équipe': { path: '/team-building', nom: 'Team Building', emoji: '🤝' },
    
    // Dashboard (authentification)
    'dashboard': { path: '/dashboard', nom: 'Dashboard', emoji: '📊' },
    'compte': { path: '/dashboard', nom: 'Mon compte', emoji: '👤' },
    'profil': { path: '/dashboard', nom: 'Mon profil', emoji: '👤' },
    
    // Login/Register
    'connexion': { path: '/login', nom: 'Connexion', emoji: '🔐' },
    'login': { path: '/login', nom: 'Connexion', emoji: '🔐' },
    'inscription': { path: '/register', nom: 'Inscription', emoji: '📝' },
    'register': { path: '/register', nom: 'Inscription', emoji: '📝' }
  };

  // Mots-clés pour les informations générales
  const infoKeywords = {
    'adresse': '📍 Notre bureau est situé à Tunis. Pour l\'adresse exacte, consultez notre page Contact.',
    'où': '📍 Notre bureau est situé à Tunis. Pour l\'adresse exacte, consultez notre page Contact.',
    'place': '📍 Notre bureau est situé à Tunis. Pour l\'adresse exacte, consultez notre page Contact.',
    
    'horaire': '⏰ Nos horaires d\'ouverture : du lundi au vendredi de 9h à 18h.',
    'heure': '⏰ Nos horaires d\'ouverture : du lundi au vendredi de 9h à 18h.',
    'ouverture': '⏰ Nos horaires d\'ouverture : du lundi au vendredi de 9h à 18h.',
    
    'mission': '🎯 Notre mission : Transformer les défis d\'un monde chaotique en opportunités grâce aux neurosciences.',
    'but': '🎯 Notre mission : Transformer les défis d\'un monde chaotique en opportunités grâce aux neurosciences.',
    
    'valeur': '💫 Nos valeurs : Innovation, Confiance, Agilité et Bienveillance.',
    'valeurs': '💫 Nos valeurs : Innovation, Confiance, Agilité et Bienveillance.',
    
    'email': '📧 Notre email : contact@octogo.tn',
    'mail': '📧 Notre email : contact@octogo.tn',
    'téléphone': '📞 Notre téléphone : +216 28 26 28 29',
    'tel': '📞 Notre téléphone : +216 28 26 28 29',
    'appeler': '📞 Notre téléphone : +216 28 26 28 29',
    'whatsapp': '💬 Notre WhatsApp : +216 28 26 28 29',
    
    'cv': '📝 Pour postuler, envoyez votre CV à contact@octogo.tn',
    'postuler': '📝 Pour postuler, envoyez votre CV à contact@octogo.tn',
    'recrutement': '📝 Pour postuler, envoyez votre CV à contact@octogo.tn',
    
    'fondateur': '👨‍💼 Le fondateur d\'OCTOGO est Fredj Bouslama, CEO et formateur en neurosciences appliquées.',
    'fredj': '👨‍💼 Fredj Bouslama est le CEO et fondateur d\'OCTOGO.',
    'createur': '👨‍💼 Le fondateur d\'OCTOGO est Fredj Bouslama.',
    
    'merci': 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions.',
    'thanks': 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions.',
    
    'au revoir': 'Au revoir ! Passez une excellente journée !',
    'bye': 'Au revoir ! Passez une excellente journée !'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateId = () => {
    return Date.now() + Math.random();
  };

  const navigateToPage = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const analyzeMessage = (message) => {
    const lowerMsg = message.toLowerCase();
    
    // 1. Vérifier d'abord si c'est une redirection vers une page
    for (const [keyword, page] of Object.entries(pageMapping)) {
      if (lowerMsg.includes(keyword)) {
        return {
          type: 'redirect',
          page: page,
          keyword: keyword
        };
      }
    }
    
    // 2. Vérifier si c'est une information générale
    for (const [keyword, response] of Object.entries(infoKeywords)) {
      if (lowerMsg.includes(keyword)) {
        return {
          type: 'info',
          response: response,
          keyword: keyword
        };
      }
    }
    
    // 3. Questions sur les programmes spécifiques (avec redirection)
    if (lowerMsg.includes('éveil') || lowerMsg.includes('développement personnel')) {
      return {
        type: 'redirect',
        page: { path: '/formations', nom: 'Formations', emoji: '🎓' },
        message: "Le programme ÉVEIL fait partie de nos formations. Je vous redirige vers notre page Formations pour plus de détails."
      };
    }
    
    if (lowerMsg.includes('capte') || lowerMsg.includes('relation client')) {
      return {
        type: 'redirect',
        page: { path: '/services', nom: 'Services', emoji: '🔧' },
        message: "Le programme CAPTE est disponible dans nos services. Je vous redirige vers la page Services."
      };
    }
    
    if (lowerMsg.includes('reset') || lowerMsg.includes('neuromanagement')) {
      return {
        type: 'redirect',
        page: { path: '/coaching', nom: 'Coaching', emoji: '🧠' },
        message: "Le programme RESET est proposé dans notre offre de coaching. Je vous redirige vers la page Coaching."
      };
    }
    
    if (lowerMsg.includes('trans-formation') || lowerMsg.includes('leadership transformationnel')) {
      return {
        type: 'redirect',
        page: { path: '/coaching', nom: 'Coaching', emoji: '🧠' },
        message: "TRANS-FORMATION est un de nos programmes de coaching. Je vous redirige vers la page Coaching."
      };
    }
    
    if (lowerMsg.includes('vol d\'aigle') || lowerMsg.includes('géopolitique')) {
      return {
        type: 'redirect',
        page: { path: '/formations', nom: 'Formations', emoji: '🎓' },
        message: "VOL D'AIGLE est une de nos formations. Je vous redirige vers la page Formations."
      };
    }
    
    if (lowerMsg.includes('neuromarketing') || lowerMsg.includes('stratégie marketing')) {
      return {
        type: 'redirect',
        page: { path: '/services', nom: 'Services', emoji: '🔧' },
        message: "Le neuromarketing fait partie de nos services. Je vous redirige vers la page Services."
      };
    }
    
    if (lowerMsg.includes('neurovente') || lowerMsg.includes('vendre')) {
      return {
        type: 'redirect',
        page: { path: '/services', nom: 'Services', emoji: '🔧' },
        message: "La neurovente est un de nos services spécialisés. Je vous redirige vers la page Services."
      };
    }
    
    // 4. Aucune correspondance
    return {
      type: 'unknown'
    };
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessageObj = {
      id: generateId(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setShowSuggestions(false);
    
    setTimeout(() => {
      const analysis = analyzeMessage(inputMessage);
      
      let botResponse = '';
      
      if (analysis.type === 'redirect') {
        const page = analysis.page;
        botResponse = analysis.message || `🧠 Je vous redirige vers la page **${page.nom}** ${page.emoji}.`;
        
        // Ajouter la réponse du bot
        const botMessageObj = {
          id: generateId(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date(),
          redirect: {
            path: page.path,
            nom: page.nom,
            emoji: page.emoji
          }
        };
        setMessages(prev => [...prev, botMessageObj]);
        
        // Optionnel : auto-redirection après 2 secondes
        setTimeout(() => {
          navigateToPage(page.path);
        }, 2000);
        
      } else if (analysis.type === 'info') {
        botResponse = analysis.response;
        
        const botMessageObj = {
          id: generateId(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessageObj]);
        
      } else {
        botResponse = "🧠 Je n'ai pas compris votre demande. Voici ce que je peux faire pour vous :\n\n• Vous rediriger vers nos pages (Services, Formations, Coaching, etc.)\n• Vous donner nos coordonnées\n• Répondre à des questions générales (horaires, adresse, mission)\n\nQue souhaitez-vous ?";
        
        const botMessageObj = {
          id: generateId(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessageObj]);
      }
    }, 800); 
    
    setInputMessage('');
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Suggestions de questions
  const suggestions = [
    "Services",
    "Formations",
    "Coaching",
    "Team Building",
    "Parcours",
    "Contact",
    "Horaires d'ouverture",
    "Notre mission",
    "Nos coordonnées",
    "Qui est le fondateur ?"
  ];

  const styles = {
    button: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '65px',
      height: '65px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #7C3AED, #C084FC)',
      border: 'none',
      boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      transition: 'all 0.3s ease',
      fontSize: '30px',
      color: 'white',
    },
    chatWindow: {
      position: 'fixed',
      bottom: '100px',
      right: '30px',
      width: '380px',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 50px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      overflow: 'hidden',
      animation: 'slideIn 0.3s ease',
    },
    watermarkContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 0,
      opacity: 0.1,
      fontSize: '200px',
      transform: 'rotate(-5deg)',
      color: '#7C3AED',
    },
    header: {
      padding: '20px',
      background: 'linear-gradient(135deg, #7C3AED, #C084FC)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      position: 'relative',
      zIndex: 1,
    },
    messagesContainer: {
      flex: 1,
      padding: '15px',
      overflowY: 'auto',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      position: 'relative',
      zIndex: 1,
    },
    inputForm: {
      padding: '15px',
      backgroundColor: 'white',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      gap: '10px',
      position: 'relative',
      zIndex: 1,
    },
    input: {
      flex: 1,
      padding: '12px 18px',
      border: '2px solid #e2e8f0',
      borderRadius: '30px',
      outline: 'none',
      fontSize: '14px',
      transition: 'border-color 0.3s',
    },
    sendButton: {
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      backgroundColor: '#7C3AED',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s',
    },
    suggestionChip: {
      padding: '8px 15px',
      backgroundColor: '#f1f5f9',
      borderRadius: '20px',
      fontSize: '12px',
      color: '#475569',
      cursor: 'pointer',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    },
    redirectButton: {
      marginTop: '10px',
      padding: '10px 15px',
      backgroundColor: '#7C3AED',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.button}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? '✕' : '🧠'}
      </button>

      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.watermarkContainer}>
            🧠
          </div>

          <div style={styles.header}>
            <span style={{ fontSize: '28px' }}>🧠</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Assistant OCTOGO</h4>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Navigation & informations</p>
            </div>
          </div>

          <div style={styles.messagesContainer}>
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '5px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      backgroundColor: message.sender === 'user' ? '#7C3AED' : 'white',
                      color: message.sender === 'user' ? 'white' : '#1e293b',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      position: 'relative',
                      zIndex: 2,
                      fontSize: '14px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {message.text}
                    <span
                      style={{
                        fontSize: '10px',
                        opacity: 0.7,
                        display: 'block',
                        marginTop: '6px',
                        textAlign: 'right',
                        color: message.sender === 'user' ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
                
                {/* Bouton de redirection si le message a une redirection */}
                {message.redirect && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '5px', marginBottom: '10px' }}>
                    <button
                      onClick={() => navigateToPage(message.redirect.path)}
                      style={styles.redirectButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span>{message.redirect.emoji}</span>
                      <span>Aller vers {message.redirect.nom}</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {showSuggestions && messages.length === 1 && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                  Suggestions :
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {suggestions.map((sugg, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(sugg)}
                      style={styles.suggestionChip}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7C3AED';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={styles.inputForm}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ex: Services, Contact, Horaires..."
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              type="submit"
              style={styles.sendButton}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (max-width: 480px) {
            div[style*="position: fixed"][style*="bottom: 100px"] {
              width: calc(100% - 40px) !important;
              right: 20px !important;
              left: 20px !important;
              height: 500px !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default Chatbot;