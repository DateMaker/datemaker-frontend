// 📸 Avatar Component - Displays profile pictures with fallbacks

import React from 'react';

/**
 * Universal Avatar Component
 * 
 * Displays user profile picture or fallback to letter avatar
 * 
 * @param {string} photoURL - User's profile picture URL
 * @param {string} displayName - User's name (for fallback)
 * @param {string} email - User's email (fallback if no name)
 * @param {number} size - Avatar size in pixels (default: 40)
 * @param {boolean} online - Show online indicator (default: false)
 */
export default function Avatar({ 
  photoURL, 
  displayName, 
  email, 
  size = 40,
  online = false,
  style = {}
}) {
  // Get first letter for fallback avatar
  const getInitial = () => {
    if (displayName) return displayName[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return '?';
  };

  // Generate color based on name/email for consistency
  const getColor = () => {
    const str = displayName || email || 'default';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#ec4899', // Pink
      '#a855f7', // Purple
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Orange
      '#ef4444', // Red
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    ...style
  };

  return (
    <div style={baseStyle}>
      {photoURL ? (
        // Show profile picture
        <img
          src={photoURL}
          alt={displayName || email}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onError={(e) => {
            // If image fails to load, hide it (will show fallback)
            e.target.style.display = 'none';
          }}
        />
      ) : (
        // Fallback to letter avatar
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getColor()} 0%, ${getColor()}dd 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size * 0.5}px`,
            fontWeight: '900',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {getInitial()}
        </div>
      )}

      {/* Online indicator */}
      {online && (
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: `${size * 0.3}px`,
            height: `${size * 0.3}px`,
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      )}
    </div>
  );
}