import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Clock, Star, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Doctor {
  id: string;
  specialization: string;
  years_of_experience: number;
  is_verified: boolean;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ConsultationSlot {
  id: string;
  start_time: string;
  end_time: string;
}

function Consultations() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingData, setBookingData] = useState({
    slotId: '',
    phoneNumber: '',
    medicalCondition: '',
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          specialization,
          years_of_experience,
          is_verified,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('is_verified', true)
        .order('years_of_experience', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableSlots(doctorId: string) {
    setLoadingSlots(true);
    try {
      const now = new Date().toISOString();
      console.log('Fetching slots for doctor:', doctorId);
      
      const { data, error } = await supabase
        .from('consultation_slots')
        .select('id, start_time, end_time')
        .eq('doctor_id', doctorId)
        .eq('is_booked', false)
        .gte('start_time', now)
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      console.log('Fetched slots:', data);
      setSlots(data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book a consultation');
      return;
    }

    setIsBooking(true);
    try {
      // Start a transaction to ensure atomicity
      const { data: slot, error: slotCheckError } = await supabase
        .from('consultation_slots')
        .select('is_booked')
        .eq('id', bookingData.slotId)
        .single();

      if (slotCheckError) throw slotCheckError;

      if (slot.is_booked) {
        toast.error('This slot has already been booked. Please choose another slot.');
        await fetchAvailableSlots(selectedDoctor!.id);
        return;
      }

      // Create the consultation booking
      const { error: bookingError } = await supabase
        .from('consultations')
        .insert([
          {
            slot_id: bookingData.slotId,
            patient_id: user.id,
            phone_number: bookingData.phoneNumber,
            medical_condition: bookingData.medicalCondition,
            status: 'pending',
          },
        ]);

      if (bookingError) throw bookingError;

      // Update slot status
      const { error: slotError } = await supabase
        .from('consultation_slots')
        .update({ is_booked: true })
        .eq('id', bookingData.slotId);

      if (slotError) throw slotError;

      toast.success('Consultation booked successfully!');
      setSelectedDoctor(null);
      setBookingData({ slotId: '', phoneNumber: '', medicalCondition: '' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error booking consultation:', error);
      toast.error('Failed to book consultation');
    } finally {
      setIsBooking(false);
    }
  }

  const handleRegisterAsDoctor = () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }
    navigate('/doctor/profile');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-rose-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Free Consultations</h1>
        <p className="text-gray-600 mb-8">
          Connect with verified healthcare professionals for free consultations and
          second opinions.
        </p>
        <div className="flex space-x-4">
          {user && profile?.role !== 'doctor' && (
            <button
              onClick={handleRegisterAsDoctor}
              className="px-6 py-3 bg-white text-rose-600 border border-rose-600 rounded-md hover:bg-rose-50"
            >
              Register as Doctor
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {doctors.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No verified doctors available at the moment.
          </div>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                  {doctor.profiles.avatar_url ? (
                    <img
                      src={doctor.profiles.avatar_url}
                      alt={doctor.profiles.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-100 text-rose-600">
                      <Stethoscope className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{doctor.profiles.full_name}</h2>
                  <p className="text-rose-600">{doctor.specialization}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">Verified Professional</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-600">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  <span>{doctor.years_of_experience}+ years experience</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Available for consultations</span>
                </div>
              </div>
              {user ? (
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    fetchAvailableSlots(doctor.id);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
                >
                  Book Consultation
                </button>
              ) : (
                <p className="mt-4 text-center text-gray-500">Sign in to book consultations</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Book Consultation</h2>
            <p className="text-gray-600 mb-6">
              with Dr. {selectedDoctor.profiles.full_name}
            </p>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Slots
                </label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-rose-600 animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-gray-500 py-2">No available slots. Please check back later.</p>
                ) : (
                  <select
                    value={bookingData.slotId}
                    onChange={(e) => setBookingData({ ...bookingData, slotId: e.target.value })}
                    className="block w-full rounded-md border-gray-300"
                    required
                  >
                    <option value="">Select a time slot</option>
                    {slots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {format(new Date(slot.start_time), 'PPP p')} - {format(new Date(slot.end_time), 'p')}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingData.phoneNumber}
                  onChange={(e) => setBookingData({ ...bookingData, phoneNumber: e.target.value })}
                  className="block w-full rounded-md border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Condition
                </label>
                <textarea
                  value={bookingData.medicalCondition}
                  onChange={(e) => setBookingData({ ...bookingData, medicalCondition: e.target.value })}
                  rows={4}
                  className="block w-full rounded-md border-gray-300"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isBooking || slots.length === 0}
                  className="flex-1 bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 disabled:opacity-50"
                >
                  {isBooking ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Booking...
                    </div>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctor(null);
                    setBookingData({ slotId: '', phoneNumber: '', medicalCondition: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Consultations;