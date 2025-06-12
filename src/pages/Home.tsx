import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Stethoscope } from 'lucide-react';

function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-gradient-to-r from-rose-50 to-rose-100 rounded-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Share. Connect. Heal Together.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Join our community of warriors sharing their health journeys, inspiring others,
          and finding support along the way.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/stories"
            className="px-6 py-3 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            Share Your Story
          </Link>
          <Link
            to="/consultations"
            className="px-6 py-3 bg-white text-rose-600 border border-rose-600 rounded-md hover:bg-rose-50"
          >
            Book Consultation
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Users className="h-12 w-12 text-rose-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Community Stories</h3>
          <p className="text-gray-600">
            Read inspiring recovery stories and share your own journey to help others.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Calendar className="h-12 w-12 text-rose-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Health Events</h3>
          <p className="text-gray-600">
            Discover and join health-related events in your community.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Stethoscope className="h-12 w-12 text-rose-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Expert Consultations</h3>
          <p className="text-gray-600">
            Connect with verified healthcare professionals for free consultations.
          </p>
        </div>
      </section>

      <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Placeholder for featured stories - will be populated from Supabase */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Recovery Story</p>
            <h3 className="text-lg font-semibold mb-2">My Journey Through Recovery</h3>
            <p className="text-gray-600 line-clamp-3">
              A story of hope, determination, and the power of community support...
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;