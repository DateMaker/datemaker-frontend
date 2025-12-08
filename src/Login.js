import React, { useState, useEffect } from 'react';
import { Heart, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function Login({ onSwitchToSignup, onContinueAsGuest }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  
  // Forgot password states
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  // Pre-fill email and check for subscribe intent from iOS app
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get('email');
  const subscribeIntent = params.get('subscribe');
  
  // Check for URL parameter email
  if (emailParam) {
    setEmail(emailParam);
  }
  
  // Check for localStorage email (from profile "Sign In With Premium" button)
  const savedEmail = localStorage.getItem('datemaker_prefill_email');
  if (savedEmail) {
    setEmail(savedEmail);
    // Clear it after using it
    localStorage.removeItem('datemaker_prefill_email');
    console.log('📧 Pre-filled email from localStorage:', savedEmail);
  }
  
  // Store subscribe intent for after login
  if (subscribeIntent === 'true') {
    sessionStorage.setItem('openSubscribeAfterLogin', 'true');
  }
}, []);

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    setResetError('');
    setResetSuccess(false);
    
    if (!email.trim()) {
      setResetError('Please enter your email address first');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResetError('Please enter a valid email address');
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setResetSuccess(true);
      console.log('✅ Password reset email sent to:', email);
      
      // Auto-hide success message after 10 seconds
      setTimeout(() => {
        setResetSuccess(false);
      }, 10000);
      
    } catch (err) {
      console.error('❌ Password reset error:', err);
      
      switch (err.code) {
        case 'auth/user-not-found':
          // Don't reveal if email exists for security
          setResetSuccess(true); // Show success anyway for security
          break;
        case 'auth/too-many-requests':
          setResetError('Too many requests. Please wait a few minutes and try again.');
          break;
        case 'auth/invalid-email':
          setResetError('Invalid email address');
          break;
        default:
          setResetError('Failed to send reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (cooldownTime > 0) {
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await sendEmailVerification(user);
      await auth.signOut();
      
      setResendSuccess(true);
      setCooldownTime(60);
      console.log('✅ Verification email resent successfully');
      
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error('❌ Error resending verification email:', err);
      
      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
        setCooldownTime(120);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid password. Please check your password and try again.');
      } else {
        setError('Failed to resend verification email. Please try again later.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResendSuccess(false);
    setResetSuccess(false);
    setResetError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('🔐 User logged in, checking verification...');
      console.log('📧 Email verified:', user.emailVerified);

      if (!user.emailVerified) {
        console.log('⚠️ Email NOT verified - showing banner');
        setNeedsVerification(true);
        setError('Please verify your email before logging in. Check your inbox and spam folder.');
        setLoading(false);
        return;
      }

      console.log('✅ Email verified! Proceeding with login...');

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          console.log('📝 User document not found - creating it now');
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            subscriptionStatus: 'free',
            createdAt: new Date().toISOString(),
            uid: user.uid,
            emailVerified: true
          });
        }
      } catch (firestoreError) {
        console.error('Firestore error (non-critical):', firestoreError);
      }

      console.log('✅ Login successful!');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please wait a few minutes and try again.');
          break;
        default:
          setError(err.message || 'Failed to login. Please try again.');
      }
      setNeedsVerification(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', 
      padding: '2rem',
      paddingTop: 'calc(2rem + env(safe-area-inset-top))'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '3rem', 
        borderRadius: '24px', 
        maxWidth: '450px', 
        width: '100%', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Heart style={{ color: '#ec4899', margin: '0 auto 1rem' }} size={48} fill="currentColor" />
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(to right, #ec4899, #a855f7)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#6b7280' }}>Sign in to find your perfect date</p>
        </div>

{/* ═══════════════════════════════════════════════════════════════ */}
        {/* 🚀 CONTINUE AS GUEST BUTTON - For App Store Compliance */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {onContinueAsGuest && (
          <button
            onClick={onContinueAsGuest}
            type="button"
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(59,130,246,0.3)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            🗺️ Explore Without Account
          </button>
        )}

        {onContinueAsGuest && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>or sign in</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>
        )}

        {/* 📧 EMAIL VERIFICATION BANNER */}
        {needsVerification && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '3px solid #fbbf24',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '2rem', flexShrink: 0 }}>📧</div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: '#92400e',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  marginBottom: '0.5rem',
                  margin: 0
                }}>
                  Email Not Verified
                </h3>
                <p style={{
                  color: '#78350f',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  margin: '0.5rem 0'
                }}>
                  Please check your email inbox for a verification link.
                </p>
                <div style={{
                  background: 'rgba(251, 191, 36, 0.2)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginTop: '0.75rem'
                }}>
                  <p style={{
                    color: '#78350f',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    ⚠️ Check your SPAM/JUNK folder!
                  </p>
                </div>
              </div>
            </div>

            {resendSuccess && (
              <div style={{
                background: '#d1fae5',
                border: '2px solid #6ee7b7',
                borderRadius: '10px',
                padding: '0.875rem',
                marginBottom: '1rem',
                animation: 'fadeIn 0.3s ease-in'
              }}>
                <p style={{
                  color: '#065f46',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>✅</span>
                  Verification email sent! Check your inbox and spam folder.
                </p>
              </div>
            )}

            {error && needsVerification && (
              <div style={{
                background: '#fee2e2',
                border: '2px solid #fecaca',
                borderRadius: '10px',
                padding: '0.875rem',
                marginBottom: '1rem'
              }}>
                <p style={{
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  margin: 0
                }}>
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleResendVerification}
              disabled={resendLoading || cooldownTime > 0}
              type="button"
              style={{
                width: '100%',
                background: (resendLoading || cooldownTime > 0)
                  ? '#d1d5db' 
                  : 'linear-gradient(to right, #10b981, #059669)',
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                cursor: (resendLoading || cooldownTime > 0) ? 'not-allowed' : 'pointer',
                boxShadow: (resendLoading || cooldownTime > 0)
                  ? 'none' 
                  : '0 4px 12px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {resendLoading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                  {' '}Sending...
                </>
              ) : cooldownTime > 0 ? (
                <>⏱️ Wait {cooldownTime}s to resend</>
              ) : (
                <>📨 Resend Verification Email</>
              )}
            </button>

            {cooldownTime > 0 && (
              <p style={{
                color: '#78350f',
                fontSize: '0.75rem',
                textAlign: 'center',
                marginTop: '0.5rem',
                marginBottom: 0
              }}>
                This prevents spam. You can request another email in {cooldownTime} seconds.
              </p>
            )}
          </div>
        )}

        {/* 🔑 PASSWORD RESET SUCCESS BANNER */}
        {resetSuccess && (
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '3px solid #10b981',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>✅</div>
              <div>
                <h3 style={{
                  color: '#065f46',
                  fontSize: '1rem',
                  fontWeight: '800',
                  margin: '0 0 0.25rem 0'
                }}>
                  Password Reset Email Sent!
                </h3>
                <p style={{
                  color: '#047857',
                  fontSize: '0.875rem',
                  margin: 0
                }}>
                  Check your inbox and spam folder for the reset link.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.5rem', 
              color: '#374151', 
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              <Mail size={20} style={{ color: '#ec4899' }} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #fbcfe8',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #ec4899'}
              onBlur={(e) => e.target.style.border = '2px solid #fbcfe8'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.5rem', 
              color: '#374151', 
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              <Lock size={20} style={{ color: '#ec4899' }} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #fbcfe8',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #ec4899'}
              onBlur={(e) => e.target.style.border = '2px solid #fbcfe8'}
            />
            
            {/* 🔑 FORGOT PASSWORD LINK */}
            <div style={{ 
              marginTop: '0.5rem', 
              textAlign: 'right' 
            }}>
              <button
                onClick={handleForgotPassword}
                disabled={resetLoading}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: resetLoading ? '#9ca3af' : '#a855f7',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: resetLoading ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                {resetLoading ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>
            
            {/* Reset error message */}
            {resetError && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.75rem', 
                background: '#fef2f2', 
                border: '2px solid #fecaca', 
                borderRadius: '10px', 
                color: '#b91c1c', 
                fontWeight: '600',
                fontSize: '0.8rem'
              }}>
                {resetError}
              </div>
            )}
          </div>

          {/* Error message (only show if NOT showing verification banner) */}
          {error && !needsVerification && (
            <div style={{ 
              padding: '1rem', 
              background: '#fef2f2', 
              border: '2px solid #fecaca', 
              borderRadius: '12px', 
              color: '#b91c1c', 
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading 
                ? '#d1d5db' 
                : 'linear-gradient(to right, #ec4899, #a855f7)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading 
                ? 'none' 
                : '0 4px 10px rgba(236,72,153,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center', 
          color: '#6b7280',
          fontSize: '0.95rem'
        }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#ec4899',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.95rem'
            }}
          >
            Sign up
          </button>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}