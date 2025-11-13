import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatXP } from './GameSystem';

const XPBar = ({ level, progress, xp, onClick }) => {
  const percentage = Math.min(progress.percentage || 0, 100);
  const isMaxLevel = level.level === 6;

  return (
    <div 
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '2px solid rgba(0,0,0,0.05)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      }}
    >
      {/* Level Badge and Name */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${level.color}, ${level.color}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            boxShadow: `0 4px 12px ${level.color}40`
          }}>
            {level.icon}
          </div>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Level {level.level}
              </span>
              {!isMaxLevel && (
                <TrendingUp size={14} style={{ color: level.color }} />
              )}
            </div>
            <p style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: level.color,
              margin: 0
            }}>
              {level.name}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: '900',
            background: `linear-gradient(135deg, ${level.color}, ${level.color}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            lineHeight: 1
          }}>
            {formatXP(xp)}
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            margin: 0,
            fontWeight: '600'
          }}>
            XP
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {!isMaxLevel ? (
        <>
          <div style={{
            width: '100%',
            height: '12px',
            background: '#e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${level.color}, ${level.color}dd)`,
              borderRadius: '6px',
              transition: 'width 0.5s ease-out',
              boxShadow: `0 0 10px ${level.color}60`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Animated shine effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shine 2s ease-in-out infinite'
              }} />
            </div>
          </div>

          {/* XP Text */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0,
              fontWeight: '600'
            }}>
              {formatXP(progress.currentLevelXP || 0)} / {formatXP(progress.totalNeeded || 0)}
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: level.color,
              margin: 0,
              fontWeight: '700'
            }}>
              {formatXP(progress.pointsNeeded || 0)} to next level
            </p>
          </div>
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: `linear-gradient(135deg, ${level.color}20, ${level.color}10)`,
          borderRadius: '8px',
          border: `2px solid ${level.color}40`
        }}>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: '700',
            background: `linear-gradient(135deg, ${level.color}, ${level.color}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            🎉 Max Level Reached!
          </p>
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default XPBar;