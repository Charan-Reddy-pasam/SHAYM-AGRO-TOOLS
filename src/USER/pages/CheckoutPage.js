import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, cartSubtotal } = useCart();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    paymentMethod: 'cod'
  });

  const deliveryCharge = cartSubtotal > 5000 ? 0 : 250;
  const gst = Math.round(cartSubtotal * 0.18);
  const grandTotal = cartSubtotal + deliveryCharge + gst;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Order Placed Successfully! Redirecting to tracking...');
    navigate('/track-order');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      
      <main className="checkout-container">
        <div className="checkout-header">
          <h1>Secure Checkout</h1>
          <p>Complete your purchase by providing your shipping and billing information.</p>
        </div>

        <div className="checkout-layout">
          {/* Shipping Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit}>
              <div className="checkout-card">
                <h3><i className="fas fa-shipping-fast"></i> Shipping Information</h3>
                <div className="form-row">
                  <div className="input-group">
                    <label>First Name *</label>
                    <input type="text" name="firstName" required onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label>Last Name *</label>
                    <input type="text" name="lastName" required onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Email Address *</label>
                    <input type="email" name="email" required onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label>Phone Number *</label>
                    <input type="tel" name="phone" required onChange={handleInputChange} />
                  </div>
                </div>
                <div className="input-group full-width">
                  <label>Full Address *</label>
                  <textarea name="address" required onChange={handleInputChange} rows="3"></textarea>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>City *</label>
                    <input type="text" name="city" required onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label>State *</label>
                    <input type="text" name="state" required onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label>Pincode *</label>
                    <input type="text" name="zip" required onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="checkout-card payment-card">
                <h3><i className="fas fa-credit-card"></i> Payment Method</h3>
                <div className="payment-options">
                  <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    <div className="pay-icon"><i className="fas fa-money-bill-wave"></i></div>
                    <div className="pay-text">
                      <strong>Cash on Delivery</strong>
                      <span>Pay when you receive the tools</span>
                    </div>
                  </label>
                  <label className={`payment-option ${formData.paymentMethod === 'online' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleInputChange}
                    />
                    <div className="pay-icon"><i className="fas fa-university"></i></div>
                    <div className="pay-text">
                      <strong>Net Banking / UPI</strong>
                      <span>Secure online payment</span>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="place-order-btn">
                Confirm & Place Order ₹{grandTotal.toLocaleString()}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-summary-section">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="s-item-img">
                      <img src={item.image} alt={item.displayName} />
                      <span className="s-item-qty">{item.quantity}</span>
                    </div>
                    <div className="s-item-info">
                      <h4>{item.displayName}</h4>
                      <span>SKU: {item.sku}</span>
                    </div>
                    <div className="s-item-price">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>GST (18%)</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span className={deliveryCharge === 0 ? 'free' : ''}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="grand-total-row">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="trust-badges">
                <div className="badge">
                  <i className="fas fa-shield-alt"></i>
                  <span>SSL Secure</span>
                </div>
                <div className="badge">
                  <i className="fas fa-undo"></i>
                  <span>7 Days Return</span>
                </div>
                <div className="badge">
                  <i className="fas fa-headset"></i>
                  <span>Expert Support</span>
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

export default CheckoutPage;
