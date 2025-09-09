/**
 * Utility function for combining class names
 * Similar to clsx but lightweight
 */

export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
