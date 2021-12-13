import { entries } from 'utils/helpers';
import { OPERATIONS } from 'db/consts';

type Fields = Record<
  string,
  string | number | unknown[] | Record<string, unknown> | null | undefined
>;
type FieldValues = string | number | null;
type FormattedFields = Record<string, FieldValues>;

export function toDatabaseFormat(fields: Fields): FormattedFields {
  const data: FormattedFields = {};
  for (const [key, val] of entries(fields)) {
    let value = val;
    if (typeof value === 'undefined') value = null;
    else if (Array.isArray(value)) value = value.join(',');
    else if (value instanceof Object) value = JSON.stringify(value);
    data[key] = value;
  }
  return data;
}

export function fieldsToQuery(
  fields: Fields,
  queryType: OPERATIONS.INSERT | OPERATIONS.UPDATE,
  table: string,
  idField: string,
  fieldsToUse?: string[]
): { query: string; data: FieldValues[]; names: string[] } {
  let normalizedFields = toDatabaseFormat(fields);
  if (fieldsToUse) {
    normalizedFields = fieldsToUse.reduce(
      (acc, field) => ({ ...acc, [field]: normalizedFields[field] }),
      {}
    );
  }
  const { names, data } = entries(normalizedFields).reduce<{
    names: string[];
    data: FieldValues[];
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
      const insert = `INSERT OR IGNORE INTO ${table} (${names.join(',')}) VALUES (${placeholders})`;
      return { query: insert, data, names };
    case 'UPDATE':
      const set = names.map((name) => `${name} = ?`).join(',');
      const update = `UPDATE ${table} SET ${set} WHERE ${idField} = ?`;
      return { query: update, data: [...data, normalizedFields[idField]], names };
    default:
      throw new Error('Invalid query type');
  }
}

// Creates an array of table delete queries
export const deleteTableQueries = (tables: string[]) => {
  return tables.map((table) => `DROP TABLE IF EXISTS ${table}`).join(';');
};

export const objectToSchema = (fields: Fields) =>
  entries(fields)
    .map(([key, value]) => `${key}${value ? ` ${value}` : ''}`)
    .join(',\n');

export const formatExecOutput = (
  output: [{ columns: string[]; values: [string[]] }]
): Record<string, string[]> => {
  const [{ columns, values }] = output;
  return columns.reduce((data, column, i) => ({ ...data, [column]: values[i] }), {});
};
