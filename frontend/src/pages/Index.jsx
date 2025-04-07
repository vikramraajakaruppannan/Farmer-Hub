
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import CommunitySection from '../components/CommunitySection';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <CommunitySection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
