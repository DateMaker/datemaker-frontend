// ============================================
// 🎵 DATE MUSIC SERVICE
// DateMaker - Spotify Playlists & Ambient Sounds
// ============================================
// Set the perfect vibe for every date
// ============================================

import React, { useState } from 'react';
import { Volume2, Music, Play, ExternalLink, X } from 'lucide-react';
import HapticService from './HapticService';

// ============================================
// 🎧 SPOTIFY PLAYLIST DATABASE
// ============================================
export const SPOTIFY_PLAYLISTS = {
  // Mood-based playlists
  romantic: {
    name: 'Romantic Evening',
    emoji: '💕',
    description: 'Soft, romantic songs for intimate moments',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4E3UdUs7fUx',
    spotifyId: '37i9dQZF1DX4E3UdUs7fUx',
    color: '#ec4899'
  },
  cozy: {
    name: 'Cozy Night In',
    emoji: '🛋️',
    description: 'Warm, comforting tunes for staying in',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    spotifyId: '37i9dQZF1DWWQRwui0ExPn',
    color: '#f59e0b'
  },
  adventure: {
    name: 'Adventure Vibes',
    emoji: '🏔️',
    description: 'Energetic tracks for outdoor dates',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0h0QnLkMBl4',
    spotifyId: '37i9dQZF1DX0h0QnLkMBl4',
    color: '#22c55e'
  },
  dinner: {
    name: 'Dinner Date',
    emoji: '🍽️',
    description: 'Sophisticated background music for dining',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4xuWVBs4FgJ',
    spotifyId: '37i9dQZF1DX4xuWVBs4FgJ',
    color: '#8b5cf6'
  },
  lofi: {
    name: 'Lo-Fi Chill',
    emoji: '📻',
    description: 'Relaxed beats for quality time',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
    spotifyId: '37i9dQZF1DWWQRwui0ExPn',
    color: '#6366f1'
  },
  energetic: {
    name: 'Dance Party',
    emoji: '💃',
    description: 'Upbeat tracks to get moving',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC',
    spotifyId: '37i9dQZF1DXdPec7aLTmlC',
    color: '#ef4444'
  },
  jazz: {
    name: 'Jazz Cafe',
    emoji: '🎷',
    description: 'Smooth jazz for a classy evening',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWVqJMsgEN0F4',
    spotifyId: '37i9dQZF1DWVqJMsgEN0F4',
    color: '#0ea5e9'
  },
  acoustic: {
    name: 'Acoustic Love',
    emoji: '🎸',
    description: 'Stripped-back acoustic tracks',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4E3UdUs7fUx',
    spotifyId: '37i9dQZF1DX4E3UdUs7fUx',
    color: '#84cc16'
  },
  summer: {
    name: 'Summer Vibes',
    emoji: '☀️',
    description: 'Feel-good summer tracks',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2yvmlOdMYzV',
    spotifyId: '37i9dQZF1DX2yvmlOdMYzV',
    color: '#fbbf24'
  },
  sleep: {
    name: 'Fall Asleep Together',
    emoji: '🌙',
    description: 'Gentle music to drift off to',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp',
    spotifyId: '37i9dQZF1DWZd79rJ6a7lp',
    color: '#6366f1'
  },
  
  // Category-based playlists
  food: {
    name: 'Foodie Playlist',
    emoji: '🍕',
    description: 'Perfect background for food dates',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4xuWVBs4FgJ',
    spotifyId: '37i9dQZF1DX4xuWVBs4FgJ',
    color: '#f97316'
  },
  outdoor: {
    name: 'Outdoor Adventures',
    emoji: '🌲',
    description: 'Nature-inspired tunes',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZwtERXCS82H',
    spotifyId: '37i9dQZF1DWZwtERXCS82H',
    color: '#22c55e'
  },
  nightlife: {
    name: 'Night Out',
    emoji: '🌃',
    description: 'City night vibes',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n',
    spotifyId: '37i9dQZF1DX4dyzvuaRJ0n',
    color: '#7c3aed'
  },
  workout: {
    name: 'Workout Together',
    emoji: '💪',
    description: 'High energy for active dates',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP',
    spotifyId: '37i9dQZF1DX76Wlfdnj7AP',
    color: '#ef4444'
  },
  yoga: {
    name: 'Yoga & Meditation',
    emoji: '🧘',
    description: 'Peaceful sounds for mindful moments',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JAYS9Ha',
    spotifyId: '37i9dQZF1DWZqd5JAYS9Ha',
    color: '#14b8a6'
  }
};

