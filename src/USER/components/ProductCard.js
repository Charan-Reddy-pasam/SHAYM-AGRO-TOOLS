import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="group bg-white border border-border overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-500"
    >
      {/* Product Image Wrapper */}
      <div className="relative aspect-square overflow-hidden bg-[#f9f9f9]">
        {product.discount && (
          <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-sm shadow-lg">
            -{product.discount}%
          </span>
        )}
        
        {/* Main Image */}
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=400'} 
          alt={product.name}
          className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110 group-hover:opacity-0"
        />
        
        {/* Hover Image (Simulated with a different crop or placeholder) */}
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1617576621019-ac582031920d?auto=format&fit=crop&q=80&w=400'} 
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain transition-all duration-700 scale-125 opacity-0 group-hover:opacity-100 group-hover:scale-105"
        />

        {/* Floating Actions */}
        <div className="absolute right-[-50px] top-4 flex flex-col gap-3 transition-all duration-500 group-hover:right-4 z-20">
          <button className="w-10 h-10 bg-white shadow-xl flex items-center justify-center text-dark hover:bg-primary hover:text-white rounded-full transition-all duration-300">
            <Heart size={18} />
          </button>
          <button className="w-10 h-10 bg-white shadow-xl flex items-center justify-center text-dark hover:bg-primary hover:text-white rounded-full transition-all duration-300">
            <Eye size={18} />
          </button>
        </div>

        {/* Add to Cart Overlay Button */}
        <div className="absolute bottom-[-60px] left-0 w-full p-4 transition-all duration-500 group-hover:bottom-0 z-20">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full bg-dark text-white font-bold py-3 text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-colors uppercase"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-6 flex flex-col flex-grow text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
          ))}
          <span className="text-[10px] text-gray-400 ml-1">(45)</span>
        </div>
        
        <h3 
          onClick={() => navigate(`/product/${product.id}`)}
          className="text-dark font-bold text-base mb-2 cursor-pointer hover:text-primary transition-colors uppercase tracking-tight line-clamp-1"
        >
          {product.name}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-center gap-3">
          <span className="text-primary font-black text-lg tracking-tighter">₹{product.price}</span>
          {product.oldPrice && (
            <span className="text-gray-400 line-through text-sm">₹{product.oldPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
