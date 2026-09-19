# 0.4.1 Consecutive Recovery Batch Audit

## Implemented

This batch adds source inspection without mounting or modifying the source. The inspection reports size, mode, block/character-device flags, MBR and GPT signatures, selected NTFS/FAT/exFAT header hints, and a leading-file signature.

Archive discovery now recognizes TAR and GZIP from extensions when a leading signature is unavailable. TAR listing and extraction use host `tar` with entry-path validation, entry-count quotas, and reduced metadata restoration. ZIP extraction retains its prior validation path. GZIP is validated with `gzip -t`; stream extraction remains a future sub-batch.

Carving no longer loads an entire input into memory. It scans in bounded chunks with signature overlap, then copies each carved range through bounded positional reads. Artifact status reflects whether the complete requested range was copied.

## Verification

The JavaScript suite passes ten tests. Existing imaging, Rust parity, audit-chain, policy, extraction-safety, and carving tests remain green. A synthetic TAR fixture passed validation and extraction end-to-end. Source inspection correctly detected an MBR signature in a synthetic image without mounting it.

## Known limitations

The current partition and filesystem checks are header hints, not complete partition or filesystem parsers. GPT backup headers, partition entries, filesystem geometry, journal analysis, and volume discovery remain future work. TAR extraction still depends on the host `tar` command and requires a deeper type-aware preflight to reject symlink entries before the extractor creates them. GZIP validation is implemented, but safe single-stream extraction has not yet been added. Carving still uses a bounded list of signature types and does not reconstruct fragmented files.
