import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import './BecomeSeller.css';

const BecomeSeller = () => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    category: '',
    mobile: '',
    email: '',
    gstin: '',
    address: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sellerId, setSellerId] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = 'SEL' + Math.floor(Math.random() * 1000000);
    setSellerId(id);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <Header onLoginClick={() => setIsLoginOpen(true)} />

      <main className="seller-page-container">
        <div className="seller-hero">
          <h1>Grow Your Business with Shyam Agro</h1>
          <p>Join India's most trusted industrial tools marketplace and reach millions of buyers.</p>
        </div>

        <div className="seller-content">
          {!submitted ? (
            <div className="form-card">
              <h2>Seller Registration</h2>
              <form onSubmit={handleSubmit} className="seller-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" required onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Business / Shop Name</label>
                    <input type="text" required onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Product Category</label>
                    <select required onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="">Select Category</option>
                      <option value="tools">Hand Tools</option>
                      <option value="agri">Agri Equipment</option>
                      <option value="power">Power Tools</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Mobile Number</label>
                    <input type="tel" required onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>GSTIN Number</label>
                    <input type="text" required onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
                  </div>
                </div>
                <div className="input-group full-width">
                  <label>Business Address</label>
                  <textarea required onChange={(e) => setFormData({ ...formData, address: e.target.value })}></textarea>
                </div>
                <button type="submit" className="submit-seller-btn">Register as Seller</button>
              </form>
            </div>
          ) : (
            <div className="success-card">
              <div className="success-icon">✅</div>
              <h2>Application Submitted Successfully!</h2>
              <p>We have sent your details to our support team. They will reach out to you within 24-48 hours for verification.</p>
              <div className="seller-id-box">
                <span>Your Request Tracking ID:</span>
                <strong>{sellerId}</strong>
              </div>
              <button className="back-home-btn" onClick={() => window.location.href = '/'}>Back to Home</button>
            </div>
          )}

          <aside className="seller-benefits">
            <h3>Why Sell on Agro?</h3>
            <div className="benefit-item">
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Zero Listing Fees</h4>
                <p>List your products for free and only pay when you sell.</p>
              </div>
            </div>
            <div className="benefit-item">
              <i className="fas fa-shipping-fast"></i>
              <div>
                <h4>Pan-India Delivery</h4>
                <p>Our logistics partners handle the pickup and delivery for you.</p>
              </div>
            </div>
            <div className="benefit-item">
              <i className="fas fa-headset"></i>
              <div>
                <h4>Dedicated Support</h4>
                <p>Get a personal account manager to help grow your business.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default BecomeSeller;
