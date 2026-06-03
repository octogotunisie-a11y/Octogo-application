import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatWidget from './AIChatWidget';

const DashboardClient = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : {};
    });
    
    const [activeTab, setActiveTab] = useState('devis');
    const [devis, setDevis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState({
        parcours: [],
        coaching: [],
        formation: [],
        teambuilding: []
    });
    
    const [showDevisModal, setShowDevisModal] = useState(false);
    const [serviceType, setServiceType] = useState(() => {
        return localStorage.getItem('lastServiceType') || 'parcours';
    });
    
    const [devisForm, setDevisForm] = useState({
        serviceType: localStorage.getItem('lastServiceType') || 'parcours',
        serviceId: '',
        serviceTitle: '',
        serviceCategory: '',
        entreprise: user?.company || '',
        matriculeFiscale: user?.matriculeFiscale || '',
        participants: 1,
        duree: 1,
        uniteDuree: 'jours',
        lieu: '',
        datePrevue: '',
        message: '',
        contactPhone: user?.phone || '',
        devise: 'TND'
    });

    // États pour la gestion des messages/comments
    const [selectedDevis, setSelectedDevis] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success',
        message: ''
    });
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterServiceType, setFilterServiceType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company: user?.company || '',
        phone: user?.phone || '',
        matriculeFiscale: user?.matriculeFiscale || ''
    });

    // 🎨 PALETTE DE COULEURS PROFESSIONNELLE - ÉLÉGANTE & MODERNE
    const colors = {
        primary: '#6366F1',
        primaryLight: '#818CF8',
        primaryDark: '#4F46E5',
        primaryGradient: 'linear-gradient(145deg, #6366F1 0%, #4F46E5 100%)',
        primarySoft: '#EEF2FF',
        
        secondary: '#0EA5E9',
        secondaryLight: '#38BDF8',
        secondaryDark: '#0284C7',
        secondaryGradient: 'linear-gradient(145deg, #0EA5E9 0%, #0284C7 100%)',
        secondarySoft: '#EFF6FF',
        
        success: '#10B981',
        successLight: '#34D399',
        successDark: '#059669',
        successGradient: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
        successSoft: '#ECFDF5',
        
        warning: '#F59E0B',
        warningLight: '#FBBF24',
        warningDark: '#D97706',
        warningGradient: 'linear-gradient(145deg, #F59E0B 0%, #D97706 100%)',
        warningSoft: '#FFFBEB',
        
        danger: '#EF4444',
        dangerLight: '#F87171',
        dangerDark: '#DC2626',
        dangerGradient: 'linear-gradient(145deg, #EF4444 0%, #DC2626 100%)',
        dangerSoft: '#FEF2F2',
        
        info: '#3B82F6',
        infoLight: '#60A5FA',
        infoDark: '#2563EB',
        infoGradient: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)',
        infoSoft: '#EFF6FF',
        
        dark: '#0F172A',
        darkLight: '#1E293B',
        gray900: '#111827',
        gray800: '#1F2937',
        gray700: '#374151',
        gray600: '#4B5563',
        gray500: '#6B7280',
        gray400: '#9CA3AF',
        gray300: '#D1D5DB',
        gray200: '#E5E7EB',
        gray100: '#F3F4F6',
        gray50: '#F9FAFB',
        white: '#FFFFFF',
        
        shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        shadow2xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    };

    const googleForms = [
        {
            id: 1,
            title: 'Évaluation Parcours',
            description: 'Évaluez votre expérience avec nos parcours de formation',
            url: 'https://docs.google.com/forms/d/1XXfpfWMKf91JxbDbQZF3H00u_lLvm2QSFt-qxJPEIu8/edit',
            category: 'Parcours',
            icon: 'bi-flag',
            color: colors.primary
        },
        {
            id: 2,
            title: 'Feedback Coaching',
            description: 'Donnez votre avis sur nos sessions de coaching',
            url: 'https://docs.google.com/forms/d/e/2FAIpQLSd...',
            category: 'Coaching',
            icon: 'bi-person-workspace',
            color: colors.success
        },
        {
            id: 3,
            title: 'Satisfaction Formation',
            description: 'Évaluez la qualité de nos formations',
            url: 'https://docs.google.com/forms/d/e/3FAIpQLSd...',
            category: 'Formation',
            icon: 'bi-mortarboard',
            color: colors.info
        },
        {
            id: 4,
            title: 'Team Building',
            description: 'Feedback sur nos activités de team building',
            url: 'https://docs.google.com/forms/d/e/4FAIpQLSd...',
            category: 'Team Building',
            icon: 'bi-people-fill',
            color: colors.secondary
        }
    ];

    // ✅ Chargement initial UNIQUEMENT
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                handleLogout();
                return;
            }

            const [profileResponse, devisResponse] = await Promise.all([
                fetch('http://localhost:5000/api/users/me', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch('http://localhost:5000/api/devis/mes-devis', {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                setUser(profileData.user);
                localStorage.setItem('user', JSON.stringify(profileData.user));
            }

            if (devisResponse.ok) {
                const devisData = await devisResponse.json();
                setDevis(devisData.devis || []);
            } else if (devisResponse.status === 401) {
                handleLogout();
            }

        } catch (error) {
            console.error('Erreur chargement données:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fonction pour visualiser les messages d'un devis
    const handleViewMessages = (devisItem) => {
        setSelectedDevis(devisItem);
        setShowMessageModal(true);
    };

    // Fonction pour envoyer un commentaire/réponse à l'admin
    const handleSendComment = async () => {
        if (!newComment.trim()) {
            showNotification('warning', 'Veuillez écrire un message');
            return;
        }

        setSendingComment(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/devis/${selectedDevis.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: newComment,
                    isFromClient: true
                })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('success', 'Message envoyé avec succès');
                setNewComment('');
                
                // Rafraîchir les données du devis pour voir le nouveau message
                const devisResponse = await fetch(`http://localhost:5000/api/devis/${selectedDevis.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (devisResponse.ok) {
                    const devisData = await devisResponse.json();
                    setSelectedDevis(devisData.devis);
                    
                    // Mettre à jour la liste des devis
                    setDevis(prevDevis => 
                        prevDevis.map(d => 
                            d.id === selectedDevis.id ? devisData.devis : d
                        )
                    );
                }
            } else {
                showNotification('error', data.message || 'Erreur lors de l\'envoi du message');
            }
        } catch (error) {
            console.error('Erreur envoi commentaire:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        } finally {
            setSendingComment(false);
        }
    };

    // Fonction pour répondre à un message spécifique
    const handleSendReply = async (parentCommentId) => {
        if (!replyContent.trim()) {
            showNotification('warning', 'Veuillez écrire votre réponse');
            return;
        }

        setSendingComment(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/devis/${selectedDevis.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: replyContent,
                    isFromClient: true,
                    parentId: parentCommentId
                })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('success', 'Réponse envoyée avec succès');
                setReplyContent('');
                setReplyingTo(null);
                
                // Rafraîchir les données du devis
                const devisResponse = await fetch(`http://localhost:5000/api/devis/${selectedDevis.id}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (devisResponse.ok) {
                    const devisData = await devisResponse.json();
                    setSelectedDevis(devisData.devis);
                    
                    setDevis(prevDevis => 
                        prevDevis.map(d => 
                            d.id === selectedDevis.id ? devisData.devis : d
                        )
                    );
                }
            } else {
                showNotification('error', data.message || 'Erreur lors de l\'envoi de la réponse');
            }
        } catch (error) {
            console.error('Erreur envoi réponse:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        } finally {
            setSendingComment(false);
        }
    };

    const fetchAllServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services/all');
            if (response.ok) {
                const data = await response.json();
                setServices(data.services || {});
            }
        } catch (error) {
            console.error('Erreur chargement services:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleSwitchToAdmin = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.role === 'admin') {
            window.location.href = '/admin/dashboard';
        } else {
            showNotification('error', 'Accès non autorisé. Vous devez être administrateur.');
        }
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 3000);
    };

    const handleDownloadPDF = async (devisId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/devis/${devisId}/download`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `devis-${devisId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                showNotification('success', 'PDF téléchargé avec succès');
            } else {
                showNotification('error', 'Erreur lors du téléchargement');
            }
        } catch (error) {
            console.error('Erreur download PDF:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        }
    };

    const handleViewPDF = (devisItem) => {
        if (devisItem.fichierPdf) {
            const token = localStorage.getItem('token');
            window.open(`http://localhost:5000${devisItem.fichierPdf}?token=${token}`, '_blank');
        } else {
            showNotification('warning', 'Aucun PDF disponible pour ce devis');
        }
    };

    const handleDemandeDevis = useCallback((type = 'parcours') => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        setServiceType(type);
        localStorage.setItem('lastServiceType', type);
        
        setDevisForm({
            serviceType: type,
            serviceId: '',
            serviceTitle: '',
            serviceCategory: '',
            entreprise: userData?.company || '',
            matriculeFiscale: userData?.matriculeFiscale || '',
            participants: 1,
            duree: 1,
            uniteDuree: 'jours',
            lieu: '',
            datePrevue: '',
            message: '',
            contactPhone: userData?.phone || '',
            devise: 'TND'
        });
        
        fetchAllServices();
        setShowDevisModal(true);
    }, []);

    const handleSubmitDevis = async (e) => {
        e.preventDefault();
        
        if (!devisForm.serviceId || !devisForm.entreprise || !devisForm.matriculeFiscale || !devisForm.lieu) {
            showNotification('error', 'Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        setSubmitting(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('error', 'Vous devez être connecté pour demander un devis');
                setSubmitting(false);
                handleLogout();
                return;
            }

            const response = await fetch('http://localhost:5000/api/devis/demander', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(devisForm)
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                showNotification('success', 'Demande de devis envoyée avec succès !');
                setShowDevisModal(false);
                fetchUserData();
            } else {
                showNotification('error', data.message || 'Erreur lors de la demande de devis');
            }
        } catch (error) {
            console.error('Erreur soumission devis:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDevis = async (devisId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de devis ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('error', 'Vous devez être connecté pour supprimer un devis');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/devis/${devisId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                showNotification('error', 'Session expirée. Veuillez vous reconnecter.');
                handleLogout();
                return;
            }

            const data = await response.json();
            
            if (response.ok) {
                showNotification('success', 'Demande de devis supprimée avec succès');
                fetchUserData();
            } else {
                showNotification('error', data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression devis:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editProfileForm)
            });

            const data = await response.json();
            
            if (response.ok) {
                showNotification('success', 'Profil mis à jour avec succès');
                setShowProfileEdit(false);
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                fetchUserData();
            } else {
                showNotification('error', data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur mise à jour profil:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        }
    };

    const handleOpenGoogleForm = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleManualRefresh = () => {
        fetchUserData();
        showNotification('info', 'Données actualisées');
    };

    const getStatusColor = (status) => {
        const colorsMap = {
            'en attente': colors.warning,
            'validé': colors.success,
            'payé': colors.info,
            'refusé': colors.danger
        };
        return colorsMap[status] || colors.gray500;
    };

    const getStatusIcon = (status) => {
        const icons = {
            'en attente': 'bi-hourglass-split',
            'validé': 'bi-check-circle-fill',
            'payé': 'bi-credit-card-fill',
            'refusé': 'bi-x-circle-fill'
        };
        return icons[status] || 'bi-question-circle';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'en attente': 'En attente',
            'validé': 'Validé',
            'payé': 'Payé',
            'refusé': 'Refusé'
        };
        return labels[status] || status;
    };

    const getServiceTypeLabel = (type) => {
        const labels = {
            'parcours': 'Parcours',
            'coaching': 'Coaching',
            'formation': 'Formation',
            'teambuilding': 'Team Building'
        };
        return labels[type] || type;
    };

    const getServiceIcon = (type) => {
        const icons = {
            'parcours': 'bi-signpost-2',
            'coaching': 'bi-person-arms-up',
            'formation': 'bi-book-half',
            'teambuilding': 'bi-people-fill'
        };
        return icons[type] || 'bi-box';
    };

    const getServiceColor = (type) => {
        const colorsMap = {
            'parcours': colors.primary,
            'coaching': colors.success,
            'formation': colors.info,
            'teambuilding': colors.secondary
        };
        return colorsMap[type] || colors.gray500;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Non définie';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount, devise = 'TND') => {
        if (!amount) return 'Sur devis';
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency: devise,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getServiceList = () => {
        return services[serviceType] || [];
    };

    const handleServiceTypeChange = (type) => {
        setServiceType(type);
        setDevisForm(prev => ({
            ...prev,
            serviceType: type,
            serviceId: '',
            serviceTitle: '',
            serviceCategory: ''
        }));
    };

    const filteredDevis = useMemo(() => {
        return devis.filter(devisItem => {
            const matchesStatus = filterStatus === 'all' || devisItem.status === filterStatus;
            const matchesServiceType = filterServiceType === 'all' || devisItem.serviceType === filterServiceType;
            const matchesSearch = searchQuery === '' || 
                devisItem.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                devisItem.entreprise?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                devisItem.serviceCategory?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesStatus && matchesServiceType && matchesSearch;
        });
    }, [devis, filterStatus, filterServiceType, searchQuery]);

    const statsByServiceType = useMemo(() => {
        return {
            parcours: devis.filter(d => d.serviceType === 'parcours').length,
            coaching: devis.filter(d => d.serviceType === 'coaching').length,
            formation: devis.filter(d => d.serviceType === 'formation').length,
            teambuilding: devis.filter(d => d.serviceType === 'teambuilding').length
        };
    }, [devis]);

    const statusStats = useMemo(() => {
        return {
            'en attente': devis.filter(d => d.status === 'en attente').length,
            'validé': devis.filter(d => d.status === 'validé').length,
            'payé': devis.filter(d => d.status === 'payé').length,
            'refusé': devis.filter(d => d.status === 'refusé').length
        };
    }, [devis]);

    // Animation variants
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${colors.gray50} 0%, ${colors.white} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: 'center' }}
                >
                    <div style={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto 40px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: '4px solid',
                            borderColor: `${colors.primary}20`,
                            borderRadius: '50%'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: '4px solid transparent',
                            borderTopColor: colors.primary,
                            borderRightColor: colors.primaryLight,
                            borderRadius: '50%',
                            animation: 'spin 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '60px',
                            height: '60px',
                            background: colors.primaryGradient,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            boxShadow: colors.shadowLg
                        }}>
                            O
                        </div>
                    </div>
                    <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ 
                            color: colors.gray600, 
                            fontSize: '1.2rem', 
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}
                    >
                        Chargement de votre espace personnel...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ 
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${colors.gray900} 0%, ${colors.dark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ 
                        textAlign: 'center', 
                        color: 'white',
                        maxWidth: '500px',
                        padding: '40px'
                    }}
                >
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: `${colors.danger}20`,
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 30px',
                        fontSize: '3rem',
                        border: `2px solid ${colors.danger}40`
                    }}>
                        <i className="bi bi-shield-lock" style={{ color: colors.danger }}></i>
                    </div>
                    <h2 style={{ 
                        marginBottom: '1rem', 
                        fontSize: '2rem',
                        fontWeight: 700,
                        letterSpacing: '-0.5px'
                    }}>
                        Accès restreint
                    </h2>
                    <p style={{ 
                        marginBottom: '2rem', 
                        opacity: 0.8,
                        fontSize: '1.1rem',
                        lineHeight: '1.6'
                    }}>
                        Veuillez vous connecter pour accéder à votre tableau de bord personnel
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: colors.shadowXl }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = '/login'}
                        style={{
                            padding: '1rem 2.5rem',
                            background: colors.white,
                            color: colors.primary,
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: colors.shadowLg
                        }}
                    >
                        <i className="bi bi-box-arrow-in-right"></i>
                        Se connecter
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: `linear-gradient(180deg, ${colors.gray50} 0%, ${colors.white} 100%)`,
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
            {/* 🌟 NOTIFICATION MODERNE */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{
                            position: 'fixed',
                            top: '24px',
                            right: '24px',
                            zIndex: 9999,
                            background: notification.type === 'success' ? colors.successGradient :
                                       notification.type === 'error' ? colors.dangerGradient :
                                       colors.infoGradient,
                            color: 'white',
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            boxShadow: colors.shadowXl,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            maxWidth: '420px',
                            width: '100%',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem'
                        }}>
                            <i className={`bi ${notification.type === 'success' ? 'bi-check-lg' : 
                                         notification.type === 'error' ? 'bi-exclamation-triangle' : 
                                         'bi-info-circle'}`}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ 
                                margin: 0, 
                                fontWeight: 600, 
                                fontSize: '0.95rem',
                                marginBottom: '2px'
                            }}>
                                {notification.type === 'success' ? 'Succès' :
                                 notification.type === 'error' ? 'Erreur' : 'Information'}
                            </p>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '0.85rem',
                                opacity: 0.9
                            }}>
                                {notification.message}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setNotification({ ...notification, show: false })}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem'
                            }}
                        >
                            ×
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🏆 HEADER ÉLÉGANT */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                style={{
                    background: colors.white,
                    borderBottom: `1px solid ${colors.gray200}`,
                    padding: '1rem 0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255,255,255,0.9)'
                }}
            >
                <div style={{ 
                    maxWidth: '1600px', 
                    margin: '0 auto', 
                    padding: '0 2rem'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                    }}>
                        {/* Logo & User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                style={{
                                    width: '54px',
                                    height: '54px',
                                    background: colors.primaryGradient,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    boxShadow: colors.shadowLg
                                }}
                            >
                                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                            </motion.div>
                            <div>
                                <h1 style={{ 
                                    fontSize: '1.6rem', 
                                    fontWeight: 700, 
                                    marginBottom: '0.25rem',
                                    color: colors.gray900,
                                    letterSpacing: '-0.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    Bonjour, {user?.name}
                                    <span style={{ fontSize: '1.8rem' }}>👋</span>
                                </h1>
                                <p style={{ 
                                    color: colors.gray500, 
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="bi bi-briefcase-fill" style={{ color: colors.primary }}></i>
                                    {user?.company || 'Client'} • Espace professionnel
                                </p>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: colors.gray100 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleManualRefresh}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: colors.white,
                                    color: colors.gray700,
                                    border: `1px solid ${colors.gray300}`,
                                    borderRadius: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className="bi bi-arrow-clockwise" style={{ fontSize: '0.95rem' }}></i>
                                Actualiser
                            </motion.button>

                            {user?.role === 'admin' && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSwitchToAdmin}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: colors.primarySoft,
                                        color: colors.primary,
                                        border: `1px solid ${colors.primary}30`,
                                        borderRadius: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <i className="bi bi-shield-fill"></i>
                                    Admin
                                </motion.button>
                            )}
                            
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: colors.danger, color: 'white' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: colors.white,
                                    color: colors.gray700,
                                    border: `1px solid ${colors.gray300}`,
                                    borderRadius: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                Déconnexion
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <main style={{ 
                maxWidth: '1600px', 
                margin: '0 auto', 
                padding: '2rem'
            }}>
                {/* 📊 SECTION STATISTIQUES MODERNE */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                        gap: '1.5rem',
                        marginBottom: '2.5rem'
                    }}
                >
                    {/* Carte Totale Devis */}
                    <motion.div
                        variants={fadeInUp}
                        whileHover={{ y: -5, boxShadow: colors.shadowXl }}
                        style={{
                            background: colors.white,
                            borderRadius: '24px',
                            padding: '1.75rem',
                            boxShadow: colors.shadowMd,
                            border: `1px solid ${colors.gray100}`,
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleDemandeDevis('parcours')}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '6px',
                            background: colors.primaryGradient
                        }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: colors.primarySoft,
                                borderRadius: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors.primary,
                                fontSize: '1.8rem'
                            }}>
                                <i className="bi bi-file-earmark-text"></i>
                            </div>
                            <div>
                                <p style={{ 
                                    margin: 0,
                                    color: colors.gray500, 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Total devis
                                </p>
                                <div style={{ 
                                    fontSize: '2.8rem', 
                                    fontWeight: 700, 
                                    color: colors.gray900, 
                                    lineHeight: 1,
                                    marginTop: '4px'
                                }}>
                                    {devis.length}
                                </div>
                            </div>
                        </div>
                        <div style={{ 
                            marginTop: '1.25rem',
                            paddingTop: '1.25rem',
                            borderTop: `1px solid ${colors.gray100}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: colors.primary,
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            <i className="bi bi-plus-circle"></i>
                            <span>Nouvelle demande de devis</span>
                        </div>
                    </motion.div>

                    {/* Cartes Statuts */}
                    {Object.entries(statusStats).map(([status, count]) => (
                        <motion.div
                            key={status}
                            variants={fadeInUp}
                            whileHover={{ y: -5, boxShadow: colors.shadowXl }}
                            style={{
                                background: colors.white,
                                borderRadius: '24px',
                                padding: '1.75rem',
                                boxShadow: colors.shadowMd,
                                border: `1px solid ${colors.gray100}`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                right: 0, 
                                height: '6px',
                                background: getStatusColor(status)
                            }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: `${getStatusColor(status)}10`,
                                    borderRadius: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getStatusColor(status),
                                    fontSize: '1.8rem'
                                }}>
                                    <i className={`bi ${getStatusIcon(status)}`}></i>
                                </div>
                                <div>
                                    <p style={{ 
                                        margin: 0,
                                        color: colors.gray500, 
                                        fontSize: '0.9rem', 
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {getStatusLabel(status)}
                                    </p>
                                    <div style={{ 
                                        fontSize: '2.8rem', 
                                        fontWeight: 700, 
                                        color: colors.gray900, 
                                        lineHeight: 1,
                                        marginTop: '4px'
                                    }}>
                                        {count}
                                    </div>
                                </div>
                            </div>
                            <div style={{ 
                                marginTop: '1.25rem',
                                paddingTop: '1.25rem',
                                borderTop: `1px solid ${colors.gray100}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: getStatusColor(status),
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}>
                                <i className="bi bi-pie-chart"></i>
                                <span>{devis.length > 0 ? Math.round((count / devis.length) * 100) : 0}% du total</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* 🎯 SECTION SERVICES - CARTES INTERACTIVES */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                        gap: '1rem',
                        marginBottom: '2.5rem'
                    }}
                >
                    {Object.entries(statsByServiceType).map(([type, count]) => (
                        <motion.div
                            key={type}
                            whileHover={{ y: -4, boxShadow: colors.shadowLg }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                background: colors.white,
                                borderRadius: '20px',
                                padding: '1.25rem',
                                boxShadow: colors.shadowSm,
                                border: `1px solid ${colors.gray100}`,
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                            onClick={() => handleDemandeDevis(type)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: `${getServiceColor(type)}10`,
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getServiceColor(type),
                                    fontSize: '1.5rem'
                                }}>
                                    <i className={`bi ${getServiceIcon(type)}`}></i>
                                </div>
                                <div>
                                    <p style={{ 
                                        margin: 0,
                                        color: colors.gray900, 
                                        fontSize: '1.1rem', 
                                        fontWeight: 600
                                    }}>
                                        {getServiceTypeLabel(type)}
                                    </p>
                                    <p style={{ 
                                        margin: 0,
                                        color: colors.gray500, 
                                        fontSize: '0.85rem',
                                        marginTop: '2px'
                                    }}>
                                        {count} devis
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                background: `${getServiceColor(type)}10`,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: getServiceColor(type),
                                fontSize: '0.9rem'
                            }}>
                                <i className="bi bi-arrow-right"></i>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* 📌 NAVIGATION TABS ÉLÉGANTE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ 
                        background: colors.white,
                        borderRadius: '18px',
                        padding: '0.5rem',
                        marginBottom: '2rem',
                        boxShadow: colors.shadowSm,
                        border: `1px solid ${colors.gray100}`,
                        display: 'inline-flex',
                        width: '100%'
                    }}
                >
                    {[
                        { id: 'devis', label: 'Mes Devis', icon: 'bi-file-earmark-text', count: devis.length },
                        { id: 'forms', label: 'Questionnaires', icon: 'bi-ui-checks', count: googleForms.length },
                        { id: 'profile', label: 'Mon Profil', icon: 'bi-person', count: null }
                    ].map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ backgroundColor: activeTab === tab.id ? colors.primary : colors.gray50 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '0.9rem 1.5rem',
                                background: activeTab === tab.id ? colors.primaryGradient : 'transparent',
                                color: activeTab === tab.id ? 'white' : colors.gray600,
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s',
                                boxShadow: activeTab === tab.id ? colors.shadowMd : 'none'
                            }}
                        >
                            <i className={`bi ${tab.icon}`} style={{ fontSize: '1.1rem' }}></i>
                            {tab.label}
                            {tab.count !== null && (
                                <span style={{
                                    background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : colors.gray200,
                                    color: activeTab === tab.id ? 'white' : colors.gray600,
                                    padding: '2px 10px',
                                    borderRadius: '30px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    marginLeft: '4px'
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                {/* 🎨 CONTENU PRINCIPAL - DESIGN MODERNE */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ 
                        background: colors.white,
                        borderRadius: '28px',
                        padding: '2rem',
                        boxShadow: colors.shadowXl,
                        border: `1px solid ${colors.gray100}`,
                        minHeight: '600px'
                    }}
                >
                    {/* 📋 TAB DEVIS */}
                    {activeTab === 'devis' && (
                        <div>
                            {/* Header avec recherche et filtres */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '2rem',
                                flexWrap: 'wrap',
                                gap: '1.5rem'
                            }}>
                                <div>
                                    <h2 style={{ 
                                        fontSize: '1.8rem', 
                                        fontWeight: 700, 
                                        color: colors.gray900,
                                        letterSpacing: '-0.5px',
                                        marginBottom: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <i className="bi bi-file-earmark-text" style={{ color: colors.primary }}></i>
                                        Mes devis
                                    </h2>
                                    <p style={{ 
                                        color: colors.gray500, 
                                        fontSize: '0.95rem',
                                        marginLeft: '2.5rem'
                                    }}>
                                        {filteredDevis.length} devis trouvés
                                    </p>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Barre de recherche */}
                                    <div style={{ 
                                        position: 'relative', 
                                        minWidth: '300px'
                                    }}>
                                        <i className="bi bi-search" style={{
                                            position: 'absolute',
                                            left: '1.25rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: colors.gray400,
                                            fontSize: '0.95rem'
                                        }}></i>
                                        <input
                                            type="text"
                                            placeholder="Rechercher un devis..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.9rem 1rem 0.9rem 3rem',
                                                border: `1px solid ${colors.gray200}`,
                                                borderRadius: '16px',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                transition: 'all 0.2s',
                                                backgroundColor: colors.gray50
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = colors.primary;
                                                e.target.style.backgroundColor = colors.white;
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = colors.gray200;
                                                e.target.style.backgroundColor = colors.gray50;
                                            }}
                                        />
                                    </div>

                                    {/* Bouton Filtres */}
                                    <motion.button
                                        whileHover={{ backgroundColor: colors.gray200 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowFilters(!showFilters)}
                                        style={{
                                            padding: '0.9rem 1.5rem',
                                            background: showFilters ? colors.primary : colors.white,
                                            color: showFilters ? 'white' : colors.gray700,
                                            border: `1px solid ${showFilters ? colors.primary : colors.gray200}`,
                                            borderRadius: '16px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <i className="bi bi-funnel"></i>
                                        Filtres
                                        {filterStatus !== 'all' || filterServiceType !== 'all' ? (
                                            <span style={{
                                                background: showFilters ? 'rgba(255,255,255,0.2)' : colors.primary,
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '30px',
                                                fontSize: '0.75rem'
                                            }}>
                                                {(filterStatus !== 'all' ? 1 : 0) + (filterServiceType !== 'all' ? 1 : 0)}
                                            </span>
                                        ) : null}
                                    </motion.button>

                                    {/* Bouton Nouveau Devis */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: colors.shadowLg }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleDemandeDevis('parcours')}
                                        style={{
                                            padding: '0.9rem 1.75rem',
                                            background: colors.primaryGradient,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: '0.95rem',
                                            boxShadow: colors.shadowMd
                                        }}
                                    >
                                        <i className="bi bi-plus-lg"></i>
                                        Nouveau devis
                                    </motion.button>
                                </div>
                            </div>
                            
                            {/* Panneau de filtres */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            background: colors.gray50,
                                            borderRadius: '20px',
                                            padding: '1.75rem',
                                            marginBottom: '2rem',
                                            border: `1px solid ${colors.gray200}`,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                                            gap: '2rem' 
                                        }}>
                                            {/* Filtre par statut */}
                                            <div>
                                                <p style={{ 
                                                    marginBottom: '1rem', 
                                                    fontWeight: 600, 
                                                    color: colors.gray700,
                                                    fontSize: '0.95rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <i className="bi bi-tag"></i>
                                                    Statut
                                                </p>
                                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setFilterStatus('all')}
                                                        style={{
                                                            padding: '0.6rem 1.25rem',
                                                            background: filterStatus === 'all' ? colors.primary : colors.white,
                                                            color: filterStatus === 'all' ? 'white' : colors.gray700,
                                                            border: `1px solid ${filterStatus === 'all' ? colors.primary : colors.gray300}`,
                                                            borderRadius: '40px',
                                                            fontSize: '0.9rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        Tous
                                                    </motion.button>
                                                    {Object.keys(statusStats).map(status => (
                                                        <motion.button
                                                            key={status}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setFilterStatus(status)}
                                                            style={{
                                                                padding: '0.6rem 1.25rem',
                                                                background: filterStatus === status ? getStatusColor(status) : colors.white,
                                                                color: filterStatus === status ? 'white' : colors.gray700,
                                                                border: `1px solid ${filterStatus === status ? getStatusColor(status) : colors.gray300}`,
                                                                borderRadius: '40px',
                                                                fontSize: '0.9rem',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                        >
                                                            <i className={`bi ${getStatusIcon(status)}`}></i>
                                                            {getStatusLabel(status)}
                                                            <span style={{ 
                                                                background: filterStatus === status ? 'rgba(255,255,255,0.2)' : colors.gray100,
                                                                padding: '2px 8px',
                                                                borderRadius: '30px',
                                                                fontSize: '0.8rem'
                                                            }}>
                                                                {statusStats[status]}
                                                            </span>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Filtre par type de service */}
                                            <div>
                                                <p style={{ 
                                                    marginBottom: '1rem', 
                                                    fontWeight: 600, 
                                                    color: colors.gray700,
                                                    fontSize: '0.95rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <i className="bi bi-grid-3x3"></i>
                                                    Type de service
                                                </p>
                                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setFilterServiceType('all')}
                                                        style={{
                                                            padding: '0.6rem 1.25rem',
                                                            background: filterServiceType === 'all' ? colors.primary : colors.white,
                                                            color: filterServiceType === 'all' ? 'white' : colors.gray700,
                                                            border: `1px solid ${filterServiceType === 'all' ? colors.primary : colors.gray300}`,
                                                            borderRadius: '40px',
                                                            fontSize: '0.9rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                    >
                                                        Tous
                                                    </motion.button>
                                                    {Object.keys(statsByServiceType).map(type => (
                                                        <motion.button
                                                            key={type}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setFilterServiceType(type)}
                                                            style={{
                                                                padding: '0.6rem 1.25rem',
                                                                background: filterServiceType === type ? getServiceColor(type) : colors.white,
                                                                color: filterServiceType === type ? 'white' : colors.gray700,
                                                                border: `1px solid ${filterServiceType === type ? getServiceColor(type) : colors.gray300}`,
                                                                borderRadius: '40px',
                                                                fontSize: '0.9rem',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                        >
                                                            <i className={`bi ${getServiceIcon(type)}`}></i>
                                                            {getServiceTypeLabel(type)}
                                                            <span style={{ 
                                                                background: filterServiceType === type ? 'rgba(255,255,255,0.2)' : colors.gray100,
                                                                padding: '2px 8px',
                                                                borderRadius: '30px',
                                                                fontSize: '0.8rem'
                                                            }}>
                                                                {statsByServiceType[type]}
                                                            </span>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Liste des devis */}
                            {filteredDevis.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ 
                                        textAlign: 'center', 
                                        padding: '5rem 2rem',
                                        background: colors.gray50,
                                        borderRadius: '24px',
                                        border: `2px dashed ${colors.gray300}`
                                    }}
                                >
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        background: colors.gray100,
                                        borderRadius: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1.5rem',
                                        fontSize: '3rem',
                                        color: colors.gray400
                                    }}>
                                        <i className="bi bi-file-earmark"></i>
                                    </div>
                                    <h3 style={{ 
                                        fontSize: '1.5rem', 
                                        fontWeight: 700, 
                                        color: colors.gray700,
                                        marginBottom: '0.75rem'
                                    }}>
                                        Aucun devis trouvé
                                    </h3>
                                    <p style={{ 
                                        fontSize: '1rem', 
                                        color: colors.gray500,
                                        marginBottom: '2rem',
                                        maxWidth: '500px',
                                        margin: '0 auto 2rem'
                                    }}>
                                        {devis.length === 0 
                                            ? "Vous n'avez pas encore de devis. Lancez-vous en créant votre première demande !"
                                            : "Aucun devis ne correspond aux filtres sélectionnés."}
                                    </p>
                                    {devis.length === 0 && (
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '1rem', 
                                            justifyContent: 'center', 
                                            flexWrap: 'wrap' 
                                        }}>
                                            {['parcours', 'coaching', 'formation', 'teambuilding'].map((type) => (
                                                <motion.button
                                                    key={type}
                                                    whileHover={{ scale: 1.05, y: -3 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleDemandeDevis(type)}
                                                    style={{
                                                        padding: '1rem 2rem',
                                                        background: getServiceColor(type),
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        fontSize: '1rem',
                                                        boxShadow: colors.shadowLg
                                                    }}
                                                >
                                                    <i className={`bi ${getServiceIcon(type)}`}></i>
                                                    {getServiceTypeLabel(type)}
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                    style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', 
                                        gap: '1.5rem'
                                    }}
                                >
                                    {filteredDevis.map((devisItem) => (
                                        <motion.div
                                            key={devisItem.id}
                                            variants={fadeInUp}
                                            whileHover={{ y: -6, boxShadow: colors.shadowXl }}
                                            style={{
                                                background: colors.white,
                                                borderRadius: '24px',
                                                padding: '1.75rem',
                                                border: `1px solid ${colors.gray200}`,
                                                position: 'relative',
                                                boxShadow: colors.shadowMd,
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {/* Badges */}
                                            <div style={{ 
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '1.5rem'
                                            }}>
                                                {/* Status Badge */}
                                                <div style={{ 
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    background: `${getStatusColor(devisItem.status)}10`,
                                                    color: getStatusColor(devisItem.status),
                                                    borderRadius: '40px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    border: `1px solid ${getStatusColor(devisItem.status)}30`
                                                }}>
                                                    <i className={`bi ${getStatusIcon(devisItem.status)}`}></i>
                                                    {getStatusLabel(devisItem.status)}
                                                </div>
                                                
                                                {/* Service Type Badge */}
                                                <div style={{ 
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    background: `${getServiceColor(devisItem.serviceType)}10`,
                                                    color: getServiceColor(devisItem.serviceType),
                                                    borderRadius: '40px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600
                                                }}>
                                                    <i className={`bi ${getServiceIcon(devisItem.serviceType)}`}></i>
                                                    {getServiceTypeLabel(devisItem.serviceType)}
                                                </div>
                                            </div>
                                            
                                            {/* Titre du service */}
                                            <h3 style={{ 
                                                fontSize: '1.25rem', 
                                                fontWeight: 700, 
                                                marginBottom: '0.5rem',
                                                color: colors.gray900
                                            }}>
                                                {devisItem.serviceTitle || 'Service sans titre'}
                                            </h3>
                                            
                                            {devisItem.serviceCategory && (
                                                <p style={{ 
                                                    fontSize: '0.9rem', 
                                                    color: colors.gray500,
                                                    marginBottom: '1.25rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <i className="bi bi-tag" style={{ color: getServiceColor(devisItem.serviceType) }}></i>
                                                    {devisItem.serviceCategory}
                                                </p>
                                            )}
                                            
                                            {/* Informations détaillées */}
                                            <div style={{ 
                                                background: colors.gray50,
                                                borderRadius: '18px',
                                                padding: '1.25rem',
                                                marginBottom: '1.5rem'
                                            }}>
                                                <div style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                                    gap: '1.25rem'
                                                }}>
                                                    <div>
                                                        <p style={{ 
                                                            fontSize: '0.75rem', 
                                                            color: colors.gray500, 
                                                            marginBottom: '0.25rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontWeight: 600
                                                        }}>
                                                            <i className="bi bi-building" style={{ marginRight: '0.5rem' }}></i>
                                                            Entreprise
                                                        </p>
                                                        <p style={{ 
                                                            fontSize: '0.95rem', 
                                                            fontWeight: 600, 
                                                            color: colors.gray900 
                                                        }}>
                                                            {devisItem.entreprise}
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p style={{ 
                                                            fontSize: '0.75rem', 
                                                            color: colors.gray500, 
                                                            marginBottom: '0.25rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontWeight: 600
                                                        }}>
                                                            <i className="bi bi-calendar" style={{ marginRight: '0.5rem' }}></i>
                                                            Date prévue
                                                        </p>
                                                        <p style={{ 
                                                            fontSize: '0.95rem', 
                                                            fontWeight: 600, 
                                                            color: colors.gray900 
                                                        }}>
                                                            {formatDate(devisItem.datePrevue)}
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p style={{ 
                                                            fontSize: '0.75rem', 
                                                            color: colors.gray500, 
                                                            marginBottom: '0.25rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontWeight: 600
                                                        }}>
                                                            <i className="bi bi-geo-alt" style={{ marginRight: '0.5rem' }}></i>
                                                            Lieu
                                                        </p>
                                                        <p style={{ 
                                                            fontSize: '0.95rem', 
                                                            fontWeight: 600, 
                                                            color: colors.gray900 
                                                        }}>
                                                            {devisItem.lieu}
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p style={{ 
                                                            fontSize: '0.75rem', 
                                                            color: colors.gray500, 
                                                            marginBottom: '0.25rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            fontWeight: 600
                                                        }}>
                                                            <i className="bi bi-clock" style={{ marginRight: '0.5rem' }}></i>
                                                            Demandé le
                                                        </p>
                                                        <p style={{ 
                                                            fontSize: '0.95rem', 
                                                            fontWeight: 600, 
                                                            color: colors.gray900 
                                                        }}>
                                                            {formatDateTime(devisItem.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Commentaire du client (message initial) */}
                                            {devisItem.message && (
                                                <div style={{ 
                                                    marginBottom: '1.5rem',
                                                    padding: '1rem',
                                                    background: `${colors.primary}08`,
                                                    borderRadius: '14px',
                                                    border: `1px solid ${colors.primary}20`,
                                                    position: 'relative'
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        left: '20px',
                                                        background: colors.primary,
                                                        color: 'white',
                                                        padding: '2px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600
                                                    }}>
                                                        Votre message
                                                    </div>
                                                    <p style={{ 
                                                        fontSize: '0.95rem', 
                                                        color: colors.gray700,
                                                        marginTop: '0.5rem',
                                                        lineHeight: '1.6',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        "{devisItem.message}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Commentaires admin et réponses */}
                                            {devisItem.comments && devisItem.comments.length > 0 && (
                                                <div style={{ 
                                                    marginBottom: '1.5rem',
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                    padding: '0.5rem'
                                                }}>
                                                    <p style={{ 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: 600, 
                                                        color: colors.gray600,
                                                        marginBottom: '1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <i className="bi bi-chat-dots"></i>
                                                        Conversation avec l'administrateur
                                                    </p>
                                                    
                                                    {devisItem.comments.map((comment, idx) => (
                                                        <div 
                                                            key={comment.id || idx}
                                                            style={{
                                                                display: 'flex',
                                                                marginBottom: '1rem',
                                                                justifyContent: comment.isFromClient ? 'flex-end' : 'flex-start'
                                                            }}
                                                        >
                                                            <div style={{
                                                                maxWidth: '80%',
                                                                padding: '0.75rem 1rem',
                                                                background: comment.isFromClient ? colors.primaryGradient : colors.gray200,
                                                                color: comment.isFromClient ? 'white' : colors.gray800,
                                                                borderRadius: comment.isFromClient 
                                                                    ? '18px 18px 4px 18px' 
                                                                    : '18px 18px 18px 4px',
                                                                position: 'relative',
                                                                boxShadow: colors.shadowSm
                                                            }}>
                                                                <div style={{ 
                                                                    fontSize: '0.85rem', 
                                                                    marginBottom: '0.25rem',
                                                                    fontWeight: 600,
                                                                    opacity: comment.isFromClient ? 0.9 : 0.8
                                                                }}>
                                                                    {comment.isFromClient ? 'Vous' : 'Admin'}
                                                                    {comment.isFromAdmin && ' • Support'}
                                                                </div>
                                                                <p style={{ 
                                                                    fontSize: '0.9rem', 
                                                                    margin: 0,
                                                                    lineHeight: '1.5'
                                                                }}>
                                                                    {comment.content}
                                                                </p>
                                                                <div style={{ 
                                                                    fontSize: '0.65rem', 
                                                                    marginTop: '0.25rem',
                                                                    textAlign: 'right',
                                                                    opacity: 0.7
                                                                }}>
                                                                    {formatDateTime(comment.createdAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Indicateur de messages non lus */}
                                            {devisItem.unreadComments > 0 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '1.75rem',
                                                    right: '1.75rem',
                                                    background: colors.danger,
                                                    color: 'white',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    border: `2px solid ${colors.white}`,
                                                    boxShadow: colors.shadowMd
                                                }}>
                                                    {devisItem.unreadComments}
                                                </div>
                                            )}
                                            
                                            {/* Montant et actions */}
                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '1.5rem'
                                            }}>
                                                <div>
                                                    <p style={{ 
                                                        fontSize: '0.8rem', 
                                                        color: colors.gray500,
                                                        marginBottom: '0.25rem',
                                                        fontWeight: 500
                                                    }}>
                                                        Montant estimé
                                                    </p>
                                                    <div style={{ 
                                                        fontSize: '1.75rem', 
                                                        fontWeight: 800, 
                                                        color: colors.primary,
                                                        letterSpacing: '-0.5px'
                                                    }}>
                                                        {formatCurrency(devisItem.montantFinal, devisItem.devise || 'TND')}
                                                    </div>
                                                </div>
                                                
                                                {devisItem.fichierPdf && (
                                                    <div style={{ 
                                                        background: `${colors.success}10`,
                                                        padding: '0.6rem 1.25rem',
                                                        borderRadius: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        color: colors.success,
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        border: `1px solid ${colors.success}30`
                                                    }}>
                                                        <i className="bi bi-file-pdf-fill"></i>
                                                        PDF prêt
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Boutons d'action */}
                                            <div style={{ 
                                                display: 'flex', 
                                                gap: '0.75rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                {/* Bouton Messages/Conversation */}
                                                <motion.button
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleViewMessages(devisItem)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.9rem',
                                                        background: colors.info,
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '14px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.75rem',
                                                        boxShadow: colors.shadowMd
                                                    }}
                                                >
                                                    <i className="bi bi-chat-dots"></i>
                                                    Messages
                                                    {devisItem.comments && devisItem.comments.length > 0 && (
                                                        <span style={{
                                                            background: 'rgba(255,255,255,0.2)',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            {devisItem.comments.length}
                                                        </span>
                                                    )}
                                                </motion.button>

                                                {devisItem.fichierPdf ? (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleViewPDF(devisItem)}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.9rem',
                                                                background: colors.primaryGradient,
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '14px',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.75rem',
                                                                boxShadow: colors.shadowMd
                                                            }}
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                            Visualiser
                                                        </motion.button>
                                                        
                                                        <motion.button
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleDownloadPDF(devisItem.id)}
                                                            style={{
                                                                padding: '0.9rem 1.25rem',
                                                                background: colors.white,
                                                                color: colors.primary,
                                                                border: `2px solid ${colors.primary}`,
                                                                borderRadius: '14px',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.75rem'
                                                            }}
                                                        >
                                                            <i className="bi bi-download"></i>
                                                            PDF
                                                        </motion.button>
                                                    </>
                                                ) : (
                                                    <div style={{ 
                                                        flex: 1,
                                                        padding: '0.9rem',
                                                        background: `${colors.warning}10`,
                                                        borderRadius: '14px',
                                                        border: `1px solid ${colors.warning}30`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.75rem',
                                                        color: colors.warning,
                                                        fontWeight: 600
                                                    }}>
                                                        <i className="bi bi-hourglass-split"></i>
                                                        En attente du devis PDF
                                                    </div>
                                                )}
                                                
                                                {devisItem.status === 'en attente' && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02, backgroundColor: colors.danger }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleDeleteDevis(devisItem.id)}
                                                        style={{
                                                            padding: '0.9rem 1.25rem',
                                                            background: colors.white,
                                                            color: colors.danger,
                                                            border: `2px solid ${colors.danger}`,
                                                            borderRadius: '14px',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.75rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title="Supprimer cette demande"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                        Supprimer
                                                    </motion.button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* 📋 TAB QUESTIONNAIRES */}
                    {activeTab === 'forms' && (
                        <div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '2rem'
                            }}>
                                <div>
                                    <h2 style={{ 
                                        fontSize: '1.8rem', 
                                        fontWeight: 700, 
                                        color: colors.gray900,
                                        letterSpacing: '-0.5px',
                                        marginBottom: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <i className="bi bi-ui-checks" style={{ color: colors.primary }}></i>
                                        Questionnaires
                                    </h2>
                                    <p style={{ 
                                        color: colors.gray500, 
                                        fontSize: '0.95rem',
                                        marginLeft: '2.5rem'
                                    }}>
                                        {googleForms.length} formulaires disponibles
                                    </p>
                                </div>
                                
                                <div style={{ 
                                    padding: '0.6rem 1.25rem',
                                    background: colors.primarySoft,
                                    color: colors.primary,
                                    border: `1px solid ${colors.primary}30`,
                                    borderRadius: '40px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="bi bi-shield-check"></i>
                                    Sécurisé
                                </div>
                            </div>
                            
                            <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                                    gap: '1.5rem',
                                    marginBottom: '2rem'
                                }}
                            >
                                {googleForms.map((form, index) => (
                                    <motion.div
                                        key={form.id}
                                        variants={fadeInUp}
                                        whileHover={{ y: -6, boxShadow: colors.shadowXl }}
                                        style={{
                                            background: colors.white,
                                            borderRadius: '24px',
                                            padding: '1.75rem',
                                            border: `1px solid ${colors.gray200}`,
                                            position: 'relative',
                                            boxShadow: colors.shadowMd,
                                            cursor: 'pointer',
                                            overflow: 'hidden'
                                        }}
                                        onClick={() => handleOpenGoogleForm(form.url)}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '6px',
                                            height: '100%',
                                            background: form.color
                                        }}></div>
                                        
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '1rem',
                                            marginBottom: '1.25rem'
                                        }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                background: `${form.color}10`,
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: form.color,
                                                fontSize: '1.8rem'
                                            }}>
                                                <i className={`bi ${form.icon}`}></i>
                                            </div>
                                            <div>
                                                <h3 style={{ 
                                                    fontSize: '1.25rem', 
                                                    fontWeight: 700, 
                                                    color: colors.gray900,
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {form.title}
                                                </h3>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: `${form.color}10`,
                                                    color: form.color,
                                                    borderRadius: '30px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {form.category}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <p style={{ 
                                            fontSize: '0.95rem', 
                                            color: colors.gray600,
                                            marginBottom: '1.5rem',
                                            lineHeight: '1.6'
                                        }}>
                                            {form.description}
                                        </p>
                                        
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            paddingTop: '1.25rem',
                                            borderTop: `1px solid ${colors.gray200}`
                                        }}>
                                            <span style={{ 
                                                fontSize: '0.9rem', 
                                                color: form.color,
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <i className="bi bi-box-arrow-up-right"></i>
                                                Ouvrir le formulaire
                                            </span>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: `${form.color}10`,
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: form.color,
                                                fontSize: '1.1rem'
                                            }}>
                                                <i className="bi bi-arrow-right"></i>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                            
                            {/* Guide d'utilisation */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{ 
                                    background: colors.gray50,
                                    borderRadius: '20px',
                                    padding: '1.75rem',
                                    border: `1px solid ${colors.gray200}`
                                }}
                            >
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: colors.primarySoft,
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: colors.primary,
                                        fontSize: '1.4rem'
                                    }}>
                                        <i className="bi bi-lightbulb"></i>
                                    </div>
                                    <h3 style={{ 
                                        fontSize: '1.2rem', 
                                        fontWeight: 700, 
                                        color: colors.gray900 
                                    }}>
                                        Comment utiliser les questionnaires ?
                                    </h3>
                                </div>
                                
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                    gap: '1.5rem'
                                }}>
                                    {[
                                        { step: '1', title: 'Cliquez', desc: 'Sur le formulaire souhaité', icon: 'bi-hand-index', color: colors.primary },
                                        { step: '2', title: 'Remplissez', desc: 'Toutes les questions', icon: 'bi-pencil-square', color: colors.success },
                                        { step: '3', title: 'Soumettez', desc: 'Vos réponses', icon: 'bi-send-check', color: colors.info }
                                    ].map((item) => (
                                        <div key={item.step} style={{ 
                                            display: 'flex', 
                                            gap: '1rem', 
                                            alignItems: 'center',
                                            padding: '1rem',
                                            background: colors.white,
                                            borderRadius: '16px'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: `${item.color}10`,
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: item.color,
                                                fontSize: '1.2rem'
                                            }}>
                                                <i className={`bi ${item.icon}`}></i>
                                            </div>
                                            <div>
                                                <div style={{ 
                                                    fontSize: '1rem', 
                                                    fontWeight: 700, 
                                                    color: colors.gray900 
                                                }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.85rem', 
                                                    color: colors.gray500 
                                                }}>
                                                    {item.desc}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div style={{ 
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: colors.white,
                                    borderRadius: '12px',
                                    borderLeft: `6px solid ${colors.primary}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <i className="bi bi-shield-lock-fill" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                                    <p style={{ fontSize: '0.9rem', color: colors.gray600, margin: 0 }}>
                                        <strong>Confidentialité garantie :</strong> Tous vos retours sont anonymes et sécurisés. Ils nous aident à améliorer nos services.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* 📋 TAB PROFIL */}
                    {activeTab === 'profile' && (
                        <div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '2.5rem'
                            }}>
                                <div>
                                    <h2 style={{ 
                                        fontSize: '1.8rem', 
                                        fontWeight: 700, 
                                        color: colors.gray900,
                                        letterSpacing: '-0.5px',
                                        marginBottom: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <i className="bi bi-person" style={{ color: colors.primary }}></i>
                                        Mon profil
                                    </h2>
                                    <p style={{ 
                                        color: colors.gray500, 
                                        fontSize: '0.95rem',
                                        marginLeft: '2.5rem'
                                    }}>
                                        Gérez vos informations personnelles
                                    </p>
                                </div>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: colors.shadowLg }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowProfileEdit(true)}
                                    style={{
                                        padding: '0.9rem 1.75rem',
                                        background: colors.primaryGradient,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '0.95rem',
                                        boxShadow: colors.shadowMd
                                    }}
                                >
                                    <i className="bi bi-pencil"></i>
                                    Modifier le profil
                                </motion.button>
                            </div>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1.2fr 0.8fr', 
                                gap: '2rem'
                            }}>
                                {/* Informations personnelles */}
                                <div>
                                    <div style={{
                                        background: colors.gray50,
                                        borderRadius: '24px',
                                        padding: '2rem',
                                        border: `1px solid ${colors.gray200}`
                                    }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '1.5rem',
                                            marginBottom: '2rem'
                                        }}>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                background: colors.primaryGradient,
                                                borderRadius: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '2.2rem',
                                                fontWeight: '700',
                                                boxShadow: colors.shadowLg
                                            }}>
                                                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <h3 style={{ 
                                                    fontSize: '1.5rem', 
                                                    fontWeight: 700, 
                                                    color: colors.gray900,
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {user?.name || 'Non spécifié'}
                                                </h3>
                                                <p style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    color: colors.gray500,
                                                    fontSize: '0.95rem'
                                                }}>
                                                    <i className="bi bi-envelope"></i>
                                                    {user?.email || 'Non spécifié'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '1fr 1fr', 
                                            gap: '1.5rem'
                                        }}>
                                            <div>
                                                <p style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: colors.gray500, 
                                                    marginBottom: '0.25rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 600
                                                }}>
                                                    <i className="bi bi-briefcase" style={{ marginRight: '0.5rem' }}></i>
                                                    Entreprise
                                                </p>
                                                <p style={{ 
                                                    fontSize: '1rem', 
                                                    fontWeight: 600, 
                                                    color: colors.gray900,
                                                    background: colors.white,
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${colors.gray200}`
                                                }}>
                                                    {user?.company || 'Non spécifiée'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <p style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: colors.gray500, 
                                                    marginBottom: '0.25rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 600
                                                }}>
                                                    <i className="bi bi-telephone" style={{ marginRight: '0.5rem' }}></i>
                                                    Téléphone
                                                </p>
                                                <p style={{ 
                                                    fontSize: '1rem', 
                                                    fontWeight: 600, 
                                                    color: colors.gray900,
                                                    background: colors.white,
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${colors.gray200}`
                                                }}>
                                                    {user?.phone || 'Non spécifié'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <p style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: colors.gray500, 
                                                    marginBottom: '0.25rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 600
                                                }}>
                                                    <i className="bi bi-file-earmark-text" style={{ marginRight: '0.5rem' }}></i>
                                                    Matricule Fiscale
                                                </p>
                                                <p style={{ 
                                                    fontSize: '1rem', 
                                                    fontWeight: 600, 
                                                    color: colors.gray900,
                                                    background: colors.white,
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${colors.gray200}`
                                                }}>
                                                    {user?.matriculeFiscale || 'Non spécifié'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <p style={{ 
                                                    fontSize: '0.8rem', 
                                                    color: colors.gray500, 
                                                    marginBottom: '0.25rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 600
                                                }}>
                                                    <i className="bi bi-calendar-check" style={{ marginRight: '0.5rem' }}></i>
                                                    Membre depuis
                                                </p>
                                                <p style={{ 
                                                    fontSize: '1rem', 
                                                    fontWeight: 600, 
                                                    color: colors.gray900,
                                                    background: colors.white,
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${colors.gray200}`
                                                }}>
                                                    {user?.createdAt ? formatDate(user.createdAt) : 'Non spécifiée'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Statistiques */}
                                <div>
                                    <div style={{
                                        background: colors.primaryGradient,
                                        borderRadius: '24px',
                                        padding: '2rem',
                                        color: 'white',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <h3 style={{ 
                                            fontSize: '1.25rem', 
                                            fontWeight: 700, 
                                            marginBottom: '1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}>
                                            <i className="bi bi-graph-up"></i>
                                            Mes statistiques
                                        </h3>
                                        
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '1rem',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '18px',
                                                padding: '1.25rem',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.2)'
                                            }}>
                                                <p style={{ 
                                                    fontSize: '0.75rem', 
                                                    opacity: 0.9,
                                                    marginBottom: '0.25rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    Total devis
                                                </p>
                                                <p style={{ 
                                                    fontSize: '2.5rem', 
                                                    fontWeight: 800, 
                                                    lineHeight: 1,
                                                    marginBottom: '0.25rem'
                                                }}>
                                                    {devis.length}
                                                </p>
                                                <p style={{ 
                                                    fontSize: '0.8rem', 
                                                    opacity: 0.8,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    <i className="bi bi-arrow-up"></i>
                                                    +{devis.filter(d => d.status === 'validé').length} validés
                                                </p>
                                            </div>
                                            
                                            <div style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '18px',
                                                padding: '1.25rem',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.2)'
                                            }}>
                                                <p style={{ 
                                                    fontSize: '0.75rem', 
                                                    opacity: 0.9,
                                                    marginBottom: '0.25rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    En attente
                                                </p>
                                                <p style={{ 
                                                    fontSize: '2.5rem', 
                                                    fontWeight: 800, 
                                                    lineHeight: 1,
                                                    marginBottom: '0.25rem',
                                                    color: colors.warningLight
                                                }}>
                                                    {devis.filter(d => d.status === 'en attente').length}
                                                </p>
                                                <p style={{ 
                                                    fontSize: '0.8rem', 
                                                    opacity: 0.8 
                                                }}>
                                                    Réponse sous 48h
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '18px',
                                            padding: '1.5rem',
                                            marginTop: 'auto',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}>
                                            <p style={{ 
                                                fontSize: '0.9rem', 
                                                fontWeight: 600,
                                                marginBottom: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <i className="bi bi-pie-chart"></i>
                                                Répartition par service
                                            </p>
                                            {Object.entries(statsByServiceType).map(([type, count]) => (
                                                <div key={type} style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.5rem'
                                                    }}>
                                                        <i className={`bi ${getServiceIcon(type)}`} style={{ opacity: 0.9 }}></i>
                                                        <span style={{ fontSize: '0.85rem' }}>{getServiceTypeLabel(type)}</span>
                                                    </div>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '0.75rem'
                                                    }}>
                                                        <span style={{ 
                                                            fontWeight: 700, 
                                                            fontSize: '1.1rem' 
                                                        }}>
                                                            {count}
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: '0.8rem', 
                                                            opacity: 0.8 
                                                        }}>
                                                            {devis.length > 0 ? Math.round((count / devis.length) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* 📝 MODAL DEMANDE DEVIS - DESIGN LUXE */}
            {showDevisModal && (
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
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{
                            background: colors.white,
                            borderRadius: '32px',
                            padding: '0',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            boxShadow: colors.shadow2xl,
                            border: `1px solid ${colors.gray200}`
                        }}
                    >
                        {/* Header Modal */}
                        <div style={{
                            background: colors.primaryGradient,
                            padding: '2rem',
                            color: 'white',
                            position: 'relative'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start'
                            }}>
                                <div>
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <h3 style={{ 
                                            fontSize: '1.8rem', 
                                            fontWeight: 800, 
                                            marginBottom: '0.5rem',
                                            letterSpacing: '-0.5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}>
                                            <i className="bi bi-file-earmark-plus"></i>
                                            Demande de devis
                                        </h3>
                                        <p style={{ 
                                            opacity: 0.9, 
                                            fontSize: '1rem',
                                            maxWidth: '600px'
                                        }}>
                                            Complétez ces informations pour recevoir un devis détaillé et personnalisé
                                        </p>
                                    </motion.div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowDevisModal(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '14px',
                                        color: 'white',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    ×
                                </motion.button>
                            </div>
                            
                            {/* Progress Steps */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '2rem'
                            }}>
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            background: step === 1 ? 'white' : 'rgba(255,255,255,0.2)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: step === 1 ? colors.primary : 'white',
                                            fontWeight: '700',
                                            fontSize: '0.95rem',
                                            border: step === 1 ? 'none' : '1px solid rgba(255,255,255,0.3)'
                                        }}>
                                            {step}
                                        </div>
                                        {step < 3 && (
                                            <div style={{
                                                flex: 1,
                                                height: '4px',
                                                background: 'rgba(255,255,255,0.2)',
                                                borderRadius: '2px',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    height: '100%',
                                                    width: step === 1 ? '40%' : '0%',
                                                    background: 'white',
                                                    borderRadius: '2px'
                                                }}></div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Body Modal */}
                        <div style={{ 
                            padding: '2rem',
                            maxHeight: '60vh',
                            overflowY: 'auto'
                        }}>
                            <form onSubmit={handleSubmitDevis}>
                                {/* Section 1: Choix du service */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    style={{ marginBottom: '2rem' }}
                                >
                                    <h4 style={{ 
                                        fontSize: '1.2rem', 
                                        fontWeight: 700, 
                                        color: colors.gray900,
                                        marginBottom: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <span style={{
                                            width: '32px',
                                            height: '32px',
                                            background: colors.primarySoft,
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colors.primary,
                                            fontSize: '1rem'
                                        }}>
                                            1
                                        </span>
                                        Choisissez votre service
                                    </h4>
                                    
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(2, 1fr)', 
                                        gap: '1rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {[
                                            { 
                                                type: 'parcours', 
                                                label: 'Parcours', 
                                                icon: 'bi-signpost-2',
                                                description: 'Programmes sur mesure'
                                            },
                                            { 
                                                type: 'coaching', 
                                                label: 'Coaching', 
                                                icon: 'bi-person-arms-up',
                                                description: 'Accompagnement individuel'
                                            },
                                            { 
                                                type: 'formation', 
                                                label: 'Formation', 
                                                icon: 'bi-book-half',
                                                description: 'Sessions certifiantes'
                                            },
                                            { 
                                                type: 'teambuilding', 
                                                label: 'Team Building', 
                                                icon: 'bi-people-fill',
                                                description: 'Cohésion d\'équipe'
                                            }
                                        ].map((service) => (
                                            <motion.div
                                                key={service.type}
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleServiceTypeChange(service.type)}
                                                style={{
                                                    padding: '1.25rem',
                                                    background: serviceType === service.type ? `${getServiceColor(service.type)}08` : colors.white,
                                                    border: `2px solid ${serviceType === service.type ? getServiceColor(service.type) : colors.gray200}`,
                                                    borderRadius: '18px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    position: 'relative'
                                                }}
                                            >
                                                {serviceType === service.type && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        color: getServiceColor(service.type),
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        <i className="bi bi-check-circle-fill"></i>
                                                    </div>
                                                )}
                                                
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.75rem'
                                                }}>
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        background: serviceType === service.type ? getServiceColor(service.type) : colors.gray200,
                                                        borderRadius: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontSize: '1.4rem'
                                                    }}>
                                                        <i className={`bi ${service.icon}`}></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ 
                                                            fontSize: '1rem', 
                                                            fontWeight: 700, 
                                                            color: serviceType === service.type ? getServiceColor(service.type) : colors.gray900,
                                                            marginBottom: '2px'
                                                        }}>
                                                            {service.label}
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '0.8rem', 
                                                            color: serviceType === service.type ? getServiceColor(service.type) : colors.gray500
                                                        }}>
                                                            {service.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Sélection du programme */}
                                    <div style={{ 
                                        background: colors.gray50, 
                                        padding: '1.5rem',
                                        borderRadius: '20px',
                                        border: `1px solid ${colors.gray200}`
                                    }}>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.75rem', 
                                            fontWeight: 600, 
                                            color: colors.gray700,
                                            fontSize: '0.95rem'
                                        }}>
                                            Programme spécifique *
                                        </label>
                                        <select
                                            value={devisForm.serviceId}
                                            onChange={(e) => {
                                                const serviceList = getServiceList();
                                                const selected = serviceList.find(s => s.id == e.target.value);
                                                setDevisForm({
                                                    ...devisForm, 
                                                    serviceId: e.target.value,
                                                    serviceTitle: selected?.title || '',
                                                    serviceCategory: selected?.category || ''
                                                });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1.25rem',
                                                border: `2px solid ${colors.gray300}`,
                                                borderRadius: '16px',
                                                fontSize: '1rem',
                                                background: colors.white,
                                                cursor: 'pointer',
                                                outline: 'none',
                                                transition: 'all 0.2s',
                                                color: colors.gray700
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = colors.primary;
                                                e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = colors.gray300;
                                                e.target.style.boxShadow = 'none';
                                            }}
                                            required
                                        >
                                            <option value="">-- Sélectionnez un programme --</option>
                                            {getServiceList().map(service => (
                                                <option 
                                                    key={service.id} 
                                                    value={service.id}
                                                >
                                                    {service.title} • {service.category}
                                                </option>
                                            ))}
                                        </select>
                                        
                                        {devisForm.serviceTitle && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                style={{ 
                                                    marginTop: '1rem',
                                                    padding: '1rem',
                                                    background: `${getServiceColor(serviceType)}08`,
                                                    borderRadius: '14px',
                                                    border: `1px solid ${getServiceColor(serviceType)}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem'
                                                }}
                                            >
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: getServiceColor(serviceType),
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white'
                                                }}>
                                                    <i className="bi bi-check-lg"></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: getServiceColor(serviceType) }}>
                                                        Programme sélectionné
                                                    </div>
                                                    <div style={{ fontSize: '0.95rem', color: colors.gray700 }}>
                                                        {devisForm.serviceTitle}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Section 2: Informations entreprise */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    style={{ marginBottom: '2rem' }}
                                >
                                    <h4 style={{ 
                                        fontSize: '1.2rem', 
                                        fontWeight: 700, 
                                        color: colors.gray900,
                                        marginBottom: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <span style={{
                                            width: '32px',
                                            height: '32px',
                                            background: colors.primarySoft,
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colors.primary,
                                            fontSize: '1rem'
                                        }}>
                                            2
                                        </span>
                                        Informations entreprise
                                    </h4>
                                    
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(2, 1fr)', 
                                        gap: '1.5rem'
                                    }}>
                                        <div>
                                            <label style={{ 
                                                display: 'block', 
                                                marginBottom: '0.5rem', 
                                                fontWeight: 600, 
                                                color: colors.gray700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Entreprise *
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <i className="bi bi-building" style={{
                                                    position: 'absolute',
                                                    left: '1.25rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: colors.gray400,
                                                    fontSize: '1.1rem'
                                                }}></i>
                                                <input
                                                    type="text"
                                                    value={devisForm.entreprise}
                                                    onChange={(e) => setDevisForm({...devisForm, entreprise: e.target.value})}
                                                    placeholder="Nom de votre entreprise"
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem 1rem 1rem 3rem',
                                                        border: `2px solid ${colors.gray300}`,
                                                        borderRadius: '16px',
                                                        fontSize: '0.95rem',
                                                        outline: 'none',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: colors.white
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = colors.primary;
                                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = colors.gray300;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ 
                                                display: 'block', 
                                                marginBottom: '0.5rem', 
                                                fontWeight: 600, 
                                                color: colors.gray700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Matricule Fiscale *
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <i className="bi bi-file-earmark-text" style={{
                                                    position: 'absolute',
                                                    left: '1.25rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: colors.gray400,
                                                    fontSize: '1.1rem'
                                                }}></i>
                                                <input
                                                    type="text"
                                                    value={devisForm.matriculeFiscale}
                                                    onChange={(e) => setDevisForm({...devisForm, matriculeFiscale: e.target.value})}
                                                    placeholder="12345678/A/M/000"
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem 1rem 1rem 3rem',
                                                        border: `2px solid ${colors.gray300}`,
                                                        borderRadius: '16px',
                                                        fontSize: '0.95rem',
                                                        outline: 'none',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: colors.white
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = colors.primary;
                                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = colors.gray300;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Section 3: Détails demande */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    style={{ marginBottom: '2rem' }}
                                >
                                    <h4 style={{ 
                                        fontSize: '1.2rem', 
                                        fontWeight: 700, 
                                        color: colors.gray900,
                                        marginBottom: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <span style={{
                                            width: '32px',
                                            height: '32px',
                                            background: colors.primarySoft,
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colors.primary,
                                            fontSize: '1rem'
                                        }}>
                                            3
                                        </span>
                                        Détails de votre demande
                                    </h4>
                                    
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(3, 1fr)', 
                                        gap: '1.5rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <div>
                                            <label style={{ 
                                                display: 'block', 
                                                marginBottom: '0.5rem', 
                                                fontWeight: 600, 
                                                color: colors.gray700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Participants *
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <i className="bi bi-people" style={{
                                                    position: 'absolute',
                                                    left: '1.25rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: colors.gray400,
                                                    fontSize: '1.1rem'
                                                }}></i>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={devisForm.participants}
                                                    onChange={(e) => setDevisForm({...devisForm, participants: parseInt(e.target.value) || 1})}
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem 1rem 1rem 3rem',
                                                        border: `2px solid ${colors.gray300}`,
                                                        borderRadius: '16px',
                                                        fontSize: '0.95rem',
                                                        outline: 'none',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: colors.white
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = colors.primary;
                                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = colors.gray300;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ 
                                                display: 'block', 
                                                marginBottom: '0.5rem', 
                                                fontWeight: 600, 
                                                color: colors.gray700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Durée *
                                            </label>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <div style={{ position: 'relative', flex: 1 }}>
                                                    <i className="bi bi-clock" style={{
                                                        position: 'absolute',
                                                        left: '1.25rem',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: colors.gray400,
                                                        fontSize: '1.1rem'
                                                    }}></i>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={devisForm.duree}
                                                        onChange={(e) => setDevisForm({...devisForm, duree: parseInt(e.target.value) || 1})}
                                                        style={{
                                                            width: '100%',
                                                            padding: '1rem 1rem 1rem 3rem',
                                                            border: `2px solid ${colors.gray300}`,
                                                            borderRadius: '16px',
                                                            fontSize: '0.95rem',
                                                            outline: 'none',
                                                            transition: 'all 0.2s',
                                                            backgroundColor: colors.white
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <select
                                                    value={devisForm.uniteDuree}
                                                    onChange={(e) => setDevisForm({...devisForm, uniteDuree: e.target.value})}
                                                    style={{
                                                        padding: '1rem',
                                                        border: `2px solid ${colors.gray300}`,
                                                        borderRadius: '16px',
                                                        fontSize: '0.95rem',
                                                        background: colors.white,
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                        minWidth: '130px',
                                                        color: colors.gray700
                                                    }}
                                                >
                                                    <option value="jours">Jours</option>
                                                    <option value="heures">Heures</option>
                                                    <option value="sessions">Sessions</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ 
                                                display: 'block', 
                                                marginBottom: '0.5rem', 
                                                fontWeight: 600, 
                                                color: colors.gray700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Devise
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <i className="bi bi-currency-exchange" style={{
                                                    position: 'absolute',
                                                    left: '1.25rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: colors.gray400,
                                                    fontSize: '1.1rem'
                                                }}></i>
                                                <select
                                                    value={devisForm.devise}
                                                    onChange={(e) => setDevisForm({...devisForm, devise: e.target.value})}
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem 1rem 1rem 3rem',
                                                        border: `2px solid ${colors.gray300}`,
                                                        borderRadius: '16px',
                                                        fontSize: '0.95rem',
                                                        background: colors.white,
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                        color: colors.gray700
                                                    }}
                                                >
                                                    <option value="TND">Dinar Tunisien (TND)</option>
                                                    <option value="EUR">Euro (€)</option>
                                                    <option value="USD">Dollar ($)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '1fr 1fr', 
                                        gap: '1.5rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <div>
                                            <label style={{ 
                                                display: 'block', 
                                                marginBottom: '0.5rem', 
                                                fontWeight: 600, 
                                                color: colors.gray700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Lieu *
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <i className="bi bi-geo-alt" style={{
                                                    position: 'absolute',
                                                    left: '1.25rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: colors.gray400,
                                                    fontSize: '1.1rem'
                                                }}></i>
                                                <input
                                                    type="text"
                                                    value={devisForm.lieu}
                                                    onChange={(e) => setDevisForm({...devisForm, lieu: e.target.value})}
                                                    placeholder="Ville ou adresse complète"
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem 1rem 1rem 3rem',
                                                        border: `2px solid ${colors.gray300}`,
                                                        borderRadius: '16px',
                                                        fontSize: '0.95rem',
                                                        outline: 'none',
                                                        transition: 'all 0.2s',
                                                        backgroundColor: colors.white
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = colors.primary;
                                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = colors.gray300;
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ 
                                                display: 'block', 
                                                marginBottom: '0.5rem', 
                                                fontWeight: 600, 
                                                color: colors.gray700,
                                                fontSize: '0.9rem'
                                            }}>
                                                Date prévue
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <i className="bi bi-calendar" style={{
                                                    position: 'absolute',
                                                    left: '1.25rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: colors.gray400,
                                                    fontSize: '1.1rem'
                                                }}></i>
                                                <input
                                                    type="date"
                                                    value={devisForm.datePrevue}
                                                    onChange={(e) => setDevisForm({...devisForm, datePrevue: e.target.value})}
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem 1rem 1rem 3rem',
                                                        border: `2px solid ${colors.gray300}`,
                                                        borderRadius: '16px',
                                                        fontSize: '0.95rem',
                                                        background: colors.white,
                                                        outline: 'none',
                                                        color: colors.gray700
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontWeight: 600, 
                                            color: colors.gray700,
                                            fontSize: '0.9rem'
                                        }}>
                                            Message additionnel
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <i className="bi bi-chat-dots" style={{
                                                position: 'absolute',
                                                left: '1.25rem',
                                                top: '1.25rem',
                                                color: colors.gray400,
                                                fontSize: '1.1rem'
                                            }}></i>
                                            <textarea
                                                value={devisForm.message}
                                                onChange={(e) => setDevisForm({...devisForm, message: e.target.value})}
                                                rows="4"
                                                placeholder="Décrivez vos besoins spécifiques, objectifs, contraintes particulières..."
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem 1rem 1rem 3rem',
                                                    border: `2px solid ${colors.gray300}`,
                                                    borderRadius: '16px',
                                                    fontSize: '0.95rem',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    fontFamily: 'inherit',
                                                    lineHeight: '1.6',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: colors.white
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = colors.primary;
                                                    e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = colors.gray300;
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Footer Modal */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    style={{ 
                                        paddingTop: '1.5rem',
                                        borderTop: `2px solid ${colors.gray200}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.75rem',
                                        color: colors.gray500,
                                        fontSize: '0.9rem'
                                    }}>
                                        <i className="bi bi-shield-lock-fill" style={{ color: colors.success }}></i>
                                        Données sécurisées et confidentielles
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02, backgroundColor: colors.gray100 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowDevisModal(false)}
                                            style={{
                                                padding: '1rem 2rem',
                                                background: colors.white,
                                                color: colors.gray700,
                                                border: `2px solid ${colors.gray300}`,
                                                borderRadius: '50px',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            disabled={submitting}
                                        >
                                            Annuler
                                        </motion.button>

                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                padding: '1rem 2.5rem',
                                                background: submitting ? colors.gray400 : colors.primaryGradient,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                cursor: submitting ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                boxShadow: colors.shadowLg
                                            }}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        border: '3px solid white',
                                                        borderTopColor: 'transparent',
                                                        borderRadius: '50%',
                                                        animation: 'spin 0.8s linear infinite'
                                                    }}></div>
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-send-check"></i>
                                                    Envoyer la demande
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 📝 MODAL MESSAGES/CONVERSATION */}
            {showMessageModal && selectedDevis && (
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
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{
                            background: colors.white,
                            borderRadius: '32px',
                            padding: '0',
                            maxWidth: '800px',
                            width: '100%',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: colors.shadow2xl,
                            border: `1px solid ${colors.gray200}`
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            background: colors.primaryGradient,
                            padding: '1.5rem',
                            color: 'white',
                            borderTopLeftRadius: '32px',
                            borderTopRightRadius: '32px'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ 
                                        fontSize: '1.4rem', 
                                        fontWeight: 700, 
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <i className="bi bi-chat-dots"></i>
                                        Conversation
                                    </h3>
                                    <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                                        Devis #{selectedDevis.id} • {selectedDevis.serviceTitle || 'Service'}
                                    </p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowMessageModal(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '14px',
                                        color: 'white',
                                        fontSize: '1.5rem',
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

                        {/* Messages Area */}
                        <div style={{
                            flex: 1,
                            padding: '1.5rem',
                            overflowY: 'auto',
                            background: colors.gray50,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            maxHeight: '400px'
                        }}>
                            {/* Message initial du client */}
                            {selectedDevis.message && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '1rem',
                                        background: colors.primaryGradient,
                                        color: 'white',
                                        borderRadius: '18px 18px 4px 18px',
                                        position: 'relative',
                                        boxShadow: colors.shadowMd
                                    }}>
                                        <div style={{ 
                                            fontSize: '0.8rem', 
                                            marginBottom: '0.25rem',
                                            fontWeight: 600,
                                            opacity: 0.9
                                        }}>
                                            Vous
                                        </div>
                                        <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                                            {selectedDevis.message}
                                        </p>
                                        <div style={{ 
                                            fontSize: '0.65rem', 
                                            marginTop: '0.5rem',
                                            textAlign: 'right',
                                            opacity: 0.7
                                        }}>
                                            {formatDateTime(selectedDevis.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Commentaires et réponses */}
                            {selectedDevis.comments && selectedDevis.comments.length > 0 ? (
                                selectedDevis.comments.map((comment, idx) => (
                                    <div
                                        key={comment.id || idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: comment.isFromClient ? 'flex-end' : 'flex-start',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '1rem',
                                            background: comment.isFromClient ? colors.primaryGradient : colors.white,
                                            color: comment.isFromClient ? 'white' : colors.gray800,
                                            borderRadius: comment.isFromClient 
                                                ? '18px 18px 4px 18px' 
                                                : '18px 18px 18px 4px',
                                            position: 'relative',
                                            boxShadow: colors.shadowSm,
                                            border: !comment.isFromClient ? `1px solid ${colors.gray200}` : 'none'
                                        }}>
                                            <div style={{ 
                                                fontSize: '0.8rem', 
                                                marginBottom: '0.25rem',
                                                fontWeight: 600,
                                                opacity: comment.isFromClient ? 0.9 : 0.8,
                                                color: comment.isFromClient ? 'white' : colors.primary
                                            }}>
                                                {comment.isFromClient ? 'Vous' : comment.isFromAdmin ? 'Support Admin' : 'Admin'}
                                            </div>
                                            <p style={{ 
                                                fontSize: '0.95rem', 
                                                margin: 0, 
                                                lineHeight: '1.5'
                                            }}>
                                                {comment.content}
                                            </p>
                                            <div style={{ 
                                                fontSize: '0.65rem', 
                                                marginTop: '0.5rem',
                                                textAlign: 'right',
                                                opacity: 0.7,
                                                color: comment.isFromClient ? 'white' : colors.gray500
                                            }}>
                                                {formatDateTime(comment.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    color: colors.gray400
                                }}>
                                    <i className="bi bi-chat" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                                    <p style={{ fontSize: '1rem', color: colors.gray500 }}>
                                        Aucun message pour le moment
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: colors.gray400 }}>
                                        Commencez la conversation avec l'administrateur
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Reply Area */}
                        <div style={{
                            padding: '1.5rem',
                            background: colors.white,
                            borderTop: `1px solid ${colors.gray200}`,
                            borderBottomLeftRadius: '32px',
                            borderBottomRightRadius: '32px'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'flex-end'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Écrivez votre message..."
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            border: `2px solid ${colors.gray300}`,
                                            borderRadius: '16px',
                                            fontSize: '0.95rem',
                                            resize: 'none',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = colors.primary;
                                            e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = colors.gray300;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSendComment}
                                    disabled={sendingComment || !newComment.trim()}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        background: sendingComment || !newComment.trim() ? colors.gray400 : colors.primaryGradient,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontWeight: 600,
                                        cursor: (sendingComment || !newComment.trim()) ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        fontSize: '0.95rem',
                                        boxShadow: colors.shadowMd
                                    }}
                                >
                                    {sendingComment ? (
                                        <>
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                border: '2px solid white',
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite'
                                            }}></div>
                                            Envoi...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send"></i>
                                            Envoyer
                                        </>
                                    )}
                                </motion.button>
                            </div>
                            <div style={{
                                marginTop: '0.75rem',
                                fontSize: '0.8rem',
                                color: colors.gray500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <i className="bi bi-shield-check"></i>
                                Votre message sera envoyé à l'administrateur
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* 📝 MODAL PROFIL */}
            {showProfileEdit && (
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
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{
                            background: colors.white,
                            borderRadius: '32px',
                            padding: '2rem',
                            maxWidth: '550px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: colors.shadow2xl
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '2rem' 
                        }}>
                            <div>
                                <h3 style={{ 
                                    fontSize: '1.6rem', 
                                    fontWeight: 700, 
                                    color: colors.gray900,
                                    letterSpacing: '-0.5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <i className="bi bi-pencil-square" style={{ color: colors.primary }}></i>
                                    Modifier mon profil
                                </h3>
                                <p style={{ color: colors.gray500, marginTop: '0.25rem' }}>
                                    Mettez à jour vos informations personnelles
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowProfileEdit(false)}
                                style={{
                                    background: colors.gray100,
                                    border: 'none',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    color: colors.gray600,
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ×
                            </motion.button>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: 600, 
                                    color: colors.gray700 
                                }}>
                                    Nom complet *
                                </label>
                                <input
                                    type="text"
                                    value={editProfileForm.name}
                                    onChange={(e) => setEditProfileForm({...editProfileForm, name: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: `2px solid ${colors.gray300}`,
                                        borderRadius: '16px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.primary;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = colors.gray300;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: 600, 
                                    color: colors.gray700 
                                }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={editProfileForm.email}
                                    onChange={(e) => setEditProfileForm({...editProfileForm, email: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: `2px solid ${colors.gray300}`,
                                        borderRadius: '16px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.primary;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = colors.gray300;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: 600, 
                                    color: colors.gray700 
                                }}>
                                    Entreprise
                                </label>
                                <input
                                    type="text"
                                    value={editProfileForm.company}
                                    onChange={(e) => setEditProfileForm({...editProfileForm, company: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: `2px solid ${colors.gray300}`,
                                        borderRadius: '16px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.primary;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = colors.gray300;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: 600, 
                                    color: colors.gray700 
                                }}>
                                    Téléphone
                                </label>
                                <input
                                    type="tel"
                                    value={editProfileForm.phone}
                                    onChange={(e) => setEditProfileForm({...editProfileForm, phone: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: `2px solid ${colors.gray300}`,
                                        borderRadius: '16px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.primary;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = colors.gray300;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem', 
                                    fontWeight: 600, 
                                    color: colors.gray700 
                                }}>
                                    Matricule Fiscale
                                </label>
                                <input
                                    type="text"
                                    value={editProfileForm.matriculeFiscale}
                                    onChange={(e) => setEditProfileForm({...editProfileForm, matriculeFiscale: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        border: `2px solid ${colors.gray300}`,
                                        borderRadius: '16px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.primary;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = colors.gray300;
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                justifyContent: 'flex-end' 
                            }}>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02, backgroundColor: colors.gray100 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowProfileEdit(false)}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: colors.white,
                                        color: colors.gray700,
                                        border: `2px solid ${colors.gray300}`,
                                        borderRadius: '50px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Annuler
                                </motion.button>

                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '1rem 2.5rem',
                                        background: colors.primaryGradient,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        boxShadow: colors.shadowLg
                                    }}
                                >
                                    <i className="bi bi-check-lg"></i>
                                    Enregistrer
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Scrollbar personnalisée */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: ${colors.gray100};
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: ${colors.gray400};
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: ${colors.gray500};
                }
                
                /* Sélections */
                ::selection {
                    background: ${colors.primary}30;
                    color: ${colors.primaryDark};
                }
                
                /* Animations douces */
                * {
                    transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
                }
            `}</style>
        </div>
    );
};

export default DashboardClient;