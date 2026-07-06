export type CourtStatus = "idle" | "active" | "finished";
export type Side = "a" | "b";

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  wins: number;
  losses: number;
  role: "player" | "organizer" | "admin";
}

export interface EventRuleset {
  points_to_win: number;
  win_by: number;
  best_of: number;
  scoring_style: "side_out" | "rally";
}

export interface EventRow {
  id: string;
  owner_id: string;
  name: string;
  format: "open_play" | "single_elim" | "double_elim" | "round_robin";
  ruleset: EventRuleset;
  status: "setup" | "active" | "completed";
}

export interface Court {
  id: string;
  event_id: string;
  label: string;
  status: CourtStatus;
  current_match_id: string | null;
}

export interface PlayerRow {
  id: string;
  event_id: string;
  profile_id: string | null;
  guest_name: string | null;
  seed: number | null;
}

export interface MatchRow {
  id: string;
  event_id: string;
  court_id: string | null;
  round: number;
  team_a: string[];
  team_b: string[];
  status: "pending" | "active" | "completed";
  winner: Side | null;
}

export interface GameState {
  score_a: number;
  score_b: number;
  server_side: Side;
  server_number: 1 | 2;
}

export interface GameRow extends GameState {
  id: string;
  match_id: string;
  game_number: number;
  status: "active" | "completed";
  winner: Side | null;
}
