# General Audit 2 — Early 60% Audit Block

**Date:** 2026-11-02

**Requested gate:** 60% / 168 audited rows

**Actual audited ledger at execution:** 103/280 rows (36.8%)

**Provisional implementation context:** 152/280 rows (54.3%)

## Gate context

This audit was run early at the operator's request before the authoritative audited ledger reached 168 rows. The audited count was not promoted by passing tests. Newly implemented filesystem work remains provisional until its required regression coverage and audit evidence are promoted through the normal ledger process.

## Results

| Severity | Result | Evidence and disposition |
|---|---|---|
| Critical | None found | Focused source-integrity checks preserved input hashes and metadata; no repair, mount, journal replay, key handling, or source write path was introduced by the inspected blocks. |
| High | None found | Full test suite had 56 passing tests and 0 failures. Package smoke installation and doctor invocation passed. |
| Moderate | Cataloged | The newly added FAT evidence pipeline and APFS preliminary adapters are covered by focused ephemeral synthetic checks, but their regression fixtures are not yet committed to `test/recovery.test.js`. Keep these rows provisional until committed fixture coverage and the scheduled gate audit are complete. |
| Low | Cataloged | The native accelerator parity test was skipped because the recovery-native binary was not built in the test environment. The package smoke test confirmed the packaged native binary is present. |
| Low | Cataloged | APFS checkpoint scanning performs bounded per-slot reads and is intentionally preliminary; future optimization and format-level validation should be handled in the next filesystem audit cycle. |

## Verification evidence

- `npm test`: **56 passed, 0 failed, 1 skipped**
- `npm run pack:smoke`: passed; package installed in a clean temporary location, `doctor` succeeded, and case creation succeeded
- `npm audit --omit=dev --audit-level=moderate`: **0 vulnerabilities**
- `npm run progress:check`: **103/280, 36.8%, markerMatches=true**
- `npm pack --dry-run`: passed; package contained 29 files
- `node --check src/index.js`: passed
- `node --check src/filesystem.js`: passed
- `git diff --check`: passed
- Focused synthetic APFS/FAT deep audit: passed all 8 checks
  - APFS container detection
  - APFS volume detection
  - APFS volume-name extraction
  - Keyless crypto-state reporting
  - Checkpoint-ring slot parsing
  - FAT pipeline verification
  - Malformed-input classification
  - Source immutability across all inspected images

## Deep-audit status

**PASS WITH CATALOGED FINDINGS — EARLY EXECUTION.** No critical or high-severity blocker was found. The audited ledger remains **103/280 (36.8%)**. The provisional implementation count remains **152/280 (54.3%)**. No rows are promoted solely because the early audit passed.

## Required follow-up at the actual 60% gate

Commit permanent regression fixtures for the FAT pipeline and APFS preliminary adapters, rerun the full malformed-input and mutation suite, build and test the native accelerator parity path, and reconcile the ledger against introducing commits before promoting any rows to audited status.

## Native fixture follow-up — 2026-11-02

The native parity gap was resolved for the ARM64 audit environment. The available Rust toolchain was used to build `native/bin/linux-arm64/recovery-native`; the binary executed and reported the expected usage contract, and package discovery resolved it through `findNativeBinary`.

- `npm test`: **57 passed, 0 failed, 0 skipped**
- Native accelerator parity test: **passed**
- `npm run pack:smoke`: passed with the architecture-matched fixture
- `npm pack --dry-run`: passed; package now contains 30 files, including Linux ARM64 and Linux x64 native fixtures
- Progress ledger remains **103/280 audited rows (36.8%)**

The previously cataloged low native-fixture finding is resolved for ARM64. The pre-existing Linux x64 fixture remains packaged for x64 consumers; cross-architecture execution was not attempted in the ARM64 environment.

## Full regression architecture run — 2026-11-02

The complete regression suite was run on the current `aarch64` / `linux-arm64` environment. Node tests completed with **57 passed, 0 failed, 0 skipped**. The native Rust crate compiled in release mode and its test target completed with **0 failed** (the crate currently contains no Rust unit tests). Native parity executed successfully through the ARM64 fixture. Package smoke, dependency audit, and progress reconciliation also passed: `npm run pack:smoke`, `npm audit --omit=dev --audit-level=moderate` with 0 vulnerabilities, and `npm run progress:check` at 103/280 audited rows.

