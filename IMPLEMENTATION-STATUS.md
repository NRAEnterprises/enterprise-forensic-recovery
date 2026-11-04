# Enterprise Implementation Status

This document tracks actual implementation status. A backlog item is marked **implemented** only after code, tests, documentation, and an audit result exist. “Planned” does not mean available.

**Audited completion: 196/280 items (70.0%).** This count is computed from all implemented rows in this tracker and reconciled against the introducing commits in [`PROGRESS-AUDIT.md`](./PROGRESS-AUDIT.md). The 16 modern-filesystem evidence rows promoted at the 70% milestone have permanent matrix coverage and read-only source-hash verification.

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
| ext free-inode bitmap scanning | Implemented in 0.5.0 | Bounded ext inode bitmaps produce free inode ranges, group summaries, and allocation-state provenance |
| ext deleted-inode table scanning | Implemented in 0.5.0 | Bounded inode-table scans report deletion-time and zero-link candidates with offsets, metadata, and raw hashes |
| ext extra timestamp decoding | Implemented in 0.5.0 | Inode metadata exposes nanoseconds and extended epoch bits while preserving ISO/string compatibility |
| ext high UID/GID decoding | Implemented in 0.5.0 | Inode metadata exposes low/high ownership components and reconstructed 32-bit UID/GID values |
| APFS header inspection | Implemented in 0.5.0 | Read-only Apple/APFS header classification with explicit preliminary limitations |
| APFS volume-superblock discovery | Implemented in 0.5.0 | Bounded APFS volume superblock candidates preserve offsets and raw hashes |
| APFS volume names and checkpoints | Implemented in 0.5.0 | Volume metadata candidates expose bounded names and checkpoint fields with raw provenance |
| APFS keyless crypto-state reporting | Implemented in 0.5.0 | Encryption and crypto flags are reported without key handling or decryption |
| APFS container checkpoint rings | Implemented in 0.5.0 | Bounded descriptor/data ring slots preserve offsets, XIDs, and hashes without replay |
| APFS object-header inventory | Implemented in 0.5.0 | Bounded object identifiers, XIDs, types, subtypes, offsets, and hashes are inventoried |
| APFS object-map candidates | Implemented in 0.5.0 | Object-map fields are retained as bounded raw candidates without lookup or reconstruction |
| APFS snapshot evidence | Implemented in 0.5.0 | Snapshot references and metadata candidates are reported without restore or mount |
| APFS B-tree node headers | Implemented in 0.5.0 | Node flags, levels, counts, and space fields are preserved as raw evidence |
| APFS B-tree record windows | Implemented in 0.5.0 | Bounded heuristic table-space windows include offsets and SHA-256 hashes |
| APFS filesystem-tree key candidates | Implemented in 0.5.0 | Raw 64-bit key signatures preserve type nibbles and 60-bit object IDs |
| APFS inode/directory candidates | Implemented in 0.5.0 | Key-type 1/3 candidates are classified without namespace reconstruction |
| APFS extent candidates | Implemented in 0.5.0 | Key-type 4/5 candidates are classified without extent decoding |
| APFS xattr candidates | Implemented in 0.5.0 | Key-type 2 candidates are classified without value decoding |
| APFS sibling candidates | Implemented in 0.5.0 | Key-type 3 sibling candidates are classified as raw evidence |
| APFS file-extent candidates | Implemented in 0.5.0 | Key-type 5 candidates are classified without file-content recovery |
| APFS directory-stat candidates | Implemented in 0.5.0 | Key-type 6 candidates are classified without semantic decoding |
| APFS snapshot-metadata candidates | Implemented in 0.5.0 | Key-type 7 candidates are classified without snapshot reconstruction |
| APFS snapshot-name candidates | Implemented in 0.5.0 | Key-type 8 candidates are classified without name decoding |
| APFS file-info candidates | Implemented in 0.5.0 | Key-type 9 candidates are retained as preliminary raw evidence |
| APFS raw key-type 10 candidates | Implemented in 0.5.0 | Numeric key-type 10 candidates are inventoried without unsupported semantic labels |
| APFS raw key-type 11 candidates | Implemented in 0.5.0 | Numeric key-type 11 candidates are inventoried without unsupported semantic labels |
| APFS raw key-type 12 candidates | Implemented in 0.5.0 | Numeric key-type 12 candidates are inventoried without unsupported semantic labels |
| FAT fixed-root discovery | Implemented in 0.5.0 | Fixed-root directory records are discovered with bounded offsets and read-only evidence |
| FAT12 allocation analysis | Implemented in 0.5.0 | Packed FAT12 entries are followed with loop, free, bad, and truncation states |
| FAT mirror consistency | Implemented in 0.5.0 | Primary and mirror FAT copies are compared with mismatch evidence |
| FAT long-name checksum inspection | Implemented in 0.5.0 | LFN checksum relationships are retained as bounded directory evidence |
| FAT fixed-root deleted recovery | Implemented in 0.5.0 | Deleted fixed-root candidates are planned or extracted with bounded provenance |
| FAT boot metadata inspection | Implemented in 0.5.0 | BPB and filesystem geometry fields are decoded without mounting |
| FAT backup boot-sector inspection | Implemented in 0.5.0 | Backup boot candidates are compared without source modification |
| FAT fixed-root timestamps | Implemented in 0.5.0 | DOS date/time fields are normalized with raw offsets and uncertainty markers |
| FAT fixed-root attributes | Implemented in 0.5.0 | DOS attribute flags are classified with raw entry provenance |
| FAT fixed-root names | Implemented in 0.5.0 | Short and reconstructed names are exposed without path writes |
| FAT fixed-root entry classification | Implemented in 0.5.0 | Live, deleted, volume-label, directory, and special entries are separated |
| FAT fixed-root slack inspection | Implemented in 0.5.0 | Unused root-directory ranges are reported with bounded hashes |
| FAT fixed-root chain correlation | Implemented in 0.5.0 | Directory records are correlated to allocation chains without mutation |
| FAT fixed-root cross-link detection | Implemented in 0.5.0 | Shared cluster ownership is reported as an integrity finding |
| FAT fixed-root orphan detection | Implemented in 0.5.0 | Unreachable allocated clusters are identified with bounded evidence |
| FAT orphan-chain reconstruction | Implemented in 0.5.0 | Lost cluster runs are grouped with loop and termination states |
| FAT orphan-chain artifact recovery | Implemented in 0.5.0 | Orphan artifacts are planned or recovered with explicit source ranges |
| FAT fixed-root record hashing | Implemented in 0.5.0 | Root records receive deterministic SHA-256 provenance |
| FAT fixed-root name collisions | Implemented in 0.5.0 | Conflicting normalized names are reported without choosing a winner |
| FAT fixed-root anomaly inspection | Implemented in 0.5.0 | Invalid, truncated, and contradictory entries are cataloged |
| FAT fixed-root size validation | Implemented in 0.5.0 | File sizes are compared with chain capacity and truncation evidence |
| FAT fixed-root integrity summary | Implemented in 0.5.0 | Fixed-root findings are summarized with explicit completeness status |
| FAT fixed-root deleted-recovery planning | Implemented in 0.5.0 | Dry-run recovery plans preserve output safety and source immutability |
| FAT subdirectory inspection | Implemented in 0.5.0 | Nested directory traversal is bounded with loop and depth evidence |
| FAT subdirectory deleted candidates | Implemented in 0.5.0 | Deleted nested entries are correlated to directory and chain context |
| FAT subdirectory recovery planning | Implemented in 0.5.0 | Nested deleted recovery can be planned without creating artifacts |
| FAT subdirectory deleted recovery | Implemented in 0.5.0 | Eligible nested candidates are recovered with bounded evidence |
| FAT subdirectory manifest recovery | Implemented in 0.5.0 | Recovered artifacts receive manifest-level provenance and hashes |
| FAT recovery artifact indexing | Implemented in 0.5.0 | Manifests are converted into deterministic read-only catalogs |
| FAT recovery pipeline | Implemented in 0.5.0 | Inspection, planning, recovery, hashing, and catalog stages are composed |
| FAT input diagnostics | Implemented in 0.5.0 | MBR and partition-offset FAT candidates are diagnosed without mounting |
| FAT pipeline diagnostics | Implemented in 0.5.0 | Pipeline dispatch reports unsupported and partition-required states |
| FAT automatic partition-offset adaptation | Implemented in 0.5.0 | Temporary partition views preserve original source identity and hashes |
| FAT partition-view benchmarking | Implemented in 0.5.0 | Read throughput and memory footprint are profiled without source writes |
| FAT subdirectory cross-link detection | Implemented in 0.5.0 | Nested chain ownership conflicts are reported as integrity evidence |
| FAT orphan and slack inspection | Implemented in 0.5.0 | Orphan chains and file/volume slack are separated with hashes |
| FAT orphan-chain signature carving | Implemented in 0.5.0 | Bounded signatures are mapped to orphan clusters as uncertain hints |
| FAT carving-directory reconciliation | Implemented in 0.5.0 | Carving matches are classified against live, deleted, slack, and orphan context |
| FAT reconciliation validation harness | Implemented in 0.5.0 | Corrupted-image invariants check offsets, relationships, confidence, and mutation |
| FAT integrated evidence pipeline | Implemented in 0.5.0 | Full FAT evidence stages return structured read-only status and provenance |
| ext inode checksum evidence | Implemented in 0.5.0 | Candidate CRC32C inode checksums are computed without altering inode bytes |
| ext superblock feature inspection | Implemented in 0.5.0 | Compatible, incompatible, read-only, and checksum feature flags are decoded |
| HFS+ volume-header inventory | Implemented in 0.5.0 | H+ and HX headers are detected with bounded offsets and raw SHA-256 evidence |
| HFS+ volume metadata | Implemented in 0.5.0 | Version, attributes, geometry, and allocation summary fields are preserved |
| HFS+ catalog fork descriptor | Implemented in 0.5.0 | Catalog-file fork metadata is decoded without assembling extents |
| HFS+ extents fork descriptor | Implemented in 0.5.0 | Extents-overflow fork metadata is decoded as bounded evidence |
| HFS+ attributes fork descriptor | Implemented in 0.5.0 | Attributes-file fork metadata is decoded without semantic replay |
| HFS+ startup fork descriptor | Implemented in 0.5.0 | Startup-file fork evidence is reported with explicit unsupported bounds |
| HFS+ journal information | Implemented in 0.5.0 | Journal-info block and attribute evidence is reported without replay |
| HFS+ allocation summary | Implemented in 0.5.0 | Total/free/estimated allocated block evidence is reported read-only |
| HFS+ catalog candidates | Implemented in 0.5.0 | Structural catalog fork candidates are identified without names or ownership claims |
| HFS+ deleted-entry candidates | Implemented in 0.5.0 | Candidate fork structures are exposed without asserting deletion authenticity |
| HFS+ resource-fork candidates | Implemented in 0.5.0 | Resource-fork structural candidates are retained with raw provenance |
| HFS+ evidence validation | Implemented in 0.5.0 | Header signature and geometry invariants are checked without mounting |
| XFS superblock evidence | Implemented in 0.5.0 | XFSB geometry and bounded raw header hashes are reported read-only |
| XFS allocation summary | Implemented in 0.5.0 | XFS data-block summary fields are preserved without allocation changes |
| XFS evidence validation | Implemented in 0.5.0 | XFS signature and bounded geometry candidates are validated |
| XFS inode geometry hint | Implemented in 0.5.0 | XFS inode-related geometry is retained as an explicitly preliminary hint |
| Btrfs superblock evidence | Implemented in 0.5.0 | Btrfs magic, sector size, node size, offsets, and hashes are reported |
| Btrfs chunk-tree hint | Implemented in 0.5.0 | Chunk-tree-related structural evidence is reported without traversal |
| Btrfs evidence validation | Implemented in 0.5.0 | Btrfs signature candidates are checked without mounting or replay |
| ZFS uberblock evidence | Implemented in 0.5.0 | ZFS uberblock magic and byte-order evidence are retained |
| ZFS pool-label evidence | Implemented in 0.5.0 | Pool-label candidates are reported as bounded raw evidence |
| ZFS evidence validation | Implemented in 0.5.0 | ZFS signature candidates are validated without pool assembly |
| ReFS volume-header evidence | Implemented in 0.5.0 | ReFS signature, offset, version hint, and raw hash are reported |
| ReFS metadata hint | Implemented in 0.5.0 | ReFS metadata candidates are retained without semantic traversal |
| ReFS evidence validation | Implemented in 0.5.0 | ReFS signature candidates are validated read-only |
| Cross-format filesystem signatures | Implemented in 0.5.0 | XFS, Btrfs, ZFS, and ReFS signatures are normalized into one evidence schema |
| Cross-format filesystem geometry | Implemented in 0.5.0 | Bounded geometry hints are exposed with source offsets and hashes |
| Cross-format signature validation | Implemented in 0.5.0 | Multi-format signature evidence is validated without mounting |
| Enterprise service/RBAC | Planned | Requires service API and identity integration |

## Release rule

No release may claim “fully recoverable” or “all methods implemented.” Every capability must appear in `recovery doctor`, the capability matrix, the CLI reference, and the test report.
