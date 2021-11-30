import type { Card } from 'schemas/card';

export type RequireOne<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} & {
  [P in K]-?: T[P];
};

export function toDatabaseFormat(
  fields: RequireOne<Card, 'cardId'>
): Array<string | number | null> {
  const vals = Object.values(fields);
  const fieldData = vals.map((data) => {
    if (Array.isArray(data)) {
      return data.join(',');
    }
    return data;
  });
  return fieldData;
}

export function cardFieldsToQuery(
  fields: RequireOne<Card, 'cardId'>,
  queryType: 'INSERT' | 'UPDATE' | 'DELETE'
) {
  const fieldNames = Object.keys(fields);
  const fieldData = toDatabaseFormat(fields);
  switch (queryType) {
    case 'INSERT':
      const placeholders = new Array(fieldNames.length).fill('?').join(',');
      return [`INSERT INTO cards (${fieldNames.join(',')}) VALUES (${placeholders})`, fieldData];
    case 'UPDATE':
      const set = fieldNames.map((fieldName) => `${fieldName} = ?`).join(',');
      return [`UPDATE cards SET ${set}`, fieldData];
    case 'DELETE':
      return [`DELETE FROM cards WHERE cardId = ?`, [fields.cardId]];
    default:
      throw new Error('Invalid query type');
  }
}
