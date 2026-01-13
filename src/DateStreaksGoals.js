import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Flame, Calendar, Trophy, Target, Plus, X, Sparkles } from 'lucide-react';

export default function DateStreaksGoals({ currentUser, streakData, onClose }) {
  const [loading, setLoading] = useState(true);
  const [localStreakData, setLocalStreakData] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, []);

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

    const target = parseInt(newGoalTarget.replace(/,/g, ''));
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
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      zIndex: 9999,
      overflow: 'auto',
      paddingTop: 'env(safe-area-inset-top)'
    }}>
      {/* Animated background elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(8)].map((_, i) => (
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
            {['🔥', '⭐', '💪', '🎯', '🏆', '💕'][Math.floor(Math.random() * 6)]}
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255, 107, 53, 0.4)'
            }}>
              <Flame size={28} color="white" />
            </div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: 'white',
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              Streaks & Goals
            </h1>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
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
              border: '4px solid rgba(255,255,255,0.1)',
              borderTop: '4px solid #ff6b35',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '1.5rem', fontWeight: '600' }}>
              Loading your stats...
            </p>
          </div>
        ) : (
          <>
            {/* Current Streak - Hero Card */}
            <div style={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffd93d 100%)',
              borderRadius: '28px',
              padding: '2.5rem 2rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(255, 107, 53, 0.4)'
            }}>
              {/* Decorative circles */}
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '50%'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }} />
              
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '0.5rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                🔥
              </div>
              <h3 style={{ 
                fontSize: '5rem', 
                fontWeight: '900', 
                color: 'white', 
                margin: 0,
                lineHeight: 1,
                textShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                {data.currentStreak || 0}
              </h3>
              <p style={{ 
                color: 'rgba(255,255,255,0.95)', 
                fontSize: '1.5rem', 
                marginTop: '0.5rem',
                fontWeight: '700',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}>
                Day Streak
              </p>
              <p style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.95rem', 
                marginTop: '1rem',
                maxWidth: '280px',
                margin: '1rem auto 0'
              }}>
                Complete a date each week to keep your streak alive! 💪
              </p>
            </div>

            {/* Stats Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {/* Total Dates */}
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '1.75rem 1.5rem',
                borderRadius: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
                }}>
                  <Calendar size={28} color="white" />
                </div>
                <p style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '900', 
                  margin: 0,
                  color: 'white'
                }}>
                  {data.totalDates || 0}
                </p>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'rgba(255,255,255,0.7)', 
                  marginTop: '0.5rem',
                  fontWeight: '600'
                }}>
                  Total Dates
                </p>
              </div>

              {/* Longest Streak */}
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '1.75rem 1.5rem',
                borderRadius: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  boxShadow: '0 8px 20px rgba(251, 191, 36, 0.4)'
                }}>
                  <Trophy size={28} color="white" />
                </div>
                <p style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '900', 
                  margin: 0,
                  color: 'white'
                }}>
                  {data.longestStreak || 0}
                </p>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'rgba(255,255,255,0.7)', 
                  marginTop: '0.5rem',
                  fontWeight: '600'
                }}>
                  Longest Streak
                </p>
              </div>
            </div>

            {/* Goals Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={24} color="#10b981" />
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700',
                    margin: 0,
                    color: 'white'
                  }}>
                    Your Goals
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddGoal(!showAddGoal)}
                  style={{
                    background: showAddGoal 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: showAddGoal ? 'none' : '0 4px 12px rgba(16,185,129,0.4)'
                  }}
                >
                  {showAddGoal ? <X size={18} /> : <Plus size={18} />}
                  {showAddGoal ? 'Cancel' : 'Add Goal'}
                </button>
              </div>

              {/* Add Goal Form */}
              {showAddGoal && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  backdropFilter: 'blur(10px)',
                  padding: '1.5rem',
                  borderRadius: '20px',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#34d399'
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
                        padding: '0.875rem 1rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: 'white'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#34d399'
                    }}>
                      Target (number of dates)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9,]*"
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                      placeholder="10"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: 'white'
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
                      fontWeight: '700',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    🎯 Create Goal
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
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)' 
                            : 'rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(10px)',
                          padding: '1.5rem',
                          borderRadius: '20px',
                          border: goal.completed 
                            ? '2px solid rgba(16, 185, 129, 0.5)' 
                            : '1px solid rgba(255,255,255,0.15)'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'start',
                          marginBottom: '1rem'
                        }}>
                          <h4 style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: '700',
                            margin: 0,
                            textDecoration: goal.completed ? 'line-through' : 'none',
                            color: goal.completed ? '#34d399' : 'white',
                            flex: 1,
                            paddingRight: '1rem'
                          }}>
                            {goal.completed && '✓ '}{goal.title}
                          </h4>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#f87171',
                              border: 'none',
                              borderRadius: '10px',
                              width: '36px',
                              height: '36px',
                              cursor: 'pointer',
                              fontSize: '1.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{ 
                          background: 'rgba(255,255,255,0.1)', 
                          height: '10px', 
                          borderRadius: '5px',
                          overflow: 'hidden',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{
                            background: goal.completed 
                              ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                              : 'linear-gradient(90deg, #ff6b35 0%, #ffd93d 100%)',
                            height: '100%',
                            width: `${progress}%`,
                            borderRadius: '5px',
                            transition: 'width 0.5s ease',
                            boxShadow: goal.completed 
                              ? '0 0 10px rgba(16, 185, 129, 0.5)'
                              : '0 0 10px rgba(255, 107, 53, 0.5)'
                          }} />
                        </div>
                        
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <p style={{ 
                            fontSize: '0.875rem', 
                            color: 'rgba(255,255,255,0.7)',
                            margin: 0,
                            fontWeight: '600'
                          }}>
                            {goal.progress} / {goal.target} dates
                          </p>
                          <p style={{
                            fontSize: '0.875rem',
                            color: goal.completed ? '#34d399' : '#ffd93d',
                            margin: 0,
                            fontWeight: '700'
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
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  padding: '3rem 2rem',
                  borderRadius: '20px',
                  textAlign: 'center',
                  border: '2px dashed rgba(255,255,255,0.2)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                  <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    No goals yet
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    Set your first goal to track your dating progress!
                  </p>
                </div>
              )}
            </div>

            {/* Badges */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Sparkles size={24} color="#fbbf24" />
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  margin: 0,
                  color: 'white'
                }}>
                  Badges & Achievements
                </h3>
              </div>
              
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
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        padding: '1.5rem 1rem',
                        borderRadius: '20px',
                        color: 'white',
                        fontWeight: '700',
                        boxShadow: '0 8px 25px rgba(251, 191, 36, 0.4)',
                        textAlign: 'center',
                        fontSize: '0.875rem'
                      }}
                    >
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
                      {badge}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  padding: '3rem 2rem',
                  borderRadius: '20px',
                  textAlign: 'center',
                  border: '2px dashed rgba(255,255,255,0.2)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏅</div>
                  <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontWeight: '600' }}>
                    No badges yet
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    Complete dates to earn badges and achievements!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}