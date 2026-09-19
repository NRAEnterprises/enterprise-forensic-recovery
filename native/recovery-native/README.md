# recovery-native

This Rust crate contains native primitives for large-source recovery. The first command is a read-only streaming imager:

```text
recovery-native image SOURCE OUTPUT [--resume] [--offset N]
```

It opens the source without write access, creates the output with exclusive creation on a fresh run, supports resuming from the existing output length, writes in bounded chunks, calls `sync_all`, and reports a SHA-256 digest for the copied range plus an error map.

The native binary does not bypass permissions, repair hardware, defeat encryption, or silently skip read errors. A partial image exits with status 2 and reports the failed offset.
