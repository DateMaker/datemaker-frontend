// ============================================
// 🛒 PURCHASABLE ITEMS CONFIGURATION
// DateMaker - In-App Purchases & Unlockables
// ============================================
// New revenue streams: Themes, Icons, Sounds & More
// ============================================

// ============================================
// 🎨 THEME PACKS
// ============================================
export const THEME_PACKS = {
  // FREE THEMES (Unlockable by Level)
  default: {
    id: 'theme_default',
    name: 'Classic Love',
    emoji: '💜',
    description: 'The original DateMaker theme',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#0a0a0f',
      cardBg: '#1a1a2e'
    },
    price: 0,
    unlockLevel: 1,
    type: 'free'
  },
  
  // PREMIUM THEMES (Purchasable)
  sunset: {
    id: 'theme_sunset',
    productId: 'com.datemaker.theme.sunset',
    name: 'Sunset Glow',
    emoji: '🌅',
    description: 'Warm oranges and coral tones',
    colors: {
      primary: '#f97316',
      secondary: '#ef4444',
      accent: '#fbbf24',
      background: '#1c0a05',
      cardBg: '#2d1810'
    },
    price: 1.99,
    type: 'purchase'
  },
  midnight: {
    id: 'theme_midnight',
    productId: 'com.datemaker.theme.midnight',
    name: 'Midnight Blue',
    emoji: '🌙',
    description: 'Deep blues and starry vibes',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#a5b4fc',
      background: '#030712',
      cardBg: '#111827'
    },
    price: 1.99,
    type: 'purchase'
  },
  ocean: {
    id: 'theme_ocean',
    productId: 'com.datemaker.theme.ocean',
    name: 'Ocean Breeze',
    emoji: '🌊',
    description: 'Teal and aqua beach vibes',
    colors: {
      primary: '#14b8a6',
      secondary: '#06b6d4',
      accent: '#22d3ee',
      background: '#042f2e',
      cardBg: '#134e4a'
    },
    price: 1.99,
    type: 'purchase'
  },
  rose: {
    id: 'theme_rose',
    productId: 'com.datemaker.theme.rose',
    name: 'Rose Gold',
    emoji: '🌹',
    description: 'Elegant rose and gold',
    colors: {
      primary: '#f43f5e',
      secondary: '#fb7185',
      accent: '#fda4af',
      background: '#1f0a0e',
      cardBg: '#3f1219'
    },
    price: 1.99,
    type: 'purchase'
  },
  forest: {
    id: 'theme_forest',
    productId: 'com.datemaker.theme.forest',
    name: 'Enchanted Forest',
    emoji: '🌲',
    description: 'Natural greens and earth tones',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#84cc16',
      background: '#052e16',
      cardBg: '#14532d'
    },
    price: 1.99,
    type: 'purchase'
  },
  neon: {
    id: 'theme_neon',
    productId: 'com.datemaker.theme.neon',
    name: 'Neon Nights',
    emoji: '🎮',
    description: 'Cyberpunk neon aesthetic',
    colors: {
      primary: '#d946ef',
      secondary: '#8b5cf6',
      accent: '#22d3ee',
      background: '#0a0118',
      cardBg: '#1e0533'
    },
    price: 2.99,
    type: 'purchase'
  },
  golden: {
    id: 'theme_golden',
    productId: 'com.datemaker.theme.golden',
    name: 'Golden Hour',
    emoji: '✨',
    description: 'Luxurious golds and champagne',
    colors: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#fcd34d',
      background: '#1a1403',
      cardBg: '#2d2507'
    },
    price: 2.99,
    type: 'purchase'
  },
  
  // LEVEL UNLOCKABLE THEMES
  lavender: {
    id: 'theme_lavender',
    name: 'Lavender Dreams',
    emoji: '💐',
    description: 'Soft purples and lilacs',
    colors: {
      primary: '#a78bfa',
      secondary: '#c4b5fd',
      accent: '#e9d5ff',
      background: '#1e1b2e',
      cardBg: '#2e2947'
    },
    price: 0,
    unlockLevel: 10,
    type: 'level'
  },
  cherry: {
    id: 'theme_cherry',
    name: 'Cherry Blossom',
    emoji: '🌸',
    description: 'Japanese sakura inspired',
    colors: {
      primary: '#f472b6',
      secondary: '#fb7185',
      accent: '#fda4af',
      background: '#1f0a14',
      cardBg: '#3f1021'
    },
    price: 0,
    unlockLevel: 20,
    type: 'level'
  }
};

