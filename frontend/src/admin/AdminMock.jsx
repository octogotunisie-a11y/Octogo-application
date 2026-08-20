// frontend/src/admin/AdminMock.jsx
// -----------------------------------------------------------------------------
// CONSOLE D'ADMINISTRATION — refonte.
//
// Navigation par sidebar, sept espaces :
//   Vue d'ensemble · Sociétés · Utilisateurs · Évaluations · Documents
//   Activité · Paramètres
//
// Règle de composition : un écran ne montre qu'un domaine. La fiche d'une
// société ouvre ses propres onglets plutôt que d'empiler tout sur une page.
//
// Icônes : lucide-react, déjà présent dans le projet (utilisé par la page de
// génération). Pas de seconde bibliothèque d'icônes.
//
// ⚠ Aucune base, aucun appel réseau, aucune IA.
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Building2, Users, ClipboardCheck, Files, Activity,
    Settings, ChevronLeft, Plus, GraduationCap, ShieldCheck, Menu, X,
    CheckCircle2, Clock, AlertTriangle, XCircle, Search, Sparkles,
    Pencil, Trash2, UserPlus, Link2, Unlink
} from 'lucide-react';
import {
    useMock, maj, reinitialiser, tracer, journalUtilisateur,
    documentsDe, formationsDe, utilisateursDe, utilisateursNonRattaches,
    programmesDe, cycleDeSociete, formationDuCycle, questionsObservateur,
    banqueTest, gabaritQuestionsObservateur, typeDocument,
    rattacherUtilisateur, supprimerSociete, supprimerUtilisateur, nomSociete,
    aRole, prochainId, iconeDocument,
    STATUTS_DOCUMENT, STATUTS_FORMATION, TYPES_ACTIVITE, ROLES_EVALUATION,
    MAX_QUESTIONS_OBSERVATEUR
} from '../mock/mockStore.jsx';
import { fusionner } from '../evaluation/ui.jsx';

// Palette resserrée : primaire, blanc, deux gris, quatre couleurs de statut.
const STATUT_COULEUR = (c) => ({
    termine: c.success, soumis: c.warning, attente: c.warning,
    danger: c.danger, neutre: c.gray400, info: c.info
});

const MENU = [
    { id: 'apercu', label: 'Vue d’ensemble', Icone: LayoutDashboard },
    { id: 'societes', label: 'Sociétés', Icone: Building2 },
    { id: 'utilisateurs', label: 'Utilisateurs', Icone: Users },
    { id: 'evaluations', label: 'Évaluations', Icone: ClipboardCheck },
    { id: 'documents', label: 'Documents', Icone: Files },
    { id: 'ia', label: 'Génération IA', Icone: Sparkles },
    { id: 'activite', label: 'Activité', Icone: Activity },
    { id: 'parametres', label: 'Paramètres', Icone: Settings }
];

// ============================================================================
const AdminMock = ({ colors }) => {
    const c = fusionner(colors);
    const data = useMock();

    const [section, setSection] = useState('apercu');
    const [societeOuverte, setSocieteOuverte] = useState(null);
    const [menuMobile, setMenuMobile] = useState(false);
    const [message, setMessage] = useState(null);

    const notifier = (m) => { setMessage(m); setTimeout(() => setMessage(null), 3000); };
    const aller = (id) => { setSection(id); setSocieteOuverte(null); setMenuMobile(false); };

    const commun = { c, data, notifier, setSocieteOuverte, aller };

    return (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* ------------------------------------------------------ SIDEBAR */}
            <aside style={{
                flex: '0 0 232px', maxWidth: 232, minWidth: 200,
                background: c.white, border: `1px solid ${c.gray200}`, borderRadius: '16px',
                padding: '1.1rem .8rem', position: 'sticky', top: '1rem',
                display: menuMobile ? 'block' : undefined
            }} className="octogo-admin-sidebar">
                <div style={{ padding: '0 .6rem 1rem', borderBottom: `1px solid ${c.gray100}`, marginBottom: '.85rem' }}>
                    <div style={{ fontWeight: 800, color: c.gray900, letterSpacing: '.06em', fontSize: '.92rem' }}>OCTOGO</div>
                    <div style={{ fontSize: '.74rem', color: c.gray500, marginTop: '.1rem' }}>Administration</div>
                </div>

                {MENU.map(({ id, label, Icone }) => {
                    const actif = section === id;
                    return (
                        <button key={id} onClick={() => aller(id)} style={{
                            display: 'flex', alignItems: 'center', gap: '.65rem', width: '100%',
                            padding: '.6rem .65rem', marginBottom: '.15rem', borderRadius: '10px',
                            border: 'none', cursor: 'pointer', textAlign: 'left',
                            background: actif ? `${c.primary}12` : 'transparent',
                            color: actif ? c.primary : c.gray600,
                            fontWeight: actif ? 700 : 500, fontSize: '.86rem', fontFamily: 'inherit'
                        }}>
                            <Icone size={17} />
                            {label}
                        </button>
                    );
                })}
            </aside>

            {/* ------------------------------------------------------ CONTENU */}
            <main style={{ flex: '1 1 480px', minWidth: 0 }}>
                {message && (
                    <div style={{
                        background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46',
                        borderRadius: '12px', padding: '.7rem 1rem', fontSize: '.85rem', marginBottom: '1.1rem'
                    }}>{message}</div>
                )}

                {societeOuverte ? (
                    <FicheSociete {...commun} societeId={societeOuverte} onRetour={() => setSocieteOuverte(null)} />
                ) : (
                    <>
                        {section === 'apercu' && <Apercu {...commun} />}
                        {section === 'societes' && <Societes {...commun} />}
                        {section === 'utilisateurs' && <Utilisateurs {...commun} />}
                        {section === 'evaluations' && <Evaluations {...commun} />}
                        {section === 'documents' && <Documents {...commun} />}
                        {section === 'ia' && <GenerationIA {...commun} />}
                        {section === 'activite' && <Activite {...commun} />}
                        {section === 'parametres' && <Parametres {...commun} />}
                    </>
                )}
            </main>
        </div>
    );
};

// ============================================================================
// VUE D'ENSEMBLE — uniquement les chiffres qui comptent, plus l'activité
// ============================================================================
const Apercu = ({ c, data, aller, setSocieteOuverte }) => {
    const cyclesOuverts = data.cycles.filter((cy) => cy.statut === 'ouvert');
    const cartes = [
        { l: 'Sociétés', v: data.societes.length, s: `${data.societes.length} active(s)`, Icone: Building2, go: 'societes' },
        { l: 'Utilisateurs', v: data.utilisateurs.length, s: `${data.utilisateurs.filter((u) => u.roles.length > 0).length} avec rôle`, Icone: Users, go: 'utilisateurs' },
        { l: 'Documents', v: data.documents.length, s: `${data.documents.filter((d) => d.statut === 'integre').length} intégré(s)`, Icone: Files, go: 'documents' },
        { l: 'Évaluations actives', v: cyclesOuverts.length, s: `${data.cycles.length} cycle(s) au total`, Icone: ClipboardCheck, go: 'evaluations' }
    ];

    return (
        <>
            <Titre c={c} titre="Vue d’ensemble" sousTitre="L’essentiel en un coup d’œil." />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '.9rem', marginBottom: '2rem' }}>
                {cartes.map(({ l, v, s, Icone, go }) => (
                    <motion.button key={l} whileHover={{ y: -2 }} onClick={() => aller(go)} style={{
                        background: c.white, border: `1px solid ${c.gray200}`, borderRadius: '16px',
                        padding: '1.15rem', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '.79rem', color: c.gray500, fontWeight: 600 }}>{l}</div>
                            <Icone size={16} color={c.gray400} />
                        </div>
                        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: c.gray900, lineHeight: 1.1, marginTop: '.5rem' }}>{v}</div>
                        <div style={{ fontSize: '.74rem', color: c.gray400, marginTop: '.2rem' }}>{s}</div>
                    </motion.button>
                ))}
            </div>

            <SousTitre c={c} titre="Activité récente"
                action={<BoutonTexte c={c} onClick={() => aller('activite')}>Tout voir</BoutonTexte>} />
            <Panneau c={c}>
                {data.journal.slice(0, 6).map((e, i) => (
                    <LigneActivite key={e.id} c={c} data={data} entree={e} premier={i === 0} onClient={setSocieteOuverte} />
                ))}
                {data.journal.length === 0 && <Vide c={c} texte="Aucune activité enregistrée." />}
            </Panneau>
        </>
    );
};

