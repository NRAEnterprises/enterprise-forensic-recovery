# 1.2.0 Provenance Easy-Win Audit

## Implemented

This block adds concise case-status summaries, artifact-manifest verification, and read-only source fingerprinting.

Commands:

```bash
recovery case status CASE-DIR
recovery manifest verify DIRECTORY MANIFEST.json
recovery fingerprint SOURCE
```

Manifest verification detects added, removed, and changed files by comparing current streaming SHA-256 results with a prior manifest. Fingerprinting reports source path, type, size, mode, modification time, and SHA-256 for regular files.

## Critical-risk review

All operations are read-only. Hashing is streamed in bounded chunks. The manifest verifier reports mismatches and never modifies the source or manifest.

## Limits

Modification times and modes are filesystem metadata, not immutable evidence. Fingerprinting directories reports metadata without recursively hashing them; use the artifact manifest for recursive directory evidence.
