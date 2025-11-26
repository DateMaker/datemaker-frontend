import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, Star, Trash2, Edit3, X, Check, Camera } from 'lucide-react';
import heic2any from 'heic2any';

// =====================================================
// CONVERT HEIC TO JPEG (for iPhone photos)
// =====================================================
const convertHeicToJpeg = async (file) => {
  // Check if it's a HEIC file
  const isHeic = file.type === 'image/heic' || 
                 file.type === 'image/heif' || 
                 file.name.toLowerCase().endsWith('.heic') ||
                 file.name.toLowerCase().endsWith('.heif');
  
  if (!isHeic) {
    console.log('📸 Not a HEIC file, no conversion needed');
    return file;
  }
  
  console.log('📸 Converting HEIC to JPEG...');
  
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85
    });
    
    // heic2any can return an array or single blob
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    // Create a new file with .jpg extension
    const newFileName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
    const convertedFile = new File([blob], newFileName, { type: 'image/jpeg' });
    
    console.log(`📸 HEIC converted: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(convertedFile.size / 1024 / 1024).toFixed(2)}MB`);
    
    return convertedFile;
  } catch (error) {
    console.error('📸 HEIC conversion failed:', error);
    // Return original file if conversion fails
    return file;
  }
};

export default function DateMemoryScrapbook({ currentUser, mode = 'view', dateToSave, onClose }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  
  // Create mode states
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (currentUser && mode === 'view') {
      loadMemories();
    } else {
      setLoading(false);
    }
  }, [currentUser, mode]);

  const loadMemories = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const memoriesRef = collection(db, 'dateMemories');
      const q = query(
        memoriesRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const memoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMemories(memoriesData);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
    setLoading(false);
  };

  // 📸 Compress image for iOS compatibility
  const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down if too large
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(`📸 Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    
    console.log(`📸 Selected photo: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    if (file.size > 15000000) {
      alert('Photo must be under 15MB');
      return;
    }
    
    try {
      setSaveStatus('Processing photo...');
      
      // Step 1: Convert HEIC to JPEG if needed (for iPhone photos)
      file = await convertHeicToJpeg(file);
      
      // Step 2: Compress the image for better iOS compatibility
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
      setSelectedPhoto(compressedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setSaveStatus('');
      };
      reader.readAsDataURL(compressedBlob);
    } catch (error) {
      console.error('Error processing photo:', error);
      // Fall back to original file
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setSaveStatus('');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMemory = async () => {
    if (!currentUser) {
      alert('No user logged in');
      return;
    }
    if (rating === 0) {
      alert('Please add a rating for your date!');
      return;
    }

    setSaving(true);
    setSaveStatus('Starting save...');
    
    try {
      let photoUrl = null;

      // 📸 IMPROVED iOS PHOTO UPLOAD
      if (selectedPhoto) {
        setSaveStatus('Uploading photo...');
        console.log('📸 Starting photo upload via backend...');
        console.log(`📸 Photo size: ${(selectedPhoto.size / 1024 / 1024).toFixed(2)}MB`);
        
        try {
          // Get auth token
          const token = await currentUser.getIdToken();
          
          // Convert photo to base64
          const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => {
              console.error('FileReader error:', err);
              reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(selectedPhoto);
          });
          
          console.log(`📸 Base64 length: ${base64Data.length} chars`);
          
          // Upload via backend API
          const apiUrl = process.env.REACT_APP_API_URL || 'https://datemaker-backend-1.onrender.com';
          console.log('📸 Uploading to:', `${apiUrl}/api/upload-photo`);
          
          // Use AbortController for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
          
          const response = await fetch(`${apiUrl}/api/upload-photo`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              photo: base64Data,
              fileName: selectedPhoto.name || 'photo.jpg'
            }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log('📸 Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('📸 Error response:', errorText);
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { error: errorText || 'Upload failed' };
            }
            throw new Error(errorData.error || `Upload failed with status ${response.status}`);
          }
          
          const result = await response.json();
          photoUrl = result.url;
          console.log('📸 Photo URL:', photoUrl);
          
        } catch (photoError) {
          console.error('❌ Photo upload failed:', photoError);
          console.error('❌ Error name:', photoError.name);
          console.error('❌ Error message:', photoError.message);
          
          let errorMessage = 'Photo upload failed.';
          if (photoError.name === 'AbortError') {
            errorMessage = 'Photo upload timed out. Try a smaller photo.';
          } else if (photoError.message) {
            errorMessage = `Photo upload failed: ${photoError.message}`;
          }
          
          if (!window.confirm(`${errorMessage}\n\nSave without photo?`)) {
            setSaving(false);
            setSaveStatus('');
            return;
          }
          photoUrl = null;
        }
      }

      setSaveStatus('Saving to database...');
      console.log('💾 Saving memory to Firestore...');

      // Prepare stops data safely
      let stops = [];
      try {
        if (dateToSave?.itinerary?.stops) {
          stops = dateToSave.itinerary.stops.map(stop => ({
            name: stop.place?.name || stop.title || 'Unknown',
            time: stop.time || ''
          }));
        }
      } catch (stopsError) {
        console.error('Error preparing stops:', stopsError);
        stops = [];
      }

      const memoryData = {
        userId: currentUser.uid,
        rating: rating,
        notes: notes || '',
        photoUrl: photoUrl,
        location: dateToSave?.location || 'Date Night',
        stops: stops,
        createdAt: serverTimestamp()
      };
      
      console.log('💾 Memory data:', memoryData);

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'dateMemories'), memoryData);
      console.log('✅ Memory saved with ID:', docRef.id);

      setSaveStatus('Done!');
      alert('✨ Memory saved to your scrapbook!');
      onClose();
    } catch (error) {
      console.error('❌ Error saving memory:', error);
      alert(`Failed to save memory: ${error.message}\n\nPlease try again.`);
    }
    setSaving(false);
    setSaveStatus('');
  };

  const deleteMemory = async (memoryId) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    
    try {
      await deleteDoc(doc(db, 'dateMemories', memoryId));
      setMemories(memories.filter(m => m.id !== memoryId));
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Failed to delete memory');
    }
  };

  const startEditing = (memory) => {
    setEditingId(memory.id);
    setEditNotes(memory.notes || '');
  };

  const saveEdit = async (memoryId) => {
    try {
      await updateDoc(doc(db, 'dateMemories', memoryId), {
        notes: editNotes
      });
      setMemories(memories.map(m => 
        m.id === memoryId ? { ...m, notes: editNotes } : m
      ));
      setEditingId(null);
      setEditNotes('');
    } catch (error) {
      console.error('Error updating memory:', error);
      alert('Failed to update memory');
    }
  };

  const renderStars = (currentRating, interactive = false) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 32 : 16}
            fill={star <= currentRating ? '#FFD700' : 'none'}
            stroke={star <= currentRating ? '#FFD700' : '#ccc'}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  if (!currentUser) return null;

  // CREATE MODE
  if (mode === 'create') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
        zIndex: 9999,
        overflow: 'auto',
        paddingTop: 'env(safe-area-inset-top)'
      }}>
        <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          {/* Header with prominent X button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              📸 Date Memory Scrapbook
            </h1>
            <button
              onClick={onClose}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                fontSize: '24px',
                fontWeight: '900',
                color: '#FF6B35',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>

          {/* Save Your Memory Card */}
          <div style={{
            background: '#FFF0F5',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.5rem',
            border: '3px solid #FFB6C1',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💕</div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#FF69B4',
              marginBottom: '0.5rem'
            }}>
              Save Your Date Memory
            </h2>
            <p style={{ color: '#FF69B4', fontSize: '0.95rem' }}>
              Rate your experience, add photos, and capture the special moments
            </p>
          </div>

          {/* Rating Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⭐ Overall Date Rating
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {renderStars(rating, true)}
            </div>
          </div>

          {/* Photo Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📷 Add Photos (Optional)
            </h3>
            
            {photoPreview ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    maxHeight: '250px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    setPhotoPreview(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: 'white',
                    lineHeight: 1
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  <Camera size={20} />
                  Choose Photos
                </label>
              </>
            )}
            
            {/* Show processing status */}
            {saveStatus && !saving && (
              <p style={{ 
                textAlign: 'center', 
                color: '#666', 
                marginTop: '0.5rem',
                fontSize: '0.875rem' 
              }}>
                {saveStatus}
              </p>
            )}
          </div>

          {/* Notes Section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📝 Notes (Optional)
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made this date special?"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                minHeight: '100px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveMemory}
            disabled={saving || rating === 0}
            style={{
              width: '100%',
              background: saving || rating === 0 
                ? '#ccc' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '1.25rem',
              borderRadius: '16px',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: saving || rating === 0 ? 'not-allowed' : 'pointer',
              boxShadow: saving || rating === 0 ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
              marginBottom: '1rem'
            }}
          >
            {saving ? `💾 ${saveStatus || 'Saving...'}` : '💾 Save Memory'}
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'transparent',
              color: 'white',
              padding: '1rem',
              borderRadius: '12px',
              border: '2px solid rgba(255,255,255,0.5)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Skip for Now
          </button>
        </div>
      </div>
    );
  }

  // VIEW MODE
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
      zIndex: 9999,
      overflow: 'auto',
      paddingTop: 'env(safe-area-inset-top)'
    }}>
      <div style={{ padding: '1rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={24} color="white" />
          </button>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            📸 Date Scrapbook
          </h1>
          <div style={{ width: '44px' }} />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid rgba(255,255,255,0.3)',
              borderTop: '5px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'white', marginTop: '1rem', fontWeight: '600' }}>
              Loading memories...
            </p>
          </div>
        ) : memories.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
              No Memories Yet
            </h3>
            <p style={{ color: '#666', fontSize: '1rem' }}>
              Complete dates and save them to build your scrapbook!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {memories.map((memory) => (
              <div
                key={memory.id}
                style={{
                  background: '#FFF9E6',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  border: '3px solid #FFE4B5'
                }}
              >
                {/* Memory Header */}
                <div style={{
                  padding: '1.5rem',
                  borderBottom: '2px solid #FFE4B5'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#333',
                        margin: 0
                      }}>
                        {memory.location || 'Date Night'}
                      </h3>
                      <p style={{
                        color: '#888',
                        fontSize: '0.875rem',
                        marginTop: '0.25rem'
                      }}>
                        {memory.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) || 'Date unknown'}
                      </p>
                    </div>
                    {renderStars(memory.rating || 0)}
                  </div>

                  {/* Notes */}
                  {editingId === memory.id ? (
                    <div style={{ marginTop: '1rem' }}>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          border: '2px solid #FFE4B5',
                          fontSize: '1rem',
                          minHeight: '80px',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Add notes about this date..."
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => saveEdit(memory.id)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: '600'
                          }}
                        >
                          <Check size={16} /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: '600'
                          }}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : memory.notes ? (
                    <div style={{
                      background: 'white',
                      padding: '1rem',
                      borderRadius: '12px',
                      marginTop: '1rem',
                      border: '1px solid #FFE4B5'
                    }}>
                      <p style={{ color: '#555', margin: 0, lineHeight: 1.6 }}>
                        {memory.notes}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Photo */}
                {memory.photoUrl && (
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <img
                      src={memory.photoUrl}
                      alt="Date memory"
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        maxHeight: '300px'
                      }}
                    />
                  </div>
                )}

                {/* Stops Visited */}
                {memory.stops && memory.stops.length > 0 && (
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#FF6B35',
                      marginBottom: '0.75rem'
                    }}>
                      Stops Visited
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {memory.stops.map((stop, index) => (
                        <div
                          key={index}
                          style={{
                            background: 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #FFE4B5',
                            fontSize: '0.875rem',
                            color: '#555'
                          }}
                        >
                          {stop.name || stop}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '1rem 1.5rem',
                  borderTop: '2px solid #FFE4B5',
                  background: 'rgba(255,255,255,0.5)'
                }}>
                  <button
                    onClick={() => startEditing(memory)}
                    style={{
                      flex: 1,
                      background: '#f0f0f0',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      color: '#555'
                    }}
                  >
                    <Edit3 size={18} /> Edit
                  </button>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    style={{
                      flex: 1,
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      color: '#dc2626'
                    }}
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            ))}
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