// ============================================================================
// SOCIÉTÉS
// ============================================================================
const Societes = ({ c, data, setSocieteOuverte, notifier }) => {
    const [modale, setModale] = useState(null);   // 'creer' | societe à modifier
    const [aSupprimer, setASupprimer] = useState(null);

    return (
        <>
            <Titre c={c} titre="Sociétés"
                sousTitre="Créez, modifiez ou supprimez librement. Une société peut n’avoir aucun utilisateur."
                action={<Bouton c={c} Icone={Plus} onClick={() => setModale('creer')}>Ajouter une société</Bouton>} />

            {data.societes.length === 0 ? (
                <Vide c={c} texte="Aucune société. Créez la première avec le bouton ci-dessus — elle peut rester vide." />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {data.societes.map((s) => (
                        <motion.div key={s.id} whileHover={{ y: -2 }} style={{
                            background: c.white, border: `1px solid ${c.gray200}`, borderRadius: '16px', padding: '1.25rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '11px', flexShrink: 0,
                                    background: `${c.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Building2 size={19} color={c.primary} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: c.gray900, wordBreak: 'break-word' }}>{s.nom}</div>
                                    {s.secteur && <div style={{ fontSize: '.75rem', color: c.gray500 }}>{s.secteur}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: '.25rem' }}>
                                    <IconeAction c={c} Icone={Pencil} titre="Modifier" onClick={() => setModale(s)} />
                                    <IconeAction c={c} Icone={Trash2} titre="Supprimer" danger onClick={() => setASupprimer(s)} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '.28rem', marginBottom: '1.1rem' }}>
                                {[
                                    { l: 'utilisateurs', v: utilisateursDe(data, s.id).length },
                                    { l: 'documents', v: documentsDe(data, s.id).length },
                                    { l: 'formations', v: formationsDe(data, s.id).length },
                                    { l: 'évaluations', v: data.cycles.filter((cy) => cy.societe_id === s.id).length }
                                ].map((x) => (
                                    <div key={x.l} style={{ fontSize: '.82rem', color: c.gray600 }}>
                                        <strong style={{ color: c.gray900 }}>{x.v}</strong> {x.l}
                                    </div>
                                ))}
                            </div>

                            <Bouton c={c} pleine onClick={() => setSocieteOuverte(s.id)}>Ouvrir</Bouton>
                        </motion.div>
                    ))}
                </div>
            )}

            {modale && (
                <ModaleSociete c={c} societe={modale === 'creer' ? null : modale}
                    onFermer={() => setModale(null)}
                    onValider={(f) => {
                        maj((d) => {
                            if (modale === 'creer') d.societes.push({ id: prochainId(d, 'societe'), ...f });
                            else Object.assign(d.societes.find((x) => x.id === modale.id), f);
                        });
                        setModale(null);
                        notifier(modale === 'creer' ? 'Société créée.' : 'Société modifiée.');
                    }} />
            )}

            {aSupprimer && (
                <Confirmation c={c} titre={`Supprimer « ${aSupprimer.nom} » ?`}
                    texte="Les comptes de ses membres sont conservés : ils redeviennent non attribués. Les documents gardent la trace de leur société d’origine."
                    onFermer={() => setASupprimer(null)}
                    onConfirmer={() => {
                        maj((d) => supprimerSociete(d, aSupprimer.id));
                        setASupprimer(null);
                        notifier('Société supprimée. Ses membres sont désormais non attribués.');
                    }} />
            )}
        </>
    );
};

// ============================================================================
// FICHE SOCIÉTÉ — identité, puis onglets séparés
// ============================================================================
const FicheSociete = ({ c, data, societeId, onRetour, notifier }) => {
    const [onglet, setOnglet] = useState('utilisateurs');
    const [modale, setModale] = useState(null);
    const [membreEdite, setMembreEdite] = useState(null);

    const societe = data.societes.find((s) => s.id === societeId);
    if (!societe) return null;

    const membres = utilisateursDe(data, societeId);
    const documents = documentsDe(data, societeId);
    const formations = formationsDe(data, societeId);
    const cycle = cycleDeSociete(data, societeId);
    const journal = data.journal.filter((e) => membres.some((m) => m.id === e.utilisateur_id));

    const ONGLETS = [
        { id: 'utilisateurs', label: 'Utilisateurs', Icone: Users, n: membres.length },
        { id: 'documents', label: 'Documents', Icone: Files, n: documents.length },
        { id: 'formations', label: 'Formations', Icone: GraduationCap, n: formations.length },
        { id: 'evaluations', label: 'Évaluations', Icone: ClipboardCheck, n: cycle ? 1 : 0 },
        { id: 'activite', label: 'Activité', Icone: Activity, n: journal.length }
    ];

    return (
        <>
            <button onClick={onRetour} style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'none',
                border: 'none', color: c.primary, cursor: 'pointer', fontSize: '.85rem',
                fontWeight: 600, padding: 0, marginBottom: '1rem', fontFamily: 'inherit'
            }}>
                <ChevronLeft size={16} /> Sociétés
            </button>

            {/* Identité — une seule carte, quatre informations */}
            <Panneau c={c} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: '13px', flexShrink: 0,
                        background: `${c.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Building2 size={21} color={c.primary} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, color: c.gray900, fontSize: '1.15rem' }}>{societe.nom}</div>
                        <div style={{ fontSize: '.8rem', color: c.gray500 }}>{societe.secteur}</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '.75rem' }}>
                    {[
                        { l: 'Adresse', v: societe.adresse || '—' },
                        { l: 'Email', v: societe.email || '—' },
                        { l: 'Téléphone', v: societe.telephone || '—' },
                        { l: 'Cycle', v: cycle ? `${cycle.libelle} · ${cycle.statut === 'ouvert' ? 'ouvert' : 'fermé'}` : '—' }
                    ].map((x) => (
                        <div key={x.l}>
                            <div style={{ fontSize: '.71rem', color: c.gray400, textTransform: 'uppercase', letterSpacing: '.04em' }}>{x.l}</div>
                            <div style={{ fontSize: '.86rem', color: c.gray800, fontWeight: 600, marginTop: '.15rem' }}>{x.v}</div>
                        </div>
                    ))}
                </div>
            </Panneau>

            {/* Onglets : chaque domaine dans son espace */}
            <div style={{
                display: 'flex', gap: '.3rem', overflowX: 'auto', paddingBottom: '.2rem',
                borderBottom: `1px solid ${c.gray200}`, marginBottom: '1.5rem'
            }}>
                {ONGLETS.map(({ id, label, Icone, n }) => {
                    const actif = onglet === id;
                    return (
                        <button key={id} onClick={() => setOnglet(id)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '.45rem',
                            padding: '.6rem .9rem', border: 'none', background: 'transparent',
                            borderBottom: `2px solid ${actif ? c.primary : 'transparent'}`,
                            color: actif ? c.primary : c.gray500, fontWeight: 600, fontSize: '.85rem',
                            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit'
                        }}>
                            <Icone size={15} />{label}
                            <span style={{
                                background: actif ? `${c.primary}18` : c.gray100, color: actif ? c.primary : c.gray500,
                                borderRadius: '20px', padding: '1px 7px', fontSize: '.7rem'
                            }}>{n}</span>
                        </button>
                    );
                })}
            </div>

            {onglet === 'utilisateurs' && (
                <OngletUtilisateurs c={c} data={data} societeId={societeId} membres={membres}
                    notifier={notifier} setModale={setModale} modale={modale}
                    membreEdite={membreEdite} setMembreEdite={setMembreEdite} />
            )}
            {onglet === 'documents' && <OngletDocuments c={c} data={data} documents={documents} notifier={notifier} />}
            {onglet === 'formations' && <OngletFormations c={c} formations={formations} cycle={cycle} />}
            {onglet === 'evaluations' && <OngletEvaluations c={c} data={data} societeId={societeId} cycle={cycle} notifier={notifier} />}
            {onglet === 'activite' && <OngletActivite c={c} data={data} journal={journal} />}
        </>
    );
};

// --------------------------------------------------- Utilisateurs d'une société
const OngletUtilisateurs = ({ c, data, societeId, membres, notifier, setModale, modale, membreEdite, setMembreEdite }) => {
    // Tout compte non membre de CETTE société est rattachable, qu'il soit
    // libre ou déjà dans une autre : l'Admin déplace comme il l'entend.
    const rattachables = data.utilisateurs.filter((u) => u.societe_id !== societeId);

    const rattacher = (ids) => {
        maj((d) => {
            ids.forEach((id) => {
                rattacherUtilisateur(d, id, societeId);
                tracer(d, id, 'societe_modifiee', `vers ${nomSociete(d, societeId)}`);
            });
        });
        setModale(null);
        notifier(`${ids.length} utilisateur(s) rattaché(s).`);
    };

    const enregistrerRoles = (u, roles) => {
        maj((d) => {
            d.utilisateurs.find((x) => x.id === u.id).roles = roles;
            tracer(d, u.id, 'role_modifie', roles.length ? roles.join(' + ') : 'aucun rôle');
        });
        setMembreEdite(null);
        notifier(`${u.nom} : rôles enregistrés.`);
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ fontSize: '.82rem', color: c.gray500 }}>
                    {membres.length} membre(s). Une société peut rester vide.
                </div>
                <Bouton c={c} Icone={Link2} onClick={() => setModale('rattacher')} disabled={rattachables.length === 0}>
                    Ajouter un utilisateur
                </Bouton>
            </div>

            {membres.length === 0 ? (
                <Vide c={c} texte="Aucun utilisateur rattaché. Ajoutez-en, ou laissez la société vide." />
            ) : (
                <Tableau c={c} colonnes={['Nom', 'Email', 'Rôle', 'Statut', 'Actions']}
                    lignes={membres.map((u) => [
                        <span style={{ fontWeight: 600, color: c.gray900 }}>{u.nom}</span>,
                        <span style={{ color: c.gray600 }}>{u.email}</span>,
                        u.roles.length === 0
                            ? <Etiquette c={c} ton="neutre">Aucun rôle</Etiquette>
                            : (
                                <span style={{ display: 'inline-flex', gap: '.3rem', flexWrap: 'wrap' }}>
                                    {u.roles.map((r) => (
                                        <Etiquette key={r} c={c} ton="info">
                                            {(ROLES_EVALUATION.find((x) => x.valeur === r) || {}).label || r}
                                        </Etiquette>
                                    ))}
                                </span>
                            ),
                        <Etiquette c={c} ton="termine">Actif</Etiquette>,
                        <span style={{ display: 'inline-flex', gap: '.4rem', flexWrap: 'wrap' }}>
                            <BoutonTexte c={c} onClick={() => setMembreEdite(u)}>Modifier le rôle</BoutonTexte>
                            <BoutonTexte c={c} onClick={() => {
                                maj((d) => {
                                    rattacherUtilisateur(d, u.id, null);
                                    tracer(d, u.id, 'societe_modifiee', 'retiré de sa société');
                                });
                                notifier(`${u.nom} retiré de la société. Son compte est conservé.`);
                            }}>Retirer</BoutonTexte>
                        </span>
                    ])} />
            )}

            {modale === 'rattacher' && (
                <ModaleRattacher c={c} data={data} candidats={rattachables}
                    onFermer={() => setModale(null)} onValider={rattacher} />
            )}

            {membreEdite && (
                <ModaleRoles c={c} utilisateur={membreEdite} onFermer={() => setMembreEdite(null)} onValider={enregistrerRoles} />
            )}
        </>
    );
};

// ------------------------------------------------------ Documents d'une société
const OngletDocuments = ({ c, data, documents, notifier }) => {
    const auteur = (doc) => {
        const u = data.utilisateurs.find((x) => x.id === doc.ajoute_par);
        return u ? u.nom : '—';
    };
    return documents.length === 0
        ? <Vide c={c} texte="Aucun document déposé par les utilisateurs de cette société." />
        : (
            <Tableau c={c} colonnes={['Document', 'Type', 'Ajouté par', 'Date', 'Statut']}
                lignes={documents.map((doc) => [
                    <span style={{ fontWeight: 600, color: c.gray900, display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                        <i className={`bi ${iconeDocument(doc.nom)}`} style={{ color: c.primary }} />{doc.nom}
                    </span>,
                    <span style={{ color: c.gray600 }}>{doc.categorie}</span>,
                    <span style={{ color: c.gray600 }}>{auteur(doc)}</span>,
                    <span style={{ color: c.gray600 }}>{doc.date}</span>,
                    <SelecteurStatut c={c} doc={doc} onChange={(v) => {
                        maj((d) => { d.documents.find((x) => x.id === doc.id).statut = v; });
                        notifier(`${doc.nom} : ${STATUTS_DOCUMENT[v].label.toLowerCase()}.`);
                    }} />
                ])} />
        );
};

const SelecteurStatut = ({ c, doc, onChange }) => {
    const st = STATUTS_DOCUMENT[doc.statut] || STATUTS_DOCUMENT.en_cours;
    const Icone = { integre: CheckCircle2, en_cours: Clock, attention: AlertTriangle, echec: XCircle }[st.code] || Clock;
    const col = STATUT_COULEUR(c)[st.ton] || c.gray500;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}>
            <Icone size={15} color={col} />
            <select value={doc.statut || 'en_cours'} onChange={(e) => onChange(e.target.value)} style={{
                border: 'none', background: 'transparent', color: col, fontWeight: 600,
                fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit', padding: 0
            }}>
                {Object.values(STATUTS_DOCUMENT).map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
            </select>
        </span>
    );
};

// ----------------------------------------------------- Formations d'une société
const OngletFormations = ({ c, formations, cycle }) => (
    formations.length === 0
        ? <Vide c={c} texte="Aucune formation enregistrée pour cette société." />
        : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.9rem' }}>
                {formations.map((f) => {
                    const st = STATUTS_FORMATION[f.statut] || STATUTS_FORMATION.a_venir;
                    return (
                        <Panneau c={c} key={f.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.6rem', marginBottom: '.75rem' }}>
                                <GraduationCap size={19} color={c.primary} />
                                <Etiquette c={c} ton={st.ton}>{st.label}</Etiquette>
                            </div>
                            <div style={{ fontWeight: 700, color: c.gray900 }}>{f.libelle}</div>
                            <div style={{ fontSize: '.79rem', color: c.gray500, marginTop: '.35rem' }}>
                                {f.date} · {f.duree} · {f.participants} participants
                            </div>
                            {cycle && cycle.formation_id === f.id && (
                                <div style={{ marginTop: '.7rem', fontSize: '.77rem', color: c.gray600 }}>
                                    Rattachée au cycle {cycle.libelle}
                                </div>
                            )}
                        </Panneau>
                    );
                })}
            </div>
        )
);

// ---------------------------------------------------- Évaluations d'une société
const OngletEvaluations = ({ c, data, societeId, cycle, notifier }) => {
    if (!cycle) return <Vide c={c} texte="Aucun cycle d’évaluation pour cette société." />;

    const formation = formationDuCycle(data, cycle);
    const collaborateurs = utilisateursDe(data, societeId, 'collaborateur');
    const observateurs = utilisateursDe(data, societeId, 'observateur');
    const questions = questionsObservateur(data, cycle.id, true);

    return (
        <>
            <Panneau c={c} style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.85rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontWeight: 700, color: c.gray900, fontSize: '1.02rem' }}>
                            {formation ? formation.libelle : 'Aucune formation'}
                        </div>
                        <div style={{ fontSize: '.8rem', color: c.gray500, marginTop: '.2rem' }}>
                            Cycle {cycle.libelle} · {cycle.debut} → {cycle.fin}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', flexWrap: 'wrap' }}>
                        <Etiquette c={c} ton={cycle.statut === 'ouvert' ? 'termine' : 'neutre'}>
                            {cycle.statut === 'ouvert' ? 'En cours' : 'Fermé'}
                        </Etiquette>
                        <Bouton c={c} variante="secondaire" onClick={() => {
                            maj((d) => {
                                const cy = d.cycles.find((x) => x.id === cycle.id);
                                cy.statut = cy.statut === 'ouvert' ? 'ferme' : 'ouvert';
                            });
                            notifier(cycle.statut === 'ouvert' ? 'Cycle fermé.' : 'Cycle ouvert.');
                        }}>
                            {cycle.statut === 'ouvert' ? 'Fermer' : 'Ouvrir'}
                        </Bouton>
                    </div>
                </div>
            </Panneau>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '.9rem' }}>
                <Panneau c={c}>
                    <Cle c={c}>Observateur</Cle>
                    {observateurs.length === 0
                        ? <div style={{ fontSize: '.82rem', color: c.gray400 }}>Aucun. Attribuez le rôle dans l’onglet Utilisateurs.</div>
                        : observateurs.map((p) => <Item c={c} key={p.id} Icone={ShieldCheck}>{p.nom}</Item>)}
                </Panneau>
                <Panneau c={c}>
                    <Cle c={c}>Collaborateurs</Cle>
                    {collaborateurs.length === 0
                        ? <div style={{ fontSize: '.82rem', color: c.gray400 }}>Aucun. Attribuez le rôle dans l’onglet Utilisateurs.</div>
                        : collaborateurs.map((p) => <Item c={c} key={p.id} Icone={Users}>{p.nom}</Item>)}
                </Panneau>
                <Panneau c={c}>
                    <Cle c={c}>Questions observateur</Cle>
                    <div style={{ fontSize: '.85rem', color: c.gray700 }}>
                        {questions.length} / {MAX_QUESTIONS_OBSERVATEUR} configurée(s)
                    </div>
                    <div style={{ fontSize: '.76rem', color: c.gray400, marginTop: '.3rem' }}>
                        Deux au maximum sont transmises.
                    </div>
                </Panneau>
            </div>
        </>
    );
};

