/**
 * 🎯 HapticService.js
 * Centralized haptic feedback for DateMaker
 * Makes the app feel alive and premium
 */

// Check if we're on a native platform
const isNative = () => {
  return window.Capacitor?.isNativePlatform?.() || false;
};

// Lazy load Capacitor Haptics
let HapticsModule = null;

const loadHaptics = async () => {
  if (HapticsModule) return HapticsModule;
  
  try {
    HapticsModule = await import('@capacitor/haptics');
    return HapticsModule;
  } catch (e) {
    console.log('Haptics not available');
    return null;
  }
};

/**
 * Light tap - for button presses, navigation
 */
export const tapLight = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics, ImpactStyle } = await loadHaptics();
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {}
};

/**
 * Medium tap - for confirmations, modal opens
 */
export const tapMedium = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics, ImpactStyle } = await loadHaptics();
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (e) {}
};

/**
 * Heavy tap - for important actions, celebrations
 */
export const tapHeavy = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics, ImpactStyle } = await loadHaptics();
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (e) {}
};

/**
 * Success notification - for saves, completions
 */
export const notifySuccess = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics, NotificationType } = await loadHaptics();
    await Haptics.notification({ type: NotificationType.Success });
  } catch (e) {}
};

/**
 * Warning notification - for alerts
 */
export const notifyWarning = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics, NotificationType } = await loadHaptics();
    await Haptics.notification({ type: NotificationType.Warning });
  } catch (e) {}
};

/**
 * Error notification - for failures
 */
export const notifyError = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics, NotificationType } = await loadHaptics();
    await Haptics.notification({ type: NotificationType.Error });
  } catch (e) {}
};

/**
 * Selection changed - for tab switches, picker changes
 */
export const selectionChanged = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics } = await loadHaptics();
    await Haptics.selectionChanged();
  } catch (e) {}
};

/**
 * Celebration pattern - for big moments!
 * Heavy + Medium + Light in sequence
 */
export const celebrate = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics, ImpactStyle, NotificationType } = await loadHaptics();
    
    // Success notification first
    await Haptics.notification({ type: NotificationType.Success });
    
    // Then impact pattern
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 150);
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Medium }), 300);
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Light }), 450);
  } catch (e) {}
};

/**
 * Double tap - for likes, favorites
 */
export const doubleTap = async () => {
  if (!isNative()) return;
  
  try {
    const { Haptics, ImpactStyle } = await loadHaptics();
    await Haptics.impact({ style: ImpactStyle.Medium });
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Light }), 100);
  } catch (e) {}
};

// Default export with all methods
const HapticService = {
  tapLight,
  tapMedium,
  tapHeavy,
  notifySuccess,
  notifyWarning,
  notifyError,
  selectionChanged,
  celebrate,
  doubleTap,
  isNative
};

export default HapticService;