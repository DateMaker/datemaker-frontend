// 🔔 NOTIFICATION SERVICE
// Central service for sending all types of notifications in DateMaker
// Import this anywhere you need to send notifications

import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// ============================================
// NOTIFICATION TYPES
// ============================================
export const NOTIFICATION_TYPES = {
  DATE_INVITE: 'date_invite',
  SURPRISE_DATE: 'surprise_date',
  NEW_MESSAGE: 'new_message',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  DATE_LIKED: 'date_liked',
  DATE_COMMENT: 'date_comment',
  ACHIEVEMENT: 'achievement',
  STREAK: 'streak',
  DATE_REMINDER: 'date_reminder',
  GROUP_INVITE: 'group_invite'
};

// ============================================
// CORE SEND FUNCTION
// ============================================
export const sendNotification = async (toUserId, type, data) => {
  try {
    // Don't send notification to yourself
    if (data.fromUserId === toUserId) {
      console.log('🔔 Skipping self-notification');
      return true;
    }

    const notificationData = {
      userId: toUserId,
      type: type,
      ...data,
      createdAt: serverTimestamp(),
      read: false
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    console.log(`🔔 Notification sent: ${type} to ${toUserId}`, docRef.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return false;
  }
};

// ============================================
// HELPER: Get user display name
// ============================================
const getUserDisplayName = (user) => {
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  return 'Someone';
};

// ============================================
// SPECIFIC NOTIFICATION FUNCTIONS
// ============================================

// 📅 DATE INVITE - When someone invites you to a date
export const sendDateInviteNotification = async (fromUser, toUserId, dateData) => {
  const senderName = getUserDisplayName(fromUser);
  
  return sendNotification(toUserId, NOTIFICATION_TYPES.DATE_INVITE, {
    fromUserId: fromUser.uid,
    fromUserEmail: fromUser.email,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `${senderName} invited you to "${dateData.title}" 📅`,
    scheduledDate: dateData.scheduledDate || null,
    scheduledTime: dateData.scheduledTime || null,
    emoji: '📅'
  });
};

// 🎁 SURPRISE DATE - When someone plans a surprise for you
export const sendSurpriseDateNotification = async (fromUser, toUserId, surpriseData) => {
  const senderName = getUserDisplayName(fromUser);
  
  return sendNotification(toUserId, NOTIFICATION_TYPES.SURPRISE_DATE, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    surpriseId: surpriseData.surpriseId,
    message: `🎁 Someone special planned a surprise date for you!`,
    scheduledDate: surpriseData.scheduledDate || null,
    hint: surpriseData.hint || null,
    emoji: '🎁'
  });
};

// 💬 NEW MESSAGE - When someone sends you a message
export const sendMessageNotification = async (fromUser, toUserId, messageData) => {
  const senderName = getUserDisplayName(fromUser);
  
  // Truncate message preview
  const preview = messageData.text?.length > 50 
    ? messageData.text.substring(0, 50) + '...' 
    : messageData.text;
  
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

// 👋 FRIEND REQUEST - When someone sends you a friend request
export const sendFriendRequestNotification = async (fromUser, toUserId) => {
  const senderName = getUserDisplayName(fromUser);
  
  return sendNotification(toUserId, NOTIFICATION_TYPES.FRIEND_REQUEST, {
    fromUserId: fromUser.uid,
    fromUserEmail: fromUser.email,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    message: `${senderName} wants to be your friend! 👋`,
    emoji: '👋'
  });
};

// 🎉 FRIEND ACCEPTED - When someone accepts your friend request
export const sendFriendAcceptedNotification = async (fromUser, toUserId) => {
  const senderName = getUserDisplayName(fromUser);
  
  return sendNotification(toUserId, NOTIFICATION_TYPES.FRIEND_ACCEPTED, {
    fromUserId: fromUser.uid,
    fromUserEmail: fromUser.email,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    message: `${senderName} accepted your friend request! 🎉`,
    emoji: '🎉'
  });
};

// ❤️ DATE LIKED - When someone likes your shared date
export const sendDateLikedNotification = async (fromUser, toUserId, dateData) => {
  const senderName = getUserDisplayName(fromUser);
  
  return sendNotification(toUserId, NOTIFICATION_TYPES.DATE_LIKED, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `${senderName} loved your "${dateData.title}" date! ❤️`,
    emoji: '❤️'
  });
};

// 💬 DATE COMMENT - When someone comments on your shared date
export const sendDateCommentNotification = async (fromUser, toUserId, dateData, commentText) => {
  const senderName = getUserDisplayName(fromUser);
  
  // Truncate comment preview
  const preview = commentText?.length > 50 
    ? commentText.substring(0, 50) + '...' 
    : commentText;
  
  return sendNotification(toUserId, NOTIFICATION_TYPES.DATE_COMMENT, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    fromUserPhoto: fromUser.photoURL || null,
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `${senderName} commented on "${dateData.title}"`,
    preview: preview,
    emoji: '💬'
  });
};

