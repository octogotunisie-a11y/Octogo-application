// frontend/src/evaluation/ui.jsx
// -----------------------------------------------------------------------------
// Primitives visuelles du module Évaluation.
// Aucune nouvelle identité graphique : mêmes couleurs, rayons, ombres, icônes
// Bootstrap (bi-*) et animations framer-motion que les dashboards existants.
// La palette est reçue en prop depuis le dashboard hôte.
// -----------------------------------------------------------------------------
import React from 'react';
import { motion } from 'framer-motion';

export const PALETTE = {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryGradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    white: '#FFFFFF'
};

export const fusionner = (colors) => Object.assign({}, PALETTE, colors || {});

// ---------------------------------------------------------------- Carte
export const Carte = ({ c = PALETTE, children, style = {}, onClick }) => (
    <motion.div
        whileHover={onClick ? { y: -3 } : undefined}
        onClick={onClick}
        style={{
            background: c.white,
            border: `1px solid ${c.gray200}`,
            borderRadius: '16px',
            padding: '1.25rem',
            cursor: onClick ? 'pointer' : 'default',
            ...style
        }}
    >
        {children}
    </motion.div>
);

// ---------------------------------------------------------------- Bouton
export const Bouton = ({ c = PALETTE, variante = 'primaire', icone, children, style = {}, ...props }) => {
    const styles = {
        primaire: { background: c.primaryGradient, color: c.white, border: 'none' },
        secondaire: { background: 'transparent', color: c.gray700, border: `1px solid ${c.gray300}` },
        succes: { background: c.success, color: c.white, border: 'none' },
        danger: { background: 'transparent', color: c.danger, border: `1px solid ${c.danger}` }
    };
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            {...props}
            style={{
                padding: '0.7rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                opacity: props.disabled ? 0.55 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all .2s',
                ...styles[variante],
                ...style
            }}
        >
            {icone && <i className={`bi ${icone}`} />}
            {children}
        </motion.button>
    );
};

// ---------------------------------------------------------------- Badge
export const Badge = ({ c = PALETTE, ton = 'neutre', children }) => {
    const tons = {
        neutre: { bg: c.gray100, fg: c.gray600 },
        attente: { bg: '#FFFBEB', fg: c.warning },
        succes: { bg: '#ECFDF5', fg: c.success },
        info: { bg: '#EFF6FF', fg: c.info },
        primaire: { bg: '#EEF2FF', fg: c.primary },
        danger: { bg: '#FEF2F2', fg: c.danger }
    };
    const t = tons[ton] || tons.neutre;
    return (
        <span style={{
            background: t.bg, color: t.fg, padding: '3px 10px', borderRadius: '30px',
            fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap'
        }}>{children}</span>
    );
};

// ------------------------------------------------- NCM (niveau de certitude)
// Tout indicateur affiché porte son NCM, visible, sans repli ni info-bulle
// masquée. Le libellé et la note viennent du serveur : le client ne les invente pas.
export const BadgeNCM = ({ c = PALETTE, ncm }) => {
    if (!ncm || !ncm.code) return null;
    const tons = {
        'NCM-1': { bg: '#ECFDF5', fg: '#065F46', bd: '#A7F3D0' },
        'NCM-2': { bg: '#FFFBEB', fg: '#92400E', bd: '#FDE68A' },
        'NCM-3': { bg: '#F3F4F6', fg: '#4B5563', bd: '#E5E7EB' }
    };
    const t = tons[ncm.code] || tons['NCM-3'];
    return (
        <span
            title={ncm.note || ''}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
                padding: '2px 8px', borderRadius: '6px', fontSize: '.68rem',
                fontWeight: 700, letterSpacing: '.02em', whiteSpace: 'nowrap'
            }}
        >
            {ncm.code}
            <span style={{ fontWeight: 500, opacity: .85 }}>· {ncm.libelle}</span>
        </span>
    );
};

// ---------------------------------------------------------------- Champs
export const Champ = ({ c = PALETTE, label, obligatoire, children, aide }) => (
    <div style={{ marginBottom: '1rem' }}>
        {label && (
            <label style={{ display: 'block', marginBottom: '.4rem', fontSize: '.85rem', fontWeight: 600, color: c.gray700 }}>
                {label} {obligatoire && <span style={{ color: c.danger }}>*</span>}
            </label>
        )}
        {children}
        {aide && <div style={{ fontSize: '.75rem', color: c.gray500, marginTop: '.35rem' }}>{aide}</div>}
    </div>
);

export const styleInput = (c = PALETTE) => ({
    width: '100%',
    padding: '.7rem .9rem',
    borderRadius: '12px',
    border: `1px solid ${c.gray300}`,
    fontSize: '.9rem',
    color: c.gray800,
    background: c.white,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
});

