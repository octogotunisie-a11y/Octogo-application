// frontend/src/config/theme.js
// -----------------------------------------------------------------------------
// Palette et échelle de design — valeurs UNIQUES de vérité.
// Direction artistique : premium SaaS, bleu nuit + turquoise.
// -----------------------------------------------------------------------------

export const colors = {
  // Primaire — bleu nuit profond (autorité, sérieux, SaaS pro)
  primary:        '#1E3A8A',   // bleu nuit principal
  primaryLight:   '#2563EB',   // bleu interactif (hover, actif)
  primarySoft:    '#EFF6FF',   // fond très léger primaire
  primaryDark:    '#172554',   // bleu nuit profond
  primaryGradient:'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',

  // Accent — turquoise (data positive, progression)
  accent:         '#0D9488',
  accentLight:    '#14B8A6',
  accentSoft:     '#F0FDFA',
  accentGradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',

  // Statuts
  success:        '#059669', successSoft: '#ECFDF5',
  warning:        '#D97706', warningSoft: '#FFFBEB',
  danger:         '#DC2626', dangerSoft:  '#FEF2F2',
  info:           '#0284C7', infoSoft:    '#EFF6FF',

  // Neutres
  ink:      '#0F172A',   // texte fort
  inkSoft:  '#334155',   // texte courant
  inkMuted: '#64748B',   // texte secondaire
  inkFaint: '#94A3B8',   // placeholder, icône désactivée

  line:     '#E2E8F0',   // bordures
  lineSoft: '#F1F5F9',   // séparateurs internes

  bg:       '#F8FAFC',   // fond app (blanc cassé)
  bgCard:   '#FFFFFF',   // fond carte
  bgSunken: '#F1F5F9',   // zone en retrait
  white:    '#FFFFFF',

  // Graphiques — palette catégorielle cohérente (8 couleurs)
  chart: [
    '#1E3A8A',  // bleu nuit
    '#0D9488',  // turquoise
    '#7C3AED',  // violet
    '#EA580C',  // orange
    '#0891B2',  // cyan
    '#65A30D',  // vert olive
    '#BE185D',  // rose
    '#475569'   // gris ardoise
  ],

  // Sémantique graphiques
  chartPositive: '#059669',
  chartNegative: '#DC2626',
  chartNeutral:  '#64748B',
  chartPre:      '#94A3B8',   // pré-formation (neutre)
  chartPost:     '#0D9488'    // post-formation (turquoise positif)
};

export const radius = { sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '999px' };

export const space = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px',
  xl: '24px', '2xl': '32px', '3xl': '48px'
};

export const typography = {
  h1:    { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 },
  h2:    { fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 },
  h3:    { fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 },
  body:  { fontSize: '0.9rem',  fontWeight: 400, lineHeight: 1.55 },
  small: { fontSize: '0.8rem',  fontWeight: 500, lineHeight: 1.5 },
  tiny:  { fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.03em' }
};

export const shadow = {
  sm:    '0 1px 2px 0 rgb(15 23 42 / 0.05)',
  md:    '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.04)',
  lg:    '0 12px 28px -8px rgb(15 23 42 / 0.12), 0 4px 8px -4px rgb(15 23 42 / 0.06)',
  focus: '0 0 0 3px rgba(37, 99, 235, 0.18)'
};

export const layout = {
  sidebarWidth: 260,
  headerHeight: 68,
  contentMax: 1400
};