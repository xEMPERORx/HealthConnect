/*
  # Add Admin Role and Account

  1. Changes
    - Add role column to profiles table
    - Create admin user and profile
    - Add admin-specific policies for doctor verification
    
  2. Security
    - Enable RLS on doctors table
    - Add policy for admin to verify doctors
*/

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text;

-- Create admin user
DO $$
DECLARE
  admin_id uuid := '8f9e7d6c-5b4a-3c2e-1d0f-9e8d7c6b5a4b';
BEGIN
  -- Insert admin user into auth.users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES
    (admin_id, 'admin@healthconnect.com', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW());

  -- Create admin profile
  INSERT INTO profiles (id, full_name, role, created_at)
  VALUES
    (admin_id, 'System Administrator', 'admin', NOW());
END $$;

-- Add admin-specific policies
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can update doctor verification"
ON doctors
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);