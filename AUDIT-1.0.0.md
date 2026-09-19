# 1.0.0 Operator Evidence Workflow Audit

## Implemented

The CLI now supports `--jsonl` output for stream-friendly automation, deterministic report comparison, and append-only hash-linked case notes.

Commands:

```bash
recovery diff LEFT-REPORT RIGHT-REPORT
recovery notes add CASE-DIR "Reviewed candidate set"
recovery notes list CASE-DIR
```

The diff operation reports added, removed, and changed records. Case notes are stored as restricted NDJSON records with a previous-record hash link.

## Critical-risk review

Targeted smoke checks caught and corrected two CLI defects before completion: diff positional routing when the first report occupied the subcommand slot, and boolean flags consuming the following command token. Notes are bounded to 10,000 characters and are written below the case directory. The diff operation reads reports only and does not modify them.

## Limits

The current note API does not yet expose a separate cryptographic signing key or multi-operator identity provider. Report diffing compares supported top-level arrays and is not a semantic filesystem merge.
