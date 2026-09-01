# Sukoon

A private, multilingual emotional wellbeing companion with Firebase authentication, mood tracking, guided support sessions, session history, and weekly reports.

## Setup

1. Install dependencies with `npm install`.
2. Create a Firebase project and add a Web app.
3. Copy `.env.example` to `.env` and add the Firebase Web SDK configuration values.
4. In Firebase Authentication, enable **Email/Password** and **Google** sign-in.
5. Create a Cloud Firestore database and publish `firestore.rules` (`firebase deploy --only firestore:rules`).
6. Add `localhost` and your production hostname under Firebase Authentication → Settings → Authorized domains.
7. Start locally with `npm run dev`.

## Live app

The production web app is hosted at **https://sukoon-ai-therapy.web.app**.

## Android APK

- Run `npm run android:apk` to rebuild the Android debug APK.
- The native project lives in `android/` and uses the package name `com.sukoon.ai`.
- Google sign-in uses native Firebase Authentication on Android.
- Voice input uses Android's native speech recognizer and requests microphone permission when a voice call starts.
- The generated APK is available at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Important safety and production note

The included conversational responder is a safe, deterministic MVP designed to demonstrate the session experience. Before offering the app as a real mental-health product, connect the UI to a server-side AI service with professional clinical review, regional crisis resources, consent flows, data-retention controls, and a formal privacy/security assessment. Never put a private AI API key in Vite client environment variables.

## Data model

- `users/{uid}` — account profile
- `users/{uid}/moods/{moodId}` — mood check-ins
- `users/{uid}/sessions/{sessionId}` — completed session transcript, mood shift, and summary