// ------------------------------------------------------ Activité d'une société
const OngletActivite = ({ c, data, journal }) => (
    journal.length === 0
        ? <Vide c={c} texte="Aucune activité pour les utilisateurs de cette société." />
        : (
            <Panneau c={c}>
                {journal.slice(0, 40).map((e, i) => (
                    <LigneActivite key={e.id} c={c} data={data} entree={e} premier={i === 0} />
                ))}
            </Panneau>
        )
);

// ============================================================================
// UTILISATEURS — vue transversale
// ============================================================================
const Utilisateurs = ({ c, data, setSocieteOuverte, notifier }) => {
    const [recherche, setRecherche] = useState('');
    const [filtre, setFiltre] = useState('tous');      // tous | avec | sans
    const [modale, setModale] = useState(null);        // 'creer' | utilisateur
    const [aSupprimer, setASupprimer] = useState(null);

    const sansSociete = data.utilisateurs.filter((u) => u.societe_id == null).length;

    const filtres = data.utilisateurs
        .filter((u) => filtre === 'tous'
            || (filtre === 'avec' && u.societe_id != null)
            || (filtre === 'sans' && u.societe_id == null))
        .filter((u) => !recherche || `${u.nom} ${u.email}`.toLowerCase().includes(recherche.toLowerCase()));

    const derniereConnexion = (id) => {
        const e = journalUtilisateur(data, id, 60).find((x) => x.type === 'connexion');
        return e ? new Date(e.date).toLocaleDateString('fr-FR') : '—';
    };

    return (
        <>
            <Titre c={c} titre="Utilisateurs"
                sousTitre="Un compte peut exister sans société et sans rôle : c’est vous qui décidez."
                action={<Bouton c={c} Icone={UserPlus} onClick={() => setModale('creer')}>Ajouter un client</Bouton>} />

            {sansSociete > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '.6rem', background: `${c.warning}12`,
                    border: `1px solid ${c.warning}33`, borderRadius: '12px', padding: '.7rem 1rem',
                    fontSize: '.83rem', color: '#92400E', marginBottom: '1.1rem'
                }}>
                    <AlertTriangle size={16} />
                    {sansSociete} utilisateur(s) sans société attribuée.
                    <BoutonTexte c={c} onClick={() => setFiltre('sans')}>Les afficher</BoutonTexte>
                </div>
            )}

            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '.55rem', background: c.white, flex: '1 1 240px',
                    border: `1px solid ${c.gray200}`, borderRadius: '10px', padding: '.5rem .75rem'
                }}>
                    <Search size={15} color={c.gray400} />
                    <input value={recherche} onChange={(e) => setRecherche(e.target.value)}
                        placeholder="Rechercher un nom ou un email…"
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '.85rem', color: c.gray800, fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: '.3rem' }}>
                    {[
                        { id: 'tous', l: 'Tous' },
                        { id: 'avec', l: 'Avec société' },
                        { id: 'sans', l: 'Sans société' }
                    ].map((f) => {
                        const actif = filtre === f.id;
                        return (
                            <button key={f.id} onClick={() => setFiltre(f.id)} style={{
                                padding: '.5rem .85rem', borderRadius: '10px', cursor: 'pointer', fontSize: '.81rem',
                                fontWeight: 600, fontFamily: 'inherit',
                                border: `1px solid ${actif ? c.primary : c.gray300}`,
                                background: actif ? `${c.primary}12` : c.white, color: actif ? c.primary : c.gray600
                            }}>{f.l}</button>
                        );
                    })}
                </div>
            </div>

            {filtres.length === 0 ? <Vide c={c} texte="Aucun utilisateur pour ce filtre." /> : (
                <Tableau c={c} colonnes={['Nom', 'Société', 'Rôle', 'Statut', 'Dernière connexion', 'Actions']}
                    lignes={filtres.map((u) => [
                        <span>
                            <span style={{ fontWeight: 600, color: c.gray900, display: 'block' }}>{u.nom}</span>
                            <span style={{ fontSize: '.75rem', color: c.gray500 }}>{u.email}</span>
                        </span>,
                        u.societe_id != null
                            ? <BoutonTexte c={c} onClick={() => setSocieteOuverte(u.societe_id)}>{nomSociete(data, u.societe_id)}</BoutonTexte>
                            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', color: c.warning, fontSize: '.8rem', fontWeight: 600 }}>
                                <AlertTriangle size={13} /> Non attribuée
                              </span>,
                        u.roles.length === 0
                            ? <Etiquette c={c} ton="neutre">Aucun rôle</Etiquette>
                            : (
                                <span style={{ display: 'inline-flex', gap: '.3rem', flexWrap: 'wrap' }}>
                                    {u.roles.map((r) => (
                                        <Etiquette key={r} c={c} ton="info">
                                            {(ROLES_EVALUATION.find((x) => x.valeur === r) || {}).label || r}
                                        </Etiquette>
                                    ))}
                                </span>
                            ),
                        <Etiquette c={c} ton={u.actif === false ? 'neutre' : 'termine'}>
                            {u.actif === false ? 'Inactif' : 'Actif'}
                        </Etiquette>,
                        <span style={{ color: c.gray600 }}>{derniereConnexion(u.id)}</span>,
                        <span style={{ display: 'inline-flex', gap: '.25rem' }}>
                            <IconeAction c={c} Icone={Pencil} titre="Modifier" onClick={() => setModale(u)} />
                            {u.societe_id != null && (
                                <IconeAction c={c} Icone={Unlink} titre="Retirer de la société" onClick={() => {
                                    maj((d) => {
                                        rattacherUtilisateur(d, u.id, null);
                                        tracer(d, u.id, 'societe_modifiee', 'retiré de sa société');
                                    });
                                    notifier(`${u.nom} n’est plus rattaché à une société. Son compte est conservé.`);
                                }} />
                            )}
                            <IconeAction c={c} Icone={Trash2} titre="Supprimer" danger onClick={() => setASupprimer(u)} />
                        </span>
                    ])} />
            )}

            {modale && (
                <ModaleUtilisateur c={c} data={data} utilisateur={modale === 'creer' ? null : modale}
                    onFermer={() => setModale(null)}
                    onValider={(f) => {
                        maj((d) => {
                            if (modale === 'creer') {
                                const id = prochainId(d, 'utilisateur');
                                d.utilisateurs.push({ id, ...f, actif: f.actif !== false });
                                tracer(d, id, 'compte_cree', f.nom);
                            } else {
                                const u = d.utilisateurs.find((x) => x.id === modale.id);
                                const ancienne = u.societe_id;
                                Object.assign(u, f);
                                if (ancienne !== f.societe_id) {
                                    tracer(d, u.id, 'societe_modifiee',
                                        f.societe_id == null ? 'retiré de sa société' : `vers ${nomSociete(d, f.societe_id)}`);
                                }
                            }
                        });
                        setModale(null);
                        notifier(modale === 'creer' ? 'Client créé.' : 'Client modifié.');
                    }} />
            )}

            {aSupprimer && (
                <Confirmation c={c} titre={`Supprimer le compte de ${aSupprimer.nom} ?`}
                    texte="Cette action retire le compte de la liste. Les documents qu’il a déposés sont conservés, avec la mention de leur auteur."
                    onFermer={() => setASupprimer(null)}
                    onConfirmer={() => {
                        maj((d) => {
                            tracer(d, null, 'compte_supprime', aSupprimer.nom);
                            supprimerUtilisateur(d, aSupprimer.id);
                        });
                        setASupprimer(null);
                        notifier('Compte supprimé.');
                    }} />
            )}
        </>
    );
};

