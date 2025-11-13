import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';

// All Achievement Definitions
export const ACHIEVEMENTS = {
  starter: [
    { 
      id: 'first_quest', 
      name: 'First Quest Complete', 
      description: 'Complete your first date',
      icon: '🎯',
      requirement: { type: 'datesCompleted', value: 1 },
      points: 50,
      rarity: 'common'
    },
    
    { 
      id: 'conversation_master', 
      name: 'Conversation Master', 
      description: 'Complete 5 conversation challenges',
      icon: '🗣️',
      requirement: { type: 'conversationChallenges', value: 5 },
      points: 50,
      rarity: 'common'
    },
    { 
      id: 'foodie_explorer', 
      name: 'Foodie Explorer', 
      description: 'Try 10 new dishes',
      icon: '🍽️',
      requirement: { type: 'newDishes', value: 10 },
      points: 75,
      rarity: 'common'
    }
  ],
  
  intermediate: [
    { 
      id: 'dare_devil', 
      name: 'Dare Devil', 
      description: 'Complete 25 dare challenges',
      icon: '🔥',
      requirement: { type: 'dareChallenges', value: 25 },
      points: 100,
      rarity: 'uncommon'
    },
    { 
      id: 'local_explorer', 
      name: 'Local Explorer', 
      description: 'Visit 20 different places',
      icon: '🌍',
      requirement: { type: 'placesVisited', value: 20 },
      points: 100,
      rarity: 'uncommon'
    },
    { 
      id: 'challenge_champion', 
      name: 'Challenge Champion', 
      description: 'Complete 50 challenges',
      icon: '💪',
      requirement: { type: 'challengesCompleted', value: 50 },
      points: 150,
      rarity: 'uncommon'
    },
    { 
      id: 'social_butterfly', 
      name: 'Social Butterfly', 
      description: 'Share 10 dates with the community',
      icon: '🎭',
      requirement: { type: 'datesShared', value: 10 },
      points: 100,
      rarity: 'uncommon'
    }
  ],
  
  advanced: [
    { 
      id: 'date_royalty', 
      name: 'Date Royalty', 
      description: 'Complete 100 dates',
      icon: '👑',
      requirement: { type: 'datesCompleted', value: 100 },
      points: 500,
      rarity: 'rare'
    },
    { 
      id: 'five_star', 
      name: '5-Star Rating', 
      description: 'Get 50 perfect ratings',
      icon: '⭐',
      requirement: { type: 'perfectRatings', value: 50 },
      points: 300,
      rarity: 'rare'
    },
    { 
      id: 'renaissance_couple', 
      name: 'Renaissance Couple', 
      description: 'Try all activity types',
      icon: '🎪',
      requirement: { type: 'allActivityTypes', value: true },
      points: 250,
      rarity: 'rare'
    },
    { 
      id: 'legendary_status', 
      name: 'Legendary Status', 
      description: 'Reach max level',
      icon: '💎',
      requirement: { type: 'level', value: 6 },
      points: 1000,
      rarity: 'legendary'
    }
  ],
  
  special: [
   
    { 
      id: 'night_owl', 
      name: 'Night Owl', 
      description: 'Complete 10 late-night dates',
      icon: '🌙',
      requirement: { type: 'lateNightDates', value: 10 },
      points: 150,
      rarity: 'uncommon'
    },
    { 
      id: 'early_bird', 
      name: 'Early Bird', 
      description: 'Complete 10 morning dates',
      icon: '☀️',
      requirement: { type: 'morningDates', value: 10 },
      points: 150,
      rarity: 'uncommon'
    },
    { 
      id: 'Going for a walk', 
      name: 'Going for a walk', 
      description: 'Complete dates in 5+ cities',
      icon: '🌍',
      requirement: { type: 'citiesVisited', value: 5 },
      points: 1000,
      rarity: 'rare'
    },
    
    { 
      id: 'lucky_seven', 
      name: 'Lucky 7', 
      description: 'Complete 7 mystery dates',
      icon: '🎲',
      requirement: { type: 'mysteryDates', value: 7 },
      points: 250,
      rarity: 'rare'
    },
    { 
      id: 'streak_master', 
      name: 'Streak Master', 
      description: '7 consecutive weeks of dates',
      icon: '🔥',
      requirement: { type: 'weeklyStreak', value: 7 },
      points: 2000,
      rarity: 'rare'
    }
  ]
};

