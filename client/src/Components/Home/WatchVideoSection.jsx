import React, { useState } from 'react'
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const WatchVideoSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState(0)

  const videos = [
    {
      id: 1,
      title: "Introduction to Personal Finance",
      description: "Get started with the basics of personal finance and why it matters.",
      thumbnail: "/video1-thumbnail.jpg",
      videoUrl: "https://ik.imagekit.io/tz5jjsqeb/FinancialBasics_Intro.mp4?updatedAt=1774536286446"
    },
    {
      id: 2,
      title: "Budgeting Made Simple",
      description: "Learn how to create and stick to a budget that works for you.",
      thumbnail: "/video2-thumbnail.jpg",
      videoUrl: ""
    },
    {
      id: 3,
      title: "Investing for Beginners",
      description: "Understand the fundamentals of investing and start building wealth.",
      thumbnail: "/video3-thumbnail.jpg",
      videoUrl: ""
    }
  ]

  const openModal = (index) => {
    setCurrentVideo(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length)
  }

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length)
  }

  return (
    <section id="WatchVideo" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Watch & Learn
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get a preview of our learning experience with these introductory videos
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => openModal(index)}
            >
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-white text-sm font-medium">Preview</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm">{video.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Video Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="relative w-full max-w-4xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute -top-12 right-0 text-white hover:text-teal-400 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>

                {/* Video Container */}
                <div className="bg-black rounded-2xl overflow-hidden aspect-video">
                  {videos[currentVideo].videoUrl ? (
                    <video
                      src={videos[currentVideo].videoUrl}
                      autoPlay
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center text-white">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Video coming soon</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={prevVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  <p className="text-white font-medium">
                    {videos[currentVideo].title}
                  </p>
                  <button
                    onClick={nextVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default WatchVideoSection
