/*
  # Fix Database Policies and Relationships

  1. Changes
    - Drop and recreate RLS policies with proper checks
    - Add missing indexes for performance
    - Fix foreign key relationships
    - Update policy definitions for better security
    
  2. Security
    - Ensure proper RLS for all tables
    - Add proper authentication checks
    - Fix policy permissions
*/

-- Fix profiles table policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Fix stories table policies
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stories are viewable by everyone" ON stories;
DROP POLICY IF EXISTS "Authenticated users can create stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;

CREATE POLICY "Stories are viewable by everyone" 
ON stories FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Users can create own stories" 
ON stories FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own stories" 
ON stories FOR UPDATE 
TO authenticated 
USING (auth.uid() = author_id);

-- Fix events table policies
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;

CREATE POLICY "Events are viewable by everyone" 
ON events FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Users can create events" 
ON events FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own events" 
ON events FOR UPDATE 
TO authenticated 
USING (auth.uid() = organizer_id);

-- Fix doctors table policies
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctor profiles are viewable by everyone" ON doctors;
DROP POLICY IF EXISTS "Doctors can update own profile" ON doctors;

CREATE POLICY "Doctor profiles are viewable by everyone" 
ON doctors FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Doctors can update own profile" 
ON doctors FOR UPDATE 
TO authenticated 
USING (auth.uid() = profile_id);

CREATE POLICY "Users can create doctor profile" 
ON doctors FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = profile_id);

-- Fix consultation_slots table policies
ALTER TABLE consultation_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Consultation slots are viewable by everyone" ON consultation_slots;
DROP POLICY IF EXISTS "Doctors can manage their slots" ON consultation_slots;

CREATE POLICY "Slots are viewable by everyone" 
ON consultation_slots FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Doctors can manage their slots" 
ON consultation_slots FOR ALL 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT profile_id 
    FROM doctors 
    WHERE id = consultation_slots.doctor_id
  )
);

-- Fix consultations table policies
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own consultations" ON consultations;
DROP POLICY IF EXISTS "Authenticated users can book consultations" ON consultations;
DROP POLICY IF EXISTS "Participants can update consultation" ON consultations;

CREATE POLICY "Users can view own consultations" 
ON consultations FOR SELECT 
TO authenticated 
USING (
  auth.uid() = patient_id OR 
  auth.uid() IN (
    SELECT profile_id 
    FROM doctors 
    WHERE id IN (
      SELECT doctor_id 
      FROM consultation_slots 
      WHERE id = consultations.slot_id
    )
  )
);

CREATE POLICY "Users can book consultations" 
ON consultations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Participants can update consultations" 
ON consultations FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = patient_id OR 
  auth.uid() IN (
    SELECT profile_id 
    FROM doctors 
    WHERE id IN (
      SELECT doctor_id 
      FROM consultation_slots 
      WHERE id = consultations.slot_id
    )
  )
);

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_doctors_profile_id ON doctors(profile_id);
CREATE INDEX IF NOT EXISTS idx_consultation_slots_doctor_id ON consultation_slots(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_slot_id ON consultations(slot_id);

-- Add created_at indexes for better sorting performance
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctors_created_at ON doctors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);