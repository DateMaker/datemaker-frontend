import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, Star, Trash2, Edit3, X, Check, Camera } from 'lucide-react';
import heic2any from 'heic2any';

// =====================================================
// CONVERT HEIC TO JPEG (for iPhone photos)
// =====================================================
const convertHeicToJpeg = async (file) => {
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
    
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    const newFileName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
    const convertedFile = new File([blob], newFileName, { type: 'image/jpeg' });
    
    console.log(`📸 HEIC converted: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(convertedFile.size / 1024 / 1024).toFixed(2)}MB`);
    
    return convertedFile;
  } catch (error) {
    console.error('📸 HEIC conversion failed:', error);
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
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
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
      
      file = await convertHeicToJpeg(file);
      
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
      setSelectedPhoto(compressedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setSaveStatus('');
      };
      reader.readAsDataURL(compressedBlob);
    } catch (error) {
      console.error('Error processing photo:', error);
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

      if (selectedPhoto) {
        setSaveStatus('Uploading photo...');
        console.log('📸 Starting photo upload via backend...');
        
        try {
          const token = await currentUser.getIdToken();
          
          const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => {
              console.error('FileReader error:', err);
              reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(selectedPhoto);
          });
          
          const apiUrl = process.env.REACT_APP_API_URL || 'https://datemaker-backend-1.onrender.com';
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);
          
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
          
          if (!response.ok) {
            const errorText = await response.text();
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
          
        } catch (photoError) {
          console.error('❌ Photo upload failed:', photoError);
          
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
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 36 : 20}
            fill={star <= currentRating ? '#FFD700' : 'none'}
            stroke={star <= currentRating ? '#FFD700' : '#ddd'}
            style={{ 
              cursor: interactive ? 'pointer' : 'default',
              filter: star <= currentRating ? 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.5))' : 'none'
            }}
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
        background: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)',
        zIndex: 9999,
        overflow: 'auto',
        paddingTop: 'env(safe-area-inset-top)'
      }}>
        {/* Floating emojis background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {['📸', '💕', '✨', '🧡', '📷', '🌟'].map((emoji, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${15 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                fontSize: '2rem',
                opacity: 0.15,
                animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        <div style={{ padding: '1.25rem', maxWidth: '500px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📸 Memory Scrapbook
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
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#f97316'
              }}
            >
              ✕
            </button>
          </div>

          {/* Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '1.5rem',
            border: '3px solid #fed7aa',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>💕</div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#ea580c',
              marginBottom: '0.5rem'
            }}>
              Save Your Date Memory
            </h2>
            <p style={{ color: '#c2410c', fontSize: '1rem', fontWeight: '500' }}>
              Capture the special moments forever
            </p>
          </div>

          {/* Rating Section */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⭐ Rate Your Date
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
              {renderStars(rating, true)}
            </div>
            {rating > 0 && (
              <p style={{ 
                textAlign: 'center', 
                color: '#f97316', 
                fontWeight: '600',
                marginTop: '0.75rem',
                fontSize: '0.95rem'
              }}>
                {rating === 5 ? '🎉 Perfect date!' : rating >= 4 ? '😊 Great date!' : rating >= 3 ? '👍 Good date!' : '💪 Room to improve!'}
              </p>
            )}
          </div>

          {/* Photo Section */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📷 Add a Photo
            </h3>
            
            {photoPreview ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    borderRadius: '16px',
                    maxHeight: '220px',
                    objectFit: 'cover',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
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
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    color: 'white'
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
                    gap: '0.75rem',
                    background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '1rem',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
                  }}
                >
                  <Camera size={22} />
                  Choose Photo
                </label>
                <p style={{ 
                  textAlign: 'center', 
                  color: '#9ca3af', 
                  fontSize: '0.85rem',
                  marginTop: '0.75rem'
                }}>
                  Optional - Add a favorite moment
                </p>
              </>
            )}
            
            {saveStatus && !saving && (
              <p style={{ 
                textAlign: 'center', 
                color: '#f97316', 
                marginTop: '0.75rem',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {saveStatus}
              </p>
            )}
          </div>

          {/* Notes Section */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📝 Add Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What made this date special? Any favorite moments?"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '14px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                minHeight: '100px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f97316'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveMemory}
            disabled={saving || rating === 0}
            style={{
              width: '100%',
              background: saving || rating === 0 
                ? '#d1d5db' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '1.25rem',
              borderRadius: '16px',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: saving || rating === 0 ? 'not-allowed' : 'pointer',
              boxShadow: saving || rating === 0 ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.35)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {saving ? `💾 ${saveStatus || 'Saving...'}` : '💾 Save Memory'}
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '1rem',
              borderRadius: '14px',
              border: '2px solid rgba(255,255,255,0.4)',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            Skip for Now
          </button>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
          }
        `}</style>
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
      background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
      zIndex: 9999,
      overflow: 'auto',
      paddingTop: 'env(safe-area-inset-top)'
    }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${1.5 + Math.random() * 2}rem`,
              opacity: 0.12,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {['📸', '💕', '✨', '🧡', '📷', '🌟', '💖', '🎉'][i]}
          </div>
        ))}
      </div>

      <div style={{ padding: '1.25rem', position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
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
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '14px',
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
            fontWeight: '800',
            color: 'white',
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📸 Date Scrapbook
          </h1>
          <div style={{ width: '50px' }} />
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
              width: '60px',
              height: '60px',
              border: '4px solid rgba(255,255,255,0.2)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '1.5rem', fontWeight: '600' }}>
              Loading memories...
            </p>
          </div>
        ) : memories.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)'
            }}>
              <Camera size={48} color="white" />
            </div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              marginBottom: '0.75rem',
              color: '#1f2937'
            }}>
              No Memories Yet
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '260px', margin: '0 auto' }}>
              Complete dates and save them to build your scrapbook!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
            {memories.map((memory) => (
              <div
                key={memory.id}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.15)'
                }}
              >
                {/* Memory Photo */}
                {memory.photoUrl && (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={memory.photoUrl}
                      alt="Date memory"
                      style={{
                        width: '100%',
                        height: '220px',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                      padding: '2rem 1.25rem 1rem'
                    }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: 'white',
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {memory.location || 'Date Night'}
                      </h3>
                    </div>
                  </div>
                )}

                {/* Memory Content */}
                <div style={{ padding: '1.25rem' }}>
                  {!memory.photoUrl && (
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: '#1f2937',
                      margin: '0 0 0.5rem'
                    }}>
                      {memory.location || 'Date Night'}
                    </h3>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.9rem',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {memory.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) || 'Date unknown'}
                    </p>
                    {renderStars(memory.rating || 0)}
                  </div>

                  {/* Notes */}
                  {editingId === memory.id ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.875rem',
                          borderRadius: '12px',
                          border: '2px solid #f97316',
                          fontSize: '1rem',
                          minHeight: '80px',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Add notes about this date..."
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button
                          onClick={() => saveEdit(memory.id)}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: '700'
                          }}
                        >
                          <Check size={18} /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            flex: 1,
                            background: '#f3f4f6',
                            color: '#6b7280',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: '700'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : memory.notes ? (
                    <div style={{
                      background: '#fff7ed',
                      padding: '1rem',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                      border: '1px solid #fed7aa'
                    }}>
                      <p style={{ color: '#9a3412', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{memory.notes}"
                      </p>
                    </div>
                  ) : null}

                  {/* Stops */}
                  {memory.stops && memory.stops.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: '#f97316',
                        marginBottom: '0.5rem'
                      }}>
                        📍 Places Visited
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {memory.stops.slice(0, 4).map((stop, index) => (
                          <span
                            key={index}
                            style={{
                              background: '#fff7ed',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              color: '#c2410c',
                              fontWeight: '600',
                              border: '1px solid #fed7aa'
                            }}
                          >
                            {stop.name || stop}
                          </span>
                        ))}
                        {memory.stops.length > 4 && (
                          <span style={{
                            background: '#f97316',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            +{memory.stops.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <button
                      onClick={() => startEditing(memory)}
                      style={{
                        flex: 1,
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: '700',
                        color: '#4b5563'
                      }}
                    >
                      <Edit3 size={18} /> Edit
                    </button>
                    <button
                      onClick={() => deleteMemory(memory.id)}
                      style={{
                        flex: 1,
                        background: '#fef2f2',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: '700',
                        color: '#dc2626'
                      }}
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </div>
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
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.12; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}