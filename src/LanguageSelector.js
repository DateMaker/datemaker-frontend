// LanguageSelector.js - Language dropdown selector

import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { getAvailableLanguages } from './Translations';

export default function LanguageSelector({ currentLanguage, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const languages = getAvailableLanguages();

// Close when other menus open
useEffect(() => {
  const handleCloseDropdowns = () => setIsOpen(false);
  document.addEventListener('closeDropdowns', handleCloseDropdowns);
  return () => document.removeEventListener('closeDropdowns', handleCloseDropdowns);
}, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const currentLang = languages.find(l => l.code === currentLanguage);

  const handleLanguageSelect = (langCode) => {
    console.log('🌐 Selecting language:', langCode);
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop when open */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99998
          }}
        />
      )}
      
      <div ref={dropdownRef} style={{ position: 'relative', zIndex: isOpen ? 99999 : 1, flexShrink: 0 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{currentLang?.flag}</span>
          <span style={{ color: '#374151' }}>{currentLang?.name}</span>
          <Globe size={16} style={{ color: '#6b7280' }} />
        </button>
{isOpen && (
  <div
    style={{
      position: 'fixed',
      top: 'calc(env(safe-area-inset-top) + 70px)',
      left: '1rem',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      padding: '0.5rem',
      width: '220px',
      maxHeight: '60vh',
      overflowY: 'scroll',
      zIndex: 99999,
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain'
    }}
  >
        
            {languages.map((lang) => (
  <div
    key={lang.code}
    onClick={() => handleLanguageSelect(lang.code)}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1rem',
      background: currentLanguage === lang.code ? '#fce7f3' : 'transparent',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: currentLanguage === lang.code ? '600' : '400',
      color: '#374151',
      WebkitTapHighlightColor: 'transparent',
      userSelect: 'none'
    }}
  >
                <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                <span style={{ flex: 1 }}>{lang.name}</span>
                {currentLanguage === lang.code && (
                  <span style={{ color: '#ec4899' }}>✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}