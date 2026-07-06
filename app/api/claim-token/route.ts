import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

// GET /api/claim-token?courtId=... -> creates a fresh single-use token for a court's QR code
export async function GET(req: NextRequest) {
  const courtId = req.nextUrl.searchParams.get("courtId");
  if (!courtId) {
    return NextResponse.json({ error: "courtId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const token = randomUUID();
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("scorer_tokens")
    .insert({ court_id: courtId, token, expires_at });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ token, expires_at });
}

// POST /api/claim-token { token } -> claims the token, returns a scorer session id + court_id
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: tokenRow, error: fetchError } = await supabase
    .from("scorer_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (fetchError || !tokenRow) {
    return NextResponse.json({ error: "Invalid QR code" }, { status: 404 });
  }
  if (tokenRow.claimed_at) {
    return NextResponse.json(
      { error: "This QR code has already been used. Ask the organizer for a fresh one." },
      { status: 409 }
    );
  }
  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This QR code has expired. Ask the organizer for a fresh one." },
      { status: 410 }
    );
  }

  const scorerSessionId = randomUUID();
  const { error: updateError } = await supabase
    .from("scorer_tokens")
    .update({ claimed_at: new Date().toISOString(), claimed_by: scorerSessionId })
    .eq("id", tokenRow.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    scorerSessionId,
    courtId: tokenRow.court_id,
  });
}
