import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Heart, Navigation, ExternalLink, Star, Sparkles, BookmarkPlus, BookmarkCheck, RefreshCw, User, Clock, ArrowRight, MessageCircle, Share2, CheckCircle } from 'lucide-react';
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
import DateMemoryScrapbook from './DateMemoryScrapbook';
import SurpriseDateMode from './SurpriseDateMode';
import DateStreaksGoals from './DateStreaksGoals';
import SubscribeButton from './SubscribeButton';
import SubscriptionManager from './Subscriptionmanager';
import TermsModal from './Terms';
import PrivacyModal from './Privacy';
export default function DateMaker() {
  const navigate = useNavigate(); 
  
  // Language state and helper
  const [language, setLanguage] = useState('en');
  const t = (key) => getTranslation(language, key);
  const isRTL = translations[language]?.dir === 'rtl';
  
  // Core states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState('login'); // 'login', 'signup', 'success', 'verification', 'main'
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [initError, setInitError] = useState(null);
  const [showSocial, setShowSocial] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [dateToShare, setDateToShare] = useState(null);
  const [photoToken, setPhotoToken] = useState('');
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
const [showTerms, setShowTerms] = useState(false);
const [showPrivacy, setShowPrivacy] = useState(false);
  const [userData, setUserData] = useState(null);
  
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
const [isGenerating, setIsGenerating] = useState(false);        // ← ADD THIS
const [initialLoading, setInitialLoading] = useState(true);     // ← ADD THIS
  const [savedDates, setSavedDates] = useState([]);
  const [showSavedDates, setShowSavedDates] = useState(false);
  const [includeEvents, setIncludeEvents] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateRange, setDateRange] = useState('anytime');
  const [startTime, setStartTime] = useState('6:00 PM');
  const [duration, setDuration] = useState('6');
  
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
  const [completedChallenges, setCompletedChallenges] = useState([]);
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

// 🔍 DEBUG: Monitor subscription status changes
useEffect(() => {
  console.log('============================');
  console.log('🔍 Subscription Status:', subscriptionStatus);
  console.log('🔍 User Email:', user?.email);
  console.log('🔍 Email Verified:', user?.emailVerified);
  console.log('🔍 Banner should show:', subscriptionStatus === 'free');
  console.log('============================');
}, [subscriptionStatus, user]);