// ============================================
// 📱 CUSTOM APP ICONS
// ============================================
export const APP_ICONS = {
  default: {
    id: 'icon_default',
    name: 'Classic Heart',
    emoji: '💕',
    imageName: 'AppIcon-Default',
    price: 0,
    type: 'free'
  },
  midnight: {
    id: 'icon_midnight',
    productId: 'com.datemaker.icon.midnight',
    name: 'Midnight',
    emoji: '🌙',
    imageName: 'AppIcon-Midnight',
    price: 0.99,
    type: 'purchase'
  },
  sunset: {
    id: 'icon_sunset',
    productId: 'com.datemaker.icon.sunset',
    name: 'Sunset',
    emoji: '🌅',
    imageName: 'AppIcon-Sunset',
    price: 0.99,
    type: 'purchase'
  },
  neon: {
    id: 'icon_neon',
    productId: 'com.datemaker.icon.neon',
    name: 'Neon',
    emoji: '💜',
    imageName: 'AppIcon-Neon',
    price: 0.99,
    type: 'purchase'
  },
  minimal: {
    id: 'icon_minimal',
    productId: 'com.datemaker.icon.minimal',
    name: 'Minimal',
    emoji: '⚪',
    imageName: 'AppIcon-Minimal',
    price: 0.99,
    type: 'purchase'
  },
  golden: {
    id: 'icon_golden',
    productId: 'com.datemaker.icon.golden',
    name: 'Golden',
    emoji: '✨',
    imageName: 'AppIcon-Golden',
    price: 0.99,
    type: 'purchase'
  },
  pride: {
    id: 'icon_pride',
    productId: 'com.datemaker.icon.pride',
    name: 'Pride',
    emoji: '🏳️‍🌈',
    imageName: 'AppIcon-Pride',
    price: 0.99,
    type: 'purchase'
  }
};

// ============================================
// 🎉 CONFETTI STYLES
// ============================================
export const CONFETTI_STYLES = {
  default: {
    id: 'confetti_default',
    name: 'Classic Mix',
    emoji: '🎊',
    description: 'Colorful paper confetti',
    colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6'],
    shapes: ['circle', 'square'],
    price: 0,
    type: 'free'
  },
  hearts: {
    id: 'confetti_hearts',
    productId: 'com.datemaker.confetti.hearts',
    name: 'Love Hearts',
    emoji: '💕',
    description: 'Floating hearts',
    colors: ['#ec4899', '#f472b6', '#fb7185', '#fda4af'],
    shapes: ['heart'],
    price: 0.99,
    type: 'purchase'
  },
  stars: {
    id: 'confetti_stars',
    productId: 'com.datemaker.confetti.stars',
    name: 'Starry Night',
    emoji: '⭐',
    description: 'Twinkling stars',
    colors: ['#fbbf24', '#f59e0b', '#fcd34d', '#ffffff'],
    shapes: ['star'],
    price: 0.99,
    type: 'purchase'
  },
  gold: {
    id: 'confetti_gold',
    productId: 'com.datemaker.confetti.gold',
    name: 'Golden Luxury',
    emoji: '✨',
    description: 'Elegant gold confetti',
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'],
    shapes: ['circle', 'square'],
    price: 0.99,
    type: 'purchase'
  },
  rainbow: {
    id: 'confetti_rainbow',
    productId: 'com.datemaker.confetti.rainbow',
    name: 'Rainbow Pride',
    emoji: '🌈',
    description: 'All the colors!',
    colors: ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6'],
    shapes: ['circle', 'square', 'star'],
    price: 0.99,
    type: 'purchase'
  },
  sparkles: {
    id: 'confetti_sparkles',
    productId: 'com.datemaker.confetti.sparkles',
    name: 'Magic Sparkles',
    emoji: '💫',
    description: 'Glittering sparkles',
    colors: ['#ffffff', '#f0abfc', '#a5b4fc', '#5eead4'],
    shapes: ['star'],
    price: 0.99,
    type: 'purchase'
  }
};

