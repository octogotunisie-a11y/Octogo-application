import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './styles/animations.css';



document.body.style.width = '100vw';
document.body.style.maxWidth = '100vw';
document.body.style.overflowX = 'hidden';
// =============================================

// Charger le script neuro après le rendu
setTimeout(() => {
  const script = document.createElement('script');
  script.src = '/src/styles/animations.css';
  script.onload = () => {
    if (window.initNeuroEffects) {
      window.initNeuroEffects();
    }
  };
  document.body.appendChild(script);
}, 100);
// Initialiser les effets neuro après le rendu
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Charger le script neuro après le rendu