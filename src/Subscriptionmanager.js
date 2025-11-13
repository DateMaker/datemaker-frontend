import React, { useState } from 'react';
import { CreditCard, AlertCircle, Calendar, DollarSign, X } from 'lucide-react';

export default function SubscriptionManager({ user, userData, onClose, onShowTerms, onShowPrivacy }) {
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  
  const subscriptionStatus = userData?.subscriptionStatus || 'free';
  const trialEndsAt = userData?.trialEndsAt;
  const currentPeriodEnd = userData?.currentPeriodEnd;
  const willCancelAt = userData?.subscriptionWillCancelAt;

  // Calculate days remaining
  const daysRemaining = trialEndsAt 
    ? Math.ceil((new Date(trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleManageBilling = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/create-portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      
      // Redirect to Stripe billing portal
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem',
          borderBottom: '2px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CreditCard size={32} style={{ color: '#ec4899' }} />
            <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>
              Subscription Management
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          
          {/* Current Plan */}
          <div style={{
            background: subscriptionStatus === 'premium' 
              ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
              : subscriptionStatus === 'trial'
              ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
              : '#f3f4f6',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '2rem',
            border: subscriptionStatus === 'free' ? '2px dashed #d1d5db' : '2px solid #fbbf24'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {subscriptionStatus === 'trial' ? '🎉 Trial Plan' : 
                 subscriptionStatus === 'premium' ? '👑 Premium Plan' : 
                 '🆓 Free Plan'}
              </h3>
              <span style={{
                background: subscriptionStatus === 'premium' ? '#10b981' :
                            subscriptionStatus === 'trial' ? '#3b82f6' : '#6b7280',
                color: 'white',
                padding: '0.375rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {subscriptionStatus.toUpperCase()}
              </span>
            </div>

            {subscriptionStatus === 'trial' && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <Calendar size={18} style={{ color: '#3b82f6' }} />
                  <span style={{ fontWeight: '600' }}>
                    {daysRemaining} days remaining in trial
                  </span>
                </div>
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem',
                  color: '#4b5563'
                }}>
                  Trial ends: {new Date(trialEndsAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p style={{
                  margin: '0.75rem 0 0 0',
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  fontWeight: '600'
                }}>
                  💳 You'll be charged $9.99/month after trial ends
                </p>
              </>
            )}

            {subscriptionStatus === 'premium' && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <DollarSign size={18} style={{ color: '#10b981' }} />
                  <span style={{ fontWeight: '600' }}>$9.99/month</span>
                </div>
                {currentPeriodEnd && (
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.875rem',
                    color: '#4b5563'
                  }}>
                    Next billing date: {new Date(currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </>
            )}

            {subscriptionStatus === 'free' && (
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.875rem',
                color: '#4b5563'
              }}>
                Upgrade to unlock unlimited dates and premium features
              </p>
            )}

            {/* Cancellation notice */}
            {willCancelAt && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#fef2f2',
                borderRadius: '10px',
                border: '2px solid #fecaca'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={20} style={{ color: '#dc2626' }} />
                  <span style={{
                    color: '#dc2626',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    Subscription will cancel on {new Date(willCancelAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.875rem',
                  color: '#7f1d1d'
                }}>
                  You'll keep access until this date, then revert to Free plan.
                </p>
              </div>
            )}
          </div>

          {/* Manage Billing Button */}
          {(subscriptionStatus === 'trial' || subscriptionStatus === 'premium') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <button
                onClick={handleManageBilling}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                }}
              >
                <CreditCard size={20} />
                {loading ? 'Opening...' : 'Manage Subscription & Billing'}
              </button>

              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                textAlign: 'center',
                margin: 0
              }}>
                Update payment method, cancel subscription, or view invoices
              </p>

            </div>
          )}

          {/* Terms & Privacy Links */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '2px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              By subscribing, you agree to our{' '}
              <span
                onClick={onShowTerms}
                style={{ 
                  color: '#ec4899', 
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Terms of Service
              </span>
              {' '}and{' '}
              <span
                onClick={onShowPrivacy}
                style={{ 
                  color: '#ec4899', 
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Privacy Policy
              </span>
            </p>
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.75rem',
              color: '#9ca3af'
            }}>
              Payments processed securely by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}