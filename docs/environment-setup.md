# Environment setup

Prerequisites are Node.js 22.14.0, pnpm 11.15.1, and Git. Expo Go or an
Android development environment is optional for mobile device testing.
Firebase CLI is optional unless local emulators are needed.

Run `pnpm install` from the repository root. The web and mobile welcome screens
run without credentials. For Firebase-backed client development, copy the
relevant app `.env.example` to `.env.local` and fill in public Firebase web
configuration values. Service-account values and `GEMINI_API_KEY` must remain
server-side. No credentials are included.

The personalized cognitive assessment runs in the authenticated
`generateCognitiveAssessment` Firebase Function. Configure its server-only
Gemini secret with:

```

The Spark-compatible seeded assessment path does not need Gemini. Its source
catalog is [assessment-question-bank.json](../firebase/functions/src/data/assessment-question-bank.json).
Seed it with Firebase Admin credentials:

```powershell
gcloud auth application-default login
pnpm --filter @mantrix/firebase-functions build
pnpm --filter @mantrix/firebase-functions seed:assessment
npx firebase-tools deploy --only firestore:rules
```powershell
npx firebase-tools functions:secrets:set GEMINI_API_KEY
npx firebase-tools deploy --only functions
```
