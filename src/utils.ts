import { Card } from './schemas/card';
import { ScryfallCard } from './schemas/scryfall';

export const logWorkerMessage = (msg: MessageEvent) => {
  const { type, ...data } = msg.data;
  const fromWorker = msg.currentTarget instanceof Worker;

  console.group();
  console.info(
    `%cMessage ${fromWorker ? 'from' : 'to'} worker`,
    `
    border: 2px solid ${fromWorker ? 'blue' : 'red'};
    padding: 4px 8px;
    border-radius: 4px;
    `
  );
  console.info('type: ', type);
  console.info('data', data);
  console.groupEnd();
};

export const cardFromScryfall = (sfJSON: ScryfallCard): Card => {
  return {
    card_id: sfJSON.id,
    set_id: sfJSON.set_id,
    name: sfJSON.name,
    mana_cost: sfJSON.mana_cost,
    cmc: sfJSON.cmc,
    colors: sfJSON.colors,
    color_identity: sfJSON.color_identity,
    type_line: sfJSON.type_line,
    rarity: sfJSON.rarity,
    text: sfJSON.oracle_text,
    flavor_text: sfJSON.flavor_text,
    power: sfJSON.power,
    toughness: sfJSON.toughness,
    loyalty: sfJSON.loyalty,
    artist: sfJSON.artist,
    border_color: sfJSON.border_color,
  };
};
