# iOS Development Guide

This project has been configured for iOS development using Capacitor.

## Prerequisites

- Xcode (installed on your Mac)
- CocoaPods (if required by some plugins, though Capacitor uses SPM mostly now)

## How to Run on iOS

1.  **Sync Web Assets**:
    If you make changes to the web code (`src/*`), you need to rebuild and sync:
    ```bash
    npm run build
    npx cap sync
    ```

2.  **Open in Xcode**:
    ```bash
    npx cap open ios
    ```

3.  **Run in Xcode**:
    - Select your target device (Simulator or connected iPhone).
    - Click the "Play" button (Run).

## Permissions

For Voice Chat features, Microphone usage is required. This has been configured in `ios/App/App/Info.plist`:
- `NSMicrophoneUsageDescription`: "音声チャット機能を使用するためにマイクへのアクセスが必要です。"

## PWA (Progressive Web App)

A `manifest.json` has also been added to `public/`. If you deploy this web app (e.g. to Vercel/Netlify), users can "Add to Home Screen" on iOS Safari to get an app-like experience without an App Store install.
