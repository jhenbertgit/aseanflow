/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

/**
 * Generate a unique slug by appending a random suffix if needed
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[] = [],
): string {
  const baseSlug = generateSlug(text);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Append random suffix if slug exists
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${suffix}`;
}

/**
 * Validate if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
