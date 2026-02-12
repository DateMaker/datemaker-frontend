import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Gift, Plus, Eye, EyeOff, Trash2, Calendar, Clock, X, Heart, Sparkles, Lock, Unlock, UserPlus, MapPin, ExternalLink } from 'lucide-react';
import { trackAction, ACTION_TYPES } from './ActivityTracker';

export default function SurpriseDateMode({ currentUser, onClose, prefilledItinerary = null }) {
  const [activeTab, setActiveTab] = useState('create');
  const [mySurprises, setMySurprises] = useState([]);
  const [receivedSurprises, setReceivedSurprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [hints, setHints] = useState(['']);
  const [itinerary, setItinerary] = useState(null);
  const [revealedHints, setRevealedHints] = useState({});
  const [unlockedHints, setUnlockedHints] = useState({});

  // ✅ FIXED: Use .stops instead of .activities
  useEffect(() => {
    if (prefilledItinerary) {
      setItinerary(prefilledItinerary);
      setTitle(prefilledItinerary.title || 'Surprise Date');
      setDescription(`Full itinerary with ${prefilledItinerary.stops?.length || 0} stops`);
      
      // Extract date/time from first stop if available
      if (prefilledItinerary.stops && prefilledItinerary.stops.length > 0) {
        const firstStop = prefilledItinerary.stops[0];
        if (firstStop.time) {
          setScheduledTime(firstStop.time);
        }
      }
    }
  }, [prefilledItinerary]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadSurprises();
    }
  }, [currentUser]);

  const loadSurprises = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const surprisesRef = collection(db, 'surpriseDates');
      
      // Load surprises created by me
      const createdQuery = query(surprisesRef, where('creatorId', '==', currentUser.uid));
      const createdSnapshot = await getDocs(createdQuery);
      const createdData = createdSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMySurprises(createdData);
      
      // Load surprises shared with me
      const receivedQuery = query(surprisesRef, where('partnerEmail', '==', currentUser.email));
      const receivedSnapshot = await getDocs(receivedQuery);
      const receivedData = await Promise.all(
        receivedSnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          // Get creator info
          const creatorDoc = await getDoc(doc(db, 'users', data.creatorId));
          const creatorEmail = creatorDoc.exists() ? creatorDoc.data().email : 'Unknown';
          return {
            id: docSnapshot.id,
            ...data,
            creatorEmail
          };
        })
      );
      setReceivedSurprises(receivedData);
      
    } catch (error) {
      console.error('Error loading surprises:', error);
    }
    setLoading(false);
  };

  const createSurprise = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your surprise date');
      return;
    }

    if (!partnerEmail.trim()) {
      alert('Please enter your partner\'s email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(partnerEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    setCreating(true);
    try {
      const surpriseData = {
        creatorId: currentUser.uid,
        creatorEmail: currentUser.email,
        partnerEmail: partnerEmail.toLowerCase().trim(),
        title: title.trim(),
        description: description.trim(),
        scheduledDate: scheduledDate || null,
        scheduledTime: scheduledTime || null,
        hints: hints.filter(h => h.trim()),
        itinerary: itinerary || null,
        revealed: false,
        accepted: false,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      await addDoc(collection(db, 'surpriseDates'), surpriseData);
      trackAction(ACTION_TYPES.PLAN_SURPRISE);
      
      // Reset form
      setTitle('');
      setDescription('');
      setScheduledDate('');
      setScheduledTime('');
      setPartnerEmail('');
      setHints(['']);
      setItinerary(null);
      
      // Reload and switch to track tab
      await loadSurprises();
      setActiveTab('track');
      
      alert('Surprise created successfully! Your partner will receive the invitation.');
    } catch (error) {
      console.error('Error creating surprise:', error);
      alert('Failed to create surprise. Please try again.');
    }
    setCreating(false);
  };

  const deleteSurprise = async (surpriseId) => {
    if (!window.confirm('Are you sure you want to delete this surprise?')) return;
    
    try {
      await deleteDoc(doc(db, 'surpriseDates', surpriseId));
      await loadSurprises();
    } catch (error) {
      console.error('Error deleting surprise:', error);
      alert('Failed to delete surprise');
    }
  };

  const acceptSurprise = async (surpriseId) => {
    try {
      await updateDoc(doc(db, 'surpriseDates', surpriseId), {
        accepted: true,
        status: 'accepted'
      });
      await loadSurprises();
    } catch (error) {
      console.error('Error accepting surprise:', error);
      alert('Failed to accept surprise');
    }
  };

  const revealSurprise = async (surpriseId) => {
    if (!window.confirm('Are you sure you want to reveal this surprise now?')) return;
    
    try {
      await updateDoc(doc(db, 'surpriseDates', surpriseId), {
        revealed: true,
        revealedAt: new Date().toISOString(),
        status: 'revealed'
      });
      await loadSurprises();
    } catch (error) {
      console.error('Error revealing surprise:', error);
      alert('Failed to reveal surprise');
    }
  };

  const unlockHint = (surpriseId, hintIndex) => {
    setUnlockedHints(prev => ({
      ...prev,
      [`${surpriseId}-${hintIndex}`]: true
    }));
  };

  const addHint = () => {
    if (hints.length < 5) {
      setHints([...hints, '']);
    }
  };

  const updateHint = (index, value) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  const removeHint = (index) => {
    setHints(hints.filter((_, i) => i !== index));
  };

  const getCountdown = (dateStr) => {
    if (!dateStr) return null;
    
    const targetDate = new Date(dateStr);
    const now = new Date();
    const diffMs = targetDate - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past';
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hours`;
    
    return `${diffDays} days`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (surprise) => {
    if (surprise.revealed) {
      return { text: '✓ Revealed', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' };
    } else if (surprise.accepted) {
      return { text: '👀 Accepted', color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' };
    } else {
      return { text: '📬 Pending', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };
    }
  };

  // Get unaccepted surprises count for badge
  const unacceptedCount = receivedSurprises.filter(s => !s.accepted).length;

  // ✅ Helper function to get stop count from itinerary (handles both .stops and .activities)
  const getStopCount = (itinerary) => {
    if (!itinerary) return 0;
    return itinerary.stops?.length || itinerary.activities?.length || 0;
  };

  // ✅ Helper function to get stops array from itinerary
  const getStops = (itinerary) => {
    if (!itinerary) return [];
    return itinerary.stops || itinerary.activities || [];
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      zIndex: 10000
    }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${1.5 + Math.random() * 2}rem`,
              opacity: 0.1,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {['🎁', '💕', '✨', '🎉', '💖', '🌟', '🎀', '💝'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        padding: '1.5rem',
        paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
        borderRadius: '0 0 32px 32px',
        boxShadow: '0 10px 40px rgba(236, 72, 153, 0.4)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gift size={28} color="white" />
          </div>
          <h2 style={{ 
            color: 'white', 
            fontSize: '1.5rem', 
            fontWeight: '800', 
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Surprise Date Mode
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ padding: '1.5rem 1.5rem 1rem', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '0.5rem',
          display: 'flex',
          gap: '0.5rem',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '16px',
              border: 'none',
              background: activeTab === 'create' ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' : 'transparent',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === 'create' ? '0 8px 20px rgba(236, 72, 153, 0.4)' : 'none'
            }}
          >
            <Plus size={20} />
            Create
          </button>
          <button
            onClick={() => setActiveTab('track')}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '16px',
              border: 'none',
              background: activeTab === 'track' ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' : 'transparent',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              position: 'relative',
              boxShadow: activeTab === 'track' ? '0 8px 20px rgba(236, 72, 153, 0.4)' : 'none'
            }}
          >
            <Eye size={20} />
            Track
            {unacceptedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.5rem',
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
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
              }}>
                {unacceptedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0.5rem 1.5rem 2rem', position: 'relative', zIndex: 1 }}>
        {activeTab === 'create' ? (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '28px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={26} color="#ec4899" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#1f2937' }}>
                {itinerary ? '🎁 Share as Surprise' : 'Plan a Surprise'}
              </h3>
            </div>

            {/* ✅ FIXED: Show itinerary preview if provided - use getStopCount */}
            {itinerary && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '20px',
                padding: '1.5rem',
                marginBottom: '2rem',
                border: '2px solid #fbbf24',
                boxShadow: '0 8px 20px rgba(251, 191, 36, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <MapPin size={24} color="#f59e0b" />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#92400e' }}>
                    Full Date Itinerary Attached
                  </h4>
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.95rem', color: '#78350f', fontWeight: '600' }}>
                  <strong>{getStopCount(itinerary)} stops</strong> planned
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#92400e' }}>
                  Your partner will see the full itinerary when revealed!
                </p>
              </div>
            )}

            {/* Partner Email */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.75rem',
                color: '#374151'
              }}>
                <UserPlus size={20} color="#ec4899" />
                Partner's Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@example.com"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
              />
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                They'll receive a surprise invitation
              </p>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.75rem',
                display: 'block',
                color: '#374151'
              }}>
                Surprise Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Anniversary Adventure"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            {/* Secret Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.75rem',
                color: '#374151'
              }}>
                <Lock size={18} color="#ec4899" />
                Your Secret Plan (Only you can see this)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's the surprise? Keep it secret..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>

            {/* Date and Time */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.75rem',
                color: '#374151'
              }}>
                <Calendar size={18} color="#ec4899" />
                Date
              </label>
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    marginBottom: '1rem',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    outline: 'none'
                  }}
                />
              </div>
              
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.75rem',
                color: '#374151'
              }}>
                <Clock size={18} color="#ec4899" />
                Time
              </label>
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '14px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Hints */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                💡 Hints for your partner (optional)
              </label>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                Your partner can unlock these hints one by one
              </p>
              
              {hints.map((hint, index) => (
                <div key={index} style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    placeholder={`Hint ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '1rem 1.25rem',
                      borderRadius: '14px',
                      border: '2px solid #e5e7eb',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  {hints.length > 1 && (
                    <button
                      onClick={() => removeHint(index)}
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '14px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '700'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              {hints.length < 5 && (
                <button
                  onClick={addHint}
                  style={{
                    padding: '0.875rem 1.5rem',
                    borderRadius: '14px',
                    border: '2px dashed #d1d5db',
                    background: 'transparent',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '700',
                    width: '100%',
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Add Hint
                </button>
              )}
            </div>

            {/* Create Button */}
            <button
              onClick={createSurprise}
              disabled={creating}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: '18px',
                border: 'none',
                background: creating ? '#d1d5db' : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '800',
                cursor: creating ? 'not-allowed' : 'pointer',
                boxShadow: creating ? 'none' : '0 10px 30px rgba(236,72,153,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Gift size={24} />
              {creating ? 'Creating...' : '🎁 Create & Send Surprise'}
            </button>
          </div>
        ) : (
          <div>
            {/* Loading State */}
            {loading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(255,255,255,0.1)',
                  borderTop: '4px solid #ec4899',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '1.5rem', fontWeight: '600' }}>
                  Loading surprises...
                </p>
              </div>
            )}

            {/* Surprises for You */}
            {!loading && receivedSurprises.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  <Gift size={26} />
                  Surprises for You
                </h3>
                
                {receivedSurprises.map(surprise => {
                  const countdown = getCountdown(surprise.scheduledDate);
                  const isRevealed = surprise.revealed;
                  const isAccepted = surprise.accepted;
                  const stops = getStops(surprise.itinerary);
                  
                  return (
                    <div
                      key={surprise.id}
                      style={{
                        background: isRevealed 
                          ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                          : 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                        borderRadius: '24px',
                        padding: '2rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                        border: isRevealed ? '3px solid #fbbf24' : '3px solid #f472b6'
                      }}
                    >
                      {/* Lock/Unlock Icon */}
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          background: isRevealed 
                            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                            : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          boxShadow: isRevealed 
                            ? '0 10px 30px rgba(251, 191, 36, 0.4)'
                            : '0 10px 30px rgba(236, 72, 153, 0.4)'
                        }}>
                          {isRevealed ? (
                            <Unlock size={40} color="white" strokeWidth={2.5} />
                          ) : (
                            <Lock size={40} color="white" strokeWidth={2.5} />
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 style={{
                        fontSize: '1.75rem',
                        fontWeight: '800',
                        margin: '0 0 0.5rem 0',
                        color: isRevealed ? '#92400e' : '#831843',
                        textAlign: 'center'
                      }}>
                        {surprise.title} {isRevealed ? '🎉' : '🎁'}
                      </h4>

                      {/* From */}
                      <p style={{
                        textAlign: 'center',
                        color: isRevealed ? '#78350f' : '#be185d',
                        fontSize: '0.95rem',
                        marginBottom: '1.5rem'
                      }}>
                        From: <strong>{surprise.creatorEmail}</strong>
                      </p>

                      {/* Countdown */}
                      {countdown && !isRevealed && (
                        <div style={{
                          background: 'rgba(255,255,255,0.8)',
                          borderRadius: '20px',
                          padding: '1.5rem',
                          textAlign: 'center',
                          marginBottom: '1.5rem',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ 
                            fontSize: '3rem', 
                            fontWeight: '900', 
                            background: 'linear-gradient(135deg, #ec4899, #db2777)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>
                            {countdown}
                          </div>
                          {surprise.scheduledDate && (
                            <div style={{ fontSize: '1rem', color: '#831843', marginTop: '0.5rem', fontWeight: '600' }}>
                              {formatDate(surprise.scheduledDate)}
                              {surprise.scheduledTime && ` at ${surprise.scheduledTime}`}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Revealed Date */}
                      {isRevealed && surprise.scheduledDate && (
                        <div style={{
                          background: 'rgba(255,255,255,0.8)',
                          borderRadius: '16px',
                          padding: '1rem',
                          textAlign: 'center',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#92400e' }}>
                            📅 {formatDate(surprise.scheduledDate)}
                            {surprise.scheduledTime && ` at ${surprise.scheduledTime}`}
                          </div>
                        </div>
                      )}

                      {/* Hints */}
                      {surprise.hints && surprise.hints.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h5 style={{
                            fontSize: '1.05rem',
                            fontWeight: '800',
                            marginBottom: '0.75rem',
                            color: isRevealed ? '#92400e' : '#831843'
                          }}>
                            💡 Hints:
                          </h5>
                          {surprise.hints.map((hint, index) => {
                            const isUnlocked = isRevealed || unlockedHints[`${surprise.id}-${index}`];
                            return (
                              <div
                                key={index}
                                style={{
                                  background: isUnlocked ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                                  borderRadius: '14px',
                                  padding: '1rem',
                                  marginBottom: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '1rem'
                                }}
                              >
                                {isUnlocked ? (
                                  <span style={{ flex: 1, color: '#374151', fontWeight: '500' }}>{hint}</span>
                                ) : (
                                  <>
                                    <span style={{ flex: 1, color: '#9ca3af', fontWeight: '500' }}>🔒 Hint {index + 1}</span>
                                    <button
                                      onClick={() => unlockHint(surprise.id, index)}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
                                      }}
                                    >
                                      Unlock
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Revealed Description */}
                      {isRevealed && surprise.description && (
                        <div style={{
                          background: 'rgba(255,255,255,0.9)',
                          borderRadius: '18px',
                          padding: '1.5rem',
                          marginBottom: '1.5rem',
                          border: '2px solid #fbbf24'
                        }}>
                          <h5 style={{
                            fontSize: '1.05rem',
                            fontWeight: '800',
                            marginBottom: '0.75rem',
                            color: '#92400e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <Sparkles size={20} />
                            The Secret:
                          </h5>
                          <p style={{ margin: 0, color: '#78350f', lineHeight: '1.6' }}>
                            {surprise.description}
                          </p>
                        </div>
                      )}

                      {/* ✅ FIXED: Show Itinerary if Revealed - use getStops helper */}
                      {isRevealed && stops.length > 0 && (
                        <div style={{
                          background: 'rgba(255,255,255,0.9)',
                          borderRadius: '18px',
                          padding: '1.5rem',
                          marginBottom: '1.5rem',
                          border: '2px solid #fbbf24'
                        }}>
                          <h5 style={{
                            fontSize: '1.15rem',
                            fontWeight: '800',
                            marginBottom: '1rem',
                            color: '#92400e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <MapPin size={22} />
                            Full Date Itinerary:
                          </h5>
                          
                          {stops.map((stop, index) => (
                            <div
                              key={index}
                              style={{
                                background: 'white',
                                borderRadius: '14px',
                                padding: '1.25rem',
                                marginBottom: '1rem',
                                border: '2px solid #fcd34d',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                marginBottom: '0.75rem'
                              }}>
                                <div style={{
                                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                  borderRadius: '50%',
                                  width: '44px',
                                  height: '44px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.5rem',
                                  flexShrink: 0
                                }}>
                                  {/* ✅ FIXED: Use stop.icon instead of activity.emoji */}
                                  {stop.icon || stop.emoji || '📍'}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <h6 style={{
                                    fontSize: '1.05rem',
                                    fontWeight: '800',
                                    margin: '0 0 0.25rem 0',
                                    color: '#92400e'
                                  }}>
                                    {/* ✅ FIXED: Use stop.time and stop.place.name or stop.title */}
                                    {stop.time && `${stop.time} - `}{stop.place?.name || stop.name || stop.title}
                                  </h6>
                                  <p style={{
                                    fontSize: '0.9rem',
                                    color: '#78350f',
                                    margin: '0.25rem 0'
                                  }}>
                                    {/* ✅ FIXED: Use stop.place.vicinity or stop.address */}
                                    📍 {stop.place?.vicinity || stop.address || 'Address not available'}
                                  </p>
                                  {/* ✅ FIXED: Use stop.description */}
                                  {stop.description && (
                                    <p style={{
                                      fontSize: '0.9rem',
                                      color: '#92400e',
                                      margin: '0.5rem 0 0 0',
                                      lineHeight: '1.5'
                                    }}>
                                      {stop.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* ✅ FIXED: Use stop.place.place_id for Google Maps link */}
                              {(stop.place?.place_id || stop.place_id) && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.place?.name || stop.name || stop.title)}&query_place_id=${stop.place?.place_id || stop.place_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                    color: '#92400e',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    marginTop: '0.75rem'
                                  }}
                                >
                                  <MapPin size={16} />
                                  View on Map
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {!isRevealed && !isAccepted && (
                        <button
                          onClick={() => acceptSurprise(surprise.id)}
                          style={{
                            width: '100%',
                            padding: '1.25rem',
                            borderRadius: '18px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 8px 25px rgba(16,185,129,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
                          }}
                        >
                          <Heart size={24} />
                          Accept Surprise
                        </button>
                      )}
                      
                      {!isRevealed && isAccepted && (
                        <button
                          onClick={() => revealSurprise(surprise.id)}
                          style={{
                            width: '100%',
                            padding: '1.25rem',
                            borderRadius: '18px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 8px 25px rgba(245,158,11,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
                          }}
                        >
                          <Unlock size={24} />
                          Reveal Surprise Now!
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* My Surprises */}
            {!loading && mySurprises.length > 0 && (
              <div>
                <h3 style={{
                  color: 'white',
                  fontSize: '1.35rem',
                  fontWeight: '800',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  <Eye size={26} />
                  My Surprises
                </h3>
                
                {mySurprises.map(surprise => {
                  const status = getStatusBadge(surprise);
                  const stops = getStops(surprise.itinerary);
                  
                  return (
                    <div
                      key={surprise.id}
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '24px',
                        padding: '1.75rem',
                        marginBottom: '1.5rem',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
                      }}
                    >
                      {/* Status Badge */}
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          background: status.color,
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          marginBottom: '1rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {status.text}
                      </div>

                      {/* Title */}
                      <h4 style={{
                        fontSize: '1.4rem',
                        fontWeight: '800',
                        margin: '0 0 1rem 0',
                        color: '#1f2937'
                      }}>
                        {surprise.title}
                      </h4>

                      {/* Partner Email */}
                      <p style={{ margin: '0.5rem 0', color: '#6b7280', fontWeight: '500' }}>
                        <strong>Partner:</strong> {surprise.partnerEmail}
                      </p>

                      {/* Date/Time */}
                      {surprise.scheduledDate && (
                        <p style={{ margin: '0.5rem 0', color: '#6b7280', fontWeight: '500' }}>
                          <strong>Date:</strong> {formatDate(surprise.scheduledDate)}
                          {surprise.scheduledTime && ` at ${surprise.scheduledTime}`}
                        </p>
                      )}

                      {/* Secret Description */}
                      {surprise.description && (
                        <div style={{
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          borderRadius: '14px',
                          padding: '1rem',
                          margin: '1rem 0',
                          border: '2px solid #fbbf24'
                        }}>
                          <p style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            color: '#78350f',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '500'
                          }}>
                            <Lock size={16} />
                            <strong>Your secret:</strong> {surprise.description}
                          </p>
                        </div>
                      )}

                      {/* ✅ FIXED: Show itinerary if attached - use getStopCount */}
                      {stops.length > 0 && (
                        <div style={{
                          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                          borderRadius: '14px',
                          padding: '1rem',
                          margin: '1rem 0',
                          border: '2px solid #6ee7b7'
                        }}>
                          <p style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            color: '#065f46',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600'
                          }}>
                            <MapPin size={16} />
                            <strong>Full itinerary attached:</strong> {stops.length} stops
                          </p>
                        </div>
                      )}

                      {/* Hints */}
                      {surprise.hints && surprise.hints.length > 0 && (
                        <div style={{ margin: '1rem 0' }}>
                          <p style={{
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            color: '#6b7280',
                            marginBottom: '0.5rem'
                          }}>
                            Hints you provided:
                          </p>
                          {surprise.hints.map((hint, index) => (
                            <div
                              key={index}
                              style={{
                                background: '#f3f4f6',
                                borderRadius: '10px',
                                padding: '0.75rem 1rem',
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                color: '#4b5563',
                                fontWeight: '500'
                              }}
                            >
                              {index + 1}. {hint}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteSurprise(surprise.id)}
                        style={{
                          marginTop: '1rem',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                          color: '#dc2626',
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Trash2 size={18} />
                        Delete Surprise
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty States */}
            {!loading && receivedSurprises.length === 0 && mySurprises.length === 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '28px',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <Gift size={48} color="#ec4899" />
                </div>
                <h4 style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: '800', 
                  marginBottom: '0.75rem',
                  background: 'linear-gradient(135deg, #ec4899, #db2777)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  No Surprises Yet
                </h4>
                <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                  Create your first surprise date or wait for one to arrive!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}