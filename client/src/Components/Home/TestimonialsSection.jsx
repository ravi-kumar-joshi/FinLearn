import React from 'react'
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';


const TestimonialsSection = () => {
    const testimonials = [
        {
            name: "Priya Sharma",
            role: "Student, Mumbai",
            avatar: "/2.png",
            rating: 5,
            text: "The budgeting lessons finally made finance easy for me."
        },
        {
            name: "Rahul Verma",
            role: "Software Engineer, Delhi",
            avatar: "/1.png",
            rating: 5,
            text: " I learned more practical finance here than in school."
        },
        {
            name: "Anjali Patel",
            role: "Business Owner, Pune",
            avatar: "/3.png",
            rating: 4,
            text: "The quizzes and streaks kept me motivated daily."
        }
    ];

    return (
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        What Our Students Say
                    </h2>
                    <p className="text-lg text-gray-600">
                        Hear from learners who transformed their financial lives
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            className="bg-linear-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.15,
                                ease: "easeOut"
                            }}
                            whileHover={{ y: -8 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-linear-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                    <img src={testimonial.avatar} alt='Anjali Patel' className='rounded-full' />


                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 my-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-700 mb-6 leading-relaxed italic">
                                "{testimonial.text}"</p>

                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection
