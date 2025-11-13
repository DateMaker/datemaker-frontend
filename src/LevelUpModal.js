import React, { useState, useEffect } from 'react';
import { X, TrendingUp } from 'lucide-react';

const LevelUpModal = ({ oldLevel, newLevel, onClose }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowAnimation(true), 100);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Particle explosion effect */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '4px',
              height: '4px',
              background: ['#FFD700', '#FF6B35', '#9D4EDD', '#06D6A0', '#4facfe', '#ec4899'][i % 6],
              borderRadius: '50%',
              animation: `explode ${1.5 + Math.random()}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
              transform: `rotate(${(360 / 30) * i}deg) translateX(0)`,
              boxShadow: '0 0 10px currentColor'
            }}
          />
        ))}
      </div>

      {/* Main modal */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '32px',
        padding: '4rem 3rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        textAlign: 'center',
        border: '3px solid rgba(255,215,0,0.3)',
        boxShadow: '0 0 60px rgba(255,215,0,0.3), inset 0 0 60px rgba(255,215,0,0.05)',
        transform: showAnimation ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-5deg)',
        opacity: showAnimation ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.1)';
            e.target.style.transform = 'rotate(0deg)';
          }}
        >
          <X size={24} style={{ color: 'white' }} />
        </button>

        {/* Level icon */}
        <div style={{
          width: '150px',
          height: '150px',
          margin: '0 auto 2rem',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 50px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,255,255,0.3)',
          animation: 'pulse 2s ease-in-out infinite',
          border: '5px solid rgba(255,255,255,0.5)'
        }}>
          <div style={{ 
            fontSize: '4rem',
            animation: 'bounce 1s ease-in-out infinite'
          }}>
            {newLevel.icon}
          </div>
        </div>

        {/* LEVEL UP text */}
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          textShadow: '0 0 40px rgba(255,215,0,0.5)',
          animation: 'glow 2s ease-in-out infinite'
        }}>
          LEVEL UP!
        </h1>

        {/* Level progression */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50px',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              fontWeight: '600'
            }}>
              Level {oldLevel.level}
            </p>
          </div>

          <TrendingUp size={32} style={{ color: '#FFD700' }} />

          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderRadius: '50px',
            boxShadow: '0 4px 20px rgba(255,215,0,0.4)'
          }}>
            <p style={{
              fontSize: '1.25rem',
              color: 'white',
              margin: 0,
              fontWeight: '700'
            }}>
              Level {newLevel.level}
            </p>
          </div>
        </div>

        {/* New rank message */}
        <div style={{
          padding: '2rem 1.5rem',
          background: 'rgba(255,215,0,0.1)',
          borderRadius: '20px',
          border: '2px solid rgba(255,215,0,0.3)',
          marginBottom: '2rem'
        }}>
          <p style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'white',
            margin: 0,
            lineHeight: '1.4'
          }}>
            You're now a{' '}
            <span style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              {newLevel.name}
            </span>
            !
          </p>
        </div>

        {/* Motivational message */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          marginBottom: '2rem'
        }}>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Keep completing challenges and exploring new dates to level up even more!
          </p>
        </div>

        {/* Continue button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            color: 'white',
            fontWeight: '900',
            fontSize: '1.25rem',
            padding: '1.25rem 3rem',
            borderRadius: '50px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(255,215,0,0.4)',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 12px 40px rgba(255,215,0,0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 30px rgba(255,215,0,0.4)';
          }}
        >
          Continue Your Journey
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes explode {
          to {
            transform: rotate(${Math.random() * 360}deg) translateX(300px);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 50px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,255,255,0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 80px rgba(255,215,0,0.8), inset 0 0 40px rgba(255,255,255,0.4);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 40px rgba(255,215,0,0.5);
          }
          50% {
            text-shadow: 0 0 60px rgba(255,215,0,0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default LevelUpModal;