import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCw } from 'lucide-react';

const SpinningWheel = ({ onClose, onSelectActivity, language = 'en' }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  
  // Activity categories with emojis and colors
  const segments = [
    { 
      label: 'Food & Dining', 
      emoji: '🍽️', 
      color: '#FF6B35', 
      activities: ['restaurant', 'dinner', 'brunch'] 
    },
    { 
      label: 'Drinks & Bars', 
      emoji: '🍸', 
      color: '#004E89', 
      activities: ['bar', 'cocktail', 'wine'] 
    },
    { 
      label: 'Entertainment', 
      emoji: '🎭', 
      color: '#F77F00', 
      activities: ['live music', 'theater', 'comedy'] 
    },
    { 
      label: 'Adventure', 
      emoji: '🚀', 
      color: '#06D6A0', 
      activities: ['go kart', 'escape room', 'arcade'] 
    },
    { 
      label: 'Culture', 
      emoji: '🏛️', 
      color: '#9D4EDD', 
      activities: ['museum', 'art gallery', 'art'] 
    },
    { 
      label: 'Nature', 
      emoji: '🌳', 
      color: '#38B000', 
      activities: ['park', 'beach', 'garden'] 
    },
    { 
      label: 'Nightlife', 
      emoji: '🎉', 
      color: '#FF006E', 
      activities: ['nightclub', 'dancing', 'karaoke'] 
    },
    { 
      label: 'Wellness', 
      emoji: '🧘', 
      color: '#8338EC', 
      activities: ['spa', 'yoga', 'fitness'] 
    },
    { 
      label: 'Sports', 
      emoji: '⚽', 
      color: '#1B9AAA', 
      activities: ['bowling', 'mini golf', 'ice skating'] 
    },
    { 
      label: 'Creative', 
      emoji: '🎨', 
      color: '#EF476F', 
      activities: ['art class', 'pottery', 'painting'] 
    },
    { 
      label: 'Shopping', 
      emoji: '🛍️', 
      color: '#FFD60A', 
      activities: ['shopping', 'market', 'boutique'] 
    },
    { 
      label: 'Unique', 
      emoji: '✨', 
      color: '#06FFA5', 
      activities: ['arcade', 'aquarium', 'zoo'] 
    }
  ];

  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // High DPI support for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const segmentAngle = (2 * Math.PI) / segments.length;
    
    // Enable antialiasing for smooth edges
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle + (rotation * Math.PI / 180);
      const endAngle = startAngle + segmentAngle;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Draw text with better quality
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw emoji
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(segment.emoji, radius * 0.7, 0);
      
      // Draw label (split into words for better fit)
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      const words = segment.label.split(' ');
      if (words.length === 1) {
        ctx.font = 'bold 14px Arial';
        ctx.fillText(words[0], radius * 0.45, 0);
      } else {
        ctx.font = 'bold 13px Arial';
        ctx.fillText(words[0], radius * 0.45, -8);
        ctx.fillText(words[1] || '', radius * 0.45, 8);
      }
      
      ctx.restore();
    });
    
    // Draw center circle with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f3f4f6');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Draw pointer at top with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    ctx.beginPath();
    ctx.moveTo(centerX, 25);
    ctx.lineTo(centerX - 20, 60);
    ctx.lineTo(centerX + 20, 60);
    ctx.closePath();
    ctx.fillStyle = '#ec4899';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    
  }, [rotation]);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedSegment(null);
    
    // Random spins between 5-10 full rotations plus random angle
    const minSpins = 5;
    const maxSpins = 10;
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = (spins * 360) + extraDegrees;
    
    // Animate the spin
    let currentRotation = 0;
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      currentRotation = totalRotation * easeOut;
      
      setRotation(currentRotation % 360);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        // Calculate which segment the TOP POINTER is pointing at
        // The pointer is at the top (270 degrees / -90 degrees from right)
        const finalRotation = currentRotation % 360;
        
        // Adjust for the pointer position (top = 270 degrees)
        // We need to find which segment is under the top pointer
        const pointerAngle = 270; // Top of circle
        const adjustedAngle = (pointerAngle - finalRotation + 360) % 360;
        
        // Calculate which segment this angle falls into
        const segmentAngle = 360 / segments.length;
        const selectedIndex = Math.floor(adjustedAngle / segmentAngle);
        
        // Make sure index is valid
        const validIndex = selectedIndex % segments.length;
        const selected = segments[validIndex];
        
        console.log('Final rotation:', finalRotation);
        console.log('Adjusted angle:', adjustedAngle);
        console.log('Selected index:', validIndex);
        console.log('Selected segment:', selected.label);
        
        setSelectedSegment(selected);
      }
    };
    
    animate();
  };

  const handleUseSelection = () => {
    if (selectedSegment) {
      // Pick a random activity from the selected category
      const randomActivity = selectedSegment.activities[
        Math.floor(Math.random() * selectedSegment.activities.length)
      ];
      onSelectActivity(randomActivity);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)',
        borderRadius: '24px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
  onClick={onClose}
  style={{
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    border: '3px solid white',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
    transition: 'all 0.2s ease',
    zIndex: 100
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = 'scale(1.1)';
    e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.6)';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'scale(1)';
    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
  }}
>
  <X size={24} style={{ color: 'white', strokeWidth: 3 }} />
</button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '900',
            background: 'linear-gradient(to right, #ec4899, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            🎡 Spin the Date Wheel!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            Feeling adventurous? Let fate decide your date activity!
          </p>
        </div>

        {/* Canvas wheel */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          position: 'relative'
        }}>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              filter: isSpinning ? 'blur(2px)' : 'none',
              transition: 'filter 0.3s ease',
              display: 'block'
            }}
          />
        </div>

        {/* Result display */}
        {selectedSegment && !isSpinning && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `3px solid ${selectedSegment.color}`,
            textAlign: 'center',
            animation: 'bounceIn 0.6s ease'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {selectedSegment.emoji}
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: selectedSegment.color,
              marginBottom: '0.5rem'
            }}>
              {selectedSegment.label}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Pick from: {selectedSegment.activities.join(', ')}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            style={{
              flex: 1,
              minWidth: '140px',
              background: isSpinning 
                ? '#d1d5db' 
                : 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 8px 20px rgba(236, 72, 153, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!isSpinning) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 28px rgba(236, 72, 153, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.4)';
            }}
          >
            {isSpinning ? (
              <>
                <RotateCw className="spinning-icon" size={20} />
                Spinning...
              </>
            ) : (
              <>
                <Play size={20} />
                {selectedSegment ? 'Spin Again!' : 'Spin the Wheel!'}
              </>
            )}
          </button>

          {selectedSegment && !isSpinning && (
            <button
              onClick={handleUseSelection}
              style={{
                flex: 1,
                minWidth: '140px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
              }}
            >
              Use This Activity! ✨
            </button>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '12px',
          fontSize: '0.875rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          💡 <strong>12 Categories, 36 Activities!</strong><br/>
          Spin to discover random date ideas. Spin multiple times to build your perfect date!
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .spinning-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SpinningWheel;