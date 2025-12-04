// Subscribe.js - Web payment page for thedatemakerapp.com/#/subscribe
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import { Heart, Mail, Lock, LogOut, Check, Crown, Calendar } from 'lucide-react';

const Subscribe = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
          plan: plan,
          userId: user.uid,
          email: user.email
        })
      });

      const data = await response.json();
      
      if (data.url) {
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Heart size={48} color="white" fill="white" style={{ animation: 'pulse 1.5s infinite' }} />
          <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <Heart size={36} color="#ec4899" fill="#ec4899" />
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '900',
              background: 'linear-gradient(to right, #ec4899, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              DateMaker
            </h1>
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            {user ? 'Choose Your Plan' : 'Sign In to Subscribe'}
          </h2>
        </div>
        
        {!user ? (
          /* ═══════════════ LOGIN FORM ═══════════════ */
          <div>
            <p style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              Sign in with your DateMaker account to subscribe
            </p>
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: '#f9fafb'
                }}>
                  <Mail size={20} color="#6b7280" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontSize: '1rem',
                      outline: 'none',
                      color: '#111827'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: '#f9fafb'
                }}>
                  <Lock size={20} color="#6b7280" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontSize: '1rem',
                      outline: 'none',
                      color: '#111827'
                    }}
                  />
                </div>
              </div>
              
              {error && (
                <div style={{
                  padding: '1rem',
                  background: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  textAlign: 'center',
                  marginBottom: '1rem',
                  fontWeight: '600'
                }}>
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(to right, #ec4899, #a855f7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            
            <p style={{
              textAlign: 'center',
              color: '#9ca3af',
              marginTop: '1.5rem',
              fontSize: '0.875rem'
            }}>
              Don't have an account?{' '}
              <a 
                href="/#/" 
                style={{ color: '#ec4899', fontWeight: '600', textDecoration: 'none' }}
              >
                Download the app
              </a>
            </p>
          </div>
        ) : (
          /* ═══════════════ PRICING PLANS ═══════════════ */
          <div>
            {/* User Info Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#f0fdf4',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              border: '2px solid #86efac'
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534', fontWeight: '600' }}>
                  Signed in as
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#15803d' }}>
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => signOut(auth)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'white',
                  border: '2px solid #86efac',
                  borderRadius: '8px',
                  color: '#166534',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>

            {/* Savings Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '1rem',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '1.5rem',
              border: '2px solid #fbbf24'
            }}>
              <p style={{ margin: 0, fontWeight: '700', color: '#92400e', fontSize: '1rem' }}>
                💰 Save 30% compared to App Store prices!
              </p>
            </div>

            {/* Plans */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Monthly Plan */}
              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <Calendar size={24} color="#667eea" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Monthly</h3>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827' }}>$6.99</span>
                  <span style={{ color: '#6b7280', fontSize: '1rem' }}>/month</span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  {['Unlimited date generation', 'All premium features', 'Cancel anytime'].map((feature, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <Check size={18} color="#10b981" />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => handleSubscribe('monthly')}
                  disabled={checkoutLoading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: checkoutLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: checkoutLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {checkoutLoading ? 'Loading...' : 'Subscribe Monthly'}
                </button>
              </div>

              {/* Yearly Plan */}
              <div style={{
                border: '3px solid #10b981',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
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
                  ⭐ BEST VALUE
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <Crown size={24} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Yearly</h3>
                </div>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem', textDecoration: 'line-through', color: '#9ca3af' }}>$83.88</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#111827', marginLeft: '0.5rem' }}>$49.99</span>
                  <span style={{ color: '#6b7280', fontSize: '1rem' }}>/year</span>
                </div>
                
                <p style={{
                  color: '#059669',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  margin: '0 0 1rem 0'
                }}>
                  Save $33.89/year - Just $4.17/month!
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  {['Everything in Monthly', '2 months FREE', 'Priority feature access'].map((feature, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <Check size={18} color="#10b981" />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => handleSubscribe('yearly')}
                  disabled={checkoutLoading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: checkoutLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: checkoutLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {checkoutLoading ? 'Loading...' : 'Subscribe Yearly - Best Value'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '1rem',
                background: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '12px',
                color: '#dc2626',
                textAlign: 'center',
                marginTop: '1rem',
                fontWeight: '600'
              }}>
                {error}
              </div>
            )}

            {/* Trust badges */}
            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              <p style={{ margin: 0 }}>
                ✅ 7-Day Free Trial • 🔒 Secure Payment • 🔄 Cancel Anytime
              </p>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Subscribe;