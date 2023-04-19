create or replace function public.get_user_badges(_user_id uuid)
returns setof text security definer as
$$
declare
  _user users;
  _given_nuggets int;
  _authored_releases int;
begin

  select * from users into _user
  where users.id = _user_id;

  if not found then
    return;
  end if;

  select count(*) from mod_nuggets
    inner join mods on mods.id = mod_nuggets.mod_id
    where mod_nuggets.user_id = _user_id
      and mods.is_public
  into _given_nuggets;

  if _given_nuggets >= 10 then
    return next 'nuggets_10';
  end if;

  select count(*) from release_authors
    inner join releases on releases.id = release_authors.release_id
    inner join mods on mods.id = releases.mod_id
    where release_authors.user_id = _user_id
      and mods.is_public and releases.is_public
  into _authored_releases;

  if _authored_releases >= 100 then
    return next 'releases_100';
  end if;
  if _authored_releases >= 75 then
    return next 'releases_75';
  end if;
  if _authored_releases >= 50 then
    return next 'releases_50';
  end if;
  if _authored_releases >= 35 then
    return next 'releases_35';
  end if;
  if _authored_releases >= 20 then
    return next 'releases_20';
  end if;
  if _authored_releases >= 10 then
    return next 'releases_10';
  end if;
  if _authored_releases >= 5 then
    return next 'releases_5';
  end if;
  if _authored_releases >= 3 then
    return next 'releases_3';
  end if;
  if _authored_releases >= 1 then
    return next 'releases_1';
  end if;

end;
$$ language plpgsql;

-- update_user_badges

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

-- update_all_user_badges

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

-- trigger on mod_nuggets (insert, update, delete)

create or replace function trigger_update_badges_on_mod_nuggets()
returns trigger security definer as
$$ begin perform update_user_badges(coalesce(old.user_id, new.user_id)); return new; end; $$
language plpgsql;

drop trigger if exists update_badges_on_mod_nuggets on mod_nuggets;
create trigger update_badges_on_mod_nuggets
after insert or update or delete on mod_nuggets
for each row execute function trigger_update_badges_on_mod_nuggets();

-- trigger on release_authors (insert, update, delete)

create or replace function trigger_update_badges_on_release_authors()
returns trigger security definer as
$$ begin perform update_user_badges(coalesce(old.user_id, new.user_id)); return new; end; $$
language plpgsql;

drop trigger if exists update_badges_on_release_authors on release_authors;
create trigger update_badges_on_release_authors
after insert or update or delete on release_authors
for each row execute function trigger_update_badges_on_release_authors();

-- trigger on releases (insert, update(is_public), delete)

create or replace function trigger_update_badges_on_releases()
returns trigger security definer as
$$
declare
  _release_author release_authors;
begin
  for _release_author in
    select * from release_authors
    where release_authors.release_id = coalesce(old.id, new.id)
  loop
    perform update_user_badges(_release_author.user_id);
  end loop;
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_badges_on_releases on releases;
create trigger update_badges_on_releases
after insert or update of is_public or delete on releases
for each row execute function trigger_update_badges_on_releases();

-- trigger on mods (insert, update(is_public), delete)

create or replace function trigger_update_badges_on_mods()
returns trigger security definer as
$$
declare
  _release_author release_authors;
begin
  for _release_author in
    select * from release_authors
    inner join releases on releases.id = release_authors.release_id
    where releases.mod_id = coalesce(old.id, new.id)
  loop
    perform update_user_badges(_release_author.user_id);
  end loop;
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_badges_on_mods on mods;
create trigger update_badges_on_mods
after insert or update of is_public or delete on mods
for each row execute function trigger_update_badges_on_mods();