// ============================================================================
// ÉVALUATIONS — vue transversale
// ============================================================================
const Evaluations = ({ c, data, setSocieteOuverte }) => (
    <>
        <Titre c={c} titre="Évaluations" sousTitre="Un cycle par société. Ouvrez la société pour le configurer." />
        {data.cycles.length === 0 ? <Vide c={c} texte="Aucun cycle d’évaluation." /> : data.cycles.map((cy) => {
            const s = data.societes.find((x) => x.id === cy.societe_id);
            const f = formationDuCycle(data, cy);
            const collabs = utilisateursDe(data, cy.societe_id, 'collaborateur');
            const obs = utilisateursDe(data, cy.societe_id, 'observateur');
            return (
                <Panneau c={c} key={cy.id} style={{ marginBottom: '.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.85rem', flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: c.gray900 }}>{s ? s.nom : '—'}</div>
                            <div style={{ fontSize: '.8rem', color: c.gray500, marginTop: '.2rem' }}>
                                {f ? f.libelle : 'Aucune formation'} · Cycle {cy.libelle}
                            </div>
                            <div style={{ fontSize: '.78rem', color: c.gray500, marginTop: '.35rem' }}>
                                Observateur : {obs.map((x) => x.nom).join(', ') || '—'} · {collabs.length} collaborateur(s)
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', flexWrap: 'wrap' }}>
                            <Etiquette c={c} ton={cy.statut === 'ouvert' ? 'termine' : 'neutre'}>
                                {cy.statut === 'ouvert' ? 'En cours' : 'Fermé'}
                            </Etiquette>
                            <BoutonTexte c={c} onClick={() => setSocieteOuverte(cy.societe_id)}>Ouvrir</BoutonTexte>
                        </div>
                    </div>
                </Panneau>
            );
        })}
    </>
);

