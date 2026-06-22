"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export function AuthNav() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
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

  async function signIn() {
    const supabase = createBrowserClient();
    const returnPath = window.location.pathname || "/subscribe";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${returnPath}` },
    });
  }

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
    <button
      type="button"
      onClick={signIn}
      className="transition hover:text-primary"
    >
      Sign in
    </button>
  );
}
