import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createCase, addSource, inventoryCase, identifyCase, carveFile, verifyCase, verifyAudit, doctor, extractArchives } from '../src/index.js';
import { loadPolicy, assertOutputSafe } from '../src/policy.js';
import { main, EXIT } from '../src/cli.js';

async function tempDir() { return fs.mkdtemp(path.join(os.tmpdir(), 'recovery-test-')); }

test('creates case with read-only policy, inventories, identifies, and verifies', async () => {
  const root = await tempDir(); const input = path.join(root, 'input'); await fs.mkdir(input); const pdf = path.join(input, 'document.bin'); await fs.writeFile(pdf, Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.from('test') ]));
  const c = await createCase(path.join(root, 'case')); await addSource(path.join(root, 'case'), input); const policy = await loadPolicy(path.join(root, 'case')); assert.equal(policy.readOnly, true); const inv = await inventoryCase(path.join(root, 'case')); assert.equal(inv.totals.files, 1); const f = inv.files.find(x => x.path === pdf); assert.equal(f.signature.kind, 'pdf'); assert.equal(f.extensionHint, 'bin'); const findings = await identifyCase(path.join(root, 'case')); assert.equal(findings.summary.recovered, 1); const verified = await verifyCase(path.join(root, 'case')); assert.equal(verified.ok, true); assert.ok(c.id);
});

test('rejects duplicate sources and unsafe output paths', async () => { const root = await tempDir(); const input = path.join(root, 'input.txt'); await fs.writeFile(input, 'data'); const caseDir = path.join(root, 'case'); await createCase(caseDir); await addSource(caseDir, input); await assert.rejects(() => addSource(caseDir, input), /already registered/); assert.throws(() => assertOutputSafe(caseDir, [input], input), /inside source/); });

test('carves embedded PDF signature', async () => { const root = await tempDir(); const file = path.join(root, 'opaque.dat'); await fs.writeFile(file, Buffer.concat([Buffer.from('prefix'), Buffer.from('%PDF-1.7'), Buffer.from('payload')])); const result = await carveFile(file, path.join(root, 'carved')); assert.equal(result.hits, 1); assert.equal(result.artifacts[0].offset, 6); });

test('doctor returns explicit capability report', async () => { const d = await doctor(); assert.equal(d.schema, 'recovery.doctor/v1'); assert.equal(d.version, '0.3.0'); assert.equal(d.capabilities.hashing, true); });

test('audit chain verifies after case and source events', async () => { const root = await tempDir(); const input = path.join(root, 'input.txt'); await fs.writeFile(input, 'audit'); const caseDir = path.join(root, 'case'); await createCase(caseDir); await addSource(caseDir, input); const result = await verifyAudit(caseDir); assert.equal(result.ok, true); assert.equal(result.records, 2); });

test('CLI returns stable usage status for an unknown command', async () => { await assert.rejects(() => main(['not-a-command']), error => error.exitCode === EXIT.USAGE); });

test('archive extraction refuses a destination inside a registered source', async () => { const root = await tempDir(); const source = path.join(root, 'source'); await fs.mkdir(source); const caseDir = path.join(root, 'case'); await createCase(caseDir); await addSource(caseDir, source); await assert.rejects(() => extractArchives(caseDir, source), /inside source/); });
