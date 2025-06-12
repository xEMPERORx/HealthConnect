/*
  # Add Consultation Details and Status

  1. Changes
    - Create consultation status enum type
    - Add phone number and medical condition columns
    - Convert status column to use enum type
    - Add doctor notes column
    - Add performance index
    
  2. Notes
    - Handles existing data conversion safely
    - Maintains data integrity during type conversion
*/

-- Create consultation status enum
CREATE TYPE consultation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Add new columns to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS phone_number text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS medical_condition text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS doctor_notes text;

-- Convert status column to enum type safely
ALTER TABLE consultations 
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN status TYPE consultation_status USING 
  CASE status
    WHEN 'pending' THEN 'pending'::consultation_status
    WHEN 'confirmed' THEN 'confirmed'::consultation_status
    WHEN 'completed' THEN 'completed'::consultation_status
    WHEN 'cancelled' THEN 'cancelled'::consultation_status
    ELSE 'pending'::consultation_status
  END;

-- Set the default for status column after conversion
ALTER TABLE consultations 
ALTER COLUMN status SET DEFAULT 'pending'::consultation_status;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);