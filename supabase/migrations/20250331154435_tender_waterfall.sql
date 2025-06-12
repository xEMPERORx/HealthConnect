/*
  # Initial Schema Setup for HealthConnect Platform

  1. New Tables
    - `profiles`
      - Stores user profile information
      - Links to Supabase auth.users
    - `stories`
      - Stores community health stories
      - Links to profiles for authorship
    - `events`
      - Stores health-related events
      - Links to profiles for organizers
    - `doctors`
      - Stores verified doctor profiles
      - Links to profiles for basic info
    - `consultation_slots`
      - Stores available consultation time slots
      - Links to doctors
    - `consultations`
      - Stores booked consultations
      - Links doctors with users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add specific policies for doctors
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories are viewable by everyone"
  ON stories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = author_id);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  max_participants integer NOT NULL,
  registration_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  USING (auth.uid() = organizer_id);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  specialization text NOT NULL,
  license_number text NOT NULL UNIQUE,
  years_of_experience integer NOT NULL,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor profiles are viewable by everyone"
  ON doctors FOR SELECT
  USING (true);

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  USING (auth.uid() = profile_id);

-- Create consultation_slots table
CREATE TABLE IF NOT EXISTS consultation_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES doctors(id) NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_booked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultation slots are viewable by everyone"
  ON consultation_slots FOR SELECT
  USING (true);

CREATE POLICY "Doctors can manage their slots"
  ON consultation_slots FOR ALL
  USING (
    auth.uid() IN (
      SELECT profile_id FROM doctors WHERE id = consultation_slots.doctor_id
    )
  );

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES consultation_slots(id) NOT NULL,
  patient_id uuid REFERENCES profiles(id) NOT NULL,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations"
  ON consultations FOR SELECT
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

CREATE POLICY "Authenticated users can book consultations"
  ON consultations FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Participants can update consultation"
  ON consultations FOR UPDATE
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