// ============================================
// 🌟 EXPLORE SCREEN
// Full-page Venues & Events Discovery
// ============================================
// Features:
// ✅ Full Ticketmaster integration with real events
// ✅ TIERED ADVERTISING SYSTEM:
//    🌟 Spotlight (£149/mo) - 1-2 huge full-width cards
//    ⭐ Featured (£79/mo) - 3-5 horizontal carousel
//    🥇 Promoted (£29/mo) - Gold border in regular list
// ✅ Google Places integration for real venues
// ✅ Category filters
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Star, ExternalLink, Clock, ChevronRight, 
  ChevronLeft, TrendingUp, Filter, Search, X, Ticket,
  Music, Theater, Laugh, PartyPopper, Heart, Crown, Sparkles
} from 'lucide-react';
import HapticService from './HapticService';

// ============================================
// 🎫 EVENTS EXPLORER (TICKETMASTER)
// ============================================
export function EventsExplorer({ 
  onClose, 
  ticketmasterApiKey,
  userLocation 
}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userCountry, setUserCountry] = useState('GB'); // Default to UK

  const categories = [
    { id: 'all', name: 'All', icon: '🎫' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'arts', name: 'Theatre', icon: '🎭' },
    { id: 'comedy', name: 'Comedy', icon: '😂' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧' },
  ];

  // Hardcoded API key as fallback (your key)
  const API_KEY = ticketmasterApiKey || '4TC8sBi8MAc8HgdApni8w9Mh9N5jy6oM';

  // Detect user's country on mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [activeCategory, userCountry]);

  const detectUserLocation = async () => {
    try {
      // Try to get user's location
      if (userLocation?.lat && userLocation?.lng) {
        // Use reverse geocoding to get country
        // For now, default to GB if we have UK coordinates
        if (userLocation.lat > 49 && userLocation.lat < 61 && 
            userLocation.lng > -8 && userLocation.lng < 2) {
          setUserCountry('GB');
        }
      } else {
        // Try IP-based geolocation
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          if (data.country_code) {
            setUserCountry(data.country_code);
            console.log('Detected country:', data.country_code);
          }
        } catch (e) {
          console.log('Could not detect location, defaulting to GB');
          setUserCountry('GB');
        }
      }
    } catch (e) {
      setUserCountry('GB');
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build Ticketmaster API URL
      let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&size=30&sort=date,asc`;
      
      // Add country filter - this ensures UK users see UK events
      url += `&countryCode=${userCountry}`;
      
      // Add location if available for more local results
      if (userLocation?.lat && userLocation?.lng) {
        url += `&latlong=${userLocation.lat},${userLocation.lng}&radius=100&unit=miles`;
      }

      // Add category filter - this is the key part!
      if (activeCategory !== 'all') {
        const categoryMap = {
          'music': 'Music',
          'arts': 'Arts & Theatre',
          'comedy': 'Comedy',
          'sports': 'Sports',
          'family': 'Family'
        };
        const classificationName = categoryMap[activeCategory];
        if (classificationName) {
          url += `&classificationName=${encodeURIComponent(classificationName)}`;
        }
      }

      console.log('🎫 Fetching events:', url);
      const response = await fetch(url);
      const data = await response.json();

      if (data.fault) {
        console.error('Ticketmaster API error:', data.fault);
        setError('Unable to load events. Please try again.');
        setEvents([]);
        return;
      }

      if (data._embedded?.events) {
        const formattedEvents = data._embedded.events.map(event => ({
          id: event.id,
          name: event.name,
          date: event.dates?.start?.localDate,
          time: event.dates?.start?.localTime,
          venue: event._embedded?.venues?.[0]?.name || 'TBA',
          venueAddress: event._embedded?.venues?.[0]?.address?.line1 || '',
          city: event._embedded?.venues?.[0]?.city?.name || '',
          image: event.images?.find(img => img.ratio === '16_9' && img.width > 500)?.url || 
                 event.images?.find(img => img.ratio === '16_9')?.url || 
                 event.images?.[0]?.url,
          url: event.url,
          priceMin: event.priceRanges?.[0]?.min,
          priceMax: event.priceRanges?.[0]?.max,
          currency: event.priceRanges?.[0]?.currency || 'GBP',
          category: event.classifications?.[0]?.segment?.name || 'Event',
          genre: event.classifications?.[0]?.genre?.name || '',
        }));
        console.log(`✅ Found ${formattedEvents.length} events for ${activeCategory}`);
        setEvents(formattedEvents);
      } else {
        console.log('No events found for this category/location');
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Check your connection.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // 💰 TICKETMASTER AFFILIATE CONFIG
  // Sign up at: https://www.ticketmaster.co.uk/affiliate (UK) or https://www.ticketmaster.com/affiliate (US)
  // Once approved, replace these with your actual IDs:
  const AFFILIATE_ID = null; // Your Ticketmaster affiliate ID (e.g., '123456')
  const CAMPAIGN_ID = null;  // Your campaign ID (e.g., 'datemaker')

  const getAffiliateUrl = (eventUrl) => {
    if (!eventUrl) return null;
    
    // If affiliate IDs are set, append them to the URL
    if (AFFILIATE_ID) {
      const separator = eventUrl.includes('?') ? '&' : '?';
      let affiliateUrl = `${eventUrl}${separator}aid=${AFFILIATE_ID}`;
      if (CAMPAIGN_ID) {
        affiliateUrl += `&pid=${CAMPAIGN_ID}`;
      }
      // Add source tracking
      affiliateUrl += '&utm_source=datemaker&utm_medium=app&utm_campaign=events';
      return affiliateUrl;
    }
    
    return eventUrl;
  };

  const handleEventClick = (event) => {
    HapticService.tapMedium();
    if (event.url) {
      const url = getAffiliateUrl(event.url);
      console.log('🎫 Opening event:', url);
      window.open(url, '_blank');
    }
  };

  const filteredEvents = events.filter(event => 
    searchQuery === '' || 
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem',
        paddingTop: '3.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
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
            color: 'white', 
            fontSize: '1.5rem', 
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap'
          }}>
            <Calendar size={24} color="#a855f7" />
            Events Near You
          </h1>
          <div style={{ width: '48px' }} />
        </div>

        {/* Location Indicator - Now a Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <MapPin size={14} color="#a855f7" />
          <select
            value={userCountry}
            onChange={(e) => {
              HapticService.selectionChanged();
              setUserCountry(e.target.value);
            }}
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              color: '#a855f7',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="GB">🇬🇧 United Kingdom</option>
            <option value="US">🇺🇸 United States</option>
            <option value="CA">🇨🇦 Canada</option>
            <option value="AU">🇦🇺 Australia</option>
            <option value="DE">🇩🇪 Germany</option>
            <option value="FR">🇫🇷 France</option>
            <option value="ES">🇪🇸 Spain</option>
            <option value="IT">🇮🇹 Italy</option>
            <option value="NL">🇳🇱 Netherlands</option>
            <option value="IE">🇮🇪 Ireland</option>
            <option value="NZ">🇳🇿 New Zealand</option>
            <option value="MX">🇲🇽 Mexico</option>
          </select>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem'
        }}>
          <Search size={20} color="rgba(255,255,255,0.5)" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '1rem'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={18} color="rgba(255,255,255,0.5)" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                HapticService.selectionChanged();
                setActiveCategory(cat.id);
              }}
              style={{
                background: activeCategory === cat.id 
                  ? 'linear-gradient(135deg, #a855f7, #ec4899)' 
                  : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid rgba(168, 85, 247, 0.3)',
              borderTop: '3px solid #a855f7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Finding events near you...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={fetchEvents}
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</p>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>No events found. Try a different category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredEvents.map(event => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'transform 0.2s'
                }}
              >
                {/* Event Image */}
                <div style={{ 
                  height: '160px', 
                  position: 'relative',
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)'
                }}>
                  {event.image && (
                    <img 
                      src={event.image} 
                      alt={event.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  )}
                  {/* Category Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {event.genre || event.category}
                  </span>
                  {/* Price Badge */}
                  {event.priceMin && (
                    <span style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      From {event.currency === 'GBP' ? '£' : event.currency === 'EUR' ? '€' : '$'}{Math.round(event.priceMin)}
                    </span>
                  )}
                </div>

                {/* Event Info */}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.3
                  }}>
                    {event.name}
                  </h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Calendar size={16} color="#a855f7" />
                    <span style={{ color: '#a855f7', fontWeight: '600', fontSize: '0.9rem' }}>
                      {formatDate(event.date)}
                    </span>
                    {event.time && (
                      <>
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                          {formatTime(event.time)}
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem'
                  }}>
                    <MapPin size={16} color="rgba(255,255,255,0.5)" />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                      {event.venue}{event.city ? `, ${event.city}` : ''}
                    </span>
                  </div>

                  <button
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Ticket size={18} />
                    Get Tickets
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Powered by Ticketmaster */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.75rem'
        }}>
          Powered by Ticketmaster
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🏆 VENUES EXPLORER (Google Places + TIERED ADS)
// ============================================
export function VenuesExplorer({ 
  onClose, 
  userLocation,
  onVenueSelect 
}) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('restaurant');
  const [userCoords, setUserCoords] = useState(userLocation || null);
  const [locationError, setLocationError] = useState(null);
  const mapRef = useRef(null);
  const serviceRef = useRef(null);

  // Google Maps API Key (hardcoded as fallback)
  const GOOGLE_API_KEY = 'AIzaSyCKCweUu3EEWa8VfNZJ3I0druTc6u5gJKc';

  const categories = [
    { id: 'restaurant', name: 'Restaurants', icon: '🍽️', type: 'restaurant' },
    { id: 'bar', name: 'Bars', icon: '🍸', type: 'bar' },
    { id: 'cafe', name: 'Cafes', icon: '☕', type: 'cafe' },
    { id: 'park', name: 'Parks', icon: '🌳', type: 'park' },
    { id: 'museum', name: 'Museums', icon: '🏛️', type: 'museum' },
    { id: 'movie_theater', name: 'Cinema', icon: '🎬', type: 'movie_theater' },
    { id: 'gym', name: 'Gyms', icon: '💪', type: 'gym' },
  ];

  // ============================================
  // 💰 TIERED ADVERTISING SYSTEM
  // ============================================
  
  // 🌟 SPOTLIGHT VENUES (£149/month) - 1-2 max, huge full-width cards
  const spotlightVenues = [
    {
      id: 'spotlight1',
      name: 'Sky Garden',
      category: 'Restaurant & Bar',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      rating: 4.6,
      priceLevel: 3,
      address: '20 Fenchurch Street, London',
      tagline: 'London\'s highest public garden with breathtaking 360° views',
      description: 'Free entry • Rooftop dining • Sunset cocktails',
      bookingUrl: 'https://skygarden.london',
      placeId: 'ChIJVVVVVXkDdkgRTlM5XCuAG-A',
      tier: 'spotlight'
    }
  ];

  // ⭐ FEATURED VENUES (£79/month) - 3-5 max, horizontal carousel  
  const featuredVenues = [
    {
      id: 'featured1',
      name: 'Aqua Shard',
      category: 'Fine Dining',
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80',
      rating: 4.5,
      priceLevel: 3,
      address: 'The Shard, London Bridge',
      tagline: '31st floor panoramic views',
      bookingUrl: 'https://aquashard.co.uk',
      placeId: 'ChIJt2BwZIEFdkgRDVzFWHCnKAM',
      tier: 'featured'
    },
    {
      id: 'featured2',
      name: 'Duck & Waffle',
      category: 'Restaurant',
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80',
      rating: 4.4,
      priceLevel: 3,
      address: 'Heron Tower, Liverpool St',
      tagline: '24/7 dining with city views',
      bookingUrl: 'https://duckandwaffle.com',
      placeId: 'ChIJXXXXXXXXXXX',
      tier: 'featured'
    },
    {
      id: 'featured3',
      name: 'Nightjar',
      category: 'Cocktail Bar',
      image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80',
      rating: 4.7,
      priceLevel: 3,
      address: 'Old Street, London',
      tagline: 'Award-winning speakeasy',
      bookingUrl: 'https://duckandwaffle.com',
      placeId: 'ChIJYYYYYYYYYYY',
      tier: 'featured'
    }
  ];

  // 🥇 PROMOTED VENUES (£29/month) - Only show in restaurant category
  const promotedVenues = activeCategory !== 'restaurant' ? [] : [
    {
      id: 'promoted1',
      name: 'Dishoom',
      category: 'Indian Restaurant',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
      rating: 4.7,
      priceLevel: 2,
      address: 'Covent Garden, London',
      tagline: 'Bombay-style comfort food',
      bookingUrl: 'https://dishoom.com',
      tier: 'promoted'
    },
    {
      id: 'promoted2',
      name: 'Hawksmoor',
      category: 'Steakhouse',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
      rating: 4.6,
      priceLevel: 3,
      address: 'Seven Dials, London',
      tagline: 'Best steak in town',
      bookingUrl: 'https://thehawksmoor.com',
      tier: 'promoted'
    }
  ];

  // Get user's location on mount
  useEffect(() => {
    if (!userCoords) {
      getUserLocation();
    }
  }, []);

  // Load Google Maps script and fetch venues when location is available
  useEffect(() => {
    if (userCoords) {
      loadGoogleMapsAndFetch();
    }
  }, [userCoords, activeCategory]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('📍 Got user location:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Could not get your location. Using London as default.');
          // Default to London
          setUserCoords({ lat: 51.5074, lng: -0.1278 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocation not supported. Using London as default.');
      setUserCoords({ lat: 51.5074, lng: -0.1278 });
    }
  };

  const loadGoogleMapsAndFetch = async () => {
    setLoading(true);

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      fetchRealVenues();
      return;
    }

    // Load Google Maps script
    const existingScript = document.getElementById('google-maps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        console.log('✅ Google Maps loaded');
        fetchRealVenues();
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps');
        setSampleVenues();
      };
      document.head.appendChild(script);
    } else {
      // Script exists, wait a bit for it to load
      setTimeout(() => {
        if (window.google && window.google.maps) {
          fetchRealVenues();
        } else {
          setSampleVenues();
        }
      }, 1000);
    }
  };

  const fetchRealVenues = () => {
    if (!window.google || !window.google.maps || !userCoords) {
      setSampleVenues();
      return;
    }

    // Create a hidden map element for PlacesService
    if (!mapRef.current) {
      const mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      mapRef.current = new window.google.maps.Map(mapDiv, {
        center: userCoords,
        zoom: 15
      });
    }

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    
    const category = categories.find(c => c.id === activeCategory);
    
    const request = {
      location: new window.google.maps.LatLng(userCoords.lat, userCoords.lng),
      radius: 5000, // 5km
      type: category?.type || 'restaurant'
    };

    console.log('🔍 Searching for:', category?.type, 'near', userCoords);

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const formattedVenues = results.slice(0, 15).map(place => ({
          id: place.place_id,
          placeId: place.place_id,
          name: place.name,
          rating: place.rating || 0,
          userRatingsTotal: place.user_ratings_total || 0,
          priceLevel: place.price_level || 0,
          address: place.vicinity || place.formatted_address || '',
          image: place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 }) || 
                 `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80`,
          isOpen: place.opening_hours?.isOpen?.() ?? null,
          types: place.types || [],
          location: {
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng()
          },
          tier: 'regular' // Regular free listings
        }));

        console.log(`✅ Found ${formattedVenues.length} real venues`);
        setVenues(formattedVenues);
      } else {
        console.log('No venues found, using samples');
        setSampleVenues();
      }
      setLoading(false);
    });
  };

  const setSampleVenues = () => {
    const samplesByCategory = {
      restaurant: [
        { id: 'r1', name: 'Local Italian', rating: 4.5, priceLevel: 2, address: 'High Street', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', tier: 'regular' },
        { id: 'r2', name: 'Thai Garden', rating: 4.3, priceLevel: 2, address: 'Main Road', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', tier: 'regular' },
        { id: 'r3', name: 'Burger Joint', rating: 4.4, priceLevel: 1, address: 'Market Square', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', tier: 'regular' },
      ],
      bar: [
        { id: 'b1', name: 'Craft Beer Co', rating: 4.6, priceLevel: 2, address: 'Old Town', image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80', tier: 'regular' },
        { id: 'b2', name: 'Cocktail Lounge', rating: 4.5, priceLevel: 3, address: 'City Centre', image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80', tier: 'regular' },
      ],
      cafe: [
        { id: 'c1', name: 'Artisan Coffee', rating: 4.7, priceLevel: 1, address: 'Station Road', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80', tier: 'regular' },
        { id: 'c2', name: 'Brunch Spot', rating: 4.4, priceLevel: 2, address: 'Park Lane', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80', tier: 'regular' },
      ],
      park: [
        { id: 'p1', name: 'Central Park', rating: 4.8, priceLevel: 0, address: 'City Centre', image: 'https://images.unsplash.com/photo-1585938389612-a552a28c6914?w=400&q=80', tier: 'regular' },
      ],
      museum: [
        { id: 'm1', name: 'Local History Museum', rating: 4.6, priceLevel: 0, address: 'Museum Road', image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&q=80', tier: 'regular' },
      ],
      movie_theater: [
        { id: 'mt1', name: 'Cinema Plus', rating: 4.5, priceLevel: 2, address: 'Shopping Centre', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80', tier: 'regular' },
      ]
    };
    setVenues(samplesByCategory[activeCategory] || []);
    setLoading(false);
  };

  const getPriceString = (level) => '£'.repeat(level || 1);

  const handleVenueClick = (venue) => {
    HapticService.tapMedium();
    if (venue.bookingUrl) {
      window.open(venue.bookingUrl, '_blank');
    } else if (venue.placeId) {
      // Open Google Maps with place ID
      window.open(`https://www.google.com/maps/place/?q=place_id:${venue.placeId}`, '_blank');
    } else {
      // Open Google Maps search for the venue
      const searchQuery = encodeURIComponent(`${venue.name} ${venue.address || ''}`);
      window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
    }
  };

  // Mix promoted venues into regular venues list
  const getMixedVenuesList = () => {
    const mixed = [...venues];
    // Insert promoted venues at positions 2 and 5
    promotedVenues.forEach((promo, index) => {
      const insertPosition = index === 0 ? 2 : 5;
      if (insertPosition < mixed.length) {
        mixed.splice(insertPosition, 0, promo);
      } else {
        mixed.push(promo);
      }
    });
    return mixed;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem',
        paddingTop: '3.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={24} color="white" />
          </button>
          <h1 style={{ 
            color: 'white', 
            fontSize: '1.5rem', 
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <TrendingUp size={24} color="#f59e0b" />
            Top Venues
          </h1>
          <div style={{ width: '48px' }} />
        </div>

        {/* Location Indicator */}
        {userCoords && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.4rem 1rem',
            background: 'rgba(16, 185, 129, 0.15)',
            borderRadius: '20px',
            width: 'fit-content',
            margin: '0 auto 1rem auto'
          }}>
            <MapPin size={14} color="#10b981" />
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
              📍 Showing venues near you
            </span>
          </div>
        )}

        {locationError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{locationError}</span>
          </div>
        )}

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                HapticService.selectionChanged();
                setActiveCategory(cat.id);
              }}
              style={{
                background: activeCategory === cat.id 
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                  : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        
        {/* ============================================ */}
        {/* 🌟 SPOTLIGHT SECTION (£149/month) */}
        {/* ============================================ */}
        {spotlightVenues.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <Crown size={20} color="#fbbf24" />
              <h2 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                Spotlight
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#1a1a2e',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.6rem',
                fontWeight: '800'
              }}>
                PREMIUM
              </span>
            </div>
            
            {spotlightVenues.map(venue => (
              <div
                key={venue.id}
                onClick={() => handleVenueClick(venue)}
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
                  boxShadow: '0 0 30px rgba(251, 191, 36, 0.2)',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ height: '200px', position: 'relative' }}>
                  <img src={venue.image} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '2rem 1rem 1rem'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: '#1a1a2e',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      marginBottom: '0.5rem',
                      display: 'inline-block'
                    }}>
                      🌟 SPOTLIGHT
                    </span>
                    <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: '800', margin: '0.5rem 0 0.25rem' }}>
                      {venue.name}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0 }}>
                      {venue.tagline}
                    </p>
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ color: '#fbbf24', fontWeight: '700' }}>{venue.rating}</span>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>{getPriceString(venue.priceLevel)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{venue.category}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                    {venue.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={14} color="rgba(255,255,255,0.5)" />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{venue.address}</span>
                  </div>
                  <button
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.875rem',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#1a1a2e',
                      fontWeight: '800',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Sparkles size={18} />
                    View & Book
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================ */}
        {/* ⭐ FEATURED SECTION (£79/month) */}
        {/* ============================================ */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={18} color="#f59e0b" />
              <h2 style={{ color: 'white', fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                Featured Venues
              </h2>
            </div>
            <span style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.65rem',
              fontWeight: '700'
            }}>
              SPONSORED
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {featuredVenues.map(venue => (
              <div
                key={venue.id}
                onClick={() => handleVenueClick(venue)}
                style={{
                  minWidth: '240px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div style={{ height: '120px', position: 'relative' }}>
                  <img src={venue.image} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.6rem',
                    fontWeight: '700'
                  }}>
                    ⭐ FEATURED
                  </span>
                </div>
                <div style={{ padding: '0.875rem' }}>
                  <h3 style={{ color: 'white', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
                    {venue.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Star size={12} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ color: '#fbbf24', fontWeight: '600', fontSize: '0.8rem' }}>{venue.rating}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                    <span style={{ color: '#10b981', fontSize: '0.8rem' }}>{getPriceString(venue.priceLevel)}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>
                    {venue.tagline}
                  </p>
                  {venue.bookingUrl && (
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(venue.bookingUrl, '_blank'); }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      Book Now →
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Advertise CTA */}
            <div
              onClick={() => window.open('mailto:thedatemakerapp@outlook.com?subject=Featured Venue Inquiry - £79/month', '_blank')}
              style={{
                minWidth: '180px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '2px dashed rgba(245, 158, 11, 0.3)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem 1rem',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</span>
              <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Your Venue Here
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                From £79/month
              </span>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* 🥇 REGULAR + PROMOTED VENUES LIST */}
        {/* ============================================ */}
        <h2 style={{ 
          color: 'white', 
          fontSize: '1.1rem', 
          fontWeight: '700', 
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {categories.find(c => c.id === activeCategory)?.icon} {categories.find(c => c.id === activeCategory)?.name}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(245, 158, 11, 0.3)',
              borderTop: '3px solid #f59e0b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem', fontSize: '0.9rem' }}>
              Finding venues near you...
            </p>
          </div>
        ) : venues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</p>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>No venues found nearby. Try a different category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {getMixedVenuesList().map((venue, index) => {
              const isPromoted = venue.tier === 'promoted';
              
              return (
                <div
                  key={venue.id}
                  onClick={() => handleVenueClick(venue)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem',
                    background: isPromoted 
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))'
                      : 'rgba(255,255,255,0.05)',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    border: isPromoted 
                      ? '2px solid rgba(251, 191, 36, 0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isPromoted ? '0 0 15px rgba(251, 191, 36, 0.15)' : 'none',
                    position: 'relative'
                  }}
                >
                  {/* 🥇 PROMOTED Badge */}
                  {isPromoted && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '1rem',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: '#1a1a2e',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: '800'
                    }}>
                      🥇 PROMOTED
                    </span>
                  )}
                  
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                    border: isPromoted ? '2px solid rgba(251, 191, 36, 0.3)' : 'none'
                  }}>
                    <img src={venue.image} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {venue.isOpen !== null && !isPromoted && (
                      <span style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        background: venue.isOpen ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.6rem',
                        fontWeight: '700'
                      }}>
                        {venue.isOpen ? 'OPEN' : 'CLOSED'}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: isPromoted ? '#fbbf24' : 'white', 
                      fontSize: '1rem', 
                      fontWeight: '700', 
                      margin: '0 0 0.25rem 0' 
                    }}>
                      {venue.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ color: '#fbbf24', fontWeight: '600', fontSize: '0.85rem' }}>
                        {venue.rating ? venue.rating.toFixed(1) : 'N/A'}
                      </span>
                      {venue.userRatingsTotal > 0 && (
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                          ({venue.userRatingsTotal.toLocaleString()})
                        </span>
                      )}
                      {venue.priceLevel > 0 && (
                        <>
                          <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
                          <span style={{ color: '#10b981', fontSize: '0.85rem' }}>{getPriceString(venue.priceLevel)}</span>
                        </>
                      )}
                    </div>
                    {/* Show tagline for promoted venues */}
                    {isPromoted && venue.tagline && (
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', margin: '0.25rem 0', fontStyle: 'italic' }}>
                        "{venue.tagline}"
                      </p>
                    )}
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0 }}>
                      {venue.address}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    {isPromoted ? (
                      <ExternalLink size={18} color="#fbbf24" />
                    ) : (
                      <MapPin size={18} color="#a855f7" />
                    )}
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
                      {isPromoted ? 'Book' : 'Maps'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Advertise Your Venue CTA */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15))',
          borderRadius: '16px',
          border: '2px dashed rgba(168, 85, 247, 0.3)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            📣 Advertise Your Venue
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Click get started to find out more details
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600' }}>
              🌟 Spotlight
            </span>
            <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600' }}>
              ⭐ Featured
            </span>
            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600' }}>
              🥇 Promoted
            </span>
          </div>
          <button
            onClick={() => window.open('mailto:thedatemakerapp@outlook.com?subject=Venue Advertising Inquiry', '_blank')}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}

