// ============================================
// 🎯 DAILY CHALLENGES DATA
// DateMaker Phase 3 - Engagement Features
// ============================================

// Challenge categories with themed icons
export const CHALLENGE_CATEGORIES = {
  cuisine: { 
    name: 'Foodie', 
    emoji: '🍽️', 
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)'
  },
  activity: { 
    name: 'Adventure', 
    emoji: '🎯', 
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  },
  time: { 
    name: 'Timing', 
    emoji: '⏰', 
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
  },
  social: { 
    name: 'Social', 
    emoji: '👫', 
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
  },
  budget: { 
    name: 'Budget', 
    emoji: '💰', 
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  spontaneous: { 
    name: 'Spontaneous', 
    emoji: '⚡', 
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },
  romantic: { 
    name: 'Romantic', 
    emoji: '💕', 
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
  },
  explore: { 
    name: 'Explorer', 
    emoji: '🗺️', 
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
  }
};

// ============================================
// 🍽️ CUISINE CHALLENGES
// ============================================
export const CUISINE_CHALLENGES = [
  {
    id: 'cuisine_new_type',
    title: 'Taste Explorer',
    description: 'Try a cuisine you\'ve never had before',
    xp: 100,
    category: 'cuisine',
    difficulty: 'medium',
    tips: ['Check reviews for authentic spots', 'Ask staff for recommendations']
  },
  {
    id: 'cuisine_italian',
    title: 'Italian Night',
    description: 'Enjoy an Italian restaurant date',
    xp: 75,
    category: 'cuisine',
    difficulty: 'easy',
    cuisineType: 'italian'
  },
  {
    id: 'cuisine_asian',
    title: 'Asian Fusion',
    description: 'Experience Asian cuisine together',
    xp: 75,
    category: 'cuisine',
    difficulty: 'easy',
    cuisineType: 'asian'
  },
  {
    id: 'cuisine_mexican',
    title: 'Taco Tuesday (Any Day!)',
    description: 'Have Mexican food on your date',
    xp: 75,
    category: 'cuisine',
    difficulty: 'easy',
    cuisineType: 'mexican'
  },
  {
    id: 'cuisine_seafood',
    title: 'Catch of the Day',
    description: 'Visit a seafood restaurant',
    xp: 80,
    category: 'cuisine',
    difficulty: 'easy',
    cuisineType: 'seafood'
  },
  {
    id: 'cuisine_vegetarian',
    title: 'Green Date',
    description: 'Try a vegetarian or vegan restaurant',
    xp: 85,
    category: 'cuisine',
    difficulty: 'medium'
  },
  {
    id: 'cuisine_street_food',
    title: 'Street Food Safari',
    description: 'Find the best street food in town',
    xp: 90,
    category: 'cuisine',
    difficulty: 'medium'
  },
  {
    id: 'cuisine_brunch',
    title: 'Brunch Lovers',
    description: 'Have a leisurely brunch date',
    xp: 70,
    category: 'cuisine',
    difficulty: 'easy'
  },
  {
    id: 'cuisine_dessert_first',
    title: 'Dessert First!',
    description: 'Start your date with dessert',
    xp: 85,
    category: 'cuisine',
    difficulty: 'easy',
    tips: ['Life is short, eat dessert first!']
  },
  {
    id: 'cuisine_cooking_class',
    title: 'Master Chefs',
    description: 'Take a cooking class together',
    xp: 150,
    category: 'cuisine',
    difficulty: 'hard'
  }
];

// ============================================
// 🎯 ACTIVITY CHALLENGES
// ============================================
export const ACTIVITY_CHALLENGES = [
  {
    id: 'activity_outdoor',
    title: 'Nature Lovers',
    description: 'Include an outdoor activity in your date',
    xp: 80,
    category: 'activity',
    difficulty: 'easy'
  },
  {
    id: 'activity_active',
    title: 'Get Moving',
    description: 'Do something active together (bowling, mini golf, etc.)',
    xp: 90,
    category: 'activity',
    difficulty: 'medium'
  },
  {
    id: 'activity_cultural',
    title: 'Culture Vultures',
    description: 'Visit a museum, gallery, or theater',
    xp: 100,
    category: 'activity',
    difficulty: 'medium'
  },
  {
    id: 'activity_live_music',
    title: 'Live & Loud',
    description: 'See live music or a concert',
    xp: 110,
    category: 'activity',
    difficulty: 'medium'
  },
  {
    id: 'activity_comedy',
    title: 'Laugh Out Loud',
    description: 'Attend a comedy show',
    xp: 100,
    category: 'activity',
    difficulty: 'medium'
  },
  {
    id: 'activity_escape_room',
    title: 'Escape Artists',
    description: 'Complete an escape room together',
    xp: 150,
    category: 'activity',
    difficulty: 'hard'
  },
  {
    id: 'activity_movie_night',
    title: 'Silver Screen',
    description: 'Watch a movie at the cinema',
    xp: 60,
    category: 'activity',
    difficulty: 'easy'
  },
  {
    id: 'activity_karaoke',
    title: 'Sing Your Heart Out',
    description: 'Go to karaoke together',
    xp: 100,
    category: 'activity',
    difficulty: 'medium'
  },
  {
    id: 'activity_game_night',
    title: 'Game On',
    description: 'Play games together (arcade, board games, etc.)',
    xp: 85,
    category: 'activity',
    difficulty: 'easy'
  },
  {
    id: 'activity_sunset',
    title: 'Golden Hour',
    description: 'Watch the sunset together',
    xp: 75,
    category: 'activity',
    difficulty: 'easy',
    tips: ['Check sunset time before you go!']
  }
];

