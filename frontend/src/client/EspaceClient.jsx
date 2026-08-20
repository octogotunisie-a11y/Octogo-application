// frontend/src/client/EspaceClient.jsx
// -----------------------------------------------------------------------------
// Espace client mock — trois vues dans un seul composant, sélectionnées par la
// prop `vue` depuis les onglets du DashboardClient existant :
//
//     fichiers    → « Mes fichiers »      (documents ajoutés par le client)
//     formations  → « Mes formations »   (formations réalisées)
//     tests       → « Tests »            (pré et post formation)
//
// Un seul fichier plutôt que trois : ces vues partagent la même société, les
// mêmes primitives et la même couche de données. Les séparer n'aurait produit
// que de la duplication d'imports et de résolution de société.
//
// ⚠ AUCUN téléversement réel, AUCUNE analyse de fichier, AUCUNE base, AUCUNE IA.
// Les scores de test sont calculés à partir des réponses réellement saisies.
// -----------------------------------------------------------------------------
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import {
    useSocieteCourante, maj, documentsDe, formationsDe, testDe, resultatDe,
    prochainId, tracer, programmesDe, cycleDeSociete,
    memoriserFichier, urlFichier, oublierFichier,
    CATEGORIES_DOCUMENT, FORMATS_DOCUMENT, iconeDocument,
    extensionDe, typeDocument, STATUTS_DOCUMENT, STATUTS_FORMATION
} from '../mock/mockStore.jsx';
import {
    fusionner, Carte, Bouton, Badge, Modale, EtatVide, Alerte, FilAriane,
    ChampTexte, ChampListe, Pastille, BandeauMock, Statistique, OngletsInternes
} from '../evaluation/ui.jsx';

const EspaceClient = ({ colors, vue = 'fichiers' }) => {
    const c = fusionner(colors);
    const { user } = useAuth();
    const contexte = useSocieteCourante(user);

    // Aucun repli automatique : sans rattachement, l'écran le dit clairement
    // plutôt que de choisir une société à la place de l'administrateur.
    if (contexte.societeId == null) {
        return (
            <EtatVide c={c} icone="bi-building-exclamation" titre="Société non attribuée"
                texte="Votre compte n’est rattaché à aucune société pour le moment. Votre administrateur doit vous y rattacher pour que vous puissiez déposer des documents et accéder à votre évaluation." />
        );
    }

    if (vue === 'apercu') return <VueApercu c={c} colors={colors} {...contexte} />;
    if (vue === 'formations') return <VueFormations c={c} colors={colors} {...contexte} />;
    if (vue === 'programmes') return <VueProgrammes c={c} colors={colors} {...contexte} />;
    if (vue === 'tests') return <VueTests c={c} colors={colors} {...contexte} />;
    return <VueFichiers c={c} colors={colors} {...contexte} />;
};

