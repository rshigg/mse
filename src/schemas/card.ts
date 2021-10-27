export type Card = {
  cardId: string;
  projectId: string;
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
  cardId TEXT GENERATED ALWAYS AS (json_extract(data, '$.cardId')) VIRTUAL NOT NULL,
  projectId TEXT GENERATED ALWAYS AS (json_extract(data, '$.projectId')) VIRTUAL NOT NULL,
  FOREIGN KEY(projectId) REFERENCES sets(projectId) ON DELETE CASCADE
`;
