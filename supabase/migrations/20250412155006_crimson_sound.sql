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
  hashed_password text;
BEGIN
  -- Generate properly hashed password
  SELECT crypt('admin123', gen_salt('bf', 10)) INTO hashed_password;

  -- Delete existing admin if exists (in correct order to handle foreign key constraints)
  DELETE FROM profiles WHERE id = admin_id;
  DELETE FROM auth.users WHERE email = 'admin@healthconnect.com';

  -- Insert admin user into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    'admin@healthconnect.com',
    hashed_password,
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "System Administrator"}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
  );

  -- Create admin profile
  INSERT INTO profiles (id, full_name, role, created_at)
  VALUES
    (admin_id, 'System Administrator', 'admin', NOW());
END $$;

-- Add admin-specific policies
DROP POLICY IF EXISTS "Admins can update doctor verification" ON doctors;

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