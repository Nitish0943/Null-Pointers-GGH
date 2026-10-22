# Firebase backend

This directory contains the backend boundaries for Mantrix:

- `firestore/`: default-deny Firestore rules and future indexes.
- `storage/`: default-deny Cloud Storage rules.
- `functions/`: trusted server-side Cloud Functions.

## Local emulators

Install the Firebase CLI separately, then run `pnpm firebase:emulators`.
The configured local services are Authentication (`9099`), Firestore
(`8080`), Storage (`9199`), Functions (`5001`), and the Emulator UI (`4000`).
The local project alias is `mantrix-local`; it is not a production project.

The homepage and mobile welcome screen do not require Firebase credentials.
Do not deploy the starter rules or functions to a shared environment without
implementing and reviewing authentication and authorization.
