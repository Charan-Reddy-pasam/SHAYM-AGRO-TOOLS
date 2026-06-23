import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, X, Clock, Tag } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'sat_blogs';

const DEFAULT_BLOGS = [
  {
    id: '1',
    title: "Essential Tips for Soil Preparation",
    category: "Agriculture",
    author: "Admin",
    date: "2026-05-12",
    excerpt: "Learn the professional secrets to preparing your soil for the upcoming farming season to maximize yield...",
    description: "Preparing soil is the single most critical step to ensure a high-yielding harvest. This guide details how to test soil pH, add organic fertilizers, choose the correct compost, till the field, and set up moisture retention beds. In India, clayey and sandy loam soils require different tillage frequencies and organic matter density. Follow these simple guidelines to make sure your field is ready for seed sowing.",
    image: "https://images.unsplash.com/photo-1416870230247-d0efca95654e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '2',
    title: "Maintaining Your Power Tools",
    category: "Equipment",
    author: "Agri Expert",
    date: "2026-05-10",
    excerpt: "A comprehensive guide on how to clean and maintain your industrial power tools for longevity and safety...",
    description: "Agricultural power equipment like reapers, tillers, and weeders represent significant capital investments. Proper routine maintenance prevents costly breakdowns during peak harvesting periods. Clean fuel lines, inspect spark plugs, sharpen cutters, grease joint pivots, and clean out debris after every single run. Store machinery in clean dry sheds to avoid rusting.",
    image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: '3',
    title: "Modern Irrigation Techniques",
    category: "Irrigation",
    author: "Editor",
    date: "2026-05-08",
    excerpt: "Exploring the latest water-saving irrigation systems that are revolutionizing modern agriculture in India...",
    description: "Water scarcity is an ever-increasing challenge for Indian farmers. Micro-sprinklers, sub-surface drip irrigation lines, and smart IoT soil moisture sensors are changing how water is distributed. By targeted delivery directly to the root zone, evaporation losses are cut by 60%, and crop vigor is improved due to uniform watering. Learn about cost-effective installations and state subsidies available for drip lines.",
    image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=800"
  }
];

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        setBlogs(JSON.parse(cached));
      } catch (e) {
        setBlogs(DEFAULT_BLOGS);
      }
    } else {
      setBlogs(DEFAULT_BLOGS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BLOGS));
    }
  }, []);

  // Format date to local readable format e.g., "May 12, 2026"
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <section className="section-padding bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[4px] text-sm uppercase mb-2 block">Latest News & Tips</span>
          <h2 className="text-3xl md:text-5xl font-bold text-dark uppercase">From Our Blog</h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full"
              onClick={() => setSelectedBlog(blog)}
            >
              <div className="relative overflow-hidden aspect-video">
                <img 
                  src={blog.image || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=800"} 
                  alt={blog.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3.5 py-1.5 uppercase tracking-widest shadow-md rounded-md">
                  {blog.category || 'General'}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex gap-4 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-primary" />
                    By {blog.author || 'Admin'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    {formatDate(blog.date)}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3 flex-grow">
                  {blog.excerpt || blog.description}
                </p>
                
                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <button className="flex items-center gap-2 text-dark font-extrabold text-xs uppercase tracking-widest hover:text-primary transition-colors group/btn">
                    Read Full Article <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-2 text-primary" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {blogs.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              No blog articles published yet. Check back soon!
            </div>
          )}
        </div>
      </div>

      {/* Blog Article Reader Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBlog(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col z-10"
            >
              {/* Header/Banner Image */}
              <div className="relative aspect-[21/9] overflow-hidden flex-shrink-0">
                <img 
                  src={selectedBlog.image || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=800"} 
                  alt={selectedBlog.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/40 hover:bg-slate-900/70 text-white rounded-full transition-colors backdrop-blur-sm border border-white/20"
                >
                  <X size={18} />
                </button>

                {/* Banner Text overlay */}
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider mb-2">
                    <Tag size={10} /> {selectedBlog.category || 'General'}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black leading-tight drop-shadow-sm">
                    {selectedBlog.title}
                  </h2>
                </div>
              </div>

              {/* Body Content */}
              <div className="overflow-y-auto p-6 md:p-8 space-y-6">
                {/* Meta details */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-primary" />
                    Written by: <span className="text-slate-700">{selectedBlog.author || 'Admin'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" />
                    Published: <span className="text-slate-700">{formatDate(selectedBlog.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    Read time: <span className="text-slate-700">3 mins read</span>
                  </div>
                </div>

                {/* Excerpt panel */}
                {selectedBlog.excerpt && (
                  <p className="text-slate-500 font-medium text-sm leading-relaxed border-l-4 border-primary pl-4 py-1 italic bg-slate-50/50 rounded-r-lg">
                    "{selectedBlog.excerpt}"
                  </p>
                )}

                {/* Paragraph Description */}
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line space-y-4 font-normal">
                  {selectedBlog.description}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end flex-shrink-0 rounded-b-3xl">
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default BlogSection;
