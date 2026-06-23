import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import './TrackOrder.css';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    // Mock data for demo - if ID is "ORD123", show tracking. Else show empty.
    if (orderId.toUpperCase() === 'ORD123') {
      setTrackingData({
        status: 'In Transit',
        lastLocation: 'Nagpur Distribution Center',
        estDelivery: 'May 15, 2026',
        steps: [
          { label: 'Order Placed', date: 'May 10', completed: true },
          { label: 'Packed', date: 'May 11', completed: true },
          { label: 'Shipped', date: 'May 12', completed: true },
          { label: 'Out for Delivery', date: '-', completed: false },
        ]
      });
    } else {
      setTrackingData('not-found');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      
      <main className="track-page-container">
        <div className="track-card">
          <h1>Track Your Shipment</h1>
          <p>Enter your Order ID or Tracking Number to see real-time updates.</p>
          
          <form className="track-form" onSubmit={handleTrack}>
            <input 
              type="text" 
              placeholder="Enter Order ID (e.g. ORD123)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required 
            />
            <button type="submit" className="track-btn">Track Order</button>
          </form>

          {trackingData === 'not-found' && (
            <div className="no-orders-msg">
              <div className="empty-box-icon">📦</div>
              <h2>No active orders found!</h2>
              <p>It looks like you haven't placed any orders yet or the ID is incorrect.</p>
              <button className="shop-btn" onClick={() => navigate('/categories')}>Please shop to track the orders</button>
            </div>
          )}

          {trackingData && trackingData !== 'not-found' && (
            <div className="tracking-result">
              <div className="tracking-summary">
                <div className="summary-item">
                  <span>Current Status:</span>
                  <strong className="status-badge">{trackingData.status}</strong>
                </div>
                <div className="summary-item">
                  <span>Est. Delivery:</span>
                  <strong>{trackingData.estDelivery}</strong>
                </div>
              </div>

              <div className="tracking-timeline">
                {trackingData.steps.map((step, idx) => (
                  <div key={idx} className={`timeline-step ${step.completed ? 'completed' : ''}`}>
                    <div className="step-marker">
                      {step.completed ? <i className="fas fa-check"></i> : idx + 1}
                    </div>
                    <div className="step-info">
                      <h4>{step.label}</h4>
                      <span>{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default TrackOrder;
