// ============================================
// 🔔 NOTIFICATION SERVICE - FIXED
// DateMaker - In-App Notifications (Firestore)
// ============================================
// FIXES:
// ✅ Fixed corrupted emoji
// ✅ Added engagement notification types
// ✅ Added helper functions for Phase 3
// ============================================

import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

// ============================================
// 📋 NOTIFICATION TYPES
// ============================================
export const NOTIFICATION_TYPES = {
  // Social notifications
  DATE_INVITE: 'date_invite',
  SURPRISE_DATE: 'surprise_date',
  NEW_MESSAGE: 'new_message',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  DATE_LIKED: 'date_liked',
  DATE_COMMENT: 'date_comment',
  
  // Gamification notifications
  ACHIEVEMENT: 'achievement',
  STREAK: 'streak',
  LEVEL_UP: 'level_up',
  
  // 🆕 Phase 3: Engagement notifications
  STREAK_MILESTONE: 'streak_milestone',
  STREAK_AT_RISK: 'streak_at_risk',
  CHALLENGE_COMPLETE: 'challenge_complete',
  CHALLENGE_REMINDER: 'challenge_reminder',
  MYSTERY_BONUS: 'mystery_bonus',
  MONTHLY_RECAP: 'monthly_recap',
  WEEKLY_SUMMARY: 'weekly_summary',
  
  // System notifications
  SYSTEM: 'system',
  PROMO: 'promo'
};

// ============================================
// 🛠️ HELPER FUNCTIONS
// ============================================

const getUserDisplayName = (user) => {
  if (!user) return 'Someone';
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  return 'Someone';
};

// ============================================
// 📤 CORE SEND FUNCTION
// ============================================

export const sendNotification = async (toUserId, type, data) => {
  try {
    // Don't send notification to yourself
    if (data.fromUserId === toUserId) {
      console.log('🔔 Skipping self-notification');
      return true;
    }

    const notification = {
      userId: toUserId,
      type: type,
      ...data,
      createdAt: serverTimestamp(),
      read: false
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log(`🔔 Notification sent: ${type} to ${toUserId}`);
    return true;

  } catch (error) {
    console.error('🔔 Error sending notification:', error);
    return false;
  }
};

// ============================================
// 👫 SOCIAL NOTIFICATIONS
// ============================================

export const sendFriendRequestNotification = async (fromUser, toUserId) => {
  const senderName = getUserDisplayName(fromUser);
  return sendNotification(toUserId, NOTIFICATION_TYPES.FRIEND_REQUEST, {
    fromUserId: fromUser.uid,
    fromUserEmail: fromUser.email,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    message: `${senderName} wants to be your friend!`,
    emoji: '👋'
  });
};

export const sendFriendAcceptedNotification = async (fromUser, toUserId) => {
  const senderName = getUserDisplayName(fromUser);
  return sendNotification(toUserId, NOTIFICATION_TYPES.FRIEND_ACCEPTED, {
    fromUserId: fromUser.uid,
    fromUserEmail: fromUser.email,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    message: `${senderName} accepted your friend request!`,
    emoji: '🎉'
  });
};

export const sendDateLikedNotification = async (fromUser, toUserId, dateData) => {
  const senderName = getUserDisplayName(fromUser);
  return sendNotification(toUserId, NOTIFICATION_TYPES.DATE_LIKED, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `${senderName} loved your "${dateData.title}" date!`,
    emoji: '❤️'
  });
};

export const sendDateCommentNotification = async (fromUser, toUserId, dateData, comment) => {
  const senderName = getUserDisplayName(fromUser);
  const preview = comment.length > 50 ? comment.substring(0, 50) + '...' : comment;
  return sendNotification(toUserId, NOTIFICATION_TYPES.DATE_COMMENT, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `${senderName} commented on your date`,
    preview: preview,
    emoji: '💬'
  });
};

export const sendMessageNotification = async (fromUser, toUserId, messageData) => {
  const senderName = getUserDisplayName(fromUser);
  const preview = messageData.text?.length > 50 
    ? messageData.text.substring(0, 50) + '...' 
    : messageData.text || 'Sent a message';
  return sendNotification(toUserId, NOTIFICATION_TYPES.NEW_MESSAGE, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    conversationId: messageData.conversationId,
    message: `${senderName} sent you a message`,
    preview: preview,
    emoji: '💬'
  });
};