// ============================================================================
// MES FICHIERS
// ============================================================================
const VueFichiers = ({ c, data, profil, societe, societeId }) => {
    const [modale, setModale] = useState(false);
    const [remplace, setRemplace] = useState(null);   // document en cours de remplacement
    const [fichierEnAttente, setFichierEnAttente] = useState(null); // fichier choisi, catégorie à renseigner
    const [documentOuvert, setDocumentOuvert] = useState(null);     // consultation
    const [filtre, setFiltre] = useState('');
    const [message, setMessage] = useState(null);

    const documents = documentsDe(data, societeId);
    const visibles = filtre ? documents.filter((d) => d.categorie === filtre) : documents;

    const notifier = (m) => { setMessage(m); setTimeout(() => setMessage(null), 3000); };

    // Sélecteur de fichier réel : le client choisit un fichier de son poste.
    // Seules les MÉTADONNÉES sont lues (nom, taille). Le contenu n'est ni
    // téléversé, ni lu, ni analysé — cela viendra avec le backend et l'IA.
    const champFichier = useRef(null);
    const ouvrirSelecteur = () => champFichier.current && champFichier.current.click();

    const fichierChoisi = (e) => {
        const f = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!f) return;
        if (!EXTENSIONS_ACCEPTEES.some((ext) => f.name.toLowerCase().endsWith(ext))) {
            notifier(`Format non pris en charge. Formats attendus : ${EXTENSIONS_ACCEPTEES.join(', ')}.`);
            return;
        }
        // Le fichier lui-même est conservé le temps de la session, afin que le
        // client puisse le rouvrir. Son contenu n'est ni lu, ni transmis.
        setFichierEnAttente({ nom: f.name, taille: formaterTaille(f.size), fichier: f });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <EnTete c={c} icone="bi-folder2-open" titre="Mes fichiers"
                sousTitre={`Documents rattachés à ${societe ? societe.nom : 'votre société'}.`} />

            <BandeauMock c={c}>
                Interface préparée pour la suite. Les fichiers ne sont ni téléversés ni analysés :
                ils serviront plus tard de contexte à la génération de programmes et de questions.
            </BandeauMock>

            {message && <Alerte c={c} ton="succes">{message}</Alerte>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Statistique c={c} icone="bi-files" valeur={documents.length} libelle="Documents" />
                <Statistique c={c} icone="bi-check2-circle" ton={c.success}
                    valeur={documents.filter((d) => d.statut === 'analyse').length} libelle="Prêts à exploiter" />
                <Statistique c={c} icone="bi-hourglass-split" ton={c.warning}
                    valeur={documents.filter((d) => d.statut !== 'analyse').length} libelle="En attente" />
                <Statistique c={c} icone="bi-tags" ton={c.info}
                    valeur={new Set(documents.map((d) => d.categorie)).size} libelle="Catégories" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                    <Filtre c={c} actif={!filtre} onClick={() => setFiltre('')}>Toutes</Filtre>
                    {CATEGORIES_DOCUMENT.filter((cat) => documents.some((d) => d.categorie === cat)).map((cat) => (
                        <Filtre key={cat} c={c} actif={filtre === cat} onClick={() => setFiltre(cat)}>{cat}</Filtre>
                    ))}
                </div>
                <Bouton c={c} icone="bi-plus-lg" onClick={ouvrirSelecteur}>Ajouter un fichier</Bouton>
            </div>

            <input ref={champFichier} type="file" hidden accept={EXTENSIONS_ACCEPTEES.join(',')} onChange={fichierChoisi} />

            {visibles.length === 0 ? (
                <EtatVide c={c} icone="bi-folder2-open" titre="Aucun document ajouté"
                    texte="Ajoutez les documents de votre société : bilan stratégique, organigramme, effectif, fiches de poste…"
                    action={<Bouton c={c} icone="bi-plus-lg" onClick={ouvrirSelecteur}>Ajouter un fichier</Bouton>} />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                    {visibles.map((d) => (
                        <CarteFichier key={d.id} c={c} doc={d}
                            onVoir={() => setDocumentOuvert(d)}
                            onRemplacer={() => setRemplace(d)}
                            onSupprimer={() => {
                                maj((s) => {
                                    s.documents = s.documents.filter((x) => x.id !== d.id);
                                    tracer(s, profil ? profil.id : null, 'document_supprime', d.nom);
                                });
                                oublierFichier(d.id);
                                notifier(`« ${d.nom} » supprimé.`);
                            }} />
                    ))}
                </div>
            )}

            {documentOuvert && (
                <ApercuFichier c={c} doc={documentOuvert} onFermer={() => setDocumentOuvert(null)} />
            )}

            {/* Fichier choisi : il ne reste qu'à préciser sa catégorie. */}
            {fichierEnAttente && (
                <ModaleDocument c={c} initial={fichierEnAttente} titre="Ajouter un fichier" nomFige
                    onFermer={() => setFichierEnAttente(null)}
                    onValider={(nom, categorie, taille) => {
                        let nouvelId = null;
                        maj((s) => {
                            nouvelId = prochainId(s, 'document');
                            s.documents.push({
                                id: nouvelId, societe_id: societeId, nom, categorie,
                                ajoute_par: profil ? profil.id : null,   // l'Admin doit savoir qui a déposé
                                date: new Date().toISOString().slice(0, 10), taille: taille || '—',
                                statut: 'en_cours'   // l'intégration réelle viendra avec le backend
                            });
                            tracer(s, profil ? profil.id : null, 'document_ajoute', nom);
                        });
                        if (nouvelId && fichierEnAttente.fichier) memoriserFichier(nouvelId, fichierEnAttente.fichier);
                        setFichierEnAttente(null);
                        notifier(`« ${nom} » ajouté. Son intégration est en cours.`);
                    }} />
            )}

            {modale && (
                <ModaleDocument c={c} onFermer={() => setModale(false)} onValider={(nom, categorie, taille) => {
                    maj((s) => {
                        s.documents.push({
                            id: prochainId(s, 'document'), societe_id: societeId, nom, categorie,
                            date: new Date().toISOString().slice(0, 10), taille: taille || '—', statut: 'en_attente'
                        });
                    });
                    setModale(false);
                    notifier('Document ajouté à la liste. Aucun fichier n’a été téléversé.');
                }} />
            )}
        </motion.div>
    );
};

