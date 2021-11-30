import { Card } from './schemas/card';
import { ScryfallCard } from './schemas/scryfall';

export const cardFromScryfall = (sfJSON: ScryfallCard): Card => {
  return {
    cardId: sfJSON.id,
    projectId: sfJSON.set_id,
    name: sfJSON.name,
    manaCost: sfJSON.mana_cost,
    cmc: sfJSON.cmc,
    colors: sfJSON.colors.join(','),
    colorIdentity: sfJSON.color_identity.join(','),
    typeLine: sfJSON.type_line,
    rarity: sfJSON.rarity,
    text: sfJSON.oracle_text,
    flavorText: sfJSON.flavor_text,
    power: sfJSON.power,
    toughness: sfJSON.toughness,
    loyalty: sfJSON.loyalty,
    artist: sfJSON.artist,
    borderColor: sfJSON.border_color,
  };
};
