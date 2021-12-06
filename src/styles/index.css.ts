import { globalStyle } from '@vanilla-extract/css';

const backupFonts = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`;

globalStyle('html, body', {
  margin: 0,
  fontFamily: `'Inter', ${backupFonts}`,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  '@supports': {
    '(font-variation-settings: normal)': {
      fontFamily: `'Inter var', ${backupFonts}`,
    },
  },
});

// https://adrianroselli.com/2020/11/under-engineered-responsive-tables.html
globalStyle(`[role='region'][aria-labelledby][tabindex]`, {
  overflow: 'auto',
});

globalStyle(`[role='region'][aria-labelledby][tabindex]:focus`, {
  outline: '0.1em solid rgba(0, 0, 0, 0.1)',
});
