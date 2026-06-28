import { ManualImportLoginClient } from "@/app/manual-import/login/ManualImportLoginClient";

export default function ManualImportLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            GF
          </div>
          <h1 className="text-xl font-bold text-primary">Manual Import Access</h1>
          <p className="mt-1 text-sm text-gray-500">
            Paste approved GCC finance and AI job links
          </p>
        </div>
        <ManualImportLoginClient />
      </div>
    </div>
  );
}
