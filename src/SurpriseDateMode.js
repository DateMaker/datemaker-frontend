import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Gift, Plus, Eye, EyeOff, Trash2, Calendar, Clock, X, Heart, Sparkles, Lock, Unlock, UserPlus } from 'lucide-react';

export default function SurpriseDateMode({ currentUser, onClose }) {
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
  const [revealedHints, setRevealedHints] = useState({});
  const [unlockedHints, setUnlockedHints] = useState({});

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
        revealed: false,
        accepted: false,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      await addDoc(collection(db, 'surpriseDates'), surpriseData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setScheduledDate('');
      setScheduledTime('');
      setPartnerEmail('');
      setHints(['']);
      
      await loadSurprises();
      setActiveTab('track');
      alert('🎁 Surprise created and sent to your partner!');
    } catch (error) {
      console.error('Error creating surprise:', error);
      alert('Failed to create surprise date');
    }
    setCreating(false);
  };

  const deleteSurprise = async (surpriseId) => {
    if (!window.confirm('Are you sure you want to delete this surprise?')) return;
    
    try {
      await deleteDoc(doc(db, 'surpriseDates', surpriseId));
      setMySurprises(mySurprises.filter(s => s.id !== surpriseId));
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
    }
  };

  const revealSurprise = async (surpriseId) => {
    try {
      await updateDoc(doc(db, 'surpriseDates', surpriseId), {
        revealed: true,
        revealedAt: new Date().toISOString(),
        status: 'revealed'
      });
      setReceivedSurprises(receivedSurprises.map(s => 
        s.id === surpriseId ? { ...s, revealed: true } : s
      ));
    } catch (error) {
      console.error('Error revealing surprise:', error);
    }
  };

  const unlockHint = (surpriseId, hintIndex) => {
    const key = `${surpriseId}-${hintIndex}`;
    setUnlockedHints(prev => ({
      ...prev,
      [key]: true
    }));
  };

  const addHintField = () => {
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
    if (hints.length > 1) {
      setHints(hints.filter((_, i) => i !== index));
    }
  };

  const getCountdown = (dateStr) => {
    if (!dateStr) return null;
    const targetDate = new Date(dateStr);
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff < 0) return 'Today!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days === 0) return `${hours} hours`;
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  if (!currentUser) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      zIndex: 9999,
      overflow: 'auto',
      paddingTop: 'env(safe-area-inset-top)'
    }}>
      <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
          borderRadius: '24px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Gift size={28} /> Surprise Date Mode
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('create')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'create' ? 'white' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'create' ? '#ec4899' : 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={18} /> Create
            </button>
            <button
              onClick={() => setActiveTab('track')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'track' ? 'white' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'track' ? '#ec4899' : 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}
            >
              <Eye size={18} /> Track
              {receivedSurprises.filter(s => !s.accepted && !s.revealed).length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '0.25rem',
                  right: '0.25rem',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {receivedSurprises.filter(s => !s.accepted && !s.revealed).length}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* CREATE TAB */}
        {activeTab === 'create' && (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles size={20} /> Plan a Surprise
            </h3>

            {/* Partner Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#555'
              }}>
                <UserPlus size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Partner's Email *
              </label>
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@example.com"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.25rem',
                marginBottom: 0
              }}>
                They'll receive a surprise invitation
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#555'
              }}>
                Surprise Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Anniversary Adventure"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#555'
              }}>
                <Lock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Your Secret Plan (Only you can see this)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's the surprise? Keep it secret..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#555'
                }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#555'
                }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Hints */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#555'
              }}>
                💡 Hints for your partner (optional)
              </label>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginBottom: '0.75rem'
              }}>
                Your partner can unlock these hints one by one
              </p>
              {hints.map((hint, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    placeholder={`Hint ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.875rem'
                    }}
                  />
                  {hints.length > 1 && (
                    <button
                      onClick={() => removeHint(index)}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0 0.75rem',
                        cursor: 'pointer',
                        color: '#dc2626'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {hints.length < 5 && (
                <button
                  onClick={addHintField}
                  style={{
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#666'
                  }}
                >
                  + Add Hint
                </button>
              )}
            </div>

            <button
              onClick={createSurprise}
              disabled={creating}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '14px',
                border: 'none',
                background: creating
                  ? '#ccc'
                  : 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                color: 'white',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                cursor: creating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(236,72,153,0.3)'
              }}
            >
              {creating ? 'Creating...' : '🎁 Create & Send Surprise'}
            </button>
          </div>
        )}

        {/* TRACK TAB */}
        {activeTab === 'track' && (
          <div>
            {loading ? (
              <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '3rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f4f6',
                  borderTop: '4px solid #ec4899',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
                <p style={{ color: '#666', marginTop: '1rem' }}>Loading surprises...</p>
              </div>
            ) : (
              <>
                {/* RECEIVED SURPRISES */}
                {receivedSurprises.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Heart size={20} fill="white" /> Surprises for You
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {receivedSurprises.map((surprise) => (
                        <div
                          key={surprise.id}
                          style={{
                            background: surprise.revealed 
                              ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                              : 'linear-gradient(135deg, #f0abfc 0%, #e879f9 100%)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            border: '3px solid white'
                          }}
                        >
                          {/* Mystery Header */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '1rem'
                          }}>
                            <div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                              }}>
                                {surprise.revealed ? (
                                  <Unlock size={20} color="#92400e" />
                                ) : (
                                  <Lock size={20} color="white" />
                                )}
                                <h4 style={{
                                  fontSize: '1.5rem',
                                  fontWeight: 'bold',
                                  color: surprise.revealed ? '#92400e' : 'white',
                                  margin: 0
                                }}>
                                  {surprise.revealed ? '🎉' : '🎁'} {surprise.title}
                                </h4>
                              </div>
                              <p style={{
                                color: surprise.revealed ? '#78350f' : 'rgba(255,255,255,0.9)',
                                fontSize: '0.875rem',
                                margin: 0
                              }}>
                                From: {surprise.creatorEmail}
                              </p>
                            </div>
                          </div>

                          {/* Countdown */}
                          {surprise.scheduledDate && !surprise.revealed && (
                            <div style={{
                              background: 'rgba(255,255,255,0.3)',
                              borderRadius: '12px',
                              padding: '1rem',
                              marginBottom: '1rem',
                              textAlign: 'center'
                            }}>
                              <p style={{
                                color: 'white',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                margin: 0,
                                marginBottom: '0.25rem'
                              }}>
                                ⏰ {getCountdown(surprise.scheduledDate)}
                              </p>
                              <p style={{
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '0.875rem',
                                margin: 0
                              }}>
                                {new Date(surprise.scheduledDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                                {surprise.scheduledTime && ` at ${surprise.scheduledTime}`}
                              </p>
                            </div>
                          )}

                          {/* Hints Section */}
                          {surprise.hints && surprise.hints.length > 0 && !surprise.revealed && (
                            <div style={{ marginBottom: '1rem' }}>
                              <p style={{
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                              }}>
                                💡 Unlock Hints:
                              </p>
                              {surprise.hints.map((hint, index) => {
                                const key = `${surprise.id}-${index}`;
                                const isUnlocked = unlockedHints[key];
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      background: 'rgba(255,255,255,0.2)',
                                      borderRadius: '10px',
                                      padding: '0.75rem',
                                      marginBottom: '0.5rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '0.75rem'
                                    }}
                                  >
                                    <span style={{
                                      color: isUnlocked ? 'white' : 'rgba(255,255,255,0.5)',
                                      fontSize: '0.875rem',
                                      fontWeight: isUnlocked ? '600' : '400',
                                      flex: 1
                                    }}>
                                      {isUnlocked ? `💡 ${hint}` : `Hint ${index + 1}`}
                                    </span>
                                    {!isUnlocked && (
                                      <button
                                        onClick={() => unlockHint(surprise.id, index)}
                                        style={{
                                          background: 'rgba(255,255,255,0.9)',
                                          border: 'none',
                                          borderRadius: '8px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          color: '#ec4899',
                                          fontWeight: 'bold',
                                          fontSize: '0.75rem'
                                        }}
                                      >
                                        Unlock
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Revealed Description */}
                          {surprise.revealed && surprise.description && (
                            <div style={{
                              background: 'rgba(255,255,255,0.5)',
                              borderRadius: '12px',
                              padding: '1rem',
                              marginBottom: '1rem'
                            }}>
                              <p style={{
                                color: '#78350f',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                              }}>
                                The Surprise:
                              </p>
                              <p style={{
                                color: '#92400e',
                                fontSize: '0.875rem',
                                margin: 0
                              }}>
                                {surprise.description}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {!surprise.accepted && !surprise.revealed && (
                            <button
                              onClick={() => acceptSurprise(surprise.id)}
                              style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'white',
                                color: '#ec4899',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1rem'
                              }}
                            >
                              💝 Accept Surprise
                            </button>
                          )}

                          {surprise.accepted && !surprise.revealed && (
                            <button
                              onClick={() => revealSurprise(surprise.id)}
                              style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
                              }}
                            >
                              🎉 Reveal Surprise Now!
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MY CREATED SURPRISES */}
                <div>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Gift size={20} /> My Surprises
                  </h3>

                  {mySurprises.length === 0 ? (
                    <div style={{
                      background: 'white',
                      borderRadius: '24px',
                      padding: '3rem',
                      textAlign: 'center',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333' }}>
                        No Surprises Created Yet
                      </h3>
                      <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Create your first surprise date for someone special!
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {mySurprises.map((surprise) => (
                        <div
                          key={surprise.id}
                          style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            marginBottom: '1rem'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: '1.25rem',
                                fontWeight: 'bold',
                                color: '#333',
                                margin: 0,
                                marginBottom: '0.5rem'
                              }}>
                                {surprise.revealed ? '🎉' : '🎁'} {surprise.title}
                              </h4>
                              <p style={{
                                color: '#666',
                                fontSize: '0.875rem',
                                margin: 0,
                                marginBottom: '0.25rem'
                              }}>
                                For: {surprise.partnerEmail}
                              </p>
                              {surprise.scheduledDate && (
                                <p style={{
                                  color: '#666',
                                  fontSize: '0.875rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  margin: 0
                                }}>
                                  <Calendar size={14} />
                                  {new Date(surprise.scheduledDate).toLocaleDateString()}
                                  {surprise.scheduledTime && ` at ${surprise.scheduledTime}`}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteSurprise(surprise.id)}
                              style={{
                                background: '#fee2e2',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                color: '#dc2626'
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {/* Status Badge */}
                          <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            background: surprise.revealed
                              ? '#dcfce7'
                              : surprise.accepted
                              ? '#dbeafe'
                              : '#fef3c7',
                            color: surprise.revealed
                              ? '#166534'
                              : surprise.accepted
                              ? '#1e40af'
                              : '#92400e',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem'
                          }}>
                            {surprise.revealed
                              ? '✓ Revealed'
                              : surprise.accepted
                              ? '👀 Accepted'
                              : '📬 Pending'}
                          </div>

                          {surprise.description && (
                            <p style={{
                              color: '#555',
                              fontSize: '0.875rem',
                              padding: '0.75rem',
                              background: '#f9fafb',
                              borderRadius: '10px',
                              marginBottom: '1rem'
                            }}>
                              <Lock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                              {surprise.description}
                            </p>
                          )}

                          {surprise.hints && surprise.hints.length > 0 && (
                            <div>
                              <p style={{
                                fontSize: '0.75rem',
                                color: '#666',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                              }}>
                                Hints you provided:
                              </p>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                              }}>
                                {surprise.hints.map((hint, index) => (
                                  <p
                                    key={index}
                                    style={{
                                      fontSize: '0.75rem',
                                      color: '#999',
                                      margin: 0
                                    }}
                                  >
                                    {index + 1}. {hint}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}