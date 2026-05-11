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

/**
 * Returns a safe avatar display string derived from the user's name when
 * the backend-provided avatarInitials is numeric or empty (registration bug).
 */
export function getAvatarInitials(name: string, avatarInitials?: string): string {
  if (avatarInitials && /^[A-Za-zÇĞİÖŞÜçğışöşü]/.test(avatarInitials)) {
    return avatarInitials.toUpperCase().slice(0, 2);
  }
  return (name ?? '?').charAt(0).toUpperCase();
}
