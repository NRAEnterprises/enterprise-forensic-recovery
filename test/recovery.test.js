import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createCase, addSource, inventoryCase, identifyCase, carveFile, verifyCase, doctor } from '../src/index.js';

async function tempDir() { return fs.mkdtemp(path.join(os.tmpdir(), 'recovery-test-')); }

test('creates case, inventories source, detects signatures, and verifies hashes', async () => {
  const root = await tempDir(); const input = path.join(root, 'input'); await fs.mkdir(input); const pdf = path.join(input, 'document.bin'); await fs.writeFile(pdf, Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.from('test') ]));
  const c = await createCase(path.join(root, 'case')); await addSource(path.join(root, 'case'), input); const inv = await inventoryCase(path.join(root, 'case')); assert.equal(inv.totals.files, 1); const f = inv.files.find(x => x.path === pdf); assert.equal(f.signature.kind, 'pdf'); assert.equal(f.extensionHint, 'bin'); const findings = await identifyCase(path.join(root, 'case')); assert.equal(findings.summary.recovered, 1); const verified = await verifyCase(path.join(root, 'case')); assert.equal(verified.ok, true); assert.ok(c.id);
});

test('carves embedded PDF signature', async () => { const root = await tempDir(); const file = path.join(root, 'opaque.dat'); await fs.writeFile(file, Buffer.concat([Buffer.from('prefix'), Buffer.from('%PDF-1.7'), Buffer.from('payload')])); const result = await carveFile(file, path.join(root, 'carved')); assert.equal(result.hits, 1); assert.equal(result.artifacts[0].offset, 6); });

test('doctor returns explicit capability report', async () => { const d = await doctor(); assert.equal(d.schema, 'recovery.doctor/v1'); assert.equal(d.capabilities.hashing, true); });
