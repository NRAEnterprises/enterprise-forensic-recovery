import { SCHEMAS } from './schema.js';

export const RECOVERY_STATUSES = Object.freeze([
  { name: 'recovered', meaning: 'Content or metadata was obtained and passed the operation\'s validation checks.', evidenceClass: 'validated' },
  { name: 'verified', meaning: 'Output or evidence was independently hash- or structure-validated.', evidenceClass: 'validated' },
  { name: 'partial', meaning: 'Some requested evidence was obtained, but bounded errors or omissions remain.', evidenceClass: 'incomplete' },
  { name: 'carved', meaning: 'Bytes were extracted from signatures or raw ranges without complete filesystem provenance.', evidenceClass: 'uncertain' },
  { name: 'reconstructed', meaning: 'Content or metadata was rebuilt from structural evidence and may not preserve the original representation.', evidenceClass: 'derived' },
  { name: 'uncertain', meaning: 'A candidate or interpretation is plausible but requires independent review.', evidenceClass: 'uncertain' },
  { name: 'encrypted', meaning: 'Evidence is present but its content cannot be interpreted without an authorized key or credential.', evidenceClass: 'blocked' },
  { name: 'corrupted', meaning: 'Validation detected damaged, inconsistent, or incomplete source structures.', evidenceClass: 'damaged' },
  { name: 'unsupported', meaning: 'The source or requested operation is outside the implemented capability boundary.', evidenceClass: 'blocked' },
  { name: 'unrecoverable', meaning: 'Available evidence is insufficient to obtain the requested content under stated limits.', evidenceClass: 'negative' }
]);

export const RECOVERY_METHODS = Object.freeze([
  { id: 'inventory', class: 'supported', description: 'Recursive metadata inventory and SHA-256 hashing.' },
  { id: 'signature-identification', class: 'supported', description: 'Known-format signature and binary-header identification.' },
  { id: 'archive-validation', class: 'supported', description: 'Bounded ZIP, TAR, and GZIP validation with safe extraction.' },
  { id: 'raw-imaging', class: 'supported', description: 'Read-only streaming image acquisition with resumable hashing.' },
  { id: 'filesystem-metadata', class: 'supported', description: 'Bounded NTFS, ext-family, FAT-family, and exFAT metadata parsing.' },
  { id: 'deleted-record-analysis', class: 'supported', description: 'NTFS deleted MFT candidate analysis and bounded stream reconstruction.' },
  { id: 'journal-evidence', class: 'supported', description: 'NTFS journal extraction/decoding and ext/JBD2 evidence grouping without replay.' },
  { id: 'database-structure', class: 'supported', description: 'SQLite header, sidecar, page, and cell structural evidence.' },
  { id: 'project-reconstruction', class: 'supported', description: 'Bounded Python, Rust, and Node project evidence grouping.' },
  { id: 'filesystem-content-replay', class: 'experimental', description: 'Full journal replay, fragmented content reconstruction, and directory restoration.' },
  { id: 'cloud-connectors', class: 'planned', description: 'Provider-authorized cloud acquisition and version recovery.' }
]);

export const COMPATIBILITY = Object.freeze({
  package: '@enterprise-recovery/forensic-recovery',
  currentVersion: '0.5.0',
  node: '>=20',
  reportCompatibility: 'Reports are additive within a major schema version; consumers must inspect schema identifiers.',
  caseCompatibility: 'Case schema v2 is validated on load; migration tooling is not yet provided.',
  cliCompatibility: 'Existing commands and machine-readable catalogs are stable for the 0.5.x line.',
  nativeCompatibility: 'The packaged accelerator targets Linux x64; Node fallback remains the portable path.',
  limitations: ['No cloud provider connector is enabled', 'No journal replay is performed', 'No secure-erasure or overwritten-byte recovery is claimed']
});

export function schemaCatalog() { return { schema: 'recovery.schema-catalog/v1', schemas: Object.entries(SCHEMAS).map(([id, value]) => ({ id, value })).sort((a, b) => a.id.localeCompare(b.id)) }; }
export function exitCodeCatalog() { return { schema: 'recovery.exit-codes/v1', codes: [{ name: 'OK', code: 0, meaning: 'Completed successfully' }, { name: 'PARTIAL', code: 2, meaning: 'Completed with bounded or incomplete evidence' }, { name: 'USAGE', code: 64, meaning: 'Invalid command or option usage' }, { name: 'SOURCE', code: 66, meaning: 'Source unavailable or invalid' }, { name: 'POLICY', code: 77, meaning: 'Policy prevented the operation' }, { name: 'INTERNAL', code: 70, meaning: 'Unexpected internal error' }] }; }
export function resultStatusCatalog() { return { schema: 'recovery.result-statuses/v1', statuses: RECOVERY_STATUSES }; }
export function recoveryMethodCatalog() { return { schema: 'recovery.method-catalog/v1', methods: RECOVERY_METHODS }; }
export function compatibilityCatalog() { return { schema: 'recovery.compatibility/v1', compatibility: COMPATIBILITY }; }
