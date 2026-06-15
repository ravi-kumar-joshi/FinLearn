import React from 'react'
import { Zap, Shield, Users, Target, Clock, Award } from 'lucide-react'
import { motion } from 'framer-motion'

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-teal-600" />,
      title: "Quick Learning",
      description: "Bite-sized lessons designed for busy schedules. Learn in just 10-15 minutes a day."
    },
    {
      icon: <Shield className="w-8 h-8 text-teal-600" />,
      title: "Bank-Level Security",
      description: "Your data is protected with enterprise-grade encryption and security measures."
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: "Community Support",
      description: "Join thousands of learners. Share experiences, ask questions, and grow together."
    },
    {
      icon: <Target className="w-8 h-8 text-teal-600" />,
      title: "Personalized Goals",
      description: "Set your financial goals and track progress with customized learning paths."
    },
    {
      icon: <Clock className="w-8 h-8 text-teal-600" />,
      title: "Learn at Your Pace",
      description: "Access content 24/7. Pause, resume, and revisit lessons whenever you want."
    },
    {
      icon: <Award className="w-8 h-8 text-teal-600" />,
      title: "Recognized Certificates",
      description: "Earn certificates that validate your financial literacy skills to employers."
    }
  ]

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Effective Learning
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to master personal finance in one platform
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ y: -8 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
