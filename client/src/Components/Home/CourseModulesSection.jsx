import React from 'react'
import { BookOpen, PiggyBank, TrendingUp, CreditCard, DollarSign, FileText, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';


const CourseModulesSection = () => {
  const navigate = useNavigate();
  const modules = [
    { icon: <BookOpen className="w-8 h-8" />, title: "Basics of Money", lessons: "Begginer", XP: "120" },
    { icon: <PiggyBank className="w-8 h-8" />, title: "Budgeting Mastery", lessons: "Beginner", XP: "120" },
    { icon: <TrendingUp className="w-8 h-8" />, title: "Investing Basics", lessons: "Beginner", XP: "120" },
    { icon: <CreditCard className="w-8 h-8" />, title: "Banking Essentials", lessons: "Beginner", XP: "120" },
    { icon: <DollarSign className="w-8 h-8" />, title: "Loans & Credit", lessons: "Beginner", XP: "120" },
    { icon: <FileText className="w-8 h-8" />, title: "Income Tax Basics", lessons: "Beginner", XP: "120" }
  ];

  return (
    <section id="courses" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ XP: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Course Modules
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive lessons covering every aspect of personal finance
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <motion.div 
              key={index} 
              className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-teal-300 hover:shadow-xl transition-all XP-300 group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ 
                XP: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ y: -8 }}
            >
              <div className="w-16 h-16 bg-linear-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 transition-transform XP-300">
                {module.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {module.lessons}
                </span>
                <span className="flex items-center gap-1">
                  {/* <Clock className="w-4 h-4" /> */}
                  ✨XP Points:
                  {module.XP}
                </span>
              </div>
              <button className="text-teal-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all" onClick={() => navigate("/auth/login")}>
                Start Learning <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseModulesSection
