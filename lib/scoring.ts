import { GameState, Side } from "./types";

export interface Ruleset {
  points_to_win: number;
  win_by: number;
  scoring_style: "side_out" | "rally";
}

export function initialGameState(): GameState {
  // Games start 0-0, with the starting team treated as "second server"
  // since only one player serves for that team's very first turn.
  return { score_a: 0, score_b: 0, server_side: "a", server_number: 2 };
}

export function other(side: Side): Side {
  return side === "a" ? "b" : "a";
}

/**
 * Advances the game state by one rally, given which side won the rally.
 * Implements official side-out doubles scoring:
 * - Only the serving team can score a point.
 * - If the serving team wins the rally: they score, same server continues.
 * - If the receiving team wins the rally:
 *    - server #1 loses -> service passes to their partner (server #2), no side out
 *    - server #2 loses -> side out, serve passes to the other team as server #1
 *    - exception: at 0-0 the starting side is already "server #2", so losing
 *      that very first rally is an immediate side out.
 */
export function advanceRally(
  state: GameState,
  rallyWonBy: Side,
  ruleset: Pick<Ruleset, "scoring_style">
): GameState {
  if (ruleset.scoring_style === "rally") {
    // Rally scoring: whoever wins the rally scores, regardless of who served.
    const next = { ...state };
    if (rallyWonBy === "a") next.score_a += 1;
    else next.score_b += 1;
    // Server just tracks who serves next: winner serves.
    next.server_side = rallyWonBy;
    next.server_number = 1;
    return next;
  }

  // side_out scoring
  if (rallyWonBy === state.server_side) {
    // Serving team wins the rally: they score, same server continues.
    const next = { ...state };
    if (state.server_side === "a") next.score_a += 1;
    else next.score_b += 1;
    return next;
  }

  // Receiving team won the rally.
  if (state.server_number === 1) {
    // Service passes to the partner, same team, no side out.
    return { ...state, server_number: 2 };
  }

  // server_number === 2: side out, other team now serves as server #1.
  return {
    ...state,
    server_side: other(state.server_side),
    server_number: 1,
  };
}

export function checkWinner(
  state: GameState,
  ruleset: Pick<Ruleset, "points_to_win" | "win_by">
): Side | null {
  const { score_a, score_b } = state;
  const leader = score_a > score_b ? "a" : score_b > score_a ? "b" : null;
  if (!leader) return null;
  const leaderScore = Math.max(score_a, score_b);
  const trailerScore = Math.min(score_a, score_b);
  if (
    leaderScore >= ruleset.points_to_win &&
    leaderScore - trailerScore >= ruleset.win_by
  ) {
    return leader;
  }
  return null;
}

/** Human-readable score call, e.g. "5-3-2" for doubles side-out scoring. */
export function formatScoreCall(state: GameState): string {
  const serverScore =
    state.server_side === "a" ? state.score_a : state.score_b;
  const receiverScore =
    state.server_side === "a" ? state.score_b : state.score_a;
  return `${serverScore}-${receiverScore}-${state.server_number}`;
}
