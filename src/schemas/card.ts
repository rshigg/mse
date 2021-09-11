export type Card = {
  card_id: string;
  set_id: string;
  name: string;
  mana_cost: string;
  cmc: number;
  colors: string[];
  color_identity: string[];
  type_line: string;
  rarity: string;
  text: string;
  flavor_text: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  artist: string;
  border_color: string;
  tag?: string;
};

export const cardSchema = `
  card_id TEXT PRIMARY KEY,
  set_id TEXT NOT NULL,
  name TEXT DEFAULT '',
  mana_cost TEXT DEFAULT '',
  cmc REAL DEFAULT 0.0,
  colors TEXT DEFAULT 'c',
  color_identity TEXT DEFAULT 'c',
  type_line TEXT DEFAULT '',
  rarity TEXT DEFAULT 'common',
  text TEXT DEFAULT '',
  flavor_text TEXT DEFAULT '',
  power TEXT,
  toughness TEXT,
  loyalty TEXT,
  artist TEXT DEFAULT '',
  border_color TEXT DEFAULT 'black',
  tag TEXT,
  FOREIGN KEY (set_id) REFERENCES sets(set_id)
`;