// 🏆 ACHIEVEMENT UNLOCKED
export const sendAchievementNotification = async (toUserId, achievementData) => {
  return sendNotification(toUserId, NOTIFICATION_TYPES.ACHIEVEMENT, {
    achievementId: achievementData.id,
    achievementName: achievementData.name,
    achievementIcon: achievementData.icon,
    message: `🏆 Achievement Unlocked: ${achievementData.name}!`,
    description: achievementData.description,
    xpEarned: achievementData.xp || 0,
    emoji: '🏆'
  });
};

// 🔥 STREAK MILESTONE
export const sendStreakNotification = async (toUserId, streakData) => {
  return sendNotification(toUserId, NOTIFICATION_TYPES.STREAK, {
    streakCount: streakData.count,
    message: `🔥 ${streakData.count} day streak! Keep the momentum going!`,
    bonusXp: streakData.bonusXp || 0,
    emoji: '🔥'
  });
};

// ⏰ DATE REMINDER - Remind about upcoming date
export const sendDateReminderNotification = async (toUserId, dateData) => {
  return sendNotification(toUserId, NOTIFICATION_TYPES.DATE_REMINDER, {
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `⏰ Reminder: "${dateData.title}" is coming up!`,
    scheduledDate: dateData.scheduledDate,
    scheduledTime: dateData.scheduledTime,
    emoji: '⏰'
  });
};

// 👥 GROUP INVITE - Invited to a group chat
export const sendGroupInviteNotification = async (fromUser, toUserId, groupData) => {
  const senderName = getUserDisplayName(fromUser);
  
  return sendNotification(toUserId, NOTIFICATION_TYPES.GROUP_INVITE, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    groupId: groupData.groupId,
    groupName: groupData.name,
    message: `${senderName} added you to "${groupData.name}" group chat`,
    emoji: '👥'
  });
};

// ============================================
// BATCH NOTIFICATIONS
// ============================================

// Send notification to multiple users (e.g., all participants of a date)
export const sendBatchNotifications = async (userIds, type, data) => {
  const results = await Promise.all(
    userIds.map(userId => sendNotification(userId, type, data))
  );
  
  const successCount = results.filter(r => r === true).length;
  console.log(`🔔 Batch notifications: ${successCount}/${userIds.length} sent successfully`);
  
  return successCount === userIds.length;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Check if user has unread notifications
export const hasUnreadNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size > 0;
  } catch (error) {
    console.error('Error checking unread notifications:', error);
    return false;
  }
};

// Get unread count
export const getUnreadCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

export default {
  sendNotification,
  sendDateInviteNotification,
  sendSurpriseDateNotification,
  sendMessageNotification,
  sendFriendRequestNotification,
  sendFriendAcceptedNotification,
  sendDateLikedNotification,
  sendDateCommentNotification,
  sendAchievementNotification,
  sendStreakNotification,
  sendDateReminderNotification,
  sendGroupInviteNotification,
  sendBatchNotifications,
  hasUnreadNotifications,
  getUnreadCount,
  NOTIFICATION_TYPES
};