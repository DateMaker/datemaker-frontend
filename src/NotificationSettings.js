// ============================================
// 🔔 NOTIFICATION SETTINGS - FIXED
// DateMaker - Phase 3C Engagement Feature
// ============================================
// FIXES:
// ✅ Visible white X close button
// ✅ Clean toggle design
// ✅ Saves preferences to Firestore
// ============================================

import React, { useState, useEffect } from 'react';
import { X, Bell, MessageCircle, Heart, Users, Calendar, Trophy, Clock, Flame, Gift, Volume2, VolumeX } from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ============================================
// 🔔 DEFAULT SETTINGS
// ============================================
const DEFAULT_SETTINGS = {
  // Social
  messages: true,
  friendRequests: true,
  friendAccepted: true,
  dateLikes: true,
  dateComments: true,
  
  // Dates
  dateInvites: true,
  surpriseDates: true,
  dateReminders: true,
  
  // Gamification
  achievements: true,
  levelUp: true,
  streakReminders: true,
  challengeReminders: true,
  
  // Scheduled
  morningInspiration: true,
  eveningVibes: true,
  weeklyRecap: true,
  monthlyRecap: true,
  
  // Sound
  soundEnabled: true
};

// ============================================
// 🎯 MAIN COMPONENT
// ============================================
export default function NotificationSettings({ user, isPremium, onClose }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const settingsRef = doc(db, 'notificationSettings', user.uid);
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsDoc.data() });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading notification settings:', error);
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Save settings to Firestore
  const saveSettings = async (newSettings) => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const settingsRef = doc(db, 'notificationSettings', user.uid);
      await setDoc(settingsRef, {
        ...newSettings,
        updatedAt: new Date()
      }, { merge: true });
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaving(false);
    }
  };

  // Toggle a setting
  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Toggle component
  const Toggle = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        border: 'none',
        background: enabled 
          ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' 
          : 'rgba(255,255,255,0.1)',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.5 : 1
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: '3px',
        left: enabled ? '27px' : '3px',
        transition: 'left 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  );

  // Setting row component
  const SettingRow = ({ icon: Icon, label, description, settingKey, premiumOnly = false }) => {
    const isLocked = premiumOnly && !isPremium;
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={20} color="rgba(255,255,255,0.8)" />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            color: 'white', 
            fontWeight: '600', 
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {label}
            {isLocked && (
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                borderRadius: '4px',
                color: '#1a1a2e',
                fontWeight: '700'
              }}>
                PREMIUM
              </span>
            )}
          </div>
          {description && (
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '0.8rem',
              marginTop: '0.25rem'
            }}>
              {description}
            </div>
          )}
        </div>
        
        <Toggle 
          enabled={settings[settingKey]} 
          onChange={() => toggleSetting(settingKey)}
          disabled={isLocked}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      zIndex: 10000,
      overflowY: 'auto',
      paddingBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        padding: '60px 1.5rem 1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={28} color="#ec4899" />
          <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            Notifications
          </h1>
        </div>
        
        {/* ✅ FIXED: Visible white X button */}
        <button
          onClick={onClose}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Saving indicator - overlay style */}
      {saving && (
        <div style={{
          position: 'fixed',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '0.5rem 1rem',
          background: 'rgba(139, 92, 246, 0.9)',
          color: 'white',
          fontSize: '0.85rem',
          borderRadius: '20px',
          zIndex: 100,
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
        }}>
          ✓ Saved
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Sound Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: settings.soundEnabled 
            ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))'
            : 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {settings.soundEnabled ? (
              <Volume2 size={24} color="#ec4899" />
            ) : (
              <VolumeX size={24} color="rgba(255,255,255,0.5)" />
            )}
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>
                Notification Sounds
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                {settings.soundEnabled ? 'Sounds are on' : 'Sounds are off'}
              </div>
            </div>
          </div>
          <Toggle 
            enabled={settings.soundEnabled} 
            onChange={() => toggleSetting('soundEnabled')}
          />
        </div>

        {/* Social Section */}
        <h3 style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: '0.8rem', 
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '1rem'
        }}>
          Social
        </h3>
        
        <SettingRow 
          icon={MessageCircle} 
          label="Messages" 
          description="New messages from friends"
          settingKey="messages"
        />
        <SettingRow 
          icon={Users} 
          label="Friend Requests" 
          description="New friend requests"
          settingKey="friendRequests"
        />
        <SettingRow 
          icon={Heart} 
          label="Likes & Comments" 
          description="When someone likes your dates"
          settingKey="dateLikes"
        />

        {/* Dates Section */}
        <h3 style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: '0.8rem', 
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: '2rem 0 1rem 0'
        }}>
          Dates
        </h3>
        
        <SettingRow 
          icon={Calendar} 
          label="Date Invites" 
          description="When someone invites you on a date"
          settingKey="dateInvites"
        />
        <SettingRow 
          icon={Gift} 
          label="Surprise Dates" 
          description="Surprise date notifications"
          settingKey="surpriseDates"
        />
        <SettingRow 
          icon={Clock} 
          label="Date Reminders" 
          description="Reminders for upcoming dates"
          settingKey="dateReminders"
        />

        {/* Gamification Section */}
        <h3 style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: '0.8rem', 
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: '2rem 0 1rem 0'
        }}>
          Achievements & Progress
        </h3>
        
        <SettingRow 
          icon={Trophy} 
          label="Achievements" 
          description="When you unlock achievements"
          settingKey="achievements"
        />
        <SettingRow 
          icon={Flame} 
          label="Streak Reminders" 
          description="Don't lose your streak!"
          settingKey="streakReminders"
        />
        <SettingRow 
          icon={Flame} 
          label="Challenge Reminders" 
          description="Daily challenge notifications"
          settingKey="challengeReminders"
          premiumOnly={true}
        />

        {/* Scheduled Section */}
        <h3 style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: '0.8rem', 
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: '2rem 0 1rem 0'
        }}>
          Scheduled
        </h3>
        
        <SettingRow 
          icon={Bell} 
          label="Morning Inspiration" 
          description="Daily date idea at 9 AM"
          settingKey="morningInspiration"
          premiumOnly={true}
        />
        <SettingRow 
          icon={Bell} 
          label="Tonight's Vibe" 
          description="Evening date suggestion at 5 PM"
          settingKey="eveningVibes"
          premiumOnly={true}
        />
        <SettingRow 
          icon={Bell} 
          label="Weekly Recap" 
          description="Summary of your week"
          settingKey="weeklyRecap"
        />
        <SettingRow 
          icon={Bell} 
          label="Monthly Recap" 
          description="Your monthly date stats"
          settingKey="monthlyRecap"
        />
      </div>
    </div>
  );
}