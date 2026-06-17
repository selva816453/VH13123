import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a56db',      // Indigo Blue (Modern corporate branding)
      light: '#eef2ff',     // Light background fill
      dark: '#1e40af',      // Deep royal blue hover
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#0ea5e9',      // Sky blue accents
      light: '#f0f9ff',
      dark: '#0369a1'
    },
    background: {
      default: '#f8fafc',   // Crisp slate gray/white background
      paper: '#ffffff'      // Card and paper surfaces
    },
    text: {
      primary: '#0f172a',   // Slate-900 (highly readable)
      secondary: '#475569', // Slate-600 (captions and secondary texts)
      disabled: '#94a3b8'
    },
    divider: '#e2e8f0',     // Light dividers
    error: {
      main: '#ef4444',
      light: '#fef2f2'
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7'
    },
    info: {
      main: '#3b82f6',
      light: '#eff6ff'
    },
    success: {
      main: '#10b981',
      light: '#ecfdf5'
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      fontSize: '2.25rem',
      color: '#0f172a'
    },
    h2: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      fontSize: '1.75rem',
      color: '#0f172a'
    },
    h3: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 600,
      fontSize: '1.375rem',
      color: '#0f172a'
    },
    h4: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#0f172a'
    },
    h5: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      color: '#0f172a'
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      color: '#334155'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#475569'
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // Natural text case (not uppercase)
      fontSize: '0.875rem'
    }
  },
  shape: {
    borderRadius: 8 // Curved corners everywhere for premium feeling
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '6px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)', // Smooth modern gradient prefixing royal colors
          color: '#ffffff',
          '&:hover': {
            background: '#1e40af'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.02)', // Subtle shadow
          border: '1px solid #f1f5f9',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05), 0 2px 10px 0 rgba(0, 0, 0, 0.03)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#475569',
          borderBottom: '2px solid #e2e8f0'
        },
        root: {
          borderBottom: '1px solid #f1f5f9',
          padding: '12px 16px'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: 'none',
          borderBottom: '1px solid #e2e8f0'
        }
      }
    }
  }
});
