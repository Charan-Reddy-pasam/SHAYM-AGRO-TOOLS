import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HomeCategories from '../components/HomeCategories';
import FeaturedProducts from '../components/FeaturedProducts';
import OfferBanners from '../components/OfferBanners';
import Testimonials from '../components/Testimonials';
import BlogSection from '../components/BlogSection';
import BrandSlider from '../components/BrandSlider';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with sticky navigation */}
      <Header onLoginClick={() => setIsLoginOpen(true)} />

      <main className="flex-grow overflow-hidden">
        {/* Full-width Hero Slider */}
        <Hero />

        {/* Brand Logo Slider */}
        <BrandSlider />

        {/* Categories Section */}
        <HomeCategories />

        {/* Featured Products */}
        <FeaturedProducts title="FEATURED MACHINERY" subtitle="Modern Agriculture" limit={4} />

        {/* Offer Banners */}
        <OfferBanners />

        {/* Trending Section */}
        <FeaturedProducts title="TRENDING NOW" subtitle="Most Popular" limit={8} />

        {/* Testimonials */}
        <Testimonials />

        {/* Blog Section */}
        <BlogSection />
      </main>

      {/* Elegant Dark Footer */}
      <Footer />

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[100] w-12 h-12 bg-primary text-white flex items-center justify-center rounded-full shadow-2xl hover:bg-dark transition-all duration-300"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* Overlays */}
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default Home;
