import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { MapPin, Heart, Navigation, ExternalLink, Star, Sparkles, BookmarkPlus, BookmarkCheck, RefreshCw, User, Users, Clock, ArrowRight, MessageCircle, Share2, CheckCircle, Gift, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, sendEmailVerification } from 'firebase/auth';
import { collection, query, where, onSnapshot, getDocs, writeBatch, doc, getDoc, setDoc, serverTimestamp, orderBy, limit, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './Login';
import Signup from './Signup';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword } from 'firebase/auth';
import SubscriptionModal from './SubscriptionModal';
import ShareDateModal from './ShareDateModal';
import Social from './Social';
import { translations, getTranslation } from './Translations';
import LanguageSelector from './LanguageSelector';
import { calculateLevel, getProgressToNextLevel, POINT_VALUES, formatXP } from './GameSystem';
import { CHALLENGES, getRandomChallenge, getChallengesForStop } from './Challenges-data.js';
import StatsDisplay from './StatsDisplay';
import AchievementsDisplay from './Achievements';
import LevelUpModal from './LevelUpModal';
import XPBar from './XPBar';
import SpinningWheel from './SpinningWheel';
import HamburgerMenu from './HamBurgerMenu';
import { SipAndSpillBanner, TopVenuesSection, UpcomingEventsSection } from './FeaturedSection';
import { EventsExplorer, VenuesExplorer } from './ExploreScreen';
import DateMemoryScrapbook from './DateMemoryScrapbook';
import SurpriseDateMode from './SurpriseDateMode';
import DateStreaksGoals from './DateStreaksGoals';
import SubscribeButton from './SubscribeButton';
import { deleteUser } from 'firebase/auth';
import SubscriptionManager from './Subscriptionmanager';
import PremiumFeatureModal from './PremiumFeatureModal';
import TermsModal from './Terms';
import PrivacyModal from './Privacy';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import InviteFriendsModal from './InviteFriendsModal';
import { SipAndSpillHomeBanner, SipAndSpillCard, SipAndSpillDateSuggestion, openSipAndSpill } from './SipAndSpillPartner';
import AppleSubscriptionModal from './AppleSubscriptionModal';
import IAPManager from './IAPManager';
import PushNotificationService from './PushNotificationService';
import { isAdmin, hasPremiumAccess } from './adminConfig';
import HumanCopy from './HumanCopy';
import HapticService from './HapticService';
import FloatingSocialButton from './FloatingSocialButton';
import './PremiumEffects.css';
import DailyChallenges from './DailyChallenges';
import MonthlyRecap from './MonthlyRecap';
import { trackAction, ACTION_TYPES } from './ActivityTracker';
import NotificationSettings from './NotificationSettings';
import FreeDateMode from './FreeDateMode';
import LongDistanceMode from './LongDistanceMode';
import Shop from './Shop';
import MusicSelector, { getPlaylistForCategory } from './DateMusicService';
import AppRatingService from './AppRatingService';
import { DateModeSelector, DateMusicButton } from './DateMakerAddOns';
import { 
  getTodaysChallenges, 
  getStreakBonus, 
  checkMysteryBonus,
  CHALLENGE_CATEGORIES
} from './DailyChallengesData';
import { 
  ACHIEVEMENTS, 
  checkForNewAchievements,
  checkAchievementProgress 
} from './NewAchievements';
import {
  initializeEngagementNotifications,
  sendStreakRiskNotification,
  sendStreakMilestoneNotification,
  sendAchievementNotification,
  checkStreakStatus
} from './EngagementNotifications';
export default function DateMaker() {
  const navigate = useNavigate(); 

  // Language state and helper
  const [language, setLanguage] = useState('en');
  const t = (key) => getTranslation(language, key);
  const isRTL = translations[language]?.dir === 'rtl';
  
const [bgTheme] = useState(() => {
  const themes = [
    // Light Pink
    { gradient: 'linear-gradient(-45deg, #fdf2f8, #fce7f3, #fbcfe8, #fdf2f8)', accent: '#ec4899' },
    // Soft Lavender
    { gradient: 'linear-gradient(-45deg, #faf5ff, #f3e8ff, #e9d5ff, #faf5ff)', accent: '#a855f7' },
    // Warm Peach
    { gradient: 'linear-gradient(-45deg, #fff7ed, #ffedd5, #fed7aa, #fff7ed)', accent: '#f97316' },
    // Cool Mint
    { gradient: 'linear-gradient(-45deg, #f0fdfa, #ccfbf1, #99f6e4, #f0fdfa)', accent: '#14b8a6' },
    // Soft Blue
    { gradient: 'linear-gradient(-45deg, #eff6ff, #dbeafe, #bfdbfe, #eff6ff)', accent: '#3b82f6' },
    // Rose Gold
    { gradient: 'linear-gradient(-45deg, #fff1f2, #ffe4e6, #fecdd3, #fff1f2)', accent: '#e11d48' },
    // Light Lime
    { gradient: 'linear-gradient(-45deg, #f7fee7, #ecfccb, #d9f99d, #f7fee7)', accent: '#84cc16' },
  ];
  return themes[Math.floor(Math.random() * themes.length)];
});
  
  // Core states
  const [user, setUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState('login'); // 'login', 'signup', 'success', 'verification', 'main'
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [initError, setInitError] = useState(null);
  const [showSocial, setShowSocial] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [dateToShare, setDateToShare] = useState(null);
  const [photoToken, setPhotoToken] = useState('');
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [lastViewedSavedCount, setLastViewedSavedCount] = useState(0);
const [showTerms, setShowTerms] = useState(false);
const [showPrivacy, setShowPrivacy] = useState(false);
  const [userData, setUserData] = useState(null);
  const resultsTopRef = useRef(null);
  const abortControllerRef = useRef(null);
const [showInviteFriends, setShowInviteFriends] = useState(false);
const [showPremiumModal, setShowPremiumModal] = useState(false);
const [loadingMessage, setLoadingMessage] = useState('');
  const [showDailyChallenges, setShowDailyChallenges] = useState(false);
const [showMonthlyRecap, setShowMonthlyRecap] = useState(false);
const [showNotificationSettings, setShowNotificationSettings] = useState(false);
const [todaysChallenges, setTodaysChallenges] = useState([]);
const [completedChallenges, setCompletedChallenges] = useState([]);
const [mysteryBonusActive, setMysteryBonusActive] = useState(null);
const [newAchievementUnlocked, setNewAchievementUnlocked] = useState(null);
const [streakBonus, setStreakBonus] = useState({ multiplier: 1, badge: null });
const [showFreeDateMode, setShowFreeDateMode] = useState(false);
const [showLongDistanceMode, setShowLongDistanceMode] = useState(false);
const [showMusicSelector, setShowMusicSelector] = useState(false);
const [showShop, setShowShop] = useState(false);
const [userPurchases, setUserPurchases] = useState({
  badges: ['sparkle'],
  confetti: ['classic'],
  selectedBadge: 'sparkle',
  selectedConfetti: 'classic'
});
const [showEventsExplorer, setShowEventsExplorer] = useState(false);
const [showVenuesExplorer, setShowVenuesExplorer] = useState(false);

// Date generation states
  const [location, setLocation] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [customActivities, setCustomActivities] = useState([]);
  const [customActivityInput, setCustomActivityInput] = useState('');
  const [places, setPlaces] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
const [showResults, setShowResults] = useState(false);
const [isGenerating, setIsGenerating] = useState(false);        
const [initialLoading, setInitialLoading] = useState(true);    
  const [savedDates, setSavedDates] = useState([]);
  const [showSavedDates, setShowSavedDates] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [savingItinerary, setSavingItinerary] = useState(false);
  const [includeEvents, setIncludeEvents] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateRange, setDateRange] = useState('anytime');
  const [startTime, setStartTime] = useState('6:00 PM');
  const [duration, setDuration] = useState('6');
  const [itineraryToShare, setItineraryToShare] = useState(null);

// 🎮 ADVENTURE MODE STATE - Add with your other useState calls
const [earnedXP, setEarnedXP] = useState(0);
const [showConfetti, setShowConfetti] = useState(false);
const [activeWildcard, setActiveWildcard] = useState(null);
const [showConversation, setShowConversation] = useState(false);
const [currentConversation, setCurrentConversation] = useState('');
const [conversationCategory, setConversationCategory] = useState('deep');
const [completedStages, setCompletedStages] = useState([]);
const [comboCount, setComboCount] = useState(0);
const [lastChallengeTime, setLastChallengeTime] = useState(null);
const [expandedTips, setExpandedTips] = useState({});

  // Profile states
  const [showProfile, setShowProfile] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [showSpinningWheel, setShowSpinningWheel] = useState(false);
  const [gameStats, setGameStats] = useState(null);


  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [activeMode, setActiveMode] = useState('normal');
  const [showPointsNotification, setShowPointsNotification] = useState(false);
  const [pointsNotificationData, setPointsNotificationData] = useState(null);
  
// 📸 SCRAPBOOK STATE
const [showScrapbook, setShowScrapbook] = useState(false);
const [scrapbookMode, setScrapbookMode] = useState('create'); // 'create' or 'view'
const [selectedMemory, setSelectedMemory] = useState(null);
const [dateToSave, setDateToSave] = useState(null); // Current itinerary to save

// 🎁 SURPRISE DATE STATE
const [showSurpriseDate, setShowSurpriseDate] = useState(false);
const [surpriseMode, setSurpriseMode] = useState('create'); // 'create', 'track', or 'reveal'
const [activeSurprise, setActiveSurprise] = useState(null);
const [surpriseCount, setSurpriseCount] = useState(0);

// 🔥 STREAK STATE
const [showStreaks, setShowStreaks] = useState(false);
const [userStreakData, setUserStreakData] = useState({
  currentStreak: 0,
  longestStreak: 0,
  lastDateWeek: null,
  totalDates: 0,
  badges: [],
  goals: [],
  weeklyChallenges: {}
});

const fetchUserData = async () => {
  if (!user?.uid) return;
  
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserData(data);
      // Check if admin - admins get premium for free
      if (isAdmin(user.email)) {
        setSubscriptionStatus('premium');
        console.log('👑 Admin detected - granting premium access');
      } else {
        setSubscriptionStatus(data.subscriptionStatus || 'free');
      }
      setSavedDates(data.savedDates || []);
      setProfilePhoto(data.profilePhoto || '');
      setLastViewedSavedCount(data.lastViewedSavedCount || 0);
      
      // Load user purchases from Firestore
      try {
        const purchasesDoc = await getDoc(doc(db, 'userPurchases', user.uid));
        if (purchasesDoc.exists()) {
          const purchaseData = purchasesDoc.data();
          setUserPurchases({
            badges: purchaseData.badges || ['sparkle'],
            confetti: purchaseData.confetti || ['classic'],
            selectedBadge: purchaseData.selectedBadge !== undefined ? purchaseData.selectedBadge : 'sparkle',
            selectedConfetti: purchaseData.selectedConfetti !== undefined ? purchaseData.selectedConfetti : 'classic'
          });
          console.log('✅ Loaded user purchases:', purchaseData);
        }
      } catch (err) {
        console.log('No purchases found, using defaults');
      }
     // 🍎 Initialize IAP for iOS after user data loaded
  if (Capacitor.getPlatform() === 'ios') {
    console.log('🚀 Initializing IAP for iOS...');
    
    // Wait for Cordova deviceready
    const initIAP = async () => {
      try {
        await new Promise((resolve) => {
          if (window.cordova && window.CdvPurchase) {
            console.log('✅ Cordova already ready');
            resolve();
          } else {
            console.log('⏳ Waiting for deviceready...');
            document.addEventListener('deviceready', resolve, { once: true });
            setTimeout(resolve, 3000);
          }
        });
        
        console.log('🔵 CdvPurchase available?', !!window.CdvPurchase);
        if (window.CdvPurchase) {
          await IAPManager.initialize();
          console.log('✅ IAP initialized');
        }
      } catch (error) {
        console.error('❌ IAP error:', error);
      }
    };
    
    // Run IAP init in background
    initIAP();
  }
  
} else {
  setSubscriptionStatus('free');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

// 🔍 DEBUG: Monitor subscription status changes
useEffect(() => {
  console.log('============================');
  console.log('🔍 Subscription Status:', subscriptionStatus);
  console.log('🔍 User Email:', user?.email);
  console.log('🔍 Email Verified:', user?.emailVerified);
  console.log('🔍 Banner should show:', subscriptionStatus === 'free');
  console.log('============================');
}, [subscriptionStatus, user]);
useEffect(() => {
  if (user?.uid) {
    PushNotificationService.initialize(user.uid);
  }
}, [user?.uid]);

// ⭐ APP RATING - Initialize on app load
useEffect(() => {
  AppRatingService.initialize();
}, []);

// Load saved language preference on mount
useEffect(() => {
  const savedLanguage = localStorage.getItem('datemaker_language') || 'en';
  setLanguage(savedLanguage);
}, []);
// 🔝 Scroll to top when results are shown - useLayoutEffect fires BEFORE paint
useLayoutEffect(() => {
  if (showResults && itinerary) {
    // Target the actual scrolling container (#root), not window
    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }
    
    
    // Also try standard methods as fallbacks
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also scroll the ref into view
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }
}, [showResults, itinerary]);

// 🔗 Handle deep links from Stripe checkout
useEffect(() => {
  let listenerHandle = null;
  let isMounted = true;

  const setupListener = async () => {
    try {
      listenerHandle = await App.addListener('appUrlOpen', async (event) => {
  if (!isMounted) return;
  
  console.log('🔗 Deep link received:', event.url);
  
  // Handle payment success deep link
  if (event.url.includes('payment-success') || event.url.includes('checkout-success')) {
    console.log('✅ Payment successful - updating subscription!');
    
    if (!isMounted) return;
    setShowSubscriptionModal(false);
    
    // Wait for webhook to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (user && isMounted) {
      try {
        // Force refresh subscription from Firebase
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && isMounted) {
          const data = userDoc.data();
          const newStatus = data.subscriptionStatus || 'free';
          
          // Don't overwrite admin premium status
          if (isAdmin(user?.email)) {
            console.log('👑 Admin detected - keeping premium access');
            setSubscriptionStatus('premium');
          } else {
            console.log('✅ New subscription status:', newStatus);
            setSubscriptionStatus(newStatus);
          }
          setUserData(data);
          
          if (newStatus === 'trial' || newStatus === 'premium') {
            // Show success alert
            setTimeout(() => {
              alert('🎉 Welcome to DateMaker Premium! Your 7-day free trial has started.');
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      }
    }
  } else if (event.url.includes('checkout-cancelled')) {
    console.log('❌ Checkout was cancelled');
    if (isMounted) setShowSubscriptionModal(false);
  }
});
    } catch (error) {
      console.log('App listener setup (expected on web):', error.message);
    }
  };

  setupListener();

  return () => {
    isMounted = false;
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
}, [user]);
  
  // 🔔 Unified notification system
  const [notificationCounts, setNotificationCounts] = useState({
    messages: 0,
    requests: 0,
    total: 0
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);


// Load daily challenges and check for mystery bonus
useEffect(() => {
  // Get today's challenges
  const challenges = getTodaysChallenges(3);
  setTodaysChallenges(challenges);
  
  // Check for mystery bonus day
  const bonus = checkMysteryBonus();
  if (bonus) {
    setMysteryBonusActive(bonus);
    console.log('🎰 Mystery Bonus Active:', bonus.title);
  }
  
  // Get streak bonus
  if (gameStats?.currentStreak) {
    const bonus = getStreakBonus(gameStats.currentStreak);
    setStreakBonus(bonus);
  }
}, [gameStats?.currentStreak]);

// Initialize engagement notifications
useEffect(() => {
  const initNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      const isPremium = subscriptionStatus !== 'free';
      await initializeEngagementNotifications(user.uid, isPremium);
      
      // Check streak status and warn if at risk
      const streakStatus = await checkStreakStatus(user.uid);
      if (streakStatus?.atRisk) {
        const today = new Date().toDateString();
        const lastWarning = localStorage.getItem('lastStreakWarning');
        
        if (lastWarning !== today) {
          await sendStreakRiskNotification(streakStatus.streak, streakStatus.daysUntilLoss);
          localStorage.setItem('lastStreakWarning', today);
        }
      }
      
      console.log('✅ Engagement notifications initialized');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };
  
  initNotifications();
}, [user?.uid, subscriptionStatus]);

// Check for new achievements when stats change
useEffect(() => {
  if (!gameStats || !user?.uid) return;
  
  const checkAchievements = async () => {
    const earnedIds = gameStats.achievements || [];
    const newAchievements = checkForNewAchievements(gameStats, earnedIds);
    
    if (newAchievements.length > 0) {
      const achievement = newAchievements[0];
      setNewAchievementUnlocked(achievement);
      
      // Send notification
      await sendAchievementNotification(achievement.title, achievement.xp);
      
      // Save to Firebase
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const newEarnedIds = [...earnedIds, achievement.id];
        const newXP = (gameStats.xp || 0) + achievement.xp;
        
        await setDoc(userDocRef, {
          gameStats: {
            ...gameStats,
            achievements: newEarnedIds,
            xp: newXP
          }
        }, { merge: true });
        
        setGameStats(prev => ({
          ...prev,
          achievements: newEarnedIds,
          xp: newXP
        }));
        
        console.log('🏆 Achievement unlocked:', achievement.title);
      } catch (error) {
        console.error('Error saving achievement:', error);
      }
    }
  };
  
  checkAchievements();
}, [gameStats?.datesCompleted, gameStats?.challengesCompleted, gameStats?.currentStreak, gameStats?.placesVisited]);

// 📝 Rotate loading messages during generation
useEffect(() => {
  let interval;
  if (searchLoading) {
    const messages = HumanCopy.getLoadingMessages('dates');
    setLoadingMessage(messages[0]);
    
    interval = setInterval(() => {
      setLoadingMessage(prev => {
        const msgs = HumanCopy.getLoadingMessages('dates');
        const currentIdx = msgs.indexOf(prev);
        const nextIdx = (currentIdx + 1) % msgs.length;
        return msgs[nextIdx];
      });
    }, 2000); // Change every 2 seconds
  } else {
    setLoadingMessage('');
  }
  
  return () => {
    if (interval) clearInterval(interval);
  };
}, [searchLoading]);

// Auto-open subscription modal if coming from iOS app
useEffect(() => {
  const shouldOpenSubscribe = sessionStorage.getItem('openSubscribeAfterLogin');
  if (shouldOpenSubscribe === 'true' && user && subscriptionStatus === 'free') {
    sessionStorage.removeItem('openSubscribeAfterLogin');
    if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  }
}, [user, subscriptionStatus]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.68.103:3001'
  
  const getAuthToken = useCallback(async () => {
  if (!user) return null;
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}, [user]);
  
  const hobbies = [
    'Music', 'Art', 'Food', 'Sports', 'Reading', 'Travel', 
    'Photography', 'Gaming', 'Fitness', 'Cooking', 'Dancing', 
    'Nature', 'Technology', 'Fashion', 'Wine & Cocktails'
  ];
  
  const activities = [
    'Live Music', 'Museums', 'Theater', 'Comedy Shows', 'Art Galleries',
    'Wine Tasting', 'Cooking Classes', 'Dance', 'Outdoor Adventures',
    'Movie Theater', 'Concerts', 'Sports Events', 'Karaoke', 'Escape Rooms'
  ];
  
// Handle XP with streak and mystery bonuses
const handleBonusXP = (baseXP, reason) => {
  if (!user || !gameStats) return baseXP;
  
  let finalXP = baseXP;
  
  // Apply streak bonus
  if (streakBonus.multiplier > 1) {
    finalXP = Math.round(finalXP * streakBonus.multiplier);
  }
  
  // Apply mystery bonus if active
  if (mysteryBonusActive?.multiplier) {
    finalXP = Math.round(finalXP * mysteryBonusActive.multiplier);
  }
  
  // Award the points using your existing function
  if (typeof awardPoints === 'function') {
    awardPoints(finalXP, reason);
  }
  
  console.log(`⚡ XP: ${baseXP} → ${finalXP} (streak: ${streakBonus.multiplier}x${mysteryBonusActive ? `, mystery: ${mysteryBonusActive.multiplier}x` : ''})`);
  
  return finalXP;
};

  const calculateEndTime = (start, dur) => {
  // Handle both string and number durations
  let hours;
  if (typeof dur === 'string') {
    // If it's something like "4-6", take the max value
    if (dur.includes('-')) {
      const parts = dur.split('-');
      hours = parseInt(parts[1]);
    } else {
      hours = parseInt(dur);
    }
  } else {
    hours = dur;
  }
  
  return addHours(start, hours);
};
  
  const categorizePlace = (place, keyword) => {
  const name = place.name?.toLowerCase() || '';
  const types = place.types || [];
  const searchKeyword = keyword.toLowerCase();
  
  console.log(`🔍 Categorizing: ${place.name}`, { types, name, keyword: searchKeyword });
  
  // PRIORITY 1: EVENTS (always highest priority)
  if (place.isEvent) {
    console.log('  ✅ EVENT');
    return { category: 'event', subcategory: 'event', priority: 10 };
  }
  
 // PRIORITY 2: NIGHTLIFE (Nightclubs, Dance Venues) → 'nightlife' category
if (types.includes('night_club') || 
    name.includes('nightclub') || name.includes('night club') || 
    name.includes('dance club')) {
  console.log('  ✅ NIGHTCLUB → nightlife');
  return { category: 'nightlife', subcategory: 'nightclub', priority: 10 };
}
  
  // PRIORITY 3: BARS & DRINKS → 'drinks' category
if (types.includes('bar') || 
    name.includes(' bar ') || name.endsWith(' bar') || name.startsWith('bar ') ||
    name.includes('pub') || name.includes('tavern') ||
    name.includes('brewery') || name.includes('cocktail') || name.includes('lounge')) {
  
  // EXCLUDE places that are food-first (lunch bars, sandwich bars, etc.)
  const isFoodPlace = name.includes('lunch') || 
                      name.includes('sandwich') || 
                      name.includes('deli') ||
                      name.includes('cafe') ||
                      types.includes('meal_takeaway') ||
                      types.includes('meal_delivery');
  
  if (!isFoodPlace) {
    console.log('  ✅ BAR → drinks');
    return { category: 'drinks', subcategory: 'bar', priority: 9 };
  }
}
  
  // PRIORITY 4: WINE & WINERIES → 'drinks' category
  if (name.includes('wine') || name.includes('winery') || name.includes('vineyard')) {
    console.log('  ✅ WINERY → drinks');
    return { category: 'drinks', subcategory: 'wine', priority: 9 };
  }
  
  // PRIORITY 5: COFFEE & CAFES → 'cafe' category (KEEP AS IS)
  if (types.includes('cafe') || types.includes('coffee_shop') || 
      name.includes('cafe') || name.includes('café') || name.includes('coffee')) {
    console.log('  ✅ CAFE');
    return { category: 'cafe', subcategory: 'cafe', priority: 9 };
  }
  
  // PRIORITY 6: RESTAURANTS & DINING → 'food' category
  if (types.includes('restaurant') || types.includes('meal_delivery') || types.includes('meal_takeaway') ||
      name.includes('restaurant') || name.includes('dining') || name.includes('bistro') || 
      name.includes('eatery') || name.includes('grill')) {
    console.log('  ✅ RESTAURANT → food');
    return { category: 'food', subcategory: 'restaurant', priority: 9 };
  }
  
  // PRIORITY 7: THEATERS (Performing Arts - NOT movie theaters) → 'entertainment'
  if ((types.includes('theater') || name.includes('theater') || name.includes('theatre')) &&
      !types.includes('movie_theater') && !name.includes('cinema') && !name.includes('movie')) {
    console.log('  ✅ THEATER → entertainment');
    return { category: 'entertainment', subcategory: 'theater', priority: 9 };
  }
  
  // PRIORITY 8: MOVIE THEATERS (Cinemas) → 'entertainment'
  if (types.includes('movie_theater') || 
      name.includes('cinema') || name.includes('movie theater') || name.includes('movie theatre')) {
    console.log('  ✅ CINEMA → entertainment');
    return { category: 'entertainment', subcategory: 'cinema', priority: 9 };
  }
  
  // PRIORITY 9: MUSEUMS & ART GALLERIES → 'entertainment'
  if (types.includes('museum') || name.includes('museum')) {
    console.log('  ✅ MUSEUM → entertainment');
    return { category: 'entertainment', subcategory: 'museum', priority: 9 };
  }
  
  if (types.includes('art_gallery') || name.includes('art gallery') || name.includes('gallery')) {
    console.log('  ✅ ART GALLERY → entertainment');
    return { category: 'entertainment', subcategory: 'gallery', priority: 9 };
  }
  
  // PRIORITY 10: MUSIC VENUES → 'entertainment'
  if (name.includes('music') || name.includes('concert') || name.includes('jazz') || 
      name.includes('live music')) {
    console.log('  ✅ MUSIC VENUE → entertainment');
    return { category: 'entertainment', subcategory: 'music', priority: 9 };
  }
  
  // PRIORITY 11: COMEDY → 'entertainment'
  if (name.includes('comedy') || name.includes('laugh')) {
    console.log('  ✅ COMEDY → entertainment');
    return { category: 'entertainment', subcategory: 'comedy', priority: 9 };
  }
  
  // PRIORITY 12: PARKS & OUTDOOR → 'outdoor' (KEEP AS IS)
  if (types.includes('park') || types.includes('natural_feature') || 
      name.includes('park') || name.includes('garden') || name.includes('botanical') ||
      name.includes('trail') || name.includes('reserve')) {
    console.log('  ✅ OUTDOOR');
    return { category: 'outdoor', subcategory: 'outdoor', priority: 9 };
  }
  
  // PRIORITY 13: SPORTS VENUES → 'entertainment'
  if (types.includes('stadium') || name.includes('stadium') || name.includes('arena')) {
    console.log('  ✅ SPORTS VENUE → entertainment');
    return { category: 'entertainment', subcategory: 'sports', priority: 9 };
  }
  
  // PRIORITY 14: ACTIVITIES (Karaoke, Escape Rooms, Bowling, Arcade) → 'activity'
  if (name.includes('karaoke')) {
    console.log('  ✅ KARAOKE → activity');
    return { category: 'activity', subcategory: 'karaoke', priority: 9 };
  }
  
  if (name.includes('escape') || name.includes('puzzle room')) {
    console.log('  ✅ ESCAPE ROOM → activity');
    return { category: 'activity', subcategory: 'escape', priority: 9 };
  }
  
  if (types.includes('bowling_alley') || name.includes('bowling')) {
    console.log('  ✅ BOWLING → activity');
    return { category: 'activity', subcategory: 'bowling', priority: 9 };
  }
  
  if (name.includes('arcade') || name.includes('game center')) {
    console.log('  ✅ ARCADE → activity');
    return { category: 'activity', subcategory: 'arcade', priority: 9 };
  }
  
// Go karts - VERY specific matching to avoid false positives
if ((name.includes('kart') && !name.includes('train')) || 
    name.includes('go-kart') || 
    name.includes('gokart') || 
    name.includes('go kart') ||
    name.includes('battlekart') ||
    name.includes('karting') ||
    (name.includes('racing') && (types.includes('amusement_park') || name.includes('kart')))) {
  
  // EXCLUDE anything that's clearly not go karts
  const isFalsePositive = name.includes('print') || 
                          name.includes('train') || 
                          name.includes('fitness') ||
                          name.includes('gym') ||
                          name.includes('shop') || 
                          name.includes('store') ||
                          name.includes('mart') ||
                          name.includes('deli') ||
                          types.includes('clothing_store') ||
                          types.includes('store') ||
                          types.includes('gym');
  
  if (!isFalsePositive) {
    console.log('  ✅ GO KARTS → activity');
    return { category: 'activity', subcategory: 'gokart', priority: 9 };
  }
}

  // PRIORITY 15: FITNESS & WELLNESS → 'activity'
  if (types.includes('gym') || name.includes('gym') || name.includes('fitness')) {
    console.log('  ✅ FITNESS → activity');
    return { category: 'activity', subcategory: 'fitness', priority: 8 };
  }
  
  if (name.includes('yoga') || name.includes('pilates')) {
    console.log('  ✅ YOGA → activity');
    return { category: 'activity', subcategory: 'yoga', priority: 8 };
  }
  
  // PRIORITY 16: SHOPPING → 'activity'
  if (types.includes('shopping_mall') || types.includes('clothing_store') || 
      name.includes('mall') || name.includes('boutique')) {
    console.log('  ✅ SHOPPING → activity');
    return { category: 'activity', subcategory: 'shopping', priority: 7 };
  }
  
  // PRIORITY 17: AQUARIUM & ZOO → 'entertainment'
  if (name.includes('aquarium')) {
    console.log('  ✅ AQUARIUM → entertainment');
    return { category: 'entertainment', subcategory: 'aquarium', priority: 9 };
  }
  
  if (name.includes('zoo') || name.includes('safari')) {
    console.log('  ✅ ZOO → entertainment');
    return { category: 'entertainment', subcategory: 'zoo', priority: 9 };
  }
  
  // PRIORITY 18: COOKING & CLASSES → 'activity'
  if (name.includes('cooking class') || name.includes('culinary')) {
    console.log('  ✅ COOKING CLASS → activity');
    return { category: 'activity', subcategory: 'cooking', priority: 9 };
  }
  
  // DEFAULT: Use search keyword context as last resort
  console.log('  ⚠️ GENERAL (using search context)');
  return { category: 'general', subcategory: 'other', priority: 5 };
};
  
  const addHours = (time, hours) => {
  // Parse the time string
  const parts = time.split(' ');
  if (parts.length !== 2) return time;
  
  const [timeStr, period] = parts;
  const timeParts = timeStr.split(':');
  if (timeParts.length !== 2) return time;
  
  let hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]) || 0;
  
  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  // Add the hours (handle decimals too)
  hour += Math.floor(hours);
  const additionalMinutes = Math.round((hours % 1) * 60);
  let totalMinutes = minute + additionalMinutes;
  
  // Handle minute overflow
  if (totalMinutes >= 60) {
    hour += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
  }
  
  // Handle day overflow
  if (hour >= 24) {
    hour = hour % 24;
  }
  
  // Convert back to 12-hour format
  let newPeriod = 'AM';
  let displayHour = hour;
  
  if (displayHour >= 12) {
    newPeriod = 'PM';
    if (displayHour > 12) {
      displayHour = displayHour - 12;
    }
  }
  
  if (displayHour === 0) {
    displayHour = 12;
  }
  
  // Format minutes
  const minuteStr = totalMinutes > 0 ? `:${totalMinutes.toString().padStart(2, '0')}` : ':00';
  
  return `${displayHour}${minuteStr} ${newPeriod}`;
};
const createItinerary = (allPlaces, userKeywords, isRefresh = false) => {
  console.log('\n🎯 ============ CREATING ITINERARY ============');
  console.log(`📥 Input: ${allPlaces.length} places`);
  console.log(`🔑 Keywords: "${userKeywords}"`);
  
  // Step 1: Categorize all places
  const categorizedPlaces = allPlaces
    .map(place => {
      const category = categorizePlace(place, userKeywords);
      return { ...place, ...category };
    })
    .filter(place => place.category !== 'general' || allPlaces.length < 10);
  
  console.log(`✅ Categorized: ${categorizedPlaces.length} valid places`);
  
  // Step 2: Detect what user wants from keywords
  const keywords = userKeywords.toLowerCase();
  const wantedCategories = [];
  
  const categoryMap = {
    beach: ['beach'],
    gym: ['gym', 'fitness', 'workout'],
    park: ['park'],
    outdoor: ['nature', 'outdoor', 'hiking', 'trail', 'adventure', 'garden', 'botanical', 'scenic', 'walk'],
    nightlife: ['nightclub', 'nightclubs', 'club', 'clubs', 'dancing'],
    drinks: ['wine', 'cocktail', 'cocktails', 'bar', 'bars', 'drink', 'drinks', 'brewery', 'pub', 'lounge'],
    food: ['food', 'dinner', 'lunch', 'restaurant', 'dining', 'brunch', 'breakfast', 'eat', 'cuisine', 'bistro'],
    cafe: ['coffee', 'cafe', 'café', 'espresso', 'coffeehouse'],
    entertainment: ['music', 'movie', 'theater', 'theatre', 'comedy', 'museum', 'art', 'entertainment', 'concert', 'show', 'performance', 'cinema', 'gallery'],
    activity: ['karaoke', 'escape', 'games', 'arcade', 'bowling', 'climbing', 'yoga', 'sports', 'kart', 'karts', 'go-kart', 'go-karts', 'gokart', 'gokarts', 'karting', 'racing']
};
  
  
  // Detect categories IN THE ORDER user typed them
  const userWords = userKeywords.toLowerCase().split(/\s+/);
  
  userWords.forEach(word => {
    Object.entries(categoryMap).forEach(([category, terms]) => {
      if (terms.includes(word) && !wantedCategories.includes(category)) {
        wantedCategories.push(category);
        console.log(`  ✅ Detected: ${word} → ${category}`);
      }
    });
  });
  
  if (wantedCategories.length === 0) {
    console.log('⚠️ No categories detected - using defaults');
    wantedCategories.push('food', 'drinks');
  }
  
  console.log(`\n🎯 User wants (in order): ${wantedCategories.join(' → ')}`);
  
  // Step 3: Map categories to place categories
  const categoryMapping = {
    beach: 'outdoor',
    gym: 'activity',
    park: 'outdoor',
    outdoor: 'outdoor',
    nightlife: 'nightlife',
    drinks: 'drinks',
    food: 'food',
    cafe: 'cafe',
    entertainment: 'entertainment',
    activity: 'activity'
  };
  
  // Organize by category
  const byCategory = {
    food: categorizedPlaces.filter(p => p.category === 'food'),
    drinks: categorizedPlaces.filter(p => p.category === 'drinks'),
    nightlife: categorizedPlaces.filter(p => p.category === 'nightlife'),
    cafe: categorizedPlaces.filter(p => p.category === 'cafe'),
    outdoor: categorizedPlaces.filter(p => p.category === 'outdoor'),
    entertainment: categorizedPlaces.filter(p => p.category === 'entertainment'),
    activity: categorizedPlaces.filter(p => p.category === 'activity')
  };
  
  console.log('\n📊 Available places by category:');
  Object.entries(byCategory).forEach(([cat, places]) => {
    if (places.length > 0) {
      console.log(`  ${cat}: ${places.length} places`);
    }
  });
  
  // Step 4: Build flow EXACTLY as user requested
  const dateFlow = [];
  
  wantedCategories.forEach(wantedCat => {
    const mappedCat = categoryMapping[wantedCat] || wantedCat;
    if (byCategory[mappedCat] && byCategory[mappedCat].length > 0) {
      dateFlow.push(mappedCat);
    }
  });

  console.log(`\n📋 Final flow: ${dateFlow.join(' → ')}`);
  
  // Calculate timing
  let totalHours;
  if (typeof duration === 'string') {
    if (duration.includes('-')) {
      const parts = duration.split('-');
      totalHours = parseInt(parts[1]);
    } else {
      totalHours = parseInt(duration);
    }
  } else {
    totalHours = duration;
  }
  
  const numberOfStops = dateFlow.length;
  const actualTimePerStop = totalHours / numberOfStops;
  
  const [timeStr, period] = startTime.split(' ');
  let hour = parseInt(timeStr.split(':')[0]);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  const isEvening = hour >= 17;
  const isAfternoon = hour >= 12 && hour < 17;
  const isMorning = hour < 12;
  
  console.log(`\n⏰ Time: ${startTime} (${isEvening ? 'Evening' : isAfternoon ? 'Afternoon' : 'Morning'})`);
  console.log(`📊 Creating ${numberOfStops} stops over ${totalHours} hours`);
  
  // Step 5: Build itinerary
  const itineraryStops = [];
  const used = new Set();
  let currentTime = startTime;
  
const pickBestFrom = (category, userKeyword) => {
  let available = byCategory[category].filter(p => !used.has(p.place_id));
  
  if (available.length === 0) return null;
  
  // Check the ORIGINAL user keywords, not just the category
  const originalKeywords = userKeywords.toLowerCase();
  
  // Special handling for specific requests
  if (userKeyword === 'beach') {
    available = available.filter(p => 
      p.name.toLowerCase().includes('beach') || 
      p.vicinity?.toLowerCase().includes('beach')
    );
  } else if (userKeyword === 'gym') {
    available = available.filter(p => 
      p.name.toLowerCase().includes('gym') || 
      p.name.toLowerCase().includes('fitness') ||
      p.types?.includes('gym')
    );
  } else if (userKeyword === 'park') {
    available = available.filter(p => 
      p.name.toLowerCase().includes('park') ||
      p.types?.includes('park')
    );
  } else if (category === 'activity' && 
             (originalKeywords.includes('kart') || 
              originalKeywords.includes('go kart') || 
              originalKeywords.includes('gokart'))) {
    // User specifically wants GO KARTS
    console.log('🏎️ USER WANTS GO KARTS - Filtering for actual go kart venues');
    
    available = available.filter(p => {
      const name = p.name.toLowerCase();
      const isGoKart = (name.includes('kart') || 
                       name.includes('battlekart') || 
                       name.includes('racing')) &&
                      !name.includes('train') &&
                      !name.includes('print') &&
                      !name.includes('fitness') &&
                      !name.includes('gym');
      
      console.log(`  Checking ${p.name}: isGoKart=${isGoKart}`);
      return isGoKart;
    });
    
    console.log(`🏎️ Found ${available.length} go kart venues`);
  }
  
  if (available.length === 0) {
    // Fallback to any place in category
    available = byCategory[category].filter(p => !used.has(p.place_id));
  }
  
  if (available.length === 0) return null;
  
  // 🔥 NEW LOGIC - More variety based on refresh
  if (isRefresh) {
    // REFRESH: Accept 3.5+ stars for maximum variety
    const decentVenues = available.filter(p => (p.rating || 0) >= 3.5);
    const venuePool = decentVenues.length > 0 ? decentVenues : available;
    
    // Pick randomly from ALL decent venues
    const randomIndex = Math.floor(Math.random() * venuePool.length);
    console.log(`🔄 REFRESH: Picked random venue from ${venuePool.length} options (3.5+ stars)`);
    return venuePool[randomIndex];
    
  } else {
    // FIRST TIME: Prefer 4.0+ stars but accept lower if limited options
    const highRated = available.filter(p => (p.rating || 0) >= 4.0);
    
    if (highRated.length >= 5) {
      // Plenty of good options - pick randomly from top 5
      highRated.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      const topFive = highRated.slice(0, 5);
      const randomIndex = Math.floor(Math.random() * topFive.length);
      console.log(`✨ FIRST TIME: Picked from top 5 venues (4.0+ stars)`);
      return topFive[randomIndex];
      
    } else if (highRated.length > 0) {
      // Limited 4.0+ options - pick randomly from what we have
      const randomIndex = Math.floor(Math.random() * highRated.length);
      console.log(`✨ FIRST TIME: Limited options, picked from ${highRated.length} venues (4.0+ stars)`);
      return highRated[randomIndex];
      
    } else {
      // No 4.0+ venues - accept any rating
      const randomIndex = Math.floor(Math.random() * available.length);
      console.log(`⚠️ FIRST TIME: No high-rated venues, picked from ${available.length} available`);
      return available[randomIndex];
    }
  }
};
  
  for (let i = 0; i < dateFlow.length; i++) {
    const category = dateFlow[i];
    const userKeyword = wantedCategories[i];
    const place = pickBestFrom(category, userKeyword);
    
    if (!place) {
      console.warn(`⚠️ No available places in ${category}`);
      continue;
    }
    
    used.add(place.place_id);
    
    const { title, icon, description } = generateStopTitle(place, isEvening, isAfternoon, isMorning);
    
    const stopDuration = actualTimePerStop;
    const hours = Math.floor(stopDuration);
    const minutes = Math.round((stopDuration % 1) * 60);
    const durationText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours !== 1 ? 's' : ''}`;
    
    itineraryStops.push({
      stop: itineraryStops.length + 1,
      time: currentTime,
      title: title,
      description: description,
      place: place,
      icon: icon,
      duration: durationText,
      challenges: getChallengesForStop(place.category, 3),
      challengesCompleted: false
    });
    
    console.log(`✅ Stop ${itineraryStops.length}: ${title} - ${place.name} (${category})`);
    
    currentTime = addHours(currentTime, actualTimePerStop);
  }
  
  console.log(`🎉 Itinerary complete: ${itineraryStops.length} stops\n`);
  
  // Get alternatives
  const usedIds = Array.from(used);
  const alternatives = categorizedPlaces
    .filter(p => !usedIds.includes(p.place_id))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);
  
  const endTime = calculateEndTime(startTime, totalHours);
  
  return {
    stops: itineraryStops,
    alternatives: alternatives,
    totalDuration: `${totalHours} hours`,
    startTime: startTime,
    endTime: endTime
  };
};


const openScrapbookForDate = (itinerary) => {
  // 🔒 SUBSCRIPTION GATE
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  
  console.log('Opening scrapbook for itinerary:', itinerary);
  setDateToSave(itinerary);
  setScrapbookMode('create');
  setShowScrapbook(true);
};

const openScrapbookMemories = () => {
  // 🔒 SUBSCRIPTION GATE
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  console.log('Opening scrapbook memories');
  setScrapbookMode('view');
  setShowScrapbook(true);
};

const closeScrapbook = () => {
  const wasCreatingMemory = scrapbookMode === 'create' && dateToSave;
  
  setShowScrapbook(false);
  setDateToSave(null);
  setSelectedMemory(null);
  
  // If we just saved a memory from completing a date, open share modal
  if (wasCreatingMemory && itinerary) {
    console.log('📤 Opening share modal after saving memory');
    
    const completedDateData = {
      name: `Date Night - ${itinerary.stops.length} stops`,
      vicinity: location,
      place_id: 'completed_itinerary',
      itinerary: itinerary,
      stops: itinerary.stops,
      completedAt: new Date().toISOString()
    };
    
    setTimeout(() => {
      setDateToShare(completedDateData);
      setShowShareModal(true);
    }, 300);
  }
};

// 🎁 SURPRISE DATE FUNCTIONS
const createSurpriseFromItinerary = (itinerary) => {
  // 🔒 SUBSCRIPTION GATE
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  
  console.log('Creating surprise date from:', itinerary);
  setSurpriseMode('create');
  setShowSurpriseDate(true);
  setActiveSurprise({ itinerary });
};

const openSurpriseDateTracker = () => {
  // 🔒 SUBSCRIPTION GATE  
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  
  console.log('Opening surprise date tracker');
  setSurpriseMode('track');
  setShowSurpriseDate(true);
};

const closeSurpriseDate = () => {
  setShowSurpriseDate(false);
  setActiveSurprise(null);
};

// 🔥 STREAK FUNCTIONS
const openStreaksGoals = () => {
  // 🔒 SUBSCRIPTION GATE
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  
  console.log('Opening streaks & goals');
  setShowStreaks(true);
  loadUserStreakData();
};

const closeStreaks = () => {
  setShowStreaks(false);
};

const loadUserStreakData = async () => {
  if (!user) return;
  
  try {
    const streakDoc = await getDoc(doc(db, 'dateStreaks', user.uid));
    if (streakDoc.exists()) {
      setUserStreakData(streakDoc.data());
    }
  } catch (error) {
    console.error('Error loading streak data:', error);
  }
};

const markDateCompleted = async (itinerary) => {
  if (!user) return;
  
  try {
    const streakRef = doc(db, 'dateStreaks', user.uid);
    const streakDoc = await getDoc(streakRef);
    
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    
    if (streakDoc.exists()) {
      const data = streakDoc.data();
      const lastWeek = data.lastDateWeek;
      
      let newStreak = data.currentStreak || 0;
      
      if (lastWeek && currentWeek === lastWeek + 1) {
        newStreak += 1;
      } else if (currentWeek !== lastWeek) {
        newStreak = 1;
      }
      
      await updateDoc(streakRef, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, data.longestStreak || 0),
        lastDateWeek: currentWeek,
        totalDates: (data.totalDates || 0) + 1,
        lastCompletedDate: now
      });
    } else {
      await setDoc(streakRef, {
        currentStreak: 1,
        longestStreak: 1,
        lastDateWeek: currentWeek,
        totalDates: 1,
        lastCompletedDate: now,
        badges: ['first_date'],
        goals: [],
        weeklyChallenges: {}
      });
    }
    
    openScrapbookForDate(itinerary);
    trackAction(ACTION_TYPES.COMPLETE_DATE);
    
  } catch (error) {
    console.error('Error marking date completed:', error);
  }
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

  // Save language preference when changed
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('datemaker_language', newLang);
  };
  
  useEffect(() => {
  if (!auth || !db) {
    setInitError('Firebase configuration error.');
    setLoading(false);
    return;
  }
  
  
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    try {
      setUser(currentUser);
      
      if (currentUser) {
        console.log('🔐 Auth state changed:', {
          email: currentUser.email,
          verified: currentUser.emailVerified,
          currentScreen: authScreen
        });
        
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
           if (userDoc.exists()) {
  const data = userDoc.data();
  setUserData(data);
  // Check if admin - admins get premium for free
  if (isAdmin(currentUser.email)) {
    setSubscriptionStatus('premium');
    console.log('👑 Admin detected - granting premium access');
  } else {
    setSubscriptionStatus(data.subscriptionStatus || 'free');
  }
  setSavedDates(data.savedDates || []);
  setProfilePhoto(data.profilePhoto || '');
  setLastViewedSavedCount(data.lastViewedSavedCount || 0);
}else {
            setSubscriptionStatus('free');
            setSavedDates([]);
          }
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          setSubscriptionStatus('free');
          setSavedDates([]);
        }
        
        // 🎯 KEY FIX: Don't auto-redirect if we're showing success/verification screens
        // Only go to main app if:
        // 1. Email is verified, AND
        // 2. We're not currently showing a message screen
        if (currentUser.emailVerified && 
            authScreen !== 'success' && 
            authScreen !== 'verification') {
          console.log('✅ Email verified - showing main app');
          setAuthScreen('main');
        } else if (!currentUser.emailVerified && authScreen === 'main') {
          // If somehow user gets to main app without verification, kick them back
          console.log('⚠️ Email not verified - showing verification screen');
          setAuthScreen('verification');
        }
      } else {
        // No user - show login screen
        if (authScreen === 'main') {
          setAuthScreen('login');
        }
      }
    } catch (err) {
      HapticService.notifyError();
      console.error('Auth error:', err);
      setInitError(err.message);
    } finally {
      setLoading(false);
    }
  });
  
  return () => unsubscribe();
}, [authScreen]);
  
 
// Expose user data for IAP
useEffect(() => {
  if (user?.uid) {
    window.currentUserId = user.uid;
    window.reloadUserData = fetchUserData;
  }
}, [user]);



// Check Apple subscription status on app load (iOS only)
useEffect(() => {
  const checkSubscription = async () => {
    try {
      // Only run on iOS
      if (Capacitor.getPlatform() !== 'ios') {
        console.log('⚠️ Not iOS, skipping subscription check');
        return;
      }
      
      // Only run if user is logged in
      if (!user?.uid) {
        console.log('⚠️ No user, skipping subscription check');
        return;
      }
      
      // Wait for Cordova to be ready
      await new Promise((resolve) => {
        if (window.cordova) {
          console.log('✅ Cordova ready');
          resolve();
        } else {
          console.log('⏳ Waiting for Cordova...');
          document.addEventListener('deviceready', () => {
            console.log('✅ Cordova ready (via event)');
            resolve();
          });
          
          // Timeout after 5 seconds
          setTimeout(() => {
            console.log('⚠️ Cordova timeout, proceeding anyway');
            resolve();
          }, 5000);
        }
      });
      
      // Small delay to ensure everything is loaded
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔍 Checking Apple subscription status...');
      
      // Check if IAPManager is available
      if (!IAPManager) {
        console.error('❌ IAPManager not available');
        return;
      }
      
      // Initialize IAP
      const initialized = await IAPManager.initialize();
      
      if (!initialized) {
        console.error('❌ IAP initialization failed');
        return;
      }
      
      console.log('✅ IAP initialized');
      
      // Sync subscription status with backend
      await IAPManager.syncSubscriptionStatus();
      
      console.log('✅ Subscription check complete');
      
    } catch (error) {
      console.error('❌ Error checking subscription:', error);
      // Don't crash the app - just log the error
    }
  };
  
  // Only run if user exists
  if (user) {
    checkSubscription();
  }
}, [user]);

  // 🔔 UNIFIED NOTIFICATION TRACKING SYSTEM
  useEffect(() => {
    if (!user) return;
 console.log('🔔 Starting notification tracker for:', user.email);
    const unsubscribers = [];

    // Track unread messages from conversations
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

   const unsubMessages = onSnapshot(
  conversationsQuery,
  (snapshot) => {
    let totalUnread = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totalUnread += (data.unreadCount?.[user.uid] || 0);
    });
    
    setNotificationCounts(prev => ({
      ...prev,
      messages: totalUnread,
      total: prev.requests + totalUnread
    }));
    
    console.log('💬 Unread messages:', totalUnread);
  },
  (error) => {
    console.error('Error loading message notifications:', error);
    // Gracefully handle error - notifications just won't update
  }
);
    unsubscribers.push(unsubMessages);

    // Track unseen friend requests
    const requestsQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubRequests = onSnapshot(
  requestsQuery,
  (snapshot) => {
    const unseenCount = snapshot.docs.filter(doc => !doc.data().seen).length;
    
    setNotificationCounts(prev => ({
      ...prev,
      requests: unseenCount,
      total: unseenCount + prev.messages
    }));
    
    console.log('📬 Friend requests:', unseenCount);
  },
  (error) => {
    console.error('Error loading friend request notifications:', error);
    // Gracefully handle error - notifications just won't update
  }
);
    unsubscribers.push(unsubRequests);

// ✅ NEW: Track unrevealed surprises for current user
    const surprisesQuery = query(
      collection(db, 'surpriseDates'),
      where('partnerEmail', '==', user.email?.toLowerCase()),
      where('revealed', '==', false)
    );

    const unsubSurprises = onSnapshot(
      surprisesQuery,
      (snapshot) => {
        const count = snapshot.size;
        setSurpriseCount(count);
        console.log('🎁 Unrevealed surprises:', count);
      },
      (error) => {
        console.error('Error loading surprise notifications:', error);
      }
    );
    unsubscribers.push(unsubSurprises);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user, subscriptionStatus]);
  
  useEffect(() => {
    if (user && db) {
      loadGameStats();
    }
  }, [user]);
  
  // Update photo token when user or itinerary changes
  useEffect(() => {
    const updatePhotoToken = async () => {
      if (user) {
        const token = await getAuthToken();
        setPhotoToken(token);
      }
    };
    
    updatePhotoToken();
  }, [user, getAuthToken, itinerary]);
  
  useEffect(() => {
    console.log('🔵 showShareModal changed to:', showShareModal);
    console.log('🔵 dateToShare is:', dateToShare);
  }, [showShareModal, dateToShare]);

  // 📸 AUTO-OPEN SCRAPBOOK when dateToSave is set (waits for level up modal to close)
useEffect(() => {
  if (dateToSave && scrapbookMode === 'create' && !showScrapbook && !showLevelUp) {
    console.log('📸 useEffect detected dateToSave, opening scrapbook');
    setShowScrapbook(true);
  }
}, [dateToSave, scrapbookMode, showScrapbook, showLevelUp]);

  const loadGameStats = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const stats = userData.gameStats || {
          xp: 0,
          datesCompleted: 0,
          challengesCompleted: 0,
          placesVisited: 0,
          photosShared: 0,
          currentStreak: 0,
          longestStreak: 0,
          achievements: [],
          stats: {
            foodVenues: 0,
            drinkVenues: 0,
            entertainment: 0,
            outdoor: 0,
            activities: 0
          }
        };
        
        setGameStats(stats);
      }
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
  };

  
// Set iOS status bar color
useEffect(() => {
  const setupStatusBar = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setBackgroundColor({ color: '#7c3aed' });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (error) {
        console.log('StatusBar setup:', error);
      }
    }
  };
  setupStatusBar();
}, []);

// 🔧 Re-check subscription when app returns from background (Stripe fix)
useEffect(() => {
  let listenerHandle = null;
  let isMounted = true;

  const checkSubscriptionOnResume = async () => {
    // First sync with RevenueCat to catch expired subscriptions
    try {
      await IAPManager.syncSubscriptionStatus();
    } catch (err) {
      HapticService.notifyError();
      console.log("RevenueCat sync skipped:", err.message);
    }
    
    if (!user || !isMounted) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && isMounted) {
        const data = userDoc.data();
        const newStatus = data.subscriptionStatus || 'free';
        
        if (newStatus !== subscriptionStatus) {
          // Don't overwrite admin premium status
          if (isAdmin(user?.email)) {
            console.log('👑 Admin detected - keeping premium access');
            setSubscriptionStatus('premium');
          } else {
            console.log('✅ Subscription updated:', newStatus);
            setSubscriptionStatus(newStatus);
          }
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const setupListener = async () => {
    try {
      listenerHandle = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive && isMounted) {
          console.log('📱 App resumed - checking subscription...');
          checkSubscriptionOnResume();
        }
      });
    } catch (error) {
      console.log('AppStateChange listener setup (expected on web):', error.message);
    }
  };

  setupListener();

  return () => {
    isMounted = false;
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
}, [user, subscriptionStatus]);

  // handleClearNotifications kept for compatibility
  const handleClearNotifications = async () => {
    try {
      const friendRequestsRef = collection(db, 'friendRequests');
      const q = query(
        friendRequestsRef,
        where('toUserId', '==', user.uid),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(docSnap => {
        if (!docSnap.data().seen) {
          batch.update(docSnap.ref, { seen: true });
        }
      });
      
      await batch.commit();
      // Notification count will update automatically via listener
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  
// 🚀 GUEST MODE HANDLER - For App Store Compliance (Guideline 5.1.1)
const handleContinueAsGuest = () => {
  console.log('👤 Continuing as guest');
  setIsGuestMode(true);
  setAuthScreen('main');
  setSubscriptionStatus('free'); // Guests are always free tier
};

 const handleLogout = async () => {
  try {
    // Set user offline before logging out
    if (user?.uid) {
      await setDoc(doc(db, 'userStatus', user.uid), {
        online: false,
        lastSeen: serverTimestamp()
      }, { merge: true });
    }
    
    // 🆕 Clean up push notifications
    await PushNotificationService.cleanup();
    
    await signOut(auth);
    
    // Clear all UI states
    setShowResults(false);
    setShowSavedDates(false);
    setShowProfile(false);
    setShowSocial(false);
    setPlaces([]);
    setItinerary(null);
    setIsGuestMode(false);

    // Clear form data (Bug #6 fix)
    setLocation('');
    setSelectedActivities([]);
    setCustomActivities([]);
    setSelectedHobbies([]);
    setCustomActivityInput('');
    setIncludeEvents(false);
    setDateRange('anytime');
    setStartTime('7:00 PM');
    setDuration('4');
    
  } catch (err) {
    HapticService.notifyError();
    console.error('Logout error:', err);
  }
};
  
const handleOpenSaved = async () => {
  setShowSavedDates(true);
  // Clear notification by updating last viewed count
  if (savedDates.length !== lastViewedSavedCount) {
    setLastViewedSavedCount(savedDates.length);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { lastViewedSavedCount: savedDates.length }, { merge: true });
    } catch (error) {
      console.error('Error updating last viewed saved count:', error);
    }
  }
};

  const handleUploadPhoto = async (e) => {
  // iOS: Go directly to photo library (no camera option!)
  if (Capacitor.isNativePlatform()) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt  // ← PHOTOS ONLY - no camera!
      });
      
      if (!image?.webPath) return;
      
      setProfileError('Uploading...');
      
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      
      const storage = getStorage();
      const photoRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(photoRef, blob);
      const photoURL = await getDownloadURL(photoRef);
      
      setProfilePhoto(photoURL);
      await setDoc(doc(db, 'users', user.uid), { profilePhoto: photoURL }, { merge: true });
      setProfileError('');
      alert('✨ Profile photo updated!');
    } catch (err) {
      HapticService.notifyError();
      if (!err.message?.includes('cancel')) {
        console.error('Upload error:', err);
        setProfileError('Failed to upload photo');
      }
    }
    return;
  }
  
  // Web: Use file input
  const file = e?.target?.files?.[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    setProfileError('Please select an image file');
    return;
  }
  
  if (file.size > 5000000) {
    setProfileError('Photo must be under 5MB');
    return;
  }
  
  setProfileError('Uploading...');
  
  try {
    const storage = getStorage();
    const photoRef = ref(storage, `profilePhotos/${user.uid}`);
    
    await uploadBytes(photoRef, file);
    const photoURL = await getDownloadURL(photoRef);
    
    setProfilePhoto(photoURL);
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { profilePhoto: photoURL }, { merge: true });
    setProfileError('');
    alert('✨ Profile photo updated!');
  } catch (err) {
    HapticService.notifyError();
    console.error('Upload error:', err);
    setProfileError(`Failed to upload: ${err.message}`);
  }
};

const handleChangePassword = async () => {
    try {
      await updatePassword(user, newPassword);
      alert('✅ Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      HapticService.notifyError();
      console.error('Password change error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setProfileError('Please log out and log back in to change your password.');
      } else {
        setProfileError('Failed to change password. Try again.');
      }
    }
  };
  
  const handleDeleteAccount = async () => {
  const confirmed = window.confirm(
    '⚠️ DELETE ACCOUNT\n\n' +
    'This will permanently delete:\n' +
    '• Your profile and settings\n' +
    '• All saved dates\n' +
    '• Your subscription\n' +
    '• All your data\n\n' +
    'This action CANNOT be undone.\n\n' +
    'Are you sure you want to delete your account?'
  );
  
  if (!confirmed) return;
  
  const doubleConfirm = window.confirm(
    '🚨 FINAL WARNING\n\n' +
    'You are about to permanently delete your account.\n\n' +
    'Type "DELETE" in your mind and click OK to confirm.'
  );
  
  if (!doubleConfirm) return;
  
  try {
    setProfileError('Deleting account...');
    
    // Delete user data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { deleted: true, deletedAt: new Date().toISOString() }, { merge: true });
    
    // Delete related data
    try {
      const streakRef = doc(db, 'dateStreaks', user.uid);
      await setDoc(streakRef, { deleted: true }, { merge: true });
    } catch (e) {
      console.log('No streak data to delete');
    }
    
    try {
      const statusRef = doc(db, 'userStatus', user.uid);
      await setDoc(statusRef, { deleted: true }, { merge: true });
    } catch (e) {
      console.log('No status data to delete');
    }
    
    // Delete Firebase Auth account
    await deleteUser(user);
    
    alert('Your account has been deleted. We\'re sorry to see you go!');
    
    // Redirect to login
    setAuthScreen('login');
    
  } catch (err) {
    HapticService.notifyError();
    console.error('Delete account error:', err);
    if (err.code === 'auth/requires-recent-login') {
      setProfileError('For security, please log out and log back in before deleting your account.');
    } else {
      setProfileError('Failed to delete account: ' + err.message);
    }
  }
};

  const handleCompleteChallenge = async (stopIndex, challengeId) => {
    try {
      const newCompletedChallenges = [...completedChallenges, challengeId];
      setCompletedChallenges(newCompletedChallenges);
      
      const allChallenges = [
        ...CHALLENGES.food,
        ...CHALLENGES.drinks,
        ...CHALLENGES.entertainment,
        ...CHALLENGES.activity,
        ...CHALLENGES.outdoor,
        ...CHALLENGES.cafe,
        ...CHALLENGES.universal
      ];
      
      const challenge = allChallenges.find(c => c.id === challengeId);
      
      if (challenge) {
        await awardPoints(challenge.points, `Completed: ${challenge.text}`);
        
        setPointsNotificationData({
          points: challenge.points,
          message: challenge.text.substring(0, 30) + '...'
        });
        setShowPointsNotification(true);
        
        setTimeout(() => {
          setShowPointsNotification(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

 const awardPoints = async (points, reason) => {
  try {
    const oldXP = gameStats?.xp || 0;
    const newXP = oldXP + points;
    const oldLevel = calculateLevel(oldXP);
    const newLevel = calculateLevel(newXP);
    
    // Update stats (challenges are tracked separately)
    const updatedStats = {
      ...gameStats,
      xp: newXP,
      challengesCompleted: (gameStats?.challengesCompleted || 0) + 1  // ✅ Just increment by 1
    };
    

      
      setGameStats(updatedStats);
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { 
        gameStats: updatedStats 
      }, { merge: true });
      
      if (newLevel.level > oldLevel.level) {
        setLevelUpData({ oldLevel, newLevel });
        setShowLevelUp(true);
      }
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

 const handleCompleteDateItinerary = async () => {
  console.log('🎯 Complete Date Started');
  
  // 🔒 SUBSCRIPTION GATE
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  
  try {
    // Validate itinerary
    if (!itinerary || !itinerary.stops) {
      alert('No itinerary to complete!');
      return;
    }

    // Calculate stats
    const challengesCompleted = completedChallenges.length;
    const basePoints = POINT_VALUES.COMPLETE_DATE;
    const stopPoints = itinerary.stops.length * POINT_VALUES.COMPLETE_STOP;
    const challengePoints = challengesCompleted * POINT_VALUES.COMPLETE_CHALLENGE;
    const totalPoints = basePoints + stopPoints + challengePoints;
    
    // Check for level up
    const oldXP = gameStats?.xp || 0;
    const newXP = oldXP + totalPoints;
    const oldLevel = calculateLevel(oldXP);
    const newLevel = calculateLevel(newXP);
    const didLevelUp = newLevel.level > oldLevel.level;
    
    // Calculate streaks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    let newStreak = 1;
    const lastCompletedDate = gameStats?.lastCompletedDate;
    const currentStreak = gameStats?.currentStreak || 0;
    
    if (lastCompletedDate) {
      const lastDate = new Date(lastCompletedDate);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) newStreak = currentStreak;
      else if (daysDiff === 1) newStreak = currentStreak + 1;
      else newStreak = 1;
    }

    // Track venue types
    const venueStats = gameStats?.venueStats || {
      food: 0,
      drinks: 0,
      entertainment: 0,
      outdoor: 0,
      activity: 0
    };

    itinerary.stops.forEach(stop => {
      const category = stop.place.category;
      if (category === 'food') venueStats.food++;
      if (category === 'drinks') venueStats.drinks++;
      if (category === 'entertainment') venueStats.entertainment++;
      if (category === 'outdoor') venueStats.outdoor++;
      if (category === 'activity') venueStats.activity++;
    });

    // Update stats
    const updatedStats = {
      ...gameStats,
      xp: newXP,
      level: newLevel.level,
      datesCompleted: (gameStats?.datesCompleted || 0) + 1,
      placesVisited: (gameStats?.placesVisited || 0) + itinerary.stops.length,
      challengesCompleted: (gameStats?.challengesCompleted || 0) + challengesCompleted,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, gameStats?.longestStreak || 0),
      lastCompletedDate: todayStr,
      venueStats: venueStats
    };
    
    setGameStats(updatedStats);
    
    // Save to Firebase
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { 
      gameStats: updatedStats 
    }, { merge: true });

    // Update dateStreaks
    const streakRef = doc(db, 'dateStreaks', user.uid);
    const streakDoc = await getDoc(streakRef);

    if (streakDoc.exists()) {
      const streakData = streakDoc.data();
      const goals = streakData.goals || [];
      
      const updatedGoals = goals.map(goal => {
        if (goal.completed) return goal;
        const newProgress = goal.progress + 1;
        return {
          ...goal,
          progress: newProgress,
          completed: newProgress >= goal.target
        };
      });

      await updateDoc(streakRef, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, gameStats?.longestStreak || 0),
        totalDates: (streakData.totalDates || 0) + 1,
        lastDateWeek: todayStr,
        goals: updatedGoals
      });
    } else {
      await setDoc(streakRef, {
        currentStreak: 1,
        longestStreak: 1,
        totalDates: 1,
        lastDateWeek: todayStr,
        badges: [],
        goals: [],
        weeklyChallenges: {}
      });
    }

    // Clear challenges
    setCompletedChallenges([]);

    // 🔥 KEY CHANGE: Show level up OR scrapbook
    if (didLevelUp) {
      setLevelUpData({
        oldLevel: oldLevel,
        newLevel: newLevel,
        pointsEarned: totalPoints
      });
      setShowLevelUp(true);
      // Set dateToSave so scrapbook opens after level up closes
      setDateToSave({
        date: new Date().toISOString(),
        location: location,
        itinerary: itinerary
      });
      setScrapbookMode('create');
    } else {
      // No level up - open scrapbook immediately
      setDateToSave({
        date: new Date().toISOString(),
        location: location,
        itinerary: itinerary
      });
      setScrapbookMode('create');
      // Force open scrapbook after a tiny delay to ensure state is set
      setTimeout(() => {
        setShowScrapbook(true);
      }, 100);
    }
    
  } catch (error) {
    console.error('❌ Error completing date:', error);
    alert(`Error completing date: ${error.message}`);
  }
};
  
 const handleSaveDate = async (place) => {
  // 🔒 SUBSCRIPTION GATE
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  
  // Prevent double-clicks
  if (savingDate) return;
  setSavingDate(true);
  
  try {
    const dateToSave = {

        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating,
        geometry: place.geometry,
        photos: place.photos,
        website: place.website,
        isEvent: place.isEvent,
        eventDate: place.eventDate,
        eventTime: place.eventTime,
        priceRange: place.priceRange,
        venueName: place.venueName,
        savedAt: new Date().toISOString()
      };
      
      if (savedDates.some(d => d.place_id === place.place_id)) {
        alert(t('alreadySaved'));
        return;
      }
      
      const newSavedDates = [...savedDates, dateToSave];
      setSavedDates(newSavedDates);
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { savedDates: newSavedDates }, { merge: true });

      // ⭐ Track for App Store rating
      AppRatingService.trackDateCompleted();
      setTimeout(() => {
        AppRatingService.requestRating();
      }, 2000);
      trackAction(ACTION_TYPES.SAVE_DATE);
      
      alert(t('dateSaved'));
    } catch (err) {
      HapticService.notifyError();
      console.error('Save error:', err);
    } finally {
      setSavingDate(false);
    }
  };
  
  const handleSaveItinerary = async () => {
  // 🔒 SUBSCRIPTION GATE
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}
  
  // Prevent double-clicks
  if (savingItinerary) return;
  setSavingItinerary(true);
  
  try {
    if (!itinerary || !itinerary.stops || itinerary.stops.length === 0) {
        setSavingItinerary(false);
        return;
      }
      
      const itineraryToSave = {
        place_id: `itinerary_${Date.now()}`,
        name: `Date Night: ${itinerary.stops.map(s => s.title).join(' → ')}`,
        isItinerary: true,
        stops: itinerary.stops,
        savedAt: new Date().toISOString()
      };
      
      const newSavedDates = [...savedDates, itineraryToSave];
      setSavedDates(newSavedDates);
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { savedDates: newSavedDates }, { merge: true });

      // ⭐ Track for App Store rating
      AppRatingService.trackDateCompleted();
      setTimeout(() => {
        AppRatingService.requestRating();
      }, 2000);
      
      // After successful save:
HapticService.notifySuccess();
alert(t('itinerarySaved'));
    } catch (err) {
      HapticService.notifyError();
      console.error('Save itinerary error:', err);
    } finally {
      setSavingItinerary(false);
    }
  };
  
  const handleRemoveSavedDate = async (placeId) => {
    try {
      const newSavedDates = savedDates.filter(d => d.place_id !== placeId);
      setSavedDates(newSavedDates);
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { savedDates: newSavedDates }, { merge: true });

      // ⭐ Track for App Store rating
      AppRatingService.trackDateCompleted();
      setTimeout(() => {
        AppRatingService.requestRating();
      }, 2000);
    } catch (err) {
      console.error('Remove error:', err);
    }
  };
  
  const isDateSaved = (placeId) => savedDates.some(d => d.place_id === placeId);
  
  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };
  
  const handleShareDate = (dateData) => {
  console.log('🟢 handleShareDate CALLED');
  console.log('🟢 dateData:', dateData);
  console.log('🟢 subscriptionStatus:', subscriptionStatus);
  
  if (subscriptionStatus === 'free') {
  setShowPremiumModal(true);
  return;
}

  console.log('🟢 About to set dateToShare');

  const cleanedDateData = {
    place_id: dateData.place_id || `temp_${Date.now()}`,
    name: dateData.name || 'Untitled Location',
    vicinity: dateData.vicinity || dateData.formatted_address || 'Location not specified',
    rating: dateData.rating || null,
    user_ratings_total: dateData.user_ratings_total || null,
    types: dateData.types || [],
    // ONLY include these fields if they have values
    ...(dateData.geometry && { geometry: dateData.geometry }),
    ...(dateData.photos && dateData.photos.length > 0 && { photos: dateData.photos }),
    ...(dateData.website && { website: dateData.website }),
    ...(dateData.opening_hours && { opening_hours: dateData.opening_hours }),
    ...(typeof dateData.price_level !== 'undefined' && { price_level: dateData.price_level }),
    // Handle events
    ...(dateData.isEvent && { isEvent: true }),
    ...(dateData.eventDate && { eventDate: dateData.eventDate }),
    ...(dateData.eventTime && { eventTime: dateData.eventTime }),
    ...(dateData.priceRange && { priceRange: dateData.priceRange }),
    ...(dateData.venueName && { venueName: dateData.venueName }),
    // Handle itineraries
    ...(dateData.isItinerary && { isItinerary: true }),
    ...(dateData.stops && { stops: dateData.stops })
  };

  console.log('✅ Cleaned data for sharing:', cleanedDateData);
  console.log('🟢 About to set dateToShare and showShareModal');
  trackAction(ACTION_TYPES.SHARE_DATE);
  
  // ⭐ THIS IS THE KEY CHANGE - Use setTimeout ⭐
  setTimeout(() => {
    setDateToShare(cleanedDateData);
    setShowShareModal(true);
    console.log('🟢 State updated via setTimeout');
  }, 0);
  
  console.log('🟢 handleShareDate FINISHED - modal should show now');
};
  const handleWheelSelection = (activity) => {
  // Add the wheel-selected activity to custom activities
  if (!customActivities.includes(activity)) {
    setCustomActivities([...customActivities, activity]);
  }
  // Award bonus XP for using the wheel
  if (gameStats) {
    awardPoints(POINT_VALUES.TRY_NEW_THING, `Used Wheel: ${activity}`);
  }
};
  const handleAddCustomActivity = () => {
  if (customActivityInput.trim() && !customActivities.includes(customActivityInput.trim())) {
    HapticService.tapLight();
    setCustomActivities([...customActivities, customActivityInput.trim()]);
    setCustomActivityInput('');
  }
};
  
  const handleRemoveCustomActivity = (activity) => {
  HapticService.tapLight();
  setCustomActivities(customActivities.filter(a => a !== activity));
};
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAddCustomActivity();
  };
  
 const handleGenerateDate = async (isRefresh = false) => {
  // Cancel any in-flight request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  abortControllerRef.current = new AbortController();
  
  // Clear previous errors
  setError('');
  setSearchLoading(true);
  
  console.log('═══════════════════════════════════════');
  console.log('🚀 DATE GENERATION STARTED');
  console.log('═══════════════════════════════════════');
  
  try {
    // STEP 0: Check subscription
    console.log('STEP 0: Checking subscription status...');
    console.log('  subscriptionStatus:', subscriptionStatus);
    
    if (subscriptionStatus === 'free') {
  console.log('  ❌ User is free - showing modal');
  setShowPremiumModal(true);
  setSearchLoading(false);
  return;
}

    
    console.log('  ✅ User has premium access');
    
    // STEP 1: Check if user exists
    console.log('STEP 1: Checking user...');
    console.log('  user:', user ? 'EXISTS' : 'NULL');
    
    if (!user) {
      throw new Error('No user logged in. Please refresh and try again.');
    }
    
    console.log('  ✅ User exists');
    
    // STEP 2: Get auth token
    console.log('STEP 2: Getting auth token...');
    
    let token;
    try {
      token = await user.getIdToken();
      console.log('  ✅ Got token:', token ? 'YES (length: ' + token.length + ')' : 'NO');
    } catch (tokenError) {
      console.error('  ❌ Token error:', tokenError);
      throw new Error('Failed to get authentication token: ' + (tokenError.message || 'Unknown error'));
    }
    
    if (!token) {
      throw new Error('Authentication token is empty. Please log out and log back in.');
    }
    
    // STEP 3: Prepare location
    console.log('STEP 3: Preparing location...');
    let latitude, longitude;
    
    if (location) {
      console.log('  Using location string:', location);
      
      const geocodeUrl = `${API_URL}/api/geocode?address=${encodeURIComponent(location)}`;
      console.log('  Geocode URL:', geocodeUrl);
      console.log('  API_URL:', API_URL);
      
      try {
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: abortControllerRef.current.signal
        });
        
        console.log('  Geocode status:', geocodeResponse.status);
        console.log('  Geocode ok:', geocodeResponse.ok);
        
        if (!geocodeResponse.ok) {
          const errorText = await geocodeResponse.text();
          console.error('  Geocode error text:', errorText);
          throw new Error(`Geocoding failed (${geocodeResponse.status}): ${errorText.substring(0, 200)}`);
        }
        
        const geocodeData = await geocodeResponse.json();
        console.log('  Geocode data status:', geocodeData.status);
        
        if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
          throw new Error(`Location "${location}" not found. Try: "Perth, Australia" or "New York, USA"`);
        }
        
        latitude = geocodeData.results[0].geometry.location.lat;
        longitude = geocodeData.results[0].geometry.location.lng;
        console.log('  ✅ Coordinates:', latitude, longitude);
        
      } catch (geocodeError) {
        console.error('  ❌ Geocode failed:', geocodeError);
        throw geocodeError;
      }
      
    } else {
      console.log('  Using device location...');
      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported on this device'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            timeout: 10000,
            enableHighAccuracy: false
          });
        });
        
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('  ✅ Device location:', latitude, longitude);
        
      } catch (geoError) {
        console.error('  ❌ Geolocation failed:', geoError);
        throw new Error('Could not get your location. Please enter a city name instead.');
      }
    }
    
    // STEP 4: Build query
    console.log('STEP 4: Building search query...');
    
    const allSelections = [...selectedHobbies, ...selectedActivities, ...customActivities];
    console.log('  Selected activities:', allSelections);
    
    const searchTerms = new Set();
    allSelections.forEach(sel => searchTerms.add(sel.toLowerCase().trim()));
    
    if (searchTerms.size === 0) {
      searchTerms.add('restaurant bar cafe entertainment');
    }
    
    const keywords = Array.from(searchTerms).join(' ');
    console.log('  Keywords:', keywords);
    
    // STEP 5: Fetch places
    console.log('STEP 5: Fetching places...');
    
    const params = new URLSearchParams({
      lat: latitude,
      lng: longitude,
      radius: 10000,
      keyword: keywords,
      includeEvents: includeEvents.toString(),
      dateRange: dateRange,
      selectedDate: selectedDate || '',
      refresh: isRefresh.toString()
    });
    
    const placesUrl = `${API_URL}/api/places?${params}`;
    console.log('  Places URL:', placesUrl);
    
    try {
      const placesResponse = await fetch(placesUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: abortControllerRef.current.signal
      });
      
      console.log('  Places status:', placesResponse.status);
      console.log('  Places ok:', placesResponse.ok);
      
     
      
      const placesData = await placesResponse.json();
      console.log('  Places count:', placesData.results?.length || 0);
      
      if (placesData.error) {
        throw new Error(placesData.error);
      }
      
      let uniqueResults = placesData.results || [];
      
      if (uniqueResults.length === 0) {
        setError('No places found for your search. Try different keywords.');
        setSearchLoading(false);
        return;
      }
      
      console.log('  ✅ Got', uniqueResults.length, 'places');
      
      // STEP 6: Create itinerary
      console.log('STEP 6: Creating itinerary...');
      
      setPhotoToken(token);
      
     // Pass isRefresh flag to createItinerary
const generatedItinerary = createItinerary(uniqueResults, keywords, isRefresh);
      
      
      const allPlaces = [
        ...generatedItinerary.stops.map(s => s.place),
        ...generatedItinerary.alternatives
      ];
      setPlaces(allPlaces);

// Reset scroll FIRST before any state changes
const root = document.getElementById('root');
if (root) root.scrollTop = 0;
window.scrollTo(0, 0);
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;

// Reset itinerary first to force fresh render
setItinerary(null);
setShowResults(false);

// Small delay then set new data
setTimeout(() => {
  // Scroll again after state update
  const root = document.getElementById('root');
  if (root) root.scrollTop = 0;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  setItinerary(generatedItinerary);
      trackAction(ACTION_TYPES.BROWSE_DATE);
      trackAction(ACTION_TYPES.GENERATE_DATE);
  setShowResults(true);
  
  // 🎉 Celebration confetti!
  // After date is generated successfully:
setShowConfetti(true);
HapticService.celebrate();
  setTimeout(() => setShowConfetti(false), 5000);
  });
  
 
      

      
      console.log('✅ SUCCESS! Itinerary created with', generatedItinerary.stops.length, 'stops');
      console.log('═══════════════════════════════════════');
      
    } catch (placesError) {
      console.error('  ❌ Places fetch failed:', placesError);
      throw placesError;
    }
    
  } catch (err) {
    HapticService.notifyError();
    // If request was cancelled, don't show error
    if (err.name === 'AbortError') {
      console.log('Request cancelled by user');
      setSearchLoading(false);
      return;
    }
    
    console.error('═══════════════════════════════════════');
    console.error('❌ GENERATION FAILED');
    console.error('Error type:', typeof err);
    console.error('Error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('═══════════════════════════════════════');
    
    let errorMsg = '❌ Failed to generate date:\n\n';
    
    if (err && err.message) {
      errorMsg += err.message;
    } else if (err && typeof err === 'string') {
      errorMsg += err;
    } else {
      errorMsg += 'Unknown error occurred\n\n';
      errorMsg += 'Error details: ' + JSON.stringify(err);
    }
    
    errorMsg += '\n\n📍 Location: ' + (location || 'Using device location');
    errorMsg += '\n🌐 API: ' + API_URL;
    errorMsg += '\n📱 Device: Mobile browser';
    
    setError(errorMsg);
    alert(errorMsg);
    
  } finally {
    setSearchLoading(false);
  }
};
    
const generateStopTitle = (place, isEvening, isAfternoon, isMorning) => {
  const category = place.category;
  const subcategory = place.subcategory;
  const name = place.name?.toLowerCase() || '';
  
  if (category === 'drinks') {
    return {
      title: 'Drinks',
      icon: '🍸',
      description: 'Enjoy drinks and conversation'
    };
  }

if (category === 'nightlife') {
  return {
    title: 'Night Out',
    icon: '🎉',
    description: 'Dance and party the night away'
  };
}

  
  if (category === 'cafe') {
    return {
      title: 'Coffee Break',
      icon: '☕',
      description: 'Relax over coffee and pastries'
    };
  }
  
  if (category === 'food') {
    if (isEvening) {
      return {
        title: 'Dinner',
        icon: '🍽️',
        description: 'Enjoy a delicious dinner'
      };
    } else if (isAfternoon) {
      return {
        title: 'Lunch',
        icon: '🍽️',
        description: 'Have a nice lunch together'
      };
    } else {
      return {
        title: 'Brunch',
        icon: '🍽️',
        description: 'Enjoy brunch together'
      };
    }
  }
  
  if (category === 'outdoor') {
    if (subcategory === 'garden' || name.includes('garden')) {
      return {
        title: 'Garden Visit',
        icon: '🌸',
        description: 'Explore beautiful gardens'
      };
    } else if (subcategory === 'trail' || name.includes('trail') || name.includes('hike')) {
      return {
        title: 'Hiking',
        icon: '🥾',
        description: 'Hit the trails together'
      };
    } else if (name.includes('beach')) {
      return {
        title: 'Beach Visit',
        icon: '🏖️',
        description: 'Relax by the water'
      };
    } else {
      return {
        title: 'Park Time',
        icon: '🌳',
        description: 'Enjoy nature together'
      };
    }
  }
  
  if (category === 'entertainment') {
    if (subcategory === 'culture' || subcategory === 'museum') {
      return {
        title: 'Visit Museum',
        icon: '🏛️',
        description: 'Explore art and culture'
      };
    } else if (subcategory === 'theater' || name.includes('cinema') || name.includes('movie')) {
      return {
        title: 'Watch a Movie',
        icon: '🎬',
        description: 'Enjoy a film together'
      };
    } else if (subcategory === 'music') {
      return {
        title: 'Live Music',
        icon: '🎵',
        description: 'Enjoy live performances'
      };
    } else if (subcategory === 'comedy') {
      return {
        title: 'Comedy Show',
        icon: '😂',
        description: 'Laugh together'
      };
    } else if (subcategory === 'sports') {
      return {
        title: 'Sports Event',
        icon: '🏟️',
        description: 'Watch the game'
      };
    } else if (subcategory === 'aquarium') {
      return {
        title: 'Aquarium Visit',
        icon: '🐠',
        description: 'Explore underwater worlds'
      };
    } else if (subcategory === 'zoo') {
      return {
        title: 'Zoo Visit',
        icon: '🦁',
        description: 'See amazing animals'
      };
    } else if (subcategory === 'event' || place.isEvent) {
      return {
        title: 'Special Event',
        icon: '🎉',
        description: 'Attend an exciting event'
      };
    } else {
      return {
        title: 'Entertainment',
        icon: '🎭',
        description: 'Have fun together'
      };
    }
  }
  
  if (category === 'activity') {
    if (subcategory === 'dance') {
      return {
        title: 'Dancing',
        icon: '💃',
        description: 'Dance the night away'
      };
    } else if (subcategory === 'wine') {
      return {
        title: 'Wine Tasting',
        icon: '🍷',
        description: 'Sample fine wines'
      };
    } else if (subcategory === 'karaoke') {
  return {
    title: 'Karaoke',
    icon: '🎤',
    description: 'Sing your hearts out'
  };
} else if (subcategory === 'gokart') {
  return {
    title: 'Go Karting',
    icon: '🏎️',
    description: 'Race around the track'
  };
} else if (subcategory === 'games') {
  if (name.includes('escape')) {
    return {
      title: 'Escape Room',
      icon: '🔐',
      description: 'Solve puzzles together'
    };
  } else if (name.includes('bowling')) {
    return {
      title: 'Bowling',
      icon: '🎳',
      description: 'Bowl a few games'
    };
  } else if (name.includes('arcade')) {
    return {
      title: 'Arcade Games',
      icon: '🕹️',
      description: 'Play retro games'
    };
  } else {
    return {
      title: 'Fun Games',
      icon: '🎯',
      description: 'Have fun together'
    };
  }
} else if (subcategory === 'fitness') {
      return {
        title: 'Workout Session',
        icon: '💪',
        description: 'Get active together'
      };
    } else if (subcategory === 'cooking') {
      return {
        title: 'Cooking Class',
        icon: '👨‍🍳',
        description: 'Learn to cook together'
      };
    } else if (subcategory === 'reading') {
      return {
        title: 'Browse Books',
        icon: '📚',
        description: 'Discover new reads'
      };
    } else if (subcategory === 'shopping') {
      return {
        title: 'Shopping',
        icon: '🛍️',
        description: 'Browse shops together'
      };
    } else {
      return {
        title: 'Fun Activity',
        icon: '✨',
        description: 'Try something new'
      };
    }
  }
  
  return {
    title: 'Explore',
    icon: '✨',
    description: 'Discover something new'
  };
};

  const getStaticMapUrl = (lat, lng) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key not found');
    return null;
  }
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
};
  
 const getPlacePhoto = (place, authToken) => {
  try {
    // Handle events with direct URLs
    if (place.isEvent && place.photos && place.photos.length > 0) {
      if (place.photos[0].isDirectUrl) {
        console.log(`✅ Event photo (direct URL) for ${place.name}`);
        return place.photos[0].photo_reference;
      }
    }
    
    // Handle Google Places photos
    if (place.photos && place.photos.length > 0) {
      const photo = place.photos[0];
      
      // If it's already a direct URL, return it
      if (photo.isDirectUrl && photo.photo_reference) {
        console.log(`✅ Direct URL photo for ${place.name}`);
        return photo.photo_reference;
      }
      
      // Use backend proxy for Google Photos to avoid CORS
      if (photo.photo_reference && typeof photo.photo_reference === 'string') {
        const proxyUrl = `${API_URL}/api/photo?photoreference=${photo.photo_reference}&token=${authToken || photoToken}`;
        console.log(`✅ Using proxy for ${place.name}`);
        return proxyUrl;
      }
    }
    
    console.log(`⚠️ No photo available for ${place.name}`);
    return null;
  } catch (error) {
    console.error(`❌ Error getting photo for ${place.name}:`, error);
    return null;
  }
};
  
  const getPlaceholderImage = (placeName) => {
    const colors = [
      ['#ec4899', '#a855f7'],
      ['#a855f7', '#3b82f6'],
      ['#3b82f6', '#06b6d4'],
      ['#10b981', '#059669'],
      ['#f59e0b', '#ef4444'],
    ];
    return colors[placeName.length % colors.length];
  };
  
  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };
  if (initError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', padding: '2rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626' }}>Error</h2>
          <p>{initError}</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)' }}>
        <Heart style={{ color: '#ec4899' }} size={64} fill="currentColor" />
      </div>
    );
  }
  
  if (showSocial) {
  return (
    <Social 
      user={user} 
      userPurchases={userPurchases}
      onBack={() => setShowSocial(false)}
    />
  );
}
  
  if ((!user || !user.emailVerified || authScreen !== 'main') && !isGuestMode) {
    if (authScreen === 'login') {
      return (
        <Login 
          onSwitchToSignup={() => setAuthScreen('signup')}
          onShowVerification={() => setAuthScreen('verification')}
          onContinueAsGuest={handleContinueAsGuest}
        />
      );
    }
    
    if (authScreen === 'signup') {
      return (
        <Signup 
          onSwitchToLogin={() => setAuthScreen('login')}
          onShowSuccess={() => setAuthScreen('success')}
        />
      );
    }
    
    if (authScreen === 'success') {
      // Show success screen - don't auto-redirect
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)',
          padding: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '3rem', 
            borderRadius: '24px', 
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Check Your Email!
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
              We sent a verification link to <strong>{user?.email}</strong>
              <br /><br />
              Click the link to activate your account.
            </p>
            <button
              onClick={() => {
                // Send user back to login
                setAuthScreen('login');
              }}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(to right, #ec4899, #a855f7)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }
    
    if (authScreen === 'verification') {
      // Show verification reminder
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)',
          padding: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '3rem', 
            borderRadius: '24px', 
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📧</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Email Not Verified
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
              Please check your email (<strong>{user?.email}</strong>) and click the verification link.
              <br /><br />
              Already verified? Refresh this page after clicking the link.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(to right, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                I've Verified - Refresh Page
              </button>
              <button
                onClick={async () => {
                  try {
                    await sendEmailVerification(user);
                    alert('Verification email sent! Check your inbox.');
                  } catch (error) {
                    console.error('Error sending verification:', error);
                    alert('Error sending email. Please try again.');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'white',
                  color: '#ec4899',
                  border: '2px solid #ec4899',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Resend Verification Email
              </button>
              <button
                onClick={() => {
                  signOut(auth);
                  setAuthScreen('login');
                }}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'white',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
  
 if (showProfile) {
  return (
    <>
      <style>{`
        body, html {
          background: linear-gradient(to bottom right, #fce7f3, #f3e8ff);
          background-color: #f3e8ff;
          min-height: 100vh;
          min-height: 100dvh;
        }
        #root {
          background: linear-gradient(to bottom right, #fce7f3, #f3e8ff);
          background-color: #f3e8ff;
          min-height: 100vh;
          min-height: 100dvh;
        }
      `}</style>
      <div style={{ minHeight: '100vh', minHeight: '100dvh', background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', backgroundColor: '#f3e8ff', padding: '2rem', paddingTop: 'calc(2rem + env(safe-area-inset-top))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))', direction: isRTL ? 'rtl' : 'ltr', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>{t('myProfile')}</h1>
            <button onClick={() => setShowProfile(false)} style={{ background: 'white', padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              ← {t('back')}
            </button>
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #ec4899' }}>
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom right, #ec4899, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 'bold' }}>
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Badge Display */}
                {userPurchases?.selectedBadge && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: userPurchases.selectedBadge === 'crown' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                userPurchases.selectedBadge === 'expert' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                userPurchases.selectedBadge === 'adventurer' ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' :
                                userPurchases.selectedBadge === 'globe' ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' :
                                userPurchases.selectedBadge === 'flame' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' :
                                'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    border: '2px solid white'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {userPurchases.selectedBadge === 'crown' ? '👑' :
                       userPurchases.selectedBadge === 'expert' ? '❤️' :
                       userPurchases.selectedBadge === 'adventurer' ? '🚀' :
                       userPurchases.selectedBadge === 'globe' ? '🌍' :
                       userPurchases.selectedBadge === 'flame' ? '🔥' : '✨'}
                    </span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleUploadPhoto} style={{ display: 'none' }} id="photoUpload" />
              <label htmlFor="photoUpload" style={{ background: 'linear-gradient(to right, #ec4899, #a855f7)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: '600' }}>
                {t('uploadPhoto')}
              </label>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                {t('accountInfo')}
              </h3>
              
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '12px', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('email')}</p>
                <p style={{ fontWeight: '600', color: '#111827' }}>{user.email}</p>
              </div>
              
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '12px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t('plan')}</p>
                <p style={{ fontWeight: '600', color: '#111827' }}>
                  {subscriptionStatus === 'premium' ? `✨ ${t('premiumPlan')}` : `🆓 ${t('freePlan')}`}
                </p>
              </div>

              {!Capacitor.isNativePlatform() && (
  <button
    onClick={() => setShowSubscriptionManager(true)}
    style={{
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
    }}
  >
    💳 Manage Subscription & Billing
  </button>
)}

{/* iOS: Account Management Info (Apple-Compliant) */}
{Capacitor.isNativePlatform() && (
  <div style={{ marginBottom: '1rem' }}>
    {/* Premium users: Show account info WITHOUT external links */}
    {(subscriptionStatus === 'trial' || subscriptionStatus === 'premium') && (
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '2px solid #86efac',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            ✓
          </div>
          <div>
            <p style={{ 
              margin: 0, 
              fontWeight: '900',
              fontSize: '1.1rem',
              color: '#065f46'
            }}>
              {subscriptionStatus === 'trial' ? '🎉 Free Trial Active' : '✨ Premium Active'}
            </p>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#059669',
              fontWeight: '600'
            }}>
              All features unlocked
            </p>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <p style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.875rem',
            fontWeight: '700',
            color: '#065f46'
          }}>
            📧 Account Email
          </p>
          <p style={{
            margin: 0,
            fontSize: '0.95rem',
            color: '#047857',
            fontWeight: '600',
            wordBreak: 'break-all'
          }}>
            {user?.email}
          </p>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.875rem',
            fontWeight: '700',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
             Premium Features!
          </p>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#059669',
            lineHeight: '1.6'
          }}>
            Premium Feautures Include all of our functions from Itenerary planning, Socials, Surprise Dates, Date Memories and much more!
          </p>
        </div>
      </div>
    )}

    {subscriptionStatus === 'free' && (
  <div style={{
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '2px solid #fbbf24'
  }}>
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
      <h3 style={{ 
        margin: '0 0 0.5rem 0',
        color: '#92400e',
        fontSize: '1.25rem',
        fontWeight: '700'
      }}>
        Premium Features Available
      </h3>
      <p style={{ 
        margin: 0,
        color: '#78350f',
        fontSize: '0.95rem',
        lineHeight: '1.5'
      }}>
        Unlock unlimited dates, social features, and more
      </p>
    </div>
    
    <button
      onClick={() => {
        console.log('🔵 Profile - Sign In With Premium clicked');
        console.log('📧 Current email:', user?.email);
        
        // Close any modals
        setShowPremiumModal(false);
        
        // Small delay to ensure clean transition
        setTimeout(() => {
          if (isGuestMode || user) {
            // Log out but KEEP the email in localStorage for pre-fill
            if (user?.email) {
              localStorage.setItem('datemaker_prefill_email', user.email);
            }
            handleLogout();
          } else {
            setAuthScreen('login');
          }
        }, 100);
      }}
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
        color: 'white',
        fontWeight: '700',
        fontSize: '1rem',
        padding: '1rem',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s'
      }}
    >
      <Sparkles size={20} />
      Sign In With Premium Account
    </button>
  </div>
)}
    
    {/* Terms & Privacy links */}
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem'
    }}>
      <span
        onClick={() => setShowTerms(true)}
        style={{ color: '#ec4899', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
      >
        Terms of Service
      </span>
      <span
        onClick={() => setShowPrivacy(true)}
        style={{ color: '#ec4899', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}
      >
        Privacy Policy
      </span>
    </div>
  </div>
)}
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>{t('changePassword')}</h3>
              <input type="password" placeholder={t('newPassword')} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid #e5e7eb', borderRadius: '12px', marginBottom: '0.75rem', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
              <input type="password" placeholder={t('confirmPassword')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid #e5e7eb', borderRadius: '12px', marginBottom: '0.75rem', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={handleChangePassword} style={{ width: '100%', background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', padding: '0.875rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                {t('updatePassword')}
              </button>
            </div>
            {subscriptionStatus === 'premium' && (
  <div style={{ marginBottom: '2rem' }}>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>{t('subscription')}</h3>
    <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #86efac', marginBottom: '1rem' }}>
      <p style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem', fontWeight: '600' }}>✨ {t('premiumActive')}</p>
      <p style={{ fontSize: '0.875rem', color: '#15803d' }}>{t('premiumDesc')}</p>
    </div>
    <div style={{
      background: 'rgba(239, 68, 68, 0.08)',
      border: '2px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '12px',
      padding: '1.25rem',
      textAlign: 'center'
    }}>
      <p style={{ 
        color: '#6b7280', 
        fontSize: '0.95rem', 
        margin: 0,
        lineHeight: '1.6'
      }}>
        To cancel your subscription, go to your device's{' '}
        <strong style={{ color: '#374151' }}>Settings → Apple ID → Subscriptions</strong>{' '}
        and manage it there.
      </p>
    </div>
  </div>
)}
           

{/* DELETE ACCOUNT SECTION */}
<div style={{ 
  marginBottom: '2rem',
  paddingTop: '2rem',
  borderTop: '2px solid #fecaca'
}}>
  <h3 style={{ 
    fontSize: '1.25rem', 
    fontWeight: 'bold', 
    marginBottom: '1rem', 
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}>
    ⚠️ Danger Zone
  </h3>
  <p style={{ 
    color: '#6b7280', 
    fontSize: '0.875rem', 
    marginBottom: '1rem' 
  }}>
    Once you delete your account, there is no going back. Please be certain.
  </p>
  <button 
    onClick={handleDeleteAccount}
    style={{
      width: '100%',
      background: 'white',
      color: '#dc2626',
      padding: '1rem',
      borderRadius: '12px',
      border: '2px solid #dc2626',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '1rem',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = '#dc2626';
      e.target.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'white';
      e.target.style.color = '#dc2626';
    }}
  >
    🗑️ Delete My Account
  </button>
</div>

            {profileError && (
              <div style={{ padding: '1rem', background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', color: '#b91c1c', fontWeight: '600', textAlign: 'center' }}>
                {profileError}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showSubscriptionManager && (
  <SubscriptionManager
    user={user}
    userData={userData}
    onClose={() => setShowSubscriptionManager(false)}
    onShowTerms={() => setShowTerms(true)}
    onShowPrivacy={() => setShowPrivacy(true)}
  />
)}
{showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  );
}
  
 if (showSavedDates) {
    return (
      <>
      <style>{`
        body, html {
          background: linear-gradient(to bottom right, #fce7f3, #f3e8ff);
          background-color: #f3e8ff;
          min-height: 100vh;
          min-height: 100dvh;
        }
        #root {
          background: linear-gradient(to bottom right, #fce7f3, #f3e8ff);
          background-color: #f3e8ff;
          min-height: 100vh;
          min-height: 100dvh;
        }
      `}</style>
      <div style={{ minHeight: '100vh', minHeight: '100dvh', background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', backgroundColor: '#f3e8ff', padding: '2rem', paddingTop: 'calc(2rem + env(safe-area-inset-top))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))', direction: isRTL ? 'rtl' : 'ltr', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart style={{ color: '#ec4899' }} size={32} fill="currentColor" />
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>{t('mySavedDates')}</h1>
            </div>
            <button onClick={() => setShowSavedDates(false)} style={{ background: 'white', padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              ← {t('back')}
            </button>
          </div>
          {savedDates.length === 0 ? (
  <div style={{ 
    background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 50%, #faf5ff 100%)', 
    borderRadius: '32px', 
    padding: '4rem 2rem', 
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(236, 72, 153, 0.15)',
    border: '2px solid rgba(236, 72, 153, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Decorative elements */}
    <div style={{
      position: 'absolute',
      top: '-20px',
      right: '-20px',
      fontSize: '6rem',
      opacity: 0.1,
      transform: 'rotate(15deg)'
    }}>💕</div>
    <div style={{
      position: 'absolute',
      bottom: '-10px',
      left: '-10px',
      fontSize: '4rem',
      opacity: 0.1,
      transform: 'rotate(-15deg)'
    }}>✨</div>
    
    <div style={{
      width: '120px',
      height: '120px',
      margin: '0 auto 1.5rem',
      background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 30px rgba(236, 72, 153, 0.2)'
    }}>
      <Heart size={56} style={{ color: '#ec4899' }} />
    </div>
    <h2 style={{ 
      fontSize: '1.75rem', 
      fontWeight: '800', 
      marginBottom: '0.75rem',
      background: 'linear-gradient(135deg, #ec4899, #a855f7)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>{t('noSavedDates')}</h2>
    <p style={{ 
      color: '#6b7280', 
      marginBottom: '2rem',
      fontSize: '1.1rem',
      maxWidth: '300px',
      margin: '0 auto 2rem'
    }}>{t('noSavedDatesDesc')}</p>
    <button 
      onClick={() => setShowSavedDates(false)} 
      style={{ 
        background: 'linear-gradient(135deg, #ec4899, #a855f7)', 
        color: 'white', 
        fontWeight: '700', 
        padding: '1rem 2.5rem', 
        borderRadius: '9999px', 
        border: 'none', 
        cursor: 'pointer',
        fontSize: '1.1rem',
        boxShadow: '0 8px 30px rgba(236, 72, 153, 0.4)',
        transition: 'all 0.3s ease'
      }}
    >
      💕 {t('findPerfectDate')}
    </button>
  </div>
) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {savedDates.map((savedItem) => {
                if (savedItem.isItinerary) {
                  return (
                    <div key={savedItem.place_id} style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🗓️ {savedItem.name}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          
                          <button onClick={() => handleRemoveSavedDate(savedItem.place_id)} style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '9999px', border: '2px solid #fecaca', cursor: 'pointer' }}>
                            {t('remove')}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {savedItem.stops.map((stop, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem' }}>{stop.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <Clock size={16} style={{ color: '#6b7280' }} />
                                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>{stop.time}</span>
                              </div>
                              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{stop.title}</h4>
                              <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>{stop.place.name}</p>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stop.place.vicinity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                // Handle Free Dates (no geometry)
                if (savedItem.isFreeDate) {
                  return (
                    <div key={savedItem.place_id} style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{savedItem.categoryIcon || '💸'}</span>
                        <span style={{ background: '#22c55e', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>FREE DATE</span>
                      </div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{savedItem.name}</h3>
                      <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: 1.5 }}>{savedItem.vicinity}</p>
                      {savedItem.duration && <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>⏱️ {savedItem.duration}</p>}
                      {savedItem.bestTime && <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>🌟 Best time: {savedItem.bestTime}</p>}
                      {savedItem.tips && savedItem.tips.length > 0 && (
                        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                          <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#166534' }}>Tips:</p>
                          {savedItem.tips.map((tip, i) => (
                            <p key={i} style={{ color: '#166534', fontSize: '0.875rem', marginBottom: '0.25rem' }}>• {tip}</p>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {savedItem.spotifyPlaylist && (
                          <button onClick={() => window.open(savedItem.spotifyPlaylist, '_blank')} style={{ flex: 1, background: '#1DB954', color: 'white', fontWeight: 'bold', padding: '1rem', borderRadius: '999px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            🎵 Playlist
                          </button>
                        )}
                        <button onClick={() => handleRemoveSavedDate(savedItem.place_id)} style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', padding: '1rem 1.5rem', borderRadius: '999px', border: '2px solid #fecaca', cursor: 'pointer' }}>
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  );
                }
                
                // Handle Long Distance Dates (no geometry)
                if (savedItem.isLongDistance) {
                  return (
                    <div key={savedItem.place_id} style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{savedItem.categoryIcon || '💜'}</span>
                        <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>LONG DISTANCE</span>
                      </div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{savedItem.name}</h3>
                      <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: 1.5 }}>{savedItem.vicinity}</p>
                      {savedItem.duration && <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>⏱️ {savedItem.duration}</p>}
                      {savedItem.tools && savedItem.tools.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                          {savedItem.tools.map((tool, i) => (
                            <span key={i} style={{ background: '#f3e8ff', color: '#7c3aed', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>{tool}</span>
                          ))}
                        </div>
                      )}
                      {savedItem.tips && savedItem.tips.length > 0 && (
                        <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                          <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#6b21a8' }}>Tips:</p>
                          {savedItem.tips.map((tip, i) => (
                            <p key={i} style={{ color: '#6b21a8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>• {tip}</p>
                          ))}
                        </div>
                      )}
                      <button onClick={() => handleRemoveSavedDate(savedItem.place_id)} style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', padding: '1rem 1.5rem', borderRadius: '999px', border: '2px solid #fecaca', cursor: 'pointer' }}>
                        {t('remove')}
                      </button>
                    </div>
                  );
                }
                
                // Regular dates with geometry
                if (!savedItem.geometry?.location) {
                  return null; // Skip items without geometry that aren't handled above
                }
                
                const { lat, lng } = savedItem.geometry.location;
                const placePhoto = getPlacePhoto(savedItem);
                const placeholderColors = getPlaceholderImage(savedItem.name);
                
                return (
                  <div key={savedItem.place_id} style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <div style={{ position: 'relative', height: '300px' }}>
                      {placePhoto ? (
                        <img src={placePhoto ? `${placePhoto}${placePhoto.includes('?') ? '&' : '?'}token=${photoToken}` : ''} alt={savedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      ) : null}
                      <div style={{ display: placePhoto ? 'none' : 'flex', width: '100%', height: '100%', background: `linear-gradient(135deg, ${placeholderColors[0]}, ${placeholderColors[1]})`, alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>
                        {savedItem.name.charAt(0).toUpperCase()}
                      </div>
                      {savedItem.rating && (
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
                          <Star size={18} style={{ color: '#eab308' }} fill="currentColor" />
                          <span style={{ fontWeight: 'bold' }}>{savedItem.rating}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '2rem' }}>
                      <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>{savedItem.name}</h3>
                      <p style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <MapPin size={20} style={{ color: '#ec4899' }} />
                        {savedItem.vicinity}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button onClick={() => openDirections(lat, lng)} style={{ flex: 1, minWidth: '120px', background: 'linear-gradient(to right, #ec4899, #d946ef)', color: 'white', fontWeight: 'bold', padding: '1rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <Navigation size={20} />
                          {t('directions')}
                        </button>
                        {savedItem.website && (
                          <button onClick={() => window.open(savedItem.website, '_blank')} style={{ flex: 1, minWidth: '120px', background: 'linear-gradient(to right, #a855f7, #7c3aed)', color: 'white', fontWeight: 'bold', padding: '1rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <ExternalLink size={20} />
                            {t('website')}
                          </button>
                        )}
                        
                        <button onClick={() => handleRemoveSavedDate(savedItem.place_id)} style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', padding: '1rem 1.5rem', borderRadius: '9999px', border: '2px solid #fecaca', cursor: 'pointer' }}>
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
     </div>
      </div>
      </>
    );
  }
if (showResults && itinerary) {
  
  // =====================================================
  // 🎯 HELPER FUNCTIONS - DATA EXTRACTION
  // =====================================================

  // Map Google types[] to our categories
  const getVenueCategory = (types) => {
    if (!types || !Array.isArray(types)) return 'other';
    
    const typeMap = {
      'restaurant': 'food',
      'food': 'food',
      'meal_delivery': 'food',
      'meal_takeaway': 'food',
      'bakery': 'cafe',
      'cafe': 'cafe',
      'coffee_shop': 'cafe',
      'bar': 'drinks',
      'night_club': 'nightlife',
      'casino': 'nightlife',
      'movie_theater': 'entertainment',
      'museum': 'entertainment',
      'art_gallery': 'entertainment',
      'amusement_park': 'entertainment',
      'aquarium': 'entertainment',
      'bowling_alley': 'activity',
      'gym': 'activity',
      'spa': 'activity',
      'park': 'outdoor',
      'tourist_attraction': 'outdoor',
      'zoo': 'outdoor',
      'shopping_mall': 'shopping',
      'store': 'shopping'
    };
    
    for (const type of types) {
      if (typeMap[type]) return typeMap[type];
    }
    return 'other';
  };

  // Get cuisine type from Google types
  const getCuisineType = (types, name) => {
    if (!types) return null;
    
    const cuisineTypes = {
      'italian_restaurant': 'Italian',
      'chinese_restaurant': 'Chinese',
      'japanese_restaurant': 'Japanese',
      'mexican_restaurant': 'Mexican',
      'indian_restaurant': 'Indian',
      'thai_restaurant': 'Thai',
      'french_restaurant': 'French',
      'korean_restaurant': 'Korean',
      'vietnamese_restaurant': 'Vietnamese',
      'greek_restaurant': 'Greek',
      'spanish_restaurant': 'Spanish',
      'american_restaurant': 'American',
      'seafood_restaurant': 'Seafood',
      'steakhouse': 'Steakhouse',
      'pizza_restaurant': 'Pizza',
      'sushi_restaurant': 'Sushi',
      'burger_restaurant': 'Burgers',
      'vegetarian_restaurant': 'Vegetarian',
      'vegan_restaurant': 'Vegan',
      'brunch_restaurant': 'Brunch',
      'breakfast_restaurant': 'Breakfast'
    };
    
    for (const type of types) {
      if (cuisineTypes[type]) return cuisineTypes[type];
    }
    
    // Try to detect from name
    const nameLower = (name || '').toLowerCase();
    if (nameLower.includes('italian') || nameLower.includes('pizza') || nameLower.includes('pasta')) return 'Italian';
    if (nameLower.includes('sushi') || nameLower.includes('japanese')) return 'Japanese';
    if (nameLower.includes('mexican') || nameLower.includes('taco') || nameLower.includes('burrito')) return 'Mexican';
    if (nameLower.includes('chinese') || nameLower.includes('dim sum')) return 'Chinese';
    if (nameLower.includes('indian') || nameLower.includes('curry')) return 'Indian';
    if (nameLower.includes('thai')) return 'Thai';
    if (nameLower.includes('french') || nameLower.includes('bistro')) return 'French';
    if (nameLower.includes('burger')) return 'Burgers';
    if (nameLower.includes('steakhouse') || nameLower.includes('steak')) return 'Steakhouse';
    if (nameLower.includes('seafood') || nameLower.includes('fish')) return 'Seafood';
    if (nameLower.includes('cafe') || nameLower.includes('coffee')) return 'Cafe';
    if (nameLower.includes('bar') || nameLower.includes('pub')) return 'Bar';
    
    return null;
  };

  // =====================================================
  // 💰 SMART PRICE ESTIMATION
  // =====================================================
  
  const getBudgetInfo = (priceLevel, types, name) => {
    // If we have real price_level from Google, use it
    if (priceLevel !== undefined && priceLevel !== null) {
      const budgetMap = {
        0: { symbols: '💰', filled: 1, label: 'Free/Cheap', estimate: 'Under $15', color: '#10b981', isReal: true },
        1: { symbols: '💰', filled: 1, label: 'Budget', estimate: '$15-30', color: '#10b981', isReal: true },
        2: { symbols: '💰💰', filled: 2, label: 'Moderate', estimate: '$30-60', color: '#f59e0b', isReal: true },
        3: { symbols: '💰💰💰', filled: 3, label: 'Upscale', estimate: '$60-100', color: '#f97316', isReal: true },
        4: { symbols: '💰💰💰💰', filled: 4, label: 'Luxury', estimate: '$100+', color: '#ef4444', isReal: true }
      };
      return budgetMap[priceLevel] || budgetMap[2];
    }
    
    // Estimate based on venue type
    const category = getVenueCategory(types);
    const nameLower = (name || '').toLowerCase();
    
    // Check for luxury indicators in name
    const luxuryWords = ['fine dining', 'luxury', 'premium', 'exclusive', 'gourmet', 'michelin'];
    const budgetWords = ['fast food', 'quick', 'express', 'cheap', 'budget'];
    
    if (luxuryWords.some(w => nameLower.includes(w))) {
      return { symbols: '💰💰💰', filled: 3, label: 'Upscale', estimate: '$60-100', color: '#f97316', isReal: false };
    }
    if (budgetWords.some(w => nameLower.includes(w))) {
      return { symbols: '💰', filled: 1, label: 'Budget', estimate: '$15-30', color: '#10b981', isReal: false };
    }
    
    // Estimate by category
    const categoryEstimates = {
      'food': { symbols: '💰💰', filled: 2, label: 'Moderate', estimate: '$25-50', color: '#f59e0b', isReal: false },
      'cafe': { symbols: '💰', filled: 1, label: 'Budget', estimate: '$10-25', color: '#10b981', isReal: false },
      'drinks': { symbols: '💰💰', filled: 2, label: 'Moderate', estimate: '$20-50', color: '#f59e0b', isReal: false },
      'nightlife': { symbols: '💰💰💰', filled: 3, label: 'Pricey', estimate: '$40-80', color: '#f97316', isReal: false },
      'entertainment': { symbols: '💰💰', filled: 2, label: 'Moderate', estimate: '$20-60', color: '#f59e0b', isReal: false },
      'activity': { symbols: '💰💰', filled: 2, label: 'Moderate', estimate: '$30-60', color: '#f59e0b', isReal: false },
      'outdoor': { symbols: '💰', filled: 1, label: 'Free/Cheap', estimate: '$0-20', color: '#10b981', isReal: false },
      'shopping': { symbols: '💰💰', filled: 2, label: 'Varies', estimate: '$20-100', color: '#f59e0b', isReal: false },
      'other': { symbols: '💰💰', filled: 2, label: 'Moderate', estimate: '$25-50', color: '#f59e0b', isReal: false }
    };
    
    return categoryEstimates[category] || categoryEstimates['other'];
  };

  // =====================================================
  // 👥 IMPROVED BUSYNESS ESTIMATION
  // =====================================================
  
  const estimateBusyness = (stopTime, types, stopIndex) => {
  // Parse the stop's scheduled time
  let hour = 18; // default to evening
  if (stopTime) {
    const timeMatch = stopTime.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      const isPM = timeMatch[3]?.toUpperCase() === 'PM';
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    }
  }
  
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
  const category = getVenueCategory(types);
  
  // Conservative base busyness by time
  let baseBusyness;
  if (hour >= 5 && hour < 8) baseBusyness = 10;
  else if (hour >= 8 && hour < 11) baseBusyness = 20;
  else if (hour >= 11 && hour < 14) baseBusyness = 40;  // Lunch
  else if (hour >= 14 && hour < 17) baseBusyness = 20;  // Afternoon lull
  else if (hour >= 17 && hour < 19) baseBusyness = 35;  // Early evening
  else if (hour >= 19 && hour < 21) baseBusyness = 55;  // Dinner peak
  else if (hour >= 21 && hour < 23) baseBusyness = 45;  // Late evening
  else baseBusyness = 15;
  
  // Moderate category adjustments
  const categoryBonus = {
    'food': hour >= 12 && hour <= 14 ? 10 : (hour >= 19 && hour <= 21 ? 15 : -5),
    'cafe': hour >= 8 && hour <= 10 ? 10 : -5,
    'drinks': hour >= 20 ? 15 : -10,
    'nightlife': hour >= 22 ? 20 : -15,
    'entertainment': isWeekend ? 10 : 0,
    'activity': isWeekend ? 5 : -5,
    'outdoor': (hour >= 10 && hour <= 16) ? 5 : -10,
    'other': 0
  };
  
  let busyness = baseBusyness + (categoryBonus[category] || 0);
  
  // Weekend boost (moderate)
  if (isWeekend) busyness += 8;
  
  // Random variation for realism (±15)
  const randomVariation = Math.floor(Math.random() * 30) - 15;
  busyness += randomVariation;
  
  // Venue personality based on stop index
  busyness += (stopIndex % 3) * 5 - 5;
  
  // Clamp to 10-80 range (Packed should be rare/impossible for estimates)
  busyness = Math.max(10, Math.min(80, busyness));
  
  // Determine level
  let level;
  if (busyness < 25) level = { label: 'Quiet', color: '#10b981', emoji: '😌' };
  else if (busyness < 40) level = { label: 'Calm', color: '#22c55e', emoji: '👍' };
  else if (busyness < 55) level = { label: 'Moderate', color: '#3b82f6', emoji: '👥' };
  else if (busyness < 70) level = { label: 'Busy', color: '#f59e0b', emoji: '🔥' };
  else level = { label: 'Very Busy', color: '#f97316', emoji: '⚡' };
  
  const peakMap = {
    'food': '12-2pm & 7-9pm',
    'cafe': '8-10am',
    'drinks': '8-11pm',
    'nightlife': '10pm-2am',
    'entertainment': 'Evenings & weekends',
    'outdoor': '10am-4pm',
    'activity': 'Evenings & weekends',
    'other': 'Varies'
  };
  
  return { 
    percentage: busyness, 
    level, 
    peakHours: peakMap[category] || 'Varies',
    isEstimate: true
  };
};

  // =====================================================
  // 🌅 DYNAMIC TITLE BASED ON TIME
  // =====================================================
  
  const getDateTitle = () => {
    const startTime = itinerary.startTime || '6:00 PM';
    const timeMatch = startTime.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    
    let hour = 18; // default to evening
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      const isPM = timeMatch[3]?.toUpperCase() === 'PM';
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    }
    
    if (hour >= 5 && hour < 11) return { title: 'Morning Adventure', emoji: '☀️', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' };
    if (hour >= 11 && hour < 14) return { title: 'Lunch Date', emoji: '🌤️', gradient: 'linear-gradient(135deg, #f97316, #fb923c)' };
    if (hour >= 14 && hour < 17) return { title: 'Afternoon Escape', emoji: '🌅', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' };
    if (hour >= 17 && hour < 21) return { title: "Tonight's Adventure", emoji: '🌙', gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)' };
    return { title: 'Late Night Adventure', emoji: '✨', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' };
  };

  // =====================================================
  // 🎯 AUTO-DETECT DATE THEME
  // =====================================================
  
  const getDateTheme = () => {
    const categories = itinerary.stops.map(stop => getVenueCategory(stop.place?.types));
    
    const counts = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    const hasFood = counts.food >= 1;
    const hasDrinks = counts.drinks >= 1 || counts.nightlife >= 1;
    const hasOutdoor = counts.outdoor >= 1;
    const hasActivity = counts.activity >= 1;
    const hasEntertainment = counts.entertainment >= 1;
    const hasCafe = counts.cafe >= 1;
    
    // Determine theme
    if (counts.food >= 2) return { name: 'Foodie Adventure', emoji: '🍽️', color: '#f97316' };
    if (hasDrinks && counts.nightlife >= 1) return { name: 'Night Out', emoji: '🌃', color: '#8b5cf6' };
    if (hasOutdoor && hasActivity) return { name: 'Active Date', emoji: '🏃', color: '#10b981' };
    if (hasOutdoor && hasCafe) return { name: 'Chill & Explore', emoji: '🌿', color: '#22c55e' };
    if (hasEntertainment) return { name: 'Fun & Games', emoji: '🎮', color: '#ec4899' };
    if (hasFood && hasDrinks) return { name: 'Dinner & Drinks', emoji: '🥂', color: '#a855f7' };
    if (hasCafe && hasFood) return { name: 'Cozy Date', emoji: '☕', color: '#78716c' };
    
    return { name: 'Perfect Date', emoji: '💕', color: '#ec4899' };
  };

  // =====================================================
  // 👔 DRESS CODE HINTS
  // =====================================================
  
  const getDressCode = (types, priceLevel) => {
    const category = getVenueCategory(types);
    const isUpscale = priceLevel >= 3;
    
    if (isUpscale || category === 'nightlife') {
      return { code: 'Smart Elegant', emoji: '👗', tip: 'Dress to impress!' };
    }
    if (category === 'drinks') {
      return { code: 'Trendy', emoji: '🎨', tip: 'Look stylish & cool' };
    }
    if (category === 'food' && priceLevel >= 2) {
      return { code: 'Smart Casual', emoji: '👔', tip: 'Nice but relaxed' };
    }
    if (category === 'outdoor' || category === 'activity') {
      return { code: 'Comfortable', emoji: '👟', tip: 'Dress for movement' };
    }
    if (category === 'cafe') {
      return { code: 'Casual', emoji: '👕', tip: 'Keep it relaxed' };
    }
    
    return { code: 'Casual', emoji: '👕', tip: 'Anything goes!' };
  };

  // =====================================================
  // 🌙 AFTER HOURS DETECTION
  // =====================================================
  
  const isAfterHoursVenue = (types, stopTime) => {
    const category = getVenueCategory(types);
    const lateCategories = ['drinks', 'nightlife'];
    
    // Parse time
    let hour = 18;
    if (stopTime) {
      const match = stopTime.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (match) {
        hour = parseInt(match[1]);
        if (match[3]?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      }
    }
    
    return lateCategories.includes(category) || hour >= 22;
  };

  // =====================================================
  // 📍 DISTANCE & TRAVEL TIME
  // =====================================================
  
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getTravelInfo = (fromStop, toStop) => {
    if (!fromStop?.place?.geometry?.location || !toStop?.place?.geometry?.location) {
      return null;
    }
    
    const from = fromStop.place.geometry.location;
    const to = toStop.place.geometry.location;
    const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
    
    // Estimate times (rough estimates)
    const walkingTime = Math.round(distance / 5 * 60); // 5 km/h walking
    const drivingTime = Math.round(distance / 30 * 60); // 30 km/h city driving
    
    return {
      distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
      walking: walkingTime,
      driving: drivingTime,
      recommendation: distance < 0.8 ? 'walk' : distance < 3 ? 'walk or drive' : 'drive'
    };
  };

  // =====================================================
  // 🍽️ VIBE & TIPS BASED ON VENUE TYPE
  // =====================================================
  
  const getVenueTips = (types, name, category) => {
    const cuisine = getCuisineType(types, name);
    const cat = category || getVenueCategory(types);
    
    const tips = {
      'food': {
        vibe: 'Great for conversation',
        tip: cuisine ? `Known for ${cuisine} cuisine` : 'Explore the menu together',
        suggestion: '💡 Ask for their most popular dish!'
      },
      'cafe': {
        vibe: 'Cozy & intimate',
        tip: 'Perfect for deep conversations',
        suggestion: '💡 Try their specialty drink'
      },
      'drinks': {
        vibe: 'Fun & social',
        tip: 'Great cocktail spot',
        suggestion: '💡 Ask the bartender for recommendations'
      },
      'nightlife': {
        vibe: 'Energetic & exciting',
        tip: 'Let loose and have fun!',
        suggestion: '💡 Arrive before 11pm to skip the line'
      },
      'entertainment': {
        vibe: 'Fun & memorable',
        tip: 'Create shared experiences',
        suggestion: '💡 Take photos together!'
      },
      'activity': {
        vibe: 'Active & playful',
        tip: 'Bond through shared activity',
        suggestion: '💡 A little competition is fun!'
      },
      'outdoor': {
        vibe: 'Relaxed & romantic',
        tip: 'Enjoy the atmosphere',
        suggestion: '💡 Find a scenic spot'
      },
      'other': {
        vibe: 'Unique experience',
        tip: 'Go with the flow',
        suggestion: '💡 Be open to surprises'
      }
    };
    
    return tips[cat] || tips['other'];
  };

  // =====================================================
  // ⏰ SMART TIMING TIPS
  // =====================================================
  
  const getTimingTip = (types, stopTime) => {
    const category = getVenueCategory(types);
    
    let hour = 18;
    if (stopTime) {
      const match = stopTime.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (match) {
        hour = parseInt(match[1]);
        if (match[3]?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      }
    }
    
    // Category-specific timing tips
    if (category === 'food') {
      if (hour >= 11 && hour <= 13) return '🕐 Lunch rush - may need to wait';
      if (hour >= 18 && hour <= 20) return '🕐 Peak dinner time - reservation helps';
      if (hour >= 14 && hour <= 17) return '🕐 Off-peak - quick seating likely';
      if (hour >= 21) return '🕐 Late seating - check kitchen hours';
    }
    if (category === 'cafe') {
      if (hour >= 7 && hour <= 9) return '🕐 Morning rush - grab a table fast';
      if (hour >= 14 && hour <= 16) return '🕐 Afternoon lull - plenty of seats';
    }
    if (category === 'drinks') {
      if (hour >= 17 && hour <= 19) return '🍸 Happy hour likely - check for deals!';
      if (hour >= 21) return '🕐 Getting lively - great energy!';
    }
    if (category === 'nightlife') {
      if (hour < 22) return '🕐 Early - beat the crowds';
      if (hour >= 22 && hour <= 24) return '🕐 Prime time - expect lines';
    }
    if (category === 'outdoor') {
      if (hour >= 16 && hour <= 19) return '🌅 Golden hour - beautiful lighting!';
    }
    
    return null;
  };

  // =====================================================
  // 🎰 WILDCARD CHALLENGES (50+)
  // =====================================================
  
  const wildcardChallenges = [
    { text: "Take a selfie together", points: 25, emoji: "📸", category: "easy" },
    { text: "Give a genuine compliment to staff", points: 30, emoji: "💬", category: "easy" },
    { text: "Try something new from the menu", points: 35, emoji: "🍽️", category: "easy" },
    { text: "Share your favorite memory together", points: 30, emoji: "💭", category: "romance" },
    { text: "No phones for 30 minutes", points: 50, emoji: "📵", category: "challenge" },
    { text: "Take a photo with a stranger", points: 45, emoji: "🤳", category: "bold" },
    { text: "Learn something new about each other", points: 25, emoji: "🎓", category: "romance" },
    { text: "Plan your next adventure together", points: 30, emoji: "🗺️", category: "romance" },
    { text: "Speak in accents for 5 minutes", points: 40, emoji: "🎭", category: "fun" },
    { text: "Feed each other a bite", points: 35, emoji: "🥄", category: "romance" },
    { text: "Make each other laugh for 1 minute", points: 25, emoji: "😂", category: "fun" },
    { text: "Describe your partner in 3 words", points: 20, emoji: "💕", category: "romance" },
    { text: "Share an embarrassing story", points: 35, emoji: "😳", category: "fun" },
    { text: "Do a mini photoshoot together", points: 30, emoji: "📷", category: "easy" },
    { text: "Rate this spot 1-10 together", points: 20, emoji: "⭐", category: "easy" },
    { text: "Come up with a couple nickname", points: 35, emoji: "👫", category: "romance" },
    { text: "Toast to something specific", points: 25, emoji: "🥂", category: "easy" },
    { text: "Swap seats/positions", points: 15, emoji: "🔄", category: "easy" },
    { text: "Hold hands for 5 minutes straight", points: 30, emoji: "🤝", category: "romance" },
    { text: "Share your dream vacation", points: 25, emoji: "✈️", category: "romance" },
    { text: "Do rock-paper-scissors for the bill", points: 35, emoji: "✊", category: "fun" },
    { text: "Compliment something specific", points: 20, emoji: "💝", category: "romance" },
    { text: "Try the most unusual menu item", points: 45, emoji: "🎲", category: "bold" },
    { text: "Ask for the chef's recommendation", points: 30, emoji: "👨‍🍳", category: "easy" },
    { text: "Leave a generous tip", points: 40, emoji: "💵", category: "kind" },
  ];

  // =====================================================
  // 💬 CONVERSATION CARDS (50+ with categories)
  // =====================================================
  
  const conversationCards = {
    deep: [
      "What's a dream you've never told anyone?",
      "What's the best advice you've ever received?",
      "What does your ideal life look like in 10 years?",
      "What's something you're proud of but don't talk about?",
      "What fear have you overcome?",
      "What would you do if you couldn't fail?",
      "What's shaped who you are today?",
      "What do you value most in a relationship?",
      "What's a turning point in your life?",
      "What legacy do you want to leave?",
    ],
    funny: [
      "What's your most embarrassing moment?",
      "What's the weirdest food combo you enjoy?",
      "What's a skill you wish you had but would be useless?",
      "What's the funniest thing you believed as a kid?",
      "What would be your talent in a talent show?",
      "If animals could talk, which would be rudest?",
      "What's your guilty pleasure TV show?",
      "What's the worst fashion choice you've made?",
      "If you were a superhero, what useless power would you have?",
      "What's your go-to karaoke song?",
    ],
    flirty: [
      "What did you first notice about me?",
      "What's something that always makes you smile?",
      "What's your idea of a perfect date?",
      "What's the most romantic thing someone's done for you?",
      "Where would you love to wake up tomorrow?",
      "What makes you feel loved?",
      "What's a memory of us you replay in your head?",
      "What's something you find irresistible?",
      "If we could be anywhere right now, where?",
      "What do you love most about us?",
    ],
    gettingToKnow: [
      "What's your favorite way to spend a Sunday?",
      "What's on your bucket list?",
      "What's a hobby you'd love to try?",
      "What's your comfort food?",
      "Morning person or night owl?",
      "What's the last thing that made you really happy?",
      "What's your love language?",
      "Beach vacation or mountain adventure?",
      "What song is stuck in your head right now?",
      "What's a small thing that brings you joy?",
    ],
    wouldYouRather: [
      "Would you rather travel to the past or future?",
      "Would you rather have a chef or chauffeur?",
      "Would you rather be famous or rich (not both)?",
      "Would you rather never use social media or never watch shows?",
      "Would you rather have a home cinema or home gym?",
      "Would you rather speak all languages or play all instruments?",
      "Would you rather be too hot or too cold?",
      "Would you rather live by the ocean or in the mountains?",
      "Would you rather have unlimited flights or food?",
      "Would you rather lose your phone or wallet for a week?",
    ]
  };

  // =====================================================
  // 📊 CALCULATE TOTALS
  // =====================================================
  
  const totalStops = itinerary?.stops?.length || 0;
  const totalChallenges = itinerary?.stops?.reduce((acc, stop) => acc + (stop.challenges?.length || 0), 0) || 0;
  const potentialXP = 100 + (totalStops * 50) + (totalChallenges * 25);
  
  const calculateTotalBudget = () => {
    let min = 0, max = 0;
    itinerary?.stops?.forEach(stop => {
      const budget = getBudgetInfo(stop.place?.price_level, stop.place?.types, stop.place?.name);
      const estimate = budget.estimate;
      const match = estimate.match(/\$?(\d+)-?(\d+)?/);
      if (match) {
        min += parseInt(match[1]) || 0;
        max += parseInt(match[2] || match[1]) || 0;
      }
    });
    return { min: min * 2, max: max * 2 }; // For 2 people
  };
  const totalBudget = calculateTotalBudget();
  const dateTitle = getDateTitle();
  const dateTheme = getDateTheme();

  // =====================================================
  // 🎮 INTERACTIVE STATE
  // ⚠️ IMPORTANT: These useState calls have been REMOVED from here!
  // You must add them to the TOP of your DateMaker component,
  // with your other useState declarations.
  //
  // ADD THESE LINES near line 50-150 of DateMaker.js:
  //
  // const [earnedXP, setEarnedXP] = useState(0);
  // const [showConfetti, setShowConfetti] = useState(false);
  // const [activeWildcard, setActiveWildcard] = useState(null);
  // const [showConversation, setShowConversation] = useState(false);
  // const [currentConversation, setCurrentConversation] = useState('');
  // const [conversationCategory, setConversationCategory] = useState('deep');
  // const [completedStages, setCompletedStages] = useState([]);
  // const [comboCount, setComboCount] = useState(0);
  // const [lastChallengeTime, setLastChallengeTime] = useState(null);
  // const [expandedTips, setExpandedTips] = useState({});
  //
  // =====================================================

  // Confetti trigger
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  // Random wildcard
  const getRandomWildcard = () => {
    const randomIndex = Math.floor(Math.random() * wildcardChallenges.length);
    setActiveWildcard(wildcardChallenges[randomIndex]);
  };

  // Random conversation by category
  const getConversationStarter = (category = null) => {
    const cat = category || conversationCategory;
    const cards = conversationCards[cat];
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentConversation(cards[randomIndex]);
    setConversationCategory(cat);
    setShowConversation(true);
  };

  // Challenge with combo
  const handleChallengeWithCombo = (stopIndex, challengeId) => {
    const now = Date.now();
    let multiplier = 1;
    
    if (lastChallengeTime && (now - lastChallengeTime) < 30000) {
      setComboCount(prev => Math.min(prev + 1, 5));
      multiplier = 1 + (comboCount * 0.25);
    } else {
      setComboCount(1);
    }
    
    setLastChallengeTime(now);
    triggerConfetti();
    handleCompleteChallenge(stopIndex, challengeId);
    
    const challenge = itinerary.stops[stopIndex]?.challenges?.find(c => c.id === challengeId);
    if (challenge) {
      const bonusXP = Math.round(challenge.points * multiplier);
      setEarnedXP(prev => prev + bonusXP);
    }
  };

  // Mark stage complete
  const markStageComplete = (index) => {
    if (!completedStages.includes(index)) {
      setCompletedStages([...completedStages, index]);
      setEarnedXP(prev => prev + 50);
      triggerConfetti();
    }
  };

  // Toggle tips expanded
  const toggleTips = (index) => {
    setExpandedTips(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      <div ref={resultsTopRef} style={{ position: 'absolute', top: 0, left: 0, height: '1px', width: '1px' }} />
      
      {/* 🎨 STYLES */}
      <style>{`
        @keyframes questGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 4px 35px rgba(168, 85, 247, 0.6); }
        }
        @keyframes shimmerGold {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes xpPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(255,215,0,0.5); }
          50% { box-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.6); }
        }
        .adventure-card { transition: all 0.3s ease; }
        .adventure-card:hover { transform: translateY(-2px); }
        .xp-badge {
          background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700);
          background-size: 200% auto;
          animation: shimmerGold 3s linear infinite;
        }
        .glow-card { animation: questGlow 3s ease-in-out infinite; }
        .confetti-piece {
          position: fixed;
          width: 10px;
          height: 10px;
          animation: confettiFall 3s linear forwards;
          z-index: 10001;
        }
        .wildcard-btn { animation: float 3s ease-in-out infinite; }
        .combo-badge { animation: glow 1s ease-in-out infinite; }
        .xp-counter { animation: xpPop 0.5s ease-out; }
        .tip-card { transition: max-height 0.3s ease, padding 0.3s ease; overflow: hidden; }
        html, body, #root { background: #0f0f23 !important; }
      `}</style>

      {/* 🎊 CONFETTI - Uses selected confetti style */}
      {showConfetti && (() => {
        // Confetti color schemes
        const confettiStyles = {
          classic: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#a855f7', '#ec4899'],
          hearts: ['#ff6b6b', '#ee5a5a', '#ff8787', '#ffa8a8', '#ffc9c9', '#ec4899', '#f472b6'],
          stars: ['#fbbf24', '#f59e0b', '#fcd34d', '#fde68a', '#fef3c7', '#fbbf24', '#d97706'],
          sparkle: ['#a855f7', '#8b5cf6', '#c084fc', '#d8b4fe', '#e9d5ff', '#ec4899', '#f472b6'],
          gold: ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#fcd34d', '#fde68a', '#fef3c7']
        };
        const selectedStyle = userPurchases?.selectedConfetti || 'classic';
        const colors = confettiStyles[selectedStyle] || confettiStyles.classic;
        
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10000, overflow: 'hidden' }}>
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  background: colors[Math.floor(Math.random() * colors.length)],
                  borderRadius: selectedStyle === 'hearts' ? '50% 50% 0 50%' : selectedStyle === 'stars' ? '2px' : Math.random() > 0.5 ? '50%' : '2px',
                  width: `${6 + Math.random() * 8}px`,
                  height: `${6 + Math.random() * 8}px`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  transform: selectedStyle === 'hearts' ? 'rotate(-45deg)' : 'none'
                }}
              />
            ))}
          </div>
        );
      })()}

      {/* 🎰 WILDCARD MODAL */}
      {activeWildcard && (
        <div 
          onClick={() => setActiveWildcard(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '24px', padding: '2rem', maxWidth: '350px', width: '100%',
              textAlign: 'center', border: '2px solid rgba(255,215,0,0.5)',
              boxShadow: '0 0 60px rgba(255,215,0,0.3)'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce 1s infinite' }}>
              {activeWildcard.emoji}
            </div>
            <h3 style={{ color: '#FFD700', fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              ⚡ WILDCARD CHALLENGE!
            </h3>
            <p style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {activeWildcard.text}
            </p>
            <div className="xp-badge" style={{ display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '9999px', marginBottom: '1.5rem' }}>
              <span style={{ color: '#1a1a2e', fontWeight: '900', fontSize: '1.25rem' }}>+{activeWildcard.points} BONUS XP</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setEarnedXP(prev => prev + activeWildcard.points); triggerConfetti(); setActiveWildcard(null); }}
                style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '700', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✓ Completed!
              </button>
              <button
                onClick={() => setActiveWildcard(null)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: '700', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '1rem' }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💬 CONVERSATION MODAL */}
      {showConversation && (
        <div 
          onClick={() => setShowConversation(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '24px', padding: '2rem', maxWidth: '380px', width: '100%',
              textAlign: 'center', border: '2px solid rgba(236,72,153,0.5)',
              boxShadow: '0 0 60px rgba(236,72,153,0.3)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            
            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              {Object.keys(conversationCards).map(cat => (
                <button
                  key={cat}
                  onClick={() => getConversationStarter(cat)}
                  style={{
                    background: conversationCategory === cat ? 'linear-gradient(135deg, #ec4899, #a855f7)' : 'rgba(255,255,255,0.1)',
                    border: 'none', borderRadius: '9999px', padding: '0.4rem 0.8rem',
                    color: 'white', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {cat === 'gettingToKnow' ? 'Getting to Know' : cat === 'wouldYouRather' ? 'Would You Rather' : cat}
                </button>
              ))}
            </div>
            
            <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', lineHeight: 1.5, fontStyle: 'italic', minHeight: '60px' }}>
              "{currentConversation}"
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => getConversationStarter()}
                style={{ flex: 1, background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: 'white', fontWeight: '700', padding: '1rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                🔄 Another
              </button>
              <button
                onClick={() => setShowConversation(false)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: '700', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MAIN CONTAINER */}
      <div style={{ 
        minHeight: '100vh', minHeight: '100dvh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #0f0f23 100%)', 
        padding: '1rem', 
        paddingTop: 'calc(1rem + env(safe-area-inset-top))',
        paddingBottom: 'calc(160px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* 🏔️ HEADER */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.15) 100%)',
            borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'
          }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowResults(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '0.6rem 1.25rem', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ← {t('back')}
              </button>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    HapticService.tapLight();
                    handleGenerateDate(true);
                  }}
                  disabled={searchLoading}
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '12px', padding: '0.6rem 1.25rem', color: 'white', fontWeight: '600', cursor: searchLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: searchLoading ? 0.6 : 1, fontSize: '0.9rem' }}
                >
                  <RefreshCw size={16} />
                  {t('refresh')}
                </button>
                <button 
                  onClick={handleSaveItinerary}
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', padding: '0.6rem 1.25rem', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                >
                  <BookmarkPlus size={16} />
                  {t('save')}
                </button>
              </div>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {/* Date Theme Badge */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: `${dateTheme.color}30`, padding: '0.35rem 0.9rem', borderRadius: '9999px',
                  border: `1px solid ${dateTheme.color}50`
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{dateTheme.emoji}</span>
                  <span style={{ color: dateTheme.color, fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {dateTheme.name}
                  </span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: 'rgba(255,215,0,0.2)', padding: '0.35rem 0.9rem', borderRadius: '9999px'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{dateTitle.emoji}</span>
                  <span style={{ color: '#FFD700', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {dateTitle.title}
                  </span>
                </div>
              </div>
              
              <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '900', color: 'white', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                {location || 'Your Adventure'} ✨
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', margin: 0 }}>
                {itinerary.startTime} → {itinerary.endTime} • {itinerary.totalDuration}
              </p>
            </div>

            {/* Live XP Counter */}
            {earnedXP > 0 && (
              <div className="xp-counter" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <div className="combo-badge" style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,165,0,0.3))',
                  border: '2px solid #FFD700', borderRadius: '9999px', padding: '0.5rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>⚡</span>
                  <span style={{ color: '#FFD700', fontWeight: '900', fontSize: '1.25rem' }}>{earnedXP} XP</span>
                  {comboCount > 1 && (
                    <span style={{ background: '#ef4444', color: 'white', fontWeight: '800', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>
                      {comboCount}x COMBO!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '0.75rem 0.5rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <p style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>💰</p>
                <p style={{ color: '#10b981', fontWeight: '800', fontSize: '0.75rem', margin: 0 }}>${totalBudget.min}-{totalBudget.max}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', margin: 0 }}>Est. Total</p>
              </div>
              <div style={{ background: 'rgba(236, 72, 153, 0.15)', borderRadius: '12px', padding: '0.75rem 0.5rem', textAlign: 'center', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                <p style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>🎯</p>
                <p style={{ color: '#ec4899', fontWeight: '800', fontSize: '0.75rem', margin: 0 }}>{totalStops} Stops</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', margin: 0 }}>Stages</p>
              </div>
              <div style={{ background: 'rgba(249, 115, 22, 0.15)', borderRadius: '12px', padding: '0.75rem 0.5rem', textAlign: 'center', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                <p style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>🔥</p>
                <p style={{ color: '#f97316', fontWeight: '800', fontSize: '0.75rem', margin: 0 }}>{totalChallenges}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', margin: 0 }}>Missions</p>
              </div>
              <div style={{ background: 'rgba(255, 215, 0, 0.15)', borderRadius: '12px', padding: '0.75rem 0.5rem', textAlign: 'center', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                <p style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>⚡</p>
                <p style={{ color: '#FFD700', fontWeight: '800', fontSize: '0.75rem', margin: 0 }}>{potentialXP} XP</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', margin: 0 }}>Potential</p>
              </div>
            </div>

            {/* Interactive Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={getRandomWildcard}
                className="wildcard-btn"
                style={{ flex: 1, minWidth: '140px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', padding: '0.75rem', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
              >
                🎰 Wildcard
              </button>
              <button
                onClick={() => getConversationStarter()}
                style={{ flex: 1, minWidth: '140px', background: 'linear-gradient(135deg, #ec4899, #a855f7)', border: 'none', borderRadius: '12px', padding: '0.75rem', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
              >
                💬 Talk Prompt
              </button>
            </div>
            
            {/* 🍷 Sip & Spill Partner */}
            <button className="neon-glow-pink" 
              onClick={() => window.open('https://www.sipandspill.co.uk/gamedeck', '_blank')}
              style={{ 
                width: '100%',
                padding: '1rem',
                marginTop: '0.75rem',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
                border: '2px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>🍷</span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>Play Sip & Spill</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                    color: 'white',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.6rem',
                    fontWeight: '700'
                  }}>⭐ PARTNER</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
                  Couples drinking games for your date! 🔥
                </p>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.25rem' }}>→</span>
            </button>
          </div>

          {/* 🎯 STAGE CARDS */}
          {itinerary.stops.map((stop, index) => {
            const category = getVenueCategory(stop.place?.types);
            const busyness = estimateBusyness(stop.time, stop.place?.types, index);
            const budgetInfo = getBudgetInfo(stop.place?.price_level, stop.place?.types, stop.place?.name);
            const dressCode = getDressCode(stop.place?.types, stop.place?.price_level);
            const isLateNight = isAfterHoursVenue(stop.place?.types, stop.time);
            const venueTips = getVenueTips(stop.place?.types, stop.place?.name, category);
            const timingTip = getTimingTip(stop.place?.types, stop.time);
            const placePhoto = getPlacePhoto(stop.place);
            const placeholderColors = getPlaceholderImage(stop.place.name);
            const isFirstStop = index === 0;
            const isStageComplete = completedStages.includes(index);
            
            // Travel info to next stop
            const nextStop = itinerary.stops[index + 1];
            const travelInfo = nextStop ? getTravelInfo(stop, nextStop) : null;
            
            return (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <div 
                  className={`adventure-card ${isFirstStop && !isStageComplete ? 'glow-card' : ''}`}
                  style={{
                    background: isStageComplete ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))' : 'rgba(255,255,255,0.05)',
                    borderRadius: '20px', overflow: 'hidden',
                    border: isStageComplete ? '2px solid rgba(16,185,129,0.5)' : isFirstStop ? '2px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Stage Header */}
                  <div style={{
                    background: isStageComplete ? 'linear-gradient(135deg, rgba(16,185,129,0.4) 0%, rgba(5,150,105,0.3) 100%)' : 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(168,85,247,0.3) 100%)',
                    padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem'
                  }}>
                    {/* Stage Number */}
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: isStageComplete ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ec4899, #a855f7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: isStageComplete ? '0 4px 15px rgba(16,185,129,0.4)' : '0 4px 15px rgba(236,72,153,0.4)'
                    }}>
                      {isStageComplete ? <CheckCircle size={24} style={{ color: 'white' }} /> : <span style={{ color: 'white', fontWeight: '900', fontSize: '1.25rem' }}>{index + 1}</span>}
                    </div>

                    {/* Stage Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.5rem' }}>{stop.icon}</span>
                        <span style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem' }}>{stop.title}</span>
                        {isFirstStop && !isStageComplete && (
                          <span style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: 'white', fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '9999px', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>
                            Start Here
                          </span>
                        )}
                        {isLateNight && (
                          <span style={{ background: 'rgba(139,92,246,0.3)', color: '#a78bfa', fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                            🌙 Late Night
                          </span>
                        )}
                        {isStageComplete && (
                          <span style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '9999px', textTransform: 'uppercase' }}>
                            ✓ Complete
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                        <Clock size={14} />
                        <span>{stop.time} • {stop.duration}</span>
                      </div>
                    </div>

                    {/* XP Badge */}
                    <div className="xp-badge" style={{ padding: '0.4rem 0.75rem', borderRadius: '9999px', flexShrink: 0 }}>
                      <span style={{ color: '#1a1a2e', fontWeight: '800', fontSize: '0.8rem' }}>+{50 + (stop.challenges?.length || 0) * 25} XP</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.25rem' }}>
                    {/* Description */}
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>{stop.description}</p>

                    {/* Quick Info Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {/* Dress Code */}
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>{dressCode.emoji}</span>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '600' }}>{dressCode.code}</span>
                      </div>
                      {/* Vibe */}
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', padding: '0.35rem 0.75rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '600' }}>✨ {venueTips.vibe}</span>
                      </div>
                      {/* Timing Tip */}
                      {timingTip && (
                        <div style={{ background: 'rgba(59,130,246,0.2)', borderRadius: '9999px', padding: '0.35rem 0.75rem' }}>
                          <span style={{ color: '#1e4d3a', fontSize: '0.75rem', fontWeight: '600' }}>{timingTip}</span>
                        </div>
                      )}
                    </div>

                    {/* Venue Image */}
                    <div style={{ position: 'relative', height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${placeholderColors[0]}, ${placeholderColors[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'white', fontWeight: 'bold', position: 'absolute', zIndex: 1 }}>
                        {stop.place.name.charAt(0).toUpperCase()}
                      </div>
                      {placePhoto && (
                        <img src={placePhoto} alt={stop.place.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 2 }} onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                      {stop.place.rating && (
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.75rem', borderRadius: '9999px', zIndex: 10 }}>
                          <Star size={14} style={{ color: '#FFD700' }} fill="#FFD700" />
                          <span style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>{stop.place.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Venue Name & Location */}
                    <h4 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>{stop.place.name}</h4>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                      <MapPin size={14} style={{ color: '#ec4899' }} />
                      {stop.place.vicinity}
                    </p>

                    {/* Budget & Busyness Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      {/* Budget Card */}
                      <div style={{ background: `${budgetInfo.color}20`, borderRadius: '12px', padding: '0.85rem', border: `1px solid ${budgetInfo.color}40` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1rem' }}>💰</span>
                            <span style={{ color: budgetInfo.color, fontWeight: '700', fontSize: '0.85rem' }}>{budgetInfo.label}</span>
                          </div>
                          {!budgetInfo.isReal && (
                            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Est.</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '0.25rem' }}>
                          {[1,2,3,4].map(i => (
                            <span key={i} style={{ fontSize: '0.85rem', opacity: i <= budgetInfo.filled ? 1 : 0.25 }}>💰</span>
                          ))}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: 0 }}>{budgetInfo.estimate}/person</p>
                      </div>

                      {/* Busyness Card */}
                      <div style={{ background: `${busyness.level.color}20`, borderRadius: '12px', padding: '0.85rem', border: `1px solid ${busyness.level.color}40` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1rem' }}>{busyness.level.emoji}</span>
                            <span style={{ color: busyness.level.color, fontWeight: '700', fontSize: '0.85rem' }}>{busyness.level.label}</span>
                          </div>
                          <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Est.</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                          <div style={{ width: `${busyness.percentage}%`, height: '100%', background: busyness.level.color, borderRadius: '3px', transition: 'width 0.5s' }} />
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: 0 }}>~{busyness.percentage}% • Peak: {busyness.peakHours}</p>
                      </div>
                    </div>

                    {/* Expandable Tips */}
                    <button
                      onClick={() => toggleTips(index)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}
                    >
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>💡 Tips & Info</span>
                      <ChevronRight size={18} style={{ transform: expandedTips[index] ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                    </button>
                    
                    {expandedTips[index] && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>👔</span>
                            <div>
                              <p style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem', margin: '0 0 0.2rem 0' }}>{dressCode.code}</p>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>{dressCode.tip}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>✨</span>
                            <div>
                              <p style={{ color: 'white', fontWeight: '600', fontSize: '0.85rem', margin: '0 0 0.2rem 0' }}>{venueTips.vibe}</p>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>{venueTips.tip}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>💡</span>
                            <p style={{ color: '#fbbf24', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>{venueTips.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Map */}
                    <div 
                      onClick={() => openDirections(stop.place.geometry.location.lat, stop.place.geometry.location.lng)}
                      style={{ cursor: 'pointer', marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <img src={getStaticMapUrl(stop.place.geometry.location.lat, stop.place.geometry.location.lng)} alt="Map" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    </div>

                    {/* Missions */}
                    {stop.challenges && stop.challenges.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h5 style={{ color: '#f97316', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: '0 0 0.75rem 0' }}>
                          🎯 Missions
                          <span style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>+XP</span>
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {stop.challenges.map((challenge) => {
                            const isDone = completedChallenges.includes(challenge.id);
                            return (
                              <div key={challenge.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 1rem', background: isDone ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.15)', borderRadius: '12px', border: isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(249,115,22,0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{isDone ? '✅' : '🎯'}</span>
                                  <span style={{ color: isDone ? 'rgba(255,255,255,0.5)' : 'white', fontWeight: '600', fontSize: '0.9rem', textDecoration: isDone ? 'line-through' : 'none' }}>{challenge.text}</span>
                                </div>
                                <button onClick={() => handleChallengeWithCombo(index, challenge.id)} disabled={isDone} className="xp-badge" style={{ padding: '0.4rem 0.75rem', borderRadius: '9999px', border: 'none', cursor: isDone ? 'default' : 'pointer', fontWeight: '800', fontSize: '0.75rem', color: '#1a1a2e', opacity: isDone ? 0.5 : 1, flexShrink: 0 }}>
                                  {isDone ? '✓' : `+${challenge.points}`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button onClick={() => openDirections(stop.place.geometry.location.lat, stop.place.geometry.location.lng)} style={{ flex: 1, minWidth: '80px', background: 'linear-gradient(135deg, #ec4899, #d946ef)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <Navigation size={16} /> Go
                      </button>
                      <button onClick={() => handleSaveDate(stop.place)} disabled={isDateSaved(stop.place.place_id)} style={{ flex: 1, minWidth: '80px', background: isDateSaved(stop.place.place_id) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: '700', fontSize: '0.85rem', cursor: isDateSaved(stop.place.place_id) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', opacity: isDateSaved(stop.place.place_id) ? 0.5 : 1 }}>
                        {isDateSaved(stop.place.place_id) ? <><BookmarkCheck size={16} /> Saved</> : <><BookmarkPlus size={16} /> Save</>}
                      </button>
                      <button onClick={() => markStageComplete(index)} disabled={isStageComplete} style={{ flex: 1, minWidth: '80px', background: isStageComplete ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '12px', padding: '0.75rem', fontWeight: '700', fontSize: '0.85rem', cursor: isStageComplete ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <CheckCircle size={16} /> {isStageComplete ? 'Done!' : 'Done'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Travel Connector */}
                {travelInfo && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
                    <div style={{ width: '3px', height: '16px', background: completedStages.includes(index) ? 'linear-gradient(180deg, #10b981, #059669)' : 'repeating-linear-gradient(to bottom, rgba(236,72,153,0.5) 0px, rgba(236,72,153,0.5) 4px, transparent 4px, transparent 8px)', borderRadius: '2px' }} />
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '600' }}>📍 {travelInfo.distance}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                        {travelInfo.recommendation === 'walk' ? `🚶 ${travelInfo.walking} min walk` : travelInfo.recommendation === 'drive' ? `🚗 ~${travelInfo.driving} min drive` : `🚶 ${travelInfo.walking} min / 🚗 ${travelInfo.driving} min`}
                      </span>
                    </div>
                    <div style={{ width: '3px', height: '16px', background: completedStages.includes(index) ? 'linear-gradient(180deg, #10b981, #059669)' : 'repeating-linear-gradient(to bottom, rgba(236,72,153,0.5) 0px, rgba(236,72,153,0.5) 4px, transparent 4px, transparent 8px)', borderRadius: '2px' }} />
                    <ArrowRight size={20} style={{ color: completedStages.includes(index) ? '#10b981' : '#ec4899', transform: 'rotate(90deg)' }} />
                  </div>
                )}
              </div>
            );
          })}

          {/* 🏆 QUEST COMPLETE */}
          <div style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1))', borderRadius: '24px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,215,0,0.2)', marginTop: '1rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FFD700', margin: '0 0 0.5rem 0' }}>
              {completedStages.length === totalStops ? '🏆 Quest Complete!' : 'Quest in Progress...'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 1rem 0', fontSize: '0.95rem' }}>
              {completedStages.length === totalStops ? 'Amazing adventure! Save your memories!' : `${completedStages.length}/${totalStops} stages complete`}
            </p>
            <div className="xp-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '9999px' }}>
              <span style={{ fontSize: '1.25rem' }}>⚡</span>
              <span style={{ color: '#1a1a2e', fontWeight: '900', fontSize: '1.1rem' }}>{earnedXP} / {potentialXP} XP</span>
            </div>
          </div>

          {/* ✨ ALTERNATIVES */}
          {itinerary.alternatives && itinerary.alternatives.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: 'white', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <Sparkles size={20} style={{ color: '#a855f7' }} />
                {t('alternativeOptions')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                {itinerary.alternatives.slice(0, 6).map((place) => {
                  const placePhoto = getPlacePhoto(place);
                  const placeholderColors = getPlaceholderImage(place.name);
                  const altBudget = getBudgetInfo(place.price_level, place.types, place.name);
                  
                  return (
                    <div key={place.place_id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ position: 'relative', height: '90px' }}>
                        <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${placeholderColors[0]}, ${placeholderColors[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: 'white', fontWeight: 'bold', position: 'absolute' }}>
                          {place.name.charAt(0).toUpperCase()}
                        </div>
                        {placePhoto && <img src={placePhoto} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                        {place.rating && (
                          <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.15rem', background: 'rgba(0,0,0,0.75)', padding: '0.15rem 0.4rem', borderRadius: '9999px' }}>
                            <Star size={10} style={{ color: '#FFD700' }} fill="#FFD700" />
                            <span style={{ color: 'white', fontWeight: '700', fontSize: '0.7rem' }}>{place.rating}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '0.6rem' }}>
                        <h4 style={{ color: 'white', fontSize: '0.8rem', fontWeight: '700', margin: '0 0 0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.name}</h4>
                        <p style={{ color: altBudget.color, fontSize: '0.65rem', fontWeight: '600', margin: '0 0 0.4rem 0' }}>{altBudget.symbols} {altBudget.estimate}</p>
                        <button onClick={() => openDirections(place.geometry.location.lat, place.geometry.location.lng)} style={{ width: '100%', background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.4rem', fontWeight: '700', fontSize: '0.7rem', cursor: 'pointer' }}>
                          {t('directions')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 🎮 FLOATING BUTTONS */}
        <div style={{ position: 'fixed', bottom: 'calc(1.5rem + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.75rem', zIndex: 100 }}>
          <button onClick={() => createSurpriseFromItinerary(itinerary)} style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)', color: 'white', fontWeight: '800', fontSize: '0.95rem', padding: '1rem 1.5rem', borderRadius: '50px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(236,72,153,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift size={20} /> 🎁 Surprise
          </button>
          <button onClick={handleCompleteDateItinerary} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '800', fontSize: '0.95rem', padding: '1rem 1.5rem', borderRadius: '50px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(16,185,129,0.5)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} /> Complete
          </button>
        </div>
      </div>

      {/* MODALS - Keep your existing ones */}
      {showPointsNotification && pointsNotificationData && (
        <div style={{ position: 'fixed', top: '100px', right: '20px', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: 'white', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(255,215,0,0.5)', zIndex: 10000, animation: 'slideInRight 0.5s ease-out', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>⚡</div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, marginBottom: '0.25rem' }}>+{pointsNotificationData.points} XP</p>
            <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>{pointsNotificationData.message}</p>
          </div>
        </div>
      )}

      {showLevelUp && levelUpData && (
        <LevelUpModal oldLevel={levelUpData.oldLevel} newLevel={levelUpData.newLevel} onClose={() => { console.log('🚪 Level up closed'); setShowLevelUp(false); }} />
      )}

      {showScrapbook && (
        <DateMemoryScrapbook currentUser={user} mode={scrapbookMode} dateToSave={dateToSave} selectedMemory={selectedMemory} onClose={closeScrapbook} />
      )}

      {showShareModal && dateToShare ? (
        <ShareDateModal user={user} dateData={dateToShare} onClose={() => { setShowShareModal(false); setDateToShare(null); if (dateToShare.completedAt) { setShowResults(false); setItinerary(null); setPlaces([]); } }} />
      ) : null}

      {showSurpriseDate && (
        <SurpriseDateMode currentUser={user} mode={surpriseMode} activeSurprise={activeSurprise} prefilledItinerary={activeSurprise?.itinerary || null} onClose={closeSurpriseDate} />
      )}

      {showStreaks && (
        <DateStreaksGoals currentUser={user} streakData={userStreakData} onClose={closeStreaks} />
      )}
    </>
  );
}
  
  
  
  // Main input screen - REDESIGNED
return (
  <div style={{
    minHeight: '100vh',
    minHeight: '100dvh',
    width: '100%'
  }}>
    {/* 🎨 GLOBAL STYLES FOR ANIMATIONS */}
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
        50% { transform: translateY(-20px) rotate(10deg); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
        @keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
      @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.1); }
        50% { transform: scale(1); }
        75% { transform: scale(1.15); }
      }
      @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .hover-lift {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .hover-lift:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      }
      .image-card {
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
      }
      .image-card:hover {
        transform: scale(1.08) rotate(2deg);
        z-index: 10;
      }
      .image-card:hover img {
        filter: brightness(1.1) saturate(1.2);
      }
      .glow-button {
        position: relative;
        overflow: hidden;
      }
      .glow-button::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          45deg,
          transparent,
          rgba(255,255,255,0.1),
          transparent
        );
        transform: rotate(45deg);
        animation: shimmer 3s infinite;
      }
      html, body {
        scroll-behavior: auto !important;
      }
    `}</style>

    {/* 🌈 ANIMATED BACKGROUND */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: bgTheme.gradient,
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite',
      zIndex: -2
    }} />

    {/* ✨ FLOATING HEARTS */}
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${1 + Math.random() * 2}rem`,
            animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.3 + Math.random() * 0.4,
            filter: 'blur(1px)'
          }}
        >
          {['💕', '🥂', '💖', '🍾', '🌟','🍷', '🍺', '🍝', '🍣', '🍸', '🥘' ][Math.floor(Math.random() * 11)]}
        </div>
      ))}
    </div>

    {/* 📱 HEADER - Glassmorphism style */}
<div style={{ 
  position: 'relative', 
  background: 'rgba(255,255,255,0.1)', 
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  padding: '1rem', 
  paddingTop: 'calc(1rem + env(safe-area-inset-top))',
  zIndex: 100,
  width: '100%',
  boxSizing: 'border-box'
}}>
  <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Logo with heartbeat animation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '200px' }}>
          <Heart 
            style={{ 
              color: '#ff6b9d', 
              animation: 'heartBeat 2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 10px rgba(255,107,157,0.5))'
            }} 
            size={36} 
            fill="#ff6b9d" 
          />
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '800', 
            color: 'white', 
            margin: 0, 
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em'
          }}>
            DateMaker
          </h1>
          {user && (
  <div style={{ 
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    marginLeft: '0.75rem',
    border: '1px solid rgba(255,255,255,0.15)'
  }}>
    <span style={{ 
      fontSize: '0.95rem', 
      color: 'white',
      fontWeight: '600',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
    }}>
      {HumanCopy.getShortGreeting()}
    </span>
  </div>
)}

        </div>
        
        {/* XP Bar */}
        {gameStats && (
          <div style={{ 
            flex: '1 1 auto', 
            maxWidth: '400px', 
            minWidth: '250px',
            order: window.innerWidth < 768 ? 3 : 2
          }}>
            <XPBar 
              level={calculateLevel(gameStats.xp || 0)}
              progress={getProgressToNextLevel(gameStats.xp || 0)}
              xp={gameStats.xp || 0}
              onClick={() => navigate('/stats')}
            />
          </div>
        )}
        
        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', order: 2 }}>
          <LanguageSelector 
            currentLanguage={language} 
            onLanguageChange={handleLanguageChange} 
          />
          
{/* Social Button - Next to hamburger menu */}
{!isGuestMode && (
  <button
    onClick={() => {
      if (subscriptionStatus === 'free') {
        setShowPremiumModal(true);
      } else {
        setShowSocial(true);
      }
    }}
    style={{
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'relative',
      boxShadow: '0 2px 10px rgba(236, 72, 153, 0.3)'
    }}
  >
    <Users size={22} color="white" />
    {notificationCounts.total > 0 && (
      <span style={{
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        minWidth: '18px',
        height: '18px',
        borderRadius: '9px',
        background: '#ef4444',
        color: 'white',
        fontSize: '0.65rem',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px'
      }}>
        {notificationCounts.total > 99 ? '99+' : notificationCounts.total}
      </span>
    )}
  </button>
)}
          <HamburgerMenu
  user={user}
  subscriptionStatus={subscriptionStatus}
  savedDatesCount={Math.max(0, savedDates.length - lastViewedSavedCount)}
  notificationCount={notificationCounts.total}
  surpriseCount={surpriseCount}
  isGuestMode={isGuestMode}
  bgTheme={bgTheme}
  profilePhoto={profilePhoto}
  // 🆕 Phase 3 props
  completedChallenges={completedChallenges}
  mysteryBonusActive={mysteryBonusActive}
  currentStreak={gameStats?.currentStreak || 0}
            onNavigate={(destination) => {
  if (destination === 'spin') { setShowSpinningWheel(true); trackAction(ACTION_TYPES.SPIN_WHEEL); }
  if (destination === 'invite') setShowInviteFriends(true);
  if (destination === 'stats') navigate('/stats');
  if (destination === 'achievements') navigate('/achievements');
  if (destination === 'challenges') {
    if (subscriptionStatus === 'free') {
      setShowPremiumModal(true);
    } else {
      setShowDailyChallenges(true);
    }
  }
  if (destination === 'recap') {
    if (subscriptionStatus === 'free') {
      setShowPremiumModal(true);
    } else {
      setShowMonthlyRecap(true);
    }
  }
  if (destination === 'notifications') {
    setShowNotificationSettings(true);
  }
  if (destination === 'social') {
    if (subscriptionStatus === 'free') {
      alert('Social is a premium feature!');
      setShowPremiumModal(true);
    } else {
      setShowSocial(true);
    }
  }
  if (destination === 'saved') handleOpenSaved();
  if (destination === 'scrapbook') openScrapbookMemories();
  if (destination === 'surprise') openSurpriseDateTracker();
  if (destination === 'streaks') openStreaksGoals();
  if (destination === 'profile') { setShowProfile(true); trackAction(ACTION_TYPES.VIEW_PROFILE); }
}}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </div>

    {/* 🎯 MAIN CONTENT */}
<div style={{ 
  maxWidth: '1100px', 
  margin: '0 auto', 
  padding: '2rem 1.5rem', 
  paddingBottom: '4rem',
  position: 'relative',
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden'
}}>
      
      {/* 🚀 HERO SECTION - Punchy & Bold */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        {/* Small tag line */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,107,157,0.2)',
          border: '1px solid rgba(255,107,157,0.3)',
          borderRadius: '9999px',
          padding: '0.5rem 1.25rem',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} style={{ color: '#ff6b9d' }} />
          <span style={{ color: bgTheme.accent , fontWeight: '600', fontSize: '0.9rem' }}>
  {t('heroSubtitle')}
</span>
        </div>

        {/* Main headline - BIG and BOLD */}
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
          fontWeight: '900', 
          lineHeight: '1.05',
          marginBottom: '1.5rem',
          letterSpacing: '-0.03em'
        }}>
          <span style={{ 
  display: 'block',
  color: '#1f2937'
}}>
 {t('heroTitle1')}
</span>
<span style={{ 
  display: 'block',
  background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #ff6b9d 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'shimmer 3s linear infinite'
}}>
  {t('heroTitle2')}
</span>
        </h1>

        {/* Subheadline */}
        <p style={{ 
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', 
          color: 'rgba(0,0,0,0.6)',
          maxWidth: '600px', 
          margin: '0 auto 2rem',
          lineHeight: '1.6'
        }}>
          {t('heroDescription')}
        </p>

        {/* 📊 SOCIAL PROOF */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '900', 
              color: bgTheme.accent,
              lineHeight: 1
            }}>
              10K+
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)' }}>
              {t('datesCreated')}
            </div>
          </div>
          <div style={{ 
            width: '1px', 
            background: 'rgba(0,0,0,0.15)',
            alignSelf: 'stretch'
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
  fontSize: '2rem', 
  fontWeight: '900', 
  color: bgTheme.accent,
  lineHeight: 1
}}>
  {t('allCities')}
</div>
<div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.5)' }}>
  {t('citiesCovered')}
</div>
          </div>
        </div>
      </div>

      {/* 🖼️ IMAGE SHOWCASE - Interactive Grid */}
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(6, 1fr)',
  width: '100%',
  boxSizing: 'border-box',
        gridTemplateRows: 'repeat(2, 140px)',
        gap: '1rem',
        marginBottom: '3rem',
        animation: 'fadeInUp 0.8s ease-out',
        animationDelay: '0.2s',
        animationFillMode: 'both'
      }}>
        {/* Large featured image */}
        <div className="image-card" style={{ 
          gridColumn: 'span 2',
          gridRow: 'span 2',
          borderRadius: '20px', 
          overflow: 'hidden', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          position: 'relative'
        }}>
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" alt="Fine Dining" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1.5rem',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
          }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>🍽️ {t('fineDining')}</span>
          </div>
        </div>

        {/* Other images */}
        <div className="image-card" style={{ 
          gridColumn: 'span 2',
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          position: 'relative'
        }}>
          <img src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80" alt="Cocktails" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
          }}>
            <span style={{ color: 'white', fontWeight: '600' }}>🍸 {t('cocktailsLabel')}</span>
          </div>
        </div>

        <div className="image-card" style={{ 
          gridColumn: 'span 2',
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          position: 'relative'
        }}>
          <img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80" alt="Nightlife" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
          }}>
            <span style={{ color: 'white', fontWeight: '600' }}>🎉 {t('nightlife')}</span>
          </div>
        </div>

        <div className="image-card" style={{ 
          gridColumn: 'span 2',
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          position: 'relative'
        }}>
          <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80" alt="Movies" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
          }}>
            <span style={{ color: 'white', fontWeight: '600' }}>🎬 {t('movies')}</span>
          </div>
        </div>

        <div className="image-card" style={{ 
          gridColumn: 'span 2',
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          position: 'relative'
        }}>
          <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80" alt="Adventure" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s' }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
          }}>
            <span style={{ color: 'white', fontWeight: '600' }}>🏔️ {t('adventure')}</span>
          </div>
        </div>
      </div>

      {/* 💎 PREMIUM BANNER - For free users */}
      {subscriptionStatus === 'free' && (
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,157,0.2) 0%, rgba(196,69,105,0.2) 100%)',
            border: '1px solid rgba(255,107,157,0.3)',
            backdropFilter: 'blur(10px)',
            padding: '2rem',
            borderRadius: '24px',
            marginBottom: '2rem',
            textAlign: 'center',
            animation: 'fadeInUp 0.8s ease-out',
            animationDelay: '0.4s',
            animationFillMode: 'both'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            {Capacitor.isNativePlatform() ? t('unlockPremium') : t('startFreeTrial')}
          </h3>
          
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
            fontSize: '1rem'
          }}>
            
          </p>
          
          <button 
            onClick={() => {
              if (user?.email) {
                localStorage.setItem('datemaker_prefill_email', user.email);
              }
              if (Capacitor.isNativePlatform()) {
                setShowPremiumModal(true);
              } else {
                setShowSubscriptionModal(true);
              }
            }}
            className="glow-button"
            style={{ 
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
              color: 'white', 
              fontWeight: '700', 
              padding: '1rem 2.5rem', 
              borderRadius: '9999px', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '1.1rem',
              boxShadow: '0 8px 30px rgba(255,107,157,0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(255,107,157,0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 30px rgba(255,107,157,0.4)';
            }}
          >
            {Capacitor.isNativePlatform() ? t('getPremium') : t('startTrialButton')}
          </button>
        </div>
      )}

      {/* 🎯 DATE MODE SELECTOR - New Features */}
      <DateModeSelector
        onSelectFreeDate={() => setShowFreeDateMode(true)}
        onSelectLongDistance={() => setShowLongDistanceMode(true)}
        onSelectMusic={() => setShowMusicSelector(true)}
        onSelectShop={() => setShowShop(true)}
        isPremium={subscriptionStatus !== 'free'}
      />

      {/* 🍷 SIP & SPILL PARTNER BANNER */}
      <SipAndSpillBanner variant="full" />

      {/* 🏆 TOP VENUES OF THE WEEK */}
      <TopVenuesSection 
        onVenueClick={(venue) => console.log('Venue clicked:', venue)}
        onSeeAll={() => setShowVenuesExplorer(true)}
      />

      {/* 🎫 UPCOMING EVENTS (TICKETMASTER) */}
      <UpcomingEventsSection 
        ticketmasterApiKey={process.env.REACT_APP_TICKETMASTER_KEY}
        onEventClick={(event) => window.open(event.url, '_blank')}
        onSeeAll={() => setShowEventsExplorer(true)}
      />

{/* 🎫 EVENTS EXPLORER */}
      {showEventsExplorer && (
        <EventsExplorer 
          onClose={() => setShowEventsExplorer(false)}
          ticketmasterApiKey={process.env.REACT_APP_TICKETMASTER_KEY}
        />
      )}

      {/* 🏆 VENUES EXPLORER */}
      {showVenuesExplorer && (
        <VenuesExplorer 
          onClose={() => setShowVenuesExplorer(false)}
        />
      )}

      {/* 📝 MAIN FORM - Glassmorphism Card */}
      <div 
        className="hover-lift"
        style={{ 
          background: 'rgba(255,255,255,0.08)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '32px', 
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          padding: '2.5rem',
          animation: 'fadeInUp 0.8s ease-out',
          animationDelay: '0.6s',
          animationFillMode: 'both'
        }}
      >
        <h2 style={{ 
          fontSize: '1.75rem', 
          fontWeight: '800', 
          marginBottom: '2rem', 
          color: '#1e3a5f',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>💕</span>
{t('planYourDate')}
        </h2>
        
        {/* ⏰ TIME SECTION */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          background: 'rgba(59, 130, 246, 0.1)', 
          borderRadius: '20px', 
          border: '1px solid rgba(59, 130, 246, 0.2)' 
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '700', 
            color: '#1e4d3a', 
            marginBottom: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}>
            <Clock size={20} />
{t('whenHowLong')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                {t('startTime')}
              </label>
              <select 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  background: 'rgba(255,255,255,0.5)', 
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM'].map(time => (
                  <option key={time} value={time} style={{ background: '#1a1a2e', color: 'white' }}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                {t('duration')}
              </label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  background: 'rgba(255,255,255,0.5)', 
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
               {[2,3,4,5,6,7,8].map(h => (
  <option key={h} value={h} style={{ background: '#1a1a2e', color: 'white' }}>{h} {t('hours')}</option>
))}
              </select>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '0.75rem' }}>
            📅 {startTime} → {addHours(startTime, parseInt(duration))}
          </p>
        </div>
        
        {/* 📍 LOCATION */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '1.1rem', 
            fontWeight: '700', 
            color: '#1e3a5f', 
            marginBottom: '0.75rem' 
          }}>
            <MapPin style={{ color: bgTheme.accent }} size={20} />
{t('location')}
          </label>
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            placeholder={t('locationPlaceholder')}
            style={{ 
              width: '100%', 
              padding: '1rem 1.5rem', 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              outline: 'none', 
              boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.5)',
              color: '#1f2937',
              transition: 'all 0.3s ease'
            }} 
            onFocus={(e) => {
              e.target.style.border = '1px solid #ff6b9d';
              e.target.style.boxShadow = '0 0 20px rgba(255,107,157,0.2)';
            }} 
            onBlur={(e) => {
              e.target.style.border = '1px solid rgba(255,255,255,0.2)';
              e.target.style.boxShadow = 'none';
            }} 
          />
        </div>
        
        {/* ✨ ACTIVITIES INPUT */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '700', 
            color: '#1e3a5f', 
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={20} style={{ color: '#a855f7' }} />
{t('activities')}
          </h3>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" 
              value={customActivityInput} 
              onChange={(e) => setCustomActivityInput(e.target.value)} 
              onKeyPress={handleKeyPress} 
              placeholder={t('customActivityPlaceholder')}
              style={{ 
                flex: 1, 
                padding: '1rem 1.5rem', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '16px', 
                fontSize: '1rem', 
                outline: 'none', 
                boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.5)',
                color: '#1f2937',
                transition: 'all 0.3s ease'
              }} 
              onFocus={(e) => {
                e.target.style.border = '1px solid #a855f7';
                e.target.style.boxShadow = '0 0 20px rgba(168,85,247,0.2)';
              }} 
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button 
              onClick={handleAddCustomActivity} 
              style={{ 
                padding: '1rem 1.75rem', 
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)', 
                color: 'white', 
                fontWeight: '600', 
                borderRadius: '16px', 
                border: 'none', 
                cursor: 'pointer', 
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(168,85,247,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
  {t('add')}
</button>
          </div>
          
          {/* Activity Tags */}
          {customActivities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
              {customActivities.map((activity, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    padding: '0.75rem 1.25rem', 
                    borderRadius: '9999px', 
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                    color: 'white', 
                    fontWeight: '600', 
                    boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
                    animation: 'fadeInUp 0.3s ease-out'
                  }}
                >
                  {activity}
                  <button 
                    onClick={() => handleRemoveCustomActivity(activity)} 
                    style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: '22px', 
                      height: '22px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      color: 'white', 
                      fontWeight: 'bold', 
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 🎉 EVENTS TOGGLE */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '1rem 1.25rem', 
          background: 'rgba(16, 185, 129, 0.1)', 
          borderRadius: '16px', 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          marginBottom: '1.5rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => {
  HapticService.selectionChanged();
  setIncludeEvents(!includeEvents);
}}
        >
          <input 
            type="checkbox" 
            checked={includeEvents} 
            onChange={(e) => setIncludeEvents(e.target.checked)} 
            style={{ 
              width: '22px', 
              height: '22px', 
              cursor: 'pointer', 
              accentColor: '#10b981' 
            }} 
          />
          <label style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#34d399', 
            cursor: 'pointer', 
            userSelect: 'none', 
            margin: 0 
          }}>
            🎉 {t('includeEvents')}
          </label>
        </div>
        
        {/* Events Date Range (if enabled) */}
        {includeEvents && (
          <div style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            background: 'rgba(168, 85, 247, 0.1)', 
            borderRadius: '20px', 
            border: '1px solid rgba(168, 85, 247, 0.2)',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '700', 
              color: '#c084fc', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📅 {t('whenLookingForEvents')}
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: dateRange === 'custom' ? '1rem' : 0 }}>
              {[
  { value: 'anytime', label: t('anytime') },
  { value: 'today', label: t('today') },
  { value: 'thisweek', label: t('thisWeek') },
  { value: 'thismonth', label: t('thisMonth') },
  { value: 'custom', label: t('pickDate') }
].map(option => (
                <button 
                  key={option.value}
                  onClick={() => { 
  HapticService.selectionChanged();
  setDateRange(option.value); 
  if(option.value !== 'custom') setSelectedDate(''); 
}}
                  style={{ 
                    padding: '0.6rem 1.25rem', 
                    borderRadius: '9999px', 
                    fontWeight: '600', 
                    fontSize: '0.9rem',
                    border: dateRange === option.value ? 'none' : '1px solid rgba(168, 85, 247, 0.3)', 
                    background: dateRange === option.value ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent', 
                    color: dateRange === option.value ? 'white' : '#c084fc', 
                    cursor: 'pointer', 
                    transition: 'all 0.2s' 
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {dateRange === 'custom' && (
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} 
                style={{ 
                  width: '100%', 
                  padding: '0.875rem 1rem', 
                  border: '1px solid rgba(168, 85, 247, 0.3)', 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  outline: 'none', 
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white'
                }} 
              />
            )}
          </div>
        )}
        
        {/* ❌ ERROR MESSAGE */}
        {error && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem 1.5rem', 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '16px', 
            color: '#fca5a5', 
            fontWeight: '600', 
            textAlign: 'center' 
          }}>
            {error}
          </div>
        )}
        
        {/* 🚀 GENERATE BUTTON */}
        <button 
          onClick={() => {
            HapticService.tapMedium();
            handleGenerateDate(false);
          }}
          disabled={searchLoading} 
          className="glow-button"
          style={{ 
            width: '100%', 
            background: searchLoading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #a855f7 100%)', 
            color: 'white', 
            fontWeight: '800', 
            fontSize: '1.3rem', 
            padding: '1.25rem 2rem', 
            borderRadius: '16px', 
            border: 'none', 
            cursor: searchLoading ? 'not-allowed' : 'pointer', 
            boxShadow: searchLoading ? 'none' : '0 10px 40px rgba(255,107,157,0.4)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem',
            transition: 'all 0.3s ease',
            letterSpacing: '-0.01em'
          }}
          onMouseEnter={(e) => {
            if (!searchLoading) {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 50px rgba(255,107,157,0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = searchLoading ? 'none' : '0 10px 40px rgba(255,107,157,0.4)';
          }}
        >
          {searchLoading ? (
  <>
    <div style={{ 
      width: '24px', 
      height: '24px', 
      border: '3px solid rgba(255,255,255,0.3)', 
      borderTop: '3px solid white', 
      borderRadius: '50%', 
      animation: 'spin 1s linear infinite' 
    }} />
    {loadingMessage || t('creating')}
  </>
) : (
            <>
              <Sparkles size={24} />
{t('generateDate')}
            </>
          )}
        </button>
      </div>

      {/* 💬 TESTIMONIAL */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'rgba(255,255,255,0.6)',
        borderRadius: '24px',
        border: '1px solid rgba(0,0,0,0.1)',
        textAlign: 'center',
        animation: 'fadeInUp 0.8s ease-out',
        animationDelay: '0.8s',
        animationFillMode: 'both'
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>💕</div>
        <p style={{ 
          fontSize: '1.1rem', 
          color: 'rgba(0,0,0,0.7)', 
          fontStyle: 'italic',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 1rem'
        }}>
          "I used to spend 30 minutes deciding where to go. Now DateMaker does it in seconds and the suggestions are always perfect!"
        </p>
      </div>
    </div>

    {/* ==================== */}
    {/* MODALS (keep existing) */}
    {/* ==================== */}
    
    {showSubscriptionModal && (
      Capacitor.getPlatform() === 'ios' ? (
        <AppleSubscriptionModal 
          onClose={() => setShowSubscriptionModal(false)}
          onPurchaseSuccess={() => {
            if (user) {
              fetchUserData();
            }
          }}
        />
      ) : (
        <SubscriptionModal user={user} onClose={() => setShowSubscriptionModal(false)} />
      )
    )}

    {showShareModal && dateToShare ? (
      <ShareDateModal 
        user={user} 
        dateData={dateToShare} 
        onClose={() => {
          setShowShareModal(false);
          setDateToShare(null);
          if (dateToShare.completedAt) {
            setShowResults(false);
            setItinerary(null);
            setPlaces([]);
          }
        }} 
      />
    ) : null}
    
    {showPointsNotification && pointsNotificationData && (
      <div style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(255,215,0,0.5)',
        zIndex: 10000,
        animation: 'slideInRight 0.5s ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '2rem' }}>⚡</div>
        <div>
          <p style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, marginBottom: '0.25rem' }}>
            +{pointsNotificationData.points} XP
          </p>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
            {pointsNotificationData.message}
          </p>
        </div>
      </div>
    )}
    
    {showLevelUp && levelUpData && (
      <LevelUpModal 
        oldLevel={levelUpData.oldLevel}
        newLevel={levelUpData.newLevel}
        onClose={() => {
          setShowLevelUp(false);
        }}
      />
    )}

    {showSpinningWheel && (
      <SpinningWheel 
        onClose={() => setShowSpinningWheel(false)}
        onSelectActivity={handleWheelSelection}
        language={language}
      />
    )}

    {showScrapbook && (
      <DateMemoryScrapbook
        currentUser={user}
        mode={scrapbookMode}
        dateToSave={dateToSave}
        selectedMemory={selectedMemory}
        onClose={closeScrapbook}
      />
    )}

    {showSurpriseDate && (
      <SurpriseDateMode
        currentUser={user}
        mode={surpriseMode}
        activeSurprise={activeSurprise}
        onClose={closeSurpriseDate}
      />
    )}

    {showStreaks && (
      <DateStreaksGoals
        currentUser={user}
        streakData={userStreakData}
        onClose={closeStreaks}
      />
    )}

    {showInviteFriends && (
      <InviteFriendsModal
        user={user}
        onClose={() => setShowInviteFriends(false)}
      />
    )}

    {showPremiumModal && (
      <PremiumFeatureModal
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => {
          setShowPremiumModal(false);
          setTimeout(() => {
            setShowSubscriptionModal(true);
          }, 300);
        }}
      />
    )}

    {showSubscriptionManager && (
      <SubscriptionManager
        user={user}
        userData={userData}
        onClose={() => setShowSubscriptionManager(false)}
        onShowTerms={() => setShowTerms(true)}
        onShowPrivacy={() => setShowPrivacy(true)}
      />
    )}

    {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

    {/* ============================================ */}
    {/* 🎯 PHASE 3: MODALS */}
    {/* ============================================ */}

    {/* Daily Challenges Modal */}
    {showDailyChallenges && (
      <DailyChallenges
        user={user}
        onClose={() => setShowDailyChallenges(false)}
        onXPEarned={(xp, reason) => handleBonusXP(xp, reason)}
        gameStats={gameStats}
      />
    )}

    {/* Monthly Recap Modal */}
    {showMonthlyRecap && (
      <MonthlyRecap
        user={user}
        onClose={() => setShowMonthlyRecap(false)}
        onShare={(data) => {
          console.log('Share recap:', data);
        }}
      />
    )}

    {/* Notification Settings Modal */}
    {showNotificationSettings && (
      <NotificationSettings
        user={user}
        isPremium={subscriptionStatus !== 'free'}
        onClose={() => setShowNotificationSettings(false)}
      />
    )}

    {/* Achievement Unlocked Popup */}
    {newAchievementUnlocked && (
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          padding: '1rem',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={() => setNewAchievementUnlocked(null)}
      >
        <div 
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: '350px',
            width: '100%',
            textAlign: 'center',
            border: '2px solid rgba(255,215,0,0.5)',
            boxShadow: '0 0 60px rgba(255,215,0,0.3)',
            animation: 'scaleIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
          <h2 style={{ 
            color: '#FFD700', 
            fontSize: '1.25rem', 
            fontWeight: '800', 
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Achievement Unlocked!
          </h2>
          <div style={{ fontSize: '3rem', margin: '1rem 0' }}>
            {newAchievementUnlocked.icon}
          </div>
          <h3 style={{ 
            color: 'white', 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            margin: '0 0 0.5rem 0' 
          }}>
            {newAchievementUnlocked.hidden 
              ? newAchievementUnlocked.revealedTitle 
              : newAchievementUnlocked.title}
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '1rem', 
            margin: '0 0 1.5rem 0' 
          }}>
            {newAchievementUnlocked.hidden 
              ? newAchievementUnlocked.revealedDescription 
              : newAchievementUnlocked.description}
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            display: 'inline-block'
          }}>
            <span style={{ color: '#1a1a2e', fontWeight: '800', fontSize: '1.25rem' }}>
              +{newAchievementUnlocked.xp} XP
            </span>
          </div>
          <button
            onClick={() => setNewAchievementUnlocked(null)}
            style={{
              display: 'block',
              width: '100%',
              marginTop: '1.5rem',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Awesome!
          </button>
        </div>
      </div>
    )}

{/* Free Date Mode */}
    {showFreeDateMode && (
  <FreeDateMode
    user={user}
    onClose={() => setShowFreeDateMode(false)}
    savedDates={savedDates}
    setSavedDates={setSavedDates}
    isPremium={subscriptionStatus !== 'free'}
  />
)}

    {/* Long Distance Mode */}
    {showLongDistanceMode && (
  <LongDistanceMode
    user={user}
    onClose={() => setShowLongDistanceMode(false)}
    savedDates={savedDates}
    setSavedDates={setSavedDates}
    isPremium={subscriptionStatus !== 'free'}
  />
)}

    {/* Music Selector */}
    {showMusicSelector && (
      <MusicSelector
        isPremium={subscriptionStatus !== 'free'}
        onClose={() => setShowMusicSelector(false)}
        onUpgrade={() => {
          setShowMusicSelector(false);
          setShowPremiumModal(true);
        }}
      />
    )}

    {/* Shop */}
    {showShop && (
      <Shop
        user={user}
        userPurchases={userPurchases}
        setUserPurchases={setUserPurchases}
        userLevel={userData?.level || 1}
        isPremium={subscriptionStatus !== 'free'}
        onClose={() => setShowShop(false)}
        onPurchase={async (item) => {
          console.log('Purchase item:', item);
        }}
        onUpgradePremium={() => {
          setShowShop(false);
          setShowPremiumModal(true);
        }}
      />
    )}
  </div>
);
}