The packaged `linux-x64` binary was inspected and identified as a valid x86-64 ELF, but this environment is ARM64 and has no `qemu-x86_64`, Docker, or Podman runtime available. Therefore x86-64 execution coverage could not be run here. The x64 fixture remains statically verified and packaged, but cross-architecture parity is **not claimed**. A separate x86-64 runner or emulator is required to close that coverage item.


## Benchmark follow-up — 2026-11-03

The requested benchmarked audit was rerun after the APFS preliminary adapter batch. Permanent regression coverage was added for the complete APFS export matrix: 22 adapters covering headers, volumes, crypto state, checkpoint rings, objects, object maps, snapshots, B-tree evidence, filesystem-tree signatures, and raw key classes. The fixture checks bounded output, read-only flags, malformed-input handling, and source SHA-256 immutability.

Verification results:

- `npm test`: **58 passed, 0 failed, 0 skipped**
- APFS permanent matrix test: **passed**, 22 adapters exercised concurrently
- `npm run pack:smoke`: previously passed before this test-only change; package installation, `doctor`, and case creation succeeded
- `npm audit --omit=dev --audit-level=moderate`: **0 vulnerabilities**
- `npm run progress:check`: **126/280, 45.0%, markerMatches=true**
- `node --check src/index.js`: passed
- `node --check src/filesystem.js`: passed
- `git diff --check`: passed
- Source mutation checks: passed for the APFS matrix fixture and malformed fixture

### Accounting reconciliation

The prior **170 provisional** headline included 44 recent implementation claims that were not represented as rows in the authoritative 280-item implementation ledger. Those claims are not promoted by this audit. The 23 APFS rows with committed code, permanent regression coverage, documentation, and progress-ledger evidence are promoted from provisional to audited. The authoritative audited count is therefore **126/280 (45.0%)**. The reconciled tracked provisional scope is also **126/126**; the remaining 44 unledgered claims remain explicitly deferred rather than counted.

No critical or high-severity finding was introduced. The APFS adapters remain preliminary evidence collectors: they do not decrypt, mount, replay, traverse complete trees, decode filesystem names or values, reconstruct ownership, or mutate sources. The formal 60% ledger gate remains **168 audited rows** and has not been falsely declared passed.

## Formal 60% gate — 2026-11-04

The formal gate threshold of 168 audited rows was reached by promoting 42 existing FAT/ext adapter targets. Promotion required permanent regression coverage, structured schema assertions, read-only source-hash verification, dry-run output safety, and full-suite verification. The new matrix exercised 40 FAT adapters plus ext inode checksum and ext superblock feature adapters against synthetic FAT12 and ext-family fixtures.

Gate evidence: `npm test` completed with **59 passed, 0 failed, 0 skipped**; the dedicated 42-target matrix passed **42/42**; `npm run pack:smoke` passed; `npm audit --omit=dev --audit-level=moderate` reported **0 vulnerabilities**; syntax checks for the package, filesystem module, and test module passed; and `git diff --check` passed. The deterministic progress checker reports **168/280, 60.0%, markerMatches=true**.

The gate passes for the declared moderate/high/critical audit scope. The implementation remains read-only with explicit preliminary limitations: FAT signature carving is an uncertain hint rather than proof of file boundaries, APFS remains preliminary evidence collection, and no source mutation, filesystem mounting, journal replay, decryption, or unsupported semantic reconstruction is claimed.

## Post-60% phase checkpoint — 2026-11-04

A bounded HFS+ evidence slice was added after the formal 60% gate. Twelve adapters now report volume headers, volume metadata, catalog/extents/attributes/startup fork descriptors, journal information, allocation summaries, catalog/deleted/resource-fork candidates, and header validation. The implementation is explicitly preliminary: it does not assemble extents, replay journals, recover names, mount volumes, or assert deletion authenticity.

The permanent HFS+ matrix passed **12/12** adapters against valid and malformed synthetic images, including source SHA-256 immutability and read-only result assertions. The full suite passed **60 tests with 0 failures and 0 skips**. The audited ledger advanced to **180/280 (64.3%)**.
