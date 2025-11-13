import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export default function DateStreaksGoals({ currentUser, streakData, onClose }) {
  const [loading, setLoading] = useState(true);
  const [localStreakData, setLocalStreakData] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  useEffect(() => {
    loadStreakData();
  }, [currentUser]);

  const loadStreakData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const streakRef = doc(db, 'dateStreaks', currentUser.uid);
      const streakDoc = await getDoc(streakRef);
      
      if (streakDoc.exists()) {
        setLocalStreakData(streakDoc.data());
      } else {
        // Initialize streak data
        const initialData = {
          currentStreak: 0,
          longestStreak: 0,
          totalDates: 0,
          lastDateWeek: null,
          badges: [],
          goals: [],
          weeklyChallenges: {}
        };
        await setDoc(streakRef, initialData);
        setLocalStreakData(initialData);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
      setLocalStreakData(streakData || {
        currentStreak: 0,
        longestStreak: 0,
        totalDates: 0,
        badges: [],
        goals: []
      });
    }
    setLoading(false);
  };

  const addGoal = async () => {
    if (!newGoalTitle.trim() || !newGoalTarget || !currentUser) {
      alert('Please fill in all fields');
      return;
    }

    const target = parseInt(newGoalTarget);
    if (isNaN(target) || target < 1) {
      alert('Please enter a valid target number');
      return;
    }

    try {
      const newGoal = {
        id: Date.now().toString(),
        title: newGoalTitle.trim(),
        target: target,
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString()
      };

      const updatedGoals = [...(localStreakData?.goals || []), newGoal];
      const streakRef = doc(db, 'dateStreaks', currentUser.uid);
      
      await updateDoc(streakRef, {
        goals: updatedGoals
      });

      setLocalStreakData({
        ...localStreakData,
        goals: updatedGoals
      });

      setNewGoalTitle('');
      setNewGoalTarget('');
      setShowAddGoal(false);
      alert('🎯 Goal added!');
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      const updatedGoals = localStreakData.goals.filter(g => g.id !== goalId);
      const streakRef = doc(db, 'dateStreaks', currentUser.uid);
      
      await updateDoc(streakRef, {
        goals: updatedGoals
      });

      setLocalStreakData({
        ...localStreakData,
        goals: updatedGoals
      });

      alert('Goal deleted');
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
    }
  };

  if (!currentUser) return null;

  const data = localStreakData || streakData || {
    currentStreak: 0,
    longestStreak: 0,
    totalDates: 0,
    badges: [],
    goals: []
  };

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
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
          padding: '2rem',
          borderRadius: '24px 24px 0 0',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
              🔥 Date Streaks & Goals
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f4f6',
                borderTop: '5px solid #FF6B35',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
              <p style={{ marginTop: '1rem', color: '#666' }}>Loading your stats...</p>
            </div>
          ) : (
            <>
              {/* Current Streak - Hero */}
              <div style={{
                background: 'linear-gradient(135deg, #FF6B3520 0%, #FF8C4210 100%)',
                padding: '3rem 2rem',
                borderRadius: '20px',
                marginBottom: '2rem',
                border: '3px solid #FF6B3540',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(255,107,53,0.2)'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔥</div>
                <h3 style={{ 
                  fontSize: '4rem', 
                  fontWeight: '900', 
                  color: '#FF6B35', 
                  margin: 0,
                  lineHeight: 1
                }}>
                  {data.currentStreak || 0}
                </h3>
                <p style={{ 
                  color: '#666', 
                  fontSize: '1.25rem', 
                  marginTop: '0.5rem',
                  fontWeight: '600'
                }}>
                  {data.currentStreak === 1 ? 'Day Streak' : 'Day Streak'}
                </p>
                <p style={{ 
                  color: '#999', 
                  fontSize: '0.875rem', 
                  marginTop: '1rem'
                }}>
                  Keep it going! Complete a date each week to maintain your streak
                </p>
              </div>

              {/* Stats Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  padding: '2rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '2px solid #dee2e6',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📅</div>
                  <p style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold', 
                    margin: 0,
                    color: '#FF6B35'
                  }}>
                    {data.totalDates || 0}
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#666', 
                    marginTop: '0.5rem',
                    fontWeight: '600'
                  }}>
                    Total Dates
                  </p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  padding: '2rem',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '2px solid #dee2e6',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏆</div>
                  <p style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold', 
                    margin: 0,
                    color: '#FFD700'
                  }}>
                    {data.longestStreak || 0}
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#666', 
                    marginTop: '0.5rem',
                    fontWeight: '600'
                  }}>
                    Longest Streak
                  </p>
                </div>
              </div>

              {/* Goals Section */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 'bold',
                    margin: 0,
                    color: '#111827'
                  }}>
                    🎯 Your Goals
                  </h3>
                  <button
                    onClick={() => setShowAddGoal(!showAddGoal)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                    }}
                  >
                    {showAddGoal ? '✕ Cancel' : '+ Add Goal'}
                  </button>
                </div>

                {/* Add Goal Form */}
                {showAddGoal && (
                  <div style={{
                    background: '#f0fdf4',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    marginBottom: '1.5rem',
                    border: '2px solid #86efac'
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: '#065f46'
                      }}>
                        Goal Title
                      </label>
                      <input
                        type="text"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="e.g., Complete 10 dates this month"
                        style={{
                          width: '100%',
                          padding: '0.875rem',
                          border: '2px solid #86efac',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                        color: '#065f46'
                      }}>
                        Target (number of dates)
                      </label>
                      <input
                        type="number"
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(e.target.value)}
                        placeholder="10"
                        min="1"
                        style={{
                          width: '100%',
                          padding: '0.875rem',
                          border: '2px solid #86efac',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <button
                      onClick={addGoal}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      Create Goal
                    </button>
                  </div>
                )}

                {/* Goals List */}
                {data.goals && data.goals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {data.goals.map((goal) => {
                      const progress = Math.min((goal.progress / goal.target) * 100, 100);
                      return (
                        <div 
                          key={goal.id}
                          style={{
                            background: goal.completed 
                              ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
                              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            padding: '1.75rem',
                            borderRadius: '16px',
                            border: goal.completed ? '2px solid #10b981' : '2px solid #dee2e6',
                            boxShadow: goal.completed ? '0 4px 20px rgba(16,185,129,0.2)' : 'none'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'start',
                            marginBottom: '1rem'
                          }}>
                            <h4 style={{ 
                              fontSize: '1.25rem', 
                              fontWeight: 'bold',
                              margin: 0,
                              textDecoration: goal.completed ? 'line-through' : 'none',
                              color: goal.completed ? '#059669' : '#111827',
                              flex: 1
                            }}>
                              {goal.title}
                            </h4>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {goal.completed && (
                                <span style={{ 
                                  fontSize: '1.5rem',
                                  filter: 'drop-shadow(0 2px 4px rgba(16,185,129,0.4))'
                                }}>
                                  ✓
                                </span>
                              )}
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                style={{
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: 'none',
                                  borderRadius: '8px',
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
                          </div>
                          
                          {/* Progress Bar */}
                          <div style={{ 
                            background: goal.completed ? '#10b98140' : 'rgba(0,0,0,0.1)', 
                            height: '12px', 
                            borderRadius: '6px',
                            overflow: 'hidden',
                            marginBottom: '0.75rem'
                          }}>
                            <div style={{
                              background: goal.completed 
                                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(90deg, #FF6B35 0%, #FF8C42 100%)',
                              height: '100%',
                              width: `${progress}%`,
                              transition: 'width 0.5s ease',
                              boxShadow: '0 2px 8px rgba(255,107,53,0.4)'
                            }} />
                          </div>
                          
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <p style={{ 
                              fontSize: '0.875rem', 
                              color: '#666',
                              margin: 0,
                              fontWeight: '600'
                            }}>
                              {goal.progress} / {goal.target} dates
                            </p>
                            <p style={{
                              fontSize: '0.875rem',
                              color: goal.completed ? '#059669' : '#FF6B35',
                              margin: 0,
                              fontWeight: 'bold'
                            }}>
                              {Math.round(progress)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    background: '#f8f9fa',
                    padding: '3rem 2rem',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '2px dashed #dee2e6'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                    <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '0.5rem', fontWeight: '600' }}>
                      No goals yet
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#999' }}>
                      Set your first goal to track your dating progress!
                    </p>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1.5rem',
                  color: '#111827'
                }}>
                  🏅 Badges & Achievements
                </h3>
                {data.badges && data.badges.length > 0 ? (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '1rem'
                  }}>
                    {data.badges.map((badge, index) => (
                      <div 
                        key={index}
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          padding: '1.5rem 1rem',
                          borderRadius: '16px',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 8px 20px rgba(255,215,0,0.4)',
                          textAlign: 'center',
                          fontSize: '0.875rem'
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                        {badge}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    background: '#f8f9fa',
                    padding: '3rem 2rem',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '2px dashed #dee2e6'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏅</div>
                    <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '0.5rem', fontWeight: '600' }}>
                      No badges yet
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#999' }}>
                      Complete dates to earn badges and achievements!
                    </p>
                  </div>
                )}
              </div>
            </>
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