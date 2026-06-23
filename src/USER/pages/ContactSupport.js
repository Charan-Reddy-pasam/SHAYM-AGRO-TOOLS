import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginPopup from '../components/LoginPopup';
import './ContactSupport.css';

const ContactSupport = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I am your Shyam Agro assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessages = [...messages, { text: inputText, sender: 'user' }];
    setMessages(newMessages);
    setInputText('');

    // Mock bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Thanks for your query. Our support team has been notified. Would you like to call us for immediate assistance?", 
        sender: 'bot' 
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      
      <main className="support-page-container">
        <div className="support-header">
          <h1>Customer Support</h1>
          <p>We're here to help you 24/7. Choose your preferred way to connect.</p>
        </div>

        <div className="support-layout">
          {/* Chat Bot Section */}
          <div className="chat-container">
            <div className="chat-header">
              <div className="bot-status">
                <span className="online-dot"></span>
                <strong>Agro Bot</strong>
              </div>
              <span className="chat-subtitle">Online</span>
            </div>
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Type your question here..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>

          {/* Quick Contact Sidebar */}
          <div className="contact-sidebar">
            <div className="call-card">
              <i className="fas fa-phone-alt"></i>
              <h3>Call Our Team</h3>
              <p>Speak directly with our technical experts.</p>
              <a href="tel:+919876543210" className="call-btn">+91 98765 43210</a>
              <span className="availability">Mon-Sat: 10AM - 7PM</span>
            </div>

            <div className="faq-preview">
              <h3>Quick Links</h3>
              <ul>
                <li><i className="fas fa-question-circle"></i> Tracking Policy</li>
                <li><i className="fas fa-undo"></i> Return & Refund</li>
                <li><i className="fas fa-shield-alt"></i> Warranty Claim</li>
                <li><i className="fas fa-file-invoice"></i> Download Invoice</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <LoginPopup isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default ContactSupport;
