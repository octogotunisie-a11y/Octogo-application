// frontend/src/evaluation/EvaluationDemo.jsx
// -----------------------------------------------------------------------------
// MODULE ÉVALUATION — VERSION MOCK
//
// Composant autonome : aucun appel réseau, aucune base, aucune IA. Les données
// viennent du magasin commun (mock/mockStore.jsx).
//
// Trois profils, trois écrans :
//
//   OBSERVATEUR   → son équipe, puis pour chaque collaborateur UNE ou DEUX
//                   questions ciblées : niveau + situation observée + commentaire.
//                   Pas de long questionnaire.
//
//   COLLABORATEUR → uniquement ses tests pré et post formation. Il ne voit
//                   jamais les questions ni la cotation de l'observateur, et
//                   aucune mention d'attente ou de validation administrative.
//
//   AUTRE PROFIL  → section vide, message explicite. Jamais « en attente ».
//
// Les tests du collaborateur sont rendus par EspaceClient (vue « tests ») :
// l'écran existe déjà, il n'est pas dupliqué ici.
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import {
    useMock, maj, NIVEAUX, MSG, MAX_QUESTIONS_OBSERVATEUR,
    utilisateurParEmail, cycleDeSociete, formationDuCycle, aRole,
    questionsObservateur, utilisateursDe
} from '../mock/mockStore.jsx';
import EspaceClient from '../client/EspaceClient.jsx';
import {
    fusionner, Carte, Bouton, Badge, Champ, styleInput,
    EtatVide, Alerte, FilAriane, Pastille, BandeauMock
} from './ui.jsx';

const EvaluationDemo = ({ colors }) => {
    const c = fusionner(colors);
    const { user } = useAuth();
    const data = useMock();

    const profil = utilisateurParEmail(data, user && user.email);
    // Sans rattachement, aucun cycle : rien n'est deviné à sa place.
    const cycle = profil && profil.societe_id != null ? cycleDeSociete(data, profil.societe_id) : null;

    // --- Profil sans rôle d'évaluation : section vide, sans jargon interne ---
    // Rôles multiples : un utilisateur peut être les deux, ou aucun.
    const estObservateur = aRole(profil, 'observateur');
    const estCollaborateur = aRole(profil, 'collaborateur');

    if (!profil || (!estObservateur && !estCollaborateur)) {
        return (
            <EtatVide c={c} icone="bi-clipboard-check"
                titre="Aucune évaluation disponible"
                texte="Aucune évaluation n’est disponible pour votre profil." />
        );
    }

    if (!cycle || cycle.statut !== 'ouvert') {
        return (
            <EtatVide c={c} icone="bi-calendar3" titre="Aucune évaluation disponible"
                texte="Aucun cycle d’évaluation n’est ouvert pour le moment." />
        );
    }

    // --- Cumul des deux rôles : deux espaces distincts, jamais mélangés -------
    if (estObservateur && estCollaborateur) {
        return (
            <DoubleRole c={c} colors={colors} data={data} profil={profil} cycle={cycle} />
        );
    }

    // --- Collaborateur : ses tests, et rien d'autre ---------------------------
    if (estCollaborateur) return <EspaceClient colors={colors} vue="tests" />;

    // --- Observateur ---------------------------------------------------------
    return <VueObservateur c={c} data={data} profil={profil} cycle={cycle} />;
};

