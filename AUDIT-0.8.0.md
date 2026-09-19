# 0.8.0 Easy-Win Operations Audit

## Implemented

This progression block adds a stable `recovery version` command, doctor environment diagnostics, explicit package subpath exports, `sideEffects: false`, a reproducible `ci:check` script, and a capability matrix documenting audited depth and limits.

## Critical-risk review

No critical vulnerability was introduced by these changes. Diagnostics are read-only. Package exports expose existing local modules only. The package script performs standard local npm verification and does not contact external services beyond npm's normal dependency resolution when explicitly invoked by an operator.

## Limits

The capability matrix is a release-document artifact and is not a substitute for per-case provenance or a complete production support matrix. Full cross-platform and multi-version CI remains pending.
