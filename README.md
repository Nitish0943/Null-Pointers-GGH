# Mantrix

**Discover Your Path. Plan Your Future.**

Mantrix is an education and career guidance platform planned for students and
other education stakeholders. It will eventually combine assessment-led
guidance, career roadmaps, course and college discovery, scholarships,
education loans, mentors, learning resources, and opportunity tracking.

This repository is a runnable development foundation. The web welcome screen
and mobile welcome screen work now. Product features, authentication,
Firestore data access, AI calls, offline synchronization, and production
authorization are planned but not implemented.

## Architecture and technology

| Area             | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| Repository       | pnpm 11.15.1 workspace                                |
| Runtime          | Node.js 22.14.0 or newer                              |
| Web              | Next.js 16.4.2, React 19.3.1, TypeScript 7.0.2        |
| Mobile           | Expo 58, Expo Router, React Native 0.88.0, TypeScript |
| Backend boundary | Firebase configuration and Cloud Functions structure  |
| Data and storage | Cloud Firestore and Cloud Storage rules structure     |
| Client SDK       | Firebase JavaScript SDK 13.1.0                        |
| Formatting       | Prettier 3.9.10                                       |

The web and mobile apps are separate applications. They are designed to share
domain packages and one Firebase project; privileged operations will run only
in trusted Cloud Functions.

## Prerequisites

Required:

- Node.js 22.14.0 or newer
- pnpm 11.15.1 (`corepack enable` can manage the package manager)
- Git

Optional:

- Expo Go for testing on a physical phone
- Android Studio, Android SDK, and an emulator for Android development
- Xcode for iOS development on macOS
- Firebase CLI for local emulators

The current foundation does not require Firebase credentials to start either
welcome screen.

## Installation

Use the repository URL supplied by your project owner:

```bash
git clone <repository-url>
cd solid-computing-machine
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm install
```

If Corepack is unavailable, install pnpm 11.15.1 using the official pnpm
installation method. Do not commit generated `.env.local` files.

## Environment configuration

The root [`.env.example`](.env.example) documents both public client values
and server-only values. App-specific examples are available at
[`apps/web/.env.example`](apps/web/.env.example) and
[`apps/mobile/.env.example`](apps/mobile/.env.example).

For web Firebase development:

```bash
copy apps\web\.env.example apps\web\.env.local
```

For Expo development, configure the `EXPO_PUBLIC_*` values using Expo's local
environment workflow. These values are intended for the client bundle and are
not secrets. They do not replace Firebase Authentication, Firestore rules,
Storage rules, or server-side authorization.

Never place `FIREBASE_PRIVATE_KEY`, service-account credentials, or
`GEMINI_API_KEY` in a web/mobile environment file or client bundle. Those
values belong only in trusted server-side deployment configuration. The
welcome screens run without any of these variables.

## Run the web application

```bash
pnpm dev:web
```

Open <http://localhost:3000>. Stop the server with `Ctrl+C`. If port 3000 is
occupied, use `pnpm --filter @mantrix/web dev -- -p 3001` and open port 3001.

Build and start the production web bundle after dependencies and configuration
are available:

```bash
pnpm build:web
pnpm --filter @mantrix/web start
```

## Run the mobile application

```bash
pnpm dev:mobile
```

Expo prints a development QR code. Scan it with Expo Go on a phone connected
to the same network. Use the Expo CLI interactive menu to select an Android
emulator, or run:

```bash
pnpm --filter @mantrix/mobile android
```

LAN discovery may fail on restricted networks. Use the Expo CLI tunnel mode
when appropriate, or ensure the phone and computer share a reachable network.
Expo Go compatibility depends on the installed Expo SDK; use a development
build when the project SDK and Expo Go version do not match.

## Run both applications

Use two terminals:

```bash
# Terminal 1
pnpm dev:web

# Terminal 2
pnpm dev:mobile
```

The root scripts intentionally do not add a process-concurrency dependency.

## Firebase local development

Install the Firebase CLI only if emulator work is needed, then run:

```bash
pnpm firebase:emulators
```

The configuration in [`firebase.json`](firebase.json) reserves ports for
Authentication (`9099`), Firestore (`8080`), Storage (`9199`), Functions
(`5001`), and Emulator UI (`4000`). The local alias in [`.firebaserc`](.firebaserc)
is `mantrix-local`; it is not a deployed project.

The starter Firestore and Storage rules deny access by default. They are a
safety baseline, not production authorization. Implement and test identity,
role checks, audit logging, and trusted-function authorization before using a
shared development or production project.

## Project structure

