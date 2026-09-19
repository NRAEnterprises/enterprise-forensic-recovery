# 0.5.1 NTFS Reconstruction and Journal Audit

## Implemented

NTFS attributes are now parsed for resident names and nonresident `$DATA` streams. Runlists decode signed LCN deltas, VCN ranges, sparse runs, real size, and allocated size. Deleted-record recovery reconstructs bounded stream artifacts using positional reads from the source image, zero-fills sparse runs through preallocation, hashes and preserves the original record, and reports incomplete or partial extents rather than guessing.

Journal recovery discovers MFT records named `$UsnJrnl` or `$LogFile`, extracts their nonresident data streams using the same bounded runlist path, and writes a journal manifest with record provenance and completeness. The CLI commands are:

```text
recovery filesystem recover-deleted IMAGE OUTPUT
recovery filesystem recover-journals IMAGE OUTPUT
```

## Verification

The JavaScript suite passes fourteen tests. New coverage uses a synthetic NTFS image with a signed nonresident runlist, a deleted MFT record, and a named `$UsnJrnl` stream. The recovered stream content matches the source extent, and journal discovery returns the extracted stream. Existing parser, archive, imaging, Rust parity, audit, and clean-install coverage remains green.

## Explicit limits

This is bounded stream reconstruction, not complete NTFS recovery. It does not replay `$UsnJrnl` records or `$LogFile` transactions, rebuild directory trees, resolve fragmented references across extension records, decode NTFS compression or encryption, validate all fixup arrays, or reconstruct data when runlists are missing or corrupt. Sparse extents are zero-filled and bad reads produce partial results. The source is never modified.
