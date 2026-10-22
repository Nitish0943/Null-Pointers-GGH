# Mobile application

The mobile app uses React Navigation with an explicit native stack. Run it
from the repository root with `pnpm dev:mobile`. The welcome screen is static
and works without Firebase credentials.

Useful recovery commands are `pnpm --filter @mantrix/mobile start:clear`,
`start:tunnel`, and `start:offline`. If Expo Go reports a Java
`IOException` while downloading a remote update, clear the cache first and
then use the tunnel command when the phone cannot reach the computer over
LAN. The offline command does not bypass the need for the phone to reach the
development server.

Firebase client initialization is centralized in
`src/shared/services/firebase-client.ts`.
The `database`, `storage`, `features/offline`, and `features/synchronization`
folders are boundaries for future SQLite and sync work; no offline mechanism
is implemented yet.
