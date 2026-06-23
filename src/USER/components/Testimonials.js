import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Quote } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "Professional Farmer",
      text: "The industrial tools from Shyam Agro have completely transformed my farming efficiency. The quality is top-notch and the service is excellent.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      name: "Anita Sharma",
      role: "Agro-Enterprise Owner",
      text: "I've been using their agricultural machinery for over a year now. Extremely durable and high-performing. Best value for money in the industrial market.",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      name: "Suresh Singh",
      role: "Workshop Owner",
      text: "Outstanding power tools. The performance is consistent even under heavy load. Highly recommend to any professional looking for reliable machinery.",
      image: "https://randomuser.me/api/portraits/men/67.jpg"
    }
  ];

  return (
    <section className="section-padding bg-light relative overflow-hidden">
      {/* Decorative Quote Icon Background */}
      <div className="absolute top-10 left-10 text-primary opacity-5">
        <Quote size={200} />
      </div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[4px] text-sm uppercase mb-2 block">Customer Reviews</span>
          <h2 className="text-3xl md:text-5xl font-bold text-dark">WHAT OUR CLIENTS SAY</h2>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 4000 }}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-16"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <div className="bg-white p-10 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center">
                <Quote size={40} className="text-primary/20 mb-6" />
                <p className="text-gray-600 italic mb-8 leading-relaxed">"{review.text}"</p>
                <div className="flex flex-col items-center">
                  <img src={review.image} alt={review.name} className="w-16 h-16 rounded-full border-4 border-light mb-4" />
                  <h4 className="font-bold text-dark uppercase tracking-wide">{review.name}</h4>
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">{review.role}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
