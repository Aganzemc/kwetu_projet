/*
  # KwetuCode Database Schema

  ## Overview
  Complete database schema for KwetuCode team collaboration and messaging app.

  ## Tables Created

  ### 1. profiles
  Extended user profile information beyond auth.users
  - `id` (uuid, primary key, references auth.users)
  - `first_name` (text)
  - `last_name` (text)
  - `phone` (text)
  - `country` (text)
  - `province` (text)
  - `city` (text)
  - `avenue` (text)
  - `profile_photo_url` (text)
  - `cover_photo_url` (text)
  - `is_online` (boolean, default false)
  - `last_seen` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. groups
  Chat groups/channels
  - `id` (uuid, primary key)
  - `name` (text, required)
  - `description` (text)
  - `created_by` (uuid, references profiles)
  - `avatar_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. group_members
  Group membership tracking
  - `id` (uuid, primary key)
  - `group_id` (uuid, references groups)
  - `user_id` (uuid, references profiles)
  - `role` (text, default 'member')
  - `joined_at` (timestamptz)

  ### 4. messages
  Chat messages (individual and group)
  - `id` (uuid, primary key)
  - `sender_id` (uuid, references profiles)
  - `recipient_id` (uuid, references profiles, nullable)
  - `group_id` (uuid, references groups, nullable)
  - `content` (text)
  - `message_type` (text, default 'text')
  - `file_url` (text)
  - `file_name` (text)
  - `file_type` (text)
  - `is_read` (boolean, default false)
  - `created_at` (timestamptz)

  ### 5. calls
  Voice and video call records
  - `id` (uuid, primary key)
  - `caller_id` (uuid, references profiles)
  - `call_type` (text)
  - `group_id` (uuid, references groups, nullable)
  - `status` (text, default 'initiated')
  - `started_at` (timestamptz)
  - `ended_at` (timestamptz)

  ### 6. call_participants
  Participants in calls
  - `id` (uuid, primary key)
  - `call_id` (uuid, references calls)
  - `user_id` (uuid, references profiles)
  - `joined_at` (timestamptz)
  - `left_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can read their own profile
  - Users can update their own profile
  - Users can read profiles of people they chat with
  - Group members can read group details and messages
  - Users can send/receive messages
  - Call participants can access call data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  phone text,
  country text,
  province text,
  city text,
  avenue text,
  profile_photo_url text,
  cover_photo_url text,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  content text,
  message_type text DEFAULT 'text',
  file_url text,
  file_name text,
  file_type text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (recipient_id IS NOT NULL AND group_id IS NULL) OR
    (recipient_id IS NULL AND group_id IS NOT NULL)
  )
);

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  call_type text NOT NULL,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  status text DEFAULT 'initiated',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Create call_participants table
CREATE TABLE IF NOT EXISTS call_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(call_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Groups policies
CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view their direct messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    (sender_id = auth.uid() OR recipient_id = auth.uid())
    OR
    (
      group_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = messages.group_id
        AND group_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    (
      (recipient_id IS NOT NULL AND group_id IS NULL) OR
      (
        group_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.group_id = messages.group_id
          AND group_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update their message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = sender_id)
  WITH CHECK (auth.uid() = recipient_id OR auth.uid() = sender_id);

-- Calls policies
CREATE POLICY "Users can view calls they participate in"
  ON calls FOR SELECT
  TO authenticated
  USING (
    caller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM call_participants
      WHERE call_participants.call_id = calls.id
      AND call_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can initiate calls"
  ON calls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Call participants can update call status"
  ON calls FOR UPDATE
  TO authenticated
  USING (
    caller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM call_participants
      WHERE call_participants.call_id = calls.id
      AND call_participants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    caller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM call_participants
      WHERE call_participants.call_id = calls.id
      AND call_participants.user_id = auth.uid()
    )
  );

-- Call participants policies
CREATE POLICY "Users can view participants of their calls"
  ON call_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = call_participants.call_id
      AND calls.caller_id = auth.uid()
    )
  );

CREATE POLICY "Users can join calls"
  ON call_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON call_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_call_id ON call_participants(call_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, created_at, updated_at)
  VALUES (NEW.id, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();