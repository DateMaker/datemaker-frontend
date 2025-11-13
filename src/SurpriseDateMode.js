import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function SurpriseDateMode({ currentUser, mode, activeSurprise, onClose }) {
  const [viewMode, setViewMode] = useState(mode || 'track');
  const [loading, setLoading] = useState(false);
  const [surprises, setSurprises] = useState([]);
  const [selectedSurprise, setSelectedSurprise] = useState(activeSurprise || null);
  
  // Create mode states
  const [partnerName, setPartnerName] = useState('');
  const [partnerContact, setPartnerContact] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [hints, setHints] = useState(['', '', '']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (viewMode === 'track') {
      loadSurprises();
    }
  }, [currentUser, viewMode]);

  const loadSurprises = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'surpriseDates'),
        where('createdBy', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      const surprisesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const aTime = new Date(a.createdAt || 0);
        const bTime = new Date(b.createdAt || 0);
        return bTime - aTime;
      });
      
      setSurprises(surprisesData);
    } catch (error) {
      console.error('Error loading surprises:', error);
    }
    setLoading(false);
  };

  const createSurprise = async () => {
    if (!currentUser) {
      alert('You must be logged in');
      return;
    }
    
    if (!partnerName.trim()) {
      alert('Please enter your partner\'s name');
      return;
    }
    
    if (!dateTime) {
      alert('Please select a date and time');
      return;
    }

    const validHints = hints.filter(h => h.trim() !== '');
    if (validHints.length === 0) {
      alert('Please add at least one hint');
      return;
    }

    setSaving(true);
    
    try {
      const surpriseData = {
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName || currentUser.email,
        partnerName: partnerName.trim(),
        partnerContact: partnerContact.trim(),
        dateTime: new Date(dateTime).toISOString(),
        hints: validHints,
        revealedHints: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'surpriseDates'), surpriseData);
      
      alert('🎁 Surprise date created! Share the hints with your partner!');
      setPartnerName('');
      setPartnerContact('');
      setDateTime('');
      setHints(['', '', '']);
      setViewMode('track');
      
    } catch (error) {
      console.error('Error creating surprise:', error);
      alert(`Failed to create surprise date: ${error.message}`);
    }
    
    setSaving(false);
  };

  const revealNextHint = async (surprise) => {
    if (surprise.revealedHints >= surprise.hints.length) {
      alert('All hints have been revealed!');
      return;
    }

    try {
      const newRevealed = surprise.revealedHints + 1;
      const surpriseRef = doc(db, 'surpriseDates', surprise.id);
      
      await updateDoc(surpriseRef, {
        revealedHints: newRevealed,
        status: newRevealed >= surprise.hints.length ? 'completed' : 'active'
      });

      setSelectedSurprise({
        ...surprise,
        revealedHints: newRevealed,
        status: newRevealed >= surprise.hints.length ? 'completed' : 'active'
      });

      loadSurprises();
      
      alert(`🎉 Hint ${newRevealed} revealed!`);
    } catch (error) {
      console.error('Error revealing hint:', error);
      alert('Failed to reveal hint');
    }
  };

  const deleteSurprise = async (surpriseId) => {
    if (!window.confirm('Are you sure you want to delete this surprise date?')) return;

    try {
      setSurprises(surprises.filter(s => s.id !== surpriseId));
      if (selectedSurprise?.id === surpriseId) {
        setSelectedSurprise(null);
      }
      alert('Surprise date deleted');
    } catch (error) {
      console.error('Error deleting surprise:', error);
      alert('Failed to delete surprise');
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
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          padding: '2rem',
          borderRadius: '24px 24px 0 0',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
              🎁 Surprise Date Mode
            </h2>
            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
          
          {/* Mode Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('create')}
              style={{
                background: viewMode === 'create' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: viewMode === 'create' ? '2px solid white' : '2px solid transparent',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              ✨ Create
            </button>
            <button
              onClick={() => setViewMode('track')}
              style={{
                background: viewMode === 'track' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: viewMode === 'track' ? '2px solid white' : '2px solid transparent',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              📋 Track
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Create Mode */}
          {viewMode === 'create' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '2rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                border: '2px solid #fbbf24',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
                  Plan a Surprise Date!
                </h3>
                <p style={{ color: '#78350f', fontSize: '1rem' }}>
                  Create progressive hints to reveal your date plans one at a time
                </p>
              </div>

              {/* Partner Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  💕 Partner's Name
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Enter your partner's name"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Contact Info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  📧 Contact Info (Email or Phone)
                </label>
                <input
                  type="text"
                  value={partnerContact}
                  onChange={(e) => setPartnerContact(e.target.value)}
                  placeholder="So you can share the surprise"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Date & Time */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  📅 Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Hints */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#374151'
                }}>
                  ✨ Create Hints
                </h3>
                <p style={{ 
                  color: '#666', 
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  Write hints that will be revealed progressively throughout the date
                </p>
                
                {hints.map((hint, index) => (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                      color: '#374151'
                    }}>
                      Hint {index + 1}
                    </label>
                    <input
                      type="text"
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...hints];
                        newHints[index] = e.target.value;
                        setHints(newHints);
                      }}
                      placeholder={`e.g., "Wear comfortable shoes!" or "We're going somewhere romantic"`}
                      style={{
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}

                <button
                  onClick={() => setHints([...hints, ''])}
                  style={{
                    background: 'white',
                    color: '#a855f7',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    border: '2px solid #a855f7',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}
                >
                  + Add Another Hint
                </button>
              </div>

              {/* Create Button */}
              <button
                onClick={createSurprise}
                disabled={saving}
                style={{
                  width: '100%',
                  background: saving 
                    ? '#d1d5db' 
                    : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  color: 'white',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  boxShadow: saving ? 'none' : '0 8px 20px rgba(168,85,247,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem'
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid white',
                      borderTop: '3px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creating...
                  </>
                ) : (
                  <>🎁 Create Surprise Date</>
                )}
              </button>
            </div>
          )}

          {/* Track Mode */}
          {viewMode === 'track' && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f4f6',
                    borderTop: '5px solid #a855f7',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }} />
                  <p style={{ marginTop: '1rem', color: '#666' }}>Loading surprises...</p>
                </div>
              ) : selectedSurprise ? (
                /* Detailed View */
                <div>
                  <button
                    onClick={() => setSelectedSurprise(null)}
                    style={{
                      background: 'white',
                      color: '#a855f7',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      border: '2px solid #a855f7',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginBottom: '1.5rem'
                    }}
                  >
                    ← Back to All
                  </button>

                  <div style={{
                    background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                    padding: '2rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    border: '2px solid #f9a8d4'
                  }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#831843', marginBottom: '0.5rem' }}>
                      Surprise for {selectedSurprise.partnerName}
                    </h3>
                    <p style={{ color: '#9f1239', margin: 0, fontSize: '0.875rem' }}>
                      {new Date(selectedSurprise.dateTime).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Hints Progress */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                      Progressive Hints
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {selectedSurprise.hints.map((hint, index) => {
                        const isRevealed = index < selectedSurprise.revealedHints;
                        return (
                          <div
                            key={index}
                            style={{
                              background: isRevealed ? '#d1fae5' : '#f8f9fa',
                              padding: '1.5rem',
                              borderRadius: '12px',
                              border: isRevealed ? '2px solid #10b981' : '2px solid #e5e7eb',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold', color: isRevealed ? '#059669' : '#666' }}>
                                Hint {index + 1}
                              </span>
                              {isRevealed && (
                                <span style={{ fontSize: '1.5rem' }}>✓</span>
                              )}
                            </div>
                            <p style={{ 
                              margin: '0.5rem 0 0 0',
                              color: isRevealed ? '#047857' : '#999',
                              filter: isRevealed ? 'none' : 'blur(8px)',
                              fontSize: '1rem'
                            }}>
                              {hint}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {selectedSurprise.revealedHints < selectedSurprise.hints.length && (
                      <button
                        onClick={() => revealNextHint(selectedSurprise)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          marginTop: '1.5rem'
                        }}
                      >
                        🎉 Reveal Next Hint
                      </button>
                    )}
                  </div>
                </div>
              ) : surprises.length > 0 ? (
                /* List View */
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                    Your Surprise Dates
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {surprises.map((surprise) => (
                      <div
                        key={surprise.id}
                        style={{
                          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                          padding: '1.5rem',
                          borderRadius: '16px',
                          border: '2px solid #dee2e6',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedSurprise(surprise)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
                              Surprise for {surprise.partnerName}
                            </h4>
                            <p style={{ color: '#666', fontSize: '0.875rem', margin: 0 }}>
                              {new Date(surprise.dateTime).toLocaleDateString()}
                            </p>
                            <p style={{ 
                              color: surprise.status === 'completed' ? '#10b981' : '#f59e0b',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              marginTop: '0.5rem'
                            }}>
                              {surprise.revealedHints} / {surprise.hints.length} hints revealed
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSurprise(surprise.id);
                            }}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '8px',
                              width: '32px',
                              height: '32px',
                              cursor: 'pointer',
                              fontSize: '1.25rem',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#f8f9fa',
                  padding: '4rem 2rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '2px dashed #dee2e6'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    No Surprise Dates Yet
                  </h3>
                  <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem' }}>
                    Create your first surprise date to track it here!
                  </p>
                  <button
                    onClick={() => setViewMode('create')}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Create Surprise Date
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}