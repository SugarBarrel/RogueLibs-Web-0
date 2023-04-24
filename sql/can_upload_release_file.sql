declare
  _release_id int;
  _filename text;
  _release_file release_files;
  _release_author release_authors;
begin

  select split_part(_object_name, '.', 1)::int into _release_id;
  select substr(_object_name, length(_release_id::text) + 2) into _filename;

  select * from release_files into _release_file
  where release_files.release_id = _release_id
    and release_files.filename = _filename;

  if not found then
    return false;
  end if;

  select * from release_authors into _release_author
  where release_authors.release_id = _release_id
    and release_authors.user_id = auth.uid();

  if found and _release_author.can_edit then
    return true;
  end if;

  return false;

end;
