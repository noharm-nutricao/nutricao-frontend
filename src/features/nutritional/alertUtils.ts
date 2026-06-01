/** Remove numeric exam values from alert text (LGPD). */
export function sanitizeAlertDescription(desc: string): string {
  if (!desc) return "";
  return desc
    .replace(
      /\d+([.,]\d+)?(\s*(mg|g|mmol|mEq|%|\/dL|dL|UI|U|g\/dL|mg\/dL))?/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Short label for badges — trigger name only, no numeric values. */
export function alertDescriptionLabel(desc: string): string {
  const sanitized = sanitizeAlertDescription(desc);
  const firstWord = sanitized.split(/\s+/)[0];
  return firstWord || sanitized || desc.split(/\s+/)[0] || desc;
}
