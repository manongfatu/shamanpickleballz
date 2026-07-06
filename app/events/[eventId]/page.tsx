"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Court, PlayerRow, EventRow } from "@/lib/types";

export default function EventSetupPage({
  params,
}: {
  params: { eventId: string };
}) {
  const supabase = createClient();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [guestName, setGuestName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [assignCourtId, setAssignCourtId] = useState<string>("");

  const load = useCallback(async () => {
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", params.eventId)
      .single();
    setEvent(eventData);

    const { data: courtData } = await supabase
      .from("courts")
      .select("*")
      .eq("event_id", params.eventId)
      .order("label");
    setCourts(courtData ?? []);

    const { data: playerData } = await supabase
      .from("players")
      .select("*")
      .eq("event_id", params.eventId);
    setPlayers(playerData ?? []);
  }, [params.eventId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) return;
    await supabase
      .from("players")
      .insert({ event_id: params.eventId, guest_name: guestName.trim() });
    setGuestName("");
    load();
  }

  function toggleSelect(playerId: string) {
    setSelected((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : prev.length < 4
        ? [...prev, playerId]
        : prev
    );
  }

  function playerLabel(p: PlayerRow) {
    return p.guest_name ?? "Registered player";
  }

  async function startMatch() {
    if (selected.length !== 4 || !assignCourtId) return;
    const [a1, a2, b1, b2] = selected;

    const { data: match, error } = await supabase
      .from("matches")
      .insert({
        event_id: params.eventId,
        court_id: assignCourtId,
        team_a: [a1, a2],
        team_b: [b1, b2],
        status: "active",
      })
      .select()
      .single();

    if (error || !match) return;

    await supabase.from("games").insert({ match_id: match.id, game_number: 1 });
    await supabase
      .from("courts")
      .update({ status: "active", current_match_id: match.id })
      .eq("id", assignCourtId);

    setSelected([]);
    setAssignCourtId("");
    load();
  }

  function shuffleAssign() {
    const idle = courts.filter((c) => c.status === "idle");
    const unassignedPlayers = [...players].sort(() => Math.random() - 0.5);
    // naive: just preselect the first 4 unassigned players + first idle court
    if (idle.length && unassignedPlayers.length >= 4) {
      setSelected(unassignedPlayers.slice(0, 4).map((p) => p.id));
      setAssignCourtId(idle[0].id);
    }
  }

  if (!event) return <div className="p-6 text-upnext">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <p className="text-sm text-upnext capitalize">
            {event.format.replace("_", " ")}
          </p>
        </div>
        <Link
          href={`/events/${params.eventId}/leaderboard`}
          className="tap-target rounded-lg bg-surface px-4 py-2 text-sm font-semibold shadow-card"
        >
          Leaderboard
        </Link>
      </div>

      {/* Add players */}
      <section className="mb-8 rounded-card bg-surface p-4 shadow-card">
        <h2 className="mb-3 font-semibold">Players ({players.length})</h2>
        <form onSubmit={addGuest} className="mb-4 flex gap-2">
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Guest name"
            className="tap-target flex-1 rounded-lg border border-black/10 px-4 py-2.5"
          />
          <button
            type="submit"
            className="tap-target rounded-lg bg-action px-4 py-2.5 font-semibold text-white"
          >
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleSelect(p.id)}
              className={`tap-target rounded-full px-4 py-2 text-sm font-medium ${
                selected.includes(p.id)
                  ? "bg-action text-white"
                  : "bg-gray-100 text-ink"
              }`}
            >
              {playerLabel(p)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-upnext">
          Tap 4 players to form a match (2 vs 2), then pick a court below.
        </p>
      </section>

      {/* Assign to court */}
      <section className="mb-8 rounded-card bg-surface p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Assign match</h2>
          <button
            onClick={shuffleAssign}
            className="text-sm font-semibold text-action underline"
          >
            Shuffle suggest
          </button>
        </div>
        <select
          value={assignCourtId}
          onChange={(e) => setAssignCourtId(e.target.value)}
          className="tap-target mb-3 w-full rounded-lg border border-black/10 px-4 py-2.5"
        >
          <option value="">Select a court</option>
          {courts
            .filter((c) => c.status === "idle")
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
        </select>
        <button
          onClick={startMatch}
          disabled={selected.length !== 4 || !assignCourtId}
          className="tap-target w-full rounded-lg bg-actionAlt py-3 font-semibold text-white disabled:opacity-40"
        >
          Start match ({selected.length}/4 selected)
        </button>
      </section>

      {/* Courts overview */}
      <section>
        <h2 className="mb-3 font-semibold">Courts</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {courts.map((c) => (
            <Link
              key={c.id}
              href={`/court/${c.id}`}
              className="rounded-card bg-surface p-4 shadow-card"
            >
              <p className="font-semibold">{c.label}</p>
              <p className="text-sm capitalize text-upnext">{c.status}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
