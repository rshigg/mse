import { globalStyle } from '@vanilla-extract/css';

globalStyle('body', {
  margin: 0,
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
  'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  // @ts-ignore
  '-webkit-font-smoothing': 'antialiased',
  '-moz-osx-font-smoothing': 'grayscale',
});

// https://adrianroselli.com/2020/11/under-engineered-responsive-tables.html
globalStyle(`[role='region'][aria-labelledby][tabindex]`, {
  overflow: 'auto',
});

globalStyle(`[role='region'][aria-labelledby][tabindex]:focus`, {
  outline: '0.1em solid rgba(0, 0, 0, 0.1)',
});
