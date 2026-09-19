# Capability Matrix

This matrix describes the current audited depth. “Evidence” means the tool reports bounded, provenance-preserving candidates; it does not imply complete restoration or transaction replay.

| Capability | Status | Output class | Important limits |
|---|---|---|---|
| Inventory and SHA-256 hashing | Audited | Verified metadata | Source access and permissions apply |
| ZIP/TAR/GZIP validation and extraction | Audited | Recovered/partial | Host-tool availability and archive safety limits |
| MBR/GPT inspection | Audited | Evidence | GPT CRC and full partition semantics pending |
| NTFS deleted MFT candidates | Audited | Uncertain evidence | Data reconstruction is bounded |
| NTFS nonresident streams | Audited | Reconstructed/partial | Compression, encryption, damaged runlists unsupported |
| NTFS USN/LogFile streams | Audited | Evidence | Transaction replay is not performed |
| ext orphan/JBD2 analysis | Audited | Evidence | Inode restoration and journal replay are not performed |
| SQLite structural page recovery | Audited | Uncertain evidence | WAL replay and row restoration are not performed |
| Python/Rust/Node project reconstruction | Audited | Reconstructed evidence | No execution, builds, dependency installation, or network |
| Raw read-only imaging | Audited | Verified image | Linux x64 native helper; Node fallback elsewhere |
| Cloud connectors | Planned | Unsupported | Requires explicit connector authorization |
| Enterprise service/RBAC | Planned | Unsupported | Service integration not yet implemented |
