import { createTheme } from '@mui/material/styles';

// Modern, subtle, and sophisticated color palette
const palette = {
  primary: {
    main: '#0f172a', // Slate 900 - Deep, sophisticated navy
    light: '#334155', // Slate 700
    dark: '#020617', // Slate 950
    contrastText: '#fff',
  },
  secondary: {
    main: '#64748b', // Slate 500 - Subtle gray accent
    light: '#94a3b8', // Slate 400
    dark: '#475569', // Slate 600
    contrastText: '#fff',
  },
  background: {
    default: '#fafafa', // Neutral 50 - Very subtle off-white
    paper: '#ffffff',
  },
  error: {
    main: '#dc2626', // Red 600
    contrastText: '#fff',
  },
  warning: {
    main: '#d97706', // Amber 600
    contrastText: '#fff',
  },
  info: {
    main: '#0284c7', // Sky 600
    contrastText: '#fff',
  },
  success: {
    main: '#059669', // Emerald 600
    contrastText: '#fff',
  },
  text: {
    primary: '#0f172a', // Slate 900
    secondary: '#64748b', // Slate 500
  },
};

const theme = createTheme({
  palette,
  shape: {
    borderRadius: 3.5,
  },
  typography: {
    fontFamily: [
      'Geist',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    fontWeightBold: 700,
    h1: { 
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: { 
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: { 
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.3,
    },
    h4: { 
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: { 
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: { 
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3.5,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.01em',
          padding: '6px 12px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
          color: '#fff',
          '&:hover': {
            color: '#fff',
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          },
          '&.Mui-disabled': {
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            color: '#fff',
            opacity: 0.7,
          },
          '& .MuiCircularProgress-root': {
            color: '#fff',
          },
        },        
        outlined: {
          borderWidth: '1.5px',
          borderColor: '#64748b',
          color: '#000000',
          '&:hover': {
            borderWidth: '1.5px',
            borderColor: '#475569',
            backgroundColor: 'rgba(100, 116, 139, 0.04)',
            color: '#475569',
          },
        },
        text: {
          color: '#0f172a',
          '&:hover': {
            backgroundColor: 'rgba(100, 116, 139, 0.04)',
            color: '#0f172a',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 3.5,
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
        elevation1: {
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 24px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 3.5,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '& fieldset': {
              borderColor: 'rgba(226, 232, 240, 0.8)',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(100, 116, 139, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#64748b',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 3.5,
          boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(226, 232, 240, 0.6)',
        },
      },
    },
  },
});

export default theme;
