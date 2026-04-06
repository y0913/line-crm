-- line_usersにメモカラム追加
alter table line_users add column if not exists memo text;

-- タグマスター
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  color text not null default '#6b7280',
  created_at timestamptz default now()
);

-- ユーザーとタグの中間テーブル
create table if not exists user_tags (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null references line_users(line_user_id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz default now(),
  unique(line_user_id, tag_id)
);
