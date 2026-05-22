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

create table if not exists public.npc_factions (
  tag text primary key check (tag ~ '^[A-Z0-9]{4}$'),
  name text not null,
  category text not null,
  sells text default '',
  updated_at timestamptz not null default now()
);

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.npc_factions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table public.npc_factions drop constraint if exists %I', constraint_name);
  end loop;
end $$;

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
  boolean,
  boolean,
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
  p_sells_ships boolean,
  p_sells_h2_gas boolean,
  p_sells_o2_gas boolean,
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
    sells_ships,
    sells_h2_gas,
    sells_o2_gas,
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
    coalesce(p_sells_ships, false),
    coalesce(p_sells_h2_gas, false),
    coalesce(p_sells_o2_gas, false),
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
  boolean,
  boolean,
  boolean,
  double precision,
  double precision,
  text,
  text
) to anon, authenticated;

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
  boolean,
  boolean,
  boolean,
  double precision,
  double precision,
  text,
  text
);

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
  p_sells_ships boolean,
  p_sells_h2_gas boolean,
  p_sells_o2_gas boolean,
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
begin
  if p_admin_code <> '6846' then
    raise exception 'Invalid admin password.';
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
      sells_ships = coalesce(p_sells_ships, false),
      sells_h2_gas = coalesce(p_sells_h2_gas, false),
      sells_o2_gas = coalesce(p_sells_o2_gas, false),
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
  boolean,
  boolean,
  boolean,
  double precision,
  double precision,
  text,
  text
) to anon, authenticated;

drop function if exists public.upsert_npc_faction_admin(text, text, text, text, text);

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

  insert into public.npc_factions (tag, name, category, sells, updated_at)
  values (upper(p_tag), trim(p_name), trim(p_category), coalesce(p_sells, ''), now())
  on conflict (tag)
  do update set name = excluded.name,
                category = excluded.category,
                sells = excluded.sells,
                updated_at = now();
end;
$$;

grant execute on function public.upsert_npc_faction_admin(text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';
