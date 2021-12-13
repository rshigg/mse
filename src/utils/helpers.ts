import { Project } from 'schemas/project';
import { Card, cardDefaultValues } from 'schemas/card';
import { ScryfallCard } from 'schemas/scryfall';
import { v4 as uuid } from 'uuid';

export type RequireOne<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} & {
  [P in K]-?: T[P];
};

type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];
export function entries<T>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}

export const constructCard = (project: Project, fields: Partial<Card> = {}): Card => {
  const card: Card = {
    cardId: fields.cardId || uuid(),
    projectId: project.projectId,
    projectCode: project.code,
    ...cardDefaultValues,
    ...fields,
  };
  return card;
};

export const cardFromScryfall = (sfJSON: ScryfallCard): Omit<Card, 'projectId'> => {
  // TODO: handle DFCs
  return {
    cardId: sfJSON.id,
    projectCode: sfJSON.set,
    name: sfJSON.name,
    manaCost: sfJSON.mana_cost,
    cmc: sfJSON.cmc,
    colors: sfJSON.colors?.join(',') || '',
    colorIdentity: sfJSON.color_identity?.join(',') || '',
    typeLine: sfJSON.type_line,
    rarity: sfJSON.rarity,
    text: sfJSON.oracle_text,
    flavorText: sfJSON.flavor_text || null,
    power: sfJSON.power || null,
    toughness: sfJSON.toughness || null,
    loyalty: sfJSON.loyalty || null,
    artist: sfJSON.artist,
    borderColor: sfJSON.border_color,
    tag: sfJSON.collector_number,
  };
};

// removes curly brackets from mana cost
export const cleanManaCost = (manaCost: string): string => {
  return manaCost.replace(/[{}]/g, '');
};
