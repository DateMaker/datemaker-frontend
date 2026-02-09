// ============================================
// 💜 LONG DISTANCE MODE - FIXED
// DateMaker - Virtual Date Ideas that SAVE properly
// ============================================

import React, { useState } from 'react';
import { 
  X, Heart, Video, Gamepad2, Film, Music, 
  BookOpen, Utensils, Moon, Sparkles, Clock,
  ChevronRight, Shuffle, Bookmark, Check, ExternalLink
} from 'lucide-react';
import HapticService from './HapticService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// 💜 LONG DISTANCE DATE IDEAS
// ============================================
export const LDR_DATE_IDEAS = {
  watch: {
    icon: '🎬',
    name: 'Watch Together',
    color: '#ef4444',
    description: 'Movies, shows, and live streams',
    ideas: [
      {
        id: 'movie-night',
        title: 'Movie Night',
        description: 'Watch the same movie together while video calling. Use Teleparty or Discord for synced viewing.',
        tools: ['Teleparty', 'Discord', 'Zoom'],
        tips: ['Pick the movie together beforehand', 'Make the same snacks', 'Dress up for "date night"'],
        duration: '2-3 hours'
      },
      {
        id: 'binge-series',
        title: 'Binge a Series',
        description: 'Start a new series together and make it "your show" - only watch it together!',
        tools: ['Teleparty', 'Hulu Watch Party', 'Amazon Watch Party'],
        tips: ['No spoilers!', 'Discuss theories after episodes', 'Create a watchlist together'],
        duration: '3-5 hours'
      },
      {
        id: 'youtube-rabbit-hole',
        title: 'YouTube Rabbit Hole',
        description: 'Take turns sharing YouTube videos and going down random rabbit holes together.',
        tools: ['Discord Screen Share', 'Watch2Gether'],
        tips: ['Set a theme each time', 'Share childhood favorites', 'Find hidden gems'],
        duration: '1-2 hours'
      },
      {
        id: 'live-concert',
        title: 'Virtual Concert',
        description: 'Watch a live stream concert or music festival together.',
        tools: ['YouTube Live', 'Twitch', 'StageIt'],
        tips: ['Find free live streams', 'Make it an event', 'Dance together on video'],
        duration: '1-3 hours'
      }
    ]
  },
  games: {
    icon: '🎮',
    name: 'Play Together',
    color: '#8b5cf6',
    description: 'Games and interactive fun',
    ideas: [
      {
        id: 'sip-and-spill',
        title: '🍷 Sip & Spill - Couples Game',
        description: 'Play bold, flirty drinking games designed for couples! Perfect for video call date nights with truth-twisting questions and spicy dares.',
        tools: ['Sip & Spill Game Deck', 'Video Call', 'Your favorite drinks'],
        tips: ['Visit sipandspill.co.uk for their online game deck', 'Keep drinks ready', 'Be honest and have fun!'],
        duration: '1-2 hours',
        externalLink: 'https://www.sipandspill.co.uk/gamedeck',
        partnerBadge: 'Featured Partner'
      },
      {
        id: 'online-games',
        title: 'Online Games',
        description: 'Play multiplayer games together - cooperative or competitive!',
        tools: ['Steam', 'Nintendo Switch Online', 'Mobile games'],
        tips: ['Try co-op games like It Takes Two', 'Play casual games like Among Us', 'Keep it fun, not too competitive'],
        duration: '1-3 hours',
        gamesSuggestions: ['It Takes Two', 'Stardew Valley', 'Overcooked', 'Among Us', 'Minecraft']
      },
      {
        id: 'board-games',
        title: 'Virtual Board Games',
        description: 'Play classic board games online together.',
        tools: ['Board Game Arena', 'Tabletop Simulator', 'Jackbox Games'],
        tips: ['Start with games you both know', 'Try new ones together', 'Make it a weekly thing'],
        duration: '1-2 hours',
        gamesSuggestions: ['Codenames', 'Ticket to Ride', 'Catan', 'Scrabble', 'Chess']
      },
      {
        id: 'trivia-night',
        title: 'Trivia Night',
        description: 'Test your knowledge together with online trivia.',
        tools: ['Sporcle', 'TriviaMaker', 'Kahoot'],
        tips: ['Make custom quizzes about each other', 'Join live trivia events', 'Keep score over time'],
        duration: '1-2 hours'
      },
      {
        id: 'video-game-date',
        title: 'Cozy Gaming Session',
        description: 'Play relaxing games side by side (even if different games) while on video call.',
        tools: ['Any games you enjoy', 'Discord', 'FaceTime'],
        tips: ['It\'s about being together, not the same game', 'Share what\'s happening', 'Enjoy the company'],
        duration: '2-4 hours'
      }
    ]
  },
  creative: {
    icon: '🎨',
    name: 'Create Together',
    color: '#22c55e',
    description: 'Arts, crafts, and creativity',
    ideas: [
      {
        id: 'draw-together',
        title: 'Draw Together',
        description: 'Use a shared canvas to draw together or play drawing games.',
        tools: ['Aggie.io', 'Gartic Phone', 'Skribbl.io'],
        tips: ['Try collaborative art', 'Play Pictionary-style games', 'Save your creations'],
        duration: '1-2 hours'
      },
      {
        id: 'craft-date',
        title: 'Craft Date',
        description: 'Buy the same craft supplies and make something together over video.',
        tools: ['Video call', 'Same craft supplies'],
        tips: ['Order supplies to each other\'s houses', 'Follow a YouTube tutorial together', 'Exchange finished products'],
        duration: '2-3 hours'
      },
      {
        id: 'playlist-making',
        title: 'Make a Playlist',
        description: 'Create a collaborative Spotify playlist with songs that remind you of each other.',
        tools: ['Spotify Collaborative Playlist'],
        tips: ['Add songs that tell your story', 'Include inside jokes', 'Listen together when done'],
        duration: '1 hour'
      },
      {
        id: 'write-together',
        title: 'Write Together',
        description: 'Collaborate on a story, write letters to each other, or journal together.',
        tools: ['Google Docs', 'Physical letters'],
        tips: ['Try a shared journal', 'Write a story taking turns', 'Send physical letters too'],
        duration: '1-2 hours'
      }
    ]
  },
  food: {
    icon: '🍽️',
    name: 'Eat Together',
    color: '#f59e0b',
    description: 'Cooking and dining virtually',
    ideas: [
      {
        id: 'cook-same-meal',
        title: 'Cook the Same Meal',
        description: 'Follow the same recipe and cook together over video, then eat together.',
        tools: ['Video call', 'Same recipe'],
        tips: ['Pick something you both can make', 'Shop together virtually', 'Set the table nicely'],
        duration: '2-3 hours'
      },
      {
        id: 'virtual-dinner-date',
        title: 'Virtual Dinner Date',
        description: 'Order from similar restaurants and have a dressed-up dinner date over video.',
        tools: ['Video call', 'Food delivery apps'],
        tips: ['Dress up!', 'Light candles', 'No phones at the table (except for the call)'],
        duration: '1-2 hours'
      },
      {
        id: 'breakfast-date',
        title: 'Morning Coffee Date',
        description: 'Start the day together with coffee/tea and breakfast over video.',
        tools: ['Video call'],
        tips: ['Great for different time zones', 'Make it a routine', 'Share your plans for the day'],
        duration: '30-60 min'
      },
      {
        id: 'baking-together',
        title: 'Baking Session',
        description: 'Bake the same recipe together and compare results.',
        tools: ['Video call', 'Same recipe & ingredients'],
        tips: ['Start simple', 'Laugh at the fails', 'Mail each other the results'],
        duration: '2-3 hours'
      }
    ]
  },
  romantic: {
    icon: '💕',
    name: 'Romance',
    color: '#ec4899',
    description: 'Intimate and meaningful moments',
    ideas: [
      {
        id: 'stargazing-call',
        title: 'Stargazing Together',
        description: 'Go outside and look at the same sky while on the phone.',
        tools: ['Phone call', 'Star map app'],
        tips: ['Find a dark spot', 'Learn constellations together', 'Remember you\'re under the same sky'],
        duration: '30-60 min'
      },
      {
        id: 'love-letters',
        title: 'Digital Love Letters',
        description: 'Write heartfelt emails or letters to each other to read later.',
        tools: ['Email', 'Letter-writing'],
        tips: ['Set a date to open them', 'Be vulnerable', 'Save them all'],
        duration: '30-60 min'
      },
      {
        id: 'memory-night',
        title: 'Memory Lane',
        description: 'Go through photos together and relive your favorite memories.',
        tools: ['Google Photos shared album', 'Video call'],
        tips: ['Make a slideshow', 'Share stories behind photos', 'Plan future memories'],
        duration: '1-2 hours'
      },
      {
        id: 'questions-game',
        title: '36 Questions',
        description: 'Ask and answer the famous 36 questions designed to create intimacy.',
        tools: ['Video call', 'Question list'],
        tips: ['Take your time', 'Be honest', 'Maintain eye contact'],
        duration: '1-2 hours'
      },
      {
        id: 'fall-asleep-together',
        title: 'Fall Asleep Together',
        description: 'Stay on the call while falling asleep - hear them breathe, feel less alone.',
        tools: ['Phone call or video'],
        tips: ['Use earbuds', 'Set a sleep timer if needed', 'Say goodnight properly'],
        duration: 'All night'
      }
    ]
  },
  adventure: {
    icon: '🌍',
    name: 'Virtual Adventures',
    color: '#06b6d4',
    description: 'Explore the world together',
    ideas: [
      {
        id: 'virtual-travel',
        title: 'Virtual Travel',
        description: 'Take a virtual tour of museums, cities, or landmarks together.',
        tools: ['Google Arts & Culture', 'YouTube VR tours'],
        tips: ['Plan your "dream trip"', 'Learn about the place', 'Add to your bucket list'],
        duration: '1-2 hours'
      },
      {
        id: 'google-earth-explore',
        title: 'Google Earth Date',
        description: 'Explore the world on Google Earth - visit your future home, travel spots, or random places.',
        tools: ['Google Earth'],
        tips: ['Visit places meaningful to you', 'Find your "someday" home', 'Explore somewhere random'],
        duration: '1-2 hours'
      },
      {
        id: 'workout-together',
        title: 'Workout Together',
        description: 'Do a workout video together over video call.',
        tools: ['YouTube fitness videos', 'Video call'],
        tips: ['Start with beginner workouts', 'Encourage each other', 'Cool down together'],
        duration: '30-60 min'
      },
      {
        id: 'learn-together',
        title: 'Learn Something New',
        description: 'Take an online course or watch educational content together.',
        tools: ['Coursera', 'YouTube', 'Skillshare'],
        tips: ['Pick something you both want to learn', 'Practice together', 'Celebrate progress'],
        duration: '1-2 hours'
      }
    ]
  }
};

// Get all ideas as flat array
export const getAllLDRIdeas = () => {
  const allIdeas = [];
  Object.entries(LDR_DATE_IDEAS).forEach(([category, data]) => {
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
export const getRandomLDRIdea = () => {
  const allIdeas = getAllLDRIdeas();
  return allIdeas[Math.floor(Math.random() * allIdeas.length)];
};

// ============================================
// 💜 LONG DISTANCE MODE COMPONENT
// ============================================
export default function LongDistanceMode({ 
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
    const idea = getRandomLDRIdea();
    setShuffledIdea(idea);
    setSelectedCategory(null);
    
    setTimeout(() => {
      const element = document.getElementById('ldr-shuffled-result');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Check if a date is already saved
  const isDateSaved = (ideaId) => {
    return savedDates?.some(d => d.place_id === `ldr_${ideaId}`);
  };

  // Save a LDR date to savedDates
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
        place_id: `ldr_${idea.id}`,
        name: idea.title,
        vicinity: idea.description,
        isLongDistance: true,
        category: idea.category || '',
        categoryName: idea.categoryName || '',
        categoryIcon: idea.categoryIcon || '💜',
        duration: idea.duration || '',
        savedAt: new Date().toISOString()
      };
      
      // Only add arrays if they exist
      if (idea.tools && idea.tools.length > 0) {
        dateToSave.tools = idea.tools;
      }
      if (idea.tips && idea.tips.length > 0) {
        dateToSave.tips = idea.tips;
      }
      if (idea.gamesSuggestions && idea.gamesSuggestions.length > 0) {
        dateToSave.gamesSuggestions = idea.gamesSuggestions;
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
      console.error('Error saving LDR date:', error);
      HapticService.notifyError();
      alert('Failed to save date. Please try again.');
    }

    setSaving(false);
  };

  // Premium gate
  if (!isPremium) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '60px',
            right: '1.5rem',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        <span style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💜</span>
        <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', textAlign: 'center' }}>
          Long Distance Mode
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', textAlign: 'center', marginBottom: '2rem', maxWidth: '300px' }}>
          Unlock special date ideas for couples who are apart with Premium!
        </p>
        <div style={{
          background: 'rgba(168, 85, 247, 0.2)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          maxWidth: '300px'
        }}>
          <p style={{ color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>✨ Premium includes:</p>
          <ul style={{ color: 'rgba(255,255,255,0.8)', margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li>Virtual date ideas</li>
            <li>Movie night sync</li>
            <li>Online games together</li>
            <li>Care package ideas</li>
          </ul>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '1rem 3rem',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.1rem',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)',
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
        background: 'rgba(26, 10, 46, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>💜</span>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
              Long Distance
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>
              Date ideas for couples apart
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
        {/* Info Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
          borderRadius: '16px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <Heart size={24} color="#ec4899" />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', lineHeight: 1.4 }}>
            Distance means nothing when someone means everything 💕
          </span>
        </div>

        {/* Shuffle Button */}
        <button
          onClick={handleShuffle}
          style={{
            width: '100%',
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
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
            Surprise Us! 🎲
          </span>
        </button>

        {/* Shuffled Result */}
        {shuffledIdea && (
          <div 
            id="ldr-shuffled-result"
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={14} color="rgba(255,255,255,0.5)" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{shuffledIdea.duration}</span>
            </div>

            {shuffledIdea.tools && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>SUGGESTED TOOLS:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {shuffledIdea.tools.map((tool, i) => (
                    <span key={i} style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.8)'
                    }}>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

            <button
              onClick={() => handleSaveDate(shuffledIdea)}
              disabled={saving || isDateSaved(shuffledIdea.id)}
              style={{
                width: '100%',
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
          </div>
        )}

        {/* Category Grid */}
        <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', margin: '0 0 1rem 0' }}>
          Browse by Category
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {Object.entries(LDR_DATE_IDEAS).map(([key, category]) => (
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
              color: LDR_DATE_IDEAS[selectedCategory].color, 
              fontSize: '1.1rem', 
              fontWeight: '700', 
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{LDR_DATE_IDEAS[selectedCategory].icon}</span>
              {LDR_DATE_IDEAS[selectedCategory].name}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {LDR_DATE_IDEAS[selectedCategory].ideas.map(idea => {
                const saved = isDateSaved(idea.id);
                
                return (
                  <button
                    key={idea.id}
                    onClick={() => {
                      HapticService.tapLight();
                      setSelectedIdea(selectedIdea?.id === idea.id ? null : {
                        ...idea,
                        category: selectedCategory,
                        categoryName: LDR_DATE_IDEAS[selectedCategory].name,
                        categoryIcon: LDR_DATE_IDEAS[selectedCategory].icon,
                        categoryColor: LDR_DATE_IDEAS[selectedCategory].color
                      });
                    }}
                    style={{
                      background: selectedIdea?.id === idea.id
                        ? `linear-gradient(135deg, ${LDR_DATE_IDEAS[selectedCategory].color}22, ${LDR_DATE_IDEAS[selectedCategory].color}11)`
                        : 'rgba(255,255,255,0.03)',
                      border: selectedIdea?.id === idea.id
                        ? `2px solid ${LDR_DATE_IDEAS[selectedCategory].color}`
                        : '2px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '1rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                            {idea.title}
                          </h3>
                          {idea.partnerBadge && (
                            <span style={{
                              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                              color: 'white',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.6rem',
                              fontWeight: '700',
                              textTransform: 'uppercase'
                            }}>
                              ⭐ {idea.partnerBadge}
                            </span>
                          )}
                        </div>
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
                        {/* Partner External Link */}
                        {idea.externalLink && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(idea.externalLink, '_blank');
                            }}
                            style={{
                              width: '100%',
                              padding: '0.875rem',
                              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                              border: 'none',
                              borderRadius: '12px',
                              color: 'white',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              marginBottom: '1rem'
                            }}
                          >
                            🎮 Play Now on Sip & Spill
                          </button>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <Clock size={14} color="rgba(255,255,255,0.5)" />
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{idea.duration}</span>
                        </div>

                        {idea.tools && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>SUGGESTED TOOLS:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {idea.tools.map((tool, i) => (
                                <span key={i} style={{
                                  background: 'rgba(255,255,255,0.1)',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  color: 'rgba(255,255,255,0.8)'
                                }}>
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {idea.gamesSuggestions && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>GAME SUGGESTIONS:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {idea.gamesSuggestions.map((game, i) => (
                                <span key={i} style={{
                                  background: 'rgba(139, 92, 246, 0.2)',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  color: '#a78bfa'
                                }}>
                                  🎮 {game}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

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

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveDate(selectedIdea);
                          }}
                          disabled={saving || saved}
                          style={{
                            width: '100%',
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