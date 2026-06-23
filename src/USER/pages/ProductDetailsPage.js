import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Star, Truck, ShieldCheck, RefreshCw, ShoppingCart, Zap, Heart, Share2, Plus, Minus } from 'lucide-react';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [qty, setQty] = useState(1);

  const product = products.find(p => p.id === id) || products[0];

  const handleAddToCart = () => {
    for(let i=0; i<qty; i++) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-poppins">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      
      <main className="flex-grow">
        {/* Breadcrumbs */}
        <div className="bg-light py-4 px-4 md:px-10 lg:px-20 border-b border-border">
          <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/categories" className="hover:text-primary transition-colors">Store</Link>
            <span>/</span>
            <span className="text-dark">{product.name.toUpperCase()}</span>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto py-12 md:py-20 px-4 md:px-10 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Product Images */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="relative aspect-square bg-[#f9f9f9] border border-border group overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.displayName} 
                  className="w-full h-full object-contain p-10 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest shadow-xl">
                  Industrial Grade
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-[#f9f9f9] border border-border cursor-pointer hover:border-primary transition-colors overflow-hidden">
                    <img src={product.image} className="w-full h-full object-contain p-2 opacity-60 hover:opacity-100 transition-opacity" alt="Thumb" />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="mb-6">
                <span className="text-primary font-bold text-xs uppercase tracking-[3px] mb-2 block">Shyam Agro Original</span>
                <h1 className="text-3xl md:text-5xl font-black text-dark uppercase tracking-tight leading-tight mb-4">{product.displayName}</h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-gray-200 text-gray-200"} />
                    ))}
                    <span className="text-sm font-bold ml-2">{product.rating}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l border-border pl-6">SKU: {product.sku}</span>
                </div>
              </div>

              <div className="flex items-end gap-4 mb-10">
                <span className="text-4xl font-black text-primary tracking-tighter">₹{product.price.toLocaleString()}</span>
                {product.mrp > product.price && (
                  <div className="flex flex-col mb-1">
                    <span className="text-gray-400 line-through text-sm font-medium italic">MRP ₹{product.mrp.toLocaleString()}</span>
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">You Save {Math.round((1 - product.price/product.mrp)*100)}%</span>
                  </div>
                )}
              </div>

              <p className="text-gray-500 leading-relaxed mb-10 border-l-4 border-primary/20 pl-6 py-2 italic text-lg font-light">
                {product.shortDesc || product.longDesc.substring(0, 150) + '...'}
              </p>

              {/* Purchase Actions */}
              <div className="bg-light p-8 border border-border space-y-8 mb-10">
                <div className="flex items-center gap-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-dark">Quantity</span>
                  <div className="flex items-center bg-white border border-border">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:text-primary transition-colors border-r border-border"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number" 
                      value={qty} 
                      readOnly 
                      className="w-16 text-center font-bold text-sm bg-transparent outline-none" 
                    />
                    <button 
                      onClick={() => setQty(qty + 1)}
                      className="w-12 h-12 flex items-center justify-center hover:text-primary transition-colors border-l border-border"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="btn-outline flex items-center justify-center gap-3 py-5"
                  >
                    <ShoppingCart size={18} /> ADD TO CART
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="btn-primary flex items-center justify-center gap-3 py-5"
                  >
                    <Zap size={18} /> BUY IT NOW
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pb-10 border-b border-border">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-light flex items-center justify-center text-primary">
                    <Truck size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">Free<br/>Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 border-x border-border">
                  <div className="w-12 h-12 rounded-full bg-light flex items-center justify-center text-primary">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">1 Year<br/>Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-light flex items-center justify-center text-primary">
                    <RefreshCw size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">Easy<br/>Returns</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-8">
                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                  <Heart size={16} /> Add to Wishlist
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                  <Share2 size={16} /> Share Product
                </button>
              </div>
            </motion.div>
          </div>

          {/* Description & Specs Tabs */}
          <div className="mt-32">
            <div className="flex border-b border-border mb-12">
              <button className="px-10 py-6 text-sm font-bold uppercase tracking-[4px] border-b-2 border-primary text-dark">Description</button>
              <button className="px-10 py-6 text-sm font-bold uppercase tracking-[4px] border-b-2 border-transparent text-gray-400 hover:text-dark transition-colors">Specifications</button>
              <button className="px-10 py-6 text-sm font-bold uppercase tracking-[4px] border-b-2 border-transparent text-gray-400 hover:text-dark transition-colors">Reviews (15)</button>
            </div>
            <div className="max-w-4xl space-y-8">
              <h3 className="text-3xl font-black text-dark uppercase tracking-tight">Technical details and usage</h3>
              <p className="text-gray-500 leading-relaxed text-lg font-light">
                {product.longDesc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-primary uppercase tracking-[2px] text-sm">Key Features</h4>
                  <ul className="space-y-3 text-gray-500 text-sm list-disc pl-4">
                    <li>Industrial grade carbon steel construction</li>
                    <li>Ergonomic design for long-duration use</li>
                    <li>UV-resistant coatings and finish</li>
                    <li>High precision engineering for maximum performance</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-primary uppercase tracking-[2px] text-sm">Package Includes</h4>
                  <ul className="space-y-3 text-gray-500 text-sm list-disc pl-4">
                    <li>Main Unit Assembly</li>
                    <li>User Manual & Maintenance Guide</li>
                    <li>Official Warranty Certification</li>
                    <li>Safety Protection Gear (Standard)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default ProductDetailsPage;
