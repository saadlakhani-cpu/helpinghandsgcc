const COUNTRY_FLAGS: Record<string, string> = {
  KSA: "🇸🇦",
  UAE: "🇦🇪",
  Qatar: "🇶🇦",
  Kuwait: "🇰🇼",
  Bahrain: "🇧🇭",
  Oman: "🇴🇲",
};

const COUNTRY_LABELS: Record<string, string> = {
  KSA: "Saudi Arabia",
  UAE: "United Arab Emirates",
  Qatar: "Qatar",
  Kuwait: "Kuwait",
  Bahrain: "Bahrain",
  Oman: "Oman",
};

export function getCountryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🌍";
}

export function getCountryLabel(country: string): string {
  return COUNTRY_LABELS[country] ?? country;
}

export function formatLocation(city: string, country: string): string {
  return `${city}, ${country}`;
}
