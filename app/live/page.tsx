"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CourtCard, { CourtCardData } from "@/components/CourtCard";

export default function LivePage() {
  const supabase = createClient();
  const [courts, setCourts] = useState<CourtCardData[]>([]);

  useEffect(() => {
    async function load() {
      const { data: courtRows } = await supabase
        .from("courts")
        .select("id, label, status, current_match_id");

      const enriched: CourtCardData[] = [];
      for (const c of courtRows ?? []) {
        let teamAName = "TBD";
        let teamBName = "TBD";
        let scoreA = 0;
        let scoreB = 0;
        let scorerAssigned = false;

        if (c.current_match_id) {
          const { data: matchRow } = await supabase
            .from("matches")
            .select("team_a, team_b")
            .eq("id", c.current_match_id)
            .single();

          if (matchRow) {
            const ids = [...matchRow.team_a, ...matchRow.team_b];
            const { data: playerRows } = await supabase
              .from("players")
              .select("id, guest_name, profiles(name)")
              .in("id", ids);
            const nameFor = (id: string) => {
              const p: any = playerRows?.find((r: any) => r.id === id);
              return p?.guest_name ?? p?.profiles?.name ?? "Player";
            };
            teamAName = matchRow.team_a.map(nameFor).join(" / ");
            teamBName = matchRow.team_b.map(nameFor).join(" / ");
          }

          const { data: gameRow } = await supabase
            .from("games")
            .select("score_a, score_b")
            .eq("match_id", c.current_match_id)
            .eq("status", "active")
            .maybeSingle();
          scoreA = gameRow?.score_a ?? 0;
          scoreB = gameRow?.score_b ?? 0;

          const { data: tokenRow } = await supabase
            .from("scorer_tokens")
            .select("id")
            .eq("court_id", c.id)
            .not("claimed_at", "is", null)
            .limit(1)
            .maybeSingle();
          scorerAssigned = !!tokenRow;
        }

        enriched.push({
          id: c.id,
          label: c.label,
          status: c.status,
          teamAName,
          teamBName,
          scoreA,
          scoreB,
          scorerAssigned,
        });
      }

      enriched.sort((a, b) => {
        const rank = { active: 0, idle: 1, finished: 2 } as const;
        return rank[a.status] - rank[b.status];
      });
      setCourts(enriched);
    }
    load();

    const channel = supabase
      .channel("live-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "courts" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Live Scores</h1>
      {courts.length === 0 ? (
        <p className="text-upnext">No courts yet. Create an event to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((c) => (
            <CourtCard key={c.id} court={c} />
          ))}
        </div>
      )}
    </div>
  );
}
