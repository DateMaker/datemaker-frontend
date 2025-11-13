import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function DateMemoryScrapbook({ currentUser, mode, dateToSave, selectedMemory, onClose }) {
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState([]);
  const [viewMode, setViewMode] = useState(mode || 'view');
  
  // Create mode states
  const [overallRating, setOverallRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [stopRatings, setStopRatings] = useState({});
  const [stopNotes, setStopNotes] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (viewMode === 'view') {
      loadMemories();
    }
  }, [currentUser, viewMode]);

  const loadMemories = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'dateMemories'),
        where('userId', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      const memoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bTime - aTime;
      });
      
      setMemories(memoriesData);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
    setLoading(false);
  };

  const handlePhotoUpload = (e, stopIndex = null) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 5000000) {
        alert('Photo must be under 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, {
          file,
          preview: reader.result,
          stopIndex
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const saveMemory = async () => {
    if (!currentUser || !dateToSave) {
      alert('No date to save');
      return;
    }
    
    setSaving(true);
    
    try {
      // Upload photos to Firebase Storage
      const uploadedPhotoUrls = await Promise.all(
        photos.map(async (photo) => {
          const timestamp = Date.now();
          const fileName = `${timestamp}_${photo.file.name}`;
          const storageRef = ref(storage, `dateMemories/${currentUser.uid}/${fileName}`);
          
          await uploadBytes(storageRef, photo.file);
          const url = await getDownloadURL(storageRef);
          
          return {
            url,
            stopIndex: photo.stopIndex
          };
        })
      );

      // Organize photos by stop
      const photosByStop = {};
      uploadedPhotoUrls.forEach(({ url, stopIndex }) => {
        if (stopIndex !== null) {
          if (!photosByStop[stopIndex]) {
            photosByStop[stopIndex] = [];
          }
          photosByStop[stopIndex].push(url);
        }
      });

      // Get general photos (not assigned to a stop)
      const generalPhotos = uploadedPhotoUrls
        .filter(p => p.stopIndex === null)
        .map(p => p.url);

      // Create memory document
      const memoryData = {
        userId: currentUser.uid,
        date: dateToSave.date || new Date().toISOString(),
        location: dateToSave.location || 'Unknown Location',
        stops: dateToSave.itinerary ? dateToSave.itinerary.stops.map((stop, index) => ({
          name: stop.place?.name || stop.name,
          category: stop.place?.category || stop.category,
          rating: stopRatings[index] || 0,
          notes: stopNotes[index] || '',
          photos: photosByStop[index] || [],
          time: stop.time || ''
        })) : [],
        overallRating,
        notes,
        generalPhotos,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'dateMemories'), memoryData);
      
      alert('🎉 Memory saved to your scrapbook!');
      setViewMode('view');
      loadMemories();
      
    } catch (error) {
      console.error('Error saving memory:', error);
      alert(`Failed to save memory: ${error.message}`);
    }
    
    setSaving(false);
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
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
          padding: '2rem',
          borderRadius: '24px 24px 0 0',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
              📸 Date Memory Scrapbook
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
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Mode: Create Memory */}
          {viewMode === 'create' && dateToSave ? (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
                padding: '2rem',
                borderRadius: '16px',
                marginBottom: '2rem',
                border: '2px solid #f9a8d4',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💕</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#831843', marginBottom: '0.5rem' }}>
                  Save Your Date Memory
                </h3>
                <p style={{ color: '#9f1239', fontSize: '1rem' }}>
                  Rate your experience, add photos, and capture the special moments
                </p>
              </div>

              {/* Overall Rating */}
              <div style={{ 
                marginBottom: '2rem',
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '16px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#374151'
                }}>
                  ⭐ Overall Date Rating
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setOverallRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '3rem',
                        padding: '0.5rem',
                        transition: 'transform 0.2s',
                        filter: star <= overallRating ? 'none' : 'grayscale(100%)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      {star <= overallRating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#374151'
                }}>
                  📸 Add Photos
                </label>
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, null)}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                
                <label
                  htmlFor="photo-upload"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}
                >
                  Choose Photos
                </label>

                {photos.length > 0 && (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    {photos.map((photo, index) => (
                      <div 
                        key={index}
                        style={{
                          position: 'relative',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        <img
                          src={photo.preview}
                          alt={`Upload ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover'
                          }}
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: 'rgba(220, 38, 38, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem',
                  color: '#374151'
                }}>
                  📝 Notes & Highlights
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What made this date special? Any funny moments, favorite places, or memorable experiences?"
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={saveMemory}
                disabled={saving}
                style={{
                  width: '100%',
                  background: saving 
                    ? '#d1d5db' 
                    : 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                  color: 'white',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  boxShadow: saving ? 'none' : '0 8px 20px rgba(236,72,153,0.4)',
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
                    Saving...
                  </>
                ) : (
                  <>💾 Save Memory</>
                )}
              </button>
            </div>
          ) : (
            /* Mode: View Memories */
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f4f6',
                    borderTop: '5px solid #ec4899',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }} />
                  <p style={{ marginTop: '1rem', color: '#666' }}>Loading memories...</p>
                </div>
              ) : memories.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {memories.map((memory) => (
                    <div
                      key={memory.id}
                      style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        padding: '2rem',
                        borderRadius: '20px',
                        border: '3px solid #fbbf24',
                        boxShadow: '0 10px 30px rgba(251,191,36,0.2)'
                      }}
                    >
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
                            {memory.location || 'Date Night'}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ fontSize: '1.25rem' }}>
                                {i < memory.overallRating ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p style={{ color: '#78350f', fontSize: '0.875rem', margin: 0 }}>
                          {new Date(memory.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      {memory.notes && (
                        <div style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '12px',
                          marginBottom: '1.5rem'
                        }}>
                          <p style={{ margin: 0, color: '#374151', lineHeight: 1.6 }}>
                            {memory.notes}
                          </p>
                        </div>
                      )}

                      {memory.generalPhotos && memory.generalPhotos.length > 0 && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1.5rem'
                        }}>
                          {memory.generalPhotos.map((photoUrl, index) => (
                            <img
                              key={index}
                              src={photoUrl}
                              alt={`Memory ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {memory.stops && memory.stops.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#92400e', marginBottom: '1rem' }}>
                            Stops Visited
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {memory.stops.map((stop, index) => (
                              <div
                                key={index}
                                style={{
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '12px'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <p style={{ fontWeight: 'bold', margin: 0 }}>{stop.name}</p>
                                  {stop.rating > 0 && (
                                    <div style={{ display: 'flex', gap: '0.125rem' }}>
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} style={{ fontSize: '0.875rem' }}>
                                          {i < stop.rating ? '⭐' : '☆'}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {stop.notes && (
                                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                                    {stop.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: '#f8f9fa',
                  padding: '4rem 2rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '2px dashed #dee2e6'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    No Memories Yet
                  </h3>
                  <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem' }}>
                    Complete dates to start building your scrapbook!
                  </p>
                  <button
                    onClick={onClose}
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Got It
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