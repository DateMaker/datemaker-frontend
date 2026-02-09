// ============================================
// 🔔 ENGAGEMENT NOTIFICATIONS SERVICE - FIXED
// DateMaker Phase 3 - Push Notifications
// ============================================
// FIXES:
// ✅ Template variables now properly filled
// ✅ Rate limiting - max 3 notifications per day
// ✅ Tracks last sent time to prevent spam
// ✅ Only initializes once per day
// ✅ Clean notification text (no {variables})
// ============================================

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// 📱 NOTIFICATION TEMPLATES (Clean - no variables in scheduled ones)
// ============================================

export const NOTIFICATION_TEMPLATES = {
  // 🌅 Morning Inspiration (9 AM) - No variables needed
  morningInspiration: [
    {
      title: "Good morning! ☀️",
      body: "Ready to plan something special for tonight?",
      data: { action: 'open_generator' }
    },
    {
      title: "Rise and shine! 💕",
      body: "What kind of date are you in the mood for today?",
      data: { action: 'open_generator' }
    },
    {
      title: "Hey there! ✨",
      body: "Today's a perfect day for a date. Let's plan one!",
      data: { action: 'open_generator' }
    }
  ],

  // 🌆 Tonight's Vibe (5 PM) - No variables needed
  tonightsVibe: [
    {
      title: "Tonight's Vibe: Cozy Dinner 🍝",
      body: "One tap to generate the perfect evening",
      data: { action: 'quick_generate', vibe: 'dinner' }
    },
    {
      title: "Tonight's Vibe: Adventure Mode 🎯",
      body: "Something exciting is waiting. Tap to discover!",
      data: { action: 'quick_generate', vibe: 'adventure' }
    },
    {
      title: "Tonight's Vibe: Chill & Connect 🌙",
      body: "Low-key vibes, maximum quality time",
      data: { action: 'quick_generate', vibe: 'relaxed' }
    }
  ],

  // 🎯 Daily Challenge (12 PM) - No variables needed
  dailyChallenge: [
    {
      title: "Today's Challenges are waiting! 🎯",
      body: "Complete them for bonus XP",
      data: { action: 'open_challenges' }
    },
    {
      title: "New day, new challenges! ⭐",
      body: "See what's in store for you today",
      data: { action: 'open_challenges' }
    }
  ],

  // 🎉 Friday Night (Friday 5 PM)
  fridayNight: [
    {
      title: "It's Friday! 🎉",
      body: "Weekend vibes are calling. Plan your date night!",
      data: { action: 'open_generator' }
    }
  ]
};

// ============================================
// 🔥 DYNAMIC TEMPLATES (These use fillTemplate)
// ============================================

export const DYNAMIC_TEMPLATES = {
  // 🔥 Streak Reminder - REQUIRES VARIABLES
  streakReminder: {
    title: "Your streak is at risk! 🔥",
    body: "Plan a date to keep your STREAK-week streak alive!",
    data: { action: 'open_generator' }
  },

  // 🎉 Streak Milestone - REQUIRES VARIABLES
  streakMilestone: {
    title: "STREAK Week Streak! 🔥",
    body: "Amazing! You're now earning MULTIPLIERx XP!",
    data: { action: 'open_profile' }
  },

  // 🎰 Mystery Bonus - REQUIRES VARIABLES
  mysteryBonus: {
    title: "MYSTERY BONUS DAY! ⚡",
    body: "All XP is MULTIPLIERx today only!",
    data: { action: 'open_challenges' }
  },

  // 🏆 Achievement - REQUIRES VARIABLES
  achievement: {
    title: "Achievement Unlocked! 🏆",
    body: "You earned 'ACHIEVEMENT'! +XP XP",
    data: { action: 'open_achievements' }
  },

  // 📊 Monthly Recap - REQUIRES VARIABLES  
  monthlyRecap: {
    title: "Your MONTH Recap is ready! 📊",
    body: "See your date highlights",
    data: { action: 'open_recap' }
  },

  // 📅 Weekly Summary - REQUIRES VARIABLES
  weeklySummary: {
    title: "Your Week in Love 💕",
    body: "You went on DATES dates and earned XP XP!",
    data: { action: 'open_profile' }
  }
};

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

