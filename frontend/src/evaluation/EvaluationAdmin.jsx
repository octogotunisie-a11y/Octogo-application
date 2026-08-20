// frontend/src/evaluation/EvaluationAdmin.jsx
// -----------------------------------------------------------------------------
// Espace ÉVALUATION — vue Administrateur.
// Monté comme un onglet du DashboardAdmin existant.
//
// Le rôle administrateur gère les comptes, les rôles, les structures et le
// référentiel. Il n'accède à AUCUNE donnée de mesure : les cotations, écarts,
// verbatims et restitutions ne sont pas exposés ici, et le serveur les refuse
// (403 ADMIN_SANS_MESURE) même si une requête était forgée.
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { evaluationApi, PLAFOND_OBJETS, MSG_PLAFOND, LIBELLE_STATUT_CYCLE } from './evaluationApi';
import {
    fusionner, Carte, Bouton, Badge, Champ, styleInput, Modale,
    Chargement, EtatVide, Alerte, FilAriane, OngletsInternes
} from './ui.jsx';

const ROLES = [
    { id: 'collaborateur', label: 'Collaborateur' },
    { id: 'manager_observateur', label: 'Manager-observateur' },
    { id: 'responsable_structure', label: 'Responsable de structure' },
    { id: 'drh', label: 'DRH' },
    { id: 'admin', label: 'Administrateur' }
];
const CONTEXTES = [
    { id: 'hierarchique', label: 'Hiérarchique' },
    { id: 'projet', label: 'Projet' },
    { id: 'filiere', label: 'Filière' }
];

