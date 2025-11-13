import React, { useState } from 'react';
import { Heart, Mail, Lock, User } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export default function Signup({ onSwitchToLogin, onShowSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        email: email.trim(),
        subscriptionStatus: 'free',
        createdAt: new Date().toISOString(),
        uid: user.uid,
        emailVerified: false
      });

      // Send verification email
      await sendEmailVerification(user);

      // Sign them out until they verify
      await signOut(auth);

      console.log('User created successfully - verification email sent');
      
      setSuccess(true);

    } catch (err) {
      console.error('Signup error:', err);
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please login instead.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please use a stronger password.');
          break;
        default:
          setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', 
        padding: '2rem' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '24px', 
          maxWidth: '500px', 
          width: '100%', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(to right, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '4rem',
            color: 'white',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
          }}>
            ✓
          </div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '900', 
            marginBottom: '1rem',
            color: '#111827'
          }}>
            🎉 Account Created!
          </h2>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1.125rem',
            lineHeight: '1.75',
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            Almost there! Check your email to verify your account.
          </p>
          
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ 
              color: '#166534', 
              fontSize: '1rem',
              marginBottom: '0.5rem',
              fontWeight: '600'
            }}>
              📧 Verification email sent to:
            </p>
            <p style={{ 
              color: '#ec4899', 
              fontSize: '1.125rem',
              fontWeight: '700',
              wordBreak: 'break-word',
              margin: 0
            }}>
              {email}
            </p>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '3px solid #fbbf24',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ 
              color: '#92400e', 
              fontSize: '1rem',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>
              ⚠️ IMPORTANT: Check Your Spam/Junk Folder!
            </p>
            <p style={{ 
              color: '#78350f', 
              fontSize: '0.875rem',
              margin: 0
            }}>
              Verification emails often end up in spam. If you don't see it in your inbox, check your junk folder.
            </p>
          </div>

          <div style={{
            background: '#eff6ff',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ 
              color: '#1e40af', 
              fontSize: '0.875rem',
              margin: 0,
              lineHeight: '1.5'
            }}>
              💡 <strong>Next steps:</strong><br/>
              1. Open the verification email<br/>
              2. Click the verification link<br/>
              3. Come back and log in!
            </p>
          </div>

          <button
            onClick={onSwitchToLogin}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #ec4899, #a855f7)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              padding: '1.25rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Go to Login Now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', 
      padding: '2rem' 
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
            Join DateMaker
          </h1>
          <p style={{ color: '#6b7280' }}>Create your account to start planning</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
              <User size={20} style={{ color: '#ec4899' }} />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #fbcfe8',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #ec4899'}
              onBlur={(e) => e.target.style.border = '2px solid #fbcfe8'}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
              <Mail size={20} style={{ color: '#ec4899' }} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #fbcfe8',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #ec4899'}
              onBlur={(e) => e.target.style.border = '2px solid #fbcfe8'}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
              <Lock size={20} style={{ color: '#ec4899' }} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #fbcfe8',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #ec4899'}
              onBlur={(e) => e.target.style.border = '2px solid #fbcfe8'}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#374151', fontWeight: '600' }}>
              <Lock size={20} style={{ color: '#ec4899' }} />
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #fbcfe8',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #ec4899'}
              onBlur={(e) => e.target.style.border = '2px solid #fbcfe8'}
            />
          </div>

          {error && (
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
              background: loading ? '#d1d5db' : 'linear-gradient(to right, #ec4899, #a855f7)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 10px rgba(236,72,153,0.3)'
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#ec4899',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}