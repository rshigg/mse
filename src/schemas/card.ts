export type Card = {
  cardId: string;
  projectId: string;
  name: string;
  manaCost: string;
  cmc: number;
  colors: string;
  colorIdentity: string;
  typeLine: string;
  rarity: string;
  text: string;
  flavorText?: string;
  power?: string | null;
  toughness?: string | null;
  loyalty?: string | null;
  artist: string;
  borderColor: string;
  tag?: string;
  notes?: string;
};

export const cardDefaultValues: Partial<Card> = {
  name: '',
  manaCost: '',
  cmc: 0,
  colors: '',
  colorIdentity: '',
  typeLine: '',
  rarity: 'common',
  text: '',
  flavorText: '',
  power: null,
  toughness: null,
  loyalty: null,
  artist: '',
  borderColor: 'black',
  tag: '',
  notes: '',
};

// DB Schemas
const fieldsToSchema = (fields: object) =>
  Object.entries(fields)
    .map(([key, value]) => `${key} ${value}`)
    .join(', ');

const commonFields = {
  name: `TEXT DEFAULT ''`,
  manaCost: `TEXT DEFAULT ''`,
  typeLine: `TEXT DEFAULT ''`,
  text: `TEXT DEFAULT ''`,
  flavorText: `TEXT DEFAULT ''`,
  artist: `TEXT DEFAULT ''`,
  tag: `TEXT`,
  notes: `TEXT DEFAULT ''`,
};

// the explicit type is to make sure that cardFields has
// all the same fields as Card
const cardFields: Record<keyof Card, string> = {
  cardId: `TEXT NOT NULL`,
  projectId: `TEXT NOT NULL`,
  cmc: `REAL DEFAULT 0`,
  colors: `TEXT DEFAULT ''`,
  colorIdentity: `TEXT DEFAULT ''`,
  rarity: `TEXT DEFAULT 'common'`,
  power: `TEXT`,
  toughness: `TEXT`,
  loyalty: `TEXT`,
  borderColor: `TEXT DEFAULT 'black'`,
  ...commonFields,
};

export const cardSchema = fieldsToSchema({ id: 'INTEGER PRIMARY KEY', ...cardFields });

export const ftsCardSchema = `
  ${Object.keys(commonFields).join(',\n')},
  content='cards',
  content_rowid='id'
`;

// DB Triggers
const fields = Object.keys(commonFields);
const fieldNames = fields.join(', ');
const newFields = fields.map((f) => `new.${f}`).join(', ');
const oldFields = fields.map((f) => `old.${f}`).join(', ');

export const cardTriggers = `
  CREATE TRIGGER IF NOT EXISTS cards_ai AFTER INSERT ON cards
    BEGIN
      INSERT INTO cards_fts(rowid, ${fieldNames}) 
      VALUES (new.id, ${newFields});
    END;

  CREATE TRIGGER IF NOT EXISTS cards_ad AFTER DELETE ON cards
    BEGIN
      INSERT INTO cards_fts(cards_fts, rowid, ${fieldNames}) 
      VALUES ('delete', old.id, ${oldFields});
    END;

  CREATE TRIGGER IF NOT EXISTS cards_au AFTER UPDATE ON cards
    BEGIN
      INSERT INTO cards_fts(cards_fts, rowid, ${fieldNames}) 
      VALUES ('delete', old.id, ${oldFields});
      INSERT INTO cards_fts(rowid, ${fieldNames}) 
      VALUES (new.id, ${newFields});
    END;
`;
