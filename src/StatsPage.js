import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StatsDisplay from './StatsDisplay';

const StatsPage = () => {
  const navigate = useNavigate();
  const [gameStats, setGameStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        console.log('No user logged in, redirecting to home');
        navigate('/');
      } else {
        console.log('User logged in:', currentUser.uid);
        setUser(currentUser);
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up stats listener for user:', user.uid);
    
    // Real-time listener for user document - SAME PATH AS DATEMAKER
    // DateMaker stores stats at: users/{userId} in a field called 'gameStats'
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const stats = userData.gameStats || {
            xp: 0,
            datesCompleted: 0,
            challengesCompleted: 0,
            placesVisited: 0,
            photosShared: 0,
            currentStreak: 0,
            longestStreak: 0,
            achievements: [],
            stats: {
              foodVenues: 0,
              drinkVenues: 0,
              entertainment: 0,
              outdoor: 0,
              activities: 0
            }
          };
          console.log('✅ Stats loaded:', stats);
          setGameStats(stats);
        } else {
          console.log('⚠️ No user document found');
          setGameStats({
            xp: 0,
            datesCompleted: 0,
            challengesCompleted: 0,
            placesVisited: 0,
            photosShared: 0,
            currentStreak: 0,
            longestStreak: 0,
            achievements: [],
            stats: {}
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error loading stats:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>Loading Stats...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <StatsDisplay 
      gameStats={gameStats}
      onClose={() => navigate('/')}
    />
  );
};

export default StatsPage;