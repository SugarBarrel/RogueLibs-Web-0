create or replace view latest_releases as
  select distinct on (mod_id) *
  from releases
  order by mod_id, created_at desc
;