export const sendDateInviteNotification = async (fromUser, toUserId, dateData) => {
  const senderName = getUserDisplayName(fromUser);
  return sendNotification(toUserId, NOTIFICATION_TYPES.DATE_INVITE, {
    fromUserId: fromUser.uid,
    fromUserEmail: fromUser.email,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `${senderName} invited you to "${dateData.title}"`,
    scheduledDate: dateData.scheduledDate || null,
    scheduledTime: dateData.scheduledTime || null,
    emoji: '📅'
  });
};

export const sendSurpriseDateNotification = async (fromUser, toUserId, dateData) => {
  const senderName = getUserDisplayName(fromUser);
  return sendNotification(toUserId, NOTIFICATION_TYPES.SURPRISE_DATE, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    dateId: dateData.dateId,
    message: `${senderName} planned a surprise date for you!`,
    scheduledDate: dateData.scheduledDate || null,
    emoji: '🎁'
  });
};

// ============================================
// 🏆 GAMIFICATION NOTIFICATIONS
// ============================================

export const sendAchievementNotification = async (userId, achievement) => {
  return sendNotification(userId, NOTIFICATION_TYPES.ACHIEVEMENT, {
    achievementId: achievement.id,
    achievementTitle: achievement.title,
    achievementIcon: achievement.icon,
    xpEarned: achievement.xp,
    message: `You earned "${achievement.title}"!`,
    emoji: '🏆'
  });
};

export const sendLevelUpNotification = async (userId, newLevel, rewards) => {
  return sendNotification(userId, NOTIFICATION_TYPES.LEVEL_UP, {
    newLevel: newLevel,
    rewards: rewards,
    message: `Congratulations! You reached Level ${newLevel}!`,
    emoji: '⬆️'
  });
};

export const sendStreakNotification = async (userId, streakCount) => {
  return sendNotification(userId, NOTIFICATION_TYPES.STREAK, {
    streakCount: streakCount,
    message: `Amazing! You're on a ${streakCount}-week streak!`,
    emoji: '🔥'
  });
};

// ============================================
// 🆕 PHASE 3: ENGAGEMENT NOTIFICATIONS
// ============================================

export const sendStreakMilestoneNotification = async (userId, streakWeeks, multiplier) => {
  return sendNotification(userId, NOTIFICATION_TYPES.STREAK_MILESTONE, {
    streakWeeks: streakWeeks,
    multiplier: multiplier,
    message: `${streakWeeks} week streak! You now earn ${multiplier}x XP!`,
    emoji: '🔥'
  });
};

export const sendStreakAtRiskNotification = async (userId, streakWeeks, daysRemaining) => {
  return sendNotification(userId, NOTIFICATION_TYPES.STREAK_AT_RISK, {
    streakWeeks: streakWeeks,
    daysRemaining: daysRemaining,
    message: `Your ${streakWeeks}-week streak is at risk! ${daysRemaining} days left.`,
    emoji: '⚠️'
  });
};

export const sendChallengeCompleteNotification = async (userId, challenge, xpEarned) => {
  return sendNotification(userId, NOTIFICATION_TYPES.CHALLENGE_COMPLETE, {
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    xpEarned: xpEarned,
    message: `Challenge complete: "${challenge.title}" +${xpEarned} XP`,
    emoji: '🎯'
  });
};

export const sendMysteryBonusNotification = async (userId, multiplier) => {
  return sendNotification(userId, NOTIFICATION_TYPES.MYSTERY_BONUS, {
    multiplier: multiplier,
    message: `Mystery Bonus Day! All XP is ${multiplier}x today!`,
    emoji: '🎰'
  });
};

export const sendMonthlyRecapNotification = async (userId, monthName, stats) => {
  return sendNotification(userId, NOTIFICATION_TYPES.MONTHLY_RECAP, {
    monthName: monthName,
    totalDates: stats.totalDates,
    xpEarned: stats.xpEarned,
    message: `Your ${monthName} recap is ready! ${stats.totalDates} dates, ${stats.xpEarned} XP`,
    emoji: '📊'
  });
};

