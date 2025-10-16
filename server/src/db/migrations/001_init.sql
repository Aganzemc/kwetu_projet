-- users hold credentials (email/password) replacing Supabase auth
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- profiles linked 1:1 with users
create table if not exists profiles (
  id uuid primary key references users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  is_online boolean default false,
  last_seen timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text default 'member',
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create type message_kind as enum ('text', 'file');

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references users(id) on delete cascade,
  recipient_id uuid references users(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  content text not null default '',
  message_type message_kind not null default 'text',
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_peer on messages(sender_id, recipient_id, created_at);
create index if not exists idx_messages_group on messages(group_id, created_at);


