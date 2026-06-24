"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

const PROTECTED_PREFIXES = [
  "/ai-jobs",
  "/finance-jobs",
  "/jobs",
  "/profile",
  "/recruiters",
  "/subscribe",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isProtectedPath(pathname)) {
      setIsChecking(false);
      return;
    }

    setIsChecking(true);

    let isMounted = true;
    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;

      if (!data.user) {
        const returnTo = `${pathname}${window.location.search}`;
        router.replace(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }

      setIsChecking(false);
    });

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (isChecking && isProtectedPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-sm text-gray-600">
        Checking sign-in...
      </div>
    );
  }

  return <>{children}</>;
}
