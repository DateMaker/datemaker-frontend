import React, { useEffect } from 'react';
import { Trophy, Star, MapPin, Camera, Flame, TrendingUp, Award, Target } from 'lucide-react';

const StatsDisplay = ({ gameStats, onClose }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);
  if (!gameStats) return null;

  const stats = [
    { 
      label: 'Dates Completed', 
      value: gameStats.datesCompleted || 0, 
      icon: <Trophy size={24} />,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgColor: '#f0f4ff'
    },
    { 
      label: 'Challenges Won', 
      value: gameStats.challengesCompleted || 0, 
      icon: <Target size={24} />,
      color: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
      bgColor: '#fff4f0'
    },
    { 
      label: 'Places Visited', 
      value: gameStats.placesVisited || 0, 
      icon: <MapPin size={24} />,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      bgColor: '#f0fbff'
    },
    { 
      label: 'Dates Shared', 
      value: gameStats.datesShared || 0,
      icon: <Camera size={24} />,
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      bgColor: '#fff9f0'
    },
    { 
      label: 'Current Streak', 
      value: `${gameStats.currentStreak || 0} days`, 
      icon: <Flame size={24} />,
      color: 'linear-gradient(135deg, #FF0033 0%, #FF6B35 100%)',
      bgColor: '#fff0f0'
    },
    { 
      label: 'Longest Streak', 
      value: `${gameStats.longestStreak || 0} days`, 
      icon: <TrendingUp size={24} />,
      color: 'linear-gradient(135deg, #9D4EDD 0%, #C77DFF 100%)',
      bgColor: '#faf0ff'
    },
    { 
      label: 'Total XP', 
      value: gameStats.xp || 0, 
      icon: <Star size={24} />,
      color: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      bgColor: '#fffbf0'
    },
    { 
      label: 'Achievements', 
      value: (gameStats.achievements?.length || 0), 
      icon: <Award size={24} />,
      color: 'linear-gradient(135deg, #06D6A0 0%, #1B9AAA 100%)',
      bgColor: '#f0fff9'
    }
  ];

  const venueStats = gameStats.venueStats || {
    food: 0,
    drinks: 0,
    entertainment: 0,
    outdoor: 0,
    activity: 0
  };

  return (
   <div style={{ 
      minHeight: '100vh',
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      backgroundColor: '#f093fb',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{ padding: '2rem' }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: '900', 
                color: 'white',
                marginBottom: '0.5rem',
                textShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                📊 Your Stats Dashboard
              </h1>
              <p style={{ 
                fontSize: '1.25rem', 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '500'
              }}>
                Track your dating journey
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{ 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '0.75rem 2rem', 
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              ← Back
            </button>
          </div>

          {/* Main Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {stats.map((stat, index) => (
              <div 
                key={index}
                style={{ 
                  background: 'white',
                  borderRadius: '24px',
                  padding: '2rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '120px',
                  height: '120px',
                  background: stat.bgColor,
                  borderRadius: '0 24px 0 100%',
                  opacity: 0.6
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    width: '60px',
                    height: '60px',
                    background: stat.color,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {stat.icon}
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '0.95rem', 
                    color: '#6b7280',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {stat.label}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '900',
                    background: stat.color,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                  }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Category Breakdown */}
          <div style={{
            background: 'white',
            borderRadius: '32px',
            padding: '3rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '900',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🎯 Your Favorite Activities
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { label: '🍽️ Food Venues', value: venueStats.food || 0, color: '#FF6B35' },
                { label: '🍸 Drink Spots', value: venueStats.drinks || 0, color: '#9D4EDD' },
                { label: '🎭 Entertainment', value: venueStats.entertainment || 0, color: '#667eea' },
                { label: '🌳 Outdoor', value: venueStats.outdoor || 0, color: '#06D6A0' },
                { label: '🎯 Activities', value: venueStats.activity || 0, color: '#4facfe' }
              ].map((cat, idx) => (
                <div key={idx} style={{
                  padding: '1.5rem',
                  background: `${cat.color}15`,
                  borderRadius: '16px',
                  border: `2px solid ${cat.color}40`,
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', fontWeight: '600' }}>
                    {cat.label}
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: '900', color: cat.color, margin: 0 }}>
                    {cat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        body, html {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-color: #f093fb;
          min-height: 100vh;
          min-height: 100dvh;
        }
        #root {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-color: #f093fb;
          min-height: 100vh;
          min-height: 100dvh;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
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

export default StatsDisplay;