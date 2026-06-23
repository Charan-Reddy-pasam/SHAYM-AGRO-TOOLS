import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import { categories } from '../data/categories';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const CategoriesPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-light">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      
      <main className="flex-grow section-padding">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-16 text-center">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary font-bold tracking-[4px] text-sm uppercase mb-2 block"
            >
              Our Collections
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-dark uppercase"
            >
              ALL CATEGORIES
            </motion.h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {categories.map((cat, index) => (
              <motion.div 
                key={cat.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-border group hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-light flex items-center justify-center text-primary text-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <i className={cat.icon}></i>
                    </div>
                    <h2 className="text-2xl font-bold text-dark group-hover:text-primary transition-colors uppercase tracking-tight">{cat.name}</h2>
                  </div>
                  
                  <div className="space-y-3 mb-10">
                    {cat.sub.map((sub, i) => (
                      <div 
                        key={i} 
                        onClick={() => navigate(`/category/${cat.id}`)}
                        className="flex items-center justify-between text-gray-500 hover:text-primary transition-colors cursor-pointer group/sub"
                      >
                        <span className="text-sm font-medium">{sub.name}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => navigate(`/category/${cat.id}`)}
                    className="w-full btn-outline py-4 text-xs font-bold"
                  >
                    EXPLORE COLLECTION
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default CategoriesPage;
