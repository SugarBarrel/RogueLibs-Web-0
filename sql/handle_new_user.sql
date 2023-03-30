create or replace function public.handle_new_user()
returns trigger
security definer
as
$$
begin

  insert into public.users (id, uid, username, avatar_url)
  values (new.id, new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  return new;

end;
$$ language plpgsql;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
