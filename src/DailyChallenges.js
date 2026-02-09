// ============================================
// 🎯 DAILY CHALLENGES - REDESIGNED
// DateMaker - Auto-tracking with Progress Bars
// ============================================
// FEATURES:
// ✅ Real activity tracking (no honor system)
// ✅ Progress bars showing actual progress
// ✅ Auto-complete when target reached
// ✅ Manual complete only for un-trackable challenges
// ✅ Beautiful animations and confetti
// ✅ Proper safe area padding
// ✅ 24-hour reset timer
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, Flame, Gift, Target, CheckCircle, Lock, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import confetti from 'canvas-confetti';
import HapticService from './HapticService';
import { 
  getChallengeProgress, 
  isChallengeComplete, 
  getTimeRemaining,
  getActivityData 
} from './ActivityTracker';

// ============================================
// 🎯 CHALLENGE POOL
// ============================================
const CHALLENGE_POOL = [
  // Tier 1: Easy (60-80 XP) - All trackable
  { id: 'browse_5', title: 'Window Shopper', description: 'Browse 5 date ideas', xp: 60, tier: 'easy', icon: '👀', category: 'EXPLORER', target: 5 },
  { id: 'save_1', title: 'Bookmark It', description: 'Save a date to your list', xp: 65, tier: 'easy', icon: '📌', category: 'PLANNER', target: 1 },
  { id: 'share_idea', title: 'Spread the Love', description: 'Share a date idea', xp: 70, tier: 'easy', icon: '💌', category: 'SOCIAL', target: 1 },
  { id: 'spin_wheel', title: 'Lucky Spin', description: 'Use the spinning wheel', xp: 60, tier: 'easy', icon: '🎰', category: 'FUN', target: 1 },
  { id: 'view_profile', title: 'Self Reflection', description: 'Check your profile stats', xp: 55, tier: 'easy', icon: '👤', category: 'EXPLORER', target: 1 },
  { id: 'browse_categories', title: 'Category Explorer', description: 'Browse 3 different categories', xp: 70, tier: 'easy', icon: '🗂️', category: 'EXPLORER', target: 3 },
  
  // Tier 2: Medium (80-100 XP) - All trackable
  { id: 'generate_3', title: 'Idea Machine', description: 'Generate 3 date ideas', xp: 85, tier: 'medium', icon: '💡', category: 'CREATOR', target: 3 },
  { id: 'complete_date', title: 'Date Night', description: 'Mark a date as completed', xp: 100, tier: 'medium', icon: '✅', category: 'ROMANTIC', target: 1 },
  { id: 'add_memory', title: 'Memory Maker', description: 'Add a photo to scrapbook', xp: 90, tier: 'medium', icon: '📸', category: 'ROMANTIC', target: 1 },
  { id: 'send_message', title: 'Stay Connected', description: 'Send a message to a friend', xp: 80, tier: 'medium', icon: '💬', category: 'SOCIAL', target: 1 },
  { id: 'rate_date', title: 'Date Critic', description: 'Rate a completed date', xp: 85, tier: 'medium', icon: '⭐', category: 'REVIEWER', target: 1 },
  { id: 'plan_surprise', title: 'Secret Planner', description: 'Plan a surprise date', xp: 95, tier: 'medium', icon: '🎁', category: 'ROMANTIC', target: 1 },
  
  // Tier 3: Hard (100-150 XP) - Some manual
  { id: 'zero_dollar', title: 'Zero Dollar Date', description: 'Complete a free date', xp: 125, tier: 'hard', icon: '💸', category: 'EXPLORER', target: 1 },
  { id: 'invite_friend', title: 'Social Butterfly', description: 'Invite a friend to DateMaker', xp: 150, tier: 'hard', icon: '🦋', category: 'SOCIAL', target: 1 },
  { id: 'local_legend', title: 'Local Legend', description: 'Ask a local for their favorite spot', xp: 120, tier: 'hard', icon: '🏆', category: 'EXPLORER', target: 1, manual: true },
  { id: 'first_date_week', title: 'Weekly Warrior', description: 'Complete your first date this week', xp: 130, tier: 'hard', icon: '🗓️', category: 'ROMANTIC', target: 1 },
  { id: 'try_new_category', title: 'Adventure Seeker', description: 'Try a category you\'ve never done', xp: 140, tier: 'hard', icon: '🧭', category: 'EXPLORER', target: 1 },
  { id: 'double_date', title: 'Double Trouble', description: 'Plan a double date', xp: 145, tier: 'hard', icon: '👥', category: 'SOCIAL', target: 1, manual: true },
];