// ============================================================================
// MES FORMATIONS
// ============================================================================
const VueFormations = ({ c, data, societe, societeId }) => {
    const [modale, setModale] = useState(false);
    const [message, setMessage] = useState(null);

    const formations = formationsDe(data, societeId);
    const cycles = data.cycles.filter((cy) => cy.societe_id === societeId);

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <EnTete c={c} icone="bi-mortarboard" titre="Mes formations"
                sousTitre={`Formations réalisées par ${societe ? societe.nom : 'votre société'}.`} />

            <BandeauMock c={c}>
                Ces formations servent de socle aux tests pré et post, et au cycle d’évaluation.
                Les données sont fictives à ce stade.
            </BandeauMock>

            {message && <Alerte c={c} ton="succes">{message}</Alerte>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <Statistique c={c} icone="bi-mortarboard" valeur={formations.length} libelle="Formations" />
                <Statistique c={c} icone="bi-people" ton={c.info}
                    valeur={formations.reduce((a, f) => a + (f.participants || 0), 0)} libelle="Participants" />
                <Statistique c={c} icone="bi-clipboard-check" ton={c.success}
                    valeur={cycles.length} libelle="Cycle(s) d’évaluation" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Bouton c={c} icone="bi-plus-lg" onClick={() => setModale(true)}>Ajouter une formation</Bouton>
            </div>

            {formations.length === 0 ? (
                <EtatVide c={c} icone="bi-mortarboard" titre="Aucune formation"
                    texte="Les formations réalisées par votre société apparaîtront ici." />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
                    {formations.map((f) => {
                        const st = STATUTS_FORMATION[f.statut] || STATUTS_FORMATION.a_venir;
                        const cycle = cycles.find((cy) => cy.formation_id === f.id);
                        return (
                            <Carte c={c} key={f.id} style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.6rem', marginBottom: '.9rem' }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                                        background: `${c.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <i className="bi bi-mortarboard" style={{ color: c.primary, fontSize: '1.1rem' }} />
                                    </div>
                                    <Pastille c={c} ton={st.ton}>{st.label}</Pastille>
                                </div>

                                <div style={{ fontWeight: 700, color: c.gray900, fontSize: '1.02rem', lineHeight: 1.35 }}>
                                    {f.libelle}
                                </div>

                                <div style={{ marginTop: '.85rem', display: 'grid', gap: '.35rem' }}>
                                    {[
                                        { i: 'bi-tag', v: f.theme || '—' },
                                        { i: 'bi-calendar3', v: f.date },
                                        { i: 'bi-clock', v: f.duree },
                                        { i: 'bi-people', v: `${f.participants} participants` }
                                    ].map((x) => (
                                        <div key={x.i} style={{ fontSize: '.81rem', color: c.gray600 }}>
                                            <i className={`bi ${x.i}`} style={{ color: c.gray400, marginRight: 8, width: 14, display: 'inline-block' }} />
                                            {x.v}
                                        </div>
                                    ))}
                                </div>

                                {cycle && (
                                    <div style={{ marginTop: '.9rem', paddingTop: '.75rem', borderTop: `1px solid ${c.gray100}`, fontSize: '.78rem', color: c.gray500 }}>
                                        <i className="bi bi-clipboard-check" style={{ marginRight: 6, color: cycle.statut === 'ouvert' ? c.success : c.gray400 }} />
                                        Évaluation {cycle.libelle} — {cycle.statut === 'ouvert' ? 'ouverte' : 'fermée'}
                                    </div>
                                )}
                            </Carte>
                        );
                    })}
                </div>
            )}

            {modale && (
                <ModaleFormation c={c} onFermer={() => setModale(false)} onValider={(libelle, duree, participants) => {
                    maj((s) => {
                        s.formations.push({
                            id: prochainId(s, 'formation'), societe_id: societeId, libelle, duree,
                            participants: parseInt(participants, 10) || 0,
                            date: new Date().toISOString().slice(0, 10)
                        });
                    });
                    setModale(false);
                    setMessage('Formation ajoutée.');
                    setTimeout(() => setMessage(null), 2500);
                }} />
            )}
        </motion.div>
    );
};

