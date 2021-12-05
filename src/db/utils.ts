import type { Card } from 'schemas/card';
import { OPERATIONS } from './consts';
import { RequireOne, entries } from 'helpers';

export function toDatabaseFormat(fields: Record<string, any>): {
  [key: string]: string | number | null;
} {
  let data: { [key: string]: string | number | null } = {};
  for (let [key, val] of entries(fields)) {
    let value = val;
    if (typeof value === 'undefined') value = null;
    else if (Array.isArray(value)) value = val.join(',');
    else if (value instanceof Object) value = JSON.stringify(value);
    data[key] = value;
  }
  return data;
}

export function cardFieldsToQuery(
  fields: RequireOne<Card, 'cardId'>,
  queryType: OPERATIONS.INSERT | OPERATIONS.UPDATE,
  fieldsToUse?: string[]
): { query: string; data: (string | number | null)[]; names: string[] } {
  let normalizedFields = toDatabaseFormat(fields);
  if (fieldsToUse) {
    normalizedFields = fieldsToUse.reduce(
      (acc, field) => ({ ...acc, [field]: normalizedFields[field] }),
      {}
    );
  }
  const { names, data } = entries(normalizedFields).reduce<{
    names: string[];
    data: (string | number | null)[];
  }>(
    (acc, [key, val]) => ({
      names: [...acc.names, key],
      data: [...acc.data, val],
    }),
    { names: [], data: [] }
  );

  switch (queryType) {
    case 'INSERT':
      const placeholders = new Array(names.length).fill('?').join(',');
      const insert = `INSERT OR IGNORE INTO cards (${names.join(',')}) VALUES (${placeholders})`;
      return { query: insert, data, names };
    case 'UPDATE':
      const set = names.map((name) => `${name} = ?`).join(',');
      const update = `UPDATE cards SET ${set} WHERE cardId = ?`;
      return { query: update, data: [...data, fields.cardId], names };
    default:
      throw new Error('Invalid query type');
  }
}

// Creates an array of table delete queries
export const deleteTableQueries = (tables: string[]) => {
  return tables.map((table) => `DROP TABLE IF EXISTS ${table}`).join(';');
};
