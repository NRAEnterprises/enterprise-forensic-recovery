# 0.5.0 ext Orphan-Chain and JBD2 Analyzer Audit

## Implemented

The ext recovery path now uses a dedicated `src/ext-journal.js` module. It validates the ext superblock, resolves bounded inode-table locations, walks the orphan chain through inode deletion-time links, detects cycles and out-of-range references, applies candidate limits, and preserves inode metadata hashes.

The JBD2 analyzer uses the on-disk big-endian magic and fields, classifies descriptor, commit, superblock, and revoke blocks, and groups evidence into committed, partial, orphan-commit, and revoked-block transaction states.

The public report is schema `recovery.ext-metadata/v4` and retains compatibility aliases for `journalMagicHits` and `jbd2Transactions`. The package version is 0.5.0 and exports `./ext-journal`.

## Verification

The complete Node test suite passes with 18 tests, including direct synthetic coverage for a two-inode orphan chain and a descriptor/revoke/commit JBD2 transaction group.

## Explicit limits

This is evidence analysis, not journal replay. The implementation does not resolve external journal devices, validate all ext4 checksum variants, reconstruct extents into recovered files, restore directory names, or claim that an orphan inode is recoverable content.
