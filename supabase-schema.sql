create extension if not exists pgcrypto;

create table if not exists public.npc_factions (
  tag text primary key check (tag ~ '^[A-Z0-9]{4}$'),
  name text not null,
  category text not null check (category in ('Builder', 'Miner', 'Trader', 'Pirate', 'Hostile NPC', 'Scenario', 'Unknown')),
  sells text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.coordinates (
  id uuid primary key default gen_random_uuid(),
  raw_text text not null,
  name text not null,
  x double precision not null,
  y double precision not null,
  z double precision not null,
  color text,
  planet text not null,
  location_type text not null check (location_type in ('surface', 'orbital', 'deep_space')),
  faction_tag text check (faction_tag is null or faction_tag ~ '^[A-Z0-9]{4}$'),
  faction_name text default '',
  has_zone_chips boolean not null default false,
  sells_ships boolean not null default false,
  sells_h2_gas boolean not null default false,
  sells_o2_gas boolean not null default false,
  altitude_m double precision not null,
  center_distance_m double precision not null,
  notes text default '',
  submitted_by text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.station_comments (
  id uuid primary key default gen_random_uuid(),
  coordinate_id uuid not null references public.coordinates(id) on delete cascade,
  author text default '',
  comment_text text not null,
  created_at timestamptz not null default now()
);

alter table public.coordinates
  add column if not exists faction_tag text check (faction_tag is null or faction_tag ~ '^[A-Z0-9]{4}$');

alter table public.coordinates
  add column if not exists faction_name text default '';

alter table public.coordinates
  add column if not exists has_zone_chips boolean not null default false;

alter table public.coordinates
  add column if not exists sells_ships boolean not null default false;

alter table public.coordinates
  add column if not exists sells_h2_gas boolean not null default false;

alter table public.coordinates
  add column if not exists sells_o2_gas boolean not null default false;

alter table public.npc_factions enable row level security;

alter table public.station_comments enable row level security;

drop policy if exists "Public can read npc factions" on public.npc_factions;

create policy "Public can read npc factions"
  on public.npc_factions
  for select
  using (true);

drop policy if exists "Public can read station comments" on public.station_comments;

create policy "Public can read station comments"
  on public.station_comments
  for select
  using (true);

alter table public.coordinates enable row level security;

drop policy if exists "Public can read coordinates" on public.coordinates;

create policy "Public can read coordinates"
  on public.coordinates
  for select
  using (true);

drop function if exists public.update_coordinate_admin(
  text,
  uuid,
  text,
  text,
  double precision,
  double precision,
  double precision,
  text,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  text
);

drop function if exists public.update_coordinate_admin(
  text,
  uuid,
  text,
  text,
  double precision,
  double precision,
  double precision,
  text,
  text,
  text,
  text,
  text,
  boolean,
  double precision,
  double precision,
  text,
  text
);

drop function if exists public.delete_coordinate_admin(text, uuid);

drop function if exists public.upsert_npc_faction_admin(text, text, text, text, text);

drop function if exists public.delete_npc_faction_admin(text, text);

drop function if exists public.submit_coordinate(
  text,
  text,
  double precision,
  double precision,
  double precision,
  text,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  text
);

drop function if exists public.submit_coordinate(
  text,
  text,
  double precision,
  double precision,
  double precision,
  text,
  text,
  text,
  text,
  text,
  boolean,
  double precision,
  double precision,
  text,
  text
);

create or replace function public.submit_coordinate(
  p_raw_text text,
  p_name text,
  p_x double precision,
  p_y double precision,
  p_z double precision,
  p_color text,
  p_planet text,
  p_location_type text,
  p_faction_tag text,
  p_faction_name text,
  p_has_zone_chips boolean,
  p_altitude_m double precision,
  p_center_distance_m double precision,
  p_notes text default '',
  p_submitted_by text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  duplicate_row public.coordinates%rowtype;
  duplicate_distance double precision;
  inserted_row public.coordinates%rowtype;
begin
  perform pg_advisory_xact_lock(932047001);

  if p_raw_text !~ '^GPS:[^:]+:-?[0-9]+(\.[0-9]+)?:-?[0-9]+(\.[0-9]+)?:-?[0-9]+(\.[0-9]+)?:(#[0-9A-Fa-f]{8})?:?$' then
    raise exception 'Invalid Space Engineers GPS string.';
  end if;

  select c.*
  into duplicate_row
  from public.coordinates c
  where sqrt(power(c.x - p_x, 2) + power(c.y - p_y, 2) + power(c.z - p_z, 2)) <= 1000
  order by sqrt(power(c.x - p_x, 2) + power(c.y - p_y, 2) + power(c.z - p_z, 2)) asc
  limit 1;

  if duplicate_row.id is not null then
    duplicate_distance := sqrt(
      power(duplicate_row.x - p_x, 2) +
      power(duplicate_row.y - p_y, 2) +
      power(duplicate_row.z - p_z, 2)
    );

    return jsonb_build_object(
      'inserted', false,
      'message', 'Already listed near ' || duplicate_row.name || ' (' || round(duplicate_distance)::text || ' m away).',
      'duplicate_id', duplicate_row.id,
      'distance_m', duplicate_distance
    );
  end if;

  insert into public.coordinates (
    raw_text,
    name,
    x,
    y,
    z,
    color,
    planet,
    location_type,
    faction_tag,
    faction_name,
    has_zone_chips,
    altitude_m,
    center_distance_m,
    notes,
    submitted_by
  )
  values (
    p_raw_text,
    p_name,
    p_x,
    p_y,
    p_z,
    p_color,
    p_planet,
    p_location_type,
    nullif(upper(coalesce(p_faction_tag, '')), ''),
    coalesce(p_faction_name, ''),
    coalesce(p_has_zone_chips, false),
    p_altitude_m,
    p_center_distance_m,
    coalesce(p_notes, ''),
    coalesce(p_submitted_by, '')
  )
  returning * into inserted_row;

  return jsonb_build_object(
    'inserted', true,
    'message', inserted_row.name || ' added.',
    'record', to_jsonb(inserted_row)
  );
end;
$$;

grant execute on function public.submit_coordinate(
  text,
  text,
  double precision,
  double precision,
  double precision,
  text,
  text,
  text,
  text,
  text,
  boolean,
  double precision,
  double precision,
  text,
  text
) to anon, authenticated;

create or replace function public.update_coordinate_admin(
  p_admin_code text,
  p_id uuid,
  p_raw_text text,
  p_name text,
  p_x double precision,
  p_y double precision,
  p_z double precision,
  p_color text,
  p_planet text,
  p_location_type text,
  p_faction_tag text,
  p_faction_name text,
  p_has_zone_chips boolean,
  p_altitude_m double precision,
  p_center_distance_m double precision,
  p_notes text default '',
  p_submitted_by text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  duplicate_id uuid;
begin
  if p_admin_code <> '6846' then
    raise exception 'Invalid admin password.';
  end if;

  if p_raw_text !~ '^GPS:[^:]+:-?[0-9]+(\.[0-9]+)?:-?[0-9]+(\.[0-9]+)?:-?[0-9]+(\.[0-9]+)?:(#[0-9A-Fa-f]{8})?:?$' then
    raise exception 'Invalid Space Engineers GPS string.';
  end if;

  perform pg_advisory_xact_lock(932047001);

  select c.id
  into duplicate_id
  from public.coordinates c
  where c.id <> p_id
    and sqrt(power(c.x - p_x, 2) + power(c.y - p_y, 2) + power(c.z - p_z, 2)) <= 1000
  order by sqrt(power(c.x - p_x, 2) + power(c.y - p_y, 2) + power(c.z - p_z, 2)) asc
  limit 1;

  if duplicate_id is not null then
    raise exception 'Another station is already listed within 1 km.';
  end if;

  update public.coordinates
  set raw_text = p_raw_text,
      name = p_name,
      x = p_x,
      y = p_y,
      z = p_z,
      color = p_color,
      planet = p_planet,
      location_type = p_location_type,
      faction_tag = nullif(upper(coalesce(p_faction_tag, '')), ''),
      faction_name = coalesce(p_faction_name, ''),
      has_zone_chips = coalesce(p_has_zone_chips, false),
      altitude_m = p_altitude_m,
      center_distance_m = p_center_distance_m,
      notes = coalesce(p_notes, ''),
      submitted_by = coalesce(p_submitted_by, '')
  where id = p_id;

  if not found then
    raise exception 'Coordinate not found.';
  end if;
end;
$$;

create or replace function public.delete_coordinate_admin(
  p_admin_code text,
  p_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_code <> '6846' then
    raise exception 'Invalid admin password.';
  end if;

  delete from public.coordinates
  where id = p_id;

  if not found then
    raise exception 'Coordinate not found.';
  end if;
end;
$$;

grant execute on function public.update_coordinate_admin(
  text,
  uuid,
  text,
  text,
  double precision,
  double precision,
  double precision,
  text,
  text,
  text,
  text,
  text,
  boolean,
  double precision,
  double precision,
  text,
  text
) to anon, authenticated;

grant execute on function public.delete_coordinate_admin(text, uuid) to anon, authenticated;

create or replace function public.upsert_npc_faction_admin(
  p_admin_code text,
  p_tag text,
  p_name text,
  p_category text,
  p_sells text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_code <> '6846' then
    raise exception 'Invalid admin password.';
  end if;

  if upper(coalesce(p_tag, '')) !~ '^[A-Z0-9]{4}$' then
    raise exception 'Faction tag must be 4 letters or numbers.';
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'Faction name is required.';
  end if;

  if p_category not in ('Builder', 'Miner', 'Trader', 'Pirate', 'Hostile NPC', 'Scenario', 'Unknown') then
    raise exception 'Invalid faction type.';
  end if;

  insert into public.npc_factions (tag, name, category, sells, updated_at)
  values (upper(p_tag), trim(p_name), p_category, coalesce(p_sells, ''), now())
  on conflict (tag)
  do update set name = excluded.name,
                category = excluded.category,
                sells = excluded.sells,
                updated_at = now();
end;
$$;

create or replace function public.delete_npc_faction_admin(
  p_admin_code text,
  p_tag text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_code <> '6846' then
    raise exception 'Invalid admin password.';
  end if;

  delete from public.npc_factions
  where tag = upper(p_tag);
end;
$$;

grant execute on function public.upsert_npc_faction_admin(text, text, text, text, text) to anon, authenticated;
grant execute on function public.delete_npc_faction_admin(text, text) to anon, authenticated;
