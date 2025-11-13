// LanguageSelector.js - Language dropdown selector

import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { getAvailableLanguages } from './Translations';

export default function LanguageSelector({ currentLanguage, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const languages = getAvailableLanguages();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === currentLanguage);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
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
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            padding: '0.5rem',
            minWidth: '200px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: currentLanguage === lang.code ? '#fce7f3' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: currentLanguage === lang.code ? '600' : '400',
                color: '#374151',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (currentLanguage !== lang.code) {
                  e.target.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (currentLanguage !== lang.code) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLanguage === lang.code && (
                <span style={{ marginLeft: 'auto', color: '#ec4899' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}