/*
  # Fix profiles table RLS policies

  1. Changes
    - Enable RLS on profiles table
    - Add policies for authenticated users to:
      - Insert their own profile
      - Update their own profile
      - Read any profile
*/

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow anyone to read profiles
CREATE POLICY "Anyone can read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);