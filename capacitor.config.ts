import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.fortunetalk.app',
    appName: 'Fortune Talk',
    webDir: 'dist',
    plugins: {
        Permissions: {
            ios: {
                "microphone": "Microphone access is needed for voice chat."
            }
        }
    },
    ios: {
        scheme: 'fortunetalk'
    }
};

export default config;