// ---------------------------------------------------------------- Champs
// Champs de formulaire partagés par le module Évaluation et les écrans mock.
// Ils s'appuient sur <Champ> et styleInput ci-dessous : aucune nouvelle
// identité visuelle n'est introduite.
export const ChampTexte = ({ c, label, valeur, onChange, placeholder, obligatoire, aide }) => (
    <Champ c={c} label={label} obligatoire={obligatoire} aide={aide}>
        <input style={styleInput(c)} value={valeur || ''} placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)} />
    </Champ>
);

export const ChampZone = ({ c, label, valeur, onChange, placeholder, obligatoire, aide, hauteur = 100 }) => (
    <Champ c={c} label={label} obligatoire={obligatoire} aide={aide}>
        <textarea style={{ ...styleInput(c), minHeight: hauteur, resize: 'vertical' }}
            value={valeur || ''} placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)} />
    </Champ>
);

export const ChampListe = ({ c, label, valeur, onChange, options, obligatoire, aide }) => (
    <Champ c={c} label={label} obligatoire={obligatoire} aide={aide}>
        <select style={styleInput(c)} value={valeur || ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">— Choisir —</option>
            {options.map((o) => (
                <option key={typeof o === 'string' ? o : o.valeur} value={typeof o === 'string' ? o : o.valeur}>
                    {typeof o === 'string' ? o : o.label}
                </option>
            ))}
        </select>
    </Champ>
);

// -------------------------------------------------------------- Pastille
// Statut à trois tons : 🟡 en attente · 🟠 soumis · 🟢 terminé.
export const Pastille = ({ c = PALETTE, ton, children }) => {
    const tons = {
        attente: { p: '#F59E0B', bg: '#FFFBEB', fg: '#92400E' },
        soumis: { p: '#F97316', bg: '#FFF7ED', fg: '#9A3412' },
        termine: { p: '#10B981', bg: '#ECFDF5', fg: '#065F46' },
        neutre: { p: '#9CA3AF', bg: '#F3F4F6', fg: '#4B5563' }
    };
    const t = tons[ton] || tons.neutre;
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

// ------------------------------------------------------------ Bandeau mock
// Signale à l'écran qu'une donnée est fictive. À retirer au branchement réel.
export const BandeauMock = ({ c = PALETTE, children }) => (
    <div style={{
        background: '#FFFBEB', border: '1px dashed #FDE68A', color: '#92400E',
        borderRadius: '12px', padding: '.7rem 1rem', fontSize: '.82rem',
        display: 'flex', gap: '.6rem', alignItems: 'flex-start', marginBottom: '1.25rem'
    }}>
        <i className="bi bi-cone-striped" style={{ marginTop: 2 }} />
        <span>{children}</span>
    </div>
);

// ------------------------------------------------------------- Statistique
export const Statistique = ({ c = PALETTE, icone, valeur, libelle, ton }) => (
    <Carte c={c}>
        <i className={`bi ${icone}`} style={{ fontSize: '1.3rem', color: ton || c.primary }} />
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: c.gray900, marginTop: '.4rem' }}>{valeur}</div>
        <div style={{ fontSize: '.8rem', color: c.gray500 }}>{libelle}</div>
    </Carte>
);

// --------------------------------------------------- Sélecteur de documents
// Prépare le futur flow : documents société → sélection → IA → résultat.
// Pour l'instant la sélection ne sert qu'à composer un résultat mock ; aucun
// fichier n'est lu, transmis ni analysé.
export const SelecteurDocuments = ({ c = PALETTE, documents, selection, onChange }) => {
    const basculer = (id) =>
        onChange(selection.includes(id) ? selection.filter((x) => x !== id) : [...selection, id]);
    return (
        <Champ c={c} label="Documents de référence de la société"
            aide="Ces documents serviront de contexte lors de la future génération. Aucun fichier n’est analysé à ce stade.">
            {documents.length === 0 ? (
                <div style={{ color: c.gray400, fontSize: '.85rem', padding: '.5rem 0' }}>
                    Aucun document. Ajoutez-en depuis « Mes fichiers ».
                </div>
            ) : (
                <div style={{ border: `1px solid ${c.gray200}`, borderRadius: '12px', padding: '.6rem', maxHeight: 190, overflowY: 'auto' }}>
                    {documents.map((d) => (
                        <label key={d.id} style={{
                            display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.4rem .3rem',
                            cursor: 'pointer', fontSize: '.86rem', color: c.gray700
                        }}>
                            <input type="checkbox" checked={selection.includes(d.id)} onChange={() => basculer(d.id)} />
                            <i className="bi bi-file-earmark-text" style={{ color: c.gray400 }} />
                            <span style={{ flex: 1, minWidth: 0 }}>{d.nom}</span>
                            <span style={{ fontSize: '.73rem', color: c.gray400 }}>{d.categorie}</span>
                        </label>
                    ))}
                </div>
            )}
        </Champ>
    );
};