// ============================================
// ⏰ TIME-BASED CHALLENGES
// ============================================
export const TIME_CHALLENGES = [
  {
    id: 'time_early_bird',
    title: 'Early Bird',
    description: 'Start your date before 11am',
    xp: 90,
    category: 'time',
    difficulty: 'medium',
    requirement: { startBefore: '11:00' }
  },
  {
    id: 'time_night_owl',
    title: 'Night Owl',
    description: 'Keep the date going past 11pm',
    xp: 85,
    category: 'time',
    difficulty: 'medium',
    requirement: { endAfter: '23:00' }
  },
  {
    id: 'time_lunch_date',
    title: 'Lunch Break Romance',
    description: 'Have a midday date (12-2pm)',
    xp: 70,
    category: 'time',
    difficulty: 'easy'
  },
  {
    id: 'time_all_day',
    title: 'Day-Long Adventure',
    description: 'Plan a date that lasts 6+ hours',
    xp: 150,
    category: 'time',
    difficulty: 'hard',
    requirement: { minDuration: 6 }
  },
  {
    id: 'time_weekday',
    title: 'Midweek Magic',
    description: 'Go on a date on a weekday (Mon-Thu)',
    xp: 80,
    category: 'time',
    difficulty: 'easy'
  },
  {
    id: 'time_quick',
    title: 'Quick Connection',
    description: 'Have a meaningful 2-hour date',
    xp: 75,
    category: 'time',
    difficulty: 'easy',
    requirement: { maxDuration: 2 }
  }
];

// ============================================
// 👫 SOCIAL CHALLENGES
// ============================================
export const SOCIAL_CHALLENGES = [
  {
    id: 'social_share_date',
    title: 'Share the Love',
    description: 'Share your date on the DateMaker feed',
    xp: 50,
    category: 'social',
    difficulty: 'easy'
  },
  {
    id: 'social_photo_memories',
    title: 'Memory Makers',
    description: 'Add 3+ photos to your date memory',
    xp: 75,
    category: 'social',
    difficulty: 'easy'
  },
  {
    id: 'social_double_date',
    title: 'Double Trouble',
    description: 'Plan a double date with friends',
    xp: 120,
    category: 'social',
    difficulty: 'hard'
  },
  {
    id: 'social_recommend',
    title: 'Date Guru',
    description: 'Recommend DateMaker to a friend',
    xp: 100,
    category: 'social',
    difficulty: 'medium'
  },
  {
    id: 'social_rate_venue',
    title: 'Critic\'s Choice',
    description: 'Rate all venues after your date',
    xp: 60,
    category: 'social',
    difficulty: 'easy'
  },
  {
    id: 'social_surprise',
    title: 'Surprise Planner',
    description: 'Plan a surprise date for your partner',
    xp: 125,
    category: 'social',
    difficulty: 'hard'
  }
];

// ============================================
// 💰 BUDGET CHALLENGES
// ============================================
export const BUDGET_CHALLENGES = [
  {
    id: 'budget_free',
    title: 'Zero Dollar Date',
    description: 'Have an amazing date spending $0',
    xp: 125,
    category: 'budget',
    difficulty: 'hard',
    tips: ['Parks, beaches, stargazing, picnics...']
  },
  {
    id: 'budget_under_50',
    title: 'Budget Boss',
    description: 'Complete a full date under $50',
    xp: 85,
    category: 'budget',
    difficulty: 'medium'
  },
  {
    id: 'budget_splurge',
    title: 'Treat Yourself',
    description: 'Splurge on a fancy date night',
    xp: 100,
    category: 'budget',
    difficulty: 'medium'
  },
  {
    id: 'budget_happy_hour',
    title: 'Happy Hour Heroes',
    description: 'Take advantage of happy hour deals',
    xp: 70,
    category: 'budget',
    difficulty: 'easy'
  },
  {
    id: 'budget_homemade',
    title: 'Homemade Touch',
    description: 'Add something homemade to your date',
    xp: 90,
    category: 'budget',
    difficulty: 'medium',
    tips: ['Homemade dessert, a playlist, a letter...']
  }
];

