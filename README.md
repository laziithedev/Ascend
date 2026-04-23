# Ascend — React Native App

Built with Expo. Ready for App Store and Google Play.

## Run locally

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone to preview instantly.

## Build for stores

Install EAS CLI first:
```bash
npm install -g eas-cli
eas login
```

### iOS (App Store)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android (Google Play)
```bash
eas build --platform android --profile production
eas submit --platform android
```

### Internal test build (no store account needed)
```bash
eas build --platform all --profile preview
```

## Before submitting

1. Replace `your-eas-project-id` in `app.json` with your real EAS project ID (`eas init`)
2. Fill in your Apple ID / Team ID in `eas.json` for iOS
3. Add your Google Play service account key for Android
4. Add a real app icon to `assets/icon.png` (1024×1024)
5. Update the splash screen `assets/splash-icon.png`
