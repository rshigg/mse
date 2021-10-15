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
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  artist: string;
  border_color: string;
  tag?: string;
  notes?: string;
};

export const cardDefaultValues: Partial<Card> = {
  name: '',
  mana_cost: '',
  cmc: 0,
  colors: [],
  color_identity: [],
  type_line: '',
  rarity: 'common',
  text: '',
  flavor_text: '',
  artist: '',
  border_color: 'black',
  notes: '',
};

export const cardSchema = `
  data JSON,
  card_id TEXT GENERATED ALWAYS AS (json_extract(data, '$.card_id')) VIRTUAL NOT NULL,
  set_id TEXT GENERATED ALWAYS AS (json_extract(data, '$.set_id')) VIRTUAL NOT NULL,
  FOREIGN KEY(set_id) REFERENCES sets(set_id) ON DELETE CASCADE
`;
