export type CardSet = {
  set_id: string;
  name: string;
  code: string;
  lang: string;
};

export const setDefaultValues: CardSet = {
  set_id: '',
  name: '',
  code: '',
  lang: 'en',
};

export const setSchema = `
  set_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code CHAR(3) NOT NULL,
  lang CHAR(2) DEFAULT 'en'
`;