const EvaluationAdmin = ({ colors }) => {
    const c = fusionner(colors);

    const [section, setSection] = useState('entites');
    const [entiteOuverte, setEntiteOuverte] = useState(null);
    const [entites, setEntites] = useState([]);
    const [fiche, setFiche] = useState(null);
    const [cycles, setCycles] = useState([]);
    const [objets, setObjets] = useState([]);
    const [audit, setAudit] = useState(null);

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [succes, setSucces] = useState(null);
    const [modale, setModale] = useState(null);
    const [personneEditee, setPersonneEditee] = useState(null);

    const notifier = (m) => { setSucces(m); setTimeout(() => setSucces(null), 3500); };

    const chargerSection = useCallback(async () => {
        setChargement(true); setErreur(null);
        try {
            if (section === 'entites') setEntites((await evaluationApi.listerEntites()).entites);
            else if (section === 'cycles') setCycles((await evaluationApi.listerCycles()).cycles);
            else if (section === 'referentiel') setObjets((await evaluationApi.listerObjets()).objets);
            else if (section === 'audit') setAudit(await evaluationApi.audit());
        } catch (e) { setErreur(e.message); }
        setChargement(false);
    }, [section]);

    const chargerFiche = useCallback(async (id) => {
        setChargement(true); setErreur(null);
        try {
            setFiche(await evaluationApi.ficheEntite(id));
            setObjets((await evaluationApi.listerObjets()).objets);
            setCycles((await evaluationApi.listerCycles()).cycles.filter((x) => x.entite_id === id));
        } catch (e) { setErreur(e.message); }
        setChargement(false);
    }, []);

    useEffect(() => { if (!entiteOuverte) chargerSection(); }, [section, entiteOuverte, chargerSection]);
    useEffect(() => { if (entiteOuverte) chargerFiche(entiteOuverte); }, [entiteOuverte, chargerFiche]);

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0, color: c.gray900, fontSize: '1.4rem' }}>
                    <i className="bi bi-clipboard-check" style={{ color: c.primary, marginRight: '.6rem' }} />
                    Évaluation
                </h2>
                <p style={{ margin: '.3rem 0 0', color: c.gray500, fontSize: '.86rem' }}>
                    Structures, rôles, relations d’observation, cycles et référentiel.
                    Les données de mesure ne sont pas accessibles depuis ce rôle.
                </p>
            </div>

            {!entiteOuverte && (
                <OngletsInternes c={c} actif={section} onChange={setSection} onglets={[
                    { id: 'entites', label: 'Entités', icone: 'bi-building' },
                    { id: 'cycles', label: 'Cycles', icone: 'bi-calendar3' },
                    { id: 'referentiel', label: 'Référentiel', icone: 'bi-journal-bookmark' },
                    { id: 'audit', label: 'Audit', icone: 'bi-shield-check' }
                ]} />
            )}

            {erreur && <Alerte c={c} ton="danger" onFermer={() => setErreur(null)}>{erreur}</Alerte>}
            {succes && <Alerte c={c} ton="succes" onFermer={() => setSucces(null)}>{succes}</Alerte>}

            {chargement ? <Chargement c={c} /> : (
                entiteOuverte
                    ? <FicheEntite
                        c={c} fiche={fiche} cycles={cycles} objets={objets}
                        onRetour={() => { setEntiteOuverte(null); setFiche(null); }}
                        onModale={setModale}
                        onEditerPersonne={(p) => { setPersonneEditee(p); setModale('personne'); }}
                        onRafraichir={() => chargerFiche(entiteOuverte)}
                        notifier={notifier} setErreur={setErreur}
                    />
                    : (
                        <>
                            {section === 'entites' && <ListeEntites c={c} entites={entites} onOuvrir={setEntiteOuverte} onAjouter={() => setModale('entite')} />}
                            {section === 'cycles' && <ListeCycles c={c} cycles={cycles} />}
                            {section === 'referentiel' && <Referentiel c={c} objets={objets} onAjouter={() => setModale('objet')} />}
                            {section === 'audit' && <Audit c={c} audit={audit} />}
                        </>
                    )
            )}

            {modale === 'entite' && <ModaleEntite c={c} onFermer={() => setModale(null)}
                onCree={() => { setModale(null); notifier('Entité créée.'); chargerSection(); }} setErreur={setErreur} />}

            {modale === 'objet' && <ModaleObjet c={c} onFermer={() => setModale(null)}
                onCree={() => { setModale(null); notifier('Objet ajouté au référentiel.'); chargerSection(); }} setErreur={setErreur} />}

            {modale === 'ligne' && fiche && <ModaleLigne c={c} fiche={fiche} onFermer={() => setModale(null)}
                onCree={() => { setModale(null); notifier('Ligne créée.'); chargerFiche(entiteOuverte); }} setErreur={setErreur} />}

            {modale === 'personne' && fiche && <ModalePersonne c={c} fiche={fiche} personne={personneEditee}
                onFermer={() => { setModale(null); setPersonneEditee(null); }}
                onEnregistre={() => { setModale(null); setPersonneEditee(null); notifier('Personne enregistrée.'); chargerFiche(entiteOuverte); }}
                setErreur={setErreur} />}

            {modale === 'relation' && fiche && <ModaleRelation c={c} fiche={fiche} onFermer={() => setModale(null)}
                onCree={() => { setModale(null); notifier('Relation d’observation créée.'); chargerFiche(entiteOuverte); }} setErreur={setErreur} />}

            {modale === 'cycle' && fiche && <ModaleCycle c={c} fiche={fiche} onFermer={() => setModale(null)}
                onCree={() => { setModale(null); notifier('Cycle créé.'); chargerFiche(entiteOuverte); }} setErreur={setErreur} />}

            {modale === 'assignation' && fiche && <ModaleAssignation c={c} fiche={fiche} cycles={cycles} objets={objets}
                onFermer={() => setModale(null)}
                onFait={() => { setModale(null); notifier('Objets assignés.'); chargerFiche(entiteOuverte); }} setErreur={setErreur} />}
        </motion.div>
    );
};

// =============================================================== ENTITÉS
const ListeEntites = ({ c, entites, onOuvrir, onAjouter }) => (
    <>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <Bouton c={c} icone="bi-plus-lg" onClick={onAjouter}>Ajouter une entité</Bouton>
        </div>
        {entites.length === 0
            ? <EtatVide c={c} icone="bi-building" titre="Aucune entité" texte="Créez une entité pour installer le dispositif." />
            : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {entites.map((e) => (
                        <Carte key={e.id} c={c} onClick={() => onOuvrir(e.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '.9rem' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '12px', background: c.primaryGradient,
                                    color: c.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                                }}>{e.nom.slice(0, 2).toUpperCase()}</div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: c.gray900 }}>{e.nom}</div>
                                    <div style={{ fontSize: '.78rem', color: c.gray500 }}>{e.email || '—'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                                <Badge c={c} ton="primaire">{e.nb_lignes} ligne(s)</Badge>
                                <Badge c={c}>{e.nb_personnes} personne(s)</Badge>
                                <Badge c={c} ton="info">{e.nb_cycles} cycle(s)</Badge>
                            </div>
                        </Carte>
                    ))}
                </div>
            )}
    </>
);