// ============================================================================
// DOUBLE RÔLE — un utilisateur peut être observateur ET collaborateur.
// Les deux espaces restent séparés : ce qu'il cote et ce qu'il passe ne se
// mélangent jamais dans le même écran.
// ============================================================================
const DoubleRole = ({ c, colors, data, profil, cycle }) => {
    const [vue, setVue] = useState('observateur');
    return (
        <>
            <div style={{
                display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1.25rem',
                borderBottom: `1px solid ${c.gray200}`, paddingBottom: '.2rem'
            }}>
                {[
                    { id: 'observateur', label: 'Mon équipe à évaluer', icone: 'bi-eye' },
                    { id: 'collaborateur', label: 'Mes tests', icone: 'bi-ui-checks' }
                ].map((o) => {
                    const actif = vue === o.id;
                    return (
                        <button key={o.id} onClick={() => setVue(o.id)} style={{
                            padding: '.6rem 1rem', border: 'none', background: 'transparent',
                            borderBottom: `2px solid ${actif ? c.primary : 'transparent'}`,
                            color: actif ? c.primary : c.gray500, fontWeight: 600, fontSize: '.87rem',
                            cursor: 'pointer', fontFamily: 'inherit'
                        }}>
                            <i className={`bi ${o.icone}`} style={{ marginRight: 6 }} />{o.label}
                        </button>
                    );
                })}
            </div>
            {vue === 'observateur'
                ? <VueObservateur c={c} data={data} profil={profil} cycle={cycle} />
                : <EspaceClient colors={colors} vue="tests" />}
        </>
    );
};

// ============================================================================
// OBSERVATEUR — équipe, puis cotation d'un collaborateur
// ============================================================================
const VueObservateur = ({ c, data, profil, cycle }) => {
    const [cible, setCible] = useState(null);

    const formation = formationDuCycle(data, cycle);
    const questions = questionsObservateur(data, cycle.id);
    const equipe = utilisateursDe(data, profil.societe_id, 'collaborateur');

    const cotationsDe = (collabId) => (data.cotations[cycle.id] || {})[collabId] || {};
    const cotees = (collabId) => {
        const m = cotationsDe(collabId);
        return questions.filter((q) => m[q.id] && m[q.id].niveau != null).length;
    };
    const soumis = (collabId) => !!(data.soumissions[cycle.id] || {})[collabId];

    const statut = (collabId) => {
        if (soumis(collabId)) return { ton: 'termine', texte: 'Évaluation terminée' };
        if (cotees(collabId) > 0) return { ton: 'soumis', texte: 'En cours' };
        return { ton: 'attente', texte: 'À évaluer' };
    };

    if (cible) {
        return (
            <FicheCotation c={c} data={data} cycle={cycle} questions={questions}
                cible={cible} onRetour={() => setCible(null)} />
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: c.gray900, fontSize: '1.35rem' }}>
                    <i className="bi bi-clipboard-check" style={{ color: c.primary, marginRight: '.6rem' }} />
                    Évaluation
                </h2>
                <p style={{ margin: '.35rem 0 0', color: c.gray500, fontSize: '.86rem' }}>
                    {formation ? formation.libelle : '—'} · cycle {cycle.libelle} · {equipe.length} collaborateur(s)
                </p>
            </div>

            <BandeauMock c={c}>
                Questions de démonstration. Elles seront plus tard établies à partir du thème de la
                formation, du contexte et des documents de la société.
            </BandeauMock>

            <div style={{ fontWeight: 700, color: c.gray900, marginBottom: '.75rem' }}>Mon équipe</div>

            {equipe.length === 0 && (
                <EtatVide c={c} icone="bi-people" titre="Aucun collaborateur à évaluer" />
            )}

            {equipe.map((p) => {
                const st = statut(p.id);
                return (
                    <Carte c={c} key={p.id} style={{ marginBottom: '.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', minWidth: 0 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                                    background: c.primaryGradient, color: c.white,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                                }}>{p.nom.slice(0, 1)}</div>
                                <div>
                                    <div style={{ fontWeight: 700, color: c.gray900 }}>{p.nom}</div>
                                    <div style={{ fontSize: '.78rem', color: c.gray500 }}>
                                        {cotees(p.id)} / {questions.length} question(s) renseignée(s)
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                                <Pastille c={c} ton={st.ton}>{st.texte}</Pastille>
                                <Bouton c={c} variante={soumis(p.id) ? 'secondaire' : 'primaire'}
                                    onClick={() => setCible(p)}>
                                    {soumis(p.id) ? 'Consulter' : 'Évaluer'}
                                </Bouton>
                            </div>
                        </div>
                    </Carte>
                );
            })}

            <div style={{ marginTop: '1.5rem', fontSize: '.79rem', color: c.gray500 }}>
                <i className="bi bi-shield-lock" style={{ marginRight: 5 }} />
                Vous réalisez votre propre évaluation à partir de ce que vous avez observé. Les résultats
                de test des collaborateurs ne vous sont pas transmis.
            </div>
        </motion.div>
    );
};