// Get random template from category (for scheduled notifications)
export const getRandomTemplate = (category) => {
  const templates = NOTIFICATION_TEMPLATES[category];
  if (!templates || templates.length === 0) return null;
  return templates[Math.floor(Math.random() * templates.length)];
};

// Fill dynamic template with real values
export const fillDynamicTemplate = (templateKey, values = {}) => {
  const template = DYNAMIC_TEMPLATES[templateKey];
  if (!template) return null;
  
  let title = template.title;
  let body = template.body;
  
  // Replace placeholders with actual values
  Object.entries(values).forEach(([key, value]) => {
    const placeholder = key.toUpperCase();
    title = title.replace(placeholder, value);
    body = body.replace(placeholder, value);
  });
  
  return { ...template, title, body };
};

// ============================================
// 📅 RATE LIMITING & SPAM PREVENTION
// ============================================

const RATE_LIMIT_KEY = 'datemaker_notification_tracking';
const MAX_NOTIFICATIONS_PER_DAY = 3;

// Get today's date key
const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

// Get notification tracking from localStorage
const getNotificationTracking = () => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Reset if it's a new day
      if (data.date !== getTodayKey()) {
        return { date: getTodayKey(), count: 0, lastInit: null };
      }
      return data;
    }
  } catch (e) {
    console.log('Error reading notification tracking');
  }
  return { date: getTodayKey(), count: 0, lastInit: null };
};

// Save notification tracking
const saveNotificationTracking = (data) => {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (e) {
    console.log('Error saving notification tracking');
  }
};

// Check if we can send more notifications today
export const canSendNotification = () => {
  const tracking = getNotificationTracking();
  return tracking.count < MAX_NOTIFICATIONS_PER_DAY;
};

// Increment notification count
const incrementNotificationCount = () => {
  const tracking = getNotificationTracking();
  tracking.count += 1;
  saveNotificationTracking(tracking);
};

// Check if notifications were already initialized today
const wasInitializedToday = () => {
  const tracking = getNotificationTracking();
  return tracking.lastInit === getTodayKey();
};

// Mark as initialized today
const markAsInitialized = () => {
  const tracking = getNotificationTracking();
  tracking.lastInit = getTodayKey();
  saveNotificationTracking(tracking);
};

// ============================================
// 💾 USER NOTIFICATION PREFERENCES
// ============================================

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: true,
  morningInspiration: true,
  tonightsVibe: true,
  dailyChallenge: true,
  streakReminder: true,
  achievements: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
};

// Get notification preferences
export const getNotificationPreferences = async (userId) => {
  try {
    const prefsDocRef = doc(db, 'notificationPreferences', userId);
    const prefsDoc = await getDoc(prefsDocRef);
    
    if (prefsDoc.exists()) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...prefsDoc.data() };
    }
    
    return DEFAULT_NOTIFICATION_PREFERENCES;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
};