// ============================================================================
// TESTS PRÉ / POST FORMATION
// ============================================================================
const VueTests = ({ c, data, profil, societe, societeId }) => {
    const [type, setType] = useState('pre');
    const [ouverte, setOuverte] = useState(null);

    const formations = formationsDe(data, societeId);
    // À défaut de profil rattaché, on rattache au premier compte de la société
    // pour que le parcours reste testable.
    const moi = profil || data.utilisateurs.find((u) => u.societe_id === societeId) || null;

    if (!moi) {
        return <EtatVide c={c} icone="bi-person" titre="Compte non rattaché"
            texte="Votre compte n’est associé à aucune société de démonstration." />;
    }

    if (ouverte) {
        return <Passation c={c} data={data} formation={ouverte} type={type} moi={moi} onRetour={() => setOuverte(null)} />;
    }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <EnTete c={c} icone="bi-clipboard-check" titre="Évaluation"
                sousTitre={`${moi.nom} · ${societe ? societe.nom : ''}`} />

            {/* La formation conditionne les deux tests : elle est rappelée en tête. */}
            {formations.length > 0 && (
                <Carte c={c} style={{ marginBottom: '1.25rem', background: c.gray50 }}>
                    <div style={{ fontSize: '.75rem', color: c.gray500 }}>Formation concernée</div>
                    <div style={{ fontWeight: 700, color: c.gray900, fontSize: '1.02rem' }}>
                        {formations.map((f) => f.libelle).join(' · ')}
                    </div>
                </Carte>
            )}

            <BandeauMock c={c}>
                Questions issues d’une banque fictive. Elles seront plus tard produites à partir du contenu
                réel de la formation. Les scores sont calculés à partir de vos réponses.
            </BandeauMock>

            <OngletsInternes c={c} actif={type} onChange={setType} onglets={[
                { id: 'pre', label: 'Pré-formation', icone: 'bi-play-circle' },
                { id: 'post', label: 'Post-formation', icone: 'bi-check2-circle' }
            ]} />

            {formations.length === 0 && (
                <EtatVide c={c} icone="bi-mortarboard" titre="Aucune formation"
                    texte="Ajoutez une formation depuis « Mes formations » pour passer un test." />
            )}

            {formations.map((f) => {
                const test = testDe(data, f.id, type);
                const testPre = testDe(data, f.id, 'pre');
                const resultat = test ? resultatDe(data, test.id, moi.id) : null;
                const resultatPre = testPre ? resultatDe(data, testPre.id, moi.id) : null;
                const bloquePost = type === 'post' && !resultatPre;

                return (
                    <Carte c={c} key={f.id} style={{ marginBottom: '.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: c.gray900 }}>{f.libelle}</div>
                                <div style={{ fontSize: '.79rem', color: c.gray500, marginTop: '.2rem' }}>
                                    {test ? `${test.questions.length} questions` : 'Test non créé'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                                {resultat && <Pastille c={c} ton="termine">{resultat.score}/{resultat.total}</Pastille>}
                                {!test ? (
                                    <Bouton c={c} variante="secondaire" icone="bi-plus-lg" onClick={() => {
                                        maj((s) => {
                                            s.tests.push({
                                                id: prochainId(s, 'test'), societe_id: societeId, formation_id: f.id,
                                                type, source: 'mock', questions: banqueTest(f.libelle)
                                            });
                                        });
                                    }}>Créer le test</Bouton>
                                ) : (
                                    <Bouton c={c} disabled={bloquePost} onClick={() => setOuverte(f)}>
                                        {resultat ? 'Consulter' : 'Passer le test'}
                                    </Bouton>
                                )}
                            </div>
                        </div>
                        {bloquePost && (
                            <div style={{ fontSize: '.78rem', color: c.gray500, marginTop: '.6rem' }}>
                                <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
                                Passez d’abord le test pré-formation : sans point de départ, aucune évolution
                                ne peut être mesurée.
                            </div>
                        )}
                    </Carte>
                );
            })}
        </motion.div>
    );
};

const Passation = ({ c, data, formation, type, moi, onRetour }) => {
    const test = testDe(data, formation.id, type);
    const deja = test ? resultatDe(data, test.id, moi.id) : null;
    const [reponses, setReponses] = useState(deja ? deja.reponses : {});
    const [envoye, setEnvoye] = useState(!!deja);

    if (!test) return null;

    const repondues = test.questions.filter((q) => reponses[q.id] !== undefined).length;
    const complet = repondues === test.questions.length;
    const score = test.questions.filter((q) => reponses[q.id] === q.bonne).length;

    const testPre = testDe(data, formation.id, 'pre');
    const testPost = testDe(data, formation.id, 'post');
    const rPre = testPre ? resultatDe(data, testPre.id, moi.id) : null;
    const rPost = testPost ? resultatDe(data, testPost.id, moi.id) : null;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <FilAriane c={c} elements={[
                { label: 'Tests', onClick: onRetour },
                { label: `${formation.libelle} — ${type === 'pre' ? 'pré' : 'post'}-formation` }
            ]} />

            {envoye && (
                <>
                    <Carte c={c} style={{ marginBottom: '1.25rem', textAlign: 'center', padding: '1.75rem 1.25rem' }}>
                        <div style={{
                            width: 58, height: 58, borderRadius: '50%', background: '#ECFDF5', color: c.success,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .8rem', fontSize: '1.6rem'
                        }}><i className="bi bi-check2" /></div>
                        <h3 style={{ color: c.gray900, margin: '0 0 .35rem', fontSize: '1.05rem' }}>Test enregistré</h3>
                        <p style={{ color: c.gray600, fontSize: '.9rem', margin: 0 }}>
                            {(deja ? deja.score : score)} bonne(s) réponse(s) sur {test.questions.length}.
                        </p>
                    </Carte>

                    {rPre && rPost && (
                        <Carte c={c} style={{ marginBottom: '1.25rem', background: c.gray50 }}>
                            <div style={{ fontWeight: 700, color: c.gray900, marginBottom: '.85rem' }}>Évolution</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '.85rem', textAlign: 'center' }}>
                                <Chiffre c={c} libelle="Pré-formation" valeur={`${rPre.score}/${rPre.total}`} />
                                <Chiffre c={c} libelle="Post-formation" valeur={`${rPost.score}/${rPost.total}`} />
                                <Chiffre c={c} libelle="Évolution"
                                    valeur={`${rPost.score - rPre.score > 0 ? '+' : ''}${rPost.score - rPre.score}`}
                                    ton={rPost.score >= rPre.score ? c.success : c.danger} />
                            </div>
                            <div style={{ fontSize: '.77rem', color: c.gray500, marginTop: '.85rem' }}>
                                <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
                                Écart brut entre deux passations. Sur un effectif de test, il n’a aucune valeur
                                statistique et ne mesure pas l’effet de la formation.
                            </div>
                        </Carte>
                    )}
                </>
            )}

            {!envoye && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '.87rem', color: c.gray600 }}>
                        Progression : <strong style={{ color: c.gray900 }}>{repondues} / {test.questions.length}</strong>
                    </div>
                    <div style={{ flex: '1 1 160px', maxWidth: 260, height: 7, background: c.gray200, borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ width: `${(repondues / test.questions.length) * 100}%`, height: '100%', background: c.primaryGradient, transition: 'width .3s' }} />
                    </div>
                </div>
            )}

            {test.questions.map((q, i) => {
                const rep = reponses[q.id];
                return (
                    <Carte c={c} key={q.id} style={{ marginBottom: '.75rem' }}>
                        <div style={{ fontSize: '.89rem', color: c.gray800, marginBottom: '.75rem', lineHeight: 1.45 }}>
                            <span style={{ color: c.primary, fontWeight: 700, marginRight: '.4rem' }}>{i + 1}.</span>{q.texte}
                        </div>
                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            {[{ v: true, l: 'Vrai' }, { v: false, l: 'Faux' }].map((o) => {
                                const actif = rep === o.v;
                                return (
                                    <button key={String(o.v)} disabled={envoye}
                                        onClick={() => setReponses((r) => ({ ...r, [q.id]: o.v }))}
                                        style={{
                                            padding: '.6rem 1.4rem', borderRadius: '14px',
                                            cursor: envoye ? 'default' : 'pointer',
                                            opacity: envoye && !actif ? .45 : 1,
                                            border: `1px solid ${actif ? c.primary : c.gray300}`,
                                            background: actif ? '#EEF2FF' : 'transparent',
                                            color: actif ? c.primary : c.gray600,
                                            fontWeight: 600, fontSize: '.86rem'
                                        }}>{o.l}</button>
                                );
                            })}
                            {envoye && rep === q.bonne && <Badge c={c} ton="succes">Correct</Badge>}
                            {envoye && rep !== undefined && rep !== q.bonne && (
                                <Badge c={c} ton="danger">Réponse attendue : {q.bonne ? 'Vrai' : 'Faux'}</Badge>
                            )}
                        </div>
                    </Carte>
                );
            })}

            {!envoye && (
                <div style={{ marginTop: '1.5rem' }}>
                    <Bouton c={c} icone="bi-send" disabled={!complet} onClick={() => {
                        // Score calculé à partir des réponses, jamais tiré au hasard.
                        maj((s) => {
                            s.resultats_test.push({
                                id: prochainId(s, 'resultat_test'), test_id: test.id, utilisateur_id: moi.id,
                                reponses, score, total: test.questions.length, date: new Date().toISOString()
                            });
                            tracer(s, moi.id, 'test_soumis',
                                `${formation.libelle} — ${type === 'pre' ? 'pré' : 'post'}-formation : ${score}/${test.questions.length}`);
                        });
                        setEnvoye(true);
                    }}>Soumettre</Bouton>
                    <div style={{ fontSize: '.78rem', color: c.gray500, marginTop: '.6rem' }}>
                        {complet ? 'Après soumission, vos réponses ne seront plus modifiables.' : 'Répondez à toutes les questions.'}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// ============================================================================
// CARTE D'UN FICHIER — le client doit reconnaître son document d'un coup d'œil
// ============================================================================
const CarteFichier = ({ c, doc, onVoir, onRemplacer, onSupprimer }) => {
    const st = STATUTS_DOCUMENT[doc.statut] || STATUTS_DOCUMENT.en_cours;
    const couleurs = { termine: c.success, soumis: c.warning, attente: c.warning, danger: c.danger, neutre: c.gray500 };
    const col = couleurs[st.ton] || c.gray500;
    const ext = extensionDe(doc.nom);
    const consultable = !!urlFichier(doc.id);

    // Teinte propre au format, pour distinguer PDF / Word / Excel sans lire.
    const teinte = { PDF: '#DC2626', Word: '#2563EB', Excel: '#059669' }[typeDocument(doc.nom)] || c.gray500;

    return (
        <motion.div whileHover={{ y: -2 }} style={{
            background: c.white, border: `1px solid ${c.gray200}`, borderRadius: '16px',
            padding: '1.15rem', display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.8rem', marginBottom: '.9rem' }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                    background: `${teinte}14`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <i className={`bi ${iconeDocument(doc.nom)}`} style={{ color: teinte, fontSize: '1.3rem' }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    {/* Nom exact du fichier, tel qu'il a été choisi. */}
                    <div style={{
                        fontWeight: 700, color: c.gray900, fontSize: '.92rem', lineHeight: 1.35,
                        wordBreak: 'break-word'
                    }}>{doc.nom}</div>
                    <div style={{ fontSize: '.77rem', color: c.gray500, marginTop: '.2rem' }}>
                        {typeDocument(doc.nom)}{ext && ` · .${ext}`} · {doc.taille}
                    </div>
                </div>
            </div>

            <div style={{ fontSize: '.77rem', color: c.gray500, marginBottom: '.7rem' }}>
                <i className="bi bi-calendar3" style={{ marginRight: 6, color: c.gray400 }} />
                Ajouté le {new Date(doc.date).toLocaleDateString('fr-FR')}
            </div>

            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '.45rem', alignSelf: 'flex-start',
                background: `${col}12`, color: col, padding: '.35rem .7rem', borderRadius: '8px',
                fontSize: '.78rem', fontWeight: 600, marginBottom: '1rem'
            }}>
                <i className={`bi ${st.icone}`} />{st.label}
            </div>

            {doc.categorie && (
                <div style={{ fontSize: '.75rem', color: c.gray400, marginBottom: '.9rem' }}>
                    Catégorie : {doc.categorie}
                </div>
            )}

            <div style={{ display: 'flex', gap: '.45rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                <Bouton c={c} variante="secondaire" icone="bi-eye" onClick={onVoir}>Voir</Bouton>
                <Bouton c={c} variante="secondaire" icone="bi-arrow-repeat" onClick={onRemplacer}>Remplacer</Bouton>
                <Bouton c={c} variante="danger" icone="bi-trash" onClick={onSupprimer}>Supprimer</Bouton>
            </div>

            {!consultable && (
                <div style={{ fontSize: '.72rem', color: c.gray400, marginTop: '.6rem' }}>
                    Aperçu indisponible après rafraîchissement de la page.
                </div>
            )}
        </motion.div>
    );
};

// ============================================================================
// CONSULTATION — aperçu PDF natif du navigateur, fiche pour Word et Excel
// ============================================================================
const ApercuFichier = ({ c, doc, onFermer }) => {
    const url = urlFichier(doc.id);
    const type = typeDocument(doc.nom);
    const st = STATUTS_DOCUMENT[doc.statut] || STATUTS_DOCUMENT.en_cours;

    return (
        <Modale c={c} titre={doc.nom} sousTitre={`${type} · ${doc.taille}`} onFermer={onFermer} largeur="820px">
            {/* Le PDF s'affiche via le lecteur intégré du navigateur : aucune
                bibliothèque ajoutée, aucun contenu lu par l'application. */}
            {url && type === 'PDF' ? (
                <iframe title={doc.nom} src={url} style={{
                    width: '100%', height: '62vh', border: `1px solid ${c.gray200}`, borderRadius: '12px'
                }} />
            ) : (
                <div style={{
                    background: c.gray50, borderRadius: '14px', padding: '2rem 1.25rem', textAlign: 'center'
                }}>
                    <i className={`bi ${iconeDocument(doc.nom)}`} style={{ fontSize: '2.6rem', color: c.gray400 }} />
                    <div style={{ fontWeight: 700, color: c.gray900, marginTop: '.85rem', wordBreak: 'break-word' }}>
                        {doc.nom}
                    </div>
                    <div style={{ fontSize: '.83rem', color: c.gray500, marginTop: '.4rem' }}>
                        {url
                            ? 'L’aperçu intégré n’est pas disponible pour ce format. Utilisez le téléchargement.'
                            : 'Le fichier n’est plus en mémoire : rouvrez-le depuis votre poste après un rafraîchissement.'}
                    </div>
                </div>
            )}

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '.75rem', marginTop: '1.1rem'
            }}>
                {[
                    { l: 'Type', v: type },
                    { l: 'Extension', v: `.${extensionDe(doc.nom) || '—'}` },
                    { l: 'Taille', v: doc.taille },
                    { l: 'Ajouté le', v: new Date(doc.date).toLocaleDateString('fr-FR') },
                    { l: 'Intégration', v: st.label }
                ].map((x) => (
                    <div key={x.l} style={{ background: c.gray50, borderRadius: '10px', padding: '.6rem .7rem' }}>
                        <div style={{ fontSize: '.7rem', color: c.gray400, textTransform: 'uppercase', letterSpacing: '.04em' }}>{x.l}</div>
                        <div style={{ fontSize: '.84rem', color: c.gray800, fontWeight: 600, marginTop: '.15rem' }}>{x.v}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
                {url && (
                    <Bouton c={c} variante="secondaire" icone="bi-download"
                        onClick={() => {
                            const a = document.createElement('a');
                            a.href = url; a.download = doc.nom; a.click();
                        }}>Télécharger</Bouton>
                )}
                <Bouton c={c} onClick={onFermer}>Fermer</Bouton>
            </div>
        </Modale>
    );
};

// ============================================================================
// VUE D'ENSEMBLE — point d'entrée de l'espace client
// ============================================================================
const VueApercu = ({ c, data, profil, societe, societeId }) => {
    const documents = documentsDe(data, societeId);
    const formations = formationsDe(data, societeId);
    const programmes = programmesDe(data, societeId);
    const cycle = cycleDeSociete(data, societeId);
    const integres = documents.filter((d) => d.statut === 'integre').length;

    const cartes = [
        { l: 'Documents', v: documents.length, sub: `${integres} intégré(s)`, i: 'bi-folder2-open', t: c.primary },
        { l: 'Formations', v: formations.length, sub: `${formations.filter((f) => f.statut === 'terminee').length} terminée(s)`, i: 'bi-mortarboard', t: c.info },
        { l: 'Programmes', v: programmes.length, sub: 'générés', i: 'bi-stars', t: c.warning },
        {
            l: 'Évaluation',
            v: cycle && cycle.statut === 'ouvert' ? 'Ouverte' : 'Fermée',
            sub: cycle ? cycle.libelle : '—', i: 'bi-clipboard-check',
            t: cycle && cycle.statut === 'ouvert' ? c.success : c.gray400
        }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <EnTete c={c} icone="bi-grid-1x2" titre={`Bonjour${profil ? `, ${profil.nom.split(' ')[0]}` : ''}`}
                sousTitre={societe ? societe.nom : 'Votre espace'} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '.9rem', marginBottom: '1.75rem' }}>
                {cartes.map((k) => (
                    <motion.div key={k.l} whileHover={{ y: -3 }} style={{
                        background: c.white, border: `1px solid ${c.gray200}`, borderRadius: '16px', padding: '1.1rem'
                    }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: '11px', background: `${k.t}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '.7rem'
                        }}>
                            <i className={`bi ${k.i}`} style={{ color: k.t, fontSize: '1.05rem' }} />
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c.gray900, lineHeight: 1.1 }}>{k.v}</div>
                        <div style={{ fontSize: '.79rem', color: c.gray500, marginTop: '.3rem' }}>{k.l}</div>
                        <div style={{ fontSize: '.73rem', color: c.gray400, marginTop: '.1rem' }}>{k.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Chaque domaine renvoie vers sa propre section, jamais mélangé ici. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '.85rem' }}>
                {[
                    { i: 'bi-folder2-open', t: 'Mes fichiers', d: 'Ajoutez les documents de votre société : bilan, organigramme, effectif…' },
                    { i: 'bi-mortarboard', t: 'Mes formations', d: 'Suivez les formations de votre société et leur statut.' },
                    { i: 'bi-clipboard-check', t: 'Évaluation', d: 'Accédez à votre évaluation selon le rôle qui vous est attribué.' },
                    { i: 'bi-stars', t: 'Mes programmes', d: 'Retrouvez les programmes générés depuis la navigation principale.' }
                ].map((x) => (
                    <Carte c={c} key={x.t}>
                        <i className={`bi ${x.i}`} style={{ color: c.primary, fontSize: '1.2rem' }} />
                        <div style={{ fontWeight: 700, color: c.gray900, marginTop: '.55rem' }}>{x.t}</div>
                        <div style={{ fontSize: '.81rem', color: c.gray500, marginTop: '.25rem', lineHeight: 1.5 }}>{x.d}</div>
                    </Carte>
                ))}
            </div>
        </motion.div>
    );
};

// ============================================================================
// MES PROGRAMMES — renvoi vers la génération, jamais un doublon de celle-ci
// ============================================================================
const VueProgrammes = ({ c, data, societe, societeId }) => {
    const programmes = programmesDe(data, societeId);
    const ouvrirGeneration = () => { window.location.href = '/generation-programme'; };
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <EnTete c={c} icone="bi-stars" titre="Mes programmes"
                sousTitre={`${programmes.length} programme(s) généré(s) pour ${societe ? societe.nom : 'votre société'}.`} />

            {programmes.length === 0 ? (
                <EtatVide c={c} icone="bi-stars" titre="Aucun programme généré"
                    texte="Créez votre premier programme depuis « Génération Programme », dans la navigation principale."
                    action={<Bouton c={c} icone="bi-box-arrow-up-right" onClick={ouvrirGeneration}>
                        Ouvrir Génération Programme
                    </Bouton>} />
            ) : (
                <>
                    {programmes.map((p) => (
                        <Carte c={c} key={p.id} style={{ marginBottom: '.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: c.gray900 }}>{p.titre}</div>
                                    <div style={{ fontSize: '.77rem', color: c.gray500, marginTop: '.2rem' }}>
                                        {new Date(p.genere_le).toLocaleDateString('fr-FR')}
                                        {p.documents_ids && p.documents_ids.length > 0 && ` · ${p.documents_ids.length} document(s) de contexte`}
                                    </div>
                                </div>
                                <Badge c={c} ton="primaire">{p.categorie}</Badge>
                            </div>
                        </Carte>
                    ))}
                    <div style={{ marginTop: '1.25rem' }}>
                        <Bouton c={c} icone="bi-box-arrow-up-right" onClick={ouvrirGeneration}>
                            Ouvrir Génération Programme
                        </Bouton>
                    </div>
                </>
            )}
        </motion.div>
    );
};

// Statut d'intégration d'un fichier, lisible d'un coup d'œil.
const StatutIntegration = ({ c, statut }) => {
    const st = STATUTS_DOCUMENT[statut] || STATUTS_DOCUMENT.en_cours;
    const couleurs = { termine: c.success, soumis: c.warning, attente: c.warning, danger: c.danger, neutre: c.gray500 };
    const col = couleurs[st.ton] || c.gray500;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.79rem', fontWeight: 600, color: col }}>
            <i className={`bi ${st.icone}`} />
            {st.label}
        </span>
    );
};

// ============================================================================
// PETITS COMPOSANTS LOCAUX
// ============================================================================
const EnTete = ({ c, icone, titre, sousTitre }) => (
    <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: c.gray900, fontSize: '1.35rem' }}>
            <i className={`bi ${icone}`} style={{ color: c.primary, marginRight: '.6rem' }} />{titre}
        </h2>
        <p style={{ margin: '.35rem 0 0', color: c.gray500, fontSize: '.86rem' }}>{sousTitre}</p>
    </div>
);

const Filtre = ({ c, actif, onClick, children }) => (
    <button onClick={onClick} style={{
        padding: '.4rem .85rem', borderRadius: '30px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600,
        border: `1px solid ${actif ? c.primary : c.gray300}`,
        background: actif ? '#EEF2FF' : 'transparent', color: actif ? c.primary : c.gray600
    }}>{children}</button>
);

const Chiffre = ({ c, libelle, valeur, ton }) => (
    <div>
        <div style={{ fontSize: '.73rem', color: c.gray500 }}>{libelle}</div>
        <div style={{ fontWeight: 700, fontSize: '1.35rem', color: ton || c.gray900 }}>{valeur}</div>
    </div>
);

const ModaleDocument = ({ c, onFermer, onValider, initial, titre, nomFige }) => {
    const [nom, setNom] = useState(initial ? initial.nom : '');
    const [categorie, setCategorie] = useState(initial ? initial.categorie : '');
    const [taille, setTaille] = useState(initial ? initial.taille : '');
    return (
        <Modale c={c} titre={titre || 'Ajouter un document'}
            sousTitre="Aucun téléversement réel : l’entrée est ajoutée à la liste."
            onFermer={onFermer} largeur="520px">
            {nomFige ? (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '.6rem', background: c.gray50,
                    borderRadius: '12px', padding: '.75rem .9rem', marginBottom: '1rem'
                }}>
                    <i className={`bi ${iconeDocument(nom)}`} style={{ color: c.primary, fontSize: '1.2rem' }} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: c.gray900, fontSize: '.88rem' }}>{nom}</div>
                        <div style={{ fontSize: '.75rem', color: c.gray500 }}>{typeDocument(nom)} · {taille}</div>
                    </div>
                </div>
            ) : (
                <ChampTexte c={c} label="Nom du fichier" obligatoire valeur={nom} onChange={setNom}
                    placeholder="Plan de développement 2027.pdf" />
            )}
            <ChampListe c={c} label="Catégorie" valeur={categorie} onChange={setCategorie} options={CATEGORIES_DOCUMENT} />
            {!nomFige && <ChampTexte c={c} label="Taille" valeur={taille} onChange={setTaille} placeholder="1.2 Mo" />}
            <div style={{ fontSize: '.78rem', color: c.gray500, marginTop: '-.4rem', marginBottom: '.9rem' }}>
                Formats prévus : {FORMATS_DOCUMENT.map((f) => f.label).join(' · ')}. Terminez le nom par
                l’extension correspondante.
            </div>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!nom.trim()}
                    onClick={() => onValider(nom.trim(), categorie || 'Autre', taille.trim())}>Ajouter</Bouton>
            </div>
        </Modale>
    );
};

const ModaleFormation = ({ c, onFermer, onValider }) => {
    const [libelle, setLibelle] = useState('');
    const [duree, setDuree] = useState('');
    const [participants, setParticipants] = useState('');
    return (
        <Modale c={c} titre="Ajouter une formation" onFermer={onFermer} largeur="500px">
            <ChampTexte c={c} label="Intitulé" obligatoire valeur={libelle} onChange={setLibelle} placeholder="Négociation" />
            <ChampTexte c={c} label="Durée" valeur={duree} onChange={setDuree} placeholder="2 jours" />
            <ChampTexte c={c} label="Participants" valeur={participants} onChange={setParticipants} placeholder="12" />
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!libelle.trim()}
                    onClick={() => onValider(libelle.trim(), duree.trim() || '—', participants)}>Ajouter</Bouton>
            </div>
        </Modale>
    );
};

// Extensions acceptées par le sélecteur de fichier.
const EXTENSIONS_ACCEPTEES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];

const formaterTaille = (octets) => {
    if (!octets && octets !== 0) return '—';
    if (octets < 1024) return `${octets} o`;
    if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
    return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
};

export default EspaceClient;
