# Web application

The web app is a Next.js App Router application. Run it from the repository
root with `pnpm dev:web`, then open `http://localhost:3000`.

The homepage is a real, credential-free foundation screen. Firebase client
initialization is centralized in `src/lib/firebase-client.ts` and returns
`null` when public configuration is incomplete. Copy `.env.example` to
`.env.local` only when Firebase-backed development begins.

Route groups and feature directories are reserved for future vertical slices;
product behavior is not implemented.
