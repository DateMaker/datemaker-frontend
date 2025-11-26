import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, Heart, MessageCircle, UserPlus, Gift, Trophy, Flame, Check, Users, Sparkles } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, limit } from 'firebase/firestore';

const NotificationBell = ({ user, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [animateBell, setAnimateBell] = useState(false);

  useEffect(() => {
    if (!user) return;
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      limit(50)
    );
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      const newUnreadCount = notifs.filter(n => !n.read).length;
      if (newUnreadCount > unreadCount && unreadCount > 0) {
        setAnimateBell(true);
        setTimeout(() => setAnimateBell(false), 1000);
      }
      setNotifications(notifs);
      setUnreadCount(newUnreadCount);
    });
    return () => unsubscribe();
  }, [user, unreadCount]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      for (const notif of unreadNotifs) {
        await updateDoc(doc(db, 'notifications', notif.id), { read: true });
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
    try {
      for (const notif of notifications) {
        await deleteDoc(doc(db, 'notifications', notif.id));
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);
    if (onNavigate) {
      switch (notification.type) {
        case 'date_invite':
        case 'date_liked':
        case 'date_comment':
          onNavigate('feed', notification.dateId);
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
        default:
          break;
      }
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

  const getIcon = (type) => {
    switch(type) {
      case 'date_invite': return Calendar;
      case 'date_liked': return Heart;
      case 'new_message': case 'date_comment': return MessageCircle;
      case 'friend_request': return UserPlus;
      case 'friend_accepted': return Users;
      case 'surprise_date': return Gift;
      case 'achievement': return Trophy;
      case 'streak': return Flame;
      default: return Bell;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
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
      >
        <Bell size={24} style={{ color: 'white' }} />
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
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9998
            }}
          />
          
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
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} style={{ color: 'white' }} />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '900', color: 'white' }}>
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
                <X size={18} style={{ color: '#a855f7' }} />
              </button>
            </div>

            {notifications.length > 0 && (
              <div style={{
                padding: '0.5rem 1rem',
                borderBottom: '2px solid #f3e8ff',
                display: 'flex',
                justifyContent: 'space-between',
                background: '#faf5ff'
              }}>
                <button onClick={markAllAsRead} disabled={unreadCount === 0} style={{
                  background: 'none', border: 'none', color: unreadCount > 0 ? '#a855f7' : '#d1d5db',
                  fontWeight: '700', fontSize: '0.8125rem', cursor: unreadCount > 0 ? 'pointer' : 'not-allowed',
                  padding: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  <Check size={14} /> Mark all read
                </button>
                <button onClick={clearAllNotifications} style={{
                  background: 'none', border: 'none', color: '#ef4444', fontWeight: '700',
                  fontSize: '0.8125rem', cursor: 'pointer', padding: '0.4rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  <X size={14} /> Clear all
                </button>
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                  }}>
                    <Bell size={40} style={{ color: '#a855f7', opacity: 0.5 }} />
                  </div>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: '800', fontSize: '1.125rem', color: '#374151' }}>
                    All caught up! 🎉
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9375rem' }}>No new notifications</p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const IconComponent = getIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        padding: '1rem',
                        borderBottom: index < notifications.length - 1 ? '1px solid #f3e8ff' : 'none',
                        display: 'flex',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        background: notification.read ? 'white' : 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <IconComponent size={22} style={{ color: '#a855f7' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: '0 0 0.25rem', fontSize: '0.9rem',
                          fontWeight: notification.read ? '600' : '800', color: '#1f2937',
                          lineHeight: '1.4', paddingRight: '1.5rem'
                        }}>
                          {notification.message}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600' }}>
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div style={{
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: '#a855f7', flexShrink: 0, alignSelf: 'center'
                        }} />
                      )}
                      <button
                        onClick={(e) => deleteNotification(notification.id, e)}
                        style={{
                          position: 'absolute', top: '0.5rem', right: '0.5rem',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          padding: '0.25rem', borderRadius: '6px', opacity: 0.5
                        }}
                      >
                        <X size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
          75% { transform: rotate(-10deg); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
