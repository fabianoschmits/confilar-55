import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.87b4cc9e05db4d889da35d2d3c318fab',
  appName: 'ConfiLar',
  webDir: 'dist',
  server: {
    url: 'https://87b4cc9e-05db-4d88-9da3-5d2d3c318fab.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3B82F6',
      showSpinner: false
    }
  }
};

export default config;