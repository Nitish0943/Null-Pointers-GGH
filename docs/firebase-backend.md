# Firebase backend

Firestore and Storage default-deny rules are intentionally non-permissive
until authentication, role authorization, and rules tests exist. Functions
are reserved for trusted server-side work and must independently authorize
every request. Project identifiers and credentials require manual setup.

The root `firebase.json` configures Authentication, Firestore, Storage,
Functions, and Emulator UI ports for local development. Run
`pnpm firebase:emulators` after installing the Firebase CLI. The emulator
project alias is `mantrix-local`; no deployment is configured.
