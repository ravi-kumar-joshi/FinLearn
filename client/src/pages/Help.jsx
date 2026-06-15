import React, { useState } from 'react'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'
import { motion } from 'framer-motion'
import { Search, ChevronDown, ChevronUp, BookOpen, Video, MessageCircle, Mail } from 'lucide-react'

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: Video },
    { id: 'account', name: 'Account & Profile', icon: MessageCircle },
    { id: 'courses', name: 'Courses & Lessons', icon: BookOpen },
    { id: 'billing', name: 'Billing & Payments', icon: Mail }
  ]

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'Click the "Get Started" button on the homepage, fill in your details, and verify your email. You\'ll be ready to start learning in minutes!'
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'Is FinLearn free to use?',
      answer: 'Yes! FinLearn offers free access to all basic courses and lessons. Premium features and advanced courses are available with a subscription.'
    },
    {
      id: 3,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Sign In" then "Forgot Password". Enter your email and we\'ll send you a link to reset your password.'
    },
    {
      id: 4,
      category: 'account',
      question: 'Can I change my email address?',
      answer: 'Yes, go to your profile settings and click on "Edit Profile". You can update your email address there. You\'ll need to verify the new email.'
    },
    {
      id: 5,
      category: 'courses',
      question: 'How do I enroll in a course?',
      answer: 'Browse our courses, click on one you\'re interested in, and click "Enroll Now". The course will be added to your dashboard.'
    },
    {
      id: 6,
      category: 'courses',
      question: 'Can I access courses offline?',
      answer: 'Currently, courses require an internet connection. We\'re working on an offline mode that will be available soon.'
    },
    {
      id: 7,
      category: 'courses',
      question: 'How do I get a certificate?',
      answer: 'Complete all lessons and pass the final quiz with a score of 70% or higher. Your certificate will be available for download.'
    },
    {
      id: 8,
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, and net banking. All payments are processed securely.'
    },
    {
      id: 9,
      category: 'billing',
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel anytime from your account settings. Your access will continue until the end of your current billing period.'
    },
    {
      id: 10,
      category: 'billing',
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee for new subscriptions. Contact support if you\'re not satisfied.'
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

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
              Help <span className="text-[#16a34a]">Center</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Find answers to common questions and get the help you need
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
            </p>
          </motion.div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold pr-8">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4 text-gray-600"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No results found. Try a different search term.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                Contact Support
              </button>
              <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
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