// Sample events for fallback
const SAMPLE_EVENTS = [
  {
    id: 'sample1',
    name: 'Live Jazz Night',
    date: new Date().toISOString().split('T')[0],
    time: '20:00:00',
    venue: 'Ronnie Scott\'s Jazz Club',
    city: 'London',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80',
    priceMin: 25,
    priceMax: 45,
    category: 'Music',
    genre: 'Jazz',
    url: 'https://www.ticketmaster.co.uk'
  },
  {
    id: 'sample2',
    name: 'Stand-Up Comedy Show',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '19:30:00',
    venue: 'The Comedy Store',
    city: 'London',
    image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80',
    priceMin: 20,
    priceMax: 35,
    category: 'Comedy',
    genre: 'Stand-Up',
    url: 'https://www.ticketmaster.co.uk'
  },
  {
    id: 'sample3',
    name: 'West End Musical',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    time: '19:00:00',
    venue: 'Palace Theatre',
    city: 'London',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80',
    priceMin: 35,
    priceMax: 150,
    category: 'Arts & Theatre',
    genre: 'Musical',
    url: 'https://www.ticketmaster.co.uk'
  },
  {
    id: 'sample4',
    name: 'Acoustic Sessions Live',
    date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    time: '20:30:00',
    venue: 'The O2 Academy',
    city: 'London',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    priceMin: 15,
    priceMax: 30,
    category: 'Music',
    genre: 'Acoustic',
    url: 'https://www.ticketmaster.co.uk'
  },
  {
    id: 'sample5',
    name: 'Premier League Football',
    date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
    time: '15:00:00',
    venue: 'Emirates Stadium',
    city: 'London',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&q=80',
    priceMin: 45,
    priceMax: 200,
    category: 'Sports',
    genre: 'Football',
    url: 'https://www.ticketmaster.co.uk'
  }
];

export default { EventsExplorer, VenuesExplorer };