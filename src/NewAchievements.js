// ============================================
// 🏆 NEW ACHIEVEMENTS SYSTEM
// DateMaker Phase 3 - Engagement Features
// ============================================

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  dating: { name: 'Dating', emoji: '💕', color: '#ec4899' },
  explorer: { name: 'Explorer', emoji: '🗺️', color: '#3b82f6' },
  social: { name: 'Social', emoji: '👫', color: '#8b5cf6' },
  streak: { name: 'Streak', emoji: '🔥', color: '#f97316' },
  foodie: { name: 'Foodie', emoji: '🍽️', color: '#10b981' },
  timing: { name: 'Timing', emoji: '⏰', color: '#06b6d4' },
  special: { name: 'Special', emoji: '⭐', color: '#f59e0b' },
  hidden: { name: 'Hidden', emoji: '🔮', color: '#a855f7' }
};

// ============================================
// 🏆 ALL ACHIEVEMENTS (40+)
// ============================================
export const ACHIEVEMENTS = [
  // =====================
  // 💕 DATING ACHIEVEMENTS
  // =====================
  {
    id: 'first_date',
    title: 'First Date! 💕',
    description: 'Complete your first date',
    xp: 100,
    category: 'dating',
    icon: '💕',
    requirement: { type: 'dates_completed', count: 1 },
    hidden: false
  },
  {
    id: 'date_pro',
    title: 'Date Pro',
    description: 'Complete 10 dates',
    xp: 250,
    category: 'dating',
    icon: '🌟',
    requirement: { type: 'dates_completed', count: 10 },
    hidden: false
  },
  {
    id: 'date_master',
    title: 'Date Master',
    description: 'Complete 25 dates',
    xp: 500,
    category: 'dating',
    icon: '👑',
    requirement: { type: 'dates_completed', count: 25 },
    hidden: false
  },
  {
    id: 'date_legend',
    title: 'Date Legend',
    description: 'Complete 50 dates',
    xp: 1000,
    category: 'dating',
    icon: '🏆',
    requirement: { type: 'dates_completed', count: 50 },
    hidden: false
  },
  {
    id: 'perfect_date',
    title: 'Perfect Score',
    description: 'Complete all challenges on a date',
    xp: 200,
    category: 'dating',
    icon: '💯',
    requirement: { type: 'perfect_date', count: 1 },
    hidden: false
  },
  {
    id: 'marathon_date',
    title: 'Marathon Lovers',
    description: 'Complete a date lasting 6+ hours',
    xp: 300,
    category: 'dating',
    icon: '⏱️',
    requirement: { type: 'date_duration', hours: 6 },
    hidden: false
  },

  // =====================
  // 🗺️ EXPLORER ACHIEVEMENTS
  // =====================
  {
    id: 'first_explorer',
    title: 'Explorer',
    description: 'Visit 5 unique venues',
    xp: 150,
    category: 'explorer',
    icon: '🧭',
    requirement: { type: 'unique_venues', count: 5 },
    hidden: false
  },
  {
    id: 'venue_hunter',
    title: 'Venue Hunter',
    description: 'Visit 25 unique venues',
    xp: 400,
    category: 'explorer',
    icon: '🔍',
    requirement: { type: 'unique_venues', count: 25 },
    hidden: false
  },
  {
    id: 'city_expert',
    title: 'City Expert',
    description: 'Visit 50 unique venues',
    xp: 750,
    category: 'explorer',
    icon: '🏙️',
    requirement: { type: 'unique_venues', count: 50 },
    hidden: false
  },
  {
    id: 'hidden_gem',
    title: 'Hidden Gem Finder',
    description: 'Visit a venue with fewer than 50 reviews',
    xp: 200,
    category: 'explorer',
    icon: '💎',
    requirement: { type: 'hidden_gem', count: 1 },
    hidden: false
  },
  {
    id: 'terra_incognita',
    title: 'Terra Incognita',
    description: 'Go on a date in a new neighborhood',
    xp: 175,
    category: 'explorer',
    icon: '🗺️',
    requirement: { type: 'new_area', count: 1 },
    hidden: false
  },

  // =====================
  // 👫 SOCIAL ACHIEVEMENTS
  // =====================
  {
    id: 'first_share',
    title: 'Sharing is Caring',
    description: 'Share your first date on the feed',
    xp: 75,
    category: 'social',
    icon: '📤',
    requirement: { type: 'dates_shared', count: 1 },
    hidden: false
  },
  {
    id: 'influencer',
    title: 'Date Influencer',
    description: 'Share 10 dates on the feed',
    xp: 250,
    category: 'social',
    icon: '📱',
    requirement: { type: 'dates_shared', count: 10 },
    hidden: false
  },
  {
    id: 'memory_maker',
    title: 'Memory Maker',
    description: 'Create 5 date memories with photos',
    xp: 200,
    category: 'social',
    icon: '📸',
    requirement: { type: 'memories_created', count: 5 },
    hidden: false
  },
  {
    id: 'surprise_master',
    title: 'Surprise Master',
    description: 'Plan 3 surprise dates',
    xp: 350,
    category: 'social',
    icon: '🎁',
    requirement: { type: 'surprises_planned', count: 3 },
    hidden: false
  },
  {
    id: 'connector',
    title: 'The Connector',
    description: 'Have 10 friends on DateMaker',
    xp: 200,
    category: 'social',
    icon: '🤝',
    requirement: { type: 'friends_count', count: 10 },
    hidden: false
  },

  // =====================
  // 🔥 STREAK ACHIEVEMENTS
  // =====================
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Get a 2-week streak',
    xp: 150,
    category: 'streak',
    icon: '🔥',
    requirement: { type: 'streak_weeks', count: 2 },
    hidden: false
  },
  {
    id: 'on_fire',
    title: 'On Fire!',
    description: 'Get a 4-week streak',
    xp: 300,
    category: 'streak',
    icon: '🔥🔥',
    requirement: { type: 'streak_weeks', count: 4 },
    hidden: false
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Get an 8-week streak',
    xp: 600,
    category: 'streak',
    icon: '⚡',
    requirement: { type: 'streak_weeks', count: 8 },
    hidden: false
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Get a 12-week streak (3 months!)',
    xp: 1000,
    category: 'streak',
    icon: '👑',
    requirement: { type: 'streak_weeks', count: 12 },
    hidden: false
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Rebuild a streak after losing one',
    xp: 250,
    category: 'streak',
    icon: '💪',
    requirement: { type: 'streak_rebuilt', count: 1 },
    hidden: false
  },

  // =====================
  // 🍽️ FOODIE ACHIEVEMENTS
  // =====================
  {
    id: 'foodie_starter',
    title: 'Food Lover',
    description: 'Visit 5 restaurants',
    xp: 125,
    category: 'foodie',
    icon: '🍽️',
    requirement: { type: 'venue_category', category: 'food', count: 5 },
    hidden: false
  },
  {
    id: 'gourmet',
    title: 'Gourmet',
    description: 'Visit 15 different restaurants',
    xp: 350,
    category: 'foodie',
    icon: '🍷',
    requirement: { type: 'venue_category', category: 'food', count: 15 },
    hidden: false
  },
  {
    id: 'world_cuisine',
    title: 'World Traveler',
    description: 'Try 5 different cuisine types',
    xp: 400,
    category: 'foodie',
    icon: '🌍',
    requirement: { type: 'cuisine_types', count: 5 },
    hidden: false
  },
  {
    id: 'cocktail_connoisseur',
    title: 'Cocktail Connoisseur',
    description: 'Visit 10 bars or cocktail lounges',
    xp: 300,
    category: 'foodie',
    icon: '🍸',
    requirement: { type: 'venue_category', category: 'drinks', count: 10 },
    hidden: false
  },
  {
    id: 'brunch_bunch',
    title: 'Brunch Bunch',
    description: 'Have 5 brunch dates',
    xp: 200,
    category: 'foodie',
    icon: '🥞',
    requirement: { type: 'brunch_dates', count: 5 },
    hidden: false
  },

  // =====================
  // ⏰ TIMING ACHIEVEMENTS
  // =====================
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Start a date before 10am',
    xp: 150,
    category: 'timing',
    icon: '🌅',
    requirement: { type: 'start_time', before: '10:00' },
    hidden: false
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Have a date that ends after midnight',
    xp: 175,
    category: 'timing',
    icon: '🌙',
    requirement: { type: 'end_time', after: '00:00' },
    hidden: false
  },
  {
    id: 'weekday_warrior',
    title: 'Weekday Warrior',
    description: 'Complete 5 dates on weekdays',
    xp: 225,
    category: 'timing',
    icon: '📅',
    requirement: { type: 'weekday_dates', count: 5 },
    hidden: false
  },
  {
    id: 'spontaneous',
    title: 'Spontaneous!',
    description: 'Start a date within 30 min of generating it',
    xp: 200,
    category: 'timing',
    icon: '⚡',
    requirement: { type: 'spontaneous', minutes: 30 },
    hidden: false
  },

  // =====================
  // ⭐ SPECIAL ACHIEVEMENTS
  // =====================
  {
    id: 'challenge_champion',
    title: 'Challenge Champion',
    description: 'Complete 50 challenges',
    xp: 500,
    category: 'special',
    icon: '🏅',
    requirement: { type: 'challenges_completed', count: 50 },
    hidden: false
  },
  {
    id: 'xp_millionaire',
    title: 'XP Millionaire',
    description: 'Earn 10,000 total XP',
    xp: 1000,
    category: 'special',
    icon: '💰',
    requirement: { type: 'total_xp', count: 10000 },
    hidden: false
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Earn 25 achievements',
    xp: 750,
    category: 'special',
    icon: '✅',
    requirement: { type: 'achievements_earned', count: 25 },
    hidden: false
  },
  {
    id: 'anniversary',
    title: 'Happy Anniversary!',
    description: 'Use DateMaker for 1 year',
    xp: 2000,
    category: 'special',
    icon: '🎂',
    requirement: { type: 'account_age', days: 365 },
    hidden: false
  },

  // =====================
  // 🔮 HIDDEN ACHIEVEMENTS
  // =====================
  {
    id: 'hidden_refresh_master',
    title: '???',
    description: 'Unlock this hidden achievement',
    revealedTitle: 'Refresh Warrior',
    revealedDescription: 'Use refresh 10 times in one session',
    xp: 250,
    category: 'hidden',
    icon: '🔄',
    requirement: { type: 'refreshes_session', count: 10 },
    hidden: true
  },
  {
    id: 'hidden_midnight',
    title: '???',
    description: 'Unlock this hidden achievement',
    revealedTitle: 'Midnight Romance',
    revealedDescription: 'Generate a date exactly at midnight',
    xp: 300,
    category: 'hidden',
    icon: '🕛',
    requirement: { type: 'midnight_generate', tolerance: 60 },
    hidden: true
  },
  {
    id: 'hidden_valentines',
    title: '???',
    description: 'Unlock this hidden achievement',
    revealedTitle: 'Valentine\'s Day Special',
    revealedDescription: 'Complete a date on February 14th',
    xp: 500,
    category: 'hidden',
    icon: '💘',
    requirement: { type: 'specific_date', month: 2, day: 14 },
    hidden: true
  },
  {
    id: 'hidden_friday_13',
    title: '???',
    description: 'Unlock this hidden achievement',
    revealedTitle: 'Lucky in Love',
    revealedDescription: 'Complete a date on Friday the 13th',
    xp: 400,
    category: 'hidden',
    icon: '🍀',
    requirement: { type: 'friday_13' },
    hidden: true
  },
  {
    id: 'hidden_wheel_spin',
    title: '???',
    description: 'Unlock this hidden achievement',
    revealedTitle: 'Spin Doctor',
    revealedDescription: 'Use the spinning wheel 20 times',
    xp: 200,
    category: 'hidden',
    icon: '🎡',
    requirement: { type: 'wheel_spins', count: 20 },
    hidden: true
  },
  {
    id: 'hidden_perfect_week',
    title: '???',
    description: 'Unlock this hidden achievement',
    revealedTitle: 'Perfect Week',
    revealedDescription: 'Complete a date every day for a week',
    xp: 1000,
    category: 'hidden',
    icon: '🌟',
    requirement: { type: 'consecutive_days', count: 7 },
    hidden: true
  },
  {
    id: 'hidden_budget_king',
    title: '???',
    description: 'Unlock this hidden achievement',
    revealedTitle: 'Budget King/Queen',
    revealedDescription: 'Complete 5 dates at $0 cost',
    xp: 350,
    category: 'hidden',
    icon: '👑',
    requirement: { type: 'free_dates', count: 5 },
    hidden: true
  },
  {
    id: 'hidden_variety',
    title: '???',
    description: 'Unlock this hidden achievement',
    revealedTitle: 'Variety Pack',
    revealedDescription: 'Visit all venue categories in one month',
    xp: 400,
    category: 'hidden',
    icon: '🎨',
    requirement: { type: 'all_categories_month' },
    hidden: true
  }
];

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

