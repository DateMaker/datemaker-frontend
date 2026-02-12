/**
 * 💬 HumanCopy.js
 * Warm, human-sounding copy for DateMaker
 * Makes the app feel alive and personal
 */

/**
 * Get time-based greeting with user's name
 * "Good morning, Sarah! Ready for magic? ✨"
 */
export const getGreeting = (name = '') => {
  const hour = new Date().getHours();
  const displayName = name ? `, ${name}` : '';
  
  if (hour >= 5 && hour < 12) {
    const mornings = [
      `Good morning${displayName}! Ready to plan? ☀️`,
      `Rise and shine${displayName}! ☀️`,
      `Morning${displayName}! Let's make today special ✨`,
    ];
    return mornings[Math.floor(Math.random() * mornings.length)];
  }
  
  if (hour >= 12 && hour < 17) {
    const afternoons = [
      `Good afternoon${displayName}! 🌤️`,
      `Hey${displayName}! Planning something fun? 🎯`,
      `Afternoon${displayName}! Ready for adventure? ✨`,
    ];
    return afternoons[Math.floor(Math.random() * afternoons.length)];
  }
  
  if (hour >= 17 && hour < 21) {
    const evenings = [
      `Good evening${displayName}! Date night? 💜`,
      `Evening${displayName}! Time for romance 💕`,
      `Hey${displayName}! Ready for a great night? ✨`,
    ];
    return evenings[Math.floor(Math.random() * evenings.length)];
  }
  
  // Night (9pm - 5am)
  const nights = [
    `Night owl${displayName}? 🦉`,
    `Late night planning${displayName}? 🌙`,
    `Still up${displayName}? Let's plan! ✨`,
  ];
  return nights[Math.floor(Math.random() * nights.length)];
};

/**
 * Get SHORT time-based greeting (for header)
 * "Good afternoon 🌤️"
 */
export const getShortGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 0 && hour < 5) {
    return "Night owl? 🦉";
  }
  if (hour >= 5 && hour < 9) {
    return "Early bird! ☀️";
  }
  if (hour >= 9 && hour < 12) {
    return "Good morning ☀️";
  }
  if (hour >= 12 && hour < 17) {
    return "Good afternoon 🌤️";
  }
  if (hour >= 17 && hour < 21) {
    return "Date night? 💜";
  }
  // 9pm - midnight
  return "Evening vibes 🌙";
};

/**
 * Get day-appropriate message
 */
export const getDayMessage = () => {
  const day = new Date().getDay();
  const messages = {
    0: "Sunday funday! Perfect for a relaxed date 🌟",
    1: "Start the week with something special 💜",
    2: "Tuesday treat - you deserve it! ✨",
    3: "Midweek magic awaits 🎯",
    4: "Almost Friday! Plan something fun 🎉",
    5: "TGIF! Time for a great date night 🎊",
    6: "Saturday adventure time! 🌟",
  };
  return messages[day];
};

/**
 * Context-aware loading messages
 * Returns array of messages to cycle through
 */
export const getLoadingMessages = (context = 'default') => {
  const messages = {
    dates: [
      "Finding the perfect spots... 🔍",
      "Checking what's trending... 🔥",
      "Curating your experience... ✨",
      "Almost there... 💜",
      "Adding a dash of magic... 🪄",
    ],
    places: [
      "Searching nearby... 📍",
      "Finding hidden gems... 💎",
      "Checking reviews... ⭐",
      "Almost ready... ✨",
    ],
    saving: [
      "Saving your date... 💾",
      "Almost done... ✨",
    ],
    sharing: [
      "Preparing to share... 📤",
      "Getting ready... ✨",
    ],
    default: [
      "Working on it... ⏳",
      "Almost there... ✨",
      "Just a moment... 💜",
    ],
  };
  
  return messages[context] || messages.default;
};

/**
 * Get a single random loading message
 */
