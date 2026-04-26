import React, { useState } from 'react';
import { MessageCircle, X, Truck, MapPin, Send } from 'lucide-react';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // WhatsApp Number 
  const phoneNumber = "919672911519"; 

  const handleRedirect = (text) => {
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="whatsapp-widget-container">
      {isOpen && (
        <div className="whatsapp-box">
          <div className="whatsapp-header">
            <div className="whatsapp-header-info">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp" style={{ width: '24px', height: '24px' }} />
              <h4>WhatsApp Services</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X size={18} />
            </button>
          </div>
          <div className="whatsapp-body">
            <p className="whatsapp-greeting">Hi there! How can we help you today?</p>
            <div className="whatsapp-options">
              <button 
                onClick={() => handleRedirect("Hi")} 
                className="wa-btn secondary"
              >
                <Send size={18} />
                <span>Start Chat (Say Hi)</span>
              </button>
              <button 
                onClick={() => handleRedirect("Request Tanker")} 
                className="wa-btn"
              >
                <Truck size={18} />
                <span>Request Tanker</span>
              </button>
              <button 
                onClick={() => handleRedirect("Track Tanker")} 
                className="wa-btn"
              >
                <MapPin size={18} />
                <span>Track Tanker</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isOpen && (
        <button className="whatsapp-floating-btn" onClick={() => setIsOpen(true)}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp" style={{ width: '36px', height: '36px' }} />
        </button>
      )}
    </div>
  );
};

export default WhatsAppWidget;
