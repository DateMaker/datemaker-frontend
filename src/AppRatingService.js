// ============================================
// ⭐ APP RATING SERVICE
// iOS App Store Rating Integration
// ============================================
// Uses native iOS SKStoreReviewController
// Ratings go directly to App Store
// ============================================

import { Capacitor } from '@capacitor/core';

// Try to import the rating plugin
let RateApp = null;
try {
  const rateModule = require('capacitor-rate-app');
  RateApp = rateModule.RateApp;
} catch (e) {
  console.log('RateApp plugin not available');
}

// ============================================
// 📊 RATING TRIGGER CONFIG
// ============================================
const RATING_CONFIG = {
  // Minimum criteria before asking for rating
  minDatesCompleted: 0,        // User must complete at least 3 dates
  minDaysSinceInstall: 7,      // Wait at least 7 days
  minSessionCount: 5,          // User must have opened app 5+ times
  daysBetweenPrompts: 90,      // Don't ask more than once every 90 days
  
  // Storage keys
  STORAGE_KEY: 'appRating_data',
};

// ============================================
// 💾 STORAGE HELPERS
// ============================================
const getRatingData = () => {
  try {
    const data = localStorage.getItem(RATING_CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : {
      installDate: Date.now(),
      sessionCount: 0,
      lastPromptDate: null,
      hasRated: false,
      datesCompleted: 0,
    };
  } catch (e) {
    return {
      installDate: Date.now(),
      sessionCount: 0,
      lastPromptDate: null,
      hasRated: false,
      datesCompleted: 0,
    };
  }
};

const saveRatingData = (data) => {
  try {
    localStorage.setItem(RATING_CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save rating data:', e);
  }
};

// ============================================
// 🎯 RATING SERVICE
// ============================================
const AppRatingService = {
  
  // Initialize on app start - track sessions
  initialize: () => {
    const data = getRatingData();
    data.sessionCount = (data.sessionCount || 0) + 1;
    saveRatingData(data);
    console.log('📊 App Rating: Session count:', data.sessionCount);
  },

  // Track when user completes a date
  trackDateCompleted: () => {
    const data = getRatingData();
    data.datesCompleted = (data.datesCompleted || 0) + 1;
    saveRatingData(data);
    console.log('📊 App Rating: Dates completed:', data.datesCompleted);
  },

  // Check if we should show rating prompt
  shouldShowRating: () => {
    // Only works on iOS
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('📊 App Rating: Not iOS native, skipping');
      return false;
    }

    // Check if plugin is available
    if (!RateApp) {
      console.log('📊 App Rating: Plugin not available');
      return false;
    }

    const data = getRatingData();
    
    // Already rated
    if (data.hasRated) {
      console.log('📊 App Rating: User already rated');
      return false;
    }

    // Check minimum dates completed
    if ((data.datesCompleted || 0) < RATING_CONFIG.minDatesCompleted) {
      console.log('📊 App Rating: Not enough dates completed:', data.datesCompleted);
      return false;
    }

    // Check minimum sessions
    if ((data.sessionCount || 0) < RATING_CONFIG.minSessionCount) {
      console.log('📊 App Rating: Not enough sessions:', data.sessionCount);
      return false;
    }

    // Check days since install
    const daysSinceInstall = (Date.now() - (data.installDate || Date.now())) / (1000 * 60 * 60 * 24);
    if (daysSinceInstall < RATING_CONFIG.minDaysSinceInstall) {
      console.log('📊 App Rating: Too soon since install:', daysSinceInstall.toFixed(1), 'days');
      return false;
    }

    // Check days since last prompt
    if (data.lastPromptDate) {
      const daysSincePrompt = (Date.now() - data.lastPromptDate) / (1000 * 60 * 60 * 24);
      if (daysSincePrompt < RATING_CONFIG.daysBetweenPrompts) {
        console.log('📊 App Rating: Too soon since last prompt:', daysSincePrompt.toFixed(1), 'days');
        return false;
      }
    }

    console.log('📊 App Rating: All conditions met, should show rating');
    return true;
  },

  // Show the native iOS rating popup
  requestRating: async () => {
    if (!AppRatingService.shouldShowRating()) {
      return false;
    }

    try {
      console.log('📊 App Rating: Requesting native iOS rating dialog...');
      
      // Call the native iOS rating dialog
      await RateApp.requestReview();
      
      // Update tracking data
      const data = getRatingData();
      data.lastPromptDate = Date.now();
      data.hasRated = true; // Assume they rated (we can't know for sure)
      saveRatingData(data);
      
      console.log('📊 App Rating: Rating dialog shown successfully');
      return true;
    } catch (error) {
      console.error('📊 App Rating: Error showing rating dialog:', error);
      return false;
    }
  },

  // Force show rating (for testing or manual trigger)
  forceRequestRating: async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('📊 App Rating: Not iOS native');
      return false;
    }

    if (!RateApp) {
      console.log('📊 App Rating: Plugin not available');
      return false;
    }

    try {
      console.log('📊 App Rating: Force requesting rating dialog...');
      await RateApp.requestReview();
      return true;
    } catch (error) {
      console.error('📊 App Rating: Error:', error);
      return false;
    }
  },

  // Reset rating data (for testing)
  resetRatingData: () => {
    localStorage.removeItem(RATING_CONFIG.STORAGE_KEY);
    console.log('📊 App Rating: Data reset');
  },

  // Get current rating data (for debugging)
  getRatingStats: () => {
    return getRatingData();
  },
};

export default AppRatingService;

// ============================================
// 📝 USAGE INSTRUCTIONS
// ============================================
/*
1. Import in DateMaker.js:
   import AppRatingService from './AppRatingService';

2. Initialize on app load (in useEffect):
   useEffect(() => {
     AppRatingService.initialize();
   }, []);

3. Track when user completes a date:
   // After saving a completed date
   AppRatingService.trackDateCompleted();
   
   // Then check if we should ask for rating
   AppRatingService.requestRating();

4. Good trigger points:
   - After completing 3rd date
   - After hitting a streak milestone
   - After unlocking an achievement
   - After saving a date memory

5. The native iOS dialog will only show:
   - 3 times per year max (Apple's limit)
   - Only on iOS 10.3+
   - Only if user hasn't disabled it

Example integration in date completion:

const handleDateComplete = async () => {
  // Save the date...
  await saveCompletedDate(dateData);
  
  // Track completion for rating
  AppRatingService.trackDateCompleted();
  
  // Try to show rating (will only show if conditions met)
  setTimeout(() => {
    AppRatingService.requestRating();
  }, 2000); // Small delay so user sees their completed date first
};
*/