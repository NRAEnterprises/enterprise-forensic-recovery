# 0.7.0 ext Orphan and JBD2 Evidence Audit

## Implemented

The ext recovery path now walks a bounded orphan-chain candidate from `s_last_orphan`, resolves candidate inode-table offsets when group-descriptor geometry is available, detects cycles and out-of-range/truncated links, and records raw inode hashes and provenance. JBD2 magic hits are grouped into descriptor-to-commit evidence sequences with partial and orphan-commit statuses, while revoke counts and raw block metadata remain available.

This is evidence analysis only. No journal transaction is replayed and no source metadata is modified.

## Limits

External journals, checksum validation, 64-bit descriptor variants, extent-based file-content reconstruction, directory recovery, and inode-table repair remain unsupported. Orphan candidates do not prove deletion history or recoverable content.
