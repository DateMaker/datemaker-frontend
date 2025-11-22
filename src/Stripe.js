import { loadStripe } from '@stripe/stripe-js';
import { auth } from './firebase';
import { Capacitor } from '@capacitor/core';

// Load Stripe (using your publishable key from .env)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Backend API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create checkout session
export const createCheckoutSession = async (plan) => {
  try {
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get Firebase ID token for authentication
    const token = await user.getIdToken();

    // Detect if running on iOS native app
    const platform = Capacitor.isNativePlatform() ? 'ios' : 'web';
    console.log('📱 Platform detected:', platform);

    // Call your backend to create checkout session
    const response = await fetch(`${API_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: user.uid,      
        plan: plan,
        email: user.email,
        platform: platform
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = url;

  } catch (error) {
    console.error('Stripe checkout error:', error);
    alert(`Payment error: ${error.message}`);
  }
};

// Get subscription status
export const getSubscriptionStatus = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();

    const response = await fetch(`${API_URL}/api/subscription-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
};

// Cancel subscription
export const cancelSubscription = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const response = await fetch(`${API_URL}/api/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
};

export default stripePromise;