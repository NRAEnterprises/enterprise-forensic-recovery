# 0.7.1 Project Reconstruction Audit

## Implemented

Project analysis now reconstructs bounded Python, Rust, and Node.js/TypeScript project evidence from inventory files. It groups marker files by root, preserves marker paths and hashes, extracts conservative dependency names, distinguishes evidence from execution, and emits deterministic `recovery.projects/v2` reports.

No package manager, compiler, interpreter, shell, or network operation is executed. Missing, malformed, or unreadable markers are surfaced as limitations.

## Verification

The existing seventeen-test suite remains green after integration. Package and clean-install verification is performed as part of the current progression release.

## Limits

This does not restore environments, resolve dependencies, rebuild binaries, execute project code, or claim reproducible builds. Monorepo semantics, cache recovery, secrets, and build-artifact correlation remain future work.
