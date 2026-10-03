-- Estante de Leitura: configuração do Supabase
-- Execute este arquivo inteiro uma vez em: Supabase → SQL Editor → New query → Run.
-- Pode rodar de novo sem problemas: tudo é criado só se ainda não existir.

-- 1) Tabela com livros (kind = 'book') e trechos (kind = 'hl') de cada pessoa
create table if not exists public.items (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  id         text        not null,
  kind       text        not null check (kind in ('book', 'hl')),
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.items enable row level security;

-- Projetos novos do Supabase não liberam tabelas novas para a API automaticamente
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.items to authenticated;

drop policy if exists "items: ler os próprios"      on public.items;
drop policy if exists "items: criar os próprios"    on public.items;
drop policy if exists "items: alterar os próprios"  on public.items;
drop policy if exists "items: excluir os próprios"  on public.items;

create policy "items: ler os próprios"     on public.items for select to authenticated using (auth.uid() = user_id);
create policy "items: criar os próprios"   on public.items for insert to authenticated with check (auth.uid() = user_id);
create policy "items: alterar os próprios" on public.items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "items: excluir os próprios" on public.items for delete to authenticated using (auth.uid() = user_id);

-- 2) Tempo real: o celular e o notebook recebem as mudanças na hora
alter table public.items replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'items'
  ) then
    alter publication supabase_realtime add table public.items;
  end if;
end $$;

-- 3) Bucket privado para os arquivos PDF/EPUB (cada pessoa usa a pasta com o próprio id)
insert into storage.buckets (id, name, public)
values ('books', 'books', false)
on conflict (id) do nothing;

drop policy if exists "books: ler os próprios"     on storage.objects;
drop policy if exists "books: enviar os próprios"  on storage.objects;
drop policy if exists "books: alterar os próprios" on storage.objects;
drop policy if exists "books: excluir os próprios" on storage.objects;

create policy "books: ler os próprios" on storage.objects for select to authenticated
  using (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "books: enviar os próprios" on storage.objects for insert to authenticated
  with check (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "books: alterar os próprios" on storage.objects for update to authenticated
  using (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "books: excluir os próprios" on storage.objects for delete to authenticated
  using (bucket_id = 'books' and (storage.foldername(name))[1] = auth.uid()::text);
