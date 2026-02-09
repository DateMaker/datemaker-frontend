// adminConfig.js
// Admin accounts that get premium features for free

export const ADMIN_EMAILS = [
  'thedatemakerapp@outlook.com',
  'judetest10@outlook.com',
  'baileygander05@gmail.com',

];

// Check if user is an admin
export const isAdmin = (userEmail) => {
  if (!userEmail) return false;
  return ADMIN_EMAILS.includes(userEmail.toLowerCase());
};

// Check if user has premium access (admin OR paid subscriber)
export const hasPremiumAccess = (user, subscriptionStatus) => {
  // Admins always have access
  if (isAdmin(user?.email)) {
    return true;
  }
  
  // Otherwise check subscription
  return subscriptionStatus === 'premium' || subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
};