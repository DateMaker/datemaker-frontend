import React from 'react';
import { DollarSign, Globe, Sparkles, Music, ShoppingBag } from 'lucide-react';

export const DateModeSelector = ({ 
  onSelectFreeDate, 
  onSelectLongDistance, 
  onSelectMusic,
  onSelectShop,
  isPremium 
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginBottom: '1.5rem'
    }}>
      {/* Zero Dollar Date */}
      <button
        onClick={onSelectFreeDate}
        style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '16px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #22c55e, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem'
        }}>
          <DollarSign size={20} color="white" />
        </div>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>
          $0 Dates
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
          40+ free ideas
        </div>
      </button>

      {/* Long Distance */}
      <button
        onClick={onSelectLongDistance}
        style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem'
        }}>
          <Globe size={20} color="white" />
        </div>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>
          Long Distance
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
          Virtual dates
        </div>
      </button>

      {/* Music */}
      <button
        onClick={onSelectMusic}
        style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(30, 215, 96, 0.15), rgba(30, 185, 84, 0.1))',
          border: '2px solid rgba(30, 215, 96, 0.3)',
          borderRadius: '16px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: '#1ed760',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem'
        }}>
          <Music size={20} color="black" />
        </div>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>
          Date Vibes
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
          Spotify playlists
        </div>
      </button>

      {/* Shop */}
      <button
        onClick={onSelectShop}
        style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.1))',
          border: '2px solid rgba(236, 72, 153, 0.3)',
          borderRadius: '16px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.75rem'
        }}>
          <ShoppingBag size={20} color="white" />
        </div>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>
          Shop
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
          Themes & more
        </div>
        {/* New badge */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.6rem',
          fontWeight: '700',
          color: 'white'
        }}>
          NEW
        </div>
      </button>
    </div>
  );
};