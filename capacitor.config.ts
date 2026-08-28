import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.sociobot.speakerlanecaptions',
  appName: 'Caption Lanes',
  webDir: 'dist',
  backgroundColor: '#0c1110',
  android: { backgroundColor: '#0c1110', allowMixedContent: false }
};

export default config;
