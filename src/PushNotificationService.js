// PushNotificationService.js
// Real push notifications for iOS

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const PushNotificationService = {
  initialized: false,

  // Initialize push notifications
  initialize: async function(userId) {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only work on native platforms');
      return false;
    }

    if (this.initialized) {
      console.log('Push notifications already initialized');
      return true;
    }

    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Register with APNs
        await PushNotifications.register();
        
        // Set up listeners
        this.setupListeners(userId);
        
        this.initialized = true;
        console.log('Push notifications initialized');
        return true;
      } else {
        console.log('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  },

  // Set up notification listeners
  setupListeners: function(userId) {
    var self = this;
    
    // When registration is successful, save the token
    PushNotifications.addListener('registration', function(token) {
      console.log('Push registration token:', token.value);
      self.saveToken(userId, token.value);
    });

    // Registration error
    PushNotifications.addListener('registrationError', function(error) {
      console.error('Push registration error:', error);
    });

    // When a notification is received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', function(notification) {
      console.log('Push notification received:', notification);
    });

    // When user taps on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', function(action) {
      console.log('Push notification tapped:', action);
      
      var data = action.notification.data;
      
      // Handle navigation based on notification type
      if (data && data.type === 'message') {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { screen: 'social', tab: 'messages', id: data.conversationId }
        }));
      } else if (data && data.type === 'friend_request') {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { screen: 'social', tab: 'requests' }
        }));
      } else if (data && data.type === 'friend_accepted') {
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { screen: 'social', tab: 'friends' }
        }));
      }
    });
  },

  // Save FCM token to user's Firestore document
  saveToken: async function(userId, token) {
    if (!userId || !token) return;

    try {
      var userRef = doc(db, 'users', userId);
      var userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token),
          lastTokenUpdate: new Date()
        });
      } else {
        await setDoc(userRef, {
          fcmTokens: [token],
          lastTokenUpdate: new Date()
        }, { merge: true });
      }

      console.log('FCM token saved to Firestore');
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  },

  // Check if notifications are enabled
  checkPermissions: async function() {
    if (!Capacitor.isNativePlatform()) return false;

    var status = await PushNotifications.checkPermissions();
    return status.receive === 'granted';
  }
};

export default PushNotificationService;