// ============================================
// 🔊 AMBIENT SOUNDS - Using Spotify Playlists
// Premium feature - curated ambient playlists
// ============================================
export const AMBIENT_SOUNDS = {
  rain: {
    name: 'Gentle Rain',
    emoji: '🌧️',
    description: 'Soothing rain sounds',
    color: '#3b82f6',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8ymr6UES7vc',
  },
  ocean: {
    name: 'Ocean Waves',
    emoji: '🌊',
    description: 'Calming ocean waves',
    color: '#06b6d4',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8',
  },
  fireplace: {
    name: 'Crackling Fire',
    emoji: '🔥',
    description: 'Cozy fireplace sounds',
    color: '#f97316',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2UgsUIg75Vg',
  },
  forest: {
    name: 'Forest Birds',
    emoji: '🌲',
    description: 'Peaceful forest ambience',
    color: '#22c55e',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8',
  },
  night: {
    name: 'Summer Night',
    emoji: '🌙',
    description: 'Crickets and gentle breeze',
    color: '#6366f1',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZd79rJ6a7lp',
  },
  cafe: {
    name: 'Coffee Shop',
    emoji: '☕',
    description: 'Cozy cafe atmosphere',
    color: '#92400e',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX6VdMW310YC7',
  },
  jazz: {
    name: 'Jazz Lounge',
    emoji: '🎷',
    description: 'Smooth jazz atmosphere',
    color: '#7c3aed',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWVqJMsgEN0F4',
  },
  spa: {
    name: 'Spa Relaxation',
    emoji: '💆',
    description: 'Tranquil spa sounds',
    color: '#ec4899',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JAYS9Ha',
  },
  piano: {
    name: 'Soft Piano',
    emoji: '🎹',
    description: 'Gentle piano melodies',
    color: '#8b5cf6',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
  },
  birds: {
    name: 'Morning Birds',
    emoji: '🐦',
    description: 'Cheerful birdsong',
    color: '#fbbf24',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8',
  },
  thunder: {
    name: 'Thunderstorm',
    emoji: '⛈️',
    description: 'Dramatic thunder and rain',
    color: '#475569',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8ymr6UES7vc',
  },
  lofi: {
    name: 'Lo-Fi Beats',
    emoji: '📻',
    description: 'Chill lo-fi hip hop',
    color: '#94a3b8',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn',
  }
};

// ============================================
// 🎯 GET PLAYLIST FOR DATE CATEGORY
// ============================================
export const getPlaylistForCategory = (category) => {
  const categoryMap = {
    'Food & Drink': SPOTIFY_PLAYLISTS.dinner,
    'Adventure': SPOTIFY_PLAYLISTS.adventure,
    'Entertainment': SPOTIFY_PLAYLISTS.lofi,
    'Outdoor': SPOTIFY_PLAYLISTS.outdoor,
    'Romantic': SPOTIFY_PLAYLISTS.romantic,
    'Nightlife': SPOTIFY_PLAYLISTS.nightlife,
    'Activity': SPOTIFY_PLAYLISTS.energetic,
    'Cultural': SPOTIFY_PLAYLISTS.acoustic,
    'Relaxation': SPOTIFY_PLAYLISTS.cozy,
    'Home': SPOTIFY_PLAYLISTS.cozy
  };
  
  return categoryMap[category] || SPOTIFY_PLAYLISTS.romantic;
};

// ============================================
// 🎵 SPOTIFY BUTTON COMPONENT
// ============================================
export const SpotifyButton = ({ playlist, size = 'normal' }) => {
  if (!playlist) return null;
  
  const handleClick = () => {
    HapticService.tapLight();
    window.open(playlist.spotifyUrl, '_blank');
  };
  
  const isCompact = size === 'compact';
  
  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isCompact ? '0.5rem' : '0.75rem',
        padding: isCompact ? '0.5rem 1rem' : '0.75rem 1.25rem',
        background: '#1ed760',
        border: 'none',
        borderRadius: isCompact ? '20px' : '12px',
        color: 'black',
        fontWeight: '700',
        fontSize: isCompact ? '0.85rem' : '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(30, 215, 96, 0.3)'
      }}
    >
      <Music size={isCompact ? 16 : 20} />
      {isCompact ? 'Play Vibe' : `🎵 ${playlist.name}`}
      <ExternalLink size={isCompact ? 12 : 14} />
    </button>
  );
};

