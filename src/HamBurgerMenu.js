import React, { useState, useEffect } from 'react';
import { Menu, X, Users, TrendingUp, Trophy, MessageCircle, Heart, User, LogOut, UserPlus, Loader } from 'lucide-react';

export default function HamburgerMenu({ 
  user, 
  subscriptionStatus,
  savedDatesCount,
  notificationCount,
  onNavigate,
  onLogout 
}) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ SIMPLER: Just prevent scrolling on backdrop touch
  useEffect(() => {
    if (isOpen) {
      // Prevent scroll on body but allow it in menu
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems = [
    { 
      id: 'spin', 
      icon: '🎡', 
      label: 'Spin the Wheel', 
      gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      shadow: 'rgba(168, 85, 247, 0.4)'
    },
    { 
      id: 'invite', 
      icon: <UserPlus size={20} />, 
      label: 'Invite Friends', 
      gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
      shadow: 'rgba(251, 146, 60, 0.4)'
    },
    { 
      id: 'stats', 
      icon: <TrendingUp size={20} />, 
      label: 'Stats', 
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      shadow: 'rgba(59, 130, 246, 0.4)'
    },
    { 
      id: 'achievements', 
      icon: <Trophy size={20} />, 
      label: 'Achievements', 
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      shadow: 'rgba(255, 215, 0, 0.4)'
    },
    { 
      id: 'social', 
      icon: <MessageCircle size={20} />, 
      label: 'Social', 
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadow: 'rgba(16, 185, 129, 0.4)',
      badge: notificationCount > 0 ? notificationCount : null,
      locked: subscriptionStatus === 'free'
    },
    { 
      id: 'saved', 
      icon: <Heart size={20} />, 
      label: 'Saved', 
      gradient: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
      shadow: 'rgba(236, 72, 153, 0.4)',
      badge: savedDatesCount
    },
    { 
      id: 'scrapbook', 
      icon: '📸', 
      label: 'Date Memories', 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      shadow: 'rgba(245, 158, 11, 0.4)'
    },
    { 
      id: 'surprise', 
      icon: '🎁', 
      label: 'Surprise Dates', 
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      shadow: 'rgba(139, 92, 246, 0.4)'
    },
    { 
      id: 'streaks', 
      icon: '🔥', 
      label: 'Date Streaks', 
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      shadow: 'rgba(239, 68, 68, 0.4)'
    },
    { 
      id: 'profile', 
      icon: <User size={20} />, 
      label: 'Profile', 
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      shadow: 'rgba(139, 92, 246, 0.4)'
    }
  ];

  const handleItemClick = (itemId) => {
    setIsOpen(false);
    onNavigate(itemId);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '12px',
          padding: '0.75rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 1001
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.3)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? <X size={24} style={{ color: 'white' }} /> : <Menu size={24} style={{ color: 'white' }} />}
        
        {/* 🔔 NOTIFICATION BADGE */}
        {notificationCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)'
          }}>
            {notificationCount > 9 ? '9+' : notificationCount}
          </div>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      {/* Slide-out Menu */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '320px',
          maxWidth: '85vw',
          height: '100dvh',
          maxHeight: '-webkit-fill-available',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
          touchAction: 'pan-y'
        }}
      >
       {/* Menu Header */}
<div style={{
  padding: '2rem 1.5rem',
  borderBottom: '2px solid rgba(255,255,255,0.2)',
  background: 'rgba(0,0,0,0.1)',
  flexShrink: 0,
  position: 'relative'
}}>
  {/* Close button - top right */}
  <button
    onClick={() => setIsOpen(false)}
    style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: '8px',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = 'rgba(255,255,255,0.3)';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'rgba(255,255,255,0.2)';
    }}
  >
    <X size={20} style={{ color: 'white' }} />
  </button>

  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
    }}>
      {user.email.charAt(0).toUpperCase()}
    </div>
    <div>
      <p style={{
        color: 'white',
        fontWeight: '700',
        fontSize: '1rem',
        margin: 0
      }}>
        {user.email.split('@')[0]}
      </p>
      <p style={{
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.875rem',
        margin: 0
      }}>
        {subscriptionStatus === 'premium' ? '✨ Premium' : '🆓 Free'}
      </p>
    </div>
  </div>
</div>

        {/* Menu Items */}
        <div style={{ 
          flex: 1, 
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          paddingBottom: '2rem'
        }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              disabled={item.locked}
              style={{
                background: item.locked ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                cursor: item.locked ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.3s ease',
                position: 'relative',
                opacity: item.locked ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!item.locked) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.transform = 'translateX(-4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.locked) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: item.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.25rem',
                boxShadow: `0 4px 12px ${item.shadow}`,
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              
              <span style={{
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                flex: 1
              }}>
                {item.label}
              </span>

              {item.badge > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '900',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '12px',
                  minWidth: '24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
                }}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {item.locked && (
                <span style={{
                  fontSize: '1.25rem'
                }}>
                  🔒
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div style={{
          padding: '1rem',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
          borderTop: '2px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.1)',
          flexShrink: 0
        }}>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '16px',
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.3)';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}