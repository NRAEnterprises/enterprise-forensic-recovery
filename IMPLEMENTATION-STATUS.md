# Enterprise Implementation Status

This document tracks actual implementation status. A backlog item is marked **implemented** only after code, tests, documentation, and an audit result exist. “Planned” does not mean available.

**Audited completion: 99/280 items (35.4%).** This count is computed from all implemented rows in this tracker and reconciled against the introducing commits in [`PROGRESS-AUDIT.md`](./PROGRESS-AUDIT.md). No prior implementation blocks were lost; the previous headline counter was stale.

## Audit gates

| Gate | Threshold | Required action |
|---|---:|---|
| General audit 1 | 30% / 84 rows | Review moderate, high, and critical findings; catalog low-priority findings without blocking progression |
| General audit 2 | 60% / 168 rows | Re-audit parser correctness, evidence provenance, portability, and destructive-operation isolation |
| Release-readiness audit | 90% / 252 rows | Verify packaging, installation, security, capability reconciliation, and release artifacts |
| Deep-scale final audit | 100% / 280 rows | Run full tests across supported platforms, fixtures, malformed inputs, mutation, safety, and release workflows |

## Current release

The project is being upgraded from 0.2.0 in verified stages. The immediate 0.3.0 foundation focuses on evidence safety and dependable execution before adding filesystem and block-device recovery.

