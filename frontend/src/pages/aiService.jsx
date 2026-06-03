// src/components/dashboard/aiService.jsx
// Service d'IA pour les recommandations de formation

// Base de connaissances des formations avec mots-clés associés
const formationDatabase = {
    parcours: [
        {
            id: 1,
            title: 'ÉVEIL',
            subtitle: 'NeuroLeadership & Performance Collective',
            category: 'LEADERSHIP',
            keywords: ['leadership', 'manager', 'équipe', 'collectif', 'performance', 'management', 'direction', 'responsable', 'chef', 'leader', 'dirigeant'],
            description: 'Développez un leadership conscient basé sur les neurosciences pour optimiser la performance collective.',
            recommendation: "Ce parcours est idéal pour développer votre leadership et améliorer la performance de votre équipe."
        },
        {
            id: 2,
            title: 'CAPTE',
            subtitle: 'Le cerveau au cœur de la relation client',
            category: 'VENTE',
            keywords: ['client', 'vente', 'relation client', 'commercial', 'négociation', 'service client', 'satisfaction client', 'fidélisation', 'vendre'],
            description: 'Maîtrisez les techniques de vente basées sur la compréhension du cerveau du client.',
            recommendation: "Parfait pour optimiser votre relation client et vos performances commerciales."
        },
        {
            id: 3,
            title: 'RESET',
            subtitle: 'Neuromanagement & Performance durable',
            category: 'MANAGEMENT',
            keywords: ['management', 'équipe', 'performance', 'durable', 'organisation', 'ressources humaines', 'rh', 'manager', 'managers', 'gestion'],
            description: 'Adoptez un management durable fondé sur les neurosciences cognitives et sociales.',
            recommendation: "Une approche innovante du management pour une performance durable et épanouissante."
        },
        {
            id: 4,
            title: 'TRANS-FORMATION',
            subtitle: 'Leadership transformationnel et intelligence émotionnelle',
            category: 'TRANSFORMATION',
            keywords: ['transformation', 'changement', 'évolution', 'adaptation', 'innovation', 'transition', 'mutation', 'transformer'],
            description: 'Leadership transformationnel et intelligence émotionnelle pour une performance optimale.',
            recommendation: "Pour accompagner votre transformation personnelle et professionnelle avec intelligence émotionnelle."
        },
        {
            id: 5,
            title: "VOL D'AIGLE",
            subtitle: 'Comprendre les tensions géopolitiques et économiques',
            category: 'STRATÉGIE',
            keywords: ['stratégie', 'vision', 'géopolitique', 'économie', 'international', 'macroéconomie', 'décision', 'stratégique'],
            description: 'Comprenez les tensions géopolitiques et économiques pour un leadership éclairé.',
            recommendation: "Pour développer une vision stratégique globale et prendre des décisions éclairées."
        },
        {
            id: 6,
            title: 'NEUROVENTE',
            subtitle: 'Vendre au cerveau pour toucher le cœur',
            category: 'VENTE',
            keywords: ['vente', 'commercial', 'négociation', 'persuasion', 'influence', 'convaincre', 'argumentation', 'vendre'],
            description: 'Vendre au cerveau pour toucher le cœur et optimiser vos performances commerciales.',
            recommendation: "Maîtrisez les mécanismes cérébraux de la décision d'achat pour booster vos ventes."
        },
        {
            id: 7,
            title: 'NEUROMARKETING',
            subtitle: 'Le cerveau au service de la stratégie',
            category: 'MARKETING',
            keywords: ['marketing', 'communication', 'publicité', 'marque', 'consommateur', 'influence', 'stratégie marketing', 'marque'],
            description: 'Comprendre comment le cerveau prend ses décisions pour créer des messages et offres qui influencent avec éthique.',
            recommendation: "Découvrez comment le cerveau de vos clients prend ses décisions pour optimiser votre marketing."
        }
    ],
    coaching: [
        {
            id: 'personal-eveil',
            title: 'Éveil Intérieur',
            category: 'PERSONNEL',
            keywords: ['développement personnel', 'bien-être', 'équilibre', 'confiance', 'estime', 'épanouissement', 'stress', 'personnel'],
            description: 'Un parcours initiatique pour découvrir votre véritable potentiel et aligner vos aspirations profondes.',
            recommendation: "Pour ceux qui cherchent à mieux se connaître et aligner leurs actions avec leurs valeurs profondes."
        },
        {
            id: 'personal-alignement',
            title: 'Alignement Profond',
            category: 'PERSONNEL',
            keywords: ['alignement', 'cohérence', 'valeurs', 'objectifs', 'vie professionnelle', 'vie personnelle', 'équilibre', 'harmonie'],
            description: 'Une transformation progressive pour ancrer des changements durables dans votre vie quotidienne.',
            recommendation: "Idéal pour harmoniser vie professionnelle et personnelle et ancrer des changements durables."
        },
        {
            id: 'personal-transformation',
            title: 'Transformation 360°',
            category: 'PERSONNEL',
            keywords: ['transformation', 'métamorphose', 'changement profond', 'évolution personnelle', 'développement'],
            description: 'Un accompagnement complet pour une métamorphose profonde de tous les aspects de votre vie.',
            recommendation: "Pour une transformation complète et durable de votre vie personnelle et professionnelle."
        },
        {
            id: 'professional-performance',
            title: 'Performance Essentielle',
            category: 'PROFESSIONNEL',
            keywords: ['performance', 'productivité', 'efficacité', 'organisation', 'gestion du temps', 'focus', 'concentration', 'professionnel'],
            description: 'Optimisez votre productivité et développez des habitudes de travail basées sur les neurosciences.',
            recommendation: "Boostez votre productivité et votre efficacité professionnelle grâce aux neurosciences."
        },
        {
            id: 'professional-impact',
            title: 'Impact Professionnel',
            category: 'PROFESSIONNEL',
            keywords: ['impact', 'influence', 'charisme', 'présence', 'leadership', 'communication', 'assertivité', 'professionnel'],
            description: 'Développez une présence et une influence professionnelle qui font la différence.',
            recommendation: "Pour développer votre impact et votre influence dans votre environnement professionnel."
        },
        {
            id: 'professional-excellence',
            title: 'Excellence Stratégique',
            category: 'PROFESSIONNEL',
            keywords: ['excellence', 'stratégie', 'vision', 'expertise', 'positionnement', 'professionnel'],
            description: 'Élaborez une vision stratégique à long terme et positionnez-vous comme expert dans votre domaine.',
            recommendation: "Pour atteindre l'excellence et devenir une référence dans votre domaine."
        }
    ],
    formation: [
        {
            id: 'formation-neurovente',
            title: 'Neurovente & Management',
            category: 'VENTES & MANAGEMENT',
            keywords: ['vente', 'management', 'commercial', 'équipe commerciale', 'manager commercial', 'négociation', 'ventes'],
            description: 'Former les managers à vendre au cerveau du client grâce aux neurosciences.',
            recommendation: "Une formation essentielle pour les managers commerciaux qui veulent comprendre les mécanismes de la vente."
        },
        {
            id: 'formation-neurosecurite',
            title: 'NeuroSécurité',
            category: 'SÉCURITÉ',
            keywords: ['sécurité', 'stress', 'gestion de crise', 'vigile', 'securite', 'protection', 'risque', 'crise'],
            description: 'Destinée aux équipes de sécurité, basée sur les neurosciences du stress et de la cohésion.',
            recommendation: "Pour les équipes de sécurité qui doivent gérer le stress et maintenir la cohésion en situation critique."
        },
        {
            id: 'formation-neuroeducation',
            title: 'NeuroÉducation',
            category: 'LEADERSHIP',
            keywords: ['éducation', 'formation', 'apprentissage', 'pédagogie', 'transmission', 'formateur', 'enseignant', 'éduquer'],
            description: 'La NeuroÉducation explore la neuroplasticité chez l\'adulte et la neuroergonomie.',
            recommendation: "Pour les formateurs et éducateurs qui veulent comprendre comment le cerveau apprend vraiment."
        },
        {
            id: 'formation-parole-leader',
            title: 'La parole d\'un leader',
            category: 'COMMUNICATION',
            keywords: ['communication', 'prise de parole', 'leadership', 'discours', 'présentation', 'orateur', 'persuasion', 'parler'],
            description: 'Apprendre à communiquer avec influence et engagement.',
            recommendation: "Pour maîtriser l'art de la communication et captiver votre audience."
        },
        {
            id: 'formation-neurosciences-appliquees',
            title: 'Neurosciences Appliquées',
            category: 'NEUROSCIENCES',
            keywords: ['neurosciences', 'cerveau', 'neuroscience', 'apprentissage', 'comportement', 'cognition'],
            description: 'Un ensemble de parcours innovants fondés sur les neurosciences appliquées.',
            recommendation: "Pour comprendre les fondamentaux des neurosciences et leurs applications pratiques."
        },
        {
            id: 'formation-mindset-gagnant',
            title: 'Mindset de gagnant',
            category: 'DÉVELOPPEMENT PERSONNEL',
            keywords: ['mindset', 'mental', 'état d\'esprit', 'gagnant', 'réussite', 'succès', 'attitude'],
            description: 'Un parcours immersif au cœur du cerveau humain pour développer les power skills de demain.',
            recommendation: "Pour développer un état d'esprit gagnant et les compétences clés du futur."
        },
        {
            id: 'formation-neuroleadership',
            title: 'NeuroLeadership',
            category: 'LEADERSHIP',
            keywords: ['leadership', 'équipe', 'motivation', 'engagement', 'management', 'dirigeant', 'cadre', 'leader'],
            description: 'Former les managers à comprendre le cerveau de leurs équipes.',
            recommendation: "Pour les managers qui veulent comprendre les ressorts de la motivation et de l'engagement."
        },
        {
            id: 'formation-leadership-emotionnel',
            title: 'Leadership Émotionnel',
            category: 'LEADERSHIP',
            keywords: ['émotions', 'intelligence émotionnelle', 'empathie', 'relations', 'leadership', 'soft skills', 'emotion'],
            description: 'Développer un leadership aligné sur les valeurs et l\'intelligence émotionnelle.',
            recommendation: "Pour développer un leadership authentique basé sur l'intelligence émotionnelle."
        }
    ],
    teambuilding: [
        {
            id: 'tb-voyage-alchimique',
            title: 'Le Voyage Alchimique',
            category: 'TRANSFORMATION',
            keywords: ['cohésion', 'équipe', 'transformation', 'collectif', 'esprit d\'équipe', 'collaboration', 'groupe', 'team'],
            description: 'Expérience de transformation humaine et collective pour transcender les poids de l\'ego',
            recommendation: "Une expérience unique pour souder votre équipe et transcender les individualités."
        },
        {
            id: 'tb-neurosynergie',
            title: 'NEUROSYNERGIE',
            category: 'NEUROSCIENCES',
            keywords: ['synergie', 'collaboration', 'coopération', 'neurosciences', 'équipe', 'collectif', 'team building'],
            description: 'Basé sur les neurosciences sociales pour explorer les mécanismes cérébraux de cohésion',
            recommendation: "Comprenez les mécanismes cérébraux de la cohésion pour créer une synergie d'équipe."
        },
        {
            id: 'tb-full-energy',
            title: 'FULL ENERGY',
            category: 'ÉNERGIE',
            keywords: ['énergie', 'dynamique', 'sport', 'défi', 'motivation', 'enthousiasme', 'vitalité', 'energie'],
            description: 'Journée rythmée par des défis sportifs favorisant cohésion et esprit d\'équipe',
            recommendation: "Pour booster l'énergie et la dynamique de votre équipe à travers des défis stimulants."
        },
        {
            id: 'tb-heart-synergie',
            title: 'Heart Synergie - Future Leaders',
            category: 'LEADERSHIP',
            keywords: ['leadership', 'futurs leaders', 'potentiel', 'développement', 'talents', 'high potential', 'leaders'],
            description: 'Programme exclusif pour renforcer un leadership humain et inspirant',
            recommendation: "Pour révéler les futurs leaders de votre organisation et développer un leadership inspirant."
        },
        {
            id: 'tb-emergent-leaders',
            title: 'Heart Synergie - Emergent Leaders',
            category: 'DÉVELOPPEMENT',
            keywords: ['leaders émergents', 'potentiel', 'développement', 'talents', 'emergents'],
            description: 'Parcours immersif pour renforcer cohésion et révéler le potentiel collectif',
            recommendation: "Pour identifier et développer les talents émergents de votre organisation."
        }
    ]
};

