import React from 'react'
import { BookOpen, Video, Users } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';


const HeroSection = () => {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const floatVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-2"
              variants={itemVariants}
            >
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-teal-700 font-medium">Course for Beginner</span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              variants={itemVariants}
            >
            Learn Personal Finance<br />
              <span className="text-teal-600 animate-gradient">Through Interactive Learning</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-600 leading-relaxed max-w-lg"
              variants={itemVariants}
            >
             Learn budgeting, saving, investing, and money management through interactive lessons built for students and beginners.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all hover:scale-105 hover:shadow-xl shadow-lg shadow-teal-200" onClick={() => navigate("/auth/login")}>
                <BookOpen className="w-5 h-5" />
                Start Learning for Free
              </button>
              <button  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold border border-gray-200 hover:border-teal-300 transition-all hover:scale-105">
                {/* <Video className="w-5 h-5" /> */}
                <a href="#WatchVideo">View Learning Paths</a> 
              </button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="hidden sm:flex absolute top-0 right-0 bg-white rounded-2xl shadow-xl p-4 z-10"
              variants={floatVariants}
              animate="animate"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">12,000+</p>
                  <p className="text-sm text-gray-600">Happy Students</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="hidden sm:flex absolute bottom-0 left-0 bg-white rounded-2xl shadow-xl p-4 z-10"
              variants={floatVariants}
              animate="animate"
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">50,000+</p>
                  <p className="text-sm text-gray-600">Students Enrolled</p>
                </div>
              </div>
            </motion.div>
            
            <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 mt-8 sm:mt-12 hover:shadow-3xl transition-shadow duration-500">
                <img src="/heroleftimg.png" alt="leftimage" className="w-full h-auto rounded-2xl" />
                {/* <video
                  src="https://ik.imagekit.io/tz5jjsqeb/FinancialBasics_Intro.mp4?updatedAt=1774536286446"
                  autoPlay   // page load hote hi chalega
                  loop       // khatam hone pe restart hoga
                  muted      // sound band (autoplay ke liye zaroori)
                  playsInline // mobile pe bhi sahi chalega
                  className="w-ful h-full object-cover rounded-2xl"
                /> */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection
