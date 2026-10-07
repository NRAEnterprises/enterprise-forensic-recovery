# Enterprise Forensic Recovery

A local-first npm CLI and SDK for evidence-preserving inventory, file identification, archive validation, extraction, carving, project analysis, and verification. It is designed for authorized enterprise recovery work and incident response.

## What this release does

The 0.5.0 release adds a dedicated bounded ext orphan-chain walker and JBD2 transaction evidence analyzer while retaining the versioned case/report foundations, read-only policy enforcement, hash-chained audit records, safe output-path checks, duplicate-source protection, bounded binary diagnostics, stable exit codes, validated CLI options, and policy inspection commands.

The `doctor` command reports optional host utilities, native accelerator availability, effective UID/GID and root status, writable working and temporary directories, locale/timezone, memory, filesystem free space, and the clock timestamp. Cloud connectors and filesystem-specific undelete modules remain unavailable and are reported explicitly.

## Install

From a source checkout:

```bash
npm install
npm link
recovery doctor
```

From a registry after publication:

```bash
npm install --global @enterprise-recovery/forensic-recovery
recovery doctor
```

Use Node.js 20 or newer. Run with administrator/root privileges only for acquisition paths that require them. Prefer a forensic image or a copied source and keep the original read-only.

## Step-by-step workflow

### 1. Create a case

```bash
recovery case create ./cases/account-recovery
```

The case directory contains `case.json`, `sources/`, `reports/`, `artifacts/`, and `logs/audit.ndjson`.

### 2. Register the original source

```bash
recovery source add ./cases/account-recovery /path/to/export.zip
recovery source add ./cases/account-recovery /path/to/extracted-folder
recovery source add ./cases/account-recovery /path/to/00.dat
```

Register sources before changing them. Do not overwrite the original archive or extracted directory.

### 3. Acquire a read-only image

```bash
recovery source image ./cases/account-recovery /path/to/source.img ./images/source-copy.img
recovery source image ./cases/account-recovery /path/to/source.img ./images/source-copy.img --resume
recovery source image ./cases/account-recovery /path/to/source.img ./images/source-copy-native.img --native
recovery source image ./cases/account-recovery /path/to/source.img ./images/source-copy.img --dry-run
recovery source inspect /path/to/source.img
```

The source is opened without write access. The destination must not be inside a registered source path. A resumed image hashes the existing prefix and the newly copied range, records the copied offset and byte count, and writes an image report under `reports/`.
The dry-run form validates the case/source/output relationship and reports the selected engine and write policy without opening or creating the image output.

`source inspect` performs header-level triage without mounting the source. It reports MBR/GPT signatures, block-device flags, and selected filesystem header hints. It is not a filesystem parser.

The equivalent compatibility aliases are `recovery inspect <source>` and `recovery image <case-dir> <source> <output>`. These aliases do not change the read-only policy or bypass destructive-operation checks.

For filesystem-level triage and bounded NTFS deleted-record candidates:

```bash
recovery filesystem inspect /path/to/filesystem.img
recovery filesystem recover-deleted /path/to/ntfs.img ./recovered/ntfs-candidates
recovery filesystem recover-journals /path/to/ntfs.img ./recovered/ntfs-journals
recovery filesystem decode-journals ./recovered/ntfs-journals
recovery filesystem recover-ext /path/to/ext.img ./recovered/ext-metadata
```

These operations never mount or modify the source. NTFS recovery produces quarantined deleted MFT-record candidates, resident names, bounded nonresident stream artifacts, and structurally decoded USN/LogFile records when valid streams are present. Journal recovery does not replay transactions. Ext recovery uses a bounded orphan-chain walker and dedicated JBD2 analyzer to produce evidence groups; it does not replay the journal, resolve external journal devices, or reconstruct inodes into files.

Decoded USN records retain the raw reason mask and add named flags such as `FILE_CREATE`, `FILE_DELETE`, `RENAME_NEW_NAME`, and `CLOSE`. JBD2 hits retain raw numeric values and add block-type labels such as `descriptor`, `commit`, `superblock-v1`, `superblock-v2`, or `revoke`; transaction groups report committed evidence, partial groups, revoked-block counts, and orphan commits.

For SQLite structural recovery:

```bash
recovery database inspect /path/to/database.db
recovery database recover-pages /path/to/database.db ./recovered/sqlite-pages
```

The database workflow validates headers and page/cell boundaries, preserves raw offsets and hashes, and inspects—but does not replay—WAL or rollback-journal sidecars. It does not claim restored rows or a reconstructed historical database.

### 4. Run triage and hashing

```bash
recovery inventory ./cases/account-recovery
recovery identify ./cases/account-recovery
recovery validate ./cases/account-recovery
```

Inventory records paths, sizes, timestamps, modes, SHA-256 hashes, signatures, and extension hints. Identification reports known formats and extension/content mismatches. Archive validation tests ZIP and TAR files, validates GZIP streams when available, and reports corrupted or unsupported containers. Each validation result records the tool, checks performed, member counts where available, path-safety and duplicate-path outcomes, and validation errors.

### 4. Extract valid ZIP archives to a separate directory

```bash
recovery extract ./cases/account-recovery ./recovered/account-recovery
recovery extract ./cases/account-recovery ./recovered/account-recovery --dry-run
```

Extraction never overwrites existing files because it uses the host `unzip -n` behavior. Damaged entries are reported as partial rather than silently treated as complete. Absolute paths, traversal, duplicate names, Windows device names, and ambiguous trailing-dot/space member names are rejected before extraction.
The dry-run form reports planned outputs, archive types, overwrite policy, and output quotas without creating the destination directory or writing extracted content.

### 5. Carve embedded files from an opaque binary

```bash
recovery carve /path/to/00.dat ./recovered/carved-00-dat
```

Carving scans the defined archive, document, media, executable, and container signatures in bounded chunks. Results preserve source SHA-256, deterministic artifact names, source start/end offsets, byte lengths, and bounded structural validation. Treat outputs as uncertain when a header is found without sufficient structure; carving does not preserve filenames, directories, or version history.

### 6. Analyze project folders

```bash
recovery analyze project ./cases/account-recovery
```

The analyzer detects Python, Rust, and Node.js/TypeScript project markers. It is a triage aid, not a full build reconstruction system.

### 7. Verify and report

```bash
recovery verify ./cases/account-recovery
recovery report ./cases/account-recovery
```

Verification re-hashes inventory files and reports mismatches. The final report combines generated JSON sections into `reports/final-report.json`.

### 8. Inspect or change policy

```bash
recovery policy show ./cases/account-recovery
recovery policy set ./cases/account-recovery ./approved-policy.json
```

Cases are read-only by default. Output directories must not be inside registered source paths. Destructive operations are not enabled by default.

## npm SDK example

```js
import { createCase, addSource, inventoryCase, identifyCase } from '@enterprise-recovery/forensic-recovery';

const caseInfo = await createCase('./cases/example', { ticket: 'IR-1001' });
await addSource('./cases/example', './export.zip');
const inventory = await inventoryCase('./cases/example');
const findings = await identifyCase('./cases/example');
console.log({ caseId: caseInfo.id, files: inventory.totals.files, findings: findings.findings.length });
```

## Enterprise operating guidance

Use encrypted case storage, preserve the original source, record the operator and ticket identifier, and retain the audit log. For physical media, acquire a verified image before deep scanning. Limit cloud ingestion to official, user-authorized APIs and minimum required scopes. Never place passwords, recovery codes, API keys, or customer records in command-line arguments or support tickets.

The tool does not bypass authentication, defeat encryption, brute-force credentials, recover securely erased or overwritten bytes, or reconstruct provider-side account state that is not present in the export. It reports those limits explicitly.

## Machine-readable capability catalogs

Use the catalogs to integrate safely with automation instead of inferring meaning from human text:

```bash
recovery result-status list
recovery method list
recovery compatibility show
```

Result statuses distinguish validated recovery from partial, carved, reconstructed, uncertain, encrypted, corrupted, unsupported, and unrecoverable evidence. Methods are classified as supported, experimental, or planned; experimental and planned methods are not silently treated as production recovery.

## Package roadmap

The planned next modules are platform-specific imaging helpers, deeper filesystem-aware content reconstruction, more archive formats, SQLite/WAL recovery, official cloud connectors, plugin isolation, signed releases, SBOM generation, and an optional local service/dashboard.
