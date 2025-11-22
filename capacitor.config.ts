import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datemaker.app',
  appName: 'DateMaker',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    // Removed contentInset: 'always' - this was forcing safe area gaps
    // Let CSS handle safe areas instead for full control
    backgroundColor: '#ffffff'  // White instead of purple - cleaner
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#667eea',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#667eea'
    }
  }
};

export default config;