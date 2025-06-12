import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

function Stories() {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'recovery',
  });

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('Please sign in to share your story');
      return;
    }

    setSubmitting(true);
    try {
      // First verify that the profile exists
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profileCheck) {
        throw new Error('Profile not found. Please try signing out and back in.');
      }

      const { error } = await supabase
        .from('stories')
        .insert([
          {
            author_id: user.id,
            title: formData.title.trim(),
            content: formData.content.trim(),
            category: formData.category,
          },
        ]);

      if (error) throw error;
      
      toast.success('Story shared successfully');
      setShowForm(false);
      setFormData({ title: '', content: '', category: 'recovery' });
      fetchStories();
    } catch (error: any) {
      console.error('Error sharing story:', error);
      toast.error(error.message || 'Failed to share story');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-rose-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading stories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Stories</h1>
        <p className="text-gray-600 mb-8">
          Share your journey and inspire others. Every story matters, and your experience
          could be the hope someone else needs today.
        </p>
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            Share Your Story
          </button>
        ) : (
          <p className="text-gray-500">Please sign in to share your story</p>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Share Your Story</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
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
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                disabled={submitting}
              >
                <option value="recovery">Recovery Journey</option>
                <option value="mental-health">Mental Health</option>
                <option value="chronic-illness">Chronic Illness</option>
                <option value="lifestyle">Lifestyle Changes</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Story
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
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
                    Sharing...
                  </>
                ) : (
                  'Share Story'
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
        {stories.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No stories shared yet. Be the first to share your story!
          </div>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">
                <span className="text-sm text-rose-600 font-medium capitalize">{story.category}</span>
                <h2 className="text-xl font-semibold mt-1">{story.title}</h2>
              </div>
              <p className="text-gray-600 mb-4">{story.content}</p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  {story.profiles.avatar_url ? (
                    <img
                      src={story.profiles.avatar_url}
                      alt={story.profiles.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">
                      {story.profiles.full_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {story.profiles.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(story.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Stories;