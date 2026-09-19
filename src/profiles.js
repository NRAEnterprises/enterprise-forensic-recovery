export const PROFILES = Object.freeze({
  triage: { name: 'triage', description: 'Fast read-only inventory, hashing, signatures, and diagnostics', operations: ['inventory', 'identify', 'doctor'], defaultLimits: { maxArchiveEntries: 10000 } },
  archive: { name: 'archive', description: 'Validate and safely extract supported archives', operations: ['inventory', 'validate', 'extract'], defaultLimits: { maxArchiveEntries: 100000 } },
  deleted: { name: 'deleted', description: 'Inspect images for deleted filesystem candidates', operations: ['filesystem inspect', 'filesystem recover-deleted', 'filesystem recover-journals'], defaultLimits: { maxScanBytes: 1073741824 } },
  project: { name: 'project', description: 'Reconstruct Python, Rust, and Node project evidence without execution', operations: ['inventory', 'analyze project'], defaultLimits: { maxFileBytes: 262144 } },
  evidence: { name: 'evidence', description: 'Preserve provenance and produce reviewable reports', operations: ['case create', 'source add', 'inventory', 'verify', 'audit verify', 'report'], defaultLimits: { readOnly: true } },
  deep: { name: 'deep', description: 'Run all supported read-only analysis stages under explicit limits', operations: ['inventory', 'identify', 'validate', 'analyze project', 'verify', 'report'], defaultLimits: { maxScanBytes: 1073741824 } }
});
export function listProfiles() { return { schema: 'recovery.profiles/v1', profiles: Object.values(PROFILES) }; }
