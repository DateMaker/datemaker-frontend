import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ message, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '0',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '3px solid #10b981',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'rotate(0deg)';
            }}
          >
            <X size={20} style={{ color: 'white' }} />
          </button>

          {/* Success Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid white',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <CheckCircle size={48} style={{ color: 'white' }} />
          </div>

          <h2 style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: '900',
            color: 'white',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            Success!
          </h2>
        </div>

        {/* Message Content */}
        <div style={{
          padding: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 2rem 0',
            fontSize: '1.125rem',
            lineHeight: '1.6',
            color: '#1f2937',
            fontWeight: '600'
          }}>
            {message}
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontWeight: '900',
              fontSize: '1.125rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            Close
          </button>
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
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;