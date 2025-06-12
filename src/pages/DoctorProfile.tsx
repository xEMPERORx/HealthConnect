import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DoctorProfile {
  id: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  is_verified: boolean;
}

export default function DoctorProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [formData, setFormData] = useState({
    specialization: '',
    license_number: '',
    years_of_experience: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchDoctorProfile();
  }, [user]);

  async function fetchDoctorProfile() {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('profile_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setDoctorProfile(data);
        setFormData({
          specialization: data.specialization || '',
          license_number: data.license_number || '',
          years_of_experience: data.years_of_experience?.toString() || '',
        });
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // First update the user's role in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'doctor' })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Then create or update the doctor profile
      const { error: doctorError } = await supabase
        .from('doctors')
        .upsert({
          profile_id: user?.id,
          specialization: formData.specialization,
          license_number: formData.license_number,
          years_of_experience: parseInt(formData.years_of_experience),
          is_verified: false,
        });

      if (doctorError) throw doctorError;

      toast.success('Profile updated successfully');
      fetchDoctorProfile();
    } catch (error: any) {
      console.error('Error updating doctor profile:', error);
      if (error.code === '23505') {
        toast.error('This license number is already registered');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-rose-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Doctor Profile</h1>
        
        {doctorProfile && !doctorProfile.is_verified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Verification Pending</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your profile is under review. An administrator will verify your credentials shortly.
                You'll be notified once your profile is approved.
              </p>
            </div>
          </div>
        )}

        {doctorProfile?.is_verified && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Verified Doctor</h3>
              <p className="mt-1 text-sm text-green-700">
                Your profile has been verified. You can now create consultation slots and accept appointments.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              placeholder="e.g., Cardiology, Neurology, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical License Number
            </label>
            <input
              type="text"
              value={formData.license_number}
              onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              placeholder="Enter your medical license number"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be verified by our administrators
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              value={formData.years_of_experience}
              onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              min="0"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}