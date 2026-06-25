"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CV_REVIEW_FORM_URL } from "@/lib/constants";

export function CvReviewClient() {
  useEffect(() => {
    window.location.replace(CV_REVIEW_FORM_URL);
  }, []);

  return (
    <div className="mx-auto max-w-xl rounded-lg border border-gray-100 bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-finance">
        CV Review
      </p>
      <h1 className="mt-2 text-2xl font-bold text-primary">
        Opening the CV review form
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        You are signed in. We are taking you to the CV review form now.
      </p>
      <Link
        href={CV_REVIEW_FORM_URL}
        className="mt-5 inline-flex rounded-md bg-finance px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        Open CV review form
      </Link>
    </div>
  );
}
