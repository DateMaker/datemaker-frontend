import React, { useState, useEffect } from 'react';
import { Star, Award, TrendingUp, Heart, Zap, Trophy, Share2, CheckCircle } from 'lucide-react';

const DateRecap = ({ dateData, pointsEarned, leveledUp, newLevel, onClose, onShare }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatePoints, setAnimatePoints] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimatePoints(true), 500);
    if (leveledUp) {
      setTimeout(() => setShowConfetti(true), 1000);
    }
  }, [leveledUp]);

  const achievements = dateData.achievements || [];
  const challengesCompleted = dateData.challengesCompleted || 0;
  const totalChallenges = dateData.totalChallenges || 0;
  const stopsVisited = dateData.stopsVisited || 0;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 100
        }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${Math.random() * 100}%`,
                width: '10px',
                height: '10px',
                background: ['#FFD700', '#FF6B35', '#9D4EDD', '#06D6A0', '#4facfe'][Math.floor(Math.random() * 5)],
                animation: `confettiFall ${2 + Math.random() * 2}s linear forwards`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {leveledUp && (
          <div style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(255, 215, 0, 0.4)',
            animation: 'scaleIn 0.5s ease-out',
            border: '3px solid rgba(255,255,255,0.5)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{newLevel.icon}</div>
            <h2 style={{ 
              fontSize: '3rem', 
              fontWeight: '900', 
              color: 'white',
              marginBottom: '0.5rem',
              textShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              LEVEL UP!
            </h2>
            <p style={{ 
              fontSize: '1.5rem', 
              color: 'rgba(255,255,255,0.95)',
              fontWeight: '700',
              margin: 0
            }}>
              You're now a {newLevel.name}!
            </p>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '32px',
          padding: '3rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          marginBottom: '2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '900',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              Date Complete!
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#6b7280', fontWeight: '500' }}>
              Amazing work, here's your summary
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderRadius: '24px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem',
            transform: animatePoints ? 'scale(1)' : 'scale(0.8)',
            opacity: animatePoints ? 1 : 0,
            transition: 'all 0.5s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <Zap size={40} style={{ color: 'white' }} />
              <div>
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: '600' }}>
                  Points Earned
                </p>
                <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white', margin: 0 }}>
                  +{pointsEarned}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '2px solid #667eea40'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
              <p style={{ fontSize: '2rem', fontWeight: '900', color: '#667eea', margin: 0 }}>
                {stopsVisited}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, fontWeight: '600' }}>
                Stops Visited
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #FF6B3515 0%, #FF8C4215 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '2px solid #FF6B3540'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <p style={{ fontSize: '2rem', fontWeight: '900', color: '#FF6B35', margin: 0 }}>
                {challengesCompleted}/{totalChallenges}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, fontWeight: '600' }}>
                Challenges
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #9D4EDD15 0%, #C77DFF15 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '2px solid #9D4EDD40'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <p style={{ fontSize: '2rem', fontWeight: '900', color: '#9D4EDD', margin: 0 }}>
                {achievements.length}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, fontWeight: '600' }}>
                Achievements
              </p>
            </div>
          </div>

          {achievements.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Award style={{ color: '#9D4EDD' }} size={28} />
                New Achievements!
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {achievements.map((achievement, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'linear-gradient(135deg, #9D4EDD15 0%, #C77DFF15 100%)',
                      borderRadius: '16px',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      border: '2px solid #9D4EDD40',
                      animation: `slideIn 0.5s ease-out ${idx * 0.1}s both`
                    }}
                  >
                    <div style={{ fontSize: '2rem' }}>{achievement.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0, color: '#111827' }}>
                        {achievement.name}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                        {achievement.description}
                      </p>
                    </div>
                    <CheckCircle size={24} style={{ color: '#06D6A0' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: '#f9fafb',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>
              How was your date?
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '2.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  onClick={() => console.log('Rated:', rating)}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onShare}
              style={{
                flex: 1,
                minWidth: '200px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: '700',
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              <Share2 size={20} />
              Share Your Date
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                minWidth: '200px',
                background: 'white',
                color: '#667eea',
                fontWeight: '700',
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                borderRadius: '50px',
                border: '2px solid #667eea',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#667eea';
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DateRecap;