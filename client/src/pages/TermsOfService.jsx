import React from 'react'
import Navigation from '../Components/Home/Navigation'
import Footer from '../Components/Home/Footer'
import { motion } from 'framer-motion'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Terms of <span className="text-teal-600">Service</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: June 15, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using FinLearn ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  FinLearn provides an online financial education platform including courses, lessons, quizzes, tools, and related content. The Service is provided on an "as is" and "as available" basis.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Creation</h3>
                    <p className="text-gray-600 leading-relaxed">
                      You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Requirements</h3>
                    <p className="text-gray-600 leading-relaxed">
                      You must be at least 13 years old to create an account. By creating an account, you represent that you meet this age requirement.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Termination</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Conduct</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Post or transmit harmful, offensive, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Use the Service for commercial purposes without permission</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Content</h3>
                    <p className="text-gray-600 leading-relaxed">
                      All content on FinLearn, including text, graphics, logos, images, and software, is owned by FinLearn or its licensors and is protected by copyright laws.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Content</h3>
                    <p className="text-gray-600 leading-relaxed">
                      You retain ownership of any content you submit to the Service. By submitting content, you grant us a license to use, display, and distribute it for the purpose of providing the Service.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Certificates</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Certificates issued by FinLearn are for personal use and may not be reproduced, modified, or distributed without written permission.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment and Subscription</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Services</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Basic access to FinLearn is free. We may offer premium features or courses that require payment.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscription Terms</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Paid subscriptions are billed in advance on a recurring basis. You can cancel your subscription at any time through your account settings.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Refunds</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Refunds are handled on a case-by-case basis. Please contact our support team for refund requests.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer of Warranties</h2>
                <p className="text-gray-600 leading-relaxed">
                  The Service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, FinLearn shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to indemnify and hold harmless FinLearn from any claims arising from your use of the Service or violation of these Terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our platform. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  Email: legal@finlearn.com<br />
                  Address: 123 Finance Street, Mumbai, Maharashtra 400001, India
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
