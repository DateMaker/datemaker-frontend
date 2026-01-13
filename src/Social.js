// 🎨 ENHANCED Social.js v2.0
// ✨ Softer colors, profile photos, message reactions, read receipts, better empty states
// 🛡️ WITH APPLE UGC SAFETY FEATURES - Report, Block, Filter

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserPlus, MessageCircle, Users, Heart, MapPin, Calendar, Send, X, Check, Clock, Share2, Trash2, UserMinus, Sparkles, TrendingUp, Plus, ArrowLeft, MessageSquare, Star, WifiOff, Flag, ShieldOff, ShieldCheck, AlertTriangle, CheckCheck, Image, Smile } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, orderBy, getDoc, deleteDoc, setDoc, writeBatch, limit, Timestamp } from 'firebase/firestore';
import SuccessModal from './SuccessModal';
import { setStatusBarColor, STATUS_BAR_COLORS } from './utils/statusBar';
import NotificationBell from './NotificationBell';
import { 
  sendFriendRequestNotification, 
  sendFriendAcceptedNotification,
  sendDateLikedNotification,
  sendMessageNotification 
} from './NotificationService';

// 🎨 NEW: Softer, more elegant color palette
const COLORS = {
  // Primary gradients - softer purples and pinks
  primaryGradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)',
  secondaryGradient: 'linear-gradient(135deg, #f0abfc 0%, #c084fc 50%, #a855f7 100%)',
  
  // Background - soft cream/lavender instead of harsh yellow
  backgroundGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 25%, #ede9fe 50%, #e9d5ff 75%, #ddd6fe 100%)',
  backgroundSolid: '#f5f3ff',
  
  // Cards and surfaces
  cardBackground: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
  cardBorder: '#e9d5ff',
  
  // Text colors
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  
  // Status colors
  online: '#10b981',
  offline: '#9ca3af',
  
  // Accent colors
  pink: '#ec4899',
  purple: '#a855f7',
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
};

// 🎨 NEW: Avatar component with profile photo support
const Avatar = ({ user, size = 48, showOnline = false, isOnline = false }) => {
  const [imageError, setImageError] = useState(false);
  
  const hasPhoto = user?.photoURL && !imageError;
  const initial = (user?.email || user?.name || '?')[0]?.toUpperCase();
  
  const gradients = [
    'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
  ];
  
  // Generate consistent gradient based on email/name
  const gradientIndex = (user?.email || user?.name || '').length % gradients.length;
  
  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      minWidth: size,
      flexShrink: 0
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: hasPhoto ? '#f3f4f6' : gradients[gradientIndex],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '800',
        fontSize: size * 0.4,
        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)',
        overflow: 'hidden',
        border: '2px solid white'
      }}>
        {hasPhoto ? (
          <img 
            src={user.photoURL} 
            alt={user.name || 'User'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        ) : (
          initial
        )}
      </div>
      
      {/* Online indicator */}
      {showOnline && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: '50%',
          background: isOnline ? COLORS.online : COLORS.offline,
          border: '2px solid white',
          boxShadow: isOnline ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
        }} />
      )}
    </div>
  );
};

// 🎨 NEW: Empty State component with illustrations
const EmptyState = ({ type, title, subtitle }) => {
  const illustrations = {
    feed: (
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>
        ✨📸💕
      </div>
    ),
    friends: (
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>
        👥💜🤝
      </div>
    ),
    requests: (
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>
        💌📬✉️
      </div>
    ),
    messages: (
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>
        💬🗨️💭
      </div>
    ),
    search: (
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>
        🔍👀🔎
      </div>
    ),
    blocked: (
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>
        🛡️✨🔒
      </div>
    )
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 2rem',
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      borderRadius: '24px',
      border: '2px dashed #e9d5ff'
    }}>
      {illustrations[type] || illustrations.feed}
      <h3 style={{
        fontSize: '1.375rem',
        fontWeight: '800',
        color: COLORS.textPrimary,
        margin: '0 0 0.5rem 0'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '1rem',
        color: COLORS.textSecondary,
        margin: 0,
        lineHeight: 1.5
      }}>
        {subtitle}
      </p>
    </div>
  );
};

// 🎨 NEW: Message Reactions Component
const MessageReactions = ({ reactions = {}, messageId, currentUserId, onReact }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const reactionEmojis = ['❤️', '😂', '😮', '😢', '👍', '🔥'];
  
  const reactionCounts = {};
  Object.entries(reactions).forEach(([emoji, users]) => {
    if (users && users.length > 0) {
      reactionCounts[emoji] = {
        count: users.length,
        hasReacted: users.includes(currentUserId)
      };
    }
  });
  
  const hasAnyReactions = Object.keys(reactionCounts).length > 0;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      {/* Existing reactions */}
      {hasAnyReactions && (
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          flexWrap: 'wrap'
        }}>
          {Object.entries(reactionCounts).map(([emoji, data]) => (
            <button
              key={emoji}
              onClick={() => onReact(messageId, emoji)}
              style={{
                background: data.hasReacted ? 'rgba(168, 85, 247, 0.15)' : 'rgba(0,0,0,0.05)',
                border: data.hasReacted ? '1.5px solid #a855f7' : '1.5px solid transparent',
                borderRadius: '12px',
                padding: '0.125rem 0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.125rem',
                fontSize: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              <span>{emoji}</span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: '700',
                color: data.hasReacted ? '#a855f7' : '#6b7280'
              }}>
                {data.count}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {/* Add reaction button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          opacity: 0.5,
          transition: 'opacity 0.2s',
          display: 'flex',
          alignItems: 'center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
      >
        <Smile size={14} />
      </button>
      
      {/* Emoji picker */}
      {showPicker && (
        <>
          <div 
            onClick={() => setShowPicker(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '0.25rem',
            background: 'white',
            borderRadius: '16px',
            padding: '0.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            gap: '0.25rem',
            zIndex: 100
          }}>
            {reactionEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(messageId, emoji);
                  setShowPicker(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3e8ff';
                  e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 🎨 NEW: Read Receipt Component
const ReadReceipt = ({ isRead, isSent }) => {
  if (!isSent) return null;
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      marginLeft: '0.25rem'
    }}>
      {isRead ? (
        <CheckCheck size={14} style={{ color: '#3b82f6' }} />
      ) : (
        <Check size={14} style={{ color: '#9ca3af' }} />
      )}
    </span>
  );
};

export default function Social({ user, onBack, feedNotificationCount = 0 }) {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);
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
  const [unreadMessages, setUnreadMessages] = useState({});
  const [viewingDate, setViewingDate] = useState(null);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [participantProfiles, setParticipantProfiles] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // 🛡️ UGC SAFETY STATE
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);
  const [blockedUsersList, setBlockedUsersList] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageTimeoutsRef = useRef(new Map());

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up Social component');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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

  // 🛡️ UGC SAFETY: Load blocked users
  useEffect(() => {
    if (!user) return;
    
    const blockedRef = collection(db, 'blockedUsers');
    const q = query(blockedRef, where('blockedBy', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blocked = snapshot.docs.map(doc => doc.data().blockedUserId);
      const blockedList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlockedUsers(blocked);
      setBlockedUsersList(blockedList);
    });
    
    return () => unsubscribe();
  }, [user]);

  // 🔔 Clear notifications when viewing tabs
  useEffect(() => {
    const clearTabNotification = async (tabName) => {
      try {
        if (tabName === 'requests' && friendRequests.length > 0) {
          const batch = writeBatch(db);
          friendRequests.forEach(request => {
            const requestRef = doc(db, 'friendRequests', request.id);
            batch.update(requestRef, { seen: true });
          });
          await batch.commit();
        }
        
        if (tabName === 'messages' && selectedConversation) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            [`lastReadMessages.${selectedConversation.id}`]: serverTimestamp()
          });
        }
        
        if (tabName === 'feed') {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            lastFeedVisit: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Error clearing notification:', error);
      }
    };

    if (activeTab === 'requests' || activeTab === 'messages' || activeTab === 'feed') {
      clearTabNotification(activeTab);
    }
  }, [activeTab, selectedConversation, friendRequests, user.uid]);

  // Scroll to bottom
  const [hasScrolledInitially, setHasScrolledInitially] = useState(false);

  useEffect(() => {
    if (selectedConversation && messages.length > 0 && !hasScrolledInitially) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        setHasScrolledInitially(true);
      }, 100);
    }
  }, [messages, selectedConversation, hasScrolledInitially]);

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

  // 🎨 Set background color for iOS
  useEffect(() => {
    const originalBackground = document.body.style.background;
    document.body.style.background = COLORS.backgroundGradient;
    
    return () => {
      document.body.style.background = originalBackground;
    };
  }, []);

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

  // Load friend requests
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

  // Load participant profiles
  useEffect(() => {
    if (!selectedConversation) {
      setParticipantProfiles({});
      return;
    }
    
    const loadParticipantProfiles = async () => {
      const profiles = {};
      const participantIds = selectedConversation.isGroup 
        ? selectedConversation.participants 
        : selectedConversation.participants.filter(id => id !== user.uid);

      for (const odedUserId of participantIds) {
        if (!profiles[odedUserId] && odedUserId !== user.uid) {
          try {
            const userDoc = await getDoc(doc(db, 'users', odedUserId));
            if (userDoc.exists()) {
              profiles[odedUserId] = userDoc.data();
            }
          } catch (error) {
            console.error('Error loading profile:', error);
          }
        }
      }

      setParticipantProfiles(profiles);
    };

    loadParticipantProfiles();
  }, [selectedConversation, user.uid]);

  // Load friends
  useEffect(() => {
    const sentQuery = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', user.uid),
      where('status', '==', 'accepted')
    );
    
    const receivedQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', user.uid),
      where('status', '==', 'accepted')
    );
    
    const friendsMap = new Map();
    
    const updateFriendsList = () => {
      const friendsList = Array.from(friendsMap.values())
        .filter(friend => !blockedUsers.includes(friend.id));
      setFriends(friendsList);
    };
    
    const unsubscribe1 = onSnapshot(sentQuery, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        friendsMap.set(data.toUserId, {
          id: data.toUserId,
          email: data.toUserEmail,
          name: data.toUserEmail.split('@')[0],
          photoURL: data.toUserPhoto || null
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
          name: data.fromUserEmail.split('@')[0],
          photoURL: data.fromUserPhoto || null
        });
      });
      updateFriendsList();
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user.uid, blockedUsers]);

  // Load feed
  useEffect(() => {
    if (!user) return;

    const feedQuery = query(
      collection(db, 'sharedDates'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(feedQuery, (snapshot) => {
      const dates = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(date => {
          if (blockedUsers.includes(date.userId)) return false;
          
          const isPublic = date.isPublic === true;
          const isCreator = date.userId === user.uid;
          const isInvited = date.invitedFriends?.includes(user.uid);
          
          return isPublic || isCreator || isInvited;
        });
      
      setFeed(dates);
    });

    return () => unsubscribe();
  }, [user, blockedUsers]);

  // Load conversations
  useEffect(() => {
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const unreadCounts = {};
      
      const convos = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        
        if (!data.isGroup) {
          const otherParticipants = data.participants?.filter(p => p !== user.uid) || [];
          const hasBlockedUser = otherParticipants.some(p => blockedUsers.includes(p));
          if (hasBlockedUser) return null;
        }
        
        const unreadCount = data.unreadCount?.[user.uid] || 0;
        if (unreadCount > 0) {
          unreadCounts[docSnapshot.id] = unreadCount;
        }
        
        return {
          id: docSnapshot.id,
          ...data,
          unreadCount
        };
      }).filter(Boolean);

      convos.sort((a, b) => {
        const timeA = a.lastMessageTime?.toMillis?.() || 0;
        const timeB = b.lastMessageTime?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setConversations(convos);
      setUnreadMessages(unreadCounts);
    });

    return () => unsubscribe();
  }, [user.uid, blockedUsers]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (conversationId) => {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${user.uid}`]: 0,
        [`readBy.${user.uid}`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user.uid]);

  // Load messages
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setOptimisticMessages([]);
      return;
    }

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
        
        if (blockedUsers.includes(data.userId)) return;
        
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
      
      if (oldMessages.length > 0) {
        const batch = writeBatch(db);
        oldMessages.forEach(ref => batch.delete(ref));
        batch.commit().catch(err => console.error('Error deleting old messages:', err));
      }
      
      const sortedMessages = recentMessages.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeA - timeB;
      });
      
      setMessages(sortedMessages);

      setOptimisticMessages(prev => 
        prev.filter(optMsg => 
          !sortedMessages.some(msg => 
            msg.text === optMsg.text && 
            msg.userId === optMsg.userId && 
            Math.abs((msg.createdAt?.toMillis() || 0) - optMsg.createdAt) < 5000
          )
        )
      );

      if (sortedMessages.length > 0) {
        markMessagesAsRead(selectedConversation.id);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation?.id, user.uid, blockedUsers, markMessagesAsRead]);

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
        if (data.userId !== user.uid && data.isTyping && !blockedUsers.includes(data.userId)) {
          typing[data.userId] = data.userEmail?.split('@')[0] || 'Someone';
        }
      });
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, [selectedConversation, user.uid, blockedUsers]);

  // 🛡️ UGC SAFETY: Report content
  const handleReportContent = (type, targetId, targetData) => {
    setReportTarget({ type, id: targetId, data: targetData });
    setShowReportModal(true);
  };

  // 🛡️ UGC SAFETY: Submit report
  const submitReport = async (reason) => {
    if (!reportTarget) return;
    
    try {
      await addDoc(collection(db, 'reportedContent'), {
        type: reportTarget.type,
        targetId: reportTarget.id,
        targetData: {
          userId: reportTarget.data.userId,
          userEmail: reportTarget.data.userEmail,
          content: reportTarget.type === 'post' 
            ? (reportTarget.data.caption || reportTarget.data.notes || 'No content')
            : reportTarget.type === 'message'
            ? reportTarget.data.text
            : null
        },
        reason: reason,
        reportedBy: user.uid,
        reportedByEmail: user.email,
        reportedAt: serverTimestamp(),
        status: 'pending'
      });
      
      setShowReportModal(false);
      setReportTarget(null);
      setSuccessMessage('Report submitted. We review all reports within 24 hours.');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  // 🛡️ UGC SAFETY: Block user
  const handleBlockUser = async (targetUserId, targetUserEmail) => {
    if (!window.confirm(`Block ${targetUserEmail?.split('@')[0] || 'this user'}?\n\nYou won't see their posts or messages.`)) {
      return;
    }
    
    try {
      await addDoc(collection(db, 'blockedUsers'), {
        blockedBy: user.uid,
        blockedByEmail: user.email,
        blockedUserId: targetUserId,
        blockedUserEmail: targetUserEmail,
        blockedAt: serverTimestamp()
      });
      
      setBlockedUsers(prev => [...prev, targetUserEmail]);
      
      // Remove friend relationship
      try {
        const sentQuery = query(
          collection(db, 'friendRequests'),
          where('fromUserId', '==', user.uid),
          where('toUserId', '==', targetUserId),
          where('status', '==', 'accepted')
        );
        
        const receivedQuery = query(
          collection(db, 'friendRequests'),
          where('toUserId', '==', user.uid),
          where('fromUserId', '==', targetUserId),
          where('status', '==', 'accepted')
        );
        
        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery)
        ]);
        
        const batch = writeBatch(db);
        let hasDeletes = false;
        
        sentSnapshot.docs.forEach(docSnapshot => {
          batch.delete(doc(db, 'friendRequests', docSnapshot.id));
          hasDeletes = true;
        });
        
        receivedSnapshot.docs.forEach(docSnapshot => {
          batch.delete(doc(db, 'friendRequests', docSnapshot.id));
          hasDeletes = true;
        });
        
        if (hasDeletes) await batch.commit();
      } catch (friendError) {
        console.warn('Could not remove friend:', friendError);
      }
      
      setSuccessMessage(`Blocked ${targetUserEmail?.split('@')[0] || 'user'}.`);
      
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Failed to block user.');
    }
  };

  // 🛡️ UGC SAFETY: Unblock user
  const handleUnblockUser = async (blockRecord) => {
    try {
      await deleteDoc(doc(db, 'blockedUsers', blockRecord.id));
      setSuccessMessage(`Unblocked ${blockRecord.blockedUserEmail?.split('@')[0] || 'user'}.`);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user.');
    }
  };

  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchTerm = searchQuery.toLowerCase().trim();
      
      const emailQuery = query(
        collection(db, 'users'),
        where('email', '>=', searchTerm),
        where('email', '<=', searchTerm + '\uf8ff'),
        limit(20)
      );
      
      const emailSnapshot = await getDocs(emailQuery);
      const emailResults = emailSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid && !blockedUsers.includes(u.id));
      
      let nameResults = [];
      try {
        const nameQuery = query(
          collection(db, 'users'),
          where('nameLower', '>=', searchTerm),
          where('nameLower', '<=', searchTerm + '\uf8ff'),
          limit(20)
        );
        
        const nameSnapshot = await getDocs(nameQuery);
        nameResults = nameSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== user.uid && !blockedUsers.includes(u.id));
      } catch (nameError) {
        console.log('Name search skipped');
      }
      
      const combinedMap = new Map();
      [...emailResults, ...nameResults].forEach(user => {
        combinedMap.set(user.id, user);
      });
      const results = Array.from(combinedMap.values());
      
      setSearchResults(results);
      
    } catch (error) {
      console.error('Search error:', error);
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
        fromUserPhoto: userProfile?.photoURL || null,
        toUserId: toUser.id,
        toUserEmail: toUser.email,
        toUserPhoto: toUser.photoURL || null,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await sendFriendRequestNotification(user, toUser.id);

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

        await sendFriendAcceptedNotification(user, request.fromUserId);
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

  // Cancel sent friend request
  const handleCancelFriendRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
      setSuccessMessage('Friend request cancelled');
    } catch (error) {
      console.error('Error cancelling friend request:', error);
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

  // Get user display name
  const getUserDisplayName = (userId) => {
    const profile = participantProfiles[userId];
    return profile?.name || profile?.email?.split('@')[0] || 'User';
  };

  // Combine messages
  const displayMessages = [...messages, ...optimisticMessages].sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt;
    return timeA - timeB;
  });

  // Handle typing
  const handleTyping = async (isTyping) => {
    if (!selectedConversation) return;

    try {
      const typingRef = doc(db, 'typing', `${selectedConversation.id}_${user.uid}`);
      
      if (isTyping) {
        await setDoc(typingRef, {
          conversationId: selectedConversation.id,
          userId: user.uid,
          userEmail: user.email,
          isTyping: true,
          timestamp: serverTimestamp()
        }, { merge: true });

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

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

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    if (messageInput.length > 1000) {
      alert('Message too long! Maximum 1000 characters.');
      return;
    }

    const messageText = messageInput.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
      
    const optimisticMessage = {
      id: tempId,
      text: messageText,
      userId: user.uid,
      userEmail: user.email,
      conversationId: selectedConversation.id,
      createdAt: Date.now(),
      isOptimistic: true
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    setMessageInput('');
    handleTyping(false);

    try {
      const timestamp = Timestamp.fromDate(new Date());
      
      await addDoc(collection(db, 'messages'), {
        conversationId: selectedConversation.id,
        userId: user.uid,
        userEmail: user.email,
        text: messageText,
        createdAt: timestamp,
        reactions: {}
      });

      const otherParticipants = selectedConversation.participants?.filter(p => p !== user.uid) || [];
      for (const recipientId of otherParticipants) {
        if (!blockedUsers.includes(recipientId)) {
          await sendMessageNotification(user, recipientId, {
            conversationId: selectedConversation.id,
            text: messageText
          });
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      alert('Failed to send message.');
    }
  };

  // 🎨 NEW: Handle message reaction
  const handleMessageReaction = async (messageId, emoji) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      const currentReactions = messageDoc.data().reactions || {};
      const currentUsers = currentReactions[emoji] || [];
      
      let newUsers;
      if (currentUsers.includes(user.uid)) {
        newUsers = currentUsers.filter(u => u !== user.uid);
      } else {
        newUsers = [...currentUsers, user.uid];
      }
      
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: newUsers
      });
      
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  // Like date
  const handleLikeDate = async (dateId, currentLikes = []) => {
    try {
      const dateRef = doc(db, 'sharedDates', dateId);
      const hasLiked = currentLikes.includes(user.uid);
      
      const dateData = feed.find(d => d.id === dateId);
      
      setFeed(prevFeed => prevFeed.map(date => {
        if (date.id === dateId) {
          const newLikes = hasLiked
            ? currentLikes.filter(uid => uid !== user.uid)
            : [...currentLikes, user.uid];
          return { ...date, likes: newLikes };
        }
        return date;
      }));
      
      if (hasLiked) {
        await updateDoc(dateRef, { likes: arrayRemove(user.uid) });
      } else {
        await updateDoc(dateRef, { likes: arrayUnion(user.uid) });

        if (dateData && dateData.userId !== user.uid) {
          await sendDateLikedNotification(user, dateData.userId, {
            dateId: dateId,
            title: dateData.title || 'a date'
          });
        }
      }
      
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

// Delete/Leave conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const convDoc = await getDoc(conversationRef);
      
      if (!convDoc.exists()) {
        setSuccessMessage('Conversation not found');
        return;
      }
      
      const convData = convDoc.data();
      
      // If it's a DM or user is the only participant, delete entirely
      if (!convData.isGroup || convData.participants?.length <= 2) {
        // Try to delete - if rules allow
        try {
          await deleteDoc(conversationRef);
          setSuccessMessage('Conversation deleted');
        } catch (deleteError) {
          // If delete fails, just hide it by removing self from participants
          await updateDoc(conversationRef, {
            participants: arrayRemove(user.uid),
            participantEmails: arrayRemove(user.email)
          });
          setSuccessMessage('Conversation removed');
        }
      } else {
        // For groups, just leave the group
        await updateDoc(conversationRef, {
          participants: arrayRemove(user.uid),
          participantEmails: arrayRemove(user.email)
        });
        setSuccessMessage('Left the group');
      }
      
      // Close conversation if it was selected
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setSuccessMessage('Removed from your chats');
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

  const totalUnreadMessages = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: COLORS.backgroundGradient,
      padding: 'clamp(1rem, 4vw, 2rem)',
      paddingTop: 'calc(clamp(1rem, 4vw, 2rem) + env(safe-area-inset-top))',
      paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))',
      boxSizing: 'border-box',
      width: '100%',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: 'calc(1rem + env(safe-area-inset-top))',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '100px',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 9999,
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          <WifiOff size={18} />
          You're offline
        </div>
      )}
      
      {/* Header */}
      <div style={{
        background: COLORS.primaryGradient,
        borderRadius: 'clamp(20px, 5vw, 28px)',
        padding: 'clamp(1.25rem, 4vw, 1.75rem)',
        marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
        boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3)',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Top row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '14px',
                padding: '0.625rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={22} style={{ color: 'white' }} />
            </button>

            <NotificationBell 
              user={user} 
              onNavigate={async (section, itemId) => {
                switch (section) {
                  case 'feed':
                    setActiveTab('feed');
                    if (itemId) {
                      let dateToView = feed.find(d => d.id === itemId);
                      if (!dateToView) {
                        try {
                          const dateDoc = await getDoc(doc(db, 'sharedDates', itemId));
                          if (dateDoc.exists()) {
                            dateToView = { id: dateDoc.id, ...dateDoc.data() };
                          }
                        } catch (error) {
                          console.error('Error fetching date:', error);
                        }
                      }
                      if (dateToView) setViewingDate(dateToView);
                    }
                    break;
                  case 'messages':
                    setActiveTab('messages');
                    if (itemId) {
                      const conv = conversations.find(c => c.id === itemId);
                      if (conv) setSelectedConversation(conv);
                    }
                    break;
                  case 'requests':
                    setActiveTab('requests');
                    break;
                  case 'friends':
                    setActiveTab('friends');
                    break;
                  default:
                    break;
                }
              }}
            />
          </div>

          <button
            onClick={() => setShowBlockedUsersModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '14px',
              padding: '0.625rem 0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.875rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={18} />
            {blockedUsers.length > 0 && (
              <span style={{
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: '900'
              }}>
                {blockedUsers.length}
              </span>
            )}
          </button>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 7vw, 2.5rem)',
            fontWeight: '900',
            margin: 0,
            color: 'white',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            lineHeight: 1.1
          }}>
            Social ✨
          </h1>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}>
            Connect, share, and plan together
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.5rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {[
            { id: 'feed', icon: Sparkles, count: feedNotificationCount },
            { id: 'search', icon: Search, count: 0 },
            { id: 'friends', icon: Users, count: 0 },
            { id: 'requests', icon: UserPlus, count: friendRequests.filter(r => !r.seen).length },
            { id: 'messages', icon: MessageCircle, count: totalUnreadMessages }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                borderRadius: '14px',
                border: activeTab === tab.id 
                  ? '2.5px solid white' 
                  : '2.5px solid transparent',
                background: activeTab === tab.id
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                color: activeTab === tab.id ? '#8b5cf6' : 'white',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                minWidth: 0
              }}
            >
              <tab.icon size={22} strokeWidth={2.5} />
              {tab.count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: '900',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                }}>
                  {tab.count > 9 ? '9+' : tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{
        background: 'white',
        borderRadius: 'clamp(20px, 5vw, 28px)',
        padding: 'clamp(1.25rem, 4vw, 2rem)',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1)',
        border: '2px solid #e9d5ff',
        minHeight: '400px',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}>
        
        {/* ============================================ */}
        {/* FEED TAB */}
        {/* ============================================ */}
        {activeTab === 'feed' && !viewingDate && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0abfc 0%, #a855f7 100%)',
                borderRadius: '14px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '900',
                  margin: 0,
                  color: COLORS.textPrimary
                }}>
                  Your Feed
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: COLORS.textSecondary,
                  fontWeight: '600'
                }}>
                  {feed.length} {feed.length === 1 ? 'date' : 'dates'} shared
                </p>
              </div>
            </div>

            {feed.length === 0 ? (
              <EmptyState 
                type="feed"
                title="No dates shared yet"
                subtitle="Share your amazing dates with friends or make them public!"
              />
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {feed.map(date => (
                  <div
                    key={date.id}
                    onClick={(e) => {
                      if (!e.target.closest('button')) {
                        setViewingDate(date);
                      }
                    }}
                    style={{
                      background: COLORS.cardBackground,
                      borderRadius: '20px',
                      padding: 'clamp(1rem, 4vw, 1.5rem)',
                      border: `2px solid ${COLORS.cardBorder}`,
                      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.08)',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      width: '100%'
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <Avatar 
                          user={{ email: date.userEmail, photoURL: date.userPhoto }}
                          size={44}
                        />
                        <div>
                          <p style={{
                            margin: 0,
                            fontWeight: '800',
                            fontSize: '1rem',
                            color: COLORS.textPrimary
                          }}>
                            {date.userEmail?.split('@')[0] || 'Unknown'}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            color: COLORS.textSecondary,
                            fontWeight: '600'
                          }}>
                            {date.createdAt?.toDate().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        {date.userId === user.uid && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSharedDate(date.id);
                            }}
                            style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1.5px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: '10px',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={16} style={{ color: '#ef4444' }} />
                          </button>
                        )}

                        {date.userId !== user.uid && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReportContent('post', date.id, date);
                              }}
                              style={{
                                background: 'rgba(251, 191, 36, 0.1)',
                                border: '1.5px solid rgba(251, 191, 36, 0.25)',
                                borderRadius: '10px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Flag size={16} style={{ color: '#d97706' }} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBlockUser(date.userId, date.userEmail);
                              }}
                              style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1.5px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '10px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <ShieldOff size={16} style={{ color: '#ef4444' }} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Date Name */}
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      margin: '0 0 0.875rem',
                      color: COLORS.textPrimary
                    }}>
                      {date.dateData?.title || date.name || 'Untitled Date'}
                    </h3>

                    {/* Preview Image from first stop */}
                    {(() => {
                      const stops = date.dateData?.stops || date.dateData?.itinerary?.stops || date.stops || [];
                      const firstStop = stops[0];
                      const previewImage = firstStop?.image || firstStop?.photo || date.coverImage;
                      
                      if (previewImage) {
                        return (
                          <div style={{
                            width: '100%',
                            height: '140px',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
                          }}>
                            <img 
                              src={previewImage}
                              alt="Date preview"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => e.target.parentElement.style.display = 'none'}
                            />
                          </div>
                        );
                      }
                      
                      // Show mini map if we have location coords
                      const lat = firstStop?.geometry?.location?.lat || firstStop?.lat;
                      const lng = firstStop?.geometry?.location?.lng || firstStop?.lng;
                      
                      if (lat && lng) {
                        return (
                          <div style={{
                            width: '100%',
                            height: '120px',
                            borderRadius: '14px',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            background: '#f3e8ff'
                          }}>
                            <img 
                              src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x150&markers=color:purple%7C${lat},${lng}&style=feature:poi%7Cvisibility:off&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}`}
                              alt="Location map"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => e.target.parentElement.style.display = 'none'}
                            />
                          </div>
                        );
                      }
                      
                      return null;
                    })()}

                    {/* Activities */}
                    {date.activities && date.activities.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        {date.activities.slice(0, 4).map((activity, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '10px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              color: '#7c3aed'
                            }}
                          >
                            {activity}
                          </span>
                        ))}
                        {date.activities.length > 4 && (
                          <span style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: COLORS.textSecondary
                          }}>
                            +{date.activities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Location & Budget */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      {date.location && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.85rem',
                          color: COLORS.textSecondary,
                          fontWeight: '600'
                        }}>
                          <MapPin size={16} style={{ color: COLORS.pink }} />
                          {date.location}
                        </div>
                      )}
                      {date.budget && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.85rem',
                          color: COLORS.textSecondary,
                          fontWeight: '600'
                        }}>
                          <span>💰</span>
                          {date.budget}
                        </div>
                      )}
                    </div>

                    {/* Like Button */}
                    <div style={{
                      paddingTop: '0.875rem',
                      borderTop: '1.5px solid #f3e8ff'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeDate(date.id, date.likes || []);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: (date.likes || []).includes(user.uid)
                            ? '2px solid #ec4899'
                            : '2px solid #f3e8ff',
                          background: (date.likes || []).includes(user.uid)
                            ? 'rgba(236, 72, 153, 0.08)'
                            : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          color: (date.likes || []).includes(user.uid) ? '#ec4899' : COLORS.textSecondary,
                          transition: 'all 0.2s'
                        }}
                      >
                        <Heart
                          size={18}
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
        {activeTab === 'feed' && viewingDate && (
          <div>
            <button
              onClick={() => setViewingDate(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '2px solid #e9d5ff',
                background: 'white',
                color: COLORS.purple,
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
            >
              <ArrowLeft size={18} />
              Back to Feed
            </button>

            <div style={{
              background: COLORS.cardBackground,
              borderRadius: '20px',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              border: `2px solid ${COLORS.cardBorder}`
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
                <Avatar 
                  user={{ email: viewingDate.userEmail, photoURL: viewingDate.userPhoto }}
                  size={52}
                />
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: '1.375rem',
                    fontWeight: '900',
                    color: COLORS.textPrimary,
                    margin: 0
                  }}>
                    {viewingDate.dateData?.title || viewingDate.name || 'Date Night'}
                  </h2>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: COLORS.textSecondary,
                    fontWeight: '600'
                  }}>
                    by {viewingDate.userEmail?.split('@')[0]}
                  </p>
                </div>
              </div>

              {/* Caption */}
              {viewingDate.caption && (
                <div style={{
                  background: '#faf5ff',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  border: '1.5px solid #f3e8ff'
                }}>
                  <p style={{
                    fontSize: '1rem',
                    color: COLORS.textPrimary,
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {viewingDate.caption}
                  </p>
                </div>
              )}

              {/* Stops */}
              {(() => {
                const stops = viewingDate.dateData?.stops || 
                             viewingDate.dateData?.itinerary?.stops || 
                             viewingDate.stops || [];
                
                return stops.length > 0 && (
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '800',
                      color: COLORS.textPrimary,
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <MapPin size={20} style={{ color: COLORS.purple }} />
                      {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {stops.map((stop, index) => (
                        <div
                          key={index}
                          style={{
                            background: 'white',
                            borderRadius: '16px',
                            border: '2px solid #e9d5ff',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{
                            background: COLORS.primaryGradient,
                            padding: '0.875rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '900',
                              fontSize: '0.9rem'
                            }}>
                              {index + 1}
                            </div>
                            <div>
                              {stop.time && (
                                <p style={{
                                  margin: 0,
                                  fontSize: '0.85rem',
                                  fontWeight: '700',
                                  color: 'white'
                                }}>
                                  {stop.time}
                                </p>
                              )}
                            </div>
                          </div>

                          <div style={{ padding: '1rem' }}>
                            {/* Stop Image */}
                            {(stop.image || stop.photo) && (
                              <div style={{
                                width: '100%',
                                height: '160px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                marginBottom: '0.875rem',
                                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
                              }}>
                                <img 
                                  src={stop.image || stop.photo}
                                  alt={stop.title || stop.name || 'Venue'}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => e.target.parentElement.style.display = 'none'}
                                />
                              </div>
                            )}

                            {/* Mini Map */}
                            {(() => {
                              const lat = stop.geometry?.location?.lat || stop.lat;
                              const lng = stop.geometry?.location?.lng || stop.lng;
                              
                              if (lat && lng && !stop.image && !stop.photo) {
                                return (
                                  <div style={{
                                    width: '100%',
                                    height: '120px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    marginBottom: '0.875rem',
                                    background: '#f3e8ff'
                                  }}>
                                    <img 
                                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=400x150&markers=color:purple%7C${lat},${lng}&style=feature:poi%7Cvisibility:off&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}`}
                                      alt="Location"
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                      onError={(e) => e.target.parentElement.style.display = 'none'}
                                    />
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            <h4 style={{
                              fontSize: '1.125rem',
                              fontWeight: '800',
                              color: COLORS.textPrimary,
                              margin: '0 0 0.5rem'
                            }}>
                              {stop.title || stop.name || stop.venueName || 'Stop'}
                            </h4>

                            {/* Description */}
                            {stop.description && (
                              <p style={{
                                fontSize: '0.875rem',
                                color: COLORS.textSecondary,
                                lineHeight: 1.5,
                                margin: '0 0 0.75rem'
                              }}>
                                {stop.description}
                              </p>
                            )}

                            {/* Rating */}
                            {stop.rating && (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                marginBottom: '0.75rem',
                                background: '#fffbeb',
                                padding: '0.375rem 0.625rem',
                                borderRadius: '8px'
                              }}>
                                <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#92400e' }}>
                                  {typeof stop.rating === 'number' ? stop.rating.toFixed(1) : stop.rating}
                                </span>
                              </div>
                            )}
                            
                            {stop.vicinity && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'start',
                                gap: '0.375rem',
                                fontSize: '0.875rem',
                                color: COLORS.textSecondary,
                                background: '#faf5ff',
                                padding: '0.625rem 0.75rem',
                                borderRadius: '10px'
                              }}>
                                <MapPin size={14} style={{ marginTop: '0.125rem', flexShrink: 0, color: COLORS.pink }} />
                                {stop.vicinity}
                              </div>
                            )}

                            {/* Price Level */}
                            {stop.priceLevel && (
                              <div style={{
                                marginTop: '0.625rem',
                                fontSize: '0.85rem',
                                color: '#10b981',
                                fontWeight: '700'
                              }}>
                                {'💰'.repeat(stop.priceLevel)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Like */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '2px solid #f3e8ff',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => handleLikeDate(viewingDate.id, viewingDate.likes || [])}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '14px',
                    border: (viewingDate.likes || []).includes(user.uid)
                      ? '2px solid #ec4899'
                      : '2px solid #e9d5ff',
                    background: (viewingDate.likes || []).includes(user.uid)
                      ? 'rgba(236, 72, 153, 0.08)'
                      : 'white',
                    color: (viewingDate.likes || []).includes(user.uid) ? '#ec4899' : COLORS.purple,
                    fontWeight: '800',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem'
                  }}
                >
                  <Heart
                    size={22}
                    fill={(viewingDate.likes || []).includes(user.uid) ? '#ec4899' : 'none'}
                  />
                  {(viewingDate.likes || []).length} {(viewingDate.likes || []).length === 1 ? 'Like' : 'Likes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SEARCH TAB */}
        {/* ============================================ */}
        {activeTab === 'search' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                borderRadius: '14px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Search size={24} style={{ color: 'white' }} />
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '900',
                margin: 0,
                color: COLORS.textPrimary
              }}>
                Find Friends
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                  if (e.target.value.trim().length >= 2) {
                    searchTimeoutRef.current = setTimeout(handleSearch, 300);
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by email or name..."
                style={{
                  flex: 1,
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  border: '2px solid #e9d5ff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: loading ? '#d1d5db' : COLORS.primaryGradient,
                  color: 'white',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Search size={18} />
              </button>
            </div>

            {searchResults.length === 0 && searchQuery.trim() && !loading && (
              <EmptyState 
                type="search"
                title="No users found"
                subtitle="Try searching with the start of their email address"
              />
            )}

            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: COLORS.cardBackground,
                      padding: '1rem',
                      borderRadius: '16px',
                      border: `2px solid ${COLORS.cardBorder}`
                    }}
                  >
                    <Avatar user={result} size={48} />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontWeight: '700',
                        fontSize: '1rem',
                        color: COLORS.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {result.name || result.email.split('@')[0]}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: COLORS.textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {result.email}
                      </p>
                    </div>

                    <button
                      onClick={() => !sentRequests.some(r => r.toUserId === result.id) && handleSendFriendRequest(result)}
                      disabled={sentRequests.some(r => r.toUserId === result.id)}
                      style={{
                        padding: '0.625rem 1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: sentRequests.some(r => r.toUserId === result.id)
                          ? '#9ca3af'
                          : COLORS.primaryGradient,
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.875rem',
                        cursor: sentRequests.some(r => r.toUserId === result.id) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        flexShrink: 0
                      }}
                    >
                      {sentRequests.some(r => r.toUserId === result.id) ? (
                        <>
                          <Clock size={16} />
                          Sent
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* FRIENDS TAB */}
        {/* ============================================ */}
        {activeTab === 'friends' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '14px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '900',
                  margin: 0,
                  color: COLORS.textPrimary
                }}>
                  My Friends
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: COLORS.textSecondary,
                  fontWeight: '600'
                }}>
                  {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                </p>
              </div>
            </div>

            {friends.length === 0 ? (
              <EmptyState 
                type="friends"
                title="No friends yet"
                subtitle="Search for users and send friend requests to get started!"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: COLORS.cardBackground,
                      padding: '1rem',
                      borderRadius: '16px',
                      border: `2px solid ${COLORS.cardBorder}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Avatar 
                      user={friend} 
                      size={48} 
                      showOnline 
                      isOnline={onlineUsers.has(friend.id)} 
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontWeight: '700',
                        fontSize: '1rem',
                        color: COLORS.textPrimary
                      }}>
                        {friend.name}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: onlineUsers.has(friend.id) ? COLORS.online : COLORS.textMuted,
                        fontWeight: '600'
                      }}>
                        {onlineUsers.has(friend.id) ? '● Online' : 'Offline'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleStartConversation(friend.id)}
                        style={{
                          padding: '0.625rem',
                          borderRadius: '12px',
                          border: 'none',
                          background: COLORS.primaryGradient,
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <MessageCircle size={18} />
                      </button>

                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        style={{
                          padding: '0.625rem',
                          borderRadius: '12px',
                          border: '1.5px solid rgba(239, 68, 68, 0.25)',
                          background: 'rgba(239, 68, 68, 0.08)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <UserMinus size={18} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* REQUESTS TAB */}
        {/* ============================================ */}
        {activeTab === 'requests' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                borderRadius: '14px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserPlus size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '900',
                  margin: 0,
                  color: COLORS.textPrimary
                }}>
                  Requests
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: COLORS.textSecondary,
                  fontWeight: '600'
                }}>
                  {friendRequests.length} pending
                </p>
              </div>
            </div>

            {friendRequests.length === 0 ? (
              <EmptyState 
                type="requests"
                title="No pending requests"
                subtitle="Friend requests will appear here when someone sends you one!"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {friendRequests.map(request => (
                  <div
                    key={request.id}
                    style={{
                      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                      padding: '1rem',
                      borderRadius: '16px',
                      border: '2px solid #fde68a'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      marginBottom: '0.875rem'
                    }}>
                      <Avatar 
                        user={{ email: request.fromUserEmail, photoURL: request.fromUserPhoto }}
                        size={48}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0,
                          fontWeight: '700',
                          fontSize: '1rem',
                          color: COLORS.textPrimary
                        }}>
                          {request.fromUserEmail.split('@')[0]}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: COLORS.textSecondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {request.fromUserEmail}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                      <button
                        onClick={() => handleAcceptFriendRequest(request.id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem'
                        }}
                      >
                        <Check size={18} />
                        Accept
                      </button>

                      <button
                        onClick={() => handleRejectFriendRequest(request.id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: '2px solid rgba(239, 68, 68, 0.25)',
                          background: 'rgba(239, 68, 68, 0.08)',
                          color: '#ef4444',
                          fontWeight: '700',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.375rem'
                        }}
                      >
                        <X size={18} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  margin: '2rem 0 1rem'
                }}>
                  <Clock size={20} style={{ color: COLORS.textMuted }} />
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    margin: 0,
                    color: COLORS.textSecondary
                  }}>
                    Sent ({sentRequests.length})
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sentRequests.map(request => (
                    <div
                      key={request.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.875rem',
                        background: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '14px',
                        border: '1.5px solid #e5e7eb'
                      }}
                    >
                      <Avatar 
                        user={{ email: request.toUserEmail, photoURL: request.toUserPhoto }}
                        size={40}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0,
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          color: COLORS.textPrimary
                        }}>
                          {request.toUserEmail.split('@')[0]}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: COLORS.textMuted
                        }}>
                          Pending...
                        </p>
                      </div>

                      <button
                        onClick={() => handleCancelFriendRequest(request.id)}
                        style={{
                          padding: '0.5rem 0.875rem',
                          borderRadius: '10px',
                          border: '1.5px solid rgba(239, 68, 68, 0.25)',
                          background: 'rgba(239, 68, 68, 0.08)',
                          color: '#ef4444',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* MESSAGES TAB */}
        {/* ============================================ */}
        {activeTab === 'messages' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Conversations List */}
            {!selectedConversation && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      background: COLORS.primaryGradient,
                      borderRadius: '14px',
                      padding: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MessageCircle size={24} style={{ color: 'white' }} />
                    </div>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: '900',
                      margin: 0,
                      color: COLORS.textPrimary
                    }}>
                      Messages
                    </h2>
                  </div>

                  <button
                    onClick={() => setShowCreateGroupChat(true)}
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: COLORS.primaryGradient,
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <Plus size={18} />
                    Group
                  </button>
                </div>

                {conversations.length === 0 ? (
                  <EmptyState 
                    type="messages"
                    title="No conversations yet"
                    subtitle="Start chatting with your friends or create a group!"
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.875rem',
                    overflowY: 'auto',
                    flex: 1,
                    paddingBottom: '1rem'
                  }}>
                    {conversations
                      .filter(conv => conv.lastMessage || conv.lastMessageTime || conv.isGroup)
                      .map(conv => {
                        const conversationUnread = unreadMessages[conv.id] || 0;
                        const otherUser = {
                          email: conv.participantEmails?.find(e => e !== user.email),
                          photoURL: conv.participantPhotos?.find((_, i) => 
                            conv.participantEmails?.[i] !== user.email
                          )
                        };
                        
                        return (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            style={{
                              background: conversationUnread > 0 
                                ? 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)' 
                                : COLORS.cardBackground,
                              border: conversationUnread > 0 
                                ? '2px solid #c084fc' 
                                : `2px solid ${COLORS.cardBorder}`,
                              borderRadius: '20px',
                              padding: '1rem 1.25rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              textAlign: 'left',
                              width: '100%',
                              boxSizing: 'border-box',
                              transition: 'all 0.2s',
                              minHeight: '80px'
                            }}
                          >
                            {conv.isGroup ? (
                              <div style={{
                                width: '56px',
                                height: '56px',
                                minWidth: '56px',
                                borderRadius: '50%',
                                background: COLORS.primaryGradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexShrink: 0
                              }}>
                                <Users size={26} />
                              </div>
                            ) : (
                              <Avatar user={otherUser} size={56} />
                            )}

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                margin: '0 0 0.375rem 0',
                                fontWeight: conversationUnread > 0 ? '800' : '700',
                                fontSize: '1.0625rem',
                                color: COLORS.textPrimary,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {conv.isGroup
                                  ? conv.name
                                  : otherUser.email?.split('@')[0] || 'Unknown'
                                }
                              </p>
                              <p style={{
                                margin: 0,
                                fontSize: '0.9rem',
                                color: conversationUnread > 0 ? COLORS.textPrimary : COLORS.textSecondary,
                                fontWeight: conversationUnread > 0 ? '600' : '500',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {conv.lastMessage 
                                  ? (typeof conv.lastMessage === 'string' 
                                      ? conv.lastMessage 
                                      : conv.lastMessage.text || 'No messages')
                                  : 'No messages yet'}
                              </p>
                            </div>

                            {conversationUnread > 0 && (
                              <span style={{
                                background: '#ef4444',
                                color: 'white',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                flexShrink: 0
                              }}>
                                {conversationUnread > 9 ? '9+' : conversationUnread}
                              </span>
                            )}
                            
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this conversation? Messages cannot be recovered.')) {
                                  handleDeleteConversation(conv.id);
                                }
                              }}
                              style={{
                                padding: '0.5rem',
                                borderRadius: '10px',
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '1.5px solid rgba(239, 68, 68, 0.2)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Trash2 size={16} style={{ color: '#ef4444' }} />
                            </div>
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
                background: '#fafafa',
                borderRadius: '20px',
                border: `2px solid ${COLORS.cardBorder}`,
                overflow: 'hidden',
                height: '100%'
              }}>
                {/* Header */}
                <div style={{
                  padding: '0.875rem 1rem',
                  borderBottom: `2px solid ${COLORS.cardBorder}`,
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexShrink: 0
                }}>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ArrowLeft size={18} style={{ color: COLORS.purple }} />
                  </button>

                  {selectedConversation.isGroup ? (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: COLORS.primaryGradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      <Users size={18} />
                    </div>
                  ) : (
                    <Avatar 
                      user={{ 
                        email: selectedConversation.participantEmails?.find(e => e !== user.email)
                      }}
                      size={36}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: COLORS.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {selectedConversation.isGroup
                        ? selectedConversation.name
                        : selectedConversation.participantEmails?.find(e => e !== user.email)?.split('@')[0]
                      }
                    </h3>
                    {Object.keys(typingUsers).length > 0 && (
                      <p style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: COLORS.purple,
                        fontWeight: '600'
                      }}>
                        typing...
                      </p>
                    )}
                  </div>

                  {/* More Menu for DMs */}
                  {!selectedConversation.isGroup && (
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        style={{
                          background: showMoreMenu ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.05)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.5rem 0.625rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '900', 
                          color: showMoreMenu ? '#ef4444' : COLORS.textSecondary,
                          lineHeight: 1 
                        }}>⋮</span>
                      </button>

                      {showMoreMenu && (
                        <>
                          <div 
                            onClick={() => setShowMoreMenu(false)}
                            style={{
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 99
                            }}
                          />
                          
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.375rem',
                            background: 'white',
                            borderRadius: '14px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            border: '1.5px solid #e5e7eb',
                            overflow: 'hidden',
                            zIndex: 100,
                            minWidth: '150px'
                          }}>
                            <button
                              onClick={() => {
                                const otherUserId = selectedConversation.participants?.find(p => p !== user.uid);
                                const otherUserEmail = selectedConversation.participantEmails?.find(e => e !== user.email);
                                handleReportContent('user', otherUserId, { userId: otherUserId, userEmail: otherUserEmail });
                                setShowMoreMenu(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'white',
                                border: 'none',
                                borderBottom: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                textAlign: 'left'
                              }}
                            >
                              <Flag size={16} style={{ color: '#d97706' }} />
                              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#92400e' }}>
                                Report
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                const otherUserId = selectedConversation.participants?.find(p => p !== user.uid);
                                const otherUserEmail = selectedConversation.participantEmails?.find(e => e !== user.email);
                                handleBlockUser(otherUserId, otherUserEmail);
                                setShowMoreMenu(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                textAlign: 'left'
                              }}
                            >
                              <ShieldOff size={16} style={{ color: '#ef4444' }} />
                              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#dc2626' }}>
                                Block
                              </span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Auto-delete banner */}
                {messages.length > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid rgba(251, 191, 36, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#92400e',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    <span>🗑️</span>
                    Messages auto-delete after 3 days
                  </div>
                )}

                {/* Messages */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem'
                }}>
                  {displayMessages.map((msg, idx) => {
                    const isOwnMessage = msg.userId === user.uid;
                    const showAvatar = selectedConversation.isGroup && !isOwnMessage;
                    const isRead = selectedConversation.readBy?.[
                      selectedConversation.participants?.find(p => p !== user.uid)
                    ];
                    
                    return (
                      <div
                        key={msg.id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          gap: '0.5rem',
                          opacity: msg.isOptimistic ? 0.7 : 1
                        }}
                      >
                        {showAvatar && (
                          <Avatar 
                            user={{ 
                              email: msg.userEmail,
                              ...participantProfiles[msg.userId]
                            }}
                            size={28}
                          />
                        )}
                        
                        <div style={{
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                        }}>
                          {showAvatar && (
                            <p style={{
                              margin: '0 0 0.25rem 0',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              color: COLORS.textSecondary
                            }}>
                              {getUserDisplayName(msg.userId)}
                            </p>
                          )}
                          
                          <div style={{
                            padding: '0.75rem 1rem',
                            borderRadius: isOwnMessage
                              ? '18px 18px 4px 18px'
                              : '18px 18px 18px 4px',
                            background: isOwnMessage
                              ? COLORS.primaryGradient
                              : 'white',
                            color: isOwnMessage ? 'white' : COLORS.textPrimary,
                            border: isOwnMessage ? 'none' : `1.5px solid ${COLORS.cardBorder}`,
                            boxShadow: isOwnMessage
                              ? '0 2px 8px rgba(139, 92, 246, 0.25)'
                              : '0 1px 4px rgba(0,0,0,0.04)',
                            wordBreak: 'break-word'
                          }}>
                            <p style={{
                              margin: 0,
                              fontSize: '0.95rem',
                              lineHeight: 1.5
                            }}>
                              {msg.text}
                            </p>
                          </div>
                          
                          {/* Reactions */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            marginTop: '0.25rem'
                          }}>
                            <p style={{
                              margin: 0,
                              fontSize: '0.65rem',
                              color: COLORS.textMuted,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              {msg.createdAt?.toDate ? 
                                msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                              {isOwnMessage && !msg.isOptimistic && (
                                <ReadReceipt isRead={isRead} isSent={true} />
                              )}
                              {msg.isOptimistic && ' • sending...'}
                            </p>
                            
                            <MessageReactions 
                              reactions={msg.reactions || {}}
                              messageId={msg.id}
                              currentUserId={user.uid}
                              onReact={handleMessageReaction}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{
                  padding: '0.875rem 1rem',
                  borderTop: `2px solid ${COLORS.cardBorder}`,
                  background: 'white',
                  flexShrink: 0
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.625rem', 
                    alignItems: 'center'
                  }}>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      onFocus={() => handleTyping(true)}
                      onBlur={() => handleTyping(false)}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '0.875rem 1rem',
                        borderRadius: '14px',
                        border: `2px solid ${COLORS.cardBorder}`,
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      style={{
                        padding: '0.875rem',
                        borderRadius: '14px',
                        border: 'none',
                        background: messageInput.trim()
                          ? COLORS.primaryGradient
                          : '#e5e7eb',
                        color: 'white',
                        cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '48px',
                        height: '48px',
                        flexShrink: 0
                      }}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* MODALS */}
      {/* ============================================ */}

      {/* Report Modal */}
      {showReportModal && (
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
          backdropFilter: 'blur(4px)',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '1.5rem',
            maxWidth: 'min(400px, calc(100vw - 2rem))',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            border: '2px solid #ef4444'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                margin: 0,
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={24} />
                Report
              </h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportTarget(null);
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} style={{ color: '#ef4444' }} />
              </button>
            </div>

            <p style={{
              color: COLORS.textSecondary,
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}>
              Select a reason. We review all reports within 24 hours.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { id: 'spam', label: 'Spam', icon: '🗑️' },
                { id: 'harassment', label: 'Harassment', icon: '😠' },
                { id: 'inappropriate', label: 'Inappropriate', icon: '🚫' },
                { id: 'impersonation', label: 'Impersonation', icon: '🎭' },
                { id: 'other', label: 'Other', icon: '❓' }
              ].map(reason => (
                <button
                  key={reason.id}
                  onClick={() => submitReport(reason.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '14px',
                    border: '1.5px solid #fecaca',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{reason.icon}</span>
                  <span style={{
                    fontWeight: '700',
                    fontSize: '1rem',
                    color: COLORS.textPrimary
                  }}>
                    {reason.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blocked Users Modal */}
      {showBlockedUsersModal && (
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
          backdropFilter: 'blur(4px)',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '1.5rem',
            maxWidth: 'min(400px, calc(100vw - 2rem))',
            width: '100%',
            maxHeight: '70vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            border: `2px solid ${COLORS.purple}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                margin: 0,
                color: COLORS.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShieldCheck size={24} style={{ color: COLORS.purple }} />
                Blocked Users
              </h2>
              <button
                onClick={() => setShowBlockedUsersModal(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} style={{ color: COLORS.textSecondary }} />
              </button>
            </div>

            {blockedUsersList.length === 0 ? (
              <EmptyState 
                type="blocked"
                title="No blocked users"
                subtitle="Users you block will appear here"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {blockedUsersList.map(blocked => (
                  <div
                    key={blocked.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.875rem',
                      background: '#f9fafb',
                      borderRadius: '14px',
                      border: '1.5px solid #e5e7eb'
                    }}
                  >
                    <Avatar 
                      user={{ email: blocked.blockedUserEmail }}
                      size={40}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        color: COLORS.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {blocked.blockedUserEmail?.split('@')[0]}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUnblockUser(blocked)}
                      style={{
                        padding: '0.5rem 0.875rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
        
        * {
          -webkit-overflow-scrolling: touch;
        }
        
        body, html {
          overflow-x: hidden;
          max-width: 100vw;
          background: ${COLORS.backgroundGradient};
          min-height: 100vh;
          min-height: 100dvh;
        }
        
        #root {
          background: ${COLORS.backgroundGradient};
          min-height: 100vh;
          min-height: 100dvh;
        }
        
        html {
          height: -webkit-fill-available;
        }
        
        button {
          max-width: 100%;
        }
        
        input:focus {
          border-color: ${COLORS.purple} !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
        }
      `}</style>
    </div>
  );
}

// ============================================
// CREATE GROUP CHAT MODAL
// ============================================
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
      backdropFilter: 'blur(4px)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '1.5rem',
        maxWidth: 'min(420px, calc(100vw - 2rem))',
        width: '100%',
        maxHeight: '75vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        border: `2px solid ${COLORS.purple}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            margin: 0,
            color: COLORS.textPrimary
          }}>
            Create Group Chat
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              borderRadius: '10px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} style={{ color: '#ef4444' }} />
          </button>
        </div>

        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name..."
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '14px',
            border: `2px solid ${COLORS.cardBorder}`,
            fontSize: '1rem',
            marginBottom: '1.25rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: '700',
          marginBottom: '0.75rem',
          color: COLORS.textSecondary
        }}>
          Select Friends ({selectedFriends.length})
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          marginBottom: '1.25rem',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {friends.map(friend => (
            <button
              key={friend.id}
              onClick={() => toggleFriend(friend)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem',
                borderRadius: '14px',
                border: selectedFriends.some(f => f.id === friend.id)
                  ? `2px solid ${COLORS.purple}`
                  : '2px solid #e5e7eb',
                background: selectedFriends.some(f => f.id === friend.id)
                  ? 'rgba(139, 92, 246, 0.08)'
                  : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <Avatar user={friend} size={36} />
              <span style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: COLORS.textPrimary
              }}>
                {friend.name}
              </span>
              {selectedFriends.some(f => f.id === friend.id) && (
                <Check size={18} style={{ marginLeft: 'auto', color: COLORS.purple }} />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleCreate}
          disabled={!groupName.trim() || selectedFriends.length === 0}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '14px',
            border: 'none',
            background: groupName.trim() && selectedFriends.length > 0
              ? COLORS.primaryGradient
              : '#d1d5db',
            color: 'white',
            fontWeight: '800',
            fontSize: '1rem',
            cursor: groupName.trim() && selectedFriends.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          Create Group
        </button>
      </div>
    </div>
  );
}