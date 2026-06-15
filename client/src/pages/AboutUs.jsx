import React from 'react'
import { Target, Users, Award, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'

const AboutUs = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-teal-600" />,
      title: "Our Mission",
      description: "To make financial literacy accessible, engaging, and practical for everyone, regardless of their background or prior knowledge."
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: "Our Vision",
      description: "A world where everyone has the financial knowledge and confidence to make informed decisions about their money."
    },
    {
      icon: <Award className="w-8 h-8 text-teal-600" />,
      title: "Our Values",
      description: "Simplicity, accessibility, and practicality. We believe financial education should be easy to understand and apply."
    },
    {
      icon: <Heart className="w-8 h-8 text-teal-600" />,
      title: "Our Commitment",
      description: "We're dedicated to continuously improving our content and tools based on learner feedback and industry best practices."
    }
  ]

  const stats = [
    { number: "12,000+", label: "Active Learners" },
    { number: "50+", label: "Expert-Created Lessons" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-teal-600">FinLearn</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
              We're on a mission to democratize financial education and empower everyone to take control of their financial future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                FinLearn was born from a simple observation: financial education is often complex, jargon-filled, and inaccessible to those who need it most. We believe that understanding money shouldn't require a finance degree.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our team of educators, finance experts, and technologists came together to create a platform that makes learning about money engaging, practical, and fun. We use gamification, interactive lessons, and real-world examples to bring financial concepts to life.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we're proud to serve thousands of learners from diverse backgrounds, helping them build the financial skills they need to achieve their goals.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl p-8 sm:p-12"
            >
              <img src="/FinancialLiteracy.png" alt="About FinLearn" className="w-full h-auto rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Drives Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our core values shape everything we do
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.number}</p>
                <p className="text-teal-100 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate experts dedicated to your financial education
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Ravi Kumar", role: "Founder & CEO", image: "/team1.jpg" },
              { name: "Priya Sharma", role: "Head of Content", image: "/team2.jpg" },
              { name: "Amit Patel", role: "Lead Developer", image: "/team3.jpg" }
            ].map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-teal-600">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-teal-600 font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutUs
