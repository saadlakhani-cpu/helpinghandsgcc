export const SITE_NAME = "Gulf Finance & AI Jobs";
export const CONTACT_EMAIL = "adminhhgcc@gmail.com";
export const CV_REVIEW_FORM_URL =
  process.env.NEXT_PUBLIC_CV_REVIEW_FORM_URL ||
  "https://docs.google.com/forms/d/e/1FAIpQLScLE8DDCoR5fwD-DCp0eFnKqjWj1G19nvsXX0_eIQNUlFJZDQ/viewform?usp=header";
export const RECRUITER_FORM_URL =
  process.env.NEXT_PUBLIC_RECRUITER_FORM_URL ||
  "/recruiters";

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
