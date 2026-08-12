// Remove sensitive information that is not needed for categorization.
export function redactTransactionDescription(
  description: string
): string {
  if (!description || !description.trim()) {
    return '';
  }

  let sanitized = description.trim();

  // Remove long numeric values such as account numbers and transaction IDs.
  sanitized = sanitized.replace(/\b\d{6,}\b/g, ' ');

  // Remove common card and account number formats.
  sanitized = sanitized.replace(
    /\b(?:\d{4}[-\s]?){2,}\d{2,4}\b/g,
    ' '
  );

  // Remove email addresses.
  sanitized = sanitized.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    ' '
  );

  // Remove phone numbers.
  sanitized = sanitized.replace(
    /\b(?:\+?\d[\d\s-]{8,}\d)\b/g,
    ' '
  );

  // Clean up extra whitespace.
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}