// Analyseur de texte intelligent
const analyzeText = (text) => {
    if (!text || text.trim() === '') {
        return {
            detectedNeeds: [],
            primaryIntent: 'non spécifié',
            confidence: 0,
            keywords: []
        };
    }

    const lowerText = text.toLowerCase();
    
    // Mots-clés par catégorie de besoin (version enrichie)
    const needCategories = {
        leadership: ['leader', 'leadership', 'manager', 'management', 'diriger', 'direction', 'chef', 'responsable', 'équipe', 'manager', 'manage', 'dirigeant', 'commandement', 'supervision'],
        cohesion: ['cohésion', 'équipe', 'team', 'collectif', 'groupe', 'collaboration', 'ensemble', 'synergie', 'esprit', 'unité', 'team building', 'souder', 'entraide'],
        performance: ['performance', 'productivité', 'efficacité', 'résultat', 'objectif', 'atteindre', 'dépasser', 'croissance', 'rendement', 'optimisation'],
        communication: ['communication', 'communiquer', 'parler', 'dialogue', 'échange', 'relation', 'feedback', 'écoute', 'expression', 'verbal'],
        stress: ['stress', 'pression', 'anxiété', 'charge', 'épuisement', 'burnout', 'fatigue', 'équilibre', 'détente', 'relaxation'],
        motivation: ['motivation', 'motiver', 'engagement', 'impliquer', 'enthousiasme', 'dynamique', 'stimuler', 'encourager'],
        vente: ['vente', 'vendre', 'commercial', 'client', 'négociation', 'argumentaire', 'persuasion', 'transaction', 'achat'],
        innovation: ['innovation', 'créativité', 'nouveau', 'changement', 'transformation', 'évolution', 'adaptation', 'créatif'],
        conflit: ['conflit', 'tension', 'désaccord', 'problème', 'difficile', 'crise', 'résoudre', 'médiation', 'litige'],
        bienetre: ['bien-être', 'bienêtre', 'équilibre', 'qualité de vie', 'santé', 'épanouissement', 'bonheur', 'sérénité']
    };

    // Détection des besoins
    const detectedNeeds = [];
    const keywordMatches = [];

    Object.entries(needCategories).forEach(([need, keywords]) => {
        const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
        if (matchCount > 0) {
            detectedNeeds.push({
                need,
                score: matchCount,
                matches: keywords.filter(k => lowerText.includes(k))
            });
            keywordMatches.push(...keywords.filter(k => lowerText.includes(k)));
        }
    });

    // Tri par score décroissant
    detectedNeeds.sort((a, b) => b.score - a.score);

    // Déterminer l'intention principale
    let primaryIntent = 'général';
    if (detectedNeeds.length > 0) {
        primaryIntent = detectedNeeds[0].need;
    }

    return {
        detectedNeeds,
        primaryIntent,
        confidence: detectedNeeds.length > 0 ? Math.min(100, detectedNeeds[0].score * 20) : 30,
        keywords: [...new Set(keywordMatches)] // Dédupliquer
    };
};

