# 0.6.0 SQLite Structural Recovery Audit

## Implemented

The package now provides bounded, read-only SQLite inspection and structural page recovery. Main database headers are validated for magic, page size, page count, encoding, schema roots, freelist metadata, and file-size consistency. Optional WAL and rollback-journal sidecars are identified and reported without replay.

Page recovery walks validated in-range pages under explicit byte and page limits, classifies b-tree page types, validates cell-pointer bounds, and emits page/cell candidates with source byte offsets, raw byte lengths, SHA-256 hashes, and uncertainty status. Sources are never modified and outputs are written only to safe destinations.

Commands:

```text
recovery database inspect DATABASE
recovery database recover-pages DATABASE OUTPUT
```

## Verification

The full JavaScript suite passes seventeen tests, including a synthetic SQLite header/page fixture. Existing NTFS, ext, journal, archive, imaging, native, and safety tests remain green. Package and clean-install verification is required before release publication.

## Limits

This block does not restore SQLite rows, replay WAL or rollback-journal transactions, merge historical database states, decrypt databases, or support LevelDB, RocksDB, LMDB, or Berkeley DB. Free-page and cell candidates remain forensic evidence with uncertainty unless independently validated.