// ============================================
// 🔊 AMBIENT SOUND BUTTON (Opens Spotify)
// ============================================
export const AmbientSoundPlayer = ({ sound, isPremium = false, onUpgrade }) => {
  
  const handlePlay = () => {
    if (!isPremium) {
      if (onUpgrade) onUpgrade();
      return;
    }
    
    HapticService.tapLight();
    // Open Spotify playlist for this ambient sound
    if (sound?.spotifyUrl) {
      window.open(sound.spotifyUrl, '_blank');
    }
  };
  
  if (!sound) return null;
  
  return (
    <div style={{
      background: `linear-gradient(135deg, ${sound.color}22, ${sound.color}11)`,
      border: `1px solid ${sound.color}44`,
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <button
        onClick={handlePlay}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: isPremium ? sound.color : 'rgba(255,255,255,0.1)',
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <Play size={24} />
      </button>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>{sound.emoji}</span>
          <span style={{ color: 'white', fontWeight: '600' }}>{sound.name}</span>
          {!isPremium && (
            <span style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.6rem',
              fontWeight: '700',
              color: '#1a1a2e'
            }}>
              PREMIUM
            </span>
          )}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
          {sound.description}
        </div>
      </div>
      
      {isPremium && (
        <div style={{
          background: '#1ed760',
          borderRadius: '8px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <img 
            src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" 
            alt="Spotify"
            style={{ height: '16px', filter: 'brightness(0)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================
// 🎶 MUSIC SELECTOR COMPONENT
// ============================================
export default function MusicSelector({ 
  category, 
  isPremium, 
  onClose, 
  onUpgrade,
  showAmbient = true 
}) {
  const [activeTab, setActiveTab] = useState('playlists');
  
  const suggestedPlaylist = category ? getPlaylistForCategory(category) : null;
  
  const openSpotifyPlaylist = (url) => {
    HapticService.tapLight();
    window.open(url, '_blank');
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 10001,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '60px 1.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Music size={28} color="#1ed760" />
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            Set the Vibe
          </h1>
        </div>
        
        <button
          onClick={onClose}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Spotify Info Banner */}
      <div style={{
        margin: '0 1.5rem 1rem',
        padding: '0.75rem 1rem',
        background: 'rgba(30, 215, 96, 0.1)',
        border: '1px solid rgba(30, 215, 96, 0.3)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>🎧</span>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
          Tap any playlist to open in Spotify
        </span>
      </div>

      {/* Tabs */}
      {showAmbient && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0 1.5rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={() => setActiveTab('playlists')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: activeTab === 'playlists' 
                ? 'linear-gradient(135deg, #1ed760, #1db954)'
                : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '10px',
              color: activeTab === 'playlists' ? 'black' : 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🎵 Playlists
          </button>
          <button
            onClick={() => setActiveTab('ambient')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: activeTab === 'ambient' 
                ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔊 Ambient
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '0 1.5rem 2rem'
      }}>
        {activeTab === 'playlists' && (
          <>
            {/* Suggested */}
            {suggestedPlaylist && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  SUGGESTED FOR THIS DATE
                </h3>
                <button
                  onClick={() => openSpotifyPlaylist(suggestedPlaylist.spotifyUrl)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(30, 215, 96, 0.2), rgba(30, 185, 84, 0.1))',
                    border: '2px solid #1ed760',
                    borderRadius: '16px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>{suggestedPlaylist.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
                      {suggestedPlaylist.name}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                      {suggestedPlaylist.description}
                    </div>
                  </div>
                  <div style={{
                    background: '#1ed760',
                    borderRadius: '10px',
                    padding: '0.5rem 1rem',
                    color: 'black',
                    fontWeight: '700',
                    fontSize: '0.85rem'
                  }}>
                    Open
                  </div>
                </button>
              </div>
            )}

            {/* All Playlists */}
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              ALL PLAYLISTS
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {Object.entries(SPOTIFY_PLAYLISTS).map(([key, playlist]) => (
                <button
                  key={key}
                  onClick={() => openSpotifyPlaylist(playlist.spotifyUrl)}
                  style={{
                    background: `linear-gradient(135deg, ${playlist.color}22, ${playlist.color}11)`,
                    border: '1px solid transparent',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{playlist.emoji}</span>
                  <div style={{ 
                    color: 'white', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    marginTop: '0.5rem'
                  }}>
                    {playlist.name}
                  </div>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    fontSize: '0.7rem',
                    marginTop: '0.25rem'
                  }}>
                    {playlist.description}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === 'ambient' && (
          <>
            {/* Premium Banner */}
            {!isPremium && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                borderRadius: '16px',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>
                  ✨ Premium Feature
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Unlock curated ambient playlists to set the perfect atmosphere
                </div>
                <button
                  onClick={onUpgrade}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Upgrade to Premium
                </button>
              </div>
            )}

            {/* Ambient Info */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                Ambient sounds open curated Spotify playlists for the perfect background atmosphere
              </span>
            </div>

            {/* Ambient Sounds Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {Object.entries(AMBIENT_SOUNDS).map(([key, sound]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (isPremium) {
                      HapticService.tapLight();
                      window.open(sound.spotifyUrl, '_blank');
                    } else {
                      onUpgrade?.();
                    }
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${sound.color}22, ${sound.color}11)`,
                    border: '1px solid transparent',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    opacity: isPremium ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    textAlign: 'left'
                  }}
                >
                  {!isPremium && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.55rem',
                      fontWeight: '700',
                      color: '#1a1a2e'
                    }}>
                      PRO
                    </div>
                  )}
                  <span style={{ fontSize: '1.5rem' }}>{sound.emoji}</span>
                  <div style={{ 
                    color: 'white', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    marginTop: '0.5rem'
                  }}>
                    {sound.name}
                  </div>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    fontSize: '0.7rem',
                    marginTop: '0.25rem'
                  }}>
                    {sound.description}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}