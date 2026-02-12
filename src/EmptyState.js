/**
 * 💜 EmptyState.js
 * Beautiful empty states for DateMaker
 * Each empty state has an illustration, warm copy, and optional CTA
 */

import React from 'react';

// Color constants (match your app)
const COLORS = {
  purple: '#8B5CF6',
  pink: '#EC4899',
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  primaryGradient: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
};

// Empty state content for each type
const emptyStateContent = {
  savedDates: {
    emoji: '💜',
    sparkles: ['✨', '✨'],
    title: 'No saved dates yet',
    subtitle: 'Generate your first date and save it here!',
    ctaText: 'Create a Date',
    ctaIcon: '✨',
  },
  friends: {
    emoji: '👋',
    sparkles: ['💜', '💜'],
    title: 'Your friends list is empty',
    subtitle: 'Find and add friends to plan dates together!',
    ctaText: 'Find Friends',
    ctaIcon: '🔍',
  },
  messages: {
    emoji: '💬',
    sparkles: ['✨', '✨'],
    title: 'No conversations yet',
    subtitle: 'Start chatting with your friends!',
    ctaText: 'Start a Chat',
    ctaIcon: '💬',
  },
  notifications: {
    emoji: '🔔',
    sparkles: ['✓', '✓'],
    title: 'All caught up!',
    subtitle: 'No new notifications right now',
    ctaText: null,
  },
  friendRequests: {
    emoji: '✉️',
    sparkles: ['💜', '💜'],
    title: 'No pending requests',
    subtitle: 'Friend requests will appear here',
    ctaText: 'Find Friends',
    ctaIcon: '🔍',
  },
  searchResults: {
    emoji: '🔍',
    sparkles: ['?', '?'],
    title: 'No results found',
    subtitle: 'Try different keywords or filters',
    ctaText: 'Clear Filters',
    ctaIcon: '✕',
  },
  achievements: {
    emoji: '🏆',
    sparkles: ['⭐', '⭐'],
    title: 'Start your journey!',
    subtitle: 'Complete dates to unlock achievements',
    ctaText: 'Create a Date',
    ctaIcon: '✨',
  },
  groupChats: {
    emoji: '👥',
    sparkles: ['💬', '💬'],
    title: 'No group chats yet',
    subtitle: 'Create a group to plan dates with friends!',
    ctaText: 'Create Group',
    ctaIcon: '+',
  },
  dateHistory: {
    emoji: '📅',
    sparkles: ['✨', '✨'],
    title: 'No date history yet',
    subtitle: 'Your completed dates will appear here',
    ctaText: 'Plan Your First Date',
    ctaIcon: '💜',
  },
  favorites: {
    emoji: '⭐',
    sparkles: ['💜', '💜'],
    title: 'No favorites yet',
    subtitle: 'Save your favorite places here!',
    ctaText: 'Explore Places',
    ctaIcon: '🗺️',
  },
  memories: {
    emoji: '📸',
    sparkles: ['💜', '💜'],
    title: 'No memories yet',
    subtitle: 'Add photos from your dates!',
    ctaText: 'Create a Date',
    ctaIcon: '✨',
  },
};

/**
 * EmptyState Component
 * 
 * @param {string} type - Type of empty state (savedDates, friends, messages, etc.)
 * @param {function} onCtaClick - Callback when CTA button is clicked
 * @param {string} customTitle - Override the default title
 * @param {string} customSubtitle - Override the default subtitle
 * @param {boolean} compact - Use compact version (smaller)
 */
