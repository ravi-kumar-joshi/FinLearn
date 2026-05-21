import React from 'react'
import Navigation from '../Components/Home/Navigation'
import HeroSection from '../Components/Home/HeroSection'
import WhyChooseSection from '../Components/Home/WhyChooseSection'
import AboutSection from '../Components/Home/AboutSection'
import CourseModulesSection from '../Components/Home/CourseModulesSection'
import WhyStudentsLoveSection from '../Components/Home/WhyStudentsLoveSection'
import TestimonialsSection from '../Components/Home/TestimonialsSection'
import VideoSection from '../Components/Home/VideoSection'
import PricingSection from '../Components/Home/PricingSection'
import FinalCTASection from '../Components/Home/FinalCTASection'
import Footer from '../Components/Home/Footer'

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