// ============================================
// ⚡ SPONTANEOUS CHALLENGES
// ============================================
export const SPONTANEOUS_CHALLENGES = [
  {
    id: 'spontaneous_wheel',
    title: 'Spin to Win',
    description: 'Use the spinning wheel to pick an activity',
    xp: 80,
    category: 'spontaneous',
    difficulty: 'easy'
  },
  {
    id: 'spontaneous_refresh',
    title: 'Refresh Warrior',
    description: 'Use the refresh button 3x and pick the wildest option',
    xp: 90,
    category: 'spontaneous',
    difficulty: 'medium'
  },
  {
    id: 'spontaneous_now',
    title: 'Right Now!',
    description: 'Generate and start a date within 30 minutes',
    xp: 125,
    category: 'spontaneous',
    difficulty: 'hard'
  },
  {
    id: 'spontaneous_new_area',
    title: 'Terra Incognita',
    description: 'Go on a date in a neighborhood you\'ve never been',
    xp: 100,
    category: 'spontaneous',
    difficulty: 'medium'
  },
  {
    id: 'spontaneous_say_yes',
    title: 'Yes Day',
    description: 'Say yes to every DateMaker suggestion',
    xp: 110,
    category: 'spontaneous',
    difficulty: 'medium'
  }
];

// ============================================
// 💕 ROMANTIC CHALLENGES
// ============================================
export const ROMANTIC_CHALLENGES = [
  {
    id: 'romantic_sunset_dinner',
    title: 'Sunset Dinner',
    description: 'Have dinner during sunset',
    xp: 90,
    category: 'romantic',
    difficulty: 'medium'
  },
  {
    id: 'romantic_recreate',
    title: 'Memory Lane',
    description: 'Recreate your first date',
    xp: 150,
    category: 'romantic',
    difficulty: 'hard'
  },
  {
    id: 'romantic_no_phones',
    title: 'Unplugged',
    description: 'No phones for the entire date',
    xp: 100,
    category: 'romantic',
    difficulty: 'medium'
  },
  {
    id: 'romantic_love_letter',
    title: 'Old School Romance',
    description: 'Write a love note during the date',
    xp: 85,
    category: 'romantic',
    difficulty: 'easy'
  },
  {
    id: 'romantic_stargazing',
    title: 'Stargazers',
    description: 'End your date stargazing together',
    xp: 95,
    category: 'romantic',
    difficulty: 'medium'
  },
  {
    id: 'romantic_picnic',
    title: 'Picnic Perfect',
    description: 'Have a romantic picnic',
    xp: 85,
    category: 'romantic',
    difficulty: 'easy'
  }
];

// ============================================
// 🗺️ EXPLORER CHALLENGES
// ============================================
export const EXPLORER_CHALLENGES = [
  {
    id: 'explore_hidden_gem',
    title: 'Hidden Gem Hunter',
    description: 'Visit a venue with fewer than 50 reviews',
    xp: 100,
    category: 'explore',
    difficulty: 'medium'
  },
  {
    id: 'explore_local_favorite',
    title: 'Local Legend',
    description: 'Ask a local for their favorite spot',
    xp: 90,
    category: 'explore',
    difficulty: 'medium'
  },
  {
    id: 'explore_rooftop',
    title: 'Top of the World',
    description: 'Find a rooftop bar or restaurant',
    xp: 85,
    category: 'explore',
    difficulty: 'easy'
  },
  {
    id: 'explore_historic',
    title: 'History Buffs',
    description: 'Visit a historic venue or landmark',
    xp: 80,
    category: 'explore',
    difficulty: 'easy'
  },
  {
    id: 'explore_water',
    title: 'Waterfront Wanderers',
    description: 'Include a waterfront location',
    xp: 75,
    category: 'explore',
    difficulty: 'easy'
  },
  {
    id: 'explore_transport',
    title: 'Journey is the Destination',
    description: 'Use a unique form of transport (ferry, tram, bike)',
    xp: 95,
    category: 'explore',
    difficulty: 'medium'
  }
];

