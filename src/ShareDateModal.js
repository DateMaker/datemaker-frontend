import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, Clock, Globe, Lock, MessageCircle, Send, UserPlus, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, arrayUnion, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import SuccessModal from './SuccessModal';

const ShareDateModal = ({ user, dateData, onClose }) => {
  const [dateTitle, setDateTitle] = useState(''); // 🔥 NEW: Date name/title field
  const [caption, setCaption] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sharedDateId, setSharedDateId] = useState(null);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // 🔥 NEW: Auto-fill date title from dateData if available
  useEffect(() => {
    if (dateData?.title) {
      setDateTitle(dateData.title);
    }
  }, [dateData]);

  // Load friends
  useEffect(() => {
  const loadFriends = async () => {
      try {
        // Get user's friends from friendRequests collection
        const friendsQuery = query(
          collection(db, 'friendRequests'),
          where('status', '==', 'accepted')
        );
        
        const snapshot = await getDocs(friendsQuery);
        const friendsList = [];
        const seenIds = new Set(); // 🔥 Track unique friend IDs
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          let friendId = null;
          let friendEmail = null;
          
          if (data.fromUserId === user.uid) {
            friendId = data.toUserId;
            friendEmail = data.toUserEmail;
          } else if (data.toUserId === user.uid) {
            friendId = data.fromUserId;
            friendEmail = data.fromUserEmail;
          }
          
          // 🔥 Only add if we haven't seen this friend ID before
          if (friendId && !seenIds.has(friendId)) {
            seenIds.add(friendId);
            friendsList.push({
              id: friendId,
              email: friendEmail,
              name: friendEmail.split('@')[0]
            });
          }
        });
        
        setFriends(friendsList);
        console.log(`✅ Loaded ${friendsList.length} unique friends`);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    };

    if (user) {
      loadFriends();
    }
  }, [user]);

  // Listen to chat messages
  useEffect(() => {
    if (!sharedDateId) return;

    const messagesRef = collection(db, 'sharedDates', sharedDateId, 'messages');
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      
      setChatMessages(messages);
    });

    return () => unsubscribe();
  }, [sharedDateId]);

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sharedDateId) return;

    try {
      const messagesRef = collection(db, 'sharedDates', sharedDateId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        userId: user.uid,
        userEmail: user.email,
        timestamp: serverTimestamp()
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleShare = async () => {
    // 🔥 UPDATED: Check for both title and caption
    if (!dateTitle.trim()) {
  setSuccessMessage('Please give your date a name!');
  return;
}

    if (!caption.trim()) {
  setSuccessMessage('Please write something about this date!');
  return;
}

    if (!selectedDate) {
  setSuccessMessage('Please select a date!');
  return;
}

    setLoading(true);

    try {
      // 🔧 FIXED: Extract stops with ALL venue data from the place object
      const stops = dateData.stops || dateData.itinerary?.stops || [];
      
      console.log('📤 SHARING DATE (RAW):', {
        title: dateTitle,
        stopsCount: stops.length,
        rawFirstStop: stops[0],
        hasPlaceObject: stops.some(s => s.place),
        firstPlacePhotos: stops[0]?.place?.photos
      });
      
      const updatedDateData = {
        title: dateTitle,
        stops: stops.map(stop => {
          // Extract place data from the nested place object
          const place = stop.place || stop;
          
          // Handle Google Places photo URLs
          let imageUrl = '';
          if (place.photos && place.photos.length > 0) {
            const photo = place.photos[0];
            // Try multiple methods to get the photo URL
            if (typeof photo.getUrl === 'function') {
              imageUrl = photo.getUrl({ maxWidth: 800, maxHeight: 600 });
            } else if (photo.photo_reference) {
              // Use Google Places Photo API
              imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=AIzaSyCKCweUu3EEWa8VfNZJ3I0druTc6u5gJKc`;
            } else if (typeof photo === 'string') {
              imageUrl = photo;
            } else if (photo.url) {
              imageUrl = photo.url;
            }
          }
          
          // Fallback to other image sources
          if (!imageUrl) {
            imageUrl = place.image || place.photo || place.icon || stop.image || '';
          }
          
          return {
            // Basic info
            title: stop.title || stop.name || place.name || 'Untitled Stop',
            name: stop.name || stop.title || place.name,
            category: stop.category || stop.icon || '',
            description: stop.description || place.description || '',
            time: stop.time || '',
            duration: stop.duration || '',
            
            // 📸 CRITICAL: Include venue images with proper URL
            image: imageUrl,
            
            // ⭐ CRITICAL: Include ratings from place object
            rating: place.rating || stop.rating || null,
            
            // 📍 CRITICAL: Include location data from place object
            vicinity: place.vicinity || place.formatted_address || place.address || stop.vicinity || '',
            venueName: place.name || stop.venueName || stop.name || '',
            
            // 🗺️ CRITICAL: Include coordinates for maps from place object
            geometry: place.geometry ? {
              location: {
                lat: typeof place.geometry.location.lat === 'function' 
                  ? place.geometry.location.lat() 
                  : (place.geometry.location.lat || place.geometry.location.latitude || 0),
                lng: typeof place.geometry.location.lng === 'function'
                  ? place.geometry.location.lng()
                  : (place.geometry.location.lng || place.geometry.location.longitude || 0)
              }
            } : null,
            
            // 🎯 CRITICAL: Include challenges
            challenges: stop.challenges || []
          };
        })
      };
      
      console.log('✅ PROCESSED DATA:', {
        stopsCount: updatedDateData.stops.length,
        stopDetails: updatedDateData.stops.map(s => ({
          title: s.title,
          hasImage: !!s.image,
          imageUrl: s.image,
          hasLocation: !!s.vicinity,
          hasGeometry: !!s.geometry,
          challengeCount: s.challenges?.length || 0,
          venueName: s.venueName
        }))
      });

      // Create shared date document
const sharedDateDoc = await addDoc(collection(db, 'sharedDates'), {
  userId: user.uid,
  userEmail: user.email,
  dateData: updatedDateData,
  caption: caption,
  scheduledDate: selectedDate,
  scheduledTime: selectedTime,
  isPublic: isPublic,
  invitedFriends: selectedFriends,
  participants: [user.uid],
  likes: [],
  comments: [],
  createdAt: serverTimestamp()
});

setSharedDateId(sharedDateDoc.id);

// 🔥 NEW: Track dates shared for achievements
try {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  const currentDatesShared = userDoc.data()?.gameStats?.datesShared || 0;
  const currentPhotosShared = userDoc.data()?.gameStats?.photosShared || 0;

  await updateDoc(userDocRef, {
    'gameStats.datesShared': currentDatesShared + 1,
    'gameStats.photosShared': currentPhotosShared + 1 // Keep both for compatibility
  });

  console.log('📸 Dates shared incremented:', currentDatesShared + 1);
} catch (error) {
  console.error('Error tracking share:', error);
}

// If friends invited, show chat
if (selectedFriends.length > 0) {
  // Send notifications to invited friends (you can implement this)
  setShowChat(true);
  setSuccessMessage(`✨ "${dateTitle}" shared! ${selectedFriends.length} friend${selectedFriends.length > 1 ? 's' : ''} invited!`);
} else {
  setSuccessMessage(`✨ "${dateTitle}" shared with the community!`);
  setTimeout(() => onClose(), 2000); // Auto-close after 2 seconds
}
} catch (error) {
  console.error('Error sharing date:', error);
  setSuccessMessage('Failed to share date. Please try again.');
}
     finally {
      setLoading(false);
    }
  };

  if (showChat && sharedDateId) {
    // Group Chat View
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fff5f0 100%)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(251, 146, 60, 0.3)',
          border: '2px solid #fb923c'
        }}>
          {/* Chat Header */}
          <div style={{
            background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
            padding: '1.5rem',
            borderRadius: '24px 24px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MessageCircle size={28} style={{ color: 'white' }} />
              <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: '900' }}>
                  {dateTitle || 'Date Group Chat'}
                </h2>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
                  {selectedFriends.length + 1} participants
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{
  position: 'absolute',
  top: '1.5rem',
  right: '1.5rem',
  background: 'rgba(255,255,255,0.2)',
  border: '2px solid rgba(255,255,255,0.5)',  
  color: 'white',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  zIndex: 100  
}}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              <X size={24} style={{ color: 'white' }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'white'
          }}>
            {chatMessages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#9ca3af',
                padding: '3rem 1rem'
              }}>
                <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ margin: 0, fontSize: '1rem' }}>Start planning your date together!</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isOwnMessage = msg.userId === user.uid;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
                    }}>
                      {!isOwnMessage && (
                        <p style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#fb923c',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {msg.userEmail.split('@')[0]}
                        </p>
                      )}
                      <div style={{
                        padding: '0.875rem 1.25rem',
                        borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isOwnMessage
                          ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
                          : '#f3f4f6',
                        color: isOwnMessage ? 'white' : '#1f2937',
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        boxShadow: isOwnMessage
                          ? '0 4px 12px rgba(251, 146, 60, 0.3)'
                          : 'none'
                      }}>
                        {msg.text}
                      </div>
                      <p style={{
                        fontSize: '0.6875rem',
                        color: '#9ca3af',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {msg.timestamp?.toDate().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div style={{
            padding: '1.5rem',
            borderTop: '2px solid #fed7aa',
            background: 'white'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                style={{
                  flex: 1,
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  border: '2px solid #fed7aa',
                  fontSize: '1rem',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#fb923c';
                  e.target.style.boxShadow = '0 0 0 3px rgba(251, 146, 60, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#fed7aa';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '14px',
                  border: 'none',
                  background: newMessage.trim()
                    ? 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
                    : '#d1d5db',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '1rem',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: newMessage.trim()
                    ? '0 6px 20px rgba(251, 146, 60, 0.3)'
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (newMessage.trim()) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 24px rgba(251, 146, 60, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = newMessage.trim()
                    ? '0 6px 20px rgba(251, 146, 60, 0.3)'
                    : 'none';
                }}
              >
                <Send size={20} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Share Modal
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fff5f0 100%)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(251, 146, 60, 0.3)',
        border: '2px solid #fb923c',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
          padding: '2rem',
          borderRadius: '24px 24px 0 0',
          position: 'relative'
        }}>
          <button onClick={onClose} style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={24} style={{ color: 'white' }} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={32} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, color: 'white', fontSize: '2rem', fontWeight: '900' }}>
                Share This Date! 🎉
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
                Invite friends and plan together!
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div style={{ padding: '2rem' }}>
          {/* 🔥 NEW: Date Name/Title Input */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#1f2937', marginBottom: '1rem', fontSize: '1rem' }}>
              📝 Give your date a name *
            </label>
            <input
              type="text"
              value={dateTitle}
              onChange={(e) => setDateTitle(e.target.value)}
              placeholder="e.g., Romantic Evening at the Beach, Adventure Day..."
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '2px solid #fed7aa',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                fontWeight: '600'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#fb923c';
                e.target.style.boxShadow = '0 0 0 3px rgba(251, 146, 60, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#fed7aa';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.5rem 0 0', fontStyle: 'italic' }}>
              * This name will appear in your feed
            </p>
          </div>

          {/* When is this happening? */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#1f2937', marginBottom: '1rem', fontSize: '1rem' }}>
              📅 When is this happening? *
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Calendar size={20} style={{ color: '#fb923c' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6b7280' }}>Date</span>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    border: '2px solid #fed7aa',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fb923c'}
                  onBlur={(e) => e.target.style.borderColor = '#fed7aa'}
                />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Clock size={20} style={{ color: '#fb923c' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6b7280' }}>Time</span>
                </div>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    border: '2px solid #fed7aa',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#fb923c'}
                  onBlur={(e) => e.target.style.borderColor = '#fed7aa'}
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#1f2937', marginBottom: '1rem', fontSize: '1rem' }}>
              🌍 Visibility
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setIsPublic(true)}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: isPublic ? '3px solid #fb923c' : '2px solid #e5e7eb',
                  background: isPublic ? 'linear-gradient(135deg, #fb923c15 0%, #f9731615 100%)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={(e) => {
                  if (!isPublic) e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (!isPublic) e.currentTarget.style.background = 'white';
                }}
              >
                <Globe size={32} style={{ color: isPublic ? '#fb923c' : '#9ca3af' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: '900', fontSize: '1.0625rem', color: '#1f2937' }}>Public</p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280' }}>Everyone can see and join</p>
                </div>
              </button>
              <button
                onClick={() => setIsPublic(false)}
                style={{
                  flex: 1,
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: !isPublic ? '3px solid #fb923c' : '2px solid #e5e7eb',
                  background: !isPublic ? 'linear-gradient(135deg, #fb923c15 0%, #f9731615 100%)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseEnter={(e) => {
                  if (isPublic) e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (isPublic) e.currentTarget.style.background = 'white';
                }}
              >
                <Lock size={32} style={{ color: !isPublic ? '#fb923c' : '#9ca3af' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: '900', fontSize: '1.0625rem', color: '#1f2937' }}>Private</p>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280' }}>Only invited friends</p>
                </div>
              </button>
            </div>
          </div>

          {/* Invite Friends */}
          {friends.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#1f2937', marginBottom: '1rem', fontSize: '1rem' }}>
                👥 Invite Friends ({selectedFriends.length} selected)
              </label>
              <div style={{
                background: 'white',
                borderRadius: '20px',
                border: '2px solid #fed7aa',
                padding: '1rem',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    onClick={() => toggleFriend(friend.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.875rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: selectedFriends.includes(friend.id) 
                        ? 'linear-gradient(135deg, #fb923c15 0%, #f9731615 100%)'
                        : 'transparent',
                      border: selectedFriends.includes(friend.id)
                        ? '2px solid #fb923c'
                        : '2px solid transparent',
                      marginBottom: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedFriends.includes(friend.id)) {
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedFriends.includes(friend.id)) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '900',
                      fontSize: '1.125rem',
                      flexShrink: 0
                    }}>
                      {friend.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#1f2937', fontSize: '1rem' }}>
                        {friend.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280' }}>
                        {friend.email}
                      </p>
                    </div>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '3px solid',
                      borderColor: selectedFriends.includes(friend.id) ? '#fb923c' : '#d1d5db',
                      background: selectedFriends.includes(friend.id) ? '#fb923c' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      {selectedFriends.includes(friend.id) && (
                        <Check size={16} style={{ color: 'white' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#1f2937', marginBottom: '1rem', fontSize: '1rem' }}>
              💭 Tell everyone about this date! *
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What makes this date special? Share your excitement..."
              rows={4}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '2px solid #fed7aa',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#fb923c'}
              onBlur={(e) => e.target.style.borderColor = '#fed7aa'}
            />
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0.5rem 0 0', fontStyle: 'italic' }}>
              * Required field
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '1.25rem',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                background: 'white',
                color: '#6b7280',
                fontWeight: '700',
                fontSize: '1.0625rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={loading || !caption.trim() || !dateTitle.trim()}
              style={{
                flex: 2,
                padding: '1.25rem',
                borderRadius: '16px',
                border: 'none',
                background: loading || !caption.trim() || !dateTitle.trim()
                  ? '#d1d5db'
                  : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                color: 'white',
                fontWeight: '900',
                fontSize: '1.125rem',
                cursor: loading || !caption.trim() || !dateTitle.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading || !caption.trim() || !dateTitle.trim()
                  ? 'none'
                  : '0 8px 20px rgba(251, 146, 60, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => {
                if (!loading && caption.trim() && dateTitle.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(251, 146, 60, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(251, 146, 60, 0.4)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Sharing...
                </>
              ) : (
                <>
                  <Users size={24} />
                  Share Date
                </>
              )}
            </button>
          </div>
        </div>
      </div>

{/* Success Modal */}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

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

export default ShareDateModal;