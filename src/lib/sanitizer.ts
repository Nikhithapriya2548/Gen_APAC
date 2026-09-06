/**
 * Strips undefined values and non-serializable fields from an object
 * before saving to Firestore to prevent driver crash or rejection.
 */
export function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizePayload(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.filter((item) => item !== undefined);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
