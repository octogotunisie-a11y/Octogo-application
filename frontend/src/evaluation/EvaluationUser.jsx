// frontend/src/evaluation/EvaluationUser.jsx
// -----------------------------------------------------------------------------
// Espace ÉVALUATION — vues collaborateur, observateur et restitution.
// Monté comme un onglet du DashboardClient existant.
//
// Contraintes d'interface portées par cet écran (section 08 de la fiche) :
//   · cotation OBJET PAR OBJET pour toute l'équipe, jamais personne par personne
//   · situation saisie AVANT sélection du niveau
//   · « Non observé » présenté au même rang que les quatre niveaux
//   · NCM visible sur tout indicateur, sans repli
//   · restitution accessible au moment de l'entretien, pas en permanence
//
// C2 : aucun niveau n'est suggéré, pré-rempli ni calculé côté client.
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { evaluationApi, NIVEAUX, LIBELLE_SIGNATURE, LIBELLE_STATUT_CYCLE } from './evaluationApi';
import {
    fusionner, Carte, Bouton, Badge, BadgeNCM, Champ, styleInput,
    Chargement, EtatVide, Alerte, FilAriane, OngletsInternes
} from './ui.jsx';

const EvaluationUser = ({ colors }) => {
    const c = fusionner(colors);

    const [contexte, setContexte] = useState(null);
    const [vue, setVue] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const ctx = await evaluationApi.contexte();
            setContexte(ctx);
            setVue((v) => v || (ctx.capacites.saisir_canal_b ? 'cockpit' : 'mon_cycle'));
        } catch (e) { setErreur(e.message); }
        setChargement(false);
    }, []);

    useEffect(() => { charger(); }, [charger]);

    if (chargement) return <Chargement c={c} texte="Chargement de votre espace…" />;
    if (erreur) return <Alerte c={c} ton="danger">{erreur}</Alerte>;
    if (!contexte) return null;

    const { acteur, cycle_courant: cycle, capacites } = contexte;

    if (!cycle) {
        return <EtatVide c={c} icone="bi-calendar3" titre="Aucun cycle ouvert"
            texte="Aucun cycle d’évaluation n’est actif pour votre entité." />;
    }
    if (!capacites.voir_mesure) {
        return <EtatVide c={c} icone="bi-shield-lock" titre="Accès administrateur"
            texte="Le rôle administrateur gère les comptes, les rôles et le référentiel. Il n’a aucun accès aux données de mesure." />;
    }

    const onglets = [];
    if (capacites.saisir_canal_b) onglets.push({ id: 'cockpit', label: 'Cotation', icone: 'bi-grid-3x3-gap' });
    if (capacites.saisir_canal_a) onglets.push({ id: 'mon_cycle', label: 'Mon exigence', icone: 'bi-person-badge' });
    onglets.push({ id: 'restitution', label: 'Restitution', icone: 'bi-clipboard-data' });
    if (capacites.saisir_canal_b) onglets.push({ id: 'fiabilite', label: 'Ma fiabilité', icone: 'bi-speedometer2' });

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0, color: c.gray900, fontSize: '1.3rem' }}>
                    <i className="bi bi-clipboard-check" style={{ color: c.primary, marginRight: '.6rem' }} />
                    Évaluation
                </h2>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '.45rem' }}>
                    <span style={{ color: c.gray500, fontSize: '.85rem' }}>{acteur.nom} · cycle {cycle.libelle}</span>
                    <Badge c={c} ton={cycle.statut === 'ouvert' ? 'succes' : cycle.statut === 'archive' ? 'neutre' : 'info'}>
                        {LIBELLE_STATUT_CYCLE[cycle.statut] || cycle.statut}
                    </Badge>
                </div>
            </div>

            <OngletsInternes c={c} actif={vue} onChange={setVue} onglets={onglets} />

            {vue === 'cockpit' && <Cockpit c={c} cycle={cycle} />}
            {vue === 'mon_cycle' && <MonExigence c={c} cycle={cycle} />}
            {vue === 'restitution' && <Restitution c={c} cycle={cycle} acteur={acteur} />}
            {vue === 'fiabilite' && <MaFiabilite c={c} />}
        </motion.div>
    );
};

// ============================================================================
// COCKPIT DE COTATION — objet par objet pour toute l'équipe.
// Le parcours personne par personne n'existe pas : c'est l'écran qui impose
// le correctif de l'effet de halo, pas une consigne.
// ============================================================================
const Cockpit = ({ c, cycle }) => {
    const [donnees, setDonnees] = useState(null);
    const [objetActif, setObjetActif] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async () => {
        setChargement(true);
        try {
            const r = await evaluationApi.cockpit(cycle.id);
            setDonnees(r);
            setObjetActif((o) => o ?? (r.objets[0] ? r.objets[0].objet_id : null));
        } catch (e) { setErreur(e.message); }
        setChargement(false);
    }, [cycle.id]);

    useEffect(() => { charger(); }, [charger]);

    if (chargement) return <Chargement c={c} />;
    if (erreur) return <Alerte c={c} ton="danger">{erreur}</Alerte>;
    if (!donnees || donnees.objets.length === 0) {
        return <EtatVide c={c} icone="bi-eye" titre="Aucune cotation à réaliser"
            texte="Vous n’êtes observateur d’aucune personne sur ce cycle." />;
    }

    const objet = donnees.objets.find((o) => o.objet_id === objetActif) || donnees.objets[0];

    return (
        <>
            {!donnees.saisie_ouverte && (
                <Alerte c={c} ton="info">
                    Le cycle n’est plus ouvert : la saisie est close et les cotations ne peuvent plus être modifiées.
                </Alerte>
            )}

            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem'
            }}>
                <div style={{ fontSize: '.85rem', color: c.gray600 }}>
                    Progression : <strong style={{ color: c.gray900 }}>{donnees.faits}/{donnees.total}</strong> cotation(s)
                </div>
                <div style={{ fontSize: '.78rem', color: c.gray500 }}>
                    <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
                    Un objet, toute l’équipe — puis l’objet suivant.
                </div>
            </div>

            {/* Sélecteur d'objet : le premier niveau de navigation est l'objet. */}
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {donnees.objets.map((o) => {
                    const faits = o.personnes.filter((p) => p.complete).length;
                    const actif = o.objet_id === objet.objet_id;
                    const termine = faits === o.personnes.length;
                    return (
                        <button
                            key={o.objet_id}
                            onClick={() => setObjetActif(o.objet_id)}
                            style={{
                                padding: '.6rem 1rem', borderRadius: '14px', cursor: 'pointer',
                                border: `1px solid ${actif ? c.primary : c.gray200}`,
                                background: actif ? '#EEF2FF' : (termine ? '#ECFDF5' : 'transparent'),
                                color: actif ? c.primary : (termine ? c.success : c.gray600),
                                fontWeight: 600, fontSize: '.86rem', textAlign: 'left'
                            }}
                        >
                            {termine && <i className="bi bi-check2 me-1" style={{ marginRight: 5 }} />}
                            {o.objet_libelle}
                            <div style={{ fontSize: '.72rem', fontWeight: 500, opacity: .8 }}>{faits}/{o.personnes.length}</div>
                        </button>
                    );
                })}
            </div>

            <div style={{ marginBottom: '1rem', color: c.gray900, fontWeight: 700, fontSize: '1.05rem' }}>
                {objet.objet_libelle}
                <span style={{ marginLeft: '.6rem' }}>
                    <Badge c={c} ton="primaire">{objet.personnes.length} personne(s)</Badge>
                </span>
            </div>

            {objet.personnes.map((p) => (
                <FicheCotation
                    key={`${objet.objet_id}-${p.observe_id}`}
                    c={c}
                    cycle={cycle}
                    objet={objet}
                    personne={p}
                    saisieOuverte={donnees.saisie_ouverte}
                    onEnregistre={charger}
                />
            ))}
        </>
    );
};

