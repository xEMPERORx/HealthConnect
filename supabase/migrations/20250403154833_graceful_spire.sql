/*
  # Insert Dummy Data with Auth Users

  1. Data Insertion
    - Create auth users first
    - Add corresponding profiles
    - Add sample doctors, stories, events, and consultation slots
    - All data is linked properly through foreign keys

  2. Notes
    - Using auth.users() function to create auth users
    - All UUIDs are valid and consistent
    - Timestamps are relative to current time
*/

-- Create auth users first (this creates entries in auth.users)
DO $$
DECLARE
  user1_id uuid := 'd0d54aa5-6d96-45d5-9c6c-c8723f1fbb73';
  user2_id uuid := 'f5b8c105-7721-4d87-9c6d-f5e9c8e3b9a2';
  user3_id uuid := 'a7c86c95-1f9d-4c3e-9f6b-d8b9c2f1e3a4';
  user4_id uuid := 'b2d43f67-8e9a-4c5b-9d7e-a6b5c4d3e2f1';
BEGIN
  -- Insert users into auth.users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES
    (user1_id, 'dr.sarah@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (user2_id, 'dr.chen@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (user3_id, 'emma@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (user4_id, 'james@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

  -- Insert corresponding profiles
  INSERT INTO profiles (id, full_name, avatar_url, bio, created_at)
  VALUES
    (user1_id, 'Dr. Sarah Johnson', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', 'Cardiologist with 15 years of experience', NOW() - INTERVAL '30 days'),
    (user2_id, 'Dr. Michael Chen', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300', 'Neurologist specializing in sleep disorders', NOW() - INTERVAL '25 days'),
    (user3_id, 'Emma Wilson', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300', 'Sharing my journey to recovery', NOW() - INTERVAL '20 days'),
    (user4_id, 'James Anderson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300', 'Mental health advocate', NOW() - INTERVAL '15 days');

  -- Insert doctors
  INSERT INTO doctors (id, profile_id, specialization, license_number, years_of_experience, is_verified, created_at)
  VALUES
    ('e1f2a3b4-c5d6-4e7f-8a9b-1c2d3e4f5a6b', user1_id, 'Cardiology', 'MD12345', 15, true, NOW() - INTERVAL '29 days'),
    ('b9a8c7d6-e5f4-4a3b-2c1d-e0f9a8b7c6d5', user2_id, 'Neurology', 'MD67890', 12, true, NOW() - INTERVAL '24 days');

  -- Insert stories
  INSERT INTO stories (id, author_id, title, content, category, created_at)
  VALUES
    ('c1d2e3f4-a5b6-4c7d-8e9f-1a2b3c4d5e6f', user3_id, 'My Recovery Journey', 'After months of physical therapy and determination, I finally achieved my goal of running a 5K. The support from this community has been incredible.', 'recovery', NOW() - INTERVAL '10 days'),
    ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', user4_id, 'Breaking the Mental Health Stigma', 'It''s time we talked openly about mental health. Here''s my story of overcoming anxiety and finding strength in vulnerability.', 'mental-health', NOW() - INTERVAL '5 days'),
    ('e7f8a9b0-c1d2-4e3f-4a5b-c6d7e8f9a0b1', user3_id, 'Living with Chronic Pain', 'Managing chronic pain has been a journey of discovery. Here are some strategies that have helped me maintain a positive outlook.', 'chronic-illness', NOW() - INTERVAL '3 days');

  -- Insert events
  INSERT INTO events (id, organizer_id, title, description, event_date, location, max_participants, registration_link, created_at)
  VALUES
    ('f9a8b7c6-d5e4-4f3a-2b1c-d0e9f8a7b6c5', user1_id, 'Heart Health Workshop', 'Join Dr. Sarah Johnson for an interactive workshop on maintaining heart health through lifestyle changes.', NOW() + INTERVAL '7 days', 'Community Center, 123 Health St', 30, 'https://example.com/heart-workshop', NOW() - INTERVAL '5 days'),
    ('a0b1c2d3-e4f5-4a6b-7c8d-e9f0a1b2c3d4', user2_id, 'Sleep Disorders Seminar', 'Learn about common sleep disorders and effective treatment options with Dr. Michael Chen.', NOW() + INTERVAL '14 days', 'Medical Center Auditorium, 456 Care Ave', 50, 'https://example.com/sleep-seminar', NOW() - INTERVAL '3 days'),
    ('b3c4d5e6-f7a8-4b9c-0d1e-f2a3b4c5d6e7', user1_id, 'Stress Management Workshop', 'Practical techniques for managing stress in daily life. Interactive sessions and group discussions.', NOW() + INTERVAL '21 days', 'Wellness Center, 789 Mind St', 25, 'https://example.com/stress-workshop', NOW() - INTERVAL '2 days');

  -- Insert consultation slots
  INSERT INTO consultation_slots (id, doctor_id, start_time, end_time, is_booked, created_at)
  VALUES
    ('c5d6e7f8-a9b0-4c1d-2e3f-a4b5c6d7e8f9', 'e1f2a3b4-c5d6-4e7f-8a9b-1c2d3e4f5a6b', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', false, NOW()),
    ('d7e8f9a0-b1c2-4d3e-4f5a-b6c7d8e9f0a1', 'e1f2a3b4-c5d6-4e7f-8a9b-1c2d3e4f5a6b', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', false, NOW()),
    ('e9f0a1b2-c3d4-4e5f-6a7b-c8d9e0f1a2b3', 'b9a8c7d6-e5f4-4a3b-2c1d-e0f9a8b7c6d5', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', false, NOW()),
    ('f1a2b3c4-d5e6-4f7a-8b9c-d0e1f2a3b4c5', 'b9a8c7d6-e5f4-4a3b-2c1d-e0f9a8b7c6d5', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour', false, NOW());
END $$;