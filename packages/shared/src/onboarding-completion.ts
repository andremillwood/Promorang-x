export function hasCompletedOnboarding(
  preferences?: { preferred_categories?: string[] | null; preferredCategories?: string[] | null } | null,
): boolean {
  const categories = preferences?.preferred_categories ?? preferences?.preferredCategories ?? [];
  return categories.length > 0;
}
