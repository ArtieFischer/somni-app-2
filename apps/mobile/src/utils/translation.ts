// Helper to ensure translation always returns a string
export const ensureString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
};