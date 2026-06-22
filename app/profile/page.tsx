import type { Metadata } from "next";
import { SubscribeClient } from "@/app/subscribe/SubscribeClient";

export const metadata: Metadata = {
  title: "Update Your Profile",
  description:
    "Update your Gulf Finance & AI job alert profile, resume and preferences.",
  alternates: {
    canonical: "/profile",
  },
};

export default function ProfilePage() {
  return <SubscribeClient />;
}
