create or replace function public.ensure_one_release_creator()
returns trigger
security definer
as
$$
begin

  if count((
    select 1 from release_authors
    where release_authors.release_id = new.release_id
      and release_authors.is_creator
  )) > 1 then
    raise exception 'A release can''t have more than 1 creator.';
  end if;

  return new;

end;
$$ language plpgsql;

drop trigger if exists ensure_one_release_creator
on public.release_authors;

create constraint trigger ensure_one_release_creator
after insert or delete or update of is_creator
on public.release_authors
deferrable initially deferred
for each row
execute procedure public.ensure_one_release_creator();
