const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ============================================
// PUSH NOTIFICATION HELPER
// ============================================
/**
 * Send push notification to a user
 * @param {string} userId - The user ID to send notification to
 * @param {object} notification - The notification title and body
 * @param {object} data - Additional data to send with notification
 * @return {Promise} - The messaging response
 */
async function sendPushNotification(userId, notification, data = {}) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.log("User not found:", userId);
      return;
    }

    const userData = userDoc.data();
    const tokens = userData.fcmTokens || [];

    if (tokens.length === 0) {
      console.log("No FCM tokens for user:", userId);
      return;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...data,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
        payload: {
          aps: {
            "badge": 1,
            "sound": "default",
            "content-available": 1,
          },
        },
      },
      tokens: tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`Sent ${response.successCount}/${tokens.length} notifications to ${userId}`);

    // Remove invalid tokens
    if (response.failureCount > 0) {
      const tokensToRemove = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (errorCode === "messaging/invalid-registration-token" ||
              errorCode === "messaging/registration-token-not-registered") {
            tokensToRemove.push(tokens[idx]);
          }
        }
      });

      if (tokensToRemove.length > 0) {
        await db.collection("users").doc(userId).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove),
        });
        console.log("Removed invalid tokens:", tokensToRemove.length);
      }
    }

    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// ============================================
// NEW MESSAGE PUSH NOTIFICATION
// ============================================
exports.sendMessageNotification = onDocumentCreated(
    "messages/{messageId}",
    async (event) => {
      try {
        const message = event.data.data();
        const senderId = message.userId;
        const conversationId = message.conversationId;

        if (!conversationId) return null;

        const convDoc = await db.collection("conversations").doc(conversationId).get();
        if (!convDoc.exists) return null;

        const conversation = convDoc.data();
        const participants = conversation.participants || [];

        // Get sender info
        const senderDoc = await db.collection("users").doc(senderId).get();
        const senderData = senderDoc.data() || {};
        const senderName = senderData.name || senderData.email?.split("@")[0] || "Someone";

        // Send to all participants except sender
        for (const participantId of participants) {
          if (participantId === senderId) continue;

          // Check if blocked
          const blockedQuery = await db.collection("blockedUsers")
              .where("blockedBy", "==", participantId)
              .where("blockedUserId", "==", senderId)
              .get();

          if (!blockedQuery.empty) continue;

          const title = conversation.isGroup ? conversation.name : senderName;
          const body = conversation.isGroup ?
            `${senderName}: ${message.text}` :
            message.text;

          await sendPushNotification(participantId, {
            title: title,
            body: body.length > 100 ? body.substring(0, 100) + "..." : body,
          }, {
            type: "message",
            conversationId: conversationId,
            senderId: senderId,
          });
        }

        console.log("Message notifications sent");
        return null;
      } catch (error) {
        console.error("Error in sendMessageNotification:", error);
        return null;
      }
    },
);

// ============================================
// FRIEND REQUEST NOTIFICATION
// ============================================
exports.sendFriendRequestNotification = onDocumentCreated(
    "friendRequests/{requestId}",
    async (event) => {
      try {
        const request = event.data.data();

        if (request.status !== "pending") return null;

        const senderName = request.fromUserEmail?.split("@")[0] || "Someone";

        await sendPushNotification(request.toUserId, {
          title: "New Friend Request 💜",
          body: `${senderName} wants to be your friend!`,
        }, {
          type: "friend_request",
          requestId: event.params.requestId,
          fromUserId: request.fromUserId,
        });

        console.log("Friend request notification sent");
        return null;
      } catch (error) {
        console.error("Error in sendFriendRequestNotification:", error);
        return null;
      }
    },
);

// ============================================
// FRIEND ACCEPTED NOTIFICATION
// ============================================
exports.sendFriendAcceptedNotification = onDocumentUpdated(
    "friendRequests/{requestId}",
    async (event) => {
      try {
        const before = event.data.before.data();
        const after = event.data.after.data();

        if (before.status === "pending" && after.status === "accepted") {
          const accepterName = after.toUserEmail?.split("@")[0] || "Someone";

          await sendPushNotification(after.fromUserId, {
            title: "Friend Request Accepted! 🎉",
            body: `${accepterName} accepted your friend request!`,
          }, {
            type: "friend_accepted",
            friendId: after.toUserId,
          });

          console.log("Friend accepted notification sent");
        }

        return null;
      } catch (error) {
        console.error("Error in sendFriendAcceptedNotification:", error);
        return null;
      }
    },
);

// ============================================
// DATE LIKED NOTIFICATION
// ============================================
exports.sendDateLikedNotification = onDocumentUpdated(
    "sharedDates/{dateId}",
    async (event) => {
      try {
        const before = event.data.before.data();
        const after = event.data.after.data();

        const beforeLikes = before.likes || [];
        const afterLikes = after.likes || [];

        const newLikers = afterLikes.filter((uid) => !beforeLikes.includes(uid));
        if (newLikers.length === 0) return null;

        const ownerId = after.userId;
        const actualNewLikers = newLikers.filter((uid) => uid !== ownerId);
        if (actualNewLikers.length === 0) return null;

        for (const likerId of actualNewLikers) {
          const likerDoc = await db.collection("users").doc(likerId).get();
          const likerData = likerDoc.data() || {};
          const likerName = likerData.name || likerData.email?.split("@")[0] || "Someone";

          const dateTitle = after.dateData?.title || after.name || "your date";

          await sendPushNotification(ownerId, {
            title: "Someone liked your date! ❤️",
            body: `${likerName} liked "${dateTitle}"`,
          }, {
            type: "date_liked",
            dateId: event.params.dateId,
            likerId: likerId,
          });
        }

        console.log("Date liked notifications sent");
        return null;
      } catch (error) {
        console.error("Error in sendDateLikedNotification:", error);
        return null;
      }
    },
);

