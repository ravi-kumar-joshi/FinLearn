import React from 'react'
import { motion } from 'framer-motion';


const Check = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"  
        viewBox="0 0 20 20"
        fill="currentColor"
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
        />
    </svg>
);

function PricingSection() {
    return (
        <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 to-emerald-50">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                       Everything You Need to Start Learning Finance - Free
                    </h2>
                    <p className="text-lg text-gray-600">
                        Access all courses, features, and resources completely free. No hidden costs, no subscriptions.
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        className="bg-linear-to-br from-teal-500 to-emerald-600 rounded-3xl p-10 md:p-12 text-white relative overflow-hidden shadow-2xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="absolute top-4 right-4">
                            <motion.span 
                                className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold"
                                animate={{ 
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                ALWAYS FREE
                            </motion.span>
                        </div>

                        <motion.div 
                            className="text-center mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h3 className="text-3xl font-bold mb-4">Complete Access - Forever Free</h3>
                            <div className="mb-2">
                                <span className="text-4xl sm:text-6xl font-bold">₹0</span>
                            </div>
                            <p className="text-teal-100 text-lg">No payment required. Ever.</p>
                        </motion.div>

                        <motion.div 
                            className="grid md:grid-cols-2 gap-6 mb-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div>
                                <ul className="space-y-4">
                                    {['Access to ALL courses', 'No ads', 'Verified certificates', 'No payment required'].map((item, index) => (
                                        <motion.li 
                                            key={index}
                                            className="flex items-start gap-3"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
                                        >
                                            <Check className="w-6 h-6 text-white mt-0.5 shrink-0" />
                                            <span className="text-lg">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <ul className="space-y-4">
                                    {['Progress tracking', 'Customizable goals', 'Community support', 'Lifetime access'].map((item, index) => (
                                        <motion.li 
                                            key={index}
                                            className="flex items-start gap-3"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
                                        >
                                            <Check className="w-6 h-6 text-white mt-0.5 shrink-0" />
                                            <span className="text-lg">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        <motion.button 
                            className="w-full py-4 bg-white text-teal-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Start Learning for Free
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default PricingSection
