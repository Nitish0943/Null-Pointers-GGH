# Mobile application

`apps/mobile` is an Expo application using an explicit React Navigation native
stack. Its navigation and feature folders reserve space for onboarding,
student, partner, mentor, and administrative experiences. Offline and
synchronization folders are structural only.

## Firebase setup

Copy `apps/mobile/.env.example` to the environment file used by the Expo
process and provide the six `EXPO_PUBLIC_FIREBASE_*` values from the Firebase
Web app configuration. These are public client identifiers; never put Admin
SDK credentials or private keys in this file.

The mobile client uses Firebase Authentication with React Native
`AsyncStorage` persistence and stores profiles in `users/{uid}`. Firestore
rules are maintained in `firebase/firestore/firestore.rules`; deploy them
through the Firebase CLI only after reviewing them against the target project.
Without Firebase configuration, the app can render its public screens but
authentication actions report a configuration error.