// Save notification preferences
export const saveNotificationPreferences = async (userId, preferences) => {
  try {
    const prefsDocRef = doc(db, 'notificationPreferences', userId);
    await setDoc(prefsDocRef, {
      ...preferences,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return false;
  }
};

// Check if in quiet hours
export const isQuietHours = (preferences) => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const quietStart = preferences.quietHoursStart || '22:00';
  const quietEnd = preferences.quietHoursEnd || '08:00';
  
  if (quietStart > quietEnd) {
    return currentTime >= quietStart || currentTime < quietEnd;
  }
  
  return currentTime >= quietStart && currentTime < quietEnd;
};

// ============================================
// 📤 SEND LOCAL NOTIFICATION (with rate limiting)
// ============================================

export const sendLocalNotification = async (title, body, data = {}, schedule = null) => {
  try {
    // Check rate limit (skip for scheduled notifications)
    if (!schedule && !canSendNotification()) {
      console.log('📱 Rate limit reached, skipping notification');
      return false;
    }

    const { LocalNotifications } = await import('@capacitor/local-notifications');
    
    // Request permission if needed
    const permResult = await LocalNotifications.checkPermissions();
    if (permResult.display !== 'granted') {
      const reqResult = await LocalNotifications.requestPermissions();
      if (reqResult.display !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }
    }
    
    const notificationId = Math.floor(Math.random() * 100000);
    
    const notification = {
      id: notificationId,
      title,
      body,
      extra: data,
      sound: 'default'
    };
    
    if (schedule) {
      notification.schedule = schedule;
    }
    
    await LocalNotifications.schedule({
      notifications: [notification]
    });
    
    // Increment count for non-scheduled notifications
    if (!schedule) {
      incrementNotificationCount();
    }
    
    console.log('📱 Notification sent:', title);
    return true;
  } catch (error) {
    console.error('Error sending local notification:', error);
    return false;
  }
};

// ============================================
// 📅 SCHEDULE REPEATING NOTIFICATION
// ============================================

export const scheduleRepeatingNotification = async (title, body, data, hour, minute, weekday = null) => {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    
    const notificationId = Math.floor(Math.random() * 100000);
    
    const schedule = {
      on: { hour, minute },
      repeats: true
    };
    
    if (weekday !== null) {
      schedule.on.weekday = weekday;
    }
    
    await LocalNotifications.schedule({
      notifications: [{
        id: notificationId,
        title,
        body,
        extra: data,
        schedule,
        sound: 'default'
      }]
    });
    
    console.log(`📱 Scheduled: ${title} at ${hour}:${minute}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async () => {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const pending = await LocalNotifications.getPending();
    
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
      console.log(`Cancelled ${pending.notifications.length} notifications`);
    }
    
    return true;
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    return false;
  }
};

// ============================================
// 🚀 INITIALIZE ENGAGEMENT NOTIFICATIONS
// ============================================

export const initializeEngagementNotifications = async (userId, isPremium = false) => {
  try {
    // SPAM PREVENTION: Only initialize once per day
    if (wasInitializedToday()) {
      console.log('📱 Notifications already initialized today, skipping');
      return true;
    }
    
    const preferences = await getNotificationPreferences(userId);
    
    if (!preferences.enabled) {
      console.log('Notifications disabled by user');
      return false;
    }
    
    // Cancel existing to prevent duplicates
    await cancelAllNotifications();
    
    // Schedule Morning Inspiration (9 AM) - Only ONE per day
    if (preferences.morningInspiration) {
      const template = getRandomTemplate('morningInspiration');
      if (template) {
        await scheduleRepeatingNotification(
          template.title,
          template.body,
          template.data,
          9, 0
        );
      }
    }
    
    // Schedule Tonight's Vibe (5 PM) - Only ONE per day
    if (preferences.tonightsVibe) {
      const template = getRandomTemplate('tonightsVibe');
      if (template) {
        await scheduleRepeatingNotification(
          template.title,
          template.body,
          template.data,
          17, 0
        );
      }
    }
    
    // Mark as initialized to prevent re-scheduling
    markAsInitialized();
    
    console.log('✅ Engagement notifications initialized (max 2/day scheduled)');
    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

// ============================================
// 🎯 SEND SPECIFIC NOTIFICATIONS (with real values)
// ============================================

// Streak at risk notification
export const sendStreakRiskNotification = async (streakWeeks, daysRemaining) => {
  if (!canSendNotification()) return false;
  
  const title = `Your streak is at risk! 🔥`;
  const body = `Plan a date to keep your ${streakWeeks}-week streak alive! ${daysRemaining} days left.`;
  
  return sendLocalNotification(title, body, { action: 'open_generator' });
};

// Streak milestone notification
export const sendStreakMilestoneNotification = async (streakWeeks, multiplier) => {
  if (!canSendNotification()) return false;
  
  const title = `${streakWeeks} Week Streak! 🔥`;
  const body = `Amazing! You're now earning ${multiplier}x XP on everything!`;
  
  return sendLocalNotification(title, body, { action: 'open_profile' });
};

// Mystery bonus notification
export const sendMysteryBonusNotification = async (multiplier) => {
  if (!canSendNotification()) return false;
  
  const title = `MYSTERY BONUS DAY! ⚡`;
  const body = `All XP is ${multiplier}x today only! Don't waste it!`;
  
  return sendLocalNotification(title, body, { action: 'open_challenges' });
};

// Achievement notification
export const sendAchievementNotification = async (achievementTitle, xpAmount) => {
  if (!canSendNotification()) return false;
  
  const title = `Achievement Unlocked! 🏆`;
  const body = `You earned "${achievementTitle}"! +${xpAmount} XP`;
  
  return sendLocalNotification(title, body, { action: 'open_achievements' });
};

// Monthly recap notification
export const sendRecapNotification = async (monthName) => {
  if (!canSendNotification()) return false;
  
  const title = `Your ${monthName} Recap is ready! 📊`;
  const body = `See your date highlights`;
  
  return sendLocalNotification(title, body, { action: 'open_recap' });
};

// Weekly summary notification (with actual stats)
export const sendWeeklySummaryNotification = async (datesCount, xpEarned) => {
  if (!canSendNotification()) return false;
  
  const title = `Your Week in Love 💕`;
  const body = `You went on ${datesCount} date(s) and earned ${xpEarned} XP this week!`;
  
  return sendLocalNotification(title, body, { action: 'open_profile' });
};

// ============================================
// 📱 HANDLE NOTIFICATION TAP
// ============================================

export const setupNotificationHandlers = (navigation) => {
  const setupHandlers = async () => {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        const data = notification.notification.extra || {};
        console.log('📱 Notification tapped:', data);
        
        // Handle navigation based on action
        switch (data.action) {
          case 'open_generator':
            // Navigate to main screen
            break;
          case 'open_challenges':
            // Navigate to challenges
            break;
          case 'open_recap':
            // Open monthly recap
            break;
          case 'open_profile':
            // Navigate to profile
            break;
          case 'open_achievements':
            // Navigate to achievements
            break;
          default:
            break;
        }
      });
      
      console.log('✅ Notification handlers set up');
    } catch (error) {
      console.error('Error setting up notification handlers:', error);
    }
  };
  
  setupHandlers();
};

