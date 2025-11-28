// Subscribe.js - Web payment page for thedatemakerapp.com/subscribe
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';

const Subscribe = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Your backend URL
  const API_URL = 'https://datemaker-backend-1.onrender.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const handleSubscribe = async (plan) => {
    if (!user) return;
    
    setCheckoutLoading(true);
    
    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`${API_URL}/api/create-web-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: plan, // 'monthly' or 'yearly'
          userId: user.uid,
          email: user.email
        })
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Something went wrong. Please try again.');
    }
    
    setCheckoutLoading(false);
  };

  if (loading) {
    return (
      <div className="subscribe-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="subscribe-container">
      <div className="subscribe-card">
        <img src="/logo.png" alt="DateMaker" className="logo" />
        <h1>DateMaker Premium</h1>
        
        {!user ? (
          // Login Form
          <div className="login-section">
            <p>Sign in with your DateMaker account to subscribe</p>
            
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : (
          // Pricing Plans
          <div className="pricing-section">
            <p className="welcome">Welcome, {user.email}</p>
            <button className="sign-out" onClick={() => signOut(auth)}>
              Sign out
            </button>

            <h2>Choose Your Plan</h2>
            <p className="savings-note">💰 Save 30% compared to App Store prices!</p>

            <div className="plans">
              {/* Monthly Plan */}
              <div className="plan-card">
                <h3>Monthly</h3>
                <div className="price">
                  <span className="amount">$6.99</span>
                  <span className="period">/month</span>
                </div>
                <ul>
                  <li>✓ Unlimited date generation</li>
                  <li>✓ All premium activities</li>
                  <li>✓ Priority support</li>
                  <li>✓ No ads</li>
                </ul>
                <button 
                  onClick={() => handleSubscribe('monthly')}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Loading...' : 'Subscribe Monthly'}
                </button>
              </div>

              {/* Yearly Plan */}
              <div className="plan-card featured">
                <div className="badge">Best Value</div>
                <h3>Yearly</h3>
                <div className="price">
                  <span className="amount">$49.99</span>
                  <span className="period">/year</span>
                </div>
                <p className="save-text">Save $33.89/year</p>
                <ul>
                  <li>✓ Everything in Monthly</li>
                  <li>✓ 2 months FREE</li>
                  <li>✓ Exclusive features</li>
                </ul>
                <button 
                  onClick={() => handleSubscribe('yearly')}
                  disabled={checkoutLoading}
                  className="featured-btn"
                >
                  {checkoutLoading ? 'Loading...' : 'Subscribe Yearly'}
                </button>
              </div>
            </div>

            {error && <p className="error">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribe;