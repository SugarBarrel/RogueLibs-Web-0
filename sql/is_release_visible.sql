declare
  _release releases;
  _release_author release_authors;
begin

  select * from releases into _release
  where releases.id = _release_id;

  if found then

    if not is_mod_visible(_release.mod_id) then -- can't see the release's mod
      return false;
    end if;

    if _release.is_public then -- the release is public
      return true;
    end if;

    select * from release_authors into _release_author
    where release_authors.release_id = _release_id
      and release_authors.user_id = auth.uid();

    if found and _release_author.can_see then -- user is allowed to see the release
      return true;
    end if;

  end if;

  return false; -- by default, not visible

end;
