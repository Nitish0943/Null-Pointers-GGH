# Environment setup

Prerequisites are Node.js 22.14.0, pnpm 11.15.1, and Git. Expo Go or an
Android development environment is optional for mobile device testing.
Firebase CLI is optional unless local emulators are needed.

Run `pnpm install` from the repository root. The web and mobile welcome screens
run without credentials. For Firebase-backed client development, copy the
relevant app `.env.example` to `.env.local` and fill in public Firebase web
configuration values. Service-account values and `GEMINI_API_KEY` must remain
server-side. No credentials are included.
