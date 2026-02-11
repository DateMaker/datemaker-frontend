import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const NOTIFICATION_TYPES = {
  DATE_INVITE: 'date_invite',
  SURPRISE_DATE: 'surprise_date',
  NEW_MESSAGE: 'new_message',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_ACCEPTED: 'friend_accepted',
  DATE_LIKED: 'date_liked',
  DATE_COMMENT: 'date_comment',
  ACHIEVEMENT: 'achievement',
  STREAK: 'streak'
};

const getUserDisplayName = (user) => {
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0];
  return 'Someone';
};

export const sendNotification = async (toUserId, type, data) => {
  try {
    if (data.fromUserId === toUserId) return true;
    await addDoc(collection(db, 'notifications'), {
      userId: toUserId,
      type: type,
      ...data,
      createdAt: serverTimestamp(),
      read: false
    });
    console.log(`�� Notification sent: ${type} to ${toUserId}`);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

export const sendFriendRequestNotification = async (fromUser, toUserId) => {
  const senderName = getUserDisplayName(fromUser);
  return sendNotification(toUserId, NOTIFICATION_TYPES.FRIEND_REQUEST, {
    fromUserId: fromUser.uid,
    fromUserEmail: fromUser.email,
    fromUserName: senderName,
    message: `${senderName} wants to be your friend! 👋`,
    emoji: '👋'
  });
};

export const sendFriendAcceptedNotification = async (fromUser, toUserId) => {
  const senderName = getUserDisplayName(fromUser);
  return sendNotification(toUserId, NOTIFICATION_TYPES.FRIEND_ACCEPTED, {
    fromUserId: fromUser.uid,
    fromUserEmail: fromUser.email,
    fromUserName: senderName,
    message: `${senderName} accepted your friend request! 🎉`,
    emoji: '🎉'
  });
};

export const sendDateLikedNotification = async (fromUser, toUserId, dateData) => {
  const senderName = getUserDisplayName(fromUser);
  return sendNotification(toUserId, NOTIFICATION_TYPES.DATE_LIKED, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `${senderName} loved your "${dateData.title}" date! ❤️`,
    emoji: '❤️'
  });
};

export const sendMessageNotification = async (fromUser, toUserId, messageData) => {
  const senderName = getUserDisplayName(fromUser);
  const preview = messageData.text?.length > 50 
    ? messageData.text.substring(0, 50) + '...' 
    : messageData.text;
  return sendNotification(toUserId, NOTIFICATION_TYPES.NEW_MESSAGE, {
    fromUserId: fromUser.uid,
    fromUserName: senderName,
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
    dateId: dateData.dateId,
    dateTitle: dateData.title,
    message: `${senderName} invited you to "${dateData.title}" 📅`,
    scheduledDate: dateData.scheduledDate || null,
    scheduledTime: dateData.scheduledTime || null,
    emoji: '📅'
  });
};
