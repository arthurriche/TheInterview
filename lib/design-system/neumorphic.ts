/**
 * Design System Neumorphique
 * Style: Sobre, pro, premium (Apple/Fintech)
 */

export const neumorphicColors = {
  // Palette monochrome claire
  base: '#EEEFF3',
  light: '#E3E6EC',
  dark: '#D9DDE3',

  // Couleurs de texte
  textPrimary: '#2A2D3A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // Accents
  accent: '#4F46E5',
  accentHover: '#4338CA',
} as const;

export const neumorphicShadows = {
  // Soft shadows neumorphiques
  // Shadow claire (haut-gauche) + Shadow foncée (bas-droite)
  soft: '6px 6px 12px #D1D4D9, -6px -6px 12px #FFFFFF',
  medium: '8px 8px 16px #D1D4D9, -8px -8px 16px #FFFFFF',
  strong: '12px 12px 24px #D1D4D9, -12px -12px 24px #FFFFFF',

  // Ombres internes (pour les inputs, zones pressées)
  inset: 'inset 4px 4px 8px #D1D4D9, inset -4px -4px 8px #FFFFFF',
  insetMedium: 'inset 6px 6px 12px #D1D4D9, inset -6px -6px 12px #FFFFFF',

  // Ombres pour les états hover
  hover: '10px 10px 20px #D1D4D9, -10px -10px 20px #FFFFFF',

  // Ombres pour les états actifs/pressés
  pressed: 'inset 3px 3px 6px #D1D4D9, inset -3px -3px 6px #FFFFFF',
} as const;

export const neumorphicRadius = {
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
  full: '9999px',
} as const;

export const neumorphicSpacing = {
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '3rem',     // 48px
  '2xl': '4rem',  // 64px
  '3xl': '6rem',  // 96px
  '4xl': '8rem',  // 128px
} as const;

export const neumorphicTypography = {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    secondary: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// Classes CSS utilitaires pour Tailwind
export const neumorphicClasses = {
  card: 'bg-[#EEEFF3] rounded-[20px]',
  shadow: 'shadow-[6px_6px_12px_#D1D4D9,-6px_-6px_12px_#FFFFFF]',
  shadowHover: 'hover:shadow-[10px_10px_20px_#D1D4D9,-10px_-10px_20px_#FFFFFF]',
  shadowPressed: 'active:shadow-[inset_3px_3px_6px_#D1D4D9,inset_-3px_-3px_6px_#FFFFFF]',
  input: 'shadow-[inset_4px_4px_8px_#D1D4D9,inset_-4px_-4px_8px_#FFFFFF]',
} as const;
