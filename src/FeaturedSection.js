// ============================================
// 🌟 FEATURED SECTIONS
// DateMaker - Homepage Featured Content
// ============================================
// Features:
// ✅ Sip & Spill Partner Banner
// ✅ Top Venues of the Week (Ad Revenue)
// ✅ Upcoming Events (Ticketmaster Integration)
// ============================================

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Star, ExternalLink, Clock, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import HapticService from './HapticService';

// ============================================
// 🍷 SIP & SPILL HOMEPAGE BANNER
// ============================================
export function SipAndSpillBanner({ variant = 'full' }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleOpen = () => {
    HapticService.tapMedium();
    window.open('https://www.sipandspill.co.uk/gamedeck', '_blank');
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleOpen}
        style={{
          width: '100%',
          padding: '1rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <span style={{ fontSize: '1.75rem' }}>🍷</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem' }}>Sip & Spill</span>
            <span style={{
              background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
              color: 'white',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.6rem',
              fontWeight: '700'
            }}>⭐ PARTNER</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>
            Couples drinking games 🔥
          </p>
        </div>
        <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
      </button>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
      borderRadius: '20px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      position: 'relative',
      boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
      animation: 'fadeInUp 0.5s ease-out'
    }}>
      {/* Dismiss button */}
      <button
        onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'rgba(0,0,0,0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: '1rem'
        }}
      >
        ×
      </button>

      {/* Partner Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'rgba(255,255,255,0.2)',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '0.75rem'
      }}>
        <Sparkles size={12} />
        FEATURED PARTNER
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          fontSize: '2.5rem',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '0.75rem',
          lineHeight: 1
        }}>
          🍷
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            color: 'white', 
            fontSize: '1.2rem', 
            fontWeight: '800', 
            margin: 0,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Sip & Spill
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '0.85rem', 
            margin: '0.25rem 0 0 0',
            lineHeight: 1.3
          }}>
            Bold, flirty couples games!
          </p>
        </div>
      </div>

      <button
        onClick={handleOpen}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.875rem',
          background: 'white',
          border: 'none',
          borderRadius: '12px',
          color: '#ef4444',
          fontWeight: '700',
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        🍷 Come Find Out
        <ExternalLink size={16} />
      </button>
    </div>
  );
}

// ============================================
// 🏆 TOP VENUES OF THE WEEK
// For business advertising revenue
// ============================================

// Sample data - Replace with Firestore collection 'featuredVenues'
const SAMPLE_FEATURED_VENUES = [
  {
    id: 'venue1',
    name: 'The Rooftop Garden',
    category: 'Restaurant',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    rating: 4.8,
    priceLevel: 3,
    tagline: '🌃 Best sunset views in town',
    badge: '🔥 HOT',
    link: null, // Would be affiliate or booking link
    sponsored: true
  },
  {
    id: 'venue2',
    name: 'Velvet Lounge',
    category: 'Cocktail Bar',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80',
    rating: 4.7,
    priceLevel: 2,
    tagline: '🍸 Craft cocktails & live jazz',
    badge: '✨ NEW',
    link: null,
    sponsored: true
  },
  {
    id: 'venue3',
    name: 'Starlight Cinema',
    category: 'Entertainment',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
    rating: 4.9,
    priceLevel: 2,
    tagline: '🎬 Outdoor movie experience',
    badge: '💕 ROMANTIC',
    link: null,
    sponsored: false
  }
];

export function TopVenuesSection({ venues = SAMPLE_FEATURED_VENUES, userLocation, onVenueClick, onSeeAll }) {
  const handleVenueClick = (venue) => {
    HapticService.tapLight();
    if (venue.link) {
      window.open(venue.link, '_blank');
    } else if (onVenueClick) {
      onVenueClick(venue);
    }
  };

  const getPriceString = (level) => {
    return '$'.repeat(level || 1);
  };

  return (
    <div style={{
      marginBottom: '2rem',
      animation: 'fadeInUp 0.6s ease-out'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#f59e0b" />
          <h3 style={{ 
            color: '#1a1a2e', 
            fontSize: '1.1rem', 
            fontWeight: '700',
            margin: 0
          }}>
            Top Venues This Week
          </h3>
        </div>
        {onSeeAll && (
          <button
            onClick={() => {
              HapticService.tapLight();
              onSeeAll();
            }}
            style={{
              background: 'rgba(245, 158, 11, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.35rem 0.75rem',
              color: '#f59e0b',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            See All →
          </button>
        )}
      </div>

      {/* Venues Carousel */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}>
        {venues.map((venue) => (
          <div
            key={venue.id}
            onClick={() => handleVenueClick(venue)}
            style={{
              minWidth: '200px',
              maxWidth: '200px',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              scrollSnapAlign: 'start',
              border: venue.sponsored ? '2px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            {/* Image */}
            <div style={{ position: 'relative', height: '120px' }}>
              <img 
                src={venue.image} 
                alt={venue.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
              {/* Badge */}
              {venue.badge && (
                <span style={{
                  position: 'absolute',
                  top: '0.5rem',
                  left: '0.5rem',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.65rem',
                  fontWeight: '700'
                }}>
                  {venue.badge}
                </span>
              )}
              {/* Sponsored indicator */}
              {venue.sponsored && (
                <span style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.55rem',
                  fontWeight: '700'
                }}>
                  AD
                </span>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: '0.75rem' }}>
              <h4 style={{ 
                color: '#1a1a2e', 
                fontSize: '0.9rem', 
                fontWeight: '700',
                margin: '0 0 0.25rem 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {venue.name}
              </h4>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.35rem'
              }}>
                <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.75rem' }}>
                  {venue.category}
                </span>
                <span style={{ color: 'rgba(0,0,0,0.3)' }}>•</span>
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>
                  {getPriceString(venue.priceLevel)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={12} fill="#fbbf24" color="#fbbf24" />
                <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: '600' }}>
                  {venue.rating}
                </span>
              </div>
              <p style={{
                color: 'rgba(0,0,0,0.5)',
                fontSize: '0.7rem',
                margin: '0.35rem 0 0 0',
                lineHeight: 1.3
              }}>
                {venue.tagline}
              </p>
            </div>
          </div>
        ))}

        {/* "Your Venue Here" CTA for businesses */}
        <div
          onClick={() => window.open('mailto:thedatemakera@outlook.com?subject=Featured Venue Inquiry', '_blank')}
          style={{
            minWidth: '160px',
            maxWidth: '160px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '2px dashed rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem 1rem',
            cursor: 'pointer',
            scrollSnapAlign: 'start',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</span>
          <span style={{ 
            color: '#f59e0b', 
            fontWeight: '700', 
            fontSize: '0.85rem',
            marginBottom: '0.25rem'
          }}>
            Your Venue Here
          </span>
          <span style={{ 
            color: 'rgba(0,0,0,0.5)', 
            fontSize: '0.7rem' 
          }}>
            Get featured!
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 🎫 UPCOMING EVENTS (TICKETMASTER)
// ============================================

export function UpcomingEventsSection({ 
  events = [], 
  loading = false, 
  userLocation,
  ticketmasterApiKey,
  onEventClick,
  onSeeAll 
}) {
  const [localEvents, setLocalEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(loading);

  // Fetch events from Ticketmaster
  useEffect(() => {
    const fetchEvents = async () => {
      if (!ticketmasterApiKey || !userLocation) {
        // Use sample data if no API key
        setLocalEvents(SAMPLE_EVENTS);
        return;
      }

      setEventsLoading(true);
      try {
        const { lat, lng } = userLocation;
        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?` +
          `apikey=${ticketmasterApiKey}` +
          `&latlong=${lat},${lng}` +
          `&radius=25` +
          `&unit=miles` +
          `&size=10` +
          `&sort=date,asc` +
          `&classificationName=Music,Arts,Theatre,Comedy`
        );
        
        const data = await response.json();
        
        if (data._embedded?.events) {
          const formattedEvents = data._embedded.events.map(event => ({
            id: event.id,
            name: event.name,
            date: event.dates?.start?.localDate,
            time: event.dates?.start?.localTime,
            venue: event._embedded?.venues?.[0]?.name || 'TBA',
            image: event.images?.find(img => img.ratio === '16_9')?.url || event.images?.[0]?.url,
            url: event.url,
            priceRange: event.priceRanges?.[0] ? 
              `$${event.priceRanges[0].min}-${event.priceRanges[0].max}` : 
              'See tickets',
            category: event.classifications?.[0]?.segment?.name || 'Event'
          }));
          setLocalEvents(formattedEvents);
        } else {
          setLocalEvents(SAMPLE_EVENTS);
        }
      } catch (error) {
        console.error('Error fetching Ticketmaster events:', error);
        setLocalEvents(SAMPLE_EVENTS);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [ticketmasterApiKey, userLocation]);

  const displayEvents = events.length > 0 ? events : localEvents;

  // 💰 TICKETMASTER AFFILIATE CONFIG
  // Sign up at: https://www.ticketmaster.co.uk/affiliate
  const AFFILIATE_ID = null; // Replace with your affiliate ID once approved
  const CAMPAIGN_ID = null;  // Replace with your campaign ID

  const getAffiliateUrl = (eventUrl) => {
    if (!eventUrl) return null;
    if (AFFILIATE_ID) {
      const separator = eventUrl.includes('?') ? '&' : '?';
      let url = `${eventUrl}${separator}aid=${AFFILIATE_ID}`;
      if (CAMPAIGN_ID) url += `&pid=${CAMPAIGN_ID}`;
      url += '&utm_source=datemaker&utm_medium=app';
      return url;
    }
    return eventUrl;
  };

  const handleEventClick = (event) => {
    HapticService.tapLight();
    if (event.url) {
      window.open(getAffiliateUrl(event.url), '_blank');
    } else if (onEventClick) {
      onEventClick(event);
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
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (eventsLoading) {
    return (
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(168, 85, 247, 0.3)',
          borderTop: '3px solid #a855f7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: 'rgba(0,0,0,0.5)', margin: 0 }}>
          Finding events near you...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: '2rem',
      animation: 'fadeInUp 0.7s ease-out'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="#a855f7" />
          <h3 style={{ 
            color: '#1a1a2e', 
            fontSize: '1.1rem', 
            fontWeight: '700',
            margin: 0
          }}>
            Events This Week
          </h3>
        </div>
        {onSeeAll && (
          <button
            onClick={() => {
              HapticService.tapLight();
              onSeeAll();
            }}
            style={{
              background: 'rgba(168, 85, 247, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.35rem 0.75rem',
              color: '#a855f7',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            See All →
          </button>
        )}
      </div>

      {/* Events List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {displayEvents.slice(0, 5).map((event) => (
          <div
            key={event.id}
            onClick={() => handleEventClick(event)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '14px',
              cursor: 'pointer',
              border: '1px solid rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            {/* Event Image */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'linear-gradient(135deg, #a855f7, #ec4899)'
            }}>
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  🎫
                </div>
              )}
            </div>

            {/* Event Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                color: '#1a1a2e',
                fontSize: '0.95rem',
                fontWeight: '700',
                margin: '0 0 0.25rem 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {event.name}
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  color: '#a855f7',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {formatDate(event.date)}
                </span>
                <span style={{ color: 'rgba(0,0,0,0.3)' }}>•</span>
                <span style={{
                  color: 'rgba(0,0,0,0.5)',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {event.venue}
                </span>
              </div>
              <span style={{
                display: 'inline-block',
                marginTop: '0.35rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                {event.priceRange}
              </span>
            </div>

            {/* Arrow */}
            <ChevronRight size={20} color="rgba(0,0,0,0.3)" />
          </div>
        ))}
      </div>

      {/* View All Link - only show if no onSeeAll callback */}
      {!onSeeAll && (
        <button
          onClick={() => window.open('https://www.ticketmaster.com', '_blank')}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '12px',
            color: '#a855f7',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          View All Events
          <ExternalLink size={16} />
        </button>
      )}
    </div>
  );
}

// Sample events (fallback)
const SAMPLE_EVENTS = [
  {
    id: 'sample1',
    name: 'Jazz Night at the Blue Room',
    date: new Date().toISOString().split('T')[0],
    venue: 'The Blue Room',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80',
    priceRange: '$25-45',
    category: 'Music',
    url: 'https://www.ticketmaster.com'
  },
  {
    id: 'sample2',
    name: 'Comedy Night Live',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    venue: 'Laugh Factory',
    image: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=400&q=80',
    priceRange: '$20-35',
    category: 'Comedy',
    url: 'https://www.ticketmaster.com'
  },
  {
    id: 'sample3',
    name: 'Acoustic Sessions',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    venue: 'The Garden Stage',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    priceRange: '$15-30',
    category: 'Music',
    url: 'https://www.ticketmaster.com'
  }
];

// ============================================
// 🎯 COMBINED FEATURED SECTION
// Use this for easy integration
// ============================================
export function FeaturedSection({ 
  showSipAndSpill = true,
  showTopVenues = true,
  showEvents = true,
  ticketmasterApiKey,
  userLocation,
  featuredVenues,
  onVenueClick,
  onEventClick
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {showSipAndSpill && <SipAndSpillBanner variant="full" />}
      {showTopVenues && (
        <TopVenuesSection 
          venues={featuredVenues}
          userLocation={userLocation}
          onVenueClick={onVenueClick}
        />
      )}
      {showEvents && (
        <UpcomingEventsSection 
          ticketmasterApiKey={ticketmasterApiKey}
          userLocation={userLocation}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}

export default FeaturedSection;