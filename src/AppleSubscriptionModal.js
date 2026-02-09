import React, { useState, useEffect } from 'react';
import { X, Crown, Calendar, Loader } from 'lucide-react';
import IAPManager from './IAPManager';
import { Browser } from '@capacitor/browser';

export default function AppleSubscriptionModal({ onClose, onPurchaseSuccess }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initIAP();
  }, []);

  const initIAP = async () => {
    try {
      setLoading(true);
      
      await IAPManager.initialize();
      
      const fetchedProducts = IAPManager.getProducts();
      console.log('📦 Products:', fetchedProducts);
      
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('IAP init error:', err);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId) => {
    setPurchasing(true);
    setError('');

    try {
      await IAPManager.purchase(productId);
      
      // Wait a moment for backend to process
      setTimeout(() => {
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
        
        // Show success message
        alert('🎉 Welcome to Premium! Your account has been upgraded.');
        
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    setError('');
    
    try {
      const hasSubscriptions = await IAPManager.restore();
      
      if (hasSubscriptions) {
        alert('✅ Purchases restored successfully! Your premium features are now active.');
        
        // Close modal and reload
        setTimeout(() => {
          if (onPurchaseSuccess) {
            onPurchaseSuccess();
          }
          onClose();
        }, 1000);
      } else {
        alert('⚠️ No purchases found to restore. If you previously subscribed, please contact support.');
      }
    } catch (err) {
      console.error('Restore error:', err);
      setError('Failed to restore purchases. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  // Open links in iOS Safari with back-to-app support
  const openLink = async (url) => {
    try {
      await Browser.open({ url });
    } catch (err) {
      // Fallback to regular link
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Loader size={48} style={{ margin: '0 auto 1rem', color: '#667eea' }} className="animate-spin" />
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 10
        }}>
          <X size={24} />
        </button>

        <div style={{ padding: '3rem 2rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '900',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Start Your Free Trial
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              7 days free, then subscribe. Cancel anytime.
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
              color: '#b91c1c',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Monthly Plan */}
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Calendar size={24} color="#667eea" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Monthly</h3>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '900' }}>$4.99</span>
                <span style={{ color: '#6b7280' }}>/month</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                after 7-day free trial
              </p>
            </div>

            <button
              onClick={() => handlePurchase('com.datemaker.premium.monthly')}
              disabled={purchasing}
              style={{
                width: '100%',
                padding: '1rem',
                background: purchasing ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: purchasing ? 'not-allowed' : 'pointer'
              }}
            >
              {purchasing ? 'Processing...' : 'Start Free Trial'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div style={{
            border: '3px solid #10b981',
            borderRadius: '16px',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            position: 'relative',
            marginBottom: '1rem'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '16px',
              background: '#fbbf24',
              color: '#78350f',
              padding: '0.375rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '800'
            }}>
              ⭐ SAVE 33%
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Crown size={24} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Annual</h3>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', textDecoration: 'line-through', color: '#9ca3af' }}>$59.99</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '900' }}>$39.99</span>
                <span style={{ color: '#6b7280' }}>/year</span>
              </div>
              <p style={{ color: '#065f46', fontSize: '0.875rem', margin: '0.5rem 0 0 0', fontWeight: '600' }}>
                Just $6.58/month after 7-day free trial
              </p>
            </div>

            <button
              onClick={() => handlePurchase('com.datemaker.premium.Yearly')}
              disabled={purchasing}
              style={{
                width: '100%',
                padding: '1rem',
                background: purchasing ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: purchasing ? 'not-allowed' : 'pointer'
              }}
            >
              {purchasing ? 'Processing...' : 'Start Free Trial - Best Value'}
            </button>
          </div>

          <button
            onClick={handleRestore}
            disabled={purchasing}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              color: '#667eea',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Restore Purchases
          </button>

          {/* Required Apple subscription disclosures */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '12px',
            fontSize: '0.7rem',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              Payment will be charged to your Apple ID account at confirmation of purchase after the 7-day free trial ends. 
              Subscription automatically renews unless cancelled at least 24 hours before the end of the current period. 
              Your account will be charged for renewal within 24 hours prior to the end of the current period.
            </p>
            <p style={{ margin: '0 0 0.75rem 0' }}>
              You can manage and cancel your subscriptions in your App Store account settings after purchase.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => openLink('https://thedatemakerapp.com/terms.html')}
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'underline', 
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.7rem'
                }}
              >
                Terms of Use
              </button>
              <button 
                onClick={() => openLink('https://thedatemakerapp.com/privacy.html')}
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'underline', 
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.7rem'
                }}
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}