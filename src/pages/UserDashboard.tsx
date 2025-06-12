import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Consultation {
  id: string;
  status: string;
  medical_condition: string;
  doctor_notes: string | null;
  phone_number: string;
  consultation_slots: {
    start_time: string;
    end_time: string;
    doctors: {
      profiles: {
        full_name: string;
        avatar_url: string | null;
      };
      specialization: string;
    };
  };
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchConsultations();
  }, [user]);

  async function fetchConsultations() {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id,
          status,
          medical_condition,
          doctor_notes,
          phone_number,
          consultation_slots (
            start_time,
            end_time,
            doctors (
              specialization,
              profiles (
                full_name,
                avatar_url
              )
            )
          )
        `)
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched consultations:', data);
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold mb-6">My Consultations</h1>

        {consultations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No consultations booked yet.</p>
            <button
              onClick={() => navigate('/consultations')}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
            >
              Book a Consultation
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Dr. {consultation.consultation_slots.doctors.profiles.full_name}
                    </h3>
                    <p className="text-rose-600">
                      {consultation.consultation_slots.doctors.specialization}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      consultation.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : consultation.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {consultation.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>
                      {format(
                        new Date(consultation.consultation_slots.start_time),
                        'PPP p'
                      )}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Medical Condition:</p>
                    <p className="mt-1">{consultation.medical_condition}</p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700">Contact Number:</p>
                    <p className="mt-1">{consultation.phone_number}</p>
                  </div>

                  {consultation.doctor_notes && (
                    <div>
                      <p className="font-medium text-gray-700">Doctor's Notes:</p>
                      <p className="mt-1">{consultation.doctor_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}