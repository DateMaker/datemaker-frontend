// ============================================
// 📊 ACTIVITY TRACKER - Core Tracking Service
// DateMaker - Real Action Tracking System
// ============================================
// Tracks all user actions for challenge auto-completion
// 24-hour reset from first action of the day
// ============================================

// ============================================
// 🎯 ACTION TYPES
// ============================================
export const ACTION_TYPES = {
  // Easy challenges
  BROWSE_DATE: 'browse_date',           // View a date idea
  SAVE_DATE: 'save_date',               // Save a date
  SHARE_DATE: 'share_date',             // Share a date
  SPIN_WHEEL: 'spin_wheel',             // Use spinning wheel
  VIEW_PROFILE: 'view_profile',         // Open profile/stats
  BROWSE_CATEGORY: 'browse_category',   // Browse a category
  
  // Medium challenges
  GENERATE_DATE: 'generate_date',       // Generate a date idea
  COMPLETE_DATE: 'complete_date',       // Mark date as completed
  ADD_MEMORY: 'add_memory',             // Add photo to scrapbook
  SEND_MESSAGE: 'send_message',         // Send a message
  RATE_DATE: 'rate_date',               // Rate a completed date
  PLAN_SURPRISE: 'plan_surprise',       // Create a surprise date
  
  // Hard challenges (some trackable)
  COMPLETE_FREE_DATE: 'complete_free_date',  // Complete $0 date
  INVITE_FRIEND: 'invite_friend',            // Share invite link
  COMPLETE_WEEKLY: 'complete_weekly',        // First date this week
  TRY_NEW_CATEGORY: 'try_new_category',      // New category tried
};

// ============================================
// 🗄️ STORAGE KEYS
// ============================================
const STORAGE_KEY = 'datemaker_activity';
const RESET_KEY = 'datemaker_activity_reset';
const CATEGORIES_KEY = 'datemaker_categories_used';

// ============================================
// ⏰ 24-HOUR RESET LOGIC
// ============================================
const getResetTime = () => {
  const stored = localStorage.getItem(RESET_KEY);
  return stored ? parseInt(stored, 10) : null;
};

const setResetTime = () => {
  const resetAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
  localStorage.setItem(RESET_KEY, resetAt.toString());
  return resetAt;
};

const shouldReset = () => {
  const resetTime = getResetTime();
  if (!resetTime) return false;
  return Date.now() >= resetTime;
};

const checkAndReset = () => {
  if (shouldReset()) {
    console.log('🔄 24-hour reset triggered');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RESET_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
    return true;
  }
  return false;
};

// ============================================
// 📈 GET CURRENT ACTIVITY DATA
// ============================================
export const getActivityData = () => {
  checkAndReset();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      browse_date: 0,
      save_date: 0,
      share_date: 0,
      spin_wheel: 0,
      view_profile: 0,
      browse_category: 0,
      generate_date: 0,
      complete_date: 0,
      add_memory: 0,
      send_message: 0,
      rate_date: 0,
      plan_surprise: 0,
      complete_free_date: 0,
      invite_friend: 0,
      complete_weekly: 0,
      try_new_category: 0,
    };
  }
  
  return JSON.parse(stored);
};

// ============================================
// 📝 TRACK AN ACTION
// ============================================
export const trackAction = (actionType, metadata = {}) => {
  checkAndReset();
  
  // Start 24hr timer on first action
  if (!getResetTime()) {
    setResetTime();
    console.log('⏰ 24-hour timer started');
  }
  
  const data = getActivityData();
  
  // Increment the action count
  data[actionType] = (data[actionType] || 0) + 1;
  
  // Save
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  console.log(`📊 Tracked: ${actionType} (count: ${data[actionType]})`);
  
  // Special handling for categories
  if (actionType === ACTION_TYPES.BROWSE_CATEGORY && metadata.category) {
    trackCategoryUsed(metadata.category);
  }
  
  // Special handling for new category
  if (actionType === ACTION_TYPES.COMPLETE_DATE && metadata.category) {
    checkNewCategory(metadata.category);
  }
  
  return data[actionType];
};

