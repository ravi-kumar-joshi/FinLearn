import React from 'react'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'
import { motion } from 'framer-motion'

export default function Terms() {
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
              Terms of <span className="text-[#16a34a]">Service</span>
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
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using FinLearn ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  FinLearn is a financial education platform that provides interactive courses, lessons, quizzes, and tools to help users improve their financial literacy. The Service includes both free and premium content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
                <div className="space-y-4 text-gray-600">
                  <p className="leading-relaxed">
                    To use certain features of the Service, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and update your account information</li>
                    <li>Keep your password secure and confidential</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                  <p className="leading-relaxed">
                    You must be at least 13 years old to create an account. By creating an account, you represent that you are at least 13 years old.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Violate any local, state, national, or international law</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Transmit viruses or malicious code</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Use automated tools to access the Service</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Intellectual Property</h2>
                <div className="space-y-4 text-gray-600">
                  <p className="leading-relaxed">
                    All content on FinLearn, including but not limited to text, graphics, logos, images, videos, and software, is owned by FinLearn or its licensors and is protected by copyright and other intellectual property laws.
                  </p>
                  <p className="leading-relaxed">
                    You may not reproduce, distribute, modify, create derivative works, or publicly display any content from the Service without our prior written consent.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. User-Generated Content</h2>
                <div className="space-y-4 text-gray-600">
                  <p className="leading-relaxed">
                    You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content for the purpose of operating and improving the Service.
                  </p>
                  <p className="leading-relaxed">
                    You represent that you have the right to submit such content and that it does not violate any third-party rights.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Subscription and Payments</h2>
                <div className="space-y-4 text-gray-600">
                  <p className="leading-relaxed">
                    Premium subscriptions are available for purchase. By subscribing, you agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Pay all fees and charges associated with your account</li>
                    <li>Provide accurate billing information</li>
                    <li>Authorize automatic payments if applicable</li>
                    <li>Understand that subscriptions auto-renew unless cancelled</li>
                  </ul>
                  <p className="leading-relaxed">
                    All fees are non-refundable except as required by law or as specified in our refund policy.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                <div className="space-y-4 text-gray-600">
                  <p className="leading-relaxed">
                    We reserve the right to terminate or suspend your account at any time, with or without cause, with or without notice.
                  </p>
                  <p className="leading-relaxed">
                    You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination, your right to use the Service will immediately cease.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Disclaimers</h2>
                <div className="space-y-4 text-gray-600">
                  <p className="leading-relaxed">
                    The Service is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Accuracy or reliability of the content</li>
                    <li>Availability or uninterrupted operation of the Service</li>
                    <li>Compatibility with your device or software</li>
                    <li>Security of data transmission</li>
                  </ul>
                  <p className="leading-relaxed">
                    Financial education content is for informational purposes only and does not constitute financial advice. Consult a qualified financial advisor before making financial decisions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, FinLearn shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses, resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">11. Indemnification</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to indemnify and hold harmless FinLearn, its affiliates, officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting the updated Terms on this page. Your continued use of the Service after such modifications constitutes acceptance of the new Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Email: legal@finlearn.com</p>
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