// ============================================
// 🎲 GET TODAY'S CHALLENGES
// ============================================
const getTodaysChallenges = () => {
  const today = new Date();
  // Use YYYYMMDD format for unique daily seed
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateSeed = year * 10000 + month * 100 + day; // e.g., 20260207
  
  console.log('🎯 Daily Challenge Seed:', dateSeed, 'Date:', today.toDateString());
  
  // Seeded random function using date seed
  const seededRandom = (seed) => {
    const x = Math.sin(seed * 12345.6789) * 10000;
    return x - Math.floor(x);
  };
  
  // Shuffle array with seed
  const shuffleWithSeed = (arr, seed) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Get challenges by tier and shuffle each
  const easyPool = CHALLENGE_POOL.filter(c => c.tier === 'easy');
  const mediumPool = CHALLENGE_POOL.filter(c => c.tier === 'medium');
  const hardPool = CHALLENGE_POOL.filter(c => c.tier === 'hard');
  
  // Use different seeds for each tier to ensure variety
  const shuffledEasy = shuffleWithSeed(easyPool, dateSeed);
  const shuffledMedium = shuffleWithSeed(mediumPool, dateSeed + 1000);
  const shuffledHard = shuffleWithSeed(hardPool, dateSeed + 2000);
  
  // Pick challenges
  const easy = shuffledEasy.slice(0, 1);
  const medium = shuffledMedium.slice(0, 2);
  const hard = shuffledHard.slice(0, 1);
  
  return [...easy, ...medium, ...hard];
};

// ============================================
// 🎨 TIER STYLES
// ============================================
const getTierStyle = (tier) => {
  switch (tier) {
    case 'easy':
      return {
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.3)',
        label: 'EASY',
        color: '#10b981'
      };
    case 'medium':
      return {
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        bg: 'rgba(139, 92, 246, 0.15)',
        border: 'rgba(139, 92, 246, 0.3)',
        label: 'MEDIUM',
        color: '#8b5cf6'
      };
    case 'hard':
      return {
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.3)',
        label: 'HARD',
        color: '#f59e0b'
      };
    default:
      return {
        gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
        bg: 'rgba(107, 114, 128, 0.15)',
        border: 'rgba(107, 114, 128, 0.3)',
        label: 'TASK',
        color: '#6b7280'
      };
  }
};

