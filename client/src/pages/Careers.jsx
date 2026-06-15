import React from 'react'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Clock, Users, Zap } from 'lucide-react'

export default function Careers() {
  const openings = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80,000 - $120,000'
    },
    {
      title: 'Financial Content Writer',
      department: 'Content',
      location: 'Remote',
      type: 'Full-time',
      salary: '$50,000 - $70,000'
    },
    {
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      salary: '$70,000 - $95,000'
    },
    {
      title: 'Customer Success Manager',
      department: 'Support',
      location: 'Remote',
      type: 'Full-time',
      salary: '$55,000 - $75,000'
    },
    {
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$85,000 - $125,000'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      salary: '$65,000 - $90,000'
    }
  ]

  const benefits = [
    { icon: DollarSign, title: 'Competitive Salary', desc: 'We offer market-competitive compensation packages' },
    { icon: Clock, title: 'Flexible Hours', desc: 'Work when it works for you with flexible schedules' },
    { icon: MapPin, title: 'Remote-First', desc: 'Work from anywhere in the world' },
    { icon: Users, title: 'Great Team', desc: 'Join a passionate and supportive team' },
    { icon: Zap, title: 'Growth Opportunities', desc: 'Continuous learning and career development' }
  ]

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
              Join Our <span className="text-[#16a34a]">Team</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help us democratize financial education and empower millions to take control of their financial future
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Work With Us?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're building something meaningful and we'd love for you to be part of it
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find your perfect role and join our mission
            </p>
          </motion.div>

          <div className="space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Salary</div>
                      <div className="font-semibold text-emerald-600">{job.salary}</div>
                    </div>
                    <button className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Culture</h2>
              <p className="text-gray-600 mb-4">
                At FinLearn, we believe in creating an environment where everyone can thrive. We value diversity, creativity, and continuous learning.
              </p>
              <p className="text-gray-600 mb-4">
                Our team is spread across the globe, bringing unique perspectives and experiences that enrich our work and culture. We communicate openly, support each other, and celebrate our wins together.
              </p>
              <p className="text-gray-600 mb-6">
                We're not just building a product—we're building a movement to make financial education accessible to everyone. Join us and be part of something bigger.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Transparent communication and decision-making</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Autonomy and ownership of your work</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Regular team retreats and meetups</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span>Learning budget for personal development</span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Life at FinLearn</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="text-sm">Team Celebrations</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <div className="text-sm">Learning Days</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">💻</div>
                  <div className="text-sm">Remote Work</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🌍</div>
                  <div className="text-sm">Global Team</div>
                </div>
              </div>
            </motion.div>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Don't See a Role That Fits?</h2>
            <p className="text-xl mb-8 opacity-90">
              We're always looking for talented people. Send us your resume and we'll keep you in mind for future openings.
            </p>
            <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
              Send General Application
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
