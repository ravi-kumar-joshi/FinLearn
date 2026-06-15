import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Twitter, Linkedin } from 'lucide-react';
import logo from "../../asset/apple-touch-icon.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-5">
              <div className="bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
                <img
                  src={logo}
                  alt="FinLearn Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white leading-none">
                  FinLearn
                </h2>
                <p className="text-sm text-teal-400 font-medium mt-1">
                  Financial Literacy Hub
                </p>
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed text-sm sm:text-base mb-6">
              Empowering beginners with practical financial education through interactive lessons and tools.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-5 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="hover:text-teal-400 transition duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-400 transition duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-teal-400 transition duration-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/dashboard/all-courses" className="hover:text-teal-400 transition duration-300">
                  All Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-5 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="hover:text-teal-400 transition duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal-400 transition duration-300">
                  Terms of Service
                </Link>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="text-white font-bold mb-3 text-sm">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 text-sm"
                />
                <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            © 2026 FinLearn. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;