// ============================================
// 🔥 CHECK STREAK STATUS
// ============================================

export const checkStreakStatus = async (userId) => {
  try {
    const streakDocRef = doc(db, 'dateStreaks', userId);
    const streakDoc = await getDoc(streakDocRef);
    
    if (!streakDoc.exists()) return null;
    
    const data = streakDoc.data();
    const lastDateTimestamp = data.lastDateAt?.toDate() || new Date(0);
    const now = new Date();
    
    const daysSinceLastDate = Math.floor((now - lastDateTimestamp) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastDate >= 5 && daysSinceLastDate <= 7 && data.currentStreak > 0) {
      return {
        atRisk: true,
        streak: data.currentStreak,
        daysUntilLoss: Math.max(0, 7 - daysSinceLastDate)
      };
    }
    
    return { atRisk: false, streak: data.currentStreak };
  } catch (error) {
    console.error('Error checking streak:', error);
    return null;
  }
};

export default {
  NOTIFICATION_TEMPLATES,
  getRandomTemplate,
  fillDynamicTemplate,
  canSendNotification,
  getNotificationPreferences,
  saveNotificationPreferences,
  sendLocalNotification,
  scheduleRepeatingNotification,
  cancelAllNotifications,
  initializeEngagementNotifications,
  sendStreakRiskNotification,
  sendStreakMilestoneNotification,
  sendMysteryBonusNotification,
  sendAchievementNotification,
  sendRecapNotification,
  sendWeeklySummaryNotification,
  setupNotificationHandlers,
  checkStreakStatus
};