export const sendWeeklySummaryNotification = async (userId, stats) => {
  return sendNotification(userId, NOTIFICATION_TYPES.WEEKLY_SUMMARY, {
    datesThisWeek: stats.dates,
    xpThisWeek: stats.xp,
    message: `This week: ${stats.dates} dates, ${stats.xp} XP earned!`,
    emoji: '📅'
  });
};

// ============================================
// 📖 READ/QUERY FUNCTIONS
// ============================================

export const getUnreadNotifications = async (userId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('🔔 Error getting notifications:', error);
    return [];
  }
};

export const getAllNotifications = async (userId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('🔔 Error getting notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
    return true;
  } catch (error) {
    console.error('🔔 Error marking notification as read:', error);
    return false;
  }
};

export const markAllAsRead = async (userId) => {
  try {
    const notifications = await getUnreadNotifications(userId, 100);
    const promises = notifications.map(n => markNotificationAsRead(n.id));
    await Promise.all(promises);
    console.log(`🔔 Marked ${notifications.length} notifications as read`);
    return true;
  } catch (error) {
    console.error('🔔 Error marking all as read:', error);
    return false;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return true;
  } catch (error) {
    console.error('🔔 Error deleting notification:', error);
    return false;
  }
};

// ============================================
// 🔄 REAL-TIME LISTENER
// ============================================

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    callback(notifications);
  }, (error) => {
    console.error('🔔 Notification listener error:', error);
  });
};

// ============================================
// 📊 UTILITY FUNCTIONS
// ============================================

export const getUnreadCount = async (userId) => {
  try {
    const notifications = await getUnreadNotifications(userId, 100);
    return notifications.length;
  } catch (error) {
    return 0;
  }
};

export const getNotificationIcon = (type) => {
  const icons = {
    [NOTIFICATION_TYPES.FRIEND_REQUEST]: '👋',
    [NOTIFICATION_TYPES.FRIEND_ACCEPTED]: '🎉',
    [NOTIFICATION_TYPES.DATE_LIKED]: '❤️',
    [NOTIFICATION_TYPES.DATE_COMMENT]: '💬',
    [NOTIFICATION_TYPES.NEW_MESSAGE]: '💬',
    [NOTIFICATION_TYPES.DATE_INVITE]: '📅',
    [NOTIFICATION_TYPES.SURPRISE_DATE]: '🎁',
    [NOTIFICATION_TYPES.ACHIEVEMENT]: '🏆',
    [NOTIFICATION_TYPES.LEVEL_UP]: '⬆️',
    [NOTIFICATION_TYPES.STREAK]: '🔥',
    [NOTIFICATION_TYPES.STREAK_MILESTONE]: '🔥',
    [NOTIFICATION_TYPES.STREAK_AT_RISK]: '⚠️',
    [NOTIFICATION_TYPES.CHALLENGE_COMPLETE]: '🎯',
    [NOTIFICATION_TYPES.MYSTERY_BONUS]: '🎰',
    [NOTIFICATION_TYPES.MONTHLY_RECAP]: '📊',
    [NOTIFICATION_TYPES.WEEKLY_SUMMARY]: '📅',
    [NOTIFICATION_TYPES.SYSTEM]: 'ℹ️',
    [NOTIFICATION_TYPES.PROMO]: '🎁'
  };
  return icons[type] || '🔔';
};

export default {
  NOTIFICATION_TYPES,
  sendNotification,
  sendFriendRequestNotification,
  sendFriendAcceptedNotification,
  sendDateLikedNotification,
  sendDateCommentNotification,
  sendMessageNotification,
  sendDateInviteNotification,
  sendSurpriseDateNotification,
  sendAchievementNotification,
  sendLevelUpNotification,
  sendStreakNotification,
  sendStreakMilestoneNotification,
  sendStreakAtRiskNotification,
  sendChallengeCompleteNotification,
  sendMysteryBonusNotification,
  sendMonthlyRecapNotification,
  sendWeeklySummaryNotification,
  getUnreadNotifications,
  getAllNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  getUnreadCount,
  getNotificationIcon
};