declare
  _prev_nugget bool;
begin

  if not exists(select 1 from users where uid = auth.uid()) then
    raise exception 'User is not authenticated.';
  end if;

  if not is_mod_visible(_mod_id) then
    raise exception 'A mod with the specified id does not exist or is hidden.';
  end if;

  select exists(
    select 1 from mod_nuggets
    where mod_nuggets.mod_id = _mod_id and mod_nuggets.user_id = auth.uid()
  ) into _prev_nugget;

  if _nugget != _prev_nugget then
    if _nugget then
      insert into mod_nuggets(mod_id, user_id)
      values(_mod_id, auth.uid());
    else
      delete from mod_nuggets
      where mod_nuggets.mod_id = _mod_id and mod_nuggets.user_id = auth.uid();
    end if;

    update mods
    set nugget_count = nugget_count + case _nugget when true then 1 else -1 end
    where mods.id = _mod_id;
  end if;

  return (select nugget_count from mods
  where mods.id = _mod_id);

end;
