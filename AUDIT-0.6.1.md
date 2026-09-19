# 0.6.1 ext Metadata Field-Semantics Audit

## Implemented

The ext-family metadata report now distinguishes `s_journal_inum` from `s_last_orphan`. The former is reported as `journalInode`; the latter is reported as `orphanHead`. This prevents the journal inode from being mislabeled as an orphan candidate.

## Verification

The synthetic ext fixture now sets distinct values for both fields and asserts that the report preserves them independently. The complete JavaScript suite passes seventeen tests, including SQLite structural recovery and all prior NTFS, journal, archive, imaging, native, and safety coverage.

## Limits

`orphanHead` is only the beginning of a possible orphan chain. This correction does not yet walk inode-table chains, validate group descriptors, reconstruct file content, or replay JBD2 transactions.
