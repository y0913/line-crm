-- ============================================
-- Phase 1: Multi-tenant SaaS migration
-- ============================================

-- テナントごとのLINE設定
create table if not exists tenant_line_config (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid unique not null references auth.users(id) on delete cascade,
  line_channel_secret text not null,
  line_channel_access_token text not null,
  webhook_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 既存テーブルに tenant_id 追加
alter table line_users add column if not exists tenant_id uuid references auth.users(id);
alter table messages add column if not exists tenant_id uuid references auth.users(id);
alter table tags add column if not exists tenant_id uuid references auth.users(id);
alter table user_tags add column if not exists tenant_id uuid references auth.users(id);

-- 依存する外部キーを先に削除
alter table messages drop constraint if exists messages_line_user_id_fkey;
alter table user_tags drop constraint if exists user_tags_line_user_id_fkey;

-- 既存のユニーク制約を削除してテナントスコープに変更
alter table line_users drop constraint if exists line_users_line_user_id_key;
alter table line_users add constraint line_users_tenant_line_user_id_key unique(tenant_id, line_user_id);

alter table tags drop constraint if exists tags_name_key;
alter table tags add constraint tags_tenant_name_key unique(tenant_id, name);

alter table user_tags drop constraint if exists user_tags_line_user_id_tag_id_key;
alter table user_tags add constraint user_tags_tenant_line_user_id_tag_id_key unique(tenant_id, line_user_id, tag_id);

-- インデックス
create index if not exists idx_line_users_tenant on line_users(tenant_id);
create index if not exists idx_messages_tenant on messages(tenant_id);
create index if not exists idx_tags_tenant on tags(tenant_id);
create index if not exists idx_user_tags_tenant on user_tags(tenant_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

alter table tenant_line_config enable row level security;
alter table line_users enable row level security;
alter table messages enable row level security;
alter table tags enable row level security;
alter table user_tags enable row level security;

-- tenant_line_config
create policy "tenant_isolation" on tenant_line_config
  for all using (tenant_id = auth.uid());

-- line_users
create policy "tenant_isolation" on line_users
  for all using (tenant_id = auth.uid());

-- messages
create policy "tenant_isolation" on messages
  for all using (tenant_id = auth.uid());

-- tags
create policy "tenant_isolation" on tags
  for all using (tenant_id = auth.uid());

-- user_tags
create policy "tenant_isolation" on user_tags
  for all using (tenant_id = auth.uid());
