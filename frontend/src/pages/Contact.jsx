import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  })
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !selectedDate || !selectedTime) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      const contactData = {
        ...formData,
        date: selectedDate.toISOString(),
        time: selectedTime,
        userId: user.id || null,
        userName: user.name || formData.name,
        userEmail: user.email || formData.email,
        status: 'nouveau',
        type: 'contact_form'
      }

      // Envoyer la demande de contact au backend
      const response = await fetch('http://localhost:5000/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(contactData)
      })

      const data = await response.json()
      
      if (response.ok) {
        // Afficher message de succès
        setIsSubmitted(true)
        
        // NE PAS rediriger vers le dashboard
        // Si l'utilisateur est connecté, il peut choisir d'aller au dashboard
        // Sinon, rester sur la page de contact
        
        // Réinitialiser le formulaire
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            subject: '',
            message: ''
          })
          setSelectedDate(new Date())
          setSelectedTime('')
          setIsSubmitted(false)
        }, 3000)
      } else {
        alert(data.message || 'Erreur lors de l\'envoi du formulaire')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: 'bi-telephone',
      title: 'Téléphone',
      content: '+216 28 26 28 29',
      link: 'tel:+21628262829'
    },
    {
      icon: 'bi-envelope',
      title: 'Email',
      content: 'contact@octogo.tn',
      link: 'mailto:contact@octogo.tn'
    },
    {
      icon: 'bi-globe',
      title: 'Site web',
      content: 'www.octogo.tn',
      link: 'https://www.octogo.tn'
    },
    {
      icon: 'bi-clock',
      title: 'Horaires',
      content: 'Lun - Ven: 9h - 18h'
    }
  ]

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <img src="/src/images/1.png" alt="Octogo Logo" className="page-header-logo" />
          <h1 className="page-title">Contactez-nous</h1>
          <p className="page-subtitle">
            Prenez rendez-vous avec nos experts en neurosciences appliquées. 
            Discutons de vos besoins et créons ensemble des solutions sur mesure.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          {/* Contact Info & Map Section */}
          <div className="contact-grid">
            
            {/* Left Column - Contact Info */}
            <div className="contact-column">
              <div className="contact-card">
                <h2 className="contact-title">
                  <div className="icon-gradient">
                    <i className="bi bi-people-fill"></i>
                  </div>
                  Notre équipe vous attend
                </h2>
                
                <p className="contact-description">
                  Rencontrez nos experts en neurosciences pour transformer votre organisation. 
                  Nous vous accueillons dans nos locaux ou en visioconférence.
                </p>
                
                {/* Contact Cards */}
                <div className="contact-info-grid">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="contact-info-item">
                      <div className="contact-icon">
                        <i className={`bi ${info.icon}`}></i>
                      </div>
                      <div className="contact-info-content">
                        <h4>{info.title}</h4>
                        {info.link ? (
                          <a 
                            href={info.link} 
                            target={info.link.includes('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="contact-link"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p>{info.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Google Map & Social Links */}
            <div className="contact-column">
              <div className="map-card">
                <div className="map-header">
                  <div className="icon-gradient orange">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div>
                    <h3>Notre localisation</h3>
                    <p>Tunis, Tunisie</p>
                  </div>
                </div>
                
                {/* Google Map Embed */}
                <div className="map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3190.618676850705!2d10.613037!3d35.844205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd8bc195c5d9c7%3A0x62b6a9727c6a1b5!2sOctogo!5e0!3m2!1sfr!2stn!4v1734259200000!5m2!1sfr!2stn"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Octogo Location"
                  ></iframe>
                </div>

                {/* Social Links */}
                <div className="social-section">
                  <h4>
                    <i className="bi bi-share"></i>
                    Rejoignez notre communauté
                  </h4>
                  <div className="social-buttons">
                    {[
                      { icon: 'bi-facebook', label: 'Facebook', color: '#4267B2', url: 'https://www.facebook.com/octogo.tn' },
                      { icon: 'bi-linkedin', label: 'LinkedIn', color: '#0077B5', url: 'https://www.linkedin.com/company/octogo-conseil-et-formation/' },
                      { icon: 'bi-instagram', label: 'Instagram', color: '#E4405F', url: 'https://www.instagram.com/octogo.tn/' },
                    ].map((social) => (
                      <a 
                        key={social.label}
                        href={social.url} 
                        className="social-button"
                        style={{ '--social-color': social.color }}
                        target="_blank"    
                        rel="noopener noreferrer" 
                      >
                        <i className={`bi ${social.icon}`}></i>
                        <span>{social.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="booking-section">
            <div className="booking-header">
              <div className="booking-icon">
                <i className="bi bi-calendar-check"></i>
              </div>
              <h2>Prenez rendez-vous en ligne</h2>
              <p className="booking-subtitle">
                Sélectionnez une date et heure qui vous convient. Notre équipe vous confirmera le rendez-vous dans les 24h.
              </p>
            </div>

            {isSubmitted ? (
              <div className="success-message">
                <div className="success-icon">
                  <i className="bi bi-check-lg"></i>
                </div>
                <h3>Demande envoyée avec succès !</h3>
                <p>
                  Nous vous avons envoyé un email de confirmation. Notre équipe vous contactera dans les plus brefs délais.
                </p>
                <div className="success-actions">
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="new-appointment-btn"
                  >
                    Prendre un nouveau rendez-vous
                  </button>
                  {localStorage.getItem('token') && (
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="go-to-dashboard-btn"
                    >
                      <i className="bi bi-speedometer2"></i>
                      Aller au dashboard
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="booking-grid">
                {/* Calendar & Time Selection */}
                <div>
                  <div className="calendar-section">
                    <h4>
                      <i className="bi bi-calendar-date"></i>
                      Sélectionnez une date
                    </h4>
                    
                    {/* Centered Calendar */}
                    <div className="calendar-wrapper">
                      <div className="calendar-container">
                        <Calendar
                          onChange={setSelectedDate}
                          value={selectedDate}
                          minDate={new Date()}
                          className="react-calendar"
                        />
                      </div>
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                      <div className="time-section">
                        <h4>
                          <i className="bi bi-clock"></i>
                          Choisissez un créneau horaire
                        </h4>
                        <div className="time-grid">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <div className="form-section">
                    <h4>
                      <i className="bi bi-person-circle"></i>
                      Informations de contact
                    </h4>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="form-fields">
                        <div className="form-row">
                          <input
                            type="text"
                            name="name"
                            placeholder="Nom complet *"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                          />
                          
                          <input
                            type="email"
                            name="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                          />
                        </div>
                        
                        <div className="form-row">
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Téléphone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                          
                          <input
                            type="text"
                            name="company"
                            placeholder="Entreprise"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                        
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="form-select"
                        >
                          <option value="">Sujet de la demande *</option>
                          <option value="formation">Formation en neurosciences</option>
                          <option value="parcours">Parcours certifiant</option>
                          <option value="teambuilding">Team building neuroscientifique</option>
                          <option value="consulting">Consulting stratégique</option>
                          <option value="coaching">Coaching individuel</option>
                          <option value="autre">Autre demande</option>
                        </select>
                        
                        <textarea
                          name="message"
                          placeholder="Votre message ou besoins spécifiques *"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows="4"
                          className="form-textarea"
                        ></textarea>
                      </div>

                      {selectedDate && selectedTime && (
                        <div className="selected-appointment">
                          <p>
                            <i className="bi bi-calendar-check"></i>
                            Rendez-vous sélectionné :
                          </p>
                          <p className="appointment-details">
                            {selectedDate.toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })} à {selectedTime}
                          </p>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={!selectedDate || !selectedTime || isLoading}
                        className="submit-btn"
                      >
                        {isLoading ? (
                          <>
                            <div className="spinner"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send"></i>
                            Confirmer le rendez-vous
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Styles généraux */
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .page-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          text-align: center;
          padding: 4rem 1rem;
        }

        .page-title {
          color: #1F2937;
          font-size: 2.5rem;
          margin: 1rem 0;
        }

        .page-subtitle {
          color: #6B7280;
          max-width: 600px;
          margin: 0 auto;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .page-header-logo {
          max-width: 150px;
          height: auto;
        }

        .section {
          padding: 4rem 0;
        }

        /* Contact Grid */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .contact-card, .map-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          boxShadow: 0 8px 30px rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.1);
          height: 100%;
        }

        .contact-title {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
          color: #1F2937;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-gradient {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .icon-gradient.orange {
          background: linear-gradient(135deg, #F97316 0%, #EC4899 100%);
        }

        .contact-description {
          font-size: 1rem;
          color: #6B7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .contact-info-grid {
          margin-bottom: 2rem;
        }

        .contact-info-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 0.75rem;
          background: rgba(139, 92, 246, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(139, 92, 246, 0.08);
          transition: all 0.3s ease;
        }

        .contact-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B5CF6;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .contact-info-content h4 {
          margin-bottom: 0.25rem;
          color: #1F2937;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .contact-link {
          color: #6B7280;
          text-decoration: none;
          transition: color 0.3s ease;
          font-size: 0.9rem;
        }

        .contact-info-content p {
          color: #6B7280;
          margin: 0;
          font-size: 0.9rem;
        }

        /* Map Section */
        .map-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.5rem;
        }

        .map-header h3 {
          margin: 0;
          color: #1F2937;
          font-size: 1.5rem;
        }

        .map-header p {
          margin: 0.25rem 0 0 0;
          color: #6B7280;
          font-size: 0.9rem;
        }

        .map-container {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          min-height: 250px;
          margin-bottom: 2rem;
        }

        .map-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        /* Social Section */
        .social-section {
          width: 100%;
        }

        .social-section h4 {
          margin-bottom: 1.5rem;
          color: #1F2937;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .social-section h4 i {
          color: #8B5CF6;
        }

        .social-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          width: 100%;
        }

        .social-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 16px;
          background: white;
          border-radius: 12px;
          color: #1F2937;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid rgba(139, 92, 246, 0.1);
          transition: all 0.3s ease;
          text-align: center;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .social-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: var(--social-color, #8B5CF6);
        }

        .social-button i {
          font-size: 1.2rem;
          color: var(--social-color, #8B5CF6);
          flex-shrink: 0;
        }

        .social-button span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Booking Section */
        .booking-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 30px rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.1);
        }

        .booking-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .booking-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          font-size: 1.25rem;
        }

        .booking-section h2 {
          font-size: 1.75rem;
          margin-bottom: 0.75rem;
          color: #1F2937;
        }

        .booking-subtitle {
          color: #6B7280;
          font-size: 1rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Success Message */
        .success-message {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.04));
          border-radius: 16px;
          border: 2px solid rgba(16, 185, 129, 0.15);
        }

        .success-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #10B981, #34D399);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          font-size: 1.5rem;
        }

        .success-message h3 {
          margin-bottom: 0.5rem;
          color: #1F2937;
          font-size: 1.3rem;
        }

        .success-message p {
          color: #6B7280;
          max-width: 500px;
          margin: 0 auto 1rem;
          font-size: 0.95rem;
        }

        .success-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .new-appointment-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .go-to-dashboard-btn {
          padding: 12px 24px;
          background: white;
          color: #8B5CF6;
          border: 2px solid #8B5CF6;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .go-to-dashboard-btn:hover {
          background: #8B5CF6;
          color: white;
        }

        /* Booking Grid */
        .booking-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .calendar-section, .form-section {
          background: rgba(139, 92, 246, 0.03);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(139, 92, 246, 0.1);
        }

        .calendar-section h4, .form-section h4 {
          margin-bottom: 1rem;
          color: #1F2937;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .calendar-section h4 i, .form-section h4 i {
          color: #8B5CF6;
        }

        .calendar-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .calendar-container {
          width: 100%;
          max-width: 100%;
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .react-calendar {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
        }

        /* Time Slots */
        .time-section {
          margin-top: 1.5rem;
        }

        .time-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.5rem;
        }

        .time-slot {
          padding: 0.6rem;
          background: white;
          border: 1.5px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          color: #1F2937;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }

        .time-slot.selected {
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
          border-color: transparent;
          color: white;
        }

        /* Form Styles */
        .form-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1.5px solid rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }

        .form-select {
          color: #6B7280;
          margin-bottom: 1rem;
        }

        .form-textarea {
          resize: vertical;
        }

        .selected-appointment {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.05));
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(139, 92, 246, 0.15);
        }

        .selected-appointment p:first-child {
          margin: 0;
          color: #1F2937;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .selected-appointment p:first-child i {
          color: #8B5CF6;
        }

        .appointment-details {
          margin: 0.5rem 0 0 0;
          color: #6B7280;
          font-size: 0.85rem;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:disabled {
          background: rgba(139, 92, 246, 0.2);
          color: rgba(139, 92, 246, 0.5);
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Media Queries pour tablette et desktop */
        @media (min-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
          
          .contact-card, .map-card {
            padding: 2.5rem;
          }
          
          .contact-title {
            font-size: 2rem;
          }
          
          .map-header h3 {
            font-size: 1.5rem;
          }
          
          .map-container {
            min-height: 300px;
          }
          
          /* Social buttons sur tablette/desktop */
          .social-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
          }
          
          .social-button {
            padding: 10px 18px;
            font-size: 0.9rem;
            min-width: 140px;
          }
          
          .booking-section {
            padding: 3rem;
          }
          
          .booking-icon {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
          
          .booking-section h2 {
            font-size: 2rem;
          }
          
          .booking-subtitle {
            font-size: 1.05rem;
          }
          
          .booking-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
          
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          
          .form-input, .form-select, .form-textarea {
            padding: 14px;
          }
          
          .time-grid {
            grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
            gap: 0.75rem;
          }
          
          .time-slot {
            padding: 0.75rem;
          }
        }

        @media (min-width: 1024px) {
          .container {
            padding: 0 2rem;
          }
          
          .page-header {
            padding: 5rem 1rem;
          }
          
          .page-title {
            font-size: 3rem;
          }
          
          .page-subtitle {
            font-size: 1.2rem;
          }
          
          .section {
            padding: 5rem 0;
          }
        }

        /* Media query pour très petits écrans */
        @media (max-width: 480px) {
          .social-buttons {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .social-button {
            justify-content: flex-start;
            padding: 12px 16px;
          }

          .success-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}

export default Contact;