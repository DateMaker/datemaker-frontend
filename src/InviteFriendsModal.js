import React, { useState } from 'react';
import { Copy, Check, MessageCircle, Mail, Share2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

const InviteFriendsModal = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);

  const APP_URL = 'https://apps.apple.com/us/app/datemaker/id6755966491';
  const referralLink = `${APP_URL}?ref=${user?.uid?.slice(0, 8) || 'friend'}`;
  
  const inviteMessage = `Tired of "idk, what do YOU want to do?" 😅\n\nTry DateMaker - it plans perfect dates for you! 💜\n\n${referralLink}`;
  const shortMessage = `Stop arguing about date night! Try DateMaker 💜 ${referralLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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
      handleCopy();
    }
  };

  const handleSMS = () => {
    const smsBody = encodeURIComponent(shortMessage);
    window.open(`sms:?body=${smsBody}`, '_blank');
  };

  const handleWhatsApp = () => {
    const waText = encodeURIComponent(inviteMessage);
    window.open(`https://wa.me/?text=${waText}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('You need to try this app! 💜');
    const body = encodeURIComponent(inviteMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      padding: '1.5rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '380px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          padding: '2rem 1.5rem 1.75rem',
          position: 'relative',
          textAlign: 'center',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.25)',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.5rem',
              fontWeight: '300',
              color: 'white',
              lineHeight: 1
            }}
          >
            ✕
          </button>

          <div style={{
            fontSize: '3rem',
            marginBottom: '0.75rem'
          }}>
            🎁
          </div>

          <h2 style={{
            margin: '0 0 0.25rem',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '800'
          }}>
            Invite Friends
          </h2>
          
          <p style={{
            margin: 0,
            color: 'rgba(255,255,255,0.85)',
            fontSize: '0.9rem'
          }}>
            Share DateMaker with your friends!
          </p>
        </div>

        {/* Content */}
        <div style={{ 
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Reward Card */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span>
            <div>
              <p style={{
                margin: 0,
                fontWeight: '700',
                fontSize: '0.9rem',
                color: '#92400e'
              }}>
                Invite your Friends!
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.8rem',
                color: '#a16207'
              }}>
                Plan some more Amazing Memories
              </p>
            </div>
          </div>

          {/* Link Box */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              flex: 1,
              background: '#f3f4f6',
              borderRadius: '12px',
              padding: '0.875rem 1rem',
              fontSize: '0.85rem',
              color: '#6b7280',
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
                  ? '#10b981'
                  : '#a855f7',
                border: 'none',
                borderRadius: '12px',
                padding: '0 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'white',
                fontWeight: '700',
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Done!' : 'Copy'}
            </button>
          </div>

          {/* Share Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            {[
              { icon: <Share2 size={20} />, label: 'Share', color: '#a855f7', action: handleNativeShare },
              { icon: <MessageCircle size={20} />, label: 'Text', color: '#10b981', action: handleSMS },
              { icon: '💬', label: 'WhatsApp', color: '#25D366', action: handleWhatsApp },
              { icon: <Mail size={20} />, label: 'Email', color: '#3b82f6', action: handleEmail }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                style={{
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '14px',
                  padding: '0.875rem 0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem'
                }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Main Share Button */}
          <button
            onClick={handleNativeShare}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: 'white',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
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
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default InviteFriendsModal;