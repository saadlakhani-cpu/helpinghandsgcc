export const SITE_NAME = "Gulf Finance & AI Jobs";
export const CONTACT_EMAIL = "adminhhgcc@gmail.com";
export const CV_REVIEW_FORM_URL =
  process.env.NEXT_PUBLIC_CV_REVIEW_FORM_URL ||
  `mailto:${CONTACT_EMAIL}?subject=CV%20Review%20Request`;
export const RECRUITER_FORM_URL =
  process.env.NEXT_PUBLIC_RECRUITER_FORM_URL ||
  `mailto:${CONTACT_EMAIL}?subject=Recruiter%20Registration%20Request`;

export const GULF_COUNTRIES = [
  { value: "", label: "All Countries" },
  { value: "KSA", label: "KSA" },
  { value: "UAE", label: "UAE" },
  { value: "Qatar", label: "Qatar" },
  { value: "Kuwait", label: "Kuwait" },
  { value: "Bahrain", label: "Bahrain" },
  { value: "Oman", label: "Oman" },
] as const;

export const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Finance", label: "Finance" },
  { value: "AI", label: "AI" },
] as const;
