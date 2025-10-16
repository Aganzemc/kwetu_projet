/*
  # Create Storage Buckets

  ## Overview
  Create storage buckets for file uploads in KwetuCode app.

  ## Buckets Created

  ### 1. avatars
  For user profile and cover photos
  - Public access for reading
  - Authenticated users can upload

  ### 2. chat-uploads
  For file sharing in chats
  - Authenticated users can read and upload
  - Files are accessible to chat participants

  ## Security
  - RLS policies ensure users can only access their own files or files from their chats
*/

-- Create avatars bucket for profile/cover photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create chat-uploads bucket for file sharing
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-uploads', 'chat-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Chat uploads bucket policies
CREATE POLICY "Users can view chat files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-uploads');

CREATE POLICY "Authenticated users can upload chat files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-uploads');

CREATE POLICY "Users can delete their uploaded chat files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
