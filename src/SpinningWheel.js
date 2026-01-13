import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Sparkles } from 'lucide-react';
import { setStatusBarColor, STATUS_BAR_COLORS } from './utils/statusBar';

const SpinningWheel = ({ onClose, onSelectActivity, language = 'en' }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef(null);

  // 📱 Set status bar color for iOS
  useEffect(() => {
    setStatusBarColor(STATUS_BAR_COLORS.wheel);
    
    return () => {
      setStatusBarColor(STATUS_BAR_COLORS.home);
    };
  }, []);
  
  // Activity categories with emojis and colors
  const segments = [
    { 
      label: 'Food & Dining', 
      emoji: '🍽️', 
      color: '#FF6B35',
      gradient: ['#FF6B35', '#FF8C5A'],
      activities: ['restaurant', 'dinner', 'brunch'] 
    },
    { 
      label: 'Drinks & Bars', 
      emoji: '🍸', 
      color: '#004E89',
      gradient: ['#004E89', '#0066B3'],
      activities: ['bar', 'cocktail', 'wine'] 
    },
    { 
      label: 'Entertainment', 
      emoji: '🎭', 
      color: '#F77F00',
      gradient: ['#F77F00', '#FFA033'],
      activities: ['live music', 'theater', 'comedy'] 
    },
    { 
      label: 'Adventure', 
      emoji: '🚀', 
      color: '#06D6A0',
      gradient: ['#06D6A0', '#00F5B8'],
      activities: ['go kart', 'escape room', 'arcade'] 
    },
    { 
      label: 'Culture', 
      emoji: '🏛️', 
      color: '#9D4EDD',
      gradient: ['#9D4EDD', '#B76EFF'],
      activities: ['museum', 'art gallery', 'art'] 
    },
    { 
      label: 'Nature', 
      emoji: '🌳', 
      color: '#38B000',
      gradient: ['#38B000', '#4CD300'],
      activities: ['park', 'beach', 'garden'] 
    },
    { 
      label: 'Nightlife', 
      emoji: '🎉', 
      color: '#FF006E',
      gradient: ['#FF006E', '#FF3D8E'],
      activities: ['nightclub', 'dancing', 'karaoke'] 
    },
    { 
      label: 'Wellness', 
      emoji: '🧘', 
      color: '#8338EC',
      gradient: ['#8338EC', '#A855F7'],
      activities: ['spa', 'yoga', 'fitness'] 
    },
    { 
      label: 'Sports', 
      emoji: '⚽', 
      color: '#1B9AAA',
      gradient: ['#1B9AAA', '#22BDD0'],
      activities: ['bowling', 'mini golf', 'ice skating'] 
    },
    { 
      label: 'Creative', 
      emoji: '🎨', 
      color: '#EF476F',
      gradient: ['#EF476F', '#FF6B8A'],
      activities: ['art class', 'pottery', 'painting'] 
    },
    { 
      label: 'Shopping', 
      emoji: '🛍️', 
      color: '#FFD60A',
      gradient: ['#FFD60A', '#FFE44D'],
      activities: ['shopping', 'market', 'boutique'] 
    },
    { 
      label: 'Unique', 
      emoji: '✨', 
      color: '#06FFA5',
      gradient: ['#06FFA5', '#00FFCC'],
      activities: ['arcade', 'aquarium', 'zoo'] 
    }
  ];

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'][Math.floor(Math.random() * 8)]
  }));

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
    const radius = Math.min(centerX, centerY) - 30;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Enable antialiasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw outer glow ring
    const glowGradient = ctx.createRadialGradient(centerX, centerY, radius - 10, centerX, centerY, radius + 25);
    glowGradient.addColorStop(0, 'rgba(236, 72, 153, 0)');
    glowGradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
    glowGradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Draw decorative outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw metallic outer border
    const borderGradient = ctx.createLinearGradient(0, centerY - radius, 0, centerY + radius);
    borderGradient.addColorStop(0, '#fcd34d');
    borderGradient.addColorStop(0.3, '#fef3c7');
    borderGradient.addColorStop(0.5, '#fcd34d');
    borderGradient.addColorStop(0.7, '#f59e0b');
    borderGradient.addColorStop(1, '#d97706');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 8;
    ctx.stroke();
    
    const segmentAngle = (2 * Math.PI) / segments.length;
    
    // Draw wheel shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.restore();
    
    // Draw segments with gradients
    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle + (rotation * Math.PI / 180);
      const endAngle = startAngle + segmentAngle;
      
      // Create segment gradient
      const midAngle = startAngle + segmentAngle / 2;
      const gradX1 = centerX + Math.cos(midAngle) * radius * 0.3;
      const gradY1 = centerY + Math.sin(midAngle) * radius * 0.3;
      const gradX2 = centerX + Math.cos(midAngle) * radius;
      const gradY2 = centerY + Math.sin(midAngle) * radius;
      
      const segGradient = ctx.createLinearGradient(gradX1, gradY1, gradX2, gradY2);
      segGradient.addColorStop(0, segment.gradient[0]);
      segGradient.addColorStop(1, segment.gradient[1]);
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segGradient;
      ctx.fill();
      
      // Segment border
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw inner shadow for depth
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      const innerShadow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      innerShadow.addColorStop(0, 'rgba(0,0,0,0.2)');
      innerShadow.addColorStop(0.3, 'rgba(0,0,0,0)');
      innerShadow.addColorStop(1, 'rgba(0,0,0,0.1)');
      ctx.fillStyle = innerShadow;
      ctx.fill();
      
      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Emoji - positioned in middle of segment
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(segment.emoji, radius * 0.5, 0);
      
      // Label text - positioned on outer edge so full words are visible
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      const words = segment.label.split(' ');
      if (words.length === 1) {
        ctx.font = 'bold 10px Arial';
        ctx.fillText(words[0], radius * 0.78, 0);
      } else {
        ctx.font = 'bold 9px Arial';
        ctx.fillText(words[0], radius * 0.78, -6);
        ctx.fillText(words[1] || '', radius * 0.78, 6);
      }
      
      ctx.restore();
    });

    // Draw shiny overlay
    const shineGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    shineGradient.addColorStop(0, 'rgba(255,255,255,0.15)');
    shineGradient.addColorStop(0.5, 'rgba(255,255,255,0)');
    shineGradient.addColorStop(1, 'rgba(255,255,255,0.05)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = shineGradient;
    ctx.fill();
    
    // Draw center hub with 3D effect
    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, 48, 0, 2 * Math.PI);
    const outerHubGradient = ctx.createRadialGradient(centerX - 10, centerY - 10, 0, centerX, centerY, 48);
    outerHubGradient.addColorStop(0, '#fcd34d');
    outerHubGradient.addColorStop(0.5, '#f59e0b');
    outerHubGradient.addColorStop(1, '#d97706');
    ctx.fillStyle = outerHubGradient;
    ctx.fill();
    
    // Inner hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    const hubGradient = ctx.createRadialGradient(centerX - 8, centerY - 8, 0, centerX, centerY, 38);
    hubGradient.addColorStop(0, '#ffffff');
    hubGradient.addColorStop(0.3, '#f9fafb');
    hubGradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = hubGradient;
    ctx.fill();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Center sparkle icon
    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💖', centerX, centerY);
    
    // Draw premium pointer at top
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    // Pointer shape - positioned so tip touches wheel edge
    const pointerTip = centerY - radius + 5;
    ctx.beginPath();
    ctx.moveTo(centerX, pointerTip);
    ctx.lineTo(centerX - 20, pointerTip - 40);
    ctx.quadraticCurveTo(centerX, pointerTip - 50, centerX + 20, pointerTip - 40);
    ctx.closePath();
    
    // Pointer gradient
    const pointerGradient = ctx.createLinearGradient(centerX - 20, pointerTip - 50, centerX + 20, pointerTip);
    pointerGradient.addColorStop(0, '#f472b6');
    pointerGradient.addColorStop(0.5, '#ec4899');
    pointerGradient.addColorStop(1, '#db2777');
    ctx.fillStyle = pointerGradient;
    ctx.fill();
    
    // Pointer border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Pointer highlight
    ctx.beginPath();
    ctx.moveTo(centerX - 5, pointerTip - 35);
    ctx.lineTo(centerX - 12, pointerTip - 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
    
  }, [rotation]);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedSegment(null);
    setShowConfetti(false);
    
    // Random spins between 5-10 full rotations plus random angle
    const minSpins = 5;
    const maxSpins = 10;
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = (spins * 360) + extraDegrees;
    
    // Animate the spin
    let currentRotation = 0;
    const duration = 5000; // 5 seconds for more suspense
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Custom easing for realistic wheel physics
      const easeOut = 1 - Math.pow(1 - progress, 4);
      currentRotation = totalRotation * easeOut;
      
      setRotation(currentRotation % 360);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        
        // Calculate which segment the pointer is pointing at
        const finalRotation = currentRotation % 360;
        const pointerAngle = 270;
        const adjustedAngle = (pointerAngle - finalRotation + 360) % 360;
        const segmentAngle = 360 / segments.length;
        const selectedIndex = Math.floor(adjustedAngle / segmentAngle);
        const validIndex = selectedIndex % segments.length;
        const selected = segments[validIndex];
        
        setSelectedSegment(selected);
        setShowConfetti(true);
        
        // Hide confetti after animation
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };
    
    animate();
  };

  const handleUseSelection = () => {
    if (selectedSegment) {
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
      background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.95) 0%, rgba(0,0,0,0.98) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem',
      paddingTop: 'calc(1rem + env(safe-area-inset-top))',
      paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
      overflow: 'hidden'
    }}>
      {/* Animated background particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: `hsl(${Math.random() * 360}, 70%, 60%)`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.4
            }}
          />
        ))}
      </div>

      {/* Confetti celebration */}
      {showConfetti && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 10002
        }}>
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: '-20px',
                width: '10px',
                height: '10px',
                background: particle.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animation: `confettiFall ${particle.duration}s ease-out forwards`,
                animationDelay: `${particle.delay}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(30,27,75,0.95) 0%, rgba(20,20,40,0.98) 100%)',
        borderRadius: '32px',
        padding: '1.5rem',
        paddingTop: '2rem',
        paddingBottom: '2rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(236,72,153,0.3), 0 0 100px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative',
        maxHeight: 'calc(90vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 'env(safe-area-inset-bottom)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: '3px solid rgba(255,255,255,0.3)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.5)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10001,
            fontSize: '1.5rem',
            fontWeight: '900',
            color: 'white',
            lineHeight: '1',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15) rotate(90deg)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.5)';
          }}
        >
          ✕
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(168,85,247,0.2) 100%)',
            borderRadius: '100px',
            marginBottom: '0.75rem',
            border: '1px solid rgba(236,72,153,0.3)'
          }}>
            <Sparkles size={18} color="#f472b6" />
            <span style={{ color: '#f472b6', fontWeight: '600', fontSize: '0.875rem' }}>
              FEELING LUCKY?
            </span>
          </div>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            Spin the Date Wheel!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Let fate decide your perfect date activity ✨
          </p>
        </div>

        {/* Canvas wheel */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          {/* Glow behind wheel */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '110%',
            height: '110%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: isSpinning ? 'pulseGlow 0.5s ease-in-out infinite' : 'none'
          }} />
          
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{
              width: '100%',
              maxWidth: '350px',
              height: 'auto',
              filter: isSpinning ? 'brightness(1.1)' : 'brightness(1)',
              transition: 'filter 0.3s ease',
              display: 'block'
            }}
          />
        </div>

        {/* Result display */}
        {selectedSegment && !isSpinning && (
          <div style={{
            background: `linear-gradient(135deg, ${selectedSegment.color}15 0%, ${selectedSegment.color}08 100%)`,
            borderRadius: '20px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            border: `2px solid ${selectedSegment.color}`,
            textAlign: 'center',
            animation: 'resultPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: `0 10px 40px ${selectedSegment.color}30`
          }}>
            <div style={{ 
              fontSize: '3.5rem', 
              marginBottom: '0.5rem',
              animation: 'bounce 0.6s ease infinite',
              animationDelay: '0.2s'
            }}>
              {selectedSegment.emoji}
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: selectedSegment.color,
              marginBottom: '0.5rem',
              textShadow: `0 0 20px ${selectedSegment.color}50`
            }}>
              {selectedSegment.label}!
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center',
              marginTop: '0.75rem'
            }}>
              {selectedSegment.activities.map((activity, idx) => (
                <span key={idx} style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '100px',
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}>
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            style={{
              flex: 1,
              minWidth: '140px',
              background: isSpinning 
                ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)' 
                : 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)',
              backgroundSize: '200% 200%',
              animation: isSpinning ? 'none' : 'gradientShift 3s ease infinite',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              border: 'none',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: isSpinning 
                ? 'none' 
                : '0 10px 30px rgba(236, 72, 153, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isSpinning) {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(236, 72, 153, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(236, 72, 153, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
            }}
          >
            {isSpinning ? (
              <>
                <RotateCw className="spinning-icon" size={20} />
                Spinning...
              </>
            ) : (
              <>
                <Play size={20} fill="white" />
                {selectedSegment ? 'Spin Again!' : 'SPIN!'}
              </>
            )}
          </button>

          {selectedSegment && !isSpinning && (
            <button
              onClick={handleUseSelection}
              style={{
                flex: 1,
                minWidth: '140px',
                background: `linear-gradient(135deg, ${selectedSegment.color} 0%, ${selectedSegment.gradient[1]} 100%)`,
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 10px 30px ${selectedSegment.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 15px 40px ${selectedSegment.color}50, inset 0 1px 0 rgba(255,255,255,0.2)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${selectedSegment.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`;
              }}
            >
              Use This! ✨
            </button>
          )}
        </div>

        {/* Stats footer */}
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem 0.5rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          gap: '0.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ textAlign: 'center', flex: '1', minWidth: '0' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f472b6' }}>12</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>Categories</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ textAlign: 'center', flex: '1', minWidth: '0' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#a78bfa' }}>36</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>Activities</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ textAlign: 'center', flex: '1', minWidth: '0' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#60a5fa' }}>∞</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>Options</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes resultPopIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 10px 30px currentColor;
          }
          50% {
            box-shadow: 0 10px 50px currentColor;
          }
        }

        .spinning-icon {
          animation: spin 0.8s linear infinite;
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