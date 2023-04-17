create or replace function public.get_user_badges(_user_id uuid)
returns setof text
security definer
as
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

create or replace procedure public.update_user_badges(_user_id uuid)
security definer
as
$$
begin
  delete from user_badges
  where user_badges.user_id = _user_id
    and user_badges.automatic;

  insert into user_badges(user_id, badge_name)
  select _user_id, get_user_badges(_user_id);
end;
$$ language plpgsql;
