// src/components/dashboard/AIChatWidget.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recommendFormations, generateCustomPath } from './aiService';

const AIChatWidget = ({ colors, onSelectFormation }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: "👋 Bonjour ! Je suis votre assistant formation IA. Décrivez-moi vos besoins en formation, et je vous recommanderai les programmes les plus adaptés à votre situation.",
            timestamp: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [showPathGenerator, setShowPathGenerator] = useState(false);
    const [customPath, setCustomPath] = useState(null);

    // Fonctions utilitaires
    const getServiceIcon = (type) => {
        const icons = {
            parcours: 'bi-signpost-2',
            coaching: 'bi-person-arms-up',
            formation: 'bi-book-half',
            teambuilding: 'bi-people-fill'
        };
        return icons[type] || 'bi-box';
    };

    const getServiceColor = (type) => {
        const serviceColors = {
            parcours: colors?.primary || '#6366F1',
            coaching: colors?.success || '#10B981',
            formation: colors?.info || '#3B82F6',
            teambuilding: colors?.secondary || '#0EA5E9'
        };
        return serviceColors[type] || '#6B7280';
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        // Ajouter le message de l'utilisateur
        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: userInput,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        // Simuler un délai pour l'IA (comme si on appelait une API)
        setTimeout(() => {
            // Obtenir les recommandations
            const result = recommendFormations(userInput);
            setRecommendations(result);

            // Message de l'IA avec recommandations
            const botResponse = {
                id: messages.length + 2,
                type: 'bot',
                content: result.explanation,
                recommendations: result.recommendations,
                analysis: result.analysis,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botResponse]);
            setLoading(false);
            setUserInput('');
        }, 1500);
    };

    const handleGeneratePath = () => {
        if (!recommendations) return;
        
        const path = generateCustomPath(userInput, recommendations.recommendations);
        setCustomPath(path);
        setShowPathGenerator(true);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSelectFormationClick = (type, formation) => {
        if (onSelectFormation) {
            onSelectFormation(type, formation);
            setIsOpen(false); // Fermer le widget après sélection
        }
    };

    return (
        <>
            {/* Bouton flottant */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '70px',
                    height: '70px',
                    background: colors?.primaryGradient || 'linear-gradient(145deg, #6366F1 0%, #4F46E5 100%)',
                    border: 'none',
                    borderRadius: '35px',
                    color: 'white',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    boxShadow: colors?.shadowXl || '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    border: '3px solid white'
                }}
            >
                <i className="bi bi-robot"></i>
            </motion.button>

            {/* Widget de chat */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '110px',
                            right: '30px',
                            width: '480px',
                            height: '650px',
                            background: colors?.white || '#FFFFFF',
                            borderRadius: '24px',
                            boxShadow: colors?.shadow2xl || '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 1001,
                            border: `1px solid ${colors?.gray200 || '#E5E7EB'}`
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            background: colors?.primaryGradient || 'linear-gradient(145deg, #6366F1 0%, #4F46E5 100%)',
                            padding: '1.5rem',
                            color: 'white'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.6rem'
                                    }}>
                                        <i className="bi bi-robot"></i>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                            Assistant Formation IA
                                        </h3>
                                        <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                            Décrivez votre besoin, je vous guide
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '1.4rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </motion.button>
                            </div>
                        </div>

                        {/* Zone des messages */}
                        <div style={{
                            flex: 1,
                            padding: '1.5rem',
                            overflowY: 'auto',
                            background: colors?.gray50 || '#F9FAFB',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        maxWidth: '85%',
                                        padding: '1rem',
                                        background: message.type === 'user' 
                                            ? (colors?.primaryGradient || 'linear-gradient(145deg, #6366F1 0%, #4F46E5 100%)')
                                            : (colors?.white || '#FFFFFF'),
                                        color: message.type === 'user' ? 'white' : (colors?.gray800 || '#1F2937'),
                                        borderRadius: message.type === 'user' 
                                            ? '18px 18px 4px 18px' 
                                            : '18px 18px 18px 4px',
                                        boxShadow: colors?.shadowSm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                        border: message.type === 'bot' ? `1px solid ${colors?.gray200 || '#E5E7EB'}` : 'none'
                                    }}>
                                        {message.type === 'bot' && (
                                            <div style={{ 
                                                fontSize: '0.8rem', 
                                                marginBottom: '0.5rem',
                                                color: colors?.primary || '#6366F1',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <i className="bi bi-robot"></i>
                                                Assistant IA
                                            </div>
                                        )}
                                        <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                            {message.content}
                                        </p>

                                        {/* Afficher les recommandations si présentes */}
                                        {message.recommendations && (
                                            <div style={{ marginTop: '1.5rem' }}>
                                                {/* Analyse */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '1rem',
                                                    padding: '0.75rem',
                                                    background: `${colors?.primary || '#6366F1'}10`,
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    color: colors?.primary || '#6366F1',
                                                    border: `1px solid ${colors?.primary || '#6366F1'}30`
                                                }}>
                                                    <i className="bi bi-stars"></i>
                                                    <span>
                                                        <strong>Analyse :</strong> {message.analysis.primaryIntent} 
                                                        <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}>
                                                            (pertinence {message.analysis.confidence}%)
                                                        </span>
                                                    </span>
                                                </div>

                                                {/* Formations recommandées */}
                                                {Object.entries(message.recommendations).map(([type, formations]) => 
                                                    formations.length > 0 && (
                                                        <div key={type} style={{ marginBottom: '1.25rem' }}>
                                                            <h4 style={{
                                                                fontSize: '0.9rem',
                                                                fontWeight: 700,
                                                                color: colors?.gray700 || '#374151',
                                                                marginBottom: '0.75rem',
                                                                textTransform: 'capitalize',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}>
                                                                <i className={`bi ${getServiceIcon(type)}`} style={{ color: getServiceColor(type) }}></i>
                                                                {type === 'teambuilding' ? 'Team Building' : type}
                                                            </h4>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                {formations.map((formation) => (
                                                                    <motion.div
                                                                        key={formation.id}
                                                                        whileHover={{ scale: 1.02, x: 5 }}
                                                                        style={{
                                                                            padding: '0.75rem',
                                                                            background: colors?.white || '#FFFFFF',
                                                                            border: `1px solid ${colors?.gray200 || '#E5E7EB'}`,
                                                                            borderRadius: '12px',
                                                                            cursor: 'pointer',
                                                                            boxShadow: colors?.shadowSm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                                        }}
                                                                        onClick={() => handleSelectFormationClick(type, formation)}
                                                                    >
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center'
                                                                        }}>
                                                                            <div>
                                                                                <div style={{ 
                                                                                    fontWeight: 700, 
                                                                                    fontSize: '0.95rem',
                                                                                    color: colors?.gray900 || '#111827'
                                                                                }}>
                                                                                    {formation.title}
                                                                                </div>
                                                                                <div style={{ 
                                                                                    fontSize: '0.8rem', 
                                                                                    color: colors?.gray500 || '#6B7280',
                                                                                    marginTop: '2px',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '0.5rem'
                                                                                }}>
                                                                                    <span>{formation.category}</span>
                                                                                    <span>•</span>
                                                                                    <span style={{ 
                                                                                        color: getServiceColor(type),
                                                                                        fontWeight: 600
                                                                                    }}>
                                                                                        {formation.relevance}% pertinent
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div style={{
                                                                                width: '32px',
                                                                                height: '32px',
                                                                                background: `${getServiceColor(type)}10`,
                                                                                borderRadius: '8px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                color: getServiceColor(type)
                                                                            }}>
                                                                                <i className="bi bi-arrow-right"></i>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                )}

                                                {/* Bouton parcours personnalisé */}
                                                {Object.values(message.recommendations).some(f => f.length > 0) && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handleGeneratePath}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.9rem',
                                                            marginTop: '0.5rem',
                                                            background: colors?.secondaryGradient || 'linear-gradient(145deg, #0EA5E9 0%, #0284C7 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            fontWeight: 600,
                                                            fontSize: '0.95rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.75rem',
                                                            boxShadow: colors?.shadowMd || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    >
                                                        <i className="bi bi-map"></i>
                                                        Générer un parcours personnalisé
                                                    </motion.button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ display: 'flex', justifyContent: 'flex-start' }}
                                >
                                    <div style={{
                                        padding: '1rem 1.5rem',
                                        background: colors?.white || '#FFFFFF',
                                        borderRadius: '18px 18px 18px 4px',
                                        border: `1px solid ${colors?.gray200 || '#E5E7EB'}`,
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            background: colors?.primary || '#6366F1',
                                            borderRadius: '5px',
                                            animation: 'bounce 1s infinite'
                                        }}></div>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            background: colors?.primary || '#6366F1',
                                            borderRadius: '5px',
                                            animation: 'bounce 1s infinite 0.2s'
                                        }}></div>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            background: colors?.primary || '#6366F1',
                                            borderRadius: '5px',
                                            animation: 'bounce 1s infinite 0.4s'
                                        }}></div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Zone de saisie */}
                        <div style={{
                            padding: '1.5rem',
                            borderTop: `1px solid ${colors?.gray200 || '#E5E7EB'}`,
                            background: colors?.white || '#FFFFFF'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '0.75rem',
                                alignItems: 'flex-end'
                            }}>
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ex: améliorer la cohésion d'équipe, développer le leadership, gérer le stress..."
                                    rows="2"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: `2px solid ${colors?.gray300 || '#D1D5DB'}`,
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        resize: 'none',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors?.primary || '#6366F1';
                                        e.target.style.boxShadow = `0 0 0 3px ${colors?.primary || '#6366F1'}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = colors?.gray300 || '#D1D5DB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSendMessage}
                                    disabled={!userInput.trim() || loading}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: !userInput.trim() || loading 
                                            ? (colors?.gray400 || '#9CA3AF')
                                            : (colors?.primaryGradient || 'linear-gradient(145deg, #6366F1 0%, #4F46E5 100%)'),
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '1.2rem',
                                        cursor: !userInput.trim() || loading ? 'not-allowed' : 'pointer',
                                        height: 'fit-content',
                                        boxShadow: colors?.shadowMd || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <i className="bi bi-send"></i>
                                </motion.button>
                            </div>
                            <div style={{
                                marginTop: '0.75rem',
                                fontSize: '0.7rem',
                                color: colors?.gray400 || '#9CA3AF',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <i className="bi bi-shield-check"></i>
                                Recommandations basées sur l'analyse sémantique de votre texte
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal parcours personnalisé */}
            <AnimatePresence>
                {showPathGenerator && customPath && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15, 23, 42, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: '20px',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{
                                background: colors?.white || '#FFFFFF',
                                borderRadius: '32px',
                                padding: '2rem',
                                maxWidth: '650px',
                                width: '100%',
                                maxHeight: '85vh',
                                overflowY: 'auto',
                                boxShadow: colors?.shadow2xl || '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: `1px solid ${colors?.gray200 || '#E5E7EB'}`
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '1.8rem',
                                        fontWeight: 700,
                                        color: colors?.gray900 || '#111827',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <i className="bi bi-map" style={{ color: colors?.primary || '#6366F1' }}></i>
                                        {customPath.name}
                                    </h3>
                                    <p style={{ color: colors?.gray500 || '#6B7280', fontSize: '0.95rem' }}>
                                        {customPath.description}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowPathGenerator(false)}
                                    style={{
                                        background: colors?.gray100 || '#F3F4F6',
                                        border: 'none',
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '14px',
                                        fontSize: '1.4rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: colors?.gray600 || '#4B5563'
                                    }}
                                >
                                    ×
                                </motion.button>
                            </div>

                            {/* Durée estimée */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: `${colors?.primary || '#6366F1'}10`,
                                borderRadius: '30px',
                                marginBottom: '2rem',
                                color: colors?.primary || '#6366F1',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}>
                                <i className="bi bi-clock"></i>
                                Durée estimée : {customPath.duration}
                            </div>

                            {/* Objectifs */}
                            <div style={{
                                background: colors?.gray50 || '#F9FAFB',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                <h4 style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    color: colors?.gray800 || '#1F2937',
                                    marginBottom: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <i className="bi bi-bullseye" style={{ color: colors?.primary || '#6366F1' }}></i>
                                    Objectifs du parcours
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {customPath.objectives.map((obj, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                marginBottom: '1rem',
                                                fontSize: '0.95rem',
                                                color: colors?.gray700 || '#374151',
                                                padding: '0.5rem',
                                                background: colors?.white || '#FFFFFF',
                                                borderRadius: '12px',
                                                border: `1px solid ${colors?.gray200 || '#E5E7EB'}`
                                            }}
                                        >
                                            <span style={{
                                                width: '28px',
                                                height: '28px',
                                                background: colors?.primary || '#6366F1',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.85rem',
                                                fontWeight: 600
                                            }}>
                                                {index + 1}
                                            </span>
                                            {obj}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Étapes du parcours */}
                            <h4 style={{
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: colors?.gray800 || '#1F2937',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <i className="bi bi-stairs" style={{ color: colors?.primary || '#6366F1' }}></i>
                                Étapes du parcours
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {customPath.steps.map((step) => (
                                    <motion.div
                                        key={step.step}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: step.step * 0.1 }}
                                        style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            padding: '1.25rem',
                                            background: colors?.white || '#FFFFFF',
                                            borderRadius: '18px',
                                            border: `1px solid ${colors?.gray200 || '#E5E7EB'}`,
                                            boxShadow: colors?.shadowSm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            background: `${getServiceColor(step.type)}15`,
                                            borderRadius: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: getServiceColor(step.type),
                                            fontSize: '1.4rem'
                                        }}>
                                            <i className={`bi ${getServiceIcon(step.type)}`}></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <h5 style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: 700,
                                                    color: colors?.gray900 || '#111827',
                                                    margin: 0
                                                }}>
                                                    Étape {step.step} : {step.title}
                                                </h5>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.25rem 0.75rem',
                                                    background: `${getServiceColor(step.type)}10`,
                                                    color: getServiceColor(step.type),
                                                    borderRadius: '30px',
                                                    fontWeight: 600
                                                }}>
                                                    {step.duration}
                                                </span>
                                            </div>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: colors?.gray600 || '#4B5563',
                                                margin: '0.25rem 0 0 0',
                                                lineHeight: '1.5'
                                            }}>
                                                {step.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Boutons d'action */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end',
                                paddingTop: '1rem',
                                borderTop: `2px solid ${colors?.gray200 || '#E5E7EB'}`
                            }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowPathGenerator(false)}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: colors?.white || '#FFFFFF',
                                        color: colors?.gray700 || '#374151',
                                        border: `2px solid ${colors?.gray300 || '#D1D5DB'}`,
                                        borderRadius: '50px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Fermer
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '1rem 2.5rem',
                                        background: colors?.primaryGradient || 'linear-gradient(145deg, #6366F1 0%, #4F46E5 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        boxShadow: colors?.shadowLg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onClick={() => {
                                        setShowPathGenerator(false);
                                        setIsOpen(false);
                                        // Ouvrir le formulaire de demande de devis
                                        if (window.openDevisModal) {
                                            window.openDevisModal();
                                        }
                                    }}
                                >
                                    <i className="bi bi-file-earmark-text"></i>
                                    Demander un devis
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-10px); }
                }
            `}</style>
        </>
    );
};

export default AIChatWidget;