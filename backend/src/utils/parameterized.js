export const createRowMapper = (fieldMap) => (row) =>
  Object.fromEntries(
    Object.entries(fieldMap).map(([responseKey, resolver]) => [
      responseKey,
      typeof resolver === "function" ? resolver(row) : row[resolver],
    ]),
  );

export const buildParameterizedUpdate = (data, fieldMap, startIndex = 1) => {
  const entries = Object.entries(data).filter(([key]) => fieldMap[key]);

  return {
    entries,
    setClauses: entries.map(
      ([key], index) => `${fieldMap[key]} = $${startIndex + index}`,
    ),
    values: entries.map(([, value]) => value),
    nextIndex: startIndex + entries.length,
  };
};
