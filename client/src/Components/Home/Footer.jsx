import React from 'react';
import logo from "../../asset/apple-touch-icon.png"; // Update path if needed

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-5">
              
              {/* Logo */}
              <div className="bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
                <img
                  src={logo}
                  alt="FinLearn Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>

              {/* Brand Name */}
              <div>
                <h2 className="text-2xl font-bold text-white leading-none">
                  FinLearn
                </h2>
                <p className="text-sm text-teal-400 font-medium mt-1">
                  Financial Literacy Hub
                </p>
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
              Gamified Financial Education for Beginners. Learn budgeting,
              saving, investing, and more through interactive lessons and
              practical tools. No jargon, just simple learning that builds
              confidence.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-white font-bold mb-5 text-lg">Courses</h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Budgeting
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Investing
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Banking
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Tax Planning
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-5 text-lg">Company</h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Blog
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Careers
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-5 text-lg">Support</h4>

            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Help Center
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Privacy Policy
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="hover:text-teal-400 transition duration-300"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
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