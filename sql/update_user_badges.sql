create or replace function public.get_user_badges(_user_id uuid)
returns setof text security definer as
$$
declare
  _user users;
  _given_nuggets int;
  _total_mods int;
  _authored_mods int;
begin

  select * from users into _user
  where users.id = _user_id;

  if not found then
    return;
  end if;

  select count(*)
  from mod_nuggets where mod_nuggets.user_id = _user_id
  into _given_nuggets;

  select count(*) from mods where mods.is_public into _total_mods;

  if _given_nuggets >= 0.9 * _total_mods then
    return next 'nuggets_90';
  end if;
  if _given_nuggets >= 0.5 * _total_mods then
    return next 'nuggets_50';
  end if;
  if _given_nuggets >= 0.2 * _total_mods then
    return next 'nuggets_20';
  end if;

  select count(*) from mod_authors
  inner join mods on mod_authors.mod_id = mods.id
  where mod_authors.user_id = _user_id
    and mods.is_public into _authored_mods;

  if _authored_mods >= 100 then
    return next 'mods_100';
  end if;
  if _authored_mods >= 50 then
    return next 'mods_50';
  end if;
  if _authored_mods >= 25 then
    return next 'mods_25';
  end if;
  if _authored_mods >= 10 then
    return next 'mods_10';
  end if;
  if _authored_mods >= 5 then
    return next 'mods_5';
  end if;
  if _authored_mods >= 3 then
    return next 'mods_3';
  end if;
  if _authored_mods >= 1 then
    return next 'mods_1';
  end if;

end;
$$ language plpgsql;

create or replace function public.update_user_badges(_user_id uuid)
returns void security definer as
$$
begin
  delete from user_badges
  where user_badges.user_id = _user_id
    and user_badges.automatic;

  insert into user_badges(user_id, badge_name)
  select _user_id, get_user_badges(_user_id)
  on conflict do nothing;
end;
$$ language plpgsql;

create or replace function public.update_all_user_badges()
returns void security definer as
$$
declare
  _user users;
begin
  for _user in
    select * from users
  loop
    perform public.update_user_badges(_user.id);
  end loop;
end;
$$ language plpgsql;



create or replace function mod_nuggets_trigger_update_badges()
returns trigger security definer as
$$
begin
  perform update_user_badges(coalesce(old.user_id, new.user_id));
  return new;
end;
$$ language plpgsql;

drop trigger if exists mod_nuggets_update_badges on mod_nuggets;

create trigger mod_nuggets_update_badges
after insert or update or delete on mod_nuggets
for each row execute function mod_nuggets_trigger_update_badges();



create or replace function mod_authors_trigger_update_badges()
returns trigger security definer as
$$
begin
  perform update_user_badges(coalesce(old.user_id, new.user_id));
  return new;
end;
$$ language plpgsql;

drop trigger if exists mod_authors_update_badges on mod_authors;

create trigger mod_authors_update_badges
after insert or update or delete on mod_authors
for each row execute function mod_authors_trigger_update_badges();



create or replace function mods_trigger_update_badges()
returns trigger security definer as
$$
declare
  _mod_author mod_authors;
begin
  for _mod_author in
    select * from mod_authors
    where mod_authors.mod_id = coalesce(old.id, new.id)
  loop
    perform update_user_badges(_mod_author.user_id);
  end loop;
  return new;
end;
$$ language plpgsql;

drop trigger if exists mods_update_badges on mods;

create trigger mods_update_badges
after insert or update of is_public or delete on mods
for each row execute function mods_trigger_update_badges();
