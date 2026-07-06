"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-2 font-display text-2xl font-bold">Log in</h1>
      <p className="mb-6 text-sm text-upnext dark:text-mutedDark">
        We'll email you a magic link — no password needed.
      </p>

      {sent ? (
        <div className="rounded-card bg-surface p-4 shadow-card dark:bg-surfaceDark dark:shadow-cardDark">
          <p className="font-medium">Check your email</p>
          <p className="mt-1 text-sm text-upnext dark:text-mutedDark">
            We sent a login link to {email}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="tap-target w-full rounded-lg border border-black/10 bg-surface px-4 py-3 text-base dark:border-white/15 dark:bg-surfaceDark dark:text-paper"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            className="tap-target w-full rounded-full bg-action py-3 font-semibold text-white hover:brightness-110"
          >
            Send magic link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-upnext dark:text-mutedDark">
        Just here to play or watch? You don't need an account —{" "}
        <a href="/scan" className="underline">
          scan a court QR
        </a>{" "}
        instead.
      </p>
    </div>
  );
}