// =========================================================== FICHE ENTITÉ
const FicheEntite = ({ c, fiche, cycles, objets, onRetour, onModale, onEditerPersonne, onRafraichir, notifier, setErreur }) => {
    const [vue, setVue] = useState('structure');
    if (!fiche) return null;
    const { entite, lignes, personnes, relations } = fiche;

    const clore = async (cycleId) => {
        setErreur(null);
        try {
            const r = await evaluationApi.cloreCycle(cycleId);
            notifier(`Cycle clos — ${r.ecarts_calcules} écart(s), ${r.signatures_emises} signature(s).`);
            onRafraichir();
        } catch (e) { setErreur(e.message); }
    };

    return (
        <div>
            <FilAriane c={c} elements={[{ label: 'Entités', onClick: onRetour }, { label: entite.nom }]} />

            <OngletsInternes c={c} actif={vue} onChange={setVue} onglets={[
                { id: 'structure', label: 'Structure', icone: 'bi-diagram-3' },
                { id: 'personnes', label: 'Personnes et rôles', icone: 'bi-person-lines-fill' },
                { id: 'observation', label: 'Relations d’observation', icone: 'bi-eye' },
                { id: 'cycles', label: 'Cycles', icone: 'bi-calendar3' }
            ]} />

            {vue === 'structure' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <Bouton c={c} icone="bi-plus-lg" onClick={() => onModale('ligne')}>Ajouter une ligne</Bouton>
                    </div>
                    {lignes.sort((a, b) => a.chemin.localeCompare(b.chemin)).map((l) => (
                        <Carte key={l.id} c={c} style={{ marginBottom: '.6rem', marginLeft: `${l.niveau_profondeur * 1.5}rem` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                                <div>
                                    <strong style={{ color: c.gray900 }}>{l.libelle}</strong>
                                    <div style={{ fontSize: '.78rem', color: c.gray500 }}>
                                        Profondeur {l.niveau_profondeur} · Responsable : {(personnes.find((p) => p.id === l.responsable_id) || {}).nom || '—'}
                                    </div>
                                </div>
                                <Badge c={c}>{personnes.filter((p) => p.ligne_id === l.id).length} personne(s)</Badge>
                            </div>
                        </Carte>
                    ))}
                </>
            )}

            {vue === 'personnes' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <Bouton c={c} icone="bi-person-plus" onClick={() => onEditerPersonne(null)}>Ajouter une personne</Bouton>
                    </div>
                    {personnes.map((p) => (
                        <Carte key={p.id} c={c} style={{ marginBottom: '.6rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.75rem', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontWeight: 700, color: c.gray900 }}>{p.nom}</div>
                                    <div style={{ fontSize: '.8rem', color: c.gray500 }}>{p.email || '—'} · {p.ligne_libelle}</div>
                                    <div style={{ display: 'flex', gap: '.35rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                                        <Badge c={c} ton="primaire">{(ROLES.find((r) => r.id === p.role) || {}).label || p.role}</Badge>
                                        {p.premier_cycle_valide
                                            ? <Badge c={c} ton="succes">Premier cycle validé</Badge>
                                            : <Badge c={c} ton="attente">Premier cycle non validé</Badge>}
                                    </div>
                                </div>
                                <Bouton c={c} variante="secondaire" icone="bi-pencil" onClick={() => onEditerPersonne(p)}>Modifier</Bouton>
                            </div>
                        </Carte>
                    ))}
                </>
            )}

            {vue === 'observation' && (
                <>
                    <Alerte c={c} ton="info">
                        La relation d’observation est indépendante de la hiérarchie. Un responsable n’est pas
                        nécessairement l’observateur, et une même personne peut être observée par plusieurs
                        observateurs sur des contextes différents.
                    </Alerte>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <Bouton c={c} icone="bi-plus-lg" onClick={() => onModale('relation')}>Ajouter une relation</Bouton>
                    </div>
                    {relations.length === 0
                        ? <EtatVide c={c} icone="bi-eye" titre="Aucune relation d’observation" />
                        : relations.map((r) => (
                            <Carte key={r.id} c={c} style={{ marginBottom: '.6rem', padding: '.9rem 1.1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                                    <div style={{ color: c.gray800, fontSize: '.9rem' }}>
                                        <strong>{r.observateur_nom}</strong>
                                        <i className="bi bi-arrow-right" style={{ margin: '0 .5rem', color: c.gray400 }} />
                                        <strong>{r.observe_nom}</strong>
                                        <div style={{ fontSize: '.76rem', color: c.gray500, marginTop: '.2rem' }}>
                                            {r.periode_debut} → {r.periode_fin || 'en cours'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                        <Badge c={c} ton={r.contexte === 'hierarchique' ? 'primaire' : 'info'}>
                                            {(CONTEXTES.find((x) => x.id === r.contexte) || {}).label || r.contexte}
                                        </Badge>
                                        <button
                                            onClick={async () => {
                                                try { await evaluationApi.supprimerRelation(r.id); onRafraichir(); }
                                                catch (e) { setErreur(e.message); }
                                            }}
                                            style={{ background: 'none', border: 'none', color: c.danger, cursor: 'pointer' }}
                                        ><i className="bi bi-trash" /></button>
                                    </div>
                                </div>
                            </Carte>
                        ))}
                </>
            )}

            {vue === 'cycles' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <Bouton c={c} variante="secondaire" icone="bi-list-check" onClick={() => onModale('assignation')}>Assigner des objets</Bouton>
                        <Bouton c={c} icone="bi-plus-lg" onClick={() => onModale('cycle')}>Créer un cycle</Bouton>
                    </div>
                    {cycles.length === 0
                        ? <EtatVide c={c} icone="bi-calendar3" titre="Aucun cycle" />
                        : cycles.map((cy) => (
                            <Carte key={cy.id} c={c} style={{ marginBottom: '.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.75rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <strong style={{ color: c.gray900 }}>{cy.libelle}</strong>
                                            <Badge c={c} ton={cy.statut === 'ouvert' ? 'succes' : cy.statut === 'archive' ? 'neutre' : 'info'}>
                                                {LIBELLE_STATUT_CYCLE[cy.statut] || cy.statut}
                                            </Badge>
                                        </div>
                                        <div style={{ fontSize: '.82rem', color: c.gray500, marginTop: '.25rem' }}>
                                            {cy.date_debut} → {cy.date_fin} · {cy.nb_personnes} personne(s)
                                        </div>
                                    </div>
                                    {cy.statut === 'ouvert' && (
                                        <Bouton c={c} variante="secondaire" icone="bi-lock" onClick={() => clore(cy.id)}>
                                            Clore le cycle
                                        </Bouton>
                                    )}
                                </div>
                                {cy.statut === 'ouvert' && (
                                    <div style={{ fontSize: '.76rem', color: c.gray500, marginTop: '.6rem' }}>
                                        <i className="bi bi-exclamation-circle" style={{ marginRight: 5 }} />
                                        La clôture est irréversible : elle lève la séparation des canaux et déclenche le calcul.
                                    </div>
                                )}
                            </Carte>
                        ))}
                </>
            )}
        </div>
    );
};

// ================================================================= CYCLES
const ListeCycles = ({ c, cycles }) => (
    cycles.length === 0
        ? <EtatVide c={c} icone="bi-calendar3" titre="Aucun cycle" texte="Les cycles se créent depuis la fiche d’une entité." />
        : cycles.map((cy) => (
            <Carte key={cy.id} c={c} style={{ marginBottom: '.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <strong style={{ color: c.gray900, fontSize: '1.02rem' }}>{cy.libelle}</strong>
                            <Badge c={c} ton={cy.statut === 'ouvert' ? 'succes' : cy.statut === 'archive' ? 'neutre' : 'info'}>
                                {LIBELLE_STATUT_CYCLE[cy.statut] || cy.statut}
                            </Badge>
                        </div>
                        <div style={{ color: c.gray600, fontSize: '.85rem', marginTop: '.25rem' }}>
                            {cy.entite_nom} · cycle n° {cy.numero}
                        </div>
                        <div style={{ color: c.gray500, fontSize: '.82rem' }}>{cy.date_debut} → {cy.date_fin}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                        <Badge c={c} ton="primaire">{cy.nb_personnes} personne(s)</Badge>
                        <Badge c={c} ton="info">max {PLAFOND_OBJETS} objets / personne</Badge>
                    </div>
                </div>
            </Carte>
        ))
);

// ============================================================ RÉFÉRENTIEL
const Referentiel = ({ c, objets, onAjouter }) => (
    <>
        <Alerte c={c} ton="info">
            Les descripteurs de niveau et les cas-étalons seront livrés progressivement par le manuel
            d’évaluateur. Un seul objet entièrement documenté suffit à conduire un pilote valide sur une ligne.
        </Alerte>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <Bouton c={c} icone="bi-plus-lg" onClick={onAjouter}>Ajouter un objet</Bouton>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1rem' }}>
            {objets.map((o) => (
                <Carte key={o.id} c={c}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem', flexWrap: 'wrap' }}>
                        <strong style={{ color: c.gray900 }}>{o.libelle}</strong>
                        <Badge c={c} ton={o.registre === 'socle' ? 'primaire' : 'info'}>{o.registre}</Badge>
                    </div>
                    <div style={{ fontSize: '.76rem', color: c.gray500 }}>
                        {o.code} · version {o.version}{o.secteur ? ` · ${o.secteur}` : ''}
                    </div>
                </Carte>
            ))}
        </div>
    </>
);

// ================================================================== AUDIT
const Audit = ({ c, audit }) => {
    if (!audit) return null;
    return (
        <>
            <Carte c={c} style={{ marginBottom: '1.25rem', background: c.gray50 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', fontSize: '.85rem' }}>
                    <div><div style={{ color: c.gray500 }}>Version du moteur</div><strong style={{ color: c.gray900 }}>{audit.version_moteur}</strong></div>
                    <div><div style={{ color: c.gray500 }}>Version du schéma</div><strong style={{ color: c.gray900 }}>{audit.version_schema}</strong></div>
                </div>
            </Carte>

            <div style={{ fontWeight: 700, color: c.gray900, marginBottom: '.6rem' }}>Journal de purge du verbatim</div>
            {audit.journal_purge.length === 0
                ? <div style={{ color: c.gray400, fontSize: '.85rem', marginBottom: '1.5rem' }}>Aucune exécution enregistrée.</div>
                : (
                    <div style={{ marginBottom: '1.75rem' }}>
                        {audit.journal_purge.map((j) => (
                            <Carte key={j.id} c={c} style={{ marginBottom: '.5rem', padding: '.7rem 1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.6rem', flexWrap: 'wrap', fontSize: '.83rem' }}>
                                    <span style={{ color: c.gray700 }}>{j.commentaire}</span>
                                    <span style={{ color: c.gray500 }}>
                                        {new Date(j.execute_le).toLocaleString('fr-FR')} · {j.enregistrements_traites} enregistrement(s)
                                    </span>
                                </div>
                            </Carte>
                        ))}
                    </div>
                )}

            <div style={{ fontWeight: 700, color: c.gray900, marginBottom: '.6rem' }}>Journal des actions</div>
            {audit.audit.map((a) => (
                <Carte key={a.id} c={c} style={{ marginBottom: '.5rem', padding: '.8rem 1.05rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap' }}>
                        <div>
                            <Badge c={c} ton="primaire">{a.action}</Badge>
                            <div style={{ color: c.gray800, fontWeight: 600, marginTop: '.4rem', fontSize: '.88rem' }}>{a.cible}</div>
                            {a.details && <div style={{ color: c.gray500, fontSize: '.79rem', marginTop: '.15rem' }}>{a.details}</div>}
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '.76rem', color: c.gray500 }}>
                            <div>{new Date(a.date).toLocaleString('fr-FR')}</div>
                            <div style={{ marginTop: '.15rem' }}>{a.acteur}</div>
                        </div>
                    </div>
                </Carte>
            ))}
        </>
    );
};

// ================================================================ MODALES
const ModaleEntite = ({ c, onFermer, onCree, setErreur }) => {
    const [f, setF] = useState({ nom: '', email: '', telephone: '' });
    const [envoi, setEnvoi] = useState(false);
    return (
        <Modale c={c} titre="Ajouter une entité" onFermer={onFermer} largeur="500px">
            <Champ c={c} label="Nom" obligatoire>
                <input style={styleInput(c)} value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="ABC" />
            </Champ>
            <Champ c={c} label="Email">
                <input style={styleInput(c)} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Champ>
            <Champ c={c} label="Téléphone">
                <input style={styleInput(c)} value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} />
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!f.nom.trim() || envoi} onClick={async () => {
                    setEnvoi(true);
                    try { await evaluationApi.creerEntite(f); onCree(); } catch (e) { setErreur(e.message); }
                    setEnvoi(false);
                }}>Créer</Bouton>
            </div>
        </Modale>
    );
};

const ModaleObjet = ({ c, onFermer, onCree, setErreur }) => {
    const [f, setF] = useState({ code: '', libelle: '', registre: 'socle', secteur: '' });
    const [envoi, setEnvoi] = useState(false);
    return (
        <Modale c={c} titre="Ajouter un objet d’évaluation" onFermer={onFermer} largeur="520px">
            <Champ c={c} label="Code" obligatoire aide="Identifiant stable, ex. ERR-SIGNAL.">
                <input style={styleInput(c)} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} />
            </Champ>
            <Champ c={c} label="Libellé" obligatoire>
                <input style={styleInput(c)} value={f.libelle} onChange={(e) => setF({ ...f, libelle: e.target.value })} />
            </Champ>
            <Champ c={c} label="Registre">
                <select style={styleInput(c)} value={f.registre} onChange={(e) => setF({ ...f, registre: e.target.value })}>
                    <option value="socle">Socle</option>
                    <option value="situe">Situé</option>
                </select>
            </Champ>
            <Champ c={c} label="Secteur" aide="Laisser vide si l’objet est transverse.">
                <select style={styleInput(c)} value={f.secteur} onChange={(e) => setF({ ...f, secteur: e.target.value })}>
                    <option value="">Transverse</option>
                    <option value="distribution">Distribution</option>
                    <option value="banque">Banque</option>
                    <option value="hotellerie">Hôtellerie</option>
                </select>
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!f.code.trim() || !f.libelle.trim() || envoi} onClick={async () => {
                    setEnvoi(true);
                    try { await evaluationApi.creerObjet({ ...f, secteur: f.secteur || null }); onCree(); } catch (e) { setErreur(e.message); }
                    setEnvoi(false);
                }}>Ajouter</Bouton>
            </div>
        </Modale>
    );
};

const ModaleLigne = ({ c, fiche, onFermer, onCree, setErreur }) => {
    const [f, setF] = useState({ libelle: '', parent_ligne_id: '', responsable_id: '' });
    const [envoi, setEnvoi] = useState(false);
    return (
        <Modale c={c} titre="Ajouter une ligne hiérarchique" sousTitre={fiche.entite.nom} onFermer={onFermer} largeur="520px">
            <Champ c={c} label="Libellé" obligatoire>
                <input style={styleInput(c)} value={f.libelle} onChange={(e) => setF({ ...f, libelle: e.target.value })} placeholder="Commerciale" />
            </Champ>
            <Champ c={c} label="Ligne parente" aide="Laisser vide pour une ligne au sommet.">
                <select style={styleInput(c)} value={f.parent_ligne_id} onChange={(e) => setF({ ...f, parent_ligne_id: e.target.value })}>
                    <option value="">— Sommet —</option>
                    {fiche.lignes.map((l) => <option key={l.id} value={l.id}>{l.libelle}</option>)}
                </select>
            </Champ>
            <Champ c={c} label="Responsable">
                <select style={styleInput(c)} value={f.responsable_id} onChange={(e) => setF({ ...f, responsable_id: e.target.value })}>
                    <option value="">— À désigner —</option>
                    {fiche.personnes.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!f.libelle.trim() || envoi} onClick={async () => {
                    setEnvoi(true);
                    try { await evaluationApi.creerLigne({ ...f, entite_id: fiche.entite.id }); onCree(); } catch (e) { setErreur(e.message); }
                    setEnvoi(false);
                }}>Créer</Bouton>
            </div>
        </Modale>
    );
};

const ModalePersonne = ({ c, fiche, personne, onFermer, onEnregistre, setErreur }) => {
    const creation = !personne;
    const [f, setF] = useState({
        nom: personne ? personne.nom : '',
        email: personne ? personne.email : '',
        role: personne ? personne.role : 'collaborateur',
        ligne_id: personne && personne.ligne_id ? String(personne.ligne_id) : '',
        premier_cycle_valide: personne ? !!personne.premier_cycle_valide : false
    });
    const [envoi, setEnvoi] = useState(false);

    return (
        <Modale c={c} titre={creation ? 'Ajouter une personne' : `Modifier ${personne.nom}`} sousTitre={fiche.entite.nom} onFermer={onFermer}>
            <Champ c={c} label="Nom" obligatoire>
                <input style={styleInput(c)} value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} />
            </Champ>
            <Champ c={c} label="Email" aide="Doit correspondre au compte applicatif pour que la personne accède à son espace.">
                <input style={styleInput(c)} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Champ>
            <Champ c={c} label="Rôle" obligatoire aide="Le cloisonnement s’opère par ligne hiérarchique, pas par rôle global.">
                <select style={styleInput(c)} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
            </Champ>
            <Champ c={c} label="Ligne de rattachement">
                <select style={styleInput(c)} value={f.ligne_id} onChange={(e) => setF({ ...f, ligne_id: e.target.value })}>
                    <option value="">— Aucune —</option>
                    {fiche.lignes.map((l) => <option key={l.id} value={l.id}>{l.libelle}</option>)}
                </select>
            </Champ>
            {!creation && (
                <Champ c={c} label="Séquencement" aide="Aucune personne d’un niveau N ne peut entrer dans le dispositif tant que son N+1 n’a pas validé son premier cycle.">
                    <label style={{ display: 'flex', gap: '.6rem', alignItems: 'center', fontSize: '.87rem', color: c.gray700, cursor: 'pointer' }}>
                        <input type="checkbox" checked={f.premier_cycle_valide}
                            onChange={(e) => setF({ ...f, premier_cycle_valide: e.target.checked })} />
                        Premier cycle validé
                    </label>
                </Champ>
            )}
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!f.nom.trim() || envoi} onClick={async () => {
                    setEnvoi(true);
                    try {
                        if (creation) await evaluationApi.creerPersonne({ ...f, entite_id: fiche.entite.id });
                        else await evaluationApi.modifierPersonne(personne.id, f);
                        onEnregistre();
                    } catch (e) { setErreur(e.message); }
                    setEnvoi(false);
                }}>Enregistrer</Bouton>
            </div>
        </Modale>
    );
};

const ModaleRelation = ({ c, fiche, onFermer, onCree, setErreur }) => {
    const [f, setF] = useState({
        observateur_id: '', observe_id: '', contexte: 'hierarchique',
        periode_debut: '', periode_fin: '', ligne_id: ''
    });
    const [envoi, setEnvoi] = useState(false);
    const complet = f.observateur_id && f.observe_id && f.observateur_id !== f.observe_id;

    return (
        <Modale c={c} titre="Ajouter une relation d’observation" sousTitre={fiche.entite.nom} onFermer={onFermer}>
            <Champ c={c} label="Observateur" obligatoire>
                <select style={styleInput(c)} value={f.observateur_id} onChange={(e) => setF({ ...f, observateur_id: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {fiche.personnes.map((p) => <option key={p.id} value={p.id}>{p.nom} — {p.ligne_libelle}</option>)}
                </select>
            </Champ>
            <Champ c={c} label="Personne observée" obligatoire>
                <select style={styleInput(c)} value={f.observe_id} onChange={(e) => setF({ ...f, observe_id: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {fiche.personnes.filter((p) => String(p.id) !== String(f.observateur_id))
                        .map((p) => <option key={p.id} value={p.id}>{p.nom} — {p.ligne_libelle}</option>)}
                </select>
            </Champ>
            <Champ c={c} label="Contexte d’exercice" obligatoire
                aide="Un collaborateur exerçant principalement en projet n’est pas observé par son N+1.">
                <select style={styleInput(c)} value={f.contexte} onChange={(e) => setF({ ...f, contexte: e.target.value })}>
                    {CONTEXTES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
            </Champ>
            <Champ c={c} label="Période">
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <input type="date" style={styleInput(c)} value={f.periode_debut} onChange={(e) => setF({ ...f, periode_debut: e.target.value })} />
                    <input type="date" style={styleInput(c)} value={f.periode_fin} onChange={(e) => setF({ ...f, periode_fin: e.target.value })} />
                </div>
            </Champ>
            <Champ c={c} label="Ligne de rattachement de l’observation" aide="Sert à l’agrégation ; peut différer de la ligne de la personne observée.">
                <select style={styleInput(c)} value={f.ligne_id} onChange={(e) => setF({ ...f, ligne_id: e.target.value })}>
                    <option value="">— Aucune —</option>
                    {fiche.lignes.map((l) => <option key={l.id} value={l.id}>{l.libelle}</option>)}
                </select>
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!complet || envoi} onClick={async () => {
                    setEnvoi(true);
                    try {
                        await evaluationApi.creerRelation({
                            ...f,
                            periode_fin: f.periode_fin || null,
                            ligne_id: f.ligne_id || null
                        });
                        onCree();
                    } catch (e) { setErreur(e.message); }
                    setEnvoi(false);
                }}>Créer</Bouton>
            </div>
        </Modale>
    );
};

const ModaleCycle = ({ c, fiche, onFermer, onCree, setErreur }) => {
    const [f, setF] = useState({ libelle: '', date_debut: '', date_fin: '' });
    const [envoi, setEnvoi] = useState(false);
    const complet = f.libelle.trim() && f.date_debut && f.date_fin;
    return (
        <Modale c={c} titre="Créer un cycle trimestriel" sousTitre={fiche.entite.nom} onFermer={onFermer} largeur="520px">
            <Champ c={c} label="Libellé" obligatoire>
                <input style={styleInput(c)} value={f.libelle} onChange={(e) => setF({ ...f, libelle: e.target.value })} placeholder="T3 2026" />
            </Champ>
            <Champ c={c} label="Période" obligatoire>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <input type="date" style={styleInput(c)} value={f.date_debut} onChange={(e) => setF({ ...f, date_debut: e.target.value })} />
                    <input type="date" style={styleInput(c)} value={f.date_fin} onChange={(e) => setF({ ...f, date_fin: e.target.value })} />
                </div>
            </Champ>
            <Alerte c={c} ton="info">
                Le cycle s’ouvre en saisie. Les deux canaux saisissent sans visibilité croisée jusqu’à la clôture.
            </Alerte>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!complet || envoi} onClick={async () => {
                    setEnvoi(true);
                    try { await evaluationApi.creerCycle({ ...f, entite_id: fiche.entite.id }); onCree(); } catch (e) { setErreur(e.message); }
                    setEnvoi(false);
                }}>Créer le cycle</Bouton>
            </div>
        </Modale>
    );
};

const ModaleAssignation = ({ c, fiche, cycles, objets, onFermer, onFait, setErreur }) => {
    const ouverts = cycles.filter((x) => x.statut === 'ouvert');
    const [f, setF] = useState({ cycle_id: ouverts[0] ? String(ouverts[0].id) : '', personne_id: '', objet_ids: [] });
    const [envoi, setEnvoi] = useState(false);
    const [refus, setRefus] = useState(null);

    const basculer = (id) => {
        setRefus(null);
        setF((x) => {
            if (x.objet_ids.includes(id)) return { ...x, objet_ids: x.objet_ids.filter((y) => y !== id) };
            if (x.objet_ids.length >= PLAFOND_OBJETS) { setRefus(MSG_PLAFOND); return x; }
            return { ...x, objet_ids: [...x.objet_ids, id] };
        });
    };

    const complet = f.cycle_id && f.personne_id && f.objet_ids.length > 0;

    return (
        <Modale c={c} titre="Assigner des objets d’évaluation" sousTitre={fiche.entite.nom} onFermer={onFermer} largeur="600px">
            {refus && <Alerte c={c} ton="danger" onFermer={() => setRefus(null)}>{refus}</Alerte>}

            <Champ c={c} label="Cycle" obligatoire>
                <select style={styleInput(c)} value={f.cycle_id} onChange={(e) => setF({ ...f, cycle_id: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {ouverts.map((x) => <option key={x.id} value={x.id}>{x.libelle}</option>)}
                </select>
            </Champ>
            <Champ c={c} label="Personne" obligatoire>
                <select style={styleInput(c)} value={f.personne_id} onChange={(e) => setF({ ...f, personne_id: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {fiche.personnes.map((p) => <option key={p.id} value={p.id}>{p.nom} — {p.ligne_libelle}</option>)}
                </select>
            </Champ>
            <Champ c={c} label={`Objets (${f.objet_ids.length}/${PLAFOND_OBJETS})`} obligatoire aide={MSG_PLAFOND}>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                    {objets.map((o) => {
                        const actif = f.objet_ids.includes(o.id);
                        const bloque = !actif && f.objet_ids.length >= PLAFOND_OBJETS;
                        return (
                            <button key={o.id} onClick={() => basculer(o.id)} style={{
                                padding: '.5rem .9rem', borderRadius: '30px',
                                cursor: bloque ? 'not-allowed' : 'pointer',
                                border: `1px solid ${actif ? c.primary : c.gray300}`,
                                background: actif ? '#EEF2FF' : 'transparent',
                                color: actif ? c.primary : (bloque ? c.gray400 : c.gray600),
                                fontWeight: 600, fontSize: '.83rem'
                            }}>
                                {actif && <i className="bi bi-check2" style={{ marginRight: 5 }} />}{o.libelle}
                            </button>
                        );
                    })}
                </div>
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!complet || envoi} onClick={async () => {
                    setEnvoi(true); setRefus(null);
                    try {
                        await evaluationApi.assignerObjets(f.cycle_id, { personne_id: f.personne_id, objet_ids: f.objet_ids });
                        onFait();
                    } catch (e) {
                        if (e.code === 'MAX_OBJETS' || e.code === 'SEQUENCEMENT') setRefus(e.message);
                        else setErreur(e.message);
                    }
                    setEnvoi(false);
                }}>Assigner</Bouton>
            </div>
        </Modale>
    );
};

export default EvaluationAdmin;