// ============================================
// 🎯 MAIN COMPONENT
// ============================================
export default function DailyChallenges({ user, onClose, onXPEarned, gameStats }) {
  const [challenges] = useState(getTodaysChallenges());
  const [completedToday, setCompletedToday] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  const [showCompletion, setShowCompletion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [progressData, setProgressData] = useState({});

  // ============================================
  // 📊 LOAD PROGRESS DATA
  // ============================================
  const refreshProgress = useCallback(() => {
    const newProgress = {};
    challenges.forEach(challenge => {
      newProgress[challenge.id] = getChallengeProgress(challenge.id);
    });
    setProgressData(newProgress);
  }, [challenges]);

  // ============================================
  // 🔄 AUTO-REFRESH PROGRESS
  // ============================================
  useEffect(() => {
    refreshProgress();
    
    // Refresh every 2 seconds to catch new activity
    const interval = setInterval(refreshProgress, 2000);
    
    return () => clearInterval(interval);
  }, [refreshProgress]);

  // ============================================
  // ⏰ UPDATE TIMER
  // ============================================
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // ============================================
  // 📥 LOAD COMPLETION STATUS FROM FIRESTORE
  // ============================================
  useEffect(() => {
    const loadChallenges = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const challengeRef = doc(db, 'dailyChallenges', user.uid);
        const challengeDoc = await getDoc(challengeRef);

        if (challengeDoc.exists()) {
          const data = challengeDoc.data();
          
          // Check if it's a new day
          const lastCompleted = data.lastCompletedDate;
          const today = new Date().toDateString();
          
          if (lastCompleted !== today) {
            // New day - reset completions
            await setDoc(challengeRef, {
              completedToday: [],
              lastCompletedDate: today,
              totalCompleted: data.totalCompleted || 0,
              currentStreak: data.currentStreak || 0
            });
            setCompletedToday([]);
            setStreakDays(data.currentStreak || 0);
          } else {
            setCompletedToday(data.completedToday || []);
            setStreakDays(data.currentStreak || 0);
          }
        } else {
          // First time - create document
          await setDoc(challengeRef, {
            completedToday: [],
            lastCompletedDate: new Date().toDateString(),
            totalCompleted: 0,
            currentStreak: 0
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading challenges:', error);
        setLoading(false);
      }
    };

    loadChallenges();
  }, [user?.uid]);

  // ============================================
  // 🎉 AUTO-COMPLETE CHECK
  // ============================================
  useEffect(() => {
    const checkAutoComplete = async () => {
      if (!user?.uid || loading) return;

      for (const challenge of challenges) {
        // Skip if already completed
        if (completedToday.includes(challenge.id)) continue;
        
        // Skip manual challenges
        if (challenge.manual) continue;
        
        // Check if progress meets target
        const progress = progressData[challenge.id];
        if (progress && progress.current >= progress.target) {
          // Auto-complete this challenge!
          await completeChallenge(challenge, true);
        }
      }
    };

    checkAutoComplete();
  }, [progressData, completedToday, challenges, user?.uid, loading]);

  // ============================================
  // ✅ COMPLETE CHALLENGE
  // ============================================
  const completeChallenge = async (challenge, isAutoComplete = false) => {
    if (!user?.uid) {
      console.log('❌ No user ID for completing challenge');
      return;
    }
    if (completedToday.includes(challenge.id)) {
      console.log('⚠️ Challenge already completed:', challenge.id);
      return;
    }

    console.log('🎯 Attempting to complete challenge:', challenge.title);

    try {
      HapticService.tapMedium();
      
      // Calculate bonus XP
      let totalXP = challenge.xp;
      let bonusReason = '';

      if (streakDays >= 7) {
        totalXP = Math.round(totalXP * 1.5);
        bonusReason = '🔥 7-Day Streak Bonus! (1.5x)';
      } else if (streakDays >= 3) {
        totalXP = Math.round(totalXP * 1.25);
        bonusReason = '🔥 3-Day Streak Bonus! (1.25x)';
      }

      const newCompletedToday = [...completedToday, challenge.id];

      // Update Firestore - use setDoc with merge to avoid errors
      const challengeRef = doc(db, 'dailyChallenges', user.uid);
      
      console.log('📝 Saving to Firestore...', { 
        userId: user.uid, 
        challengeId: challenge.id,
        completedToday: newCompletedToday 
      });
      
      await setDoc(challengeRef, {
        completedToday: newCompletedToday,
        lastCompletedDate: new Date().toDateString(),
        totalCompleted: increment(1)
      }, { merge: true });

      console.log('✅ Firestore updated successfully');

      // Update local state
      setCompletedToday(newCompletedToday);

      // Show completion modal
      setShowCompletion({
        ...challenge,
        totalXP,
        bonusReason,
        isAutoComplete
      });

      // Fire confetti
      confetti({
        particleCount: isAutoComplete ? 150 : 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#8b5cf6']
      });

      HapticService.notifySuccess();

      // Award XP
      if (onXPEarned) {
        onXPEarned(totalXP, `Challenge: ${challenge.title}`);
      }

      console.log(`✅ Challenge completed: ${challenge.title} (+${totalXP} XP)`);
    } catch (error) {
      console.error('❌ Error completing challenge:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      HapticService.notifyError();
      
      // Show error to user
      alert(`Failed to complete challenge: ${error.message || 'Unknown error'}`);
    }
  };

  // ============================================
  // 📊 CALCULATE OVERALL PROGRESS
  // ============================================
  const totalChallenges = challenges.length;
  const completedCount = completedToday.length;
  const overallProgress = (completedCount / totalChallenges) * 100;

  // ============================================
  // 🎨 RENDER PROGRESS BAR
  // ============================================
  const renderProgressBar = (progress, tier) => {
    const percentage = Math.min((progress.current / progress.target) * 100, 100);
    const tierStyle = getTierStyle(tier);
    
    return (
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '0.75rem'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: tierStyle.gradient,
          borderRadius: '4px',
          transition: 'width 0.5s ease-out',
          boxShadow: percentage > 0 ? `0 0 10px ${tierStyle.color}` : 'none'
        }} />
      </div>
    );
  };

  // ============================================
  // 🎯 RENDER CHALLENGE CARD
  // ============================================
  const renderChallenge = (challenge) => {
    const isCompleted = completedToday.includes(challenge.id);
    const progress = progressData[challenge.id] || { current: 0, target: challenge.target };
    const tierStyle = getTierStyle(challenge.tier);
    const isManual = challenge.manual;
    
    return (
      <div
        key={challenge.id}
        style={{
          background: isCompleted 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))'
            : tierStyle.bg,
          borderRadius: '16px',
          padding: '1.25rem',
          border: isCompleted 
            ? '2px solid rgba(34, 197, 94, 0.5)'
            : `1px solid ${tierStyle.border}`,
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Completed checkmark overlay */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={18} color="white" />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {/* Icon */}
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: tierStyle.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
          }}>
            {challenge.icon}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header row */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '0.25rem'
            }}>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                color: tierStyle.color,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {tierStyle.label}
              </span>
              <span style={{
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {challenge.category}
              </span>
            </div>

            {/* Title */}
            <h4 style={{
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              margin: '0 0 0.25rem 0',
              textDecoration: isCompleted ? 'line-through' : 'none',
              opacity: isCompleted ? 0.7 : 1
            }}>
              {challenge.title}
            </h4>

            {/* Description */}
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.8rem',
              margin: 0
            }}>
              {challenge.description}
            </p>

            {/* Progress bar (only for non-completed) */}
            {!isCompleted && !isManual && renderProgressBar(progress, challenge.tier)}

            {/* Progress text */}
            {!isCompleted && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  {isManual ? 'Manual completion' : `${progress.current}/${progress.target}`}
                </span>
                
                {/* XP Badge */}
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  ⚡ {challenge.xp} XP
                </span>
              </div>
            )}

            {/* Manual complete button (only for manual challenges) */}
            {isManual && !isCompleted && (
              <button
                onClick={() => completeChallenge(challenge, false)}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: tierStyle.gradient,
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle size={16} />
                Mark as Complete
              </button>
            )}

            {/* Completed badge */}
            {isCompleted && (
              <div style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#22c55e',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                <Sparkles size={14} />
                Completed! +{challenge.xp} XP
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // 🎨 RENDER
  // ============================================
  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading challenges...</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      zIndex: 10000,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '60px 1.25rem 1rem',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)'
      }}>
        {/* Title row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: '800',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Target size={28} color="#fbbf24" />
            Daily Challenges
          </h1>
          
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={24} color="white" />
          </button>
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          width: 'fit-content',
          margin: '0 auto 1rem'
        }}>
          <Clock size={16} color="rgba(255,255,255,0.7)" />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            {timeRemaining.active 
              ? `Resets in ${timeRemaining.hours}h ${timeRemaining.minutes}m`
              : 'Start a challenge to begin timer'
            }
          </span>
        </div>

        {/* Tab buttons */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(0,0,0,0.2)',
          padding: '0.25rem',
          borderRadius: '12px'
        }}>
          {[
            { id: 'today', label: "Today's", icon: <Target size={16} /> },
            { id: 'streak', label: 'Streak', icon: <Flame size={16} /> },
            { id: 'rewards', label: 'Rewards', icon: <Gift size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                  : 'transparent',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 1.25rem 100px',
        WebkitOverflowScrolling: 'touch'
      }}>
        {activeTab === 'today' && (
          <>
            {/* Overall Progress */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  Today's Progress
                </span>
                <span style={{ color: 'white', fontWeight: '700' }}>
                  {completedCount}/{totalChallenges}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '10px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${overallProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>

            {/* Challenges list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {challenges.map(renderChallenge)}
            </div>
          </>
        )}

        {activeTab === 'streak' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '2rem'
          }}>
            {/* Current bonus */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              width: '100%',
              maxWidth: '300px',
              marginBottom: '2rem'
            }}>
              <Trophy size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'white', fontSize: '1.2rem', margin: '0 0 0.5rem' }}>
                Current Bonus
              </h3>
              <p style={{
                color: '#fbbf24',
                fontSize: '2.5rem',
                fontWeight: '800',
                margin: '0 0 0.5rem'
              }}>
                {streakDays >= 7 ? '1.5x' : streakDays >= 3 ? '1.25x' : '1x'} XP
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                {streakDays >= 7 
                  ? '🔥 You\'re on fire!' 
                  : streakDays >= 3 
                    ? `${7 - streakDays} more days for 1.5x bonus`
                    : `${3 - streakDays} more days for 1.25x bonus`
                }
              </p>
            </div>

            {/* Streak rewards */}
            <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '1rem', alignSelf: 'flex-start' }}>
              Streak Rewards
            </h3>
            
            {[
              { days: 3, reward: '1.25x XP Multiplier', icon: '⚡' },
              { days: 7, reward: '1.5x XP Multiplier', icon: '🔥' },
              { days: 14, reward: 'Exclusive Badge', icon: '🎖️' },
              { days: 30, reward: '2x XP + Special Title', icon: '👑' }
            ].map(milestone => {
              const unlocked = streakDays >= milestone.days;
              return (
                <div
                  key={milestone.days}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: unlocked 
                      ? 'rgba(34, 197, 94, 0.1)' 
                      : 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    marginBottom: '0.75rem',
                    border: unlocked 
                      ? '1px solid rgba(34, 197, 94, 0.3)' 
                      : '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{milestone.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      color: 'white', 
                      fontWeight: '600', 
                      margin: 0,
                      fontSize: '0.95rem'
                    }}>
                      {milestone.days} Day Streak
                    </p>
                    <p style={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      margin: 0,
                      fontSize: '0.8rem'
                    }}>
                      {milestone.reward}
                    </p>
                  </div>
                  {unlocked ? (
                    <CheckCircle size={24} color="#22c55e" />
                  ) : (
                    <Lock size={20} color="rgba(255,255,255,0.3)" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div style={{ paddingTop: '1rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '2rem' }}>
              Complete challenges to earn XP and unlock rewards!
            </p>
            
            {/* Rewards preview */}
            {[
              { xp: 500, reward: 'Bronze Explorer Badge', icon: '🥉', unlocked: (gameStats?.xp || 0) >= 500 },
              { xp: 1000, reward: 'Silver Adventurer Badge', icon: '🥈', unlocked: (gameStats?.xp || 0) >= 1000 },
              { xp: 2500, reward: 'Gold Date Master Badge', icon: '🥇', unlocked: (gameStats?.xp || 0) >= 2500 },
              { xp: 5000, reward: 'Platinum Legend Badge', icon: '💎', unlocked: (gameStats?.xp || 0) >= 5000 },
              { xp: 10000, reward: 'Diamond Romance Expert', icon: '💝', unlocked: (gameStats?.xp || 0) >= 10000 }
            ].map(reward => (
              <div
                key={reward.xp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: reward.unlocked 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1))'
                    : 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  marginBottom: '0.75rem',
                  border: reward.unlocked 
                    ? '1px solid rgba(139, 92, 246, 0.3)' 
                    : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <span style={{ 
                  fontSize: '2rem',
                  opacity: reward.unlocked ? 1 : 0.3
                }}>
                  {reward.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    color: 'white', 
                    fontWeight: '600', 
                    margin: 0 
                  }}>
                    {reward.reward}
                  </p>
                  <p style={{ 
                    color: reward.unlocked ? '#22c55e' : 'rgba(255,255,255,0.5)', 
                    margin: 0,
                    fontSize: '0.8rem'
                  }}>
                    {reward.unlocked ? '✓ Unlocked!' : `${reward.xp.toLocaleString()} XP required`}
                  </p>
                </div>
                {reward.unlocked ? (
                  <Sparkles size={20} color="#8b5cf6" />
                ) : (
                  <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompletion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowCompletion(null)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '24px',
              padding: '2.5rem',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              animation: 'scaleIn 0.3s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
              animation: 'bounce 0.5s ease-out'
            }}>
              {showCompletion.icon}
            </div>
            
            <h2 style={{
              color: '#22c55e',
              fontSize: '1.5rem',
              fontWeight: '800',
              margin: '0 0 0.5rem'
            }}>
              {showCompletion.isAutoComplete ? '🎉 Auto-Completed!' : '🎉 Challenge Complete!'}
            </h2>
            
            <p style={{
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '600',
              margin: '0 0 1rem'
            }}>
              {showCompletion.title}
            </p>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <p style={{
                color: '#fbbf24',
                fontSize: '2rem',
                fontWeight: '800',
                margin: 0
              }}>
                +{showCompletion.totalXP} XP
              </p>
              {showCompletion.bonusReason && (
                <p style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem',
                  margin: '0.5rem 0 0'
                }}>
                  {showCompletion.bonusReason}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowCompletion(null)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}