import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader2, UserCheck, Users, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

interface DoctorVerification {
  id: string;
  profile_id: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  is_verified: boolean;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface UserStats {
  total_users: number;
  total_doctors: number;
  pending_verifications: number;
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    total_doctors: 0,
    pending_verifications: 0,
  });

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDoctors();
    fetchStats();
  }, [user, profile]);

  async function fetchStats() {
    try {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select('id', { count: 'exact' });

      const { data: pending, error: pendingError } = await supabase
        .from('doctors')
        .select('id', { count: 'exact' })
        .eq('is_verified', false);

      if (usersError || doctorsError || pendingError) throw new Error('Error fetching stats');

      setStats({
        total_users: users?.length || 0,
        total_doctors: doctors?.length || 0,
        pending_verifications: pending?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    }
  }

  async function fetchDoctors() {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctor verifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerification(doctorId: string, verify: boolean) {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ is_verified: verify })
        .eq('id', doctorId);

      if (error) throw error;

      toast.success(`Doctor ${verify ? 'verified' : 'unverified'} successfully`);
      fetchDoctors();
      fetchStats();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
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
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-rose-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-600 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
              </div>
              <Users className="h-8 w-8 text-rose-600" />
            </div>
          </div>
          
          <div className="bg-rose-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-600 text-sm font-medium">Verified Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_doctors}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-rose-600" />
            </div>
          </div>
          
          <div className="bg-rose-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-600 text-sm font-medium">Pending Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending_verifications}</p>
              </div>
              <UserCheck className="h-8 w-8 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {doctor.profiles.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.license_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.years_of_experience} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doctor.is_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {doctor.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {doctor.is_verified ? (
                      <button
                        onClick={() => handleVerification(doctor.id, false)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Unverify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerification(doctor.id, true)}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}