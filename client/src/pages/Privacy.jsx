import React from 'react'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'
import { motion } from 'framer-motion'

export default function Privacy() {
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
              Privacy <span className="text-[#16a34a]">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Last updated: June 15, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="prose prose-lg max-w-none"
          >
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  FinLearn ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial education platform. Please read this policy carefully.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                <div className="space-y-4 text-gray-600">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Name and email address</li>
                      <li>Profile information (username, avatar)</li>
                      <li>Contact information (phone number, address)</li>
                      <li>Demographic information (age, location)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Usage Data</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Course progress and completion data</li>
                      <li>Quiz scores and achievements</li>
                      <li>Login history and session data</li>
                      <li>Device information and browser type</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Billing address (for premium subscriptions)</li>
                      <li>Payment method details (processed securely)</li>
                      <li>Transaction history</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the collected information for various purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>To provide and maintain our platform</li>
                  <li>To personalize your learning experience</li>
                  <li>To track your progress and achievements</li>
                  <li>To communicate with you about updates and offers</li>
                  <li>To process payments and manage subscriptions</li>
                  <li>To improve our services and develop new features</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-4">
                  <li>SSL encryption for all data transmissions</li>
                  <li>Secure payment processing through PCI-compliant providers</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Restricted access to personal data</li>
                  <li>Secure data storage and backup systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Sharing Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your data only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>With service providers who assist in operating our platform</li>
                  <li>With your consent for specific purposes</li>
                  <li>To comply with legal requirements or court orders</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>In connection with a business transfer (merger, acquisition)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Third-Party Services</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our platform may integrate with third-party services such as Google Analytics, payment processors, and social media platforms. These services have their own privacy policies, and we encourage you to review them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Email: privacy@finlearn.com</p>
                  <p className="text-gray-600">Address: 123 Tech Park, Sector 5, Bangalore, India 560001</p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
