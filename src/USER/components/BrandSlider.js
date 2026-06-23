import React from 'react';
import './BrandSlider.css';

const brands = [
  { id: 1, name: "Mahindra",    logo: "/brands/mahindra.svg",    color: "#c8102e" },
  { id: 2, name: "John Deere",  logo: "/brands/john-deere.svg",  color: "#367c2b" },
  { id: 3, name: "STIHL",       logo: "/brands/stihl.svg",       color: "#f47920" },
  { id: 4, name: "Honda",       logo: "/brands/honda.svg",       color: "#cc0000" },
  { id: 5, name: "Kubota",      logo: "/brands/kubota.svg",      color: "#e8560d" },
  { id: 6, name: "TAFE",        logo: "/brands/tafe.svg",        color: "#003087" },
  { id: 7, name: "New Holland", logo: "/brands/new-holland.svg", color: "#003DA5" },
  { id: 8, name: "Sonalika",    logo: "/brands/sonalika.svg",    color: "#e63312" },
  { id: 9, name: "Eicher",      logo: "/brands/eicher.svg",      color: "#c8102e" },
  { id: 10, name: "Husqvarna",  logo: "/brands/husqvarna.svg",   color: "#2563a8" },
];

// Duplicate the array so infinite loop looks seamless
const allBrands = [...brands, ...brands];

const BrandSlider = () => {
  return (
    <section className="brand-slider-section">
      <div className="brand-slider-header">
        <span className="brand-label">OUR TRUSTED BRANDS</span>
        <div className="brand-divider" />
      </div>

      <div className="brand-track-wrapper">
        <div className="brand-track">
          {allBrands.map((brand, index) => (
            <div key={`${brand.id}-${index}`} className="brand-card">
              <div className="brand-logo-wrap" style={{ '--brand-color': brand.color }}>
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="brand-logo-img"
                  onError={(e) => {
                    // Fallback: render brand name as styled text if logo fails
                    e.target.style.display = 'none';
                    e.target.parentNode.querySelector('.brand-fallback').style.display = 'flex';
                  }}
                />
                <div className="brand-fallback" style={{ color: brand.color }}>
                  {brand.name}
                </div>
              </div>
              <span className="brand-name">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;
