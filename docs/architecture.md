# Architecture

Mantrix has separate `apps/web` and `apps/mobile` clients. Both will consume
the domain packages and communicate with one Firebase backend. Trusted
operations, including future Gemini calls, belong in `firebase/functions`.
Feature behavior is not implemented in this phase.
