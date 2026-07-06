"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Row {
  id: string;
  name: string;
  wins: number;
  losses: number;
  rating: number;
}

export default function LeaderboardPage({
  params,
}: {
  params: { eventId: string };
}) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    async function load() {
      const { data: players } = await supabase
        .from("players")
        .select("id, guest_name, profile_id, profiles(name, wins, losses, rating)")
        .eq("event_id", params.eventId);

      const mapped: Row[] = (players ?? []).map((p: any) => ({
        id: p.id,
        name: p.guest_name ?? p.profiles?.name ?? "Player",
        wins: p.profiles?.wins ?? 0,
        losses: p.profiles?.losses ?? 0,
        rating: p.profiles?.rating ?? 1000,
      }));

      mapped.sort((a, b) => b.wins - a.wins || b.rating - a.rating);
      setRows(mapped);
    }
    load();
  }, [params.eventId, supabase]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Leaderboard</h1>
      <div className="overflow-hidden rounded-card bg-surface dark:bg-surfaceDark shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy text-white">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">W</th>
              <th className="px-4 py-3 text-right">L</th>
              <th className="px-4 py-3 text-right">Win %</th>
              <th className="px-4 py-3 text-right">Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const total = r.wins + r.losses;
              const pct = total ? Math.round((r.wins / total) * 100) : 0;
              return (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-semibold">{i + 1}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 text-right">{r.wins}</td>
                  <td className="px-4 py-3 text-right">{r.losses}</td>
                  <td className="px-4 py-3 text-right">{pct}%</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {Math.round(r.rating)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-upnext dark:text-mutedDark">
                  No results yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
