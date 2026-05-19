import React from 'react'
import Navigation from '../components/Home/Navigation'
import HeroSection from '../components/Home/HeroSection'
import WhyChooseSection from '../components/Home/WhyChooseSection'
import AboutSection from '../components/Home/AboutSection'
import CourseModulesSection from '../components/Home/CourseModulesSection'
import WhyStudentsLoveSection from '../components/Home/WhyStudentsLoveSection'
import TestimonialsSection from '../components/Home/TestimonialsSection'
import VideoSection from '../components/Home/VideoSection'
import PricingSection from '../components/Home/PricingSection'
import FinalCTASection from '../components/Home/FinalCTASection'
import Footer from '../components/Home/Footer'

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <WhyChooseSection />
      <AboutSection />
      <CourseModulesSection />
      <WhyStudentsLoveSection />
      <TestimonialsSection />
      <VideoSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}

export default Home