// --- Une ligne de cotation : situation → date → niveau ----------------------
const FicheCotation = ({ c, cycle, objet, personne, saisieOuverte, onEnregistre }) => {
    const [ouvert, setOuvert] = useState(false);
    const [situation, setSituation] = useState(personne.situation_texte || '');
    const [date, setDate] = useState(personne.situation_date || '');
    const [niveau, setNiveau] = useState(personne.non_observe ? 'non_observe' : personne.niveau);
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [descripteurs, setDescripteurs] = useState(null);

    // Situation + date obligatoires avant de pouvoir sélectionner un niveau.
    const prerequis = situation.trim().length > 0 && !!date;

    const voirDescripteurs = async () => {
        if (descripteurs) { setDescripteurs(null); return; }
        try { const r = await evaluationApi.descripteurs(objet.objet_id); setDescripteurs(r.descripteurs); }
        catch (e) { setErreur(e.message); }
    };

    const enregistrer = async () => {
        setEnvoi(true); setErreur(null);
        try {
            await evaluationApi.coter(cycle.id, {
                observe_id: personne.observe_id,
                objet_id: objet.objet_id,
                situation_texte: situation.trim(),
                situation_date: date,
                niveau: niveau === 'non_observe' ? null : niveau,
                non_observe: niveau === 'non_observe'
            });
            setOuvert(false);
            onEnregistre();
        } catch (e) { setErreur(e.message); }
        setEnvoi(false);
    };

    const libelleActuel = personne.non_observe
        ? 'Non observé'
        : (personne.niveau != null ? `Niveau ${personne.niveau}` : null);

    return (
        <Carte c={c} style={{ marginBottom: '.75rem', padding: '1rem' }}>
            <div
                onClick={() => saisieOuverte && setOuvert(!ouvert)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', cursor: saisieOuverte ? 'pointer' : 'default' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', minWidth: 0 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: c.primaryGradient, color: c.white,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                    }}>{personne.observe_nom.slice(0, 1).toUpperCase()}</div>
                    <div>
                        <div style={{ fontWeight: 600, color: c.gray900 }}>{personne.observe_nom}</div>
                        <div style={{ fontSize: '.75rem', color: c.gray500 }}>
                            Contexte d’observation : {personne.contexte || '—'}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    {libelleActuel
                        ? <Badge c={c} ton={personne.non_observe ? 'neutre' : 'succes'}>{libelleActuel}</Badge>
                        : <Badge c={c} ton="attente">À coter</Badge>}
                    {saisieOuverte && <i className={`bi bi-chevron-${ouvert ? 'up' : 'down'}`} style={{ color: c.gray400 }} />}
                </div>
            </div>

            {ouvert && saisieOuverte && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${c.gray100}` }}>
                    {erreur && <Alerte c={c} ton="danger" onFermer={() => setErreur(null)}>{erreur}</Alerte>}

                    <div style={{ marginBottom: '.75rem' }}>
                        <button onClick={voirDescripteurs} style={{
                            background: 'none', border: 'none', color: c.primary, cursor: 'pointer',
                            padding: 0, fontSize: '.8rem', fontWeight: 600
                        }}>
                            <i className="bi bi-book" style={{ marginRight: 5 }} />
                            {descripteurs ? 'Masquer les descripteurs' : 'Rappeler les descripteurs de niveau'}
                        </button>
                    </div>

                    {descripteurs && (
                        <div style={{ background: c.gray50, borderRadius: '12px', padding: '.85rem', marginBottom: '1rem', fontSize: '.8rem' }}>
                            {descripteurs.map((x) => (
                                <div key={x.niveau} style={{ marginBottom: '.6rem' }}>
                                    <strong style={{ color: c.gray900 }}>Niveau {x.niveau}</strong>
                                    <div style={{ color: c.gray600 }}>{x.question_tri}</div>
                                    {x.manifestations && <div style={{ color: c.gray500 }}>Fonde : {x.manifestations.join(' · ')}</div>}
                                    {x.exclusions && <div style={{ color: c.gray500 }}>Ne fonde pas : {x.exclusions.join(' · ')}</div>}
                                </div>
                            ))}
                            <div style={{ color: c.gray500, fontStyle: 'italic' }}>
                                Rappel documentaire. Aucun niveau n’est suggéré.
                            </div>
                        </div>
                    )}

                    <Champ c={c} label="Situation observée" obligatoire>
                        <textarea
                            style={{ ...styleInput(c), minHeight: 110, resize: 'vertical' }}
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder="Décrire une situation précise, datée, observée directement…"
                        />
                    </Champ>

                    <Champ c={c} label="Date d’observation" obligatoire
                        aide={`La date doit tomber dans la période du cycle (${cycle.date_debut} → ${cycle.date_fin}).`}>
                        <input type="date" style={styleInput(c)} value={date || ''}
                            min={cycle.date_debut} max={cycle.date_fin}
                            onChange={(e) => setDate(e.target.value)} />
                    </Champ>

                    <Champ c={c} label="Niveau" obligatoire
                        aide={prerequis
                            ? 'Vous attribuez ce niveau. Aucune suggestion automatique n’est produite.'
                            : 'Renseignez la situation observée et sa date pour pouvoir attribuer un niveau.'}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '.5rem' }}>
                            {NIVEAUX.map((n) => {
                                const actif = niveau === n.valeur;
                                return (
                                    <button
                                        key={String(n.valeur)}
                                        disabled={!prerequis}
                                        onClick={() => setNiveau(n.valeur)}
                                        style={{
                                            padding: '.7rem .5rem', borderRadius: '14px', minHeight: 56,
                                            cursor: prerequis ? 'pointer' : 'not-allowed',
                                            opacity: prerequis ? 1 : .45,
                                            border: `1px solid ${actif ? c.primary : c.gray300}`,
                                            background: actif ? '#EEF2FF' : 'transparent',
                                            color: actif ? c.primary : c.gray600,
                                            fontWeight: 600, fontSize: '.85rem'
                                        }}
                                    >
                                        {n.label}
                                        <div style={{ fontSize: '.68rem', fontWeight: 500, opacity: .75 }}>{n.tag}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </Champ>

                    <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end' }}>
                        <Bouton c={c} variante="secondaire" onClick={() => setOuvert(false)}>Fermer</Bouton>
                        <Bouton c={c} onClick={enregistrer} disabled={!prerequis || niveau == null || envoi} icone="bi-check2">
                            {envoi ? 'Enregistrement…' : 'Enregistrer'}
                        </Bouton>
                    </div>
                </div>
            )}
        </Carte>
    );
};

// ============================================================================
// CANAL A — exigence perçue par le répondant.
// Aucun élément du canal B n'est affiché ici tant que le cycle est ouvert.
// ============================================================================
const MonExigence = ({ c, cycle }) => {
    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [succes, setSucces] = useState(null);

    const charger = useCallback(async () => {
        setChargement(true);
        try { setDonnees(await evaluationApi.canalA(cycle.id)); }
        catch (e) { setErreur(e.message); }
        setChargement(false);
    }, [cycle.id]);

    useEffect(() => { charger(); }, [charger]);

    const declarer = async (objetId, niveau) => {
        setErreur(null);
        try {
            await evaluationApi.declarerExigence(cycle.id, objetId, { niveau_exigence: niveau });
            setSucces('Exigence enregistrée.');
            setTimeout(() => setSucces(null), 2500);
            charger();
        } catch (e) { setErreur(e.message); }
    };

    if (chargement) return <Chargement c={c} />;
    if (!donnees || donnees.objets.length === 0) {
        return <EtatVide c={c} icone="bi-person-badge" titre="Aucun objet assigné"
            texte="Aucun objet d’évaluation ne vous est assigné sur ce cycle." />;
    }

    return (
        <>
            <Alerte c={c} ton="info">
                Vous indiquez ici le niveau d’exigence que <strong>vous</strong> percevez comme attendu à votre poste.
                La cotation de votre observateur ne vous sera pas visible avant la clôture du cycle, et la vôtre ne lui est pas visible.
            </Alerte>
            {erreur && <Alerte c={c} ton="danger" onFermer={() => setErreur(null)}>{erreur}</Alerte>}
            {succes && <Alerte c={c} ton="succes">{succes}</Alerte>}

            {donnees.objets.map((o) => (
                <Carte c={c} key={o.objet_id} style={{ marginBottom: '.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.85rem' }}>
                        <strong style={{ color: c.gray900 }}>{o.objet_libelle}</strong>
                        {o.niveau_exigence
                            ? <Badge c={c} ton="succes">Déclaré — niveau {o.niveau_exigence}</Badge>
                            : <Badge c={c} ton="attente">À déclarer</Badge>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '.5rem' }}>
                        {[1, 2, 3, 4].map((n) => {
                            const actif = o.niveau_exigence === n;
                            return (
                                <button key={n} disabled={!donnees.saisie_ouverte} onClick={() => declarer(o.objet_id, n)}
                                    style={{
                                        padding: '.65rem .5rem', borderRadius: '14px',
                                        cursor: donnees.saisie_ouverte ? 'pointer' : 'not-allowed',
                                        opacity: donnees.saisie_ouverte ? 1 : .5,
                                        border: `1px solid ${actif ? c.primary : c.gray300}`,
                                        background: actif ? '#EEF2FF' : 'transparent',
                                        color: actif ? c.primary : c.gray600, fontWeight: 600, fontSize: '.85rem'
                                    }}>
                                    Niveau {n}
                                </button>
                            );
                        })}
                    </div>
                </Carte>
            ))}
        </>
    );
};

// ============================================================================
// RESTITUTION — écarts listés, jamais moyennés, chacun avec son NCM.
// ============================================================================
const Restitution = ({ c, cycle, acteur }) => {
    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        (async () => {
            setChargement(true);
            try { setDonnees(await evaluationApi.restitution(cycle.id, acteur.id)); }
            catch (e) { setErreur(e.message); setDonnees(null); }
            setChargement(false);
        })();
    }, [cycle.id, acteur.id]);

    if (chargement) return <Chargement c={c} />;
    if (erreur) {
        return <EtatVide c={c} icone="bi-clock-history" titre="Restitution non disponible" texte={erreur} />;
    }
    if (!donnees) return null;

    const signe = { nul: 'Aligné', negatif: 'Exigence inférieure au niveau observé', positif: 'Exigence supérieure au niveau observé', indeterminable: 'Indéterminable' };

    return (
        <>
            {donnees.mention && <Alerte c={c} ton="info">{donnees.mention}</Alerte>}

            {donnees.ecarts.map((e) => (
                <Carte c={c} key={e.objet_id} style={{ marginBottom: '.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.75rem', flexWrap: 'wrap' }}>
                        <div>
                            <strong style={{ color: c.gray900 }}>{e.objet_libelle}</strong>
                            <div style={{ fontSize: '.8rem', color: c.gray500, marginTop: '.2rem' }}>
                                {e.non_observe
                                    ? 'Non observé — objet retiré du calcul de ce cycle.'
                                    : `Observé : niveau ${e.niveau_observe ?? '—'} · Exigence déclarée : niveau ${e.niveau_exigence ?? '—'}`}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Badge c={c} ton={e.signe === 'nul' ? 'succes' : e.signe === 'indeterminable' ? 'neutre' : 'attente'}>
                                {e.ecart == null ? signe[e.signe] : `Écart ${e.ecart > 0 ? '+' : ''}${e.ecart}`}
                            </Badge>
                            <div style={{ marginTop: '.4rem' }}><BadgeNCM c={c} ncm={e.ncm && e.ncm.ecart} /></div>
                        </div>
                    </div>

                    {e.condition_signalee && (
                        <div style={{ marginTop: '.6rem', fontSize: '.78rem', color: c.warning }}>
                            <i className="bi bi-exclamation-triangle" style={{ marginRight: 5 }} />
                            Lecture non concluante : les conditions d’exercice sont signalées basses.
                        </div>
                    )}

                    {e.situation_texte && (
                        <div style={{ marginTop: '.75rem', background: c.gray50, borderRadius: '10px', padding: '.7rem', fontSize: '.82rem', color: c.gray700 }}>
                            <div style={{ fontSize: '.72rem', color: c.gray500, marginBottom: '.25rem' }}>
                                Situation observée le {e.situation_date} par {e.observateur_nom}
                            </div>
                            {e.situation_texte}
                        </div>
                    )}
                </Carte>
            ))}

            {donnees.signatures.length > 0 && (
                <>
                    <div style={{ margin: '1.5rem 0 .75rem', fontWeight: 700, color: c.gray900 }}>Signatures</div>
                    {donnees.signatures.map((s) => (
                        <Carte c={c} key={`${s.objet_id}-${s.type}`} style={{ marginBottom: '.6rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                                <div>
                                    <strong style={{ color: c.gray900 }}>{LIBELLE_SIGNATURE[s.type] || s.type}</strong>
                                    <div style={{ fontSize: '.8rem', color: c.gray500 }}>
                                        {s.objet_libelle} · {s.cycles_consecutifs} cycles consécutifs
                                    </div>
                                </div>
                                <BadgeNCM c={c} ncm={s.ncm} />
                            </div>
                        </Carte>
                    ))}
                </>
            )}
        </>
    );
};

// ============================================================================
// INDICE DE FIABILITÉ — restitué à l'observateur seul.
// ============================================================================
const MaFiabilite = ({ c }) => {
    const [donnees, setDonnees] = useState(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        (async () => {
            try { setDonnees(await evaluationApi.maFiabilite()); } catch (e) { /* silencieux */ }
            setChargement(false);
        })();
    }, []);

    if (chargement) return <Chargement c={c} />;
    if (!donnees || donnees.indices.length === 0) {
        return <EtatVide c={c} icone="bi-speedometer2" titre="Aucun indice disponible"
            texte="Votre indice de fiabilité sera calculé à la clôture du premier cycle que vous aurez coté." />;
    }

    const drapeaux = { completude_faible: 'Complétude faible', severite: 'Tendance à la sévérité', indulgence: 'Tendance à l’indulgence', tendance_centrale: 'Tendance centrale' };

    return (
        <>
            <Alerte c={c} ton="info">{donnees.mention}</Alerte>
            {donnees.indices.map((i) => (
                <Carte c={c} key={i.id} style={{ marginBottom: '.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.85rem' }}>
                        <strong style={{ color: c.gray900 }}>Cycle {i.cycle_libelle}</strong>
                        <BadgeNCM c={c} ncm={i.ncm} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '.75rem', fontSize: '.85rem' }}>
                        <div>
                            <div style={{ color: c.gray500, fontSize: '.78rem' }}>Complétude</div>
                            <strong style={{ color: c.gray900 }}>{Math.round(i.taux_completude * 100)} %</strong>
                        </div>
                        <div>
                            <div style={{ color: c.gray500, fontSize: '.78rem' }}>Écart aux autres observateurs</div>
                            <strong style={{ color: c.gray900 }}>{i.derive_severite == null ? '—' : (i.derive_severite > 0 ? '+' : '') + i.derive_severite}</strong>
                        </div>
                    </div>
                    {i.drapeaux.length > 0 && (
                        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: '.85rem' }}>
                            {i.drapeaux.map((f) => <Badge c={c} key={f} ton="attente">{drapeaux[f] || f}</Badge>)}
                        </div>
                    )}
                </Carte>
            ))}
        </>
    );
};

export default EvaluationUser;
