/**
 * Compares two strings in constant time to prevent timing attacks.
 *
 * @param a The first string (e.g., user input)
 * @param b The second string (e.g., secret)
 * @returns true if the strings are strictly equal, false otherwise
 */
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  let mismatch = a.length === b.length ? 0 : 1;

  if (mismatch) {
    // If lengths differ, compare 'a' with itself to ensure the comparison
    // takes time proportional to the length of 'a'. This prevents early exit
    // timing leaks.
    b = a;
  }

  for (let i = 0; i < a.length; i++) {
    mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }

  return mismatch === 0;
}
