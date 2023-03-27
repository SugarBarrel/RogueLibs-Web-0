declare
  _mod mods;
  _mod_author mod_authors;
begin

  select * from mods into _mod
  where mods.id = _mod_id;

  if found then

    if _mod.is_public then -- the mod is public
      return true;
    end if;

    select * from mod_authors into _mod_author
    where mod_authors.mod_id = _mod_id;

    if found and _mod_author.can_see then -- user is allowed to see the mod
      return true;
    end if;

  end if;

  return false; -- by default, not visible

end;
