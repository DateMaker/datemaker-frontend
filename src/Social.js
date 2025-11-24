// 🎨 COMPLETELY REDESIGNED Social.js - Vibrant, Colorful, & Fully Functional!

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserPlus, MessageCircle, Users, Heart, MapPin, Calendar, Send, X, Check, Clock, Share2, Trash2, UserMinus, Sparkles, TrendingUp, Plus, ArrowLeft, MessageSquare, Star, WifiOff } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, orderBy, getDoc, deleteDoc, setDoc, writeBatch, limit, Timestamp } from 'firebase/firestore';
import SuccessModal from './SuccessModal';
import { setStatusBarColor, STATUS_BAR_COLORS } from './utils/statusBar';

export default function Social({ user, onBack, feedNotificationCount = 0 }) {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [feed, setFeed] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showCreateGroupChat, setShowCreateGroupChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({}); // { conversationId: count }
  const [viewingDate, setViewingDate] = useState(null); // For viewing full date
  const [optimisticMessages, setOptimisticMessages] = useState([]); // For instant message display
  const [participantProfiles, setParticipantProfiles] = useState({}); // Store user profiles for avatars
  const [isOnline, setIsOnline] = useState(navigator.onLine); // ✅ FIX #4: Offline detection
const [successMessage, setSuccessMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageTimeoutsRef = useRef(new Map());

 useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up Social component - canceling all timeouts');
      
      // Cancel typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Cancel all message timeouts
      messageTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      messageTimeoutsRef.current.clear();
    };
  }, []);

// 📱 Set status bar color for iOS
useEffect(() => {
  setStatusBarColor(STATUS_BAR_COLORS.social);
  
  return () => {
    setStatusBarColor(STATUS_BAR_COLORS.home);
  };
}, []);

  // 🔔 Clear notifications when viewing specific tabs
  useEffect(() => {
    const clearTabNotification = async (tabName) => {
      try {
        if (tabName === 'requests' && friendRequests.length > 0) {
          // Mark friend requests as seen
          const batch = writeBatch(db);
          friendRequests.forEach(request => {
            const requestRef = doc(db, 'friendRequests', request.id);
            batch.update(requestRef, { seen: true });
          });
          await batch.commit();
          console.log('✅ Marked friend requests as seen');
        }
        
        if (tabName === 'messages' && selectedConversation) {
          // Mark messages as read for the selected conversation
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            [`lastReadMessages.${selectedConversation.id}`]: serverTimestamp()
          });
          console.log('✅ Marked messages as read');
        }
        
        if (tabName === 'feed') {
          // Mark feed as viewed
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            lastFeedVisit: serverTimestamp()
          });
          console.log('✅ Marked feed as viewed');
        }
      } catch (error) {
        console.error('Error clearing tab notification:', error);
      }
    };

    // Clear notification when user switches to a tab
    if (activeTab === 'requests' || activeTab === 'messages' || activeTab === 'feed') {
      clearTabNotification(activeTab);
    }
  }, [activeTab, selectedConversation, friendRequests, user.uid]);



  // 🔔 NEW: Track unread message counts for each conversation
  // TEMPORARILY DISABLED TO AVOID INDEX ERRORS
  /*
  useEffect(() => {
    if (conversations.length === 0) return;

    const unsubscribes = conversations.map(conv => {
      // Simplified query - just get all messages for this conversation
      const messagesQuery = query(
  collection(db, 'messages'),
  where('conversationId', '==', selectedConversation.id),
  orderBy('createdAt', 'asc')  // Changed from 'desc' to 'asc' for chronological order
);

      return onSnapshot(messagesQuery, async (snapshot) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const lastRead = userDoc.data()?.lastReadMessages?.[conv.id];

        let unreadCount = 0;
        snapshot.docs.forEach(doc => {
          const msgData = doc.data();
          // Filter out messages from current user and count unread messages
          if (msgData.userId !== user.uid && msgData.userEmail !== user.email) {
            if (!lastRead || msgData.createdAt?.toMillis() > lastRead?.toMillis()) {
              unreadCount++;
            }
          }
        });

        setUnreadMessages(prev => ({
          ...prev,
          [conv.id]: unreadCount
        }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [conversations, user.uid, user.email]);
  */

 

// Scroll to bottom when messages first load
const [hasScrolledInitially, setHasScrolledInitially] = useState(false);

useEffect(() => {
  if (selectedConversation && messages.length > 0 && !hasScrolledInitially) {
    // Initial scroll when conversation opens
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      setHasScrolledInitially(true);
    }, 100);
  }
}, [messages, selectedConversation, hasScrolledInitially]);

// Reset scroll flag when switching conversations
useEffect(() => {
  setHasScrolledInitially(false);
}, [selectedConversation?.id]);

// Load user profile
useEffect(() => {
  const loadUserProfile = async () => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    }
  };
  loadUserProfile();
}, [user.uid]);
  // Set user online status
  useEffect(() => {
    const setOnlineStatus = async () => {
      await setDoc(doc(db, 'userStatus', user.uid), {
        online: true,
        lastSeen: serverTimestamp()
      }, { merge: true });
    };

    setOnlineStatus();

    const setOfflineStatus = async () => {
      await setDoc(doc(db, 'userStatus', user.uid), {
        online: false,
        lastSeen: serverTimestamp()
      }, { merge: true });
    };

    window.addEventListener('beforeunload', setOfflineStatus);

    return () => {
      setOfflineStatus();
      window.removeEventListener('beforeunload', setOfflineStatus);
    };
  }, [user.uid]);

  // Track online users
  useEffect(() => {
    if (friends.length === 0) return;

    const unsubscribes = friends.map(friend => {
      return onSnapshot(doc(db, 'userStatus', friend.id), (doc) => {
        if (doc.exists() && doc.data().online) {
          setOnlineUsers(prev => new Set([...prev, friend.id]));
        } else {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(friend.id);
            return newSet;
          });
        }
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [friends]);

  // 🔥 Load friend requests with unseen count tracking
  useEffect(() => {
    const q = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFriendRequests(requests);
      
      // Count unseen requests for badge
      const unseenCount = requests.filter(r => !r.seen).length;
      console.log(`📬 Friend requests: ${requests.length} total, ${unseenCount} unseen`);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Load sent requests
  useEffect(() => {
    const q = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSentRequests(requests);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
  // ✅ FIX #5: Clear profiles when no conversation selected
  if (!selectedConversation) {
    setParticipantProfiles({}); // Clear old profiles
    return;
  }
  
  const loadParticipantProfiles = async () => {
    const profiles = {};
    const participantIds = selectedConversation.isGroup 
      ? selectedConversation.participants 
      : selectedConversation.participants.filter(id => id !== user.uid);

    for (const userId of participantIds) {
      if (!profiles[userId] && userId !== user.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data();
          }
        } catch (error) {
          console.error('Error loading profile for', userId, error);
        }
      }
    }

    setParticipantProfiles(profiles);
  };

  loadParticipantProfiles();
}, [selectedConversation, user.uid]);

 useEffect(() => {
  console.log('🔥 Setting up real-time friends listener...');
  
  // Query 1: Requests I sent that were accepted
  const sentQuery = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', user.uid),
    where('status', '==', 'accepted')
  );
  
  // Query 2: Requests I received that were accepted
  const receivedQuery = query(
    collection(db, 'friendRequests'),
    where('toUserId', '==', user.uid),
    where('status', '==', 'accepted')
  );
  
  const friendsMap = new Map();
  
  const updateFriendsList = () => {
    const friendsList = Array.from(friendsMap.values());
    setFriends(friendsList);
    console.log(`✅ Friends updated in real-time: ${friendsList.length} friends`);
  };
  
  // Listen to both queries
  const unsubscribe1 = onSnapshot(sentQuery, (snapshot) => {
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      friendsMap.set(data.toUserId, {
        id: data.toUserId,
        email: data.toUserEmail,
        name: data.toUserEmail.split('@')[0]
      });
    });
    updateFriendsList();
  });
  
  const unsubscribe2 = onSnapshot(receivedQuery, (snapshot) => {
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      friendsMap.set(data.fromUserId, {
        id: data.fromUserId,
        email: data.fromUserEmail,
        name: data.fromUserEmail.split('@')[0]
      });
    });
    updateFriendsList();
  });

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}, [user.uid]);

  // 🔥 Load feed with REAL-TIME updates
  useEffect(() => {
    if (!user) return;

    console.log('🔥 Setting up feed listener...');

    const feedQuery = query(
      collection(db, 'sharedDates'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(feedQuery, (snapshot) => {
      console.log(`📥 Feed snapshot received: ${snapshot.docs.length} total documents`);
      
      const dates = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(date => {
          const isPublic = date.isPublic === true;
          const isCreator = date.userId === user.uid;
          const isInvited = date.invitedFriends?.includes(user.uid);
          
          const shouldShow = isPublic || isCreator || isInvited;
          
          if (shouldShow) {
            console.log(`✅ Showing date: ${date.id} (public: ${isPublic}, creator: ${isCreator}, invited: ${isInvited})`);
          }
          
          return shouldShow;
        });
      
      console.log(`✨ Displaying ${dates.length} dates in feed`);
      setFeed(dates);
    }, (error) => {
      console.error('❌ Feed listener error:', error);
    });

    return () => {
      console.log('🔌 Cleaning up feed listener');
      unsubscribe();
    };
  }, [user]);

  // 🔥 Load conversations - OPTIMIZED (No N+1 queries)
  useEffect(() => {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      // Track unread counts
      const unreadCounts = {};
      
      // NO MORE Promise.all or additional queries!
      // All data comes from conversation document
      const convos = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        
        // Extract unread count for current user
        const unreadCount = data.unreadCount?.[user.uid] || 0;
        if (unreadCount > 0) {
          unreadCounts[docSnapshot.id] = unreadCount;
        }
        
        // lastMessage is ALREADY in conversation document!
        // No need to query messages collection
        return {
          id: docSnapshot.id,
          ...data,
          unreadCount
        };
      });

      // Sort by lastMessageTime (already in conversation doc)
      convos.sort((a, b) => {
        const timeA = a.lastMessageTime?.toMillis?.() || 0;
        const timeB = b.lastMessageTime?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setConversations(convos);
      setUnreadMessages(unreadCounts);
      
      console.log('💬 Loaded', convos.length, 'conversations in ONE query (0ms) ⚡');
    });

    return () => unsubscribe();
  }, [user.uid]);

  // 🔔 Mark messages as read when viewing a conversation
  const markMessagesAsRead = useCallback(async (conversationId) => {
    try {
      // Clear unread count for current user in the conversation document
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${user.uid}`]: 0
      });
      
      console.log('✅ Marked messages as read for conversation:', conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user.uid]);

  // 🔥 Load messages for selected conversation - NO INDEX REQUIRED
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setOptimisticMessages([]);
      return;
    }

    console.log('🔵 Loading messages for conversation:', selectedConversation.id);

    // Query WITHOUT orderBy to avoid index requirement
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', selectedConversation.id)
    );

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000));
      const recentMessages = [];
      const oldMessages = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate();
        
        if (createdAt) {
          if (createdAt < threeDaysAgo) {
            oldMessages.push(doc.ref);
          } else {
            recentMessages.push({
              id: doc.id,
              ...data
            });
          }
        }
      });
      
      // Delete old messages in background
      if (oldMessages.length > 0) {
        console.log('🗑️ Deleting', oldMessages.length, 'old messages (3+ days)');
        const batch = writeBatch(db);
        oldMessages.forEach(ref => batch.delete(ref));
        batch.commit().catch(err => console.error('Error deleting old messages:', err));
      }
      
      // Sort recent messages
      const sortedMessages = recentMessages.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeA - timeB;
      });
      
      console.log('✅ Loaded', sortedMessages.length, 'messages (deleted', oldMessages.length, 'old)');
      setMessages(sortedMessages);

      // Remove optimistic messages that now exist in Firebase
      setOptimisticMessages(prev => 
        prev.filter(optMsg => 
          !sortedMessages.some(msg => 
            msg.text === optMsg.text && 
            msg.userId === optMsg.userId && 
            Math.abs((msg.createdAt?.toMillis() || 0) - optMsg.createdAt) < 5000
          )
        )
      );

      // 🔔 Mark messages as read
      if (sortedMessages.length > 0) {
        markMessagesAsRead(selectedConversation.id);
      }
    }, (error) => {
      console.error('❌ Error loading messages:', error);
    });

    return () => {
      console.log('🔌 Unsubscribing from messages');
      unsubscribe();
    };
  }, [selectedConversation?.id, user.uid]);

  // Track typing indicator
  useEffect(() => {
    if (!selectedConversation) return;

    const typingQuery = query(
      collection(db, 'typing'),
      where('conversationId', '==', selectedConversation.id)
    );

    const unsubscribe = onSnapshot(typingQuery, (snapshot) => {
      const typing = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userId !== user.uid && data.isTyping) {
          typing[data.userId] = data.userEmail?.split('@')[0] || 'Someone';
        }
      });
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, [selectedConversation, user.uid, user.email]);

  // Search users - OPTIMIZED VERSION ⚡💰
const handleSearch = async () => {
  if (!searchQuery.trim()) return;
  
  setLoading(true);
  try {
    const searchTerm = searchQuery.toLowerCase().trim();
    
    // ✅ Single optimized query - prefix match on email
    const emailQuery = query(
      collection(db, 'users'),
      where('email', '>=', searchTerm),
      where('email', '<=', searchTerm + '\uf8ff'),
      limit(20) // ✅ Limit results to prevent huge reads
    );
    
    const emailSnapshot = await getDocs(emailQuery);
    const results = emailSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(u => u.id !== user.uid); // Exclude current user
    
    setSearchResults(results);
    
    if (results.length === 0) {
  setSuccessMessage('No users found. Make sure to type the START of their email address!');
}
    
    console.log(`🔍 Search results: ${results.length} users found (optimized query)`);
    
  } catch (error) {
  console.error('Search error:', error);
  setSuccessMessage('Search failed: ' + error.message);
}
  setLoading(false);
};

  // Send friend request
  const handleSendFriendRequest = async (toUser) => {
    try {
      const existingRequest = await getDocs(query(
        collection(db, 'friendRequests'),
        where('fromUserId', '==', user.uid),
        where('toUserId', '==', toUser.id)
      ));

      if (!existingRequest.empty) {
  setSuccessMessage('Friend request already sent!');
  return;
}

      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: user.uid,
        fromUserEmail: user.email,
        toUserId: toUser.id,
        toUserEmail: toUser.email,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccessMessage('Friend request sent! 🎉');
setSearchResults(prev => prev.filter(u => u.id !== toUser.id));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  // Accept friend request
  const handleAcceptFriendRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });
      
      const request = friendRequests.find(r => r.id === requestId);
      if (request) {
        await addDoc(collection(db, 'conversations'), {
          participants: [user.uid, request.fromUserId],
          participantEmails: [user.email, request.fromUserEmail],
          isGroup: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Reject friend request
  const handleRejectFriendRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;
    
    try {
      const friendRequestsQuery = query(
        collection(db, 'friendRequests'),
        where('status', '==', 'accepted')
      );
      
      const snapshot = await getDocs(friendRequestsQuery);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if ((data.fromUserId === user.uid && data.toUserId === friendId) ||
            (data.toUserId === user.uid && data.fromUserId === friendId)) {
          batch.delete(doc(db, 'friendRequests', docSnapshot.id));
        }
      });
      
      await batch.commit();
      
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  // Start conversation
  const handleStartConversation = async (friendId) => {
    try {
      const friend = friends.find(f => f.id === friendId);
      if (!friend) return;

      const existingConvo = conversations.find(conv => 
        !conv.isGroup && 
        conv.participants.includes(friendId) && 
        conv.participants.includes(user.uid)
      );

      if (existingConvo) {
        setSelectedConversation(existingConvo);
        setActiveTab('messages');
        return;
      }

      const newConvo = {
        participants: [user.uid, friendId],
        participantEmails: [user.email, friend.email],
        isGroup: false,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'conversations'), newConvo);
      setSelectedConversation({ id: docRef.id, ...newConvo });
      setActiveTab('messages');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Create group chat
  const handleCreateGroupChat = async (groupName, selectedFriends) => {
    try {
      const participantIds = [user.uid, ...selectedFriends.map(f => f.id)];
      const participantEmails = [user.email, ...selectedFriends.map(f => f.email)];

      const newConvo = {
        name: groupName,
        participants: participantIds,
        participantEmails: participantEmails,
        isGroup: true,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'conversations'), newConvo);
      setSelectedConversation({ id: docRef.id, ...newConvo });
      setShowCreateGroupChat(false);
      setActiveTab('messages');
    } catch (error) {
      console.error('Error creating group chat:', error);
    }
  };

  // 🔥 NEW: Get user avatar from profile or email
  const getUserAvatar = (userId, userEmail) => {
    const profile = participantProfiles[userId];
    if (profile?.photoURL) {
      return <img src={profile.photoURL} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return (userEmail || '?')[0]?.toUpperCase();
  };

  // 🔥 NEW: Get user display name
  const getUserDisplayName = (userId) => {
    const profile = participantProfiles[userId];
    return profile?.name || profile?.email?.split('@')[0] || 'User';
  };

  // Combine real messages with optimistic messages for display
  const displayMessages = [...messages, ...optimisticMessages].sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt;
    return timeA - timeB;
  });

  // Track typing indicator - OPTIMIZED ⚡💰
  const handleTyping = async (isTyping) => {
    if (!selectedConversation) return;

    try {
      const typingRef = doc(db, 'typing', `${selectedConversation.id}_${user.uid}`);
      
      if (isTyping) {
        // ✅ Use merge to update existing doc instead of full overwrite
        await setDoc(typingRef, {
          conversationId: selectedConversation.id,
          userId: user.uid,
          userEmail: user.email,
          isTyping: true,
          timestamp: serverTimestamp()
        }, { merge: true }); // ✅ KEY OPTIMIZATION: merge instead of overwrite

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // ✅ Increased timeout from 3s to 5s (feels more natural + fewer writes)
        typingTimeoutRef.current = setTimeout(() => {
          handleTyping(false);
        }, 5000);
      } else {
        await deleteDoc(typingRef);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleSendMessage = async () => {
  if (!messageInput.trim() || !selectedConversation) return;

  // ✅ FIX #1: Message length validation
  if (messageInput.length > 1000) {
  setSuccessMessage('Message too long! Maximum 1000 characters.');
  return;
}

  const messageText = messageInput.trim();
  const tempId = `temp_${Date.now()}_${Math.random()}`;
    
  // Create optimistic message
  const optimisticMessage = {
    id: tempId,
    text: messageText,
    userId: user.uid,
    userEmail: user.email,
    conversationId: selectedConversation.id,
    createdAt: Date.now(),
    isOptimistic: true
  };

  // Add to optimistic messages immediately
  setOptimisticMessages(prev => [...prev, optimisticMessage]);
  setMessageInput('');
  handleTyping(false);

  console.log('📤 Sending message:', messageText);

  try {
    // Use current timestamp for immediate visibility
    const timestamp = Timestamp.fromDate(new Date());
    
    // Add message to Firebase
    await addDoc(collection(db, 'messages'), {
      conversationId: selectedConversation.id,
      userId: user.uid,
      userEmail: user.email,
      text: messageText,
      createdAt: timestamp
    });

    console.log('✅ Message sent! Cloud Function will update conversation.');
    
  } catch (error) {
  console.error('❌ Error sending message:', error);
  // Remove optimistic message on error
  setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
  setSuccessMessage('Failed to send message: ' + error.message);
}
};

const handleLikeDate = async (dateId, currentLikes = []) => {
  try {
    const dateRef = doc(db, 'sharedDates', dateId);
    const hasLiked = currentLikes.includes(user.uid);
    
    console.log('👍 Like button clicked:', { dateId, hasLiked, currentLikes });
    
    // Rollback on error
setFeed(prevFeed => prevFeed.map(date => {
  if (date.id === dateId) {
    return { ...date, likes: currentLikes };
  }
  return date;
}));
setSuccessMessage('Failed to like. Please try again.');
    
    // Update Firebase
    if (hasLiked) {
      // Unlike
      await updateDoc(dateRef, {
        likes: arrayRemove(user.uid)
      });
      console.log('💔 Unliked post');
    } else {
      // Like
      await updateDoc(dateRef, {
        likes: arrayUnion(user.uid)
      });
      console.log('❤️ Liked post');
    }
    
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    
    // Rollback on error
    setFeed(prevFeed => prevFeed.map(date => {
      if (date.id === dateId) {
        return { ...date, likes: currentLikes };
      }
      return date;
    }));
    
    alert('Failed to like. Please try again.');
  }
};
// Like/Unlike date in detail view
  const handleLikeDateDetail = async (dateId, currentLikes = []) => {
    try {
      const dateRef = doc(db, 'sharedDates', dateId);
      const hasLiked = currentLikes.includes(user.uid);
      
      console.log('👍 Detail view like clicked:', { dateId, hasLiked });
      
      // Update viewingDate state immediately (optimistic UI)
      setViewingDate(prev => {
        if (!prev || prev.id !== dateId) return prev;
        const newLikes = hasLiked
          ? (prev.likes || []).filter(uid => uid !== user.uid)
          : [...(prev.likes || []), user.uid];
        return { ...prev, likes: newLikes };
      });
      
      // Also update feed in background
      setFeed(prevFeed => prevFeed.map(date => {
        if (date.id === dateId) {
          const newLikes = hasLiked
            ? (date.likes || []).filter(uid => uid !== user.uid)
            : [...(date.likes || []), user.uid];
          return { ...date, likes: newLikes };
        }
        return date;
      }));
      
      // Update Firebase
      if (hasLiked) {
        await updateDoc(dateRef, {
          likes: arrayRemove(user.uid)
        });
        console.log('💔 Unliked post (detail view)');
      } else {
        await updateDoc(dateRef, {
          likes: arrayUnion(user.uid)
        });
        console.log('❤️ Liked post (detail view)');
      }
      
    } catch (error) {
      console.error('❌ Error toggling like in detail view:', error);
      
      // Rollback on error
setViewingDate(prev => {
  if (!prev || prev.id !== dateId) return prev;
  return { ...prev, likes: currentLikes };
});

setSuccessMessage('Failed to like. Please try again.');
    }
  };
  // Delete shared date
  const handleDeleteSharedDate = async (dateId) => {
    if (!window.confirm('Delete this shared date?')) return;
    
    try {
      await deleteDoc(doc(db, 'sharedDates', dateId));
    } catch (error) {
      console.error('Error deleting shared date:', error);
    }
  };

  // 🔔 NEW: Calculate total unread messages
  const totalUnreadMessages = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);

 return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #fcd34d 50%, #fbbf24 75%, #f59e0b 100%)',
      padding: '2rem',
      paddingTop: 'calc(2rem + env(safe-area-inset-top))'
    }}>
      
      {/* ✅ OFFLINE INDICATOR - ADD THIS ENTIRE BLOCK */}
      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '14px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 9999,
          fontWeight: '800',
          border: '2px solid white'
        }}>
          <WifiOff size={24} />
          You are offline
        </div>
      )}
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #8b5cf6 100%)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)',
        border: '3px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              padding: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <ArrowLeft size={24} style={{ color: 'white' }} />
          </button>

          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '900',
              margin: '0 0 0.5rem',
              background: 'linear-gradient(to right, #fde68a, #ffffff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              DateMaker <span style={{ color: '#8b5cf6' }}>Social</span>
            </h1>
            <p style={{
              margin: 0,
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              Connect, share, and plan amazing dates together! ✨
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '0.75rem',
  marginBottom: '1.5rem'
}}>
  {[
    { id: 'feed', icon: Sparkles, label: 'Feed', count: feedNotificationCount },
    { id: 'search', icon: Search, label: 'Search', count: 0 },
    { id: 'friends', icon: Users, label: 'Friends', count: 0 },
    { id: 'requests', icon: UserPlus, label: 'Requests', count: friendRequests.filter(r => !r.seen).length },
    { id: 'messages', icon: MessageCircle, label: 'Messages', count: totalUnreadMessages }
  ].map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      style={{
        padding: '1rem',
        borderRadius: '16px',
        border: activeTab === tab.id 
          ? '3px solid white' 
          : '3px solid transparent',
        background: activeTab === tab.id
          ? 'white'
          : 'rgba(255, 255, 255, 0.15)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s',
        fontWeight: '800',
        fontSize: '0.95rem',
        color: activeTab === tab.id ? '#8b5cf6' : 'white',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (activeTab !== tab.id) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        if (activeTab !== tab.id) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <tab.icon size={22} />
      <span>{tab.label}</span>
      {/* 🔔 Notification badges */}
      {tab.count > 0 && (
        <span style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '50%',
          width: '22px',
          height: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: '900',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
        }}>
          {tab.count > 99 ? '9+' : tab.count}
        </span>
      )}
    </button>
  ))}
</div>

       
      </div>

      {/* Content Area */}
<div style={{
  background: 'white',
  borderRadius: '24px',
  padding: '2rem',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  border: '3px solid rgba(168, 85, 247, 0.2)',
  minHeight: '400px',
  marginBottom: '2rem'
}}>
        {/* Feed Tab */}
        {activeTab === 'feed' && !viewingDate && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <Sparkles size={32} style={{ color: '#a855f7' }} />
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '900',
                margin: 0,
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Your Feed 🎉
              </h2>
            </div>

            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              marginBottom: '2rem',
              fontWeight: '600'
            }}>
              {feed.length === 1 ? '1 amazing date shared' : `${feed.length} amazing dates shared`}
            </p>

            {feed.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#9ca3af'
              }}>
                <Sparkles size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  No dates shared yet
                </p>
                <p style={{ fontSize: '1rem' }}>
                  Share your amazing dates with friends or make them public!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {feed.map(date => (
                  <div
                    key={date.id}
                    onClick={(e) => {
                      if (!e.target.closest('button')) {
                        setViewingDate(date);
                      }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                      borderRadius: '20px',
                      padding: '1.75rem',
                      border: '2px solid #e9d5ff',
                      boxShadow: '0 4px 12px rgba(168, 85, 247, 0.1)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.1)';
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '900',
                          fontSize: '1.25rem',
                          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                        }}>
                          {date.userEmail?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p style={{
                            margin: '0 0 0.25rem',
                            fontWeight: '800',
                            fontSize: '1.125rem',
                            color: '#1f2937'
                          }}>
                            {date.userEmail?.split('@')[0] || 'Unknown'}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            fontWeight: '600'
                          }}>
                            {date.createdAt?.toDate().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {date.userId === user.uid && (
                        <button
                          onClick={() => handleDeleteSharedDate(date.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '2px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '12px',
                            padding: '0.625rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          <Trash2 size={18} style={{ color: '#ef4444' }} />
                        </button>
                      )}
                    </div>

                    {/* Date Name */}
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '900',
                      margin: '0 0 1rem',
                      color: '#1f2937'
                    }}>
                      {date.dateData?.title || date.name || 'Untitled Date'}
                    </h3>

                    {/* Activities */}
                    {date.activities && date.activities.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '1.25rem'
                      }}>
                        {date.activities.map((activity, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'white',
                              padding: '0.625rem 1.125rem',
                              borderRadius: '14px',
                              border: '2px solid #e9d5ff',
                              fontSize: '0.9375rem',
                              fontWeight: '700',
                              color: '#8b5cf6',
                              boxShadow: '0 2px 6px rgba(168, 85, 247, 0.1)'
                            }}
                          >
                            {activity}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Location & Budget */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.25rem'
                    }}>
                      {date.location && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          background: 'white',
                          padding: '0.875rem 1.125rem',
                          borderRadius: '14px',
                          border: '2px solid #dbeafe'
                        }}>
                          <MapPin size={18} style={{ color: '#3b82f6' }} />
                          <span style={{
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            color: '#1f2937'
                          }}>
                            {date.location}
                          </span>
                        </div>
                      )}

                      {date.budget && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          background: 'white',
                          padding: '0.875rem 1.125rem',
                          borderRadius: '14px',
                          border: '2px solid #dcfce7'
                        }}>
                          <span style={{ fontSize: '1.125rem' }}>💰</span>
                          <span style={{
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            color: '#1f2937'
                          }}>
                            {date.budget}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {date.notes && (
                      <p style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '14px',
                        border: '2px solid #fef3c7',
                        margin: '0 0 1.25rem',
                        fontSize: '0.9375rem',
                        lineHeight: '1.6',
                        color: '#374151',
                        fontWeight: '500'
                      }}>
                        {date.notes}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      paddingTop: '1rem',
                      borderTop: '2px solid #e9d5ff'
                    }}>
                      <button
                        onClick={() => handleLikeDate(date.id, date.likes || [])}
                        style={{
                          flex: 1,
                          padding: '0.875rem',
                          borderRadius: '14px',
                          border: (date.likes || []).includes(user.uid)
                            ? '2px solid #ec4899'
                            : '2px solid #e9d5ff',
                          background: (date.likes || []).includes(user.uid)
                            ? 'rgba(236, 72, 153, 0.1)'
                            : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.625rem',
                          fontWeight: '800',
                          fontSize: '1rem',
                          color: (date.likes || []).includes(user.uid) ? '#ec4899' : '#8b5cf6',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.02)';
                          e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <Heart
                          size={20}
                          fill={(date.likes || []).includes(user.uid) ? '#ec4899' : 'none'}
                        />
                        {(date.likes || []).length} {(date.likes || []).length === 1 ? 'Like' : 'Likes'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date Detail View */}
        {/* View Date Detail */}
     {/* View Date Detail */}
        {activeTab === 'feed' && viewingDate && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setViewingDate(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.5rem',
                borderRadius: '14px',
                border: '2px solid #e9d5ff',
                background: 'white',
                color: '#a855f7',
                fontWeight: '800',
                fontSize: '1.0625rem',
                cursor: 'pointer',
                marginBottom: '2rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#faf5ff';
                e.target.style.transform = 'translateX(-4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <ArrowLeft size={20} />
              Back to Feed
            </button>

            {/* Full Date View */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
              borderRadius: '24px',
              padding: '2rem',
              border: '2px solid #e9d5ff',
              boxShadow: '0 8px 24px rgba(168, 85, 247, 0.15)'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '2px solid #f3e8ff'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                }}>
                  {viewingDate.userEmail?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: '900',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {viewingDate.dateData?.title || viewingDate.name || 'Date Night'}
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    color: '#6b7280',
                    fontWeight: '600'
                  }}>
                    by {viewingDate.userEmail?.split('@')[0] || 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Caption */}
              {viewingDate.caption && (
                <div style={{
                  background: '#faf5ff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '2px solid #f3e8ff'
                }}>
                  <p style={{
                    fontSize: '1.125rem',
                    color: '#1f2937',
                    lineHeight: '1.7',
                    margin: 0
                  }}>
                    {viewingDate.caption}
                  </p>
                </div>
              )}

              {/* Date & Time Info */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
              }}>
                {viewingDate.scheduledDate && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.5rem',
                    background: 'rgba(168, 85, 247, 0.1)',
                    borderRadius: '14px',
                    border: '2px solid #e9d5ff'
                  }}>
                    <Calendar size={24} style={{ color: '#a855f7' }} />
                    <div>
                      <p style={{
                        fontSize: '0.8125rem',
                        fontWeight: '700',
                        color: '#a855f7',
                        margin: 0
                      }}>
                        Date
                      </p>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '800',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {new Date(viewingDate.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {viewingDate.scheduledTime && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.5rem',
                    background: 'rgba(236, 72, 153, 0.1)',
                    borderRadius: '14px',
                    border: '2px solid #fce7f3'
                  }}>
                    <Clock size={24} style={{ color: '#ec4899' }} />
                    <div>
                      <p style={{
                        fontSize: '0.8125rem',
                        fontWeight: '700',
                        color: '#ec4899',
                        margin: 0
                      }}>
                        Start Time
                      </p>
                      <p style={{
                        fontSize: '1rem',
                        fontWeight: '800',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        {viewingDate.scheduledTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Itinerary/Activities */}
              <div>
                {(() => {
                  // Get stops from various possible locations in data structure
                  const stops = viewingDate.dateData?.stops || 
                               viewingDate.dateData?.itinerary?.stops || 
                               viewingDate.stops ||
                               [];
                  
                  return (
                    <>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '900',
                        color: '#1f2937',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <MapPin size={28} style={{ color: '#a855f7' }} />
                        Itinerary ({stops.length} stops)
                      </h3>

                      {stops.length === 0 ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '3rem',
                          background: '#faf5ff',
                          borderRadius: '16px',
                          border: '2px dashed #e9d5ff'
                        }}>
                          <p style={{
                            fontSize: '1rem',
                            color: '#6b7280',
                            margin: 0
                          }}>
                            No activities added to this date yet
                          </p>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2rem'
                        }}>
                          {stops.map((stop, index) => (
                            <div
                              key={index}
                              style={{
                                background: '#ffffff',
                                borderRadius: '24px',
                                padding: '0',
                                border: '3px solid #e9d5ff',
                                overflow: 'hidden',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {/* Stop Header with Number */}
                              <div style={{
                                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                              }}>
                                <div style={{
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '50%',
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: '900',
                                  fontSize: '1.5rem',
                                  border: '3px solid white'
                                }}>
                                  {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                  {stop.time && (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      marginBottom: '0.25rem'
                                    }}>
                                      <Clock size={18} style={{ color: 'white' }} />
                                      <span style={{
                                        fontSize: '1rem',
                                        fontWeight: '800',
                                        color: 'white'
                                      }}>
                                        {stop.time} {stop.duration && `• ${stop.duration}`}
                                      </span>
                                    </div>
                                  )}
                                  {stop.category && (
                                    <p style={{
                                      fontSize: '0.875rem',
                                      fontWeight: '700',
                                      color: 'rgba(255, 255, 255, 0.9)',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em',
                                      margin: 0
                                    }}>
                                      {stop.category}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Stop Content */}
                              <div style={{ padding: '1.5rem' }}>
                                {/* Stop Title */}
                                <h4 style={{
                                  fontSize: '1.5rem',
                                  fontWeight: '900',
                                  color: '#1f2937',
                                  margin: '0 0 1rem 0'
                                }}>
                                  {stop.title || stop.name || 'Untitled Stop'}
                                </h4>

                                {/* Description */}
                                {stop.description && (
                                  <p style={{
                                    fontSize: '1rem',
                                    color: '#6b7280',
                                    lineHeight: '1.6',
                                    margin: '0 0 1.5rem 0'
                                  }}>
                                    {stop.description}
                                  </p>
                                )}

                                {/* Image */}
                                {stop.image && (
                                  <div style={{
                                    width: '100%',
                                    height: '300px',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    marginBottom: '1.5rem',
                                    position: 'relative'
                                  }}>
                                    <img
                                      src={stop.image}
                                      alt={stop.title || stop.name}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                    {/* Rating Badge on Image */}
                                    {stop.rating && (
                                      <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        background: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                      }}>
                                        <Star size={20} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                                        <span style={{
                                          fontSize: '1.125rem',
                                          fontWeight: '900',
                                          color: '#1f2937'
                                        }}>
                                          {stop.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Venue Name (if different from title) */}
                                {stop.venueName && stop.venueName !== stop.title && (
                                  <h5 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '800',
                                    color: '#1f2937',
                                    margin: '0 0 1rem 0'
                                  }}>
                                    {stop.venueName}
                                  </h5>
                                )}

                                {/* Location */}
                                {stop.vicinity && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'start',
                                    gap: '0.75rem',
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    background: '#faf5ff',
                                    borderRadius: '12px'
                                  }}>
                                    <MapPin size={20} style={{ color: '#ec4899', flexShrink: 0, marginTop: '0.125rem' }} />
                                    <p style={{
                                      fontSize: '1rem',
                                      fontWeight: '700',
                                      color: '#1f2937',
                                      margin: 0
                                    }}>
                                      {stop.vicinity}
                                    </p>
                                  </div>
                                )}

                                {/* Map (if coordinates available) */}
                                {stop.geometry?.location && (
                                  <div style={{
                                    width: '100%',
                                    height: '200px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    marginBottom: '1.5rem',
                                    border: '2px solid #e9d5ff'
                                  }}>
                                    <img
                                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${stop.geometry.location.lat},${stop.geometry.location.lng}&zoom=15&size=600x200&markers=color:red%7C${stop.geometry.location.lat},${stop.geometry.location.lng}&key=AIzaSyCKCweUu3EEWa8VfNZJ3I0druTc6u5gJKc`}
                                      alt="Map"
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Challenges Section */}
                                {stop.challenges && stop.challenges.length > 0 && (
                                  <div style={{
                                    background: 'linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%)',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    border: '2px solid #fecaca'
                                  }}>
                                    <h5 style={{
                                      fontSize: '1.25rem',
                                      fontWeight: '900',
                                      color: '#ef4444',
                                      margin: '0 0 1rem 0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.75rem'
                                    }}>
                                      🎯 Challenges ({stop.challenges.length})
                                    </h5>
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.75rem'
                                    }}>
                                      {stop.challenges.map((challenge, cIdx) => (
                                        <div key={cIdx} style={{
                                          background: 'white',
                                          padding: '1rem 1.25rem',
                                          borderRadius: '12px',
                                          border: '2px solid #fed7aa',
                                          display: 'flex',
                                          alignItems: 'flex-start',
                                          justifyContent: 'space-between',
                                          gap: '1rem'
                                        }}>
                                          <div style={{
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: '0.75rem',
                                            flex: 1
                                          }}>
                                            <span style={{
                                              fontSize: '1.25rem',
                                              flexShrink: 0
                                            }}>
                                              {challenge.emoji || '🎯'}
                                            </span>
                                            <span style={{
                                              fontSize: '1rem',
                                              fontWeight: '600',
                                              color: '#1f2937',
                                              lineHeight: '1.5'
                                            }}>
                                              {challenge.text || challenge}
                                            </span>
                                          </div>
                                          {challenge.points && (
                                            <div style={{
                                              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                                              color: 'white',
                                              padding: '0.5rem 1rem',
                                              borderRadius: '10px',
                                              fontWeight: '900',
                                              fontSize: '1rem',
                                              flexShrink: 0,
                                              boxShadow: '0 2px 8px rgba(251, 146, 60, 0.3)'
                                            }}>
                                              +{challenge.points} XP
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Like Section */}
              <div style={{
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '2px solid #f3e8ff',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button
  onClick={() => handleLikeDateDetail(viewingDate.id, viewingDate.likes || [])}
                  style={{
                    padding: '1.125rem 2rem',
                    borderRadius: '16px',
                    border: (viewingDate.likes || []).includes(user.uid)
                      ? '2px solid #ec4899'
                      : '2px solid #e9d5ff',
                    background: (viewingDate.likes || []).includes(user.uid)
                      ? 'rgba(236, 72, 153, 0.1)'
                      : 'white',
                    color: (viewingDate.likes || []).includes(user.uid) ? '#ec4899' : '#a855f7',
                    fontWeight: '900',
                    fontSize: '1.125rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s',
                    boxShadow: (viewingDate.likes || []).includes(user.uid)
                      ? '0 4px 12px rgba(236, 72, 153, 0.2)'
                      : '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 16px rgba(236, 72, 153, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = (viewingDate.likes || []).includes(user.uid)
                      ? '0 4px 12px rgba(236, 72, 153, 0.2)'
                      : '0 2px 6px rgba(0,0,0,0.05)';
                  }}
                >
                  <Heart
                    size={24}
                    fill={(viewingDate.likes || []).includes(user.uid) ? '#ec4899' : 'none'}
                  />
                  {(viewingDate.likes || []).length} {(viewingDate.likes || []).length === 1 ? 'Like' : 'Likes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
  <div style={{
    padding: '0 0.5rem'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
              <Search size={32} style={{ color: '#a855f7' }} />
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '900',
                margin: 0,
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Find Friends
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input
                type="email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Search by email..."
                style={{
                  flex: 1,
                  padding: '1.125rem 1.5rem',
                  borderRadius: '18px',
                  border: '2px solid #e9d5ff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#a855f7';
                  e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9d5ff';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
  onClick={handleSearch}
  disabled={loading}
  style={{
    padding: '0.875rem 1.25rem',
    borderRadius: '18px',
    border: 'none',
    background: loading
      ? '#d1d5db'
      : 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
    color: 'white',
    fontWeight: '800',
    fontSize: '0.875rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: loading
      ? 'none'
      : '0 6px 20px rgba(168, 85, 247, 0.3)',
    minWidth: 'fit-content',
    whiteSpace: 'nowrap'
  }}
  onMouseEnter={(e) => {
    if (!loading) {
      e.target.style.transform = 'scale(1.03)';
      e.target.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.4)';
    }
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'scale(1)';
    e.target.style.boxShadow = loading
      ? 'none'
      : '0 6px 20px rgba(168, 85, 247, 0.3)';
  }}
>
  <Search size={18} />
  <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>
    {loading ? 'Searching...' : 'Search'}
  </span>
</button>
            </div>

         {searchResults.length > 0 && (
  <div style={{ 
    display: 'flex',
    flexDirection: 'column',  // ✅ Vertical layout
    gap: '1rem',
    padding: '0'  // ✅ No side padding
  }}>
    {searchResults.map(result => (
      <div
        key={result.id}
        style={{
          display: 'flex',
          flexDirection: 'column',  // ✅ Stack vertically
          gap: '0.75rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
          padding: '1.25rem',  // ✅ More padding
          borderRadius: '16px',
          border: '2px solid #e9d5ff',
          boxShadow: '0 2px 8px rgba(168, 85, 247, 0.1)'
        }}
      >
        {/* User info row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          width: '100%'  // ✅ Full width
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '900',
            fontSize: '1.25rem',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
          }}>
            {result.email[0].toUpperCase()}
          </div>
          <div style={{ 
            flex: 1, 
            minWidth: 0  // ✅ Allows text truncation
          }}>
            <p style={{
              margin: '0 0 0.25rem',
              fontWeight: '800',
              fontSize: '1.125rem',
              color: '#1f2937',
              overflow: 'hidden',  // ✅ Handle long text
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {result.email.split('@')[0]}
            </p>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '600',
              overflow: 'hidden',  // ✅ Handle long text
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {result.email}
            </p>
          </div>
        </div>

       {/* Add Friend button - full width on mobile */}
<button
  onClick={() => !sentRequests.some(r => r.toUserId === result.id) && handleSendFriendRequest(result)}
  disabled={sentRequests.some(r => r.toUserId === result.id)}
  style={{
    width: '100%',
    padding: '0.875rem',
    borderRadius: '14px',
    border: 'none',
    background: sentRequests.some(r => r.toUserId === result.id)
      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
      : 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
    color: 'white',
    fontWeight: '800',
    fontSize: '1rem',
    cursor: sentRequests.some(r => r.toUserId === result.id) ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: sentRequests.some(r => r.toUserId === result.id)
      ? 'none'
      : '0 4px 12px rgba(168, 85, 247, 0.3)'
  }}
  onMouseEnter={(e) => {
    if (!sentRequests.some(r => r.toUserId === result.id)) {
      e.target.style.transform = 'scale(1.02)';
      e.target.style.boxShadow = '0 6px 16px rgba(168, 85, 247, 0.4)';
    }
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'scale(1)';
    e.target.style.boxShadow = sentRequests.some(r => r.toUserId === result.id)
      ? 'none'
      : '0 4px 12px rgba(168, 85, 247, 0.3)';
  }}
>
  {sentRequests.some(r => r.toUserId === result.id) ? (
    <>
      <Clock size={20} />
      Pending
    </>
  ) : (
    <>
      <UserPlus size={20} />
      Add Friend
    </>
  )}
</button>
      </div>
    ))}
  </div>
)}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <Users size={32} style={{ color: '#a855f7' }} />
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '900',
                margin: 0,
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                My Friends ({friends.length})
              </h2>
            </div>

            {friends.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#9ca3af'
              }}>
                <Users size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  No friends yet
                </p>
                <p style={{ fontSize: '1rem' }}>
                  Search for users and send friend requests to get started!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                      padding: '1.5rem',
                      borderRadius: '18px',
                      border: '2px solid #e9d5ff',
                      boxShadow: '0 2px 8px rgba(168, 85, 247, 0.1)',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.1)';
                    }}
                  >
                    {onlineUsers.has(friend.id) && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid white',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                      }} />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: onlineUsers.has(friend.id)
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '900',
                        fontSize: '1.25rem',
                        boxShadow: onlineUsers.has(friend.id)
                          ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                          : '0 4px 12px rgba(107, 114, 128, 0.3)'
                      }}>
                        {friend.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{
                          margin: '0 0 0.25rem',
                          fontWeight: '800',
                          fontSize: '1.125rem',
                          color: '#1f2937'
                        }}>
                          {friend.name}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          color: onlineUsers.has(friend.id) ? '#10b981' : '#6b7280',
                          fontWeight: '700'
                        }}>
                          {onlineUsers.has(friend.id) ? '🟢 Online' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
  onClick={() => handleStartConversation(friend.id)}
  style={{
    padding: '0.625rem 1rem',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
    color: 'white',
    fontWeight: '800',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
    minWidth: '0'
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = 'scale(1.03)';
    e.target.style.boxShadow = '0 6px 16px rgba(168, 85, 247, 0.4)';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'scale(1)';
    e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
  }}
>
  <MessageCircle size={18} />
  <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>
    Message
  </span>
</button>

                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        style={{
                          padding: '0.875rem',
                          borderRadius: '14px',
                          border: '2px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <UserMinus size={20} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <UserPlus size={32} style={{ color: '#a855f7' }} />
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '900',
                margin: 0,
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Friend Requests ({friendRequests.length})
              </h2>
            </div>

            {friendRequests.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#9ca3af'
              }}>
                <UserPlus size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  No pending requests
                </p>
                <p style={{ fontSize: '1rem' }}>
                  You'll see friend requests here when someone sends you one!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {friendRequests.map(request => (
                  <div
                    key={request.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                      padding: '1.5rem',
                      borderRadius: '18px',
                      border: '2px solid #fef3c7',
                      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.1)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '900',
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                      }}>
                        {request.fromUserEmail[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{
                          margin: '0 0 0.25rem',
                          fontWeight: '800',
                          fontSize: '1.125rem',
                          color: '#1f2937'
                        }}>
                          {request.fromUserEmail.split('@')[0]}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          fontWeight: '600'
                        }}>
                          {request.fromUserEmail}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleAcceptFriendRequest(request.id)}
                        style={{
                          padding: '0.875rem 1.5rem',
                          borderRadius: '14px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: '800',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.03)';
                          e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        <Check size={20} />
                        Accept
                      </button>

                      <button
                        onClick={() => handleRejectFriendRequest(request.id)}
                        style={{
                          padding: '0.875rem 1.5rem',
                          borderRadius: '14px',
                          border: '2px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          fontWeight: '800',
                          fontSize: '1rem',
                          color: '#ef4444',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.target.style.transform = 'scale(1.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <X size={20} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sentRequests.length > 0 && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  margin: '3rem 0 2rem'
                }}>
                  <Clock size={32} style={{ color: '#6b7280' }} />
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '900',
                    margin: 0,
                    color: '#6b7280'
                  }}>
                    Sent Requests ({sentRequests.length})
                  </h2>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {sentRequests.map(request => (
                    <div
                      key={request.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                        padding: '1.5rem',
                        borderRadius: '18px',
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '900',
                          fontSize: '1.25rem',
                          boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
                        }}>
                          {request.toUserEmail[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{
                            margin: '0 0 0.25rem',
                            fontWeight: '800',
                            fontSize: '1.125rem',
                            color: '#1f2937'
                          }}>
                            {request.toUserEmail.split('@')[0]}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            fontWeight: '600'
                          }}>
                            Pending...
                          </p>
                        </div>
                      </div>

                      <Clock size={24} style={{ color: '#9ca3af' }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div style={{ display: 'flex', height: '600px', gap: '1.5rem' }}>
            {/* Conversations List */}
            {!selectedConversation && (
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <MessageCircle size={32} style={{ color: '#a855f7' }} />
                    <h2 style={{
                      fontSize: '2rem',
                      fontWeight: '900',
                      margin: 0,
                      background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      Messages
                    </h2>
                  </div>

                 <button
  onClick={() => setShowCreateGroupChat(true)}
  style={{
    padding: '0.75rem 1rem',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
    color: 'white',
    fontWeight: '800',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
    whiteSpace: 'nowrap'
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = 'scale(1.03)';
    e.target.style.boxShadow = '0 6px 16px rgba(168, 85, 247, 0.4)';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'scale(1)';
    e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
  }}
>
  <Plus size={18} />
  <span style={{ 
    display: window.innerWidth > 640 ? 'inline' : 'none' 
  }}>
    Create Group Chat
  </span>
  <span style={{ 
    display: window.innerWidth <= 640 ? 'inline' : 'none' 
  }}>
    Group
  </span>
</button>
                </div>

                {conversations.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: '#9ca3af'
                  }}>
                    <MessageCircle size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      No conversations yet
                    </p>
                    <p style={{ fontSize: '1rem' }}>
                      Start a conversation with your friends or create a group chat!
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    overflowY: 'auto',
                    maxHeight: 'calc(600px - 100px)'
                  }}>
                    {conversations
                      .filter(conv => {
                        // Only show if conversation has messages OR is a group chat
                        return conv.lastMessage || conv.lastMessageTime || conv.isGroup;
                      })
                      .map(conv => {
                      const conversationUnread = unreadMessages[conv.id] || 0;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                            border: '2px solid #e9d5ff',
                            borderRadius: '18px',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.2s',
                            textAlign: 'left',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.2)';
                            e.currentTarget.style.borderColor = '#a855f7';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = '#e9d5ff';
                          }}
                        >
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: conv.isGroup
                              ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
                              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '900',
                            fontSize: '1.25rem',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                          }}>
                            {conv.isGroup ? (
                              <Users size={24} />
                            ) : (
                              conv.participantEmails?.find(e => e !== user.email)?.[0]?.toUpperCase() || '?'
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              margin: '0 0 0.25rem',
                              fontWeight: '800',
                              fontSize: '1.125rem',
                              color: '#1f2937',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {conv.isGroup
                                ? conv.name
                                : conv.participantEmails?.find(e => e !== user.email)?.split('@')[0] || 'Unknown'
                              }
                            </p>
                            <p style={{
  margin: 0,
  fontSize: '0.875rem',
  color: '#6b7280',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}}>
  {conv.lastMessage 
    ? (typeof conv.lastMessage === 'string' 
        ? conv.lastMessage 
        : conv.lastMessage.text || 'No messages yet')
    : 'No messages yet'}
</p>
                          </div>

                          {/* 🔔 NEW: Show unread message count on conversation */}
                          {conversationUnread > 0 && (
                            <span style={{
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8125rem',
                              fontWeight: '900',
                              border: '2px solid white',
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
                              flexShrink: 0
                            }}>
                              {conversationUnread > 99 ? '99+' : conversationUnread}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Create Group Chat Modal */}
            {showCreateGroupChat && (
              <CreateGroupChatModal
                friends={friends}
                onClose={() => setShowCreateGroupChat(false)}
                onCreate={handleCreateGroupChat}
              />
            )}

            {/* Selected Conversation */}
            {selectedConversation && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                borderRadius: '20px',
                border: '2px solid #e9d5ff',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.1)'
              }}>
                {/* Conversation Header */}
                <div style={{
                  padding: '1.5rem',
                  borderBottom: '2px solid #e9d5ff',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    style={{
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '2px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '14px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(168, 85, 247, 0.25)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(168, 85, 247, 0.15)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <ArrowLeft size={20} style={{ color: '#a855f7' }} />
                  </button>

                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: selectedConversation.isGroup
                      ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '900',
                    fontSize: '1.25rem',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                  }}>
                    {selectedConversation.isGroup ? (
                      <Users size={24} />
                    ) : (
                      selectedConversation.participantEmails?.find(e => e !== user.email)?.[0]?.toUpperCase() || '?'
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 0.125rem',
                      fontSize: '1.25rem',
                      fontWeight: '900',
                      color: '#1f2937'
                    }}>
                      {selectedConversation.isGroup
                        ? selectedConversation.name
                        : selectedConversation.participantEmails?.find(e => e !== user.email) || 'Unknown'
                      }
                    </h3>
                    {Object.keys(typingUsers).length > 0 && (
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#a855f7',
                        fontWeight: '600'
                      }}>
                        {Object.values(typingUsers)[0]} is typing...
                      </p>
                    )}
                  </div>
                </div>

                {/* 🗑️ AUTO-DELETE WARNING BANNER */}
                {messages.length > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    padding: '0.875rem 1.5rem',
                    borderBottom: '2px solid rgba(251, 191, 36, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    fontSize: '0.875rem',
                    color: '#92400e',
                    fontWeight: '700',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)'
                    }}>
                      🗑️
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: '800' }}>Chats auto-delete after 3 days</span>

                    </div>
                  </div>
                )}

                {/* Messages area */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fefbff 100%)'
                }}>
                  {displayMessages.map((msg, idx) => {
                    const isOwnMessage = msg.userId === user.uid || msg.userEmail === user.email;
                    const showAvatar = selectedConversation.isGroup && !isOwnMessage;
                    
                    return (
                      <div
                        key={msg.id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          gap: '0.75rem',
                          marginBottom: '1rem',
                          opacity: msg.isOptimistic ? 0.7 : 1
                        }}
                      >
                        {showAvatar && (
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '900',
                            fontSize: '0.875rem',
                            flexShrink: 0,
                            alignSelf: 'flex-end'
                          }}>
                            {getUserAvatar(msg.userId, msg.userEmail)}
                          </div>
                        )}
                        
                        <div style={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                        }}>
                          {showAvatar && (
                            <p style={{
                              margin: '0 0 0.25rem 0',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: '#6b7280'
                            }}>
                              {getUserDisplayName(msg.userId)}
                            </p>
                          )}
                          
                          <div style={{
                            padding: '1rem 1.25rem',
                            borderRadius: isOwnMessage
                              ? '22px 22px 4px 22px'
                              : '22px 22px 22px 4px',
                            background: isOwnMessage
                              ? 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)'
                              : 'white',
                            color: isOwnMessage ? 'white' : '#1f2937',
                            border: isOwnMessage ? 'none' : '2px solid #e9d5ff',
                            boxShadow: isOwnMessage
                              ? '0 4px 12px rgba(168, 85, 247, 0.3)'
                              : '0 2px 8px rgba(0,0,0,0.05)',
                            wordBreak: 'break-word'
                          }}>
                            <p style={{
                              margin: 0,
                              fontSize: '1rem',
                              lineHeight: '1.5',
                              fontWeight: '500'
                            }}>
                              {msg.text}
                            </p>
                          </div>
                          
                          <p style={{
                            margin: '0.25rem 0 0 0',
                            fontSize: '0.75rem',
                            color: '#9ca3af'
                          }}>
                            {msg.createdAt?.toDate ? 
                              msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                              new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                            {msg.isOptimistic && ' (sending...)'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div style={{
                  padding: '1.25rem',
                  borderTop: '2px solid #e9d5ff',
                  background: 'white',
                  borderRadius: '0 0 20px 20px'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      onFocus={(e) => {
                        handleTyping(true);
                        e.target.style.borderColor = '#a855f7';
                        e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                      }}
                      onBlur={(e) => {
                        handleTyping(false);
                        e.target.style.borderColor = '#e9d5ff';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '1rem 1.25rem',
                        borderRadius: '18px',
                        border: '2px solid #e9d5ff',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      style={{
                        padding: '1rem 1.75rem',
                        borderRadius: '18px',
                        border: 'none',
                        background: messageInput.trim()
                          ? 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)'
                          : '#d1d5db',
                        color: 'white',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        transition: 'all 0.2s',
                        boxShadow: messageInput.trim()
                          ? '0 6px 20px rgba(168, 85, 247, 0.3)'
                          : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (messageInput.trim()) {
                          e.target.style.transform = 'scale(1.03)';
                          e.target.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = messageInput.trim()
                          ? '0 6px 20px rgba(168, 85, 247, 0.3)'
                          : 'none';
                      }}
                    >
                      <Send size={20} />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

 {/* Success Modal */}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

// Create Group Chat Modal Component
function CreateGroupChatModal({ friends, onClose, onCreate }) {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const toggleFriend = (friend) => {
    setSelectedFriends(prev =>
      prev.some(f => f.id === friend.id)
        ? prev.filter(f => f.id !== friend.id)
        : [...prev, friend]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedFriends.length === 0) {
      alert('Please enter a group name and select at least one friend');
      return;
    }
    onCreate(groupName, selectedFriends);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '3px solid #a855f7'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '900',
            margin: 0,
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Create Group Chat
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <X size={20} style={{ color: '#ef4444' }} />
          </button>
        </div>

        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name..."
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            border: '2px solid #e9d5ff',
            fontSize: '1rem',
            marginBottom: '1.5rem',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#a855f7';
            e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e9d5ff';
            e.target.style.boxShadow = 'none';
          }}
        />

        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '800',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Select Friends ({selectedFriends.length})
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {friends.map(friend => (
            <button
              key={friend.id}
              onClick={() => toggleFriend(friend)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '14px',
                border: selectedFriends.some(f => f.id === friend.id)
                  ? '2px solid #a855f7'
                  : '2px solid #e5e7eb',
                background: selectedFriends.some(f => f.id === friend.id)
                  ? 'rgba(168, 85, 247, 0.1)'
                  : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: selectedFriends.some(f => f.id === friend.id)
                  ? 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '900',
                fontSize: '1.125rem',
                flexShrink: 0
              }}>
                {friend.email[0].toUpperCase()}
              </div>
              <span style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                {friend.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleCreate}
          disabled={!groupName.trim() || selectedFriends.length === 0}
          style={{
            width: '100%',
            padding: '1.125rem',
            borderRadius: '14px',
            border: 'none',
            background: groupName.trim() && selectedFriends.length > 0
              ? 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)'
              : '#d1d5db',
            color: 'white',
            fontWeight: '800',
            fontSize: '1.125rem',
            cursor: groupName.trim() && selectedFriends.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: groupName.trim() && selectedFriends.length > 0
              ? '0 6px 20px rgba(168, 85, 247, 0.3)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (groupName.trim() && selectedFriends.length > 0) {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = groupName.trim() && selectedFriends.length > 0
              ? '0 6px 20px rgba(168, 85, 247, 0.3)'
              : 'none';
          }}
        >
          Create Group Chat
        </button>
      </div>
    </div>
  );
}
