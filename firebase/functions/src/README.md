# Trusted functions boundary

Cloud Functions will live here. Each callable or HTTP function must
independently authenticate and authorize its caller before accessing
privileged data or invoking server-side AI integrations. No functions are
The cognitive assessment callable is implemented in `src/index.ts`. It
requires the server-only `GEMINI_API_KEY` environment variable and writes
assessment drafts/results to `user-data/{uid}` through the Admin SDK.

Configure the secret before deploying:

```powershell
npx firebase-tools functions:secrets:set GEMINI_API_KEY
npx firebase-tools deploy --only functions
```

The repository project alias is `mantrix-edc02`. From the repository root,
deploy with:

```powershell
npx firebase-tools login
npx firebase-tools use mantrix-edc02
npx firebase-tools functions:secrets:set GEMINI_API_KEY
npx firebase-tools deploy --only functions
```

The seeded assessment bank does not require Gemini or Cloud Functions. Build
the Admin seed script, authenticate with Application Default Credentials, and
run it from the repository root:

```powershell
gcloud auth application-default login
pnpm --filter @mantrix/firebase-functions build
pnpm --filter @mantrix/firebase-functions seed:assessment
npx firebase-tools deploy --only firestore:rules
```

The script writes the checked-in JSON catalog to
`assessment-question-bank/{questionId}`. Students can read these documents;
only an admin profile can write them.
