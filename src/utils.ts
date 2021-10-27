import { Card } from './schemas/card';
import { ScryfallCard } from './schemas/scryfall';

export const cardFromScryfall = (sfJSON: ScryfallCard): Card => {
  return {
    cardId: sfJSON.id,
    projectId: sfJSON.set_id,
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
