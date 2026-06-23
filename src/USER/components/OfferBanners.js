import React from 'react';
import { motion } from 'framer-motion';

const OfferBanners = () => {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Banner 1 */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="relative group overflow-hidden h-[300px] md:h-[400px] bg-dark"
        >
          <img 
            src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=1200" 
            alt="Offer 1" 
            className="w-full h-full object-cover opacity-60 transition-transform duration-[2000ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 p-10 flex flex-col justify-center items-start text-white z-10">
            <span className="bg-primary text-white text-[10px] font-black px-4 py-1 mb-4 uppercase tracking-[2px]">Special Offer</span>
            <h3 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">PREMIUM FARMING<br/>TOOLS UP TO 40% OFF</h3>
            <p className="text-gray-300 mb-8 max-w-sm font-light">Equip your farm with the best industrial tools at unbeatable prices this season.</p>
            <button className="btn-primary">SHOP COLLECTION</button>
          </div>
        </motion.div>

        {/* Banner 2 */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="relative group overflow-hidden h-[300px] md:h-[400px] bg-dark"
        >
          <img 
            src="https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=1200" 
            alt="Offer 2" 
            className="w-full h-full object-cover opacity-60 transition-transform duration-[2000ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 p-10 flex flex-col justify-center items-start text-white z-10">
            <span className="bg-white text-dark text-[10px] font-black px-4 py-1 mb-4 uppercase tracking-[2px]">New Arrivals</span>
            <h3 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">POWERFUL<br/>POWER TILLERS</h3>
            <p className="text-gray-300 mb-8 max-w-sm font-light">Discover our newly launched range of high-performance industrial power tillers.</p>
            <button className="btn-outline border-white text-white hover:bg-white hover:text-dark">EXPLORE NOW</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OfferBanners;