// ============================================
// 🔥 STREAK BONUSES
// ============================================
export const STREAK_BONUSES = {
  // Weekly streaks
  1: { multiplier: 1.0, badge: null, title: 'Getting Started' },
  2: { multiplier: 1.1, badge: '🔥', title: '2 Week Streak!' },
  3: { multiplier: 1.2, badge: '🔥🔥', title: '3 Week Streak!' },
  4: { multiplier: 1.3, badge: '🔥🔥🔥', title: 'Monthly Champion!' },
  5: { multiplier: 1.4, badge: '⭐', title: '5 Week Legend!' },
  6: { multiplier: 1.5, badge: '⭐⭐', title: '6 Week Master!' },
  7: { multiplier: 1.6, badge: '💎', title: '7 Week Diamond!' },
  8: { multiplier: 1.75, badge: '💎💎', title: '2 Month Hero!' },
  10: { multiplier: 2.0, badge: '👑', title: '10 Week Royalty!' },
  12: { multiplier: 2.25, badge: '👑👑', title: 'Quarter King/Queen!' },
  16: { multiplier: 2.5, badge: '🏆', title: '4 Month Champion!' },
  20: { multiplier: 2.75, badge: '🏆🏆', title: '5 Month Legend!' },
  26: { multiplier: 3.0, badge: '🌟', title: 'Half Year Hero!' },
  52: { multiplier: 4.0, badge: '💫', title: 'YEAR OF LOVE!' }
};

// Get streak bonus for a given streak count
export const getStreakBonus = (streakWeeks) => {
  const milestones = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const milestone of milestones) {
    if (streakWeeks >= milestone) {
      return STREAK_BONUSES[milestone];
    }
  }
  return STREAK_BONUSES[1];
};

// ============================================
// 📅 DAILY CHALLENGE SELECTION
// ============================================

// All challenges combined
export const ALL_CHALLENGES = [
  ...CUISINE_CHALLENGES,
  ...ACTIVITY_CHALLENGES,
  ...TIME_CHALLENGES,
  ...SOCIAL_CHALLENGES,
  ...BUDGET_CHALLENGES,
  ...SPONTANEOUS_CHALLENGES,
  ...ROMANTIC_CHALLENGES,
  ...EXPLORER_CHALLENGES
];

// Get today's challenges (deterministic based on date)
export const getTodaysChallenges = (count = 3) => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Use date as seed for pseudo-random selection
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
    seed = seed & seed;
  }
  
  // Shuffle based on seed
  const shuffled = [...ALL_CHALLENGES].sort((a, b) => {
    const hashA = (seed * a.id.length) % 1000;
    const hashB = (seed * b.id.length) % 1000;
    return hashA - hashB;
  });
  
  // Ensure variety - pick from different categories
  const selected = [];
  const usedCategories = new Set();
  
  for (const challenge of shuffled) {
    if (selected.length >= count) break;
    
    // Try to get different categories first
    if (!usedCategories.has(challenge.category) || selected.length >= count - 1) {
      selected.push(challenge);
      usedCategories.add(challenge.category);
    }
  }
  
  return selected;
};

// Get a random challenge from a specific category
export const getChallengeByCategory = (category) => {
  const categoryMap = {
    cuisine: CUISINE_CHALLENGES,
    activity: ACTIVITY_CHALLENGES,
    time: TIME_CHALLENGES,
    social: SOCIAL_CHALLENGES,
    budget: BUDGET_CHALLENGES,
    spontaneous: SPONTANEOUS_CHALLENGES,
    romantic: ROMANTIC_CHALLENGES,
    explore: EXPLORER_CHALLENGES
  };
  
  const challenges = categoryMap[category] || ALL_CHALLENGES;
  return challenges[Math.floor(Math.random() * challenges.length)];
};

// Get challenge by ID
export const getChallengeById = (id) => {
  return ALL_CHALLENGES.find(c => c.id === id) || null;
};

// ============================================
// 🎰 MYSTERY BONUS DAYS
// ============================================
export const MYSTERY_BONUSES = [
  { type: '2x_xp', title: 'Double XP Day!', emoji: '⚡', multiplier: 2 },
  { type: '3x_xp', title: 'TRIPLE XP DAY!', emoji: '🔥', multiplier: 3 },
  { type: 'bonus_challenge', title: 'Bonus Challenge!', emoji: '🎁', extraChallenge: true },
  { type: 'streak_save', title: 'Streak Saver!', emoji: '🛡️', streakProtection: true },
  { type: 'random_xp', title: 'Mystery XP!', emoji: '🎲', randomXP: { min: 50, max: 200 } }
];

// Check if today is a mystery bonus day (roughly 1 in 7 chance)
export const checkMysteryBonus = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Use day of year to determine if it's a bonus day
  // This creates predictable "random" days
  const isBonusDay = (dayOfYear * 7) % 31 < 5;
  
  if (!isBonusDay) return null;
  
  // Pick which bonus based on day
  const bonusIndex = dayOfYear % MYSTERY_BONUSES.length;
  return MYSTERY_BONUSES[bonusIndex];
};

export default {
  CHALLENGE_CATEGORIES,
  ALL_CHALLENGES,
  STREAK_BONUSES,
  getTodaysChallenges,
  getChallengeByCategory,
  getChallengeById,
  getStreakBonus,
  checkMysteryBonus
};