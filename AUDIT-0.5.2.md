# 0.5.2 Journal Semantics and ext Metadata Audit

## Implemented

NTFS journal artifacts can now be decoded after stream extraction. `$UsnJrnl` streams are scanned into bounded records with version, file reference, parent reference, USN, timestamp, reason bitmask, source information, security identifier, file attributes, and filename fields. `$LogFile` streams are classified by `RCRD` and `RSTR` page signatures with page offsets and LSN metadata.

The ext-family recovery path now reports the superblock journal inode, orphan-list head metadata, and JBD2 magic hits in a bounded image scan. It produces a separate metadata report without mounting or modifying the source.

Commands:

```text
recovery filesystem decode-journals JOURNAL_OUTPUT
recovery filesystem recover-ext EXT_IMAGE OUTPUT
```

## Verification

The complete JavaScript suite passes fifteen tests. New coverage includes journal decoding over an extracted journal manifest and an ext-family fixture with an orphan inode field and JBD2 magic block. Existing NTFS runlist reconstruction, journal stream extraction, imaging, Rust parity, archive, and safety tests remain green.

## Explicit limits

USN records are decoded structurally but reason masks are not converted into legal or operational conclusions. `$LogFile` pages are classified but redo/undo transactions are not replayed. Ext JBD2 blocks and orphan metadata are reported but not replayed into filesystem state, and inode/directory/data recovery remains future work. These outputs are candidates and evidence for review, not claims of complete filesystem recovery.