// ============================================================================
// DOCUMENTS — vue transversale
// ============================================================================
const Documents = ({ c, data, setSocieteOuverte }) => (
    <>
        <Titre c={c} titre="Documents" sousTitre="Fichiers déposés par les utilisateurs, toutes sociétés confondues." />
        {data.documents.length === 0 ? <Vide c={c} texte="Aucun document déposé." /> : (
            <Tableau c={c} colonnes={['Document', 'Société', 'Ajouté par', 'Date', 'Statut']}
                lignes={data.documents.map((doc) => {
                    const s = data.societes.find((x) => x.id === doc.societe_id);
                    const u = data.utilisateurs.find((x) => x.id === doc.ajoute_par);
                    const st = STATUTS_DOCUMENT[doc.statut] || STATUTS_DOCUMENT.en_cours;
                    return [
                        <span style={{ fontWeight: 600, color: c.gray900, display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
                            <i className={`bi ${iconeDocument(doc.nom)}`} style={{ color: c.primary }} />{doc.nom}
                        </span>,
                        s ? <BoutonTexte c={c} onClick={() => setSocieteOuverte(s.id)}>{s.nom}</BoutonTexte> : '—',
                        <span style={{ color: c.gray600 }}>{u ? u.nom : '—'}</span>,
                        <span style={{ color: c.gray600 }}>{doc.date}</span>,
                        <Etiquette c={c} ton={st.ton}>{st.label}</Etiquette>
                    ];
                })} />
        )}
    </>
);

// ============================================================================
// GÉNÉRATION IA — l'Admin renseigne le contexte, puis commande.
//
// Aucun champ n'a de valeur par défaut : la formation et le thème sont ceux que
// l'Admin saisit. Rien n'est proposé d'office, rien n'est inventé.
//
// ⚠ Aucun modèle n'est appelé. La génération compose des questions à partir de
// la formation et du thème saisis, puis les enregistre dans le périmètre de la
// société choisie — jamais d'une autre.
// ============================================================================
const GenerationIA = ({ c, data, notifier }) => {
    const [societeId, setSocieteId] = useState(data.societes[0] ? data.societes[0].id : null);
    const [formation, setFormation] = useState('');
    const [theme, setTheme] = useState('');
    const [selection, setSelection] = useState([]);
    const [enCours, setEnCours] = useState(null);

    const documents = documentsDe(data, societeId);
    const societe = data.societes.find((s) => s.id === societeId);
    const complet = formation.trim().length > 0 && theme.trim().length > 0;

    // Crée la formation si elle n'existe pas, puis le cycle, dans le périmètre
    // de la société sélectionnée. Aucune donnée d'une autre société n'entre ici.
    const contexte = (d) => {
        let f = d.formations.find((x) => x.societe_id === societeId && x.libelle === formation.trim());
        if (!f) {
            f = {
                id: prochainId(d, 'formation'), societe_id: societeId,
                libelle: formation.trim(), theme: theme.trim(), statut: 'a_venir',
                date: new Date().toISOString().slice(0, 10), duree: '—', participants: 0
            };
            d.formations.push(f);
        }
        let cy = d.cycles.find((x) => x.societe_id === societeId);
        if (!cy) {
            cy = {
                id: prochainId(d, 'cycle'), societe_id: societeId, formation_id: f.id,
                libelle: `Cycle ${new Date().getFullYear()}`,
                debut: new Date().toISOString().slice(0, 10),
                fin: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
                statut: 'ouvert'
            };
            d.cycles.push(cy);
        } else {
            cy.formation_id = f.id;
        }
        return { f, cy };
    };

    const genererTests = () => {
        setEnCours('tests');
        setTimeout(() => {
            maj((d) => {
                const { f } = contexte(d);
                ['pre', 'post'].forEach((type) => {
                    if (d.tests.some((t) => t.formation_id === f.id && t.type === type)) return;
                    d.tests.push({
                        id: prochainId(d, 'test'), societe_id: societeId, formation_id: f.id,
                        type, source: 'mock', theme: theme.trim(),
                        documents_ids: [...selection],
                        questions: banqueTest(formation.trim(), theme.trim())
                    });
                });
                tracer(d, null, 'generation_demandee', `Tests — ${formation.trim()} / ${theme.trim()}`);
            });
            setEnCours(null);
            notifier(`Tests pré et post préparés pour « ${formation.trim()} ».`);
        }, 600);
    };

    const genererQuestions = () => {
        setEnCours('questions');
        setTimeout(() => {
            maj((d) => {
                const { cy } = contexte(d);
                d.questions_observateur = d.questions_observateur.filter((q) => q.cycle_id !== cy.id);
                gabaritQuestionsObservateur(formation.trim(), theme.trim()).forEach((texte, i) => {
                    d.questions_observateur.push({
                        id: prochainId(d, 'question_observateur'), societe_id: societeId,
                        cycle_id: cy.id, ordre: i + 1, actif: true, source: 'mock', texte
                    });
                });
                tracer(d, null, 'generation_demandee', `Questions observateur — ${formation.trim()}`);
            });
            setEnCours(null);
            notifier(`Questions d’observation préparées (${MAX_QUESTIONS_OBSERVATEUR} au maximum).`);
        }, 600);
    };

    return (
        <>
            <Titre c={c} titre="Génération IA"
                sousTitre="Renseignez le contexte, puis commandez la préparation des tests et des questions." />

            <div style={{
                background: '#FFFBEB', border: '1px dashed #FDE68A', color: '#92400E',
                borderRadius: '12px', padding: '.75rem 1rem', fontSize: '.83rem', marginBottom: '1.25rem', lineHeight: 1.55
            }}>
                Aucun moteur n’est branché. Les questions produites sont composées à partir de la formation
                et du thème que vous saisissez. L’attribution des niveaux restera toujours humaine :
                le moteur proposera des questions, jamais une note.
            </div>

            <Panneau c={c} style={{ marginBottom: '1.25rem' }}>
                <Cle c={c}>Contexte</Cle>

                <div style={{ marginBottom: '.9rem' }}>
                    <label style={{ display: 'block', fontSize: '.79rem', fontWeight: 600, color: c.gray600, marginBottom: '.35rem' }}>
                        Société
                    </label>
                    <select value={societeId || ''} onChange={(e) => { setSocieteId(Number(e.target.value)); setSelection([]); }}
                        style={{
                            width: '100%', padding: '.6rem .8rem', borderRadius: '10px', border: `1px solid ${c.gray300}`,
                            fontSize: '.86rem', color: c.gray800, background: c.white, fontFamily: 'inherit'
                        }}>
                        {data.societes.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                    </select>
                </div>

                <Champ c={c} label="Formation" valeur={formation} onChange={setFormation}
                    placeholder="Intitulé de la formation" />
                <Champ c={c} label="Thème" valeur={theme} onChange={setTheme}
                    placeholder="Thème traité par cette formation" />

                <div style={{ fontSize: '.79rem', fontWeight: 600, color: c.gray600, marginBottom: '.4rem', marginTop: '.4rem' }}>
                    Documents de {societe ? societe.nom : 'la société'}
                </div>
                {documents.length === 0 ? (
                    <div style={{ fontSize: '.82rem', color: c.gray400, padding: '.3rem 0' }}>
                        Aucun document. Les utilisateurs de cette société n’en ont pas encore déposé.
                    </div>
                ) : (
                    <div style={{ border: `1px solid ${c.gray200}`, borderRadius: '10px', padding: '.5rem', maxHeight: 170, overflowY: 'auto' }}>
                        {documents.map((d) => (
                            <label key={d.id} style={{
                                display: 'flex', alignItems: 'center', gap: '.55rem', padding: '.35rem .3rem',
                                cursor: 'pointer', fontSize: '.84rem', color: c.gray700
                            }}>
                                <input type="checkbox" checked={selection.includes(d.id)}
                                    onChange={() => setSelection(selection.includes(d.id)
                                        ? selection.filter((x) => x !== d.id) : [...selection, d.id])} />
                                <i className={`bi ${iconeDocument(d.nom)}`} style={{ color: c.gray400 }} />
                                <span style={{ flex: 1, minWidth: 0 }}>{d.nom}</span>
                                <span style={{ fontSize: '.72rem', color: c.gray400 }}>{typeDocument(d.nom)}</span>
                            </label>
                        ))}
                    </div>
                )}
                <div style={{ fontSize: '.75rem', color: c.gray400, marginTop: '.5rem' }}>
                    Seuls les documents de cette société seront transmis. Ceux d’une autre ne le sont jamais.
                </div>
            </Panneau>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '.9rem' }}>
                <Panneau c={c}>
                    <Cle c={c}>Tests collaborateur</Cle>
                    <div style={{ fontSize: '.84rem', color: c.gray600, lineHeight: 1.55, marginBottom: '1rem' }}>
                        Prépare le test pré-formation et le test post-formation, portant sur les mêmes items
                        afin que la comparaison soit possible.
                    </div>
                    <Bouton c={c} Icone={Sparkles} disabled={!complet || !!enCours} onClick={genererTests}>
                        {enCours === 'tests' ? 'Préparation…' : 'Générer les tests'}
                    </Bouton>
                </Panneau>

                <Panneau c={c}>
                    <Cle c={c}>Questions observateur</Cle>
                    <div style={{ fontSize: '.84rem', color: c.gray600, lineHeight: 1.55, marginBottom: '1rem' }}>
                        Prépare {MAX_QUESTIONS_OBSERVATEUR} questions au maximum, orientées sur ce que
                        l’observateur peut constater en situation.
                    </div>
                    <Bouton c={c} Icone={Sparkles} disabled={!complet || !!enCours} onClick={genererQuestions}>
                        {enCours === 'questions' ? 'Préparation…' : 'Générer les questions'}
                    </Bouton>
                </Panneau>
            </div>

            {!complet && (
                <div style={{ fontSize: '.8rem', color: c.gray500, marginTop: '.9rem' }}>
                    Renseignez la formation et le thème pour activer la génération.
                </div>
            )}
        </>
    );
};

// ============================================================================
// ACTIVITÉ — vue transversale
// ============================================================================
const Activite = ({ c, data, setSocieteOuverte }) => {
    // Regroupement par jour : « Aujourd'hui », puis les dates.
    const groupes = {};
    data.journal.slice(0, 80).forEach((e) => {
        const j = new Date(e.date).toLocaleDateString('fr-FR');
        (groupes[j] = groupes[j] || []).push(e);
    });
    const aujourdhui = new Date().toLocaleDateString('fr-FR');

    return (
        <>
            <Titre c={c} titre="Activité" sousTitre="Ce qui se passe dans l’application, du plus récent au plus ancien." />
            {Object.keys(groupes).length === 0 ? <Vide c={c} texte="Aucune activité enregistrée." /> : (
                Object.entries(groupes).map(([jour, entrees]) => (
                    <div key={jour} style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                            fontSize: '.75rem', fontWeight: 700, color: c.gray500, textTransform: 'uppercase',
                            letterSpacing: '.05em', marginBottom: '.6rem'
                        }}>{jour === aujourdhui ? 'Aujourd’hui' : jour}</div>
                        <Panneau c={c}>
                            {entrees.map((e, i) => (
                                <LigneActivite key={e.id} c={c} data={data} entree={e} premier={i === 0} avecHeure
                                    onClient={(id) => {
                                        const u = data.utilisateurs.find((x) => x.id === id);
                                        if (u && u.societe_id != null) setSocieteOuverte(u.societe_id);
                                    }} />
                            ))}
                        </Panneau>
                    </div>
                ))
            )}
        </>
    );
};

