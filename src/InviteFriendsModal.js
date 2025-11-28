import React, { useState } from 'react';
import { 
  X, Copy, Check, MessageCircle, Mail, Share2, 
  Users, Gift, Sparkles, Heart, QrCode
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

const InviteFriendsModal = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Your app URL
  const APP_URL = 'https://www.thedatemakerapp.com';
  
  // Referral link (can add tracking later)
  const referralLink = `${APP_URL}?ref=${user?.uid?.slice(0, 8) || 'friend'}`;
  
  // The invite message
  const inviteMessage = `Tired of "idk, what do YOU want to do?" 😅\n\nTry DateMaker - it plans perfect dates for you! 💜\n\n${referralLink}`;
  
  const shortMessage = `Stop arguing about date night! Try DateMaker 💜 ${referralLink}`;

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Native share (iOS/Android)
  const handleNativeShare = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: 'Check out DateMaker!',
          text: inviteMessage,
          url: referralLink,
          dialogTitle: 'Invite friends to DateMaker'
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else if (navigator.share) {
      // Web Share API
      try {
        await navigator.share({
          title: 'Check out DateMaker!',
          text: inviteMessage,
          url: referralLink
        });
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    } else {
      // Fallback - just copy
      handleCopy();
    }
  };

  // Share via SMS
  const handleSMS = () => {
    const smsBody = encodeURIComponent(shortMessage);
    window.open(`sms:?body=${smsBody}`, '_blank');
  };

  // Share via WhatsApp
  const handleWhatsApp = () => {
    const waText = encodeURIComponent(inviteMessage);
    window.open(`https://wa.me/?text=${waText}`, '_blank');
  };

  // Share via Email
  const handleEmail = () => {
    const subject = encodeURIComponent('You need to try this app! 💜');
    const body = encodeURIComponent(inviteMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareOptions = [
    {
      id: 'native',
      icon: <Share2 size={24} />,
      label: 'Share',
      sublabel: 'All apps',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
      shadow: 'rgba(168, 85, 247, 0.4)',
      action: handleNativeShare
    },
    {
      id: 'sms',
      icon: <MessageCircle size={24} />,
      label: 'Text',
      sublabel: 'SMS',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadow: 'rgba(16, 185, 129, 0.4)',
      action: handleSMS
    },
    {
      id: 'whatsapp',
      icon: '💬',
      label: 'WhatsApp',
      sublabel: 'Message',
      gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
      shadow: 'rgba(37, 211, 102, 0.4)',
      action: handleWhatsApp
    },
    {
      id: 'email',
      icon: <Mail size={24} />,
      label: 'Email',
      sublabel: 'Send',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      shadow: 'rgba(59, 130, 246, 0.4)',
      action: handleEmail
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '420px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(168, 85, 247, 0.3)',
        border: '3px solid #a855f7',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #8b5cf6 100%)',
          padding: '2rem 1.5rem',
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
          position: 'relative',
          textAlign: 'center'
        }}>
          {/* Close button */}
          <div
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 'calc(1rem + env(safe-area-inset-top))',
              right: '1rem',
              background: 'white',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <X size={22} style={{ color: '#a855f7' }} />
          </div>

          {/* Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2.5rem'
          }}>
            🎁
          </div>

          <h2 style={{
            margin: '0 0 0.5rem',
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: '900'
          }}>
            Invite Friends
          </h2>
          
          <p style={{
            margin: 0,
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Share the love! 💜
          </p>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {/* Reward Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            border: '2px solid #fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '1.75rem' }}>🏆</div>
            <div>
              <p style={{
                margin: 0,
                fontWeight: '800',
                fontSize: '0.95rem',
                color: '#92400e'
              }}>
                Invite 3 friends
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: '#a16207'
              }}>
                Invite 3 Friends and if they keep there Premium for 3 months get 1 month free 🎉
              </p>
            </div>
          </div>

          {/* Share Link Box */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: '2px solid #e9d5ff'
          }}>
            <p style={{
              margin: '0 0 0.75rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Your Invite Link
            </p>
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <div style={{
                flex: 1,
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '0.875rem 1rem',
                fontSize: '0.875rem',
                color: '#374151',
                fontWeight: '600',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {referralLink}
              </div>
              
              <button
                onClick={handleCopy}
                style={{
                  background: copied 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.875rem 1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  boxShadow: copied 
                    ? '0 4px 12px rgba(16, 185, 129, 0.4)'
                    : '0 4px 12px rgba(168, 85, 247, 0.4)'
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Options Grid */}
          <p style={{
            margin: '0 0 1rem',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Share Via
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                style={{
                  background: 'white',
                  border: '2px solid #e9d5ff',
                  borderRadius: '16px',
                  padding: '1rem 0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: option.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  boxShadow: `0 4px 12px ${option.shadow}`
                }}>
                  {option.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#374151'
                }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* Preview Message */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '2px solid #e5e7eb'
          }}>
            <p style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Message Preview
            </p>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#374151',
              lineHeight: '1.6',
              whiteSpace: 'pre-line'
            }}>
              {inviteMessage}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
          borderTop: '2px solid #e9d5ff',
          background: 'white'
        }}>
          <button
            onClick={handleNativeShare}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #8b5cf6 100%)',
              color: 'white',
              fontWeight: '800',
              fontSize: '1.0625rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              boxShadow: '0 6px 20px rgba(168, 85, 247, 0.4)'
            }}
          >
            <Share2 size={20} />
            Share with Friends
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default InviteFriendsModal;