- [`apps/web`](apps/web): Next.js App Router web application.
- [`apps/mobile`](apps/mobile): Expo Router mobile application.
- [`packages/shared`](packages/shared): platform-neutral utilities.
- [`packages/types`](packages/types): shared domain type contracts.
- [`packages/validation`](packages/validation): shared validation schemas.
- [`packages/config`](packages/config): reusable development configuration.
- [`packages/firebase`](packages/firebase): shared Firebase boundary definitions.
- [`firebase`](firebase): rules, indexes, emulator configuration, and functions.
- [`docs`](docs): architecture, security, setup, and implementation guidance.
- [`scripts`](scripts): reserved location for safe repository automation.

## Development workflow

Add a feature as a vertical slice. Put web presentation and routing in
`apps/web`, mobile presentation in `apps/mobile`, platform-neutral contracts
in shared packages, and trusted data access in `firebase/functions`. Import
shared packages by their `@mantrix/*` names rather than duplicating contracts.

Keep browser and mobile SDK setup separate from privileged Admin SDK code.
Validate untrusted input at trusted boundaries, independently authorize every
privileged function request, and document any offline conflict behavior before
implementing synchronization.

## Available scripts

| Command                   | Purpose                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `pnpm dev:web`            | Start the Next.js development server.                             |
| `pnpm dev:mobile`         | Start the Expo development server.                                |
| `pnpm build:web`          | Build the web application.                                        |
| `pnpm typecheck`          | Type-check all workspace projects.                                |
| `pnpm lint`               | Run configured Prettier-based checks in workspace projects.       |
| `pnpm format`             | Format supported repository files with Prettier.                  |
| `pnpm format:check`       | Check formatting across the repository.                           |
| `pnpm test`               | Run configured workspace test commands; no real suites exist yet. |
| `pnpm firebase:emulators` | Start configured Firebase emulators.                              |

Application-specific commands are listed in
[`apps/web/package.json`](apps/web/package.json) and
[`apps/mobile/package.json`](apps/mobile/package.json).

## Troubleshooting

- **Node mismatch:** check `node --version` and use `.nvmrc` or a Node version
  manager to select 22.14.0 or newer.
- **pnpm not found:** run `corepack enable`, then activate pnpm 11.15.1.
- **Install errors:** remove only the local `node_modules` directory and rerun
  `pnpm install`; do not delete lockfiles to bypass resolution.
- **Workspace resolution errors:** run commands from the repository root and
  confirm the package name matches the `@mantrix/*` manifest name.
- **TypeScript errors:** run `pnpm typecheck` and fix the first reported
  workspace error before addressing downstream errors.
- **Port conflicts:** pass a different Next.js port or change the documented
  emulator port only with a corresponding local configuration update.
- **Expo QR/network issues:** verify LAN reachability, firewall permissions,
  and Expo Go SDK compatibility; try Expo tunnel mode when appropriate.
- **Firebase initialization errors:** verify all required public variables are
  present and prefixed correctly. Client initialization returns no app when
  configuration is incomplete.
- **Missing secrets:** the welcome screens do not require secrets. Configure
  server-only values only when implementing the corresponding backend feature.
- **Emulator startup failures:** install the Firebase CLI, check Java/runtime
  prerequisites, and ensure the configured ports are free.

## Current implementation status

### Working foundation

- [x] pnpm monorepo and lockfile
- [x] Web welcome screen and responsive shell
- [x] Mobile Expo welcome screen
- [x] Shared package boundaries
- [x] Firebase rules, indexes, functions, and emulator configuration
- [x] Environment examples without secrets
- [x] TypeScript and formatting checks

### Configured integration boundaries

- [x] Optional web Firebase client initialization
- [x] Optional mobile Firebase client initialization
- [x] Trusted Functions package boundary
- [x] Default-deny Firestore and Storage starter rules

### Planned and not implemented

- [ ] Authentication and role-based authorization
- [ ] Student onboarding and cognitive assessment
- [ ] Career, course, college, scholarship, loan, mentor, and opportunity features
- [ ] Firestore data models and application APIs
- [ ] Gemini prompts, model calls, and AI safety validation
- [ ] SQLite persistence and synchronization
- [ ] Production rules, audit logging, and deployment
- [ ] Automated application and Firebase rules test suites

### Developer setup still required

- [ ] Firebase project and public client configuration
- [ ] Server-only service-account configuration when backend work begins
- [ ] Gemini API key when trusted AI work begins
- [ ] Firebase CLI and emulator runtime when local backend testing begins

## Security and contribution guidelines

Never commit secrets, `.env.local` files, service-account JSON, private keys, or
API keys. Use focused branches and descriptive commits. Before proposing a
change, run `pnpm typecheck`, `pnpm lint`, and the narrowest relevant build or
test command. Do not deploy, publish, or push changes from this foundation
without project-owner approval. Report security concerns privately to the
project maintainers rather than opening a public issue with exploit details.

## License

No license has been selected for this repository yet. Do not assume permission
to copy, modify, or distribute it until the project owners add a license.
