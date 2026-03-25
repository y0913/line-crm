-- LINEユーザー管理
create table line_users (
  id uuid primary key default gen_random_uuid(),
  line_user_id text unique not null,  -- LINEのuID
  display_name text,
  picture_url text,
  source_type text,                   -- 流入経路（qrcode等）
  followed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- メッセージ履歴
create table messages (
  id uuid primary key default gen_random_uuid(),
  line_user_id text not null references line_users(line_user_id),
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null,         -- text / image / sticker等
  content text,
  sent_at timestamptz default now()
);