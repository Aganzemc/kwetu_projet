-- Extend profiles with requested user information fields
alter table profiles add column if not exists date_of_birth date;
alter table profiles add column if not exists username text unique;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists address text;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists country text;
alter table profiles add column if not exists province text;
alter table profiles add column if not exists avenue text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists profile_photo_url text;
alter table profiles add column if not exists cover_photo_url text;


