// frontend/src/evaluation/EvaluationDemoAdmin.jsx
// -----------------------------------------------------------------------------
// CONFIGURATION ADMINISTRATEUR — mode démonstration.
//
// L'administrateur configure ici, société par société :
//   Sociétés · Cycles · Objets · Questions Canal A · Descripteurs Canal B
//   Collaborateurs · Observateurs · Publication
//
// Aucune question n'est écrite en dur dans ce composant : tout provient de
// l'objet de configuration et y retourne. Le remplacement par les formulations
// officielles du manuel se fera sans toucher à cette interface.
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import {
    Carte, Bouton, Badge, Champ, styleInput, Modale,
    EtatVide, Alerte, FilAriane, OngletsInternes
} from './ui.jsx';
import {
    TYPES_REPONSE, prochainId,
    cyclesDeSociete, objetsDeSociete, objetsDuCycle,
    personnesDeSociete, questionsDeObjet, descripteursDeObjet
} from './evaluationMock';

const Pastille = ({ c, ton, children }) => {
    const tons = {
        attente: { p: '#F59E0B', bg: '#FFFBEB', fg: '#92400E' },
        soumis: { p: '#F97316', bg: '#FFF7ED', fg: '#9A3412' },
        termine: { p: '#10B981', bg: '#ECFDF5', fg: '#065F46' }
    };
    const t = tons[ton] || tons.attente;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            background: t.bg, color: t.fg, padding: '4px 11px', borderRadius: '30px',
            fontSize: '.76rem', fontWeight: 600, whiteSpace: 'nowrap'
        }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.p, flexShrink: 0 }} />
            {children}
        </span>
    );
};

const EvaluationDemoAdmin = ({ c, cfg, majConfig, saisies, statuts }) => {
    const [societeId, setSocieteId] = useState(null);
    const [vue, setVue] = useState('cycle');
    const [modale, setModale] = useState(null);
    const [edition, setEdition] = useState(null);
    const [message, setMessage] = useState(null);

    const notifier = (m) => { setMessage(m); setTimeout(() => setMessage(null), 3000); };

    // --------------------------------------------------------- Liste sociétés
    if (!societeId) {
        return (
            <>
                {message && <Alerte c={c} ton="succes">{message}</Alerte>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, color: c.gray900 }}>Sociétés</div>
                    <Bouton c={c} icone="bi-plus-lg" onClick={() => setModale('societe')}>Ajouter une société</Bouton>
                </div>

                <Alerte c={c} ton="info">
                    Chaque société possède sa propre configuration : ses objets, ses questions et ses
                    descripteurs. La configuration d’une société n’apparaît jamais dans une autre.
                </Alerte>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {cfg.societes.map((s) => {
                        const cycles = cyclesDeSociete(cfg, s.id);
                        const nbQuestions = cfg.questions_a.filter((q) => q.societe_id === s.id).length;
                        return (
                            <Carte c={c} key={s.id} onClick={() => { setSocieteId(s.id); setVue('cycle'); }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', marginBottom: '.9rem' }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '12px', background: c.primaryGradient,
                                        color: c.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                                    }}>{s.nom.replace('Société ', '').slice(0, 2).toUpperCase()}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: c.gray900 }}>{s.nom}</div>
                                        <div style={{ fontSize: '.78rem', color: c.gray500 }}>{s.secteur}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                                    <Badge c={c} ton="primaire">{objetsDeSociete(cfg, s.id).length} objets</Badge>
                                    <Badge c={c} ton="info">{nbQuestions} questions</Badge>
                                    <Badge c={c}>{cycles.length} cycle(s)</Badge>
                                </div>
                            </Carte>
                        );
                    })}
                </div>

                {modale === 'societe' && (
                    <ModaleSociete c={c} onFermer={() => setModale(null)} onValider={(nom, secteur) => {
                        majConfig((d) => {
                            d.societes.push({ id: prochainId(d, 'societe'), nom, secteur });
                        });
                        setModale(null);
                        notifier('Société créée.');
                    }} />
                )}
            </>
        );
    }

    // ------------------------------------------------------- Fiche d'une société
    const societe = cfg.societes.find((s) => s.id === societeId);
    const cycles = cyclesDeSociete(cfg, societeId);
    const cycle = cycles[0] || null;
    const objets = objetsDeSociete(cfg, societeId);
    const objetsCycle = objetsDuCycle(cfg, cycle);
    const collaborateurs = personnesDeSociete(cfg, societeId, 'collaborateur');
    const observateurs = personnesDeSociete(cfg, societeId, 'observateur');

    const publier = () => {
        majConfig((d) => {
            const cy = d.cycles.find((x) => x.id === cycle.id);
            if (cy) cy.statut = 'publie';
        });
        notifier('Cycle publié. Les collaborateurs voient désormais leurs questions.');
    };

    const clore = () => {
        majConfig((d) => {
            const cy = d.cycles.find((x) => x.id === cycle.id);
            if (cy) cy.statut = 'cloture';
        });
        notifier('Cycle clôturé. Les résultats sont consultables.');
    };

    return (
        <>
            <FilAriane c={c} elements={[
                { label: 'Sociétés', onClick: () => setSocieteId(null) },
                { label: societe.nom }
            ]} />

            {message && <Alerte c={c} ton="succes">{message}</Alerte>}

            <OngletsInternes c={c} actif={vue} onChange={setVue} onglets={[
                { id: 'cycle', label: 'Cycle et périmètre', icone: 'bi-calendar3' },
                { id: 'objets', label: 'Objets', icone: 'bi-bookmark' },
                { id: 'canal_a', label: 'Questions Canal A', icone: 'bi-ui-checks' },
                { id: 'canal_b', label: 'Descripteurs Canal B', icone: 'bi-eye' },
                { id: 'suivi', label: 'Suivi', icone: 'bi-activity' }
            ]} />

            {!cycle && (
                <EtatVide c={c} icone="bi-calendar3" titre="Aucun cycle"
                    texte="Créez un cycle pour cette société avant de configurer les canaux."
                    action={<Bouton c={c} icone="bi-plus-lg" onClick={() => setModale('cycle')}>Créer un cycle</Bouton>} />
            )}

            {/* ============================================ CYCLE ET PÉRIMÈTRE */}
            {cycle && vue === 'cycle' && (
                <>
                    <Carte c={c} style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ fontWeight: 700, color: c.gray900, fontSize: '1.05rem' }}>{cycle.libelle}</div>
                                <div style={{ fontSize: '.83rem', color: c.gray500 }}>{cycle.debut} → {cycle.fin}</div>
                            </div>
                            <Pastille c={c} ton={cycle.statut === 'cloture' ? 'termine' : cycle.statut === 'publie' ? 'soumis' : 'attente'}>
                                {cycle.statut === 'cloture' ? 'Cycle clôturé' : cycle.statut === 'publie' ? 'Publié' : 'Brouillon'}
                            </Pastille>
                        </div>
                    </Carte>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                        <Carte c={c}>
                            <div style={{ fontWeight: 600, color: c.gray900, marginBottom: '.6rem' }}>Collaborateurs associés</div>
                            {collaborateurs.map((p) => (
                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.35rem 0', fontSize: '.86rem', color: c.gray700, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={cycle.collaborateur_ids.includes(p.id)}
                                        onChange={() => majConfig((d) => {
                                            const cy = d.cycles.find((x) => x.id === cycle.id);
                                            cy.collaborateur_ids = cy.collaborateur_ids.includes(p.id)
                                                ? cy.collaborateur_ids.filter((x) => x !== p.id)
                                                : [...cy.collaborateur_ids, p.id];
                                        })} />
                                    {p.nom}
                                </label>
                            ))}
                        </Carte>

                        <Carte c={c}>
                            <div style={{ fontWeight: 600, color: c.gray900, marginBottom: '.6rem' }}>Observateurs associés</div>
                            {observateurs.map((p) => (
                                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.35rem 0', fontSize: '.86rem', color: c.gray700, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={cycle.observateur_ids.includes(p.id)}
                                        onChange={() => majConfig((d) => {
                                            const cy = d.cycles.find((x) => x.id === cycle.id);
                                            cy.observateur_ids = cy.observateur_ids.includes(p.id)
                                                ? cy.observateur_ids.filter((x) => x !== p.id)
                                                : [...cy.observateur_ids, p.id];
                                        })} />
                                    {p.nom}
                                </label>
                            ))}
                        </Carte>
                    </div>

                    <Carte c={c}>
                        <div style={{ fontWeight: 600, color: c.gray900, marginBottom: '.6rem' }}>Objets retenus pour ce cycle</div>
                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                            {objets.map((o) => {
                                const actif = cycle.objet_ids.includes(o.id);
                                return (
                                    <button key={o.id} onClick={() => majConfig((d) => {
                                        const cy = d.cycles.find((x) => x.id === cycle.id);
                                        cy.objet_ids = actif ? cy.objet_ids.filter((x) => x !== o.id) : [...cy.objet_ids, o.id];
                                    })} style={{
                                        padding: '.5rem .9rem', borderRadius: '30px', cursor: 'pointer',
                                        border: `1px solid ${actif ? c.primary : c.gray300}`,
                                        background: actif ? '#EEF2FF' : 'transparent',
                                        color: actif ? c.primary : c.gray600, fontWeight: 600, fontSize: '.83rem'
                                    }}>
                                        {actif && <i className="bi bi-check2" style={{ marginRight: 5 }} />}{o.libelle}
                                    </button>
                                );
                            })}
                        </div>
                    </Carte>

                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                        {cycle.statut === 'brouillon' && (
                            <Bouton c={c} icone="bi-send" onClick={publier}>Publier le cycle</Bouton>
                        )}
                        {cycle.statut === 'publie' && (
                            <Bouton c={c} icone="bi-lock" disabled={!statuts.clotureAutorisee(cycle.id)} onClick={clore}>
                                Clôturer le cycle
                            </Bouton>
                        )}
                    </div>

                    {cycle.statut === 'brouillon' && (
                        <div style={{ fontSize: '.79rem', color: c.gray500, marginTop: '.6rem' }}>
                            Tant que le cycle est en brouillon, aucun collaborateur ne voit ses questions.
                        </div>
                    )}
                    {cycle.statut === 'publie' && !statuts.clotureAutorisee(cycle.id) && (
                        <div style={{ fontSize: '.79rem', color: c.gray500, marginTop: '.6rem' }}>
                            <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
                            La clôture exige que les deux canaux soient soumis. Voir l’onglet Suivi.
                        </div>
                    )}
                </>
            )}

            {/* ======================================================== OBJETS */}
            {cycle && vue === 'objets' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <Bouton c={c} icone="bi-plus-lg" onClick={() => setModale('objet')}>Ajouter un objet</Bouton>
                    </div>
                    {objets.map((o) => (
                        <Carte c={c} key={o.id} style={{ marginBottom: '.6rem', padding: '.9rem 1.1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: c.gray900 }}>{o.libelle}</div>
                                    <div style={{ fontSize: '.78rem', color: c.gray500 }}>
                                        {questionsDeObjet(cfg, cycle.id, o.id, true).length} question(s) ·
                                        {' '}{descripteursDeObjet(cfg, cycle.id, o.id).length} descripteur(s)
                                    </div>
                                </div>
                                {cycle.objet_ids.includes(o.id)
                                    ? <Badge c={c} ton="succes">Dans le cycle</Badge>
                                    : <Badge c={c}>Hors cycle</Badge>}
                            </div>
                        </Carte>
                    ))}
                </>
            )}

            {/* =============================================== QUESTIONS CANAL A */}
            {cycle && vue === 'canal_a' && (
                <>
                    <Alerte c={c} ton="info">
                        Questions posées au collaborateur. L’observateur ne les rédige pas et ne les voit pas.
                        Modifiez-les ici : aucune n’est écrite dans le code de l’interface.
                    </Alerte>

                    {objetsCycle.length === 0
                        ? <EtatVide c={c} icone="bi-bookmark" titre="Aucun objet dans ce cycle"
                            texte="Sélectionnez d’abord des objets dans l’onglet Cycle et périmètre." />
                        : objetsCycle.map((o) => {
                            const questions = questionsDeObjet(cfg, cycle.id, o.id, true);
                            return (
                                <Carte c={c} key={o.id} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap', marginBottom: '.85rem' }}>
                                        <strong style={{ color: c.gray900 }}>{o.libelle}</strong>
                                        <Bouton c={c} variante="secondaire" icone="bi-plus-lg"
                                            onClick={() => { setEdition({ objet_id: o.id }); setModale('question'); }}>
                                            Ajouter une question
                                        </Bouton>
                                    </div>

                                    {questions.length === 0 && (
                                        <div style={{ color: c.gray400, fontSize: '.85rem' }}>Aucune question configurée.</div>
                                    )}

                                    {questions.map((q, i) => (
                                        <div key={q.id} style={{
                                            borderTop: `1px solid ${c.gray100}`, padding: '.75rem 0',
                                            display: 'flex', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap'
                                        }}>
                                            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                                                <div style={{ fontSize: '.87rem', color: q.actif ? c.gray800 : c.gray400, lineHeight: 1.45 }}>
                                                    <span style={{ color: c.primary, fontWeight: 700, marginRight: '.4rem' }}>{q.ordre}.</span>
                                                    {q.texte}
                                                </div>
                                                <div style={{ display: 'flex', gap: '.35rem', marginTop: '.4rem', flexWrap: 'wrap' }}>
                                                    <Badge c={c} ton="info">{TYPES_REPONSE[q.type].libelle}</Badge>
                                                    {!q.actif && <Badge c={c}>Désactivée</Badge>}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '.3rem', alignItems: 'flex-start' }}>
                                                <BoutonIcone c={c} icone="bi-arrow-up" disabled={i === 0}
                                                    onClick={() => majConfig((d) => permuter(d.questions_a, q.id, -1, cycle.id, o.id))} />
                                                <BoutonIcone c={c} icone="bi-arrow-down" disabled={i === questions.length - 1}
                                                    onClick={() => majConfig((d) => permuter(d.questions_a, q.id, 1, cycle.id, o.id))} />
                                                <BoutonIcone c={c} icone={q.actif ? 'bi-toggle-on' : 'bi-toggle-off'}
                                                    onClick={() => majConfig((d) => {
                                                        const x = d.questions_a.find((y) => y.id === q.id); x.actif = !x.actif;
                                                    })} />
                                                <BoutonIcone c={c} icone="bi-pencil"
                                                    onClick={() => { setEdition(q); setModale('question'); }} />
                                                <BoutonIcone c={c} icone="bi-trash" danger
                                                    onClick={() => majConfig((d) => {
                                                        d.questions_a = d.questions_a.filter((y) => y.id !== q.id);
                                                    })} />
                                            </div>
                                        </div>
                                    ))}
                                </Carte>
                            );
                        })}
                </>
            )}

            {/* ============================================ DESCRIPTEURS CANAL B */}
            {cycle && vue === 'canal_b' && (
                <>
                    <Alerte c={c} ton="info">
                        Le canal B n’est pas un second questionnaire. Ce sont les repères qui fondent la
                        cotation de l’observateur : quatre descripteurs par objet. Le collaborateur ne les voit pas.
                    </Alerte>

                    {objetsCycle.map((o) => {
                        const descripteurs = descripteursDeObjet(cfg, cycle.id, o.id);
                        return (
                            <Carte c={c} key={o.id} style={{ marginBottom: '1rem' }}>
                                <strong style={{ color: c.gray900, display: 'block', marginBottom: '.85rem' }}>{o.libelle}</strong>
                                {[1, 2, 3, 4].map((niveau) => {
                                    const d = descripteurs.find((x) => x.niveau === niveau);
                                    return (
                                        <div key={niveau} style={{ borderTop: `1px solid ${c.gray100}`, padding: '.7rem 0' }}>
                                            <div style={{ fontSize: '.75rem', color: c.gray500, marginBottom: '.35rem', fontWeight: 600 }}>
                                                Descripteur niveau {niveau}
                                            </div>
                                            <textarea
                                                style={{ ...styleInput(c), minHeight: 58, resize: 'vertical', fontSize: '.85rem' }}
                                                value={d ? d.texte : ''}
                                                placeholder="À configurer…"
                                                onChange={(e) => majConfig((cfgD) => {
                                                    const existant = cfgD.descripteurs_b.find(
                                                        (x) => x.cycle_id === cycle.id && x.objet_id === o.id && x.niveau === niveau);
                                                    if (existant) existant.texte = e.target.value;
                                                    else cfgD.descripteurs_b.push({
                                                        id: prochainId(cfgD, 'descripteur_b'),
                                                        societe_id: societeId, cycle_id: cycle.id,
                                                        objet_id: o.id, niveau, texte: e.target.value
                                                    });
                                                })}
                                            />
                                        </div>
                                    );
                                })}
                                <div style={{ fontSize: '.75rem', color: c.gray500, marginTop: '.6rem' }}>
                                    <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
                                    « Non observé » n’a pas de descripteur : c’est l’absence d’occasion d’observer,
                                    pas un niveau bas.
                                </div>
                            </Carte>
                        );
                    })}
                </>
            )}

            {/* ========================================================= SUIVI */}
            {cycle && vue === 'suivi' && (
                <>
                    <div style={{ fontWeight: 700, color: c.gray900, marginBottom: '.7rem' }}>Canal A — déclarations</div>
                    {cycle.collaborateur_ids.map((pid) => {
                        const p = cfg.personnes.find((x) => x.id === pid);
                        const st = statuts.collaborateur(cycle.id, pid);
                        return (
                            <Carte c={c} key={pid} style={{ marginBottom: '.6rem', padding: '.9rem 1.1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: c.gray900 }}>{p ? p.nom : '—'}</div>
                                        <div style={{ fontSize: '.78rem', color: c.gray500 }}>
                                            {statuts.objetsRepondus(cycle, pid)} / {objetsCycle.length} objets renseignés
                                        </div>
                                    </div>
                                    <Pastille c={c} ton={st.ton}>{st.texte}</Pastille>
                                </div>
                            </Carte>
                        );
                    })}

                    <div style={{ fontWeight: 700, color: c.gray900, margin: '1.5rem 0 .7rem' }}>Canal B — cotations</div>
                    {cycle.observateur_ids.map((oid) => {
                        const p = cfg.personnes.find((x) => x.id === oid);
                        const st = statuts.observateur(cycle.id, oid);
                        return (
                            <Carte c={c} key={oid} style={{ marginBottom: '.6rem', padding: '.9rem 1.1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: c.gray900 }}>{p ? p.nom : '—'}</div>
                                        <div style={{ fontSize: '.78rem', color: c.gray500 }}>
                                            {statuts.cotationsFaites(cycle)} / {objetsCycle.length * cycle.collaborateur_ids.length} cotations
                                        </div>
                                    </div>
                                    <Pastille c={c} ton={st.ton}>{st.texte}</Pastille>
                                </div>
                            </Carte>
                        );
                    })}
                </>
            )}

            {/* ======================================================= MODALES */}
            {modale === 'objet' && (
                <ModaleTexte c={c} titre="Ajouter un objet d’évaluation" label="Libellé"
                    onFermer={() => setModale(null)}
                    onValider={(libelle) => {
                        majConfig((d) => { d.objets.push({ id: prochainId(d, 'objet'), societe_id: societeId, libelle }); });
                        setModale(null); notifier('Objet ajouté.');
                    }} />
            )}

            {modale === 'cycle' && (
                <ModaleCycle c={c} onFermer={() => setModale(null)}
                    onValider={(libelle, debut, fin) => {
                        majConfig((d) => {
                            d.cycles.push({
                                id: prochainId(d, 'cycle'), societe_id: societeId, libelle, debut, fin,
                                statut: 'brouillon', objet_ids: [], collaborateur_ids: [], observateur_ids: []
                            });
                        });
                        setModale(null); notifier('Cycle créé en brouillon.');
                    }} />
            )}

            {modale === 'question' && (
                <ModaleQuestion c={c} question={edition && edition.id ? edition : null}
                    onFermer={() => { setModale(null); setEdition(null); }}
                    onValider={(texte, type) => {
                        majConfig((d) => {
                            if (edition && edition.id) {
                                const q = d.questions_a.find((x) => x.id === edition.id);
                                q.texte = texte; q.type = type;
                            } else {
                                const objetId = edition.objet_id;
                                const existantes = d.questions_a.filter((q) => q.cycle_id === cycle.id && q.objet_id === objetId);
                                d.questions_a.push({
                                    id: prochainId(d, 'question_a'),
                                    societe_id: societeId, cycle_id: cycle.id, objet_id: objetId,
                                    ordre: existantes.length + 1, actif: true, type, texte
                                });
                            }
                        });
                        setModale(null); setEdition(null); notifier('Question enregistrée.');
                    }} />
            )}
        </>
    );
};

// Permutation d'ordre — déterministe, aucun tri aléatoire.
function permuter(questions, questionId, sens, cycleId, objetId) {
    const liste = questions
        .filter((q) => q.cycle_id === cycleId && q.objet_id === objetId)
        .sort((a, b) => a.ordre - b.ordre);
    const i = liste.findIndex((q) => q.id === questionId);
    const j = i + sens;
    if (i < 0 || j < 0 || j >= liste.length) return;
    const a = liste[i].ordre;
    liste[i].ordre = liste[j].ordre;
    liste[j].ordre = a;
}

const BoutonIcone = ({ c, icone, onClick, disabled, danger }) => (
    <button onClick={onClick} disabled={disabled} style={{
        background: 'none', border: `1px solid ${c.gray200}`, borderRadius: '9px',
        width: 32, height: 32, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .35 : 1, color: danger ? c.danger : c.gray600, flexShrink: 0
    }}><i className={`bi ${icone}`} /></button>
);

// ------------------------------------------------------------------ Modales
const ModaleTexte = ({ c, titre, label, onFermer, onValider }) => {
    const [v, setV] = useState('');
    return (
        <Modale c={c} titre={titre} onFermer={onFermer} largeur="480px">
            <Champ c={c} label={label} obligatoire>
                <input style={styleInput(c)} value={v} onChange={(e) => setV(e.target.value)} />
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!v.trim()} onClick={() => onValider(v.trim())}>Enregistrer</Bouton>
            </div>
        </Modale>
    );
};

const ModaleSociete = ({ c, onFermer, onValider }) => {
    const [nom, setNom] = useState('');
    const [secteur, setSecteur] = useState('');
    return (
        <Modale c={c} titre="Ajouter une société" onFermer={onFermer} largeur="480px">
            <Champ c={c} label="Nom" obligatoire>
                <input style={styleInput(c)} value={nom} onChange={(e) => setNom(e.target.value)} />
            </Champ>
            <Champ c={c} label="Secteur">
                <input style={styleInput(c)} value={secteur} onChange={(e) => setSecteur(e.target.value)} />
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!nom.trim()} onClick={() => onValider(nom.trim(), secteur.trim())}>Créer</Bouton>
            </div>
        </Modale>
    );
};

