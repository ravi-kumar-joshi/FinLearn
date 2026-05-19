import React from 'react'
import { Users, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';


const WhyStudentsLoveSection = () => {
  const reasons = [
    { icon: <Users className="w-8 h-8" />, title: "Real-World Examples", description: "Practice budgeting and planning with real scenarios." },
    { icon: <BookOpen className="w-8 h-8" />, title: "Bite-Sized Lessons", description: "Short, focused modules designed for fast learning." },
    { icon: <Clock className="w-8 h-8" />, title: "Learn Anytime", description: "Access lessons, quizzes, and tools on any device." }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Students Love FinLearn
          </h2>
          <p className="text-lg text-gray-600">
           Learn Finance Without Feeling Overwhelmed
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.15,
                ease: "easeOut"
              }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <motion.div 
                className="w-20 h-20 bg-linear-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-600"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {reason.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{reason.title}</h3>
              <p className="text-gray-600 leading-relaxed">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyStudentsLoveSection
