// ============================================
// 💸 ZERO DOLLAR DATE MODE - FIXED
// DateMaker - Free Date Ideas that SAVE properly
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  X, Heart, Sparkles, Sun, Moon, TreePine, 
  Camera, Music, Palette, Book, Star, MapPin, Clock,
  ChevronRight, Shuffle, Share2, Bookmark, Check
} from 'lucide-react';
import HapticService from './HapticService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// 🌟 FREE DATE IDEAS DATABASE
// ============================================
export const FREE_DATE_IDEAS = {
  outdoor: {
    icon: '🌳',
    name: 'Outdoor Adventures',
    color: '#22c55e',
    ideas: [
      {
        id: 'sunset-watch',
        title: 'Sunset Watching',
        description: 'Find the perfect spot to watch the sunset together. Bring a blanket and some homemade snacks.',
        duration: '1-2 hours',
        bestTime: 'Golden hour',
        tips: ['Check sunset time beforehand', 'Bring a blanket', 'Make it special with hot drinks from home'],
        mood: ['romantic', 'peaceful'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX4E3UdUs7fUx'
      },
      {
        id: 'stargazing',
        title: 'Stargazing Night',
        description: 'Lay under the stars and find constellations together. Download a star map app for extra fun.',
        duration: '1-3 hours',
        bestTime: 'Clear night, after 9pm',
        tips: ['Find a dark spot away from city lights', 'Bring blankets', 'Download Sky Map app'],
        mood: ['romantic', 'adventurous'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP'
      },
      {
        id: 'sunrise-hike',
        title: 'Sunrise Hike',
        description: 'Wake up early and catch the sunrise from a scenic viewpoint. Coffee in a thermos makes it perfect.',
        duration: '2-3 hours',
        bestTime: 'Before dawn',
        tips: ['Pack flashlights', 'Bring warm drinks', 'Check trail conditions'],
        mood: ['adventurous', 'energetic'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX0h0QnLkMBl4'
      },
      {
        id: 'beach-day',
        title: 'Beach/Lake Day',
        description: 'Pack sandwiches and spend the day by the water. Build sandcastles, swim, or just relax.',
        duration: '3-5 hours',
        bestTime: 'Morning or afternoon',
        tips: ['Pack sunscreen', 'Bring games like frisbee', 'Pack a picnic'],
        mood: ['relaxed', 'playful'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX2yvmlOdMYzV'
      },
      {
        id: 'park-picnic',
        title: 'Park Picnic',
        description: 'Pack homemade food, grab a blanket, and enjoy a leisurely picnic in your favorite park.',
        duration: '2-3 hours',
        bestTime: 'Afternoon',
        tips: ['Make sandwiches together', 'Bring a speaker for music', 'Pack fruit and cheese'],
        mood: ['romantic', 'relaxed'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX4wta20PHgwo'
      },
      {
        id: 'nature-walk',
        title: 'Nature Photo Walk',
        description: 'Explore local trails and challenge each other to take the best nature photos.',
        duration: '1-2 hours',
        bestTime: 'Morning light',
        tips: ['Use phone cameras', 'Look for unique angles', 'Share your favorites after'],
        mood: ['creative', 'adventurous'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DWZwtERXCS82H'
      }
    ]
  },
  athome: {
    icon: '🏠',
    name: 'Cozy At Home',
    color: '#f59e0b',
    ideas: [
      {
        id: 'movie-marathon',
        title: 'Movie Marathon',
        description: 'Pick a movie series or theme and have a cozy movie night with homemade popcorn.',
        duration: '3-6 hours',
        bestTime: 'Evening',
        tips: ['Make themed snacks', 'Build a blanket fort', 'Vote on movies together'],
        mood: ['relaxed', 'cozy'],
        spotifyPlaylist: null
      },
      {
        id: 'cook-together',
        title: 'Cook Something New',
        description: 'Find a recipe neither of you has tried and make it together. The mess is part of the fun!',
        duration: '1-2 hours',
        bestTime: 'Dinner time',
        tips: ['Pick something ambitious', 'Play music while cooking', 'Make it a competition'],
        mood: ['playful', 'creative'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX4xuWVBs4FgJ'
      },
      {
        id: 'spa-night',
        title: 'DIY Spa Night',
        description: 'Face masks, candles, relaxing music. Give each other massages and decompress together.',
        duration: '2-3 hours',
        bestTime: 'Evening',
        tips: ['Use items from your kitchen for masks', 'Light candles', 'Put phones away'],
        mood: ['romantic', 'relaxed'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u'
      },
      {
        id: 'game-night',
        title: 'Game Night',
        description: 'Board games, card games, or video games - whatever you enjoy! Make it competitive.',
        duration: '2-4 hours',
        bestTime: 'Evening',
        tips: ['Try a new game', 'Add fun stakes', 'Have snacks ready'],
        mood: ['playful', 'competitive'],
        spotifyPlaylist: null
      },
      {
        id: 'dance-party',
        title: 'Living Room Dance Party',
        description: 'Make a playlist and dance like nobody\'s watching. Learn a TikTok dance together!',
        duration: '1-2 hours',
        bestTime: 'Anytime',
        tips: ['Make a shared playlist', 'Look up dance tutorials', 'Push the furniture aside'],
        mood: ['energetic', 'playful'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC'
      },
      {
        id: 'puzzle-night',
        title: 'Puzzle Night',
        description: 'Work on a jigsaw puzzle together while chatting and sipping tea or wine.',
        duration: '2-4 hours',
        bestTime: 'Evening',
        tips: ['Pick 500-1000 pieces', 'Play background music', 'Snacks are essential'],
        mood: ['relaxed', 'focused'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn'
      }
    ]
  },
  creative: {
    icon: '🎨',
    name: 'Creative & Fun',
    color: '#8b5cf6',
    ideas: [
      {
        id: 'paint-night',
        title: 'Paint Night',
        description: 'Get some cheap canvases and paint supplies. Paint the same scene and compare results!',
        duration: '2-3 hours',
        bestTime: 'Evening',
        tips: ['YouTube painting tutorials help', 'Use acrylic paints', 'Don\'t judge each other\'s art!'],
        mood: ['creative', 'playful'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn'
      },
      {
        id: 'photo-shoot',
        title: 'Couple Photo Shoot',
        description: 'Style each other, find good lighting, and have your own photo shoot. Post the best ones!',
        duration: '1-2 hours',
        bestTime: 'Golden hour',
        tips: ['Use a phone tripod or timer', 'Try different locations', 'Be silly with it'],
        mood: ['creative', 'romantic'],
        spotifyPlaylist: null
      },
      {
        id: 'write-letters',
        title: 'Write Love Letters',
        description: 'Write heartfelt letters to each other and exchange them. Save them for years to come.',
        duration: '1-2 hours',
        bestTime: 'Anytime quiet',
        tips: ['Use nice paper', 'Be genuine', 'Seal with a kiss'],
        mood: ['romantic', 'thoughtful'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX4E3UdUs7fUx'
      },
      {
        id: 'learn-something',
        title: 'Learn Something Together',
        description: 'Pick a YouTube tutorial and learn something new together - origami, a language, etc.',
        duration: '1-3 hours',
        bestTime: 'Anytime',
        tips: ['Start with something easy', 'Be patient with each other', 'Celebrate progress'],
        mood: ['curious', 'playful'],
        spotifyPlaylist: null
      },
      {
        id: 'karaoke',
        title: 'Home Karaoke',
        description: 'Pull up karaoke versions on YouTube and belt out your favorite songs together.',
        duration: '1-2 hours',
        bestTime: 'Evening',
        tips: ['Make a duet playlist', 'Don\'t be shy', 'Record a few for memories'],
        mood: ['playful', 'energetic'],
        spotifyPlaylist: null
      }
    ]
  },
  active: {
    icon: '🏃',
    name: 'Active & Adventurous',
    color: '#ef4444',
    ideas: [
      {
        id: 'bike-ride',
        title: 'Bike Ride Adventure',
        description: 'Explore your neighborhood or find a scenic trail on two wheels.',
        duration: '1-3 hours',
        bestTime: 'Morning or late afternoon',
        tips: ['Check tire pressure', 'Bring water', 'Stop for photo ops'],
        mood: ['adventurous', 'energetic'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX0h0QnLkMBl4'
      },
      {
        id: 'workout-together',
        title: 'Partner Workout',
        description: 'Find a couples workout on YouTube and get fit together!',
        duration: '30-60 min',
        bestTime: 'Morning',
        tips: ['Try partner exercises', 'Don\'t compare abilities', 'Stretch together after'],
        mood: ['energetic', 'playful'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP'
      },
      {
        id: 'explore-neighborhood',
        title: 'Explore a New Neighborhood',
        description: 'Pick a part of your city you\'ve never been to and just wander.',
        duration: '2-4 hours',
        bestTime: 'Afternoon',
        tips: ['Take public transit for extra adventure', 'Look for hidden gems', 'Document your finds'],
        mood: ['adventurous', 'curious'],
        spotifyPlaylist: null
      },
      {
        id: 'sports-game',
        title: 'Play a Sport Together',
        description: 'Basketball, tennis, frisbee, or just throwing a ball around. Get competitive!',
        duration: '1-2 hours',
        bestTime: 'Afternoon',
        tips: ['Keep it light and fun', 'Don\'t be too competitive', 'Bring water'],
        mood: ['playful', 'energetic'],
        spotifyPlaylist: null
      },
      {
        id: 'yoga-sunset',
        title: 'Sunset Yoga',
        description: 'Find a quiet outdoor spot and do a YouTube yoga session together as the sun sets.',
        duration: '45-60 min',
        bestTime: 'Sunset',
        tips: ['Bring yoga mats or towels', 'Find a beginner video', 'Focus on breathing together'],
        mood: ['peaceful', 'romantic'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u'
      }
    ]
  },
  romantic: {
    icon: '💕',
    name: 'Extra Romantic',
    color: '#ec4899',
    ideas: [
      {
        id: 'memory-lane',
        title: 'Memory Lane Night',
        description: 'Go through old photos together, share memories, and reminisce about your journey.',
        duration: '1-2 hours',
        bestTime: 'Evening',
        tips: ['Make a photo album', 'Share stories behind photos', 'Get cozy'],
        mood: ['romantic', 'nostalgic'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX4E3UdUs7fUx'
      },
      {
        id: 'slow-dance',
        title: 'Slow Dance Night',
        description: 'Put on your favorite slow songs and dance in the living room. Eyes on each other.',
        duration: '30-60 min',
        bestTime: 'Evening',
        tips: ['Light candles', 'Dress up a little', 'Put phones away'],
        mood: ['romantic', 'intimate'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX4E3UdUs7fUx'
      },
      {
        id: 'questions-game',
        title: '36 Questions to Fall in Love',
        description: 'Take turns asking and answering the famous 36 questions designed to create intimacy.',
        duration: '1-2 hours',
        bestTime: 'Evening',
        tips: ['Google the questions', 'Be honest and vulnerable', 'Maintain eye contact'],
        mood: ['intimate', 'thoughtful'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn'
      },
      {
        id: 'candlelit-dinner',
        title: 'Candlelit Dinner',
        description: 'Cook together, set the table nicely, light candles. Make dinner feel special.',
        duration: '2-3 hours',
        bestTime: 'Evening',
        tips: ['Dress up for dinner', 'No phones at the table', 'Toast to something'],
        mood: ['romantic', 'elegant'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DX4xuWVBs4FgJ'
      },
      {
        id: 'bucket-list',
        title: 'Dream Together',
        description: 'Create a couples bucket list - places to go, things to try, dreams to chase.',
        duration: '1-2 hours',
        bestTime: 'Anytime',
        tips: ['Think big', 'Include silly items', 'Make it a living document'],
        mood: ['hopeful', 'intimate'],
        spotifyPlaylist: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn'
      }
    ]
  },
  social: {
    icon: '👥',
    name: 'Social & Community',
    color: '#06b6d4',
    ideas: [
      {
        id: 'volunteer',
        title: 'Volunteer Together',
        description: 'Find a local food bank, animal shelter, or community project to help together.',
        duration: '2-4 hours',
        bestTime: 'Weekend morning',
        tips: ['Sign up ahead of time', 'Wear comfortable clothes', 'Talk about the experience after'],
        mood: ['meaningful', 'connected'],
        spotifyPlaylist: null
      },
      {
        id: 'free-event',
        title: 'Free Local Event',
        description: 'Check local listings for free concerts, festivals, markets, or community events.',
        duration: '2-4 hours',
        bestTime: 'Varies',
        tips: ['Check Eventbrite free filter', 'Look at library events', 'Follow local Instagram pages'],
        mood: ['social', 'adventurous'],
        spotifyPlaylist: null
      },
      {
        id: 'dog-park',
        title: 'Dog Park Visit',
        description: 'Even if you don\'t have a dog, many parks are just fun to visit and pet other dogs!',
        duration: '1-2 hours',
        bestTime: 'Morning or late afternoon',
        tips: ['Ask before petting', 'Bring treats (ask owners first)', 'Just enjoy watching'],
        mood: ['playful', 'joyful'],
        spotifyPlaylist: null
      },
      {
        id: 'people-watching',
        title: 'People Watching Date',
        description: 'Grab coffee, find a busy spot, and make up stories about the people passing by.',
        duration: '1-2 hours',
        bestTime: 'Afternoon',
        tips: ['Be kind in your stories', 'Make it creative', 'Notice fashion and style'],
        mood: ['playful', 'creative'],
        spotifyPlaylist: null
      }
    ]
  }
};

// Get all ideas as flat array
export const getAllFreeIdeas = () => {
  const allIdeas = [];
  Object.entries(FREE_DATE_IDEAS).forEach(([category, data]) => {
    data.ideas.forEach(idea => {
      allIdeas.push({
        ...idea,
        category,
        categoryName: data.name,
        categoryIcon: data.icon,
        categoryColor: data.color
      });
    });
  });
  return allIdeas;
};

// Get random idea
export const getRandomFreeIdea = () => {
  const allIdeas = getAllFreeIdeas();
  return allIdeas[Math.floor(Math.random() * allIdeas.length)];
};

// ============================================
// 💸 FREE DATE MODE COMPONENT
// ============================================
export default function FreeDateMode({ 
  user, 
  onClose, 
  savedDates = [],
  setSavedDates,
  isPremium 
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [shuffledIdea, setShuffledIdea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(null);

  // Shuffle for a random date
  const handleShuffle = () => {
    HapticService.tapMedium();
    const idea = getRandomFreeIdea();
    setShuffledIdea(idea);
    setSelectedCategory(null);
    
    setTimeout(() => {
      const element = document.getElementById('shuffled-result');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Check if a date is already saved
  const isDateSaved = (ideaId) => {
    return savedDates?.some(d => d.place_id === `freedate_${ideaId}`);
  };

  // Save a free date to savedDates
  const handleSaveDate = async (idea) => {
    if (!user?.uid || !setSavedDates) {
      console.error('Cannot save: missing user or setSavedDates');
      return;
    }

    // Check if already saved
    if (isDateSaved(idea.id)) {
      HapticService.tapLight();
      alert('This date is already saved!');
      return;
    }

    setSaving(true);
    HapticService.tapMedium();

    try {
      // Create date object in savedDates format
      // Only include defined values (Firestore rejects undefined)
      const dateToSave = {
        place_id: `freedate_${idea.id}`,
        name: idea.title,
        vicinity: idea.description,
        isFreeDate: true,
        category: idea.category || '',
        categoryName: idea.categoryName || '',
        categoryIcon: idea.categoryIcon || '💸',
        duration: idea.duration || '',
        bestTime: idea.bestTime || '',
        savedAt: new Date().toISOString()
      };
      
      // Only add arrays/optional fields if they exist
      if (idea.tips && idea.tips.length > 0) {
        dateToSave.tips = idea.tips;
      }
      if (idea.mood && idea.mood.length > 0) {
        dateToSave.mood = idea.mood;
      }
      if (idea.spotifyPlaylist) {
        dateToSave.spotifyPlaylist = idea.spotifyPlaylist;
      }

      // Update local state
      const newSavedDates = [...savedDates, dateToSave];
      setSavedDates(newSavedDates);

      // Save to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { savedDates: newSavedDates }, { merge: true });

      HapticService.notifySuccess();
      setJustSaved(idea.id);
      
      // Reset justSaved after 2 seconds
      setTimeout(() => setJustSaved(null), 2000);

    } catch (error) {
      console.error('Error saving free date:', error);
      HapticService.notifyError();
      alert('Failed to save date. Please try again.');
    }

    setSaving(false);
  };

  // Open Spotify playlist
  const openSpotify = (url) => {
    if (url) {
      HapticService.tapLight();
      window.open(url, '_blank');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      zIndex: 10000,
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '60px 1.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>💸</span>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
              $0 Date Mode
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>
              No money? No problem!
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>
      </div>

      <div style={{ padding: '1rem 1.5rem 2rem' }}>
        {/* Shuffle Button */}
        <button
          onClick={handleShuffle}
          style={{
            width: '100%',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          <Shuffle size={24} color="white" />
          <span style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
            Surprise Me! 🎲
          </span>
        </button>

        {/* Shuffled Result */}
        {shuffledIdea && (
          <div 
            id="shuffled-result"
            style={{
              background: `linear-gradient(135deg, ${shuffledIdea.categoryColor}22, ${shuffledIdea.categoryColor}11)`,
              border: `2px solid ${shuffledIdea.categoryColor}`,
              borderRadius: '20px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{shuffledIdea.categoryIcon}</span>
              <span style={{ color: shuffledIdea.categoryColor, fontSize: '0.85rem', fontWeight: '600' }}>
                {shuffledIdea.categoryName}
              </span>
            </div>
            
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
              {shuffledIdea.title}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '1rem' }}>
              {shuffledIdea.description}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="rgba(255,255,255,0.5)" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{shuffledIdea.duration}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sun size={14} color="rgba(255,255,255,0.5)" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{shuffledIdea.bestTime}</span>
              </div>
            </div>

            {shuffledIdea.tips && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>TIPS:</div>
                {shuffledIdea.tips.map((tip, i) => (
                  <div key={i} style={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: '0.85rem',
                    paddingLeft: '0.75rem',
                    marginBottom: '0.25rem'
                  }}>
                    • {tip}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleSaveDate(shuffledIdea)}
                disabled={saving || isDateSaved(shuffledIdea.id)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: isDateSaved(shuffledIdea.id) || justSaved === shuffledIdea.id
                    ? '#22c55e'
                    : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '700',
                  cursor: saving || isDateSaved(shuffledIdea.id) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isDateSaved(shuffledIdea.id) || justSaved === shuffledIdea.id ? (
                  <><Check size={18} /> Saved!</>
                ) : saving ? (
                  'Saving...'
                ) : (
                  <><Bookmark size={18} /> Save This Date</>
                )}
              </button>
              
              {shuffledIdea.spotifyPlaylist && (
                <button
                  onClick={() => openSpotify(shuffledIdea.spotifyPlaylist)}
                  style={{
                    padding: '0.875rem 1rem',
                    background: '#1DB954',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Music size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Grid */}
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 1rem 0' }}>
          Browse by Category
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {Object.entries(FREE_DATE_IDEAS).map(([key, category]) => (
            <button
              key={key}
              onClick={() => {
                HapticService.tapLight();
                setSelectedCategory(selectedCategory === key ? null : key);
                setShuffledIdea(null);
              }}
              style={{
                background: selectedCategory === key 
                  ? `linear-gradient(135deg, ${category.color}33, ${category.color}22)`
                  : 'rgba(255,255,255,0.05)',
                border: selectedCategory === key 
                  ? `2px solid ${category.color}`
                  : '2px solid transparent',
                borderRadius: '16px',
                padding: '1rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>
                {category.icon}
              </span>
              <span style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>
                {category.name}
              </span>
              <span style={{ 
                display: 'block',
                color: 'rgba(255,255,255,0.5)', 
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {category.ideas.length} ideas
              </span>
            </button>
          ))}
        </div>

        {/* Category Ideas */}
        {selectedCategory && (
          <div>
            <h2 style={{ 
              color: FREE_DATE_IDEAS[selectedCategory].color, 
              fontSize: '1.1rem', 
              fontWeight: '700', 
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{FREE_DATE_IDEAS[selectedCategory].icon}</span>
              {FREE_DATE_IDEAS[selectedCategory].name}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {FREE_DATE_IDEAS[selectedCategory].ideas.map(idea => {
                const saved = isDateSaved(idea.id);
                
                return (
                  <button
                    key={idea.id}
                    onClick={() => {
                      HapticService.tapLight();
                      setSelectedIdea(selectedIdea?.id === idea.id ? null : {
                        ...idea,
                        category: selectedCategory,
                        categoryName: FREE_DATE_IDEAS[selectedCategory].name,
                        categoryIcon: FREE_DATE_IDEAS[selectedCategory].icon,
                        categoryColor: FREE_DATE_IDEAS[selectedCategory].color
                      });
                    }}
                    style={{
                      background: selectedIdea?.id === idea.id
                        ? `linear-gradient(135deg, ${FREE_DATE_IDEAS[selectedCategory].color}22, ${FREE_DATE_IDEAS[selectedCategory].color}11)`
                        : 'rgba(255,255,255,0.03)',
                      border: selectedIdea?.id === idea.id
                        ? `2px solid ${FREE_DATE_IDEAS[selectedCategory].color}`
                        : '2px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '1rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '700', margin: '0 0 0.35rem 0' }}>
                          {idea.title}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                          {idea.description}
                        </p>
                      </div>
                      {saved && (
                        <div style={{
                          background: '#22c55e',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginLeft: '0.5rem'
                        }}>
                          <Check size={14} color="white" />
                        </div>
                      )}
                    </div>

                    {selectedIdea?.id === idea.id && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={14} color="rgba(255,255,255,0.5)" />
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{idea.duration}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Sun size={14} color="rgba(255,255,255,0.5)" />
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{idea.bestTime}</span>
                          </div>
                        </div>

                        {idea.tips && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>TIPS:</div>
                            {idea.tips.map((tip, i) => (
                              <div key={i} style={{ 
                                color: 'rgba(255,255,255,0.7)', 
                                fontSize: '0.85rem',
                                paddingLeft: '0.75rem',
                                marginBottom: '0.25rem'
                              }}>
                                • {tip}
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveDate(selectedIdea);
                            }}
                            disabled={saving || saved}
                            style={{
                              flex: 1,
                              padding: '0.875rem',
                              background: saved || justSaved === idea.id
                                ? '#22c55e'
                                : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                              border: 'none',
                              borderRadius: '12px',
                              color: 'white',
                              fontWeight: '700',
                              cursor: saving || saved ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            {saved || justSaved === idea.id ? (
                              <><Check size={18} /> Saved!</>
                            ) : saving ? (
                              'Saving...'
                            ) : (
                              <><Bookmark size={18} /> Save This Date</>
                            )}
                          </button>
                          
                          {idea.spotifyPlaylist && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openSpotify(idea.spotifyPlaylist);
                              }}
                              style={{
                                padding: '0.875rem 1rem',
                                background: '#1DB954',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <Music size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}