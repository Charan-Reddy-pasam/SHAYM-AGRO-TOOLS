import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categories } from '../data/categories';
import { ChevronRight } from 'lucide-react';

const HomeCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="section-padding bg-light">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-primary font-bold tracking-[3px] text-sm uppercase mb-2 block"
            >
              Browse Collections
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold text-dark"
            >
              SHOP BY CATEGORY
            </motion.h2>
          </div>
          <button 
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 text-dark font-bold hover:text-primary transition-colors group"
          >
            VIEW ALL CATEGORIES 
            <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronRight size={16} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/category/${cat.id}`)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden aspect-[4/5] bg-white border border-border">
                {/* Image Placeholder with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                <img 
                  src={cat.image} 
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-8 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                      <i className={cat.icon}></i>
                    </div>
                    <span className="text-white/70 text-xs font-bold tracking-widest uppercase">
                      {cat.sub.length} COLLECTIONS
                    </span>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-4 tracking-wide group-hover:text-primary transition-colors">
                    {cat.name.toUpperCase()}
                  </h3>
                  <div className="h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full"></div>
                </div>

                {/* Floating Shop Tag */}
                <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white text-dark text-[10px] font-black px-4 py-2 rounded-full shadow-xl">
                    SHOP NOW
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;
