create or replace function public.search_users(_term text, _limit int)
returns setof record
as
$$
select *, similarity(users.username, _term)
from users
where similarity(users.username, _term) > 0
order by similarity desc
limit _limit
$$ language sql;
