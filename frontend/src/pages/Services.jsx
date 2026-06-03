import { useState } from 'react'
import '../styles/main.css'
import '../styles/animations.css'

const Services = () => {
  const [activeTab, setActiveTab] = useState('neuroleadership')

  const servicesData = {
    neuroleadership: {
      title: 'NeuroLeadership',
      description: 'Développez un leadership conscient basé sur les neurosciences pour une influence positive et des décisions éclairées.',
      benefits: [
        'Prise de décision optimisée grâce à la compréhension des biais cognitifs',
        'Amélioration de la communication et de l\'intelligence émotionnelle',
        'Développement de la résilience et de la gestion du stress',
        'Renforcement de la cohésion d\'équipe et de la performance collective'
      ],
      stats: [
        { value: '+120%', label: 'Performance managériale' },
        { value: '-40%', label: 'Stress' },
        { value: '95%', label: 'Satisfaction équipe' },
        { value: '265%', label: 'ROI' }
      ],
      duration: '36h - 60h',
      format: 'Présentiel / Hybride'
    },
    neuromarketing: {
      title: 'Neuromarketing',
      description: 'Campagnes percutantes basées sur la compréhension du cerveau et des émotions pour un impact maximal.',
      benefits: [
        'Optimisation des messages publicitaires pour une meilleure mémorisation',
        'Augmentation des taux de conversion grâce aux leviers émotionnels',
        'Création d\'expériences client personnalisées et engageantes',
        'Mesure précise de l\'impact émotionnel des campagnes'
      ],
      stats: [
        { value: '+70%', label: 'Attention' },
        { value: '+60%', label: 'Engagement' },
        { value: '+30%', label: 'Conversion' },
        { value: '+45%', label: 'ROI Marketing' }
      ],
      duration: '24h - 48h',
      format: 'Présentiel'
    },
    neurolearning: {
      title: 'NeuroLearning',
      description: 'Apprentissage accéléré grâce aux mécanismes cérébraux et à la neuroplasticité pour une formation efficace.',
      benefits: [
        'Rétention d\'information améliorée grâce aux techniques de mémorisation',
        'Réduction du temps de formation de 40%',
        'Adaptation des méthodes pédagogiques aux profils cognitifs',
        'Intégration des neurosciences dans le design pédagogique'
      ],
      stats: [
        { value: '+80%', label: 'Rétention' },
        { value: '-40%', label: 'Temps formation' },
        { value: '95%', label: 'Satisfaction' },
        { value: '+65%', label: 'Application terrain' }
      ],
      duration: 'Variable selon besoin',
      format: 'Présentiel / Digital'
    },
    neurovente: {
      title: 'NeuroVente',
      description: 'Boostez vos ventes en comprenant les mécanismes de décision d\'achat et les émotions des clients.',
      benefits: [
        'Augmentation des taux de closing grâce à la neuropersuasion éthique',
        'Amélioration de la fidélisation client par la compréhension des besoins',
        'Développement de l\'intelligence émotionnelle commerciale',
        'Optimisation des processus de vente basée sur les neurosciences'
      ],
      stats: [
        { value: '+35%', label: 'Taux de closing' },
        { value: 'x3', label: 'Fidélisation client' },
        { value: '+45%', label: 'Chiffre d\'affaires' },
        { value: '+50%', label: 'Productivité commerciale' }
      ],
      duration: '54h',
      format: 'Présentiel / Hybride'
    }
  }

  const serviceCategories = [
    { id: 'neuroleadership', name: 'NeuroLeadership', icon: '👑' },
    { id: 'neuromarketing', name: 'Neuromarketing', icon: '🎯' },
    { id: 'neurolearning', name: 'NeuroLearning', icon: '🧠' },
    { id: 'neurovente', name: 'NeuroVente', icon: '💰' },
    { id: 'neurobienetre', name: 'Bien-être Neuro', icon: '🧘' },
    { id: 'neurosynergie', name: 'NeuroSynergie', icon: '🤝' }
  ]

  const activeService = servicesData[activeTab]

  return (
    <div className="container" style={{ paddingTop: '8rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ 
          fontSize: '3.5rem',
          background: 'linear-gradient(135deg, var(--violet), var(--pink))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: '1rem'
        }}>
          Nos Services Neurosciences
        </h1>
        <p style={{ 
          fontSize: '1.3rem', 
          color: 'var(--gray)',
          maxWidth: '800px', 
          margin: '0 auto',
          lineHeight: '1.8'
        }}>
          Des solutions innovantes basées sur les découvertes scientifiques du cerveau pour libérer 
          le potentiel humain et améliorer la performance organisationnelle.
        </p>
      </div>

      {/* Navigation par Catégories */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '4rem'
      }}>
        {serviceCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '1rem 2rem',
              background: activeTab === category.id ? 'var(--gradient-primary)' : 'var(--white)',
              color: activeTab === category.id ? 'white' : 'var(--violet)',
              border: `2px solid ${activeTab === category.id ? 'transparent' : 'var(--violet-light)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'var(--transition-normal)',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Détails du Service Actif */}
      <div className="card" style={{ marginBottom: '4rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.8rem'
              }}>
                {serviceCategories.find(c => c.id === activeTab)?.icon}
              </div>
              <h2 style={{ color: 'var(--violet)', fontSize: '2.2rem' }}>
                {activeService.title}
              </h2>
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--gray)', maxWidth: '800px' }}>
              {activeService.description}
            </p>
          </div>
          
          <div style={{ 
            background: 'var(--gradient-light)', 
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            minWidth: '200px'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '0.25rem' }}>Durée</div>
              <div style={{ fontWeight: '600', color: 'var(--violet)' }}>{activeService.duration}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '0.25rem' }}>Format</div>
              <div style={{ fontWeight: '600', color: 'var(--violet)' }}>{activeService.format}</div>
            </div>
          </div>
        </div>

        {/* Bénéfices */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ color: 'var(--violet)', marginBottom: '1.5rem' }}>Bénéfices Principaux</h3>
          <div className="grid-2">
            {activeService.benefits.map((benefit, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  minWidth: '24px', 
                  height: '24px', 
                  background: 'var(--gradient-primary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem'
                }}>
                  ✓
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div>
          <h3 style={{ color: 'var(--violet)', marginBottom: '1.5rem' }}>Impact Mesurable</h3>
          <div className="grid-4">
            {activeService.stats.map((stat, index) => (
              <div key={index} className="card" style={{ 
                textAlign: 'center',
                padding: '1.5rem',
                background: 'var(--gradient-light)'
              }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '800',
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: '0.5rem'
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        background: 'var(--gradient-light)',
        borderRadius: 'var(--radius-lg)',
        marginTop: '4rem'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          color: 'var(--violet)'
        }}>
          Prêt à transformer votre organisation ?
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--gray)' }}>
          Contactez-nous pour une consultation personnalisée et découvrez comment les 
          neurosciences peuvent booster votre performance.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <a href="/contact" className="btn btn-primary">
            Demander une consultation
          </a>
          <a href="/training" className="btn btn-secondary">
            Voir le catalogue complet
          </a>
        </div>
      </div>
    </div>
  )
}

export default Services