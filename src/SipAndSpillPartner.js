import React, { useState } from 'react';
import { X, ExternalLink, Wine, Sparkles } from 'lucide-react';
import HapticService from './HapticService';

// ============================================
// 🎯 PARTNER CONFIG
// ============================================
const PARTNER_CONFIG = {
  name: 'Sip & Spill',
  tagline: 'Bold, Flirty Couples Games',
  description: 'Truth-twisting questions & spicy dares for unforgettable date nights!',
  url: 'https://www.sipandspill.co.uk/gamedeck',
  storeUrl: 'https://www.sipandspill.co.uk/store-1',
  instagram: 'https://www.instagram.com/sipandspillgames/',
  tiktok: 'https://www.tiktok.com/@sipandspillgames',
  emoji: '🍷',
  colors: {
    primary: '#ef4444',
    secondary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)'
  }
};

// ============================================
// 🏠 HOMEPAGE BANNER
// Large, eye-catching banner for main screen
// ============================================
export function SipAndSpillHomeBanner({ onClose }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleOpen = () => {
    HapticService.tapMedium();
    window.open(PARTNER_CONFIG.url, '_blank');
  };

  return (
    <div style={{
      background: PARTNER_CONFIG.colors.gradient,
      borderRadius: '20px',
      padding: '1.25rem',
      margin: '0 1rem 1rem',
      position: 'relative',
      boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
    }}>
      {/* Dismiss button */}
      {onClose && (
        <button
          onClick={() => { setDismissed(true); onClose?.(); }}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'rgba(0,0,0,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          <X size={16} />
        </button>
      )}

      {/* Partner Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'rgba(255,255,255,0.2)',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '0.75rem'
      }}>
        <Sparkles size={12} />
        FEATURED PARTNER
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          fontSize: '3rem',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '0.75rem',
          lineHeight: 1
        }}>
          🍷
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            color: 'white', 
            fontSize: '1.25rem', 
            fontWeight: '800', 
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {PARTNER_CONFIG.name}
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '0.85rem', 
            margin: '0.25rem 0 0 0',
            lineHeight: 1.3
          }}>
            {PARTNER_CONFIG.tagline}
          </p>
        </div>
      </div>

      <button
        onClick={handleOpen}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.875rem',
          background: 'white',
          border: 'none',
          borderRadius: '12px',
          color: PARTNER_CONFIG.colors.primary,
          fontWeight: '700',
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Wine size={18} />
        Play Free Couples Games
        <ExternalLink size={16} />
      </button>
    </div>
  );
}

// ============================================
// 🎲 COMPACT CARD
// Smaller card for lists and grids
// ============================================
export function SipAndSpillCard({ variant = 'default' }) {
  const handleOpen = () => {
    HapticService.tapMedium();
    window.open(PARTNER_CONFIG.url, '_blank');
  };

  return (
    <button
      onClick={handleOpen}
      style={{
        background: variant === 'dark' 
          ? 'rgba(239, 68, 68, 0.15)' 
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))',
        border: `2px solid ${variant === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
        borderRadius: '16px',
        padding: '1rem',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '2rem' }}>🍷</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              color: variant === 'dark' ? 'white' : '#1f2937', 
              fontWeight: '700', 
              fontSize: '0.95rem' 
            }}>
              Sip & Spill
            </span>
            <span style={{
              background: PARTNER_CONFIG.colors.gradient,
              color: 'white',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.55rem',
              fontWeight: '700'
            }}>
              ⭐ PARTNER
            </span>
          </div>
          <p style={{ 
            color: variant === 'dark' ? 'rgba(255,255,255,0.7)' : '#6b7280', 
            fontSize: '0.8rem', 
            margin: '0.25rem 0 0 0' 
          }}>
            Couples drinking games 🔥
          </p>
        </div>
        <ExternalLink size={18} color={variant === 'dark' ? 'rgba(255,255,255,0.5)' : '#9ca3af'} />
      </div>
    </button>
  );
}

// ============================================
// 🎰 DATE GENERATION SUGGESTION
// Shows after generating a date
// ============================================
export function SipAndSpillDateSuggestion({ dateType = 'night-out' }) {
  const handleOpen = () => {
    HapticService.tapMedium();
    window.open(PARTNER_CONFIG.url, '_blank');
  };

  const getMessage = () => {
    switch (dateType) {
      case 'dinner':
        return 'Spice up dinner with a couples game! 🍷';
      case 'home':
        return 'Perfect for a cozy night in! 🏠';
      case 'drinks':
        return 'Make it a game night too! 🎲';
      default:
        return 'Add some fun to your date! 🔥';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))',
      border: '2px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '16px',
      padding: '1rem',
      marginTop: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🍷</span>
        <div style={{ flex: 1 }}>
          <p style={{ 
            color: 'white', 
            fontWeight: '600', 
            fontSize: '0.9rem',
            margin: 0 
          }}>
            {getMessage()}
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            fontSize: '0.75rem',
            margin: '0.25rem 0 0 0'
          }}>
            Play Sip & Spill - Featured Partner
          </p>
        </div>
        <button
          onClick={handleOpen}
          style={{
            background: PARTNER_CONFIG.colors.gradient,
            border: 'none',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            color: 'white',
            fontWeight: '700',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          Play <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================
// 💬 TALK PROMPT INTEGRATION
// Add Sip & Spill questions to Talk Prompt
// ============================================
export const SIP_AND_SPILL_PROMPTS = [
  {
    category: '🍷 Sip & Spill',
    questions: [
      "If you had to describe our relationship as a cocktail, what would be in it?",
      "What's one thing you've always wanted to ask me but were too shy?",
      "Sip if you've ever stalked my social media before we dated!",
      "What's the most romantic thing you've imagined us doing together?",
      "If we could swap lives for a day, what would you do first?",
      "Sip if you thought about me before falling asleep this week!",
      "What's a date night activity you've always wanted to try with me?",
      "What song reminds you of us and why?",
      "Sip if you've ever pretended to like something just to impress me!",
      "What's your favorite memory of us so far?"
    ],
    partnerLink: PARTNER_CONFIG.url,
    partnerName: PARTNER_CONFIG.name
  }
];

// ============================================
// 🎁 WILDCARD INTEGRATION  
// Add Sip & Spill to Wildcard options
// ============================================
export const SIP_AND_SPILL_WILDCARDS = [
  {
    id: 'sip-spill-game',
    emoji: '🍷',
    title: 'Play Sip & Spill!',
    description: 'Take a break and play a couples drinking game together',
    action: 'open_link',
    link: PARTNER_CONFIG.url,
    isPartner: true
  },
  {
    id: 'sip-spill-truth',
    emoji: '😈',
    title: 'Spicy Truth Time',
    description: 'Each share one secret the other doesn\'t know - or take a sip!',
    action: 'prompt',
    isPartner: true,
    partnerCredit: 'Inspired by Sip & Spill'
  },
  {
    id: 'sip-spill-dare',
    emoji: '🔥',
    title: 'Dare Challenge',
    description: 'Give your partner a flirty dare - they do it or sip!',
    action: 'prompt',
    isPartner: true,
    partnerCredit: 'Inspired by Sip & Spill'
  }
];

// ============================================
// 📱 INTEGRATION HELPER
// Easy function to open Sip & Spill
// ============================================
export const openSipAndSpill = (section = 'game') => {
  HapticService.tapMedium();
  const url = section === 'store' ? PARTNER_CONFIG.storeUrl : PARTNER_CONFIG.url;
  window.open(url, '_blank');
};

// ============================================
// 🔧 EXPORT CONFIG
// ============================================
export { PARTNER_CONFIG };

export default {
  SipAndSpillHomeBanner,
  SipAndSpillCard,
  SipAndSpillDateSuggestion,
  SIP_AND_SPILL_PROMPTS,
  SIP_AND_SPILL_WILDCARDS,
  openSipAndSpill,
  PARTNER_CONFIG
};
