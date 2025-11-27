import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, Star, Navigation, 
  MessageCircle, Check, UserX, Heart, Sparkles,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const DateInviteModal = ({ 
  notification, 
  user, 
  onClose, 
  onAccept, 
  onDecline,
  onOpenChat 
}) => {
  const [dateData, setDateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStops, setExpandedStops] = useState({});
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  // Fetch the full date data from sharedDates
  useEffect(() => {
    const fetchDateData = async () => {
      if (!notification?.dateId) {
        setError('No date information found');
        setLoading(false);
        return;
      }

      try {
        console.log('📥 Fetching date invite:', notification.dateId);
        const dateDoc = await getDoc(doc(db, 'sharedDates', notification.dateId));
        
        if (dateDoc.exists()) {
          const data = { id: dateDoc.id, ...dateDoc.data() };
          console.log('✅ Date data loaded:', data.dateData?.title);
          setDateData(data);
        } else {
          setError('This date invitation is no longer available');
        }
      } catch (err) {
        console.error('❌ Error fetching date:', err);
        setError('Failed to load date details');
      } finally {
        setLoading(false);
      }
    };

    fetchDateData();
  }, [notification?.dateId]);

  const toggleStopExpanded = (index) => {
    setExpandedStops(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      // Add user to participants
      const dateRef = doc(db, 'sharedDates', notification.dateId);
      await updateDoc(dateRef, {
        participants: arrayUnion(user.uid)
      });

      // Mark notification as read
      if (notification.id) {
        const notifRef = doc(db, 'notifications', notification.id);
        await updateDoc(notifRef, { read: true });
      }

      console.log('✅ Date invite accepted!');
      
      if (onAccept) {
        onAccept(dateData);
      }
    } catch (err) {
      console.error('❌ Error accepting invite:', err);
      alert('Failed to accept invitation. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm('Are you sure you want to decline this invitation?')) {
      return;
    }

    setDeclining(true);
    try {
      // Remove user from invitedFriends if present
      const dateRef = doc(db, 'sharedDates', notification.dateId);
      const dateDoc = await getDoc(dateRef);
      
      if (dateDoc.exists()) {
        const currentInvited = dateDoc.data().invitedFriends || [];
        const updatedInvited = currentInvited.filter(id => id !== user.uid);
        
        await updateDoc(dateRef, {
          invitedFriends: updatedInvited
        });
      }

      // Delete the notification
      if (notification.id) {
        await deleteDoc(doc(db, 'notifications', notification.id));
      }

      console.log('✅ Date invite declined');
      
      if (onDecline) {
        onDecline();
      }
      onClose();
    } catch (err) {
      console.error('❌ Error declining invite:', err);
      alert('Failed to decline invitation. Please try again.');
    } finally {
      setDeclining(false);
    }
  };

  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        padding: '1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3e8ff',
            borderTop: '4px solid #a855f7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }} />
          <p style={{ 
            margin: 0, 
            fontSize: '1.125rem', 
            fontWeight: '700',
            color: '#6b7280'
          }}>
            Loading date details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        padding: '1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2.5rem',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem'
          }}>
            😕
          </div>
          <h3 style={{ 
            margin: '0 0 0.75rem', 
            fontSize: '1.5rem', 
            fontWeight: '900',
            color: '#1f2937'
          }}>
            Oops!
          </h3>
          <p style={{ 
            margin: '0 0 2rem', 
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            {error}
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '1rem 2rem',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
              color: 'white',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const stops = dateData?.dateData?.stops || [];
  const inviterName = notification?.fromUserName || notification?.fromUserEmail?.split('@')[0] || 'Someone';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '550px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(168, 85, 247, 0.3)',
        border: '3px solid #a855f7',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #8b5cf6 100%)',
          padding: '1.75rem',
          paddingTop: 'calc(1.75rem + env(safe-area-inset-top))',
          position: 'relative'
        }}>
          {/* Close button */}
<button
  onClick={onClose}
  style={{
    position: 'absolute',
    top: 'calc(1rem + env(safe-area-inset-top))',
    right: '1rem',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  }}
>
  <X size={22} style={{ color: '#a855f7' }} />
</button>

          {/* Invite badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            marginBottom: '1rem'
          }}>
            <Calendar size={18} style={{ color: 'white' }} />
            <span style={{ 
              color: 'white', 
              fontSize: '0.875rem', 
              fontWeight: '700'
            }}>
              Date Invitation
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            margin: '0 0 0.5rem',
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: '900',
            lineHeight: '1.2',
            paddingRight: '2.5rem'
          }}>
            {dateData?.dateData?.title || notification?.dateTitle || 'Date Night'}
          </h2>

          {/* Inviter info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '900',
              fontSize: '1rem'
            }}>
              {inviterName[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ 
                margin: 0, 
                color: 'white', 
                fontSize: '1rem',
                fontWeight: '700'
              }}>
                {inviterName} invited you!
              </p>
              <p style={{ 
                margin: 0, 
                color: 'rgba(255,255,255,0.85)', 
                fontSize: '0.875rem'
              }}>
                {notification?.fromUserEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '1rem 1.75rem',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          borderBottom: '2px solid #fbbf24'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Calendar size={22} style={{ color: '#d97706' }} />
            <span style={{ 
              fontWeight: '800', 
              color: '#92400e',
              fontSize: '1rem'
            }}>
              {formatDate(dateData?.scheduledDate || notification?.scheduledDate)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Clock size={22} style={{ color: '#d97706' }} />
            <span style={{ 
              fontWeight: '800', 
              color: '#92400e',
              fontSize: '1rem'
            }}>
              {formatTime(dateData?.scheduledTime || notification?.scheduledTime)}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {/* Caption */}
          {dateData?.caption && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              border: '2px solid #e9d5ff'
            }}>
              <p style={{
                margin: 0,
                fontSize: '1rem',
                color: '#374151',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                "{dateData.caption}"
              </p>
            </div>
          )}

          {/* Itinerary */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <Sparkles size={24} style={{ color: '#a855f7' }} />
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '900',
                color: '#1f2937'
              }}>
                Itinerary ({stops.length} stops)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stops.map((stop, index) => {
                const isExpanded = expandedStops[index];
                
                return (
                  <div
                    key={index}
                    style={{
                      background: 'white',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      border: '2px solid #e9d5ff',
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Stop Header - Always visible */}
                    <div
                      onClick={() => toggleStopExpanded(index)}
                      style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
                      }}
                    >
                      {/* Stop number */}
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '900',
                        fontSize: '1.125rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                      }}>
                        {index + 1}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: '0 0 0.25rem',
                          fontWeight: '900',
                          fontSize: '1.0625rem',
                          color: '#1f2937'
                        }}>
                          {stop.title || stop.venueName || 'Stop'}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem',
                          flexWrap: 'wrap'
                        }}>
                          {stop.time && (
                            <span style={{ 
                              fontSize: '0.8125rem', 
                              color: '#6b7280',
                              fontWeight: '600'
                            }}>
                              🕐 {stop.time}
                            </span>
                          )}
                          {stop.rating && (
                            <span style={{ 
                              fontSize: '0.8125rem', 
                              color: '#f59e0b',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Star size={14} fill="#f59e0b" />
                              {stop.rating}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand icon */}
                      {isExpanded ? (
                        <ChevronUp size={24} style={{ color: '#a855f7' }} />
                      ) : (
                        <ChevronDown size={24} style={{ color: '#a855f7' }} />
                      )}
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div style={{ padding: '1.25rem', paddingTop: 0 }}>
                        {/* Image */}
                        {stop.image && (
                          <div style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            height: '160px'
                          }}>
                            <img
                              src={stop.image}
                              alt={stop.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Venue name if different from title */}
                        {stop.venueName && stop.venueName !== stop.title && (
                          <p style={{
                            margin: '0 0 0.75rem',
                            fontWeight: '700',
                            fontSize: '1rem',
                            color: '#374151'
                          }}>
                            📍 {stop.venueName}
                          </p>
                        )}

                        {/* Address */}
                        {stop.vicinity && (
                          <p style={{
                            margin: '0 0 1rem',
                            fontSize: '0.9375rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem'
                          }}>
                            <MapPin size={16} style={{ color: '#ec4899', flexShrink: 0, marginTop: '0.125rem' }} />
                            {stop.vicinity}
                          </p>
                        )}

                        {/* Description */}
                        {stop.description && (
                          <p style={{
                            margin: '0 0 1rem',
                            fontSize: '0.9375rem',
                            color: '#374151',
                            lineHeight: '1.5'
                          }}>
                            {stop.description}
                          </p>
                        )}

                        {/* Challenges preview */}
                        {stop.challenges && stop.challenges.length > 0 && (
                          <div style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            borderRadius: '10px',
                            padding: '0.875rem',
                            marginBottom: '1rem'
                          }}>
                            <p style={{
                              margin: '0 0 0.5rem',
                              fontWeight: '800',
                              fontSize: '0.875rem',
                              color: '#92400e'
                            }}>
                              🎯 {stop.challenges.length} Challenge{stop.challenges.length > 1 ? 's' : ''}
                            </p>
                            <p style={{
                              margin: 0,
                              fontSize: '0.8125rem',
                              color: '#a16207'
                            }}>
                              {stop.challenges[0]?.text || stop.challenges[0]}
                              {stop.challenges.length > 1 && ` +${stop.challenges.length - 1} more`}
                            </p>
                          </div>
                        )}

                        {/* Directions button */}
                        {stop.geometry?.location && (
                          <button
                            onClick={() => openDirections(
                              stop.geometry.location.lat,
                              stop.geometry.location.lng
                            )}
                            style={{
                              width: '100%',
                              padding: '0.875rem',
                              borderRadius: '12px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '0.9375rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                            }}
                          >
                            <Navigation size={18} />
                            Get Directions
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '1.5rem',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
          background: 'white',
          borderTop: '2px solid #e9d5ff',
          display: 'flex',
          gap: '0.75rem'
        }}>
          {/* Decline */}
          <button
            onClick={handleDecline}
            disabled={declining}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '14px',
              border: '2px solid #fecaca',
              background: declining ? '#fee2e2' : 'white',
              color: '#dc2626',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: declining ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {declining ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid #fca5a5',
                borderTop: '3px solid #dc2626',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <>
                <UserX size={20} />
                Decline
              </>
            )}
          </button>

          {/* Message */}
          {onOpenChat && (
            <button
              onClick={() => onOpenChat(dateData)}
              style={{
                padding: '1rem',
                borderRadius: '14px',
                border: '2px solid #e9d5ff',
                background: 'white',
                color: '#a855f7',
                fontWeight: '800',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <MessageCircle size={20} />
            </button>
          )}

          {/* Accept */}
          <button
            onClick={handleAccept}
            disabled={accepting}
            style={{
              flex: 2,
              padding: '1rem',
              borderRadius: '14px',
              border: 'none',
              background: accepting 
                ? '#d1d5db' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontWeight: '900',
              fontSize: '1.0625rem',
              cursor: accepting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: accepting ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {accepting ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <>
                <Check size={22} />
                Accept Invite
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DateInviteModal;