# 1.3.0 Automation Catalog Audit

## Implemented

The CLI now exposes machine-readable catalogs for emitted schemas and stable exit codes, plus a hash-backed report index for case output discovery.

Commands:

```bash
recovery schema list
recovery exit-code list
recovery report index CASE-DIR
```

## Critical-risk review

All operations are read-only. The report index hashes report files in bounded file reads and does not alter case content. Catalogs expose static package metadata only.

## Limits

The catalogs describe package-level contracts and do not replace schema validation of arbitrary external documents. Report indexing is a discovery operation; it does not validate report semantics.