// Check if achievement is unlocked
export const checkAchievement = (achievement, userStats) => {
  const { type, value } = achievement.requirement;
  
  if (type === 'allActivityTypes') {
    // Check if user has tried all activity types
    return userStats.activityTypes?.length >= 5;
  }
  
  return userStats[type] >= value;
};

// Get all achievements with unlock status
export const getAllAchievements = (userStats) => {
  const allAchievements = [
    ...ACHIEVEMENTS.starter,
    ...ACHIEVEMENTS.intermediate,
    ...ACHIEVEMENTS.advanced,
    ...ACHIEVEMENTS.special
  ];
  
  return allAchievements.map(achievement => ({
    ...achievement,
    unlocked: checkAchievement(achievement, userStats)
  }));
};

// Achievements Display Component
const AchievementsDisplay = ({ userStats, onClose }) => {
  const achievements = getAllAchievements(userStats);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  const rarityColors = {
    common: { bg: '#94a3b8', glow: '#94a3b820' },
    uncommon: { bg: '#22c55e', glow: '#22c55e20' },
    rare: { bg: '#3b82f6', glow: '#3b82f620' },
    legendary: { bg: '#a855f7', glow: '#a855f720' }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated stars background */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '2px',
            height: '2px',
            background: 'white',
            borderRadius: '50%',
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '900', 
              color: 'white',
              marginBottom: '0.5rem',
              textShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
            }}>
              🏆 Achievements
            </h1>
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'rgba(255,255,255,0.7)',
              fontWeight: '500'
            }}>
              Unlock badges as you explore
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.75rem 2rem', 
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← Back
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '3rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', margin: 0 }}>
              Overall Progress
            </h3>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
              {unlockedCount}/{totalCount}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
              borderRadius: '10px',
              transition: 'width 1s ease-out',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
            }} />
          </div>
        </div>

        {/* Achievement Categories */}
        {Object.entries(ACHIEVEMENTS).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '1.5rem',
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {category === 'starter' && '🌱'}
              {category === 'intermediate' && '⭐'}
              {category === 'advanced' && '🚀'}
              {category === 'special' && '✨'}
              {category} Achievements
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {items.map((achievement) => {
                const isUnlocked = checkAchievement(achievement, userStats);
                const colors = rarityColors[achievement.rarity];
                
                return (
                  <div
                    key={achievement.id}
                    style={{
                      background: isUnlocked 
                        ? `linear-gradient(135deg, ${colors.bg}20 0%, ${colors.bg}10 100%)`
                        : 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      border: isUnlocked 
                        ? `2px solid ${colors.bg}60`
                        : '2px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      boxShadow: isUnlocked ? `0 0 30px ${colors.glow}` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = isUnlocked 
                        ? `0 8px 40px ${colors.glow}` 
                        : '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isUnlocked 
                        ? `0 0 30px ${colors.glow}` 
                        : 'none';
                    }}
                  >
                    {/* Locked/Unlocked Icon */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      opacity: isUnlocked ? 1 : 0.3
                    }}>
                      {isUnlocked ? (
                        <CheckCircle size={24} style={{ color: colors.bg }} />
                      ) : (
                        <Lock size={24} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      )}
                    </div>

                    {/* Achievement Icon */}
                    <div style={{
                      fontSize: '3.5rem',
                      marginBottom: '1rem',
                      filter: isUnlocked ? 'none' : 'grayscale(100%)',
                      opacity: isUnlocked ? 1 : 0.3
                    }}>
                      {achievement.icon}
                    </div>

                    {/* Achievement Info */}
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: isUnlocked ? 'white' : 'rgba(255,255,255,0.4)',
                      marginBottom: '0.5rem'
                    }}>
                      {achievement.name}
                    </h3>
                    
                    <p style={{
                      fontSize: '0.875rem',
                      color: isUnlocked ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                      marginBottom: '1rem',
                      lineHeight: '1.5'
                    }}>
                      {achievement.description}
                    </p>

                    {/* Points Badge */}
                    <div style={{
                      display: 'inline-block',
                      background: isUnlocked ? colors.bg : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '50px',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}>
                      +{achievement.points} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default AchievementsDisplay;