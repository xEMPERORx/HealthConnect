import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  max_participants: number;
  registration_link: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    max_participants: '',
    registration_link: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create an event');
      return;
    }

    // Validate event date is in the future
    const eventDate = new Date(formData.event_date);
    if (eventDate <= new Date()) {
      toast.error('Event date must be in the future');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('events')
        .insert([
          {
            organizer_id: user.id,
            title: formData.title.trim(),
            description: formData.description.trim(),
            event_date: formData.event_date,
            location: formData.location.trim(),
            max_participants: parseInt(formData.max_participants),
            registration_link: formData.registration_link.trim(),
          },
        ]);

      if (error) throw error;
      
      toast.success('Event created successfully');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        event_date: '',
        location: '',
        max_participants: '',
        registration_link: '',
      });
      fetchEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-rose-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Health Events</h1>
        <p className="text-gray-600 mb-8">
          Discover and join health-related events in your community. Connect with others
          and learn from experts.
        </p>
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            Post an Event
          </button>
        ) : (
          <p className="text-gray-500">Please sign in to post an event</p>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
                disabled={submitting}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Participants
              </label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
                min="1"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registration Link
              </label>
              <input
                type="url"
                value={formData.registration_link}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_link: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                placeholder="https://forms.google.com/..."
                required
                disabled={submitting}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No upcoming events. Be the first to organize one!
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-xl shadow-sm">
              <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium mb-4">
                Health Event
              </span>
              <h2 className="text-xl font-semibold mb-3">{event.title}</h2>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{new Date(event.event_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{event.max_participants} spots available</span>
                </div>
              </div>
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full px-4 py-2 bg-rose-600 text-white text-center rounded-md hover:bg-rose-700"
              >
                Register Now
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Organized by {event.profiles.full_name}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Events;