import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Articles from './pages/Articles';
import Clients from './pages/clients';
import Formations from './pages/Formations';
import Coaching from './pages/Coaching';
import Parcours from './pages/Parcours';
import TeamBuilding from './pages/TeamBuilding';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardClient from './pages/DashboardClient';
import DashboardAdmin from './pages/DashboardAdmin';
import Chatbot from './pages/chatbot.jsx';
import GenerationProgramme from './pages/GenerationProgramme';

// Composant pour les routes protégées client uniquement
const ClientRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #e2e8f0',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748B' }}>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Si l'utilisateur est admin, rediriger vers le dashboard admin
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  // Sinon, c'est un client, on affiche le contenu
  return children;
};

// Composant pour les routes admin uniquement
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #e2e8f0',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748B' }}>Vérification des droits admin...</p>
        </div>
      </div>
    );
  }
  
  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Si l'utilisateur n'est pas admin, rediriger vers le dashboard client
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  // Sinon, c'est un admin, on affiche le contenu
  return children;
};

// Composant pour les routes publiques (si déjà connecté, rediriger selon le rôle)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #e2e8f0',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748B' }}>Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Si l'utilisateur est déjà connecté, rediriger selon son rôle
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }
  
  // Sinon, afficher le contenu public
  return children;
};

// Route intelligente pour /dashboard qui redirige selon le rôle
const SmartDashboardRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #e2e8f0',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748B' }}>Redirection...</p>
        </div>
      </div>
    );
  }
  
  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Rediriger selon le rôle
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <Navigate to="/dashboard-client" />;
  }
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #e2e8f0',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ color: '#475569', marginBottom: '8px' }}>Chargement</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Initialisation de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Navbar />
      
      <main style={{ 
        minHeight: 'calc(100vh - 160px)',
        paddingTop: '72px',
        backgroundColor: '#f8fafc',
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden'
      }}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/coaching" element={<Coaching />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/parcours" element={<Parcours />} />
          <Route path="/team-building" element={<TeamBuilding />} />
          <Route path="/generation-programme" element={<GenerationProgramme />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Routes d'authentification */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          
          {/* Route /dashboard intelligente qui redirige selon le rôle */}
          <Route path="/dashboard" element={<SmartDashboardRoute />} />
          
          {/* Route spécifique pour les clients */}
          <Route 
            path="/dashboard-client" 
            element={
              <ClientRoute>
                <DashboardClient />
              </ClientRoute>
            }
          />
          
          {/* Route spécifique pour les admins */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <DashboardAdmin />
              </AdminRoute>
            }
          />
          
          {/* Redirection pour toute autre route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      {/* Chatbot - visible sur toutes les pages */}
      <Chatbot />
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;