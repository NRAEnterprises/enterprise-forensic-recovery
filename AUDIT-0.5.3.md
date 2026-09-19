# 0.5.3 Journal Classification Audit

## Implemented

USN journal records now expose named reason flags alongside the original hexadecimal reason mask. The mapping covers create, delete, overwrite, truncation, rename, metadata, security, compression, encryption, reparse, stream, and close events without converting them into legal or operational conclusions.

JBD2 magic hits now include classified block types for descriptor, commit, superblock v1, superblock v2, and revoke blocks, with unknown types preserved as unknown. The raw offset, numeric type, and sequence remain available for independent review.

## Verification

The complete JavaScript suite passes sixteen tests, including direct USN reason-flag and JBD2 block-type fixtures. Existing filesystem, NTFS reconstruction, journal extraction, ext metadata, archive, imaging, native, and safety tests remain green.

## Limits

These are semantic classifications, not transaction replay. USN reason masks do not establish causality or legal conclusions. JBD2 block types are identified but journal transactions, inode updates, directory changes, and orphan chains are not replayed.
