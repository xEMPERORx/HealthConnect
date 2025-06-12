import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stories from './pages/Stories';
import Events from './pages/Events';
import Consultations from './pages/Consultations';
import DoctorProfile from './pages/DoctorProfile';
import DoctorDashboard from './pages/DoctorDashboard';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CancerInfo from './pages/CancerInfo';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/events" element={<Events />} />
              <Route path="/consultations" element={<Consultations />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/cancer-info" element={<CancerInfo />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget webhookUrl="https://n8n.labdiy.xyz/webhook/65afb57e-1c89-44a3-b9bb-84013a4511d7/chat" />
        </div>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App