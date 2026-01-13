import React, { useState, useEffect } from 'react';
import { Menu, X, Users, TrendingUp, Trophy, MessageCircle, Heart, User, LogOut, UserPlus, Loader, LogIn } from 'lucide-react';

export default function HamburgerMenu({ 
  user, 
  subscriptionStatus,
  savedDatesCount,
  notificationCount,
  surpriseCount = 0,
  onNavigate,
  onLogout,
  isGuestMode = false,
  bgTheme = null,
  profilePhoto = null // 📸 Profile photo
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
  if (isOpen) {
    // Lock scroll on iOS
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
  } else {
    // Restore scroll position
    const scrollY = document.body.style.top;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }
  
  return () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
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
      shadow: 'rgba(251, 146, 60, 0.4)',
      locked: isGuestMode
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
      locked: subscriptionStatus === 'free' || isGuestMode
    },
    { 
      id: 'saved', 
      icon: <Heart size={20} />, 
      label: 'Saved', 
      gradient: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
      shadow: 'rgba(236, 72, 153, 0.4)',
      badge: savedDatesCount,
      locked: isGuestMode
    },
    { 
      id: 'scrapbook', 
      icon: '📸', 
      label: 'Date Memories', 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      shadow: 'rgba(245, 158, 11, 0.4)',
      locked: isGuestMode
    },
    { 
      id: 'surprise', 
      icon: '🎁', 
      label: 'Surprise Dates', 
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      shadow: 'rgba(139, 92, 246, 0.4)',
      badge: surpriseCount > 0 ? surpriseCount : null,
      locked: isGuestMode
    },
    { 
      id: 'streaks', 
      icon: '🔥', 
      label: 'Date Streaks', 
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      shadow: 'rgba(239, 68, 68, 0.4)',
      locked: isGuestMode
    },
    { 
      id: 'profile', 
      icon: <User size={20} />, 
      label: 'Profile', 
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      shadow: 'rgba(139, 92, 246, 0.4)',
      locked: isGuestMode
    }
  ];

  const handleItemClick = (itemId) => {
    setIsOpen(false);
    onNavigate(itemId);
  };

  // ✅ Calculate total notifications for hamburger button badge (includes surprises)
  const totalNotifications = (notificationCount || 0) + (surpriseCount || 0);

  // ✅ GUEST MODE FIX: Safely get display name and initial
  const displayName = user?.email ? user.email.split('@')[0] : 'Guest';
  const displayInitial = user?.email ? user.email.charAt(0).toUpperCase() : '👤';

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => {
  // Close any open dropdowns
  document.dispatchEvent(new CustomEvent('closeDropdowns'));
  setIsOpen(!isOpen);
}}
        style={{
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '12px',
          padding: '0.75rem',
          cursor: 'pointer',
          display: isOpen ? 'none' : 'flex',
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
        <Menu size={24} style={{ color: 'white' }} />
        
        {/* 🔔 NOTIFICATION BADGE - Now includes surprises */}
        {totalNotifications > 0 && (
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
            {totalNotifications > 9 ? '9+' : totalNotifications}
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
          background: bgTheme?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          paddingTop: 'calc(2rem + env(safe-area-inset-top))',
          borderBottom: '2px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.1)',
          flexShrink: 0,
          position: 'relative'
        }}>
          {/* Close button */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: 'calc(1rem + env(safe-area-inset-top))',
              right: '1rem',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10,
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            <X size={20} style={{ color: 'white' }} />
          </div>

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
  overflow: 'hidden',
  background: isGuestMode 
    ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
    : 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  boxShadow: isGuestMode 
    ? '0 4px 12px rgba(107, 114, 128, 0.4)'
    : '0 4px 12px rgba(236, 72, 153, 0.4)'
}}>
  {profilePhoto ? (
    <img 
      src={profilePhoto} 
      alt="Profile" 
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    />
  ) : (
    displayInitial
  )}
</div>
            <div>
              <p style={{
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                margin: 0
              }}>
                {displayName}
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.875rem',
                margin: 0
              }}>
                {isGuestMode ? '👁️ Exploring' : (subscriptionStatus === 'premium' ? '✨ Premium' : '🆓 Free')}
              </p>
            </div>
          </div>

          {/* Guest mode sign up CTA */}
          {isGuestMode && (
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout(); // Exit guest mode to show login
              }}
              style={{
                marginTop: '1rem',
                width: '100%',
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                color: 'white',
                fontWeight: '700',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
              }}
            >
              ✨ Sign Up to Unlock All Features
            </button>
          )}
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
  flex: 1,
  textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)'
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

        {/* Logout/Sign In Button */}
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
              background: isGuestMode 
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              backdropFilter: 'blur(10px)',
              border: isGuestMode 
                ? '2px solid rgba(59, 130, 246, 0.4)'
                : '2px solid rgba(239, 68, 68, 0.4)',
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
              e.target.style.background = isGuestMode 
                ? 'rgba(59, 130, 246, 0.3)'
                : 'rgba(239, 68, 68, 0.3)';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isGuestMode 
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(239, 68, 68, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            {isGuestMode ? <LogIn size={20} /> : <LogOut size={20} />}
            {isGuestMode ? 'Sign In / Sign Up' : 'Logout'}
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