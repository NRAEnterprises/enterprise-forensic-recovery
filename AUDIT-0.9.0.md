# 0.9.0 Operator Easy-Win Audit

## Implemented

The CLI now exposes named recovery profiles, a machine-readable capability listing, and shell completion output for Bash, Zsh, and PowerShell. Profiles describe intended read-only operation sequences and default limits; they do not silently execute those sequences.

Commands:

```bash
recovery profile list
recovery capability list
recovery completion bash
recovery completion zsh
recovery completion powershell
```

## Critical-risk review

These changes are read-only metadata and generated text. No source, account, network, package manager, compiler, or interpreter is accessed by the new commands. Unsupported shell names fail explicitly.

## Limits

Profiles are declarations, not an orchestration engine. Completion currently covers top-level commands and does not provide option-specific argument discovery.
