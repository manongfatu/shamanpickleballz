import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// POST /api/score-event
// body: { gameId, courtId, scorerSessionId, eventType, resultingState, winner? }
// Verifies the caller holds a valid, claimed token for this court before writing.
export async function POST(req: NextRequest) {
  const { gameId, courtId, scorerSessionId, eventType, resultingState, winner } =
    await req.json();

  if (!gameId || !courtId || !scorerSessionId || !eventType || !resultingState) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Confirm this session actually claimed a token for this court.
  const { data: claim, error: claimError } = await supabase
    .from("scorer_tokens")
    .select("id")
    .eq("court_id", courtId)
    .eq("claimed_by", scorerSessionId)
    .maybeSingle();

  if (claimError || !claim) {
    return NextResponse.json(
      { error: "You are not the assigned scorer for this court." },
      { status: 403 }
    );
  }

  const { error: eventError } = await supabase.from("score_events").insert({
    game_id: gameId,
    actor: scorerSessionId,
    event_type: eventType,
    resulting_state: resultingState,
  });
  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  const updatePayload: Record<string, unknown> = {
    score_a: resultingState.score_a,
    score_b: resultingState.score_b,
    server_side: resultingState.server_side,
    server_number: resultingState.server_number,
    updated_at: new Date().toISOString(),
  };
  if (eventType === "end_game" && winner) {
    updatePayload.status = "completed";
    updatePayload.winner = winner;
  }

  const { error: gameError } = await supabase
    .from("games")
    .update(updatePayload)
    .eq("id", gameId);

  if (gameError) {
    return NextResponse.json({ error: gameError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
