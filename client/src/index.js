import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import Color from 'color';
// import '@fontsource/inter';

/*----------------------------------------------------------------------------*/

function createPalette(color, back, name) {
  const palette = {};
  const top = Color(color);
  const bottom = Color(back);

  for (let i = 0; i < 1000; i += 50) {
    palette[i] = bottom.mix(top, Math.min(i / 900, 1)).hex();
  }

  palette.solidBg = `var(--joy-palette-${name}-900)`;
  palette.solidHoverBg = `var(--joy-palette-${name}-700)`;
  palette.solidActiveBg = `var(--joy-palette-${name}-600)`;
  palette.outlinedBorder = `var(--joy-palette-${name}-200)`;
  palette.outlinedActiveBorder = `var(--joy-palette-${name}-400)`;
  palette.outlinedColor = `var(--joy-palette-${name}-900)`;
  palette.outlinedHoverBg = `var(--joy-palette-${name}-200)`;
  palette.outlinedActiveBg = `var(--joy-palette-${name}-400)`;
  palette.softColor = `var(--joy-palette-${name}-800)`;
  palette.softBg = `var(--joy-palette-${name}-50)`;
  palette.softActiveBg = `var(--joy-palette-${name}-400)`;
  palette.plainColor = `var(--joy-palette-${name}-900)`;
  palette.plainActiveBg = `var(--joy-palette-${name}-200)`;

  if (name === "background") {
    palette.backdrop = "rgba(var(--joy-palette-neutral-darkChannel, 11 13 14) / 0.25)"
    palette.body = "var(--joy-palette-common-white, #FFF)"
    palette.darkChannel = "239 245 251"
    palette.level1 = "var(--joy-palette-neutral-100, #F0F4F8)"
    palette.level2 = "var(--joy-palette-neutral-200, #DDE7EE)"
    palette.level3 = "var(--joy-palette-neutral-300, #CDD7E1)"
    palette.lightChannel = "251 252 254"
    palette.mainChannel = "244 248 252"
    palette.outlinedActiveBg = "var(--joy-palette-background-400)"
    palette.outlinedActiveBorder = "var(--joy-palette-background-400)"
    palette.outlinedBorder = "var(--joy-palette-background-200)"
    palette.outlinedColor = "var(--joy-palette-background-900)"
    palette.outlinedHoverBg = "var(--joy-palette-background-200)"
    palette.plainActiveBg = "var(--joy-palette-background-200)"
    palette.plainColor = "var(--joy-palette-background-900)"
    palette.popup = "var(--joy-palette-common-white, #FFF)"
    palette.softActiveBg = "var(--joy-palette-background-400)"
    palette.softBg = "var(--joy-palette-background-200)"
    palette.softColor = "var(--joy-palette-background-800)"
    palette.solidActiveBg = "var(--joy-palette-background-600)"
    palette.solidBg = "var(--joy-palette-background-900)"
    palette.solidHoverBg = "var(--joy-palette-background-700)"
    palette.surface = "var(--joy-palette-background-900, #FBFCFE)"
    palette.tooltip = "var(--joy-palette-neutral-50, #636B74)"
  }

  return {
    [name]: palette,
  };
}

const fontSize = 14;
const htmlFontSize = 16;
const coef = fontSize / 14;

const theme = extendTheme({
  fontFamily: {
    display: 'IBM Plex Sans',
    body: 'IBM Plex Sans',
  },
  typography: {
    pxToRem: size => `${(size / htmlFontSize) * coef}rem`,
  },
  colorSchemes: {
    light: {
      palette: {
        ...createPalette('#318DC1', '#F8FBFF', 'primary'),
        ...createPalette('#CF6F33', '#F8FBFF', 'warning'),
        ...createPalette('#B9314F', '#F8FBFF', 'error'),
        ...createPalette('#2CB36B', '#F8FBFF', 'success'),
        ...createPalette('#1F2121', '#F8FBFF', 'neutral'),
        ...createPalette('#F8FBFF', '#FFFFFF', 'background'),
        common: {
          black: '#191919',
          white: "#F8FBFF",
        }
      }
    }
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState: { variant } }) => ({
          ...(variant === "solid" && {
            boxShadow: "0px 4px 0px 0px #0002",
          }),
          ...(variant === "outlined" && {
            borderRadius: 8,
            borderWidth: 2
          })
        })
      }
    },
    JoyIconButton: {
      styleOverrides: {
        root: ({ ownerState: { variant } }) => ({
          ...(variant === "solid" && {
            boxShadow: "0px 4px 0px 0px #0002",
          }),
          ...(variant === "outlined" && {
            borderRadius: 8,
            borderWidth: 2
          })
        })
      }
    },
    JoyDivider: {
      styleOverrides: {
        root: {
          "--Divider-thickness": "2px"
        }
      }
    },
    JoyCard: {
      styleOverrides: {
        root: ({ ownerState: { variant } }) => ({
          overflow: "hidden",
          borderRadius: 16,
          ...(variant === "outlined" && {
            borderWidth: 2,
            boxShadow: "0px 4px 0px 0px #0001",
          })
        })
      }
    },
    JoyInput: {
      styleOverrides: {
        root: ({ ownerState: { variant } }) => ({
          borderRadius: 8,
          borderWidth: 2,
          ...(variant !== 'soft' ? { boxShadow: "0px 4px 0px 0px #0001" } : undefined),
          paddingTop: 8,
          paddingBottom: 8,
        })
      }
    },
    JoyTextarea: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          borderWidth: 2,
          boxShadow: "0px 4px 0px 0px #0001",
          paddingTop: 8,
          paddingBottom: 8,
        }
      }
    },
    JoyMenu: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          borderWidth: 2,
          borderColor: "var(--joy-palette-neutral-100, #636B74)",
          boxShadow: "0px 4px 0px 0px #0001",
          padding: 8,
          gap: 3
        }
      }
    },
    JoyAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "--Avatar-ring": "0px 4px 0px 0px #0001",
        }
      }
    },
    JoyTypography: {
      styleOverrides: {
        root: ({ ownerState: { variant } }) => ({
          borderRadius: 4,
          ...(variant === "solid" && {
            boxShadow: "0px 4px 0px 0px #0002",
          }),
          ...(variant === "outlined" && {
            borderWidth: 2
          })
        })
      }
    }
  }
});

// console.log(theme);

/*----------------------------------------------------------------------------*/

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <CssVarsProvider theme={theme}>
      <App />
    </CssVarsProvider>
  </BrowserRouter>
);
