import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Hero = () => {
  const slides = [
    {
      id: 1,
      image: '/hero_banner.png',
      title: 'HEAVY-DUTY AGRICULTURE TOOLS',
      subtitle: 'Premium Farming Solutions',
      description: 'Reliable machinery for professional agriculture and industrial operations. Engineered for extreme durability.',
      btn1: 'SHOP NOW',
      btn2: 'VIEW PRODUCTS'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=2000',
      title: 'MODERN POWER TILLERS',
      subtitle: 'Advanced Soil Engineering',
      description: 'Discover our new range of industrial power tillers designed for high-torque performance in any soil condition.',
      btn1: 'EXPLORE NOW',
      btn2: 'OFFERS'
    }
  ];

  return (
    <section className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden bg-gray-100">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        className="h-full w-full hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full flex items-center">
              {/* Background with Zoom Animation */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-100 group-active:scale-110"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black/40"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-20 w-full">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="max-w-2xl text-white"
                >
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-block text-primary font-bold tracking-[4px] text-sm md:text-base mb-4 bg-white/10 backdrop-blur-md px-4 py-1 rounded-sm border-l-4 border-primary"
                  >
                    {slide.subtitle}
                  </motion.span>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl md:text-7xl font-bold leading-tight mb-6 drop-shadow-2xl"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed font-light"
                  >
                    {slide.description}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-wrap gap-4"
                  >
                    <button className="btn-primary min-w-[180px] py-4">{slide.btn1}</button>
                    <button className="btn-outline border-white text-white hover:bg-white hover:text-dark min-w-[180px] py-4">{slide.btn2}</button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx="true">{`
        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          border-radius: 50%;
          color: white !important;
          transition: all 0.3s ease;
        }
        .hero-swiper .swiper-button-next:after,
        .hero-swiper .swiper-button-prev:after {
          font-size: 18px;
          font-weight: bold;
        }
        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          background: #6dbd2f;
          transform: scale(1.1);
        }
        .hero-swiper .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 12px;
          height: 12px;
          transition: all 0.3s;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #6dbd2f !important;
          opacity: 1;
          width: 30px;
          border-radius: 6px;
        }
      `}</style>
    </section>
  );
};

export default Hero;