// Fonction principale de recommandation
export const recommendFormations = (userText) => {
    console.log('🔍 Analyse du texte:', userText);
    
    // Analyser le texte
    const analysis = analyzeText(userText);
    console.log('📊 Analyse:', analysis);

    // Si l'analyse est vide, retourner des formations populaires par défaut
    if (analysis.detectedNeeds.length === 0) {
        return {
            success: true,
            analysis,
            recommendations: {
                parcours: [formationDatabase.parcours[0], formationDatabase.parcours[2], formationDatabase.parcours[6]],
                coaching: [formationDatabase.coaching[0], formationDatabase.coaching[3]],
                formation: [formationDatabase.formation[6], formationDatabase.formation[7]], // NeuroLeadership et Leadership Emotionnel
                teambuilding: [formationDatabase.teambuilding[1], formationDatabase.teambuilding[0]] // NEUROSYNERGIE et Voyage Alchimique
            },
            explanation: "Basé sur les tendances actuelles en développement professionnel, voici nos formations les plus populaires."
        };
    }

    // Calculer les scores pour chaque formation
    const scoredRecommendations = {
        parcours: [],
        coaching: [],
        formation: [],
        teambuilding: []
    };

    // Fonction pour calculer le score d'une formation
    const calculateScore = (formation, analysis) => {
        let score = 0;
        const matchedKeywords = [];

        // Vérifier chaque mot-clé de la formation
        formation.keywords.forEach(keyword => {
            if (analysis.keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
                score += 10;
                matchedKeywords.push(keyword);
            }
        });

        // Bonus si la catégorie correspond à l'intention principale
        const categoryMatch = {
            leadership: ['leadership', 'management', 'direction', 'manager'],
            cohesion: ['teambuilding', 'cohesion', 'team', 'equipe', 'collectif'],
            performance: ['performance', 'productivity', 'efficacite', 'rendement'],
            communication: ['communication', 'parole', 'dialogue', 'echange'],
            stress: ['bienetre', 'stress', 'securite', 'relaxation'],
            motivation: ['motivation', 'engagement', 'enthousiasme'],
            vente: ['vente', 'commercial', 'client', 'negociation'],
            innovation: ['innovation', 'creativite', 'transformation'],
            conflit: ['conflit', 'crise', 'resolution'],
            bienetre: ['bien-etre', 'epanouissement', 'equilibre']
        };

        Object.entries(categoryMatch).forEach(([need, categories]) => {
            if (analysis.primaryIntent === need) {
                if (categories.some(cat => 
                    formation.category.toLowerCase().includes(cat) || 
                    formation.title.toLowerCase().includes(cat) ||
                    formation.subtitle?.toLowerCase().includes(cat)
                )) {
                    score += 30;
                }
            }
        });

        return {
            score,
            matchedKeywords,
            relevance: Math.min(100, score)
        };
    };

    // Calculer les scores pour chaque type de formation
    Object.keys(formationDatabase).forEach(type => {
        formationDatabase[type].forEach(formation => {
            const scoring = calculateScore(formation, analysis);
            scoredRecommendations[type].push({
                ...formation,
                ...scoring
            });
        });

        // Trier par score décroissant
        scoredRecommendations[type].sort((a, b) => b.score - a.score);
    });

    // Préparer la réponse avec les meilleures recommandations (score > 0)
    const recommendations = {
        parcours: scoredRecommendations.parcours.filter(f => f.score > 0).slice(0, 3),
        coaching: scoredRecommendations.coaching.filter(f => f.score > 0).slice(0, 3),
        formation: scoredRecommendations.formation.filter(f => f.score > 0).slice(0, 3),
        teambuilding: scoredRecommendations.teambuilding.filter(f => f.score > 0).slice(0, 3)
    };

    // Générer une explication personnalisée
    let explanation = "";
    switch (analysis.primaryIntent) {
        case 'leadership':
            explanation = "Votre besoin semble axé sur le leadership et le management. Nos programmes de NeuroLeadership sont spécialement conçus pour développer ces compétences chez vos managers et dirigeants.";
            break;
        case 'cohesion':
            explanation = "La cohésion d'équipe est essentielle à la performance collective. Nos team buildings et formations en neurosciences sociales sont parfaits pour renforcer les liens et créer une synergie durable.";
            break;
        case 'performance':
            explanation = "Pour améliorer la performance, nos programmes combinent neurosciences et management pour des résultats durables et mesurables. Découvrez nos formations dédiées.";
            break;
        case 'communication':
            explanation = "La communication est au cœur de la performance individuelle et collective. Découvrez nos formations dédiées à l'art de communiquer avec impact et authenticité.";
            break;
        case 'stress':
            explanation = "La gestion du stress est cruciale dans l'environnement professionnel actuel. Nos formations en NeuroSécurité et bien-être vous aideront à mieux gérer les situations de pression.";
            break;
        case 'motivation':
            explanation = "La motivation est le moteur de la performance. Nos formations vous aideront à comprendre les ressorts de la motivation et à créer un environnement engageant.";
            break;
        case 'vente':
            explanation = "Pour booster vos performances commerciales, nos formations en Neurovente et Neuromarketing vous donneront les clés pour comprendre et influencer le processus de décision d'achat.";
            break;
        case 'innovation':
            explanation = "L'innovation et la créativité sont essentielles pour rester compétitif. Découvrez comment nos formations peuvent stimuler la pensée créative dans votre organisation.";
            break;
        case 'conflit':
            explanation = "La gestion des conflits est une compétence clé pour tout manager. Nos formations vous aideront à transformer les tensions en opportunités de croissance.";
            break;
        case 'bienetre':
            explanation = "Le bien-être au travail est un facteur clé de performance et de fidélisation. Découvrez nos programmes dédiés à l'équilibre et à l'épanouissement professionnel.";
            break;
        default:
            explanation = "Basé sur votre description, voici une sélection personnalisée de formations adaptées à vos besoins spécifiques.";
    }

    return {
        success: true,
        analysis,
        recommendations,
        explanation,
        timestamp: new Date().toISOString()
    };
};

