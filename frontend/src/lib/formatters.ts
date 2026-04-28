/**
 * Formats an ISO date string (yyyy-MM-dd) into the locale-aware display
 * string used across content cards, e.g. "15.04.2026" for tr-TR.
 *
 * Falls back to the raw input when the value is already a display string
 * or cannot be parsed, so existing pre-formatted dates pass through
 * unchanged.
 */
export function formatUploadDate(value: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('tr-TR');
}
