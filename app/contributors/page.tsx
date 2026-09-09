import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContributorWorkspace } from "@/components/ContributorWorkspace";
export const metadata = {
  title: "Contributor Portal",
  robots: { index: false, follow: false },
};
export default function ContributorsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold">Contributor Portal</h1>
        <ContributorWorkspace />
      </main>
      <SiteFooter />
    </>
  );
}
