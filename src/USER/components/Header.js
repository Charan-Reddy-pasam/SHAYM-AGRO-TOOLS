import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, User, Search, Phone, Mail, ChevronDown, LogOut, Package, Wallet, Menu, X } from 'lucide-react';

const Header = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const { cartCount, cartItems, cartSubtotal, removeFromCart } = useCart();
  const [user, setUser] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'CATEGORIES', path: '/categories' },
  ];

  return (
    <header className="w-full font-poppins">
      {/* 1. TOP HEADER BAR */}
      <div className="bg-dark text-white text-[10px] py-1.5 px-4 md:px-10 flex flex-wrap justify-between items-center border-b border-white/10 tracking-wider">
        <div className="flex gap-6 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-primary" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-2 hidden sm:flex">
            <Mail size={12} className="text-primary" />
            <span>support@shyamagro.com</span>
          </div>
        </div>
        <div className="hidden md:block text-center flex-1">
          <span className="font-semibold text-white/80">FREE SHIPPING ON ALL ORDERS OVER ₹5000!</span>
        </div>
        <div className="flex gap-4 items-center font-semibold">
          <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
            <span>ENG</span>
            <ChevronDown size={10} />
          </div>
          <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors border-l border-white/20 pl-4">
            <span>INR</span>
            <ChevronDown size={10} />
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className={`w-full bg-white transition-all duration-300 z-50 ${isSticky ? 'fixed top-0 left-0 shadow-lg py-2' : 'relative py-6'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex justify-between items-center">
          
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-dark" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="Shyam Agro Tools logo" className="h-9 md:h-10 w-auto transition-transform group-hover:scale-105" />
            <h1 className="hidden sm:block text-lg md:text-xl font-black tracking-tight text-dark whitespace-nowrap">
              SHYAM AGRO<span className="text-primary"> TOOLS</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="relative text-sm font-bold tracking-widest text-dark hover:text-primary transition-colors duration-300 group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Functional Search Bar */}
            <div className="relative hidden md:block group/search">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-48 xl:w-64 py-2 pl-4 pr-10 rounded-full border border-gray-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs bg-gray-50 transition-all placeholder:text-gray-400 group-hover/search:border-primary/50"
              />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover/search:text-primary transition-colors" />
            </div>
            
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-2 text-dark hover:text-primary transition-all" onClick={() => user ? navigate('/account') : onLoginClick()}>
                <div className="bg-gray-50 p-2.5 rounded-full border border-gray-100 group-hover:border-primary/30 transition-colors">
                  <User size={18} />
                </div>
                {user && <span className="text-xs font-bold whitespace-nowrap hidden lg:block">{user.name.split(' ')[0]}</span>}
              </button>
              {user && (
                <div className="absolute right-0 top-full mt-4 w-48 bg-white shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase">Account info</p>
                    <p className="text-sm font-bold truncate">{user.name}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/track-order" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors">
                      <Package size={16} /> My Orders
                    </Link>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors">
                      <Wallet size={16} /> Wallet (₹{user.wallet})
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="text-dark hover:text-primary transition-all relative group">
              <div className="bg-gray-50 p-2.5 rounded-full border border-gray-100 group-hover:border-primary/30 transition-colors">
                <Heart size={18} />
              </div>
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">0</span>
            </button>

            {/* Redesigned Cart Section */}
            <div className="relative group">
              <div 
                onClick={() => navigate('/cart')}
                className="flex items-center gap-3 cursor-pointer group/cart"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg group-hover/cart:bg-dark transition-all duration-300">
                  <ShoppingBag size={20} strokeWidth={2.5} />
                </div>
                <div className="hidden xl:block">
                  <p className="text-[13px] font-bold text-dark leading-none mb-1">Shopping Cart</p>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">₹{cartSubtotal.toFixed(2)} - {cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
                </div>
              </div>

              {/* Cart Dropdown */}
              <div className="absolute right-0 top-full mt-4 w-80 bg-white shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-[100] transform translate-y-2 group-hover:translate-y-0 rounded-sm">
                <div className="p-6 max-h-[400px] overflow-y-auto">
                  {cartItems.length > 0 ? (
                    <div className="flex flex-col gap-5">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover border border-gray-100 rounded-sm" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-black text-dark uppercase truncate">{item.name}</h4>
                            <p className="text-[10px] text-primary font-black mt-1.5 bg-primary/5 px-2 py-0.5 rounded-full inline-block">{item.quantity} x ₹{item.price.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-[2px]">There are no items in your cart.</p>
                      <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {cartItems.length > 0 && (
                  <div className="p-5 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-gray-400 uppercase">Subtotal:</span>
                      <span className="text-lg font-black text-dark">₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => navigate('/cart')} className="btn-outline py-3 text-[10px] font-black uppercase">View Cart</button>
                      <button onClick={() => navigate('/checkout')} className="btn-primary py-3 text-[10px] font-black uppercase">Checkout</button>
                    </div>
                  </div>
                )}
                <div className="h-1 w-full bg-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-[80%] max-w-[300px] h-full bg-white z-[70] shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold">MENU</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className="text-lg font-bold tracking-widest text-dark hover:text-primary border-b border-gray-100 pb-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-10 flex flex-col gap-4">
                <button onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }} className="btn-primary w-full py-4">
                  {user ? 'MY ACCOUNT' : 'SIGN IN'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
