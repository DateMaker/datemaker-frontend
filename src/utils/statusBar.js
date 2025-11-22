import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export const setStatusBarColor = async (color, style = 'DARK') => {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setBackgroundColor({ color });
      await StatusBar.setStyle({ 
        style: style === 'LIGHT' ? Style.Light : Style.Dark 
      });
    } catch (error) {
      console.log('StatusBar error:', error);
    }
  }
};

// Preset colors matching each screen's header
export const STATUS_BAR_COLORS = {
  home: '#667eea',
  social: '#667eea', 
  stats: '#667eea',
  achievements: '#1e293b',
  profile: '#fce7f3',
  scrapbook: '#f97316',
  streaks: '#ea580c',
  surprise: '#ec4899',
  wheel: '#1e293b',
  saved: '#667eea'
};