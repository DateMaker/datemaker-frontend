import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Heart, UserPlus } from 'lucide-react';

export default function FloatingSocialButton({ 
  onClick, 
  unreadCount = 0, 
  isGuestMode = false,
  position = 'bottom-right' // 'bottom-right', 'bottom-left', 'top-right'
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Pulse animation when there are unread items
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Position styles
  const positionStyles = {
    'bottom-right': { bottom: '100px', right: '1rem' },
    'bottom-left': { bottom: '100px', left: '1rem' },
    'top-right': { top: '100px', right: '1rem' }
  };

  const handleClick = () => {
    if (isGuestMode) {
      // Could show a "login required" message
      onClick();
      return;
    }
    onClick();
  };

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes socialPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 4px 30px rgba(236, 72, 153, 0.6);
          }
        }
        
        @keyframes socialBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes badgePop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Main Button */}
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          ...positionStyles[position],
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          animation: isAnimating ? 'socialPulse 1s ease infinite' : 'none'
        }}
      >
        <Users size={28} color="white" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '24px',
            height: '24px',
            borderRadius: '12px',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
            animation: 'badgePop 0.3s ease'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>
    </>
  );
}

// ============================================
// 🎯 ALTERNATIVE: Expandable Social FAB
// ============================================
// This version expands to show quick actions

export function ExpandableSocialButton({ 
  onMessages, 
  onFriends, 
  onFeed,
  messageCount = 0,
  friendRequestCount = 0,
  isGuestMode = false 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    { 
      icon: MessageCircle, 
      label: 'Messages', 
      onClick: onMessages, 
      count: messageCount,
      color: '#3b82f6'
    },
    { 
      icon: UserPlus, 
      label: 'Friends', 
      onClick: onFriends, 
      count: friendRequestCount,
      color: '#22c55e'
    },
    { 
      icon: Heart, 
      label: 'Feed', 
      onClick: onFeed, 
      count: 0,
      color: '#f43f5e'
    }
  ];

  const totalCount = messageCount + friendRequestCount;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          onClick={() => setIsExpanded(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999
          }}
        />
      )}

      {/* Quick Action Buttons */}
      {isExpanded && (
        <div style={{
          position: 'fixed',
          bottom: '170px',
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 1001
        }}>
          {quickActions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick();
                setIsExpanded(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '50px',
                background: 'white',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                animation: `slideUp 0.3s ease ${index * 0.05}s both`
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: action.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <action.icon size={18} color="white" />
                {action.count > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {action.count}
                  </div>
                )}
              </div>
              <span style={{ 
                color: '#1a1a2e', 
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '1rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: isExpanded 
            ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
            : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
          cursor: 'pointer',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: isExpanded ? 'rotate(45deg)' : 'none'
        }}
      >
        <Users size={28} color="white" style={{
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(-45deg)' : 'none'
        }} />

        {/* Badge */}
        {totalCount > 0 && !isExpanded && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '24px',
            height: '24px',
            borderRadius: '12px',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 6px'
          }}>
            {totalCount > 99 ? '99+' : totalCount}
          </div>
        )}
      </button>
    </>
  );
}