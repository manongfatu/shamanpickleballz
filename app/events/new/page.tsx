"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewEventPage() {
  const [name, setName] = useState("");
  const [format, setFormat] = useState("open_play");
  const [courtCount, setCourtCount] = useState(4);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({ owner_id: user.id, name, format })
      .select()
      .single();

    if (eventError || !event) {
      setError(eventError?.message ?? "Could not create event");
      setLoading(false);
      return;
    }

    const courts = Array.from({ length: courtCount }, (_, i) => ({
      event_id: event.id,
      label: `Court ${i + 1}`,
    }));
    await supabase.from("courts").insert(courts);

    router.push(`/events/${event.id}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Create an Event</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Event name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="tap-target w-full rounded-lg border border-black/10 px-4 py-3"
            placeholder="Saturday Open Play"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="tap-target w-full rounded-lg border border-black/10 px-4 py-3"
          >
            <option value="open_play">Open Play (no bracket)</option>
            <option value="single_elim">Single Elimination</option>
            <option value="double_elim">Double Elimination</option>
            <option value="round_robin">Round Robin</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Number of courts
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={courtCount}
            onChange={(e) => setCourtCount(Number(e.target.value))}
            className="tap-target w-full rounded-lg border border-black/10 px-4 py-3"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="tap-target w-full rounded-lg bg-action py-3 font-semibold text-white hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create event"}
        </button>
      </form>
    </div>
  );
}
