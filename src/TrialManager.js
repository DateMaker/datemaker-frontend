import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

// Trial configuration
export const TRIAL_DAYS = 7;

/**
 * Initialize trial for new user
 */
export const initializeTrial = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    // Get current auth user for email
    const currentUser = auth.currentUser;
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Only initialize trial if user is 'free' and hasn't had trial
      if (userData.subscriptionStatus === 'free' && !userData.trialStartedAt) {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7);

        await setDoc(userDocRef, {
          subscriptionStatus: 'trial',
          trialStartedAt: new Date().toISOString(),
          trialEndsAt: trialEndsAt.toISOString(),
          email: currentUser?.email || userData.email || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('✅ Trial initialized for user:', userId);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error initializing trial:', error);
    return false;
  }
};

/**
 * Check if trial is still active
 */
export const isTrialActive = (userData) => {
  if (!userData) return false;
  
  // If they're premium, trial doesn't matter
  if (userData.subscriptionStatus === 'premium' || userData.subscriptionStatus === 'active') {
    return true;
  }

  // If not on trial, return false
  if (userData.subscriptionStatus !== 'trial') {
    return false;
  }

  // Check if trial has expired
  const now = new Date();
  const trialEnd = new Date(userData.trialEndDate);
  
  return now < trialEnd;
};

/**
 * Get days left in trial
 */
export const getDaysLeftInTrial = (userData) => {
  if (!userData || userData.subscriptionStatus !== 'trial') return 0;

  const now = new Date();
  const trialEnd = new Date(userData.trialEndDate);
  const diff = trialEnd - now;

  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get hours left in trial
 */
export const getHoursLeftInTrial = (userData) => {
  if (!userData || userData.subscriptionStatus !== 'trial') return 0;

  const now = new Date();
  const trialEnd = new Date(userData.trialEndDate);
  const diff = trialEnd - now;

  if (diff <= 0) return 0;

  return Math.floor(diff / (1000 * 60 * 60));
};

/**
 * Check if user should see upgrade prompt
 */
export const shouldShowUpgradePrompt = (userData) => {
  if (!userData) return false;
  
  // Show if on trial with less than 2 days left
  if (userData.subscriptionStatus === 'trial') {
    const daysLeft = getDaysLeftInTrial(userData);
    return daysLeft <= 2;
  }

  // Show if trial expired
  if (userData.subscriptionStatus === 'trial_expired') {
    return true;
  }

  return false;
};

/**
 * Mark trial as expired (called when trial ends)
 */
export const expireTrial = async (userId) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      subscriptionStatus: 'trial_expired'
    }, { merge: true });

    console.log(`⏰ Trial expired for user ${userId}`);
  } catch (error) {
    console.error('Error expiring trial:', error);
    throw error;
  }
};

/**
 * Activate premium subscription (called after successful payment)
 */
export const activatePremium = async (userId, plan) => {
  try {
    const now = new Date();
    const expiryDate = new Date(now);
    
    // Set expiry based on plan
    if (plan === 'annual') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    await setDoc(doc(db, 'users', userId), {
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
      subscriptionStartDate: now.toISOString(),
      subscriptionExpiryDate: expiryDate.toISOString()
    }, { merge: true });

    console.log(`✅ Premium activated for user ${userId}: ${plan}`);
  } catch (error) {
    console.error('Error activating premium:', error);
    throw error;
  }
};

/**
 * Get trial status for UI display
 */
export const getTrialStatus = (userData) => {
  if (!userData) return null;

  if (userData.subscriptionStatus === 'active' || userData.subscriptionStatus === 'premium') {
    return {
      status: 'active',
      isPremium: true,
      message: 'Premium Active'
    };
  }

  if (userData.subscriptionStatus === 'trial') {
    const daysLeft = getDaysLeftInTrial(userData);
    const hoursLeft = getHoursLeftInTrial(userData);

    if (daysLeft === 0 && hoursLeft > 0) {
      return {
        status: 'trial',
        isPremium: false,
        daysLeft: 0,
        hoursLeft: hoursLeft,
        message: `${hoursLeft}h left in trial`,
        urgent: true
      };
    }

    return {
      status: 'trial',
      isPremium: false,
      daysLeft: daysLeft,
      message: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in trial`,
      urgent: daysLeft <= 2
    };
  }

  if (userData.subscriptionStatus === 'trial_expired') {
    return {
      status: 'expired',
      isPremium: false,
      message: 'Trial Expired',
      urgent: true
    };
  }

  return {
    status: 'free',
    isPremium: false,
    message: 'Free Plan'
  };
};