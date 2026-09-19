# 0.4.2 Partition, Filesystem-Hint, and GZIP Audit

## Implemented

Source inspection now parses MBR partition entries and bounded GPT partition entries, including start/end LBAs, byte ranges, entry names, and whether each range is within the source size. Header-level hints include NTFS, FAT32, exFAT, and ext-family markers.

GZIP validation remains available through `gzip -t`, and safe single-stream extraction now uses a bounded streaming pipeline with an output quota from the case policy. Fresh output uses exclusive creation; replacement requires explicit `--overwrite`. Extraction reports source, output, byte count, and status.

## Verification

The regression suite passes twelve tests, including synthetic MBR and GPT fixtures, GZIP validation and extraction, imaging, native Rust parity, audit verification, archive safety, source inspection, and streaming carving. Existing package and native tests remain green.

## Known limitations

The partition parser is intentionally bounded and does not yet validate GPT CRCs, backup headers, protective MBR consistency, or full partition-type GUID catalogs. Filesystem results are header hints rather than filesystem parsers. GZIP extraction is for one decompressed stream; multi-member policy, decompressed content classification, and nested archive orchestration remain future work.
