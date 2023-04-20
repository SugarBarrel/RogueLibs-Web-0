create or replace view latest_releases
with (security_invoker)
as
  select distinct on (mod_id) releases.*
  from releases
  order by mod_id, created_at desc
;

create or replace view latest_releases_public
as
  select distinct on (mod_id) releases.*
  from releases
  inner join mods on mods.id = releases.mod_id
  where mods.is_public and releases.is_public
  order by mod_id, created_at desc
;
