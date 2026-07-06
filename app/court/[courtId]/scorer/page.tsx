"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ScoreButton from "@/components/ScoreButton";
import { advanceRally, checkWinner, initialGameState } from "@/lib/scoring";
import type { GameState, Side, Court, MatchRow, GameRow } from "@/lib/types";

const DEFAULT_RULESET = {
  points_to_win: 11,
  win_by: 2,
  scoring_style: "side_out" as const,
};

export default function ScorerPage({
  params,
}: {
  params: { courtId: string };
}) {
  const supabase = createClient();
  const router = useRouter();

  const [scorerSessionId, setScorerSessionId] = useState<string | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [game, setGame] = useState<GameRow | null>(null);
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [syncing, setSyncing] = useState(false);
  const historyRef = useRef<GameState[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Auth check: must hold a valid claim for this court
  useEffect(() => {
    const raw = localStorage.getItem(`scorer:${params.courtId}`);
    if (!raw) {
      router.replace("/scan");
      return;
    }
    setScorerSessionId(JSON.parse(raw).scorerSessionId);
  }, [params.courtId, router]);

  const loadNames = useCallback(
    async (matchRow: MatchRow) => {
      const ids = [...matchRow.team_a, ...matchRow.team_b];
      const { data: playerRows } = await supabase
        .from("players")
        .select("id, guest_name, profile_id, profiles(name)")
        .in("id", ids);

      const nameFor = (id: string) => {
        const p: any = playerRows?.find((row: any) => row.id === id);
        return p?.guest_name ?? p?.profiles?.name ?? "Player";
      };
      setTeamAName(matchRow.team_a.map(nameFor).join(" / "));
      setTeamBName(matchRow.team_b.map(nameFor).join(" / "));
    },
    [supabase]
  );

  useEffect(() => {
    async function load() {
      const { data: courtData } = await supabase
        .from("courts")
        .select("*")
        .eq("id", params.courtId)
        .single();
      setCourt(courtData);
      if (!courtData?.current_match_id) return;

      const { data: matchData } = await supabase
        .from("matches")
        .select("*")
        .eq("id", courtData.current_match_id)
        .single();
      setMatch(matchData);
      if (matchData) loadNames(matchData);

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
    load();

    const channel = supabase.channel(`court:${params.courtId}`);
    channel.subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.courtId, supabase, loadNames]);

  async function persistAndBroadcast(
    nextState: GameState,
    eventType: "point" | "undo" | "end_game",
    winner?: Side
  ) {
    if (!game || !scorerSessionId) return;
    setSyncing(true);

    channelRef.current?.send({
      type: "broadcast",
      event: "score_update",
      payload: nextState,
    });

    try {
      await fetch("/api/score-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.id,
          courtId: params.courtId,
          scorerSessionId,
          eventType,
          resultingState: nextState,
          winner,
        }),
      });
    } catch {
      // optimistic UI already applied; a background retry queue would go here
    } finally {
      setSyncing(false);
    }
  }

  function handleRally(side: Side) {
    if (!game) return;
    historyRef.current.push({
      score_a: game.score_a,
      score_b: game.score_b,
      server_side: game.server_side,
      server_number: game.server_number,
    });

    const next = advanceRally(game, side, DEFAULT_RULESET);
    const winner = checkWinner(next, DEFAULT_RULESET);

    setGame({ ...game, ...next, ...(winner ? { status: "completed", winner } : {}) });
    persistAndBroadcast(next, winner ? "end_game" : "point", winner ?? undefined);
  }

  function handleUndo() {
    const prev = historyRef.current.pop();
    if (!prev || !game) return;
    setGame({ ...game, ...prev });
    persistAndBroadcast(prev, "undo");
  }

  if (!court || !scorerSessionId) {
    return <div className="p-6 text-center text-upnext">Loading…</div>;
  }

  if (!game) {
    return (
      <div className="p-6 text-center text-upnext">
        No active game on this court yet.
      </div>
    );
  }

  const gameOver = game.status === "completed";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col px-4 py-6">
      <div className="mb-2 flex items-center justify-between text-sm text-upnext">
        <span>{court.label}</span>
        <span>{syncing ? "Syncing…" : "Synced"}</span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="mb-2 truncate text-sm font-medium">{teamAName}</p>
          <p className="text-7xl font-extrabold tabular-nums">{game.score_a}</p>
        </div>
        <div className="text-center">
          <p className="mb-2 truncate text-sm font-medium">{teamBName}</p>
          <p className="text-7xl font-extrabold tabular-nums">{game.score_b}</p>
        </div>
      </div>

      {gameOver ? (
        <div className="rounded-card bg-surface p-6 text-center shadow-card">
          <p className="text-lg font-bold">
            {game.winner === "a" ? teamAName : teamBName} wins!
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <ScoreButton label="+ POINT" onClick={() => handleRally("a")} />
            <ScoreButton label="+ POINT" onClick={() => handleRally("b")} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <ScoreButton
              label="Undo"
              variant="secondary"
              onClick={handleUndo}
              disabled={historyRef.current.length === 0}
            />
            <ScoreButton label="Time Out" variant="secondary" onClick={() => {}} />
            <ScoreButton
              label="Change Side"
              variant="secondary"
              onClick={() => {}}
            />
          </div>
        </>
      )}
    </div>
  );
}
