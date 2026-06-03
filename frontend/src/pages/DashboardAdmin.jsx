import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardAdmin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [devis, setDevis] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        todayLogins: 0,
        recentActiveUsers: 0
    });
    const [devisStats, setDevisStats] = useState({
        total: 0,
        enAttente: 0,
        valides: 0,
        payes: 0,
        refuses: 0,
        montantTotal: 0,
        montantMoyen: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedDevis, setSelectedDevis] = useState(null);
    const [showDevisModal, setShowDevisModal] = useState(false);
    const [editForm, setEditForm] = useState({
        status: '',
        montantFinal: '',
        commentaireAdmin: '',
        devise: 'TND'
    });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterServiceType, setFilterServiceType] = useState('all');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [timeframe, setTimeframe] = useState('7j');
    const [chartData, setChartData] = useState([]);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success',
        message: ''
    });
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [theme, setTheme] = useState('light');

    // Palette de couleurs premium
    const colors = {
        primary: '#6366F1',
        primaryLight: '#818CF8',
        primaryDark: '#4F46E5',
        primaryGradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
        
        success: '#10B981',
        successLight: '#34D399',
        successGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        
        warning: '#F59E0B',
        warningLight: '#FBBF24',
        warningGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        
        danger: '#EF4444',
        dangerLight: '#F87171',
        dangerGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        
        info: '#3B82F6',
        infoLight: '#60A5FA',
        infoGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        
        purple: '#8B5CF6',
        purpleLight: '#A78BFA',
        purpleGradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        
        dark: '#0F172A',
        darkLight: '#1E293B',
        darkLighter: '#334155',
        
        light: '#F8FAFC',
        lightDark: '#F1F5F9',
        lightDarker: '#E2E8F0',
        
        gray50: '#F9FAFB',
        gray100: '#F3F4F6',
        gray200: '#E5E7EB',
        gray300: '#D1D5DB',
        gray400: '#9CA3AF',
        gray500: '#6B7280',
        gray600: '#4B5563',
        gray700: '#374151',
        gray800: '#1F2937',
        gray900: '#111827'
    };

    // Styles basés sur le thème
    const themeStyles = {
        light: {
            background: colors.gray50,
            cardBg: 'white',
            text: colors.gray900,
            textSecondary: colors.gray600,
            border: colors.gray200,
            headerBg: 'white',
            sidebarBg: 'white',
            hoverBg: colors.gray100
        },
        dark: {
            background: colors.dark,
            cardBg: colors.darkLight,
            text: colors.light,
            textSecondary: colors.gray400,
            border: colors.darkLighter,
            headerBg: colors.darkLight,
            sidebarBg: colors.darkLight,
            hoverBg: colors.darkLighter
        }
    };

    const currentTheme = themeStyles[theme];

    // Animation variants
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // Fonction pour afficher les notifications
    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' });
        }, 3000);
    };

    // Charger les données une seule fois au montage
    useEffect(() => {
        fetchAllData();
        // Suppression de l'intervalle de rafraîchissement automatique
    }, []);

    useEffect(() => {
        generateChartData();
    }, [devis, timeframe]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const usersResponse = await fetch('http://localhost:5000/api/users', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData.users || []);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const recentActiveUsers = usersData.users.filter(user => {
                    if (!user.lastLogin) return false;
                    const lastLogin = new Date(user.lastLogin);
                    return lastLogin >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                }).length;
                
                setStats({
                    totalUsers: usersData.users.length || 0,
                    todayLogins: Math.floor(Math.random() * 10) + 1,
                    recentActiveUsers
                });
            }

            const devisResponse = await fetch('http://localhost:5000/api/devis', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (devisResponse.ok) {
                const devisData = await devisResponse.json();
                setDevis(devisData.devis || []);
                
                calculateDevisStats(devisData.devis || []);
            }

            const activitiesResponse = await fetch('http://localhost:5000/api/admin/activities', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (activitiesResponse.ok) {
                const activitiesData = await activitiesResponse.json();
                setActivities(activitiesData.activities || []);
            }

        } catch (error) {
            console.error('Erreur chargement données:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const calculateDevisStats = (devisList) => {
        const total = devisList.length;
        const enAttente = devisList.filter(d => d.status === 'en attente').length;
        const valides = devisList.filter(d => d.status === 'validé').length;
        const payes = devisList.filter(d => d.status === 'payé').length;
        const refuses = devisList.filter(d => d.status === 'refusé').length;
        const montantTotal = devisList.reduce((sum, d) => sum + (d.montantFinal || 0), 0);
        const montantMoyen = total > 0 ? montantTotal / total : 0;
        
        setDevisStats({
            total,
            enAttente,
            valides,
            payes,
            refuses,
            montantTotal,
            montantMoyen
        });
    };

    const generateChartData = () => {
        const days = timeframe === '7j' ? 7 : timeframe === '30j' ? 30 : 90;
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayDevis = devis.filter(d => {
                const devisDate = new Date(d.createdAt);
                return devisDate.toDateString() === date.toDateString();
            });
            
            data.push({
                date: date,
                label: date.toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: timeframe === '7j' ? 'short' : 'numeric' 
                }),
                day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                count: dayDevis.length,
                amount: dayDevis.reduce((sum, d) => sum + (d.montantFinal || 0), 0)
            });
        }
        
        setChartData(data);
    };

    // Fonctions pour gérer les devis
    const handleEditDevis = (devisItem) => {
        setSelectedDevis(devisItem);
        setEditForm({
            status: devisItem.status,
            montantFinal: devisItem.montantFinal || '',
            commentaireAdmin: devisItem.commentaireAdmin || '',
            devise: devisItem.devise || 'TND'
        });
        setUploadFile(null);
        setShowDevisModal(true);
    };

    const handleUploadPDF = async (devisId) => {
        if (!uploadFile) {
            showNotification('warning', 'Veuillez sélectionner un fichier PDF');
            return;
        }

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('pdf', uploadFile);

            const response = await fetch(`http://localhost:5000/api/devis/${devisId}/upload-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                showNotification('success', 'PDF uploadé avec succès');
                setUploadFile(null);
                fetchAllData();
                setShowDevisModal(false);
            } else {
                showNotification('error', data.message || 'Erreur lors de l\'upload');
            }
        } catch (error) {
            console.error('Erreur upload PDF:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateDevis = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            formData.append('status', editForm.status);
            formData.append('montantFinal', editForm.montantFinal);
            formData.append('commentaireAdmin', editForm.commentaireAdmin);
            formData.append('devise', editForm.devise);
            
            if (uploadFile) {
                formData.append('pdf', uploadFile);
            }
            
            setUploading(true);
            const response = await fetch(`http://localhost:5000/api/devis/${selectedDevis.id}/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                showNotification('success', 'Devis mis à jour avec succès');
                setShowDevisModal(false);
                setUploadFile(null);
                fetchAllData();
            } else {
                showNotification('error', data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur update devis:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDevis = async (devisId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/devis/${devisId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                showNotification('success', 'Devis supprimé avec succès');
                fetchAllData();
            } else {
                showNotification('error', data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression devis:', error);
            showNotification('error', 'Erreur de connexion au serveur');
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleSwitchToClient = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (user.role !== 'admin') {
            showNotification('error', 'Accès non autorisé. Rôle admin requis.');
            return;
        }
        
        if (window.confirm('Voulez-vous voir la vue client ?\n\nVous resterez administrateur mais verrez l\'interface client.')) {
            window.location.href = '/dashboard';
        }
    };

    // Fonctions utilitaires
    const getServiceTypeLabel = (type) => {
        const labels = {
            'parcours': 'Parcours',
            'coaching': 'Coaching',
            'formation': 'Formation',
            'teambuilding': 'Team Building'
        };
        return labels[type] || type;
    };

    const getServiceColor = (type) => {
        const colorsMap = {
            'parcours': colors.primary,
            'coaching': colors.success,
            'formation': colors.info,
            'teambuilding': colors.purple
        };
        return colorsMap[type] || colors.gray500;
    };

    const getServiceIcon = (type) => {
        const icons = {
            'parcours': 'bi-map',
            'coaching': 'bi-person-badge',
            'formation': 'bi-mortarboard',
            'teambuilding': 'bi-people'
        };
        return icons[type] || 'bi-briefcase';
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
            'en attente': 'bi-clock',
            'validé': 'bi-check-circle',
            'payé': 'bi-credit-card',
            'refusé': 'bi-x-circle'
        };
        return icons[status] || 'bi-question-circle';
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
            currency: devise
        }).format(amount);
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'à l\'instant';
        if (diffMin < 60) return `il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
        if (diffHour < 24) return `il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
        if (diffDay < 7) return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
        
        return formatDate(dateString);
    };

    // Filtrage des devis
    const filteredDevis = devis.filter(devisItem => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            (devisItem.userName && devisItem.userName.toLowerCase().includes(searchLower)) ||
            (devisItem.userEmail && devisItem.userEmail.toLowerCase().includes(searchLower)) ||
            (devisItem.entreprise && devisItem.entreprise.toLowerCase().includes(searchLower)) ||
            (devisItem.serviceTitle && devisItem.serviceTitle.toLowerCase().includes(searchLower));
        
        const matchesStatus = filterStatus === 'all' || devisItem.status === filterStatus;
        const matchesServiceType = filterServiceType === 'all' || devisItem.serviceType === filterServiceType;
        
        const devisDate = new Date(devisItem.createdAt);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        
        let matchesDate = true;
        if (startDate) {
            startDate.setHours(0, 0, 0, 0);
            matchesDate = matchesDate && devisDate >= startDate;
        }
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && devisDate <= endDate;
        }
        
        return matchesSearch && matchesStatus && matchesServiceType && matchesDate;
    });

    // Statistiques par type de service
    const statsByServiceType = {
        parcours: devis.filter(d => d.serviceType === 'parcours').length,
        coaching: devis.filter(d => d.serviceType === 'coaching').length,
        formation: devis.filter(d => d.serviceType === 'formation').length,
        teambuilding: devis.filter(d => d.serviceType === 'teambuilding').length
    };

    // Statistiques par mois
    const statsByMonth = devis.reduce((acc, devisItem) => {
        const date = new Date(devisItem.createdAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!acc[monthYear]) {
            acc[monthYear] = {
                total: 0,
                valides: 0,
                montant: 0
            };
        }
        
        acc[monthYear].total++;
        if (devisItem.status === 'validé' || devisItem.status === 'payé') {
            acc[monthYear].valides++;
            acc[monthYear].montant += devisItem.montantFinal || 0;
        }
        
        return acc;
    }, {});

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh',
                background: colors.primaryGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ textAlign: 'center' }}
                >
                    <motion.div
                        animate={{ 
                            rotate: 360,
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity }
                        }}
                        style={{
                            width: '80px',
                            height: '80px',
                            border: '6px solid rgba(255,255,255,0.3)',
                            borderTop: '6px solid white',
                            borderRadius: '50%',
                            margin: '0 auto 30px'
                        }}
                    />
                    <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ color: 'white', fontSize: '1.2rem', fontWeight: 500 }}
                    >
                        Chargement du dashboard...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: currentTheme.background,
            color: currentTheme.text,
            transition: 'all 0.3s ease'
        }}>
            {/* Notification */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            zIndex: 9999,
                            background: notification.type === 'success' ? colors.success : 
                                     notification.type === 'error' ? colors.danger : colors.info,
                            color: 'white',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            maxWidth: '400px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <i className={`bi ${notification.type === 'success' ? 'bi-check-circle-fill' : 
                                     notification.type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'}`}
                           style={{ fontSize: '1.2rem' }}></i>
                        <span style={{ flex: 1 }}>{notification.message}</span>
                        <button 
                            onClick={() => setNotification({ ...notification, show: false })}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                opacity: 0.7,
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Premium */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                style={{
                    background: currentTheme.headerBg,
                    borderBottom: `1px solid ${currentTheme.border}`,
                    padding: '1rem 0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                }}
            >
                <div style={{ 
                    maxWidth: '1600px', 
                    margin: '0 auto', 
                    padding: '0 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                width: '50px',
                                height: '50px',
                                background: colors.primaryGradient,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'white',
                                boxShadow: `0 8px 20px ${colors.primary}40`
                            }}
                        >
                            AO
                        </motion.div>
                        
                        <div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ 
                                    fontSize: '1.8rem', 
                                    fontWeight: '800', 
                                    marginBottom: '0.25rem',
                                    background: colors.primaryGradient,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Dashboard Administrateur
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                style={{ 
                                    opacity: 0.7, 
                                    fontSize: '0.9rem', 
                                    color: currentTheme.textSecondary 
                                }}
                            >
                                {users.length} utilisateurs • {devis.length} devis • {activities.length} activités
                            </motion.p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Theme Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            style={{
                                width: '40px',
                                height: '40px',
                                background: currentTheme.cardBg,
                                border: `1px solid ${currentTheme.border}`,
                                borderRadius: '10px',
                                color: currentTheme.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem'
                            }}
                        >
                            <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`}></i>
                        </motion.button>

                        {/* Settings Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSettings(!showSettings)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: currentTheme.cardBg,
                                border: `1px solid ${currentTheme.border}`,
                                borderRadius: '10px',
                                color: currentTheme.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <i className="bi bi-gear"></i>
                            <span>Paramètres</span>
                        </motion.button>

                        {/* Client View Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSwitchToClient}
                            style={{
                                padding: '0.5rem 1rem',
                                background: colors.successGradient,
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <i className="bi bi-person"></i>
                            <span>Vue Client</span>
                        </motion.button>

                        {/* Logout Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            style={{
                                padding: '0.5rem 1rem',
                                background: colors.danger,
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <i className="bi bi-box-arrow-right"></i>
                            <span>Déconnexion</span>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed',
                            top: '80px',
                            right: '20px',
                            zIndex: 90,
                            background: currentTheme.cardBg,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '12px',
                            padding: '1.5rem',
                            width: '300px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <h3 style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 600, 
                            marginBottom: '1rem',
                            color: currentTheme.text 
                        }}>
                            <i className="bi bi-gear" style={{ marginRight: '0.5rem', color: colors.primary }}></i>
                            Paramètres d'affichage
                        </h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                color: currentTheme.textSecondary 
                            }}>
                                Thème
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['light', 'dark'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: theme === t ? colors.primary : 'transparent',
                                            color: theme === t ? 'white' : currentTheme.text,
                                            border: `1px solid ${theme === t ? colors.primary : currentTheme.border}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {t === 'light' ? 'Clair' : 'Sombre'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                color: currentTheme.textSecondary 
                            }}>
                                Barre latérale
                            </label>
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: 'transparent',
                                    color: currentTheme.text,
                                    border: `1px solid ${currentTheme.border}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                {sidebarCollapsed ? 'Étendre' : 'Réduire'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main style={{ 
                maxWidth: '1600px', 
                margin: '0 auto', 
                padding: '2rem',
                display: 'flex',
                gap: '2rem'
            }}>
                {/* Sidebar Navigation */}
                <motion.aside
                    animate={{ width: sidebarCollapsed ? '80px' : '250px' }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background: currentTheme.cardBg,
                        borderRadius: '20px',
                        padding: '1.5rem 1rem',
                        border: `1px solid ${currentTheme.border}`,
                        height: 'fit-content',
                        position: 'sticky',
                        top: '100px'
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem'
                    }}>
                        {[
                            { id: 'dashboard', label: 'Tableau de bord', icon: 'bi-speedometer2' },
                            { id: 'devis', label: 'Gestion Devis', icon: 'bi-file-earmark-text', badge: devisStats.enAttente },
                            { id: 'stats', label: 'Statistiques', icon: 'bi-bar-chart' },
                            { id: 'users', label: 'Utilisateurs', icon: 'bi-people', badge: users.length },
                            { id: 'activities', label: 'Activités', icon: 'bi-clock-history', badge: activities.length }
                        ].map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: activeTab === tab.id ? colors.primary : 'transparent',
                                    color: activeTab === tab.id ? 'white' : currentTheme.text,
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    width: '100%',
                                    position: 'relative',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <i className={`bi ${tab.icon}`} style={{ fontSize: '1.1rem' }}></i>
                                {!sidebarCollapsed && (
                                    <>
                                        <span style={{ flex: 1, textAlign: 'left' }}>{tab.label}</span>
                                        {tab.badge > 0 && (
                                            <span style={{
                                                background: activeTab === tab.id ? 'white' : colors.primary,
                                                color: activeTab === tab.id ? colors.primary : 'white',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                                {sidebarCollapsed && tab.badge > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        width: '8px',
                                        height: '8px',
                                        background: colors.danger,
                                        borderRadius: '50%'
                                    }} />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.aside>

                {/* Content Area */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    style={{ 
                        flex: 1,
                        background: currentTheme.cardBg,
                        borderRadius: '20px',
                        padding: '2rem',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
                        border: `1px solid ${currentTheme.border}`,
                        minHeight: '600px'
                    }}
                >
                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <motion.div variants={fadeInUp}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '2rem'
                            }}>
                                <h2 style={{ 
                                    fontSize: '1.8rem', 
                                    fontWeight: '700',
                                    color: currentTheme.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <i className="bi bi-speedometer2" style={{ color: colors.primary }}></i>
                                    Vue d'ensemble
                                </h2>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchAllData}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: colors.primary,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <i className="bi bi-arrow-clockwise"></i>
                                    Rafraîchir
                                </motion.button>
                            </div>

                            {/* Stats Cards Grid */}
                            <motion.div variants={staggerContainer} style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                {/* Carte Utilisateurs */}
                                <motion.div
                                    variants={fadeInUp}
                                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.1)' }}
                                    style={{
                                        background: currentTheme.cardBg,
                                        borderRadius: '20px',
                                        padding: '1.5rem',
                                        border: `1px solid ${currentTheme.border}`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        left: 0, 
                                        right: 0, 
                                        height: '4px',
                                        background: colors.primaryGradient
                                    }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            background: `${colors.primary}15`,
                                            borderRadius: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colors.primary,
                                            fontSize: '1.8rem'
                                        }}>
                                            <i className="bi bi-people"></i>
                                        </div>
                                        <div>
                                            <motion.div 
                                                initial={{ scale: 0.5 }}
                                                animate={{ scale: 1 }}
                                                style={{ fontSize: '2.5rem', fontWeight: '800', color: currentTheme.text, lineHeight: 1 }}>
                                                {stats.totalUsers}
                                            </motion.div>
                                            <div style={{ color: currentTheme.textSecondary, fontSize: '0.95rem', fontWeight: '500' }}>
                                                Utilisateurs totaux
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: `1px solid ${currentTheme.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        color: currentTheme.textSecondary
                                    }}>
                                        <i className="bi bi-arrow-up" style={{ color: colors.success }}></i>
                                        <span>{stats.recentActiveUsers} actifs cette semaine</span>
                                        <span style={{ marginLeft: 'auto', fontWeight: 600, color: colors.success }}>
                                            +{Math.round((stats.recentActiveUsers / stats.totalUsers) * 100) || 0}%
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Carte Devis */}
                                <motion.div
                                    variants={fadeInUp}
                                    whileHover={{ y: -5 }}
                                    style={{
                                        background: currentTheme.cardBg,
                                        borderRadius: '20px',
                                        padding: '1.5rem',
                                        border: `1px solid ${currentTheme.border}`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        left: 0, 
                                        right: 0, 
                                        height: '4px',
                                        background: colors.successGradient
                                    }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            background: `${colors.success}15`,
                                            borderRadius: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colors.success,
                                            fontSize: '1.8rem'
                                        }}>
                                            <i className="bi bi-file-earmark-text"></i>
                                        </div>
                                        <div>
                                            <motion.div 
                                                initial={{ scale: 0.5 }}
                                                animate={{ scale: 1 }}
                                                style={{ fontSize: '2.5rem', fontWeight: '800', color: currentTheme.text, lineHeight: 1 }}>
                                                {devisStats.total}
                                            </motion.div>
                                            <div style={{ color: currentTheme.textSecondary, fontSize: '0.95rem', fontWeight: '500' }}>
                                                Devis créés
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: `1px solid ${currentTheme.border}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.9rem'
                                    }}>
                                        <span style={{ color: colors.warning }}>
                                            <i className="bi bi-clock"></i> {devisStats.enAttente} en attente
                                        </span>
                                        <span style={{ color: colors.success }}>
                                            <i className="bi bi-check-circle"></i> {devisStats.valides} validés
                                        </span>
                                        <span style={{ color: colors.info }}>
                                            <i className="bi bi-credit-card"></i> {devisStats.payes} payés
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Carte Chiffre d'affaires */}
                                <motion.div
                                    variants={fadeInUp}
                                    whileHover={{ y: -5 }}
                                    style={{
                                        background: currentTheme.cardBg,
                                        borderRadius: '20px',
                                        padding: '1.5rem',
                                        border: `1px solid ${currentTheme.border}`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        left: 0, 
                                        right: 0, 
                                        height: '4px',
                                        background: colors.warningGradient
                                    }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            background: `${colors.warning}15`,
                                            borderRadius: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: colors.warning,
                                            fontSize: '1.8rem'
                                        }}>
                                            <i className="bi bi-currency-exchange"></i>
                                        </div>
                                        <div>
                                            <motion.div 
                                                initial={{ scale: 0.5 }}
                                                animate={{ scale: 1 }}
                                                style={{ fontSize: '2rem', fontWeight: '800', color: currentTheme.text, lineHeight: 1 }}>
                                                {formatCurrency(devisStats.montantTotal || 0, 'TND')}
                                            </motion.div>
                                            <div style={{ color: currentTheme.textSecondary, fontSize: '0.95rem', fontWeight: '500' }}>
                                                Chiffre d'affaires
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: `1px solid ${currentTheme.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        color: currentTheme.textSecondary
                                    }}>
                                        <i className="bi bi-calculator" style={{ color: colors.warning }}></i>
                                        <span>Moyenne: {formatCurrency(devisStats.montantMoyen || 0, 'TND')}</span>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Graphique et Activités Récentes */}
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr',
                                gap: '1.5rem'
                            }}>
                                {/* Graphique d'évolution */}
                                <motion.div
                                    variants={fadeInUp}
                                    style={{
                                        background: currentTheme.cardBg,
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        marginBottom: '1.5rem'
                                    }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: currentTheme.text }}>
                                            Évolution des devis
                                        </h3>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {['7j', '30j', '90j'].map((tf) => (
                                                <button
                                                    key={tf}
                                                    onClick={() => setTimeframe(tf)}
                                                    style={{
                                                        padding: '0.4rem 1rem',
                                                        background: timeframe === tf ? colors.primary : 'transparent',
                                                        color: timeframe === tf ? 'white' : currentTheme.text,
                                                        border: `1px solid ${timeframe === tf ? colors.primary : currentTheme.border}`,
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 500,
                                                        transition: 'all 0.3s'
                                                    }}
                                                >
                                                    {tf}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'flex', 
                                        height: '250px',
                                        alignItems: 'flex-end',
                                        justifyContent: 'space-between',
                                        gap: '0.5rem',
                                        padding: '0 0.5rem',
                                        borderBottom: `1px solid ${currentTheme.border}`,
                                        borderLeft: `1px solid ${currentTheme.border}`,
                                        marginBottom: '1rem'
                                    }}>
                                        {chartData.map((item, index) => {
                                            const maxCount = Math.max(...chartData.map(d => d.count), 1);
                                            const heightPercentage = (item.count / maxCount) * 100;
                                            
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${heightPercentage}%` }}
                                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                                    style={{ 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        flex: 1,
                                                        height: '100%',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        style={{ 
                                                            width: '100%',
                                                            background: colors.primaryGradient,
                                                            borderRadius: '6px 6px 0 0',
                                                            height: '100%',
                                                            cursor: 'pointer',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '-30px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            background: colors.dark,
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s',
                                                            whiteSpace: 'nowrap',
                                                            pointerEvents: 'none'
                                                        }} className="chart-tooltip">
                                                            {item.count} devis
                                                        </div>
                                                    </motion.div>
                                                    <div style={{ 
                                                        fontSize: '0.75rem',
                                                        color: currentTheme.textSecondary,
                                                        marginTop: '0.5rem',
                                                        fontWeight: 500
                                                    }}>
                                                        {timeframe === '7j' ? item.day : item.label}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Activités récentes */}
                                <motion.div
                                    variants={fadeInUp}
                                    style={{
                                        background: currentTheme.cardBg,
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <h3 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: 600, 
                                        marginBottom: '1rem',
                                        color: currentTheme.text,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <i className="bi bi-activity" style={{ color: colors.primary }}></i>
                                        Activités récentes
                                    </h3>
                                    
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {activities.slice(0, 8).map((activity, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                style={{
                                                    padding: '0.75rem',
                                                    background: index % 2 === 0 ? currentTheme.cardBg : currentTheme.hoverBg,
                                                    borderRadius: '8px',
                                                    marginBottom: '0.5rem',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem'
                                                }}
                                            >
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    background: activity.type === 'login' ? `${colors.success}15` :
                                                               activity.type === 'devis_request' ? `${colors.warning}15` :
                                                               `${colors.info}15`,
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: activity.type === 'login' ? colors.success :
                                                           activity.type === 'devis_request' ? colors.warning :
                                                           colors.info,
                                                    fontSize: '1rem'
                                                }}>
                                                    <i className={`bi ${activity.type === 'login' ? 'bi-box-arrow-in-right' : 
                                                                 activity.type === 'devis_request' ? 'bi-file-earmark-plus' : 
                                                                 activity.type === 'register' ? 'bi-person-plus' : 'bi-pencil'}`}></i>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: currentTheme.text }}>
                                                        {activity.type === 'login' ? 'Connexion' : 
                                                         activity.type === 'register' ? 'Inscription' : 
                                                         activity.type === 'devis_request' ? 'Nouveau devis' : 
                                                         activity.type === 'devis_update' ? 'Modification devis' : 'Activité'}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                        {activity.user?.name || 'Utilisateur'} • {formatRelativeTime(activity.timestamp)}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {activities.length === 0 && (
                                            <div style={{ 
                                                textAlign: 'center', 
                                                padding: '2rem',
                                                color: currentTheme.textSecondary 
                                            }}>
                                                <i className="bi bi-activity" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
                                                <p>Aucune activité récente</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Gestion Devis Tab */}
                    {activeTab === 'devis' && (
                        <motion.div variants={fadeInUp}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '2rem',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <h2 style={{ 
                                    fontSize: '1.8rem', 
                                    fontWeight: '700',
                                    color: currentTheme.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <i className="bi bi-file-earmark-text" style={{ color: colors.primary }}></i>
                                    Gestion des Devis
                                    <span style={{
                                        background: colors.primary,
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '1rem',
                                        fontWeight: 500
                                    }}>
                                        {filteredDevis.length}
                                    </span>
                                </h2>
                                
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={fetchAllData}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: colors.info,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <i className="bi bi-arrow-clockwise"></i>
                                        Rafraîchir
                                    </motion.button>
                                </div>
                            </div>

                            {/* Filtres avancés */}
                            <motion.div
                                variants={fadeInUp}
                                style={{ 
                                    background: currentTheme.hoverBg, 
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    marginBottom: '2rem',
                                    border: `1px solid ${currentTheme.border}`
                                }}
                            >
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                    gap: '1rem' 
                                }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontSize: '0.9rem', 
                                            color: currentTheme.textSecondary,
                                            fontWeight: 500
                                        }}>
                                            <i className="bi bi-search" style={{ marginRight: '0.5rem' }}></i>
                                            Rechercher
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Client, entreprise, service..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: `1px solid ${currentTheme.border}`,
                                                borderRadius: '8px',
                                                fontSize: '0.95rem',
                                                background: currentTheme.cardBg,
                                                color: currentTheme.text,
                                                outline: 'none',
                                                transition: 'all 0.3s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                                            onBlur={(e) => e.target.style.borderColor = currentTheme.border}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontSize: '0.9rem', 
                                            color: currentTheme.textSecondary,
                                            fontWeight: 500
                                        }}>
                                            <i className="bi bi-tag" style={{ marginRight: '0.5rem' }}></i>
                                            Statut
                                        </label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: `1px solid ${currentTheme.border}`,
                                                borderRadius: '8px',
                                                fontSize: '0.95rem',
                                                background: currentTheme.cardBg,
                                                color: currentTheme.text,
                                                cursor: 'pointer',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="all">Tous les statuts</option>
                                            <option value="en attente">En attente</option>
                                            <option value="validé">Validé</option>
                                            <option value="payé">Payé</option>
                                            <option value="refusé">Refusé</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontSize: '0.9rem', 
                                            color: currentTheme.textSecondary,
                                            fontWeight: 500
                                        }}>
                                            <i className="bi bi-grid" style={{ marginRight: '0.5rem' }}></i>
                                            Type de service
                                        </label>
                                        <select
                                            value={filterServiceType}
                                            onChange={(e) => setFilterServiceType(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: `1px solid ${currentTheme.border}`,
                                                borderRadius: '8px',
                                                fontSize: '0.95rem',
                                                background: currentTheme.cardBg,
                                                color: currentTheme.text,
                                                cursor: 'pointer',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="all">Tous les services</option>
                                            <option value="parcours">Parcours</option>
                                            <option value="coaching">Coaching</option>
                                            <option value="formation">Formation</option>
                                            <option value="teambuilding">Team Building</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontSize: '0.9rem', 
                                            color: currentTheme.textSecondary,
                                            fontWeight: 500
                                        }}>
                                            <i className="bi bi-calendar" style={{ marginRight: '0.5rem' }}></i>
                                            Période
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="date"
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    borderRadius: '8px',
                                                    fontSize: '0.9rem',
                                                    background: currentTheme.cardBg,
                                                    color: currentTheme.text,
                                                    outline: 'none'
                                                }}
                                            />
                                            <input
                                                type="date"
                                                value={dateRange.end}
                                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    borderRadius: '8px',
                                                    fontSize: '0.9rem',
                                                    background: currentTheme.cardBg,
                                                    color: currentTheme.text,
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Résumé des filtres */}
                                <div style={{ 
                                    marginTop: '1rem',
                                    paddingTop: '1rem',
                                    borderTop: `1px solid ${currentTheme.border}`,
                                    display: 'flex',
                                    gap: '1rem',
                                    flexWrap: 'wrap',
                                    fontSize: '0.85rem',
                                    color: currentTheme.textSecondary
                                }}>
                                    <span>
                                        <i className="bi bi-funnel"></i> Filtres actifs: 
                                    </span>
                                    {filterStatus !== 'all' && (
                                        <span style={{ 
                                            background: `${getStatusColor(filterStatus)}15`,
                                            color: getStatusColor(filterStatus),
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px'
                                        }}>
                                            Statut: {filterStatus}
                                        </span>
                                    )}
                                    {filterServiceType !== 'all' && (
                                        <span style={{ 
                                            background: `${getServiceColor(filterServiceType)}15`,
                                            color: getServiceColor(filterServiceType),
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px'
                                        }}>
                                            Service: {getServiceTypeLabel(filterServiceType)}
                                        </span>
                                    )}
                                    {searchTerm && (
                                        <span style={{ 
                                            background: `${colors.info}15`,
                                            color: colors.info,
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px'
                                        }}>
                                            Recherche: "{searchTerm}"
                                        </span>
                                    )}
                                </div>
                            </motion.div>

                            {/* Liste des devis */}
                            {filteredDevis.length === 0 ? (
                                <motion.div
                                    variants={fadeInUp}
                                    style={{ 
                                        textAlign: 'center', 
                                        padding: '4rem',
                                        color: currentTheme.textSecondary,
                                        background: currentTheme.hoverBg,
                                        borderRadius: '16px',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <i className="bi bi-file-earmark" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Aucun devis trouvé</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        Ajustez vos critères de recherche
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={staggerContainer}
                                    style={{ 
                                        background: currentTheme.hoverBg, 
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    {/* En-tête du tableau */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '80px 1fr 1fr 100px 120px 120px 100px 120px',
                                        gap: '1rem',
                                        padding: '1rem 1.5rem',
                                        background: currentTheme.cardBg,
                                        fontWeight: '600',
                                        color: currentTheme.text,
                                        fontSize: '0.9rem',
                                        borderBottom: `2px solid ${currentTheme.border}`
                                    }}>
                                        <div>#ID</div>
                                        <div>Client</div>
                                        <div>Service</div>
                                        <div>Type</div>
                                        <div>Montant</div>
                                        <div>Statut</div>
                                        <div>Date</div>
                                        <div>Actions</div>
                                    </div>

                                    {/* Lignes du tableau */}
                                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                        {filteredDevis.map((devisItem, index) => (
                                            <motion.div
                                                key={devisItem.id}
                                                variants={fadeInUp}
                                                whileHover={{ background: currentTheme.hoverBg }}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '80px 1fr 1fr 100px 120px 120px 100px 120px',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    background: index % 2 === 0 ? currentTheme.cardBg : currentTheme.hoverBg,
                                                    borderBottom: `1px solid ${currentTheme.border}`,
                                                    alignItems: 'center',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <div style={{ 
                                                    fontWeight: '600', 
                                                    color: colors.primary,
                                                    fontSize: '0.9rem'
                                                }}>
                                                    #{devisItem.id}
                                                </div>

                                                <div>
                                                    <div style={{ fontWeight: '600', color: currentTheme.text }}>
                                                        {devisItem.userName || 'Client'}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                        {devisItem.userEmail || ''}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div style={{ fontWeight: '500', color: currentTheme.text }}>
                                                        {devisItem.serviceTitle || 'Service'}
                                                    </div>
                                                    {devisItem.duree && (
                                                        <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                            {devisItem.duree} {devisItem.uniteDuree}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div style={{
                                                        padding: '4px 8px',
                                                        background: `${getServiceColor(devisItem.serviceType)}15`,
                                                        color: getServiceColor(devisItem.serviceType),
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        display: 'inline-block',
                                                        textAlign: 'center'
                                                    }}>
                                                        {getServiceTypeLabel(devisItem.serviceType)}
                                                    </div>
                                                </div>

                                                <div style={{ 
                                                    fontWeight: '600', 
                                                    color: devisItem.montantFinal ? colors.success : currentTheme.textSecondary 
                                                }}>
                                                    {formatCurrency(devisItem.montantFinal, devisItem.devise)}
                                                </div>

                                                <div>
                                                    <div style={{
                                                        padding: '4px 8px',
                                                        background: `${getStatusColor(devisItem.status)}15`,
                                                        color: getStatusColor(devisItem.status),
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}>
                                                        <i className={`bi ${getStatusIcon(devisItem.status)}`}></i>
                                                        {devisItem.status}
                                                    </div>
                                                </div>

                                                <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>
                                                    {formatDate(devisItem.createdAt)}
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleEditDevis(devisItem)}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            background: `${colors.info}15`,
                                                            color: colors.info,
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1rem'
                                                        }}
                                                        title="Modifier"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteDevis(devisItem.id)}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            background: `${colors.danger}15`,
                                                            color: colors.danger,
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1rem'
                                                        }}
                                                        title="Supprimer"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Pied du tableau avec pagination */}
                                    <div style={{
                                        padding: '1rem 1.5rem',
                                        background: currentTheme.cardBg,
                                        borderTop: `1px solid ${currentTheme.border}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.85rem',
                                        color: currentTheme.textSecondary
                                    }}>
                                        <span>
                                            Affichage de {filteredDevis.length} sur {devis.length} devis
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button style={{
                                                padding: '0.5rem 1rem',
                                                background: 'transparent',
                                                border: `1px solid ${currentTheme.border}`,
                                                borderRadius: '6px',
                                                color: currentTheme.textSecondary,
                                                cursor: 'pointer'
                                            }}>
                                                <i className="bi bi-chevron-left"></i>
                                            </button>
                                            <button style={{
                                                padding: '0.5rem 1rem',
                                                background: colors.primary,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer'
                                            }}>
                                                1
                                            </button>
                                            <button style={{
                                                padding: '0.5rem 1rem',
                                                background: 'transparent',
                                                border: `1px solid ${currentTheme.border}`,
                                                borderRadius: '6px',
                                                color: currentTheme.textSecondary,
                                                cursor: 'pointer'
                                            }}>
                                                2
                                            </button>
                                            <button style={{
                                                padding: '0.5rem 1rem',
                                                background: 'transparent',
                                                border: `1px solid ${currentTheme.border}`,
                                                borderRadius: '6px',
                                                color: currentTheme.textSecondary,
                                                cursor: 'pointer'
                                            }}>
                                                3
                                            </button>
                                            <button style={{
                                                padding: '0.5rem 1rem',
                                                background: 'transparent',
                                                border: `1px solid ${currentTheme.border}`,
                                                borderRadius: '6px',
                                                color: currentTheme.textSecondary,
                                                cursor: 'pointer'
                                            }}>
                                                <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Statistiques Tab */}
                    {activeTab === 'stats' && (
                        <motion.div variants={fadeInUp}>
                            <h2 style={{ 
                                fontSize: '1.8rem', 
                                fontWeight: '700',
                                marginBottom: '2rem',
                                color: currentTheme.text,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <i className="bi bi-bar-chart" style={{ color: colors.primary }}></i>
                                Statistiques détaillées
                            </h2>

                            {/* Cartes de statistiques clés */}
                            <motion.div
                                variants={staggerContainer}
                                style={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1.5rem',
                                    marginBottom: '2rem'
                                }}
                            >
                                {[
                                    {
                                        title: 'Taux de conversion',
                                        value: `${devisStats.total ? Math.round((devisStats.valides + devisStats.payes) / devisStats.total * 100) : 0}%`,
                                        change: '+5.2%',
                                        color: colors.success,
                                        icon: 'bi-graph-up-arrow'
                                    },
                                    {
                                        title: 'Valeur moyenne',
                                        value: formatCurrency(devisStats.montantMoyen || 0, 'TND'),
                                        change: '+12.3%',
                                        color: colors.info,
                                        icon: 'bi-calculator'
                                    },
                                    {
                                        title: 'Devis validés',
                                        value: devisStats.valides + devisStats.payes,
                                        change: `+${Math.round((devisStats.valides + devisStats.payes) / (devisStats.total || 1) * 100)}%`,
                                        color: colors.primary,
                                        icon: 'bi-check-circle'
                                    },
                                    {
                                        title: 'Chiffre d\'affaires',
                                        value: formatCurrency(devisStats.montantTotal || 0, 'TND'),
                                        change: '+8.7%',
                                        color: colors.purple,
                                        icon: 'bi-currency-dollar'
                                    }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        variants={fadeInUp}
                                        whileHover={{ y: -5 }}
                                        style={{
                                            background: currentTheme.cardBg,
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            border: `1px solid ${currentTheme.border}`,
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            width: '48px',
                                            height: '48px',
                                            background: `${stat.color}15`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: stat.color,
                                            fontSize: '1.5rem'
                                        }}>
                                            <i className={`bi ${stat.icon}`}></i>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>
                                            {stat.title}
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: currentTheme.text, marginBottom: '0.5rem' }}>
                                            {stat.value}
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.85rem', 
                                            color: stat.change.startsWith('+') ? colors.success : colors.danger,
                                            background: stat.change.startsWith('+') ? `${colors.success}15` : `${colors.danger}15`,
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            display: 'inline-block',
                                            fontWeight: 600
                                        }}>
                                            {stat.change} vs mois dernier
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Graphiques détaillés */}
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                {/* Répartition par service */}
                                <motion.div
                                    variants={fadeInUp}
                                    style={{
                                        background: currentTheme.cardBg,
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <h3 style={{ 
                                        fontSize: '1.2rem', 
                                        fontWeight: 600, 
                                        marginBottom: '1.5rem',
                                        color: currentTheme.text,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <i className="bi bi-pie-chart" style={{ color: colors.primary }}></i>
                                        Répartition par type de service
                                    </h3>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        {/* Graphique circulaire */}
                                        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                                            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                                {Object.entries(statsByServiceType).map(([type, count], index) => {
                                                    const total = devisStats.total || 1;
                                                    const percentage = (count / total) * 100;
                                                    const previousTotal = Object.entries(statsByServiceType)
                                                        .slice(0, index)
                                                        .reduce((sum, [_, c]) => sum + (c / total) * 100, 0);
                                                    
                                                    return (
                                                        <circle
                                                            key={type}
                                                            cx="50"
                                                            cy="50"
                                                            r="40"
                                                            fill="none"
                                                            stroke={getServiceColor(type)}
                                                            strokeWidth="20"
                                                            strokeDasharray={`${percentage} ${100 - percentage}`}
                                                            strokeDashoffset={-previousTotal}
                                                            style={{ transition: 'stroke-dasharray 0.5s' }}
                                                        />
                                                    );
                                                })}
                                            </svg>
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '2rem', fontWeight: '800', color: currentTheme.text }}>
                                                    {devisStats.total}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                    Total devis
                                                </div>
                                            </div>
                                        </div>

                                        {/* Légende */}
                                        <div style={{ flex: 1 }}>
                                            {Object.entries(statsByServiceType).map(([type, count]) => {
                                                const percentage = devisStats.total > 0 ? Math.round((count / devisStats.total) * 100) : 0;
                                                return (
                                                    <div key={type} style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        marginBottom: '1rem'
                                                    }}>
                                                        <div style={{
                                                            width: '12px',
                                                            height: '12px',
                                                            background: getServiceColor(type),
                                                            borderRadius: '3px'
                                                        }}></div>
                                                        <span style={{ fontSize: '0.9rem', color: currentTheme.text, flex: 1 }}>
                                                            {getServiceTypeLabel(type)}
                                                        </span>
                                                        <span style={{ fontWeight: 600, color: getServiceColor(type) }}>
                                                            {count} ({percentage}%)
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Répartition par statut */}
                                <motion.div
                                    variants={fadeInUp}
                                    style={{
                                        background: currentTheme.cardBg,
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: `1px solid ${currentTheme.border}`
                                    }}
                                >
                                    <h3 style={{ 
                                        fontSize: '1.2rem', 
                                        fontWeight: 600, 
                                        marginBottom: '1.5rem',
                                        color: currentTheme.text,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <i className="bi bi-bar-chart" style={{ color: colors.primary }}></i>
                                        Répartition par statut
                                    </h3>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ 
                                            display: 'flex', 
                                            height: '40px',
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            marginBottom: '1rem'
                                        }}>
                                            {[
                                                { status: 'en attente', count: devisStats.enAttente, color: colors.warning },
                                                { status: 'validé', count: devisStats.valides, color: colors.success },
                                                { status: 'payé', count: devisStats.payes, color: colors.info },
                                                { status: 'refusé', count: devisStats.refuses, color: colors.danger }
                                            ].map((item) => {
                                                const total = devisStats.total || 1;
                                                const percentage = Math.round((item.count / total) * 100);
                                                return (
                                                    <motion.div
                                                        key={item.status}
                                                        whileHover={{ scale: 1.05 }}
                                                        style={{
                                                            background: item.color,
                                                            width: `${percentage}%`,
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                        title={`${item.status}: ${item.count} (${percentage}%)`}
                                                    >
                                                        {percentage > 5 && `${percentage}%`}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        <div style={{ 
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '0.75rem'
                                        }}>
                                            {[
                                                { status: 'en attente', count: devisStats.enAttente, color: colors.warning },
                                                { status: 'validé', count: devisStats.valides, color: colors.success },
                                                { status: 'payé', count: devisStats.payes, color: colors.info },
                                                { status: 'refusé', count: devisStats.refuses, color: colors.danger }
                                            ].map((item) => (
                                                <div key={item.status} style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem',
                                                    background: currentTheme.hoverBg,
                                                    borderRadius: '8px',
                                                    border: `1px solid ${currentTheme.border}`
                                                }}>
                                                    <div style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        background: item.color,
                                                        borderRadius: '3px'
                                                    }}></div>
                                                    <div style={{ flex: 1, fontSize: '0.85rem', color: currentTheme.text }}>
                                                        {item.status}
                                                    </div>
                                                    <div style={{ fontWeight: 600, color: item.color }}>
                                                        {item.count}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Évolution mensuelle */}
                            <motion.div
                                variants={fadeInUp}
                                style={{
                                    background: currentTheme.cardBg,
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    border: `1px solid ${currentTheme.border}`
                                }}
                            >
                                <h3 style={{ 
                                    fontSize: '1.2rem', 
                                    fontWeight: 600, 
                                    marginBottom: '1.5rem',
                                    color: currentTheme.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="bi bi-graph-up" style={{ color: colors.primary }}></i>
                                    Évolution mensuelle
                                </h3>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: `2px solid ${currentTheme.border}` }}>
                                                <th style={{ textAlign: 'left', padding: '0.75rem', color: currentTheme.textSecondary }}>Mois</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', color: currentTheme.textSecondary }}>Total</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', color: currentTheme.textSecondary }}>Validés</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', color: currentTheme.textSecondary }}>Taux</th>
                                                <th style={{ textAlign: 'right', padding: '0.75rem', color: currentTheme.textSecondary }}>Montant</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(statsByMonth)
                                                .sort((a, b) => b[0].localeCompare(a[0]))
                                                .slice(0, 6)
                                                .map(([month, data]) => (
                                                    <tr key={month} style={{ borderBottom: `1px solid ${currentTheme.border}` }}>
                                                        <td style={{ padding: '0.75rem', fontWeight: 600, color: currentTheme.text }}>
                                                            {month}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'right', color: currentTheme.text }}>
                                                            {data.total}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'right', color: colors.success }}>
                                                            {data.valides}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'right', color: colors.info }}>
                                                            {Math.round((data.valides / data.total) * 100)}%
                                                        </td>
                                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: colors.primary }}>
                                                            {formatCurrency(data.montant, 'TND')}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Utilisateurs Tab */}
                    {activeTab === 'users' && (
                        <motion.div variants={fadeInUp}>
                            <h2 style={{ 
                                fontSize: '1.8rem', 
                                fontWeight: '700',
                                marginBottom: '2rem',
                                color: currentTheme.text,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <i className="bi bi-people" style={{ color: colors.primary }}></i>
                                Gestion des Utilisateurs
                                <span style={{
                                    background: colors.primary,
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}>
                                    {users.length}
                                </span>
                            </h2>

                            <motion.div
                                variants={staggerContainer}
                                style={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                                    gap: '1.5rem'
                                }}
                            >
                                {users.map((user, index) => {
                                    const userDevis = devis.filter(d => d.userId === user.id);
                                    const devisValides = userDevis.filter(d => d.status === 'validé' || d.status === 'payé');
                                    const totalMontant = devisValides.reduce((sum, d) => sum + (d.montantFinal || 0), 0);
                                    
                                    return (
                                        <motion.div
                                            key={user.id}
                                            variants={fadeInUp}
                                            whileHover={{ y: -5 }}
                                            style={{
                                                background: currentTheme.cardBg,
                                                borderRadius: '16px',
                                                padding: '1.5rem',
                                                border: `1px solid ${currentTheme.border}`,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleViewUser(user)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                <div style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    background: user.role === 'admin' ? colors.primaryGradient : colors.successGradient,
                                                    borderRadius: '15px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    {user.name?.substring(0, 2).toUpperCase() || 'U'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ 
                                                        fontWeight: '600', 
                                                        color: currentTheme.text, 
                                                        fontSize: '1.1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        {user.name}
                                                        {user.role === 'admin' && (
                                                            <span style={{
                                                                padding: '2px 8px',
                                                                background: `${colors.primary}15`,
                                                                color: colors.primary,
                                                                borderRadius: '12px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '600'
                                                            }}>
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: currentTheme.textSecondary }}>
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: currentTheme.hoverBg,
                                                borderRadius: '12px',
                                                marginBottom: '1rem'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                        Devis créés
                                                    </div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: currentTheme.text }}>
                                                        {userDevis.length}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                        Validés
                                                    </div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: colors.success }}>
                                                        {devisValides.length}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                        Montant total
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: colors.primary }}>
                                                        {formatCurrency(totalMontant, 'TND')}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                        Dernière activité
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: currentTheme.text }}>
                                                        {formatRelativeTime(user.lastLogin)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '0.85rem',
                                                color: currentTheme.textSecondary
                                            }}>
                                                <span>
                                                    <i className="bi bi-calendar"></i> Inscrit le {formatDate(user.createdAt)}
                                                </span>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    background: user.isActive ? `${colors.success}15` : `${colors.danger}15`,
                                                    color: user.isActive ? colors.success : colors.danger,
                                                    borderRadius: '12px'
                                                }}>
                                                    {user.isActive ? 'Actif' : 'Inactif'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Activités Tab */}
                    {activeTab === 'activities' && (
                        <motion.div variants={fadeInUp}>
                            <h2 style={{ 
                                fontSize: '1.8rem', 
                                fontWeight: '700',
                                marginBottom: '2rem',
                                color: currentTheme.text,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <i className="bi bi-clock-history" style={{ color: colors.primary }}></i>
                                Journal des Activités
                                <span style={{
                                    background: colors.primary,
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}>
                                    {activities.length}
                                </span>
                            </h2>

                            <motion.div
                                variants={staggerContainer}
                                style={{ 
                                    background: currentTheme.hoverBg, 
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    border: `1px solid ${currentTheme.border}`
                                }}
                            >
                                {activities.length === 0 ? (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '3rem',
                                        color: currentTheme.textSecondary 
                                    }}>
                                        <i className="bi bi-clock" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                                        <p style={{ fontSize: '1rem', fontWeight: 500 }}>Aucune activité enregistrée</p>
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                        {activities.map((activity, index) => (
                                            <motion.div
                                                key={activity.id || index}
                                                variants={fadeInUp}
                                                whileHover={{ background: currentTheme.cardBg }}
                                                style={{
                                                    padding: '1rem',
                                                    background: index % 2 === 0 ? currentTheme.cardBg : currentTheme.hoverBg,
                                                    borderBottom: `1px solid ${currentTheme.border}`,
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '1rem',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: activity.type === 'login' ? `${colors.success}15` :
                                                               activity.type === 'register' ? `${colors.primary}15` :
                                                               activity.type === 'devis_request' ? `${colors.warning}15` :
                                                               activity.type === 'devis_update' ? `${colors.info}15` :
                                                               `${colors.gray500}15`,
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: activity.type === 'login' ? colors.success :
                                                           activity.type === 'register' ? colors.primary :
                                                           activity.type === 'devis_request' ? colors.warning :
                                                           activity.type === 'devis_update' ? colors.info :
                                                           colors.gray500,
                                                    fontSize: '1.2rem'
                                                }}>
                                                    <i className={`bi ${activity.type === 'login' ? 'bi-box-arrow-in-right' : 
                                                                 activity.type === 'register' ? 'bi-person-plus' : 
                                                                 activity.type === 'devis_request' ? 'bi-file-earmark-plus' : 
                                                                 activity.type === 'devis_update' ? 'bi-pencil' : 
                                                                 activity.type === 'devis_pdf' ? 'bi-file-earmark-pdf' :
                                                                 'bi-activity'}`}></i>
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        <span style={{ fontWeight: '600', color: currentTheme.text }}>
                                                            {activity.type === 'login' ? 'Connexion' : 
                                                             activity.type === 'register' ? 'Inscription' : 
                                                             activity.type === 'devis_request' ? 'Nouvelle demande de devis' : 
                                                             activity.type === 'devis_update' ? 'Mise à jour de devis' :
                                                             activity.type === 'devis_pdf' ? 'Upload de PDF' :
                                                             'Activité système'}
                                                        </span>
                                                        <span style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                                            {formatDateTime(activity.timestamp)}
                                                        </span>
                                                    </div>

                                                    <div style={{ fontSize: '0.9rem', color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 500 }}>{activity.user?.name || 'Utilisateur'}</span>
                                                        {activity.user?.email && ` (${activity.user.email})`}
                                                    </div>

                                                    {activity.details && (
                                                        <div style={{ 
                                                            marginTop: '0.5rem',
                                                            padding: '0.75rem',
                                                            background: currentTheme.hoverBg,
                                                            borderRadius: '8px',
                                                            fontSize: '0.85rem',
                                                            color: currentTheme.text,
                                                            border: `1px solid ${currentTheme.border}`
                                                        }}>
                                                            {Object.entries(activity.details).map(([key, value]) => (
                                                                <div key={key} style={{ marginBottom: '0.25rem' }}>
                                                                    <strong style={{ color: colors.primary }}>{key}:</strong> {String(value)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div style={{ 
                                                        marginTop: '0.5rem',
                                                        fontSize: '0.8rem',
                                                        color: currentTheme.textSecondary,
                                                        display: 'flex',
                                                        gap: '1rem'
                                                    }}>
                                                        <span>
                                                            <i className="bi bi-globe"></i> {activity.ip || 'IP inconnue'}
                                                        </span>
                                                        <span>
                                                            <i className="bi bi-browser-chrome"></i> {activity.userAgent || 'Appareil inconnu'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </main>

            {/* Modal Édition Devis */}
            <AnimatePresence>
                {showDevisModal && selectedDevis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px',
                            backdropFilter: 'blur(5px)'
                        }}
                        onClick={() => setShowDevisModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: currentTheme.cardBg,
                                borderRadius: '20px',
                                padding: '2rem',
                                maxWidth: '800px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                border: `1px solid ${currentTheme.border}`
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '1.5rem' 
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 700, 
                                    color: currentTheme.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="bi bi-pencil" style={{ color: colors.primary }}></i>
                                    Éditer le devis #{selectedDevis.id}
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowDevisModal(false)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: currentTheme.hoverBg,
                                        border: `1px solid ${currentTheme.border}`,
                                        borderRadius: '10px',
                                        color: currentTheme.textSecondary,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    ×
                                </motion.button>
                            </div>

                            {/* Informations du devis */}
                            <div style={{ 
                                background: currentTheme.hoverBg, 
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                border: `1px solid ${currentTheme.border}`
                            }}>
                                <h4 style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: 600, 
                                    marginBottom: '1rem', 
                                    color: currentTheme.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="bi bi-info-circle" style={{ color: colors.primary }}></i>
                                    Informations du devis
                                </h4>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                    gap: '1rem' 
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary, marginBottom: '0.25rem' }}>
                                            Client
                                        </div>
                                        <div style={{ fontWeight: '600', color: currentTheme.text }}>
                                            {selectedDevis.userName || 'Client'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                            {selectedDevis.userEmail}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary, marginBottom: '0.25rem' }}>
                                            Service
                                        </div>
                                        <div style={{ fontWeight: '600', color: getServiceColor(selectedDevis.serviceType) }}>
                                            {getServiceTypeLabel(selectedDevis.serviceType)}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                            {selectedDevis.serviceTitle}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary, marginBottom: '0.25rem' }}>
                                            Détails
                                        </div>
                                        <div style={{ fontWeight: '500', color: currentTheme.text }}>
                                            {selectedDevis.participants || 1} participants
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                            {selectedDevis.duree || 1} {selectedDevis.uniteDuree || 'jours'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary, marginBottom: '0.25rem' }}>
                                            Entreprise
                                        </div>
                                        <div style={{ fontWeight: '600', color: currentTheme.text }}>
                                            {selectedDevis.entreprise || 'Non spécifiée'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: currentTheme.textSecondary }}>
                                            {selectedDevis.lieu || 'Lieu non spécifié'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formulaire d'édition */}
                            <form onSubmit={handleUpdateDevis}>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '1.5rem', 
                                    marginBottom: '2rem' 
                                }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontWeight: 600, 
                                            color: currentTheme.text 
                                        }}>
                                            <i className="bi bi-tag" style={{ marginRight: '0.5rem', color: colors.primary }}></i>
                                            Statut *
                                        </label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: `1px solid ${currentTheme.border}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                background: currentTheme.cardBg,
                                                color: currentTheme.text,
                                                cursor: 'pointer',
                                                outline: 'none'
                                            }}
                                            required
                                        >
                                            <option value="en attente">En attente</option>
                                            <option value="validé">Validé</option>
                                            <option value="payé">Payé</option>
                                            <option value="refusé">Refusé</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontWeight: 600, 
                                            color: currentTheme.text 
                                        }}>
                                            <i className="bi bi-currency-exchange" style={{ marginRight: '0.5rem', color: colors.primary }}></i>
                                            Montant final
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={editForm.montantFinal}
                                                onChange={(e) => setEditForm({...editForm, montantFinal: e.target.value})}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem 1rem',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    background: currentTheme.cardBg,
                                                    color: currentTheme.text,
                                                    outline: 'none'
                                                }}
                                                placeholder="Montant"
                                            />
                                            <select
                                                value={editForm.devise}
                                                onChange={(e) => setEditForm({...editForm, devise: e.target.value})}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    border: `1px solid ${currentTheme.border}`,
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    background: currentTheme.cardBg,
                                                    color: currentTheme.text,
                                                    cursor: 'pointer',
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="TND">TND</option>
                                                <option value="EUR">€</option>
                                                <option value="USD">$</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: 600, 
                                        color: currentTheme.text 
                                    }}>
                                        <i className="bi bi-chat" style={{ marginRight: '0.5rem', color: colors.primary }}></i>
                                        Commentaire pour le client
                                    </label>
                                    <textarea
                                        value={editForm.commentaireAdmin}
                                        onChange={(e) => setEditForm({...editForm, commentaireAdmin: e.target.value})}
                                        rows="4"
                                        placeholder="Ajoutez un commentaire pour le client..."
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: `1px solid ${currentTheme.border}`,
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            resize: 'vertical',
                                            background: currentTheme.cardBg,
                                            color: currentTheme.text,
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {/* Upload PDF */}
                                <div style={{ 
                                    background: currentTheme.hoverBg, 
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    marginBottom: '2rem',
                                    border: `1px solid ${currentTheme.border}`
                                }}>
                                    <h4 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: 600, 
                                        marginBottom: '1rem', 
                                        color: currentTheme.text,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <i className="bi bi-file-earmark-pdf" style={{ color: colors.danger }}></i>
                                        {selectedDevis.fichierPdf ? 'Remplacer le PDF' : 'Ajouter un PDF'}
                                    </h4>

                                    {selectedDevis.fichierPdf && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem', color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>
                                                Fichier actuel:
                                            </div>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem',
                                                padding: '0.75rem',
                                                background: currentTheme.cardBg,
                                                borderRadius: '8px',
                                                border: `1px solid ${currentTheme.border}`
                                            }}>
                                                <i className="bi bi-file-earmark-pdf" style={{ color: colors.danger, fontSize: '1.2rem' }}></i>
                                                <span style={{ flex: 1, fontSize: '0.9rem', color: currentTheme.text }}>
                                                    {selectedDevis.fileName || 'devis.pdf'}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="button"
                                                    onClick={() => window.open(`http://localhost:5000${selectedDevis.fichierPdf}`, '_blank')}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        background: colors.primary,
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                    Voir
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontSize: '0.9rem', 
                                            color: currentTheme.textSecondary 
                                        }}>
                                            Sélectionner un fichier PDF (max 5MB)
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file && file.type === 'application/pdf') {
                                                    if (file.size <= 5 * 1024 * 1024) {
                                                        setUploadFile(file);
                                                    } else {
                                                        showNotification('error', 'Le fichier doit être inférieur à 5MB');
                                                        e.target.value = '';
                                                    }
                                                } else if (file) {
                                                    showNotification('error', 'Seuls les fichiers PDF sont autorisés');
                                                    e.target.value = '';
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: `2px dashed ${uploadFile ? colors.success : currentTheme.border}`,
                                                borderRadius: '8px',
                                                fontSize: '1rem',
                                                background: currentTheme.cardBg,
                                                color: currentTheme.text,
                                                cursor: 'pointer'
                                            }}
                                        />
                                        {uploadFile && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ 
                                                    marginTop: '0.5rem',
                                                    padding: '0.5rem',
                                                    background: `${colors.success}15`,
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    fontSize: '0.85rem',
                                                    color: colors.success
                                                }}
                                            >
                                                <i className="bi bi-check-circle-fill"></i>
                                                Fichier sélectionné: {uploadFile.name}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setShowDevisModal(false);
                                            setUploadFile(null);
                                        }}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: 'transparent',
                                            color: currentTheme.text,
                                            border: `1px solid ${currentTheme.border}`,
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            minWidth: '120px'
                                        }}
                                    >
                                        Annuler
                                    </motion.button>

                                    {uploadFile && (
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUploadPDF(selectedDevis.id)}
                                            disabled={uploading}
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                background: uploading ? currentTheme.textSecondary : colors.success,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: uploading ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                minWidth: '180px'
                                            }}
                                        >
                                            {uploading ? (
                                                <>
                                                    <div style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        border: '2px solid white',
                                                        borderTopColor: 'transparent',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite'
                                                    }}></div>
                                                    Upload en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-upload"></i>
                                                    Upload PDF seulement
                                                </>
                                            )}
                                        </motion.button>
                                    )}

                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={uploading}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: uploading ? currentTheme.textSecondary : colors.primary,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            minWidth: '200px'
                                        }}
                                    >
                                        {uploading ? (
                                            <>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    border: '2px solid white',
                                                    borderTopColor: 'transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }}></div>
                                                Traitement...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-save"></i>
                                                Enregistrer les modifications
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Détails Utilisateur */}
            <AnimatePresence>
                {showUserModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px',
                            backdropFilter: 'blur(5px)'
                        }}
                        onClick={() => setShowUserModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: currentTheme.cardBg,
                                borderRadius: '20px',
                                padding: '2rem',
                                maxWidth: '600px',
                                width: '100%',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                border: `1px solid ${currentTheme.border}`
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                marginBottom: '1.5rem' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        background: selectedUser.role === 'admin' ? colors.primaryGradient : colors.successGradient,
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1.8rem'
                                    }}>
                                        {selectedUser.name?.substring(0, 2).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: currentTheme.text }}>
                                            {selectedUser.name}
                                        </h3>
                                        <p style={{ color: currentTheme.textSecondary }}>{selectedUser.email}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowUserModal(false)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: currentTheme.hoverBg,
                                        border: `1px solid ${currentTheme.border}`,
                                        borderRadius: '10px',
                                        color: currentTheme.textSecondary,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    ×
                                </motion.button>
                            </div>

                            <div style={{ 
                                background: currentTheme.hoverBg,
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 600, 
                                    marginBottom: '1rem',
                                    color: currentTheme.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="bi bi-info-circle" style={{ color: colors.primary }}></i>
                                    Informations générales
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Rôle</div>
                                        <div style={{ fontWeight: 600, color: currentTheme.text }}>
                                            {selectedUser.role === 'admin' ? 'Administrateur' : 'Client'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Statut</div>
                                        <div style={{ 
                                            color: selectedUser.isActive ? colors.success : colors.danger,
                                            fontWeight: 600
                                        }}>
                                            {selectedUser.isActive ? 'Actif' : 'Inactif'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Inscrit le</div>
                                        <div style={{ fontWeight: 500, color: currentTheme.text }}>
                                            {formatDate(selectedUser.createdAt)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Dernière connexion</div>
                                        <div style={{ fontWeight: 500, color: currentTheme.text }}>
                                            {selectedUser.lastLogin ? formatDateTime(selectedUser.lastLogin) : 'Jamais'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedUser.company && (
                                <div style={{ 
                                    background: currentTheme.hoverBg,
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h4 style={{ 
                                        fontSize: '1rem', 
                                        fontWeight: 600, 
                                        marginBottom: '1rem',
                                        color: currentTheme.text,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <i className="bi bi-building" style={{ color: colors.primary }}></i>
                                        Entreprise
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Nom</div>
                                            <div style={{ fontWeight: 600, color: currentTheme.text }}>{selectedUser.company}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Poste</div>
                                            <div style={{ fontWeight: 500, color: currentTheme.text }}>
                                                {selectedUser.position || 'Non spécifié'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Téléphone</div>
                                            <div style={{ fontWeight: 500, color: currentTheme.text }}>
                                                {selectedUser.phone || 'Non spécifié'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ 
                                background: currentTheme.hoverBg,
                                borderRadius: '12px',
                                padding: '1.5rem'
                            }}>
                                <h4 style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 600, 
                                    marginBottom: '1rem',
                                    color: currentTheme.text,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <i className="bi bi-file-earmark-text" style={{ color: colors.primary }}></i>
                                    Statistiques des devis
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Total devis</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: currentTheme.text }}>
                                            {devis.filter(d => d.userId === selectedUser.id).length}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Devis validés</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.success }}>
                                            {devis.filter(d => d.userId === selectedUser.id && (d.status === 'validé' || d.status === 'payé')).length}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Montant total</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary }}>
                                            {formatCurrency(
                                                devis.filter(d => d.userId === selectedUser.id)
                                                    .reduce((sum, d) => sum + (d.montantFinal || 0), 0),
                                                'TND'
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: currentTheme.textSecondary }}>Dernier devis</div>
                                        <div style={{ fontWeight: 500, color: currentTheme.text }}>
                                            {formatDate(devis.filter(d => d.userId === selectedUser.id)[0]?.createdAt) || 'Aucun'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .chart-tooltip {
                    transition: opacity 0.3s;
                }
                
                div:hover > .chart-tooltip {
                    opacity: 1 !important;
                }
                
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: ${currentTheme.hoverBg};
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: ${colors.primary}40;
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: ${colors.primary}60;
                }
            `}</style>
        </div>
    );
};

export default DashboardAdmin;