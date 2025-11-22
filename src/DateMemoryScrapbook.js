import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, Star, Trash2, Edit3, X, Check } from 'lucide-react';

export default function DateMemoryScrapbook({ currentUser, onClose }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMemories();
    }
  }, [currentUser]);

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

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? '#FFD700' : 'none'}
            stroke={star <= rating ? '#FFD700' : '#ccc'}
          />
        ))}
      </div>
    );
  };

  if (!currentUser) return null;

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
                          <X size={16} /> Cancel
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