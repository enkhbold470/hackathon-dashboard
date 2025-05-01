/**
 * Core Brand Color System (Bright Theme)
 * Foundational palette for a vibrant, accessible UI.
 */
export const colorSystem = {
  /** Primary brand color – bright blue */
  primary: '#3b82f6', // Tailwind's blue-500

  /** Secondary accent color – bright pink */
  secondary: '#ec4899', // Tailwind's pink-500

  /** Main app background – light navy */
  background: '#f8fafc', // Tailwind's slate-50

  /** Surface elements like cards, modals – light gray */
  surface: '#e2e8f0', // Tailwind's slate-200

  /** Error/destructive actions – vivid red */
  error: '#ef4444', // Tailwind's red-500
};

/**
 * Semantic and UI-Specific Colors
 */
const colors = {
  theme: {
    primary: colorSystem.primary,
    secondary: colorSystem.secondary,
    background: colorSystem.background,
    success: '#10b981', // green-500
    danger: colorSystem.error,
    warning: '#f59e0b', // amber-500
    info: '#0ea5e9',    // sky-500
    foreground: '#1e293b', // slate-800 for strong text
    inputBackground: colorSystem.surface,
    inputBorder: '#94a3b8', // slate-400
    inputText: '#1e293b',
    buttonText: '#ffffff',
    linkText: '#2563eb', // blue-600
    gold: '#facc15',     // yellow-400
  },
  palette: {
    background: colorSystem.background,
    foreground: '#1e293b',
    primary: colorSystem.primary,
    secondary: colorSystem.secondary,
    gold: '#facc15',
  }
};

/**
 * Helper: Convert hex to HSL for CSS variables
 */
const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;

  let h = 0;
  if (delta !== 0) {
    if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (cmax + cmin) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return `${h} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
};

/**
 * CSS Variables (HSL-based for theming)
 */
export const cssVariables = {
  '--background': hexToHsl(colorSystem.background),
  '--foreground': '222 47% 11%', // dark slate
  '--card': hexToHsl(colorSystem.surface),
  '--card-foreground': '222 47% 11%',
  '--popover': hexToHsl(colorSystem.surface),
  '--popover-foreground': '222 47% 11%',
  '--primary': hexToHsl(colorSystem.primary),
  '--primary-foreground': '0 0% 100%',
  '--secondary': hexToHsl(colorSystem.secondary),
  '--secondary-foreground': '0 0% 100%',
  '--muted': hexToHsl(colorSystem.surface),
  '--muted-foreground': '222 20% 40%',
  '--accent': hexToHsl(colorSystem.secondary),
  '--accent-foreground': '0 0% 100%',
  '--destructive': hexToHsl(colorSystem.error),
  '--destructive-foreground': '0 0% 100%',
  '--border': '222 20% 80%',
  '--input': hexToHsl(colorSystem.surface),
  '--ring': hexToHsl(colorSystem.primary),
};

export const coreColors = colorSystem;
export default colors;
