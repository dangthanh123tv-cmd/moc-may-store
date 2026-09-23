-- MỘC MÂY V8 — Database security hardening
-- Run this AFTER the existing orders table and reviews table have been created.

-- 1) ORDERS: customers may INSERT only; only role=admin may SELECT/UPDATE/DELETE.
alter table public.orders enable row level security;

drop policy if exists "Admin duoc xem don" on public.orders;
drop policy if exists "Admin duoc cap nhat don" on public.orders;
drop policy if exists "Admin duoc xoa don hang" on public.orders;
drop policy if exists "Khach duoc tao don" on public.orders;

create policy "Khach duoc tao don"
on public.orders
for insert
to anon, authenticated
with check (
  char_length(trim(customer_name)) between 2 and 100
  and char_length(trim(phone)) between 8 and 20
  and char_length(trim(address)) between 5 and 300
  and char_length(coalesce(note, '')) <= 500
  and total >= 0
  and status = 'Mới'
  and jsonb_typeof(items) = 'array'
  and jsonb_array_length(items) between 1 and 30
);

create policy "Admin duoc xem don"
on public.orders
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin duoc cap nhat don"
on public.orders
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin duoc xoa don hang"
on public.orders
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Useful indexes for admin queries.
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- 2) REVIEWS: public read/insert; only Admin may delete.
alter table public.reviews enable row level security;

drop policy if exists "Khach duoc xem danh gia" on public.reviews;
drop policy if exists "Khach duoc gui danh gia" on public.reviews;
drop policy if exists "Admin duoc xoa danh gia" on public.reviews;

create policy "Khach duoc xem danh gia"
on public.reviews
for select
to anon, authenticated
using (true);

create policy "Khach duoc gui danh gia"
on public.reviews
for insert
to anon, authenticated
with check (
  char_length(trim(name)) between 2 and 80
  and rating between 1 and 5
  and char_length(trim(text)) between 5 and 1000
);

create policy "Admin duoc xoa danh gia"
on public.reviews
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

-- 3) Realtime configuration. Safe to run more than once: the DO block checks first.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;
end $$;

alter table public.orders replica identity full;
alter table public.reviews replica identity full;

-- IMPORTANT:
-- Keep only the Supabase publishable/anon key in the frontend.
-- NEVER put service_role/secret keys in React, Vite, GitHub, or public files.