// ============================================
// 🔊 SOUND PACKS
// ============================================
export const SOUND_PACKS = {
  default: {
    id: 'sounds_default',
    name: 'Classic Sounds',
    emoji: '🔔',
    description: 'Standard notification sounds',
    sounds: {
      tap: 'tap_default.wav',
      success: 'success_default.wav',
      levelUp: 'levelup_default.wav',
      achievement: 'achievement_default.wav'
    },
    price: 0,
    type: 'free'
  },
  gentle: {
    id: 'sounds_gentle',
    productId: 'com.datemaker.sounds.gentle',
    name: 'Gentle Tones',
    emoji: '🎵',
    description: 'Soft, calming sounds',
    sounds: {
      tap: 'tap_gentle.wav',
      success: 'success_gentle.wav',
      levelUp: 'levelup_gentle.wav',
      achievement: 'achievement_gentle.wav'
    },
    price: 0.99,
    type: 'purchase'
  },
  retro: {
    id: 'sounds_retro',
    productId: 'com.datemaker.sounds.retro',
    name: 'Retro Arcade',
    emoji: '👾',
    description: '8-bit game sounds',
    sounds: {
      tap: 'tap_retro.wav',
      success: 'success_retro.wav',
      levelUp: 'levelup_retro.wav',
      achievement: 'achievement_retro.wav'
    },
    price: 0.99,
    type: 'purchase'
  },
  nature: {
    id: 'sounds_nature',
    productId: 'com.datemaker.sounds.nature',
    name: 'Nature Vibes',
    emoji: '🌿',
    description: 'Natural, organic sounds',
    sounds: {
      tap: 'tap_nature.wav',
      success: 'success_nature.wav',
      levelUp: 'levelup_nature.wav',
      achievement: 'achievement_nature.wav'
    },
    price: 0.99,
    type: 'purchase'
  }
};

// ============================================
// 💎 SUBSCRIPTION TIERS
// ============================================
export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceString: 'Free',
    features: [
      '3 date generations per month',
      'Basic categories',
      'Save up to 10 dates',
      'Default theme'
    ],
    limits: {
      datesPerMonth: 3,
      savedDates: 10,
      aiGenerations: 3
    }
  },
  premium: {
    id: 'premium',
    productId: 'com.datemaker.premium.monthly',
    name: 'Premium',
    price: 4.99,
    priceString: '$4.99/month',
    features: [
      'Unlimited date generations',
      'All categories & filters',
      'Unlimited saved dates',
      'All premium themes',
      'Ambient sounds',
      'Monthly & yearly recaps',
      'Priority support'
    ],
    limits: {
      datesPerMonth: -1, // Unlimited
      savedDates: -1,
      aiGenerations: -1
    }
  },
  premiumYearly: {
    id: 'premiumYearly',
    productId: 'com.datemaker.premium.yearly',
    name: 'Premium Yearly',
    price: 39.99,
    priceString: '$39.99/year',
    savings: 'Save 33%',
    features: [
      'Everything in Premium',
      'Best value!',
      '2 months FREE'
    ],
    limits: {
      datesPerMonth: -1,
      savedDates: -1,
      aiGenerations: -1
    }
  },
  lifetime: {
    id: 'lifetime',
    productId: 'com.datemaker.premium.lifetime',
    name: 'Lifetime',
    price: 79.99,
    priceString: '$79.99 once',
    badge: 'BEST VALUE',
    features: [
      'Everything in Premium',
      'Pay once, love forever',
      'All future features included',
      'Exclusive lifetime badge'
    ],
    limits: {
      datesPerMonth: -1,
      savedDates: -1,
      aiGenerations: -1
    }
  }
};

// ============================================
// 🎁 BUNDLES
// ============================================
export const BUNDLES = {
  starterPack: {
    id: 'bundle_starter',
    productId: 'com.datemaker.bundle.starter',
    name: 'Starter Pack',
    emoji: '🎁',
    description: 'Perfect for new couples',
    includes: [
      { type: 'theme', id: 'sunset' },
      { type: 'confetti', id: 'hearts' },
      { type: 'icon', id: 'sunset' }
    ],
    originalPrice: 3.97,
    price: 2.99,
    savings: '25% OFF'
  },
  luxuryPack: {
    id: 'bundle_luxury',
    productId: 'com.datemaker.bundle.luxury',
    name: 'Luxury Collection',
    emoji: '✨',
    description: 'The complete premium experience',
    includes: [
      { type: 'theme', id: 'golden' },
      { type: 'theme', id: 'neon' },
      { type: 'confetti', id: 'gold' },
      { type: 'confetti', id: 'sparkles' },
      { type: 'icon', id: 'golden' },
      { type: 'sounds', id: 'gentle' }
    ],
    originalPrice: 8.95,
    price: 5.99,
    savings: '33% OFF'
  },
  everythingPack: {
    id: 'bundle_everything',
    productId: 'com.datemaker.bundle.everything',
    name: 'Everything Bundle',
    emoji: '🌟',
    description: 'Get it all!',
    includes: 'ALL_ITEMS',
    originalPrice: 19.99,
    price: 12.99,
    savings: '35% OFF'
  }
};

