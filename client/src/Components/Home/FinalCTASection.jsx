import React from 'react'
import { Check } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';

const FinalCTASection = () => {
  const navigate = useNavigate();

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-teal-500 to-emerald-600">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          Start Your Financial Freedom<br />Journey Today
        </motion.h2>
        <motion.p
          className="text-xl text-teal-50 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join students and beginners learning practical money skills through gamified education.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            className="px-10 py-5 bg-white text-teal-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
            onClick={() => navigate("/auth/login")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Free Account
          </motion.button>
          <motion.button
            className="px-10 py-5 bg-teal-700 text-white rounded-xl font-bold text-lg hover:bg-teal-800 transition-all border-2 border-teal-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Courses
          </motion.button>
        </motion.div>
        <div className="flex items-center justify-center gap-8 mt-8 text-teal-50 flex-wrap">
          {[
            { text: '100% Free', delay: 0.4 },
            { text: 'Start in 2 minutes', delay: 0.5 },
            { text: 'No payment needed', delay: 0.6 }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2"
              custom={index}
              variants={badgeVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Check className="w-5 h-5" />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection
