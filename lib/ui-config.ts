import colors from './colors';

// Typography configuration
export const typography = {
  fontFamily: {
    base: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    decorative: '"Pacifico", cursive',
    formal: 'Georgia, serif',
    playful: '"Comic Sans MS", cursive'
  },
  fontSize: {
    // Desktop sizes
    formTitle: '2rem', // 32px
    sectionTitle: '1.5rem', // 24px
    questionTitle: '1rem', // 16px
    answerOption: '0.875rem', // 14px
    helperText: '0.75rem', // 12px
    buttonText: '0.875rem', // 14px
    
    // Mobile sizes
    mobile: {
      formTitle: '1.5rem', // 24px
      sectionTitle: '1.25rem', // 20px
      questionTitle: '0.875rem', // 14px
      answerOption: '0.875rem', // 14px
      helperText: '0.75rem', // 12px
      buttonText: '0.875rem' // 14px
    }
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  lineHeight: {
    tight: '1.2',
    base: '1.5',
    relaxed: '1.75'
  }
};

// Spacing configuration
export const spacing = {
  // Form element spacing
  formGap: '2rem',
  sectionGap: '1.5rem',
  questionGap: '1.25rem',
  inputGap: '0.5rem',
  
  // Padding and margins
  containerPadding: '1.5rem',
  sectionPadding: '1.5rem',
  inputPadding: '0.75rem',
  buttonPadding: '0.75rem 1.5rem',
  
  // Mobile adjustments
  mobile: {
    formGap: '1.5rem',
    sectionGap: '1.25rem',
    questionGap: '1rem',
    containerPadding: '1rem',
    sectionPadding: '1rem',
    inputPadding: '0.625rem',
    buttonPadding: '0.625rem 1.25rem'
  }
};

// Input element sizes
export const inputSizes = {
  shortAnswer: {
    width: '100%',
    maxWidth: '100%',
    height: '36px'
  },
  paragraph: {
    width: '100%',
    maxWidth: '100%',
    minHeight: '100px'
  },
  checkbox: {
    size: '18px',
    spacing: '10px'
  },
  dropdown: {
    width: '100%',
    maxWidth: '100%',
    height: '40px'
  },
  radio: {
    size: '18px',
    spacing: '10px'
  },
  submitButton: {
    width: '150px',
    height: '40px',
    mobile: {
      width: '100%',
      height: '48px'
    }
  }
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
};

// Border radius
export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px'
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
};

// Transitions
export const transitions = {
  default: 'all 0.2s ease-in-out',
  slow: 'all 0.3s ease-in-out',
  fast: 'all 0.1s ease-in-out'
};

// Layout configuration
export const layout = {
  maxWidth: '640px',
  containerWidth: '100%',
  contentMargin: '0 auto',
  contentPadding: '1.5rem',
  formCardPadding: '1.5rem',
  mobilePadding: '1rem'
};

// Google Forms style input configuration
export const inputStyles = {
  // Seamless input style like Google Forms
  borderWidth: '0',
  borderBottom: '1px solid #dadce0',
  borderRadius: '0',
  backgroundColor: 'transparent',
  hoverBorderBottom: '2px solid #4285f4',
  focusBorderBottom: '2px solid #4285f4',
  focusBoxShadow: 'none',
  outlineStyle: 'none',
  // Section styling
  sectionBackground: 'white',
  sectionBorderRadius: '8px',
  sectionBoxShadow: '0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)'
};

// Combined theme object
const uiConfig = {
  colors,
  typography,
  spacing,
  inputSizes,
  breakpoints,
  borderRadius,
  shadows,
  transitions,
  layout,
  inputStyles,
  
  // Current theme selection
  currentTheme: {
    fontStyle: 'base', // base, decorative, formal, playful
    colorScheme: 'default'
  }
};

export default uiConfig;
