export const trainingTracks = [
  {
    slug: "finance",
    title: "AI for Finance",
    topic: "AI for Finance Professionals",
    image: "finance",
    alt: "Illustrative finance professional reviewing a spreadsheet",
    summary: "Put AI to work in reporting, budgeting and financial analysis.",
    audience: "Accountants, analysts and finance teams",
    topics: ["Reporting and variance commentary", "Budgeting and forecasting workflows", "Reconciliation and spreadsheet analysis"],
    exercise: "Explore how to turn a sample financial report into a first draft of management commentary, then check it against the source figures.",
  },
  {
    slug: "supply-chain",
    title: "AI for Supply Chain",
    topic: "AI for Supply Chain",
    image: "supply-chain",
    alt: "Illustrative supply chain planners reviewing inventory in a warehouse office",
    summary: "Explore AI for demand planning, inventory and procurement.",
    audience: "Supply chain, procurement and operations teams",
    topics: ["Demand and inventory analysis", "Procurement and supplier comparisons", "Operational reporting and planning"],
    exercise: "Use a sample inventory report to explore stock exceptions and draft a supplier comparison with traceable source information.",
  },
  {
    slug: "hr",
    title: "AI for HR",
    topic: "AI for HR",
    image: "hr",
    alt: "Illustrative HR professional discussing an employee onboarding plan",
    summary: "Support onboarding, policies and workforce reporting with AI.",
    audience: "HR professionals, recruiters and people managers",
    topics: ["Job descriptions and onboarding plans", "HR policy drafts and employee communication", "Workforce reporting and responsible AI use"],
    exercise: "Draft an onboarding plan from a fictional role brief, then review it for clarity, fairness and privacy. People decisions remain with people.",
  },
  {
    slug: "sales",
    title: "AI for Sales",
    topic: "AI for Sales",
    image: "sales",
    alt: "Illustrative sales professionals reviewing a client proposal and pipeline",
    summary: "Bring AI into customer research, proposals and sales planning.",
    audience: "Sales professionals, account managers and commercial teams",
    topics: ["Customer research and proposal drafts", "CRM summaries and follow-up planning", "Pipeline analysis and sales forecasting"],
    exercise: "Turn a fictional customer brief into a proposal outline and follow-up plan, checking claims before sharing anything with a customer.",
  },
] as const;

export function findTrainingTrack(slug: string) {
  return trainingTracks.find((track) => track.slug === slug);
}
