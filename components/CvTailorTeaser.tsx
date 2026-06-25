"use client";

import { useState } from "react";

export function CvTailorTeaser() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
        title="Generate a CV for this role"
      >
        Generate CV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-primary">
              Generate CV is coming
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              We are building this for you. Soon you will be able to generate a
              tailored CV for this specific role. Keep watching this space for
              updates.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
