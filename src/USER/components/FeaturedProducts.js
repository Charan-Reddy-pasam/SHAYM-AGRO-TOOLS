import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import ProductCard from './ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const FeaturedProducts = ({ title = "FEATURED ITEMS", subtitle = "Special Products", limit = 8 }) => {
  // Take specified number of products
  const featured = products.slice(0, limit);

  return (
    <section className="section-padding bg-white">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-primary font-bold tracking-[4px] text-sm uppercase mb-2 block"
          >
            {subtitle}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-dark"
          >
            {title}
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            className="h-1 bg-primary mx-auto mt-4 rounded-full"
          ></motion.div>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="pb-16"
        >
          {featured.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <style jsx="true">{`
        .swiper-button-next, .swiper-button-prev {
          width: 40px;
          height: 40px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 50%;
          color: #1a1a1a !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 14px;
          font-weight: bold;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: #6dbd2f;
          color: white !important;
          border-color: #6dbd2f;
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;
