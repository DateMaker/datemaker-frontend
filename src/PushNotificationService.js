// ============================================
// 🔔 PUSH NOTIFICATION SERVICE - FIXED
// DateMaker - FCM Token Management
// ============================================
// FIXES:
// ✅ Removed duplicate event listeners
// ✅ Added listener cleanup on logout
// ✅ Better token refresh handling
// ✅ Improved error handling
// ============================================

import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

class PushNotificationServiceClass {
  constructor() {
    this.initialized = false;
    this.userId = null;
    this.currentToken = null;
    this.listeners = [];
    this.fcmListenerAdded = false;
  }

  // Initialize push notifications for a user
  initialize = async (userId) => {
    if (!Capacitor.isNativePlatform()) {
      console.log('🔔 Push notifications only work on native platforms');
      return false;
    }

    if (this.initialized && this.userId === userId) {
      console.log('🔔 Already initialized for this user');
      return true;
    }

    console.log('🔔 Initializing push for user:', userId);
    this.userId = userId;

    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      console.log('🔔 Permission status:', permission.receive);

      if (permission.receive !== 'granted') {
        console.log('🔔 Push notification permission denied');
        return false;
      }

      // Set up listeners BEFORE registering (only once)
      this.setupListeners();

      // Register for push
      await PushNotifications.register();

      // Also initialize local notifications for engagement features
      await this.initializeLocalNotifications();

      this.initialized = true;
      console.log('🔔 Push notifications initialized successfully');
      return true;

    } catch (error) {
      console.error('🔔 Error initializing push:', error);
      return false;
    }
  };

  // Set up all notification listeners
  setupListeners = () => {
    // Only add FCM listener once
    if (!this.fcmListenerAdded) {
      const fcmHandler = async (event) => {
        const token = event.detail?.token;
        if (token && this.userId) {
          console.log('🔔 FCM Token received:', token.substring(0, 30) + '...');
          await this.saveToken(token);
        }
      };

      window.addEventListener('fcmTokenReceived', fcmHandler);
      this.listeners.push({ type: 'fcmTokenReceived', handler: fcmHandler });
      this.fcmListenerAdded = true;
    }

    // APNs registration (fallback)
    const registrationListener = PushNotifications.addListener('registration', async (token) => {
      console.log('🔔 APNs token received:', token.value?.substring(0, 20) + '...');
      // Note: We primarily use FCM token from native AppDelegate
    });
    this.listeners.push({ type: 'capacitor', listener: registrationListener });

    // Registration error
    const errorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('🔔 Registration error:', error);
    });
    this.listeners.push({ type: 'capacitor', listener: errorListener });

    // Notification received (foreground)
    const receivedListener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('🔔 Push received in foreground:', notification);
      this.handleForegroundNotification(notification);
    });
    this.listeners.push({ type: 'capacitor', listener: receivedListener });

    // Notification tapped
    const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('🔔 Push notification tapped:', action);
      this.handleNotificationTap(action);
    });
    this.listeners.push({ type: 'capacitor', listener: actionListener });

    console.log('🔔 All listeners set up');
  };

  // Save FCM token to Firestore
  saveToken = async (token) => {
    if (!this.userId || !token) {
      console.log('🔔 Cannot save token: missing userId or token');
      return false;
    }

    // Don't save if it's the same token
    if (token === this.currentToken) {
      console.log('🔔 Token unchanged, skipping save');
      return true;
    }

    try {
      const userRef = doc(db, 'users', this.userId);
      
      // Remove old token if exists, add new one
      const updates = {
        fcmTokens: arrayUnion(token),
        lastTokenUpdate: new Date(),
        platform: Capacitor.getPlatform()
      };

      // If we had an old token, remove it
      if (this.currentToken) {
        await updateDoc(userRef, {
          fcmTokens: arrayRemove(this.currentToken)
        });
      }

      await setDoc(userRef, updates, { merge: true });
      
      this.currentToken = token;
      console.log('🔔 ✅ FCM token saved successfully');
      return true;

    } catch (error) {
      console.error('🔔 ❌ Error saving FCM token:', error);
      return false;
    }
  };

  // Initialize local notifications (for scheduled engagement notifications)
  initializeLocalNotifications = async () => {
    try {
      const permission = await LocalNotifications.requestPermissions();
      
      if (permission.display === 'granted') {
        console.log('🔔 Local notifications enabled');
        
        // Set up local notification tap handler
        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('🔔 Local notification tapped:', notification);
          this.handleLocalNotificationTap(notification);
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('🔔 Error initializing local notifications:', error);
      return false;
    }
  };

  // Handle foreground notification (show as local notification)
  handleForegroundNotification = async (notification) => {
    try {
      // Show as local notification since push won't display in foreground
      await LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Math.random() * 100000),
          title: notification.title || 'DateMaker',
          body: notification.body || '',
          extra: notification.data || {},
          sound: 'default'
        }]
      });
    } catch (error) {
      console.error('🔔 Error showing foreground notification:', error);
    }
  };

  // Handle push notification tap
  handleNotificationTap = (action) => {
    const data = action.notification?.data || {};
    this.navigateBasedOnData(data);
  };

  // Handle local notification tap
  handleLocalNotificationTap = (notification) => {
    const data = notification.notification?.extra || {};
    this.navigateBasedOnData(data);
  };

  // Navigate based on notification data
  navigateBasedOnData = (data) => {
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('notificationTap', { 
      detail: { 
        type: data.type,
        action: data.action,
        ...data 
      } 
    }));

    // Log for debugging
    console.log('🔔 Notification action:', data);
  };

  // Clean up on logout
  cleanup = async () => {
    console.log('🔔 Cleaning up push notification service...');

    // Remove all listeners
    this.listeners.forEach(({ type, handler, listener }) => {
      if (type === 'fcmTokenReceived' && handler) {
        window.removeEventListener('fcmTokenReceived', handler);
      } else if (listener?.remove) {
        listener.remove();
      }
    });

    this.listeners = [];
    this.fcmListenerAdded = false;
    this.initialized = false;
    this.userId = null;
    this.currentToken = null;

    console.log('🔔 Cleanup complete');
  };

  // Remove token on logout (optional - keeps notifications working)
  removeTokenOnLogout = async () => {
    if (!this.userId || !this.currentToken) return;

    try {
      const userRef = doc(db, 'users', this.userId);
      await updateDoc(userRef, {
        fcmTokens: arrayRemove(this.currentToken)
      });
      console.log('🔔 Token removed on logout');
    } catch (error) {
      console.error('🔔 Error removing token:', error);
    }
  };

  // Check if notifications are enabled
  checkPermissions = async () => {
    if (!Capacitor.isNativePlatform()) return false;
    
    try {
      const status = await PushNotifications.checkPermissions();
      return status.receive === 'granted';
    } catch (error) {
      console.error('🔔 Error checking permissions:', error);
      return false;
    }
  };

  // Get delivery status
  getDeliveredNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return [];
    
    try {
      const result = await PushNotifications.getDeliveredNotifications();
      return result.notifications || [];
    } catch (error) {
      console.error('🔔 Error getting delivered notifications:', error);
      return [];
    }
  };

  // Clear all delivered notifications
  clearNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await PushNotifications.removeAllDeliveredNotifications();
      console.log('🔔 All notifications cleared');
    } catch (error) {
      console.error('🔔 Error clearing notifications:', error);
    }
  };
}

// Export singleton instance
const PushNotificationService = new PushNotificationServiceClass();
export default PushNotificationService;