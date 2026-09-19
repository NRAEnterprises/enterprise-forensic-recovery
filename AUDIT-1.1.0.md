# 1.1.0 Evidence Integrity Easy-Win Audit

## Implemented

This block adds case-note hash-chain verification, deterministic artifact manifests, and standalone policy validation.

Commands:

```bash
recovery notes verify CASE-DIR
recovery manifest ARTIFACT-DIRECTORY
recovery policy validate POLICY.json
```

Manifests include relative paths, byte sizes, modification times, and SHA-256 hashes. Note verification checks both record hashes and previous-record links. Policy validation applies the existing normalization rules without requiring a case.

## Critical-risk review

The operations are read-only except for no operation: manifests are emitted to stdout and notes verification reads existing records only. Manifest hashing streams files in bounded chunks. Policy validation does not apply or persist changes.

## Limits

Manifests capture current filesystem state and do not provide hardware-backed signatures. Note verification detects tampering but does not identify the responsible actor. Policy validation is syntactic/semantic normalization, not an authorization decision.
