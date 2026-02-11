import { Purchases } from '@revenuecat/purchases-capacitor';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

class IAPManager {
  constructor() {
    this.isInitialized = false;
  }

  async updateFirebaseSubscription(status = 'premium', additionalData = {}) {
    try {
      const userId = window.currentUserId;
      if (!userId) {
        console.error('❌ No user ID for Firebase update');
        return false;
      }

      console.log('📝 Updating Firebase subscription status to:', status);
      
      await updateDoc(doc(db, 'users', userId), {
        subscriptionStatus: status,
        subscriptionUpdatedAt: new Date().toISOString(),
        subscriptionSource: 'apple_iap',
        ...additionalData
      });

      console.log('✅ Firebase subscription updated to:', status);
      return true;
    } catch (error) {
      console.error('❌ Failed to update Firebase:', error);
      return false;
    }
  }

  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ IAP already initialized');
      return true;
    }

    try {
      console.log('🚀 Initializing RevenueCat...');

      // Configure RevenueCat with Production API key
      const result = await Purchases.configure({
        apiKey: 'appl_kslOraSyVRjzBMQSWVcENKFHxaH',
        appUserID: window.currentUserId || undefined
      });

      console.log('✅ RevenueCat configured:', result);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ IAP initialization error:', error);
      return false;
    }
  }

  async getProducts() {
    try {
      console.log('📦 Loading offerings...');
      
      const offerings = await Purchases.getOfferings();
      
      console.log('📦 Offerings:', offerings);

      const currentOffering = offerings.current;
      
      if (!currentOffering) {
        console.log('⚠️ No current offering found');
        return { monthly: null, yearly: null };
      }

      // Find packages by identifier
      const monthly = currentOffering.availablePackages.find(pkg => 
        pkg.identifier === '$rc_monthly' || 
        pkg.product.identifier.includes('monthly')
      );

      const yearly = currentOffering.availablePackages.find(pkg => 
        pkg.identifier === '$rc_annual' || 
        pkg.product.identifier.toLowerCase().includes('yearly')
      );

      console.log('📦 Monthly:', monthly);
      console.log('📦 Yearly:', yearly);

      return {
        monthly: monthly?.product,
        yearly: yearly?.product
      };
    } catch (error) {
      console.error('❌ Error loading products:', error);
      return { monthly: null, yearly: null };
    }
  }

  async purchase(productId) {
    try {
      console.log('🛒 Purchasing product:', productId);
      
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering) {
        throw new Error('No offerings available');
      }

      // Find the package
      const pkg = currentOffering.availablePackages.find(p => 
        p.product.identifier === productId
      );

      if (!pkg) {
        throw new Error('Product not found in offering');
      }

      console.log('🛒 Purchasing package:', pkg);

      // Purchase
      const result = await Purchases.purchasePackage({
        aPackage: pkg
      });

      console.log('✅ Purchase successful:', result);

      // Determine subscription type from product ID
      const subscriptionType = productId.toLowerCase().includes('yearly') ? 'yearly' : 'monthly';

      // UPDATE FIREBASE WITH PREMIUM STATUS
      await this.updateFirebaseSubscription('premium', {
        subscriptionType: subscriptionType,
        subscriptionStartDate: new Date().toISOString()
      });

      // Reload user data
      if (window.reloadUserData) {
        window.reloadUserData();
      }

      return true;
    } catch (error) {
      console.error('❌ Purchase error:', error);
      throw error;
    }
  }

  async restore() {
    try {
      console.log('🔄 Restoring purchases...');
      
      const customerInfo = await Purchases.restorePurchases();
      
      console.log('✅ Restore complete:', customerInfo);

      const entitlements = customerInfo.customerInfo?.entitlements?.active || 
                          customerInfo.entitlements?.active || {};
      const hasActive = Object.keys(entitlements).length > 0;
      
      // UPDATE FIREBASE BASED ON SUBSCRIPTION STATUS
      if (hasActive) {
        await this.updateFirebaseSubscription('premium');
      } else {
        await this.updateFirebaseSubscription('free');
      }

      // Reload user data
      if (window.reloadUserData) {
        window.reloadUserData();
      }

      return hasActive;
    } catch (error) {
      console.error('❌ Restore error:', error);
      throw error;
    }
  }

  // CRITICAL: This syncs RevenueCat status with Firebase
  // Call this on app launch and app resume to catch expired subscriptions
  async syncSubscriptionStatus() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🔍 Syncing subscription status with RevenueCat...');
      
      const customerInfo = await Purchases.getCustomerInfo();
      
      // Handle different response structures
      const entitlements = customerInfo.customerInfo?.entitlements?.active || 
                          customerInfo.entitlements?.active || {};
      
      const hasActive = Object.keys(entitlements).length > 0;
      
      console.log('🔍 Has active subscription:', hasActive);
      console.log('🔍 Active entitlements:', entitlements);

      if (hasActive) {
        // User has active subscription - ensure Firebase reflects this
        await this.updateFirebaseSubscription('premium');
        return 'premium';
      } else {
        // No active subscription - set to free (handles expired/cancelled)
        await this.updateFirebaseSubscription('free', {
          subscriptionEndedAt: new Date().toISOString()
        });
        return 'free';
      }
    } catch (error) {
      console.error('❌ Error syncing subscription:', error);
      // Don't change Firebase status on error - keep current status
      return null;
    }
  }

  async checkActiveSubscriptions() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      
      const entitlements = customerInfo.customerInfo?.entitlements?.active || 
                          customerInfo.entitlements?.active || {};
      
      return Object.keys(entitlements).length > 0;
    } catch (error) {
      console.error('❌ Error checking subscriptions:', error);
      return false;
    }
  }
}

export default new IAPManager();