const ModaleCycle = ({ c, onFermer, onValider }) => {
    const [libelle, setLibelle] = useState('');
    const [debut, setDebut] = useState('');
    const [fin, setFin] = useState('');
    return (
        <Modale c={c} titre="Créer un cycle" onFermer={onFermer} largeur="520px">
            <Champ c={c} label="Libellé" obligatoire>
                <input style={styleInput(c)} value={libelle} onChange={(e) => setLibelle(e.target.value)} placeholder="T4 2026" />
            </Champ>
            <Champ c={c} label="Période" obligatoire>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                    <input type="date" style={styleInput(c)} value={debut} onChange={(e) => setDebut(e.target.value)} />
                    <input type="date" style={styleInput(c)} value={fin} onChange={(e) => setFin(e.target.value)} />
                </div>
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!libelle.trim() || !debut || !fin}
                    onClick={() => onValider(libelle.trim(), debut, fin)}>Créer</Bouton>
            </div>
        </Modale>
    );
};

const ModaleQuestion = ({ c, question, onFermer, onValider }) => {
    const [texte, setTexte] = useState(question ? question.texte : '');
    const [type, setType] = useState(question ? question.type : 'echelle_1_4');
    return (
        <Modale c={c} titre={question ? 'Modifier la question' : 'Ajouter une question'} onFermer={onFermer} largeur="580px">
            <Champ c={c} label="Formulation" obligatoire
                aide="Question adressée au collaborateur, à la première personne de son activité.">
                <textarea style={{ ...styleInput(c), minHeight: 110, resize: 'vertical' }}
                    value={texte} onChange={(e) => setTexte(e.target.value)} />
            </Champ>
            <Champ c={c} label="Type de réponse">
                <select style={styleInput(c)} value={type} onChange={(e) => setType(e.target.value)}>
                    {Object.values(TYPES_REPONSE).map((t) => (
                        <option key={t.code} value={t.code}>{t.libelle}</option>
                    ))}
                </select>
            </Champ>
            <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
                <Bouton c={c} variante="secondaire" onClick={onFermer}>Annuler</Bouton>
                <Bouton c={c} disabled={!texte.trim()} onClick={() => onValider(texte.trim(), type)}>Enregistrer</Bouton>
            </div>
        </Modale>
    );
};

export default EvaluationDemoAdmin;
