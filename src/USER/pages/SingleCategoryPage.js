import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import { products } from '../data/products';
import { categories } from '../data/categories';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, Grid, List } from 'lucide-react';

const SingleCategoryPage = () => {
  const { id } = useParams();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');

  const currentCategory = categories.find(c => c.id === id);
  const title = currentCategory ? currentCategory.name : id.replace(/-/g, ' ');
  const subcategories = currentCategory ? currentCategory.sub : [];

  const filteredProducts = products.filter(p => {
    const categoryMatch = currentCategory ? p.category === currentCategory.name : true;
    let priceMatch = true;
    if (priceFilter === 'under1000') priceMatch = p.price < 1000;
    else if (priceFilter === '1000-5000') priceMatch = p.price >= 1000 && p.price <= 5000;
    else if (priceFilter === 'over5000') priceMatch = p.price > 5000;
    return categoryMatch && priceMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-light">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      
      {/* Category Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-dark">
        <img 
          src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=1600" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt="Category Banner"
        />
        <div className="relative z-10 text-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-primary font-bold text-xs uppercase tracking-[4px] mb-4"
          >
            <span>HOME</span>
            <span className="text-white/20">/</span>
            <span>COLLECTIONS</span>
            <span className="text-white/20">/</span>
            <span className="text-white">{title.toUpperCase()}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-bold text-white uppercase tracking-tight"
          >
            {title}
          </motion.h1>
        </div>
      </section>

      <main className="max-w-[1440px] mx-auto w-full py-20 px-4 md:px-10 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[300px] shrink-0">
            <div className="bg-white border border-border p-8 sticky top-32">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                <Filter size={20} className="text-primary" />
                <h3 className="font-bold text-dark uppercase tracking-widest text-sm">Filter Products</h3>
              </div>

              {/* Shop By Sub-Category */}
              {subcategories.length > 0 && (
                <div className="mb-10">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Sub Categories</h4>
                  <div className="flex flex-col gap-3">
                    {subcategories.map((sub, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <i className={`${sub.icon} text-xs text-primary/40 group-hover:text-primary`}></i>
                          {sub.name}
                        </div>
                        <span className="text-[10px] bg-light px-2 py-0.5 rounded text-gray-400">12</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Filter */}
              <div className="mb-10">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Filter By Price</h4>
                <div className="flex flex-col gap-4">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under1000', label: 'Under ₹1,000' },
                    { id: '1000-5000', label: '₹1,000 - ₹5,000' },
                    { id: 'over5000', label: 'Over ₹5,000' }
                  ].map((filter) => (
                    <label key={filter.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="price" 
                        className="accent-primary w-4 h-4"
                        checked={priceFilter === filter.id}
                        onChange={() => setPriceFilter(filter.id)}
                      />
                      <span className={`text-sm font-medium transition-colors ${priceFilter === filter.id ? 'text-primary' : 'text-gray-600 group-hover:text-primary'}`}>
                        {filter.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full btn-primary py-4 text-xs font-bold">RESET FILTERS</button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-10 bg-white border border-border p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing {filteredProducts.length} items
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 border-r border-border pr-6 hidden md:flex">
                  <Grid size={18} className="text-primary cursor-pointer" />
                  <List size={18} className="text-gray-300 cursor-pointer hover:text-primary" />
                </div>
                <div className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-xs font-bold uppercase tracking-widest">Sort By: Featured</span>
                  <ChevronDown size={14} className="group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-border p-20 text-center">
                <h3 className="text-2xl font-bold mb-4">No products found</h3>
                <p className="text-gray-500 mb-8">Try adjusting your filters or search criteria.</p>
                <button onClick={() => setPriceFilter('all')} className="btn-primary">CLEAR ALL FILTERS</button>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default SingleCategoryPage;
