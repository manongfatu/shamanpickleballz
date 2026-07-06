"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/types";

export default function EventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setEvents(data ?? []));
  }, [supabase]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <Link
          href="/events/new"
          className="tap-target rounded-full bg-coralDeep px-4 py-2 font-semibold text-white hover:brightness-110"
        >
          + New event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-upnext dark:text-mutedDark">No events yet.</p>
      ) : (
        <div className="grid gap-3">
          {events.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="rounded-card bg-surface dark:bg-surfaceDark p-4 shadow-card"
            >
              <p className="font-semibold">{e.name}</p>
              <p className="text-sm capitalize text-upnext dark:text-mutedDark">
                {e.format.replace("_", " ")} · {e.status}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
