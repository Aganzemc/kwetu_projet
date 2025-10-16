-- Seed two users and their profiles
-- Note: password hashes here are bcrypt examples for 'Password123!'

-- Helper function to return a bcrypt hash using pgcrypto is not available; we'll insert raw hashes.
-- Hash generated externally: $2a$10$QxJfA6pJbqjE6vQh4BfR0u9bQX8m0J9Ck9q4G0S0nYx0n0Zy3m2Ne

with u1 as (
  insert into users (email, password_hash)
  values ('julien.kamangala@example.com', '$2a$10$QxJfA6pJbqjE6vQh4BfR0u9bQX8m0J9Ck9q4G0S0nYx0n0Zy3m2Ne')
  returning id
), u2 as (
  insert into users (email, password_hash)
  values ('marie.ndala@example.com', '$2a$10$QxJfA6pJbqjE6vQh4BfR0u9bQX8m0J9Ck9q4G0S0nYx0n0Zy3m2Ne')
  returning id
)
insert into profiles (id, first_name, last_name, date_of_birth, username, bio, address, city, country, province, avenue, phone, profile_photo_url)
select id, 'Julien', 'Kamangala', '1992-04-15', 'kamangala', 'Bio de Julien', '12 Av. Kasa-Vubu', 'Kinshasa', 'RDC', 'Kinshasa', 'Gombe', '+243 999 111 222', null from u1
union all
select id, 'Marie', 'Ndala', '1995-09-21', 'marie', 'Bio de Marie', '45 Rue de la Paix', 'Lubumbashi', 'RDC', 'Haut-Katanga', 'Golf', '+243 999 333 444', null from u2;


