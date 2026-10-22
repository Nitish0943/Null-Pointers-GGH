# Security plan

Authentication, role-based authorization, audit logging, Firebase rules,
Storage rules, and trusted-function authorization must be designed and tested
before production use. The current default-deny rules are a safety baseline,
not production-ready authorization. Secrets must never enter client bundles
or source control.
