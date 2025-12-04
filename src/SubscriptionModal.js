import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Crown, Calendar, Users, Camera, Gift, TrendingUp, Shield, Star, ExternalLink, Copy } from 'lucide-react';
import { createCheckoutSession } from './Stripe';
import { Capacitor } from '@capacitor/core';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function SubscriptionModal({ user, onClose }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [copied, setCopied] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Poll Firebase for subscription changes when loading (after checkout starts)
  useEffect(() => {
    let interval;
    let maxTimeout;
    
    if (loading && user) {
      // Start polling after 3 seconds (give Stripe time to process)
      const startPolling = setTimeout(() => {
        interval = setInterval(async () => {
          try {
            console.log('🔄 Polling for subscription status...');
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const status = userDoc.data().subscriptionStatus;
              console.log('📊 Current status:', status);
              
              if (status === 'trial' || status === 'premium') {
                console.log('✅ Subscription detected! Closing modal...');
                clearInterval(interval);
                clearTimeout(maxTimeout);
                setLoading(false);
                onClose();
              }
            }
          } catch (error) {
            console.error('Error checking subscription:', error);
          }
        }, 3000); // Check every 3 seconds
      }, 3000);
      
      // Stop polling after 2 minutes
      maxTimeout = setTimeout(() => {
        console.log('⏰ Polling timeout reached');
        if (interval) clearInterval(interval);
        setLoading(false);
      }, 120000);
      
      return () => {
        clearTimeout(startPolling);
        if (interval) clearInterval(interval);
        if (maxTimeout) clearTimeout(maxTimeout);
      };
    }
  }, [loading, user, onClose]);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      await createCheckoutSession(plan);
      // Don't setLoading(false) here - polling will handle it
    } catch (error) {
      console.error('Subscription error:', error);
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://thedatemakerapp.com/#/subscribe');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ═══════════════════════════════════════════════════════════════
  // 📱 iOS NATIVE APP - SPOTIFY-STYLE MESSAGE (No in-app payments)
  // ═══════════════════════════════════════════════════════════════
  if (isNative) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1.5rem',
        overflow: 'auto'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          maxWidth: '500px',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <X size={20} color="#374151" />
          </button>

          {/* Hero Section */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '3rem 2rem 2rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              marginBottom: '0.75rem',
              lineHeight: '1.3'
            }}>
              You can't upgrade to Premium in the app
            </h1>
            <p style={{
              fontSize: '1.1rem',
              opacity: 0.9,
              margin: 0
            }}>
              We know, it's not ideal.
            </p>
          </div>

          {/* Content Section */}
          <div style={{ padding: '2rem' }}>
            
            {/* Instructions */}
            <div style={{
              background: '#f0f9ff',
              border: '2px solid #bae6fd',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '1rem',
                color: '#0c4a6e',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                To subscribe, visit this link in Safari or any browser:
              </p>
              
              <div style={{
                background: 'white',
                border: '2px solid #0ea5e9',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <ExternalLink size={20} color="#0ea5e9" />
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#0c4a6e'
                }}>
                  thedatemakerapp.com/#/subscribe
                </span>
              </div>

              <button
                onClick={handleCopyLink}
                style={{
                  background: copied ? '#10b981' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.875rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
              >
                {copied ? (
                  <>
                    <Check size={20} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={20} />
                    Copy Link
                  </>
                )}
              </button>
            </div>

            {/* What You'll Get */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                🎉 What you'll unlock:
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem'
              }}>
                {[
                  { icon: '♾️', text: 'Unlimited Dates' },
                  { icon: '📅', text: 'Full Itineraries' },
                  { icon: '🔥', text: 'Date Streaks' },
                  { icon: '📸', text: 'Memory Scrapbook' },
                  { icon: '🎁', text: 'Surprise Mode' },
                  { icon: '👥', text: 'Social Features' },
                  { icon: '⭐', text: 'XP & Achievements' },
                  { icon: '💬', text: 'Priority Support' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Info */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, fontWeight: '700', color: '#92400e' }}>
                ✨ Go to Our Website To Start Today! 
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#a16207' }}>
                Its up from here
              </p>
            </div>

            {/* Already Subscribed Note */}
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0
            }}>
              Already subscribed on our website?<br />
              <strong>Your premium features will activate automatically!</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 🌐 WEB VERSION - NORMAL STRIPE CHECKOUT (unchanged)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '2rem',
      overflow: 'auto'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: loading ? '#e5e7eb' : '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'white',
          borderRadius: '24px 24px 0 0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            marginBottom: '0.5rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Start Your 7-Day FREE Trial
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: 0.95,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Get unlimited access to all premium features. Cancel anytime, no questions asked.
          </p>
        </div>

        {/* What You'll Get Section */}
        <div style={{
          padding: '2rem',
          background: 'linear-gradient(to bottom, #f9fafb, white)'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#111827'
          }}>
            What You'll Get
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: '900px',
            margin: '0 auto 3rem'
          }}>
            {[
              { icon: <Zap size={24} />, title: 'Unlimited Date Generation', desc: 'Create as many perfect dates as you want' },
              { icon: <Calendar size={24} />, title: 'Complete Itineraries', desc: 'Full day planning from start to finish' },
              { icon: <TrendingUp size={24} />, title: 'Date Streaks & Goals', desc: 'Track your progress and set goals' },
              { icon: <Camera size={24} />, title: 'Memory Scrapbook', desc: 'Save photos and rate your experiences' },
              { icon: <Gift size={24} />, title: 'Surprise Date Mode', desc: 'Progressive reveal for mystery dates' },
              { icon: <Users size={24} />, title: 'Social Features', desc: 'Share dates, create groupchats and connect with friends' },
              { icon: <Star size={24} />, title: 'XP & Achievements', desc: 'Level up' },
              { icon: <Shield size={24} />, title: 'Priority Support', desc: 'Get help from our team anytime' }
            ].map((feature, idx) => (
              <div key={idx} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                display: 'flex',
                gap: '1rem',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem', color: '#111827' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Monthly Plan */}
            <div style={{
              background: 'white',
              border: selectedPlan === 'monthly' ? '3px solid #667eea' : '2px solid #e5e7eb',
              borderRadius: '20px',
              padding: '2rem',
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
            onClick={() => !loading && setSelectedPlan('monthly')}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  padding: '0.5rem',
                  borderRadius: '10px'
                }}>
                  <Calendar size={20} style={{ color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Monthly</h3>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: '900', color: '#111827' }}>$9.99</span>
                  <span style={{ fontSize: '1.125rem', color: '#6b7280' }}>/ month</span>
                </div>
                <div style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginTop: '0.5rem',
                  display: 'inline-block'
                }}>
                  Just $0.33/day!
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                {[
                  'Unlimited date generation',
                  'All premium features',
                  'Cancel anytime',
                  'Priority support'
                ].map((feature, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <Check size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.95rem', color: '#374151' }}>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe('monthly');
                }}
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Processing...' : 'Start Free Trial →'}
              </button>
            </div>

            {/* Annual Plan */}
            <div style={{
              background: selectedPlan === 'annual' ? 'linear-gradient(135deg, #10b981, #059669)' : 'white',
              border: selectedPlan === 'annual' ? 'none' : '2px solid #e5e7eb',
              borderRadius: '20px',
              padding: '2rem',
              position: 'relative',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              color: selectedPlan === 'annual' ? 'white' : '#111827',
              opacity: loading ? 0.7 : 1
            }}
            onClick={() => !loading && setSelectedPlan('annual')}
            >
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: '#fbbf24',
                color: '#78350f',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: '900',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
              }}>
                ⭐ SAVE 33%
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: selectedPlan === 'annual' ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #10b981, #059669)',
                  padding: '0.5rem',
                  borderRadius: '10px'
                }}>
                  <Crown size={20} style={{ color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Annual</h3>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '1.5rem',
                    textDecoration: 'line-through',
                    opacity: 0.6
                  }}>
                    $119
                  </span>
                  <span style={{ fontSize: '3rem', fontWeight: '900' }}>$79</span>
                  <span style={{ fontSize: '1.125rem', opacity: 0.8 }}>/ year</span>
                </div>
                <div style={{
                  background: selectedPlan === 'annual' ? 'rgba(255,255,255,0.2)' : '#d1fae5',
                  color: selectedPlan === 'annual' ? 'white' : '#065f46',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  marginTop: '0.5rem',
                  display: 'inline-block'
                }}>
                  Just $6.58/month - Save $40!
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                {[
                  'Everything in Monthly',
                  'Save $40 per year',
                  'Priority feature access'
                ].map((feature, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <Check size={20} style={{
                      color: selectedPlan === 'annual' ? 'white' : '#10b981',
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontSize: '0.95rem',
                      color: selectedPlan === 'annual' ? 'white' : '#374151'
                    }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe('annual');
                }}
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#9ca3af' : (selectedPlan === 'annual' ? 'white' : 'linear-gradient(135deg, #10b981, #059669)'),
                  color: loading ? 'white' : (selectedPlan === 'annual' ? '#059669' : 'white'),
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Processing...' : 'Get Annual - Best Value →'}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div style={{
            marginTop: '3rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            <p style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: '#111827' }}>
              ✅ 7-Day Free Trial • 🔒 Secure Payment • 🔄 Cancel Anytime
            </p>
            <p style={{ margin: 0 }}>
              Join now T&Cs apply
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}