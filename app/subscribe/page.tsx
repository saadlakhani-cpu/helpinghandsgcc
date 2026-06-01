import type { Metadata } from "next";
import { SubscribeClient } from "./SubscribeClient";

export const metadata: Metadata = {
  title: "Subscribe to Gulf Job Alerts",
  description:
    "Get matched Gulf Finance & AI job alerts by email. Upload your CV or set your preferences — we'll notify you when relevant roles appear across Saudi Arabia, UAE, Qatar and beyond.",
  openGraph: {
    title: "Subscribe to Gulf Finance & AI Job Alerts",
    description:
      "Upload your resume or set your preferences. Receive matched Finance and AI job alerts across the GCC.",
  },
  alternates: {
    canonical: "/subscribe",
  },
};

export default function SubscribePage() {
  return <SubscribeClient />;
}
