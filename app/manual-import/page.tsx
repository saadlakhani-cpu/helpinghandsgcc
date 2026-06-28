import { ManualImportClient } from "@/app/manual-import/ManualImportClient";
import { getManualImportUserFromCookies } from "@/lib/manual-import/auth";

export const dynamic = "force-dynamic";

export default function ManualImportPage() {
  const username = getManualImportUserFromCookies();

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-primary">
              Helping Hands GCC
            </p>
            <p className="text-xs text-gray-500">Manual job import</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Signed in as {username}</span>
            <form action="/api/manual-import/logout" method="POST">
              <button
                type="submit"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <ManualImportClient />
      </main>
    </div>
  );
}
