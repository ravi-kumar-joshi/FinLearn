import React from 'react'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'
import { motion } from 'framer-motion'
import { Users, Target, Award, Heart } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="text-[#16a34a]">About</span> FinLearn
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering everyone to take control of their financial future through gamified, interactive learning
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To make financial literacy accessible, engaging, and practical for everyone, regardless of their background or prior knowledge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Target, title: 'Our Vision', desc: 'A world where everyone has the financial knowledge to make informed decisions and achieve their goals.' },
              { icon: Users, title: 'Our Team', desc: 'Passionate educators, finance experts, and technologists working together to transform financial education.' },
              { icon: Award, title: 'Our Approach', desc: 'Gamified learning that makes complex financial concepts simple, fun, and memorable.' },
              { icon: Heart, title: 'Our Impact', desc: 'Thousands of learners have already improved their financial literacy and confidence through our platform.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                FinLearn was born from a simple observation: financial education is often inaccessible, boring, or filled with jargon that confuses rather than helps.
              </p>
              <p className="text-gray-600 mb-4">
                We believed there had to be a better way. A way that makes learning about money as engaging as playing a game. A way that breaks down complex concepts into bite-sized, interactive lessons.
              </p>
              <p className="text-gray-600 mb-4">
                Today, we're proud to have helped thousands of people take their first steps toward financial confidence. From budgeting basics to investment strategies, we're here to guide you every step of the way.
              </p>
              <p className="text-gray-600">
                Our journey is just beginning, and we're committed to continuously improving and expanding our platform to serve learners worldwide.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Why We Exist</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Financial literacy is a fundamental life skill</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Everyone deserves access to quality financial education</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Learning should be engaging, not intimidating</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Practical knowledge leads to better financial decisions</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '10K+', label: 'Active Learners' },
              { number: '50+', label: 'Courses Available' },
              { number: '95%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-xl mb-8 opacity-90">
              Start your financial literacy journey today with FinLearn
            </p>
            <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
              Get Started Free
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
