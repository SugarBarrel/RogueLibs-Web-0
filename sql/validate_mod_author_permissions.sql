create or replace function public.validate_mod_author_permissions()
returns trigger
security definer
as
$$
begin

  if new.is_creator then
    new.can_edit := true;
  end if;
  if new.can_edit then
    new.can_see := true;
  end if;

  return new;

end;
$$ language plpgsql;

drop trigger if exists validate_mod_author_permissions
on public.mod_authors;

create trigger validate_mod_author_permissions
before insert or update
on public.mod_authors
for each row
execute procedure public.validate_mod_author_permissions();
