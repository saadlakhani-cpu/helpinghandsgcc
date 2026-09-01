"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export function AuthNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState("/jobs");

  useEffect(() => {
    setReturnTo(`${window.location.pathname}${window.location.search}`);

    const supabase = createBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setEmail(null);
  }

  if (email) {
    return (
      <button
        type="button"
        onClick={signOut}
        className="transition hover:text-primary"
        title={`Signed in as ${email}`}
      >
        Sign out
      </button>
    );
  }

  return (
    <Link
      href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}
      className="transition hover:text-primary"
    >
      Sign in
    </Link>
  );
}