export const getLoadingMessage = (context = 'default') => {
  const messages = getLoadingMessages(context);
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Success messages
 */
export const getSuccessMessage = (action = 'default') => {
  const messages = {
    save: [
      "Saved! 💜",
      "Got it! ✨",
      "Added to your dates! 🎉",
    ],
    share: [
      "Shared! 🎉",
      "Sent with love! 💕",
    ],
    complete: [
      "Amazing date! 🎉",
      "You did it! 💜",
      "Date night success! ✨",
    ],
    default: [
      "Done! ✨",
      "Success! 💜",
    ],
  };
  
  const options = messages[action] || messages.default;
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Error messages (friendly, not scary)
 */
export const getErrorMessage = (type = 'default') => {
  const messages = {
    network: [
      "Hmm, can't connect right now. Try again? 📡",
      "Network hiccup! Give it another shot 🔄",
    ],
    notFound: [
      "Couldn't find that. Try something else? 🔍",
      "No luck there. How about a different search? 🎯",
    ],
    default: [
      "Oops! Something went wrong. Try again? 🔄",
      "That didn't work. Give it another go! 💜",
    ],
  };
  
  const options = messages[type] || messages.default;
  return options[Math.floor(Math.random() * options.length)];
};

/**
 * Empty state content for different screens
 */
export const getEmptyStateContent = (type) => {
  const content = {
    savedDates: {
      emoji: '💜',
      title: 'No saved dates yet',
      subtitle: 'Your saved dates will appear here',
      cta: 'Create Your First Date',
    },
    friends: {
      emoji: '👋',
      title: 'No friends yet',
      subtitle: 'Add friends to plan dates together!',
      cta: 'Find Friends',
    },
    messages: {
      emoji: '💬',
      title: 'No messages yet',
      subtitle: 'Start a conversation!',
      cta: 'Say Hello',
    },
    notifications: {
      emoji: '🔔',
      title: 'All caught up!',
      subtitle: 'No new notifications',
      cta: null,
    },
    history: {
      emoji: '📅',
      title: 'No date history',
      subtitle: 'Complete dates to see them here',
      cta: 'Plan a Date',
    },
  };
  
  return content[type] || content.savedDates;
};

/**
 * Encouragement messages for streaks/achievements
 */
export const getEncouragement = (streak = 0) => {
  if (streak === 0) return "Start your streak today! 🔥";
  if (streak === 1) return "Great start! Keep it going! 🌟";
  if (streak < 5) return `${streak} week streak! You're on fire! 🔥`;
  if (streak < 10) return `${streak} weeks! Relationship goals! 💜`;
  return `${streak} weeks! You're a dating legend! 👑`;
};

/**
 * Streak milestone messages
 */
export const getStreakMessage = (streak) => {
  const milestones = {
    1: "First date logged! 🎉",
    3: "3 week streak! You're building something special 💜",
    5: "5 weeks! Halfway to relationship pro! 🌟",
    10: "10 week streak! Incredible commitment! 👑",
    25: "25 weeks! You're a date night champion! 🏆",
    52: "ONE YEAR! You're absolutely amazing! 💜🎉",
  };
  
  return milestones[streak] || null;
};

/**
 * Level up celebration messages
 */
export const getLevelUpMessage = (level) => {
  const messages = {
    2: "Level 2! You're getting started! 🌟",
    3: "Level 3! Date Explorer unlocked! 🗺️",
    5: "Level 5! You're a Date Enthusiast! 💜",
    10: "Level 10! Date Master status! 👑",
    15: "Level 15! Romance Expert! 💕",
    20: "Level 20! Legendary Dater! 🏆",
  };
  
  return messages[level] || `Level ${level}! Amazing progress! ✨`;
};

/**
 * Celebration messages for completing dates
 */
export const getCelebrationMessage = () => {
  const messages = [
    "What a date! 💜",
    "Nailed it! 🎉",
    "Date night success! ✨",
    "Another great memory! 📸",
    "You two are amazing! 💕",
    "Perfect evening! 🌟",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Button labels with personality
 */
export const ButtonLabels = {
  generate: "Let's Go! ✨",
  save: "Save This 💜",
  share: "Share 📤",
  directions: "Take Me There 📍",
  refresh: "Try Again 🔄",
  complete: "Date Complete! 🎉",
  addFriend: "Add Friend 👋",
  sendMessage: "Send 💬",
  viewAll: "See All →",
  startDate: "Start Date 💜",
  continue: "Continue →",
  back: "← Back",
  done: "Done ✓",
  cancel: "Maybe Later",
  confirm: "Yes, Let's Do It! 💜",
};

/**
 * Placeholder text
 */
export const Placeholders = {
  location: "Where to? (e.g., Melbourne, NYC...)",
  activity: "What sounds fun? (dinner, drinks, movies...)",
  search: "Search...",
  message: "Type a message...",
  searchFriends: "Search by username...",
};

// Default export with all functions
export default {
  getGreeting,
  getShortGreeting,
  getDayMessage,
  getLoadingMessages,
  getLoadingMessage,
  getSuccessMessage,
  getErrorMessage,
  getEmptyStateContent,
  getEncouragement,
  getStreakMessage,
  getLevelUpMessage,
  getCelebrationMessage,
  ButtonLabels,
  Placeholders,
};