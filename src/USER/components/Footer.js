import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white font-poppins pt-20 pb-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        
        {/* About Section */}
        <div className="flex flex-col gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="Shyam Agro Tools logo" className="h-12 w-auto bg-white p-1 rounded-sm" />
            <h1 className="text-2xl font-bold tracking-tight">SHYAM AGRO</h1>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Leading marketplace for professional agricultural machinery and industrial equipment. We provide heavy-duty tools to farmers and enterprises across the country.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
              <FaFacebookF size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
              <FaTwitter size={18} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
              <FaInstagram size={18} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
              <FaYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold mb-8 border-l-4 border-primary pl-4">QUICK LINKS</h4>
          <ul className="flex flex-col gap-4 text-gray-400 text-sm">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link to="/categories" className="hover:text-primary transition-colors">Agriculture Store</Link></li>
            <li><Link to="/become-seller" className="hover:text-primary transition-colors">Become a Seller</Link></li>
            <li><Link to="/track-order" className="hover:text-primary transition-colors">Order Tracking</Link></li>
            <li><Link to="/blog" className="hover:text-primary transition-colors">Agriculture Blog</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-lg font-bold mb-8 border-l-4 border-primary pl-4">CUSTOMER SERVICE</h4>
          <ul className="flex flex-col gap-4 text-gray-400 text-sm">
            <li><Link to="/contact-support" className="hover:text-primary transition-colors">Help Center</Link></li>
            <li><Link to="/contact-support" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-bold mb-8 border-l-4 border-primary pl-4">GET IN TOUCH</h4>
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <MapPin className="text-primary flex-shrink-0" size={20} />
              <p className="text-gray-400 text-sm">Industrial Area Phase-7, Mohali, Punjab, India - 160055</p>
            </div>
            <div className="flex gap-4">
              <Phone className="text-primary flex-shrink-0" size={20} />
              <p className="text-gray-400 text-sm">+91 98765 43210</p>
            </div>
            <div className="flex gap-4">
              <Mail className="text-primary flex-shrink-0" size={20} />
              <p className="text-gray-400 text-sm">support@shyamagro.com</p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold mb-4">NEWSLETTER</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="bg-white/10 border-none px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none flex-1"
                />
                <button className="bg-primary px-4 py-3 hover:bg-[#5eaa28] transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 pt-10 mx-4 md:mx-20 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-500 text-xs">
          © 2026 <span className="text-white font-bold">SHYAM AGRO TOOLS</span>. All Rights Reserved.
        </p>
        <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 w-auto" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 w-auto" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="Paypal" className="h-4 w-auto" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
