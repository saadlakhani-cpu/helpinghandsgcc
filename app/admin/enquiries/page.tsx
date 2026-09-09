import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  enquiryLabels,
  enquiryStatuses,
  type EnquiryType,
} from "@/lib/enquiries";
import { EnquiryStatus } from "./EnquiryStatus";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Service Enquiries",
  robots: { index: false, follow: false },
};

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  if (
    !process.env.ADMIN_SECRET ||
    cookies().get("admin_token")?.value !== process.env.ADMIN_SECRET
  )
    redirect("/admin/login");
  const page = Math.min(
    100000,
    Math.max(1, Number.parseInt(searchParams.page || "1", 10) || 1),
  );
  const status = enquiryStatuses.find((s) => s === searchParams.status);
  let rows: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    type: EnquiryType;
    topic: string;
    message: string | null;
    created_at: string;
    status: string;
  }[] = [];
  let count = 0;
  let failed = false;
  try {
    let query = createAdminClient()
      .from("service_enquiries")
      .select("id,name,email,company,type,topic,message,created_at,status", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .order("id")
      .range((page - 1) * 25, page * 25 - 1);
    if (status) query = query.eq("status", status);
    const result = await query;
    if (result.error) throw result.error;
    rows = result.data || [];
    count = result.count || 0;
  } catch {
    failed = true;
  }
  const pageLink = (p: number) =>
    `/admin/enquiries?page=${p}${status ? `&status=${status}` : ""}`;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/admin" className="text-sm text-finance underline">
        Back to Admin
      </Link>
      <h1 className="mt-5 text-2xl font-bold">Service Enquiries</h1>
      <nav aria-label="Filter enquiries" className="my-6 flex flex-wrap gap-3">
        {["All", ...enquiryStatuses].map((s) => (
          <Link
            key={s}
            aria-current={(status || "All") === s ? "page" : undefined}
            href={
              s === "All" ? "/admin/enquiries" : `/admin/enquiries?status=${s}`
            }
            className={`rounded-md border px-4 py-2 text-sm ${s === (status || "All") ? "border-finance bg-finance text-white" : "border-gray-300 bg-white"}`}
          >
            {s}
          </Link>
        ))}
      </nav>
      {failed ? (
        <p role="alert" className="rounded-md bg-red-50 p-5 text-red-700">
          Enquiries could not be loaded. Check the database connection and apply
          the service enquiries migration if it has not been run.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-600">
            {count} enquiries
            {count > 0 ? ` - page ${page} of ${Math.ceil(count / 25)}` : ""}
          </p>
          {rows.length === 0 ? (
            <p className="border-y border-gray-200 py-10 text-gray-600">
              No enquiries to display.
            </p>
          ) : (
            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {rows.map((row) => (
                <article
                  key={row.id}
                  className="grid gap-5 py-6 md:grid-cols-[1fr_2fr_150px]"
                >
                  <div className="min-w-0">
                    <h2 className="break-words font-semibold">{row.name}</h2>
                    <a
                      href={`mailto:${row.email}`}
                      className="break-all text-sm text-finance underline"
                    >
                      {row.email}
                    </a>
                    <p className="mt-1 break-words text-sm text-gray-600">
                      {row.company}
                    </p>
                    <time className="mt-2 block text-xs text-gray-500">
                      {new Date(row.created_at).toLocaleString("en-GB", {
                        timeZone: "Asia/Riyadh",
                      })}{" "}
                      (Riyadh)
                    </time>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-finance">
                      {enquiryLabels[row.type]}
                    </p>
                    <h3 className="mt-1 font-semibold">{row.topic}</h3>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                      {row.message || "No additional details provided."}
                    </p>
                  </div>
                  <EnquiryStatus id={row.id} status={row.status} />
                </article>
              ))}
            </div>
          )}
          <nav
            aria-label="Enquiry pages"
            className="mt-6 flex gap-6 text-sm text-finance"
          >
            {page > 1 && <Link href={pageLink(page - 1)}>Previous</Link>}
            {page * 25 < count && <Link href={pageLink(page + 1)}>Next</Link>}
          </nav>
        </>
      )}
    </main>
  );
}