// Load saved language preference on mount
useEffect(() => {
  const savedLanguage = localStorage.getItem('datemaker_language') || 'en';
  setLanguage(savedLanguage);
}, []);
  
  // 🔔 Unified notification system
  const [notificationCounts, setNotificationCounts] = useState({
    messages: 0,
    requests: 0,
    total: 0
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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
    setShowSubscriptionModal(true);
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
    setShowSubscriptionModal(true);
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
    setShowSubscriptionModal(true);
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
    setShowSubscriptionModal(true);
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
    setShowSubscriptionModal(true);
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


  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('datemaker_language') || 'en';
    setLanguage(savedLanguage);
  }, []);

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
            setSubscriptionStatus(data.subscriptionStatus || 'free');
            setSavedDates(data.savedDates || []);
            setProfilePhoto(data.profilePhoto || '');
          } else {
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
      console.error('Auth error:', err);
      setInitError(err.message);
    } finally {
      setLoading(false);
    }
  });
  
  return () => unsubscribe();
}, [authScreen]);
  
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
  // Old notification tracking removed - now using unified system above
  
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
  
  const handleLogout = async () => {
    try {
      // Set user offline before logging out
      await setDoc(doc(db, 'userStatus', user.uid), {
        online: false,
        lastSeen: serverTimestamp()
      }, { merge: true });
      
      await signOut(auth);
      setShowResults(false);
      setShowSavedDates(false);
      setShowProfile(false);
      setShowSocial(false);
      setPlaces([]);
      setItinerary(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
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
      console.error('Upload error:', err);
      setProfileError(`Failed to upload: ${err.message}`);
    }
  };
  
  const handleChangePassword = async () => {
    setProfileError('');
    
    if (newPassword.length < 6) {
      setProfileError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setProfileError('Passwords do not match');
      return;
    }
    
    try {
      await updatePassword(user, newPassword);
      alert('✅ Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setProfileError('Please log out and log back in to change your password.');
      } else {
        setProfileError('Failed to change password. Try again.');
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
    setShowSubscriptionModal(true);
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
    setShowSubscriptionModal(true);
    return;
  }
  
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
      
      alert(t('dateSaved'));
    } catch (err) {
      console.error('Save error:', err);
    }
  };
  
  const handleSaveItinerary = async () => {
  // 🔒 SUBSCRIPTION GATE
  if (subscriptionStatus === 'free') {
    setShowSubscriptionModal(true);
    return;
  }
  
  try {
    if (!itinerary || !itinerary.stops || itinerary.stops.length === 0) {
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
      
      alert(t('itinerarySaved'));
    } catch (err) {
      console.error('Save itinerary error:', err);
    }
  };
  
  const handleRemoveSavedDate = async (placeId) => {
    try {
      const newSavedDates = savedDates.filter(d => d.place_id !== placeId);
      setSavedDates(newSavedDates);
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { savedDates: newSavedDates }, { merge: true });
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
    alert('Sharing is a premium feature! Upgrade to share with the community.');
    setShowSubscriptionModal(true);
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
      setCustomActivities([...customActivities, customActivityInput.trim()]);
      setCustomActivityInput('');
    }
  };
  
  const handleRemoveCustomActivity = (activity) => {
    setCustomActivities(customActivities.filter(a => a !== activity));
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleAddCustomActivity();
  };
  
 const handleGenerateDate = async (isRefresh = false) => {
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
      setShowSubscriptionModal(true);
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
        console.log('  Fetching geocode...');
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
      console.log('  Fetching places...');
      const placesResponse = await fetch(placesUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      setItinerary(generatedItinerary);
      
      const allPlaces = [
        ...generatedItinerary.stops.map(s => s.place),
        ...generatedItinerary.alternatives
      ];
      setPlaces(allPlaces);
      setShowResults(true);
      window.scrollTo({
  top: 0,
  behavior: 'smooth'
});
      
      console.log('✅ SUCCESS! Itinerary created with', generatedItinerary.stops.length, 'stops');
      console.log('═══════════════════════════════════════');
      
    } catch (placesError) {
      console.error('  ❌ Places fetch failed:', placesError);
      throw placesError;
    }
    
  } catch (err) {
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
      onBack={() => setShowSocial(false)}
    />
  );
}
  
  if (!user || !user.emailVerified || authScreen !== 'main') {
    if (authScreen === 'login') {
      return (
        <Login 
          onSwitchToSignup={() => setAuthScreen('signup')}
          onShowVerification={() => setAuthScreen('verification')}
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', padding: '2rem', direction: isRTL ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>{t('myProfile')}</h1>
            <button onClick={() => setShowProfile(false)} style={{ background: 'white', padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              ← {t('back')}
            </button>
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', marginBottom: '1rem', border: '4px solid #ec4899' }}>
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom right, #ec4899, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 'bold' }}>
                    {user.email.charAt(0).toUpperCase()}
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
                <button onClick={async () => {
                  if (window.confirm('Are you sure you want to cancel your premium subscription?')) {
                    try {
                      const userDocRef = doc(db, 'users', user.uid);
                      await setDoc(userDocRef, { subscriptionStatus: 'free' }, { merge: true });
                      setSubscriptionStatus('free');
                      alert('Your subscription has been cancelled.');
                    } catch (err) {
                      console.error('Cancel subscription error:', err);
                      setProfileError('Failed to cancel subscription.');
                    }
                  }
                }} style={{ width: '100%', background: 'white', color: '#dc2626', padding: '0.875rem', borderRadius: '12px', border: '2px solid #fecaca', cursor: 'pointer', fontWeight: '600' }}>
                  {t('cancelSubscription')}
                </button>
              </div>
            )}
            {subscriptionStatus === 'free' && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>{t('upgradeToPremium')}</h3>
                <div style={{ padding: '1.5rem', background: 'linear-gradient(to right, #fef3c7, #fde68a)', borderRadius: '12px', border: '2px solid #fbbf24', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '1.125rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: '700' }}>🎉 {t('unlockPremium')}</p>
                  <ul style={{ fontSize: '0.875rem', color: '#78350f', marginLeft: '1.25rem' }}>
                    {t('premiumFeatures').map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => setShowSubscriptionModal(true)} style={{ width: '100%', background: 'linear-gradient(to right, #ec4899, #a855f7)', color: 'white', padding: '0.875rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
                  {t('upgradeButton')}
                </button>
              </div>
            )}
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', padding: '2rem', direction: isRTL ? 'rtl' : 'ltr' }}>
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
            <div style={{ background: 'white', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' }}>
              <Heart size={64} style={{ color: '#ec4899', margin: '0 auto 1rem', opacity: 0.5 }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('noSavedDates')}</h2>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{t('noSavedDatesDesc')}</p>
              <button onClick={() => setShowSavedDates(false)} style={{ background: 'linear-gradient(to right, #ec4899, #a855f7)', color: 'white', fontWeight: 'bold', padding: '0.75rem 2rem', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}>
                {t('findPerfectDate')}
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
    );
  }
 if (showResults && itinerary) {
    return (
      <>
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #fce7f3, #f3e8ff)', padding: '2rem', direction: isRTL ? 'rtl' : 'ltr' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart style={{ color: '#ec4899' }} size={32} fill="currentColor" />
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>{t('yourPerfectDate')}</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => handleGenerateDate(true)} disabled={searchLoading} style={{ background: searchLoading ? '#d1d5db' : 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: searchLoading ? 'not-allowed' : 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={18} />
                {searchLoading ? t('loading') : t('refresh')}
              </button>
              <button onClick={handleSaveItinerary} style={{ background: 'linear-gradient(to right, #10b981, #059669)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookmarkPlus size={18} />
                {t('saveItinerary')}
              </button>
              <button onClick={() => setShowResults(false)} style={{ background: 'white', padding: '0.5rem 1.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                ← {t('back')}
              </button>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(to right, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                🎉 {t('dateNightItinerary')}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                {itinerary.startTime} - {itinerary.endTime} • {itinerary.totalDuration}
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              {itinerary.stops.map((stop, index) => (
  <div key={index} style={{ marginBottom: '2rem' }}>
    {/* Gradient Header Card */}
    <div style={{ 
      background: 'white', 
      borderRadius: '20px', 
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      border: '2px solid #f3f4f6'
    }}>
      {/* Gradient Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        color: 'white'
      }}>
        <div style={{ fontSize: '2.5rem' }}>
          {stop.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <Clock size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
              {stop.time} • {stop.duration}
            </span>
          </div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            margin: 0 
          }}>
            {stop.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.95rem', 
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          {stop.description}
        </p>

        {/* Venue Image */}
        <div style={{ 
          position: 'relative', 
          height: '250px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          {(() => {
            const placePhoto = getPlacePhoto(stop.place);
            const placeholderColors = getPlaceholderImage(stop.place.name);
            const placeholderId = `main-stop-${index}`;
            
            return (
              <>
                <div 
                  id={placeholderId}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: `linear-gradient(135deg, ${placeholderColors[0]}, ${placeholderColors[1]})`, 
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '4rem', 
                    color: 'white', 
                    fontWeight: 'bold',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                  }}>
                  {stop.place.name.charAt(0).toUpperCase()}
                </div>
                
                {placePhoto && (
                  <img 
                    src={placePhoto} 
                    alt={stop.place.name}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 2,
                    }} 
                    onLoad={(e) => {
                      const placeholder = document.getElementById(placeholderId);
                      if (placeholder) placeholder.style.display = 'none';
                    }}
                    onError={(e) => { 
                      e.target.style.display = 'none';
                    }} 
                  />
                )}
                
                {stop.place.rating && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    background: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '9999px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 10
                  }}>
                    <Star size={18} style={{ color: '#eab308' }} fill="currentColor" />
                    <span style={{ fontWeight: 'bold' }}>{stop.place.rating}</span>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Venue Name & Location */}
        <h4 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem' 
        }}>
          {stop.place.name}
        </h4>
        <p style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: '#6b7280', 
          fontSize: '0.875rem', 
          marginBottom: '1.5rem' 
        }}>
          <MapPin size={16} style={{ color: '#ec4899' }} />
          {stop.place.vicinity}
        </p>

        {/* Event Info */}
        {stop.place.isEvent && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '0.75rem', 
            background: 'linear-gradient(to right, #fef3c7, #fde68a)', 
            borderRadius: '8px', 
            border: '2px solid #fbbf24' 
          }}>
            {stop.place.eventDate && (
              <p style={{ 
                color: '#92400e', 
                fontWeight: '700', 
                fontSize: '0.875rem', 
                marginBottom: '0.25rem',
                margin: 0 
              }}>
                📅 {new Date(stop.place.eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {stop.place.eventTime && ` • ${stop.place.eventTime}`}
              </p>
            )}
            {stop.place.priceRange && (
              <p style={{ 
                color: '#059669', 
                fontWeight: '700', 
                fontSize: '0.875rem',
                margin: 0 
              }}>
                🎟️ {stop.place.priceRange}
              </p>
            )}
          </div>
        )}

        {/* Map */}
        <div 
          onClick={() => openDirections(stop.place.geometry.location.lat, stop.place.geometry.location.lng)} 
          style={{ 
            cursor: 'pointer', 
            marginBottom: '1.5rem', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}
        >
          <img 
            src={getStaticMapUrl(stop.place.geometry.location.lat, stop.place.geometry.location.lng)} 
            alt="Map" 
            style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
          />
        </div>

       {/* Challenges */}
{stop.challenges && stop.challenges.length > 0 && (
  <div style={{ marginBottom: '1.5rem' }}>
    <h4 style={{ 
      fontSize: '1.1rem', 
      fontWeight: '700',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#111827'
    }}>
      🎯 Challenges
    </h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {stop.challenges.map((challenge) => {
        const isCompleted = completedChallenges.includes(challenge.id);
        return (
          <div 
            key={challenge.id}
            style={{
              padding: '1rem',
              background: isCompleted 
                ? 'linear-gradient(135deg, #06D6A020, #06D6A010)'
                : 'linear-gradient(135deg, #FF6B3520, #FF8C4210)',
              borderRadius: '12px',
              border: isCompleted
                ? '2px solid #06D6A060'
                : '2px solid #FF6B3540',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <p style={{ 
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#111827',
              margin: 0,
              textDecoration: isCompleted ? 'line-through' : 'none',
              opacity: isCompleted ? 0.7 : 1,
              flex: 1,
              paddingRight: '0.5rem'
            }}>
              {challenge.text}
            </p>
            <button
              onClick={() => handleCompleteChallenge(index, challenge.id)}
              disabled={isCompleted}
              style={{
                padding: '0.5rem 1rem',
                background: isCompleted 
                  ? '#06D6A0'
                  : 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.875rem',
                cursor: isCompleted ? 'not-allowed' : 'pointer',
                opacity: isCompleted ? 0.6 : 1,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {isCompleted ? `✓ +${challenge.points}` : `+${challenge.points} XP`}
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => openDirections(stop.place.geometry.location.lat, stop.place.geometry.location.lng)} 
            style={{ 
              flex: 1, 
              minWidth: '120px', 
              background: 'linear-gradient(to right, #ec4899, #d946ef)', 
              color: 'white', 
              fontWeight: '600', 
              padding: '0.75rem 1rem', 
              borderRadius: '9999px', 
              border: 'none', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              fontSize: '0.875rem' 
            }}
          >
            <Navigation size={16} />
            {t('directions')}
          </button>
          {stop.place.website && (
            <button 
              onClick={() => window.open(stop.place.website, '_blank')} 
              style={{ 
                flex: 1, 
                minWidth: '120px', 
                background: 'linear-gradient(to right, #a855f7, #7c3aed)', 
                color: 'white', 
                fontWeight: '600', 
                padding: '0.75rem 1rem', 
                borderRadius: '9999px', 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                fontSize: '0.875rem' 
              }}
            >
              <ExternalLink size={16} />
              {stop.place.isEvent ? t('tickets') : t('website')}
            </button>
          )}
          <button 
            onClick={() => handleSaveDate(stop.place)} 
            disabled={isDateSaved(stop.place.place_id)} 
            style={{ 
              background: isDateSaved(stop.place.place_id) ? '#f3f4f6' : 'linear-gradient(to right, #10b981, #059669)', 
              color: isDateSaved(stop.place.place_id) ? '#9ca3af' : 'white', 
              fontWeight: '600', 
              padding: '0.75rem 1rem', 
              borderRadius: '9999px', 
              border: 'none', 
              cursor: isDateSaved(stop.place.place_id) ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              fontSize: '0.875rem' 
            }}
          >
            {isDateSaved(stop.place.place_id) ? <><BookmarkCheck size={16} />{t('saved')}</> : <><BookmarkPlus size={16} />{t('save')}</>}
          </button>
        </div>
      </div>
    </div>

    {/* Arrow between stops */}
    {index < itinerary.stops.length - 1 && (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '1.5rem 0' 
      }}>
        <ArrowRight size={32} style={{ color: '#ec4899' }} />
      </div>
    )}
  </div>
))}
            </div>
          </div>
          {itinerary.alternatives && itinerary.alternatives.length > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                ✨ {t('alternativeOptions')}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{t('alternativeDescription')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {itinerary.alternatives.slice(0,6).map((place) => {
                  const placePhoto = getPlacePhoto(place);
                  const placeholderColors = getPlaceholderImage(place.name);
                  return (
                  <div key={place.place_id} style={{ background: '#f9fafb', borderRadius: '16px', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                      <div style={{ position: 'relative', height: '150px' }}>
                        {(() => {
                          const placePhoto = getPlacePhoto(place);
                          const placeholderColors = getPlaceholderImage(place.name);
                          const placeholderId = `alt-${place.place_id}`;
                          
                          return (
                            <>
                              {/* Placeholder - always visible first */}
                              <div 
                                id={placeholderId}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  background: `linear-gradient(135deg, ${placeholderColors[0]}, ${placeholderColors[1]})`, 
                                  display: 'flex',
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  fontSize: '2rem', 
                                  color: 'white', 
                                  fontWeight: 'bold',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  zIndex: 1
                                }}>
                                {place.name.charAt(0).toUpperCase()}
                              </div>
                              
                              {/* Image - rendered on top if available */}
                              {placePhoto && (
                                <img 
                                  src={placePhoto} 
                                  alt={place.name}
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    zIndex: 2
                                  }} 
                                  onLoad={(e) => {
                                    console.log(`✅ ALT IMAGE LOADED: ${place.name}`);
                                    const placeholder = document.getElementById(placeholderId);
                                    if (placeholder) {
                                      placeholder.style.display = 'none';
                                    }
                                  }}
                                  onError={(e) => { 
                                    console.error(`❌ ALT IMAGE FAILED: ${place.name}`, placePhoto);
                                    e.target.style.display = 'none';
                                  }} 
                                />
                              )}
                              
                              {/* Rating badge - always on top */}
                              {place.rating && (
                                <div style={{ 
                                  position: 'absolute', 
                                  top: '0.5rem', 
                                  right: '0.5rem', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '0.25rem', 
                                  background: 'white', 
                                  padding: '0.25rem 0.75rem', 
                                  borderRadius: '9999px',
                                  zIndex: 10
                                }}>
                                  <Star size={14} style={{ color: '#eab308' }} fill="currentColor" />
                                  <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{place.rating}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>  
                      <div style={{ padding: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{place.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} />
                          {place.vicinity}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
  <button onClick={() => openDirections(place.geometry.location.lat, place.geometry.location.lng)} style={{ flex: 1, background: '#ec4899', color: 'white', fontWeight: '600', padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>
    {t('directions')}
  </button>
  <button onClick={() => handleSaveDate(place)} disabled={isDateSaved(place.place_id)} style={{ flex: 1, background: isDateSaved(place.place_id) ? '#e5e7eb' : '#10b981', color: isDateSaved(place.place_id) ? '#9ca3af' : 'white', fontWeight: '600', padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: isDateSaved(place.place_id) ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}>
    {isDateSaved(place.place_id) ? t('saved') : t('save')}
  </button>
</div>
                      </div>
                    </div>
                  );
                })}
      </div>
            </div>
          )}
          
          <div style={{ 
            position: 'fixed', 
            bottom: '2rem', 
            right: '2rem',
            zIndex: 100
          }}>
  <button
  onClick={handleCompleteDateItinerary}
  style={{
    background: 'linear-gradient(135deg, #06D6A0 0%, #1B9AAA 100%)',
    color: 'white',
    fontWeight: '900',
    fontSize: '1.1rem',
    padding: '1.25rem 2.5rem',
    borderRadius: '50px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(6,214,160,0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease'
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = 'translateY(-4px) scale(1.05)';
    e.target.style.boxShadow = '0 12px 40px rgba(6,214,160,0.6)';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0) scale(1)';
    e.target.style.boxShadow = '0 8px 30px rgba(6,214,160,0.4)';
  }}
>
  <CheckCircle size={24} />
  Complete Date
</button>
          </div>
        </div>
      </div>
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
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: '900',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              +{pointsNotificationData.points} XP
            </p>
            <p style={{ 
              fontSize: '0.875rem',
              margin: 0,
              opacity: 0.9
            }}>
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
            console.log('🚪 Level up closed');
            setShowLevelUp(false);
          }}
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
    </>
  );
  }
  
  
  // Subscription modal
  if (showSubscriptionModal) {
    return <SubscriptionModal user={user} onClose={() => setShowSubscriptionModal(false)} />;
  }
  // Main input screen
  return (
    <>
    
      {/* ✅ RESPONSIVE HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
            <Heart style={{ color: 'white' }} size={32} fill="white" />
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)', margin: 0, whiteSpace: 'nowrap' }}>
              DateMaker
            </h1>
          </div>
          
          {/* XP Bar (centered on large screens, full width on small) */}
          {gameStats && (
            <div style={{ 
              flex: '1 1 auto', 
              maxWidth: '400px', 
              minWidth: '250px',
              order: window.innerWidth < 768 ? 3 : 2 // Move to bottom on mobile
            }}>
              <XPBar 
                level={calculateLevel(gameStats.xp || 0)}
                progress={getProgressToNextLevel(gameStats.xp || 0)}
                xp={gameStats.xp || 0}
                onClick={() => navigate('/stats')}
              />
            </div>
          )}
          
          {/* Right side: Language + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', order: 2 }}>
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={handleLanguageChange} 
            />
            
            <HamburgerMenu
              user={user}
              subscriptionStatus={subscriptionStatus}
              savedDatesCount={savedDates.length}
              notificationCount={notificationCounts.total}
              onNavigate={(destination) => {
                if (destination === 'spin') setShowSpinningWheel(true);
                if (destination === 'invite') alert('Friend invites coming soon!');
                if (destination === 'stats') navigate('/stats');
                if (destination === 'achievements') navigate('/achievements');
                if (destination === 'social') {
                  if (subscriptionStatus === 'free') {
                    alert('Social is a premium feature!');
                    setShowSubscriptionModal(true);
                  } else {
                    setShowSocial(true);
                  }
                }
                if (destination === 'saved') setShowSavedDates(true);
                
                if (destination === 'scrapbook') openScrapbookMemories();
    if (destination === 'surprise') openSurpriseDateTracker();
    if (destination === 'streaks') openStreaksGoals();
                
                if (destination === 'profile') setShowProfile(true);
              }}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Main content starts here */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ background: 'linear-gradient(to right, #ec4899, #a855f7, #3b82f6)', borderRadius: '9999px', padding: '3rem 2rem', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <Sparkles style={{ color: 'white' }} size={28} />
              <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                Complete Date Night Planning
              </h2>
            </div>
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            <div style={{ background: 'linear-gradient(to right, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('heroTitle1')}
            </div>
            <div style={{ background: 'linear-gradient(to right, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('heroTitle2')}
            </div>
          </h1>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', color: '#111827', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            {t('heroSubtitle')}
            <span style={{ fontSize: '3rem' }}>✨</span>
          </h2>
          <p style={{ fontSize: '1.5rem', color: '#374151', lineHeight: '1.8', maxWidth: '900px', margin: '0 auto' }}>
            {t('heroDescription')}
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', height: '200px' }}>
            <img src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80" alt="Cocktails" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', height: '200px' }}>
            <img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80" alt="Party" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', height: '200px' }}>
            <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80" alt="Cinema" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', height: '200px' }}>
            <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80" alt="Adventure" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', height: '200px' }}>
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80" alt="Cooking" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', height: '200px' }}>
            <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80" alt="Stadium" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        
       {subscriptionStatus === 'free' && (
  <div style={{
    background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    padding: '2rem',
    borderRadius: '20px',
    marginBottom: '2rem',
    textAlign: 'center',
    border: 'none',
    boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)',
    color: 'white'
  }}>
    <h3 style={{
      fontSize: '1.75rem',
      fontWeight: '900',
      marginBottom: '0.75rem',
      textShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      🎉 Start Your 7-Day FREE Trial!
    </h3>
    
    <p style={{
      marginBottom: '1.25rem',
      fontSize: '1.05rem',
      opacity: 0.95
    }}>
      Enter your card now - won't be charged until trial ends
    </p>
    
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      flexWrap: 'wrap',
      marginBottom: '1.5rem',
      fontSize: '0.95rem'
    }}>
      <span>✨ Unlimited dates</span>
      <span>📅 Complete itineraries</span>
      <span>👥 Social features</span>
    </div>
    
    <button 
      onClick={() => setShowSubscriptionModal(true)} 
      style={{ 
        background: 'white',
        color: '#ec4899', 
        fontWeight: '800', 
        padding: '1rem 2.5rem', 
        borderRadius: '9999px', 
        border: 'none', 
        cursor: 'pointer',
        fontSize: '1.1rem',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.3s ease'
      }}
    >
      Start FREE Trial →
    </button>
    
    <p style={{ marginTop: '1rem', fontSize: '0.875rem', opacity: 0.9 }}>
      💳 Cancel anytime • 🔒 Secure payment • ⏰ $9.99/mo after trial
    </p>
  </div>
)}

        <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', background: 'linear-gradient(to right, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            💕 {t('heroSubtitle')}
          </h2>
          
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '16px', border: '2px solid #bae6fd' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={24} style={{ color: '#0369a1' }} />
              When & How Long
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '0.5rem', display: 'block' }}>
                  Start Time
                </label>
                <select value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '2px solid #bae6fd', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', color: '#0c4a6e', background: 'white', cursor: 'pointer' }}>
                  <option value="6:00 AM">6:00 AM</option>
                  <option value="7:00 AM">7:00 AM</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                  <option value="9:00 PM">9:00 PM</option>
                  <option value="10:00 PM">10:00 PM</option>
                  <option value="11:00 PM">11:00 PM</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0c4a6e', marginBottom: '0.5rem', display: 'block' }}>
                  Duration (Hours)
                </label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '2px solid #bae6fd', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', color: '#0c4a6e', background: 'white', cursor: 'pointer' }}>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="5">5 hours</option>
                  <option value="6">6 hours</option>
                  <option value="7">7 hours</option>
                  <option value="8">8 hours</option>
                </select>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#075985', marginTop: '0.75rem', fontWeight: '500' }}>
              📅 Your date will run from {startTime} to {addHours(startTime, parseInt(duration))}
            </p>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              <MapPin style={{ color: '#ec4899' }} size={24} />
              {t('location')}
            </label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('locationPlaceholder')} style={{ width: '100%', padding: '1rem 1.5rem', border: '2px solid #fbcfe8', borderRadius: '9999px', fontSize: '1.125rem', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.border = '2px solid #ec4899'} onBlur={(e) => e.target.style.border = '2px solid #fbcfe8'} />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              ✨ Start planning your date!
            </h3>
            
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
                {t('addCustomActivity')}
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input type="text" value={customActivityInput} onChange={(e) => setCustomActivityInput(e.target.value)} onKeyPress={handleKeyPress} placeholder={t('customActivityPlaceholder')} style={{ flex: 1, padding: '0.875rem 1.25rem', border: '2px solid #fbcfe8', borderRadius: '9999px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.border = '2px solid #ec4899'} onBlur={(e) => e.target.style.border = '2px solid #fbcfe8'} />
                <button onClick={handleAddCustomActivity} style={{ padding: '0.875rem 1.5rem', background: 'linear-gradient(to right, #ec4899, #a855f7)', color: 'white', fontWeight: '600', borderRadius: '9999px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t('add')}
                </button>
              </div>
              
              {customActivities.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                  {customActivities.map((activity, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '9999px', background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', fontWeight: '600', boxShadow: '0 4px 6px rgba(59,130,246,0.3)' }}>
                      {activity}
                      <button onClick={() => handleRemoveCustomActivity(activity)} style={{ background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#eff6ff', borderRadius: '12px', border: '2px solid #bfdbfe', marginTop: '1.5rem' }}>
              <input type="checkbox" id="includeEvents" checked={includeEvents} onChange={(e) => setIncludeEvents(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3b82f6' }} />
              <label htmlFor="includeEvents" style={{ fontSize: '1rem', fontWeight: '600', color: '#1e40af', cursor: 'pointer', userSelect: 'none', margin: 0 }}>
                🎉 {t('includeEvents')}
              </label>
            </div>
            
            {includeEvents && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#fdf4ff', borderRadius: '16px', border: '2px solid #f0abfc' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#86198f', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📅 {t('whenLookingForEvents')}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => { setDateRange('anytime'); setSelectedDate(''); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: '600', border: dateRange === 'anytime' ? 'none' : '2px solid #f0abfc', background: dateRange === 'anytime' ? 'linear-gradient(to right, #a855f7, #9333ea)' : 'white', color: dateRange === 'anytime' ? 'white' : '#86198f', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t('anytime')}
                    </button>
                    <button onClick={() => setDateRange('today')} style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: '600', border: dateRange === 'today' ? 'none' : '2px solid #f0abfc', background: dateRange === 'today' ? 'linear-gradient(to right, #a855f7, #9333ea)' : 'white', color: dateRange === 'today' ? 'white' : '#86198f', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t('today')}
                    </button>
                    <button onClick={() => setDateRange('thisweek')} style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: '600', border: dateRange === 'thisweek' ? 'none' : '2px solid #f0abfc', background: dateRange === 'thisweek' ? 'linear-gradient(to right, #a855f7, #9333ea)' : 'white', color: dateRange === 'thisweek' ? 'white' : '#86198f', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t('thisWeek')}
                    </button>
                    <button onClick={() => setDateRange('thismonth')} style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: '600', border: dateRange === 'thismonth' ? 'none' : '2px solid #f0abfc', background: dateRange === 'thismonth' ? 'linear-gradient(to right, #a855f7, #9333ea)' : 'white', color: dateRange === 'thismonth' ? 'white' : '#86198f', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t('thisMonth')}
                    </button>
                    <button onClick={() => setDateRange('custom')} style={{ padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: '600', border: dateRange === 'custom' ? 'none' : '2px solid #f0abfc', background: dateRange === 'custom' ? 'linear-gradient(to right, #a855f7, #9333ea)' : 'white', color: dateRange === 'custom' ? 'white' : '#86198f', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {t('pickDate')}
                    </button>
                  </div>
                  {dateRange === 'custom' && (
                    <div>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#86198f', marginBottom: '0.5rem', display: 'block' }}>
                        {t('selectDate')}
                      </label>
                      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid #f0abfc', borderRadius: '12px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '16px', color: '#b91c1c', fontWeight: '600', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <button onClick={() => handleGenerateDate(false)} disabled={searchLoading} style={{ width: '100%', background: searchLoading ? '#d1d5db' : 'linear-gradient(to right, #ec4899, #a855f7, #3b82f6)', color: 'white', fontWeight: 'bold', fontSize: '1.25rem', padding: '1.5rem 2rem', borderRadius: '9999px', border: 'none', cursor: searchLoading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            {searchLoading ? (
              <>
                <div style={{ width: '24px', height: '24px', border: '4px solid white', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                {t('creating')}
              </>
            ) : (
              <>
                <Sparkles size={24} />
                {t('generateDate')}
              </>
            )}
          </button>
        </div>
      </div>
    
      {showSubscriptionModal && (
        <SubscriptionModal user={user} onClose={() => setShowSubscriptionModal(false)} />
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
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: '900',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              +{pointsNotificationData.points} XP
            </p>
            <p style={{ 
              fontSize: '0.875rem',
              margin: 0,
              opacity: 0.9
            }}>
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
      console.log('🚪 Level up closed');
      setShowLevelUp(false);
      // useEffect will open scrapbook automatically since dateToSave is already set
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


      {/* 💳 Subscription Manager Modal */}
{showSubscriptionManager && (
  <SubscriptionManager
    user={user}
    userData={userData}
    onClose={() => setShowSubscriptionManager(false)}
    onShowTerms={() => setShowTerms(true)}
    onShowPrivacy={() => setShowPrivacy(true)}
  />
)}


      {/* 📄 Terms and Privacy Modals */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}// Build trigger