// ---------------------------------------------------------------- Modale
export const Modale = ({ c = PALETTE, titre, sousTitre, onFermer, children, largeur = '640px' }) => (
    <div
        onClick={onFermer}
        style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}
    >
        <motion.div
            initial={{ opacity: 0, scale: .95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
                background: c.white, borderRadius: '22px', width: '100%', maxWidth: largeur,
                maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                    <h3 style={{ margin: 0, color: c.gray900, fontSize: '1.15rem' }}>{titre}</h3>
                    {sousTitre && <p style={{ margin: '.3rem 0 0', color: c.gray500, fontSize: '.85rem' }}>{sousTitre}</p>}
                </div>
                <button onClick={onFermer} style={{ background: 'none', border: 'none', fontSize: '1.35rem', cursor: 'pointer', color: c.gray400, lineHeight: 1 }}>
                    <i className="bi bi-x-lg" />
                </button>
            </div>
            {children}
        </motion.div>
    </div>
);

// ---------------------------------------------------------------- États
export const Chargement = ({ c = PALETTE, texte = 'Chargement…' }) => (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: c.gray500 }}>
        <div style={{
            width: 44, height: 44, border: `4px solid ${c.gray200}`, borderTopColor: c.primary,
            borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite'
        }} />
        <p style={{ margin: 0, fontSize: '.9rem' }}>{texte}</p>
    </div>
);

export const EtatVide = ({ c = PALETTE, icone = 'bi-inbox', titre, texte, action }) => (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <i className={`bi ${icone}`} style={{ fontSize: '2.5rem', color: c.gray300 }} />
        <h4 style={{ color: c.gray700, margin: '.75rem 0 .35rem', fontSize: '1rem' }}>{titre}</h4>
        {texte && <p style={{ color: c.gray500, fontSize: '.85rem', margin: '0 0 1rem' }}>{texte}</p>}
        {action}
    </div>
);

export const Alerte = ({ c = PALETTE, ton = 'danger', children, onFermer }) => {
    const tons = {
        danger: { bg: '#FEF2F2', fg: '#991B1B', bd: '#FECACA', ic: 'bi-exclamation-triangle-fill' },
        succes: { bg: '#ECFDF5', fg: '#065F46', bd: '#A7F3D0', ic: 'bi-check-circle-fill' },
        info: { bg: '#EFF6FF', fg: '#1E40AF', bd: '#BFDBFE', ic: 'bi-info-circle-fill' }
    };
    const t = tons[ton] || tons.info;
    return (
        <div style={{
            background: t.bg, color: t.fg, border: `1px solid ${t.bd}`, borderRadius: '12px',
            padding: '.8rem 1rem', fontSize: '.85rem', display: 'flex', gap: '.6rem',
            alignItems: 'flex-start', marginBottom: '1rem'
        }}>
            <i className={`bi ${t.ic}`} style={{ marginTop: 2 }} />
            <span style={{ flex: 1 }}>{children}</span>
            {onFermer && (
                <button onClick={onFermer} style={{ background: 'none', border: 'none', color: t.fg, cursor: 'pointer' }}>
                    <i className="bi bi-x" />
                </button>
            )}
        </div>
    );
};

// ---------------------------------------------------------------- Fil d'Ariane
export const FilAriane = ({ c = PALETTE, elements = [] }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '.85rem' }}>
        {elements.map((el, i) => (
            <React.Fragment key={i}>
                {i > 0 && <i className="bi bi-chevron-right" style={{ color: c.gray400, fontSize: '.7rem' }} />}
                {el.onClick ? (
                    <button onClick={el.onClick} style={{ background: 'none', border: 'none', color: c.primary, cursor: 'pointer', padding: 0, fontWeight: 600, fontSize: '.85rem' }}>
                        {el.label}
                    </button>
                ) : (
                    <span style={{ color: c.gray600, fontWeight: 600 }}>{el.label}</span>
                )}
            </React.Fragment>
        ))}
    </div>
);

// ---------------------------------------------------------------- Onglets internes
export const OngletsInternes = ({ c = PALETTE, onglets, actif, onChange }) => (
    <div style={{
        display: 'flex', gap: '.4rem', overflowX: 'auto', paddingBottom: '.25rem',
        borderBottom: `1px solid ${c.gray200}`, marginBottom: '1.5rem'
    }}>
        {onglets.map((o) => (
            <button
                key={o.id}
                onClick={() => onChange(o.id)}
                style={{
                    padding: '.6rem 1rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${actif === o.id ? c.primary : 'transparent'}`,
                    color: actif === o.id ? c.primary : c.gray500,
                    fontWeight: 600,
                    fontSize: '.88rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.45rem'
                }}
            >
                {o.icone && <i className={`bi ${o.icone}`} />}
                {o.label}
            </button>
        ))}
    </div>
);
