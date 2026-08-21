import type { Metadata } from "next";
import { HifzDashboardClient } from "./HifzDashboardClient";

export const metadata: Metadata = {
  title: "Hifz Command Center",
  description:
    "A gamified Hifz tracking dashboard for the family — daily quests, streaks, a real cash vault, and a co-op leaderboard.",
  robots: { index: false, follow: false },
};

export default function HifzPage() {
  return <HifzDashboardClient />;
}
