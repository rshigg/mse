import { globalStyle, style } from '@vanilla-extract/css';
import { belerenBold, mplantin } from './fonts.css';

export const cardRender = style({
  width: '63mm',
  height: 'auto',
});

export const titleText = style([
  belerenBold,
  {
    fontSize: '2.5em',
    letterSpacing: '-0.01ch',
  },
]);

export const typelineText = style([
  belerenBold,
  {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '2em',
    letterSpacing: '0.045ch',
  },
]);

export const contentEditable = style({
  transition: 'all 0.3s ease',
  ':focus': {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(128, 21, 228, 0.4), 0 0 3px 3px rgba(128, 21, 228, 0.3)',
  },
  selectors: {
    '&.nowrap': {
      whiteSpace: 'nowrap',
    },
  },
});

export const textboxContainer = style([
  mplantin,
  {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr auto auto auto 1fr',
    height: '100%',
    padding: '0.1em 0.5em',
    selectors: {
      '&.stamp-visible': {
        paddingBottom: '1em',
      },
    },
  },
]);

export const rulesText = style({
  gridRow: 2,
  paddingRight: '0.5em',
  fontSize: '2.3em',
  lineHeight: 1,
  letterSpacing: '0.01ch',
});

export const flavorText = style({
  gridRow: 4,
  fontSize: '2.1em',
  fontStyle: 'italic',
  lineHeight: 1,
});

export const ftSeparator = style({
  gridRow: 3,
  border: 0,
  height: '0.15em',
  margin: '1em 0.5em',
  backgroundImage: `linear-gradient(
    to right,
    rgba(0, 0, 0, 0.025),
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.025)
  )`,
});

globalStyle(`${cardRender} foreignObject div`, {
  height: '100%',
});

globalStyle(`${cardRender} ${contentEditable} p:not(:last-of-type)`, {
  marginBottom: '0.25em',
});

globalStyle('#test-image', {
  opacity: 0.25,
  pointerEvents: 'none',
  display: 'none',
});
