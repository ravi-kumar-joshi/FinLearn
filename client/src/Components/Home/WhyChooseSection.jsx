import React from 'react'
import { BookOpen, Video, Globe, Award } from 'lucide-react';
import { motion } from 'framer-motion';


const WhyChooseSection = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-teal-600" />,
      title: "Learn By Doing",
      description: "Interactive quizzes and practical finance exercises."
    },
    {
      icon: <Video className="w-8 h-8 text-teal-600" />,
      title: "Track Your Growth",
      description: "Earn XP, badges, and certificates as you learn."
    },
  
    {
      icon: <Globe className="w-8 h-8 text-teal-600" />,
      title: "Smart Financial Tools",
      description: "Use EMI calculators, budget planners, and trackers."
    },
    {
      icon: <Award className="w-8 h-8 text-teal-600" />,
      title: "Completion Certificate",
      description: "Get a verified certificate when you complete the course successfully."
    }
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose FinLearn?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to learn Finance made simple and easy to understand
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-linear-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection
