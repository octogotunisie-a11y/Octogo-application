// frontend/src/pages/BibliothequeSectorielle.jsx
// -----------------------------------------------------------------------------
// BIBLIOTHÈQUE SECTORIELLE — accès centralisé aux réalisations par secteur.
//
// Six secteurs, deux accès chacun : le site et le magazine.
//
// ⚠ LES LIENS SE RENSEIGNENT CI-DESSOUS, ET NULLE PART AILLEURS.
// Tant qu'un lien est vide, son bouton reste inactif et l'indique : mieux vaut
// un bouton désactivé qu'un bouton qui mène à une page inexistante.
//
// Trois éléments par secteur :
//   site       adresse du site sectoriel — 'https://…'
//   magazine   le PDF — déposez-le dans frontend/public/secteurs/ et écrivez
//              '/secteurs/banque-magazine.pdf'
//   couverture image de la première page du magazine, même dossier :
//              '/secteurs/banque-couverture.jpg'
//
// Convention de nommage : <secteur>-magazine.pdf et <secteur>-couverture.jpg,
// avec la clé du secteur ci-dessous (banque, hotellerie, distribution,
// industrie, assurance, telecom). Vite sert le dossier public tel quel.
//
// Fabriquer les couvertures depuis les PDF, en une commande :
//   pdftoppm -jpeg -r 150 -f 1 -l 1 banque-magazine.pdf banque-couverture
// -----------------------------------------------------------------------------
import React, { useState } from 'react';
import {
    Landmark, Hotel, ShoppingCart, Factory, ShieldCheck, Radio,
    Globe, BookOpen, ArrowUpRight, Search, Info
} from 'lucide-react';

const COLORS = {
    primary: '#7C3AED',
    secondary: '#EC4899',
    dark: '#1F2937',
    text: '#374151',
    muted: '#6B7280',
    light: '#F9FAFB',
    border: '#E5E7EB',
};

// =============================================================================
// CONFIGURATION — les six secteurs et leurs deux accès.
// =============================================================================
const SECTEURS = [
    {
        cle: 'banque',
        nom: 'Banque',
        Icone: Landmark,
        phrase: 'Dans le cerveau d’une banque.',
        site: 'https://octogotunisie-a11y.github.io/Banque_octogo_2027/banque.html',
        magazine: 'src/pdfs/secteur/OCTOGO_Magazine_Banque_2027.pdf',        // '/secteurs/<cle>-magazine.pdf'
        couverture: 'src/images/secteur/banque.jpg',     // '/secteurs/<cle>-couverture.jpg'
    },
    {
        cle: 'hotellerie',
        nom: 'Hôtellerie',
        Icone: Hotel,
        phrase: 'L’accueil comme performance cognitive.',
        site: 'https://octogotunisie-a11y.github.io/Hotellerie_octogo_2027-/hotellerie.html',
        magazine: 'src/pdfs/secteur/OCTOGO_Magazine_Hotellerie_2027.pdf',        // '/secteurs/<cle>-magazine.pdf'
        couverture: 'src/images/secteur/hotellerie.jpg',     // '/secteurs/<cle>-couverture.jpg'
    },
    {
        cle: 'distribution',
        nom: 'Distribution',
        Icone: ShoppingCart,
        phrase: 'Décider vite, sans décider mal.',
        site: 'https://octogotunisie-a11y.github.io/Distribution_octogo_2027/distribution.html',
        magazine: 'src/pdfs/secteur/OCTOGO_Magazine_Distribution_2027.pdf',        // '/secteurs/<cle>-magazine.pdf'
        couverture: 'src/images/secteur/distribution.jpg',     // '/secteurs/<cle>-couverture.jpg'
    },
    {
        cle: 'industrie',
        nom: 'Industrie',
        Icone: Factory,
        phrase: 'L’attention comme facteur de sécurité.',
        site: 'https://octogotunisie-a11y.github.io/Industrie_octogo_2027/industrie.html',
        magazine: 'src/pdfs/secteur/OCTOGO_Magazine_Industrie_2027.pdf',        // '/secteurs/<cle>-magazine.pdf'
        couverture: 'src/images/secteur/industrie.jpg',     // '/secteurs/<cle>-couverture.jpg'
    },
    {
        cle: 'assurance',
        nom: 'Assurance',
        Icone: ShieldCheck,
        phrase: 'Évaluer le risque sans se tromper de signal.',
        site: 'https://octogotunisie-a11y.github.io/Assurance_octogo_2027/assurance.html',
        magazine: 'src/pdfs/secteur/OCTOGO_Magazine_Assurance_2027.pdf',        // '/secteurs/<cle>-magazine.pdf'
        couverture: 'src/images/secteur/assurance.jpg',     // '/secteurs/<cle>-couverture.jpg'
    },
    {
        cle: 'telecom',
        nom: 'Télécom',
        Icone: Radio,
        phrase: 'La relation client sous charge mentale.',
        site: 'https://octogotunisie-a11y.github.io/Telecom_octogo_2027/telecom.html',
        magazine: 'src/pdfs/secteur/OCTOGO_Magazine_Telecom_2027.pdf',        // '/secteurs/<cle>-magazine.pdf'
        couverture: 'src/images/secteur/telecom.jpg',     // '/secteurs/<cle>-couverture.jpg'
    },
];

// =============================================================================
const estRenseigne = (lien) => typeof lien === 'string' && lien.trim().length > 0;
const estExterne = (lien) => /^https?:\/\//i.test(lien);

// Bouton d'accès. Inactif et explicite tant que le lien n'est pas renseigné.
const Acces = ({ lien, Icone, libelle, secondaire }) => {
    const actif = estRenseigne(lien);

    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        flex: '1 1 118px', padding: '11px 12px', borderRadius: 10,
        fontSize: 14, fontWeight: 600, textDecoration: 'none',
        transition: 'transform .15s, box-shadow .15s, background .15s',
        fontFamily: 'inherit', border: '1px solid transparent', cursor: 'pointer',
        whiteSpace: 'nowrap',   // sans cela, « Voir le site » passe sur deux lignes en mobile
    };

    const style = !actif
        ? { ...base, background: COLORS.light, color: COLORS.muted, border: `1px dashed ${COLORS.border}`, cursor: 'not-allowed' }
        : secondaire
            ? { ...base, background: '#fff', color: COLORS.primary, border: `1px solid ${COLORS.primary}` }
            : { ...base, background: COLORS.primary, color: '#fff' };

    if (!actif) {
        return (
            <span style={style} title="Lien à renseigner dans BibliothequeSectorielle.jsx">
                <Icone size={16} /> {libelle}
            </span>
        );
    }

    return (
        <a
            href={lien}
            target="_blank"
            rel="noopener noreferrer"
            style={style}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(124,58,237,.18)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <Icone size={16} /> {libelle}
            {estExterne(lien) && <ArrowUpRight size={14} style={{ opacity: .7 }} />}
        </a>
    );
};

// Couverture du magazine. Si l'image manque ou ne charge pas, on affiche un
// aplat aux couleurs de la marque plutôt qu'une icône d'image cassée.
const Couverture = ({ secteur, survol }) => {
    const { nom, Icone, couverture } = secteur;
    const [echec, setEchec] = useState(false);
    const montrable = estRenseigne(couverture) && !echec;

    return (
        <div style={{
            position: 'relative', marginBottom: 16, borderRadius: 12, overflow: 'hidden',
            aspectRatio: '3 / 4', maxHeight: 210, background: COLORS.light,
            border: `1px solid ${COLORS.border}`,
        }}>
            {montrable ? (
                <img
                    src={couverture}
                    alt={`Première page du magazine ${nom}`}
                    loading="lazy"
                    onError={() => setEchec(true)}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top',
                        display: 'block', transform: survol ? 'scale(1.03)' : 'none',
                        transition: 'transform .25s',
                    }}
                />
            ) : (
                <div style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: `linear-gradient(135deg, ${COLORS.primary}0F, ${COLORS.secondary}14)`,
                }}>
                    <Icone size={30} color={COLORS.primary} strokeWidth={1.4} />
                    <span style={{ fontSize: 11.5, color: COLORS.muted, textAlign: 'center', padding: '0 12px' }}>
                        {estRenseigne(couverture) ? 'Couverture introuvable' : 'Couverture à déposer'}
                    </span>
                </div>
            )}
        </div>
    );
};

