# 0.3.0 Foundation Audit

## Scope

This audit covers the hardened foundation implemented after the 0.2.0 release. It does not certify filesystem recovery, raw-device imaging, cloud ingestion, native Rust acceleration, or distributed enterprise service features; those remain explicitly unavailable in `recovery doctor`.

## Verified results

The release passes seven automated tests covering case creation, read-only policy defaults, recursive inventory, signature detection, source hashing, source-mutation verification, duplicate-source rejection, unsafe output rejection, embedded-file carving, capability reporting, stable CLI usage errors, audit-chain verification, and archive extraction destination protection.

The package passes `npm install --package-lock-only`, `npm test`, and `npm pack --dry-run`. The packed contents contain the CLI, core engine, policy module, schema module, documentation, and license, while excluding case evidence and generated artifacts through repository/package rules.

## Foundation improvements now implemented

The case schema has a versioned v2 identifier and basic structural validation. New cases receive a separate read-only policy file. Audit events are hash chained from a `GENESIS` record and can be checked with `recovery audit verify`. Duplicate source registration is rejected. Extraction refuses destinations inside registered source paths. CLI errors have stable exit codes. CLI options are parsed consistently and policy inspection is available. Binary diagnostics are bounded to a maximum sample rather than reading an entire large file into memory.

ZIP extraction now lists entries before extraction, rejects absolute and traversal paths, enforces an entry-count quota, and records a partial or unsupported result instead of silently treating unsafe or failed extraction as recovered.

## Known limitations

The current engine still depends on host `unzip` for ZIP validation and extraction. It does not yet implement native archive parsing, filesystem-aware deleted-data recovery, raw-device imaging, partition parsing, forensic image formats, database-page recovery, cloud connectors, plugin isolation, service authentication, role-based access control, signed manifests, SBOM generation, fuzzing, or a cross-platform native build matrix.

Existing v1 case directories created by earlier releases are readable because the loader validates structure rather than requiring one exact schema string, but migration tooling and explicit schema upgrade commands are still needed. Existing pre-0.3.0 audit logs do not contain hash-chain fields and should be treated as legacy rather than silently certified by `recovery audit verify`.

## Release decision

The foundation is suitable for continued development and controlled synthetic-fixture testing. It is not yet suitable for claiming full enterprise forensic coverage or for treating every recovery result as complete. The next gate is portable archive handling and verified file-copy acquisition, followed by filesystem and block-device modules with independent test corpora.
