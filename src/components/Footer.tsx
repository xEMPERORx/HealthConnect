import React from 'react';
import { Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Heart className="h-6 w-6 text-rose-600" />
            <span className="text-lg font-semibold text-gray-800">HealthConnect</span>
          </div>
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} HealthConnect. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;