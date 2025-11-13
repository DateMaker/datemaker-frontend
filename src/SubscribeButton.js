import React, { useState } from 'react';
import { createCheckoutSession } from './Stripe';  
import './SubscribeButton.css';

export default function SubscribeButton({ plan, price, label }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await createCheckoutSession(plan);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSubscribe}
      disabled={loading}
      className="subscribe-button"
    >
      {loading ? 'Loading...' : `${label} - ${price}`}
    </button>
  );
}