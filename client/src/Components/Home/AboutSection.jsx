import React from 'react'
import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-teal-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-2 gap-0">
            <motion.div 
              className="p-6 sm:p-10 lg:p-16 flex flex-col justify-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-teal-600 font-semibold mb-4">ABOUT FINLEARN</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Learn Real-Life Money Skills<br />
                <span className="text-teal-600">That Actually Matter</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
FinLearn helps beginners understand budgeting, saving, investing, and financial planning through interactive lessons and practical tools. No complex finance jargon — just simple learning that builds confidence.              </p>
             
              
              <div className="flex flex-wrap gap-4">
                <motion.button 
                  className="px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enroll Now →
                </motion.button>
                <motion.button 
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                 <a href="#WatchVideo">Watch Trailer</a>  
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-linear-to-br from-teal-100 to-emerald-100 p-6 sm:p-12 flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.img 
                src="/FinancialLiteracy.png" 
                alt="aboutImg" 
                className='rounded-2xl'
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection
