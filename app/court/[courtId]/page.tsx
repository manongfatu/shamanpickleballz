"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import QRCodeDisplay from "@/components/QRCode";
import StatusBadge from "@/components/StatusBadge";
import { formatScoreCall } from "@/lib/scoring";
import type { Court, GameRow } from "@/lib/types";

export default function CourtPage({
  params,
}: {
  params: { courtId: string };
}) {
  const supabase = createClient();
  const [court, setCourt] = useState<Court | null>(null);
  const [game, setGame] = useState<GameRow | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: courtData } = await supabase
        .from("courts")
        .select("*")
        .eq("id", params.courtId)
        .single();
      setCourt(courtData);

      if (courtData?.current_match_id) {
        const { data: gameData } = await supabase
          .from("games")
          .select("*")
          .eq("match_id", courtData.current_match_id)
          .eq("status", "active")
          .order("game_number", { ascending: false })
          .limit(1)
          .maybeSingle();
        setGame(gameData);
      }

      if (!courtData?.current_match_id) {
        const res = await fetch(`/api/claim-token?courtId=${params.courtId}`);
        const json = await res.json();
        setQrToken(json.token);
      }
    }
    load();

    const channel = supabase
      .channel(`court:${params.courtId}`)
      .on("broadcast", { event: "score_update" }, (payload) => {
        setSyncing(true);
        setGame((prev) => (prev ? { ...prev, ...payload.payload } : prev));
        setTimeout(() => setSyncing(false), 400);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.courtId, supabase]);

  if (!court)
    return <div className="p-6 text-upnext dark:text-mutedDark">Loading court…</div>;

  const claimUrl =
    qrToken && typeof window !== "undefined"
      ? `${window.location.origin}/scan?token=${qrToken}`
      : "";

  return (
    <div className="mx-auto max-w-md px-4 py-8 text-center">
      <div className="mb-4 flex items-center justify-center gap-3">
        <h1 className="font-display text-xl font-bold">{court.label}</h1>
        <StatusBadge status={court.status} />
      </div>

      {game ? (
        <>
          <div className="mb-2 flex items-center justify-center gap-8">
            <div className="font-display text-6xl font-extrabold tabular-nums">
              {game.score_a}
            </div>
            <div className="text-2xl text-upnext dark:text-mutedDark">–</div>
            <div className="font-display text-6xl font-extrabold tabular-nums">
              {game.score_b}
            </div>
          </div>
          <p className="mb-6 font-mono text-sm text-upnext dark:text-mutedDark">
            Server call: {formatScoreCall(game)}
            {syncing && " · syncing…"}
          </p>
        </>
      ) : (
        <p className="mb-6 text-upnext dark:text-mutedDark">
          No match assigned to this court yet.
        </p>
      )}

      {!court.current_match_id && qrToken && (
        <div className="rounded-card bg-surface p-6 shadow-card dark:bg-surfaceDark dark:shadow-cardDark">
          <p className="mb-3 font-semibold">Scan to become the scorer</p>
          <QRCodeDisplay value={claimUrl} />
          <p className="mt-3 text-xs text-upnext dark:text-mutedDark">
            Expires in 15 minutes · single use
          </p>
        </div>
      )}
    </div>
  );
}
