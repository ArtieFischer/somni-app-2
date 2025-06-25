// Temporary mock for react-native-share during development
// This allows the app to run in Expo Go without the native module

export const ShareMock = {
  Social: {
    TWITTER: 'twitter',
    INSTAGRAM_STORIES: 'instagram-stories',
    INSTAGRAM: 'instagram',
    FACEBOOK: 'facebook',
    FACEBOOK_STORIES: 'facebook-stories',
    WHATSAPP: 'whatsapp',
    TELEGRAM: 'telegram',
    VIBER: 'viber',
  },
  
  shareSingle: async (options: any) => {
    console.log('Share mock: shareSingle called with', options);
    // Show an alert in development
    if (__DEV__) {
      alert(`Share to ${options.social} would be triggered in production`);
    }
    return Promise.resolve({ success: true });
  },
  
  open: async (options: any) => {
    console.log('Share mock: open called with', options);
    if (__DEV__) {
      alert('Share sheet would open in production');
    }
    return Promise.resolve({ success: true });
  },
  
  isPackageInstalled: async (packageName: string) => {
    console.log('Share mock: checking package', packageName);
    return Promise.resolve({ isInstalled: true, message: 'Mock - always returns true' });
  },
};

// Export as default to match react-native-share API
export default ShareMock;