// ============================================
// YOUR EXISTING FUNCTIONS BELOW
// ============================================

// Delete old messages (runs daily)
exports.deleteOldMessages = onSchedule("every 24 hours", async (event) => {
  try {
    const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000));

    console.log("🗑️ Starting message cleanup...");

    const oldMessagesQuery = db.collection("messages")
        .where("createdAt", "<", admin.firestore.Timestamp.fromDate(threeDaysAgo));

    const oldMessages = await oldMessagesQuery.get();

    if (oldMessages.empty) {
      console.log("✅ No old messages to delete");
      return null;
    }

    console.log(`Found ${oldMessages.size} old messages to delete`);

    const batchSize = 500;
    let deletedCount = 0;

    for (let i = 0; i < oldMessages.docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = oldMessages.docs.slice(i, i + batchSize);

      batchDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += batchDocs.length;
    }

    console.log(`✅ Successfully deleted ${deletedCount} old messages`);
    return null;
  } catch (error) {
    console.error("❌ Error deleting old messages:", error);
    return null;
  }
});

// Cleanup typing indicators (runs hourly)
exports.cleanupTypingIndicators = onSchedule("every 1 hours", async (event) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - (5 * 60 * 1000));

    console.log("🧹 Cleaning up stale typing indicators...");

    const staleTyping = await db.collection("typing")
        .where("timestamp", "<", admin.firestore.Timestamp.fromDate(fiveMinutesAgo))
        .get();

    if (staleTyping.empty) {
      console.log("✅ No stale typing indicators");
      return null;
    }

    const batch = db.batch();
    staleTyping.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Deleted ${staleTyping.size} stale typing indicators`);
    return null;
  } catch (error) {
    console.error("❌ Error cleaning typing indicators:", error);
    return null;
  }
});

// Update conversation on new message (KEEP THIS - it updates unread counts)
exports.updateConversationOnNewMessage = onDocumentCreated(
    "messages/{messageId}",
    async (event) => {
      try {
        const message = event.data.data();
        const conversationId = message.conversationId;

        if (!conversationId) {
          console.log("⚠️ Message has no conversationId");
          return null;
        }

        const conversationRef = db.collection("conversations").doc(conversationId);
        const conversationSnap = await conversationRef.get();

        if (!conversationSnap.exists) {
          console.log("⚠️ Conversation not found:", conversationId);
          return null;
        }

        const conversationData = conversationSnap.data();
        const recipients = (conversationData.participants || []).filter(
            (id) => id !== message.userId,
        );

        const unreadUpdates = {};
        recipients.forEach((recipientId) => {
          const currentCount = conversationData.unreadCount?.[recipientId] || 0;
          unreadUpdates[`unreadCount.${recipientId}`] = Math.max(0, currentCount + 1);
        });

        await conversationRef.update({
          lastMessage: message.text,
          lastMessageTime: message.createdAt,
          ...unreadUpdates,
        });

        console.log(`✅ Updated conversation ${conversationId}`);
        return null;
      } catch (error) {
        console.error("❌ Error updating conversation:", error);
        return null;
      }
    },
);

// Test function
exports.testFunction = onRequest(async (req, res) => {
  try {
    const messagesCount = await db.collection("messages").count().get();
    const conversationsCount = await db.collection("conversations").count().get();
    const usersCount = await db.collection("users").count().get();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      counts: {
        messages: messagesCount.data().count,
        conversations: conversationsCount.data().count,
        users: usersCount.data().count,
      },
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// Track message stats (runs daily)
exports.trackMessageStats = onSchedule("every 24 hours", async (event) => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const recentMessages = await db.collection("messages")
        .where("createdAt", ">", admin.firestore.Timestamp.fromDate(yesterday))
        .get();

    const activeConversations = await db.collection("conversations")
        .where("lastMessageTime", ">", admin.firestore.Timestamp.fromDate(yesterday))
        .get();

    await db.collection("analytics").add({
      date: admin.firestore.Timestamp.fromDate(yesterday),
      messagesSent: recentMessages.size,
      activeConversations: activeConversations.size,
      type: "daily_stats",
    });

    console.log(`📈 Stats: ${recentMessages.size} messages`);
    return null;
  } catch (error) {
    console.error("❌ Error tracking stats:", error);
    return null;
  }
});

// Detect spammers (runs every 6 hours)
exports.detectSpammers = onSchedule("every 6 hours", async (event) => {
  try {
    const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));

    const recentMessages = await db.collection("messages")
        .where("createdAt", ">", admin.firestore.Timestamp.fromDate(oneHourAgo))
        .get();

    const messageCounts = {};
    recentMessages.docs.forEach((doc) => {
      const userId = doc.data().userId;
      messageCounts[userId] = (messageCounts[userId] || 0) + 1;
    });

    const spammers = Object.entries(messageCounts)
        .filter(([userId, count]) => count > 100)
        .map(([userId]) => userId);

    if (spammers.length === 0) {
      console.log("✅ No spammers detected");
      return null;
    }

    console.log(`🚨 Detected ${spammers.length} potential spammers`);

    const batch = db.batch();
    spammers.forEach((userId) => {
      const userRef = db.collection("users").doc(userId);
      batch.update(userRef, {
        potentialSpammer: true,
        flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`✅ Flagged ${spammers.length} users for review`);
    return null;
  } catch (error) {
    console.error("❌ Error detecting spammers:", error);
    return null;
  }
});
