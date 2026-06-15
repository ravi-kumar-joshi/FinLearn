import React from 'react'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: '5 Essential Budgeting Tips for Beginners',
      excerpt: 'Learn the fundamentals of budgeting and take control of your finances with these simple yet effective strategies.',
      date: 'June 10, 2026',
      readTime: '5 min read',
      category: 'Budgeting',
      image: '📊'
    },
    {
      id: 2,
      title: 'Understanding Compound Interest: Your Wealth Multiplier',
      excerpt: 'Discover how compound interest works and why starting early can make a huge difference in your financial journey.',
      date: 'June 8, 2026',
      readTime: '7 min read',
      category: 'Investing',
      image: '📈'
    },
    {
      id: 3,
      title: 'Emergency Funds: Why You Need One and How to Build It',
      excerpt: 'A comprehensive guide to building your financial safety net and protecting yourself from unexpected expenses.',
      date: 'June 5, 2026',
      readTime: '6 min read',
      category: 'Savings',
      image: '💰'
    },
    {
      id: 4,
      title: 'Debt Management Strategies That Actually Work',
      excerpt: 'Practical tips and strategies to help you get out of debt faster and stay debt-free for good.',
      date: 'June 2, 2026',
      readTime: '8 min read',
      category: 'Debt',
      image: '💳'
    },
    {
      id: 5,
      title: 'Tax Planning Basics: What Every Beginner Should Know',
      excerpt: 'Navigate the complex world of taxes with confidence using these essential tax planning tips.',
      date: 'May 30, 2026',
      readTime: '6 min read',
      category: 'Tax',
      image: '📋'
    },
    {
      id: 6,
      title: 'Retirement Planning: It\'s Never Too Early to Start',
      excerpt: 'Learn why starting your retirement planning early can help you achieve financial freedom sooner.',
      date: 'May 28, 2026',
      readTime: '7 min read',
      category: 'Retirement',
      image: '🏖️'
    }
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
              <span className="text-[#16a34a]">Financial</span> Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert insights, practical tips, and actionable advice to help you master your finances
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-3xl p-8 md:p-12 text-white mb-16"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                  Featured
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  The Complete Guide to Financial Freedom in 2026
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  Everything you need to know to start your journey toward financial independence, from budgeting basics to advanced investment strategies.
                </p>
                <div className="flex items-center gap-4 text-sm opacity-80 mb-6">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    June 15, 2026
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    12 min read
                  </span>
                </div>
                <button className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                  Read Article
                </button>
              </div>
              <div className="text-8xl text-center">
                🚀
              </div>
            </div>
          </motion.div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center text-6xl">
                  {post.image}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-emerald-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <button className="mt-4 flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-3 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-600 mb-8">
              Get the latest financial tips and insights delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
              />
              <button className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
