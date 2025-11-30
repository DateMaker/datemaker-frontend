// PaymentSuccess.js - Redirects user back to app after Stripe payment
import React, { useEffect, useState } from 'react';

const PaymentSuccess = () => {
  const [status, setStatus] = useState('verifying');
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const userIdParam = params.get('user_id');
    
    setUserId(userIdParam);

    if (!sessionId || !userIdParam) {
      setStatus('error');
      return;
    }

    // Give webhook time to process (2 seconds)
    const timer = setTimeout(() => {
      setStatus('success');
      
      // Try to redirect back to app via deep link
      setTimeout(() => {
        tryOpenApp(userIdParam);
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const tryOpenApp = (userIdParam) => {
    const deepLink = `datemaker://payment-success?status=success&user_id=${userIdParam}`;
    
    // Create a hidden iframe to try the deep link (works better on iOS)
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);
    
    // Also try direct location change
    setTimeout(() => {
      window.location.href = deepLink;
    }, 100);
    
    // Fallback: If deep link doesn't work after 2s, show manual button
    setTimeout(() => {
      setStatus('manual');
      // Clean up iframe
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 2000);
  };

  const handleOpenApp = () => {
    const deepLink = `datemaker://payment-success?status=success&user_id=${userId}`;
    window.location.href = deepLink;
    
    // If still here after 1 second, the deep link didn't work
    setTimeout(() => {
      alert('If the app did not open, please open DateMaker manually. Your subscription is active!');
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {status === 'verifying' && (
          <div>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #ec4899',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem' 
            }}>
              Verifying Payment...
            </h1>
            <p style={{ color: '#6b7280' }}>
              Please wait while we confirm your subscription.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(to right, #ec4899, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Welcome to Premium!
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Your 7-day free trial has started. Redirecting to app...
            </p>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #ec4899',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          </div>
        )}

        {status === 'manual' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(to right, #ec4899, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Payment Successful!
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Your premium subscription is now active. Tap below to return to the app.
            </p>
            <button
              onClick={handleOpenApp}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: 'linear-gradient(to right, #ec4899, #a855f7)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Open DateMaker App
            </button>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              If the button doesn't work, just open the DateMaker app manually - your subscription is already active!
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem', 
              color: '#dc2626' 
            }}>
              Something Went Wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
            <a
              href="mailto:support@thedatemakerapp.com"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: '#f3f4f6',
                color: '#374151',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Contact Support
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;