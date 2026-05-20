create extension if not exists pgcrypto;

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
  altitude_m double precision not null,
  center_distance_m double precision not null,
  notes text default '',
  submitted_by text default '',
  created_at timestamptz not null default now()
);

alter table public.coordinates
  add column if not exists faction_tag text check (faction_tag is null or faction_tag ~ '^[A-Z0-9]{4}$');

alter table public.coordinates enable row level security;

drop policy if exists "Public can read coordinates" on public.coordinates;

create policy "Public can read coordinates"
  on public.coordinates
  for select
  using (true);

drop function if exists public.submit_coordinate(
  text,
  text,
  double precision,
  double precision,
  double precision,
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
  double precision,
  double precision,
  text,
  text
) to anon, authenticated;
