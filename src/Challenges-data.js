// GameSystem.js - Core Gamification Logic

export const LEVELS = [
  { level: 1, name: 'First Timers', minXP: 0, maxXP: 100, color: '#94a3b8', icon: '🌱' },
  { level: 2, name: 'Date Rookies', minXP: 101, maxXP: 300, color: '#60a5fa', icon: '⭐' },
  { level: 3, name: 'Romance Enthusiasts', minXP: 301, maxXP: 600, color: '#a78bfa', icon: '💫' },
  { level: 4, name: 'Adventure Seekers', minXP: 601, maxXP: 1000, color: '#f472b6', icon: '🚀' },
  { level: 5, name: 'Relationship Masters', minXP: 1001, maxXP: 2000, color: '#fb923c', icon: '👑' },
  { level: 6, name: 'Legendary Lovers', minXP: 2001, maxXP: 999999, color: '#FFD700', icon: '💎' }
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
// challenges-data.js - All Challenge Definitions

export const CHALLENGES = {
  food: [
    { id: 'food_1', text: '🍽️ Order something you can\'t pronounce', points: 20, type: 'dare' },
    { id: 'food_2', text: '🌶️ Try the spiciest item on the menu', points: 25, type: 'dare' },
    { id: 'food_3', text: '👨‍🍳 Ask the chef for their secret favorite dish', points: 20, type: 'social' },
    { id: 'food_4', text: '🥢 Eat with only chopsticks (if you don\'t normally)', points: 20, type: 'challenge' },
    { id: 'food_5', text: '📱 No phones during the meal (30 min)', points: 30, type: 'challenge' },
    { id: 'food_6', text: '🎲 Order a "mystery dish" - let your date choose', points: 25, type: 'trust' },
    { id: 'food_7', text: '🍰 Share a dessert without using hands', points: 30, type: 'dare' },
    { id: 'food_8', text: '🥗 Try a dish you\'ve never had before', points: 25, type: 'adventure' },
    { id: 'food_9', text: '📸 Take a creative food photo for Instagram', points: 15, type: 'photo' },
    { id: 'food_10', text: '🗣️ Compliment the chef personally', points: 20, type: 'social' }
  ],
  
  drinks: [
    { id: 'drink_1', text: '🍹 Create a custom cocktail with the bartender', points: 25, type: 'creative' },
    { id: 'drink_2', text: '🎤 Make up a story about someone else at the bar', points: 20, type: 'creative' },
    { id: 'drink_3', text: '🥃 Try a drink you\'ve never had', points: 20, type: 'adventure' },
    { id: 'drink_4', text: '🎲 Blind taste test - guess the ingredients', points: 25, type: 'challenge' },
    { id: 'drink_5', text: '📸 Toast selfie with permission from strangers', points: 30, type: 'dare' },
    { id: 'drink_6', text: '💃 Dance for 30 seconds when your song plays', points: 25, type: 'dare' },
    { id: 'drink_7', text: '🍸 Order the bartender\'s special recommendation', points: 20, type: 'trust' },
    { id: 'drink_8', text: '🎯 Play a bar game together (darts, pool, etc)', points: 20, type: 'challenge' },
    { id: 'drink_9', text: '🌟 Name your own cocktail and describe it', points: 20, type: 'creative' },
    { id: 'drink_10', text: '🥂 Make a toast to something unexpected', points: 15, type: 'creative' }
  ],
  
  entertainment: [
    { id: 'ent_1', text: '🎵 Request a dedication song', points: 20, type: 'romantic' },
    { id: 'ent_2', text: '😂 Don\'t laugh challenge for 5 minutes', points: 25, type: 'challenge' },
    { id: 'ent_3', text: '🎭 Predict the ending before it happens', points: 20, type: 'challenge' },
    { id: 'ent_4', text: '🎨 Find art that represents your relationship', points: 25, type: 'romantic' },
    { id: 'ent_5', text: '📸 Recreate a famous pose or scene', points: 20, type: 'photo' },
    { id: 'ent_6', text: '🎪 Reenact a scene from the show afterwards', points: 30, type: 'dare' },
    { id: 'ent_7', text: '🌟 Give a standing ovation', points: 15, type: 'social' },
    { id: 'ent_8', text: '🎬 Discuss what you\'d change about the performance', points: 15, type: 'conversation' },
    { id: 'ent_9', text: '📝 Write a mini review together', points: 20, type: 'creative' },
    { id: 'ent_10', text: '🎤 Sing along if it\'s a musical', points: 25, type: 'dare' }
  ],
  
  activity: [
    { id: 'act_1', text: '💃 Learn a new dance move together', points: 25, type: 'challenge' },
    { id: 'act_2', text: '🎤 Duet on a song neither of you know', points: 30, type: 'dare' },
    { id: 'act_3', text: '🎯 Loser buys next round', points: 20, type: 'challenge' },
    { id: 'act_4', text: '🧩 Complete it without hints', points: 25, type: 'challenge' },
    { id: 'act_5', text: '🏆 Make it competitive and see who wins', points: 20, type: 'challenge' },
    { id: 'act_6', text: '📸 Get an action shot mid-activity', points: 15, type: 'photo' },
    { id: 'act_7', text: '🎨 Create something together in 15 minutes', points: 25, type: 'creative' },
    { id: 'act_8', text: '🎪 Try the hardest difficulty level', points: 30, type: 'dare' },
    { id: 'act_9', text: '🤝 Work as a perfect team', points: 25, type: 'teamwork' },
    { id: 'act_10', text: '🌟 Set a personal record', points: 30, type: 'challenge' }
  ],
  
  outdoor: [
    { id: 'out_1', text: '🌳 Find the oldest or most unique tree', points: 20, type: 'adventure' },
    { id: 'out_2', text: '🦋 Spot 3 different animals or birds', points: 25, type: 'challenge' },
    { id: 'out_3', text: '📸 Take the most creative nature photo', points: 20, type: 'photo' },
    { id: 'out_4', text: '🗺️ Find a "secret spot" locals know', points: 30, type: 'adventure' },
    { id: 'out_5', text: '🌅 Watch sunset/sunrise together', points: 25, type: 'romantic' },
    { id: 'out_6', text: '🏃 Walk backwards for 50 steps (safely!)', points: 20, type: 'dare' },
    { id: 'out_7', text: '🍃 Collect interesting leaves or stones', points: 15, type: 'adventure' },
    { id: 'out_8', text: '🎯 Have a mini photoshoot in nature', points: 20, type: 'photo' },
    { id: 'out_9', text: '🧘 Do a 5-minute meditation together', points: 20, type: 'mindful' },
    { id: 'out_10', text: '🌸 Find the prettiest flower or view', points: 15, type: 'adventure' }
  ],
  
  cafe: [
    { id: 'cafe_1', text: '☕ Try a new coffee blend you\'ve never had', points: 20, type: 'adventure' },
    { id: 'cafe_2', text: '🍰 Share a pastry - no hands allowed', points: 25, type: 'dare' },
    { id: 'cafe_3', text: '📝 Write each other notes on napkins', points: 20, type: 'romantic' },
    { id: 'cafe_4', text: '🎨 Draw portraits of each other', points: 25, type: 'creative' },
    { id: 'cafe_5', text: '📚 Read aloud to each other', points: 20, type: 'romantic' },
    { id: 'cafe_6', text: '🎲 Play a quick word game', points: 15, type: 'challenge' },
    { id: 'cafe_7', text: '💭 Share your biggest dream', points: 25, type: 'deep' },
    { id: 'cafe_8', text: '📸 Latte art photo competition', points: 15, type: 'photo' },
    { id: 'cafe_9', text: '🌟 Compliment a stranger\'s order choice', points: 20, type: 'social' },
    { id: 'cafe_10', text: '☕ Guess each other\'s favorite coffee order', points: 20, type: 'challenge' }
  ],
  
  universal: [
    { id: 'uni_1', text: '💬 Ask each other a deep question', points: 25, type: 'conversation' },
    { id: 'uni_2', text: '🎁 Buy something small for each other (under $5)', points: 20, type: 'romantic' },
    { id: 'uni_3', text: '👋 Compliment a stranger', points: 20, type: 'social' },
    { id: 'uni_4', text: '📝 Leave a nice note for the next person', points: 15, type: 'kindness' },
    { id: 'uni_5', text: '🎭 Speak in accents for 10 minutes', points: 25, type: 'dare' },
    { id: 'uni_6', text: '🤝 No saying "no" for the next hour', points: 30, type: 'dare' },
    { id: 'uni_7', text: '📸 Take a silly selfie together', points: 15, type: 'photo' },
    { id: 'uni_8', text: '🎵 Share your favorite song and why', points: 20, type: 'conversation' },
    { id: 'uni_9', text: '🌟 Tell each other something you admire', points: 25, type: 'romantic' },
    { id: 'uni_10', text: '🎲 Play rock-paper-scissors - best of 5', points: 10, type: 'challenge' }
  ]
};

export const CONVERSATION_STARTERS = {
  light: [
    "What's your most embarrassing moment?",
    "If you could have dinner with anyone, dead or alive, who?",
    "What's your hidden talent?",
    "What's the craziest thing on your bucket list?",
    "If you won the lottery tomorrow, what's the first thing you'd do?",
    "What's your go-to karaoke song?",
    "What's the best advice you've ever received?",
    "If you could live in any TV show, which one?",
    "What's your favorite childhood memory?",
    "What's something you're secretly good at?"
  ],
  
  deep: [
    "What's your biggest dream in life?",
    "What makes you feel most alive?",
    "What's one thing you want to change about the world?",
    "What's your biggest fear?",
    "What does love mean to you?",
    "What's something you've never told anyone?",
    "What's your biggest regret?",
    "What do you want your legacy to be?",
    "What's the most important lesson life has taught you?",
    "What would you do if you had no fear?"
  ],
  
  relationship: [
    "What's your love language?",
    "What's your idea of a perfect day together?",
    "What's something new you want to try together?",
    "What do you appreciate most about our relationship?",
    "What's your favorite memory of us?",
    "How do you like to be comforted when you're sad?",
    "What's something I do that makes you feel loved?",
    "What's your ideal future together?",
    "What's one thing you want me to know about you?",
    "How can I support your dreams better?"
  ],
  
  wouldYouRather: [
    "Time travel to the past or future?",
    "Superpower: invisibility or flying?",
    "Live in the city or countryside?",
    "Know how you die or when you die?",
    "Be able to speak all languages or play all instruments?",
    "Never use social media again or never watch TV/movies again?",
    "Have unlimited money or unlimited time?",
    "Read minds or see the future?",
    "Always be 10 minutes late or 20 minutes early?",
    "Fight one horse-sized duck or 100 duck-sized horses?"
  ]
};

// Get random challenge based on category
export const getRandomChallenge = (category) => {
  const challenges = CHALLENGES[category] || CHALLENGES.universal;
  return challenges[Math.floor(Math.random() * challenges.length)];
};

// Get random conversation starter
export const getRandomConversation = (type = 'light') => {
  const convos = CONVERSATION_STARTERS[type] || CONVERSATION_STARTERS.light;
  return convos[Math.floor(Math.random() * convos.length)];
};

// Get multiple challenges for a stop
export const getChallengesForStop = (category, count = 3) => {
  const challenges = CHALLENGES[category] || CHALLENGES.universal;
  const shuffled = [...challenges].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};