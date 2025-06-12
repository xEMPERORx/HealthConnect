import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, Calendar, Plus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Consultation {
  id: string;
  slot_id: string;
  medical_condition: string;
  phone_number: string;
  status: string;
  doctor_notes: string | null;
  consultation_slots: {
    start_time: string;
    end_time: string;
  };
  profiles: {
    full_name: string;
  };
}

interface ConsultationSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function DoctorDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [availableSlots, setAvailableSlots] = useState<ConsultationSlot[]>([]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (!user || profile?.role !== 'doctor') {
      navigate('/');
      return;
    }
    fetchDoctorData();
  }, [user, profile]);

  async function fetchDoctorData() {
    try {
      // First verify the doctor's profile exists and is verified
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id, is_verified')
        .eq('profile_id', user?.id)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor profile:', doctorError);
        if (doctorError.code === 'PGRST116') {
          toast.error('Doctor profile not found. Please complete your profile first.');
          navigate('/doctor/profile');
          return;
        }
        throw doctorError;
      }

      if (!doctorData) {
        toast.error('Doctor profile not found. Please complete your profile first.');
        navigate('/doctor/profile');
        return;
      }

      if (!doctorData.is_verified) {
        toast.error('Your doctor profile is pending verification.');
        navigate('/doctor/profile');
        return;
      }

      setDoctorId(doctorData.id);

      // Now fetch consultations and slots
      await Promise.all([
        fetchConsultations(doctorData.id),
        fetchAvailableSlots(doctorData.id)
      ]);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load doctor data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchConsultations(doctorId: string) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          consultation_slots (
            start_time,
            end_time
          ),
          profiles (
            full_name
          )
        `)
        .eq('consultation_slots.doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Failed to load consultations');
    }
  }

  async function fetchAvailableSlots(doctorId: string) {
    try {
      const { data, error } = await supabase
        .from('consultation_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_booked', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      console.log('Available slots:', data);
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available slots');
    }
  }

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!doctorId) {
      toast.error('Doctor profile not found');
      return;
    }

    try {
      const startDateTime = `${newSlot.date}T${newSlot.startTime}:00`;
      const endDateTime = `${newSlot.date}T${newSlot.endTime}:00`;

      // Validate that end time is after start time
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        toast.error('End time must be after start time');
        return;
      }

      // Validate that the slot is in the future
      if (new Date(startDateTime) <= new Date()) {
        toast.error('Slot must be in the future');
        return;
      }

      const { error } = await supabase
        .from('consultation_slots')
        .insert([
          {
            doctor_id: doctorId,
            start_time: startDateTime,
            end_time: endDateTime,
            is_booked: false,
          },
        ]);

      if (error) throw error;

      toast.success('Consultation slot added successfully');
      setShowAddSlot(false);
      setNewSlot({ date: '', startTime: '', endTime: '' });
      await fetchAvailableSlots(doctorId);
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add consultation slot');
    }
  }

  async function updateConsultationStatus(consultationId: string, status: string) {
    try {
      // Get the slot ID for this consultation
      const consultation = consultations.find(c => c.id === consultationId);
      if (!consultation) {
        toast.error('Consultation not found');
        return;
      }

      // Start a transaction
      const { error: consultationError } = await supabase
        .from('consultations')
        .update({ status })
        .eq('id', consultationId);

      if (consultationError) throw consultationError;

      // If the consultation is completed or cancelled, mark the slot as available again
      if (status === 'completed' || status === 'cancelled') {
        const { error: slotError } = await supabase
          .from('consultation_slots')
          .delete()
          .eq('id', consultation.slot_id);

        if (slotError) throw slotError;
      }

      toast.success(`Consultation marked as ${status}`);
      if (doctorId) {
        await Promise.all([
          fetchConsultations(doctorId),
          fetchAvailableSlots(doctorId)
        ]);
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
      toast.error('Failed to update consultation status');
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <button
            onClick={() => setShowAddSlot(true)}
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Consultation Slot
          </button>
        </div>

        {/* Available Slots Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Available Slots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.length === 0 ? (
              <p className="text-gray-500">No available slots. Add new slots for consultations.</p>
            ) : (
              availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{format(new Date(slot.start_time), 'PPP')}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {format(new Date(slot.start_time), 'p')} - {format(new Date(slot.end_time), 'p')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Slot Modal */}
        {showAddSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Add Consultation Slot</h2>
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full rounded-md border-gray-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="block w-full rounded-md border-gray-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="block w-full rounded-md border-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700"
                  >
                    Add Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSlot(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Consultations Table */}
        <div className="overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Booked Consultations</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medical Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
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
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No consultations booked yet.
                  </td>
                </tr>
              ) : (
                consultations.map((consultation) => (
                  <tr key={consultation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {consultation.profiles.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(consultation.consultation_slots.start_time), 'PPP p')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {consultation.medical_condition}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {consultation.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          consultation.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : consultation.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {consultation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {consultation.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateConsultationStatus(consultation.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => updateConsultationStatus(consultation.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}