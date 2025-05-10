export const theme = {
  colors: {
    primary: '#FFDD00',
    dark: '#121212',
    surface: '#1E1E1E',
    lightgray: '#E0E0E0',
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    border: '#333333',
    cardBorder: '#FFDD00',
    cardBorderSuccess: '#4CAF50',
    cardBorderError: '#F44336',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },
  zIndices: {
    base: 1,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    overlay: 1500,
    toast: 1600,
  },
};

export type Theme = typeof theme;
