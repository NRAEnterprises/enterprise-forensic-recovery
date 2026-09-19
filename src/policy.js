import path from 'node:path';
import fs from 'node:fs/promises';

export const DEFAULT_POLICY = Object.freeze({
  schema: 'recovery.policy/v1',
  readOnly: true,
  allowDestructive: false,
  allowNetwork: false,
  allowCloud: false,
  allowPlugins: false,
  followSymlinks: false,
  overwrite: false,
  maxFileBytes: 8 * 1024 ** 4,
  maxOutputBytes: 8 * 1024 ** 4,
  maxArchiveExpandedBytes: 256 * 1024 ** 3,
  maxArchiveEntries: 1_000_000,
  maxArchiveDepth: 16,
  maxCarvedArtifacts: 100_000,
  redactSecrets: true
});

export function normalizePolicy(input = {}) {
  const policy = { ...DEFAULT_POLICY, ...input };
  if (policy.allowDestructive) policy.readOnly = false;
  if (!policy.readOnly && !policy.allowDestructive) throw new Error('Invalid policy: readOnly=false requires allowDestructive=true');
  for (const key of ['maxFileBytes', 'maxOutputBytes', 'maxArchiveExpandedBytes', 'maxArchiveEntries', 'maxArchiveDepth', 'maxCarvedArtifacts']) {
    if (!Number.isSafeInteger(policy[key]) || policy[key] <= 0) throw new Error(`Invalid policy limit: ${key}`);
  }
  return policy;
}

export async function loadPolicy(caseDir) {
  const file = path.join(path.resolve(caseDir), 'policy.json');
  try { return normalizePolicy(JSON.parse(await fs.readFile(file, 'utf8'))); }
  catch (error) { if (error.code === 'ENOENT') return normalizePolicy(); throw error; }
}

export async function savePolicy(caseDir, input) {
  const policy = normalizePolicy(input);
  await fs.writeFile(path.join(path.resolve(caseDir), 'policy.json'), JSON.stringify(policy, null, 2) + '\n', { mode: 0o600 });
  return policy;
}

export function assertReadOnly(policy, operation) {
  if (!policy.readOnly) return;
  if (operation === 'destructive') throw new Error('Policy denied destructive operation: case is read-only');
}

export function assertWithinCase(caseDir, candidate, label = 'path') {
  const root = path.resolve(caseDir);
  const target = path.resolve(candidate);
  const relative = path.relative(root, target);
  if (relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) throw new Error(`${label} must be outside the case source tree or explicitly managed: ${target}`);
  return target;
}

export function assertOutputSafe(caseDir, sources, outputDir, { overwrite = false } = {}) {
  const out = path.resolve(outputDir);
  if (sources.some(source => out === path.resolve(source) || out.startsWith(path.resolve(source) + path.sep))) throw new Error(`Unsafe output path inside source: ${out}`);
  if (!overwrite) return out;
  return out;
}
