// API simulée pour les données
const API_BASE_URL = 'http://localhost:5000/api'

// Fonction pour simuler les appels API
const mockApiCall = (data, delay = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data
            })
        }, delay)
    })
}

// Données simulées
const mockFormations = [{
    id: 1,
    title: 'Leadership Transformational',
    category: 'leadership',
    pdfUrl: '/uploads/formations/leadership.pdf'
}]

const mockParcours = [{
    id: 1,
    title: 'Parcours Leadership Excellence',
    pdfUrl: '/uploads/parcours/leadership-parcours.pdf'
}]

const mockTeamBuilding = [{
    id: 1,
    title: 'Escape Game Stratégique',
    pdfUrl: '/uploads/teambuilding/escape-details.pdf'
}]

// Fonctions API
export const api = {
    // Formations
    getFormations: () => mockApiCall(mockFormations),
    getFormationById: (id) => mockApiCall(mockFormations.find(f => f.id === id)),

    // Parcours
    getParcours: () => mockApiCall(mockParcours),
    getParcoursById: (id) => mockApiCall(mockParcours.find(p => p.id === id)),

    // Team Building
    getTeamBuilding: () => mockApiCall(mockTeamBuilding),
    getTeamBuildingById: (id) => mockApiCall(mockTeamBuilding.find(t => t.id === id)),

    // Contact
    sendContact: (data) => mockApiCall({ message: 'Message envoyé avec succès' }),

    // Auth (simulé)
    login: (credentials) => mockApiCall({ token: 'demo-token', user: { email: credentials.email } }),
    register: (userData) => mockApiCall({ message: 'Inscription réussie' }),

    // Upload (simulé)
    uploadFile: (file) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    url: `/uploads/${file.name}`,
                    message: 'Fichier uploadé avec succès'
                })
            }, 2000)
        })
    }
}

// Fonction utilitaire pour les appels fetch
export const fetchApi = async(endpoint, options = {}) => {
    const token = localStorage.getItem('octogo_token')

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
}