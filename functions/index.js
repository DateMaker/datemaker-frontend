const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

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

// Update conversation on new message
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
