export type KeywordRow = {
  keyword: string;
  category: string;
  subcategory: string;
  match_field: string;
};

export type CategoryResult = {
  category: string;
  subcategory: string;
};

function matchesField(
  matchField: string,
  target: "title" | "description"
): boolean {
  if (matchField === "Both") return true;
  if (matchField === "Title" && target === "title") return true;
  if (matchField === "Description" && target === "description") return true;
  return false;
}

function findMatch(
  text: string,
  keywords: KeywordRow[],
  target: "title" | "description"
): CategoryResult | null {
  const haystack = text.toLowerCase();

  const sorted = [...keywords].sort(
    (a, b) => b.keyword.length - a.keyword.length
  );

  for (const row of sorted) {
    if (!matchesField(row.match_field, target)) continue;
    if (haystack.includes(row.keyword.toLowerCase())) {
      return { category: row.category, subcategory: row.subcategory };
    }
  }

  return null;
}

export function categorizeJob(
  title: string,
  description: string | null | undefined,
  keywords: KeywordRow[]
): CategoryResult {
  const titleMatch = findMatch(title, keywords, "title");
  if (titleMatch) return titleMatch;

  const descriptionText = description ?? "";
  const descriptionMatch = findMatch(descriptionText, keywords, "description");
  if (descriptionMatch) return descriptionMatch;

  return { category: "Finance", subcategory: "General" };
}
