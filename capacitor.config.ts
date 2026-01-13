import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datemaker.app',
  appName: 'DateMaker',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    backgroundColor: '#ffffff',
    // Add URL scheme for deep links
    scheme: 'datemaker'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
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
  },
};

export default config;