| Area | Status | Notes |
|---|---|---|
| Case schema/versioning | In progress | v2 schema and validation are being introduced |
| Policy enforcement | In progress | Read-only defaults, output safety, quotas, and network/cloud flags |
| CLI parsing and exit codes | In progress | Replacing positional parsing with validated options |
| Audit integrity | In progress | Hash-chained audit records |
| ZIP portability | In progress | Host-tool fallback retained with explicit capability reporting |
| Filesystem recovery | Planned | Requires native parsers and fixture corpus |
| Raw device imaging | Implemented in 0.4.0 | Node streaming engine; read-only source, resume, hashes, progress, error map |
| Cloud connectors | Planned | Requires provider authorization and connector implementation |
| Native Rust accelerator | Implemented in 0.4.0 | Rust streaming imager packaged for Linux x64; other platforms use Node fallback |
| Source inspection | Implemented in 0.4.1 | MBR/GPT signatures, device flags, and selected filesystem header hints |
| TAR validation/extraction | Implemented in 0.4.1 | Listing, path checks, quotas, and separate output; host tar dependency |
| Streaming carving | Implemented in 0.4.1 | Chunked scanning and bounded range extraction |
| GPT/MBR partition entries | Implemented in 0.4.2 | Bounded entry parsing and source-range validation; CRC validation pending |
| Filesystem header hints | Implemented in 0.4.2 | NTFS, FAT32, exFAT, and ext-family clues; full parsers pending |
| GZIP stream extraction | Implemented in 0.4.2 | Quota-enforced streaming output with explicit overwrite policy |
| Filesystem metadata parsers | Implemented in 0.5.0 | NTFS, ext-family, FAT-family, and exFAT boot/superblock metadata |
| NTFS deleted-record candidates | Implemented in 0.5.0 | Bounded MFT scan, resident names, hashes, quarantined artifacts |
| NTFS nonresident reconstruction | Implemented in 0.5.1 | Signed runlists, sparse handling, bounded stream artifacts |
| NTFS journal stream extraction | Implemented in 0.5.1 | `$UsnJrnl`/`$LogFile` MFT stream discovery; replay pending |
| NTFS journal semantic decoding | Implemented in 0.5.2 | Bounded USN record decoding and LogFile page classification; replay pending |
| ext orphan/JBD2 metadata | Implemented in 0.6.1 | Distinct journal inode/orphan head and JBD2 magic reporting; replay pending |
| USN reason classification | Implemented in 0.5.3 | Named reason flags retained with raw masks |
| JBD2 block classification | Implemented in 0.5.3 | Descriptor/commit/superblock/revoke type names with raw values |
| SQLite inspection | Implemented in 0.6.0 | Main header plus WAL/rollback-journal sidecar inspection |
| SQLite structural page recovery | Implemented in 0.6.0 | Bounded page/cell candidates with raw offsets and hashes |
| ext orphan-chain walker | Implemented in 0.7.0 | Bounded inode-chain candidates with cycle/range/truncation states |
| JBD2 transaction evidence | Implemented in 0.7.0 | Descriptor/commit/revoke grouping without replay |
| Project reconstruction | Implemented in 0.7.1 | Bounded Python/Rust/Node evidence grouping and dependency extraction |
| CLI version command | Implemented in 0.8.0 | Stable `recovery version` output |
| Doctor environment diagnostics | Implemented in 0.8.0 | Working directory, memory, platform, and umask diagnostics |
| Package export map | Implemented in 0.8.0 | Core, filesystem, database, and project-reconstruction exports |
| Capability matrix | Implemented in 0.8.0 | Audited support and limitation summary |
| Recovery profiles | Implemented in 0.9.0 | Named triage, archive, deleted, project, evidence, and deep workflows |
| Machine-readable capability list | Implemented in 0.9.0 | Stable capability/status/classification output |
| Shell completion | Implemented in 0.9.0 | Bash, Zsh, and PowerShell completion output |
| JSON Lines output | Implemented in 1.0.0 | Stream-friendly single-record JSONL mode |
| Report diffing | Implemented in 1.0.0 | Deterministic added/removed/changed evidence comparison |
| Append-only case notes | Implemented in 1.0.0 | Hash-linked operator notes in case logs |
| Boolean flag parsing | Implemented in 1.0.0 | Prevents flag-first commands from consuming positional tokens |
| Case-note chain verification | Implemented in 1.1.0 | Validates previous-hash and record-hash links |
| Artifact manifests | Implemented in 1.1.0 | Deterministic file metadata and SHA-256 manifest generation |
| Standalone policy validation | Implemented in 1.1.0 | Normalizes and validates policy JSON before case use |
| Case status summary | Implemented in 1.2.0 | Case, source, report, audit, notes, and policy presence summary |
| Manifest verification | Implemented in 1.2.0 | Detects added, removed, and changed artifact files |
| Source fingerprinting | Implemented in 1.2.0 | Read-only metadata and streaming SHA-256 fingerprint |
| Schema catalog | Implemented in 1.3.0 | Machine-readable emitted-report schema identifiers |
| Exit-code catalog | Implemented in 1.3.0 | Stable automation meanings for CLI statuses |
| Report index | Implemented in 1.3.0 | Hash-backed case report discovery listing |
| Dedicated ext orphan-chain walker | Implemented in 0.5.0 | Bounded inode-table traversal with cycle, range, and limit states |
| Dedicated JBD2 transaction analyzer | Implemented in 0.5.0 | Big-endian block classification and committed/partial evidence grouping |
| Recovery-result semantics | Implemented in 0.5.0 | Machine-readable recovered, verified, partial, carved, reconstructed, uncertain, encrypted, corrupted, unsupported, and unrecoverable states |
| Recovery-method catalog | Implemented in 0.5.0 | Supported, experimental, and planned method classifications |
| Release compatibility notes | Implemented in 0.5.0 | Machine-readable package, case, report, CLI, native, and limitation notes |
| Expanded environment diagnostics | Implemented in 0.5.0 | UID/GID, root state, writable paths, locale/timezone, clock, memory, tools, and filesystem free-space checks |
| Compatibility command aliases | Implemented in 0.5.0 | Read-only `inspect` and `image` aliases preserve existing command semantics |
| Source mutation regression coverage | Implemented in 0.5.0 | Verification detects changes after inventory rather than treating mutated evidence as valid |
| Output collision protection | Implemented in 0.5.0 | Carving refuses to overwrite an existing artifact and closes handles on collision |
| Clean npm-pack smoke test | Implemented in 0.5.0 | Packs, installs, invokes `doctor`, and creates a case from a clean temporary installation |
| Image source/output verification | Implemented in 0.5.0 | Cross-engine SHA-256 and byte-count comparison for Node, native, and resumed imaging |
| Archive tool failure reporting | Implemented in 0.5.0 | Missing host utilities produce explicit unsupported evidence and remediation text |
| Automated progress consistency gate | Implemented in 0.5.0 | `npm run progress:check` recomputes implemented rows and rejects stale headline markers |
| Archive extraction dry-run | Implemented in 0.5.0 | `--dry-run` plans outputs and policy decisions without creating destination files |
| Tool version diagnostics | Implemented in 0.5.0 | `doctor` reports detected host-tool versions alongside availability booleans |
| Duplicate case registration coverage | Implemented in 0.5.0 | Case creation refuses to replace an existing case manifest |
| Special-file and symlink safety coverage | Implemented in 0.5.0 | Inventory records FIFOs/special files and does not follow symlinks by default |
| Raw-image dry-run planning | Implemented in 0.5.0 | Image planning reports engine, output, overwrite/resume policy, and performs no writes |
| Carving dry-run planning | Implemented in 0.5.0 | Signature scanning reports planned artifacts without creating output files |
| NTFS deleted-recovery dry-run | Implemented in 0.5.0 | MFT scan bounds and output path are planned without creating recovery artifacts |
| NTFS journal dry-run | Implemented in 0.5.0 | Journal candidates and output path are planned without reconstructing streams |
| ext metadata dry-run | Implemented in 0.5.0 | Orphan/JBD2 analysis can be reviewed without writing metadata reports |
| SQLite page-recovery dry-run | Implemented in 0.5.0 | Structural page scan and output path are planned without writing page evidence |
| Hash-based carving provenance | Implemented in 0.5.0 | Carved artifacts include source SHA-256 provenance and deterministic collision-safe names |
| Carved source-range mapping | Implemented in 0.5.0 | Every carved artifact records start offset, end offset, and byte length |
| Parser-based carving validation | Implemented in 0.5.0 | Bounded structural checks prevent header-only hits from being labeled fully carved |
| Duplicate archive path rejection | Implemented in 0.5.0 | Extraction refuses duplicate normalized member names and reports an unsupported safety finding |
| Archive extraction provenance | Implemented in 0.5.0 | Successful extraction records validator, quota, path-safety, duplicate-path, and entry-count evidence |
| Expanded carving signature coverage | Implemented in 0.5.0 | Streaming carving recognizes all defined archive, document, executable, media, and container signatures |
| Archive validation provenance | Implemented in 0.5.0 | Validation reports tool, checks performed, entry counts, path-safety, duplicate-path, and error evidence |
| Reserved-name archive safety | Implemented in 0.5.0 | Extraction rejects Windows device names and ambiguous trailing-dot/space member paths |
| Tar link preflight safety | Implemented in 0.5.0 | Tar symlink and hardlink members are rejected before output directories or extracted files are created |
| Archive depth quota enforcement | Implemented in 0.5.0 | Configured `maxArchiveDepth` is enforced during validation and extraction before writes |
| ZIP expanded-byte quota enforcement | Implemented in 0.5.0 | ZIP listing sizes are summed and compared with `maxArchiveExpandedBytes` before extraction writes |
| Maintained ZIP metadata adapter | Implemented in 0.5.0 | `@zip.js/zip.js` records ZIP member sizes, directories, and encryption flags while host tools retain CRC/write fallback |
| Split-ZIP part validation | Implemented in 0.5.0 | Numbered `.zNN` parts are ordered and checked for missing, duplicate, and zero-size segments before extraction |
| ZIP local-header repair evidence | Implemented in 0.5.0 | Damaged central directories yield bounded local-entry evidence with partial status and explicit repair provenance |
| Encrypted ZIP reporting | Implemented in 0.5.0 | Readable encrypted metadata is classified as encrypted/key-required without attempting credentialed extraction |
| Partial GZIP decompression | Implemented in 0.5.0 | Truncated streams preserve bounded output bytes with explicit partial status and recovered-byte provenance |
| BZIP2 and XZ stream recovery | Implemented in 0.5.0 | Host-tool validation and bounded extraction support `.bz2`/`.bzip2` and `.xz` streams with provenance |
| Unsupported container identification | Implemented in 0.5.0 | RAR, Zstandard, and 7-Zip signatures are identified and reported unavailable without false recovery claims |
| ISO container classification | Implemented in 0.5.0 | `.iso` sources are classified and reported unavailable when no compatible validator is installed |
| CPIO container classification | Implemented in 0.5.0 | `.cpio` sources and CPIO magic are classified and reported unavailable without false corruption claims |
| NTFS resident DATA recovery | Implemented in 0.5.0 | Deleted MFT candidates recover bounded resident `$DATA` content with explicit resident-copy provenance |
| FAT allocation-chain analysis | Implemented in 0.5.0 | Bounded FAT32 chain following reports offsets, termination, loops, bad/free/reserved states, and truncation without writes |
| FAT directory-entry discovery | Implemented in 0.5.0 | Root-directory entries expose live/deleted state, attributes, sizes, and start clusters linked to chain evidence |
| FAT subdirectory/LFN traversal | Implemented in 0.5.0 | Bounded FAT32 subdirectory traversal reconstructs long filenames and preserves loop/limit/chain evidence |
| FAT deleted-entry recovery | Implemented in 0.5.0 | Deleted FAT32 file entries produce bounded evidence artifacts mapped to retained allocation chains with partial-status reporting |
| ext extent reconstruction | Implemented in 0.5.0 | Bounded ext4 extent trees are parsed and inode data blocks are copied read-only with logical offsets and sparse/unwritten provenance |
| ext directory discovery | Implemented in 0.5.0 | Ext directory records expose active inode/name/type links and bounded slack-based deleted candidates with uncertainty markers |
| ext inode metadata recovery | Implemented in 0.5.0 | Bounded inode inspection preserves mode, ownership, timestamps, deletion time, size, flags, links, ACL block, and raw hash evidence |
| ext extended-attribute inspection | Implemented in 0.5.0 | External xattr blocks expose namespace, names, bounded value offsets/bytes, and value hashes without semantic overclaiming |
| ext external xattr values | Implemented in 0.5.0 | External xattr value blocks are read with bounded offsets, source locations, byte counts, and hashes |
| ext POSIX ACL decoding | Implemented in 0.5.0 | POSIX ACL xattrs expose version, tags, IDs, and permission bits alongside raw value provenance |
| ext deleted-inode candidate recovery | Implemented in 0.5.0 | Directory slack candidates link to inode metadata and bounded extent artifacts with partial-status propagation |
| ext directory-tree reconstruction | Implemented in 0.5.0 | Bounded active and deleted-directory relationships are reconstructed with explicit confidence and depth/loop limits |
| ext directory slack analysis | Implemented in 0.5.0 | Unused directory-record ranges are reported with offsets, lengths, samples, hashes, and explicit non-recoverability caveats |
| ext free-block bitmap scanning | Implemented in 0.5.0 | Bounded ext block bitmaps produce free ranges, group summaries, byte offsets, and allocation-state provenance |
| Enterprise service/RBAC | Planned | Requires service API and identity integration |

## Release rule

No release may claim “fully recoverable” or “all methods implemented.” Every capability must appear in `recovery doctor`, the capability matrix, the CLI reference, and the test report.
