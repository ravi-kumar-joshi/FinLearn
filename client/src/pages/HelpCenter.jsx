import React, { useState } from 'react'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'
import { motion } from 'framer-motion'
import { Search, ChevronDown, ChevronUp, MessageCircle, Book, Video, Mail } from 'lucide-react'

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on the "Sign In" button and select "Create Account". Fill in your details and verify your email address to get started.'
        },
        {
          q: 'Is FinLearn free to use?',
          a: 'Yes! FinLearn offers free access to all basic courses. Premium features and advanced courses may require a subscription.'
        },
        {
          q: 'What courses are available?',
          a: 'We offer courses on Budgeting, Investing, Banking, Loans & Credit, Income Tax, and more. New courses are added regularly.'
        }
      ]
    },
    {
      category: 'Account & Billing',
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'Click on "Forgot Password" on the login page. Enter your email address and follow the instructions sent to your email.'
        },
        {
          q: 'Can I change my email address?',
          a: 'Yes, you can update your email address in your profile settings. You will need to verify the new email address.'
        },
        {
          q: 'How do I cancel my subscription?',
          a: 'You can cancel your subscription anytime from your account settings. Your access will continue until the end of your billing period.'
        }
      ]
    },
    {
      category: 'Learning & Progress',
      questions: [
        {
          q: 'How do I track my progress?',
          a: 'Your progress is automatically tracked as you complete lessons and quizzes. You can view your progress in the Dashboard.'
        },
        {
          q: 'What are XP points?',
          a: 'XP points are earned by completing lessons, quizzes, and activities. They help track your learning journey and unlock achievements.'
        },
        {
          q: 'Can I retake quizzes?',
          a: 'Yes! You can retake quizzes as many times as you want. Your highest score will be recorded.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'What browsers are supported?',
          a: 'FinLearn works best on Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser.'
        },
        {
          q: 'Can I use FinLearn on mobile?',
          a: 'Yes! FinLearn is fully responsive and works on all devices including smartphones and tablets.'
        },
        {
          q: 'Videos are not loading. What should I do?',
          a: 'Check your internet connection and try refreshing the page. If the problem persists, contact our support team.'
        }
      ]
    }
  ]

  const resources = [
    { icon: Book, title: 'User Guide', desc: 'Complete guide to using FinLearn' },
    { icon: Video, title: 'Video Tutorials', desc: 'Step-by-step video walkthroughs' },
    { icon: MessageCircle, title: 'Community Forum', desc: 'Connect with other learners' },
    { icon: Mail, title: 'Contact Support', desc: 'Get help from our team' }
  ]

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setExpandedFaq(expandedFaq === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Help <span className="text-teal-600">Center</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Find answers to your questions and get the help you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-teal-300 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <resource.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm">{resource.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find quick answers to common questions</p>
          </motion.div>

          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h3>
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`
                  const isExpanded = expandedFaq === key
                  return (
                    <motion.div
                      key={questionIndex}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: questionIndex * 0.05 }}
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium">{faq.q}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-6 pb-4 text-gray-600"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 sm:p-12 text-white text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg opacity-90 mb-8">
              Can't find what you're looking for? Our support team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
              <button className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors">
                Live Chat
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
