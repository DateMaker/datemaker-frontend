import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, Heart, MessageCircle, UserPlus, Gift, Trophy, Flame, Check, Users, Sparkles } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, limit, writeBatch } from 'firebase/firestore';
import DateInviteModal from './DateInviteModal';

// 🔔 NOTIFICATION TYPES & STYLING
const NOTIFICATION_CONFIG = {
  date_invite: {
    icon: Calendar,
    color: '#fb923c',
    bgGradient: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
    emoji: '📅'
  },
  surprise_date: {
    icon: Gift,
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)',
    emoji: '🎁'
  },
  new_message: {
    icon: MessageCircle,
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)',
    emoji: '💬'
  },
  friend_request: {
    icon: UserPlus,
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)',
    emoji: '👋'
  },
  friend_accepted: {
    icon: Users,
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)',
    emoji: '🎉'
  },
  date_liked: {
    icon: Heart,
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
    emoji: '❤️'
  },
  date_comment: {
    icon: MessageCircle,
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    emoji: '💬'
  },
  achievement: {
    icon: Trophy,
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
    emoji: '🏆'
  },
  streak: {
    icon: Flame,
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
    emoji: '🔥'
  },
  default: {
    icon: Bell,
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)',
    emoji: '🔔'
  }
};

// 🚀 HELPER: Send notification from anywhere in the app
export const sendNotification = async (toUserId, type, data) => {
  try {
    const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.default;
    
    await addDoc(collection(db, 'notifications'), {
      userId: toUserId,
      type: type,
      ...data,
      emoji: config.emoji,
      createdAt: serverTimestamp(),
      read: false
    });
    
    console.log(`🔔 Notification sent: ${type} to ${toUserId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return false;
  }
};

const NotificationBell = ({ user, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [animateBell, setAnimateBell] = useState(false);
  
  // 🆕 State for date invite modal
  const [showDateInviteModal, setShowDateInviteModal] = useState(false);
  const [selectedInviteNotification, setSelectedInviteNotification] = useState(null);

  // Listen to notifications in real-time
  useEffect(() => {
    if (!user) return;

    // Simple query without orderBy to avoid index issues
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      const newUnreadCount = notifs.filter(n => !n.read).length;
      
      // Animate bell if new notification
      if (newUnreadCount > unreadCount && unreadCount > 0) {
        setAnimateBell(true);
        setTimeout(() => setAnimateBell(false), 1000);
      }
      
      setNotifications(notifs);
      setUnreadCount(newUnreadCount);
      
      console.log('🔔 Notifications:', notifs.length, 'unread:', newUnreadCount);
    }, (error) => {
      console.error('Error loading notifications:', error);
    });

    return () => unsubscribe();
  }, [user, unreadCount]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      for (const notif of unreadNotifs) {
        await updateDoc(doc(db, 'notifications', notif.id), {
          read: true
        });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      notifications.forEach(notif => {
        batch.delete(doc(db, 'notifications', notif.id));
      });
      await batch.commit();
      console.log('✅ Cleared all notifications in single batch');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // 🆕 Special handling for date invites - show modal instead of navigating
    if (notification.type === 'date_invite') {
      console.log('📅 Opening date invite modal for:', notification.dateTitle);
      setSelectedInviteNotification(notification);
      setShowDateInviteModal(true);
      setShowDropdown(false);
      return;
    }
    
    setShowDropdown(false);
    
    // Navigate based on notification type
    if (onNavigate) {
      switch (notification.type) {
        case 'date_liked':
        case 'date_comment':
          onNavigate('feed', notification.dateId);
          break;
        case 'surprise_date':
          onNavigate('surprises');
          break;
        case 'new_message':
          onNavigate('messages', notification.conversationId);
          break;
        case 'friend_request':
          onNavigate('requests');
          break;
        case 'friend_accepted':
          onNavigate('friends');
          break;
        case 'achievement':
        case 'streak':
          onNavigate('profile');
          break;
        default:
          break;
      }
    }
  };

  // 🆕 Handle accepting the date invite
  const handleAcceptInvite = (dateData) => {
    console.log('✅ Date invite accepted:', dateData?.dateData?.title);
    setShowDateInviteModal(false);
    setSelectedInviteNotification(null);
    
    // Navigate to feed to see the date
    if (onNavigate) {
      onNavigate('feed', dateData?.id);
    }
  };

  // 🆕 Handle declining the date invite
  const handleDeclineInvite = () => {
    console.log('❌ Date invite declined');
    setShowDateInviteModal(false);
    setSelectedInviteNotification(null);
  };

  // 🆕 Handle opening chat from invite modal
  const handleOpenChatFromInvite = (dateData) => {
    console.log('💬 Opening chat for date:', dateData?.dateData?.title);
    setShowDateInviteModal(false);
    setSelectedInviteNotification(null);
    
    // Navigate to messages
    if (onNavigate) {
      onNavigate('messages');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationConfig = (type) => {
    return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.default;
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Bell Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '14px',
            padding: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.2s',
            animation: animateBell ? 'bellShake 0.5s ease-in-out' : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Bell size={24} style={{ color: 'white' }} />
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              borderRadius: '50%',
              minWidth: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '900',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
              animation: 'pulse 2s infinite'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setShowDropdown(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 9998,
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
            
            {/* Notification Panel */}
            <div style={{
              position: 'fixed',
              top: 'calc(80px + env(safe-area-inset-top))',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 2rem)',
              maxWidth: '380px',
              background: 'white',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '3px solid #a855f7',
              zIndex: 9999,
              overflow: 'hidden',
              maxHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideDown 0.3s ease-out'
            }}>
              {/* Header */}
              <div style={{
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} style={{ color: 'white' }} />
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: '900',
                    color: 'white'
                  }}>
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span style={{
                      background: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '800'
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setShowDropdown(false)}
                  style={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <span style={{ color: '#a855f7', fontSize: '18px', fontWeight: '900', lineHeight: 1 }}>✕</span>
                </button>
              </div>

              {/* Action Bar */}
              {notifications.length > 0 && (
                <div style={{
                  padding: '0.5rem 1rem',
                  borderBottom: '2px solid #f3e8ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  background: '#faf5ff'
                }}>
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: unreadCount > 0 ? '#a855f7' : '#d1d5db',
                      fontWeight: '700',
                      fontSize: '0.8125rem',
                      cursor: unreadCount > 0 ? 'pointer' : 'not-allowed',
                      padding: '0.4rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Check size={14} />
                    Mark all read
                  </button>
                  
                  <button
                    onClick={clearAllNotifications}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontWeight: '700',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <X size={14} />
                    Clear all
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: '500px'
              }}>
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}>
                      <Bell size={40} style={{ color: '#a855f7', opacity: 0.5 }} />
                    </div>
                    <p style={{ margin: '0 0 0.5rem', fontWeight: '800', fontSize: '1.125rem', color: '#374151' }}>
                      All caught up! 🎉
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                      No new notifications
                    </p>
                  </div>
                ) : (
                  notifications.map((notification, index) => {
                    const config = getNotificationConfig(notification.type);
                    const IconComponent = config.icon;
                    
                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          padding: '1.25rem 1.5rem',
                          borderBottom: index < notifications.length - 1 ? '1px solid #f3e8ff' : 'none',
                          display: 'flex',
                          gap: '1rem',
                          cursor: 'pointer',
                          background: notification.read 
                            ? 'white' 
                            : 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#faf5ff';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = notification.read 
                            ? 'white' 
                            : 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        {/* Icon with emoji */}
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '16px',
                          background: config.bgGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          <IconComponent size={24} style={{ color: config.color }} />
                          <span style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            fontSize: '1rem'
                          }}>
                            {notification.emoji || config.emoji}
                          </span>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: '0 0 0.375rem',
                            fontSize: '0.9375rem',
                            fontWeight: notification.read ? '600' : '800',
                            color: '#1f2937',
                            lineHeight: '1.5',
                            paddingRight: '2rem'
                          }}>
                            {notification.message}
                          </p>
                          
                          {/* Preview text for messages */}
                          {notification.preview && (
                            <p style={{
                              margin: '0 0 0.375rem',
                              fontSize: '0.875rem',
                              color: '#6b7280',
                              fontStyle: 'italic',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              "{notification.preview}"
                            </p>
                          )}
                          
                          {/* Date/time for date invites */}
                          {notification.scheduledDate && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              background: 'rgba(251, 146, 60, 0.1)',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '8px',
                              marginBottom: '0.375rem'
                            }}>
                              <Calendar size={14} style={{ color: '#fb923c' }} />
                              <span style={{
                                fontSize: '0.8125rem',
                                color: '#ea580c',
                                fontWeight: '700'
                              }}>
                                {new Date(notification.scheduledDate).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                                {notification.scheduledTime && ` • ${notification.scheduledTime}`}
                              </span>
                            </div>
                          )}
                          
                          <p style={{
                            margin: 0,
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            fontWeight: '600'
                          }}>
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                            flexShrink: 0,
                            alignSelf: 'center',
                            boxShadow: '0 0 8px rgba(168, 85, 247, 0.5)'
                          }} />
                        )}

                        {/* Delete button */}
                        <button
                          onClick={(e) => deleteNotification(notification.id, e)}
                          style={{
                            position: 'absolute',
                            top: '0.75rem',
                            right: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.375rem',
                            borderRadius: '8px',
                            opacity: 0,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0';
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <X size={18} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* Animations */}
        <style>{`
          @keyframes bellShake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-15deg); }
            50% { transform: rotate(15deg); }
            75% { transform: rotate(-10deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideDown {
            from { 
              opacity: 0; 
              transform: translateX(-50%) translateY(-10px); 
            }
            to { 
              opacity: 1; 
              transform: translateX(-50%) translateY(0); 
            }
          }
        `}</style>
      </div>

      {/* 🆕 Date Invite Modal */}
      {showDateInviteModal && selectedInviteNotification && (
        <DateInviteModal
          notification={selectedInviteNotification}
          user={user}
          onClose={() => {
            setShowDateInviteModal(false);
            setSelectedInviteNotification(null);
          }}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
          onOpenChat={handleOpenChatFromInvite}
        />
      )}
    </>
  );
};

export default NotificationBell;