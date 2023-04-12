create or replace function public.ensure_one_mod_creator()
returns trigger
security definer
as
$$
begin

  if count((
    select 1 from mod_authors
    where mod_authors.mod_id = new.mod_id
      and mod_authors.is_creator
  )) > 1 then
    raise exception 'A mod can''t have more than 1 creator.';
  end if;

  return new;

end;
$$ language plpgsql;

drop trigger if exists ensure_one_mod_creator
on public.mod_authors;

create constraint trigger ensure_one_mod_creator
after insert or delete or update of is_creator
on public.mod_authors
deferrable initially deferred
for each row
execute procedure public.ensure_one_mod_creator();
