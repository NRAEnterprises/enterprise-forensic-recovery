# 0.4.0 Raw Imaging and Native Accelerator Audit

## Implemented

The release adds a Node.js read-only streaming imaging engine and an optional Rust accelerator. Both accept ordinary files and operating-system-readable devices, write to a separate destination, use bounded buffers, support resumable output, calculate a SHA-256 digest for the copied image content, synchronize the output, record partial-read errors, emit image reports, and append hash-chained audit events.

The CLI command is:

```text
recovery source image CASE SOURCE OUTPUT [--resume] [--native] [--overwrite]
```

The native command is packaged for Linux x64 at `native/bin/linux-x64/recovery-native`. Other platforms use the Node engine unless a compatible native binary is supplied through `RECOVERY_NATIVE_BIN`.

## Verification

The JavaScript suite passes nine tests. Coverage includes case and policy creation, hashing, signature detection, duplicate-source rejection, unsafe output rejection, carving, audit verification, Node imaging, resumable imaging, CLI errors, and native/Node content parity.

The Rust crate passes `cargo check`, `cargo build --release`, and `cargo test`. A direct native fixture copy was compared byte-for-byte with its source. A clean npm installation detected the packaged native binary through `recovery doctor`.

## Safety behavior

Sources are opened without write access. Fresh outputs use exclusive creation in the Rust engine and fail rather than overwrite unless resume or explicit overwrite is requested. Node output paths are checked against registered source paths. Partial reads return a structured error map and a non-success partial status instead of being reported as complete.

The tool does not bypass device permissions, repair failing hardware, defeat encryption, infer missing sectors, or claim that a copied image is forensically complete when read errors occurred. Administrator/root privileges may still be required by the operating system for block-device access.

## Known limitations

The Rust accelerator currently implements streaming imaging, not filesystem parsing, carving, RAID reconstruction, or a complete native ABI. It reports a SHA-256 digest for the copied range; a future release should add independent full-image verification, bad-sector retries, sector-size and device-identity capture, sparse imaging, partition parsing, forensic image formats, and platform-specific packaging for Windows and macOS.

The Node fallback currently uses positional reads and reports source-file size for regular files. Device-specific size, retry policy, sparse regions, and hardware health capture remain future work. The package contains one Linux x64 native binary; cross-platform native builds require a release matrix and signed artifacts.
