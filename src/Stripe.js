import { loadStripe } from '@stripe/stripe-js';
import { auth } from './firebase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const createCheckoutSession = async (plan) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const isNative = Capacitor.isNativePlatform();
    console.log('📱 Platform detected:', isNative ? 'native' : 'web');

    const token = await user.getIdToken();

    if (isNative) {
      console.log('📱 iOS: Creating web checkout session...');
      
      const response = await fetch(`${API_URL}/api/create-web-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.uid,
          plan: plan,
          email: user.email
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      console.log('🌐 Opening Stripe checkout:', url);
      
      await Browser.open({ 
        url: url,
        windowName: '_blank'
      });
      
      return;
    }

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
        platform: 'web'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    window.location.href = url;

  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/api/subscription-status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get subscription status');
    return await response.json();
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
};

export const cancelSubscription = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/api/cancel-subscription`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
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
