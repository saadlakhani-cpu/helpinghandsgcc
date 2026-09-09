export const enquiryTopics = {
  individual: ["AI for Finance Professionals", "AI for Supply Chain", "AI for HR", "AI for Sales", "AI Productivity at Work"],
  corporate: ["Corporate AI Workshops", "AI for Finance Professionals", "AI for Supply Chain", "AI for HR", "AI for Sales"],
  solution: [
    "Finance reporting and workflow automation",
    "Document and invoice extraction",
    "Recruitment and CV workflows",
    "Internal knowledge assistants",
  ],
} as const;

export type EnquiryType = keyof typeof enquiryTopics;
export const enquiryLabels: Record<EnquiryType, string> = {
  individual: "Individual training",
  corporate: "Corporate training",
  solution: "AI solution",
};

export const enquiryStatuses = ["New", "Contacted", "Closed"] as const;

export function validateEnquiry(body: unknown) {
  if (!body || typeof body !== "object")
    throw new Error("Please complete the enquiry form.");
  const value = body as Record<string, unknown>;
  const field = (key: string, max: number) => {
    if (value[key] == null) return "";
    if (typeof value[key] !== "string" || value[key].length > max)
      throw new Error(`Please check ${key}.`);
    return value[key].trim();
  };
  const type = field("type", 20) as EnquiryType;
  if (!Object.prototype.hasOwnProperty.call(enquiryTopics, type))
    throw new Error("Choose an enquiry type.");
  const topic = field("topic", 120);
  if (!(enquiryTopics[type] as readonly string[]).includes(topic))
    throw new Error("Choose a valid topic.");
  const name = field("name", 100);
  const email = field("email", 254).toLowerCase();
  const company = field("company", 150);
  const message = field("message", 3000);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Enter your name and a valid email address.");
  if (type !== "individual" && !company)
    throw new Error("Enter your company name.");
  if (value.consent !== true)
    throw new Error("Please agree to be contacted about this enquiry.");
  return {
    type,
    topic,
    name,
    email,
    company: company || null,
    message: message || null,
    consent_at: new Date().toISOString(),
  };
}