const LigneActivite = ({ c, data, entree, premier, avecHeure, onClient }) => {
    const t = TYPES_ACTIVITE[entree.type] || { label: entree.type, ton: 'neutre' };
    const u = data.utilisateurs.find((x) => x.id === entree.utilisateur_id);
    const d = new Date(entree.date);
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.7rem 0',
            borderTop: premier ? 'none' : `1px solid ${c.gray100}`, flexWrap: 'wrap'
        }}>
            {avecHeure && (
                <span style={{ fontSize: '.76rem', color: c.gray400, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    {d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
            )}
            <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: STATUT_COULEUR(c)[t.ton] || c.gray300
            }} />
            <span style={{ flex: '1 1 160px', minWidth: 0, fontSize: '.85rem', color: c.gray700 }}>
                {u ? (
                    <button onClick={() => onClient && onClient(u.id)} style={{
                        background: 'none', border: 'none', padding: 0, color: c.gray900,
                        fontWeight: 600, cursor: onClient ? 'pointer' : 'default', fontSize: '.85rem', fontFamily: 'inherit'
                    }}>{u.nom}</button>
                ) : <strong style={{ color: c.gray900 }}>Administrateur</strong>}
                {' — '}{t.label.toLowerCase()}
                {entree.detail && <span style={{ color: c.gray500 }}> · {entree.detail}</span>}
            </span>
            {!avecHeure && (
                <span style={{ fontSize: '.75rem', color: c.gray400, flexShrink: 0 }}>
                    {d.toLocaleDateString('fr-FR')}
                </span>
            )}
        </div>
    );
};

