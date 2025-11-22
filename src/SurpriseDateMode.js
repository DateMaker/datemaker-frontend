import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Gift, Plus, Eye, EyeOff, Trash2, Calendar, MapPin, Clock, X } from 'lucide-react';

export default function SurpriseDateMode({ currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState('create');
  const [surprises, setSurprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [hints, setHints] = useState(['']);
  const [revealedHints, setRevealedHints] = useState({});

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
      const q = query(surprisesRef, where('creatorId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      
      const surprisesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSurprises(surprisesData);
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

    setCreating(true);
    try {
      const surpriseData = {
        creatorId: currentUser.uid,
        title: title.trim(),
        description: description.trim(),
        scheduledDate: scheduledDate || null,
        scheduledTime: scheduledTime || null,
        hints: hints.filter(h => h.trim()),
        revealed: false,
        createdAt: new Date(),
        status: 'planned'
      };

      await addDoc(collection(db, 'surpriseDates'), surpriseData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setScheduledDate('');
      setScheduledTime('');
      setHints(['']);
      
      await loadSurprises();
      setActiveTab('track');
      alert('🎁 Surprise date created!');
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
      setSurprises(surprises.filter(s => s.id !== surpriseId));
    } catch (error) {
      console.error('Error deleting surprise:', error);
      alert('Failed to delete surprise');
    }
  };

  const revealSurprise = async (surpriseId) => {
    try {
      await updateDoc(doc(db, 'surpriseDates', surpriseId), {
        revealed: true
      });
      setSurprises(surprises.map(s => 
        s.id === surpriseId ? { ...s, revealed: true } : s
      ));
    } catch (error) {
      console.error('Error revealing surprise:', error);
    }
  };

  const toggleHintReveal = (surpriseId, hintIndex) => {
    const key = `${surpriseId}-${hintIndex}`;
    setRevealedHints(prev => ({
      ...prev,
      [key]: !prev[key]
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
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} color="white" />
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
                gap: '0.5rem'
              }}
            >
              <Eye size={18} /> Track
            </button>
          </div>
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: '#333'
            }}>
              ✨ Plan a Surprise
            </h3>

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
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's the plan? (Only you can see this)"
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
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
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
                🔍 Hints for your partner (optional)
              </label>
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
              {creating ? 'Creating...' : '🎁 Create Surprise'}
            </button>
          </div>
        )}

        {/* Track Tab */}
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
            ) : surprises.length === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333' }}>
                  No Surprise Dates Yet
                </h3>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                  Create your first surprise date to track it here!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {surprises.map((surprise) => (
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
                      <div>
                        <h4 style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: '#333',
                          margin: 0
                        }}>
                          {surprise.revealed ? '🎉' : '🎁'} {surprise.title}
                        </h4>
                        {surprise.scheduledDate && (
                          <p style={{
                            color: '#666',
                            fontSize: '0.875rem',
                            marginTop: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
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

                    {surprise.description && (
                      <p style={{
                        color: '#555',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '10px'
                      }}>
                        {surprise.description}
                      </p>
                    )}

                    {/* Hints */}
                    {surprise.hints && surprise.hints.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#666',
                          marginBottom: '0.5rem'
                        }}>
                          Hints:
                        </p>
                        {surprise.hints.map((hint, index) => {
                          const isRevealed = revealedHints[`${surprise.id}-${index}`];
                          return (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <button
                                onClick={() => toggleHintReveal(surprise.id, index)}
                                style={{
                                  background: isRevealed ? '#dcfce7' : '#f3f4f6',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '0.5rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {isRevealed ? (
                                  <Eye size={16} color="#16a34a" />
                                ) : (
                                  <EyeOff size={16} color="#666" />
                                )}
                              </button>
                              <span style={{
                                color: isRevealed ? '#333' : '#ccc',
                                fontSize: '0.875rem',
                                fontStyle: isRevealed ? 'normal' : 'italic'
                              }}>
                                {isRevealed ? hint : '••••••••'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!surprise.revealed && (
                      <button
                        onClick={() => revealSurprise(surprise.id)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🎉 Reveal Surprise
                      </button>
                    )}
                  </div>
                ))}
              </div>
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