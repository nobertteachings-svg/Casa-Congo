# Casa Mobile (Expo)

iOS + Android app for Casa Congo. Uses the same backend flows as WhatsApp.

## Quick start

```bash
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL
npm start
```

Scan the QR code with Expo Go, or press `i` / `a` for simulator.

## Login

1. Enter the WhatsApp number you used to sign up on Casa.
2. Receive a 6-digit code on WhatsApp.
3. Enter the code — you land in the same menu/search flows as WhatsApp.

## Production builds

Same Expo + Apple accounts as Casa Rwanda. Android is a **manual Play upload**.

```bash
cd mobile
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production
npx eas-cli build --platform android --profile production
```

Then download the `.aab` and upload it in Play Console → **Casa Congo** (`com.casahomesrdc.app`) → Create release. Do not run `eas submit --platform android`.