// ============================================================================
// COTATION D'UN COLLABORATEUR — une ou deux questions, pas davantage
// ============================================================================
const FicheCotation = ({ c, data, cycle, questions, cible, onRetour }) => {
    const mes = (data.cotations[cycle.id] || {})[cible.id] || {};
    const soumis = !!(data.soumissions[cycle.id] || {})[cible.id];
    const faites = questions.filter((q) => mes[q.id] && mes[q.id].niveau != null).length;
    const verrouille = soumis || cycle.statut !== 'ouvert';

    const enregistrer = (questionId, valeurs) => {
        maj((d) => {
            const parCycle = d.cotations[cycle.id] || {};
            const parCollab = parCycle[cible.id] || {};
            d.cotations = {
                ...d.cotations,
                [cycle.id]: { ...parCycle, [cible.id]: { ...parCollab, [questionId]: valeurs } }
            };
        });
    };

    const soumettre = () => {
        maj((d) => {
            d.soumissions = {
                ...d.soumissions,
                [cycle.id]: { ...(d.soumissions[cycle.id] || {}), [cible.id]: true }
            };
        });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <FilAriane c={c} elements={[{ label: 'Mon équipe', onClick: onRetour }, { label: cible.nom }]} />

            {soumis && (
                <Alerte c={c} ton="succes">
                    Votre évaluation de {cible.nom} est enregistrée. Elle n’est plus modifiable.
                </Alerte>
            )}

            {!soumis && (
                <div style={{ fontSize: '.87rem', color: c.gray600, marginBottom: '1.25rem' }}>
                    Progression : <strong style={{ color: c.gray900 }}>{faites} / {questions.length}</strong>
                    <span style={{ color: c.gray400 }}>
                        {' '}— {MAX_QUESTIONS_OBSERVATEUR} question{MAX_QUESTIONS_OBSERVATEUR > 1 ? 's' : ''} au maximum
                    </span>
                </div>
            )}

            {questions.map((q, i) => (
                <BlocQuestion key={q.id} c={c} index={i} question={q}
                    valeurs={mes[q.id]} verrouille={verrouille}
                    onEnregistrer={(v) => enregistrer(q.id, v)} />
            ))}

            {!verrouille && (
                <div style={{ marginTop: '1.5rem' }}>
                    <Bouton c={c} icone="bi-send" disabled={faites !== questions.length} onClick={soumettre}>
                        Soumettre mon évaluation de {cible.nom}
                    </Bouton>
                    <div style={{ fontSize: '.78rem', color: c.gray500, marginTop: '.6rem' }}>
                        {faites === questions.length
                            ? 'Après soumission, votre cotation ne sera plus modifiable.'
                            : `Renseignez les ${questions.length} question(s) pour pouvoir soumettre.`}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// --- Une question : niveau + situation observée + commentaire ---------------
const BlocQuestion = ({ c, index, question, valeurs, verrouille, onEnregistrer }) => {
    const [niveau, setNiveau] = useState(valeurs ? valeurs.niveau : null);
    const [situation, setSituation] = useState(valeurs ? valeurs.situation : '');
    const [commentaire, setCommentaire] = useState(valeurs ? valeurs.commentaire : '');
    const [date, setDate] = useState(valeurs ? valeurs.date : '');
    const [erreur, setErreur] = useState(null);
    const [ok, setOk] = useState(false);

    // La situation et sa date conditionnent l'accès au niveau : c'est ce qui
    // empêche de coter sur une impression générale plutôt que sur un fait.
    const prerequis = situation.trim().length > 0 && !!date;

    const enregistrer = () => {
        if (!situation.trim()) { setErreur(MSG.situation_vide); return; }
        if (!date) { setErreur(MSG.date_vide); return; }
        if (niveau == null) { setErreur(MSG.niveau_vide); return; }
        setErreur(null);
        onEnregistrer({ niveau, situation: situation.trim(), commentaire: commentaire.trim(), date });
        setOk(true);
        setTimeout(() => setOk(false), 2000);
    };

    return (
        <Carte c={c} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.9rem' }}>
                <div style={{ fontSize: '.9rem', color: c.gray800, lineHeight: 1.45, flex: '1 1 240px' }}>
                    <span style={{ color: c.primary, fontWeight: 700, marginRight: '.4rem' }}>{index + 1}.</span>
                    {question.texte}
                </div>
                {valeurs && valeurs.niveau != null && (
                    <Badge c={c} ton={valeurs.niveau === 'non_observe' ? 'neutre' : 'succes'}>
                        {valeurs.niveau === 'non_observe' ? 'Non observé' : `Niveau ${valeurs.niveau}`}
                    </Badge>
                )}
            </div>

            {erreur && <Alerte c={c} ton="danger" onFermer={() => setErreur(null)}>{erreur}</Alerte>}
            {ok && <Alerte c={c} ton="succes">Enregistré.</Alerte>}

            {verrouille ? (
                <div style={{ background: c.gray50, borderRadius: '12px', padding: '.85rem', fontSize: '.84rem', color: c.gray700 }}>
                    <div style={{ fontSize: '.73rem', color: c.gray500, marginBottom: '.3rem' }}>
                        Situation observée{valeurs && valeurs.date ? ` le ${valeurs.date}` : ''}
                    </div>
                    {valeurs ? valeurs.situation : '—'}
                    {valeurs && valeurs.commentaire && (
                        <div style={{ marginTop: '.6rem', paddingTop: '.6rem', borderTop: `1px solid ${c.gray200}` }}>
                            <div style={{ fontSize: '.73rem', color: c.gray500, marginBottom: '.3rem' }}>Commentaire</div>
                            {valeurs.commentaire}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <Champ c={c} label="Situation observée" obligatoire>
                        <textarea style={{ ...styleInput(c), minHeight: 95, resize: 'vertical' }}
                            value={situation} onChange={(e) => setSituation(e.target.value)}
                            placeholder="Décrire une situation réellement observée chez cette personne…" />
                    </Champ>

                    <Champ c={c} label="Date de la situation" obligatoire>
                        <input type="date" style={styleInput(c)} value={date || ''}
                            onChange={(e) => setDate(e.target.value)} />
                    </Champ>

                    <Champ c={c} label="Niveau observé" obligatoire
                        aide={prerequis
                            ? 'Vous attribuez ce niveau vous-même. Aucune suggestion automatique n’est produite.'
                            : 'La situation observée et sa date sont requises avant l’attribution du niveau.'}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))', gap: '.5rem' }}>
                            {NIVEAUX.map((n) => {
                                const actif = niveau === n.valeur;
                                return (
                                    <button key={String(n.valeur)} disabled={!prerequis}
                                        onClick={() => setNiveau(n.valeur)}
                                        style={{
                                            padding: '.72rem .5rem', borderRadius: '14px', minHeight: 52,
                                            cursor: prerequis ? 'pointer' : 'not-allowed',
                                            opacity: prerequis ? 1 : .45,
                                            border: `1px solid ${actif ? c.primary : c.gray300}`,
                                            background: actif ? '#EEF2FF' : 'transparent',
                                            color: actif ? c.primary : c.gray600,
                                            fontWeight: 600, fontSize: '.84rem'
                                        }}>{n.label}</button>
                                );
                            })}
                        </div>
                    </Champ>

                    <Champ c={c} label="Commentaire" aide="Facultatif.">
                        <textarea style={{ ...styleInput(c), minHeight: 70, resize: 'vertical' }}
                            value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
                    </Champ>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Bouton c={c} icone="bi-check2" onClick={enregistrer}>Enregistrer</Bouton>
                    </div>
                </>
            )}
        </Carte>
    );
};

export default EvaluationDemo;