// ============================================================================
// PARAMÈTRES
// ============================================================================
const Parametres = ({ c, notifier }) => (
    <>
        <Titre c={c} titre="Paramètres" sousTitre="Gestion du jeu de données de démonstration." />
        <Panneau c={c}>
            <Cle c={c}>Données de démonstration</Cle>
            <div style={{ fontSize: '.85rem', color: c.gray600, lineHeight: 1.55, marginBottom: '1rem' }}>
                Les données vivent dans l’onglet courant et disparaissent à sa fermeture. La
                réinitialisation efface documents, programmes, réponses et journal, puis rétablit
                le référentiel d’origine. Les comptes utilisateurs ne sont jamais recréés :
                ce sont ceux de l’application.
            </div>
            <Bouton c={c} variante="secondaire" onClick={() => { reinitialiser(); notifier('Données réinitialisées.'); }}>
                Réinitialiser les données
            </Bouton>
        </Panneau>
    </>
);

// ============================================================================
// PRIMITIVES LOCALES — volontairement sobres
// ============================================================================
const Titre = ({ c, titre, sousTitre, action }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem'
    }}>
        <div>
            <h2 style={{ margin: 0, color: c.gray900, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-.01em' }}>{titre}</h2>
            {sousTitre && <p style={{ margin: '.3rem 0 0', color: c.gray500, fontSize: '.85rem' }}>{sousTitre}</p>}
        </div>
        {action}
    </div>
);

const SousTitre = ({ c, titre, action }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
        <div style={{ fontWeight: 700, color: c.gray900, fontSize: '.95rem' }}>{titre}</div>
        {action}
    </div>
);

const Panneau = ({ c, children, style = {} }) => (
    <div style={{
        background: c.white, border: `1px solid ${c.gray200}`, borderRadius: '16px',
        padding: '1.15rem', ...style
    }}>{children}</div>
);

const Cle = ({ c, children }) => (
    <div style={{
        fontSize: '.71rem', color: c.gray400, textTransform: 'uppercase',
        letterSpacing: '.05em', fontWeight: 700, marginBottom: '.6rem'
    }}>{children}</div>
);

const Item = ({ c, Icone, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.25rem 0', fontSize: '.86rem', color: c.gray800 }}>
        <Icone size={15} color={c.gray400} />{children}
    </div>
);

const Etiquette = ({ c, ton, children }) => {
    const col = STATUT_COULEUR(c)[ton] || c.gray500;
    return (
        <span style={{
            display: 'inline-block', padding: '2px 9px', borderRadius: '20px', fontSize: '.74rem',
            fontWeight: 600, color: col, background: `${col}14`, whiteSpace: 'nowrap'
        }}>{children}</span>
    );
};

const Bouton = ({ c, Icone, children, variante = 'primaire', pleine, disabled, onClick }) => {
    const styles = {
        primaire: { background: c.primary, color: c.white, border: 'none' },
        secondaire: { background: 'transparent', color: c.gray700, border: `1px solid ${c.gray300}` }
    };
    return (
        <button onClick={onClick} disabled={disabled} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem',
            padding: '.55rem 1rem', borderRadius: '10px', fontSize: '.85rem', fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1,
            width: pleine ? '100%' : undefined, fontFamily: 'inherit', ...styles[variante]
        }}>
            {Icone && <Icone size={15} />}{children}
        </button>
    );
};

const BoutonTexte = ({ c, children, onClick }) => (
    <button onClick={onClick} style={{
        background: 'none', border: 'none', padding: 0, color: c.primary,
        cursor: 'pointer', fontSize: '.82rem', fontWeight: 600, fontFamily: 'inherit'
    }}>{children}</button>
);

const Vide = ({ c, texte }) => (
    <div style={{
        background: c.white, border: `1px dashed ${c.gray300}`, borderRadius: '16px',
        padding: '2.5rem 1.25rem', textAlign: 'center', color: c.gray500, fontSize: '.86rem'
    }}>{texte}</div>
);

