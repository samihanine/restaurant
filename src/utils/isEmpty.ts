export const isEmpty = (value: unknown): boolean => {
  if (typeof value === 'undefined') return true;

  if (typeof value === 'string') {
    if (value.trim().length === 0) return true;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return true;
  }

  if (typeof value === 'object') {
    if (Object.keys(value as object).length === 0) return true;
  }

  return !value;
};
