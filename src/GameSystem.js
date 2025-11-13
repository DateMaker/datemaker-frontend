// GameSystem.js - Core Gamification Logic
export const LEVELS = [
  { level: 1, name: 'First Timers', minXP: 0, maxXP: 1000, color: '#94a3b8', icon: '🌱' },
  { level: 2, name: 'Date Rookies', minXP: 1000, maxXP: 1500, color: '#60a5fa', icon: '⭐' },
  { level: 3, name: 'Romance Enthusiasts', minXP: 1500, maxXP: 2000, color: '#a78bfa', icon: '💫' },
  { level: 4, name: 'Adventure Seekers', minXP: 2000, maxXP: 4000, color: '#f472b6', icon: '🚀' },
  { level: 5, name: 'Relationship Masters', minXP: 4000, maxXP: 6000, color: '#fb923c', icon: '👑' },
  { level: 6, name: 'Legendary Lovers', minXP: 6000, maxXP: 8000, color: '#FFD700', icon: '💎' },
  { level: 7, name: 'Date Master', minXP: 8000, maxXP: 999999, color: '#FF1493', icon: '🫡' }
];

export const POINT_VALUES = {
  COMPLETE_STOP: 10,
  COMPLETE_CHALLENGE: 20,
  COMPLETE_DATE: 50,
  SHARE_PHOTO: 15,
  REVIEW_VENUE: 10,
  TRY_NEW_THING: 25,
  MYSTERY_MODE: 30,
  DARE_MODE: 40,
  WEEKLY_STREAK: 100,
  FIRST_TIME_ACTIVITY: 35
};

export const calculateLevel = (xp) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export const getProgressToNextLevel = (xp) => {
  const currentLevel = calculateLevel(xp);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  
  if (!nextLevel) {
    return { percentage: 100, pointsNeeded: 0, currentLevelXP: xp };
  }
  
  const currentLevelXP = xp - currentLevel.minXP;
  const totalNeeded = nextLevel.minXP - currentLevel.minXP;
  const percentage = (currentLevelXP / totalNeeded) * 100;
  const pointsNeeded = nextLevel.minXP - xp;
  
  return { percentage, pointsNeeded, currentLevelXP, totalNeeded };
};

export const formatXP = (xp) => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
};