// Tableau responsive : défilement horizontal plutôt que texte tronqué.
const Tableau = ({ c, colonnes, lignes }) => (
    <div style={{
        background: c.white, border: `1px solid ${c.gray200}`, borderRadius: '16px', overflow: 'hidden'
    }}>
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem', minWidth: 560 }}>
                <thead>
                    <tr>
                        {colonnes.map((h, i) => (
                            <th key={i} style={{
                                textAlign: 'left', padding: '.8rem 1rem', color: c.gray500, fontWeight: 600,
                                fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.04em',
                                borderBottom: `1px solid ${c.gray200}`, whiteSpace: 'nowrap'
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {lignes.map((cellules, i) => (
                        <tr key={i} style={{ borderTop: i === 0 ? 'none' : `1px solid ${c.gray100}` }}>
                            {cellules.map((cellule, j) => (
                                <td key={j} style={{ padding: '.85rem 1rem', verticalAlign: 'middle' }}>{cellule}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// ============================================================================
// MODALES
// ============================================================================
const Modale = ({ c, titre, sousTitre, onFermer, children, largeur = '480px' }) => (
    <div onClick={onFermer} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
        <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()} style={{
                background: c.white, borderRadius: '18px', width: '100%', maxWidth: largeur,
                maxHeight: '88vh', overflowY: 'auto', padding: '1.6rem'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                <div>
                    <div style={{ fontWeight: 800, color: c.gray900, fontSize: '1.05rem' }}>{titre}</div>
                    {sousTitre && <div style={{ fontSize: '.8rem', color: c.gray500, marginTop: '.2rem' }}>{sousTitre}</div>}
                </div>
                <button onClick={onFermer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.gray400, padding: 0 }}>
                    <X size={18} />
                </button>
            </div>
            {children}
        </motion.div>
    </div>
);

const Champ = ({ c, label, valeur, onChange, placeholder }) => (
    <div style={{ marginBottom: '.9rem' }}>
        <label style={{ display: 'block', fontSize: '.79rem', fontWeight: 600, color: c.gray600, marginBottom: '.35rem' }}>{label}</label>
        <input value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
            width: '100%', padding: '.6rem .8rem', borderRadius: '10px', border: `1px solid ${c.gray300}`,
            fontSize: '.86rem', color: c.gray800, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
        }} />
    </div>
);

const ChampZone = ({ c, label, valeur, onChange, placeholder }) => (
    <div style={{ marginBottom: '.9rem' }}>
        <label style={{ display: 'block', fontSize: '.79rem', fontWeight: 600, color: c.gray600, marginBottom: '.35rem' }}>{label}</label>
        <textarea value={valeur} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
            width: '100%', minHeight: 70, resize: 'vertical', padding: '.6rem .8rem', borderRadius: '10px',
            border: `1px solid ${c.gray300}`, fontSize: '.86rem', color: c.gray800,
            outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
        }} />
    </div>
);

const Pied = ({ c, onFermer, onValider, desactive, libelle = 'Enregistrer' }) => (
    <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
        <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
        <Bouton c={c} disabled={desactive} onClick={onValider}>{libelle}</Bouton>
    </div>
);

const ModaleSociete = ({ c, societe, onFermer, onValider }) => {
    const [f, setF] = useState({
        nom: societe ? societe.nom : '',
        secteur: societe ? societe.secteur || '' : '',
        email: societe ? societe.email || '' : '',
        telephone: societe ? societe.telephone || '' : '',
        adresse: societe ? societe.adresse || '' : '',
        notes: societe ? societe.notes || '' : ''
    });
    const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
    return (
        <Modale c={c} titre={societe ? `Modifier ${societe.nom}` : 'Ajouter une société'}
            sousTitre={societe ? null : 'Une société peut être créée sans aucun utilisateur.'} onFermer={onFermer}>
            <Champ c={c} label="Nom de la société" valeur={f.nom} onChange={set('nom')} />
            <Champ c={c} label="Secteur" valeur={f.secteur} onChange={set('secteur')} />
            <Champ c={c} label="Email" valeur={f.email} onChange={set('email')} />
            <Champ c={c} label="Téléphone" valeur={f.telephone} onChange={set('telephone')} />
            <Champ c={c} label="Adresse" valeur={f.adresse} onChange={set('adresse')} />
            <ChampZone c={c} label="Informations complémentaires" valeur={f.notes} onChange={set('notes')} />
            <Pied c={c} onFermer={onFermer} desactive={!f.nom.trim()}
                onValider={() => onValider({ ...f, nom: f.nom.trim() })}
                libelle={societe ? 'Enregistrer' : 'Créer la société'} />
        </Modale>
    );
};

// Création / modification d'un client. La société et les rôles sont des choix
// de l'Admin : « Non attribuée » et « aucun rôle » sont des options offertes.
const ModaleUtilisateur = ({ c, data, utilisateur, onFermer, onValider }) => {
    const [f, setF] = useState({
        nom: utilisateur ? utilisateur.nom : '',
        email: utilisateur ? utilisateur.email : '',
        telephone: utilisateur ? utilisateur.telephone || '' : '',
        societe_id: utilisateur ? utilisateur.societe_id : null,
        roles: utilisateur ? [...(utilisateur.roles || [])] : [],
        actif: utilisateur ? utilisateur.actif !== false : true
    });
    const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
    const basculerRole = (r) => setF((x) => ({
        ...x, roles: x.roles.includes(r) ? x.roles.filter((y) => y !== r) : [...x.roles, r]
    }));

    return (
        <Modale c={c} titre={utilisateur ? `Modifier ${utilisateur.nom}` : 'Ajouter un client'} onFermer={onFermer} largeur="520px">
            <Champ c={c} label="Nom" valeur={f.nom} onChange={set('nom')} />
            <Champ c={c} label="Email" valeur={f.email} onChange={set('email')}
                placeholder="Doit correspondre au compte de connexion" />
            <Champ c={c} label="Téléphone" valeur={f.telephone} onChange={set('telephone')} />

            <div style={{ marginBottom: '.9rem' }}>
                <label style={{ display: 'block', fontSize: '.79rem', fontWeight: 600, color: c.gray600, marginBottom: '.35rem' }}>
                    Société
                </label>
                <select value={f.societe_id == null ? '' : f.societe_id}
                    onChange={(e) => set('societe_id')(e.target.value === '' ? null : Number(e.target.value))}
                    style={{
                        width: '100%', padding: '.6rem .8rem', borderRadius: '10px', border: `1px solid ${c.gray300}`,
                        fontSize: '.86rem', color: c.gray800, background: c.white, fontFamily: 'inherit'
                    }}>
                    <option value="">Non attribuée</option>
                    {data.societes.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
                {f.societe_id == null && (
                    <div style={{ fontSize: '.76rem', color: c.warning, marginTop: '.35rem' }}>
                        Ce compte restera sans société. C’est un état valide.
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '.9rem' }}>
                <label style={{ display: 'block', fontSize: '.79rem', fontWeight: 600, color: c.gray600, marginBottom: '.4rem' }}>
                    Rôles
                </label>
                {ROLES_EVALUATION.map((r) => (
                    <label key={r.valeur} style={{
                        display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.4rem .2rem',
                        cursor: 'pointer', fontSize: '.86rem', color: c.gray800
                    }}>
                        <input type="checkbox" checked={f.roles.includes(r.valeur)} onChange={() => basculerRole(r.valeur)} />
                        {r.label}
                    </label>
                ))}
                <div style={{ fontSize: '.76rem', color: c.gray500, marginTop: '.3rem' }}>
                    Les deux peuvent être cumulés. Ne rien cocher est un choix valide.
                </div>
            </div>

            <label style={{
                display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.4rem .2rem',
                cursor: 'pointer', fontSize: '.86rem', color: c.gray800
            }}>
                <input type="checkbox" checked={f.actif} onChange={(e) => set('actif')(e.target.checked)} />
                Compte actif
            </label>

            <Pied c={c} onFermer={onFermer} desactive={!f.nom.trim()}
                onValider={() => onValider({ ...f, nom: f.nom.trim(), email: f.email.trim() })}
                libelle={utilisateur ? 'Enregistrer' : 'Créer'} />
        </Modale>
    );
};

// Toute action destructive passe par ici.
const Confirmation = ({ c, titre, texte, onFermer, onConfirmer }) => (
    <Modale c={c} titre={titre} onFermer={onFermer} largeur="440px">
        <div style={{ fontSize: '.86rem', color: c.gray600, lineHeight: 1.6 }}>{texte}</div>
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.3rem' }}>
            <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
            <button onClick={onConfirmer} style={{
                display: 'inline-flex', alignItems: 'center', gap: '.45rem', padding: '.55rem 1rem',
                borderRadius: '10px', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer',
                background: c.danger, color: c.white, border: 'none', fontFamily: 'inherit'
            }}>Supprimer</button>
        </div>
    </Modale>
);

const IconeAction = ({ c, Icone, titre, onClick, danger }) => (
    <button title={titre} onClick={onClick} style={{
        width: 30, height: 30, borderRadius: '8px', border: `1px solid ${c.gray200}`,
        background: c.white, cursor: 'pointer', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', color: danger ? c.danger : c.gray600, flexShrink: 0
    }}><Icone size={14} /></button>
);

// Rattachement : l'Admin choisit parmi les comptes EXISTANTS. Aucun compte
// n'est créé ici — c'est la règle du §6.
const ModaleRattacher = ({ c, data, candidats, onFermer, onValider }) => {
    const [choix, setChoix] = useState([]);
    const basculer = (id) => setChoix(choix.includes(id) ? choix.filter((x) => x !== id) : [...choix, id]);
    return (
        <Modale c={c} titre="Ajouter un utilisateur à cette société"
            sousTitre="Comptes existants. Un compte déjà rattaché ailleurs sera déplacé." onFermer={onFermer}>
            {candidats.length === 0 ? (
                <div style={{ fontSize: '.85rem', color: c.gray500 }}>
                    Tous les comptes existants sont déjà membres de cette société.
                </div>
            ) : candidats.map((u) => (
                <label key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '.65rem', padding: '.6rem .3rem',
                    borderTop: `1px solid ${c.gray100}`, cursor: 'pointer'
                }}>
                    <input type="checkbox" checked={choix.includes(u.id)} onChange={() => basculer(u.id)} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontWeight: 600, color: c.gray900, fontSize: '.87rem' }}>{u.nom}</span>
                        <span style={{ fontSize: '.75rem', color: c.gray500 }}>{u.email}</span>
                    </span>
                    {u.societe_id != null
                        ? <Etiquette c={c} ton="attente">{nomSociete(data, u.societe_id)}</Etiquette>
                        : <Etiquette c={c} ton="neutre">Sans société</Etiquette>}
                </label>
            ))}
            <Pied c={c} onFermer={onFermer} desactive={choix.length === 0}
                onValider={() => onValider(choix)} libelle="Ajouter à la société" />
        </Modale>
    );
};

// Rôles multiples : cases à cocher, pas un choix exclusif.
const ModaleRoles = ({ c, utilisateur, onFermer, onValider }) => {
    const [roles, setRoles] = useState([...(utilisateur.roles || [])]);
    const basculer = (r) => setRoles(roles.includes(r) ? roles.filter((x) => x !== r) : [...roles, r]);
    return (
        <Modale c={c} titre={utilisateur.nom} sousTitre="Rôles dans le dispositif d’évaluation" onFermer={onFermer}>
            {ROLES_EVALUATION.map((r) => (
                <label key={r.valeur} style={{
                    display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.75rem .3rem',
                    borderTop: `1px solid ${c.gray100}`, cursor: 'pointer'
                }}>
                    <input type="checkbox" checked={roles.includes(r.valeur)} onChange={() => basculer(r.valeur)} />
                    <span style={{ fontSize: '.88rem', color: c.gray800, fontWeight: 600 }}>{r.label}</span>
                </label>
            ))}
            <div style={{ fontSize: '.78rem', color: c.gray500, marginTop: '.9rem', lineHeight: 1.5 }}>
                Les deux rôles peuvent être cumulés. Ne rien cocher est un choix valide :
                l’utilisateur n’aura simplement pas d’évaluation.
            </div>
            <Pied c={c} onFermer={onFermer} onValider={() => onValider(utilisateur, roles)} />
        </Modale>
    );
};

export default AdminMock;
