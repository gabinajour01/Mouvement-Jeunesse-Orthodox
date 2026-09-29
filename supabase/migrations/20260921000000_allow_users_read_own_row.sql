alter table public.allowed_users enable row level security;

drop policy if exists "Users can read their own allowlist row" on public.allowed_users;

create policy "Users can read their own allowlist row"
on public.allowed_users
for select
to authenticated
using (lower(email) = lower((select auth.jwt() ->> 'email')));