const EmptyState = ({ 
  type = 'savedDates', 
  onCtaClick, 
  customTitle, 
  customSubtitle,
  compact = false 
}) => {
  const content = emptyStateContent[type] || emptyStateContent.savedDates;
  const title = customTitle || content.title;
  const subtitle = customSubtitle || content.subtitle;
  
  // Animation keyframes (inline for portability)
  const floatAnimation = `
    @keyframes emptyStateFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes emptyStateSparkle {
      0%, 100% { opacity: 0.4; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.1); }
    }
    @keyframes emptyStatePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;

  return (
    <>
      <style>{floatAnimation}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '2rem 1.5rem' : '3rem 1.5rem',
        textAlign: 'center',
        minHeight: compact ? 'auto' : '250px',
      }}>
        {/* Emoji Illustration */}
        <div style={{
          position: 'relative',
          marginBottom: compact ? '1rem' : '1.5rem',
        }}>
          {/* Sparkles */}
          <span style={{
            position: 'absolute',
            top: '-10px',
            left: '-20px',
            fontSize: compact ? '1rem' : '1.25rem',
            opacity: 0.6,
            animation: 'emptyStateSparkle 2s ease-in-out infinite',
          }}>
            {content.sparkles[0]}
          </span>
          <span style={{
            position: 'absolute',
            top: '-10px',
            right: '-20px',
            fontSize: compact ? '1rem' : '1.25rem',
            opacity: 0.6,
            animation: 'emptyStateSparkle 2s ease-in-out infinite 0.5s',
          }}>
            {content.sparkles[1]}
          </span>
          
          {/* Main Emoji */}
          <div style={{
            fontSize: compact ? '3rem' : '4rem',
            lineHeight: 1,
            animation: 'emptyStateFloat 3s ease-in-out infinite',
          }}>
            {content.emoji}
          </div>
        </div>
        
        {/* Title */}
        <h3 style={{
          margin: 0,
          marginBottom: '0.5rem',
          fontSize: compact ? '1.125rem' : '1.35rem',
          fontWeight: '800',
          color: COLORS.textPrimary,
        }}>
          {title}
        </h3>
        
        {/* Subtitle */}
        <p style={{
          margin: 0,
          fontSize: compact ? '0.9rem' : '1rem',
          color: COLORS.textSecondary,
          maxWidth: '300px',
          lineHeight: 1.5,
        }}>
          {subtitle}
        </p>
        
        {/* CTA Button */}
        {content.ctaText && onCtaClick && (
          <button
            onClick={onCtaClick}
            style={{
              marginTop: compact ? '1.25rem' : '1.75rem',
              padding: compact ? '0.75rem 1.5rem' : '0.875rem 1.75rem',
              background: COLORS.primaryGradient,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: compact ? '0.95rem' : '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.97)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {content.ctaIcon && <span>{content.ctaIcon}</span>}
            {content.ctaText}
          </button>
        )}
      </div>
    </>
  );
};

/**
 * Inline Empty State - For smaller spaces
 * Shows just icon + text in a row
 */
export const InlineEmptyState = ({ type = 'savedDates', customText }) => {
  const content = emptyStateContent[type] || emptyStateContent.savedDates;
  const text = customText || content.subtitle;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '2rem',
      color: COLORS.textSecondary,
      fontSize: '1rem',
    }}>
      <span style={{ fontSize: '2rem' }}>{content.emoji}</span>
      <span>{text}</span>
    </div>
  );
};

/**
 * Card Empty State - For empty cards/sections
 */
export const CardEmptyState = ({ 
  emoji = '✨', 
  text = 'Nothing here yet',
  subtext = '',
  minHeight = '150px'
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      minHeight,
      textAlign: 'center',
      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
      borderRadius: '20px',
      border: '2px dashed rgba(236, 72, 153, 0.2)',
    }}>
      <span style={{ 
        fontSize: '2.5rem', 
        marginBottom: '0.75rem',
        opacity: 0.9,
      }}>
        {emoji}
      </span>
      <p style={{
        margin: 0,
        fontSize: '1rem',
        fontWeight: '700',
        color: COLORS.textSecondary,
      }}>
        {text}
      </p>
      {subtext && (
        <p style={{
          margin: '0.35rem 0 0 0',
          fontSize: '0.875rem',
          color: COLORS.textSecondary,
          opacity: 0.7,
        }}>
          {subtext}
        </p>
      )}
    </div>
  );
};

export default EmptyState;