// Fonction pour générer un parcours personnalisé
export const generateCustomPath = (userText, selectedFormations) => {
    const analysis = analyzeText(userText);
    
    // Créer un parcours personnalisé basé sur l'analyse
    const path = {
        name: "Parcours sur mesure",
        description: "Un parcours personnalisé basé sur vos besoins spécifiques",
        steps: [],
        duration: "3 à 6 mois",
        objectives: []
    };

    // Ajouter des objectifs basés sur l'analyse
    if (analysis.detectedNeeds.length > 0) {
        analysis.detectedNeeds.forEach(need => {
            switch(need.need) {
                case 'leadership':
                    path.objectives.push("Développer un leadership authentique et inspirant");
                    path.objectives.push("Maîtriser les techniques de management basées sur les neurosciences");
                    path.objectives.push("Créer une vision fédératrice pour votre équipe");
                    break;
                case 'cohesion':
                    path.objectives.push("Renforcer la cohésion et la synergie d'équipe");
                    path.objectives.push("Créer un environnement de travail collaboratif et bienveillant");
                    path.objectives.push("Développer l'intelligence collective");
                    break;
                case 'performance':
                    path.objectives.push("Optimiser la performance individuelle et collective");
                    path.objectives.push("Développer des habitudes de travail efficaces et durables");
                    path.objectives.push("Mettre en place des indicateurs de performance pertinents");
                    break;
                case 'communication':
                    path.objectives.push("Améliorer la qualité des échanges au sein des équipes");
                    path.objectives.push("Maîtriser les techniques de communication non-violente");
                    path.objectives.push("Développer son assertivité et son impact");
                    break;
                case 'stress':
                    path.objectives.push("Comprendre et gérer les mécanismes du stress");
                    path.objectives.push("Développer des techniques de résilience individuelle et collective");
                    path.objectives.push("Créer un environnement de travail plus serein");
                    break;
                case 'motivation':
                    path.objectives.push("Comprendre les leviers de la motivation intrinsèque");
                    path.objectives.push("Créer un environnement motivateur et engageant");
                    path.objectives.push("Développer une culture de la reconnaissance");
                    break;
                case 'vente':
                    path.objectives.push("Maîtriser les techniques de vente basées sur les neurosciences");
                    path.objectives.push("Comprendre le processus de décision d'achat du client");
                    path.objectives.push("Développer une relation client durable et authentique");
                    break;
                default:
                    path.objectives.push("Développer ses compétences clés pour la performance");
                    path.objectives.push("Renforcer la cohésion et la collaboration");
                    path.objectives.push("Optimiser les processus et la communication");
            }
        });
    }

    // Dédupliquer les objectifs
    path.objectives = [...new Set(path.objectives)].slice(0, 5);

    // Ajouter des étapes basées sur les formations sélectionnées
    if (selectedFormations) {
        let stepNumber = 1;
        Object.keys(selectedFormations).forEach(type => {
            if (selectedFormations[type] && selectedFormations[type].length > 0) {
                selectedFormations[type].forEach(formation => {
                    if (formation.score > 0) {
                        path.steps.push({
                            step: stepNumber++,
                            type,
                            title: formation.title,
                            description: formation.description,
                            duration: type === 'parcours' ? '2-3 jours' : 
                                     type === 'coaching' ? '6 séances' : 
                                     type === 'formation' ? '2 jours' : '1 jour'
                        });
                    }
                });
            }
        });
    }

    // Si pas d'étapes, en ajouter par défaut
    if (path.steps.length === 0) {
        path.steps = [
            {
                step: 1,
                type: 'coaching',
                title: 'Diagnostic et Évaluation',
                description: 'Évaluation approfondie des besoins et objectifs',
                duration: '2 séances'
            },
            {
                step: 2,
                type: 'formation',
                title: 'Module fondamental',
                description: 'Acquisition des connaissances de base',
                duration: '2 jours'
            },
            {
                step: 3,
                type: 'teambuilding',
                title: 'Mise en pratique collective',
                description: 'Application concrète en équipe',
                duration: '1 jour'
            },
            {
                step: 4,
                type: 'coaching',
                title: 'Suivi et ancrage',
                description: 'Accompagnement personnalisé post-formation',
                duration: '3 séances'
            }
        ];
    }

    return path;
};