const CarteSecteur = ({ secteur }) => {
    const { nom, Icone, phrase, site, magazine } = secteur;
    const [survol, setSurvol] = useState(false);
    const complet = estRenseigne(site) && estRenseigne(magazine);

    return (
        <article
            onMouseEnter={() => setSurvol(true)}
            onMouseLeave={() => setSurvol(false)}
            style={{
                background: '#fff',
                border: `1px solid ${survol ? COLORS.primary : COLORS.border}`,
                borderRadius: 16,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                transform: survol ? 'translateY(-3px)' : 'none',
                boxShadow: survol ? '0 14px 34px rgba(31,41,55,.10)' : '0 1px 2px rgba(31,41,55,.04)',
                transition: 'transform .2s, box-shadow .2s, border-color .2s',
            }}
        >
            {/* Filet dégradé repris du logo : violet vers magenta */}
            <div style={{
                height: 3, width: survol ? 64 : 40, borderRadius: 3, marginBottom: 16,
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
                transition: 'width .2s',
            }} />

            <Couverture secteur={secteur} survol={survol} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: `${COLORS.primary}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icone size={20} color={COLORS.primary} />
                </span>
                <h3 style={{
                    margin: 0, fontSize: 17, fontWeight: 800, color: COLORS.dark,
                    letterSpacing: '.01em', textTransform: 'uppercase',
                }}>{nom}</h3>
            </div>

            <p style={{ margin: '0 0 18px', fontSize: 14.5, color: COLORS.muted, lineHeight: 1.5 }}>
                {phrase}
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                <Acces lien={site} Icone={Globe} libelle="Voir le site" />
                <Acces lien={magazine} Icone={BookOpen} libelle="Magazine PDF" secondaire />
            </div>

            {!complet && (
                <p style={{ margin: '12px 0 0', fontSize: 12, color: COLORS.muted, display: 'flex', gap: 6 }}>
                    <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    Accès à renseigner dans la configuration de la page.
                </p>
            )}
        </article>
    );
};

const BibliothequeSectorielle = () => {
    const [recherche, setRecherche] = useState('');

    const visibles = SECTEURS.filter((s) =>
        !recherche || `${s.nom} ${s.phrase}`.toLowerCase().includes(recherche.toLowerCase()));

    const renseignes = SECTEURS.filter((s) => estRenseigne(s.site) || estRenseigne(s.magazine)).length;

    return (
        <main style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 20px 80px' }}>

            {/* ----------------------------------------------------- En-tête */}
            <header style={{ marginBottom: 36 }}>
                <span style={{
                    display: 'inline-block', fontSize: 12.5, fontWeight: 700, letterSpacing: '.08em',
                    textTransform: 'uppercase', color: COLORS.secondary, marginBottom: 10,
                }}>
                    Réalisations OCTOGO
                </span>

                <h1 style={{
                    margin: '0 0 12px', fontSize: 'clamp(28px, 4.5vw, 40px)', lineHeight: 1.15,
                    fontWeight: 800, color: COLORS.dark, letterSpacing: '-.02em',
                }}>
                    Bibliothèque sectorielle
                </h1>

                <p style={{ margin: 0, maxWidth: 680, fontSize: 16, lineHeight: 1.6, color: COLORS.muted }}>
                    Les sites et les magazines réalisés pour chaque secteur, réunis au même endroit.
                    Choisissez un secteur, puis le site ou le magazine.
                </p>
            </header>

            {/* ------------------------------------------- Légende et recherche */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 14, flexWrap: 'wrap', marginBottom: 24,
            }}>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13.5, color: COLORS.muted }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <Globe size={15} color={COLORS.primary} /> Site web
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <BookOpen size={15} color={COLORS.secondary} /> Magazine (PDF)
                    </span>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 220px', maxWidth: 320,
                    border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '8px 12px', background: '#fff',
                }}>
                    <Search size={16} color={COLORS.muted} />
                    <input
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        placeholder="Filtrer un secteur…"
                        style={{
                            flex: 1, border: 'none', outline: 'none', fontSize: 14,
                            color: COLORS.text, fontFamily: 'inherit', background: 'transparent',
                        }}
                    />
                </div>
            </div>

            {/* --------------------------------------------------- Les secteurs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: 18,
            }}>
                {visibles.map((s) => <CarteSecteur key={s.cle} secteur={s} />)}
            </div>

            {visibles.length === 0 && (
                <p style={{ textAlign: 'center', color: COLORS.muted, padding: '40px 0' }}>
                    Aucun secteur ne correspond à cette recherche.
                </p>
            )}

            {/* Rappel discret tant que la configuration n'est pas complète. */}
            {renseignes < SECTEURS.length && (
                <p style={{
                    marginTop: 28, padding: '12px 16px', borderRadius: 10,
                    background: COLORS.light, border: `1px dashed ${COLORS.border}`,
                    fontSize: 13, color: COLORS.muted, lineHeight: 1.6,
                }}>
                    Les adresses des sites et des magazines se renseignent en haut du fichier
                    <code style={{ margin: '0 4px', color: COLORS.primary }}>BibliothequeSectorielle.jsx</code>,
                    dans la liste <code style={{ color: COLORS.primary }}>SECTEURS</code>. Déposez le PDF et
                    l’image de couverture dans <code style={{ color: COLORS.primary }}>frontend/public/secteurs/</code>,
                    nommés <code style={{ color: COLORS.primary }}>banque-magazine.pdf</code> et
                    <code style={{ color: COLORS.primary }}> banque-couverture.jpg</code>.
                </p>
            )}
        </main>
    );
};

export default BibliothequeSectorielle;