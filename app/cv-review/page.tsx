import { CvReviewClient } from "@/app/cv-review/CvReviewClient";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function CvReviewPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-surface px-4 py-12">
        <CvReviewClient />
      </main>
      <SiteFooter />
    </div>
  );
}
