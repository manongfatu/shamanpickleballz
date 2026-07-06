-- Pickleball Live: MVP schema
-- Run this in the Supabase SQL editor.

create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  rating numeric not null default 1000,
  wins int not null default 0,
  losses int not null default 0,
  role text not null default 'player' check (role in ('player','organizer','admin')),
  created_at timestamptz not null default now()
);

-- ---------- events ----------
create table events (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  format text not null default 'open_play' check (format in ('open_play','single_elim','double_elim','round_robin')),
  ruleset jsonb not null default '{
    "points_to_win": 11,
    "win_by": 2,
    "best_of": 1,
    "scoring_style": "side_out"
  }'::jsonb,
  status text not null default 'setup' check (status in ('setup','active','completed')),
  created_at timestamptz not null default now()
);

-- ---------- courts ----------
create table courts (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  label text not null,
  status text not null default 'idle' check (status in ('idle','active','finished')),
  current_match_id uuid,
  created_at timestamptz not null default now()
);

-- ---------- players (supports guests, no account needed) ----------
create table players (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  guest_name text,
  seed int,
  created_at timestamptz not null default now(),
  constraint player_identity check (profile_id is not null or guest_name is not null)
);

-- ---------- matches ----------
create table matches (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  court_id uuid references courts(id) on delete set null,
  round int not null default 1,
  team_a uuid[] not null, -- player ids
  team_b uuid[] not null,
  status text not null default 'pending' check (status in ('pending','active','completed')),
  winner text check (winner in ('a','b')),
  created_at timestamptz not null default now()
);

alter table courts
  add constraint courts_current_match_fk
  foreign key (current_match_id) references matches(id) on delete set null;

-- ---------- games ----------
create table games (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references matches(id) on delete cascade,
  game_number int not null default 1,
  score_a int not null default 0,
  score_b int not null default 0,
  server_side text not null default 'a' check (server_side in ('a','b')),
  server_number int not null default 2 check (server_number in (1,2)),
  status text not null default 'active' check (status in ('active','completed')),
  winner text check (winner in ('a','b')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- score_events (append-only audit log) ----------
create table score_events (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null references games(id) on delete cascade,
  actor text, -- scorer token or profile id, stored as text for flexibility
  event_type text not null check (event_type in ('point','side_out','undo','end_game')),
  resulting_state jsonb not null, -- snapshot: {score_a, score_b, server_side, server_number}
  created_at timestamptz not null default now()
);

-- ---------- bracket_nodes ----------
create table bracket_nodes (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  round int not null,
  position int not null,
  match_id uuid references matches(id) on delete set null,
  next_node_id uuid references bracket_nodes(id) on delete set null,
  bracket_type text not null default 'main' check (bracket_type in ('main','consolation'))
);

-- ---------- scorer_tokens (single-use QR claim) ----------
create table scorer_tokens (
  id uuid primary key default uuid_generate_v4(),
  court_id uuid not null references courts(id) on delete cascade,
  token text not null unique,
  claimed_by text, -- opaque device/session id once claimed
  claimed_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index idx_courts_event on courts(event_id);
create index idx_players_event on players(event_id);
create index idx_matches_event on matches(event_id);
create index idx_matches_court on matches(court_id);
create index idx_games_match on games(match_id);
create index idx_score_events_game on score_events(game_id);
create index idx_scorer_tokens_court on scorer_tokens(court_id);
create index idx_scorer_tokens_token on scorer_tokens(token);

-- ---------- Row Level Security ----------
alter table profiles enable row level security;
alter table events enable row level security;
alter table courts enable row level security;
alter table players enable row level security;
alter table matches enable row level security;
alter table games enable row level security;
alter table score_events enable row level security;
alter table bracket_nodes enable row level security;
alter table scorer_tokens enable row level security;

-- Public read access: this is a "at the venue, anyone can watch" app.
-- Writes are scoped to owners or valid scorer tokens (enforced in API routes
-- using the service role key, since scorers are often guests with no auth session).

create policy "profiles are publicly readable" on profiles for select using (true);
create policy "users manage their own profile" on profiles for update using (auth.uid() = id);
create policy "users insert their own profile" on profiles for insert with check (auth.uid() = id);

create policy "events are publicly readable" on events for select using (true);
create policy "owners manage their events" on events for all using (auth.uid() = owner_id);

create policy "courts are publicly readable" on courts for select using (true);
create policy "event owners manage courts" on courts for all using (
  exists (select 1 from events where events.id = courts.event_id and events.owner_id = auth.uid())
);

create policy "players are publicly readable" on players for select using (true);
create policy "event owners manage players" on players for all using (
  exists (select 1 from events where events.id = players.event_id and events.owner_id = auth.uid())
);

create policy "matches are publicly readable" on matches for select using (true);
create policy "event owners manage matches" on matches for all using (
  exists (select 1 from events where events.id = matches.event_id and events.owner_id = auth.uid())
);

create policy "games are publicly readable" on games for select using (true);
create policy "score_events are publicly readable" on score_events for select using (true);

-- games/score_events/scorer_tokens are written via the /api/score-event and
-- /api/claim-token server routes (service role key) so that guest scorers,
-- who hold a valid token but no Supabase auth session, can still record points.

create policy "bracket_nodes are publicly readable" on bracket_nodes for select using (true);
create policy "event owners manage bracket" on bracket_nodes for all using (
  exists (select 1 from events where events.id = bracket_nodes.event_id and events.owner_id = auth.uid())
);

-- Helper: auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
