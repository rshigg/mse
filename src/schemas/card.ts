const borderColor = {
  black: 'black',
  silver: 'silver',
  white: 'white',
  borderless: 'borderless',
  gold: 'gold',
};

export type Card = {
  cardId: string;
  projectId: string;
  projectCode: string;
  name: string;
  manaCost: string;
  cmc: number;
  colors: string;
  colorIdentity: string;
  typeLine: string;
  rarity: string;
  text: string;
  flavorText?: string | null;
  power?: string | null;
  toughness?: string | null;
  loyalty?: string | null;
  artist: string;
  borderColor: string;
  tag?: string;
  notes?: string;
  createdAt?: string;
};

export const cardDefaultValues: Omit<Card, 'cardId' | 'projectId' | 'projectCode'> = {
  name: '',
  manaCost: '',
  cmc: 0,
  colors: '',
  colorIdentity: '',
  typeLine: '',
  rarity: 'common',
  text: '',
  flavorText: '',
  artist: '',
  borderColor: borderColor.black,
  tag: '',
  notes: '',
};

export type SortableFields = keyof Omit<
  Card,
  'cardId' | 'projectId' | 'projectCode' | 'loyalty' | 'artist' | 'notes'
>;

// DB Schemas

// the explicit type is to make sure that cardFields has
// all the same fields as Card
export const cardFields: Record<keyof Card, string> = {
  cardId: `TEXT NOT NULL UNIQUE`,
  projectId: `TEXT NOT NULL`,
  projectCode: `TEXT NOT NULL REFERENCES projects(code) ON UPDATE CASCADE ON DELETE CASCADE`,
  name: `TEXT DEFAULT ''`,
  manaCost: `TEXT DEFAULT ''`,
  cmc: `REAL DEFAULT 0`,
  colors: `TEXT DEFAULT ''`,
  colorIdentity: `TEXT DEFAULT ''`,
  typeLine: `TEXT DEFAULT ''`,
  rarity: `TEXT DEFAULT 'common'`,
  text: `TEXT DEFAULT ''`,
  flavorText: `TEXT DEFAULT ''`,
  power: `TEXT`,
  toughness: `TEXT`,
  loyalty: `TEXT`,
  artist: `TEXT DEFAULT ''`,
  borderColor: `TEXT DEFAULT ${borderColor.black}`,
  tag: `TEXT`,
  notes: `TEXT DEFAULT ''`,
  createdAt: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
};

export const internalFields = {
  id: 'INTEGER PRIMARY KEY',
};

export const ftsFields = {
  cardId: 'UNINDEXED',
  projectCode: 'UNINDEXED',
  name: '',
  typeLine: '',
  text: '',
  flavorText: '',
  artist: '',
  tag: '',
};

// DB Triggers
const ftsColumns = Object.keys(ftsFields);
const fieldNames = ftsColumns.join(', ');
const newFields = ftsColumns.map((f) => `new.${f}`).join(', ');
const oldFields = ftsColumns.map((f) => `old.${f}`).join(', ');

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