// ============================================
// 🏆 ACHIEVEMENT REWARDS
// ============================================
export const ACHIEVEMENT_REWARDS = {
  // Unlock themes at certain levels
  level5: { type: 'theme', id: 'lavender', unlockLevel: 5 },
  level10: { type: 'confetti', id: 'stars', unlockLevel: 10 },
  level20: { type: 'theme', id: 'cherry', unlockLevel: 20 },
  level30: { type: 'icon', id: 'minimal', unlockLevel: 30 },
  
  // Achievement unlocks
  firstDate: { type: 'confetti', id: 'hearts', achievement: 'first_date' },
  tenDates: { type: 'theme', id: 'sunset', achievement: 'ten_dates' },
  streak7: { type: 'sounds', id: 'gentle', achievement: 'streak_7_days' }
};

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

// Get all purchasable products for RevenueCat
export const getAllProducts = () => {
  const products = [];
  
  Object.values(THEME_PACKS).forEach(theme => {
    if (theme.productId) products.push(theme.productId);
  });
  
  Object.values(APP_ICONS).forEach(icon => {
    if (icon.productId) products.push(icon.productId);
  });
  
  Object.values(CONFETTI_STYLES).forEach(confetti => {
    if (confetti.productId) products.push(confetti.productId);
  });
  
  Object.values(SOUND_PACKS).forEach(sounds => {
    if (sounds.productId) products.push(sounds.productId);
  });
  
  Object.values(BUNDLES).forEach(bundle => {
    if (bundle.productId) products.push(bundle.productId);
  });
  
  return products;
};

// Check if item is owned
export const isItemOwned = (itemId, userPurchases = [], userLevel = 1) => {
  // Check if purchased
  if (userPurchases.includes(itemId)) return true;
  
  // Check all item types for level unlock
  const allItems = {
    ...THEME_PACKS,
    ...APP_ICONS,
    ...CONFETTI_STYLES,
    ...SOUND_PACKS
  };
  
  const item = Object.values(allItems).find(i => i.id === itemId);
  
  if (item) {
    if (item.type === 'free') return true;
    if (item.type === 'level' && item.unlockLevel <= userLevel) return true;
  }
  
  return false;
};

// Get available items for user
export const getAvailableItems = (userPurchases = [], userLevel = 1) => {
  const available = {
    themes: [],
    icons: [],
    confetti: [],
    sounds: []
  };
  
  Object.entries(THEME_PACKS).forEach(([key, theme]) => {
    available.themes.push({
      ...theme,
      key,
      owned: isItemOwned(theme.id, userPurchases, userLevel),
      locked: theme.type === 'level' && theme.unlockLevel > userLevel
    });
  });
  
  Object.entries(APP_ICONS).forEach(([key, icon]) => {
    available.icons.push({
      ...icon,
      key,
      owned: isItemOwned(icon.id, userPurchases, userLevel)
    });
  });
  
  Object.entries(CONFETTI_STYLES).forEach(([key, confetti]) => {
    available.confetti.push({
      ...confetti,
      key,
      owned: isItemOwned(confetti.id, userPurchases, userLevel)
    });
  });
  
  Object.entries(SOUND_PACKS).forEach(([key, sounds]) => {
    available.sounds.push({
      ...sounds,
      key,
      owned: isItemOwned(sounds.id, userPurchases, userLevel)
    });
  });
  
  return available;
};

export default {
  THEME_PACKS,
  APP_ICONS,
  CONFETTI_STYLES,
  SOUND_PACKS,
  SUBSCRIPTION_TIERS,
  BUNDLES,
  ACHIEVEMENT_REWARDS,
  getAllProducts,
  isItemOwned,
  getAvailableItems
};
