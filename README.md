# Enterprise Forensic Recovery

A local-first npm CLI and SDK for evidence-preserving inventory, file identification, archive validation, extraction, carving, project analysis, and verification. It is designed for authorized enterprise recovery work and incident response.

## What this release does

The 0.4.0 release adds versioned case and report foundations, read-only policy enforcement, hash-chained audit records, safe output-path checks, duplicate-source protection, bounded binary diagnostics, stable exit codes, validated CLI options, and policy inspection commands. It remains intentionally dependency-light so it can be installed in restricted enterprise environments.

The `doctor` command reports which optional host utilities are available. This batch adds a Node streaming imaging engine and a packaged Linux x64 Rust accelerator. Cloud connectors and filesystem-specific undelete modules remain unavailable and are reported explicitly.

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
recovery source inspect /path/to/source.img
```

The source is opened without write access. The destination must not be inside a registered source path. A resumed image hashes the existing prefix and the newly copied range, records the copied offset and byte count, and writes an image report under `reports/`.

`source inspect` performs header-level triage without mounting the source. It reports MBR/GPT signatures, block-device flags, and selected filesystem header hints. It is not a filesystem parser.

### 4. Run triage and hashing

```bash
recovery inventory ./cases/account-recovery
recovery identify ./cases/account-recovery
recovery validate ./cases/account-recovery
```

Inventory records paths, sizes, timestamps, modes, SHA-256 hashes, signatures, and extension hints. Identification reports known formats and extension/content mismatches. Archive validation tests ZIP and TAR files, validates GZIP streams when available, and reports corrupted or unsupported containers.

### 4. Extract valid ZIP archives to a separate directory

```bash
recovery extract ./cases/account-recovery ./recovered/account-recovery
```

Extraction never overwrites existing files because it uses the host `unzip -n` behavior. Damaged entries are reported as partial rather than silently treated as complete.

### 5. Carve embedded files from an opaque binary

```bash
recovery carve /path/to/00.dat ./recovered/carved-00-dat
```

Carving scans for selected PDF, PNG, JPEG, GIF, ZIP, and SQLite signatures. Results preserve source offsets but may not preserve filenames, directories, file boundaries, or version history. Treat carved outputs as uncertain until independently validated.

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

## Package roadmap

The planned next modules are platform-specific imaging helpers, filesystem-aware undelete and journal analysis, more archive formats, SQLite/WAL recovery, a Rust native accelerator, official cloud connectors, plugin isolation, signed releases, SBOM generation, and an optional local service/dashboard.
