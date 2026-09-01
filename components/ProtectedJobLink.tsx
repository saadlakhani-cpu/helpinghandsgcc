"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type ProtectedJobLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function ProtectedJobLink({
  href,
  className,
  children,
}: ProtectedJobLinkProps) {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const supabase = createBrowserClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      event.preventDefault();
      setShowPrompt(true);
    }
  }

  function continueToSignIn() {
    router.push(`/sign-in?returnTo=${encodeURIComponent(href)}`);
  }

  return (
    <>
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>

      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-primary">
              Sign in required
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Please sign in to view job details and apply through the portal.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={continueToSignIn}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