// ============================================
// 📁 CATEGORY TRACKING (for "try new category")
// ============================================
const getCategoriesUsed = () => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  return stored ? JSON.parse(stored) : [];
};

const trackCategoryUsed = (category) => {
  const categories = getCategoriesUsed();
  if (!categories.includes(category)) {
    categories.push(category);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
  return categories.length;
};

const checkNewCategory = (category) => {
  const stored = localStorage.getItem('datemaker_all_categories');
  const allUsed = stored ? JSON.parse(stored) : [];
  
  if (!allUsed.includes(category)) {
    // This is a new category they've never tried!
    allUsed.push(category);
    localStorage.setItem('datemaker_all_categories', JSON.stringify(allUsed));
    trackAction(ACTION_TYPES.TRY_NEW_CATEGORY);
    return true;
  }
  return false;
};

export const getUniqueCategoriesCount = () => {
  return getCategoriesUsed().length;
};

// ============================================
// 🎯 GET PROGRESS FOR A CHALLENGE
// ============================================
export const getChallengeProgress = (challengeId) => {
  const data = getActivityData();
  
  const progressMap = {
    // Easy
    'browse_5': { current: data.browse_date || 0, target: 5 },
    'save_1': { current: data.save_date || 0, target: 1 },
    'share_idea': { current: data.share_date || 0, target: 1 },
    'spin_wheel': { current: data.spin_wheel || 0, target: 1 },
    'view_profile': { current: data.view_profile || 0, target: 1 },
    'browse_categories': { current: getUniqueCategoriesCount(), target: 3 },
    
    // Medium
    'generate_3': { current: data.generate_date || 0, target: 3 },
    'complete_date': { current: data.complete_date || 0, target: 1 },
    'add_memory': { current: data.add_memory || 0, target: 1 },
    'send_message': { current: data.send_message || 0, target: 1 },
    'rate_date': { current: data.rate_date || 0, target: 1 },
    'plan_surprise': { current: data.plan_surprise || 0, target: 1 },
    
    // Hard (trackable ones)
    'zero_dollar': { current: data.complete_free_date || 0, target: 1 },
    'invite_friend': { current: data.invite_friend || 0, target: 1 },
    'first_date_week': { current: data.complete_weekly || 0, target: 1 },
    'try_new_category': { current: data.try_new_category || 0, target: 1 },
    
    // Manual only (no auto-tracking)
    'local_legend': { current: 0, target: 1, manual: true },
    'double_date': { current: 0, target: 1, manual: true },
  };
  
  return progressMap[challengeId] || { current: 0, target: 1, manual: true };
};

// ============================================
// ✅ CHECK IF CHALLENGE IS COMPLETE
// ============================================
export const isChallengeComplete = (challengeId) => {
  const progress = getChallengeProgress(challengeId);
  return progress.current >= progress.target;
};

// ============================================
// ⏰ GET TIME REMAINING
// ============================================
export const getTimeRemaining = () => {
  const resetTime = getResetTime();
  if (!resetTime) {
    return { hours: 24, minutes: 0, active: false };
  }
  
  const remaining = resetTime - Date.now();
  if (remaining <= 0) {
    return { hours: 0, minutes: 0, active: false };
  }
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, active: true };
};

// ============================================
// 🔄 MANUAL RESET (for testing)
// ============================================
export const resetAllActivity = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(RESET_KEY);
  localStorage.removeItem(CATEGORIES_KEY);
  console.log('🗑️ All activity data reset');
};

// ============================================
// 📤 EXPORT FOR ANALYTICS (optional)
// ============================================
export const exportActivityData = () => {
  return {
    activity: getActivityData(),
    categoriesUsed: getCategoriesUsed(),
    timeRemaining: getTimeRemaining(),
    resetTime: getResetTime(),
  };
};

export default {
  ACTION_TYPES,
  trackAction,
  getActivityData,
  getChallengeProgress,
  isChallengeComplete,
  getTimeRemaining,
  getUniqueCategoriesCount,
  resetAllActivity,
  exportActivityData,
};