# 0.5.0 Filesystem Parser and Deleted-Candidate Audit

## Implemented

The new `filesystem` module performs read-only metadata parsing for NTFS, ext-family, FAT-family, and exFAT boot/superblock structures. NTFS parsing extracts bytes-per-sector, cluster geometry, MFT location, and record size. Ext parsing extracts superblock counts, block/inode sizes, volume name, and journal inode metadata. FAT and exFAT parsers extract boot geometry and allocation metadata.

The NTFS recovery command scans bounded MFT records from the parsed MFT location, identifies records whose in-use flag is clear, extracts resident `$FILE_NAME` names when structurally valid, hashes each candidate record, and writes quarantined record artifacts plus a recovery manifest. The operation is read-only against the source and does not mount or modify it.

Commands:

```text
recovery filesystem inspect IMAGE
recovery filesystem recover-deleted IMAGE OUTPUT
```

## Verification

The JavaScript suite passes thirteen tests. The suite includes synthetic MBR/GPT fixtures, GZIP extraction, NTFS boot and deleted-MFT candidate parsing, imaging, Rust parity, archive safety, audit verification, and existing regression coverage.

## Explicit limits

This is not yet a complete NTFS, ext, FAT, or exFAT filesystem implementation. Deleted candidates are metadata records; their data extents are not reconstructed. NTFS journal replay, `$UsnJrnl` reconstruction, ext journal/orphan recovery, directory-tree recovery, fragmented-file reconstruction, ACL/xattr recovery, and filesystem-specific carving remain future modules. GPT CRC validation and backup-header reconciliation also remain outstanding.
