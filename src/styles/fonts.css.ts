import { fontFace, globalFontFace, style } from '@vanilla-extract/css';

globalFontFace('Inter', {
  src: `url('https://rsms.me/inter/inter.css')`,
  fontDisplay: 'swap',
});

const belerenBoldFF = fontFace({
  src: `local('Beleren'),
  url('/fonts/beleren-bold.woff2') format('woff2'),
  url('/fonts/beleren-bold.woff') format('woff')`,
  fontDisplay: 'block',
});

export const belerenBold = style({
  fontFamily: belerenBoldFF,
});

const belerenSmallCapsFF = fontFace({
  src: `local('Beleren Small Caps'), 
  url('/fonts/belerensmallcaps-bold.woff2') format('woff2'),
  url('/fonts/belerensmallcaps-bold.woff') format('woff')`,
  fontDisplay: 'block',
});

export const belerenSmallCaps = style({
  fontFamily: belerenSmallCapsFF,
});

const mplantinFF = fontFace({
  src: `local('MPlantin'), 
  url('/fonts/mplantin.woff2') format('woff2'),
  url('/fonts/mplantin.woff') format('woff')`,
  fontDisplay: 'block',
});

export const mplantin = style({
  fontFamily: mplantinFF,
});

const gothamFF = fontFace({
  src: `local('Gotham-Medium'), 
  url('/fonts/Gotham-Medium.woff2') format('woff2'),
  url('/fonts/Gotham-Medium.woff') format('woff')`,
  fontDisplay: 'block',
});

export const gotham = style({
  fontFamily: gothamFF,
});

const relayFF = fontFace({
  src: `local('Relay-Medium'), 
  url('/fonts/Relay-Medium.woff2') format('woff2'),
  url('/fonts/Relay-Medium.woff') format('woff')`,
  fontDisplay: 'block',
});

export const relay = style({
  fontFamily: relayFF,
});
