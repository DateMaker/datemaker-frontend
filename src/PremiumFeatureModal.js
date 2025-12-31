import React from 'react';
import { Calendar, Heart, Users, Camera, Gift, Target, Sparkles, X } from 'lucide-react';

export default function PremiumFeatureModal({ onClose, onUpgrade }) {
  const features = [
    { icon: <Calendar size={24} />, text: 'Unlimited Date Planning', color: '#ec4899' },
    { icon: <Heart size={24} />, text: 'Save & Share Dates', color: '#ef4444' },
    { icon: <Users size={24} />, text: 'Social Features & Friends', color: '#10b981' },
    { icon: <Camera size={24} />, text: 'Date Memories & Photos', color: '#f59e0b' },
    { icon: <Gift size={24} />, text: 'Surprise Date Mode', color: '#a855f7' },
    { icon: <Target size={24} />, text: 'Exclusive Challenges', color: '#3b82f6' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease'
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '85vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        zIndex: 10001,
        overflow: 'hidden',
        animation: 'slideUp 0.4s ease'
      }}>
        {/* X Close button */}
        <button
          onClick={onClose}
          style={{
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
            zIndex: 10,
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <X size={24} style={{ color: '#667eea' }} />
        </button>

        {/* Content */}
        <div style={{
          padding: '3rem 2rem 2rem 2rem',
          overflowY: 'auto',
          maxHeight: '85vh'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)'
            }}>
              <Sparkles size={40} style={{ color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: 'white',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              Premium Features Available!
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Unlock the full DateMaker experience
            </p>
          </div>

          {/* Features List */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  marginBottom: index < features.length - 1 ? '0.75rem' : 0,
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${feature.color}20`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                </div>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Get Premium Button - NEW! */}
          <button
            onClick={() => {
              console.log('✨ Get Premium Features clicked');
              onUpgrade(); // This will open Apple IAP
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
              color: 'white',
              fontWeight: '800',
              fontSize: '1.1rem',
              padding: '1.25rem',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(236, 72, 153, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Sparkles size={24} />
            Get Premium Features
          </button>

          {/* Info Text */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: 'white',
              fontSize: '0.875rem',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Subscribe via Apple to unlock all premium features
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}