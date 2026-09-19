# Enterprise Implementation Status

This document tracks actual implementation status. A backlog item is marked **implemented** only after code, tests, documentation, and an audit result exist. “Planned” does not mean available.

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
| Enterprise service/RBAC | Planned | Requires service API and identity integration |

## Release rule

No release may claim “fully recoverable” or “all methods implemented.” Every capability must appear in `recovery doctor`, the capability matrix, the CLI reference, and the test report.
