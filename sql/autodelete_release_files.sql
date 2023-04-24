create or replace function delete_storage_object(bucket text, object text, out status int, out content text)
returns record
language 'plpgsql'
security definer
as $$
declare
  project_url text := 'https://ytieijgwscimgfgnyabq.supabase.co';
  service_role_key text := '<YOURSERVICEROLEKEY>'; --  full access needed
  url text := project_url||'/storage/v1/object/'||bucket||'/'||object;
begin
  select
      into status, content
           result.status::int, result.content::text
      FROM extensions.http((
    'DELETE',
    url,
    ARRAY[extensions.http_header('authorization','Bearer '||service_role_key)],
    NULL,
    NULL)::extensions.http_request) as result;
end;
$$;

create or replace function delete_release_file(f record, out status int, out content text)
returns record
language 'plpgsql'
security definer
as $$
begin
  select
      into status, content
           result.status, result.content
      from public.delete_storage_object('release-files', f.release_id || '.' || f.filename) as result;
end;
$$;

create or replace function delete_old_release_file()
returns trigger
language 'plpgsql'
security definer
as $$
declare
  status int;
  content text;
begin
  select
    into status, content
    result.status, result.content
    from delete_release_file(old) as result;
  if status <> 200 then
    raise warning 'Could not delete release file: % % %', status, content, json_agg(old);
  end if;

  return new;
end;
$$;

drop trigger delete_old_release_files on public.release_files;
create trigger delete_old_release_files
  after delete on public.release_files
  for each row execute function delete_old_release_file();