// Get achievement by ID
export const getAchievementById = (id) => {
  return ACHIEVEMENTS.find(a => a.id === id) || null;
};

// Get achievements by category
export const getAchievementsByCategory = (category) => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

// Get visible achievements (non-hidden or already earned)
export const getVisibleAchievements = (earnedIds = []) => {
  return ACHIEVEMENTS.filter(a => !a.hidden || earnedIds.includes(a.id));
};

// Get hidden achievements
export const getHiddenAchievements = () => {
  return ACHIEVEMENTS.filter(a => a.hidden);
};

// Check if user qualifies for an achievement
export const checkAchievementProgress = (achievement, userStats) => {
  const req = achievement.requirement;
  
  switch (req.type) {
    case 'dates_completed':
      return {
        current: userStats.datesCompleted || 0,
        target: req.count,
        progress: Math.min(100, ((userStats.datesCompleted || 0) / req.count) * 100)
      };
    
    case 'unique_venues':
      return {
        current: userStats.placesVisited || 0,
        target: req.count,
        progress: Math.min(100, ((userStats.placesVisited || 0) / req.count) * 100)
      };
    
    case 'streak_weeks':
      return {
        current: userStats.currentStreak || 0,
        target: req.count,
        progress: Math.min(100, ((userStats.currentStreak || 0) / req.count) * 100)
      };
    
    case 'challenges_completed':
      return {
        current: userStats.challengesCompleted || 0,
        target: req.count,
        progress: Math.min(100, ((userStats.challengesCompleted || 0) / req.count) * 100)
      };
    
    case 'total_xp':
      return {
        current: userStats.xp || 0,
        target: req.count,
        progress: Math.min(100, ((userStats.xp || 0) / req.count) * 100)
      };
    
    case 'dates_shared':
      return {
        current: userStats.photosShared || 0,
        target: req.count,
        progress: Math.min(100, ((userStats.photosShared || 0) / req.count) * 100)
      };
    
    case 'venue_category':
      const catCount = userStats.venueStats?.[req.category] || 0;
      return {
        current: catCount,
        target: req.count,
        progress: Math.min(100, (catCount / req.count) * 100)
      };
    
    default:
      return { current: 0, target: req.count || 1, progress: 0 };
  }
};

// Check for newly earned achievements
export const checkForNewAchievements = (userStats, earnedAchievements = []) => {
  const newlyEarned = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    // Skip if already earned
    if (earnedAchievements.includes(achievement.id)) return;
    
    const progress = checkAchievementProgress(achievement, userStats);
    
    if (progress.progress >= 100) {
      newlyEarned.push(achievement);
    }
  });
  
  return newlyEarned;
};

// Get total possible XP from achievements
export const getTotalAchievementXP = () => {
  return ACHIEVEMENTS.reduce((sum, a) => sum + a.xp, 0);
};

// Get completion percentage
export const getAchievementCompletion = (earnedIds = []) => {
  return Math.round((earnedIds.length / ACHIEVEMENTS.length) * 100);
};

export default {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  getAchievementById,
  getAchievementsByCategory,
  getVisibleAchievements,
  getHiddenAchievements,
  checkAchievementProgress,
  checkForNewAchievements,
  getTotalAchievementXP,
  getAchievementCompletion
};