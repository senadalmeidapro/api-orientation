export function trimString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.trim();
}
