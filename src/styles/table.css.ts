import { style } from '@vanilla-extract/css';

export const table = style({
  boxSizing: 'border-box',
  width: '100%',
  borderCollapse: 'collapse',
});

export const thead = style({
  position: 'sticky',
  top: 0,
  zIndex: 2,
});

export const th = style({
  borderBottom: '1px solid hsl(220, 13%, 91%)',
  padding: '0.5rem 0.75rem',
  textAlign: 'left',
  textTransform: 'uppercase',
  backgroundColor: 'hsl(210, 20%, 98%)',
});

export const td = style({
  borderBottom: '1px solid hsl(220, 13%, 91%)',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8rem',
  lineHeight: '1rem',
  whiteSpace: 'nowrap',
});
