export const fieldsToSchema = (fields: object) =>
  Object.entries(fields)
    .map(([key, value]) => `${key} ${value}`)
    .join(', ');
