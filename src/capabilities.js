export const CAPABILITIES = Object.freeze([
  { id: 'inventory', status: 'audited', class: 'verified-metadata', description: 'Recursive inventory and SHA-256 hashing' },
  { id: 'archive-recovery', status: 'audited', class: 'recovered-or-partial', description: 'ZIP, TAR, and GZIP validation/extraction' },
  { id: 'ntfs-recovery', status: 'audited', class: 'evidence-or-reconstructed', description: 'Deleted MFT candidates, runlists, and journal streams' },
  { id: 'ext-analysis', status: 'audited', class: 'evidence', description: 'ext orphan/JBD2 metadata and transaction grouping' },
  { id: 'sqlite-recovery', status: 'audited', class: 'uncertain-evidence', description: 'SQLite header and structural page candidates' },
  { id: 'project-reconstruction', status: 'audited', class: 'reconstructed-evidence', description: 'Python, Rust, and Node project evidence' },
  { id: 'raw-imaging', status: 'audited', class: 'verified-image', description: 'Read-only streaming image acquisition' },
  { id: 'cloud-connectors', status: 'planned', class: 'unsupported', description: 'Provider-authorized cloud source connectors' },
  { id: 'enterprise-rbac', status: 'planned', class: 'unsupported', description: 'Service mode and identity integration' }
]);
export function listCapabilities() { return { schema: 'recovery.capabilities/v1', capabilities: CAPABILITIES }; }
