import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [coupon, setCoupon] = useState('');
  const navigate = useNavigate();

  const deliveryCharge = cartSubtotal > 5000 ? 0 : 250;
  const gst = Math.round(cartSubtotal * 0.18);
  const coinsUsed = cartItems.length > 0 ? 150 : 0; 
  const grandTotal = cartSubtotal + deliveryCharge + gst - coinsUsed;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      
      {/* Page Header */}
      <section className="bg-dark py-12 md:py-20 px-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-bold tracking-[4px] text-xs uppercase mb-4"
          >
            Shopping Session
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight"
          >
            Your Cart <span className="text-primary">({cartItems.length})</span>
          </motion.h1>
        </div>
      </section>

      <main className="flex-grow max-w-[1440px] mx-auto w-full py-12 md:py-20 px-4 md:px-10 lg:px-20">
        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-border p-20 flex flex-col items-center text-center shadow-sm"
            >
              <div className="w-24 h-24 bg-light rounded-full flex items-center justify-center text-gray-300 mb-8">
                <ShoppingBag size={48} />
              </div>
              <h2 className="text-2xl font-bold text-dark uppercase tracking-tight mb-4">Your cart is currently empty</h2>
              <p className="text-gray-500 max-w-sm mb-10 leading-relaxed font-medium">
                Looks like you haven't added any agriculture tools yet. Start exploring our collections.
              </p>
              <button 
                onClick={() => navigate('/categories')}
                className="btn-primary flex items-center gap-3 px-10 py-5"
              >
                RETURN TO SHOP <ArrowRight size={18} />
              </button>
            </motion.div>
          ) : (
            <div key="content" className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-12">
              {/* Left Side: Items List */}
              <div className="space-y-6">
                <div className="bg-white border border-border overflow-hidden shadow-sm">
                  <div className="hidden md:grid grid-cols-[1fr_120px_150px_120px] gap-4 p-6 bg-gray-50 border-b border-border text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <div>Product Details</div>
                    <div className="text-center">Price</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Total</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        className="p-6 grid grid-cols-1 md:grid-cols-[1fr_120px_150px_120px] gap-6 items-center hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-6 items-center">
                          <div className="w-24 h-24 bg-light p-2 border border-gray-100 shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-dark uppercase tracking-wide truncate mb-1">{item.name}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">SKU: {item.sku}</p>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>

                        <div className="text-center font-bold text-dark md:block flex justify-between items-center border-t md:border-t-0 pt-4 md:pt-0">
                          <span className="md:hidden text-[10px] text-gray-400 uppercase font-black">Price:</span>
                          ₹{item.price.toLocaleString()}
                        </div>

                        <div className="flex justify-center border-t md:border-t-0 pt-4 md:pt-0">
                          <div className="flex items-center border border-border bg-white rounded-sm overflow-hidden h-10">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-12 text-center text-sm font-bold border-x border-border">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="text-right font-black text-primary text-lg md:block flex justify-between items-center border-t md:border-t-0 pt-4 md:pt-0">
                          <span className="md:hidden text-[10px] text-gray-400 uppercase font-black">Subtotal:</span>
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 border border-border shadow-sm flex items-start gap-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark uppercase tracking-wider text-sm mb-2">Free Delivery</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Spend ₹5,000 more to qualify for free shipping nationwide.</p>
                    </div>
                  </div>
                  <div className="bg-white p-8 border border-border shadow-sm flex items-start gap-5">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-dark uppercase tracking-wider text-sm mb-2">Secure Payment</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Your data is protected with 256-bit SSL encryption.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Order Summary */}
              <aside className="space-y-8">
                <div className="bg-white border border-border p-8 shadow-sm sticky top-32">
                  <h3 className="text-xl font-bold text-dark uppercase tracking-tight mb-8 pb-4 border-b border-border flex items-center justify-between">
                    Order Summary
                    <ShoppingBag size={20} className="text-primary" />
                  </h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Item Subtotal</span>
                      <span className="text-dark">₹{cartSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Estimated Tax (18%)</span>
                      <span className="text-dark">₹{gst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Delivery Charges</span>
                      <span className={deliveryCharge === 0 ? 'text-green-600' : 'text-dark font-bold'}>
                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2 text-primary bg-primary/5 p-2 rounded-sm">
                      <span className="uppercase tracking-widest text-[10px] font-black">Coins Discount</span>
                      <span className="font-black">- ₹{coinsUsed}</span>
                    </div>
                  </div>

                  <div className="relative mb-8">
                    <input 
                      type="text" 
                      placeholder="COUPON CODE" 
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-4 text-[10px] font-black outline-none focus:border-primary transition-colors uppercase tracking-widest"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <button className="absolute right-2 top-2 bottom-2 bg-dark text-white px-4 text-[9px] font-black uppercase hover:bg-primary transition-colors">
                      Apply
                    </button>
                  </div>

                  <div className="pt-6 border-t border-dark mb-8">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                      <span className="text-3xl font-black text-dark leading-none">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate('/checkout')}
                    className="btn-primary w-full py-5 flex items-center justify-center gap-3"
                  >
                    PROCEED TO CHECKOUT <ArrowRight size={18} />
                  </button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-green-500" />
                    Payments are 100% Secure
                  </div>
                </div>
              </aside>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default CartPage;

