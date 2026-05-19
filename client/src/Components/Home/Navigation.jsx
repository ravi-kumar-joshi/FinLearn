import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Logo Import
import logo from "../../asset/apple-touch-icon.png";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm" role="navigation" aria-label="Main navigation">

      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navbar */}
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">

          {/* Logo Section */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="FinLearn Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain"
            />

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              <span className="text-[#16a34a]">Fin</span>
              <span className="text-[#0b57d0]">Learn</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">

            <a
              href="#courses"
              className="text-gray-700 hover:text-[#16a34a] transition-all duration-300 font-medium"
            >
              Courses
            </a>

            <a
              href="#about"
              className="text-gray-700 hover:text-[#16a34a] transition-all duration-300 font-medium"
            >
              About
            </a>

            <a
              href="#features"
              className="text-gray-700 hover:text-[#16a34a] transition-all duration-300 font-medium"
            >
              Features
            </a>

            <a
              href="#contact"
              className="text-gray-700 hover:text-[#16a34a] transition-all duration-300 font-medium"
            >
              Contact
            </a>

            {/* Sign In */}
            <button
              onClick={() => navigate("/auth/login")}
              className="text-[#0b57d0] hover:text-[#16a34a] transition-all duration-300 font-semibold"
            >
              Sign In
            </button>

            {/* CTA Button */}
            <button
              onClick={() => navigate("/auth/login")}
              className="px-6 py-2.5 rounded-xl bg-linear-to-r from-[#16a34a] to-[#0b57d0] text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#0b57d0]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden py-5 border-t border-gray-100 space-y-4 bg-white"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >

              <a
                href="#courses"
                className="block text-gray-700 hover:text-[#16a34a] font-medium"
              >
                Courses
              </a>

              <a
                href="#about"
                className="block text-gray-700 hover:text-[#16a34a] font-medium"
              >
                About
              </a>

              <a
                href="#features"
                className="block text-gray-700 hover:text-[#16a34a] font-medium"
              >
                Features
              </a>

              <a
                href="#contact"
                className="block text-gray-700 hover:text-[#16a34a] font-medium"
              >
                Contact
              </a>

              {/* Mobile Sign In */}
              <button
                onClick={() => navigate("/auth/login")}
                className="block text-[#0b57d0] hover:text-[#16a34a] font-semibold"
              >
                Sign In
              </button>

              {/* Mobile CTA */}
              <button
                onClick={() => navigate("/auth/login")}
                className="w-full mt-3 px-6 py-3 rounded-xl bg-linear-to-r from-[#16a34a] to-[#0b57d0] text-white font-semibold shadow-md"
              >
                Get Started
              </button>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </nav>
  );
};

export default Navigation;