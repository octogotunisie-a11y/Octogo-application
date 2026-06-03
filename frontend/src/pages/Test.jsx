import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { motion } from 'framer-motion';

const Test = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?message=Veuillez vous connecter pour accéder au test');
    }
  }, [user, navigate]);

  const questions = [
    // Questions pour Intelligence 1 - Linguistique
    { id: 1, text: "J'aime lire des livres et des magazines", intelligence: 1 },
    { id: 2, text: "Je suis bon(ne) pour raconter des histoires", intelligence: 1 },
    { id: 3, text: "J'aime jouer avec les mots (mots croisés, Scrabble)", intelligence: 1 },
    { id: 4, text: "J'apprends facilement les langues étrangères", intelligence: 1 },
    
    // Questions pour Intelligence 2 - Logico-Mathématique
    { id: 5, text: "J'aime résoudre des problèmes mathématiques", intelligence: 2 },
    { id: 6, text: "Je suis bon(ne) en raisonnement logique", intelligence: 2 },
    { id: 7, text: "J'aime les énigmes et les puzzles", intelligence: 2 },
    { id: 8, text: "Je pense de manière scientifique", intelligence: 2 },
    
    // Questions pour Intelligence 3 - Spatiale
    { id: 9, text: "J'ai un bon sens de l'orientation", intelligence: 3 },
    { id: 10, text: "Je visualise facilement les choses dans l'espace", intelligence: 3 },
    { id: 11, text: "J'aime dessiner et créer des designs", intelligence: 3 },
    { id: 12, text: "Je me souviens facilement des images et des lieux", intelligence: 3 },
    
    // Questions pour Intelligence 4 - Kinesthésique
    { id: 13, text: "J'aime bouger et faire du sport", intelligence: 4 },
    { id: 14, text: "Je suis habile avec mes mains", intelligence: 4 },
    { id: 15, text: "J'apprends mieux en faisant", intelligence: 4 },
    { id: 16, text: "J'ai une bonne coordination physique", intelligence: 4 },
    
    // Questions pour Intelligence 5 - Musicale
    { id: 17, text: "Je suis sensible à la musique", intelligence: 5 },
    { id: 18, text: "Je reconnais facilement les mélodies", intelligence: 5 },
    { id: 19, text: "J'aime jouer d'un instrument de musique", intelligence: 5 },
    { id: 20, text: "Je me souviens facilement des chansons", intelligence: 5 },
    
    // Questions pour Intelligence 6 - Interpersonnelle
    { id: 21, text: "Je comprends facilement les autres", intelligence: 6 },
    { id: 22, text: "J'aime travailler en équipe", intelligence: 6 },
    { id: 23, text: "Je suis bon(ne) pour résoudre les conflits", intelligence: 6 },
    { id: 24, text: "Je me fais facilement des amis", intelligence: 6 },
    
    // Questions pour Intelligence 7 - Intrapersonnelle
    { id: 25, text: "Je me connais bien", intelligence: 7 },
    { id: 26, text: "J'aime réfléchir sur moi-même", intelligence: 7 },
    { id: 27, text: "Je sais ce que je veux dans la vie", intelligence: 7 },
    { id: 28, text: "Je travaille bien seul(e)", intelligence: 7 },
    
    // Questions pour Intelligence 8 - Naturaliste
    { id: 29, text: "J'aime observer la nature", intelligence: 8 },
    { id: 30, text: "Je reconnais facilement les plantes et les animaux", intelligence: 8 },
    { id: 31, text: "J'aime classer et catégoriser les choses", intelligence: 8 },
    { id: 32, text: "Je me sens bien dans la nature", intelligence: 8 },
  ];

  const handleAnswer = (value) => {
    const questionId = questions[currentQuestion].id;
    const intelligence = questions[currentQuestion].intelligence;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: { value, intelligence }
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    const questionCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    
    // Compter les questions par intelligence
    Object.values(answers).forEach(answer => {
      scores[answer.intelligence] += answer.value;
      questionCounts[answer.intelligence]++;
    });

    // Calculer les moyennes et convertir en pourcentage
    Object.keys(scores).forEach(key => {
      if (questionCounts[key] > 0) {
        const average = scores[key] / questionCounts[key];
        scores[key] = Math.round((average / 5) * 100);
      }
    });

    const results = {
      date: new Date().toISOString(),
      scores,
      totalQuestions: questions.length,
      answeredQuestions: Object.keys(answers).length
    };

    // Sauvegarder dans localStorage
    localStorage.setItem(`test_scores_${user.id}`, JSON.stringify(results));
    
    setShowResults(true);
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (!user) {
    return null;
  }

  if (showResults) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F8FAFC 0%, white 100%)',
        padding: '80px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '50px',
            maxWidth: '800px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            borderRadius: '50%',
            margin: '0 auto 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'white'
          }}>
            <i className="bi bi-trophy-fill"></i>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#1F2937' }}>
            Test Terminé avec Succès !
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: '#6B7280', marginBottom: '20px' }}>
            Félicitations {user.name.split(' ')[0]} ! Vous avez répondu à {Object.keys(answers).length} questions.
          </p>
          
          <p style={{ fontSize: '1rem', color: '#6B7280', marginBottom: '40px' }}>
            Vos résultats ont été enregistrés. Vous pouvez les consulter sur votre dashboard.
          </p>
          
          <div style={{ 
            background: '#F8FAFC', 
            padding: '30px', 
            borderRadius: '15px',
            marginBottom: '40px'
          }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#1F2937' }}>
              🎉 Vous avez gagné 50 points cerveau !
            </h3>
            <p style={{ color: '#6B7280' }}>
              Total des points : <strong style={{ color: '#8B5CF6' }}>{user.brainPoints + 50}</strong>
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <i className="bi bi-speedometer2"></i>
              Voir mes résultats
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              style={{
                padding: '15px 30px',
                background: 'transparent',
                color: '#8B5CF6',
                border: '2px solid #8B5CF6',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <i className="bi bi-house-door"></i>
              Retour à l'accueil
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, white 100%)',
      padding: '80px 20px'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              color: '#1F2937',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <i className="bi bi-clipboard-data" style={{ color: '#8B5CF6' }}></i>
              Test d'Intelligences Multiples
            </h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
                Question {currentQuestion + 1} sur {questions.length}
              </p>
              <p style={{ color: '#8B5CF6', fontWeight: '600' }}>
                {Object.keys(answers).length} réponses données
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '8px',
            background: '#E5E7EB',
            borderRadius: '4px',
            marginBottom: '40px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          {/* Question */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              color: '#1F2937',
              marginBottom: '30px',
              lineHeight: 1.4,
              padding: '20px',
              background: '#F8FAFC',
              borderRadius: '12px',
              borderLeft: '5px solid #8B5CF6'
            }}>
              {questions[currentQuestion].text}
            </h2>

            {/* Answer Options */}
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                { value: 1, text: "Pas du tout d'accord", emoji: "😕" },
                { value: 2, text: "Pas d'accord", emoji: "🙁" },
                { value: 3, text: "Neutre", emoji: "😐" },
                { value: 4, text: "D'accord", emoji: "🙂" },
                { value: 5, text: "Tout à fait d'accord", emoji: "😄" }
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option.value)}
                  style={{
                    padding: '20px',
                    background: '#F8FAFC',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    color: '#374151',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#F3F4F6';
                    e.target.style.borderColor = '#8B5CF6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#F8FAFC';
                    e.target.style.borderColor = '#E5E7EB';
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{option.emoji}</span>
                  <span>{option.text}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '30px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <button
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              style={{
                padding: '12px 24px',
                background: currentQuestion === 0 ? '#F3F4F6' : 'white',
                color: currentQuestion === 0 ? '#9CA3AF' : '#4B5563',
                border: `2px solid ${currentQuestion === 0 ? '#E5E7EB' : '#D1D5DB'}`,
                borderRadius: '8px',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="bi bi-arrow-left"></i>
              Précédent
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                background: answers[currentQuestion + 1] ? '#10B981' : '#E5E7EB',
                borderRadius: '50%'
              }} />
              <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                {answers[currentQuestion + 1] ? 'Réponse enregistrée' : 'Pas encore répondu'}
              </span>
            </div>

            <button
              onClick={() => {
                if (currentQuestion < questions.length - 1) {
                  setCurrentQuestion(prev => prev + 1);
                }
              }}
              style={{
                padding: '12px 24px',
                background: '#F3F4F6',
                color: '#4B5563',
                border: '2px solid #D1D5DB',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Passer
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Test;