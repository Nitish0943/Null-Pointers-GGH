# Mobile application

The mobile app is an Expo Router application. Run it from the repository root
with `pnpm dev:mobile`. The welcome screen is static and works without network
access or Firebase credentials.

Firebase client initialization is centralized in `src/lib/firebase-client.ts`.
The `database`, `storage`, `features/offline`, and `features/synchronization`
folders are boundaries for future SQLite and sync work; no offline mechanism
is implemented yet.
