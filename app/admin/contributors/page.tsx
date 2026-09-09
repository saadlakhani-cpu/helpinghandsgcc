import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ContributorWorkspace } from "@/components/ContributorWorkspace";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Contributor Management",
  robots: { index: false, follow: false },
};
export default function AdminContributorsPage() {
  if (
    !process.env.ADMIN_SECRET ||
    cookies().get("admin_token")?.value !== process.env.ADMIN_SECRET
  )
    redirect("/admin/login");
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Contributor Management</h1>
      <p className="mb-5 text-sm text-gray-600">
        Approve unique, relevant vacancies. Record Paid logs a payment you have
        already made; it does not transfer money.
      </p>
      <ContributorWorkspace admin />
    </main>
  );
}
