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

type BuiltInRule = {
  pattern: RegExp;
  category: "Finance" | "AI";
  subcategory: string;
};

const BUILT_IN_RULES: BuiltInRule[] = [
  { pattern: /\b(prompt|llm|generative ai|chatgpt|copilot)\b/i, category: "AI", subcategory: "General" },
  { pattern: /\b(ai engineer|ml engineer|machine learning|deep learning|nlp|mlops|artificial intelligence)\b/i, category: "AI", subcategory: "Engineering" },
  { pattern: /\b(data scientist|data engineer|data analyst|business intelligence|power bi|tableau)\b/i, category: "AI", subcategory: "Data" },
  { pattern: /\b(accountant|accounting|accounts payable|accounts receivable|general ledger|bookkeeper)\b/i, category: "Finance", subcategory: "Accounting" },
  { pattern: /\b(fp&a|financial planning|financial analysis|budget|budgeting|forecast|forecasting|variance analysis)\b/i, category: "Finance", subcategory: "FP&A" },
  { pattern: /\b(treasury|cash management|liquidity|forex|hedging)\b/i, category: "Finance", subcategory: "Treasury" },
  { pattern: /\b(audit|auditor|assurance|internal controls|sox|grc|governance|compliance)\b/i, category: "Finance", subcategory: "Audit & GRC" },
  { pattern: /\b(tax|vat|zakat|transfer pricing)\b/i, category: "Finance", subcategory: "Tax" },
  { pattern: /\b(finance manager|financial controller|finance director|chief financial officer|cfo|controller)\b/i, category: "Finance", subcategory: "Financial Control" },
];

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

function inferFromBuiltInRules(text: string): CategoryResult | null {
  for (const rule of BUILT_IN_RULES) {
    if (rule.pattern.test(text)) {
      return { category: rule.category, subcategory: rule.subcategory };
    }
  }

  return null;
}

export function categorizeJob(
  title: string,
  description: string | null | undefined,
  keywords: KeywordRow[]
): CategoryResult | null {
  const builtInTitleMatch = inferFromBuiltInRules(title);
  if (builtInTitleMatch) return builtInTitleMatch;

  const titleMatch = findMatch(title, keywords, "title");
  if (titleMatch) return titleMatch;

  const descriptionText = description ?? "";

  const builtInDescriptionMatch = inferFromBuiltInRules(descriptionText);
  if (builtInDescriptionMatch) return builtInDescriptionMatch;

  const descriptionMatch = findMatch(descriptionText, keywords, "description");
  if (descriptionMatch) return descriptionMatch;

  return null;
}
